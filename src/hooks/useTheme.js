import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "themeMode";
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

const getPreferredSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEMES.DARK
    : THEMES.LIGHT;

const getStoredMode = () => {
  if (typeof window === "undefined") return THEMES.SYSTEM;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (
    stored === THEMES.LIGHT ||
    stored === THEMES.DARK ||
    stored === THEMES.SYSTEM
  ) {
    return stored;
  }
  return THEMES.SYSTEM;
};

export default function useTheme() {
  const [themeMode, setThemeMode] = useState(getStoredMode);
  const [systemTheme, setSystemTheme] = useState(
    typeof window === "undefined" ? THEMES.LIGHT : getPreferredSystemTheme(),
  );

  const theme = useMemo(
    () => (themeMode === THEMES.SYSTEM ? systemTheme : themeMode),
    [themeMode, systemTheme],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      setSystemTheme(event.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("theme-dark", theme === THEMES.DARK);
    document.body.classList.toggle("theme-light", theme === THEMES.LIGHT);
    document.body.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, themeMode);
  }, [themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((currentMode) => {
      if (currentMode === THEMES.SYSTEM) {
        return systemTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      }
      return currentMode === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    });
  }, [systemTheme]);

  return {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isSystemMode: themeMode === THEMES.SYSTEM,
    systemTheme,
  };
}
