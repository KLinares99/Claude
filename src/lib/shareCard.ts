/**
 * Shareable-image rendering — pure canvas, no React.
 *
 * Two exports, both drawing onto a caller-supplied <canvas>:
 *  - renderTransparentRoute: the route outline alone on a transparent PNG
 *    (Strava's "transparent log" export), for pasting onto photos.
 *  - renderStoryCard: a 1080×1920 Instagram-Story-style stats card.
 *
 * Look: Liquid Glassmorphism — a colorful "liquid" mesh (or the user's photo)
 * with frosted glass panels on top. A panel is a blurred copy of what's
 * beneath it (ctx.filter), a light tint, a diagonal sheen and a bright rim.
 * Where ctx.filter is unsupported the panel is just the tint + sheen + rim.
 */
import type { LatLng } from './run';
import { fmtClock, paceFor } from './run';
import type { Activity } from './storage';

export const BRAND = '#2563EB';

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

export type GradientId = 'blue' | 'ink' | 'sunrise' | 'forest';

/** Base diagonal of each liquid theme — also used by the UI for the swatches. */
export const GRADIENTS: Record<GradientId, [string, string]> = {
  blue: ['#3B82F6', '#1E1B4B'],
  ink: ['#2B2E36', '#0B0C10'],
  sunrise: ['#FF8A4C', '#B0185E'],
  forest: ['#10B981', '#0B2A22']
};

/** Soft color blobs layered over each base — the "liquid" the glass refracts. */
const BLOBS: Record<GradientId, string[]> = {
  blue: ['rgba(96,165,250,0.95)', 'rgba(167,139,250,0.8)', 'rgba(34,211,238,0.65)'],
  ink: ['rgba(37,99,235,0.6)', 'rgba(139,92,246,0.45)', 'rgba(56,189,248,0.4)'],
  sunrise: ['rgba(255,200,80,0.9)', 'rgba(255,94,135,0.75)', 'rgba(255,122,69,0.75)'],
  forest: ['rgba(52,211,153,0.85)', 'rgba(34,211,238,0.55)', 'rgba(190,242,100,0.5)']
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

/** 1080×1920 Instagram-Story-style share card: liquid backdrop + glass panels. */
export function renderStoryCard(canvas: HTMLCanvasElement, activity: Activity, opts: StoryCardOptions) {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, CARD_W, CARD_H);

  // backdrop — painted on its own canvas so glass panels can blur it
  const back = document.createElement('canvas');
  back.width = CARD_W;
  back.height = CARD_H;
  const bctx = back.getContext('2d');
  if (!bctx) return;
  if (opts.background.type === 'gradient') {
    drawLiquidBackground(bctx, CARD_W, CARD_H, opts.background.id);
  } else {
    drawCover(bctx, opts.background.image, CARD_W, CARD_H);
    // light scrim so white text survives bright photos (the glass does the rest)
    const g = bctx.createLinearGradient(0, 0, 0, CARD_H);
    g.addColorStop(0, 'rgba(0,0,0,0.35)');
    g.addColorStop(0.5, 'rgba(0,0,0,0.10)');
    g.addColorStop(1, 'rgba(0,0,0,0.40)');
    bctx.fillStyle = g;
    bctx.fillRect(0, 0, CARD_W, CARD_H);
  }
  ctx.drawImage(back, 0, 0);

  const hasRoute = activity.route.length > 1;
  const cx = CARD_W / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  drawLogoRow(ctx, cx, hasRoute ? 200 : 360, opts.accent ?? BRAND);

  // stats panel
  const px = 80, pw = CARD_W - 160, ph = 760;
  const py = hasRoute ? 320 : 520;
  drawGlassPanel(ctx, back, px, py, pw, ph, 64);

  let y = py + 290;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 230px ${FONT}`;
  ctx.fillText(activity.miles.toFixed(2), cx, y);
  y += 72;
  drawLabel(ctx, 'Miles', cx, y, 40);

  y += 150;
  const colL = CARD_W * 0.3;
  const colR = CARD_W * 0.7;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 84px ${FONT}`;
  ctx.fillText(`${paceFor(activity.seconds, activity.miles)}/mi`, colL, y);
  ctx.fillText(fmtClock(activity.seconds), colR, y);
  y += 58;
  drawLabel(ctx, 'Pace', colL, y, 32);
  drawLabel(ctx, 'Moving time', colR, y, 32);

  // hairline + activity name
  y += 50;
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(px + 70, y, pw - 140, 2);
  y += 86;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = `600 50px ${FONT}`;
  ctx.fillText(activity.name, cx, y);

  // route panel (skipped entirely for manual entries)
  if (hasRoute) {
    const ry = py + ph + 40;
    const rh = CARD_H - 190 - ry;
    drawGlassPanel(ctx, back, px, ry, pw, rh, 64);
    const pts = projectRoute(activity.route, px + 90, ry + 80, pw - 180, rh - 160);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 20;
    strokeRoute(ctx, pts, opts.routeColor ?? '#FFFFFF', 12);
    ctx.restore();
  }

  // date line
  const d = new Date(activity.date);
  const dateStr =
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = `600 36px ${FONT}`;
  ctx.fillText(dateStr, cx, CARD_H - 96);
}

