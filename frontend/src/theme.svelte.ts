// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

export const theme = $state({
  current: localStorage.getItem("tells-theme") === "dark" ? "dark" : "light",
});

document.documentElement.dataset.theme = theme.current;

export function toggleTheme() {
  theme.current = theme.current === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme.current;
  localStorage.setItem("tells-theme", theme.current);
}
