import { useEffect, useState } from "react";

export const useWikipediaImage = (title) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            title
          )}`
        );
        const data = await response.json();
        if (data.thumbnail?.source) {
          setImageUrl(data.thumbnail.source);
        }
      } catch (e) {
        console.warn("Wikipedia image error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [title]);

  return { imageUrl, loading };
};
