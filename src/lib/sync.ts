/**
 * Couple sync — Supabase-backed accounts, activity sync and the shared feed.
 *
 * A module-level singleton (like the GPS tracker): screens subscribe via
 * useSyncExternalStore. Local storage stays the source of truth for your own
 * data; the server adds (1) cross-device backup of your runs, (2) your
 * partner's runs in the feed, (3) kudos. Nutrition never leaves the device.
 *
 * Configuration: the Supabase project URL + anon key are either baked in
 * below (fill DEFAULTS after creating the project) or pasted once in the
 * You tab and kept in localStorage. The anon key is public by design —
 * row-level security in supabase/schema.sql is what protects the data.
 */
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { getData, mutateStore, onStoreChange, type Activity } from './storage';

// Fill these in to skip the paste-config step on every device:
// Runner's Supabase project. The anon key is public by design — row-level
// security in supabase/schema.sql is what protects each account's data.
const DEFAULTS: { url: string; anonKey: string } | null = {
  url: 'https://ntnfrcgftftcevrwwyvk.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50bmZyY2dmdGZ0Y2V2cnd3eXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMjY4NTIsImV4cCI6MjA5ODcwMjg1Mn0.nda1YKsp_oYzHOZmf_Lx7h5R-kbiJEFyLCZ2J-0_s2U'
};

const CONFIG_KEY = 'runner:supabase';

export interface PartnerActivity extends Activity {
  ownerId: string;
  ownerName: string;
}

export interface SyncState {
  configured: boolean;
  session: Session | null;
  myName: string;
  myCode: string;          // invite code to share
  partnerId: string | null;
  partnerName: string;
  partnerActivities: PartnerActivity[];
  /** kudos keyed `${activity_user_id}:${activity_id}` → giver user ids */
  kudos: Record<string, string[]>;
  status: 'idle' | 'syncing' | 'error';
  error: string;
}

let state: SyncState = {
  configured: false, session: null, myName: '', myCode: '',
  partnerId: null, partnerName: '', partnerActivities: [], kudos: {},
  status: 'idle', error: ''
};

let client: SupabaseClient | null = null;
let listeners: Array<() => void> = [];
let pushTimer: number | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function set(patch: Partial<SyncState>) {
  state = { ...state, ...patch };
  emit();
}

export function syncSubscribe(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function syncGet(): SyncState {
  return state;
}

// ---- config -----------------------------------------------------------------

function loadConfig(): { url: string; anonKey: string } | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULTS;
}

export function configureSync(url: string, anonKey: string) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
  } catch { /* ignore */ }
  initClient();
}

export function clearSyncConfig() {
  try { localStorage.removeItem(CONFIG_KEY); } catch { /* ignore */ }
  client = null;
  set({ ...state, configured: false, session: null, partnerActivities: [], kudos: {} });
}

function initClient() {
  const cfg = loadConfig();
  if (!cfg?.url || !cfg?.anonKey) {
    set({ configured: false });
    return;
  }
  try {
    client = createClient(cfg.url, cfg.anonKey);
  } catch {
    set({ configured: false, error: 'Invalid Supabase URL' });
    return;
  }
  set({ configured: true, error: '' });
  client.auth.onAuthStateChange((_evt, session) => {
    set({ session });
    if (session) void syncNow();
    else set({ partnerActivities: [], kudos: {}, myCode: '', partnerId: null, partnerName: '' });
  });
  void client.auth.getSession().then(({ data }) => {
    set({ session: data.session });
    if (data.session) void syncNow();
  });
}

// ---- auth --------------------------------------------------------------------

export async function signUp(email: string, password: string, name: string): Promise<string> {
  if (!client) return 'Sync is not configured yet.';
  const { error } = await client.auth.signUp({
    email, password,
    options: { data: { name: name.trim() || 'Runner' } }
  });
  if (error) return error.message;
  return '';
}

export async function signIn(email: string, password: string): Promise<string> {
  if (!client) return 'Sync is not configured yet.';
  const { error } = await client.auth.signInWithPassword({ email, password });
  return error ? error.message : '';
}

export async function signOut() {
  await client?.auth.signOut();
}

export async function linkPartner(code: string): Promise<string> {
  if (!client) return 'Sync is not configured yet.';
  const { data, error } = await client.rpc('link_partner', { p_code: code });
  if (error) return error.message;
  if (typeof data === 'string' && data.startsWith('error:')) return data.slice(6).trim();
  await syncNow();
  return '';
}

// ---- sync --------------------------------------------------------------------

interface ActivityRow {
  user_id: string;
  id: string;
  date: string;
  name: string;
  seconds: number;
  miles: number;
  route: [number, number][];
  splits: { miles: number; seconds: number }[];
  source: string;
  note: string;
}

