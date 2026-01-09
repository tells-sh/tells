// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Wrapper around PDF.js for loading PDFs, rendering pages to canvas,
 * and extracting text content.
 */

import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

export class PdfLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfLoadError";
  }
}

export async function loadPdf(file: File): Promise<PDFDocumentProxy> {
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new PdfLoadError("Failed to read file");
  }

  try {
    return await pdfjsLib.getDocument({ data: buffer }).promise;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new PdfLoadError(`Invalid or corrupted PDF: ${message}`);
  }
}

export async function renderPage(
  pdf: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.5
): Promise<RenderTask> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const renderTask = page.render({ canvasContext: ctx, viewport });
  await renderTask.promise;
  return renderTask;
}

export async function getPageText(
  pdf: PDFDocumentProxy,
  pageNum: number
): Promise<string> {
  const page = await pdf.getPage(pageNum);
  const content = await page.getTextContent();
  return content.items
    .map((item) => ("str" in item ? item.str : ""))
    .join(" ");
}
