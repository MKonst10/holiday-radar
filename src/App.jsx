import { useEffect, useRef, useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { fetchHolidays } from "./services/holidaysAPI";
import HolidayList from "./components/HolidayList";
import radarIcon from "./assets/icons/radar.svg";
import radarIconWhite from "./assets/icons/radar-w.svg";
import Select from "react-select";
import {
  GlobeAltIcon as GlobalIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import useTheme from "./hooks/useTheme";
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
  const { theme, themeMode, setThemeMode } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [defaultCountry, setDefaultCountry] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("defaultCountry") || "";
  });
  const [dataFreshnessMode, setDataFreshnessMode] = useState(() => {
    if (typeof window === "undefined") return "auto";
    return localStorage.getItem("dataFreshnessMode") || "auto";
  });
  const [refreshToken, setRefreshToken] = useState(0);
  const settingsRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [todayHolidays, setTodayHolidays] = useState([]);

  const ALL_COUNTRIES_OPTION = {
    value: "ALL",
    label: "All countries",
    code: "ALL",
  };

  useEffect(() => {
    if (countryCode) return;
    if (defaultCountry) {
      setCountryCode(defaultCountry);
      return;
    }
    if (detectedCountryCode) {
      setCountryCode(detectedCountryCode);
    }
  }, [defaultCountry, detectedCountryCode, countryCode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (defaultCountry) {
      localStorage.setItem("defaultCountry", defaultCountry);
    } else {
      localStorage.removeItem("defaultCountry");
    }
  }, [defaultCountry]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("dataFreshnessMode", dataFreshnessMode);
  }, [dataFreshnessMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSettings &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target)
      ) {
        setShowSettings(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showSettings]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://date.nager.at/api/v3/AvailableCountries",
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

  const getCountryNameByCode = (code, countryList) => {
    const match = countryList.find((c) => c.code === code);
    return match ? match.name : code;
  };

  useEffect(() => {
    if (countries.length === 0) return;

    const loadTodayHolidays = async () => {
      const today = new Date().toISOString().split("T")[0];

      try {
        const allHolidayFetches = countries.map(async (country) => {
          const url = `https://date.nager.at/api/v3/PublicHolidays/${new Date().getFullYear()}/${
            country.code
          }`;
          const holidays = await fetch(url)
            .then((res) => res.json())
            .catch(() => []);
          return holidays
            .filter((h) => h.date === today)
            .map((h) => ({
              ...h,
              country:
                h.country ||
                country.name ||
                getCountryNameByCode(country.code, countries),
              countryCode: country.code,
            }));
        });

        const results = await Promise.all(allHolidayFetches);
        const merged = results.flat();
        setTodayHolidays(merged);
      } catch (e) {
        console.error("Failed to fetch today’s holidays:", e);
        setTodayHolidays([]);
      }
    };

    loadTodayHolidays();
  }, [countries]);

  useEffect(() => {
    const load = async () => {
      if (!countryCode) return;
      if (dataFreshnessMode === "manual" && refreshToken === 0) return;
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
  }, [countryCode, dataFreshnessMode, refreshToken]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (holiday) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (h) => h.date === holiday.date && h.localName === holiday.localName,
      );

      if (exists) {
        return prev.filter(
          (h) =>
            !(h.date === holiday.date && h.localName === holiday.localName),
        );
      } else {
        const countryCode = holiday.countryCode || holiday.country?.code || "";
        const countryName =
          holiday.country || getCountryNameByCode(countryCode, countries) || "";

        return [
          ...prev,
          {
            ...holiday,
            country: countryName,
            countryCode,
          },
        ];
      }
    });
  };

  const countryOptions = countries.map((opt) => ({
    value: opt.code,
    label: opt.name,
    code: opt.code,
  }));

  const customSingleValue = ({ data }) => {
    const isAll = data.value === "ALL";

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {isAll ? (
          <GlobalIcon className="icon" />
        ) : (
          <img
            src={`https://flagcdn.com/w20/${data.code.toLowerCase()}.png`}
            alt=""
            style={{ width: "20px", height: "14px" }}
          />
        )}
        <span>{data.label}</span>
      </div>
    );
  };

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
          color: "var(--text)",
          background: "var(--surface)",
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

  const selectStyles = {
    control: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      borderRadius: "12px",
      background: "var(--surface)",
      borderColor: "var(--border)",
      color: "var(--text)",
      boxShadow: "none",
      minHeight: "44px",
      "&:hover": { borderColor: "var(--border)" },
    }),
    valueContainer: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "var(--text)",
    }),
    SingleValue: (base) => ({
      ...base,
      color: "var(--text)",
    }),
    menu: (base) => ({
      ...base,
      background: "var(--surface)",
      color: "var(--text)",
      border: "1px solid var(--border)",
      boxShadow: "0 8px 16px var(--shadow)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--button-hover)"
        : "var(--surface)",
      color: "var(--text)",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "var(--button-hover)",
      },
    }),
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-wrap">
          <img
            src={theme === "dark" ? radarIconWhite : radarIcon}
            alt="Radar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = radarIcon;
            }}
          />
          <h1>Holiday Radar</h1>
        </div>
        <p>Explore upcoming holidays and plan your next adventure.</p>

        {/* {showTodayOnly === false && showFavorites === false ? ( */}
        <Select
          options={countryOptions}
          onChange={(selected) => setCountryCode(selected.value)}
          value={
            showFavorites || showTodayOnly
              ? ALL_COUNTRIES_OPTION
              : countryOptions.find((opt) => opt.value === countryCode)
          }
          isDisabled={showFavorites || showTodayOnly}
          components={{
            SingleValue: customSingleValue,
            Option: customOption,
          }}
          placeholder="Select..."
          isSearchable={false}
          styles={selectStyles}
        />
        {/* ) : null} */}

        <div className="header-buttons">
          <button
            type="button"
            ref={settingsButtonRef}
            className="settings-toggle"
            onClick={() => setShowSettings((prev) => !prev)}
            aria-expanded={showSettings}
            aria-label="Open settings"
          >
            <Cog6ToothIcon className="settings-icon" />
          </button>
          {/* <button
            type="button"
            className="refresh-button"
            onClick={() => setRefreshToken((prev) => prev + 1)}
          >
            Refresh
          </button> */}
          <button
            onClick={() => {
              setShowFavorites((prev) => {
                const next = !prev;
                if (next) setShowTodayOnly(false);
                setCountryCode(null);
                return next;
              });
            }}
            className="favorites-toggle"
          >
            {showFavorites ? "Explore All" : "My Favorites"}
          </button>
          <button
            onClick={async () => {
              setShowTodayOnly((prev) => {
                const next = !prev;
                if (next) setShowFavorites(false);
                setCountryCode("");
                return next;
              });
            }}
            className="today-toggle"
          >
            {showTodayOnly ? "Explore All" : "What’s Today?"}
          </button>
        </div>

        {showSettings && (
          <div className="settings-modal-overlay">
            <div ref={settingsRef} className="settings-panel">
              <div className="settings-panel__header">
                <h2>Settings</h2>
                <button
                  type="button"
                  className="settings-close"
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                >
                  <XMarkIcon className="settings-close-icon" />
                </button>
              </div>
              <div className="settings-row">
                <p className="settings-label">Theme</p>
                <div className="settings-options">
                  <label className="settings-option">
                    <input
                      type="radio"
                      name="themeMode"
                      value="system"
                      checked={themeMode === "system"}
                      onChange={() => setThemeMode("system")}
                    />
                    <span>System</span>
                  </label>
                  <label className="settings-option">
                    <input
                      type="radio"
                      name="themeMode"
                      value="light"
                      checked={themeMode === "light"}
                      onChange={() => setThemeMode("light")}
                    />
                    <span>Light</span>
                  </label>
                  <label className="settings-option">
                    <input
                      type="radio"
                      name="themeMode"
                      value="dark"
                      checked={themeMode === "dark"}
                      onChange={() => setThemeMode("dark")}
                    />
                    <span>Dark</span>
                  </label>
                </div>
              </div>
              <div className="settings-row">
                <p className="settings-label">Default country</p>
                <select
                  className="settings-select"
                  value={defaultCountry}
                  onChange={(event) => setDefaultCountry(event.target.value)}
                >
                  <option value="">Device country</option>
                  {countryOptions.map((option) => (
                    <option key={option.code} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* <div className="settings-row">
                <p className="settings-label">Data freshness</p>
                <div className="settings-options">
                  <label className="settings-option">
                    <input
                      type="radio"
                      name="dataFreshnessMode"
                      value="auto"
                      checked={dataFreshnessMode === "auto"}
                      onChange={() => setDataFreshnessMode("auto")}
                    />
                    <span>Auto refresh on start</span>
                  </label>
                  <label className="settings-option">
                    <input
                      type="radio"
                      name="dataFreshnessMode"
                      value="manual"
                      checked={dataFreshnessMode === "manual"}
                      onChange={() => setDataFreshnessMode("manual")}
                    />
                    <span>Manual refresh only</span>
                  </label>
                </div>
              </div>
              <p className="settings-note">
                Click Refresh to load holidays when manual mode is active.
              </p> */}
            </div>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>

      <HolidayList
        holidays={
          showTodayOnly ? todayHolidays : showFavorites ? favorites : holidays
        }
        loading={loading || geoLoading}
        key={countryCode + showFavorites}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        showFavorites={showFavorites}
        showTodayOnly={showTodayOnly}
        showToday={true}
        theme={theme}
      />
    </div>
  );
}

export default App;
