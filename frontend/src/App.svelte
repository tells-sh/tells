<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import Landing from "./pages/Landing.svelte";
  import Library from "./pages/Library.svelte";
  import Reader from "./pages/Reader.svelte";
  import Pricing from "./pages/Pricing.svelte";
  import Privacy from "./pages/Privacy.svelte";

  let hash = $state(location.hash);

  const route = $derived.by(() => {
    if (hash === "#/library") return { name: "library" as const };
    if (hash === "#/pricing") return { name: "pricing" as const };
    if (hash === "#/privacy") return { name: "privacy" as const };
    if (hash.startsWith("#/reader/")) {
      const id = decodeURIComponent(hash.slice("#/reader/".length));
      if (id) return { name: "reader" as const, id };
    }
    if (hash === "#/reader") return { name: "library" as const };
    return { name: "landing" as const };
  });

  function handleHashChange() {
    hash = location.hash;
    scrollTo(0, 0);
  }
</script>

<svelte:window onhashchange={handleHashChange} />

{#if route.name === "library"}
  <Library />
{:else if route.name === "reader"}
  <Reader docId={route.id} />
{:else if route.name === "pricing"}
  <Pricing />
{:else if route.name === "privacy"}
  <Privacy />
{:else}
  <Landing />
{/if}
