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

Documents and text stay in the browser unless the user chooses a server-side feature. Server TTS receives text, OCR receives page images, and Radio Drama receives extracted text. That data is processed in memory and discarded, not logged or stored. The free tier runs in-browser and does not require an account.

## Data Residency

| Service       | Location | Data                                             |
| ------------- | -------- | ------------------------------------------------ |
| Hetzner       | Germany  | Usage, subscriptions, notification preferences, auth |
| Modal         | US       | Text for TTS and page images for OCR (transient) |
| Lemon Squeezy | US       | Name, email, payment info, billing address       |
| Resend        | US       | Email addresses (at send time)                   |

Application data we control stays in Germany. Third-party services for payments and email may process data in the US. Admin access happens via SSH for operations only; no downloading the database to laptops.

All data subject requests (access, deletion, export) are honored.

## Data Subject Requests

Where user data lives:

| Location               | Data                                                |
| ---------------------- | --------------------------------------------------- |
| SQLite (ours)          | Usage, subscriptions, notification preferences      |
| Better Auth            | Users, passwords, TOTP, passkeys                    |
| Lemon Squeezy          | Name, email, payment info                           |
| Browser IndexedDB/OPFS | Audio cache, PDFs (user clears locally)             |

Contact: privacy@tells.sh. We respond to data subject requests within one month, or explain any GDPR-permitted extension within that month.
