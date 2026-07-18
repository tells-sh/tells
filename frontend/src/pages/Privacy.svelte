<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import SiteNav from "../components/SiteNav.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";

  const serverSees = [
    { job: "tts", desc: "receives the text to speak, returns audio" },
    { job: "ocr", desc: "receives the pages that need it, returns text" },
    { job: "sync", desc: "receives encrypted files it cannot read, encrypted in your browser before upload" },
  ];

  const residency = [
    { service: "Hetzner", loc: "Germany", data: "Usage, subscriptions, notification preferences, auth" },
    { service: "Modal", loc: "US", data: "Text, OCR pages, generated audio (transient, per request)" },
    { service: "Stripe", loc: "US", data: "Name, email, payment info, billing address" },
    { service: "Resend", loc: "US", data: "Email addresses, at send time" },
  ];
</script>

<svelte:head>
  <title>tells - privacy</title>
</svelte:head>

<SiteNav active="privacy" />

<main>
  <h1>Privacy</h1>
  <p class="disclaimer mono">
    This document is a tentative technical plan for Tells. It is not a privacy policy, terms of service, or other
    binding legal notice. Contents may change. Do not treat it as a statement of current product behavior or data
    practices.
  </p>

  <p class="lede">
    Documents and text stay in your browser unless you use a server-side feature. The free tier needs no account and
    sends nothing anywhere.
  </p>

  <h2>What the server sees</h2>
  <p class="dim">Paid jobs send only what the job needs. Job data is processed for the request and not intentionally stored.</p>
  <div class="table jobs">
    {#each serverSees as item}
      <div class="row">
        <span class="key mono">{item.job}</span>
        <span>{item.desc}</span>
      </div>
    {/each}
  </div>

  <h2>Where data lives</h2>
  <div class="table residency">
    <div class="row head mono">
      <span>Service</span><span>Location</span><span>Data</span>
    </div>
    {#each residency as item}
      <div class="row">
        <span class="service mono">{item.service}</span>
        <span class="loc mono">{item.loc}</span>
        <span class="data">{item.data}</span>
      </div>
    {/each}
  </div>
  <p class="body-sm">
    Application data we control stays in Germany. Payment and email providers process data in the US. Admin access is
    SSH for operations only; the database doesn't get downloaded to laptops.
  </p>

  <h2>Your data, your requests</h2>
  <p class="body">
    Access, deletion, and export requests are all honored. Write to
    <a class="mono email" href="mailto:privacy@tells.sh">privacy@tells.sh</a>. Response within one month, or an
    explanation of any GDPR-permitted extension within that month.
  </p>
  <p class="body">
    Local data (your PDFs, audio cache, positions) lives in your browser's storage. You clear it yourself, any time, in
    the app or in browser settings. You can also export all of it as a zip.
  </p>

  <h2>Email</h2>
  <p class="body">Transactional only: verification, password reset, security notices. No marketing, no newsletters.</p>
</main>

<SiteFooter />

<style>
  main {
    max-width: 760px;
    margin: 0 auto;
    padding: 72px 32px 96px;
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
    margin: 16px 0 0;
    max-width: 70ch;
  }

  .lede {
    font-size: 22px;
    line-height: 1.55;
    margin: 40px 0 0;
    max-width: 46ch;
    text-wrap: pretty;
  }

  h2 {
    font-size: 28px;
    font-weight: 400;
    margin: 56px 0 20px;
  }

  h2 + .dim {
    font-size: 17px;
    line-height: 1.6;
    color: var(--muted);
    margin: 0 0 20px;
  }

  .table {
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
    background: var(--card);
  }

  .row {
    display: grid;
    gap: 16px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--line);
    align-items: baseline;
  }

  .row:last-child {
    border-bottom: none;
  }

  .jobs .row {
    grid-template-columns: 130px 1fr;
    font-size: 16.5px;
  }

  .jobs .key {
    font-size: 13.5px;
  }

  .residency .row {
    grid-template-columns: 150px 110px 1fr;
    font-size: 16px;
  }

  .residency .row.head {
    padding: 12px 20px;
    font-size: 12px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .residency .service {
    font-size: 14px;
  }

  .residency .loc {
    font-size: 13px;
    color: var(--muted);
  }

  .residency .data {
    color: var(--muted);
  }

  .body-sm {
    font-size: 17px;
    line-height: 1.7;
    margin: 20px 0 0;
  }

  .body {
    font-size: 19px;
    line-height: 1.7;
    margin: 0;
  }

  .body + .body {
    margin: 20px 0 0;
  }

  .email {
    font-size: 16px;
  }
</style>
