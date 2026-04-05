
import { useState, useCallback, useEffect } from 'react';

export const useGeolocation = (addLog: (log: any) => void) => {
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('synapse_last_location') || 'New York, NY';
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      addLog({ type: 'warning', module: 'GEO_LINK', message: 'Geospatial link denied. Geolocation not supported.' });
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation(locString);
        localStorage.setItem('synapse_last_location', locString);
        setIsDetectingLocation(false);
        addLog({ type: 'success', module: 'SYSTEM_GEOLOCATION', message: `Current location detected and synchronized: ${locString}` });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetectingLocation(false);
        addLog({ type: 'warning', module: 'SYSTEM_GEOLOCATION', message: `Geolocation failed: ${error.message}. Using last known preset.` });
      }
    );
  }, [addLog]);

  // Initial detection removed to prevent "Not allowed" error on page load without user gesture
  // detectLocation should only be called via user interaction
  useEffect(() => {
    // We can still try to load from localStorage, but don't call detectLocation()
  }, []);

  return {
    location,
    setLocation,
    isDetectingLocation,
    detectLocation
  };
};
