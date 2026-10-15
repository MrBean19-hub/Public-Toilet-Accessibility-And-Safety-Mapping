const BAND_LABEL = { great: 'Great', okay: 'Okay', poor: 'Needs care' };
const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Circular score dial. Colour is never the only signal: the number and an aria-label carry the meaning. */
export default function ScoreBadge({ score, size = 'md' }) {
  return (
    <div
      className={`score score--${score.band} score--${size}`}
      role="img"
      aria-label={`Score ${score.overall} out of 100: ${BAND_LABEL[score.band]}`}
    >
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle className="score__track" cx="26" cy="26" r={RADIUS} />
        <circle
          className="score__arc"
          cx="26"
          cy="26"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - score.overall / 100)}
          transform="rotate(-90 26 26)"
        />
      </svg>
      <span className="score__value">{score.overall}</span>
    </div>
  );
}

export { BAND_LABEL };
