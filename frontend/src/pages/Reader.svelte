<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import ThemeToggle from "../components/ThemeToggle.svelte";
  import { getDoc, updateDoc } from "../lib/docs.svelte";
  import type { KokoroDevice, KokoroDtype } from "../lib/kokoro";
  import { parseText } from "../lib/text";
  import { KOKORO_VOICES, MODEL_SIZE_MB, type KokoroVoiceId } from "../lib/voices";

  let { docId }: { docId: string } = $props();

  const engines = ["kokoro / local", "web speech"];
  const speeds = ["1.0x", "1.2x", "1.5x", "1.8x", "2.0x"];
  const dtypes: KokoroDtype[] = ["q8", "fp16", "q4f16", "fp32", "q4"];
  const devices: KokoroDevice[] = ["wasm", "webgpu"];

  let playing = $state(false);
  let engineIdx = $state(0);
  let speedIdx = $state(1);
  let kokoroVoice = $state<KokoroVoiceId>("af_heart");
  let kokoroDtype = $state<KokoroDtype>("q8");
  let kokoroDevice = $state<KokoroDevice>("wasm");
  let openMenu = $state<"engine" | "kokoro" | "speed" | null>(null);
  let editing = $state(false);
  let draft = $state("");

  const doc = $derived(getDoc(docId) ?? null);
  const paragraphs = $derived(doc ? parseText(doc.body) : []);
  const wordCount = $derived(doc?.body.trim() ? doc.body.trim().split(/\s+/).length : 0);

  const isKokoroLocal = $derived(engines[engineIdx] === "kokoro / local");
  const kokoroVoiceName = $derived(KOKORO_VOICES.find((v) => v.id === kokoroVoice)?.name ?? kokoroVoice);

  $effect(() => {
    if (!getDoc(docId)) {
      location.hash = "#/library";
    }
  });

  function toggleMenu(menu: "engine" | "kokoro" | "speed", event: MouseEvent) {
    event.stopPropagation();
    openMenu = openMenu === menu ? null : menu;
  }

  function pickEngine(i: number) {
    engineIdx = i;
    openMenu = null;
  }

  function pickSpeed(i: number) {
    speedIdx = i;
    openMenu = null;
  }

  function startEdit() {
    if (!doc) return;
    draft = doc.body;
    editing = true;
    openMenu = null;
  }

  function cancelEdit() {
    editing = false;
    draft = "";
  }

  function saveEdit() {
    const updated = updateDoc(docId, draft);
    if (!updated) return;
    editing = false;
    draft = "";
  }
</script>

<svelte:window onclick={() => (openMenu = null)} />

<svelte:head>
  <title>tells - {doc?.title ?? "reader"}</title>
</svelte:head>

