// Generates "Two of Us" PWA icons (PNG) with no external deps — built-in zlib.
// Two overlapping hearts (sunny + rose) on a warm cream rounded tile.
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

// Palette
const CREAM = [255, 244, 236];   // tile background
const SUN = [255, 201, 60];      // back heart
const ROSE = [255, 93, 143];     // front heart

// Implicit heart curve, centered at (cx,cy) scaled by s. <= 0 means inside.
function heartInside(px, py, cx, cy, s) {
  const x = (px - cx) / s;
  const y = -(py - cy) / s; // flip so the lobes point up
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

function render(size) {
  const buf = Buffer.alloc(size * size * 4);
  const radius = size * 0.22;
  const back = { cx: size * 0.6, cy: size * 0.44, s: size * 0.2 };
  const front = { cx: size * 0.42, cy: size * 0.55, s: size * 0.26 };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // rounded-rect tile alpha
      let tileA = 255;
      const rx = Math.min(x, size - 1 - x);
      const ry = Math.min(y, size - 1 - y);
      if (rx < radius && ry < radius) {
        const dx = radius - rx, dy = radius - ry;
        if (dx * dx + dy * dy > radius * radius) tileA = 0;
      }

      const t = y / size;
      let r = Math.round(CREAM[0] - t * 6);
      let g = Math.round(CREAM[1] - t * 10);
      let b = Math.round(CREAM[2] - t * 14);

      if (heartInside(x, y, back.cx, back.cy, back.s)) { r = SUN[0]; g = SUN[1]; b = SUN[2]; }
      if (heartInside(x, y, front.cx, front.cy, front.s)) { r = ROSE[0]; g = ROSE[1]; b = ROSE[2]; }

      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = tileA;
    }
  }
  return png(size, size, buf);
}

const targets = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
];
for (const [name, size] of targets) {
  writeFileSync(new URL(name, OUT), render(size));
  console.log('wrote', name, size);
}
