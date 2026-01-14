// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

export type KokoroState = "idle" | "loading-package" | "loading-model" | "ready" | "error";
export type KokoroDtype = "fp32" | "fp16" | "q8" | "q4" | "q4f16";
export type KokoroDevice = "wasm" | "webgpu";

export interface KokoroProgress {
  loaded: number;
  total: number;
}

type KokoroTTSInstance = {
  generate: (text: string, options: { voice: string }) => Promise<{ toBlob: () => Promise<Blob> }>;
};

let ttsInstance: KokoroTTSInstance | null = null;

export async function initialize(
  dtype: KokoroDtype,
  device: KokoroDevice,
  onProgress: (progress: KokoroProgress) => void
): Promise<void> {
  const { KokoroTTS } = await import("kokoro-js");

  ttsInstance = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
    dtype,
    device,
    progress_callback: (progress: { status: string; loaded?: number; total?: number; file?: string }) => {
      if (progress.status === "progress" && progress.loaded !== undefined && progress.total !== undefined) {
        onProgress({
          loaded: progress.loaded,
          total: progress.total,
        });
      }
    },
  });
}

export async function generate(text: string, voice: string): Promise<Blob> {
  if (!ttsInstance) {
    throw new Error("Kokoro TTS not initialized");
  }
  const audio = await ttsInstance.generate(text, { voice });
  return audio.toBlob();
}
