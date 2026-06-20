/**
 * Web Audio metronome + cue beeps using a lookahead scheduler
 * (Chris Wilson, "A Tale of Two Clocks"). Ported from the artifact —
 * a setTimeout poll schedules click events slightly ahead on the precise
 * AudioContext clock, so timing stays rock-solid even when the main
 * thread is busy.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** A short one-shot beep — used for interval run/walk switches. */
export function beep(freq = 880, durationMs = 180, gain = 0.3) {
  const ac = getCtx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.frequency.value = freq;
  osc.type = 'sine';
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.connect(g).connect(ac.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

/** Three rising beeps — phase complete / transition. */
export function fanfare() {
  beep(660, 140);
  setTimeout(() => beep(880, 140), 160);
  setTimeout(() => beep(1175, 220), 320);
}

export class Metronome {
  private bpm = 170;
  private accentEvery = 4; // accent the downbeat every Nth click
  private nextNoteTime = 0;
  private beatNumber = 0;
  private timer: number | null = null;
  private readonly lookahead = 25;        // ms — how often we check the schedule
  private readonly scheduleAhead = 0.1;   // s — how far ahead we schedule

  setBpm(bpm: number) {
    this.bpm = Math.max(40, Math.min(240, bpm));
  }

  get running() {
    return this.timer !== null;
  }

  private scheduleClick(time: number, accent: boolean) {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.frequency.value = accent ? 1500 : 1000;
    g.gain.setValueAtTime(accent ? 0.5 : 0.28, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(g).connect(ac.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  private tick = () => {
    const ac = getCtx();
    while (this.nextNoteTime < ac.currentTime + this.scheduleAhead) {
      this.scheduleClick(this.nextNoteTime, this.beatNumber % this.accentEvery === 0);
      this.nextNoteTime += 60 / this.bpm;
      this.beatNumber++;
    }
    this.timer = window.setTimeout(this.tick, this.lookahead);
  };

  start() {
    if (this.running) return;
    const ac = getCtx();
    this.beatNumber = 0;
    this.nextNoteTime = ac.currentTime + 0.06;
    this.tick();
  }

  stop() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
