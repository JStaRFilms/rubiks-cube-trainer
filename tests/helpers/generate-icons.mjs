import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
function chunk(type, bytes) {
  const data = Buffer.concat([Buffer.from(type), bytes]);
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  const length = Buffer.alloc(4); length.writeUInt32BE(bytes.length);
  const sum = Buffer.alloc(4); sum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, data, sum]);
}
for (const [file, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  const header = Buffer.alloc(13); header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2;
  const pixels = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const cx = x / size * 192, cy = y / size * 192;
    const tile = cx >= 32 && cx < 160 && cy >= 32 && cy < 160 && (cx - 32) % 46 < 36 && (cy - 32) % 46 < 36;
    const rgb = tile ? [166, 201, 255] : [24, 33, 45];
    const offset = y * (1 + size * 3) + 1 + x * 3;
    pixels.set(rgb, offset);
  }
  writeFileSync(`public/${file}`, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]));
}
