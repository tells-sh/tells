<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import ThemeToggle from "../components/ThemeToggle.svelte";

  const allDocs = [
    { kind: "pdf", size: "1.2 MB", title: "title 1", pos: "p. 3 / 12", pct: "25%", audio: "8 min cached", cat: "pdf" },
  ];

  let filter = $state("all");
  const docs = $derived(filter === "all" ? allDocs : allDocs.filter((d) => d.cat === filter));
</script>

<svelte:head>
  <title>tells - library</title>
</svelte:head>

<div class="page">
  <nav class="mono">
    <div class="nav-left">
      <a class="logo" href="#/">tells</a>
      <span class="crumb">library</span>
    </div>
    <div class="nav-right">
      <span class="storage">412 MB used, 58 GB free</span>
      <ThemeToggle />
      <button class="add">+ add document</button>
    </div>
  </nav>

  <main>
    <div class="toolbar">
      <div class="filters mono">
        {#each ["all", "pdf", "text"] as label}
          <button class:active={filter === label} onclick={() => (filter = label)}>{label}</button>
        {/each}
      </div>
      <input class="mono" placeholder="search..." />
    </div>

    <a class="resume" href="#/reader">
      <div class="resume-left">
        <span class="label mono">Continue</span>
        <span class="title">title 1</span>
      </div>
      <div class="resume-right mono">
        <span>p. 3, 02:41 remaining on page</span>
        <span class="go">&gt;</span>
      </div>
    </a>

    <div class="grid">
      {#each docs as doc}
        <a class="doc" href="#/reader">
          <div class="doc-head mono">
            <span class="kind">{doc.kind}</span>
            <span>{doc.size}</span>
          </div>
          <span class="title">{doc.title}</span>
          <div class="doc-foot">
            <div class="track"><div class="progress" style="width: {doc.pct}"></div></div>
            <div class="meta mono">
              <span>{doc.pos}</span>
              <span>{doc.audio}</span>
            </div>
          </div>
        </a>
      {/each}
    </div>

    <div class="drop-hint mono">
      <span>drop a PDF anywhere, paste text, or</span>
      <span class="underlined">pipe from the CLI</span>
      <span class="cmd">cat notes.txt | tells</span>
    </div>
  </main>

  <footer class="mono">
    <span></span>
    <button class="export">export backup (.zip)</button>
  </footer>
</div>

<style>
  .page {
    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
    display: flex;
    flex-direction: column;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 28px;
    border-bottom: 1px solid var(--line);
    font-size: 13px;
  }

  .nav-left {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .logo {
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .crumb {
    color: var(--muted);
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 20px;
    white-space: nowrap;
  }

  .storage {
    color: var(--muted);
  }

  .add {
    font: inherit;
    background: var(--ink);
    color: var(--bg);
    border: none;
    padding: 9px 16px;
    border-radius: 2px;
    cursor: pointer;
  }

  .add:hover {
    background: var(--hl);
    color: var(--hl-ink);
  }

  main {
    flex: 1;
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 28px;
    box-sizing: border-box;
  }

  .toolbar {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .filters {
    display: flex;
    gap: 8px;
    font-size: 13px;
  }

  .filters button {
    font: inherit;
    background: var(--card);
    color: var(--muted);
    border: 0;
    box-shadow: 0 0 0 1px var(--line);
    padding: 7px 14px;
    border-radius: 99px;
    cursor: pointer;
    transform: translateZ(0);
  }

  .filters button.active {
    background: var(--ink);
    color: var(--bg);
    box-shadow: 0 0 0 1px var(--ink);
  }

  input {
    font-size: 13px;
    background: var(--card);
    color: var(--ink);
    border: 1px solid var(--line);
    border-radius: 2px;
    padding: 9px 14px;
    width: 220px;
    outline: none;
  }

  .resume {
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--card);
    padding: 20px 24px;
    margin-bottom: 32px;
  }

  .resume:hover {
    border-color: var(--ink);
    background: var(--card);
    color: var(--ink);
  }

  .resume-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .resume .label {
    font-size: 11.5px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .resume .title {
    font-size: 20px;
  }

  .resume-right {
    display: flex;
    align-items: center;
    gap: 18px;
    font-size: 13px;
    color: var(--muted);
    white-space: nowrap;
  }

  .go {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 16px;
  }

  .doc {
    text-decoration: none;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--card);
    padding: 20px 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 150px;
  }

  .doc:hover {
    border-color: var(--ink);
    background: var(--card);
    color: var(--ink);
  }

  .doc-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    font-size: 11px;
    color: var(--muted);
  }

  .doc-head .kind {
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .doc .title {
    font-size: 19px;
    line-height: 1.3;
    flex: 1;
    text-wrap: pretty;
  }

  .doc-foot {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .track {
    height: 2px;
    background: var(--line);
    position: relative;
  }

  .progress {
    position: absolute;
    left: 0;
    top: 0;
    height: 2px;
    background: var(--hl);
  }

  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 11.5px;
    color: var(--muted);
  }

  .drop-hint {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 40px;
    padding: 18px 22px;
    border: 1px dashed var(--line);
    border-radius: 6px;
    font-size: 13px;
    color: var(--muted);
  }

  .underlined {
    border-bottom: 1px solid var(--muted);
  }

  .cmd {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 3px;
    padding: 3px 8px;
    font-size: 12px;
  }

  footer {
    border-top: 1px solid var(--line);
    padding: 14px 28px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--muted);
  }

  .export {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--muted);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .export:hover {
    background: var(--hl);
    color: var(--hl-ink);
  }
</style>
