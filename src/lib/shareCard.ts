/**
 * Shareable-image rendering — pure canvas, no React.
 *
 * Two exports, both drawing onto a caller-supplied <canvas>:
 *  - renderTransparentRoute: the route outline alone on a transparent PNG
 *    (Strava's "transparent log" export), for pasting onto photos.
 *  - renderStoryCard: a 1080×1920 Instagram-Story-style stats card.
 */
import type { LatLng } from './run';
import { fmtClock, paceFor } from './run';
import type { Activity } from './storage';

export const BRAND = '#FC4C02';

const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`;

// ---- projection ------------------------------------------------------------

interface Bounds {
  minX: number; maxX: number; minY: number; maxY: number;
  spanX: number; spanY: number;
  k: number; // cos(mean latitude) — longitude scale factor
}

/**
 * Equirectangular bounds of a route: x = lng·cos(meanLat), y = lat, so a
 * degree of longitude and a degree of latitude cover the same distance and
 * the shape isn't horizontally squashed.
 */
function routeBounds(route: LatLng[]): Bounds {
  let sumLat = 0;
  for (const p of route) sumLat += p[0];
  const k = Math.cos(((sumLat / route.length) * Math.PI) / 180);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [lat, lng] of route) {
    const x = lng * k;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (lat < minY) minY = lat;
    if (lat > maxY) maxY = lat;
  }
  return {
    minX, maxX, minY, maxY,
    spanX: Math.max(maxX - minX, 1e-9),
    spanY: Math.max(maxY - minY, 1e-9),
    k
  };
}

/**
 * Project a route into the box (x, y, w, h) in canvas space: fitted
 * (aspect-preserving), centered, with north up (canvas y grows downward,
 * so higher latitude → smaller y).
 */
function projectRoute(route: LatLng[], x: number, y: number, w: number, h: number): Array<[number, number]> {
  const b = routeBounds(route);
  const scale = Math.min(w / b.spanX, h / b.spanY);
  const offX = x + (w - b.spanX * scale) / 2;
  const offY = y + (h - b.spanY * scale) / 2;
  return route.map(([lat, lng]) => [offX + (lng * b.k - b.minX) * scale, offY + (b.maxY - lat) * scale]);
}

function strokeRoute(ctx: CanvasRenderingContext2D, pts: Array<[number, number]>, color: string, width: number) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

// ---- transparent route export ----------------------------------------------

/**
 * Route outline on a fully transparent canvas. Canvas is sized to the
 * route's own aspect ratio (longer side ≈ 1200px, shorter clamped ≥ 700px).
 */
export function renderTransparentRoute(canvas: HTMLCanvasElement, route: LatLng[], color: string = BRAND) {
  const b = routeBounds(route);
  const LONG = 1200, MIN_SHORT = 700;
  let w: number, h: number;
  if (b.spanX >= b.spanY) {
    w = LONG;
    h = Math.max(MIN_SHORT, Math.round((LONG * b.spanY) / b.spanX));
  } else {
    h = LONG;
    w = Math.max(MIN_SHORT, Math.round((LONG * b.spanX) / b.spanY));
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h); // transparent — never paint a background here
  const pad = Math.round(Math.min(w, h) * 0.09);
  const pts = projectRoute(route, pad, pad, w - 2 * pad, h - 2 * pad);
  strokeRoute(ctx, pts, color, Math.max(6, Math.min(w, h) * 0.014));
}

// ---- story card --------------------------------------------------------------

export type GradientId = 'orange' | 'ink' | 'sunrise' | 'forest';

/** Diagonal two-stop gradients — also used by the UI for the picker swatches. */
export const GRADIENTS: Record<GradientId, [string, string]> = {
  orange: ['#FC4C02', '#B23300'],
  ink: ['#2B2E36', '#0E0F12'],
  sunrise: ['#FF7A45', '#FFC24B'],
  forest: ['#1F6B4C', '#0E2E22']
};

export type CardBackground =
  | { type: 'gradient'; id: GradientId }
  | { type: 'photo'; image: HTMLImageElement };

export interface StoryCardOptions {
  background: CardBackground;
  routeColor?: string;
  accent?: string;   // brand color for the logo tile (defaults to BRAND)
}

const CARD_W = 1080;
const CARD_H = 1920;

/** 1080×1920 Instagram-Story-style share card with the Runner branding. */
export function renderStoryCard(canvas: HTMLCanvasElement, activity: Activity, opts: StoryCardOptions) {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, CARD_W, CARD_H);

  // background
  if (opts.background.type === 'gradient') {
    const [a, b] = GRADIENTS[opts.background.id];
    const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
  } else {
    drawCover(ctx, opts.background.image, CARD_W, CARD_H);
    // scrim: heavier at top and bottom so white text survives bright photos
    const g = ctx.createLinearGradient(0, 0, 0, CARD_H);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(0.35, 'rgba(0,0,0,0.20)');
    g.addColorStop(0.65, 'rgba(0,0,0,0.20)');
    g.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
  }

  const hasRoute = activity.route.length > 1;
  const cx = CARD_W / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // no route → nudge the whole block down so the layout stays balanced
  let y = hasRoute ? 250 : 420;

  drawLogoRow(ctx, cx, y, opts.accent ?? BRAND);

  // huge distance
  y += hasRoute ? 330 : 350;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 250px ${FONT}`;
  ctx.fillText(activity.miles.toFixed(2), cx, y);
  y += 88;
  drawLabel(ctx, 'MILES', cx, y, 40);

  // pace / moving-time columns
  y += 180;
  const colL = CARD_W * 0.3;
  const colR = CARD_W * 0.7;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 92px ${FONT}`;
  ctx.fillText(`${paceFor(activity.seconds, activity.miles)}/mi`, colL, y);
  ctx.fillText(fmtClock(activity.seconds), colR, y);
  y += 66;
  drawLabel(ctx, 'PACE', colL, y, 30);
  drawLabel(ctx, 'MOVING TIME', colR, y, 30);

  // activity name
  y += 130;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = `600 52px ${FONT}`;
  ctx.fillText(activity.name, cx, y);

  // route outline band (skipped entirely for manual entries)
  if (hasRoute) {
    const bandY = y + 90;
    const bandH = Math.max(200, 1720 - bandY);
    const pts = projectRoute(activity.route, 180, bandY, CARD_W - 360, bandH);
    strokeRoute(ctx, pts, opts.routeColor ?? '#FFFFFF', 12);
  }

  // date line
  const d = new Date(activity.date);
  const dateStr =
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `600 36px ${FONT}`;
  ctx.fillText(dateStr, cx, CARD_H - 96);
}

// ---- flyover video ----------------------------------------------------------

const VID_W = 1080;
const VID_H = 1920;

/** Draw one frame of the "drone flyover": the route drawing in up to `progress`
 *  (0–1) with a moving head dot, over live distance/time/pace readouts. */
export function renderFlyoverFrame(
  canvas: HTMLCanvasElement, activity: Activity, progress: number, accent: string = BRAND
) {
  if (canvas.width !== VID_W) canvas.width = VID_W;
  if (canvas.height !== VID_H) canvas.height = VID_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const p = Math.max(0, Math.min(1, progress));

  // dark background
  const bg = ctx.createLinearGradient(0, 0, VID_W, VID_H);
  bg.addColorStop(0, '#1B1D23');
  bg.addColorStop(1, '#0C0D10');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VID_W, VID_H);

  const cx = VID_W / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  drawLogoRow(ctx, cx, 230, accent);

  // route band
  const bandY = 420;
  const bandH = 900;
  const pts = projectRoute(activity.route, 150, bandY, VID_W - 300, bandH);

  // full route, faint
  strokeRoute(ctx, pts, 'rgba(255,255,255,0.16)', 10);

  // travelled portion up to p (interpolate the head between vertices)
  if (pts.length >= 2 && p > 0) {
    const fIdx = p * (pts.length - 1);
    const i = Math.floor(fIdx);
    const frac = fIdx - i;
    const drawn = pts.slice(0, i + 1);
    let head = pts[i];
    if (i < pts.length - 1) {
      head = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * frac, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * frac];
      drawn.push(head);
    }
    ctx.shadowColor = accent;
    ctx.shadowBlur = 24;
    strokeRoute(ctx, drawn, accent, 14);
    ctx.shadowBlur = 0;
    // head dot
    ctx.beginPath();
    ctx.arc(head[0], head[1], 18, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  }

  // live readouts
  const miles = activity.miles * p;
  const secs = Math.round(activity.seconds * p);
  let y = bandY + bandH + 190;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 220px ${FONT}`;
  ctx.fillText(miles.toFixed(2), cx, y);
  y += 78;
  drawLabel(ctx, 'MILES', cx, y, 38);

  y += 170;
  const colL = VID_W * 0.3;
  const colR = VID_W * 0.7;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 84px ${FONT}`;
  ctx.fillText(fmtClock(secs), colL, y);
  ctx.fillText(`${paceFor(secs, miles)}/mi`, colR, y);
  y += 60;
  drawLabel(ctx, 'TIME', colL, y, 28);
  drawLabel(ctx, 'PACE', colR, y, 28);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `600 46px ${FONT}`;
  ctx.fillText(activity.name, cx, VID_H - 120);
}

/** Best supported recording MIME for this browser (mp4 on Safari, webm elsewhere). */
export function flyoverMime(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    { mime: 'video/mp4;codecs=h264', ext: 'mp4' },
    { mime: 'video/mp4', ext: 'mp4' },
    { mime: 'video/webm;codecs=vp9', ext: 'webm' },
    { mime: 'video/webm;codecs=vp8', ext: 'webm' },
    { mime: 'video/webm', ext: 'webm' }
  ];
  for (const c of candidates) {
    try { if (MediaRecorder.isTypeSupported(c.mime)) return c; } catch { /* try next */ }
  }
  return null;
}

/**
 * Record the flyover to a video Blob by animating frames onto an offscreen
 * canvas and capturing its stream. Resolves null if recording is unsupported.
 */
export function recordFlyoverVideo(
  activity: Activity,
  opts: { accent?: string; durationMs?: number; onProgress?: (p: number) => void } = {}
): Promise<{ blob: Blob; ext: string } | null> {
  return new Promise((resolve) => {
    const chosen = flyoverMime();
    if (!chosen || activity.route.length < 2) return resolve(null);

    const canvas = document.createElement('canvas');
    canvas.width = VID_W;
    canvas.height = VID_H;
    renderFlyoverFrame(canvas, activity, 0, opts.accent);

    const stream = canvas.captureStream(30);
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: chosen.mime, videoBitsPerSecond: 8_000_000 });
    } catch {
      return resolve(null);
    }
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve({ blob: new Blob(chunks, { type: chosen.mime }), ext: chosen.ext });
    };

    const duration = opts.durationMs ?? 9000;
    const hold = 900; // linger on the finished route at the end
    recorder.start();
    const t0 = performance.now();
    const tick = (now: number) => {
      const raw = (now - t0) / duration;
      const p = Math.min(1, raw);
      // ease-in-out for a smoother "drone" sweep
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      renderFlyoverFrame(canvas, activity, eased, opts.accent);
      opts.onProgress?.(p);
      if (now - t0 < duration + hold) {
        requestAnimationFrame(tick);
      } else {
        try { recorder.stop(); } catch { resolve(null); }
      }
    };
    requestAnimationFrame(tick);
  });
}

// ---- drawing helpers ---------------------------------------------------------

/** CSS object-fit: cover — scale to fill, center, crop overflow. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/** Rounded-rect path (roundRect() isn't in every TS lib / browser we target). */
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Letter-spaced text centered on cx (canvas has no reliable letterSpacing). */
function spacedText(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  let x = cx - total / 2;
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = prevAlign;
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, size: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = `700 ${size}px ${FONT}`;
  spacedText(ctx, text, cx, y, size * 0.22);
}

/**
 * Runner logomark (the Logo.tsx tile: orange rounded square, white ascending
 * route line + endpoint dot, 48-unit viewBox) plus the "RUNNER" wordmark,
 * drawn as one centered row. `cy` is the vertical center of the row.
 */
function drawLogoRow(ctx: CanvasRenderingContext2D, cx: number, cy: number, accent: string = BRAND) {
  const TILE = 78;
  const GAP = 26;
  const wordSize = 58;
  const wordSpacing = wordSize * 0.22;

  ctx.font = `900 ${wordSize}px ${FONT}`;
  const word = 'RUNNER';
  const wordW =
    [...word].reduce((a, c) => a + ctx.measureText(c).width, 0) + wordSpacing * (word.length - 1);
  const totalW = TILE + GAP + wordW;
  const left = cx - totalW / 2;
  const tileY = cy - TILE / 2;

  // tile
  ctx.fillStyle = accent;
  roundedRect(ctx, left, tileY, TILE, TILE, TILE * 0.25);
  ctx.fill();

  // route line + dot, scaled from the 48×48 Logo.tsx path
  const s = TILE / 48;
  const px = (v: number) => left + v * s;
  const py = (v: number) => tileY + v * s;
  ctx.beginPath();
  ctx.moveTo(px(12), py(33));
  ctx.lineTo(px(21), py(24));
  ctx.lineTo(px(27), py(30));
  ctx.lineTo(px(36), py(15));
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4.5 * s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(px(36), py(15), 3.4 * s, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // wordmark
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${wordSize}px ${FONT}`;
  spacedText(ctx, word, left + TILE + GAP + wordW / 2, cy + wordSize * 0.36, wordSpacing);
}
