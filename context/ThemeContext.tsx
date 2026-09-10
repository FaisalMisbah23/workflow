import { getSettings, updateSetting } from "@/lib/storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

interface ThemeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    getSettings().then((settings) => {
      setIsDark(settings.darkMode);
      setInitialized(true);
    });
  }, []);

  // If no saved preference, follow system
  useEffect(() => {
    if (initialized) return;
    setIsDark(systemColorScheme === "dark");
  }, [systemColorScheme, initialized]);

  const setDarkMode = useCallback(async (value: boolean) => {
    setIsDark(value);
    await updateSetting("darkMode", value);
  }, []);

  const toggleDarkMode = useCallback(async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await updateSetting("darkMode", newValue);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
