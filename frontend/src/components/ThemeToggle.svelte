<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import { theme, toggleTheme } from "../theme.svelte";
</script>

<button onclick={toggleTheme} title="Toggle theme">
  {theme.current === "dark" ? "light" : "dark"}
</button>

<style>
  button {
    font: inherit;
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
  }
</style>
