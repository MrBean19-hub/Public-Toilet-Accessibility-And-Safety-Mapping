/**
 * AI Image Audit (pure analysis core)
 * -----------------------------------
 * Runs entirely in the browser: no photo ever leaves the device in this
 * prototype. A photo goes through four checks before it can "verify" a review:
 *
 *   1. Quality gate  : too dark, too bright, blurry or blank photos are rejected.
 *   2. Duplicate gate: a perceptual hash (dHash) catches re-uploads of the same photo.
 *   3. Cleanliness   : a colour heuristic estimates how clean the surfaces look
 *                      (share of clean white/light surfaces vs. brown-yellow stains).
 *   4. Consistency   : if the star rating and the photo strongly disagree,
 *                      the review is flagged and counts less.
 *
 * The cleanliness estimate is a transparent heuristic, not a trained model. The
 * interface (`analyzePixels` -> `evaluatePhoto`) is the seam where a real vision
 * model can be plugged in (see docs/ROADMAP in PROJECT_EXPLANATION.md).
 */

export const AUDIT = {
  minBrightness: 40,
  maxBrightness: 240,
  minContrast: 10,
  minSharpness: 12,
  duplicateMaxDistance: 6,
  mismatchGap: 45,
};

const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

/** Perceptual "difference hash": 64 bits as 16 hex chars, robust to resizing and mild edits. */
export function dHash(gray, width, height) {
  const cols = 9;
  const rows = 8;
  const cells = [];
  for (let cy = 0; cy < rows; cy++) {
    const row = [];
    for (let cx = 0; cx < cols; cx++) {
      const x0 = Math.floor((cx * width) / cols);
      const x1 = Math.max(x0 + 1, Math.floor(((cx + 1) * width) / cols));
      const y0 = Math.floor((cy * height) / rows);
      const y1 = Math.max(y0 + 1, Math.floor(((cy + 1) * height) / rows));
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          sum += gray[y * width + x];
          count++;
        }
      }
      row.push(sum / count);
    }
    cells.push(row);
  }
  let hex = '';
  let nibble = 0;
  let bits = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols - 1; x++) {
      nibble = (nibble << 1) | (cells[y][x] > cells[y][x + 1] ? 1 : 0);
      bits++;
      if (bits === 4) {
        hex += nibble.toString(16);
        nibble = 0;
        bits = 0;
      }
    }
  }
  return hex;
}

/** Number of differing bits between two hex hashes. */
export function hamming(a, b) {
  let dist = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      dist += x & 1;
      x >>= 1;
    }
  }
  return dist;
}

/**
 * Compute raw image statistics from RGBA pixel data (e.g. a 128x128 canvas).
 * @param {Uint8ClampedArray|number[]} rgba
 */
export function analyzePixels(rgba, width, height) {
  const n = width * height;
  const gray = new Float32Array(n);
  let sum = 0;
  let white = 0;
  let stain = 0;
  let dark = 0;

  for (let i = 0; i < n; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = lum;
    sum += lum;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const v = max / 255;
    const s = max === 0 ? 0 : d / max;
    let h = 0;
    if (d > 0) {
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
      if (h < 0) h += 360;
    }
    if (v > 0.72 && s < 0.18) white++;
    else if (h >= 15 && h <= 55 && s > 0.3 && v > 0.15 && v < 0.7) stain++;
    if (v < 0.15) dark++;
  }

  const mean = sum / n;
  let varSum = 0;
  for (let i = 0; i < n; i++) varSum += (gray[i] - mean) ** 2;
  const contrast = Math.sqrt(varSum / n);

  // Variance of the Laplacian: a standard sharpness measure (low = blurry).
  let lapSum = 0;
  let lapSq = 0;
  let lapCount = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const lap = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - width] - gray[i + width];
      lapSum += lap;
      lapSq += lap * lap;
      lapCount++;
    }
  }
  const sharpness = lapCount ? lapSq / lapCount - (lapSum / lapCount) ** 2 : 0;

  return {
    width,
    height,
    brightness: mean,
    contrast,
    sharpness,
    whiteRatio: white / n,
    stainRatio: stain / n,
    darkRatio: dark / n,
    hash: dHash(gray, width, height),
  };
}

/** Heuristic 0-100 estimate of how clean the photographed surfaces look. */
export function estimateCleanliness(m) {
  return Math.round(clamp(40 + 70 * m.whiteRatio - 200 * m.stainRatio - 60 * m.darkRatio));
}

/** Reasons a photo cannot be used as evidence. */
export function qualityIssues(m) {
  const issues = [];
  if (m.brightness < AUDIT.minBrightness) issues.push('too_dark');
  else if (m.brightness > AUDIT.maxBrightness) issues.push('too_bright');
  if (m.contrast < AUDIT.minContrast) issues.push('blank');
  else if (m.sharpness < AUDIT.minSharpness) issues.push('blurry');
  return issues;
}

const MESSAGES = {
  too_dark: 'The photo is too dark. Turn on the light or use flash and try again.',
  too_bright: 'The photo is overexposed. Move away from direct light and try again.',
  blank: 'The photo looks blank. Point the camera at the toilet and try again.',
  blurry: 'The photo is blurry. Hold the phone steady and try again.',
  duplicate: 'This photo was already submitted. Please take a new one.',
  flagged: 'The photo and your rating look very different, so this review will count less.',
  verified: 'Photo verified. Your review will count more.',
};

/**
 * Decide what a photo means for a review.
 * @param {ReturnType<typeof analyzePixels>} metrics
 * @param {{claimedRating?: number|null, knownHashes?: string[]}} context
 * @returns {{status: 'verified'|'flagged'|'retake'|'duplicate', cleanliness: number, reasons: string[], message: string}}
 */
export function evaluatePhoto(metrics, context = {}) {
  const { claimedRating = null, knownHashes = [] } = context;
  const cleanliness = estimateCleanliness(metrics);

  const issues = qualityIssues(metrics);
  if (issues.length) {
    return { status: 'retake', cleanliness, reasons: issues, message: MESSAGES[issues[0]] };
  }
  if (knownHashes.some((h) => hamming(h, metrics.hash) <= AUDIT.duplicateMaxDistance)) {
    return { status: 'duplicate', cleanliness, reasons: ['duplicate'], message: MESSAGES.duplicate };
  }
  if (claimedRating != null) {
    const claimedPct = (claimedRating - 1) * 25;
    if (Math.abs(claimedPct - cleanliness) > AUDIT.mismatchGap) {
      return { status: 'flagged', cleanliness, reasons: ['mismatch'], message: MESSAGES.flagged };
    }
  }
  return { status: 'verified', cleanliness, reasons: [], message: MESSAGES.verified };
}
