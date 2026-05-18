import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Minimal valid PNG (512×512, dark fill). Replace public/logo.png with your Skinlar Bozori SB asset.
 * PNG structure: IHDR + IDAT(zlib) + IEND — generated without deps.
 */
import zlib from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const W = 512;
const H = 512;

function crc32(buf) {
  let c = ~0 >>> 0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 2;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const raw = Buffer.alloc((W * 3 + 1) * H);
let o = 0;
for (let y = 0; y < H; y++) {
  raw[o++] = 0;
  for (let x = 0; x < W; x++) {
    const cx = x - W / 2;
    const cy = y - H / 2;
    const r = Math.sqrt(cx * cx + cy * cy);
    const edge = Math.abs(r - 220) < 6 ? 168 : 10;
    const g = edge === 168 ? 85 : 5;
    const b = edge === 168 ? 247 : 12;
    raw[o++] = edge;
    raw[o++] = g;
    raw[o++] = b;
  }
}

const idat = zlib.deflateSync(raw, { level: 9 });
const out = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

const dir = path.join(__dirname, '..', 'public');
fs.mkdirSync(dir, { recursive: true });
const dest = path.join(dir, 'logo.png');
fs.writeFileSync(dest, out);
console.log('Wrote', dest, out.length, 'bytes');
