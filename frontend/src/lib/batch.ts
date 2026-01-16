// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Paragraph } from "./text";

export interface Position {
  para: number;
  sent: number;
}

export function posInBatch(pos: Position, batch: Position[]): boolean {
  return batch.some((p) => p.para === pos.para && p.sent === pos.sent);
}

export function posEq(a: Position | null, b: Position | null): boolean {
  if (!a || !b) return false;
  return a.para === b.para && a.sent === b.sent;
}

export function getAllPositions(paragraphs: Paragraph[]): Position[] {
  const positions: Position[] = [];
  paragraphs.forEach((p, pi) => {
    p.sentences.forEach((_, si) => {
      positions.push({ para: pi, sent: si });
    });
  });
  return positions;
}

export function getBatch(
  pos: Position,
  allPositions: Position[],
  batchSize: number,
  forwardOnly: boolean,
  forceForward = false
): Position[] {
  const clickedIdx = allPositions.findIndex(
    (p) => p.para === pos.para && p.sent === pos.sent
  );
  if (clickedIdx === -1) return [pos];

  const batch: Position[] = [];

  if (forwardOnly || forceForward) {
    for (let i = 0; i < batchSize && clickedIdx + i < allPositions.length; i++) {
      batch.push(allPositions[clickedIdx + i]);
    }
  } else {
    const before = Math.floor((batchSize - 1) / 2);
    const after = batchSize - 1 - before;
    const startIdx = Math.max(0, clickedIdx - before);
    const endIdx = Math.min(allPositions.length - 1, clickedIdx + after);

    for (let i = startIdx; i <= endIdx; i++) {
      batch.push(allPositions[i]);
    }
  }

  return batch;
}

export function getBatchText(batch: Position[], paragraphs: Paragraph[]): string {
  return batch
    .map((pos) => paragraphs[pos.para]?.sentences[pos.sent] ?? "")
    .join(" ");
}

export function getNextBatchStart(
  activeBatch: Position[],
  allPositions: Position[]
): Position | null {
  if (activeBatch.length === 0) return null;

  const lastPos = activeBatch[activeBatch.length - 1];
  const lastIdx = allPositions.findIndex(
    (p) => p.para === lastPos.para && p.sent === lastPos.sent
  );

  const nextIdx = lastIdx + 1;
  if (nextIdx >= allPositions.length) return null;

  return allPositions[nextIdx];
}
