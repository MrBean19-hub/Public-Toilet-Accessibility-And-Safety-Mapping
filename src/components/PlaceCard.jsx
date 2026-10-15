import { PLACE_TYPES } from '../lib/constants.js';
import { formatDistance } from '../lib/format.js';
import FeatureTags from './FeatureTags.jsx';
import ScoreBadge from './ScoreBadge.jsx';

const typeLabel = (key) => PLACE_TYPES.find((t) => t.key === key)?.label ?? 'Toilet';

export default function PlaceCard({ place, selected, onSelect }) {
  return (
    <li>
      <button type="button" className={`card${selected ? ' is-selected' : ''}`} onClick={() => onSelect(place.id)} aria-pressed={selected}>
        <ScoreBadge score={place.score} />
        <span className="card__body">
          <span className="card__title">{place.name}</span>
          <span className="card__meta">
            {typeLabel(place.type)}
            {place.distanceKm != null && ` · ${formatDistance(place.distanceKm)} away`}
            {place.demo && ' · Demo data'}
          </span>
          <FeatureTags features={place.features} limit={4} />
        </span>
      </button>
    </li>
  );
}
