const HolidayList = ({ holidays }) => {
  if (!holidays || holidays.length === 0) {
    return <p>Нет доступных праздников</p>;
  }

  return (
    <ul>
      {holidays.map((holiday) => (
        <li key={holiday.date}>
          <strong>{holiday.date}</strong>: {holiday.localName}
        </li>
      ))}
    </ul>
  );
};

export default HolidayList;
