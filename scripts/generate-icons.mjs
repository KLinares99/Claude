// Generates FORGE PWA icons (PNG) with no external deps — built-in zlib only.
// A flame mark (orange + teal core) on a dark gradient rounded background.
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
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function lerp(a, b, t) { return a + (b - a) * t; }
function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]; }

const BG_TOP = [17, 30, 36];     // #111e24
const BG_BOT = [11, 20, 24];     // #0b1418
const ORANGE = [232, 161, 75];   // #e8a14b
const GOLD = [242, 196, 106];    // #f2c46a
const TEAL = [55, 182, 196];     // #37b6c4

// flame membership: returns 0 (outside), 1 (outer flame), 2 (inner core)
function flame(nx, ny) {
  // nx,ny in [-1,1], ny up. Teardrop = bottom circle + tapering top.
  function inside(scale, yOffset) {
    const cy = -0.12 + yOffset;
    const r = 0.46 * scale;
    const top = 0.86 * scale + yOffset;
    const x = nx / 1; const y = ny;
    if (y <= cy) return x * x + (y - cy) * (y - cy) <= r * r;
    const hw = r * Math.max(0, 1 - (y - cy) / (top - cy));
    // a little asymmetric flicker for a flame feel
    const wobble = 0.04 * Math.sin((y + 1) * 6);
    return y <= top && Math.abs(x - wobble) <= hw;
  }
  if (inside(0.55, -0.05)) return 2;
  if (inside(1, 0)) return 1;
  return 0;
}

function render(size) {
  const buf = Buffer.alloc(size * size * 4);
  const radius = size * 0.22; // rounded corners
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // rounded-rect alpha
      let a = 255;
      const rx = Math.min(x, size - 1 - x);
      const ry = Math.min(y, size - 1 - y);
      if (rx < radius && ry < radius) {
        const dx = radius - rx, dy = radius - ry;
        if (dx * dx + dy * dy > radius * radius) a = 0;
      }
      // background gradient
      const t = y / size;
      let [r, g, b] = mix(BG_TOP, BG_BOT, t);
      // flame coords centered
      const nx = (x / size - 0.5) * 2;
      const ny = (0.5 - y / size) * 2;
      const f = flame(nx, ny);
      if (f === 1) {
        // outer flame: orange->gold vertical
        const ft = (ny + 0.6) / 1.5;
        [r, g, b] = mix(ORANGE, GOLD, Math.max(0, Math.min(1, ft)));
      } else if (f === 2) {
        [r, g, b] = TEAL;
      }
      buf[i] = Math.round(r); buf[i + 1] = Math.round(g); buf[i + 2] = Math.round(b); buf[i + 3] = a;
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
