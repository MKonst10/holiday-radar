import { useEffect, useState, useRef } from "react";
import regionData from "../data/iso_3166_2_subdivisions.json";

const useRegionNames = (subdivisionCodes) => {
  const [names, setNames] = useState([]);
  const prevCodesRef = useRef();

  useEffect(() => {
    if (!Array.isArray(subdivisionCodes)) {
      console.warn("useRegionNames expects an array");
      setNames([]);
      return;
    }

    if (subdivisionCodes.length === 0) {
      setNames([]);
      return;
    }

    const currentKey = JSON.stringify(subdivisionCodes);
    if (prevCodesRef.current === currentKey) return;
    prevCodesRef.current = currentKey;

    const result = subdivisionCodes.map((code) => {
      const [countryCode] = code.split("-");
      const regions = regionData[countryCode];
      if (!regions) return code;

      const region = regions.find((r) => r.code === code);
      return region ? region.name : code;
    });

    setNames(result);
  }, [subdivisionCodes]);

  return names;
};

export default useRegionNames;
