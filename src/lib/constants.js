/**
 * Shared constants. Keep this file free of browser APIs so it can be imported
 * from unit tests running in plain Node.
 */

/** Facility features that users can filter on. */
export const FEATURES = [
  { key: 'wheelchair', label: 'Wheelchair access', short: 'Wheelchair', glyph: '♿' },
  { key: 'padVending', label: 'Sanitary pad vending', short: 'Pad vending', glyph: '🩷' },
  { key: 'babyChanging', label: 'Baby-changing station', short: 'Baby changing', glyph: '🍼' },
  { key: 'genderSeparate', label: 'Separate women’s toilet', short: 'Women’s toilet', glyph: '🚺' },
  { key: 'cctv', label: 'CCTV at entrance', short: 'CCTV', glyph: '📹' },
  { key: 'staffPresent', label: 'Attendant or staff nearby', short: 'Staff nearby', glyph: '🧑‍🔧' },
  { key: 'visibleEntrance', label: 'Entrance visible from the street', short: 'Visible entrance', glyph: '👁️' },
  { key: 'open24', label: 'Open 24 hours', short: '24 hours', glyph: '🕒' },
];

/** Features shown as quick filter chips (the three from the problem statement first). */
export const FILTER_FEATURE_KEYS = ['wheelchair', 'padVending', 'babyChanging', 'genderSeparate', 'open24'];

export const PLACE_TYPES = [
  { key: 'public', label: 'Public toilet' },
  { key: 'cafe', label: 'Café or restaurant' },
  { key: 'petrol', label: 'Petrol pump' },
  { key: 'mall', label: 'Mall or market' },
  { key: 'metro', label: 'Transit station' },
];

/** Problems a reviewer can report. `severity` is the score penalty while the report is fresh. */
export const ISSUES = [
  { key: 'broken_lock', label: 'Door lock broken', severity: 6 },
  { key: 'no_water', label: 'No running water', severity: 6 },
  { key: 'no_light', label: 'Light not working', severity: 5 },
  { key: 'no_supplies', label: 'No soap or bin', severity: 3 },
  { key: 'felt_unsafe', label: 'I felt unsafe here', severity: 8 },
];

/** All tunable numbers of the scoring model live here (see docs/ARCHITECTURE.md). */
export const SCORING = {
  /** Review weight halves every N days, so recent experiences matter most. */
  recencyHalfLifeDays: 30,
  minRecencyWeight: 0.05,
  /** Photo-verified reviews count more; reviews flagged by the audit count less. */
  verifiedBoost: 1.5,
  flaggedPenalty: 0.4,
  /** Bayesian prior: with no reviews the rating sits at neutral 3/5, worth this many reviews. */
  ratingPriorValue: 3,
  ratingPriorWeight: 2,
  /** Facility facts (lighting, structure) act as the prior for review-based lighting/safety. */
  factPriorWeight: 3,
  /** Cleaning freshness: score halves every N hours after the last logged cleaning. */
  cleaningHalfLifeHours: 10,
  cleaningUnknownScore: 30,
  /** Reports older than this stop reducing the score. */
  issueWindowHours: 48,
  maxIssuePenalty: 25,
  /** Dynamic weighting: after dark, lighting and safety matter more. */
  nightStartHour: 19,
  nightEndHour: 6,
  weights: {
    /** hygiene = share of overall from hygiene; lighting = share of safety from lighting */
    day: { hygiene: 0.5, lighting: 0.4 },
    night: { hygiene: 0.4, lighting: 0.6 },
  },
  /** Structural safety points (max 100). */
  structural: { base: 35, cctv: 15, staffPresent: 20, genderSeparate: 15, visibleEntrance: 15 },
  bands: { great: 75, okay: 55 },
  womenSafeMinSafety: 65,
};

export const REVIEW_COOLDOWN_MIN = 5;
