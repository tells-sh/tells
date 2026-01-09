// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
});
