<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Renders a PDF page to a canvas element. -->

<script lang="ts">
  import type { PDFDocumentProxy } from "pdfjs-dist";
  import { renderPage } from "../lib/pdf";

  interface Props {
    pdf: PDFDocumentProxy;
    page: number;
  }

  let { pdf, page }: Props = $props();
  let canvas: HTMLCanvasElement;
  let loading = $state(true);
  let renderCount = 0;

  $effect(() => {
    if (!canvas || !pdf) return;

    const currentRender = ++renderCount;
    loading = true;

    renderPage(pdf, page, canvas)
      .then(() => {
        if (currentRender === renderCount) {
          loading = false;
        }
      })
      .catch((err) => {
        if (currentRender === renderCount) {
          loading = false;
          console.error("Failed to render page:", err);
        }
      });
  });
</script>

<div class="viewer">
  {#if loading}
    <div class="loading">Loading...</div>
  {/if}
  <canvas bind:this={canvas} class:hidden={loading}></canvas>
</div>

<style>
  .viewer {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
    padding-bottom: 5rem;
    min-height: calc(100vh - 4rem);
  }

  canvas {
    max-width: 100%;
    height: auto;
  }

  canvas.hidden {
    visibility: hidden;
    position: absolute;
  }

  .loading {
    color: #555;
  }
</style>
