import { useCallback, useState } from 'react';

/**
 * Ask the browser for the user's position, only when the user taps the button.
 * status: 'idle' | 'loading' | 'ready' | 'denied' | 'unsupported'
 */
export function useGeolocation() {
  const [pos, setPos] = useState(null);
  const [status, setStatus] = useState('idle');

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus('ready');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { pos, status, request };
}
