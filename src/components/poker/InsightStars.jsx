import Icon from '../Icon.jsx';

export default function InsightStars({ count, victory = false }) {
  return (
    <div className={`poker-insights${victory ? ' is-victory' : ''}`}>
      <div className="poker-star-icons" role="img" aria-label={`${count} of 3 Insight Stars`}>
        {[1, 2, 3].map((star) => <span key={star} className={star <= count ? 'is-earned' : ''}
          style={{ '--star-order': star }}><Icon name="star" /></span>)}
      </div>
      <div><strong>{count}<span> / 3</span></strong><small>Insight Stars</small></div>
    </div>
  );
}