{#if doc}
  <div class="page">
    <nav class="mono">
      <div class="nav-left">
        <a href="#/library">back to library</a>
        <span class="doc-name">{doc.title}</span>
      </div>
      <div class="nav-right">
        <span class="pos">{wordCount} words</span>
        {#if editing}
          <button type="button" class="nav-btn" onclick={cancelEdit}>cancel</button>
          <button type="button" class="nav-btn primary" onclick={saveEdit}>save</button>
        {:else}
          <button type="button" class="nav-btn" onclick={startEdit}>edit</button>
        {/if}
        <ThemeToggle />
      </div>
    </nav>

    <main>
      <article>
        {#if editing}
          <textarea class="editor" bind:value={draft} spellcheck="true"></textarea>
        {:else if paragraphs.length === 0}
          <p class="dim">This document is empty. Click edit to add text.</p>
        {:else}
          {#each paragraphs as para, pi}
            <p class:last={pi === paragraphs.length - 1}>
              {#each para.sentences as sentence, si}
                <span class="sentence">{sentence}</span>{si < para.sentences.length - 1 ? " " : ""}
              {/each}
            </p>
          {/each}
        {/if}
      </article>
    </main>

    <div class="player">
      <div class="controls mono">
        <button class="play" type="button" onclick={() => (playing = !playing)}>{playing ? "||" : ">"}</button>
        <div class="timeline">
          <div class="track">
            <div class="progress"></div>
            <div class="cached" title="cached ahead"></div>
          </div>
          <div class="times"><span>00:00</span><span>--:--</span></div>
        </div>
        <div class="pills">
          <div class="pill">
            <button
              class="pill-btn engine-btn"
              type="button"
              title="Engine"
              aria-haspopup="listbox"
              aria-expanded={openMenu === "engine"}
              onclick={(e) => toggleMenu("engine", e)}
            >
              {engines[engineIdx]}
            </button>
            {#if openMenu === "engine"}
              <div class="menu" role="listbox" onclick={(e) => e.stopPropagation()}>
                {#each engines as engine, i}
                  <button
                    class="menu-item"
                    type="button"
                    class:active={i === engineIdx}
                    role="option"
                    aria-selected={i === engineIdx}
                    onclick={() => pickEngine(i)}
                  >
                    {engine}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
          <div class="pill kokoro-slot" class:empty={!isKokoroLocal}>
            {#if isKokoroLocal}
              <button
                class="pill-btn kokoro-btn"
                type="button"
                title="Kokoro settings"
                aria-haspopup="dialog"
                aria-expanded={openMenu === "kokoro"}
                onclick={(e) => toggleMenu("kokoro", e)}
              >
                {kokoroVoiceName}
              </button>
              {#if openMenu === "kokoro"}
                <div class="menu kokoro-menu" onclick={(e) => e.stopPropagation()}>
                  <div class="menu-section">
                    <div class="menu-label">voice</div>
                    <div class="menu-scroll">
                      {#each KOKORO_VOICES as voice}
                        <button
                          class="menu-item"
                          type="button"
                          class:active={voice.id === kokoroVoice}
                          onclick={() => (kokoroVoice = voice.id)}
                        >
                          {voice.name}
                        </button>
                      {/each}
                    </div>
                  </div>
                  <div class="menu-section">
                    <div class="menu-label">dtype</div>
                    {#each dtypes as dtype}
                      <button
                        class="menu-item"
                        type="button"
                        class:active={dtype === kokoroDtype}
                        onclick={() => (kokoroDtype = dtype)}
                      >
                        <span>{dtype}</span>
                        <span class="menu-meta">{MODEL_SIZE_MB[dtype]} MB</span>
                      </button>
                    {/each}
                  </div>
                  <div class="menu-section">
                    <div class="menu-label">device</div>
                    {#each devices as device}
                      <button
                        class="menu-item"
                        type="button"
                        class:active={device === kokoroDevice}
                        onclick={() => (kokoroDevice = device)}
                      >
                        {device}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            {/if}
          </div>
          <div class="pill">
            <button
              class="pill-btn speed-btn"
              type="button"
              title="Speed"
              aria-haspopup="listbox"
              aria-expanded={openMenu === "speed"}
              onclick={(e) => toggleMenu("speed", e)}
            >
              {speeds[speedIdx]}
            </button>
            {#if openMenu === "speed"}
              <div class="menu" role="listbox" onclick={(e) => e.stopPropagation()}>
                {#each speeds as speed, i}
                  <button
                    class="menu-item"
                    type="button"
                    class:active={i === speedIdx}
                    role="option"
                    aria-selected={i === speedIdx}
                    onclick={() => pickSpeed(i)}
                  >
                    {speed}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

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
    padding: 14px 24px;
    border-bottom: 1px solid var(--line);
    font-size: 13px;
  }

  .nav-left {
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 0;
  }

  .nav-left a {
    text-decoration: none;
    color: var(--muted);
    white-space: nowrap;
  }

  .doc-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 18px;
    white-space: nowrap;
  }

  .pos {
    color: var(--muted);
  }

  .nav-btn {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--muted);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .nav-btn:hover,
  .nav-btn.primary {
    background: var(--hl);
    color: var(--hl-ink);
    text-decoration: none;
    padding: 2px 6px;
  }

  main {
    flex: 1;
    overflow-y: auto;
    padding: 56px 24px 160px;
  }

  article {
    max-width: 640px;
    margin: 0 auto;
    font-size: 20px;
    line-height: 1.85;
  }

  article p {
    margin: 0 0 24px;
  }

  article .dim {
    color: var(--muted);
  }

  article .last {
    margin: 0;
  }

  .sentence {
    border-radius: 2px;
    padding: 0.05em 0;
  }

  .sentence:hover {
    background: var(--hl);
    color: var(--hl-ink);
  }

  .editor {
    display: block;
    width: 100%;
    box-sizing: border-box;
    min-height: 50vh;
    margin: 0;
    padding: 0;
    font: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    field-sizing: content;
  }

  .player {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 1px solid var(--line);
    background: var(--bg);
  }

  .controls {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 14px 24px;
    font-size: 13px;
  }

  .play {
    font: inherit;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--ink);
    background: var(--ink);
    color: var(--bg);
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .play:hover {
    background: var(--hl);
    color: var(--hl-ink);
    border-color: var(--hl);
  }

  .timeline {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 120px;
  }

  .track {
    height: 3px;
    background: var(--line);
    position: relative;
    border-radius: 2px;
    cursor: pointer;
  }

  .progress {
    position: absolute;
    left: 0;
    top: 0;
    height: 3px;
    width: 0%;
    background: var(--ink);
    border-radius: 2px;
  }

  .cached {
    position: absolute;
    left: 0;
    top: 0;
    height: 3px;
    width: 0%;
    background: var(--muted);
    opacity: 0.3;
    border-radius: 2px;
  }

  .times {
    display: flex;
    justify-content: space-between;
    color: var(--muted);
    font-size: 12px;
  }

  .pills {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    white-space: nowrap;
    flex: 0 0 auto;
    margin-left: auto;
  }

  .pill {
    position: relative;
    flex-shrink: 0;
  }

  .kokoro-slot {
    width: 6.5rem;
  }

  .kokoro-slot.empty {
    visibility: hidden;
    pointer-events: none;
  }

  .pill-btn {
    font: inherit;
    font-size: 12.5px;
    background: var(--card);
    color: var(--ink);
    border: 1px solid var(--line);
    border-radius: 99px;
    padding: 8px 14px;
    cursor: pointer;
    display: block;
    box-sizing: border-box;
    text-align: center;
  }

  .engine-btn {
    width: 11.5rem;
  }

  .kokoro-btn {
    width: 100%;
  }

  .speed-btn {
    width: 4.25rem;
  }

  .pill-btn:hover,
  .pill-btn[aria-expanded="true"] {
    border-color: var(--ink);
  }

  .menu {
    position: absolute;
    right: 0;
    bottom: calc(100% + 8px);
    min-width: 100%;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 20;
  }

  .kokoro-menu {
    width: 16rem;
    max-height: min(70vh, 28rem);
    overflow-y: auto;
    gap: 0;
    padding: 4px;
  }

  .menu-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px;
  }

  .menu-section + .menu-section {
    border-top: 1px solid var(--ink);
    margin-top: 4px;
    padding-top: 10px;
  }

  .menu-label {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 12px 6px;
  }

  .menu-scroll {
    max-height: 11rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .menu-item {
    font: inherit;
    font-size: 12.5px;
    background: transparent;
    color: var(--ink);
    border: none;
    border-radius: 6px;
    padding: 8px 12px;
    cursor: pointer;
    text-align: left;
    white-space: nowrap;
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .menu-meta {
    color: var(--muted);
  }

  .menu-item:hover {
    background: var(--card);
  }

  .menu-item.active {
    background: color-mix(in srgb, var(--ink) 16%, var(--bg));
  }
</style>
