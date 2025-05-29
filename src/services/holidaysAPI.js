export const fetchHolidays = async (countryCode) => {
  const year = new Date().getFullYear();

  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
  );

  if (res.status === 204) {
    return [];
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch holidays: ${res.status}`);
  }

  const text = await res.text();

  if (!text) {
    throw new Error("Empty response from holidays API");
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON from holidays API: ${e}`);
  }
};
