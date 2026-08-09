import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  Dumbbell, Plus, Play, X, Trash2, ChevronDown, ChevronRight, Timer,
  Check, Search, History, LayoutGrid, ListChecks, Square
} from 'lucide-react';
import { useStore } from '../lib/storage';
import {
  MUSCLE_GROUPS, EXERCISES, SPLITS, exerciseById, exercisesFor, findSubgroup,
  type Exercise, type SplitDay
} from '../data/exercises';
import {
  liftSubscribe, liftGet, liftStart, liftAddPlanned, liftLogSet, liftRemoveSet, liftFinish, liftDiscard,
  saveTemplate, deleteTemplate, deleteLog, addManualLog, logVolume, totalSets, INTENSITIES, intensityOf,
  type TemplateExercise, type WorkoutLog, type Intensity, type LoggedExercise
} from '../lib/training';
import { deleteRemoteWorkout } from '../lib/sync';
import { fmtClock, fmtRelDate } from '../lib/run';
import { toast } from '../lib/toast';
import Mascot from '../components/Mascot';

/**
 * Train tab — the weightlifting hub. Browse muscles → exercises with
 * suggested sets/reps/tempo, build workouts, start split presets, and log
 * live sessions with a time-under-tension timer. The in-progress session
 * lives in the global lift store, so it survives tab switches and reloads.
 */
