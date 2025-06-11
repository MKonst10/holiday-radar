import { useEffect, useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { fetchHolidays } from "./services/holidaysAPI";
import HolidayList from "./components/HolidayList";
import radarIcon from "./assets/icons/radar.svg";
import Select from "react-select";
import "./App.css";

function App() {
  const {
    countryCode: detectedCountryCode,
    error,
    loading: geoLoading,
  } = useGeolocation();
  const [countryCode, setCountryCode] = useState("");
  const [countries, setCountries] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);

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
          .filter((c) => !["RU", "BY"].includes(c.countryCode))
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

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (holiday) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (h) => h.date === holiday.date && h.localName === holiday.localName
      );
      if (exists) {
        return prev.filter(
          (h) => !(h.date === holiday.date && h.localName === holiday.localName)
        );
      } else {
        return [...prev, holiday];
      }
    });
  };

  const countryOptions = countries.map((opt) => ({
    value: opt.code,
    label: opt.name,
    code: opt.code,
  }));

  const customSingleValue = ({ data }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img
        src={`https://flagcdn.com/w20/${data.code.toLowerCase()}.png`}
        alt=""
        style={{ width: "20px", height: "14px" }}
      />
      <span>{data.label}</span>
    </div>
  );

  const customOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 10px",
        }}
      >
        <img
          src={`https://flagcdn.com/w20/${data.code.toLowerCase()}.png`}
          alt=""
          style={{ width: "20px", height: "14px" }}
        />
        <span>{data.label}</span>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-wrap">
          <img src={radarIcon} alt="Radar" />
          <h1>Holiday Radar</h1>
        </div>
        <p>Explore upcoming holidays and plan your next adventure.</p>

        <Select
          options={countryOptions}
          onChange={(selected) => setCountryCode(selected.value)}
          value={countryOptions.find((opt) => opt.value === countryCode)}
          components={{ SingleValue: customSingleValue, Option: customOption }}
          placeholder="Select..."
          isSearchable={false}
          styles={{
            control: (base) => ({
              ...base,
              display: "flex",
              alignItems: "center",
              borderRadius: "12px",
            }),
            valueContainer: (base) => ({
              ...base,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }),
          }}
        />

        <button
          onClick={() => setShowFavorites((prev) => !prev)}
          className={`favorites-toggle`}
        >
          {showFavorites ? "Show All" : "Show Favorites"}
        </button>

        {error && (
          <p className="error-message" style={{ marginTop: "10px" }}>
            {error}
          </p>
        )}
      </div>

      <HolidayList
        holidays={showFavorites ? favorites : holidays}
        loading={loading || geoLoading}
        key={countryCode + showFavorites}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        showFavorites={showFavorites}
      />
    </div>
  );
}

export default App;
