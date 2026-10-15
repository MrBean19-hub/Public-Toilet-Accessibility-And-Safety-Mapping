const KEY = 'safestop:v1';

export const EMPTY_STATE = { userPlaces: [], reviews: [], hashes: [], lastReviewAt: {} };

/** Load saved state; falls back to an empty state if storage is blocked or corrupt. */
export function loadState() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_STATE };
    return { ...EMPTY_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false; // storage full or disabled: the app keeps working in memory
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
