# SafeStop: Dynamic Accessibility & Safety Index for Public Sanitation

> Find a toilet you can trust. A crowd-sourced, AI-assisted map that rates public and commercial toilets (cafés, petrol pumps, malls, transit stations) on **safety, hygiene and accessibility**, built for women, elderly people and persons with disabilities.

**Live prototype:** `https://MrBean19-hub.github.io/Public Toilet Accessibility And Safety Mapping/` *(replace after deploying, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md))*
**Written explanation:** [docs/PROJECT_EXPLANATION.md](docs/PROJECT_EXPLANATION.md)

---

## The problem

Finding a clean, safe and usable public toilet in an Indian city is hard. Map listings are inaccurate, reviews are unverified, and nothing tells you whether the toilet is well lit at 9 pm, has a ramp, or stocks sanitary pads. Women, elderly people and persons with disabilities pay the highest price for that uncertainty.

## What SafeStop does

| Feature | What you can try in the prototype |
|---|---|
| **Safety & Hygiene Score** | Every place gets a 0-100 score built from user ratings, lighting, spatial safety (CCTV, staff, women's toilet, visible entrance) and cleaning-log freshness. Open any place to see the full breakdown. |
| **Dynamic index** | The score changes with time. Cleaning freshness decays hour by hour, and after 7 pm lighting and safety count more (switch **Auto / Day / Night** in the top bar). |
| **AI Image Audit** | When reviewing, add a photo. It is checked on-device for quality (dark, blurry, blank), duplicates, estimated cleanliness, and consistency with your star rating. Verified photos make a review count more; mismatched or duplicate ones do not. |
| **Inclusive filters** | One-tap filters for wheelchair access, sanitary pad vending, baby-changing, women's toilet and 24-hour access, plus **Women-safe mode**. |
| **Crowd-sourced map** | Add a missing toilet, post reviews, report problems (broken lock, no water, felt unsafe). Reports lower the score for 48 hours. |
| **Navigation** | Tap **Near me** to sort by distance, then **Get directions** to open walking directions in your maps app. |
| **Anti-spam** | Review cool-down per place, duplicate-photo detection, and trust weighting. |

## Try it in two minutes (for reviewers)

1. Open the live prototype. Pins on the map show each place's score.
2. Tap **Women-safe mode**, then **Wheelchair access**. The list and map narrow instantly.
3. Open **Old Bus Stand Toilet** (low score) and compare it with **Lotus Garden Public Toilet**. Read the *How this score is built* panel.
4. Switch the top bar to **Night**. Watch scores of poorly lit places drop.
5. On any place, tap **Write a review**, rate it, and upload any photo. Try a dark photo (it asks you to retake), then the same photo twice (duplicate caught).
6. Post the review. The score updates immediately.

## Tech stack

- **React 18 + Vite 5**: single-page app, no backend required for the prototype
- **Leaflet + OpenStreetMap**: interactive map with score pins
- **Canvas image analysis (client-side)**: quality gate, perceptual hash, colour-based cleanliness heuristic
- **localStorage**: persists community reviews and added places in the visitor's browser
- **Node's built-in test runner**: 22 unit tests for the scoring, audit and filter logic
- **GitHub Actions**: CI plus automatic deployment to GitHub Pages

## Getting started

Requires **Node.js 18 or newer**.

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO
npm install
cp .env.example .env     # optional: every value has a default
npm run dev              # http://localhost:5173
```

Other commands:

```bash
npm test          # run the unit tests
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

### Environment variables

All optional. See [`.env.example`](.env.example) for the placeholder file.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_APP_NAME` | `SafeStop` | Brand name in the header |
| `VITE_DEFAULT_LAT` / `VITE_DEFAULT_LNG` | `26.9124` / `75.7873` | Where the map opens. Demo places are placed around this point, so set it to your city |
| `VITE_DEFAULT_ZOOM` | `13` | Initial zoom |
| `VITE_MAP_TILE_URL` | OpenStreetMap | Any XYZ tile server |
| `VITE_REVIEW_COOLDOWN_MIN` | `5` | Minutes between two reviews of the same place |

## Project structure

```
.
├── src/
│   ├── App.jsx                  # layout, state wiring, mobile tabs
│   ├── config.js                # reads VITE_* variables
│   ├── components/              # MapView, PlaceList/Card/Detail, ReviewForm, FilterBar, ScoreBadge, ...
│   ├── hooks/                   # usePlaces (data + scoring), useGeolocation, useNow
│   ├── lib/
│   │   ├── scoring.js           # Safety & Hygiene Score (pure, tested)
│   │   ├── imageAudit.js        # AI Image Audit core (pure, tested)
│   │   ├── imageAudit.browser.js# canvas/file glue for the audit
│   │   ├── filters.js, geo.js, format.js, storage.js, constants.js
│   ├── data/seedToilets.js      # fictional demo places and reviews
│   └── styles/global.css        # design tokens and all styles
├── tests/                       # scoring, image audit, filters
├── docs/                        # explanation, architecture, deployment, checklist
├── public/                      # favicon, web manifest
└── .github/workflows/           # CI and GitHub Pages deploy
```

## How the score works

```
hygiene = 0.6 × user ratings + 0.4 × cleaning-log freshness
safety  = (1 − L) × spatial safety + L × lighting      L = 0.4 by day, 0.6 at night
overall = H × hygiene + (1 − H) × safety − problem penalty      H = 0.5 by day, 0.4 at night
```

Ratings are Bayesian (one review cannot swing a score), recency-weighted (half-life 30 days) and trust-weighted (photo-verified ×1.5, flagged ×0.4). Details and every constant: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Honest limits of this prototype

- **The AI Image Audit is a transparent heuristic, not a trained neural network.** It reliably catches unusable, duplicate and inconsistent photos. Its cleanliness estimate is a colour-based signal meant to cross-check ratings, not to judge a toilet on its own. The interface is designed so a trained vision model can replace it (see the roadmap).
- **Data is local.** Reviews and added places are saved in the visitor's browser only. A shared backend is the first roadmap item.
- **Demo places are fictional** and are labelled "Demo data" in the app.

## Roadmap

See the full plan in [docs/PROJECT_EXPLANATION.md](docs/PROJECT_EXPLANATION.md#future-roadmap). In short: shared backend and accounts, a trained vision model, QR-code cleaning logs for staff, municipal data integration, offline mode, and multilingual support.

## License

MIT, see [LICENSE](LICENSE).
