import { useEffect, useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { fetchHolidays } from "./services/holidaysAPI";
import HolidayList from "./components/HolidayList";
import radarIcon from "./assets/icons/radar.svg";
import Select from "react-select";
import { GlobeAltIcon as GlobalIcon } from "@heroicons/react/24/outline";
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
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [todayHolidays, setTodayHolidays] = useState([]);

  const ALL_COUNTRIES_OPTION = {
    value: "ALL",
    label: "All countries",
    code: "ALL",
  };

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
        {/* ) : null} */}

        <div className="header-buttons">
          <button
            onClick={() => {
              setShowFavorites((prev) => {
                const next = !prev;
                if (next) setShowTodayOnly(false);
                setCountryCode(null);
                return next;
              });
            }}
            className={`favorites-toggle`}
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
            {showTodayOnly ? "Explore All" : " What’s Today?"}
          </button>
        </div>

        {error && (
          <p className="error-message" style={{ marginTop: "10px" }}>
            {error}
          </p>
        )}
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
      />
    </div>
  );
}

export default App;
