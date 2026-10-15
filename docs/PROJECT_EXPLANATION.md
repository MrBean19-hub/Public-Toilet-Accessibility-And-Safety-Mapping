# SafeStop: Written Explanation

## Problem

In Indian cities, finding a toilet that is clean, safe and usable is a daily struggle. Map apps list toilets but rarely say whether they are open, lit, staffed or accessible. Reviews are scattered, unverified and easy to fake. The people affected most are:

- **Women**, who weigh cleanliness against personal safety: lighting, isolation, who else is around.
- **Elderly people**, who need to know a place is reachable and usable before making the trip.
- **Persons with disabilities**, for whom a missing ramp or a narrow door makes a toilet unusable, however clean it is.

The result is avoidable discomfort, health risk and, for many, a decision to avoid travelling at all.

## Target users

| User | What they need from SafeStop |
|---|---|
| Women and girls | A safety-first score, women's toilet and staff presence, night-time lighting, a "women-safe" filter |
| Elderly people | Nearby options sorted by distance, clear facility information, large tap targets and legible type |
| Persons with disabilities | Wheelchair-access filter, honest accessibility data from other users |
| Parents and carers | Baby-changing stations, sanitary-pad availability |
| Travellers and commuters | Petrol pumps, cafés, malls and stations with a toilet they can trust |
| Cities and facility owners (secondary) | A public signal of which facilities need maintenance |

## Solution

SafeStop is a crowd-sourced, AI-assisted map that treats **safety and accessibility as first-class data**, not afterthoughts. It maps public *and* commercial toilets, and gives each a single score that people can understand and inspect.

1. **Safety & Hygiene Score.** Combines user ratings, lighting, spatial safety (CCTV, staff, women's toilet, visible entrance) and the freshness of the last cleaning log. The score is *dynamic*: cleanliness decays over hours, and after dark lighting and safety carry more weight.
2. **AI Image Audit.** Reviews can include a photo. The audit checks that the photo is usable, not a duplicate, and consistent with the star rating. Verified reviews count more; suspicious ones count less. This protects the score from spam and fake reviews.
3. **Inclusive filters.** Wheelchair access, sanitary pad vending, baby-changing, women's toilet, 24-hour access and a **Women-safe mode**.
4. **Transparent by design.** Every score opens into a breakdown that shows exactly why a place scored as it did, plus a confidence level.

## Implemented features (in this prototype)

- Interactive map with score pins (Leaflet + OpenStreetMap) and a synchronised, sortable list
- Safety & Hygiene Score with hygiene and safety sub-scores, component breakdown and confidence level
- Dynamic day/night weighting (Auto, Day, Night) and cleaning-freshness decay that updates every minute
- Review flow: cleanliness, lighting and safety ratings, "saw signed cleaning log", problem reports, comment, photo
- AI Image Audit running on-device: quality gate (dark, bright, blank, blurry), duplicate detection with a perceptual hash, colour-based cleanliness estimate, rating-versus-photo consistency check, live feedback to the user
- Trust weighting: photo-verified reviews ×1.5, flagged reviews ×0.4, recency half-life of 30 days, Bayesian smoothing
- Problem reports (broken lock, no water, light out, no soap or bin, felt unsafe) that lower a score for 48 hours
- Filters for wheelchair access, pad vending, baby-changing, women's toilet and 24-hour access; Women-safe mode; text search; sort by best, safest or nearest
- Crowd-sourced mapping: add a missing toilet at the map centre with its facilities
- "Near me" geolocation and one-tap walking directions
- Per-place review cool-down and duplicate-photo blocking
- Accessible interface: Atkinson Hyperlegible typeface, 44 px touch targets, keyboard and screen-reader support, visible focus, reduced-motion support, responsive mobile layout with a Map/List switch
- 22 unit tests, CI pipeline and automatic GitHub Pages deployment

## What is deliberately a prototype

- Data is stored in each visitor's browser (localStorage), so reviews are not yet shared between users. Demo places are fictional and labelled.
- The Image Audit is an explainable heuristic. It does not identify people or objects, and it does not make a final judgement about a toilet on its own; it cross-checks ratings.

## Future roadmap

**Next (weeks 1-4)**
- Shared backend (Postgres + PostGIS) with accounts, so reviews and new places are visible to everyone
- Server-side rate limiting and moderation queue for reported content
- Trained vision model replacing the colour heuristic, evaluated on a labelled set of toilet photos; keep the on-device quality gate

**Soon (months 2-3)**
- QR code at each facility so cleaners scan in and log a cleaning with a timestamp (stronger than "I saw the log")
- Import of open municipal and OpenStreetMap toilet data to bootstrap coverage
- Offline-first progressive web app with cached map tiles for the user's city
- Multilingual interface (Hindi first, then regional languages) and voice search

**Later**
- "Share my trip" safety feature for night travel
- Facility-owner dashboard and city-level maintenance heatmaps for municipal bodies
- Accessibility detail: door width, ramp gradient, grab-bar photos
- Partnerships with petrol-pump chains, malls and cafés to publish verified cleaning logs

## Responsible use

Photos are analysed on the device in this prototype and are used only to verify a review; users are asked to avoid including people. A production version needs a privacy policy, consent, content moderation and secure storage for any uploaded images.
