<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Overview

> [!IMPORTANT]
> This document is a tentative technical plan for Tells. It is not a
> privacy policy, terms of service, or other binding legal notice.
> Contents may change. Do not treat it as a statement of current product
> behavior or data practices.

Tells is text-to-speech software. It reads PDFs, pasted text, and text piped in from the CLI, with synchronized word highlighting. Voices come from the browser's built-in speech synthesis, local neural models (Piper, Kokoro via ONNX), or server-side models for paid users. OCR handles scanned documents.

## Design Philosophy

Fast, simple, reliable. No waiting for frameworks to hydrate, no mystery meat navigation. Progress indicators are for actual work (TTS generation, sync uploads); nothing else should block.

Plain, text-focused design. No gradients, no animations for their own sake. Advanced features stay out of the way until you need them.

Everything that can run locally runs locally. The cloud is an option, not a requirement, and it's always obvious when something leaves your device. Pricing, services, and data handling are documented. No dark patterns, no artificial feature gating, no annual discount tricks.

## Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Frontend | Svelte + TypeScript, Vite, PDF.js, ONNX Runtime Web |
| Backend  | FastAPI (Python), SQLite + Litestream               |
| Hosting  | Hetzner VPS + Caddy                                 |
| GPU      | Modal Serverless (NVIDIA T4/L4)                     |
| Auth     | Better Auth                                         |
| Payments | Lemon Squeezy                                       |
| Secrets  | SOPS                                                |

## Free vs Paid

Free users get unlimited browser-based TTS (Web Speech API, espeak, Piper, Kokoro), a local library, and full offline functionality. No account required.

Paid tiers run the heavy work server-side: TTS on GPUs (Kokoro, Chatterbox), OCR for scanned documents, cloud sync, Radio Drama mode, and audiobook export.

## Revenue

Paid subscriptions, plus donations/GitHub Sponsors.

**Domain:** tells.sh
