import { useEffect, useState } from "react";

const UNSPLASH_URL = "https://api.unsplash.com/search/photos";

export const useUnsplashImage = (query) => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchImage = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${UNSPLASH_URL}?query=${encodeURIComponent(
            query
          )}&per_page=1&orientation=landscape&client_id=${
            import.meta.env.VITE_UNSPLASH_ACCESS_KEY
          }`
        );
        const data = await res.json();
        if (data.results && data.results[0]) {
          setImageUrl(data.results[0].urls.regular);
        }
      } catch (e) {
        console.warn("Unsplash fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [query]);

  return { imageUrl, loading };
};
