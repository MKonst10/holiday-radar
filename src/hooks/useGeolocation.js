import { useState, useEffect } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [countryCode, setCountryCode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://api.ipgeolocation.io/ipgeo?apiKey=${
            import.meta.env.VITE_IPGEO_API_KEY
          }`
        );
        const data = await res.json();

        if (data.country_code2 && data.latitude && data.longitude) {
          setLocation({
            lat: parseFloat(data.latitude),
            lon: parseFloat(data.longitude),
          });
          setCountryCode(data.country_code2);
          setError(null);
        } else {
          throw new Error("Incomplete IP geolocation data");
        }
      } catch (err) {
        console.warn("IP Geolocation error:", err.message);
        setError("Could not determine your location. Please choose manually.");
      }
    };

    fetchLocation();
  }, []);

  return { location, countryCode, error };
};
