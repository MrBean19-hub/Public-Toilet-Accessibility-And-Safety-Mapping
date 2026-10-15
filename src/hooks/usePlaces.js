import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildSeed } from '../data/seedToilets.js';
import { ISSUES } from '../lib/constants.js';
import { computeScore } from '../lib/scoring.js';
import { EMPTY_STATE, clearState, loadState, saveState } from '../lib/storage.js';

/**
 * Single source of truth for places and reviews.
 * Seed (demo) data + community data saved in localStorage are merged, and every
 * place gets a freshly computed score whenever the clock or the data changes.
 */
export function usePlaces({ center, now, night, cooldownMin }) {
  const seed = useMemo(() => buildSeed(center), [center.lat, center.lng]);
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const places = useMemo(() => {
    const byPlace = new Map();
    for (const r of [...seed.reviews, ...state.reviews]) {
      if (!byPlace.has(r.placeId)) byPlace.set(r.placeId, []);
      byPlace.get(r.placeId).push(r);
    }
    return [...seed.places, ...state.userPlaces].map((p) => {
      const reviews = (byPlace.get(p.id) ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { ...p, reviews, score: computeScore(p, reviews, { now, night, issueDefs: ISSUES }) };
    });
  }, [seed, state.reviews, state.userPlaces, now, night]);

  /** @returns {{ok: boolean, error?: string}} */
  const addReview = useCallback(
    (review) => {
      const last = state.lastReviewAt[review.placeId];
      const waitMs = cooldownMin * 60_000 - (Date.now() - (last ?? 0));
      if (last && waitMs > 0) {
        return {
          ok: false,
          error: `You just reviewed this place. Please wait ${Math.ceil(waitMs / 60_000)} min before reviewing it again.`,
        };
      }
      setState((s) => ({
        ...s,
        reviews: [review, ...s.reviews],
        hashes: review.hash ? [review.hash, ...s.hashes].slice(0, 200) : s.hashes,
        lastReviewAt: { ...s.lastReviewAt, [review.placeId]: Date.now() },
      }));
      return { ok: true };
    },
    [state.lastReviewAt, cooldownMin],
  );

  const addPlace = useCallback((place) => {
    setState((s) => ({ ...s, userPlaces: [place, ...s.userPlaces] }));
  }, []);

  const resetCommunityData = useCallback(() => {
    clearState();
    setState({ ...EMPTY_STATE });
  }, []);

  return { places, addReview, addPlace, resetCommunityData, knownHashes: state.hashes };
}
