export const fetchHolidays = async (countryCode) => {
  const year = new Date().getFullYear();

  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
  );

  if (!response.ok) {
    throw new Error("Не удалось получить список праздников");
  }

  return response.json();
};
