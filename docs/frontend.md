<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Frontend

> [!IMPORTANT]
> This document is a tentative technical plan for Tells. It is not a
> privacy policy, terms of service, or other binding legal notice.
> Contents may change. Do not treat it as a statement of current product
> behavior or data practices.

The frontend is built with Svelte and TypeScript, bundled with Vite. PDF rendering uses PDF.js. TTS uses the browser's built-in Web Speech API or local models (espeak, Piper, Kokoro) via ONNX/WASM. All PDF parsing happens client-side.

## Dependencies

Keep dependencies minimal. If something is under 20 lines to write yourself, don't install a package. No trivial packages (is-even, left-pad, etc.), no massive dependency trees for simple tasks.

| Dependency    | Purpose                            | Lazy |
| ------------- | ---------------------------------- | ---- |
| pdfjs-dist    | PDF rendering and text extraction  | No   |
| kokoro-js     | Kokoro TTS (pulls in ONNX Runtime) | Yes  |
| libsodium     | Encryption for cloud sync          | Yes  |
| tus-js-client | Resumable uploads                  | Yes  |
| fflate        | Streaming zip for backups          | Yes  |

Web Crypto and CompressionStream exist but don't cover our needs: libsodium provides streaming encryption and Argon2id, fflate provides streaming zip.

Not allowed: moment.js (use native Date), lodash for one function, axios (use fetch).

Before adding anything, check bundle size on bundlephobia.com and verify there's no native API. Free users should never download sync-related code.

## Web Workers

Never block the main thread. Even one second of lag is unacceptable.

Three workers handle the heavy lifting:

- **TTS Worker**: runs Piper/Kokoro via ONNX in the background. Web Speech API runs on main thread natively.
- **Crypto Worker**: encrypts/decrypts files with libsodium secretstream (streaming, chunked)
- **PDF Worker**: extracts text from large PDFs

These are separate workers rather than one shared worker because a user might generate TTS while syncing, and tasks should run in parallel.

The UI stays responsive throughout; users can scroll and read while audio generates.

This architecture (Web Workers, Web Crypto, WASM) works identically across browser, PWA, Tauri, and Capacitor. Same code runs on desktop and mobile.

## Storage

| Data                                      | Storage   | Rationale         |
| ----------------------------------------- | --------- | ----------------- |
| Metadata (positions, settings, bookmarks) | IndexedDB | Small, structured |
| PDFs                                      | OPFS      | Large binaries    |
| Audio cache                               | OPFS      | Large binaries    |
| TTS models                                | OPFS      | Large binaries    |

### Audio Cache

Generated audio goes to the Origin Private File System, keyed by hash(text + voice + settings). Cache hits are near-instant; misses pay the full generation cost.

### PDF Library

PDF blobs live in OPFS, metadata (page position, last opened, title) in IndexedDB. When users return, they see their library and can resume where they left off.

### Quotas and Eviction

OPFS and IndexedDB share the same quota pool; OPFS is faster, not extra space. Check available storage with `navigator.storage.estimate()` before saving large files. Quotas vary by browser and available disk.

Both OPFS and IndexedDB can be evicted under storage pressure. For better retention, request persistent storage via `navigator.storage.persist()`. Installing as a PWA helps. Cloud sync (paid) is the only guaranteed durability.

If storage runs low, warn users: "Not enough space. Export a backup or enable cloud sync."

### Local Backup

Free users can export everything (PDFs + audio + metadata) as a zip file and restore it later. Zipping uses fflate for streaming compression (backups can get large), running in a Web Worker so the UI stays responsive.

```
tells-backup-2025-01-15.zip
|-- metadata.json       <- settings, page positions, bookmarks
|-- pdfs/
|   `-- *.pdf
`-- audio/
    `-- *.mp3
```

OPFS is supported in Chrome, Firefox, Safari, and Edge since 2023.

## Model Delivery

Web Speech API is built-in, no download required. Piper and Kokoro need a model download (Kokoro models are bigger). Both lazy-load on first use and cache in OPFS.

The initial page load stays small; models only download when the user actually selects them.

## TTS

| Tier | Engine         | Location  |
| ---- | -------------- | --------- |
| Free | Web Speech API | Browser   |
| Free | espeak         | Browser   |
| Free | Piper          | Browser   |
| Free | Kokoro         | Browser   |
| Paid | Kokoro         | Modal GPU |
| Paid | Chatterbox     | Modal GPU |

Kokoro sounds good enough that many users won't need paid TTS at all.

Browser-based TTS runs in a dedicated worker (espeak, Piper, Kokoro) or natively (Web Speech API). Audio generates one sentence at a time, streaming to playback as soon as it's ready. Progress is visible (e.g. "Page 3/25 generating...") and users can cancel anytime. Generated audio caches in OPFS so the same text never regenerates.
