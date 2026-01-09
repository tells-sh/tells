<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- File picker with drag-and-drop support. Validates that the file is a PDF. -->

<script lang="ts">
  interface Props {
    onFile: (file: File) => void;
  }

  let { onFile }: Props = $props();
  let dragover = $state(false);
  let error = $state("");
  let input: HTMLInputElement;

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

<div
  class="dropzone"
  class:dragover
  role="button"
  tabindex="0"
  ondragover={(e) => { e.preventDefault(); dragover = true; }}
  ondragleave={() => dragover = false}
  ondrop={handleDrop}
  onclick={() => input.click()}
  onkeydown={(e) => { if (e.key === "Enter") input.click(); }}
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
</div>

<style>
  .dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: min(90vw, 500px);
    aspect-ratio: 8.5 / 11;
    border: 2px dashed #ccc;
    border-radius: 4px;
    cursor: pointer;
    background: #fff;
  }

  .dropzone.dragover {
    border-color: #000;
    background: #f5f5f5;
  }

  input {
    display: none;
  }

  p {
    color: #555;
    font-size: 1.25rem;
    margin: 0.5rem;
  }

  .error {
    color: #c00;
    font-size: 1rem;
  }
</style>
