const cleanTitle = (title) => {
  return title
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
};

const tryFetch = async (title) => {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    cleanTitle(title)
  )}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    return data.extract || null;
  } catch {
    return null;
  }
};

const truncateText = (text, maxLength = 300) => {
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  return trimmed.slice(0, lastSpace) + "...";
};
export const fetchWikipediaSummary = async (name, localName) => {
  const queries = [name, localName, `${name} holiday`];

  for (const query of queries) {
    const result = await tryFetch(query);
    if (result) return truncateText(result);
  }

  return null;
};
