"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { useEffect, useState } from "react";

/**
 * Custom hook that returns the current theme ("light" | "dark")
 * and keeps it in sync with ThemeProvider updates and system preferences.
 */
export const useCurrentTheme = () => {
  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  return currentTheme;
};
