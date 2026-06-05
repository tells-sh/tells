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

Tells is a browser-based PDF reader with text-to-speech and synchronized word highlighting. It converts PDFs to audio using the browser's built-in speech synthesis, local neural TTS (Piper, Kokoro via ONNX), or server-side models for paid users.

## Design Philosophy

The UI should be fast, simple, and reliable. No waiting for JS frameworks to hydrate, no mystery meat navigation. When someone loads the page, they should immediately understand what everything does. Progress indicators are fine for actual work (TTS generation, sync uploads), but the app shouldn't feel sluggish or block interaction.

Aesthetically, think sourcehut: clean, functional, text-focused, but a bit easier to navigate. No gradients, no glassmorphism, no animations just because we can. Progressive disclosure keeps advanced features out of the way until needed.

Privacy comes first. PDFs never leave the device unless the user explicitly opts into paid server features. Full transparency on pricing, services used, and data handling. No dark patterns, no artificial feature gating, no annual discount tricks. The free tier should be genuinely useful. Kokoro TTS runs entirely in the browser and sounds great.

If something can work locally, it should work locally. Don't force server dependency where it isn't needed.

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

Free users get unlimited browser-based TTS (Web Speech API, espeak, Piper, Kokoro), a local PDF library, and full offline functionality. No account required.

Paid tiers add server-side features: high-end TTS voices (Kokoro, Chatterbox), OCR for scanned documents, cloud sync, Radio Drama mode, and audiobook export.

## Revenue

Primary revenue comes from paid subscriptions. Secondary options include donations/GitHub Sponsors, and potentially accessibility grants or enterprise licenses down the road.

**Domain:** tells.sh
