import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { CONFIG } from '../config.js';

function pinIcon(place, selected) {
  // Only numbers go into this HTML string; names are added via textContent below (no XSS).
  return L.divIcon({
    className: 'pin-wrap',
    html: `<div class="pin pin--${place.score.band}${selected ? ' pin--selected' : ''}">${place.score.overall}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export default function MapView({ places, selectedId, onSelect, userPos, onMove, visible }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const userRef = useRef(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  // Create the map once.
  useEffect(() => {
    const map = L.map(elRef.current, { zoomControl: true }).setView([CONFIG.center.lat, CONFIG.center.lng], CONFIG.zoom);
    L.tileLayer(CONFIG.tileUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    map.on('moveend', () => {
      const c = map.getCenter();
      onMoveRef.current?.({ lat: c.lat, lng: c.lng });
    });
    mapRef.current = map;
    onMoveRef.current?.({ lat: CONFIG.center.lat, lng: CONFIG.center.lng });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw score pins whenever places or selection change.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const p of places) {
      const marker = L.marker([p.lat, p.lng], { icon: pinIcon(p, p.id === selectedId), keyboard: true, title: p.name });
      const tip = document.createElement('span');
      tip.textContent = `${p.name} · ${p.score.overall}/100`;
      marker.bindTooltip(tip, { direction: 'top', offset: [0, -16] });
      marker.on('click', () => onSelect(p.id));
      marker.addTo(layer);
    }
  }, [places, selectedId, onSelect]);

  // Fly to the selected place.
  useEffect(() => {
    const map = mapRef.current;
    const place = places.find((p) => p.id === selectedId);
    if (map && place) map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Show the user's position.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPos) return;
    userRef.current?.remove();
    userRef.current = L.circleMarker([userPos.lat, userPos.lng], {
      radius: 9, color: '#fff', weight: 3, fillColor: '#1d6fd8', fillOpacity: 1,
    }).addTo(map);
    map.flyTo([userPos.lat, userPos.lng], 15, { duration: 0.8 });
  }, [userPos]);

  // The map needs a size refresh when its container becomes visible (mobile tab switch).
  useEffect(() => {
    if (visible) setTimeout(() => mapRef.current?.invalidateSize(), 60);
  }, [visible]);

  return <div ref={elRef} className="map" role="application" aria-label="Map of toilets, each pin shows its score" />;
}
