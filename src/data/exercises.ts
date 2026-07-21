/**
 * Lifting knowledge base: muscle groups → subgroups (real anatomy, friendly
 * notes), an exercise library tagged by the subgroups each move targets, and
 * classic split templates. Every exercise carries a suggested prescription —
 * sets, rep range, rest and a 4-number tempo (seconds): lower / pause /
 * lift / squeeze, i.e. time under tension.
 */

export interface MuscleSubgroup {
  id: string;
  name: string;
  note: string;         // where it is / what it does, in plain words
}

export interface MuscleGroup {
  id: string;
  name: string;
  emoji: string;
  subgroups: MuscleSubgroup[];
}

export type Equipment = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell';

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  primary: string[];    // subgroup ids this move is best for
  secondary: string[];  // also worked
  sets: string;         // suggested working sets, e.g. "3–4"
  reps: string;         // suggested rep range
  tempo: [number, number, number, number]; // lower / pause / lift / squeeze (s)
  rest: number;         // suggested rest between sets (s)
  cue: string;          // one coaching cue
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  {
    id: 'chest', name: 'Chest', emoji: '🫁',
    subgroups: [
      { id: 'chest-upper', name: 'Upper chest (clavicular head)', note: 'Along the collarbone — grows from incline pressing and low-to-high flys.' },
      { id: 'chest-mid', name: 'Mid chest (sternal head)', note: 'The bulk of the pec — flat pressing and flys.' },
      { id: 'chest-lower', name: 'Lower chest (costal fibers)', note: 'The lower sweep — dips and high-to-low cable work.' }
    ]
  },
  {
    id: 'back', name: 'Back', emoji: '🪽',
    subgroups: [
      { id: 'back-lats', name: 'Lats', note: 'The wide "wings" — pulldowns and rows with elbows tucked.' },
      { id: 'back-upper', name: 'Upper back & traps', note: 'Upper traps shrug the shoulders; mid traps and rhomboids pinch the shoulder blades.' },
      { id: 'back-mid', name: 'Mid back (rhomboids)', note: 'Between the shoulder blades — rows with a hard squeeze.' },
      { id: 'back-lower', name: 'Lower back (erectors)', note: 'The spine muscles — deadlifts, back extensions. Keep it neutral, never rounded.' }
    ]
  },
  {
    id: 'shoulders', name: 'Shoulders', emoji: '🏔️',
    subgroups: [
      { id: 'delt-front', name: 'Front delt', note: 'Front of the shoulder — all pressing. Rarely needs extra isolation.' },
      { id: 'delt-side', name: 'Side delt', note: 'The width-maker — lateral raises, upright rows.' },
      { id: 'delt-rear', name: 'Rear delt', note: 'Back of the shoulder — reverse flys, face pulls. Most undertrained.' }
    ]
  },
  {
    id: 'biceps', name: 'Biceps', emoji: '💪',
    subgroups: [
      { id: 'bicep-long', name: 'Long head (outer)', note: 'The peak — arms behind the body (incline curls) or narrow grip.' },
      { id: 'bicep-short', name: 'Short head (inner)', note: 'Inner thickness — arms in front (preacher curls) or wide grip.' },
      { id: 'brachialis', name: 'Brachialis', note: 'Under the biceps; pushes the peak up — hammer and reverse curls.' }
    ]
  },
  {
    id: 'triceps', name: 'Triceps', emoji: '🔱',
    subgroups: [
      { id: 'tri-long', name: 'Long head', note: 'Two-thirds of arm size — overhead extensions stretch it fully.' },
      { id: 'tri-lateral', name: 'Lateral head', note: 'The outer horseshoe — pushdowns with a full lockout.' },
      { id: 'tri-medial', name: 'Medial head', note: 'Deep, near the elbow — works in every extension, loves reverse grip.' }
    ]
  },
  {
    id: 'legs', name: 'Legs', emoji: '🦵',
    subgroups: [
      { id: 'quads', name: 'Quads', note: 'Front of the thigh — squats, leg press, extensions.' },
      { id: 'hamstrings', name: 'Hamstrings', note: 'Back of the thigh — hinge (RDLs) and curl (leg curls). Runners: keep these strong.' },
      { id: 'glutes', name: 'Glutes', note: 'Hip power for lifting AND running — hip thrusts, lunges, deep squats.' },
      { id: 'calves', name: 'Calves', note: 'Gastroc (standing raises) and soleus (seated raises) — full stretch at the bottom.' },
      { id: 'adductors', name: 'Adductors (inner thigh)', note: 'Squat depth and knee stability — sumo stance, adduction work.' }
    ]
  },
  {
    id: 'core', name: 'Core', emoji: '🧱',
    subgroups: [
      { id: 'abs-upper', name: 'Upper abs', note: 'Ribcage-to-hips crunching — cable crunches, sit-ups.' },
      { id: 'abs-lower', name: 'Lower abs', note: 'Pelvis-to-ribcage — leg raises, reverse crunches.' },
      { id: 'obliques', name: 'Obliques', note: 'Side core, twisting + anti-twisting — woodchops, side planks.' },
      { id: 'core-deep', name: 'Deep core (TVA)', note: 'The natural belt — planks, dead bugs, breathing braced.' }
    ]
  }
];

