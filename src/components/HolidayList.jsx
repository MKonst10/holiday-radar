import { useState } from "react";
import RadarLoader from "./RadarLoader";
import HolidayModal from "./HolidayModal";
import {
  StarIcon as StarIconOutline,
  SparklesIcon as TodayIcon,
  BuildingLibraryIcon as RegionalIcon,
  GlobeAltIcon as GlobalIcon,
  ClockIcon as TimeLeftIcon,
} from "@heroicons/react/24/outline";
import {
  AcademicCapIcon as SchoolIcon,
  BanknotesIcon as BankIcon,
  BuildingOfficeIcon as AuthoritiesIcon,
  CalendarDaysIcon as CalendarIcon,
  EyeIcon as ObservanceIcon,
  SparklesIcon as OptionalIcon,
  StarIcon as StarIconSolid,
  SunIcon as PublicIcon,
} from "@heroicons/react/24/solid";
import "./HolidayList.css";

const HolidayList = ({ holidays, loading, favorites, onToggleFavorite, showFavorites }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const handleCardClick = (holiday) => {
    setSelectedHoliday(holiday);
  };

  const isFavorite = (holiday) =>
    favorites.some(
      (h) => h.date === holiday.date && h.localName === holiday.localName
    );

  const getTypeIcon = (type) => {
    switch (type) {
      case "Public":
        return <PublicIcon className="icon" />;
      case "Bank":
        return <BankIcon className="icon" />;
      case "School":
        return <SchoolIcon className="icon" />;
      case "Authorities":
        return <AuthoritiesIcon className="icon" />;
      case "Optional":
        return <OptionalIcon className="icon" />;
      case "Observance":
        return <ObservanceIcon className="icon" />;
      default:
        return <CalendarIcon className="icon" />;
    }
  };

  if (loading) return <RadarLoader content="list" />;
  if ((!holidays || holidays.length === 0) && loading) return null;
  if (!holidays || holidays.length === 0) {
  return (
    <p className="empty-message">
      {showFavorites ? "No favorite holidays yet." : "No holidays to show."}
    </p>
  );
}


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = holidays
    .filter((h) => new Date(h.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const visible = upcoming.slice(0, visibleCount);

  const getDaysLeft = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    return rtf.format(diffDays, "day");
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5);
  };


  return (
    <>
      <div className="holiday-grid">
        {visible.map((holiday) => {
          const holidayDate = new Date(holiday.date);
          holidayDate.setHours(0, 0, 0, 0);
          const isToday = holidayDate.getTime() === today.getTime();

          return (
            <div
              key={`${holiday.date}-${holiday.localName}`}
              className={isToday ? "holiday-card today" : "holiday-card"}
              onClick={() => handleCardClick(holiday)}
            >
              <h3>{holiday.localName}</h3>
              <p className="en-name">{holiday.name}</p>
              <div
                className="favorite-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(holiday);
                }}
              >
                {isFavorite(holiday) ? (
                  <StarIconSolid className="favorite-icon active" />
                ) : (
                  <StarIconOutline className="favorite-icon" />
                )}
              </div>

              <div className="date-row">
                <span className="date">
                  {holidayDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {isToday ? (
                  <span className="today-badge">
                    <TodayIcon className="icon" /> Today
                  </span>
                ) : (
                  <span className="days-left">
                    <TimeLeftIcon className="icon" />
                    {getDaysLeft(holiday.date)}
                  </span>
                )}
              </div>
              <p className="type">
                {holiday.global ? (
                  <>
                    <GlobalIcon className="icon" /> Global holiday
                  </>
                ) : (
                  <>
                    <RegionalIcon className="icon" /> Regional holiday
                  </>
                )}
              </p>
              <div className="tags">
                {holiday.types?.map((type) => (
                  <span key={type} className="tag">
                    {getTypeIcon(type)} {type}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < upcoming.length && (
        <div className="toggle-wrapper">
          <button className="toggle-button" onClick={handleShowMore}>
            Show more
          </button>
        </div>
      )}

      {selectedHoliday && (
        <HolidayModal
          holiday={selectedHoliday}
          onClose={() => setSelectedHoliday(null)}
        />
      )}
    </>
  );
};

export default HolidayList;
