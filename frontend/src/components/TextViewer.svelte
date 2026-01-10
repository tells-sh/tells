<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Text viewer with sentence highlighting and TTS. -->

<script lang="ts">
  import { splitSentences } from "../lib/text";

  interface Props {
    text: string;
    onReset?: () => void;
  }

  let { text, onReset }: Props = $props();

  let sentences = $derived(splitSentences(text));
  let hoveredIndex = $state<number | null>(null);
  let activeIndex = $state<number | null>(null);
  let isPaused = $state(false);
  let sentenceElements: HTMLSpanElement[] = [];

  // Counter to invalidate old utterance callbacks after cancel
  let utteranceId = 0;

  function speak(index: number) {
    if (index < 0 || index >= sentences.length) {
      activeIndex = null;
      isPaused = false;
      return;
    }

    const thisUtteranceId = ++utteranceId;
    activeIndex = index;
    isPaused = false;

    const utterance = new SpeechSynthesisUtterance(sentences[index]);

    utterance.onend = () => {
      // Only auto-advance if this utterance is still valid
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

    // Scroll active sentence into view
    const el = sentenceElements[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function startFrom(index: number) {
    speechSynthesis.cancel();
    speak(index);
  }

  function pause() {
    utteranceId++; // Invalidate current utterance's onend
    speechSynthesis.cancel();
    isPaused = true;
  }

  function resume() {
    isPaused = false;
    if (activeIndex !== null) {
      speak(activeIndex); // Restart from current sentence
    }
  }

  function stop() {
    utteranceId++;
    speechSynthesis.cancel();
    activeIndex = null;
    isPaused = false;
  }

  function handleStartOver() {
    stop();
    onReset?.();
  }
</script>

<div class="text-viewer">
  <div class="content">
    {#each sentences as sentence, i}
      <span
        bind:this={sentenceElements[i]}
        class="sentence"
        class:hovered={hoveredIndex === i && activeIndex !== i}
        class:active={activeIndex === i}
        role="button"
        tabindex="0"
        onmouseenter={() => (hoveredIndex = i)}
        onmouseleave={() => (hoveredIndex = null)}
        onclick={() => startFrom(i)}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startFrom(i);
          }
        }}
      >{sentence}</span>{" "}
    {/each}
  </div>
</div>

<div class="controls">
  {#if activeIndex !== null}
    {#if isPaused}
      <button onclick={resume}>Resume</button>
    {:else}
      <button onclick={pause}>Pause</button>
    {/if}
    <button onclick={stop}>Stop</button>
  {/if}
  {#if onReset}
    <button onclick={handleStartOver}>Start over</button>
  {/if}
</div>

<style>
  .text-viewer {
    max-width: min(90vw, 800px);
    margin: 2rem auto;
    padding: 2rem;
    padding-bottom: 6rem;
    background: #fff;
    border-radius: 4px;
    min-height: calc(100vh - 10rem);
  }

  .content {
    font-size: 1rem;
    line-height: 1.6;
  }

  .sentence {
    cursor: pointer;
    border-radius: 2px;
    transition: background-color 0.1s;
  }

  .sentence.hovered {
    background-color: #e0e0e0;
  }

  .sentence.active {
    background-color: #ffd54f;
  }

  .controls {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    background: #fff;
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
  }

  .controls button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>
