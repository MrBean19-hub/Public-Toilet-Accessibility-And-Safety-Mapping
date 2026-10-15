import { SCORING } from './constants.js';

/**
 * @typedef {object} Filters
 * @property {string} query         free-text match on name, address, type
 * @property {string[]} features    feature keys that must all be present
 * @property {boolean} womenSafe    only places with a strong safety score and women's facilities/staff
 */

export const EMPTY_FILTERS = { query: '', features: [], womenSafe: false };

/** A place passes "women-safe mode" if its safety score is high and someone is looking out for users. */
export function isWomenSafe(place) {
  const f = place.features ?? {};
  return place.score.safety >= SCORING.womenSafeMinSafety && Boolean(f.genderSeparate || f.staffPresent);
}

export function filterPlaces(places, filters) {
  const q = filters.query.trim().toLowerCase();
  return places.filter((p) => {
    if (q && !`${p.name} ${p.address} ${p.type}`.toLowerCase().includes(q)) return false;
    if (!filters.features.every((key) => p.features?.[key])) return false;
    if (filters.womenSafe && !isWomenSafe(p)) return false;
    return true;
  });
}

/** @param {'best'|'safest'|'nearest'} mode */
export function sortPlaces(places, mode) {
  const copy = [...places];
  if (mode === 'nearest') {
    return copy.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }
  if (mode === 'safest') return copy.sort((a, b) => b.score.safety - a.score.safety);
  return copy.sort((a, b) => b.score.overall - a.score.overall);
}
