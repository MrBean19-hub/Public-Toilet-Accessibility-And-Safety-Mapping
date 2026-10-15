/** Accessible 1-5 rating built from radio buttons (keyboard and screen-reader friendly). */
export default function RatingInput({ legend, name, value, onChange, low, high, optional }) {
  return (
    <fieldset className="rating">
      <legend>
        {legend}
        {optional && <span className="muted"> (optional)</span>}
      </legend>
      <div className="rating__row">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`rating__opt${value === n ? ' is-on' : ''}`}>
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
            <span aria-hidden="true">{n}</span>
            <span className="sr-only">{n} out of 5</span>
          </label>
        ))}
      </div>
      {(low || high) && (
        <p className="rating__ends" aria-hidden="true">
          <span>{low}</span>
          <span>{high}</span>
        </p>
      )}
    </fieldset>
  );
}
