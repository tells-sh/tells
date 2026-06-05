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

The backend is FastAPI (Python) with SQLite in WAL mode, backed up continuously via Litestream. TTS engines use an adapter pattern so we can swap them without API changes.

## Hosting

Everything runs on a Hetzner VPS in Germany:

```
tells.sh -> Hetzner VPS
            |-- Caddy (HTTPS, static files, reverse proxy)
            `-- FastAPI (/api)
```

Caddy handles HTTPS automatically via Let's Encrypt and serves static files directly. API routes proxy to FastAPI. Cloudflare can sit in front later for CDN if needed (free tier, just DNS changes).

## GPU

Server-side TTS and OCR run on Modal Serverless with NVIDIA T4 GPUs at \$0.000164/s (or NVIDIA L4 at \$0.000222/s if we need more speed). Cold starts are 1-5 seconds. Modal gives \$30/month in free credits, enough for roughly 14 books.

The free tier allows 10 concurrent GPUs and scales automatically; no queue management on our end.

## OCR

Marker handles scanned documents, math (returns LaTeX), and PDFs with broken text layers or bad reading order. It also returns text positions, useful for word highlighting. The Speech Rule Engine runs in-browser to convert LaTeX to spoken form ("x^2" becomes "x squared").

Cost is around $0.004 per page. Only pages that need it get processed; well-formed PDFs just use PDF.js extraction, which is free and local.

## Batch Processing

Users can request up to 25 pages at once for pre-caching. A round-robin queue ensures each user gets one page processed per rotation, preventing any single user from blocking others. This meshes well with Modal's 10 GPU concurrency limit, so everyone makes progress evenly.

## Auth

Authentication uses Better Auth (self-hosted). Supports email/password, TOTP, WebAuthn/passkeys, and optionally Google sign-in (requests email only, not name). FastAPI verifies JWTs.

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
