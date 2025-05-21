import { useState, useEffect } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setLocation({ lat: 50.4501, lon: 30.5234 });
        setError("Geolocation is not available, default value is used");
      }
    );
  }, []);

  return { location, error };
};
