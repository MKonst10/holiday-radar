import { useState } from "react";
import RadarLoader from "./RadarLoader";
import HolidayModal from "./HolidayModal";
import "./HolidayList.css";

const HolidayList = ({ holidays, loading }) => {
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const handleCardClick = (holiday) => {
    setSelectedHoliday(holiday);
  };

  const getTypeEmoji = (type) => {
    switch (type) {
      case "Public":
        return "🏖️";
      case "Bank":
        return "🏦";
      case "School":
        return "🎓";
      case "Authorities":
        return "🏢";
      case "Optional":
        return "🕊️";
      case "Observance":
        return "🕯️";
      default:
        return "📅";
    }
  };

  if (loading) {
    return <RadarLoader />;
  }

  if ((!holidays || holidays.length === 0) && loading) {
    return null;
  }

  if (!holidays || holidays.length === 0) {
    return <p className="empty-message">No holidays to show.</p>;
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
        {visible.map((holiday) => (
          <div
            key={`${holiday.date}-${holiday.localName}`}
            className="holiday-card"
            onClick={() => handleCardClick(holiday)}
          >
            <h3>{holiday.localName}</h3>
            <p className="en-name">{holiday.name}</p>
            <div className="date-row">
              <span className="date">
                {new Date(holiday.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="days-left">⏳ {getDaysLeft(holiday.date)}</span>
            </div>
            <p className="type">
              {holiday.global ? "🌍 Global holiday" : "🏛️ Regional holiday"}
            </p>

            <div className="tags">
              {holiday.types?.map((type) => (
                <span key={type} className="tag">
                  {getTypeEmoji(type)} {type}
                </span>
              ))}
            </div>
          </div>
        ))}
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
