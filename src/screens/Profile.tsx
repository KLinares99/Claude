import { useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, Download, Upload, Shield, Camera, Check } from 'lucide-react';
import {
  useStore, weeklyMileage, bestEfforts, computeStreak, defaultData, type RunnerData
} from '../lib/storage';
import { fmtClock, fmtTime, paceFor } from '../lib/run';
import { ACCENTS, accentHex } from '../lib/theme';
import { getUsdaKey, setUsdaKey } from '../lib/foodSearch';
import { toast } from '../lib/toast';
import CoupleSync from './CoupleSync';
import Friends from './Friends';

export default function Profile() {
  const { data, update } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const accent = accentHex(data.settings.accent);
  const best = bestEfforts(data.activities);
  const streak = computeStreak(data.activities);
  const weeks = weeklyMileage(data.activities, 8);

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast('Photo is too large (max 8 MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      // downscale to a 256px square so localStorage isn't blown out by a full photo
      const img = new Image();
      img.onload = () => {
        const S = 256;
        const canvas = document.createElement('canvas');
        canvas.width = S; canvas.height = S;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, S, S);
        const url = canvas.toDataURL('image/jpeg', 0.85);
        update((d) => ({ ...d, settings: { ...d.settings, photo: url } }));
        toast('Photo updated');
      };
      img.onerror = () => toast("Couldn't load that image");
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Backup downloaded');
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<RunnerData>;
        if (!parsed || !Array.isArray(parsed.activities)) throw new Error('bad file');

        // Non-destructive merge: add runs from the file that aren't already
        // here (dedupe by id), so importing can never lose current data and
        // re-importing the same backup is a safe no-op.
        const fresh = data.activities.length === 0 && !data.nutrition.profile;
        let added = 0;
        update((d) => {
          const haveRun = new Set(d.activities.map((a) => a.id));
          for (const a of parsed.activities ?? []) {
            if (!haveRun.has(a.id)) {
              d.activities.push(a);
              haveRun.add(a.id);
              added++;
            }
          }
          d.activities.sort((a, b) => a.date.localeCompare(b.date));

          const haveFood = new Set(d.nutrition.entries.map((e) => e.id));
          for (const e of parsed.nutrition?.entries ?? []) {
            if (!haveFood.has(e.id)) {
              d.nutrition.entries.push(e);
              haveFood.add(e.id);
            }
          }
          const haveMeal = new Set((d.nutrition.meals ?? []).map((m) => m.id));
          for (const m of parsed.nutrition?.meals ?? []) {
            if (!haveMeal.has(m.id)) {
              d.nutrition.meals.push(m);
              haveMeal.add(m.id);
            }
          }
          const haveTpl = new Set(d.training.templates.map((t) => t.id));
          for (const t of parsed.training?.templates ?? []) {
            if (!haveTpl.has(t.id)) d.training.templates.push(t);
          }
          const haveLog = new Set(d.training.logs.map((l) => l.id));
          for (const l of parsed.training?.logs ?? []) {
            if (!haveLog.has(l.id)) d.training.logs.push(l);
          }
          d.training.logs.sort((a, b) => a.date.localeCompare(b.date));
          // On a fresh/wiped device, fully restore profile + settings from the
          // backup; on a device already in use, keep current settings.
          if (fresh) {
            if (parsed.nutrition?.profile) d.nutrition.profile = parsed.nutrition.profile;
            if (parsed.settings) d.settings = { ...d.settings, ...parsed.settings };
          } else {
            d.nutrition.profile ??= parsed.nutrition?.profile ?? null;
          }
          return d;
        });
        toast(added > 0 ? `Imported ${added} run${added === 1 ? '' : 's'}` : 'Already up to date — nothing new to import');
      } catch {
        toast('Could not read that file');
      } finally {
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4">
      {/* identity */}
      <div className="card-pad">
        <div className="flex items-center gap-4">
          <button
            onClick={() => photoRef.current?.click()}
            className="relative w-16 h-16 rounded-full shrink-0 overflow-hidden group"
            aria-label="Change your photo"
          >
            {data.settings.photo ? (
              <img src={data.settings.photo} alt="Your photo" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full rounded-full bg-brand text-white font-black text-2xl flex items-center justify-center">
                {data.settings.name.slice(0, 1).toUpperCase() || 'R'}
              </span>
            )}
            <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={18} className="text-white" />
            </span>
          </button>
          <div className="flex-1 min-w-0">
            <input
              className="text-xl font-black bg-transparent focus:outline-none w-full"
              value={data.settings.name}
              placeholder="Your name"
              onChange={(e) => update((d) => ({ ...d, settings: { ...d.settings, name: e.target.value } }))}
              aria-label="Your name"
            />
            <div className="text-xs text-dim">{streak > 0 ? `🔥 ${streak}-day streak` : 'Tap the photo to personalize'}</div>
          </div>
        </div>

        {/* accent color — recolors the whole app */}
        <div className="mt-4 pt-4 border-t border-line">
          <div className="label mb-2">App color</div>
          <div className="flex gap-2.5">
            {ACCENTS.map((a) => {
              const on = (data.settings.accent || 'orange') === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => update((d) => ({ ...d, settings: { ...d.settings, accent: a.id } }))}
                  aria-label={a.label}
                  title={a.label}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                    on ? 'ring-2 ring-offset-2 ring-ink' : ''
                  }`}
                  style={{ background: a.hex }}
                >
                  {on && <Check size={16} className="text-white" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
      </div>

      {/* all-time totals */}
      <div className="card-pad">
        <h2 className="font-black mb-3">All time</h2>
        <div className="grid grid-cols-3 gap-2">
          <Total label="Runs" value={`${best.count}`} />
          <Total label="Distance" value={best.totalMiles.toFixed(1)} unit="mi" />
          <Total label="Time" value={fmtClock(best.totalSeconds)} />
        </div>
      </div>

      {/* weekly mileage chart */}
      <div className="card-pad">
        <h2 className="font-black mb-1">Weekly mileage</h2>
        <p className="text-xs text-dim mb-3">Last 8 weeks</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeks} margin={{ left: -22, right: 4, top: 4 }}>
            <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(22,24,29,0.05)' }}
              contentStyle={{ background: '#fff', border: '1px solid #E7E5E0', borderRadius: 10, fontSize: 12 }}
              formatter={(v: number) => [`${v} mi`, 'Distance']}
            />
            <Bar dataKey="miles" fill={accent} radius={[5, 5, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* best efforts */}
      <div className="card-pad">
        <h2 className="font-black mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-brand" /> Best efforts
        </h2>
        <div className="divide-y divide-line">
          <Effort
            label="Longest run"
            value={best.longest ? `${best.longest.miles.toFixed(2)} mi` : '—'}
            sub={best.longest?.name}
          />
          <Effort
            label="Fastest mile"
            value={best.fastestMileSec !== null ? fmtTime(best.fastestMileSec) : '—'}
            sub={best.fastestMileSec !== null ? 'from GPS splits' : 'record a GPS run ≥ 1 mi'}
          />
          <Effort
            label="Best avg pace"
            value={best.fastestPace ? `${paceFor(best.fastestPace.seconds, best.fastestPace.miles)}/mi` : '—'}
            sub={best.fastestPace?.name}
          />
        </div>
      </div>

      <CoupleSync />

      <Friends />

      {/* settings */}
      <div className="card-pad space-y-3">
        <h2 className="font-black">Settings</h2>
        <SettingRow label="Weekly goal (miles)">
          <input
            className="input w-24 text-center"
            inputMode="numeric"
            value={data.settings.weeklyGoalMiles}
            onChange={(e) =>
              update((d) => ({ ...d, settings: { ...d.settings, weeklyGoalMiles: Math.max(0, parseInt(e.target.value || '0', 10)) } }))
            }
          />
        </SettingRow>
        <SettingRow label="Weight (lbs) — for calories">
          <input
            className="input w-24 text-center"
            inputMode="numeric"
            value={data.settings.weightLbs}
            onChange={(e) =>
              update((d) => ({ ...d, settings: { ...d.settings, weightLbs: Math.max(1, parseInt(e.target.value || '0', 10)) } }))
            }
          />
        </SettingRow>
      </div>

      {/* food database key */}
      <UsdaKeyCard />

      {/* data & backup */}
      <div className="card-pad space-y-3">
        <h2 className="font-black">Data & backup</h2>
        <div className="flex gap-3 items-start">
          <Shield size={18} className="text-good shrink-0 mt-0.5" />
          <p className="text-xs text-dim leading-relaxed">
            Everything is stored on <span className="text-ink font-semibold">this device</span> (browser local storage).
            Export a backup anytime; <span className="text-ink font-semibold">Import merges runs in</span> (it adds
            anything missing and never overwrites what's already here), so a saved file always brings your history back.
            {' '}Couple sync below also keeps your runs backed up across devices.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-primary" onClick={exportData}>
            <Download size={18} /> Export
          </button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={18} /> Import
          </button>
        </div>
        <button
          className="btn-danger w-full"
          onClick={() => {
            if (confirm('Erase ALL activities and settings on this device?')) {
              update(() => defaultData());
              toast('All data erased');
            }
          }}
        >
          Erase all data
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} />
      </div>
    </div>
  );
}

function Total({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="text-center">
      <div className="label">{label}</div>
      <div className="stat-num text-2xl mt-0.5">
        {value}
        {unit && <span className="text-dim text-xs font-bold"> {unit}</span>}
      </div>
    </div>
  );
}

function Effort({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {sub && <div className="text-[11px] text-dim">{sub}</div>}
      </div>
      <span className="stat-num text-lg">{value}</span>
    </div>
  );
}

/** Optional personal USDA FoodData Central key — lifts the shared DEMO_KEY
 *  rate limit so heavy food searching never falls back to OFF-only. */
function UsdaKeyCard() {
  const [key, setKey] = useState(() => {
    const k = getUsdaKey();
    return k === 'DEMO_KEY' ? '' : k;
  });

  const save = () => {
    setUsdaKey(key);
    toast(key.trim() ? 'Food database key saved' : 'Using the free shared key');
  };

  return (
    <div className="card-pad space-y-3">
      <h2 className="font-black">Food database key</h2>
      <p className="text-xs text-dim leading-relaxed">
        Food search already works out of the box on a shared key. If searches ever
        say they can't reach the database, it's the shared key hitting its hourly
        limit — grab your own free key from{' '}
        <a href="https://api.data.gov/signup/" target="_blank" rel="noreferrer" className="text-brand font-semibold underline">
          api.data.gov/signup
        </a>{' '}
        (takes a minute) and paste it here.
      </p>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Paste USDA key (optional)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button className="btn-primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink">{label}</span>
      {children}
    </div>
  );
}
