// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Split text into sentences. Splits on . ! ? followed by whitespace or end of string.
 */
export function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  const regex = /[^.!?]*[.!?]+/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const trimmed = match[0].trim();
    if (trimmed) {
      sentences.push(trimmed);
    }
    lastIndex = match.index + match[0].length;
  }

  // Handle trailing text without sentence-ending punctuation
  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    sentences.push(remaining);
  }

  return sentences;
}
