<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
  import ThemeToggle from "../components/ThemeToggle.svelte";
  import { createDoc, deleteDoc, listDocs, renameDoc, type Doc } from "../lib/docs.svelte";

  let filter = $state("all");
  let query = $state("");
  let adding = $state(false);
  let addMode = $state<"file" | "text">("file");
  let textTitle = $state("");
  let textBody = $state("");
  let dragOver = $state(false);
  let renamingId = $state<string | null>(null);
  let renameValue = $state("");
  let fileInput: HTMLInputElement | undefined = $state();

  const docs = $derived.by(() => {
    let items = listDocs();
    if (filter === "pdf") items = [];
    else if (filter === "text") items = items.filter((d) => d.kind === "text");
    const q = query.trim().toLowerCase();
    if (q) items = items.filter((d) => d.title.toLowerCase().includes(q));
    return items;
  });

  function openAdd() {
    adding = true;
    addMode = "file";
    textTitle = "";
    textBody = "";
    dragOver = false;
  }

  function closeAdd() {
    adding = false;
    dragOver = false;
  }

  function openDoc(doc: Doc) {
    location.hash = `#/reader/${encodeURIComponent(doc.id)}`;
  }

  function finishCreate(doc: Doc) {
    closeAdd();
    openDoc(doc);
  }

  async function ingestFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".txt") && file.type !== "text/plain") return;
    const body = await file.text();
    const title = file.name.replace(/\.txt$/i, "") || "untitled";
    finishCreate(createDoc({ title, body }));
  }

  function onFileChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (file) void ingestFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) void ingestFile(file);
  }

  function saveTextDoc() {
    if (!textBody.trim() && !textTitle.trim()) return;
    finishCreate(createDoc({ title: textTitle, body: textBody }));
  }

  function startRename(doc: Doc, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    renamingId = doc.id;
    renameValue = doc.title;
  }

  function commitRename() {
    if (!renamingId) return;
    renameDoc(renamingId, renameValue);
    renamingId = null;
  }

  function cancelRename() {
    renamingId = null;
  }

  function removeDoc(doc: Doc, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Remove “${doc.title}”?`)) return;
    deleteDoc(doc.id);
  }

  function formatSize(body: string): string {
    const n = new Blob([body]).size;
    if (n < 1024) return `${n} B`;
    return `${(n / 1024).toFixed(1)} KB`;
  }
</script>

<svelte:head>
  <title>tells - library</title>
</svelte:head>

<div class="page">
  <nav class="mono">
    <div class="nav-left">
      <a class="logo" href="#/">tells</a>
      <span class="crumb">library</span>
    </div>
    <div class="nav-right">
      <ThemeToggle />
      <button class="add" type="button" onclick={openAdd}>+ add document</button>
    </div>
  </nav>

  <main>
    <div class="toolbar">
      <div class="filters mono">
        {#each ["all", "pdf", "text"] as label}
          <button type="button" class:active={filter === label} onclick={() => (filter = label)}>{label}</button>
        {/each}
      </div>
      <input class="mono search" placeholder="search..." bind:value={query} />
    </div>

    {#if docs.length === 0}
      <div class="empty mono">
        {#if query.trim()}
          <span>no documents match “{query.trim()}”</span>
        {:else if filter === "pdf"}
          <span>no pdf documents yet</span>
        {:else}
          <span>no documents yet</span>
          <button type="button" class="empty-add" onclick={openAdd}>add a text document</button>
        {/if}
      </div>
    {:else}
      <div class="grid">
        {#each docs as doc (doc.id)}
          <div class="doc">
            {#if renamingId !== doc.id}
              <a
                class="doc-hit"
                href="#/reader/{encodeURIComponent(doc.id)}"
                aria-label={doc.title}
              ></a>
            {/if}
            <div class="doc-body">
              <div class="doc-head mono">
                <span class="kind">{doc.kind}</span>
                <span>{formatSize(doc.body)}</span>
              </div>
              {#if renamingId === doc.id}
                <input
                  class="rename-input mono"
                  bind:value={renameValue}
                  onkeydown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") cancelRename();
                  }}
                  onblur={commitRename}
                />
              {:else}
                <span class="title">{doc.title}</span>
              {/if}
              <div class="meta mono">
                <span>{doc.body.trim() ? `${doc.body.trim().split(/\s+/).length} words` : "empty"}</span>
              </div>
            </div>
            <div class="doc-actions mono">
              <button type="button" onclick={(e) => startRename(doc, e)}>rename</button>
              <button type="button" onclick={(e) => removeDoc(doc, e)}>remove</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="drop-hint mono">
      <span>add a .txt file or paste text with</span>
      <button type="button" class="underlined" onclick={openAdd}>+ add document</button>
    </div>
  </main>

  <footer class="mono">
    <span></span>
    <button class="export" type="button">export backup (.zip)</button>
  </footer>
</div>

{#if adding}
  <div
    class="overlay"
    role="presentation"
    onclick={(e) => {
      if (e.target === e.currentTarget) closeAdd();
    }}
  >
    <div class="modal" role="dialog" aria-modal="true" aria-label="add document" tabindex="-1">
      <div class="modal-head mono">
        <span>add document</span>
        <button type="button" class="close" onclick={closeAdd}>close</button>
      </div>
      <div class="mode-toggle mono">
        <button type="button" class:active={addMode === "file"} onclick={() => (addMode = "file")}>file</button>
        <button type="button" class:active={addMode === "text"} onclick={() => (addMode = "text")}>text</button>
      </div>

      {#if addMode === "file"}
        <button
          type="button"
          class="dropzone mono"
          class:over={dragOver}
          onclick={() => fileInput?.click()}
          ondragenter={(e) => {
            e.preventDefault();
            dragOver = true;
          }}
          ondragover={(e) => {
            e.preventDefault();
            dragOver = true;
          }}
          ondragleave={() => (dragOver = false)}
          ondrop={onDrop}
        >
          <span>drop a .txt file here</span>
          <span class="drop-sub">or click to browse</span>
        </button>
        <input
          bind:this={fileInput}
          type="file"
          accept=".txt,text/plain"
          hidden
          onchange={onFileChange}
        />
      {:else}
        <div class="text-form">
          <input class="mono" placeholder="title" bind:value={textTitle} />
          <textarea class="mono" placeholder="paste or type text…" bind:value={textBody} rows="12"></textarea>
          <button type="button" class="save" onclick={saveTextDoc} disabled={!textBody.trim() && !textTitle.trim()}>
            add document
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .page {
    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
    display: flex;
    flex-direction: column;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 28px;
    border-bottom: 1px solid var(--line);
    font-size: 13px;
  }

  .nav-left {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .logo {
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .crumb {
    color: var(--muted);
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 20px;
    white-space: nowrap;
  }

  .add {
    font: inherit;
    background: var(--ink);
    color: var(--bg);
    border: none;
    padding: 9px 16px;
    border-radius: 2px;
    cursor: pointer;
  }

  .add:hover {
    background: var(--hl);
    color: var(--hl-ink);
  }

  main {
    flex: 1;
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 28px;
    box-sizing: border-box;
  }

  .toolbar {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .filters {
    display: flex;
    gap: 8px;
    font-size: 13px;
  }

  .filters button {
    font: inherit;
    background: var(--card);
    color: var(--muted);
    border: 0;
    box-shadow: 0 0 0 1px var(--line);
    padding: 7px 14px;
    border-radius: 99px;
    cursor: pointer;
    transform: translateZ(0);
  }

  .filters button.active {
    background: var(--ink);
    color: var(--bg);
    box-shadow: 0 0 0 1px var(--ink);
  }

  .search {
    font-size: 13px;
    background: var(--card);
    color: var(--ink);
    border: 1px solid var(--line);
    border-radius: 2px;
    padding: 9px 14px;
    width: 220px;
    outline: none;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 40px 0;
    color: var(--muted);
    font-size: 14px;
  }

  .empty-add {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 16px;
  }

  .doc {
    position: relative;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--card);
    display: flex;
    flex-direction: column;
    min-height: 150px;
    padding: 20px 20px 14px;
    gap: 12px;
  }

  .doc:hover {
    border-color: var(--ink);
  }

  .doc-hit {
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    text-decoration: none;
    background: transparent;
    color: transparent;
  }

  .doc-hit:hover {
    background: transparent;
    color: transparent;
  }

  .doc-body {
    position: relative;
    z-index: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  }

  .doc-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    font-size: 11px;
    color: var(--muted);
  }

  .doc-head .kind {
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .doc .title {
    font-size: 19px;
    line-height: 1.3;
    flex: 1;
    text-wrap: pretty;
  }

  .rename-input {
    position: relative;
    z-index: 2;
    pointer-events: auto;
    font: inherit;
    font-size: 17px;
    width: 100%;
    box-sizing: border-box;
    background: var(--bg);
    color: var(--ink);
    border: 1px solid var(--ink);
    border-radius: 2px;
    padding: 4px 8px;
    outline: none;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 11.5px;
    color: var(--muted);
    margin-top: auto;
  }

  .doc-actions {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 12px;
    font-size: 12px;
    pointer-events: none;
  }

  .doc-actions button {
    pointer-events: auto;
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--muted);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .doc-actions button:hover {
    background: var(--hl);
    color: var(--hl-ink);
  }

  .drop-hint {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 40px;
    padding: 18px 22px;
    border: 1px dashed var(--line);
    border-radius: 6px;
    font-size: 13px;
    color: var(--muted);
  }

  .underlined {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--muted);
    border-bottom: 1px solid var(--muted);
    cursor: pointer;
  }

  .underlined:hover {
    background: var(--hl);
    color: var(--hl-ink);
    border-bottom-color: var(--hl);
  }

  footer {
    border-top: 1px solid var(--line);
    padding: 14px 28px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--muted);
  }

  .export {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--muted);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .export:hover {
    background: var(--hl);
    color: var(--hl-ink);
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: color-mix(in srgb, var(--ink) 28%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 40;
  }

  .modal {
    width: min(520px, 100%);
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
  }

  .close {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--muted);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .mode-toggle {
    display: flex;
    gap: 8px;
    font-size: 13px;
  }

  .mode-toggle button {
    font: inherit;
    background: var(--card);
    color: var(--muted);
    border: 0;
    box-shadow: 0 0 0 1px var(--line);
    padding: 7px 14px;
    border-radius: 99px;
    cursor: pointer;
  }

  .mode-toggle button.active {
    background: var(--ink);
    color: var(--bg);
    box-shadow: 0 0 0 1px var(--ink);
  }

  .dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 220px;
    padding: 32px;
    border: 1px dashed var(--line);
    border-radius: 6px;
    color: var(--muted);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    background: var(--card);
    width: 100%;
    box-sizing: border-box;
  }

  .dropzone.over {
    border-color: var(--ink);
    color: var(--ink);
  }

  .drop-sub {
    font-size: 12px;
  }

  .text-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .text-form input,
  .text-form textarea {
    font: inherit;
    font-size: 13px;
    background: var(--card);
    color: var(--ink);
    border: 1px solid var(--line);
    border-radius: 2px;
    padding: 10px 12px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
  }

  .text-form textarea {
    line-height: 1.5;
    min-height: 200px;
  }

  .save {
    font: inherit;
    font-size: 13px;
    align-self: flex-end;
    background: var(--ink);
    color: var(--bg);
    border: none;
    padding: 9px 16px;
    border-radius: 2px;
    cursor: pointer;
  }

  .save:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .save:not(:disabled):hover {
    background: var(--hl);
    color: var(--hl-ink);
  }
</style>
