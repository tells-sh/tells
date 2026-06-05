<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Privacy

> [!IMPORTANT]
> This document is a tentative technical plan for Tells. It is not a
> privacy policy, terms of service, or other binding legal notice.
> Contents may change. Do not treat it as a statement of current product
> behavior or data practices.

PDFs never leave the browser. For paid features, we send: plain text for server TTS, page images for OCR, and extracted text for Radio Drama. None of this is logged or stored: processed in memory, then discarded. The free tier runs entirely in-browser with full privacy.

## Data Residency

| Service       | Location | Data                                             |
| ------------- | -------- | ------------------------------------------------ |
| Hetzner       | Germany  | App DB (usage, subscriptions, preferences, auth) |
| Modal         | US       | Text for TTS (transient, not stored)             |
| Lemon Squeezy | US       | Name, email, payment info, billing address       |
| Resend        | US       | Email addresses (at send time)                   |

Application data we control stays in Germany. Third-party services for payments and email may process data in the US. Admin access happens via SSH for operations only; no downloading the database to laptops.

All data subject requests (access, deletion, export) are honored.

## Data Subject Requests

Where user data lives:

| Location               | Data                                                |
| ---------------------- | --------------------------------------------------- |
| SQLite (ours)          | Usage, subscription, notification preferences, auth |
| Lemon Squeezy          | Name, email, payment info                           |
| GoatCounter            | Nothing (anonymous analytics)                       |
| Browser IndexedDB/OPFS | Audio cache, PDFs (user clears locally)             |

Contact: privacy@tells.sh (response within 30 days)
