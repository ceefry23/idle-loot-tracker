import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      root.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [dark]);

  return (
    <button
      className="fixed top-4 right-4 z-50 bg-gray-100 dark:bg-gray-900 border border-yellow-700
      rounded-full shadow-lg p-2 flex items-center justify-center
      hover:scale-110 active:scale-95 transition-all text-yellow-400"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <span className="w-6 h-6 flex items-center justify-center transition-all">
        {dark
          ? <Moon className="text-yellow-400 transition-transform duration-300 rotate-12" />
          : <Sun className="text-yellow-400 transition-transform duration-300 -rotate-12" />}
      </span>
    </button>
  );
}
