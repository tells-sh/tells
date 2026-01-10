<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Editable text area with sentence highlighting and TTS. -->

<script lang="ts">
  import { splitSentences } from "../lib/text";

  let text = $state("");
  let sentences = $state<string[]>([]);
  let hoveredIndex = $state<number | null>(null);
  let activeIndex = $state<number | null>(null);
  let isPaused = $state(false);
  let isEditing = $state(false);
  let editorEl: HTMLDivElement;

  let utteranceId = 0;

  function updateSentences() {
    sentences = splitSentences(text);
  }

  function syncText() {
    text = editorEl.innerText;
    updateSentences();
  }

  function renderSentences() {
    if (!editorEl) return;

    if (sentences.length === 0) {
      editorEl.innerHTML = "";
      return;
    }

    editorEl.innerHTML = sentences
      .map(
        (s, i) =>
          `<span class="sentence${activeIndex === i ? " active" : ""}${hoveredIndex === i && activeIndex !== i ? " hovered" : ""}" data-index="${i}">${escapeHtml(s)}</span> `
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
    renderSentences();
  }

  function handleMouseDown(e: MouseEvent) {
    if (isEditing) return;

    const target = e.target as HTMLElement;
    if (target.classList.contains("sentence")) {
      e.preventDefault(); // Prevent focus
      const index = parseInt(target.dataset.index!, 10);
      startFrom(index);
    }
  }

  function enterEditMode() {
    editorEl.focus();
  }

  function handleMouseOver(e: MouseEvent) {
    if (isEditing) return;

    const target = e.target as HTMLElement;
    if (target.classList.contains("sentence")) {
      const index = parseInt(target.dataset.index!, 10);
      if (hoveredIndex !== index) {
        hoveredIndex = index;
        renderSentences();
      }
    }
  }

  function handleMouseOut(e: MouseEvent) {
    if (isEditing) return;

    const target = e.target as HTMLElement;
    if (target.classList.contains("sentence")) {
      hoveredIndex = null;
      renderSentences();
    }
  }

  function speak(index: number) {
    if (index < 0 || index >= sentences.length) {
      activeIndex = null;
      isPaused = false;
      renderSentences();
      return;
    }

    const thisUtteranceId = ++utteranceId;
    activeIndex = index;
    isPaused = false;
    renderSentences();

    const utterance = new SpeechSynthesisUtterance(sentences[index]);

    utterance.onend = () => {
      if (thisUtteranceId === utteranceId && activeIndex === index) {
        speak(index + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled") {
        console.error("TTS error:", e.error);
      }
    };

    speechSynthesis.speak(utterance);
  }

  function startFrom(index: number) {
    speechSynthesis.cancel();
    speak(index);
  }

  function pause() {
    utteranceId++;
    speechSynthesis.cancel();
    isPaused = true;
  }

  function resume() {
    isPaused = false;
    if (activeIndex !== null) {
      speak(activeIndex);
    }
  }

  function stop() {
    utteranceId++;
    speechSynthesis.cancel();
    activeIndex = null;
    isPaused = false;
    renderSentences();
  }
</script>

<div class="container">
  <div class="toolbar">
    {#if !isEditing}
      {#if activeIndex !== null}
        {#if isPaused}
          <button class="toolbar-btn" onclick={resume}>Resume</button>
        {:else}
          <button class="toolbar-btn" onclick={pause}>Pause</button>
        {/if}
        <button class="toolbar-btn" onclick={stop}>Stop</button>
      {:else}
        <button class="toolbar-btn" onclick={enterEditMode}>Edit</button>
      {/if}
    {/if}
  </div>

  <div class="editor-wrapper">
    <div
      bind:this={editorEl}
      class="editor"
      class:editing={isEditing}
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      onfocus={handleFocus}
      onblur={exitEditMode}
      onmousedown={handleMouseDown}
      onmouseover={handleMouseOver}
      onmouseout={handleMouseOut}
    ></div>

    {#if sentences.length === 0 && !isEditing}
      <div class="placeholder">Click to type or paste text...</div>
    {/if}
  </div>
</div>


<style>
  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    min-height: 2rem;
  }

  .toolbar-btn {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    background: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
  }

  .toolbar-btn:hover {
    background: #e8e8e8;
  }

  .editor-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
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

</style>
