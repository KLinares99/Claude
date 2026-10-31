// Generates RUNNER PWA icons (PNG) with no external deps — built-in zlib.
// Liquid Glass style: a blue "liquid" backdrop (gradient + soft cyan/violet
// glows), a frosted glass plate with a diagonal sheen and bright rim, and the
// white ascending route line + endpoint dot floating on the plate.
// Supersampled for clean edges. apple-touch-icon and the maskable icon are
// full-bleed squares (the OS applies its own corner mask).
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = new URL('../public/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function png(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// route path in normalized [0,1] coords (12,33 21,24 27,30 36,15 on a 48 grid)
const PATH = [
  [12 / 48, 33 / 48],
  [21 / 48, 24 / 48],
  [27 / 48, 30 / 48],
  [36 / 48, 15 / 48]
];
const DOT = PATH[PATH.length - 1];

const TOP = [96, 172, 255];     // light sky blue
const BOT = [29, 78, 216];      // #1D4ED8
const GLOWS = [
  { x: 0.12, y: 0.08, r: 0.62, c: [103, 232, 249], a: 0.6 },  // cyan
  { x: 0.98, y: 0.98, r: 0.70, c: [167, 139, 250], a: 0.55 }  // violet
];
const PLATE = { cx: 0.5, cy: 0.5, h: 0.31, r: 0.17 }; // half-size + corner radius

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/** Signed distance to a centered rounded square (negative inside). */
function sdRoundSquare(u, v, cx, cy, h, r) {
  const qx = Math.abs(u - cx) - (h - r);
  const qy = Math.abs(v - cy) - (h - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

const over = (dst, src, a) => [dst[0] + (src[0] - dst[0]) * a, dst[1] + (src[1] - dst[1]) * a, dst[2] + (src[2] - dst[2]) * a];
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

// mark sits on the plate, scaled down from the full-tile layout
const MARK_SCALE = 0.74;
const mark = (p) => [0.5 + (p[0] - 0.5) * MARK_SCALE, 0.5 + (p[1] - 0.5) * MARK_SCALE + 0.01];
const MPATH = PATH.map(mark);
const MDOT = mark(DOT);
const STROKE = (3.0 / 48) * MARK_SCALE;
const DOT_R = (4.4 / 48) * MARK_SCALE;

function markDist(u, v, dx = 0, dy = 0) {
  let d = Infinity;
  for (let s = 0; s < MPATH.length - 1; s++) {
    d = Math.min(d, distToSegment(u - dx, v - dy, MPATH[s][0], MPATH[s][1], MPATH[s + 1][0], MPATH[s + 1][1]));
  }
  return Math.min(d - STROKE, Math.hypot(u - dx - MDOT[0], v - dy - MDOT[1]) - DOT_R);
}

/** Color of the icon at normalized (u, v). */
function shade(u, v) {
  // liquid backdrop
  let c = over(TOP, BOT, smooth(0, 1, v * 0.85 + u * 0.15));
  for (const g of GLOWS) {
    const d = Math.hypot(u - g.x, v - g.y) / g.r;
    c = over(c, g.c, g.a * Math.pow(clamp01(1 - d), 1.6));
  }

  // plate shadow (soft, offset down)
  const sd = sdRoundSquare(u, v - 0.025, PLATE.cx, PLATE.cy, PLATE.h, PLATE.r);
  c = over(c, [10, 30, 90], 0.22 * (1 - smooth(-0.01, 0.06, sd)));

  // frosted glass plate
  const pd = sdRoundSquare(u, v, PLATE.cx, PLATE.cy, PLATE.h, PLATE.r);
  if (pd < 0.004) {
    const inside = 1 - smooth(-0.004, 0.004, pd);
    c = over(c, [255, 255, 255], 0.2 * inside);
    // diagonal sheen across the top-left
    const t = ((u - (PLATE.cx - PLATE.h)) + (v - (PLATE.cy - PLATE.h))) / (4 * PLATE.h);
    c = over(c, [255, 255, 255], 0.3 * clamp01(1 - t * 2.2) * inside);
    // rim: bright along the top, softer at the bottom
    const rimW = 0.012;
    const rim = 1 - smooth(0, rimW, Math.abs(pd + rimW * 0.6));
    const topness = clamp01(1 - (v - (PLATE.cy - PLATE.h)) / (2 * PLATE.h));
    c = over(c, [255, 255, 255], rim * (0.35 + 0.5 * topness));
  }

  // mark shadow, then the white mark
  const ms = markDist(u, v, 0, 0.012);
  c = over(c, [15, 40, 120], 0.25 * (1 - smooth(-0.004, 0.02, ms)));
  const md = markDist(u, v);
  c = over(c, [255, 255, 255], 1 - smooth(-0.002, 0.002, md));
  return c;
}

const SS = 3; // supersamples per axis

function render(size, rounded) {
  const buf = Buffer.alloc(size * size * 4);
  const outerR = 0.225;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, cover = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (x + (sx + 0.5) / SS) / size;
          const v = (y + (sy + 0.5) / SS) / size;
          if (rounded && sdRoundSquare(u, v, 0.5, 0.5, 0.5, outerR) > 0) continue;
          let c = shade(u, v);
          if (rounded) {
            // specular rim along the icon's own edge
            const ed = sdRoundSquare(u, v, 0.5, 0.5, 0.5, outerR);
            c = over(c, [255, 255, 255], (1 - smooth(-0.012, 0, ed)) * 0.35 * clamp01(1.2 - v * 1.4));
          }
          r += c[0]; g += c[1]; b += c[2]; cover++;
        }
      }
      const i = (y * size + x) * 4;
      if (cover) {
        buf[i] = Math.round(r / cover);
        buf[i + 1] = Math.round(g / cover);
        buf[i + 2] = Math.round(b / cover);
      }
      buf[i + 3] = Math.round((255 * cover) / (SS * SS));
    }
  }
  return png(size, size, buf);
}

const targets = [
  ['icon-192.png', 192, true],
  ['icon-512.png', 512, true],
  ['icon-maskable-512.png', 512, false],
  ['apple-touch-icon.png', 180, false]
];
for (const [name, size, rounded] of targets) {
  writeFileSync(new URL(name, OUT), render(size, rounded));
  console.log('wrote', name, size);
}
