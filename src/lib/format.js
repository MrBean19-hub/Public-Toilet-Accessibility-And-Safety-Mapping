export function formatDistance(km) {
  if (km == null) return '';
  return km < 1 ? `${Math.round(km * 1000 / 10) * 10} m` : `${km.toFixed(1)} km`;
}

/** "just now", "35 min ago", "5 h ago", "3 days ago" */
export function formatAgo(ms, now = Date.now()) {
  if (ms == null) return 'No cleaning logged';
  const mins = Math.max(0, Math.round((now - ms) / 60000));
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
