<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Contributing

## License

Code is licensed under AGPL-3.0-or-later; documentation and other prose under CC BY-SA 4.0. By contributing, you agree that your contributions will be licensed under the same terms. Use [SPDX](https://spdx.dev/learn/handling-license-info/) license identifiers in source files.

## Commands

Run frontend commands from `frontend/`.

Use `npm run preview` for most local testing right now. It runs `vite build && vite preview`, so it takes longer to start than `npm run dev`, but the app is small and the speed difference once it is running is significant.

- `npm install`: install frontend dependencies
- `npm run dev`: start the Vite dev server
- `npm run build`: build the production frontend
- `npm run preview`: build and serve the production frontend locally
- `npm test`: run frontend tests

## Signing Requirements

All commits must be signed off to indicate you agree to the [Developer Certificate of Origin](https://developercertificate.org/). Use `git commit -s`.

Commits must also be signed with `git commit -S`.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format.

- Use imperative mood ("add feature" not "added feature")
- Subject line max 50 characters, lowercase after type
- Body wrapped at 74 characters
