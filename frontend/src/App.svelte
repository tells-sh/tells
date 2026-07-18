<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import type { Component } from "svelte";
  import Landing from "./pages/Landing.svelte";
  import Library from "./pages/Library.svelte";
  import Reader from "./pages/Reader.svelte";
  import Pricing from "./pages/Pricing.svelte";
  import Privacy from "./pages/Privacy.svelte";

  const routes: Record<string, Component> = {
    "#/library": Library,
    "#/reader": Reader,
    "#/pricing": Pricing,
    "#/privacy": Privacy,
  };

  let hash = $state(location.hash);
  const Page = $derived(routes[hash] ?? Landing);

  function handleHashChange() {
    hash = location.hash;
    scrollTo(0, 0);
  }
</script>

<svelte:window onhashchange={handleHashChange} />

<Page />
