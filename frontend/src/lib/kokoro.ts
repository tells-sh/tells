// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

export type KokoroState = "idle" | "loading-package" | "loading-model" | "ready" | "error";
export type KokoroDtype = "fp32" | "fp16" | "q8" | "q4" | "q4f16";
export type KokoroDevice = "wasm" | "webgpu";

export interface KokoroProgress {
  loaded: number;
  total: number;
}

let worker: Worker | null = null;
let generateId = 0;
const pendingGenerations = new Map<number, { resolve: (blob: Blob) => void; reject: (err: Error) => void }>();

export async function initialize(
  dtype: KokoroDtype,
  device: KokoroDevice,
  onProgress: (progress: KokoroProgress) => void
): Promise<void> {
  worker = new Worker(new URL("./kokoro.worker.ts", import.meta.url), { type: "module" });

  return new Promise((resolve, reject) => {
    worker!.onmessage = (e: MessageEvent) => {
      const { type } = e.data;

      if (type === "progress") {
        onProgress({ loaded: e.data.loaded, total: e.data.total });
      } else if (type === "ready") {
        resolve();
      } else if (type === "error") {
        reject(new Error(e.data.message));
      } else if (type === "generated") {
        const pending = pendingGenerations.get(e.data.id);
        if (pending) {
          pendingGenerations.delete(e.data.id);
          if (e.data.error) {
            pending.reject(new Error(e.data.error));
          } else {
            pending.resolve(e.data.blob);
          }
        }
      }
    };

    worker!.postMessage({ type: "init", dtype, device });
  });
}

export async function generate(text: string, voice: string): Promise<Blob> {
  if (!worker) {
    throw new Error("Kokoro TTS not initialized");
  }

  const id = ++generateId;

  return new Promise((resolve, reject) => {
    pendingGenerations.set(id, { resolve, reject });
    worker!.postMessage({ type: "generate", id, text, voice });
  });
}
