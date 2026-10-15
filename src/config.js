const env = import.meta.env;
const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && value !== '' && value != null ? n : fallback;
};

/** Runtime configuration, read from VITE_* variables (see .env.example). */
export const CONFIG = {
  appName: env.VITE_APP_NAME || 'SafeStop',
  center: { lat: num(env.VITE_DEFAULT_LAT, 28.6139), lng: num(env.VITE_DEFAULT_LNG, 77.209) },
  zoom: num(env.VITE_DEFAULT_ZOOM, 13),
  tileUrl: env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  reviewCooldownMin: num(env.VITE_REVIEW_COOLDOWN_MIN, 5),
};
