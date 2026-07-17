// Generates RUNNER PWA icons (PNG) with no external deps — built-in zlib.
// Brand-green rounded tile with a white ascending route line + endpoint dot,
// matching src/components/Logo.tsx.
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

const BRAND = [22, 163, 74]; // #16A34A (green — app default)
const WHITE = [255, 255, 255];

// route path in normalized [0,1] coords (matches Logo.tsx: 12,33 21,24 27,30 36,15 / 48)
const PATH = [
  [12 / 48, 33 / 48],
  [21 / 48, 24 / 48],
  [27 / 48, 30 / 48],
  [36 / 48, 15 / 48]
];
const DOT = PATH[PATH.length - 1];

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function render(size) {
  const buf = Buffer.alloc(size * size * 4);
  const radius = size * 0.24;
  const strokeR = size * (2.25 / 48); // half of the 4.5 stroke width
  const dotR = size * (3.4 / 48);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // rounded-rect alpha
      let a = 255;
      const rx = Math.min(x, size - 1 - x);
      const ry = Math.min(y, size - 1 - y);
      if (rx < radius && ry < radius) {
        const dx = radius - rx, dy = radius - ry;
        const d = Math.sqrt(dx * dx + dy * dy) - radius;
        a = d <= -0.8 ? 255 : d >= 0.8 ? 0 : Math.round(255 * (0.5 - d / 1.6));
      }

      // white mark: min distance to any path segment (round caps/joins for free)
      let dist = Infinity;
      for (let s = 0; s < PATH.length - 1; s++) {
        dist = Math.min(dist, distToSegment(
          x + 0.5, y + 0.5,
          PATH[s][0] * size, PATH[s][1] * size,
          PATH[s + 1][0] * size, PATH[s + 1][1] * size
        ));
      }
      const dDot = Math.hypot(x + 0.5 - DOT[0] * size, y + 0.5 - DOT[1] * size);
      const edge = Math.min(dist - strokeR, dDot - dotR);
      // anti-aliased blend of white mark over orange
      const t = edge <= -0.8 ? 1 : edge >= 0.8 ? 0 : 0.5 - edge / 1.6;

      buf[i] = Math.round(BRAND[0] + (WHITE[0] - BRAND[0]) * t);
      buf[i + 1] = Math.round(BRAND[1] + (WHITE[1] - BRAND[1]) * t);
      buf[i + 2] = Math.round(BRAND[2] + (WHITE[2] - BRAND[2]) * t);
      buf[i + 3] = a;
    }
  }
  return png(size, size, buf);
}

const targets = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180]
];
for (const [name, size] of targets) {
  writeFileSync(new URL(name, OUT), render(size));
  console.log('wrote', name, size);
}
