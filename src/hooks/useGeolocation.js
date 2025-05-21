import { useState, useEffect } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается");
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
        console.warn("Ошибка геолокации:", err.message);
        setLocation({ lat: 50.4501, lon: 30.5234 });
        setError("Геолокация недоступна, использовано значение по умолчанию");
      }
    );
  }, []);

  return { location, error };
};
