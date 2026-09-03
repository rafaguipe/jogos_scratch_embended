#!/usr/bin/env node
/**
 * make_demo_game.mjs — generates the demo lesson's Scratch 3 projects.
 *
 * The demo is a walking cat: green flag -> forever -> move N steps ->
 * next costume -> wait -> bounce on edge. The student's mission is to
 * make the cat walk twice as fast (change `move 10` to `move 20`).
 *
 * Zero dependencies on purpose: this script contains a minimal PNG
 * encoder and a minimal ZIP writer (STORE, no compression) so the
 * repository stays dependency-free and the build works offline.
 *
 * Usage:
 *   npm run make:demo-game
 *
 * Output (deterministic — same bytes every run):
 *   lessons/lesson1/game.sb3      starting project (10 steps per tick)
 *   lessons/lesson1/solution.sb3  reference solution (20 steps per tick)
 */
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LESSON_DIR = join(ROOT, 'lessons', 'lesson1');

// ---------------------------------------------------------------------------
// CRC32 (needed by both PNG and ZIP)
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------------------
// Minimal PNG encoder (8-bit RGBA, no filters)
// ---------------------------------------------------------------------------

function pngChunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4, 8), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Pixel drawing helpers
// ---------------------------------------------------------------------------

function makeCanvas(width, height) {
  return { width, height, data: new Uint8Array(width * height * 4) };
}

function setPixel(canvas, x, y, [r, g, b, a = 255]) {
  const { width, height, data } = canvas;
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = (y * width + x) * 4;
  data[i] = r;
  data[i + 1] = g;
  data[i + 2] = b;
  data[i + 3] = a;
}

function fillCircle(canvas, cx, cy, radius, color) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) setPixel(canvas, x, y, color);
    }
  }
}

function fillEllipse(canvas, cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) setPixel(canvas, x, y, color);
    }
  }
}

function fillRect(canvas, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPixel(canvas, xx, yy, color);
  }
}

function fillTriangle(canvas, ax, ay, bx, by, cx, cy, color) {
  const sign = (p1x, p1y, p2x, p2y, p3x, p3y) =>
    (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
  const minX = Math.floor(Math.min(ax, bx, cx));
  const maxX = Math.ceil(Math.max(ax, bx, cx));
  const minY = Math.floor(Math.min(ay, by, cy));
  const maxY = Math.ceil(Math.max(ay, by, cy));
  const s1 = sign(ax, ay, bx, by, cx, cy);
  const s2 = sign(bx, by, cx, cy, ax, ay);
  const s3 = sign(cx, cy, ax, ay, bx, by);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const t1 = sign(ax, ay, bx, by, x, y);
      const t2 = sign(bx, by, cx, cy, x, y);
      const t3 = sign(cx, cy, ax, ay, x, y);
      const hasNeg = t1 < 0 || t2 < 0 || t3 < 0;
      const hasPos = t1 > 0 || t2 > 0 || t3 > 0;
      if (!(hasNeg && hasPos)) setPixel(canvas, x, y, color);
    }
  }
}

// ---------------------------------------------------------------------------
// Cat sprite (48x48, side view, walking right)
// ---------------------------------------------------------------------------

const ORANGE = [242, 163, 60]; // #F2A33C
const ORANGE_DARK = [217, 130, 43]; // #D9822B
const CREAM = [255, 224, 178]; // #FFE0B2
const BLACK = [26, 26, 26];
const WHITE = [255, 255, 255];