export default function Train() {
  const session = useSyncExternalStore(liftSubscribe, liftGet);
  const { data } = useStore();
  const [building, setBuilding] = useState<{ id?: string; name: string; exercises: TemplateExercise[] } | null>(null);
  const [loggingPast, setLoggingPast] = useState(false);
  const [detail, setDetail] = useState<Exercise | null>(null);

  if (session.active) {
    return (
      <>
        <LiveWorkout onShowDetail={setDetail} />
        {detail && <ExerciseSheet ex={detail} onClose={() => setDetail(null)} />}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* my workouts */}
      <div className="card-pad">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base flex items-center gap-2">
            <ListChecks size={16} className="text-brand" /> My workouts
          </h2>
          <button className="chip bg-card border border-line text-ink" onClick={() => setBuilding({ name: '', exercises: [] })}>
            <Plus size={14} /> Build
          </button>
        </div>
        {data.training.templates.length === 0 ? (
          <p className="text-sm text-dim">
            Build a workout from the exercise library below, or start from a split preset —
            it saves here for one-tap starts.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {data.training.templates.map((t) => (
              <div key={t.id} className="py-2.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{t.name}</div>
                  <div className="text-[11px] text-dim truncate">
                    {t.exercises.length} exercises · {t.exercises.map((e) => e.name).slice(0, 3).join(', ')}
                    {t.exercises.length > 3 ? '…' : ''}
                  </div>
                </div>
                <button
                  className="text-dim hover:text-ink p-1"
                  aria-label={`Edit ${t.name}`}
                  onClick={() => setBuilding({ id: t.id, name: t.name, exercises: [...t.exercises] })}
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  className="btn-primary !px-3 !py-1.5 text-xs"
                  onClick={() => { liftStart(t.name, t.exercises); toast(`${t.name} started — go lift!`); }}
                >
                  <Play size={13} fill="currentColor" /> Start
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* splits */}
      <div className="card-pad">
        <h2 className="font-black text-base flex items-center gap-2 mb-1">
          <LayoutGrid size={16} className="text-brand" /> Splits
        </h2>
        <p className="text-xs text-dim mb-3">Proven weekly structures — tap a day to load it as a workout.</p>
        <div className="space-y-2">
          {SPLITS.map((s) => (
            <SplitCard
              key={s.id}
              name={s.name}
              desc={s.desc}
              days={s.days}
              onPickDay={(day) => {
                const exercises = day.exercises
                  .map((id) => exerciseById(id))
                  .filter((e): e is Exercise => !!e)
                  .map((e) => ({ exId: e.id, name: e.name, sets: parseInt(e.sets, 10) || 3, reps: e.reps }));
                setBuilding({ name: day.name, exercises });
              }}
            />
          ))}
        </div>
      </div>

      {/* muscle library */}
      <div className="card-pad">
        <h2 className="font-black text-base flex items-center gap-2 mb-1">
          <Dumbbell size={16} className="text-brand" /> Muscle library
        </h2>
        <p className="text-xs text-dim mb-3">
          Every group, its subgroups, and the moves that hit them — with suggested sets, reps and tempo.
        </p>
        <div className="space-y-2">
          {MUSCLE_GROUPS.map((g) => (
            <MuscleGroupRow key={g.id} groupId={g.id} onShow={setDetail} />
          ))}
        </div>
      </div>

      {/* history */}
      <WorkoutHistory logs={data.training.logs} onLogPast={() => setLoggingPast(true)} />

      {loggingPast && (
        <ManualWorkoutSheet
          onClose={() => setLoggingPast(false)}
          onShowDetail={setDetail}
        />
      )}

      {building && (
        <BuilderSheet
          initial={building}
          onClose={() => setBuilding(null)}
          onShowDetail={setDetail}
        />
      )}
      {detail && <ExerciseSheet ex={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ---- splits ------------------------------------------------------------------

function SplitCard({
  name, desc, days, onPickDay
}: { name: string; desc: string; days: SplitDay[]; onPickDay: (d: SplitDay) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-2 p-3 text-left" onClick={() => setOpen(!open)}>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">{name}</div>
          <div className="text-[11px] text-dim">{desc}</div>
        </div>
        <ChevronDown size={16} className={`text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 flex flex-wrap gap-2">
          {days.map((d) => (
            <button key={d.name} className="chip bg-paper text-ink border border-line hover:border-brand" onClick={() => onPickDay(d)}>
              <Play size={12} className="text-brand" /> {d.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- muscle library ----------------------------------------------------------

function MuscleGroupRow({ groupId, onShow }: { groupId: string; onShow: (e: Exercise) => void }) {
  const g = MUSCLE_GROUPS.find((x) => x.id === groupId)!;
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  return (
    <div className="border border-line rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-2.5 p-3 text-left" onClick={() => setOpen(!open)}>
        <span className="text-xl">{g.emoji}</span>
        <span className="flex-1 text-sm font-bold">{g.name}</span>
        <span className="text-[11px] text-faint">{g.subgroups.length} areas</span>
        <ChevronDown size={16} className={`text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {g.subgroups.map((s) => {
            const on = sub === s.id;
            const moves = on ? exercisesFor(s.id) : [];
            return (
              <div key={s.id} className="bg-paper rounded-xl overflow-hidden">
                <button className="w-full p-2.5 text-left" onClick={() => setSub(on ? null : s.id)}>
                  <div className="text-[13px] font-bold flex items-center justify-between">
                    {s.name}
                    <ChevronDown size={14} className={`text-faint transition-transform ${on ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="text-[11px] text-dim mt-0.5">{s.note}</div>
                </button>
                {on && (
                  <div className="px-2.5 pb-2.5 divide-y divide-line">
                    {moves.map((e) => (
                      <button key={e.id} className="w-full py-2 text-left flex items-center gap-2" onClick={() => onShow(e)}>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold truncate">
                            {e.name}
                            {!e.primary.includes(s.id) && <span className="text-faint font-normal"> · assist</span>}
                          </div>
                          <div className="text-[11px] text-dim nums">
                            {e.sets} × {e.reps} · {e.equipment}
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-faint shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- exercise detail sheet ---------------------------------------------------

function ExerciseSheet({ ex, onClose }: { ex: Exercise; onClose: () => void }) {
  const [tempoOpen, setTempoOpen] = useState(false);
  const [ecc, pause, con, squeeze] = ex.tempo;
  const tut = ecc + pause + con + squeeze;
  const names = (ids: string[]) => ids.map((id) => findSubgroup(id)?.sub.name ?? id).join(', ');

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] p-5 space-y-4 shadow-sheet max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto sm:hidden" />
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-black leading-tight">{ex.name}</h2>
            <p className="text-[11px] text-dim capitalize">{ex.equipment}</p>
          </div>
          <button onClick={onClose} className="p-1 -mr-1 text-dim hover:text-ink" aria-label="Close exercise">
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <SheetStat label="Sets" value={ex.sets} />
          <SheetStat label="Reps" value={ex.reps} />
          <SheetStat label="Rest" value={`${Math.round(ex.rest / 60 * 10) / 10} min`} />
        </div>

        <div className="bg-paper rounded-xl p-3">
          <div className="label mb-1.5">Tempo — time under tension</div>
          <div className="flex items-center gap-1.5 text-sm font-bold nums">
            <TempoChip label="Down" v={ecc} />
            <TempoChip label="Hold" v={pause} />
            <TempoChip label="Up" v={con} />
            <TempoChip label="Squeeze" v={squeeze} />
          </div>
          <p className="text-[11px] text-dim mt-1.5">
            {tut > 0 ? `${tut}s per rep — slow negatives build the most muscle.` : 'Timed hold — go by the clock, not reps.'}
          </p>
          {tut > 0 && (
            <button className="btn-ghost w-full mt-2 !py-2 text-sm" onClick={() => setTempoOpen(true)}>
              <Timer size={15} /> Run the tempo timer
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="text-xs"><span className="font-bold">Targets:</span> <span className="text-dim">{names(ex.primary)}</span></div>
          {ex.secondary.length > 0 && (
            <div className="text-xs"><span className="font-bold">Also works:</span> <span className="text-dim">{names(ex.secondary)}</span></div>
          )}
          <div className="text-xs"><span className="font-bold">Cue:</span> <span className="text-dim">{ex.cue}</span></div>
        </div>

        {tempoOpen && <TempoTimer ex={ex} onClose={() => setTempoOpen(false)} />}
      </div>
    </div>
  );
}

function SheetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper rounded-xl py-2">
      <div className="label">{label}</div>
      <div className="stat-num text-lg mt-0.5">{value}</div>
    </div>
  );
}

function TempoChip({ label, v }: { label: string; v: number }) {
  return (
    <span className={`flex-1 rounded-lg py-1.5 text-center ${v > 0 ? 'bg-brand-soft text-brand' : 'bg-card text-faint'}`}>
      <span className="block text-base">{v}s</span>
      <span className="block text-[9px] font-bold uppercase tracking-wide">{label}</span>
    </span>
  );
}

// ---- tempo timer -------------------------------------------------------------

const PHASES = ['Down', 'Hold', 'Up', 'Squeeze'] as const;

/** Full-screen rep pacer: cycles the exercise's lower/hold/lift/squeeze
 *  seconds with a big phase display, counting reps as cycles complete. */
function TempoTimer({ ex, onClose }: { ex: Exercise; onClose: () => void }) {
  const [running, setRunning] = useState(true);
  const [phaseIdx, setPhaseIdx] = useState(() => ex.tempo.findIndex((t) => t > 0));
  const [left, setLeft] = useState(() => ex.tempo[Math.max(0, ex.tempo.findIndex((t) => t > 0))]);
  const [reps, setReps] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l > 1) return l - 1;
        // advance to the next non-zero phase (wrapping = one full rep)
        setPhaseIdx((pi) => {
          let next = pi;
          for (let step = 0; step < 4; step++) {
            next = (next + 1) % 4;
            if (ex.tempo[next] > 0) break;
          }
          if (next <= pi) setReps((r) => r + 1);
          try { navigator.vibrate?.(next <= pi ? [60, 60, 60] : 40); } catch { /* ignore */ }
          setLeft(ex.tempo[next]);
          return next;
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, ex.tempo]);

  return (
    <div className="fixed inset-0 z-[70] bg-ink/95 flex flex-col items-center justify-center gap-6 text-white" onClick={(e) => e.stopPropagation()}>
      <p className="text-sm font-bold text-white/60">{ex.name}</p>
      <div className="text-center">
        <div className="text-6xl font-black">{PHASES[phaseIdx] ?? 'Go'}</div>
        <div className="stat-num !text-white text-8xl mt-2">{left}</div>
      </div>
      <div className="flex items-center gap-2 text-white/70 text-sm font-bold nums">
        {ex.tempo.map((t, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-full ${i === phaseIdx ? 'bg-brand text-white' : 'bg-white/10'}`}>
            {PHASES[i]} {t}s
          </span>
        ))}
      </div>
      <p className="text-sm text-white/60 nums">Reps completed: <span className="font-black text-white">{reps}</span></p>
      <div className="flex gap-3">
        <button className="btn-ghost !bg-white/10 !text-white !border-white/20" onClick={() => setRunning(!running)}>
          {running ? 'Pause' : 'Resume'}
        </button>
        <button className="btn-primary" onClick={onClose}>
          <Square size={15} fill="currentColor" /> Done
        </button>
      </div>
    </div>
  );
}

// ---- workout builder ---------------------------------------------------------

function BuilderSheet({
  initial, onClose, onShowDetail
}: {
  initial: { id?: string; name: string; exercises: TemplateExercise[] };
  onClose: () => void;
  onShowDetail: (e: Exercise) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [list, setList] = useState<TemplateExercise[]>(initial.exercises);
  const [picking, setPicking] = useState(false);

  const add = (e: Exercise) => {
    if (list.some((x) => x.exId === e.id)) { toast('Already in this workout'); return; }
    setList([...list, { exId: e.id, name: e.name, sets: parseInt(e.sets, 10) || 3, reps: e.reps }]);
  };

  const start = () => {
    const nm = name.trim() || 'Workout';
    if (list.length > 0) saveTemplate({ id: initial.id, name: nm, exercises: list });
    liftStart(nm, list);
    onClose();
    toast(`${nm} started — go lift!`);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] p-5 space-y-3 shadow-sheet max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto sm:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Build workout</h2>
          <button onClick={onClose} className="p-1 -mr-1 text-dim hover:text-ink" aria-label="Close builder">
            <X size={22} />
          </button>
        </div>
        <input
          className="input w-full font-semibold"
          placeholder="Workout name — e.g. Push day"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {list.length === 0 ? (
          <p className="text-sm text-dim py-2">No exercises yet — add some below.</p>
        ) : (
          <div className="divide-y divide-line">
            {list.map((t, i) => (
              <div key={t.exId} className="py-2 flex items-center gap-2">
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { const e = exerciseById(t.exId); if (e) onShowDetail(e); }}
                >
                  <div className="text-sm font-semibold truncate">{t.name}</div>
                </button>
                <input
                  className="input w-12 !px-1 text-center text-sm"
                  inputMode="numeric"
                  aria-label={`Sets for ${t.name}`}
                  value={t.sets}
                  onChange={(e) => {
                    const v = Math.max(1, parseInt(e.target.value || '1', 10));
                    setList(list.map((x, j) => (j === i ? { ...x, sets: v } : x)));
                  }}
                />
                <span className="text-xs text-dim nums w-14 text-center">× {t.reps}</span>
                <button
                  className="text-faint hover:text-bad p-1"
                  aria-label={`Remove ${t.name}`}
                  onClick={() => setList(list.filter((_, j) => j !== i))}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {picking ? (
          <ExercisePicker onPick={add} onDone={() => setPicking(false)} />
        ) : (
          <button className="btn-ghost w-full" onClick={() => setPicking(true)}>
            <Plus size={16} /> Add exercise
          </button>
        )}

        <div className="flex gap-2 pt-1">
          <button
            className="btn-ghost flex-1"
            disabled={list.length === 0}
            onClick={() => {
              saveTemplate({ id: initial.id, name: name.trim() || 'Workout', exercises: list });
              onClose();
              toast('Workout saved to My workouts');
            }}
          >
            Save for later
          </button>
          <button className="btn-primary flex-1" disabled={list.length === 0} onClick={start}>
            <Play size={16} fill="currentColor" /> Start now
          </button>
        </div>
        {initial.id && (
          <button
            className="btn-danger w-full"
            onClick={() => {
              if (confirm(`Delete "${name.trim() || 'Workout'}" from My workouts?`)) {
                deleteTemplate(initial.id as string);
                onClose();
                toast('Workout deleted');
              }
            }}
          >
            <Trash2 size={16} /> Delete workout
          </button>
        )}
      </div>
    </div>
  );
}

/** Search + browse-all picker used by the builder and the live session. */
function ExercisePicker({ onPick, onDone }: { onPick: (e: Exercise) => void; onDone: () => void }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return EXERCISES;
    return EXERCISES.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        [...e.primary, ...e.secondary].some((id) => {
          const f = findSubgroup(id);
          return f && (f.sub.name.toLowerCase().includes(term) || f.group.name.toLowerCase().includes(term));
        })
    );
  }, [q]);

  return (
    <div className="border border-line rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Search size={14} className="text-faint shrink-0" />
        <input
          className="input flex-1 !py-1.5"
          placeholder="Search — bench, lats, biceps…"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="text-xs font-bold text-brand shrink-0" onClick={onDone}>Done</button>
      </div>
      <div className="max-h-56 overflow-y-auto divide-y divide-line">
        {results.map((e) => (
          <button key={e.id} className="w-full py-2 text-left flex items-center gap-2" onClick={() => onPick(e)}>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{e.name}</div>
              <div className="text-[11px] text-dim truncate">
                {e.primary.map((id) => findSubgroup(id)?.sub.name).filter(Boolean).join(', ')}
              </div>
            </div>
            <Plus size={15} className="text-brand shrink-0" />
          </button>
        ))}
        {results.length === 0 && <p className="text-xs text-dim py-2">No matches.</p>}
      </div>
    </div>
  );
}

// ---- live workout ------------------------------------------------------------

function LiveWorkout({ onShowDetail }: { onShowDetail: (e: Exercise) => void }) {
  const s = useSyncExternalStore(liftSubscribe, liftGet);
  const [adding, setAdding] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [rest, setRest] = useState<{ total: number; left: number } | null>(null);
  const restTimer = useRef<number | null>(null);

  const startRest = (seconds: number) => {
    if (restTimer.current) clearInterval(restTimer.current);
    setRest({ total: seconds, left: seconds });
    restTimer.current = window.setInterval(() => {
      setRest((r) => {
        if (!r) return null;
        if (r.left <= 1) {
          if (restTimer.current) clearInterval(restTimer.current);
          try { navigator.vibrate?.([120, 80, 120]); } catch { /* ignore */ }
          return null;
        }
        return { ...r, left: r.left - 1 };
      });
    }, 1000);
  };
  useEffect(() => () => { if (restTimer.current) clearInterval(restTimer.current); }, []);

  // planned exercises + any extras logged on the fly
  const slots = useMemo(() => {
    const planned = s.planned.map((p) => ({ exId: p.exId, name: p.name, target: `${p.sets} × ${p.reps}` }));
    for (const e of s.entries) {
      if (!planned.some((p) => p.exId === e.exId)) planned.push({ exId: e.exId, name: e.name, target: '' });
    }
    return planned;
  }, [s.planned, s.entries]);

  const volume = s.entries.reduce((v, e) => v + e.sets.reduce((x, st) => x + st.reps * st.weight, 0), 0);
  const setsDone = s.entries.reduce((n, e) => n + e.sets.length, 0);

  return (
    <div className="space-y-4">
      {/* session header */}
      <div className="card-pad">
        <div className="flex items-center justify-between">
          <div>
            <div className="label">Live workout</div>
            <h2 className="text-xl font-black leading-tight">{s.name}</h2>
          </div>
          <div className="text-right">
            <div className="stat-num text-3xl">{fmtClock(s.elapsed)}</div>
            <div className="text-[11px] text-dim nums">{setsDone} sets · {Math.round(volume).toLocaleString()} lbs</div>
          </div>
        </div>
        {rest && (
          <div className="mt-3 bg-brand-soft rounded-xl p-3 flex items-center gap-3">
            <Timer size={18} className="text-brand shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-bold text-brand nums">Rest — {fmtClock(rest.left)}</div>
              <div className="h-1.5 rounded-full bg-white/60 overflow-hidden mt-1">
                <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${(rest.left / rest.total) * 100}%` }} />
              </div>
            </div>
            <button className="text-xs font-bold text-brand" onClick={() => setRest(null)}>Skip</button>
          </div>
        )}
      </div>

      {/* exercises */}
      {slots.map((slot) => (
        <ExerciseLogCard
          key={slot.exId}
          exId={slot.exId}
          name={slot.name}
          target={slot.target}
          logged={s.entries.find((e) => e.exId === slot.exId)?.sets ?? []}
          onLog={(reps, weight) => {
            liftLogSet(slot.exId, slot.name, { reps, weight });
            const ex = exerciseById(slot.exId);
            startRest(ex?.rest ?? 90);
          }}
          onRemoveSet={(i) => liftRemoveSet(slot.exId, i)}
          onShowDetail={() => { const e = exerciseById(slot.exId); if (e) onShowDetail(e); }}
        />
      ))}

      {adding ? (
        <div className="card-pad">
          <ExercisePicker
            onPick={(e) => {
              liftAddPlanned({ exId: e.id, name: e.name, sets: parseInt(e.sets, 10) || 3, reps: e.reps });
              setAdding(false);
            }}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <button className="btn-ghost w-full" onClick={() => setAdding(true)}>
          <Plus size={16} /> Add exercise
        </button>
      )}

      <div className="flex gap-2">
        <button
          className="btn-danger flex-1"
          onClick={() => { if (confirm('Discard this workout? Logged sets will be lost.')) { liftDiscard(); } }}
        >
          Discard
        </button>
        <button className="btn-primary flex-1 py-3" onClick={() => setFinishing(true)}>
          <Check size={17} /> Finish workout
        </button>
      </div>

      {finishing && (
        <FinishSheet
          setsDone={setsDone}
          volume={volume}
          elapsed={s.elapsed}
          onCancel={() => setFinishing(false)}
          onConfirm={(intensity) => {
            const saved = liftFinish(intensity);
            setFinishing(false);
            toast(saved ? `${saved.name} saved — ${totalSets(saved)} sets, ${logVolume(saved).toLocaleString()} lbs` : 'Nothing logged — workout discarded');
          }}
        />
      )}
    </div>
  );
}

function ExerciseLogCard({
  exId, name, target, logged, onLog, onRemoveSet, onShowDetail
}: {
  exId: string;
  name: string;
  target: string;
  logged: { reps: number; weight: number }[];
  onLog: (reps: number, weight: number) => void;
  onRemoveSet: (i: number) => void;
  onShowDetail: () => void;
}) {
  const ex = exerciseById(exId);
  const last = logged[logged.length - 1];
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [tempoOpen, setTempoOpen] = useState(false);

  const log = () => {
    const r = parseInt(reps || `${last?.reps ?? 0}`, 10);
    const w = parseFloat(weight || `${last?.weight ?? 0}`);
    if (!r || r <= 0) { toast('Enter reps first'); return; }
    onLog(r, isFinite(w) && w >= 0 ? w : 0);
    setReps('');
    setWeight('');
  };

  return (
    <div className="card-pad">
      <div className="flex items-center gap-2">
        <button className="flex-1 min-w-0 text-left" onClick={onShowDetail}>
          <div className="text-sm font-black truncate">{name}</div>
          {target && <div className="text-[11px] text-dim nums">Target {target}{ex ? ` · rest ${Math.round(ex.rest / 60 * 10) / 10} min` : ''}</div>}
        </button>
        {ex && ex.tempo.some((t) => t > 0) && (
          <button className="chip bg-paper text-ink border border-line shrink-0" onClick={() => setTempoOpen(true)}>
            <Timer size={12} className="text-brand" /> Tempo
          </button>
        )}
      </div>

      {logged.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {logged.map((st, i) => (
            <span key={i} className="chip bg-brand-soft text-brand nums">
              {st.reps} × {st.weight > 0 ? `${st.weight} lb` : 'BW'}
              <button className="p-2 -m-1.5" aria-label={`Remove set ${i + 1} of ${name}`} onClick={() => onRemoveSet(i)}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2.5">
        {/* min-w-0 lets the inputs shrink below their browser default width,
            so the Set button never overflows the card on narrow phones */}
        <input
          className="input flex-1 min-w-0 text-center"
          inputMode="numeric"
          placeholder={last ? `${last.reps} reps` : 'Reps'}
          aria-label={`Reps for ${name}`}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <input
          className="input flex-1 min-w-0 text-center"
          inputMode="decimal"
          placeholder={last ? `${last.weight} lb` : 'Weight (lb)'}
          aria-label={`Weight for ${name}`}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <button className="btn-primary !px-3 shrink-0" onClick={log} aria-label={`Log set for ${name}`}>
          <Plus size={16} /> Set
        </button>
      </div>

      {tempoOpen && ex && <TempoTimer ex={ex} onClose={() => setTempoOpen(false)} />}
    </div>
  );
}

function FinishSheet({
  setsDone, volume, elapsed, onCancel, onConfirm
}: { setsDone: number; volume: number; elapsed: number; onCancel: () => void; onConfirm: (intensity?: Intensity) => void }) {
  const [intensity, setIntensity] = useState<Intensity | null>('moderate');
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onCancel}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] p-5 space-y-4 shadow-sheet"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto sm:hidden" />
        <div className="flex items-center gap-3">
          <Mascot pose="coach" size={56} fallback={<span className="text-3xl">🦜</span>} />
          <div>
            <h2 className="text-lg font-black leading-tight">Strong work!</h2>
            <p className="text-xs text-dim">Ptak says the pump is real.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SheetStat label="Sets" value={`${setsDone}`} />
          <SheetStat label="Volume" value={`${Math.round(volume).toLocaleString()} lb`} />
          <SheetStat label="Time" value={fmtClock(elapsed)} />
        </div>

        {/* how hard was it? */}
        <div>
          <div className="label mb-1.5">Intensity — how hard did it feel?</div>
          <div className="grid grid-cols-4 gap-1.5">
            {INTENSITIES.map((i) => {
              const on = intensity === i.id;
              return (
                <button
                  key={i.id}
                  onClick={() => setIntensity(on ? null : i.id)}
                  className={`rounded-xl py-2 text-center border transition-colors ${
                    on ? 'border-brand bg-brand-soft text-brand' : 'border-line text-dim hover:text-ink'
                  }`}
                >
                  <span className="block text-xs font-black">{i.label}</span>
                  <span className="block text-[9px] font-bold opacity-70">{i.rpe}</span>
                </button>
              );
            })}
          </div>
          {intensity && (
            <p className="text-[11px] text-dim mt-1.5">{INTENSITIES.find((i) => i.id === intensity)?.desc}</p>
          )}
        </div>

        <button className="btn-primary w-full py-3" onClick={() => onConfirm(intensity ?? undefined)}>Save workout</button>
        <button className="btn-ghost w-full" onClick={onCancel}>Keep lifting</button>
      </div>
    </div>
  );
}

// ---- history -----------------------------------------------------------------

function WorkoutHistory({ logs, onLogPast }: { logs: WorkoutLog[]; onLogPast: () => void }) {
  const recent = useMemo(() => [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20), [logs]);
  return (
    <div className="card-pad">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-black text-base flex items-center gap-2">
          <History size={16} className="text-brand" /> History
        </h2>
        <button className="chip bg-card border border-line text-ink" onClick={onLogPast}>
          <Plus size={14} /> Log past
        </button>
      </div>
      {recent.length === 0 && (
        <p className="text-sm text-dim">
          Nothing logged yet. Finish a live session, or log a workout you did without the app.
        </p>
      )}
      <div className="divide-y divide-line">
        {recent.map((l) => (
          <div key={l.id} className="py-2.5 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate flex items-center gap-1.5">
                <span className="truncate">{l.name}</span>
                {intensityOf(l.intensity) && (
                  <span className="shrink-0 text-[9px] font-black uppercase tracking-wide text-brand bg-brand-soft rounded px-1.5 py-px">
                    {intensityOf(l.intensity)?.label}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-dim nums">
                {fmtRelDate(l.date)} · {totalSets(l)} sets · {logVolume(l).toLocaleString()} lbs · {fmtClock(l.seconds)}
              </div>
            </div>
            <button
              className="text-faint hover:text-bad p-1"
              aria-label={`Delete workout ${l.name}`}
              onClick={() => {
                if (confirm(`Delete "${l.name}" from history?`)) {
                  deleteLog(l.id);
                  void deleteRemoteWorkout(l.id);
                }
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- manual workout entry ----------------------------------------------------

/** Log a past workout done without the app — lands in history and the feed
 *  (and syncs to friends) just like a live session. */
function ManualWorkoutSheet({
  onClose, onShowDetail
}: { onClose: () => void; onShowDetail: (e: Exercise) => void }) {
  const [name, setName] = useState('Workout');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [minutes, setMinutes] = useState('');
  const [intensity, setIntensity] = useState<Intensity | null>('moderate');
  const [rows, setRows] = useState<Array<{ exId: string; name: string; sets: string; reps: string; weight: string }>>([]);
  const [picking, setPicking] = useState(false);

  const save = () => {
    const mins = parseInt(minutes || '0', 10);
    if (!mins || mins <= 0) { toast('How long was the workout?'); return; }
    const exercises: LoggedExercise[] = rows
      .map((r) => {
        const n = Math.max(1, parseInt(r.sets || '1', 10));
        const reps = parseInt(r.reps || '0', 10);
        const weight = parseFloat(r.weight || '0');
        if (!reps || reps <= 0) return null;
        return {
          exId: r.exId,
          name: r.name,
          sets: Array.from({ length: n }, () => ({ reps, weight: isFinite(weight) && weight > 0 ? weight : 0 }))
        };
      })
      .filter((e): e is LoggedExercise => e !== null);
    const saved = addManualLog({
      date: `${date}T12:00:00`,
      name: name.trim() || 'Workout',
      seconds: mins * 60,
      intensity: intensity ?? undefined,
      exercises
    });
    onClose();
    toast(`${saved.name} logged — ${fmtClock(saved.seconds)}${exercises.length ? `, ${totalSets(saved)} sets` : ''}`);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] p-5 space-y-3 shadow-sheet max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto sm:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Log a past workout</h2>
          <button onClick={onClose} className="p-1 -mr-1 text-dim hover:text-ink" aria-label="Close manual workout">
            <X size={22} />
          </button>
        </div>

        <input
          className="input w-full font-semibold"
          placeholder="Workout name — e.g. Push day"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label block mb-1">Date</span>
            <input className="input w-full" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block">
            <span className="label block mb-1">Duration (min)</span>
            <input className="input w-full text-center" inputMode="numeric" placeholder="45" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </label>
        </div>

        <div>
          <div className="label mb-1.5">Intensity</div>
          <div className="grid grid-cols-4 gap-1.5">
            {INTENSITIES.map((i) => {
              const on = intensity === i.id;
              return (
                <button
                  key={i.id}
                  onClick={() => setIntensity(on ? null : i.id)}
                  className={`rounded-xl py-2 text-center border transition-colors ${
                    on ? 'border-brand bg-brand-soft text-brand' : 'border-line text-dim hover:text-ink'
                  }`}
                >
                  <span className="block text-xs font-black">{i.label}</span>
                  <span className="block text-[9px] font-bold opacity-70">{i.rpe}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="label mb-1">Exercises (optional)</div>
          {rows.length > 0 && (
            <div className="divide-y divide-line mb-1">
              {rows.map((r, i) => (
                <div key={r.exId} className="py-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      className="flex-1 min-w-0 text-left text-sm font-semibold truncate"
                      onClick={() => { const e = exerciseById(r.exId); if (e) onShowDetail(e); }}
                    >
                      {r.name}
                    </button>
                    <button
                      className="text-faint hover:text-bad p-1.5 -m-1"
                      aria-label={`Remove ${r.name}`}
                      onClick={() => setRows(rows.filter((_, j) => j !== i))}
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      className="input flex-1 min-w-0 text-center !py-1.5 text-sm"
                      inputMode="numeric" placeholder="Sets"
                      aria-label={`Sets for ${r.name}`}
                      value={r.sets}
                      onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, sets: e.target.value } : x)))}
                    />
                    <span className="text-faint text-xs font-bold">×</span>
                    <input
                      className="input flex-1 min-w-0 text-center !py-1.5 text-sm"
                      inputMode="numeric" placeholder="Reps"
                      aria-label={`Reps for ${r.name}`}
                      value={r.reps}
                      onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, reps: e.target.value } : x)))}
                    />
                    <span className="text-faint text-xs font-bold">@</span>
                    <input
                      className="input flex-1 min-w-0 text-center !py-1.5 text-sm"
                      inputMode="decimal" placeholder="lb"
                      aria-label={`Weight for ${r.name}`}
                      value={r.weight}
                      onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, weight: e.target.value } : x)))}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {picking ? (
            <ExercisePicker
              onPick={(e) => {
                if (rows.some((r) => r.exId === e.id)) { toast('Already added'); return; }
                setRows([...rows, { exId: e.id, name: e.name, sets: `${parseInt(e.sets, 10) || 3}`, reps: '', weight: '' }]);
                setPicking(false);
              }}
              onDone={() => setPicking(false)}
            />
          ) : (
            <button className="btn-ghost w-full !py-2 text-sm" onClick={() => setPicking(true)}>
              <Plus size={15} /> Add exercise
            </button>
          )}
        </div>

        <button className="btn-primary w-full py-3" onClick={save}>Save to history</button>
      </div>
    </div>
  );
}
