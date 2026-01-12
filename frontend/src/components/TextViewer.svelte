<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Editable text area with sentence highlighting and TTS. -->

<script lang="ts">
  import { parseText, type Paragraph } from "../lib/text";

  interface Position {
    para: number;
    sent: number;
  }

  let text = $state("");
  let paragraphs = $state<Paragraph[]>([]);
  let hoveredPos = $state<Position | null>(null);
  let activePos = $state<Position | null>(null);
  let isPaused = $state(false);
  let isEditing = $state(false);
  let editorEl: HTMLDivElement;

  let utteranceId = 0;

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
              const isActive = posEq(activePos, { para: pi, sent: si });
              const isHovered = posEq(hoveredPos, { para: pi, sent: si }) && !isActive;
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
    if (pos && !posEq(hoveredPos, pos)) {
      hoveredPos = pos;
      renderContent();
    }
  }

  function handleMouseOut(e: MouseEvent) {
    if (isEditing) return;

    const target = e.target as HTMLElement;
    if (target.classList.contains("sentence")) {
      hoveredPos = null;
      renderContent();
    }
  }

  function nextPosition(pos: Position): Position | null {
    const para = paragraphs[pos.para];
    if (pos.sent + 1 < para.sentences.length) {
      return { para: pos.para, sent: pos.sent + 1 };
    }
    if (pos.para + 1 < paragraphs.length) {
      return { para: pos.para + 1, sent: 0 };
    }
    return null;
  }

  function speak(pos: Position) {
    const para = paragraphs[pos.para];
    if (!para || pos.sent >= para.sentences.length) {
      activePos = null;
      isPaused = false;
      renderContent();
      return;
    }

    const thisUtteranceId = ++utteranceId;
    activePos = pos;
    isPaused = false;
    renderContent();

    const utterance = new SpeechSynthesisUtterance(para.sentences[pos.sent]);

    utterance.onend = () => {
      if (thisUtteranceId === utteranceId && posEq(activePos, pos)) {
        const next = nextPosition(pos);
        if (next) {
          speak(next);
        } else {
          activePos = null;
          renderContent();
        }
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
    speak(pos);
  }

  function pause() {
    utteranceId++;
    speechSynthesis.cancel();
    isPaused = true;
  }

  function resume() {
    isPaused = false;
    if (activePos) {
      speak(activePos);
    }
  }

  function stop() {
    utteranceId++;
    speechSynthesis.cancel();
    activePos = null;
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

  <div class="controls">
    {#if !isEditing}
      {#if activePos !== null}
        {#if isPaused}
          <button class="control-btn" onclick={resume}>Resume</button>
        {:else}
          <button class="control-btn" onclick={pause}>Pause</button>
        {/if}
        <button class="control-btn" onclick={stop}>Stop</button>
      {:else}
        <button class="control-btn" onclick={enterEditMode}>Edit</button>
      {/if}
    {/if}
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

</style>
