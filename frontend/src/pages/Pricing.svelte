<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import SiteNav from "../components/SiteNav.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";

  const plans = [
    { name: "free", price: "$0", per: "forever", desc: "Local voices, library, offline use, backup export. No account.", quota: "unlimited local" },
    { name: "tier 1", price: "$5", per: "/mo", desc: "Server voices, OCR, cloud sync, audiobook export.", quota: "150k words/mo" },
    { name: "tier 2", price: "$9", per: "/mo", desc: "Same features, more quota.", quota: "300k words/mo" },
    { name: "tier 3", price: "$15", per: "/mo", desc: "Same features, more quota.", quota: "600k words/mo" },
    { name: "tier 4", price: "$25", per: "/mo", desc: "Same features, more quota.", quota: "1.2M words/mo" },
  ];

  const costs = [
    { plan: "$5", words: "150k", gpu: "$2.05", stripe: "$0.75", infra: "$0.22", margin: "$1.98", share: "40%" },
    { plan: "$9", words: "300k", gpu: "$4.10", stripe: "$0.95", infra: "$0.22", margin: "$3.73", share: "41%" },
    { plan: "$15", words: "600k", gpu: "$8.20", stripe: "$1.25", infra: "$0.22", margin: "$5.33", share: "36%" },
    { plan: "$25", words: "1.2M", gpu: "$16.40", stripe: "$1.75", infra: "$0.22", margin: "$6.63", share: "27%" },
  ];

  const definitions = [
    { term: "Modal", def: "The company we rent compute from, CPUs and GPUs. Voices, OCR, and other heavy processing run there. This is what that costs for the plan's word quota." },
    { term: "Stripe", def: "The payment processor. Handles cards, receipts, and VAT, and takes a fee from every payment." },
    { term: "Hetzner", def: "The company hosting our server, backups, and cloud sync data. The table assumes roughly $11/month fixed, split across users (assuming 50); the real number is not settled. Fewer users means thinner margins." },
    { term: "Left over", def: "What remains after paying the three above; it funds development. Share of price is the same number as a percentage of what you pay." },
  ];

  const paidFeatures = [
    { name: "GPU voices", desc: "Kokoro and Chatterbox generated server-side. Much faster on long documents than local generation." },
    { name: "OCR", desc: "Scanned pages, broken text layers, bad reading order. Math comes back readable as speech." },
    { name: "Cloud sync", desc: "Library, positions, and bookmarks across devices. Files are encrypted before they leave your browser." },
    { name: "Radio Drama", desc: "Characters get their own voices. One-time processing per document, cached forever." },
    { name: "Audiobook export", desc: "A whole document rendered to audio files you keep." },
  ];
</script>

<svelte:head>
  <title>tells - pricing</title>
</svelte:head>

<SiteNav active="pricing" />

<header>
  <h1>Pricing</h1>
  <p class="disclaimer mono">
    This document is a tentative technical plan for Tells. It is not a privacy policy, terms of service, or other
    binding legal notice. Contents may change. Do not treat it as a statement of current product behavior or data
    practices.
  </p>
  <p class="intro">
    Everything that runs on your device is free, without an account. Paid adds the server side: GPU voices, OCR, cloud
    sync, audiobook export. Tiers differ only in monthly word quota. Nothing else is gated.
  </p>
</header>

