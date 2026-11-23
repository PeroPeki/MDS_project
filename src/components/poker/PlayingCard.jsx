/** Both faces stay decorative; the surrounding button/seat supplies the accessible name. */
export default function PlayingCard({ value, faceUp = true, className = '' }) {
  return (
    <span className={`poker-playing-card ${faceUp ? 'is-face-up' : ''} ${className}`} aria-hidden="true">
      <span className="poker-card-rotator">
        <span className="poker-card-front">
          <span className="poker-card-corner">{value}<small>♦</small></span>
          <span className="poker-card-value">{value}</span>
          <span className="poker-card-corner is-bottom">{value}<small>♦</small></span>
          <span className="poker-card-signature">SPRINT QUEST</span>
        </span>
        <span className="poker-card-back"><span className="poker-card-crest">SQ<small>THINK · DISCUSS · GROW</small></span></span>
      </span>
    </span>
  );
}
