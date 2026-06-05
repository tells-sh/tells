<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Roadmap

> [!IMPORTANT]
> This document is a tentative technical plan for Tells. It is not a
> privacy policy, terms of service, or other binding legal notice.
> Contents may change. Do not treat it as a statement of current product
> behavior or data practices.

## Cloud Sync

Sticking with SQLite + Litestream (CouchDB is overkill for simple sync).

Encryption uses libsodium (around 100KB, lazy-loaded): Argon2id for key derivation, secretstream for streaming encryption. Why libsodium over Web Crypto? It handles both hashing and encryption, and crucially supports streaming: encrypting chunks while uploading. Web Crypto can't stream.

Uploads use the Tus protocol (tus-js-client, around 15KB, lazy-loaded) for resumable uploads. If the connection drops mid-upload, it resumes automatically; users see the progress bar continue, not "failed, try again."

Tus needs to know the final file size upfront. With streaming encryption, we pre-calculate the encrypted size (original + overhead) with simple math: no memory bloat, accurate progress bar.

Both libraries are lazy-loaded. Only paid sync users download them; free users never see this code.

The server stores encrypted blobs it cannot read. PDFs go to Hetzner Object Storage (also encrypted). Small sync data (page positions, highlights, bookmarks, around 10KB) uses a simple POST; Tus is only for larger files.

Conflict resolution is TBD. Need to handle offline edits on multiple devices without leaking timestamps to the server.

User experience: local updates are instant (save to IndexedDB/OPFS immediately), network sync happens in the background. Users never wait.

## Radio Drama Mode

Text is extracted from the PDF (via PDF.js or OCR) and sent to BookNLP, which identifies characters and attributes dialogue. This runs server-side on Modal (500MB-1.3GB models, too heavy for browser).

Processing takes around 60 minutes on CPU or 10-15 minutes on GPU per book. It's a one-time operation; results cache forever. The output is a script with character assignments, and TTS generates different voices for each character.

English only for now.

## Future

Ideas that might happen eventually:

- WebGPU backend for ONNX Runtime (GPU acceleration in browser)
- Heavier local models in browser once WebGPU matures
- Open source self-hostable backend
- Mobile apps via Tauri (desktop) and Capacitor (app stores)
- Voice cloning
