# Architecture

SafeStop is a static single-page app. All logic runs in the browser, so the live prototype needs no server and can be hosted for free.

```
 user ──► React UI (src/components) ──► usePlaces hook ──► scoring.js ──► score cards
              │                              │
              │                              └── localStorage (reviews, added places)
              ├── MapView (Leaflet)
              └── ReviewForm ──► imageAudit.browser.js (canvas) ──► imageAudit.js (pure analysis)
```

**Design rule:** everything with business meaning (`scoring.js`, `imageAudit.js`, `filters.js`, `geo.js`) is pure JavaScript with no browser or React imports. That is why it is covered by fast unit tests, and why it can move to a server unchanged.

## Folders

| Path | Role |
|---|---|
| `src/lib/` | Pure logic: scoring, image audit, filters, geo, formatting, storage, constants |
| `src/hooks/` | React state: `usePlaces` (merges seed + community data and computes scores), `useGeolocation`, `useNow` |
| `src/components/` | Presentational components; each file does one job |
| `src/data/` | Fictional demo places and reviews, generated relative to the current time |
| `tests/` | `node --test` suites for scoring, audit and filters |

## Scoring model

All numbers live in `src/lib/constants.js` (`SCORING`).

**Components (each 0-100)**

| Component | How it is computed |
|---|---|
| Rating | Bayesian weighted mean of hygiene ratings. Prior: neutral 3/5 worth 2 reviews. |
| Cleaning | `100 × 0.5^(hours since last cleaning / 10)`. Unknown = 30. |
| Lighting | Facility baseline blended with reviewers' lighting ratings (baseline worth 3 reviews). |
| Spatial | Structural points (base 35, CCTV +15, staff +20, women's toilet +15, visible entrance +15) blended with "felt safe" ratings. |

**Review weight** = `recency × trust`, with `recency = 0.5^(age in days / 30)` (floor 0.05) and `trust` = 1.5 verified, 0.4 flagged, 1 otherwise.

**Combination**

```
hygiene = 0.6 · rating + 0.4 · cleaning
safety  = (1 − L) · spatial + L · lighting        L: day 0.4, night 0.6
overall = H · hygiene + (1 − H) · safety − penalty   H: day 0.5, night 0.4
```

**Penalty:** each distinct problem reported in the last 48 hours subtracts its severity (felt unsafe 8, broken lock 6, no water 6, no light 5, no soap or bin 3), capped at 25.

**Bands:** 75 and above is *Great*, 55 to 74 is *Okay*, below 55 is *Needs care*.

**Confidence:** `1 − e^(−Σweights / 3)`, shown as low, medium or high.

**Women-safe mode:** safety score of at least 65 *and* a women's toilet or staff nearby.

## AI Image Audit pipeline

1. The photo is drawn to a 128 px canvas (never uploaded).
2. `analyzePixels` computes brightness, contrast, sharpness (variance of the Laplacian), shares of clean-light, stain-coloured and dark pixels, and a 64-bit difference hash.
3. `evaluatePhoto` returns one of:
   - `retake`: too dark, too bright, blank or blurry
   - `duplicate`: hash within 6 bits of a previously submitted photo
   - `flagged`: estimated cleanliness differs from the star rating by more than 45 points
   - `verified`: otherwise

To swap in a real model, replace `estimateCleanliness` with a call to a vision service and keep the rest of the pipeline.

## Security and privacy notes

- User-provided text is rendered as text by React; map tooltips use `textContent`, not HTML strings.
- Only `VITE_*` variables reach the browser; never put secrets in them.
- Photos stay on the device; only a small thumbnail is stored locally with the review.
