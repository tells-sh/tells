<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Editable text area with sentence highlighting and TTS. -->

<script lang="ts" module>
  let voices = $state<SpeechSynthesisVoice[]>([]);
  let selectedVoice = $state<SpeechSynthesisVoice | null>(null);
  let rate = $state(1);
  let ttsEngine = $state<"web">("web");

  function loadVoices() {
    voices = speechSynthesis.getVoices();
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }
  }
  requestIdleCallback(loadVoices);
</script>

<script lang="ts">
  import { parseText, type Paragraph } from "../lib/text";

  $effect(() => {
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      speechSynthesis.cancel();
    };
  });

  interface Position {
    para: number;
    sent: number;
  }

  let text = $state("");
  let paragraphs = $state<Paragraph[]>([]);
  let allPositions = $derived.by(() => {
    const positions: Position[] = [];
    paragraphs.forEach((p, pi) => {
      p.sentences.forEach((_, si) => {
        positions.push({ para: pi, sent: si });
      });
    });
    return positions;
  });
  let hoveredBatch = $state<Position[]>([]);
  let activeBatch = $state<Position[]>([]);
  let isPaused = $state(false);
  let isEditing = $state(false);
  let editorEl: HTMLDivElement;

  let batchSize = $state(1);
  let forwardOnly = $state(true);

  let voiceSearch = $state("");
  let localeOnly = $state(true);
  let voiceDropdownOpen = $state(false);
  let voiceDropdownMounted = $state(false);

  const userLang = navigator.language.slice(0, 2);

  function getFilteredVoices(): SpeechSynthesisVoice[] {
    let filtered = voices;
    if (localeOnly) {
      filtered = filtered.filter((v) => v.lang.startsWith(userLang));
    }
    if (voiceSearch) {
      const q = voiceSearch.toLowerCase();
      filtered = filtered.filter((v) => v.name.toLowerCase().includes(q));
    }
    return filtered;
  }

  let utteranceId = 0;

  function posInBatch(pos: Position, batch: Position[]): boolean {
    return batch.some((p) => p.para === pos.para && p.sent === pos.sent);
  }

  function getBatch(pos: Position): Position[] {
    const clickedIdx = allPositions.findIndex(
      (p) => p.para === pos.para && p.sent === pos.sent
    );
    if (clickedIdx === -1) return [pos];

    const batch: Position[] = [];

    if (forwardOnly) {
      for (let i = 0; i < batchSize && clickedIdx + i < allPositions.length; i++) {
        batch.push(allPositions[clickedIdx + i]);
      }
    } else {
      const before = Math.floor((batchSize - 1) / 2);
      const after = batchSize - 1 - before;
      const startIdx = Math.max(0, clickedIdx - before);
      const endIdx = Math.min(allPositions.length - 1, clickedIdx + after);

      for (let i = startIdx; i <= endIdx; i++) {
        batch.push(allPositions[i]);
      }
    }

    return batch;
  }

  function getBatchText(batch: Position[]): string {
    return batch
      .map((pos) => paragraphs[pos.para]?.sentences[pos.sent] ?? "")
      .join(" ");
  }

  function updateParagraphs() {
    paragraphs = parseText(text);
  }

  function syncText() {
    text = editorEl.innerText;
    updateParagraphs();
  }

  function posEq(a: Position | null, b: Position | null): boolean {
    if (!a || !b) return false;
    return a.para === b.para && a.sent === b.sent;
  }

  function renderContent() {
    if (!editorEl) return;

    if (paragraphs.length === 0) {
      editorEl.innerHTML = "";
      return;
    }

    editorEl.innerHTML = paragraphs
      .map(
        (p, pi) =>
          `<p>${p.sentences
            .map((s, si) => {
              const pos = { para: pi, sent: si };
              const isActive = posInBatch(pos, activeBatch);
              const isHovered = posInBatch(pos, hoveredBatch) && !isActive;
              return `<span class="sentence${isActive ? " active" : ""}${isHovered ? " hovered" : ""}" data-para="${pi}" data-sent="${si}">${escapeHtml(s)}</span>`;
            })
            .join(" ")}</p>`
      )
      .join("");
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function handleFocus() {
    isEditing = true;
    stop();
  }

  function exitEditMode() {
    isEditing = false;
    syncText();
    renderContent();
  }

  function getPositionFromElement(el: HTMLElement): Position | null {
    if (!el.classList.contains("sentence")) return null;
    const para = parseInt(el.dataset.para!, 10);
    const sent = parseInt(el.dataset.sent!, 10);
    return { para, sent };
  }

  function handleMouseDown(e: MouseEvent) {
    if (isEditing) return;

    const pos = getPositionFromElement(e.target as HTMLElement);
    if (pos) {
      e.preventDefault();
      startFrom(pos);
    }
  }

  function enterEditMode() {
    editorEl.focus();
  }

  function handleMouseOver(e: MouseEvent) {
    if (isEditing) return;

    const pos = getPositionFromElement(e.target as HTMLElement);
    if (pos) {
      const newBatch = getBatch(pos);
      if (newBatch.length !== hoveredBatch.length || !newBatch.every((p, i) => posEq(p, hoveredBatch[i]))) {
        hoveredBatch = newBatch;
        renderContent();
      }
    }
  }

  function handleMouseOut(e: MouseEvent) {
    if (isEditing) return;

    const target = e.target as HTMLElement;
    if (target.classList.contains("sentence")) {
      hoveredBatch = [];
      renderContent();
    }
  }

  function speakBatch() {
    if (activeBatch.length === 0) {
      isPaused = false;
      renderContent();
      return;
    }

    const thisUtteranceId = ++utteranceId;
    isPaused = false;
    renderContent();

    const utterance = new SpeechSynthesisUtterance(getBatchText(activeBatch));
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;

    utterance.onend = () => {
      if (thisUtteranceId === utteranceId) {
        activeBatch = [];
        renderContent();
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled") {
        console.error("TTS error:", e.error);
      }
    };

    speechSynthesis.speak(utterance);
  }

  function startFrom(pos: Position) {
    speechSynthesis.cancel();
    activeBatch = getBatch(pos);
    speakBatch();
  }

  function pause() {
    utteranceId++;
    speechSynthesis.cancel();
    isPaused = true;
  }

  function resume() {
    isPaused = false;
    if (activeBatch.length > 0) {
      speakBatch();
    }
  }

  function stop() {
    utteranceId++;
    speechSynthesis.cancel();
    activeBatch = [];
    isPaused = false;
    renderContent();
  }
</script>

<div class="container">
  <div
    bind:this={editorEl}
    class="editor"
    class:editing={isEditing}
    contenteditable="true"
    role="textbox"
    tabindex="0"
    aria-multiline="true"
    onfocus={handleFocus}
    onblur={exitEditMode}
    onmousedown={handleMouseDown}
    onmouseover={handleMouseOver}
    onmouseout={handleMouseOut}
  ></div>

  {#if paragraphs.length === 0 && !isEditing}
    <div class="placeholder">Click to type or paste text...</div>
  {/if}

  <div class="controls" class:hidden={isEditing}>
    {#if activeBatch.length > 0}
        {#if isPaused}
          <button class="control-btn" onclick={resume}>Resume</button>
        {:else}
          <button class="control-btn" onclick={pause}>Pause</button>
        {/if}
        <button class="control-btn" onclick={stop}>Stop</button>
      {:else}
        <button class="control-btn" onclick={enterEditMode}>Edit</button>
      {/if}

      <div class="batch-controls">
        <label class="batch-label">
          Batch
          <input
            type="number"
            class="batch-input"
            min="1"
            max="20"
            bind:value={batchSize}
          />
        </label>
        <label class="batch-label">
          <input type="checkbox" bind:checked={forwardOnly} />
          Forward
        </label>
      </div>

      <div class="tts-controls">
        <label class="control-label">
          Engine
          <select class="control-select" bind:value={ttsEngine}>
            <option value="web">Web</option>
          </select>
        </label>

        <div class="control-label">
          Voice
          <div class="voice-dropdown">
            <button
              class="voice-dropdown-btn"
              onclick={() => { voiceDropdownOpen = !voiceDropdownOpen; voiceDropdownMounted = true; }}
            >
              {selectedVoice?.name ?? "Select voice"}
            </button>
            {#if voiceDropdownMounted}
            <div class="voice-dropdown-menu" class:hidden={!voiceDropdownOpen}>
              <input
                type="text"
                class="voice-search"
                placeholder="Search..."
                bind:value={voiceSearch}
              />
              <label class="locale-filter">
                <input type="checkbox" bind:checked={localeOnly} />
                {userLang.toUpperCase()} only
              </label>
              <div class="voice-list">
                {#each getFilteredVoices() as voice}
                  <button
                    class="voice-option"
                    class:selected={selectedVoice === voice}
                    onclick={() => { selectedVoice = voice; voiceDropdownOpen = false; }}
                  >
                    {voice.name}
                  </button>
                {/each}
              </div>
            </div>
            {/if}
          </div>
        </div>

        <label class="control-label">
          Rate
          <input type="range" class="rate-slider" min="0.5" max="2" step="0.1" bind:value={rate} />
          <span class="rate-value">{rate}x</span>
        </label>
      </div>
  </div>
</div>


<style>
  .container {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .controls {
    position: fixed;
    top: 50%;
    left: calc(50% + 320px);
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 10;
  }

  .control-btn {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    background: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
    white-space: nowrap;
  }

  .control-btn:hover {
    background: #e8e8e8;
  }

  .editor {
    flex: 1;
    min-height: 300px;
    padding: 1rem;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.6;
    background: #fff;
    border: none;
    outline: none;
    overflow-y: auto;
    cursor: text;
  }

  .editor :global(p) {
    margin: 0 0 1em 0;
  }

  .editor :global(p:last-child) {
    margin-bottom: 0;
  }

  .placeholder {
    position: absolute;
    top: 1rem;
    left: 1rem;
    color: #999;
    pointer-events: none;
  }

  .editor :global(.sentence) {
    border-radius: 2px;
    transition: background-color 0.1s;
  }

  .editor:not(.editing) :global(.sentence) {
    cursor: pointer;
  }

  .editor:not(.editing) :global(.sentence.hovered) {
    background-color: #e0e0e0;
  }

  .editor :global(.sentence.active) {
    background-color: #ffd54f;
  }

  .batch-controls {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .batch-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    color: #555;
  }

  .batch-input {
    width: 3rem;
    padding: 0.25rem;
    font-size: 0.8125rem;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  .tts-controls {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8125rem;
    color: #555;
  }

  .control-select {
    padding: 0.25rem;
    font-size: 0.8125rem;
    border: 1px solid #ccc;
    border-radius: 3px;
    max-width: 120px;
  }

  .rate-slider {
    width: 80px;
  }

  .rate-value {
    font-size: 0.75rem;
    color: #777;
  }

  .voice-dropdown {
    position: relative;
  }

  .voice-dropdown-btn {
    width: 100%;
    padding: 0.25rem;
    font-size: 0.8125rem;
    text-align: left;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .voice-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 200px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 100;
  }

  .voice-search {
    width: 100%;
    padding: 0.375rem;
    font-size: 0.8125rem;
    border: none;
    border-bottom: 1px solid #eee;
    outline: none;
    box-sizing: border-box;
  }

  .locale-filter {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem;
    font-size: 0.75rem;
    color: #555;
    border-bottom: 1px solid #eee;
  }

  .voice-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .voice-option {
    display: block;
    width: 100%;
    padding: 0.375rem;
    font-size: 0.8125rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
  }

  .hidden {
    display: none;
  }

  .voice-option:hover {
    background: #f0f0f0;
  }

  .voice-option.selected {
    background: #e3f2fd;
  }
</style>
