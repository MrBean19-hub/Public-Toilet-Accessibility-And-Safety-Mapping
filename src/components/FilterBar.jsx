import { FEATURES, FILTER_FEATURE_KEYS } from '../lib/constants.js';

export default function FilterBar({ filters, onChange, sort, onSort, canSortNearest, onLocate, locating }) {
  const toggleFeature = (key) => {
    const has = filters.features.includes(key);
    onChange({ ...filters, features: has ? filters.features.filter((k) => k !== key) : [...filters.features, key] });
  };
  const chips = FEATURES.filter((f) => FILTER_FEATURE_KEYS.includes(f.key));

  return (
    <section className="filters" aria-label="Search and filters">
      <div className="filters__row">
        <label className="sr-only" htmlFor="search">Search places</label>
        <input
          id="search"
          type="search"
          className="input"
          placeholder="Search by name or area"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
        />
        <button type="button" className="btn btn--ghost" onClick={onLocate} disabled={locating}>
          {locating ? 'Locating…' : 'Near me'}
        </button>
      </div>

      <div className="chips" role="group" aria-label="Must have">
        {chips.map((f) => {
          const on = filters.features.includes(f.key);
          return (
            <button key={f.key} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggleFeature(f.key)}>
              <span aria-hidden="true">{f.glyph}</span> {f.label}
            </button>
          );
        })}
      </div>

      <div className="filters__row filters__row--split">
        <label className="switch">
          <input type="checkbox" checked={filters.womenSafe} onChange={(e) => onChange({ ...filters, womenSafe: e.target.checked })} />
          <span className="switch__track" aria-hidden="true" />
          <span>
            Women-safe mode
            <small>Strong safety score plus a women’s toilet or staff nearby</small>
          </span>
        </label>
        <label className="select">
          <span className="sr-only">Sort places by</span>
          <select value={sort} onChange={(e) => onSort(e.target.value)}>
            <option value="best">Best overall</option>
            <option value="safest">Safest first</option>
            <option value="nearest" disabled={!canSortNearest}>Nearest{canSortNearest ? '' : ' (tap Near me)'}</option>
          </select>
        </label>
      </div>
    </section>
  );
}