function toRow(a: Activity, userId: string): ActivityRow {
  return {
    user_id: userId, id: a.id, date: a.date, name: a.name, seconds: a.seconds,
    miles: a.miles, route: a.route, splits: a.splits, source: a.source, note: a.note
  };
}

function fromRow(r: ActivityRow): Activity {
  return {
    id: r.id, date: r.date, name: r.name, seconds: r.seconds, miles: r.miles,
    route: r.route ?? [], splits: r.splits ?? [],
    source: r.source === 'gps' ? 'gps' : 'manual', note: r.note ?? ''
  };
}

/**
 * Full sync: pull my remote runs (merges history onto a new device), push all
 * local runs, then pull profile, partner runs and kudos. Volumes are tiny
 * (two people's run logs), so full upserts keep the logic simple and safe.
 */
export async function syncNow(): Promise<void> {
  const c = client;
  const uid = state.session?.user.id;
  if (!c || !uid) return;
  set({ status: 'syncing', error: '' });
  try {
    // 1. pull mine and merge new ones into local storage
    const mine = await c.from('activities').select('*').eq('user_id', uid);
    if (mine.error) throw mine.error;
    const local = getData().activities;
    const localIds = new Set(local.map((a) => a.id));
    const newFromRemote = (mine.data as ActivityRow[]).filter((r) => !localIds.has(r.id)).map(fromRow);
    if (newFromRemote.length > 0) {
      mutateStore((d) => {
        d.activities.push(...newFromRemote);
        d.activities.sort((a, b) => a.date.localeCompare(b.date));
        return d;
      });
    }

    // 2. push everything local (upsert = no-op when unchanged content-wise)
    const rows = getData().activities.map((a) => toRow(a, uid));
    if (rows.length > 0) {
      const up = await c.from('activities').upsert(rows, { onConflict: 'user_id,id' });
      if (up.error) throw up.error;
    }

    // 3. profile + partner
    const prof = await c.from('profiles').select('*');
    if (prof.error) throw prof.error;
    const me = prof.data.find((p: { id: string }) => p.id === uid);
    const partner = prof.data.find((p: { id: string }) => p.id !== uid);
    set({
      myName: me?.name ?? '',
      myCode: me?.code ?? '',
      partnerId: me?.partner_id ?? null,
      partnerName: partner?.name ?? ''
    });

    // 4. partner activities
    if (me?.partner_id) {
      const theirs = await c.from('activities').select('*').eq('user_id', me.partner_id)
        .order('date', { ascending: false }).limit(100);
      if (theirs.error) throw theirs.error;
      set({
        partnerActivities: (theirs.data as ActivityRow[]).map((r) => ({
          ...fromRow(r), ownerId: r.user_id, ownerName: partner?.name ?? 'Partner'
        }))
      });
    } else {
      set({ partnerActivities: [] });
    }

    // 5. kudos
    const k = await c.from('kudos').select('*');
    if (k.error) throw k.error;
    const kudos: Record<string, string[]> = {};
    for (const row of k.data as { user_id: string; activity_user_id: string; activity_id: string }[]) {
      const key = `${row.activity_user_id}:${row.activity_id}`;
      (kudos[key] ??= []).push(row.user_id);
    }
    set({ kudos, status: 'idle' });
  } catch (err) {
    set({ status: 'error', error: err instanceof Error ? err.message : 'Sync failed' });
  }
}

/** Give / take back a heart on an activity. */
export async function toggleKudos(activityUserId: string, activityId: string) {
  const c = client;
  const uid = state.session?.user.id;
  if (!c || !uid) return;
  const key = `${activityUserId}:${activityId}`;
  const mine = (state.kudos[key] ?? []).includes(uid);
  // optimistic update
  set({
    kudos: {
      ...state.kudos,
      [key]: mine ? (state.kudos[key] ?? []).filter((u) => u !== uid) : [...(state.kudos[key] ?? []), uid]
    }
  });
  if (mine) {
    await c.from('kudos').delete().match({ user_id: uid, activity_user_id: activityUserId, activity_id: activityId });
  } else {
    await c.from('kudos').insert({ user_id: uid, activity_user_id: activityUserId, activity_id: activityId });
  }
}

/** Remove one of my runs remotely (called when it's deleted locally). */
export async function deleteRemoteActivity(activityId: string) {
  const uid = state.session?.user.id;
  if (!client || !uid) return;
  await client.from('activities').delete().match({ user_id: uid, id: activityId });
}

// ---- wiring -------------------------------------------------------------------

// push shortly after any local change (a saved run, a rename, …)
onStoreChange(() => {
  if (!client || !state.session) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => void syncNow(), 2500);
});

initClient();
