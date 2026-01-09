<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Root component. Manages app state and switches between dropzone and viewer. -->

<script lang="ts">
  import type { PDFDocumentProxy } from "pdfjs-dist";
  import { loadPdf, PdfLoadError } from "./lib/pdf";
  import Dropzone from "./components/Dropzone.svelte";
  import Viewer from "./components/Viewer.svelte";
  import Controls from "./components/Controls.svelte";
  import Footer from "./components/Footer.svelte";

  let pdf = $state<PDFDocumentProxy | null>(null);
  let page = $state(1);
  let total = $state(0);
  let loading = $state(false);
  let error = $state("");

  async function handleFile(file: File) {
    loading = true;
    error = "";

    try {
      pdf = await loadPdf(file);
      total = pdf.numPages;
      page = 1;
    } catch (err) {
      if (err instanceof PdfLoadError) {
        error = err.message;
      } else {
        error = "Failed to load PDF";
      }
      pdf = null;
    } finally {
      loading = false;
    }
  }

  function handleReset() {
    pdf = null;
    page = 1;
    total = 0;
    error = "";
  }
</script>

{#if loading}
  <div class="loading">Loading PDF...</div>
{:else if error}
  <div class="error-container">
    <p class="error">{error}</p>
    <button onclick={handleReset}>Try another file</button>
  </div>
{:else if pdf}
  <Viewer {pdf} {page} />
  <Controls {page} {total} onPageChange={(p) => page = p} />
{:else}
  <Dropzone onFile={handleFile} />
{/if}

<Footer />

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: #555;
    font-size: 1.25rem;
  }

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 1rem;
  }

  .error {
    color: #c00;
    font-size: 1.25rem;
  }

  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>