function drawCat(pose) {
  const c = makeCanvas(48, 48);

  // Tail (raised in walking pose).
  if (pose === 'walk-b') {
    fillEllipse(c, 5, 17, 3, 6, ORANGE_DARK);
  } else {
    fillEllipse(c, 6, 25, 3, 5, ORANGE_DARK);
  }

  // Body.
  fillEllipse(c, 22, 26, 12, 9, ORANGE);
  fillEllipse(c, 20, 29, 7, 4.5, CREAM); // belly

  // Head.
  fillCircle(c, 36, 15, 8, ORANGE);

  // Ears.
  fillTriangle(c, 30, 10, 34, 2, 38, 10, ORANGE_DARK);
  fillTriangle(c, 35, 10, 39, 2, 42, 9, ORANGE_DARK);

  // Eye + glint.
  fillCircle(c, 39, 13, 1.9, BLACK);
  fillCircle(c, 39.6, 12.3, 0.6, WHITE);

  // Nose.
  fillCircle(c, 42, 16.5, 1, ORANGE_DARK);

  // Whiskers.
  for (const wy of [15.5, 17.5]) {
    fillRect(c, 42, wy, 5, 1, ORANGE_DARK);
  }

  // Legs (stride in walking pose: front forward, back backward).
  if (pose === 'walk-b') {
    fillRect(c, 31, 31, 4, 9, ORANGE_DARK); // front leg forward
    fillRect(c, 12, 31, 4, 9, ORANGE_DARK); // back leg backward
  } else {
    fillRect(c, 16, 31, 4, 9, ORANGE_DARK);
    fillRect(c, 25, 31, 4, 9, ORANGE_DARK);
  }

  // Paws.
  fillRect(c, 31, 38, 4, 2, BLACK);
  fillRect(c, 12, 38, 4, 2, BLACK);

  return Buffer.from(c.data);
}

// ---------------------------------------------------------------------------
// Stage backdrop (SVG — text, trivial to generate)
// ---------------------------------------------------------------------------

function drawBackdrop() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
  <rect width="480" height="360" fill="#8ecae6"/>
  <circle cx="416" cy="64" r="34" fill="#ffb703"/>
  <ellipse cx="120" cy="80" rx="52" ry="18" fill="#ffffff" opacity="0.9"/>
  <ellipse cx="150" cy="74" rx="30" ry="13" fill="#ffffff" opacity="0.9"/>
  <ellipse cx="300" cy="110" rx="44" ry="15" fill="#ffffff" opacity="0.8"/>
  <rect y="288" width="480" height="72" fill="#74c69d"/>
  <ellipse cx="60" cy="292" rx="52" ry="16" fill="#52b788"/>
  <ellipse cx="240" cy="296" rx="64" ry="18" fill="#52b788"/>
  <ellipse cx="420" cy="292" rx="48" ry="15" fill="#52b788"/>
