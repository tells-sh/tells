<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Pricing

> [!IMPORTANT]
> This document is a tentative technical plan for Tells. It is not a
> privacy policy, terms of service, or other binding legal notice.
> Contents may change. Do not treat it as a statement of current product
> behavior or data practices.

Placeholder pricing math. These numbers are not final. They show the shape of the model, assuming 1 book = 500 pages:

| Plan | Books | GPU cost | LS fees | Infra | Margin | Dev % |
| ---- | ----- | -------- | ------- | ----- | ------ | ----- |
| $5   | 1     | $2.05    | $0.75   | $0.22 | $1.98  | 40%   |
| $9   | 2     | $4.10    | $0.95   | $0.22 | $3.73  | 41%   |
| $15  | 4     | $8.20    | $1.25   | $0.22 | $5.33  | 36%   |
| $25  | 8     | $16.40   | $1.75   | $0.22 | $6.63  | 27%   |

Infrastructure runs about \$11/month fixed (servers, backups), split across users here assuming 50. Fewer users means thinner margins. Modal's \$30/month free credits help early on.

Pricing is static: \$5/\$9/\$15/\$25 per month. No annual discounts. Higher tiers get more quota, no feature gating.
