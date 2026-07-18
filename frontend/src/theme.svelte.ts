// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

function systemTheme(): "dark" | "light" {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initialTheme(): "dark" | "light" {
  const saved = localStorage.getItem("tells-theme");
  if (saved === "dark" || saved === "light") return saved;
  return systemTheme();
}

export const theme = $state({
  current: initialTheme(),
});

document.documentElement.dataset.theme = theme.current;

export function toggleTheme() {
  theme.current = theme.current === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme.current;
  localStorage.setItem("tells-theme", theme.current);
}
