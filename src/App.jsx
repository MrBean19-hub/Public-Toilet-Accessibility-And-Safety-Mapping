import { useCallback, useEffect, useMemo, useState } from 'react';
import AddPlaceModal from './components/AddPlaceModal.jsx';
import FilterBar from './components/FilterBar.jsx';
import MapView from './components/MapView.jsx';
import PlaceDetail from './components/PlaceDetail.jsx';
import PlaceList from './components/PlaceList.jsx';
import { CONFIG } from './config.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useNow } from './hooks/useNow.js';
import { usePlaces } from './hooks/usePlaces.js';
import { EMPTY_FILTERS, filterPlaces, sortPlaces } from './lib/filters.js';
import { haversineKm } from './lib/geo.js';
import { isNight } from './lib/scoring.js';

const TIME_MODES = [
  { key: 'auto', label: 'Auto' },
  { key: 'day', label: 'Day' },
  { key: 'night', label: 'Night' },
];

export default function App() {
  const now = useNow();
  const [timeMode, setTimeMode] = useState('auto');
  const night = timeMode === 'auto' ? isNight(new Date(now)) : timeMode === 'night';

  const { places, addReview, addPlace, resetCommunityData, knownHashes } = usePlaces({
    center: CONFIG.center,
    now,
    night,
    cooldownMin: CONFIG.reviewCooldownMin,
  });
  const geo = useGeolocation();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('best');
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState('map'); // mobile only: 'map' | 'list'
  const [mapCenter, setMapCenter] = useState(CONFIG.center);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');

  // Jump to the nearest-first sort once we know where the user is.
  useEffect(() => {
    if (geo.pos) setSort('nearest');
  }, [geo.pos]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const withDistance = useMemo(
    () => places.map((p) => ({ ...p, distanceKm: geo.pos ? haversineKm(geo.pos, p) : null })),
    [places, geo.pos],
  );
  const visible = useMemo(() => sortPlaces(filterPlaces(withDistance, filters), sort), [withDistance, filters, sort]);
  const selected = withDistance.find((p) => p.id === selectedId) ?? null;

  const select = useCallback((id) => {
    setSelectedId(id);
    setTab('list'); // on phones the detail lives in the list panel
  }, []);

  function handleAddPlace(place) {
    addPlace(place);
    setAdding(false);
    setSelectedId(place.id);
    setToast('Toilet added. Add the first review to build its score.');
  }

  return (
    <div className={`app${night ? ' is-night' : ''}`}>
      <a className="skip" href="#panel">Skip to results</a>

      <header className="topbar">
        <div className="brand">
          <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
            <path d="M32 8c-9 0-16 7-16 16 0 7 3 11 7 15v6h18v-6c4-4 7-8 7-15 0-9-7-16-16-16z" fill="#FFB020" />
            <rect x="24" y="48" width="16" height="6" rx="3" fill="#FFB020" />
            <path d="M25 25l5 6 9-11" stroke="#0F2F36" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h1>{CONFIG.appName}</h1>
            <p>Find a toilet you can trust</p>
          </div>
        </div>

        <div className="topbar__tools">
          <div className="seg" role="group" aria-label="Time of day for the safety score">
            {TIME_MODES.map((m) => (
              <button key={m.key} type="button" className={timeMode === m.key ? 'is-on' : ''} aria-pressed={timeMode === m.key} onClick={() => setTimeMode(m.key)}>
                {m.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn--accent" onClick={() => setAdding(true)}>Add a toilet</button>
        </div>
      </header>

      <main className="layout">
        <section id="panel" className={`panel${tab === 'list' ? ' is-active' : ''}`} aria-label="Places">
          {night && (
            <p className="banner">
              Night view is on: lighting and safety now count more in every score.
            </p>
          )}
          {geo.status === 'denied' && <p className="banner banner--warn">Location is blocked. Allow it in your browser settings to sort by distance.</p>}
          {geo.status === 'unsupported' && <p className="banner banner--warn">This browser can’t share your location.</p>}

          {selected ? (
            <PlaceDetail
              key={selected.id}
              place={selected}
              now={now}
              knownHashes={knownHashes}
              onBack={() => setSelectedId(null)}
              onAddReview={addReview}
              onToast={setToast}
            />
          ) : (
            <>
              <FilterBar
                filters={filters}
                onChange={setFilters}
                sort={sort}
                onSort={setSort}
                canSortNearest={Boolean(geo.pos)}
                onLocate={geo.request}
                locating={geo.status === 'loading'}
              />
              <PlaceList places={visible} selectedId={selectedId} onSelect={select} onClear={() => setFilters(EMPTY_FILTERS)} />
              <footer className="panel__foot">
                <p>Scores combine ratings, lighting, spatial safety and cleaning logs. Demo places are fictional.</p>
                <button type="button" className="link" onClick={() => { resetCommunityData(); setToast('Community data cleared.'); }}>
                  Reset my reviews and added places
                </button>
              </footer>
            </>
          )}
        </section>

        <section className={`mapwrap${tab === 'map' ? ' is-active' : ''}`} aria-label="Map">
          <MapView places={visible} selectedId={selectedId} onSelect={select} userPos={geo.pos} onMove={setMapCenter} visible={tab === 'map'} />
        </section>
      </main>

      <nav className="tabs" aria-label="Switch between map and list">
        <button type="button" className={tab === 'map' ? 'is-on' : ''} aria-pressed={tab === 'map'} onClick={() => setTab('map')}>Map</button>
        <button type="button" className={tab === 'list' ? 'is-on' : ''} aria-pressed={tab === 'list'} onClick={() => setTab('list')}>List ({visible.length})</button>
      </nav>

      {adding && <AddPlaceModal location={mapCenter} onSave={handleAddPlace} onClose={() => setAdding(false)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
