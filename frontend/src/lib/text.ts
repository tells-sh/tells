// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface Paragraph {
  sentences: string[];
}

const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });

/**
 * Parse text into paragraphs and sentences.
 * Paragraphs split on double newlines. Single newlines become spaces.
 */
export function parseText(text: string): Paragraph[] {
  const paragraphs = text.split(/\n\s*\n/);

  return paragraphs
    .map((p) => {
      const normalized = p.replace(/\n/g, " ").trim();
      if (!normalized) return null;
      return { sentences: splitSentences(normalized) };
    })
    .filter((p): p is Paragraph => p !== null && p.sentences.length > 0);
}

function splitSentences(text: string): string[] {
  const segments = segmenter.segment(text);
  return [...segments].map((s) => s.segment.trim()).filter((s) => s.length > 0);
}