// ---- flyover video ----------------------------------------------------------

const VID_W = 1080;
const VID_H = 1920;

/** Draw one frame of the "drone flyover": the route drawing in up to `progress`
 *  (0–1) with a moving head dot, over live distance/time/pace readouts.
 *  `transparent` clears the background and draws the route alone (for an
 *  overlay-friendly export), matching the transparent-route PNG aesthetic. */
export function renderFlyoverFrame(
  canvas: HTMLCanvasElement, activity: Activity, progress: number,
  accent: string = BRAND, transparent = false
) {
  if (canvas.width !== VID_W) canvas.width = VID_W;
  if (canvas.height !== VID_H) canvas.height = VID_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const p = Math.max(0, Math.min(1, progress));

  const cx = VID_W / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (transparent) {
    ctx.clearRect(0, 0, VID_W, VID_H);
  } else {
    // static layer (liquid backdrop, logo, glass panels) is built once per
    // activity and reused for every frame — blurring is too costly per frame
    ctx.drawImage(flyoverStatic(activity, accent), 0, 0);
  }

  // route band — centered & taller when transparent (no stat block below)
  const bandY = transparent ? 260 : FLY_ROUTE.y + 70;
  const bandH = transparent ? 1400 : FLY_ROUTE.h - 140;
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

  // transparent mode is route-only (overlay-friendly) — no stat block
  if (transparent) return;

  // live readouts
  const miles = activity.miles * p;
  const secs = Math.round(activity.seconds * p);
  let y = FLY_STATS.y + 230;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 200px ${FONT}`;
  ctx.fillText(miles.toFixed(2), cx, y);
  y += 66;
  drawLabel(ctx, 'Miles', cx, y, 36);

  y += 130;
  const colL = VID_W * 0.3;
  const colR = VID_W * 0.7;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 76px ${FONT}`;
  ctx.fillText(fmtClock(secs), colL, y);
  ctx.fillText(`${paceFor(secs, miles)}/mi`, colR, y);
  y += 54;
  drawLabel(ctx, 'Time', colL, y, 30);
  drawLabel(ctx, 'Pace', colR, y, 30);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `600 46px ${FONT}`;
  ctx.fillText(activity.name, cx, VID_H - 90);
}

// glass panel slots on the 1080×1920 flyover frame
const FLY_ROUTE = { x: 70, y: 320, w: VID_W - 140, h: 900 };
const FLY_STATS = { x: 70, y: 1260, w: VID_W - 140, h: 500 };

let flyCache: { key: string; canvas: HTMLCanvasElement } | null = null;

/** Liquid backdrop + logo + empty glass panels for the flyover, cached. */
function flyoverStatic(activity: Activity, accent: string): HTMLCanvasElement {
  const key = `${activity.id}|${accent}`;
  if (flyCache?.key === key) return flyCache.canvas;
  const back = document.createElement('canvas');
  back.width = VID_W;
  back.height = VID_H;
  const bctx = back.getContext('2d')!;
  drawLiquidBackground(bctx, VID_W, VID_H, 'ink');
  const out = document.createElement('canvas');
  out.width = VID_W;
  out.height = VID_H;
  const octx = out.getContext('2d')!;
  octx.drawImage(back, 0, 0);
  octx.textAlign = 'center';
  octx.textBaseline = 'alphabetic';
  drawLogoRow(octx, VID_W / 2, 200, accent);
  drawGlassPanel(octx, back, FLY_ROUTE.x, FLY_ROUTE.y, FLY_ROUTE.w, FLY_ROUTE.h, 64, true);
  drawGlassPanel(octx, back, FLY_STATS.x, FLY_STATS.y, FLY_STATS.w, FLY_STATS.h, 64, true);
  flyCache = { key, canvas: out };
  return out;
}

/**
 * Best supported recording MIME. `transparent` needs a codec with an alpha
 * channel — only WebM (VP8/VP9) qualifies (MP4/H.264 has no alpha), so Safari
 * (WebM-less) returns null there. Opaque prefers MP4 (best mobile support).
 */
