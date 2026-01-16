// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

type KokoroTTSInstance = {
  generate: (text: string, options: { voice: string }) => Promise<{ toBlob: () => Promise<Blob> }>;
};

let ttsInstance: KokoroTTSInstance | null = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, id } = e.data;

  if (type === "init") {
    const { dtype, device } = e.data;
    try {
      const { KokoroTTS } = await import("kokoro-js");

      ttsInstance = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
        dtype,
        device,
        progress_callback: (progress: { status: string; loaded?: number; total?: number }) => {
          if (progress.status === "progress" && progress.loaded !== undefined && progress.total !== undefined) {
            self.postMessage({ type: "progress", loaded: progress.loaded, total: progress.total });
          }
        },
      });

      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "error", message: err instanceof Error ? err.message : "Failed to load Kokoro" });
    }
  } else if (type === "generate") {
    const { text, voice } = e.data;
    if (!ttsInstance) {
      self.postMessage({ type: "generated", id, error: "Not initialized" });
      return;
    }

    try {
      const audio = await ttsInstance.generate(text, { voice });
      const blob = await audio.toBlob();
      self.postMessage({ type: "generated", id, blob });
    } catch (err) {
      self.postMessage({ type: "generated", id, error: err instanceof Error ? err.message : "Generation failed" });
    }
  }
};
