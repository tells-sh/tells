<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Input component with tabs for PDF upload or text TTS. -->

<script lang="ts">
  import TextViewer from "./TextViewer.svelte";

  interface Props {
    onFile: (file: File) => void;
  }

  let { onFile }: Props = $props();

  type Tab = "pdf" | "text";
  let activeTab = $state<Tab>("pdf");

  let dragover = $state(false);
  let error = $state("");
  let input = $state<HTMLInputElement | null>(null);

  function isPdf(file: File): boolean {
    if (file.type === "application/pdf") return true;
    if (file.name.toLowerCase().endsWith(".pdf")) return true;
    return false;
  }

  function handleFile(file: File | undefined) {
    error = "";
    if (!file) return;

    if (!isPdf(file)) {
      error = "Please select a PDF file";
      return;
    }

    onFile(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragover = false;
    handleFile(e.dataTransfer?.files[0]);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    handleFile(target.files?.[0]);
  }
</script>

<div class="container">
  <div class="tabs">
    <button
      class="tab"
      class:active={activeTab === "pdf"}
      onclick={() => { activeTab = "pdf"; error = ""; }}
    >
      Upload PDF
    </button>
    <button
      class="tab"
      class:active={activeTab === "text"}
      onclick={() => { activeTab = "text"; error = ""; }}
    >
      Paste Text
    </button>
  </div>

  <div class="content">
    {#if activeTab === "pdf"}
      <button
        type="button"
        class="dropzone"
        class:dragover
        ondragover={(e) => { e.preventDefault(); dragover = true; }}
        ondragleave={() => dragover = false}
        ondrop={handleDrop}
        onclick={() => input?.click()}
      >
        <p>Drop a PDF here or click to select</p>
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <input
          bind:this={input}
          type="file"
          accept="application/pdf,.pdf"
          oninput={handleInput}
        />
      </button>
    {:else}
      <TextViewer />
    {/if}
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: min(90vw, 600px);
  }

  .tabs {
    display: flex;
  }

  .tab {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    border-bottom: none;
    background: var(--color-bg-light);
    cursor: pointer;
    font-size: 1rem;
    color: var(--color-text);
  }

  .tab:first-child {
    border-radius: 4px 0 0 0;
  }

  .tab:last-child {
    border-radius: 0 4px 0 0;
    border-left: none;
  }

  .tab.active {
    background: #fff;
    color: #000;
    border-bottom: 1px solid #fff;
    margin-bottom: -1px;
    position: relative;
    z-index: 1;
  }

  .content {
    border: 1px solid var(--color-border);
    border-top: none;
    border-radius: 0 0 4px 4px;
    background: #fff;
    min-height: 400px;
    display: flex;
    flex-direction: column;
  }

  .dropzone {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    min-height: 400px;
    background: none;
    border: none;
    font: inherit;
    width: 100%;
  }

  .dropzone.dragover {
    background: var(--color-bg-light);
  }

  input[type="file"] {
    display: none;
  }

  p {
    color: var(--color-text);
    font-size: 1.25rem;
    margin: 0.5rem;
  }

  .error {
    color: var(--color-error);
    font-size: 1rem;
  }
</style>