export function flyoverMime(transparent = false): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = transparent
    ? [
        { mime: 'video/webm;codecs=vp9', ext: 'webm' },
        { mime: 'video/webm;codecs=vp8', ext: 'webm' },
        { mime: 'video/webm', ext: 'webm' }
      ]
    : [
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
  opts: { accent?: string; durationMs?: number; transparent?: boolean; onProgress?: (p: number) => void } = {}
): Promise<{ blob: Blob; ext: string } | null> {
  return new Promise((resolve) => {
    const transparent = !!opts.transparent;
    const chosen = flyoverMime(transparent);
    if (!chosen || activity.route.length < 2) return resolve(null);

    const canvas = document.createElement('canvas');
    canvas.width = VID_W;
    canvas.height = VID_H;
    // alpha:true (default) is required for a transparent recording
    renderFlyoverFrame(canvas, activity, 0, opts.accent, transparent);

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
      renderFlyoverFrame(canvas, activity, eased, opts.accent, transparent);
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

function drawLabel(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, size: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.font = `600 ${size}px ${FONT}`;
  ctx.fillText(text, cx, y);
}

/** Base diagonal + three big soft color blobs — the liquid behind the glass. */
function drawLiquidBackground(ctx: CanvasRenderingContext2D, w: number, h: number, id: GradientId) {
  const [a, b] = GRADIENTS[id];
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const spots: Array<[number, number, number]> = [[0.12, 0.14, 0.62], [0.95, 0.5, 0.55], [0.25, 0.92, 0.6]];
  const big = Math.max(w, h);
  BLOBS[id].forEach((color, i) => {
    const [fx, fy, fr] = spots[i];
    const x = fx * w, y = fy * h, r = fr * big;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, color);
    rg.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  });
}

/**
 * Frosted Liquid Glass panel: soft drop shadow, a blurred copy of `source`
 * (what's behind) clipped to the rounded rect, a light tint, a diagonal
 * sheen, then a rim that's bright on top and fades toward the bottom.
 */
function drawGlassPanel(
  ctx: CanvasRenderingContext2D, source: HTMLCanvasElement,
  x: number, y: number, w: number, h: number, r: number, dark = false
) {
  // lift shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRect(ctx, x, y, w, h, r);
  ctx.clip();
  if ('filter' in ctx) {
    ctx.filter = 'blur(40px) saturate(160%)';
    ctx.drawImage(source, 0, 0);
    ctx.filter = 'none';
  }
  ctx.fillStyle = dark ? 'rgba(20,24,40,0.30)' : 'rgba(255,255,255,0.16)';
  ctx.fillRect(x, y, w, h);
  const sheen = ctx.createLinearGradient(x, y, x + w * 0.7, y + h * 0.7);
  sheen.addColorStop(0, `rgba(255,255,255,${dark ? 0.14 : 0.26})`);
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  // rim: bright top edge fading down
  ctx.save();
  roundedRect(ctx, x + 1.5, y + 1.5, w - 3, h - 3, r - 1.5);
  const rim = ctx.createLinearGradient(0, y, 0, y + h);
  rim.addColorStop(0, `rgba(255,255,255,${dark ? 0.5 : 0.75})`);
  rim.addColorStop(0.35, 'rgba(255,255,255,0.18)');
  rim.addColorStop(1, 'rgba(255,255,255,0.32)');
  ctx.strokeStyle = rim;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

/**
 * Runner logomark as a glass app-icon tile (accent gradient, sheen, rim,
 * white ascending route line + endpoint dot on a 48-unit grid) plus the
 * "Runner" wordmark, drawn as one centered row. `cy` is the row's center.
 */
function drawLogoRow(ctx: CanvasRenderingContext2D, cx: number, cy: number, accent: string = BRAND) {
  const TILE = 84;
  const GAP = 24;
  const wordSize = 60;

  ctx.font = `700 ${wordSize}px ${FONT}`;
  const word = 'Runner';
  const wordW = ctx.measureText(word).width;
  const totalW = TILE + GAP + wordW;
  const left = cx - totalW / 2;
  const tileY = cy - TILE / 2;
  const R = TILE * 0.27;

  // tile: accent gradient with a glass sheen and rim
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  roundedRect(ctx, left, tileY, TILE, TILE, R);
  const tg = ctx.createLinearGradient(left, tileY, left, tileY + TILE);
  tg.addColorStop(0, '#60A5FA');
  tg.addColorStop(1, accent);
  ctx.fillStyle = tg;
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundedRect(ctx, left, tileY, TILE, TILE, R);
  ctx.clip();
  const sh = ctx.createLinearGradient(left, tileY, left + TILE * 0.8, tileY + TILE * 0.8);
  sh.addColorStop(0, 'rgba(255,255,255,0.45)');
  sh.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(left, tileY, TILE, TILE);
  ctx.restore();
  ctx.save();
  roundedRect(ctx, left + 1, tileY + 1, TILE - 2, TILE - 2, R - 1);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // route line + dot, scaled from the 48×48 app-icon path
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
  ctx.font = `700 ${wordSize}px ${FONT}`;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  ctx.fillText(word, left + TILE + GAP, cy + wordSize * 0.35);
  ctx.textAlign = prev;
}