</svg>
`;
}

// ---------------------------------------------------------------------------
// Scratch 3 project (project.json)
// ---------------------------------------------------------------------------

function buildProject(moveSteps, waitSeconds) {
  const catA = drawCat('walk-a');
  const catB = drawCat('walk-b');
  const backdrop = Buffer.from(drawBackdrop(), 'utf8');

  const idA = createHash('md5').update(catA).digest('hex');
  const idB = createHash('md5').update(catB).digest('hex');
  const idBackdrop = createHash('md5').update(backdrop).digest('hex');

  // Script: when flag clicked -> forever [ move N steps, next costume, wait ]
  const blocks = {
    flag: {
      opcode: 'event_whenflagclicked',
      next: 'loop',
      parent: null,
      inputs: {},
      fields: {},
      shadow: false,
      topLevel: true,
      x: 40,
      y: 30,
    },
    loop: {
      opcode: 'control_forever',
      next: null,
      parent: 'flag',
      inputs: { SUBSTACK: [2, 'move'] },
      fields: {},
      shadow: false,
      topLevel: false,
    },
    move: {
      opcode: 'motion_movesteps',
      next: 'nextCostume',
      parent: 'loop',
      inputs: {},
      fields: { STEPS: [moveSteps, null] },
      shadow: false,
      topLevel: false,
    },
    nextCostume: {
      opcode: 'looks_nextcostume',
      next: 'wait',
      parent: 'move',
      inputs: {},
      fields: {},
      shadow: false,
      topLevel: false,
    },
    wait: {
      opcode: 'control_wait',
      next: 'edge',
      parent: 'nextCostume',
      inputs: { DURATION: [1, 'duration'] },
      fields: {},
      shadow: false,
      topLevel: false,
    },
    duration: {
      opcode: 'math_number',
      next: null,
      parent: 'wait',
      inputs: {},
      fields: { NUM: [waitSeconds, null] },
      shadow: true,
      topLevel: false,
    },
    edge: {
      opcode: 'motion_ifonedgebounce',
      next: null,
      parent: 'wait',
      inputs: {},
      fields: {},
      shadow: false,
      topLevel: false,
    },
  };

  return {
    project: {
      targets: [
        {
          isStage: true,
          name: 'Stage',
          variables: {},
          lists: {},
          broadcasts: {},
          blocks: {},
          comments: {},
          currentCostume: 0,
          costumes: [
            {
              assetId: idBackdrop,
              name: 'backdrop1',
              md5ext: `${idBackdrop}.svg`,
              dataFormat: 'svg',
              rotationCenterX: 240,
              rotationCenterY: 180,
            },
          ],
          sounds: [],
          volume: 100,
          layerOrder: 0,
          tempo: 60,
          videoTransparency: 50,
          videoState: 'on',
          textToSpeechLanguage: null,
        },
        {
          isStage: false,
          name: 'Cat',
          variables: {},
          lists: {},
          broadcasts: {},
          blocks,
          comments: {},
          currentCostume: 0,
          costumes: [
            {
              assetId: idA,
              name: 'cat-a',
              md5ext: `${idA}.png`,
              dataFormat: 'png',
              rotationCenterX: 24,
              rotationCenterY: 24,
            },
            {
              assetId: idB,
              name: 'cat-b',
              md5ext: `${idB}.png`,
              dataFormat: 'png',
              rotationCenterX: 24,
              rotationCenterY: 24,
            },
          ],
          sounds: [],
          volume: 100,
          layerOrder: 1,
          visible: true,
          x: -150,
          y: -40,
          size: 100,
          direction: 90,
          draggable: false,
          rotationStyle: 'left-right',
        },
      ],
      monitors: [],
      extensions: [],
      meta: { semver: '3.0.0', vm: '0.2.0', agent: 'scratch-academy make_demo_game' },
    },
    assets: [
      { name: `${idA}.png`, data: catA },
      { name: `${idB}.png`, data: catB },
      { name: `${idBackdrop}.svg`, data: backdrop },
    ],
  };
}

// ---------------------------------------------------------------------------
// Minimal ZIP writer (STORE method)
// ---------------------------------------------------------------------------

function zipStore(entries) {
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate =
    ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // local file header signature
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // flags: UTF-8 names
    local.writeUInt16LE(0, 8); // method: stored
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28); // extra length
    localChunks.push(local, nameBuf, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); // central directory signature
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10); // method: stored
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30); // extra length
    central.writeUInt16LE(0, 32); // comment length
    central.writeUInt16LE(0, 34); // disk number
    central.writeUInt16LE(0, 36); // internal attributes
    central.writeUInt32LE(0, 38); // external attributes
    central.writeUInt32LE(offset, 42); // local header offset
    centralChunks.push(central, nameBuf);

    offset += 30 + nameBuf.length + data.length;
  }

  const centralSize = centralChunks.reduce((sum, b) => sum + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, ...centralChunks, eocd]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function writeSb3(fileName, moveSteps, waitSeconds) {
  const { project, assets } = buildProject(moveSteps, waitSeconds);
  const entries = [
    { name: 'project.json', data: Buffer.from(JSON.stringify(project, null, 2), 'utf8') },
    ...assets.map((asset) => ({ name: asset.name, data: asset.data })),
  ];
  const sb3 = zipStore(entries);
  const outPath = join(LESSON_DIR, fileName);
  mkdirSync(LESSON_DIR, { recursive: true });
  writeFileSync(outPath, sb3);
  return { outPath, size: sb3.length, entries: entries.map((e) => e.name) };
}

function main() {
  const game = writeSb3('game.sb3', 10, 0.1);
  const solution = writeSb3('solution.sb3', 20, 0.1);

  console.log('Scratch Academy — demo game generator');
  console.log('-------------------------------------');
  console.log(`game.sb3     (${game.size} bytes): ${game.entries.join(', ')}`);
  console.log(`solution.sb3 (${solution.size} bytes): ${solution.entries.join(', ')}`);
  console.log('Missão 1: fazer o gato andar 2x mais rápido = "mova 10 passos" -> 20.');
}

main();
