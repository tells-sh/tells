<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Page navigation controls. Supports buttons, keyboard shortcuts, and direct page input. -->

<script lang="ts">
  interface Props {
    page: number;
    total: number;
    onPageChange: (page: number) => void;
  }

  let { page, total, onPageChange }: Props = $props();
  let inputValue = $state(String(page));

  $effect(() => {
    inputValue = String(page);
  });

  function prev() {
    if (page > 1) onPageChange(page - 1);
  }

  function next() {
    if (page < total) onPageChange(page + 1);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
  }

  function handleBlur() {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value >= 1 && value <= total) {
      onPageChange(value);
    } else {
      inputValue = String(page);
    }
  }

  function handleKeydownInput(e: KeyboardEvent) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Home") onPageChange(1);
    if (e.key === "End") onPageChange(total);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="controls">
  <button onclick={prev} disabled={page <= 1}>Previous</button>
  <span>
    <input
      type="text"
      inputmode="numeric"
      value={inputValue}
      oninput={handleInput}
      onblur={handleBlur}
      onkeydown={handleKeydownInput}
    />
    / {total}
  </span>
  <button onclick={next} disabled={page >= total}>Next</button>
</div>

<style>
  .controls {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #fff;
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
  }

  input {
    width: 3rem;
    text-align: center;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
