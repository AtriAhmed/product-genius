"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsMounted } from "@/hooks/use-is-mounted";

export default function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const isMounted = useIsMounted();

  // While SSR isn't mounted, fall back to light so we avoid hydration flashes.
  const current = isMounted ? (theme === "dark" ? "dark" : "light") : "light";

  const toggleTheme = () => setTheme(current === "dark" ? "light" : "dark");

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${current === "dark" ? "light" : "dark"} mode`}
      aria-pressed={current === "dark"}
      title={`Switch to ${current === "dark" ? "light" : "dark"} mode`}
      className="p-2 rounded-md bg-slate-200/75 hover:bg-slate-200 dark:bg-accent/50 dark:hover:bg-accent duration-100"
    >
      {current === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