/** Flat lookup: subgroup id → subgroup + its parent group. */
export function findSubgroup(id: string): { group: MuscleGroup; sub: MuscleSubgroup } | null {
  for (const g of MUSCLE_GROUPS) {
    const sub = g.subgroups.find((s) => s.id === id);
    if (sub) return { group: g, sub };
  }
  return null;
}

export const EXERCISES: Exercise[] = [
  // ---- chest ----
  { id: 'bench-press', name: 'Barbell bench press', equipment: 'barbell', primary: ['chest-mid'], secondary: ['delt-front', 'tri-lateral'], sets: '3–4', reps: '5–8', tempo: [3, 1, 1, 0], rest: 150, cue: 'Bar to mid-chest, feet planted, shoulder blades pinched.' },
  { id: 'incline-db-press', name: 'Incline dumbbell press', equipment: 'dumbbell', primary: ['chest-upper'], secondary: ['delt-front', 'tri-lateral'], sets: '3–4', reps: '8–12', tempo: [3, 1, 1, 1], rest: 120, cue: '30–45° bench; lower until you feel the upper-chest stretch.' },
  { id: 'db-bench-press', name: 'Flat dumbbell press', equipment: 'dumbbell', primary: ['chest-mid'], secondary: ['delt-front', 'tri-lateral'], sets: '3–4', reps: '8–12', tempo: [3, 0, 1, 1], rest: 120, cue: 'Deeper stretch than a bar — control the bottom.' },
  { id: 'dips', name: 'Chest dips', equipment: 'bodyweight', primary: ['chest-lower'], secondary: ['tri-lateral', 'delt-front'], sets: '3', reps: '8–15', tempo: [3, 1, 1, 0], rest: 120, cue: 'Lean forward, elbows out for chest; upright for triceps.' },
  { id: 'cable-fly-high', name: 'Low-to-high cable fly', equipment: 'cable', primary: ['chest-upper'], secondary: ['delt-front'], sets: '3', reps: '12–15', tempo: [3, 0, 1, 2], rest: 90, cue: 'Scoop up and in; squeeze the top for two full seconds.' },
  { id: 'cable-fly-low', name: 'High-to-low cable fly', equipment: 'cable', primary: ['chest-lower', 'chest-mid'], secondary: [], sets: '3', reps: '12–15', tempo: [3, 0, 1, 2], rest: 90, cue: 'Hug a barrel downward; hands meet below your chest.' },
  { id: 'pushup', name: 'Push-up', equipment: 'bodyweight', primary: ['chest-mid'], secondary: ['delt-front', 'tri-lateral', 'core-deep'], sets: '3', reps: '10–20', tempo: [2, 0, 1, 0], rest: 90, cue: 'Body one straight line; chest, not chin, to the floor.' },

  // ---- back ----
  { id: 'pullup', name: 'Pull-up', equipment: 'bodyweight', primary: ['back-lats'], secondary: ['bicep-long', 'back-mid'], sets: '3–4', reps: '5–10', tempo: [3, 0, 1, 1], rest: 150, cue: 'Chest to the bar, elbows down into your back pockets.' },
  { id: 'lat-pulldown', name: 'Lat pulldown', equipment: 'cable', primary: ['back-lats'], secondary: ['bicep-short', 'back-mid'], sets: '3–4', reps: '8–12', tempo: [3, 0, 1, 1], rest: 120, cue: 'Lead with the elbows; bar to the collarbone, no swinging.' },
  { id: 'barbell-row', name: 'Barbell row', equipment: 'barbell', primary: ['back-mid', 'back-lats'], secondary: ['back-lower', 'bicep-short'], sets: '3–4', reps: '6–10', tempo: [2, 0, 1, 1], rest: 150, cue: 'Hinge ~45°, pull to the lower ribs, squeeze the blades.' },
  { id: 'db-row', name: 'One-arm dumbbell row', equipment: 'dumbbell', primary: ['back-lats', 'back-mid'], secondary: ['bicep-long'], sets: '3', reps: '8–12', tempo: [2, 0, 1, 1], rest: 90, cue: 'Row to the hip for lats, to the ribs for upper back.' },
  { id: 'seated-cable-row', name: 'Seated cable row', equipment: 'cable', primary: ['back-mid'], secondary: ['back-lats', 'bicep-short'], sets: '3', reps: '10–12', tempo: [2, 0, 1, 2], rest: 120, cue: 'Chest tall; drive elbows back and hold the squeeze.' },
  { id: 'deadlift', name: 'Deadlift', equipment: 'barbell', primary: ['back-lower', 'glutes', 'hamstrings'], secondary: ['back-upper', 'core-deep'], sets: '3', reps: '3–6', tempo: [2, 0, 1, 0], rest: 210, cue: 'Push the floor away; bar stays glued to the legs.' },
  { id: 'back-extension', name: 'Back extension', equipment: 'bodyweight', primary: ['back-lower'], secondary: ['glutes', 'hamstrings'], sets: '3', reps: '12–15', tempo: [2, 0, 1, 1], rest: 90, cue: 'Hinge at the hips, rise to a straight line — no hyperextension.' },
  { id: 'shrug', name: 'Dumbbell shrug', equipment: 'dumbbell', primary: ['back-upper'], secondary: [], sets: '3', reps: '12–15', tempo: [2, 0, 1, 2], rest: 90, cue: 'Straight up to your ears, hold two seconds, no rolling.' },
  { id: 'face-pull', name: 'Face pull', equipment: 'cable', primary: ['delt-rear', 'back-upper'], secondary: ['back-mid'], sets: '3', reps: '15–20', tempo: [2, 0, 1, 1], rest: 60, cue: 'Rope to the bridge of your nose, thumbs pointing back.' },

  // ---- shoulders ----
  { id: 'ohp', name: 'Overhead press', equipment: 'barbell', primary: ['delt-front'], secondary: ['delt-side', 'tri-lateral', 'core-deep'], sets: '3–4', reps: '5–8', tempo: [2, 0, 1, 0], rest: 150, cue: 'Squeeze glutes, ribs down; press slightly back to stack the bar.' },
  { id: 'db-shoulder-press', name: 'Seated dumbbell press', equipment: 'dumbbell', primary: ['delt-front', 'delt-side'], secondary: ['tri-lateral'], sets: '3–4', reps: '8–12', tempo: [3, 0, 1, 0], rest: 120, cue: 'Elbows just in front of the body, not flared to 90°.' },
  { id: 'lateral-raise', name: 'Dumbbell lateral raise', equipment: 'dumbbell', primary: ['delt-side'], secondary: [], sets: '3–4', reps: '12–20', tempo: [3, 0, 1, 1], rest: 60, cue: 'Lead with the elbows, pour the pitcher, stop at shoulder height.' },
  { id: 'cable-lateral', name: 'Cable lateral raise', equipment: 'cable', primary: ['delt-side'], secondary: [], sets: '3', reps: '12–15', tempo: [3, 0, 1, 1], rest: 60, cue: 'Constant tension — the cable never goes slack.' },
  { id: 'reverse-fly', name: 'Reverse dumbbell fly', equipment: 'dumbbell', primary: ['delt-rear'], secondary: ['back-mid'], sets: '3', reps: '12–15', tempo: [2, 0, 1, 1], rest: 60, cue: 'Hinge over; swing wide like opening curtains, pinkies up.' },

  // ---- biceps ----
  { id: 'barbell-curl', name: 'Barbell curl', equipment: 'barbell', primary: ['bicep-short', 'bicep-long'], secondary: ['brachialis'], sets: '3', reps: '8–12', tempo: [3, 0, 1, 1], rest: 90, cue: 'Elbows pinned to your sides; no hip swing.' },
  { id: 'incline-curl', name: 'Incline dumbbell curl', equipment: 'dumbbell', primary: ['bicep-long'], secondary: [], sets: '3', reps: '10–12', tempo: [3, 0, 1, 1], rest: 90, cue: 'Arms hang behind you on the incline — deep stretch on the long head.' },
  { id: 'preacher-curl', name: 'Preacher curl', equipment: 'dumbbell', primary: ['bicep-short'], secondary: ['brachialis'], sets: '3', reps: '10–12', tempo: [3, 1, 1, 1], rest: 90, cue: 'Arm in front pins the short head; control the bottom inch.' },
  { id: 'hammer-curl', name: 'Hammer curl', equipment: 'dumbbell', primary: ['brachialis'], secondary: ['bicep-long'], sets: '3', reps: '10–12', tempo: [2, 0, 1, 1], rest: 90, cue: 'Neutral grip the whole way — think thumbs up.' },
  { id: 'cable-curl', name: 'Cable curl', equipment: 'cable', primary: ['bicep-short'], secondary: ['bicep-long'], sets: '3', reps: '12–15', tempo: [3, 0, 1, 1], rest: 60, cue: 'Step back for tension at the bottom of every rep.' },

  // ---- triceps ----
  { id: 'close-grip-bench', name: 'Close-grip bench press', equipment: 'barbell', primary: ['tri-lateral', 'tri-medial'], secondary: ['chest-mid', 'delt-front'], sets: '3', reps: '6–10', tempo: [3, 0, 1, 0], rest: 150, cue: 'Hands shoulder-width, elbows tucked to the ribs.' },
  { id: 'overhead-ext', name: 'Overhead cable extension', equipment: 'cable', primary: ['tri-long'], secondary: ['tri-medial'], sets: '3', reps: '10–15', tempo: [3, 1, 1, 0], rest: 90, cue: 'Elbows by the ears — the overhead stretch is the point.' },
  { id: 'skullcrusher', name: 'Skullcrusher', equipment: 'barbell', primary: ['tri-long', 'tri-lateral'], secondary: [], sets: '3', reps: '8–12', tempo: [3, 0, 1, 0], rest: 90, cue: 'Lower behind the head, not to the forehead — saves the elbows.' },
  { id: 'pushdown', name: 'Cable pushdown', equipment: 'cable', primary: ['tri-lateral'], secondary: ['tri-medial'], sets: '3', reps: '10–15', tempo: [2, 0, 1, 1], rest: 60, cue: 'Elbows glued to your sides; full lockout, hard squeeze.' },
  { id: 'bench-dip', name: 'Bench dip', equipment: 'bodyweight', primary: ['tri-lateral', 'tri-medial'], secondary: ['chest-lower'], sets: '3', reps: '10–15', tempo: [3, 0, 1, 0], rest: 90, cue: 'Hips close to the bench, shoulders down away from ears.' },

  // ---- legs ----
  { id: 'back-squat', name: 'Barbell back squat', equipment: 'barbell', primary: ['quads', 'glutes'], secondary: ['adductors', 'back-lower', 'core-deep'], sets: '3–4', reps: '5–8', tempo: [3, 0, 1, 0], rest: 180, cue: 'Sit between the heels, chest proud, knees tracking the toes.' },
  { id: 'goblet-squat', name: 'Goblet squat', equipment: 'dumbbell', primary: ['quads'], secondary: ['glutes', 'core-deep'], sets: '3', reps: '10–15', tempo: [3, 1, 1, 0], rest: 120, cue: 'Weight at the chest keeps you upright — great depth teacher.' },
  { id: 'rdl', name: 'Romanian deadlift', equipment: 'barbell', primary: ['hamstrings', 'glutes'], secondary: ['back-lower'], sets: '3–4', reps: '8–12', tempo: [4, 1, 1, 0], rest: 150, cue: 'Push the hips back until the hamstrings scream, soft knees.' },
  { id: 'leg-press', name: 'Leg press', equipment: 'machine', primary: ['quads', 'glutes'], secondary: ['adductors'], sets: '3–4', reps: '8–15', tempo: [3, 0, 1, 0], rest: 150, cue: 'Low feet = quads, high feet = glutes/hams. Never lock out hard.' },
  { id: 'walking-lunge', name: 'Walking lunge', equipment: 'dumbbell', primary: ['glutes', 'quads'], secondary: ['hamstrings', 'core-deep'], sets: '3', reps: '10–12 /leg', tempo: [2, 0, 1, 0], rest: 120, cue: 'Long stride = glutes, short stride = quads; torso tall.' },
  { id: 'hip-thrust', name: 'Barbell hip thrust', equipment: 'barbell', primary: ['glutes'], secondary: ['hamstrings'], sets: '3–4', reps: '8–12', tempo: [2, 0, 1, 2], rest: 120, cue: 'Ribs down, full lockout, two-second squeeze at the top.' },
  { id: 'leg-curl', name: 'Lying leg curl', equipment: 'machine', primary: ['hamstrings'], secondary: [], sets: '3', reps: '10–15', tempo: [3, 0, 1, 1], rest: 90, cue: 'Hips stay pinned to the pad — no cheating with the back.' },
  { id: 'leg-extension', name: 'Leg extension', equipment: 'machine', primary: ['quads'], secondary: [], sets: '3', reps: '12–15', tempo: [2, 0, 1, 2], rest: 90, cue: 'Pause hard at the top; the squeeze is the rep.' },
  { id: 'standing-calf', name: 'Standing calf raise', equipment: 'machine', primary: ['calves'], secondary: [], sets: '4', reps: '10–15', tempo: [3, 2, 1, 2], rest: 60, cue: 'Deep two-second stretch at the bottom — that is the growth zone.' },
  { id: 'seated-calf', name: 'Seated calf raise', equipment: 'machine', primary: ['calves'], secondary: [], sets: '3', reps: '15–20', tempo: [2, 1, 1, 2], rest: 60, cue: 'Bent knee shifts it to the soleus — go higher-rep here.' },
  { id: 'sumo-squat', name: 'Sumo goblet squat', equipment: 'dumbbell', primary: ['adductors', 'glutes'], secondary: ['quads'], sets: '3', reps: '10–15', tempo: [3, 1, 1, 0], rest: 90, cue: 'Wide stance, toes out; knees pushed wide the whole way.' },

  // ---- core ----
  { id: 'cable-crunch', name: 'Cable crunch', equipment: 'cable', primary: ['abs-upper'], secondary: ['abs-lower'], sets: '3', reps: '12–15', tempo: [2, 0, 1, 1], rest: 60, cue: 'Curl the ribs to the hips — hips stay still, abs do the folding.' },
  { id: 'hanging-leg-raise', name: 'Hanging leg raise', equipment: 'bodyweight', primary: ['abs-lower'], secondary: ['abs-upper', 'obliques'], sets: '3', reps: '8–15', tempo: [3, 0, 1, 1], rest: 90, cue: 'Curl the pelvis up at the top — not just the legs.' },
  { id: 'plank', name: 'Plank', equipment: 'bodyweight', primary: ['core-deep'], secondary: ['abs-upper', 'obliques'], sets: '3', reps: '30–60 s', tempo: [0, 0, 0, 0], rest: 60, cue: 'Squeeze glutes, tuck ribs — a plank is a hold, not a sag.' },
  { id: 'side-plank', name: 'Side plank', equipment: 'bodyweight', primary: ['obliques'], secondary: ['core-deep'], sets: '3', reps: '20–45 s /side', tempo: [0, 0, 0, 0], rest: 60, cue: 'Hips high; body one straight rail from head to feet.' },
  { id: 'woodchop', name: 'Cable woodchop', equipment: 'cable', primary: ['obliques'], secondary: ['core-deep'], sets: '3', reps: '10–12 /side', tempo: [2, 0, 1, 1], rest: 60, cue: 'Rotate from the trunk; arms just hold the handle.' },
  { id: 'dead-bug', name: 'Dead bug', equipment: 'bodyweight', primary: ['core-deep'], secondary: ['abs-lower'], sets: '3', reps: '8–10 /side', tempo: [3, 1, 1, 0], rest: 60, cue: 'Low back pressed to the floor the entire time — that is the exercise.' },
  { id: 'russian-twist', name: 'Weighted Russian twist', equipment: 'dumbbell', primary: ['obliques'], secondary: ['abs-upper'], sets: '3', reps: '12–16 /side', tempo: [1, 0, 1, 0], rest: 60, cue: 'Chest up, twist shoulder-to-shoulder, not just the arms.' }
];

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

