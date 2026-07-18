<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import ThemeToggle from "./ThemeToggle.svelte";

  let { active }: { active?: "pricing" | "privacy" } = $props();
</script>

<nav>
  <a class="mono logo" href="#/">tells</a>
  <div class="links mono">
    <a href="#/pricing" class:active={active === "pricing"}>pricing</a>
    <a href="#/privacy" class:active={active === "privacy"}>privacy</a>
    <ThemeToggle />
    <a class="open-app" href="#/library">open app</a>
  </div>
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1040px;
    margin: 0 auto;
    padding: 28px 32px;
  }

  .logo {
    font-size: 17px;
    font-weight: 500;
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 28px;
    font-size: 13.5px;
    white-space: nowrap;
  }

  .links a {
    text-decoration: none;
  }

  .links a.active {
    border-bottom: 2px solid var(--hl);
  }

  .open-app {
    border: 1px solid var(--ink);
    padding: 8px 16px;
    border-radius: 2px;
  }

  .open-app:hover {
    background: var(--hl);
    color: var(--hl-ink);
    border-color: var(--hl);
  }
</style>
