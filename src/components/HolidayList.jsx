import { useState } from "react";
import "./HolidayList.css";

const HolidayList = ({ holidays }) => {
  const [showAll, setShowAll] = useState(false);

  if (!holidays || holidays.length === 0) {
    return <p className="empty-message">No holidays to show.</p>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = holidays
    .filter((h) => new Date(h.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const visible = showAll ? upcoming : upcoming.slice(0, 5);

  const getDaysLeft = (dateStr) => {
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <div className="toggle-wrapper">
        <button className="toggle-button" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show only next 5" : "Show all holidays"}
        </button>
      </div>

      <div className="holiday-grid">
        {visible.map((holiday) => (
          <div key={holiday.date} className="holiday-card">
            <h3>{holiday.localName}</h3>
            <p className="en-name">{holiday.name}</p>
            <p className="date">📅 {holiday.date}</p>
            <p className="days-left">
              ⏳ {getDaysLeft(holiday.date)} days left
            </p>
            <p className="type">
              🌍 {holiday.global ? "Global holiday" : "Regional"}
            </p>
            <div className="tags">
              {holiday.types?.map((type) => (
                <span key={type} className="tag">
                  {type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default HolidayList;
