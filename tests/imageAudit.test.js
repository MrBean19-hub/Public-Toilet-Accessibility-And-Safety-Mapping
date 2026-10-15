import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzePixels, evaluatePhoto, hamming, estimateCleanliness } from '../src/lib/imageAudit.js';

const SIZE = 64;

/** Build a synthetic RGBA image from a per-pixel colour function. */
function makeImage(colorAt) {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b] = colorAt(x, y);
      const i = (y * SIZE + x) * 4;
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
    }
  }
  return analyzePixels(data, SIZE, SIZE);
}

// Light tiles with dark grout lines: looks like a clean tiled wall.
const cleanTiles = (x, y) => (x % 8 === 0 || y % 8 === 0 ? [120, 125, 130] : [235, 238, 240]);
// Same layout but half the surface covered in brown-yellow stains.
const stainedTiles = (x, y) => (x % 8 === 0 || y % 8 === 0 ? [90, 80, 70] : x < SIZE / 2 ? [150, 100, 40] : [235, 238, 240]);

test('a sharp, well-lit tiled photo passes the quality gate and is verified', () => {
  const m = makeImage(cleanTiles);
  const result = evaluatePhoto(m, { claimedRating: 5 });
  assert.equal(result.status, 'verified');
  assert.ok(result.cleanliness >= 70);
});

test('dark, blank and blurry photos must be retaken', () => {
  assert.deepEqual(evaluatePhoto(makeImage(() => [5, 5, 5])).reasons[0], 'too_dark');
  assert.equal(evaluatePhoto(makeImage(() => [128, 128, 128])).reasons[0], 'blank');
  const blurry = makeImage((x) => [Math.round(60 + (x / SIZE) * 150), 120, 120]);
  const r = evaluatePhoto(blurry);
  assert.equal(r.status, 'retake');
  assert.equal(r.reasons[0], 'blurry');
});

test('re-uploading the same photo is caught as a duplicate', () => {
  const m = makeImage(cleanTiles);
  const again = makeImage(cleanTiles);
  assert.equal(hamming(m.hash, again.hash), 0);
  assert.equal(evaluatePhoto(again, { knownHashes: [m.hash] }).status, 'duplicate');
});

test('a very different photo is not a duplicate', () => {
  const a = makeImage(cleanTiles);
  const b = makeImage((x, y) => ((x * 3 + y * 5) % 17 < 8 ? [220, 230, 235] : [60, 90, 120]));
  assert.ok(hamming(a.hash, b.hash) > 6);
});

test('a 5-star claim on a stained photo is flagged; honest low rating is verified', () => {
  const m = makeImage(stainedTiles);
  assert.ok(estimateCleanliness(m) < 30);
  assert.equal(evaluatePhoto(m, { claimedRating: 5 }).status, 'flagged');
  assert.equal(evaluatePhoto(m, { claimedRating: 1 }).status, 'verified');
});
