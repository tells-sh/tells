<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Backend

> [!IMPORTANT]
> This document is a tentative technical plan for Tells. It is not a
> privacy policy, terms of service, or other binding legal notice.
> Contents may change. Do not treat it as a statement of current product
> behavior or data practices.

The backend is FastAPI (Python) with SQLite in WAL mode. Litestream handles continuous backups. TTS engines sit behind adapters so we can swap them without API changes.

## Hosting

Everything runs on a Hetzner VPS in Germany:

```
tells.sh -> Hetzner VPS
            |-- Caddy (HTTPS, static files, reverse proxy)
            `-- FastAPI (/api)
```

Caddy handles HTTPS through Let's Encrypt, serves static files, and proxies API routes to FastAPI. Cloudflare can sit in front later if we need a CDN.

## GPU

Paid TTS and OCR run server-side on Modal Serverless with NVIDIA T4 GPUs. L4 GPUs are the upgrade path if T4 is too slow. Modal bills by runtime and includes free credits, so idle capacity does not cost us anything.

Modal handles GPU scaling. We still keep our own fairness queue so one user cannot tie up every job.

## OCR

Marker handles scanned documents, math output as LaTeX, and PDFs with broken text layers or bad reading order. It also returns text positions for word highlighting. The Speech Rule Engine runs in-browser to turn LaTeX into speech, so `x^2` becomes e.g. "x squared".

OCR has a server-side GPU cost, so only pages that need it get processed. Well-formed PDFs use local PDF.js text extraction instead.

## Batch Processing

Users can queue batches for pre-caching. Jobs run round-robin by user, one page per rotation, so one large document cannot block everyone else.

## Auth

Authentication uses self-hosted Better Auth: email/password, TOTP, WebAuthn/passkeys, and optional Google sign-in. Google requests email only, not name. FastAPI verifies JWTs.

Free users don't need an account at all; everything runs in the browser.

Self-hosted deployments have two auth modes:

- `AUTH_MODE=none`: local/single user, no auth
- `AUTH_MODE=header`: trust a reverse proxy (Authelia, Authentik, Cloudflare Access)

## Payments

Lemon Squeezy handles payments, VAT, receipts, and chargebacks. Webhooks sync subscription status to our database.

## Email

Resend handles transactional email: auth emails (verification, password reset) and security notices. No marketing, no newsletters.

## Database

Three tables in SQLite:

- **Usage**: `user_id`, `gpu_requests_this_month`, `bonus_credits`
- **Subscriptions**: `user_id`, `lemon_squeezy_subscription_id`, `status`, `period_end`
- **NotificationPreferences**: `user_id`, `security_alerts`

Better Auth handles all auth data (users, passwords, TOTP, passkeys). We only store usage tracking, subscription state, and notification preferences.

Litestream continuously backs up to Hetzner Object Storage in Germany.
