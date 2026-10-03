import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "dark", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    // Veritas ships dark; the stored choice wins when there is one, and it
    // is written back so a first-time visitor gets the same default the
    // pre-paint script in index.html assumed.
    const saved = localStorage.getItem("veritas-theme") || "dark";
    setThemeState(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("veritas-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
