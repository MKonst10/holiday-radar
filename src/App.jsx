import { useEffect, useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { fetchHolidays } from "./services/holidaysAPI";
import HolidayList from "./components/HolidayList";
import "./App.css";

function App() {
  const { location } = useGeolocation();
  const [countryCode, setCountryCode] = useState("");
  const [countries, setCountries] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all");
        const data = await res.json();
        const parsed = data
          .filter((c) => c.cca2 && c.name?.common)
          .map((c) => ({
            code: c.cca2,
            name: c.name.common,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(parsed);
      } catch (e) {
        console.error("Error loading country list:", e);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    const detectCountry = async () => {
      if (!location || countryCode) return;

      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lon}&localityLanguage=en`
        );
        const geo = await res.json();
        if (geo.countryCode) setCountryCode(geo.countryCode);
      } catch (e) {
        console.warn("Could not resolve country code");
      }
    };
    detectCountry();
  }, [location, countryCode]);

  useEffect(() => {
    const load = async () => {
      if (!countryCode) return;
      try {
        setLoading(true);
        const data = await fetchHolidays(countryCode);
        setHolidays(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [countryCode]);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🌍 GeoHolidays</h1>
        <p>View upcoming public holidays by country</p>

        <div className="country-select">
          <label htmlFor="country">Choose a country: </label>
          <select
            id="country"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            <option value="" disabled>
              Select...
            </option>
            {countries.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="loading-message">Loading holidays...</p>}
      {!loading && <HolidayList holidays={holidays} />}
    </div>
  );
}

export default App;
