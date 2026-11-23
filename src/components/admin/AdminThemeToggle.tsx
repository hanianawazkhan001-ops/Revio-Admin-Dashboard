"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "admin-theme";

export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "light") setTheme("light");
    } catch {
      // localStorage unavailable — fall back to dark, matching the shell's default.
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference just won't persist across visits — the toggle itself still works.
    }
    const shell = document.getElementById("admin-shell");
    if (next === "light") shell?.setAttribute("data-theme", "light");
    else shell?.removeAttribute("data-theme");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="btn-tactile grid size-8 flex-none place-items-center rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] text-sm hover:bg-[var(--a-surface-2-hover)]"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