<section class="plans">
  <div class="plan-grid">
    {#each plans as plan}
      <div class="plan">
        <div class="name mono">{plan.name}</div>
        <div class="price-row">
          <span class="price">{plan.price}</span>
          <span class="per mono">{plan.per}</span>
        </div>
        <div class="desc">{plan.desc}</div>
        <div><span class="quota mono">{plan.quota}</span></div>
      </div>
    {/each}
  </div>
  <p class="note mono">monthly only. no annual discounts, no "contact sales"</p>
</section>

<section class="costs">
  <div class="inner">
    <h2>Where the money goes</h2>
    <p class="lead">What each plan costs to run each month, and what is left after costs. Placeholder numbers; they will change.</p>
    <div class="table-wrap">
      <div class="table">
        <div class="row head mono">
          <span>Plan</span><span>Words / month</span><span>Modal</span><span>Stripe</span><span>Hetzner</span><span>Left over</span><span>Share of price</span>
        </div>
        {#each costs as cost}
          <div class="row mono">
            <span>{cost.plan}</span><span>{cost.words}</span><span class="dim">{cost.gpu}</span><span class="dim">{cost.stripe}</span><span class="dim">{cost.infra}</span><span>{cost.margin}</span><span class="dim">{cost.share}</span>
          </div>
        {/each}
      </div>
    </div>
    <div class="definitions">
      {#each definitions as item}
        <span class="term mono">{item.term}</span><span class="def">{item.def}</span>
      {/each}
    </div>
  </div>
</section>

<section class="paid">
  <div class="inner">
    <h2>What paid buys</h2>
    <div class="feature-grid">
      {#each paidFeatures as feature}
        <div>
          <h3 class="mono">{feature.name}</h3>
          <p>{feature.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<SiteFooter />

<style>
  header {
    max-width: 1040px;
    margin: 0 auto;
    padding: 72px 32px 56px;
  }

  h1 {
    font-size: clamp(38px, 5vw, 56px);
    font-weight: 400;
    letter-spacing: -0.015em;
    margin: 0;
  }

  .disclaimer {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--muted);
    max-width: 70ch;
    margin: 20px 0 0;
  }

  .intro {
    font-size: 19px;
    line-height: 1.55;
    color: var(--ink);
    max-width: 52ch;
    margin: 20px 0 0;
  }

  .plans {
    max-width: 1040px;
    margin: 0 auto;
    padding: 0 32px 72px;
  }

  .plan-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 16px;
  }

  .plan {
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--card);
    padding: 26px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .plan .name {
    font-size: 13px;
    color: var(--muted);
  }

  .price-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .price {
    font-size: 38px;
    letter-spacing: -0.02em;
  }

  .per {
    font-size: 12.5px;
    color: var(--muted);
  }

  .plan .desc {
    font-size: 16px;
    line-height: 1.55;
    flex: 1;
  }

  .quota {
    font-size: 12.5px;
    background: var(--hl);
    color: var(--hl-ink);
    padding: 4px 9px;
    border-radius: 2px;
    display: inline-block;
  }

  .plans .note {
    font-size: 13px;
    color: var(--muted);
    margin: 18px 0 0;
  }

  section.costs,
  section.paid {
    border-top: 1px solid var(--line);
  }

  .costs .inner,
  .paid .inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: 64px 32px;
  }

  .costs h2,
  .paid h2 {
    font-size: 30px;
    font-weight: 400;
    margin: 0 0 12px;
  }

  .costs .lead {
    font-size: 17px;
    line-height: 1.6;
    max-width: 56ch;
    margin: 0 0 32px;
  }

  .table-wrap {
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow-x: auto;
    background: var(--card);
  }

  .table {
    min-width: 760px;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    padding: 14px 22px;
    border-bottom: 1px solid var(--line);
    font-size: 14px;
  }

  .row.head {
    padding: 12px 22px;
    font-size: 12px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .row .dim {
    color: var(--muted);
  }

  .definitions {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 12px 24px;
    margin: 28px 0 0;
    max-width: 76ch;
    align-items: baseline;
  }

  .term {
    font-size: 13px;
  }

  .def {
    font-size: 16px;
    line-height: 1.6;
    color: var(--muted);
  }

  .paid h2 {
    margin: 0 0 28px;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 40px;
  }

  .feature-grid h3 {
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .feature-grid p {
    font-size: 16.5px;
    line-height: 1.6;
    margin: 0;
  }
</style>
