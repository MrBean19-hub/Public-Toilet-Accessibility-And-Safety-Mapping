import { formatAgo } from '../lib/format.js';

function Bar({ label, value, note }) {
  return (
    <li className="bar">
      <div className="bar__head">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="bar__track" role="presentation">
        <div className="bar__fill" style={{ width: `${value}%` }} />
      </div>
      {note && <p className="bar__note">{note}</p>}
    </li>
  );
}

/** Shows exactly how the score was built, so users can trust it. */
export default function ScoreBreakdown({ score, now }) {
  const c = score.components;
  return (
    <section aria-label="How this score is built">
      <h3>How this score is built</h3>
      <p className="muted">
        {score.night
          ? 'Night view: lighting and safety count more than hygiene.'
          : 'Day view: hygiene and safety are weighted about equally.'}
      </p>
      <ul className="bars">
        <Bar label="Hygiene" value={score.hygiene} />
        <Bar label="Safety" value={score.safety} />
        <Bar label="User ratings" value={c.rating} note={`${score.reviewCount} review${score.reviewCount === 1 ? '' : 's'}, recent and photo-verified ones count more`} />
        <Bar label="Cleaning log" value={c.cleaning} note={`Last cleaned: ${formatAgo(score.lastCleanedAt, now)}`} />
        <Bar label="Lighting" value={c.lighting} />
        <Bar label="Spatial safety" value={c.spatial} note="CCTV, staff nearby, women’s toilet, visible entrance, and how safe people felt" />
      </ul>
      {score.penalty > 0 && <p className="msg msg--bad">−{score.penalty} points for problems reported in the last 48 hours.</p>}
      <p className="muted">Confidence: {score.confidence.level}{score.confidence.level === 'low' ? '. Add a review to help.' : ''}</p>
    </section>
  );
}
