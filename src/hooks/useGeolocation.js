import { useState, useEffect } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const requestGeolocation = (attempt = 1) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Geolocation SUCCESS:", position.coords);
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setError(null);
        },
        (err) => {
          console.warn(`Geolocation attempt ${attempt} failed:`, err.message);
          if (attempt === 1) {
            requestGeolocation(2);
          } else {
            setError("Geolocation failed. Please select a country manually.");
          }
        },
        {
          timeout: 7000,
          enableHighAccuracy: true,
        }
      );
    };

    requestGeolocation();
  }, []);

  return { location, error };
};
