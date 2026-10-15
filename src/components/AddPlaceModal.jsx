import { useEffect, useState } from 'react';
import { FEATURES, PLACE_TYPES } from '../lib/constants.js';

/** Crowd-sourced mapping: add a toilet at the centre of the map (pan the map first). */
export default function AddPlaceModal({ location, onSave, onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('public');
  const [features, setFeatures] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function submit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 3) return setError('Enter a name with at least 3 characters.');
    onSave({
      id: `p-${Date.now().toString(36)}`,
      name: trimmed.slice(0, 80),
      type,
      lat: location.lat,
      lng: location.lng,
      address: 'Added by the community',
      lightingBase: 3,
      features,
      lastCleanedAt: null,
      demo: false,
    });
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title">
      <form className="modal__panel form" onSubmit={submit} noValidate>
        <h2 id="add-title">Add a toilet</h2>
        <p className="muted">It will be placed at the centre of the map ({location.lat.toFixed(4)}, {location.lng.toFixed(4)}). Close this window and pan the map if the spot is wrong.</p>

        <label className="field">
          <span>Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Station Road public toilet" autoFocus />
        </label>

        <label className="field">
          <span>Type</span>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {PLACE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </label>

        <fieldset className="issues">
          <legend>Facilities</legend>
          <div className="checks">
            {FEATURES.map((f) => (
              <label key={f.key} className="check">
                <input type="checkbox" checked={Boolean(features[f.key])} onChange={(e) => setFeatures({ ...features, [f.key]: e.target.checked })} />
                <span>{f.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="msg msg--bad" role="alert">{error}</p>}
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">Add toilet</button>
        </div>
      </form>
    </div>
  );
}
