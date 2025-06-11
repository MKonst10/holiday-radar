import { useState } from "react";
import RadarLoader from "./RadarLoader";
import HolidayModal from "./HolidayModal";
import { useUnsplashImage } from "../hooks/useUnsplashImage";
import "./HolidayList.css";

const HolidayList = ({
  holidays,
  loading,
  favorites,
  onToggleFavorite,
  showFavorites,
}) => {
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const handleCardClick = (holiday) => setSelectedHoliday(holiday);

  const UnsplashImagePreview = ({ name }) => {
    const { imageUrl, loading } = useUnsplashImage(name);

    if (loading) {
      return <RadarLoader content="preview" />;
    }

    return (
      <img
        src={imageUrl || "/fallback.jpg"}
        alt={name}
        className="holiday-img"
      />
    );
  };

  const isFavorite = (holiday) =>
    favorites.some(
      (h) => h.date === holiday.date && h.localName === holiday.localName
    );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysLeft = (dateStr) => {
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    return rtf.format(diffDays, "day");
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

  const todayTimestamp = today.getTime();

  const upcoming = holidays
    .filter((h) => new Date(h.date).getTime() >= todayTimestamp)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <div className="holiday-list">
        {upcoming.map((holiday) => {
          const holidayDate = new Date(holiday.date);
          holidayDate.setHours(0, 0, 0, 0);
          const isToday = holidayDate.getTime() === todayTimestamp;
          const formattedDate = holidayDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <div
              key={`${holiday.date}-${holiday.localName}`}
              className="holiday-item"
              onClick={() => handleCardClick(holiday)}
            >
              <div className="holiday-info">
                <p className="holiday-type">National Holiday</p>
                <h3 className="holiday-name">{holiday.name}</h3>
                <p className="holiday-date">
                  {formattedDate} ·{" "}
                  <span className="holiday-days">
                    {isToday ? "Today" : getDaysLeft(holiday.date)}
                  </span>
                </p>
              </div>

              <div className="holiday-preview">
                <UnsplashImagePreview name={holiday.name} />
              </div>
            </div>
          );
        })}
      </div>

      {selectedHoliday && (
        <HolidayModal
          holiday={selectedHoliday}
          onClose={() => setSelectedHoliday(null)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </>
  );
};

export default HolidayList;
