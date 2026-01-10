<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Simple scrollable text display. -->

<script lang="ts">
  interface Props {
    text: string;
  }

  let { text }: Props = $props();
</script>

<div class="text-viewer">
  <pre>{text}</pre>
</div>

<style>
  .text-viewer {
    max-width: min(90vw, 800px);
    margin: 2rem auto;
    padding: 2rem;
    padding-bottom: 6rem;
    background: #fff;
    border-radius: 4px;
    min-height: calc(100vh - 10rem);
  }

  pre {
    margin: 0;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
