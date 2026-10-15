import { SCORING } from './constants.js';

/**
 * Safety & Hygiene Score
 * ----------------------
 * Four components (each 0-100) are combined into two sub-scores and one
 * overall index. All maths is pure and deterministic, so it is unit-tested.
 *
 *   rating   : Bayesian, recency- and trust-weighted average of hygiene ratings
 *   cleaning : exponential decay since the last logged cleaning
 *   lighting : facility baseline blended with reviewers' lighting ratings
 *   spatial  : structural safety (CCTV, staff, women's toilet, visible entrance)
 *              blended with reviewers' "I felt safe" ratings
 *
 *   hygiene = 0.6 * rating + 0.4 * cleaning
 *   safety  = (1 - L) * spatial + L * lighting          L = lighting share (higher at night)
 *   overall = H * hygiene + (1 - H) * safety - penalty  H = hygiene share (lower at night)
 */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
const ratingToPct = (r) => clamp(((r - 1) / 4) * 100);
const round1 = (n) => Math.round(n * 10) / 10;

/** True between 19:00 and 06:00 local time. */
export function isNight(date = new Date()) {
  const h = date.getHours();
  return h >= SCORING.nightStartHour || h < SCORING.nightEndHour;
}

/** How much one review counts: newer and photo-verified reviews count more. */
export function reviewWeight(review, now = Date.now()) {
  const ageDays = Math.max(0, (now - new Date(review.createdAt).getTime()) / DAY);
  const recency = Math.max(SCORING.minRecencyWeight, 0.5 ** (ageDays / SCORING.recencyHalfLifeDays));
  const status = review.audit?.status;
  const trust =
    status === 'verified' ? SCORING.verifiedBoost : status === 'flagged' ? SCORING.flaggedPenalty : 1;
  return recency * trust;
}

/** Weighted mean that starts from a prior, so one review cannot swing a score. */
function blend(priorValue, priorWeight, samples) {
  let num = priorValue * priorWeight;
  let den = priorWeight;
  for (const s of samples) {
    num += s.value * s.weight;
    den += s.weight;
  }
  return num / den;
}

/** Structural safety from facts about the place (0-100). */
export function structuralSafety(features = {}) {
  const p = SCORING.structural;
  return clamp(
    p.base +
      (features.cctv ? p.cctv : 0) +
      (features.staffPresent ? p.staffPresent : 0) +
      (features.genderSeparate ? p.genderSeparate : 0) +
      (features.visibleEntrance ? p.visibleEntrance : 0),
  );
}

/** Most recent logged cleaning: a staff log on the place or a reviewer who saw one. */
export function latestCleaning(toilet, reviews, now = Date.now()) {
  const times = [];
  if (toilet.lastCleanedAt) times.push(new Date(toilet.lastCleanedAt).getTime());
  for (const r of reviews) if (r.cleanedRecently) times.push(new Date(r.createdAt).getTime());
  const valid = times.filter((t) => Number.isFinite(t) && t <= now);
  return valid.length ? Math.max(...valid) : null;
}

export function cleaningScore(lastCleanedMs, now = Date.now()) {
  if (lastCleanedMs == null) return SCORING.cleaningUnknownScore;
  const hours = Math.max(0, (now - lastCleanedMs) / HOUR);
  return clamp(100 * 0.5 ** (hours / SCORING.cleaningHalfLifeHours));
}

/** Penalty for recent, distinct problem reports (broken lock, no water, felt unsafe...). */
export function issuePenalty(reviews, issueDefs, now = Date.now()) {
  const windowMs = SCORING.issueWindowHours * HOUR;
  const seen = new Set();
  for (const r of reviews) {
    if (now - new Date(r.createdAt).getTime() > windowMs) continue;
    for (const key of r.issues ?? []) seen.add(key);
  }
  let total = 0;
  for (const def of issueDefs) if (seen.has(def.key)) total += def.severity;
  return Math.min(SCORING.maxIssuePenalty, total);
}

export function bandOf(score) {
  if (score >= SCORING.bands.great) return 'great';
  if (score >= SCORING.bands.okay) return 'okay';
  return 'poor';
}

export function confidenceOf(totalWeight) {
  const value = 1 - Math.exp(-totalWeight / 3);
  const level = value < 0.35 ? 'low' : value < 0.7 ? 'medium' : 'high';
  return { value: round1(value), level };
}

/**
 * Compute the full score card for one place.
 * @param {object} toilet   place with `features`, `lightingBase` (1-5), `lastCleanedAt`
 * @param {object[]} reviews reviews of this place
 * @param {{now?: number, night?: boolean, issueDefs?: object[]}} options
 */
export function computeScore(toilet, reviews, options = {}) {
  const now = options.now ?? Date.now();
  const night = options.night ?? isNight(new Date(now));
  const issueDefs = options.issueDefs ?? [];
  const w = night ? SCORING.weights.night : SCORING.weights.day;

  const weighted = reviews.map((r) => ({ r, weight: reviewWeight(r, now) }));
  const totalWeight = weighted.reduce((sum, x) => sum + x.weight, 0);

  const ratingSamples = weighted.map(({ r, weight }) => ({ value: ratingToPct(r.rating), weight }));
  // Prior is neutral (3/5 = 50%); samples are already in percent.
  const rating = blend(ratingToPct(SCORING.ratingPriorValue), SCORING.ratingPriorWeight, ratingSamples);

  const lastCleaned = latestCleaning(toilet, reviews, now);
  const cleaning = cleaningScore(lastCleaned, now);

  const lightingSamples = weighted
    .filter(({ r }) => r.lighting != null)
    .map(({ r, weight }) => ({ value: ratingToPct(r.lighting), weight }));
  const lighting = blend(ratingToPct(toilet.lightingBase ?? 3), SCORING.factPriorWeight, lightingSamples);

  const spatialSamples = weighted
    .filter(({ r }) => r.safety != null)
    .map(({ r, weight }) => ({ value: ratingToPct(r.safety), weight }));
  const spatial = blend(structuralSafety(toilet.features), SCORING.factPriorWeight, spatialSamples);

  const hygiene = 0.6 * rating + 0.4 * cleaning;
  const safety = (1 - w.lighting) * spatial + w.lighting * lighting;
  const penalty = issuePenalty(reviews, issueDefs, now);
  const overall = clamp(w.hygiene * hygiene + (1 - w.hygiene) * safety - penalty);

  return {
    overall: Math.round(overall),
    hygiene: Math.round(hygiene),
    safety: Math.round(safety),
    components: {
      rating: Math.round(rating),
      cleaning: Math.round(cleaning),
      lighting: Math.round(lighting),
      spatial: Math.round(spatial),
    },
    penalty,
    night,
    lastCleanedAt: lastCleaned,
    reviewCount: reviews.length,
    confidence: confidenceOf(totalWeight),
    band: bandOf(overall),
  };
}
