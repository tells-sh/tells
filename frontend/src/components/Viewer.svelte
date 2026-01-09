<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Renders all PDF pages in a scrollable view. -->

<script lang="ts">
  import type { PDFDocumentProxy } from "pdfjs-dist";
  import { renderPage } from "../lib/pdf";

  interface Props {
    pdf: PDFDocumentProxy;
    scrollRequest?: { page: number; id: number } | null;
    onPageChange?: (page: number) => void;
  }

  let { pdf, scrollRequest, onPageChange }: Props = $props();

  let canvases = new Map<number, HTMLCanvasElement>();
  let lastScrollId = 0;

  function registerCanvas(canvas: HTMLCanvasElement, pageNum: number) {
    canvases.set(pageNum, canvas);

    renderPage(pdf, pageNum, canvas).catch((err) => {
      console.error(`Failed to render page ${pageNum}:`, err);
    });

    return {
      destroy() {
        canvases.delete(pageNum);
      }
    };
  }

  $effect(() => {
    if (scrollRequest && scrollRequest.id !== lastScrollId) {
      lastScrollId = scrollRequest.id;
      // Small delay to ensure canvases are mounted
      requestAnimationFrame(() => {
        const canvas = canvases.get(scrollRequest.page);
        if (canvas) {
          canvas.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  });

  function handleScroll() {
    if (!onPageChange || canvases.size === 0) return;

    const viewportMiddle = window.scrollY + window.innerHeight / 2;

    for (let i = 1; i <= pdf.numPages; i++) {
      const canvas = canvases.get(i);
      if (!canvas) continue;

      const rect = canvas.getBoundingClientRect();
      const canvasTop = rect.top + window.scrollY;
      const canvasBottom = canvasTop + rect.height;

      if (viewportMiddle >= canvasTop && viewportMiddle < canvasBottom) {
        onPageChange(i);
        return;
      }
    }
  }
</script>

<svelte:window onscroll={handleScroll} />

<div class="viewer">
  {#each { length: pdf.numPages } as _, i}
    <canvas use:registerCanvas={i + 1}></canvas>
  {/each}
</div>

<style>
  .viewer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    padding-bottom: 6rem;
  }

  canvas {
    max-width: 100%;
    height: auto;
    background: #fff;
  }
</style>
