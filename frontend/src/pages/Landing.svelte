<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import SiteNav from "../components/SiteNav.svelte";
  import SiteFooter from "../components/SiteFooter.svelte";

  const heroWords = "Reads your documents aloud.".split(" ");
  const demoWords =
    "This is Tells. Drop in a PDF or paste text, pick a voice, press play. The words highlight as they are spoken, exactly like this.".split(
      " ",
    );

  const voices = [
    { name: "Web Speech", desc: "Built-in browser voices. Instant, no download.", tier: "free" },
    { name: "espeak", desc: "Compact and robotic. Fast on anything.", tier: "free" },
    { name: "Piper", desc: "Neural voices, small models. Downloads once.", tier: "free" },
    { name: "Kokoro", desc: "Neural voices, near-studio quality. Runs locally.", tier: "free" },
    { name: "Kokoro GPU", desc: "Same voices, generated server-side. Much faster on long documents.", tier: "paid" },
    { name: "Chatterbox", desc: "Expressive voices for narration and Radio Drama mode.", tier: "paid" },
  ];
</script>

<svelte:head>
  <title>tells</title>
</svelte:head>

<SiteNav />

<header>
  <h1>
    {#each heroWords as word, i}<span class="hero-word" style="animation-delay: {0.3 + i * 0.55}s">{word + " "}</span>{/each}
  </h1>
  <p class="sub">Words highlight as they're spoken. Runs in your browser. Free, account and cloud optional, works offline.</p>
  <div class="cta">
    <a class="mono" href="#/library">Open the app</a>
  </div>
  <p class="disclaimer mono">
    This document is a tentative technical plan for Tells. It is not a privacy policy, terms of service, or other
    binding legal notice. Contents may change. Do not treat it as a statement of current product behavior or data
    practices.
  </p>
</header>

<section class="demo">
  <div class="demo-card">
    <div class="demo-head mono">
      <span>readme.txt</span>
      <span>kokoro / local / 1.2x</span>
    </div>
    <div class="demo-body">
      <p>
        {#each demoWords as word, i}<span class="demo-word" style="animation-delay: {0.2 + i * 0.42}s">{word + " "}</span>{/each}
      </p>
      <p class="dimmed">
        Everything happens in your browser: the voices run on your own machine. Account and cloud optional, works
        offline.
      </p>
    </div>
    <div class="demo-controls mono">
      <button class="pause">||</button>
      <div class="track"><div class="progress"></div></div>
      <span class="time">00:09 / 01:10</span>
    </div>
  </div>
</section>

<section class="features">
  <div class="inner">
    <div>
      <h2 class="mono">Local by default</h2>
      <p class="lead">Your documents stay in your browser.</p>
      <p class="detail">Voices run on your device. The cloud is an option, not a requirement.</p>
    </div>
    <div>
      <h2 class="mono">Reads anything</h2>
      <p class="lead">PDFs, pasted text, piped from the CLI.</p>
      <p class="detail">
        Scanned pages go through OCR. Math reads as speech: <span class="code mono">x^2</span> becomes "x squared."
      </p>
    </div>
    <div>
      <h2 class="mono">No waiting</h2>
      <p class="lead">Audio streams sentence by sentence.</p>
      <p class="detail">Keep reading while it generates. Audio is cached, so the same text never renders twice.</p>
    </div>
  </div>
</section>

<section class="voices">
  <div class="inner">
    <h2>Voices</h2>
    <div class="voice-list">
      {#each voices as voice}
        <div class="voice-row">
          <span class="name mono">{voice.name}</span>
          <span>{voice.desc}</span>
          <span class="tier mono">{voice.tier}</span>
        </div>
      {/each}
    </div>
    <p class="note mono">free = runs on your device, no account / paid = runs on a server GPU</p>
  </div>
</section>

<section class="pricing-strip">
  <div class="inner">
    <div>
      <h2>Pricing</h2>
      <p>Free covers everything local, forever. Paid buys server GPU time: better voices, OCR, sync, audiobook export.</p>
    </div>
    <div class="prices mono">
      <span>$5</span><span>$9</span><span>$15</span><span>$25</span>
      <a href="#/pricing">the full math</a>
    </div>
  </div>
</section>

<SiteFooter />

<style>
  @keyframes wordhl {
    0%,
    3.9% {
      background-color: transparent;
    }
    4%,
    10% {
      background-color: var(--hl);
    }
    10.1%,
    100% {
      background-color: transparent;
    }
  }

  @keyframes demohl {
    0%,
    1.9% {
      background-color: transparent;
    }
    2%,
    5.5% {
      background-color: var(--hl);
    }
    5.6%,
    100% {
      background-color: transparent;
    }
  }

  header {
    max-width: 1040px;
    margin: 0 auto;
    padding: 96px 32px 72px;
  }

  h1 {
    font-size: clamp(44px, 6.5vw, 76px);
    line-height: 1.06;
    font-weight: 400;
    letter-spacing: -0.015em;
    margin: 0;
    max-width: 15ch;
    text-wrap: balance;
  }

  .hero-word {
    animation: wordhl 9s linear infinite;
    padding: 0 0.06em;
    margin: 0 -0.06em;
    border-radius: 2px;
  }

  .sub {
    font-size: 21px;
    line-height: 1.5;
    color: var(--ink);
    max-width: 44ch;
    margin: 28px 0 0;
  }

  .cta {
    display: flex;
    gap: 16px;
    margin-top: 40px;
    align-items: center;
  }

  .cta a {
    font-size: 15px;
    text-decoration: none;
    background: var(--ink);
    color: var(--bg);
    padding: 14px 26px;
    border-radius: 2px;
  }

  .cta a:hover {
    background: var(--hl);
    color: var(--hl-ink);
  }

  .disclaimer {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--muted);
    max-width: 70ch;
    margin: 40px 0 0;
  }

  .demo {
    max-width: 1040px;
    margin: 0 auto;
    padding: 0 32px 88px;
  }

  .demo-card {
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--card);
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .demo-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid var(--line);
    font-size: 12.5px;
    color: var(--muted);
  }

  .demo-body {
    padding: 44px 56px;
    font-size: 19px;
    line-height: 1.85;
    max-width: 66ch;
    margin: 0 auto;
  }

  .demo-body p {
    margin: 0;
  }

  .demo-word {
    animation: demohl 12s linear infinite;
    padding: 0 0.05em;
    margin: 0 -0.05em;
    border-radius: 2px;
  }

  .demo-body .dimmed {
    margin: 16px 0 0;
    color: var(--muted);
  }

  .demo-controls {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 14px 20px;
    border-top: 1px solid var(--line);
    font-size: 13px;
  }

  .pause {
    font: inherit;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--ink);
    background: var(--ink);
    color: var(--bg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .track {
    flex: 1;
    height: 2px;
    background: var(--line);
    position: relative;
  }

  .progress {
    position: absolute;
    left: 0;
    top: 0;
    height: 2px;
    width: 13%;
    background: var(--ink);
  }

  .time {
    color: var(--muted);
  }

  section.features,
  section.voices,
  section.pricing-strip {
    border-top: 1px solid var(--line);
  }

  .features .inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: 72px 32px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 48px;
  }

  .features h2 {
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    margin: 0 0 14px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .features .lead {
    font-size: 19px;
    line-height: 1.45;
    margin: 0 0 10px;
  }

  .features .detail {
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
    color: var(--muted);
  }

  .features .code {
    font-size: 14px;
  }

  .voices .inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: 72px 32px;
  }

  .voices h2 {
    font-size: 32px;
    font-weight: 400;
    margin: 0 0 36px;
  }

  .voice-list {
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
  }

  .voice-row {
    display: grid;
    grid-template-columns: 140px 1fr 120px;
    gap: 20px;
    padding: 16px 22px;
    border-bottom: 1px solid var(--line);
    font-size: 16px;
    align-items: baseline;
    background: var(--card);
  }

  .voice-row .name {
    font-size: 14px;
  }

  .voice-row .tier {
    font-size: 12.5px;
    text-align: right;
    color: var(--muted);
  }

  .voices .note {
    font-size: 13px;
    color: var(--muted);
    margin: 16px 0 0;
  }

  .pricing-strip .inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: 72px 32px;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 24px;
  }

  .pricing-strip h2 {
    font-size: 32px;
    font-weight: 400;
    margin: 0 0 10px;
  }

  .pricing-strip p {
    font-size: 17px;
    color: var(--ink);
    margin: 0;
    max-width: 44ch;
  }

  .prices {
    display: flex;
    align-items: baseline;
    gap: 22px;
  }

  .prices span {
    font-size: 22px;
  }

  .prices a {
    font-size: 14px;
  }
</style>
