import { useEffect, useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { fetchHolidays } from "./services/holidaysAPI";
import HolidayList from "./components/HolidayList";
import "./App.css";

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
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lon}&localityLanguage=en`
        );
        const geoData = await res.json();
        const countryCode = geoData.countryCode || "US";
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

  console.log("Holidays:", holidays);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🌍 GeoHolidays</h1>
        <p>Upcoming holidays near you</p>
      </div>

      {error && <p className="error-message">Geolocation error: {error}</p>}
      {loading && <p className="loading-message">Loading holidays...</p>}

      {!loading && holidays.length > 0 && <HolidayList holidays={holidays} />}
    </div>
  );
}

export default App;
