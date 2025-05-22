import { useEffect, useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { fetchHolidays } from "./services/holidaysAPI";
import HolidayList from "./components/HolidayList";
import radarIcon from "./assets/icons/radar.svg";
import "./App.css";

function App() {
  const {
    location,
    countryCode: detectedCountryCode,
    error,
  } = useGeolocation();

  const [countryCode, setCountryCode] = useState("");
  const [countries, setCountries] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (detectedCountryCode && !countryCode) {
      setCountryCode(detectedCountryCode);
    }
  }, [detectedCountryCode, countryCode]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://date.nager.at/api/v3/AvailableCountries"
        );
        const data = await res.json();
        const parsed = data
          .map((c) => ({
            code: c.countryCode,
            name: c.name,
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
        <div className="header-wrap">
          <img src={radarIcon} alt="Radar" />
          <h1>Holiday Radar</h1>
        </div>
        <p>View upcoming public holidays by country</p>

        <div className="country-select">
          <label htmlFor="country">Choose a country: </label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {countryCode && (
              <img
                src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
                alt={`${countryCode} flag`}
                className="flag-icon"
              />
            )}
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

        {error && (
          <p className="error-message" style={{ marginTop: "10px" }}>
            {error}
          </p>
        )}
      </div>

      {loading && <p className="loading-message">Loading holidays...</p>}
      {!loading && <HolidayList holidays={holidays} />}
    </div>
  );
}

export default App;
