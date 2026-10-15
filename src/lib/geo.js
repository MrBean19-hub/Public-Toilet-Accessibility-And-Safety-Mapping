const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

/** Great-circle distance between two {lat, lng} points in kilometres. */
export function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Google Maps walking directions link (opens the user's maps app on phones). */
export function directionsUrl(place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=walking`;
}
