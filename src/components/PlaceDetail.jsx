import { useState } from 'react';
import { ISSUES, PLACE_TYPES } from '../lib/constants.js';
import { formatAgo, formatDistance } from '../lib/format.js';
import { directionsUrl } from '../lib/geo.js';
import FeatureTags from './FeatureTags.jsx';
import ReviewForm from './ReviewForm.jsx';
import ScoreBadge, { BAND_LABEL } from './ScoreBadge.jsx';
import ScoreBreakdown from './ScoreBreakdown.jsx';

const STATUS_LABEL = { verified: 'Photo verified', flagged: 'Photo flagged' };
const issueLabel = (key) => ISSUES.find((i) => i.key === key)?.label ?? key;

export default function PlaceDetail({ place, now, knownHashes, onBack, onAddReview, onToast }) {
  const [writing, setWriting] = useState(false);
  const typeLabel = PLACE_TYPES.find((t) => t.key === place.type)?.label ?? 'Toilet';

  function submitReview(review) {
    const result = onAddReview(review);
    if (result.ok) {
      setWriting(false);
      onToast('Review posted. The score has been updated.');
    }
    return result;
  }

  return (
    <article className="detail">
      <button type="button" className="link" onClick={onBack}>← All places</button>

      <header className="detail__head">
        <ScoreBadge score={place.score} size="lg" />
        <div>
          <h2>{place.name}</h2>
          <p className="muted">
            {typeLabel} · {place.address}
            {place.distanceKm != null && ` · ${formatDistance(place.distanceKm)} away`}
          </p>
          <p className={`verdict verdict--${place.score.band}`}>
            {BAND_LABEL[place.score.band]} · Cleaned {formatAgo(place.score.lastCleanedAt, now)}
          </p>
        </div>
      </header>

      <div className="detail__actions">
        <a className="btn btn--primary" href={directionsUrl(place)} target="_blank" rel="noopener noreferrer">Get directions</a>
        <button type="button" className="btn btn--ghost" onClick={() => setWriting(true)} disabled={writing}>Write a review</button>
      </div>

      {place.demo && <p className="msg">This is demo data for the prototype, not a real facility.</p>}

      {writing ? (
        <ReviewForm place={place} knownHashes={knownHashes} onSubmit={submitReview} onCancel={() => setWriting(false)} />
      ) : (
        <>
          <section aria-label="Facilities">
            <h3>Facilities</h3>
            <FeatureTags features={place.features} />
          </section>

          <ScoreBreakdown score={place.score} now={now} />

          <section aria-label="Reviews">
            <h3>Recent reviews</h3>
            {place.reviews.length === 0 && <p className="muted">No reviews yet. Be the first to help others.</p>}
            <ul className="reviews">
              {place.reviews.slice(0, 8).map((r) => (
                <li key={r.id} className="review">
                  <div className="review__head">
                    <strong>{r.rating}/5 clean</strong>
                    <span className="muted">{formatAgo(new Date(r.createdAt).getTime(), now)}</span>
                    {r.audit && STATUS_LABEL[r.audit.status] && (
                      <span className={`pill pill--${r.audit.status}`}>{STATUS_LABEL[r.audit.status]}</span>
                    )}
                  </div>
                  {r.photo?.thumb && <img className="review__photo" src={r.photo.thumb} alt="Photo uploaded with this review" />}
                  {r.comment && <p>{r.comment}</p>}
                  {r.issues?.length > 0 && <p className="review__issues">Reported: {r.issues.map(issueLabel).join(', ')}</p>}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </article>
  );
}
