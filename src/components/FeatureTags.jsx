import { FEATURES } from '../lib/constants.js';

/** Small tags for the facilities a place has. `limit` keeps list cards compact. */
export default function FeatureTags({ features, limit }) {
  const present = FEATURES.filter((f) => features?.[f.key]);
  const shown = limit ? present.slice(0, limit) : present;
  if (!present.length) return <p className="muted">No facilities listed yet.</p>;
  return (
    <ul className="tags">
      {shown.map((f) => (
        <li key={f.key} className="tag">
          <span aria-hidden="true">{f.glyph}</span> {f.short}
        </li>
      ))}
      {limit && present.length > limit && <li className="tag tag--more">+{present.length - limit}</li>}
    </ul>
  );
}
