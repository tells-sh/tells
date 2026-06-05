<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Security

> [!IMPORTANT]
> This document is a tentative technical plan for Tells. It is not a
> privacy policy, terms of service, or other binding legal notice.
> Contents may change. Do not treat it as a statement of current product
> behavior or data practices.

All connections use HTTPS/TLS (Caddy handles this automatically). Text sent to the server for TTS is encrypted in transit and processed in memory, never written to disk.

SQL injection is prevented via SQLAlchemy ORM and parameterized queries. User input never gets concatenated into SQL strings.

RCE prevention: no file uploads (PDFs stay in the browser), no user input to subprocess/os.system, no pickle (JSON only), and dependencies stay updated via Dependabot and pip-audit.

Server hardening: runs as non-root, firewall (ufw) allows only ports 80 and 443, Fail2ban blocks brute force attempts, rate limiting on API endpoints.

Frontend: strict Content Security Policy headers, and PDF text renders via textContent rather than innerHTML.
