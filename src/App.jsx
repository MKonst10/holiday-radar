import { useEffect, useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { fetchHolidays } from "./services/holidaysAPI";
import HolidayList from "./components/HolidayList";

function App() {
  const { location, error } = useGeolocation();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!location) return;

      try {
        setLoading(true);
        const res = await fetch(
          `https://geocode.xyz/${location.lat},${location.lon}?geoit=json`
        );
        const geo = await res.json();
        const countryCode = geo.prov || "US";

        const holidaysData = await fetchHolidays(countryCode);
        setHolidays(holidaysData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [location]);

  if (error) return <p>Ошибка геолокации: {error}</p>;
  if (loading) return <p>Загрузка праздников...</p>;

  return <HolidayList holidays={holidays} />;
}

export default App;
