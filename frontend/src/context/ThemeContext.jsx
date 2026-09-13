import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { getStoredTheme, setStoredTheme } from "../utils/storage";

export const ThemeContext = createContext(null);

function resolveInitialTheme() {
  const stored = getStoredTheme();
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme);

  // The `dark` class on <html> is what every Tailwind token override keys off.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    setStoredTheme(theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0a0c10" : "#fcf9f8");
  }, [theme]);

  // Follow the OS only while the user hasn't made an explicit choice.
  useEffect(() => {
    if (getStoredTheme()) return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event) => setTheme(event.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === "dark" }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
