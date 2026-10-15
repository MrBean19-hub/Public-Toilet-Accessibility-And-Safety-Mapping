import PlaceCard from './PlaceCard.jsx';

export default function PlaceList({ places, selectedId, onSelect, onClear }) {
  if (!places.length) {
    return (
      <div className="empty">
        <h3>No places match these filters</h3>
        <p>Try removing a filter or turning off women-safe mode.</p>
        <button type="button" className="btn btn--ghost" onClick={onClear}>Clear filters</button>
      </div>
    );
  }
  return (
    <ul className="list" aria-label={`${places.length} places`}>
      {places.map((p) => (
        <PlaceCard key={p.id} place={p} selected={p.id === selectedId} onSelect={onSelect} />
      ))}
    </ul>
  );
}
