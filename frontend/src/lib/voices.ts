// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { KokoroDtype } from "./kokoro";

export const KOKORO_VOICES = [
  { id: "af_heart", name: "Heart" },
  { id: "af_alloy", name: "Alloy" },
  { id: "af_aoede", name: "Aoede" },
  { id: "af_bella", name: "Bella" },
  { id: "af_jessica", name: "Jessica" },
  { id: "af_kore", name: "Kore" },
  { id: "af_nicole", name: "Nicole" },
  { id: "af_nova", name: "Nova" },
  { id: "af_river", name: "River" },
  { id: "af_sarah", name: "Sarah" },
  { id: "af_sky", name: "Sky" },
  { id: "am_adam", name: "Adam" },
  { id: "am_echo", name: "Echo" },
  { id: "am_eric", name: "Eric" },
  { id: "am_fenrir", name: "Fenrir" },
  { id: "am_liam", name: "Liam" },
  { id: "am_michael", name: "Michael" },
  { id: "am_onyx", name: "Onyx" },
  { id: "am_puck", name: "Puck" },
  { id: "am_santa", name: "Santa" },
  { id: "bf_alice", name: "Alice" },
  { id: "bf_emma", name: "Emma" },
  { id: "bf_isabella", name: "Isabella" },
  { id: "bf_lily", name: "Lily" },
  { id: "bm_daniel", name: "Daniel" },
  { id: "bm_fable", name: "Fable" },
  { id: "bm_george", name: "George" },
  { id: "bm_lewis", name: "Lewis" },
] as const;

export type KokoroVoiceId = (typeof KOKORO_VOICES)[number]["id"];

// Model sizes in MB per dtype (from https://huggingface.co/onnx-community/Kokoro-82M-ONNX/tree/main/onnx)
export const MODEL_SIZE_MB: Record<KokoroDtype, number> = {
  fp32: 326,
  fp16: 163,
  q8: 86,
  q4: 305,
  q4f16: 154,
};
