import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPlaces, sortPlaces, isWomenSafe, EMPTY_FILTERS } from '../src/lib/filters.js';
import { haversineKm } from '../src/lib/geo.js';
import { formatDistance, formatAgo } from '../src/lib/format.js';

const mk = (name, features, safety, overall, distanceKm) => ({
  name, address: 'x', type: 'public', features, distanceKm, score: { safety, overall },
});
const places = [
  mk('A', { wheelchair: true, padVending: true, genderSeparate: true }, 80, 90, 2),
  mk('B', { wheelchair: true }, 40, 50, 0.5),
  mk('C', { babyChanging: true, staffPresent: true }, 70, 70, 1),
];

test('feature filters require every selected feature', () => {
  const out = filterPlaces(places, { ...EMPTY_FILTERS, features: ['wheelchair', 'padVending'] });
  assert.deepEqual(out.map((p) => p.name), ['A']);
});

test('women-safe mode needs a high safety score and women’s toilet or staff', () => {
  assert.equal(isWomenSafe(places[0]), true);
  assert.equal(isWomenSafe(places[1]), false);
  const out = filterPlaces(places, { ...EMPTY_FILTERS, womenSafe: true });
  assert.deepEqual(out.map((p) => p.name), ['A', 'C']);
});

test('text search matches name, case-insensitively', () => {
  const named = [mk('Lotus Garden', {}, 50, 50, 1), mk('Bus Stand', {}, 50, 50, 1)];
  const out = filterPlaces(named, { ...EMPTY_FILTERS, query: ' lotus ' });
  assert.deepEqual(out.map((p) => p.name), ['Lotus Garden']);
});

test('sorting by best, safest and nearest', () => {
  assert.equal(sortPlaces(places, 'best')[0].name, 'A');
  assert.equal(sortPlaces(places, 'safest')[0].name, 'A');
  assert.equal(sortPlaces(places, 'nearest')[0].name, 'B');
});

test('haversine distance is about 111 km per degree of latitude', () => {
  const d = haversineKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
  assert.ok(Math.abs(d - 111.2) < 0.5);
});

test('formatters', () => {
  assert.equal(formatDistance(0.43), '430 m');
  assert.equal(formatDistance(2.46), '2.5 km');
  assert.equal(formatAgo(Date.now() - 5 * 3_600_000), '5 h ago');
});