/** Every exercise whose primary (or optionally secondary) targets a subgroup. */
export function exercisesFor(subgroupId: string, includeSecondary = true): Exercise[] {
  return EXERCISES.filter(
    (e) => e.primary.includes(subgroupId) || (includeSecondary && e.secondary.includes(subgroupId))
  ).sort((a, b) => Number(b.primary.includes(subgroupId)) - Number(a.primary.includes(subgroupId)));
}

// ---- splits -----------------------------------------------------------------

export interface SplitDay {
  name: string;
  groups: string[];       // muscle-group ids trained that day
  exercises: string[];    // a ready-made exercise selection
}

export interface SplitTemplate {
  id: string;
  name: string;
  desc: string;
  days: SplitDay[];
}

export const SPLITS: SplitTemplate[] = [
  {
    id: 'ppl',
    name: 'Push · Pull · Legs',
    desc: 'The classic 3-day rotation. Run it once (3 days/wk) or twice (6 days/wk).',
    days: [
      { name: 'Push', groups: ['chest', 'shoulders', 'triceps'], exercises: ['bench-press', 'incline-db-press', 'db-shoulder-press', 'lateral-raise', 'overhead-ext', 'pushdown'] },
      { name: 'Pull', groups: ['back', 'biceps'], exercises: ['pullup', 'barbell-row', 'seated-cable-row', 'face-pull', 'incline-curl', 'hammer-curl'] },
      { name: 'Legs', groups: ['legs', 'core'], exercises: ['back-squat', 'rdl', 'leg-press', 'leg-curl', 'standing-calf', 'plank'] }
    ]
  },
  {
    id: 'ppla',
    name: 'Push · Pull · Legs · Abs',
    desc: 'PPL with a dedicated core + weak-point day — great at 4 days/wk.',
    days: [
      { name: 'Push', groups: ['chest', 'shoulders', 'triceps'], exercises: ['incline-db-press', 'dips', 'ohp', 'cable-lateral', 'skullcrusher'] },
      { name: 'Pull', groups: ['back', 'biceps'], exercises: ['lat-pulldown', 'db-row', 'shrug', 'reverse-fly', 'barbell-curl', 'preacher-curl'] },
      { name: 'Legs', groups: ['legs'], exercises: ['back-squat', 'hip-thrust', 'walking-lunge', 'leg-extension', 'seated-calf'] },
      { name: 'Abs & extras', groups: ['core', 'shoulders'], exercises: ['cable-crunch', 'hanging-leg-raise', 'woodchop', 'side-plank', 'lateral-raise', 'face-pull'] }
    ]
  },
  {
    id: 'upper-lower',
    name: 'Upper · Lower',
    desc: 'Two halves, big compound focus — perfect at 4 days/wk alongside running.',
    days: [
      { name: 'Upper', groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], exercises: ['bench-press', 'barbell-row', 'db-shoulder-press', 'lat-pulldown', 'barbell-curl', 'pushdown'] },
      { name: 'Lower', groups: ['legs', 'core'], exercises: ['back-squat', 'rdl', 'walking-lunge', 'standing-calf', 'hanging-leg-raise', 'plank'] }
    ]
  },
  {
    id: 'full-body',
    name: 'Full body',
    desc: 'Everything each session, 2–3× a week — the best value per gym hour for runners.',
    days: [
      { name: 'Full body A', groups: ['legs', 'chest', 'back', 'core'], exercises: ['back-squat', 'bench-press', 'db-row', 'hip-thrust', 'plank'] },
      { name: 'Full body B', groups: ['legs', 'shoulders', 'back', 'core'], exercises: ['rdl', 'ohp', 'lat-pulldown', 'walking-lunge', 'hanging-leg-raise'] }
    ]
  },
  {
    id: 'bro',
    name: 'Body-part split',
    desc: 'One group a day, maximum volume per muscle — the classic 5-day "bro split".',
    days: [
      { name: 'Chest', groups: ['chest'], exercises: ['bench-press', 'incline-db-press', 'cable-fly-high', 'cable-fly-low', 'pushup'] },
      { name: 'Back', groups: ['back'], exercises: ['deadlift', 'pullup', 'barbell-row', 'seated-cable-row', 'shrug'] },
      { name: 'Shoulders', groups: ['shoulders'], exercises: ['ohp', 'lateral-raise', 'cable-lateral', 'reverse-fly', 'face-pull'] },
      { name: 'Arms', groups: ['biceps', 'triceps'], exercises: ['barbell-curl', 'incline-curl', 'hammer-curl', 'close-grip-bench', 'overhead-ext', 'pushdown'] },
      { name: 'Legs & abs', groups: ['legs', 'core'], exercises: ['back-squat', 'rdl', 'leg-press', 'standing-calf', 'cable-crunch', 'side-plank'] }
    ]
  }
];
