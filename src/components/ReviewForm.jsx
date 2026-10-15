import { useMemo, useState } from 'react';
import { ISSUES } from '../lib/constants.js';
import { evaluatePhoto } from '../lib/imageAudit.js';
import { auditImageFile } from '../lib/imageAudit.browser.js';
import RatingInput from './RatingInput.jsx';

const MAX_COMMENT = 280;

export default function ReviewForm({ place, knownHashes, onSubmit, onCancel }) {
  const [hygiene, setHygiene] = useState(0);
  const [lighting, setLighting] = useState(0);
  const [safety, setSafety] = useState(0);
  const [cleanedRecently, setCleanedRecently] = useState(false);
  const [issues, setIssues] = useState([]);
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState(null); // { metrics, thumbnail, name }
  const [photoError, setPhotoError] = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState('');

  // Re-evaluate the photo whenever the rating changes, so the consistency check stays live.
  const audit = useMemo(
    () => (photo ? evaluatePhoto(photo.metrics, { claimedRating: hygiene || null, knownHashes }) : null),
    [photo, hygiene, knownHashes],
  );
  const photoBlocksSubmit = audit && (audit.status === 'retake' || audit.status === 'duplicate');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError('');
    setAnalysing(true);
    try {
      const { metrics, thumbnail } = await auditImageFile(file);
      setPhoto({ metrics, thumbnail, name: file.name });
    } catch (err) {
      setPhoto(null);
      setPhotoError(err.message);
    } finally {
      setAnalysing(false);
    }
  }

  function toggleIssue(key) {
    setIssues((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));
  }

  function submit(e) {
    e.preventDefault();
    if (!hygiene) return setError('Rate how clean the toilet was (1 to 5).');
    if (photoBlocksSubmit) return setError('Retake or remove the photo before posting.');
    const review = {
      id: `u-${Date.now().toString(36)}`,
      placeId: place.id,
      rating: hygiene,
      lighting: lighting || null,
      safety: safety || null,
      comment: comment.trim().slice(0, MAX_COMMENT),
      cleanedRecently,
      issues,
      photo: photo ? { thumb: photo.thumbnail } : null,
      audit: audit ? { status: audit.status, cleanliness: audit.cleanliness, message: audit.message } : null,
      hash: photo?.metrics.hash ?? null,
      createdAt: new Date().toISOString(),
    };
    const result = onSubmit(review);
    if (!result.ok) setError(result.error);
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h3>Review {place.name}</h3>

      <RatingInput legend="How clean was it?" name="hygiene" value={hygiene} onChange={setHygiene} low="Very dirty" high="Spotless" />
      <RatingInput legend="How well lit was it?" name="lighting" value={lighting} onChange={setLighting} low="Dark" high="Bright" optional />
      <RatingInput legend="How safe did you feel?" name="safety" value={safety} onChange={setSafety} low="Unsafe" high="Very safe" optional />

      <label className="check">
        <input type="checkbox" checked={cleanedRecently} onChange={(e) => setCleanedRecently(e.target.checked)} />
        <span>I saw today’s cleaning log signed by staff</span>
      </label>

      <fieldset className="issues">
        <legend>Any problems? <span className="muted">(optional)</span></legend>
        <div className="chips">
          {ISSUES.map((i) => (
            <button key={i.key} type="button" className={`chip chip--warn${issues.includes(i.key) ? ' is-on' : ''}`} aria-pressed={issues.includes(i.key)} onClick={() => toggleIssue(i.key)}>
              {i.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="photo">
        <label className="btn btn--ghost photo__btn">
          {photo ? 'Replace photo' : 'Add a photo for the AI audit'}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="sr-only" />
        </label>
        <p className="hint">Photos are analysed on your device and used only to verify your review. Please avoid including people.</p>
        {analysing && <p role="status">Checking photo…</p>}
        {photoError && <p className="msg msg--bad" role="alert">{photoError}</p>}
        {photo && audit && (
          <div className={`audit audit--${audit.status}`} role="status">
            <img src={photo.thumbnail} alt="Your uploaded toilet photo" width="96" height="96" />
            <div>
              <strong>{{ verified: 'Verified', flagged: 'Flagged', retake: 'Retake needed', duplicate: 'Duplicate photo' }[audit.status]}</strong>
              <p>{audit.message}</p>
              {audit.status !== 'retake' && <p className="muted">Estimated cleanliness from the photo: {audit.cleanliness}/100</p>}
              <button type="button" className="link" onClick={() => setPhoto(null)}>Remove photo</button>
            </div>
          </div>
        )}
      </div>

      <label className="field">
        <span>Comment <span className="muted">(optional, {comment.length}/{MAX_COMMENT})</span></span>
        <textarea className="input" rows="3" maxLength={MAX_COMMENT} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="e.g. Attendant on duty, ramp at the side entrance" />
      </label>

      {error && <p className="msg msg--bad" role="alert">{error}</p>}

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Post review</button>
      </div>
    </form>
  );
}
