import test from 'node:test';
import assert from 'node:assert/strict';
import { computeScore, cleaningScore, structuralSafety, reviewWeight, isNight, bandOf } from '../src/lib/scoring.js';
import { ISSUES } from '../src/lib/constants.js';

const NOW = new Date('2026-10-16T12:00:00Z').getTime();
const HOUR = 3_600_000;
const iso = (hoursAgo) => new Date(NOW - hoursAgo * HOUR).toISOString();

const place = (over = {}) => ({
  lightingBase: 3,
  features: {},
  lastCleanedAt: iso(2),
  ...over,
});
const review = (over = {}) => ({ rating: 4, lighting: 4, safety: 4, createdAt: iso(1), issues: [], audit: null, ...over });
const opts = { now: NOW, night: false, issueDefs: ISSUES };

test('cleaning score halves every 10 hours and is neutral when unknown', () => {
  assert.equal(Math.round(cleaningScore(NOW, NOW)), 100);
  assert.equal(Math.round(cleaningScore(NOW - 10 * HOUR, NOW)), 50);
  assert.equal(cleaningScore(null, NOW), 30);
});

test('structural safety rewards CCTV, staff, women’s toilet and visible entrance', () => {
  assert.equal(structuralSafety({}), 35);
  assert.equal(structuralSafety({ cctv: true, staffPresent: true, genderSeparate: true, visibleEntrance: true }), 100);
});

test('a fresh cleaning log raises the hygiene score', () => {
  const fresh = computeScore(place({ lastCleanedAt: iso(1) }), [review()], opts);
  const stale = computeScore(place({ lastCleanedAt: iso(48) }), [review()], opts);
  assert.ok(fresh.hygiene > stale.hygiene);
  assert.ok(fresh.overall > stale.overall);
});

test('one review cannot swing a score (Bayesian prior)', () => {
  const none = computeScore(place(), [], opts);
  const oneBad = computeScore(place(), [review({ rating: 1 })], opts);
  assert.ok(none.components.rating - oneBad.components.rating < 25);
});

test('recent reviews count more than old ones', () => {
  assert.ok(reviewWeight(review({ createdAt: iso(1) }), NOW) > reviewWeight(review({ createdAt: iso(24 * 90) }), NOW));
});

test('photo-verified reviews count more; flagged reviews count less', () => {
  const base = reviewWeight(review(), NOW);
  assert.ok(reviewWeight(review({ audit: { status: 'verified' } }), NOW) > base);
  assert.ok(reviewWeight(review({ audit: { status: 'flagged' } }), NOW) < base);
});

test('dynamic index: poor lighting hurts more at night', () => {
  const dark = place({ lightingBase: 1, features: { cctv: true, staffPresent: true } });
  const dayScore = computeScore(dark, [review({ lighting: 1 })], { ...opts, night: false });
  const nightScore = computeScore(dark, [review({ lighting: 1 })], { ...opts, night: true });
  assert.ok(nightScore.overall < dayScore.overall);
  assert.equal(nightScore.night, true);
});

test('recent problem reports lower the score and expire after 48 hours', () => {
  const clean = computeScore(place(), [review()], opts);
  const reported = computeScore(place(), [review({ issues: ['felt_unsafe', 'broken_lock'] })], opts);
  assert.ok(reported.overall < clean.overall);
  assert.equal(reported.penalty, 14);
  const old = computeScore(place(), [review({ issues: ['felt_unsafe'], createdAt: iso(72) })], opts);
  assert.equal(old.penalty, 0);
});

test('scores stay within 0-100 and bands match thresholds', () => {
  const best = computeScore(
    place({ lightingBase: 5, lastCleanedAt: iso(0), features: { cctv: true, staffPresent: true, genderSeparate: true, visibleEntrance: true } }),
    [review({ rating: 5, lighting: 5, safety: 5 })],
    opts,
  );
  assert.ok(best.overall <= 100 && best.overall >= 0);
  assert.equal(bandOf(80), 'great');
  assert.equal(bandOf(60), 'okay');
  assert.equal(bandOf(30), 'poor');
});

test('night is 19:00-06:00', () => {
  assert.equal(isNight(new Date(2026, 0, 1, 22)), true);
  assert.equal(isNight(new Date(2026, 0, 1, 3)), true);
  assert.equal(isNight(new Date(2026, 0, 1, 12)), false);
});

test('confidence grows with more recent reviews', () => {
  const few = computeScore(place(), [review()], opts);
  const many = computeScore(place(), Array.from({ length: 8 }, () => review()), opts);
  assert.ok(many.confidence.value > few.confidence.value);
});
