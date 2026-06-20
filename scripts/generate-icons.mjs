// Generates INVINCIBLE PWA icons (PNG) with no external deps — built-in zlib.
// A bold serif "I" lettermark in the iconic Invincible blue + yellow.
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

function lerp(a, b, t) { return a + (b - a) * t; }
function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]; }

// Iconic Invincible costume colors
const BLUE_TOP = [42, 95, 192];    // brighter suit blue
const BLUE_BOT = [16, 38, 96];     // deep navy
const YELLOW_TOP = [255, 224, 56]; // #ffe038
const YELLOW_BOT = [245, 184, 0];  // #f5b800

// Bold serif "I": stem + top/bottom serif bars.
function isLetterI(nx, ny) {
  // nx, ny in [0,1]
  const inStem = nx >= 0.405 && nx <= 0.595 && ny >= 0.24 && ny <= 0.76;
  const inTop = nx >= 0.28 && nx <= 0.72 && ny >= 0.22 && ny <= 0.325;
  const inBot = nx >= 0.28 && nx <= 0.72 && ny >= 0.675 && ny <= 0.78;
  return inStem || inTop || inBot;
}

function render(size) {
  const buf = Buffer.alloc(size * size * 4);
  const radius = size * 0.22;
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
      const t = y / size;
      let [r, g, b] = mix(BLUE_TOP, BLUE_BOT, t);
      const nx = x / size;
      const ny = y / size;
      if (isLetterI(nx, ny)) {
        [r, g, b] = mix(YELLOW_TOP, YELLOW_BOT, ny);
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
