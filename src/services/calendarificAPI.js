const API_KEY = import.meta.env.VITE_CALENDARIFIC_API_KEY;

export const fetchHolidayDescriptions = async (countryCode, year) => {
  const url = `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${countryCode.toLowerCase()}&year=${year}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.meta.code !== 200) throw new Error(json.meta.error_detail);

    return json.response.holidays.map((h) => ({
      name: h.name,
      description: h.description,
      date: h.date.iso,
    }));
  } catch (err) {
    console.error("Calendarific fetch error:", err);
    return [];
  }
};
