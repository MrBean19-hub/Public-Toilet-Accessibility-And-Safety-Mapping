/**
 * Demo data so reviewers can try the app immediately.
 * Places are fictional and clearly marked as demo; positions are offsets from
 * the configured map centre, so the demo works for any city set in `.env`.
 *
 * `reviews` entries are [hygiene, lighting, safety, hoursAgo, photoVerified].
 */

const demoPlaces = [
  {
    id: 'demo-1', name: 'Lotus Garden Public Toilet', type: 'public', dLat: 0.004, dLng: -0.006,
    address: 'Garden entrance, main path', lightingBase: 4,
    features: { wheelchair: true, padVending: true, babyChanging: true, genderSeparate: true, cctv: true, staffPresent: true, visibleEntrance: true, open24: false },
    cleanedHoursAgo: 2,
    reviews: [[5, 4, 5, 20, true], [4, 4, 5, 70, false], [5, 5, 4, 150, true]],
  },
  {
    id: 'demo-2', name: 'Highway Fuel Stop Restroom', type: 'petrol', dLat: -0.012, dLng: 0.008,
    address: 'Ring road service lane', lightingBase: 4,
    features: { wheelchair: true, padVending: false, babyChanging: false, genderSeparate: true, cctv: true, staffPresent: true, visibleEntrance: true, open24: true },
    cleanedHoursAgo: 5,
    reviews: [[4, 5, 4, 30, true], [4, 4, 4, 100, false]],
  },
  {
    id: 'demo-3', name: 'Corner Brew Café (customers)', type: 'cafe', dLat: 0.009, dLng: 0.011,
    address: 'Market road, first floor', lightingBase: 5,
    features: { wheelchair: false, padVending: true, babyChanging: false, genderSeparate: true, cctv: false, staffPresent: true, visibleEntrance: true, open24: false },
    cleanedHoursAgo: 1,
    reviews: [[5, 5, 5, 8, true], [5, 5, 5, 60, true], [4, 5, 5, 200, false]],
  },
  {
    id: 'demo-4', name: 'City Square Mall, Level 2', type: 'mall', dLat: -0.003, dLng: -0.013,
    address: 'Food court wing', lightingBase: 5,
    features: { wheelchair: true, padVending: true, babyChanging: true, genderSeparate: true, cctv: true, staffPresent: true, visibleEntrance: true, open24: false },
    cleanedHoursAgo: 1,
    reviews: [[5, 5, 5, 12, true], [4, 5, 5, 48, false], [5, 5, 5, 96, true], [4, 5, 4, 300, false]],
  },
  {
    id: 'demo-5', name: 'Old Bus Stand Toilet', type: 'public', dLat: 0.015, dLng: -0.002,
    address: 'Behind platform 3', lightingBase: 2,
    features: { wheelchair: false, padVending: false, babyChanging: false, genderSeparate: false, cctv: false, staffPresent: false, visibleEntrance: false, open24: true },
    cleanedHoursAgo: 40,
    reviews: [[2, 1, 1, 6, true], [1, 2, 2, 30, false], [2, 2, 1, 90, false]],
    issues: [['no_water', 6], ['felt_unsafe', 6]],
  },
  {
    id: 'demo-6', name: 'Metro Station Concourse Toilet', type: 'metro', dLat: -0.008, dLng: 0.002,
    address: 'Concourse, near gate 2', lightingBase: 4,
    features: { wheelchair: true, padVending: false, babyChanging: true, genderSeparate: true, cctv: true, staffPresent: true, visibleEntrance: true, open24: false },
    cleanedHoursAgo: 3,
    reviews: [[4, 4, 4, 15, true], [3, 4, 4, 80, false], [4, 4, 5, 160, true]],
  },
  {
    id: 'demo-7', name: 'Riverside Market Toilet', type: 'public', dLat: 0.0, dLng: 0.016,
    address: 'Lane 4, market end', lightingBase: 2,
    features: { wheelchair: false, padVending: false, babyChanging: false, genderSeparate: true, cctv: false, staffPresent: false, visibleEntrance: false, open24: false },
    cleanedHoursAgo: 14,
    reviews: [[3, 2, 2, 40, false], [3, 2, 3, 120, false]],
  },
  {
    id: 'demo-8', name: 'North Gate Petrol Pump', type: 'petrol', dLat: 0.02, dLng: 0.01,
    address: 'North bypass', lightingBase: 3,
    features: { wheelchair: false, padVending: false, babyChanging: false, genderSeparate: false, cctv: true, staffPresent: true, visibleEntrance: true, open24: true },
    cleanedHoursAgo: 9,
    reviews: [[3, 3, 3, 25, false], [3, 4, 3, 140, true]],
    issues: [['broken_lock', 10]],
  },
  {
    id: 'demo-9', name: 'Sunrise Hospital Visitors’ Toilet', type: 'public', dLat: -0.017, dLng: -0.004,
    address: 'Block B, ground floor', lightingBase: 5,
    features: { wheelchair: true, padVending: true, babyChanging: true, genderSeparate: true, cctv: true, staffPresent: true, visibleEntrance: true, open24: true },
    cleanedHoursAgo: 1,
    reviews: [[5, 5, 5, 10, true], [5, 5, 5, 40, true], [4, 5, 5, 110, false]],
  },
  {
    id: 'demo-10', name: 'Spice Lane Restaurant Washroom', type: 'cafe', dLat: 0.006, dLng: 0.004,
    address: 'Spice Lane', lightingBase: 3,
    features: { wheelchair: false, padVending: false, babyChanging: false, genderSeparate: true, cctv: false, staffPresent: true, visibleEntrance: false, open24: false },
    cleanedHoursAgo: 6,
    reviews: [[4, 3, 4, 50, false]],
  },
];

/**
 * Build seed places and reviews relative to "now" so the demo data always looks fresh.
 * @param {{lat: number, lng: number}} center
 */
export function buildSeed(center, now = Date.now()) {
  const HOUR = 3_600_000;
  const iso = (hoursAgo) => new Date(now - hoursAgo * HOUR).toISOString();
  const places = [];
  const reviews = [];

  for (const p of demoPlaces) {
    places.push({
      id: p.id,
      name: p.name,
      type: p.type,
      lat: center.lat + p.dLat,
      lng: center.lng + p.dLng,
      address: p.address,
      lightingBase: p.lightingBase,
      features: p.features,
      lastCleanedAt: iso(p.cleanedHoursAgo),
      demo: true,
    });
    p.reviews.forEach(([rating, lighting, safety, hoursAgo, verified], i) => {
      reviews.push({
        id: `${p.id}-r${i}`,
        placeId: p.id,
        rating, lighting, safety,
        comment: '',
        cleanedRecently: false,
        issues: [],
        photo: null,
        audit: verified ? { status: 'verified', cleanliness: rating * 20, message: '' } : null,
        createdAt: iso(hoursAgo),
        demo: true,
      });
    });
    (p.issues ?? []).forEach(([key, hoursAgo], i) => {
      reviews.push({
        id: `${p.id}-i${i}`,
        placeId: p.id,
        rating: 2, lighting: null, safety: null,
        comment: '', cleanedRecently: false, issues: [key],
        photo: null, audit: null, createdAt: iso(hoursAgo), demo: true,
      });
    });
  }
  return { places, reviews };
}
