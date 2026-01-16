<!--
SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- Editable text area with sentence highlighting and TTS. -->

<script lang="ts" module>
  import type { KokoroState, KokoroDtype, KokoroDevice, KokoroProgress } from "../lib/kokoro";

  let voices = $state<SpeechSynthesisVoice[]>([]);
  let selectedVoice = $state<SpeechSynthesisVoice | null>(null);
  let rate = $state(1);
  let ttsEngine = $state<"web" | "kokoro">("web");

  // Kokoro state
  let kokoroDtype = $state<KokoroDtype>("q8");
  let kokoroDevice = $state<KokoroDevice>("wasm");
  let kokoroVoice = $state("af_heart");
  let kokoroState = $state<KokoroState>("idle");
  let kokoroProgress = $state<KokoroProgress | null>(null);
  let kokoroError = $state<string | null>(null);

  // Audio cache: Map from "${voice}:${sentence}" to audio Blob
  const audioCache = new Map<string, Blob>();

  // Pre-generation state
  let isPreGenerating = $state(false);
  let preGenProgress = $state({ current: 0, total: 0 });

  // Worker pool config
  const cpuCores = navigator.hardwareConcurrency || 4;
  const deviceMemoryGB = (navigator as any).deviceMemory || 4;
  const maxWorkers = cpuCores;

  // Model sizes in MB per dtype (from https://huggingface.co/onnx-community/Kokoro-82M-ONNX/tree/main/onnx)
  const MODEL_SIZE_MB: Record<KokoroDtype, number> = {
    fp32: 326,
    fp16: 163,
    q8: 86,
    q4: 305,
    q4f16: 154,
  };

  let modelSizeMB = $derived(MODEL_SIZE_MB[kokoroDtype]);
  const recommendedWorkers = Math.max(1, Math.floor(cpuCores / 2));
  let preGenWorkerCount = $state(recommendedWorkers);
  let memoryWarning = $derived(preGenWorkerCount * modelSizeMB > deviceMemoryGB * 1024 * 0.5);

  const KOKORO_VOICES = [
    { id: "af_heart", name: "Heart" },
    { id: "af_alloy", name: "Alloy" },
    { id: "af_aoede", name: "Aoede" },
    { id: "af_bella", name: "Bella" },
    { id: "af_jessica", name: "Jessica" },
    { id: "af_kore", name: "Kore" },
    { id: "af_nicole", name: "Nicole" },
    { id: "af_nova", name: "Nova" },
    { id: "af_river", name: "River" },
    { id: "af_sarah", name: "Sarah" },
    { id: "af_sky", name: "Sky" },
    { id: "am_adam", name: "Adam" },
    { id: "am_echo", name: "Echo" },
    { id: "am_eric", name: "Eric" },
    { id: "am_fenrir", name: "Fenrir" },
    { id: "am_liam", name: "Liam" },
    { id: "am_michael", name: "Michael" },
    { id: "am_onyx", name: "Onyx" },
    { id: "am_puck", name: "Puck" },
    { id: "am_santa", name: "Santa" },
    { id: "bf_alice", name: "Alice" },
    { id: "bf_emma", name: "Emma" },
    { id: "bf_isabella", name: "Isabella" },
    { id: "bf_lily", name: "Lily" },
    { id: "bm_daniel", name: "Daniel" },
    { id: "bm_fable", name: "Fable" },
    { id: "bm_george", name: "George" },
    { id: "bm_lewis", name: "Lewis" },
  ] as const;

  function loadVoices() {
    voices = speechSynthesis.getVoices();
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }
  }
  requestIdleCallback(loadVoices);
</script>

<script lang="ts">
  import { parseText, type Paragraph } from "../lib/text";

  $effect(() => {
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      speechSynthesis.cancel();
    };
  });

  interface Position {
    para: number;
    sent: number;
  }

  let text = $state("");
  let paragraphs = $state<Paragraph[]>([]);
  let allPositions = $derived.by(() => {
    const positions: Position[] = [];
    paragraphs.forEach((p, pi) => {
      p.sentences.forEach((_, si) => {
        positions.push({ para: pi, sent: si });
      });
    });
    return positions;
  });
  let hoveredBatch = $state<Position[]>([]);
  let activeBatch = $state<Position[]>([]);
  let isPaused = $state(false);
  let isEditing = $state(false);
  let editorEl: HTMLDivElement;

  let batchSize = $state(1);
  let forwardOnly = $state(true);
  let continuousMode = $state(false);

  let voiceSearch = $state("");
  let localeOnly = $state(true);
  let voiceDropdownOpen = $state(false);
  let voiceDropdownMounted = $state(false);

  let audioElement: HTMLAudioElement | null = null;
  let isGenerating = $state(false);

  const userLang = navigator.language.slice(0, 2);

  async function loadKokoroModel() {
    kokoroState = "loading-package";
    kokoroError = null;
    kokoroProgress = null;

    try {
      const kokoro = await import("../lib/kokoro");
      kokoroState = "loading-model";

      await kokoro.initialize(kokoroDtype, kokoroDevice, (progress) => {
        kokoroProgress = { ...progress };
      });

      kokoroState = "ready";
      kokoroProgress = null;
    } catch (err) {
      kokoroState = "error";
      kokoroError = err instanceof Error ? err.message : "Failed to load Kokoro";
    }
  }

  async function preGenerateAll() {
    if (kokoroState !== "ready" || isPreGenerating) return;

    const sentences: string[] = [];
    for (const para of paragraphs) {
      for (const sent of para.sentences) {
        const key = `${kokoroVoice}:${sent}`;
        if (!audioCache.has(key)) sentences.push(sent);
      }
    }
    if (sentences.length === 0) return;

    isPreGenerating = true;
    preGenProgress = { current: 0, total: sentences.length };

    try {
      const kokoro = await import("../lib/kokoro");

      await kokoro.initializePool(preGenWorkerCount, kokoroDtype, kokoroDevice, () => {});

      const results = await kokoro.generateWithPool(sentences, kokoroVoice, (completed) => {
        preGenProgress = { current: completed, total: sentences.length };
      });

      for (const [sent, blob] of results) {
        audioCache.set(`${kokoroVoice}:${sent}`, blob);
      }

      kokoro.terminatePool();
    } catch (err) {
      console.error("Pre-generation error:", err);
    } finally {
      isPreGenerating = false;
    }
  }

  async function speakWithKokoro(text: string) {
    if (kokoroState !== "ready") return;

    const cacheKey = `${kokoroVoice}:${text}`;
    let audioBlob = audioCache.get(cacheKey);

    if (!audioBlob) {
      isGenerating = true;
      try {
        const kokoro = await import("../lib/kokoro");
        audioBlob = await kokoro.generate(text, kokoroVoice);
        audioCache.set(cacheKey, audioBlob);
      } catch (err) {
        console.error("Kokoro generation error:", err);
        isGenerating = false;
        return;
      }
      isGenerating = false;
    }

    if (audioElement) {
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
      audioElement = null;
    }

    const url = URL.createObjectURL(audioBlob);
    audioElement = new Audio(url);
    audioElement.playbackRate = rate;

    audioElement.onended = () => {
      URL.revokeObjectURL(url);
      if (continuousMode) {
        const nextPos = getNextBatchStart();
        if (nextPos) {
          activeBatch = getBatch(nextPos, true);
          speakBatch();
          return;
        }
      }
      activeBatch = [];
      renderContent();
    };

    audioElement.onerror = () => {
      console.error("Audio playback error");
      URL.revokeObjectURL(url);
      activeBatch = [];
      renderContent();
    };

    await audioElement.play();
  }

  function getFilteredVoices(): SpeechSynthesisVoice[] {
    let filtered = voices;
    if (localeOnly) {
      filtered = filtered.filter((v) => v.lang.startsWith(userLang));
    }
    if (voiceSearch) {
      const q = voiceSearch.toLowerCase();
      filtered = filtered.filter((v) => v.name.toLowerCase().includes(q));
    }
    return filtered;
  }

  let utteranceId = 0;

  function posInBatch(pos: Position, batch: Position[]): boolean {
    return batch.some((p) => p.para === pos.para && p.sent === pos.sent);
  }

  function getBatch(pos: Position, forceForward = false): Position[] {
    const clickedIdx = allPositions.findIndex(
      (p) => p.para === pos.para && p.sent === pos.sent
    );
    if (clickedIdx === -1) return [pos];

    const batch: Position[] = [];

    if (forwardOnly || forceForward) {
      for (let i = 0; i < batchSize && clickedIdx + i < allPositions.length; i++) {
        batch.push(allPositions[clickedIdx + i]);
      }
    } else {
      const before = Math.floor((batchSize - 1) / 2);
      const after = batchSize - 1 - before;
      const startIdx = Math.max(0, clickedIdx - before);
      const endIdx = Math.min(allPositions.length - 1, clickedIdx + after);

      for (let i = startIdx; i <= endIdx; i++) {
        batch.push(allPositions[i]);
      }
    }

    return batch;
  }

  function getBatchText(batch: Position[]): string {
    return batch
      .map((pos) => paragraphs[pos.para]?.sentences[pos.sent] ?? "")
      .join(" ");
  }

  function getNextBatchStart(): Position | null {
    if (activeBatch.length === 0) return null;

    const lastPos = activeBatch[activeBatch.length - 1];
    const lastIdx = allPositions.findIndex(
      (p) => p.para === lastPos.para && p.sent === lastPos.sent
    );

    const nextIdx = lastIdx + 1;
    if (nextIdx >= allPositions.length) return null;

    return allPositions[nextIdx];
  }

  function updateParagraphs() {
    paragraphs = parseText(text);
  }

  function syncText() {
    text = editorEl.innerText;
    updateParagraphs();
  }

  function posEq(a: Position | null, b: Position | null): boolean {
    if (!a || !b) return false;
    return a.para === b.para && a.sent === b.sent;
  }

  function renderContent() {
    if (!editorEl) return;

    if (paragraphs.length === 0) {
      editorEl.innerHTML = "";
      return;
    }

    editorEl.innerHTML = paragraphs
      .map(
        (p, pi) =>
          `<p>${p.sentences
            .map((s, si) => {
              const pos = { para: pi, sent: si };
              const isActive = posInBatch(pos, activeBatch);
              const isHovered = posInBatch(pos, hoveredBatch) && !isActive;
              return `<span class="sentence${isActive ? " active" : ""}${isHovered ? " hovered" : ""}" data-para="${pi}" data-sent="${si}">${escapeHtml(s)}</span>`;
            })
            .join(" ")}</p>`
      )
      .join("");
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function handleFocus() {
    isEditing = true;
    stop();
  }

  function exitEditMode() {
    isEditing = false;
    syncText();
    renderContent();
  }

  function getPositionFromElement(el: HTMLElement): Position | null {
    if (!el.classList.contains("sentence")) return null;
    const para = parseInt(el.dataset.para!, 10);
    const sent = parseInt(el.dataset.sent!, 10);
    return { para, sent };
  }

  function handleMouseDown(e: MouseEvent) {
    if (isEditing) return;

    const pos = getPositionFromElement(e.target as HTMLElement);
    if (pos) {
      e.preventDefault();
      startFrom(pos);
    }
  }

  function enterEditMode() {
    editorEl.focus();
  }

  function handleMouseOver(e: MouseEvent) {
    if (isEditing) return;

    const pos = getPositionFromElement(e.target as HTMLElement);
    if (pos) {
      const newBatch = getBatch(pos);
      if (newBatch.length !== hoveredBatch.length || !newBatch.every((p, i) => posEq(p, hoveredBatch[i]))) {
        hoveredBatch = newBatch;
        renderContent();
      }
    }
  }

  function handleMouseOut(e: MouseEvent) {
    if (isEditing) return;

    const target = e.target as HTMLElement;
    if (target.classList.contains("sentence")) {
      hoveredBatch = [];
      renderContent();
    }
  }

  function speakBatch() {
    if (activeBatch.length === 0) {
      isPaused = false;
      renderContent();
      return;
    }

    const batchText = getBatchText(activeBatch);
    isPaused = false;
    renderContent();

    if (ttsEngine === "kokoro") {
      speakWithKokoro(batchText);
    } else {
      const thisUtteranceId = ++utteranceId;

      const utterance = new SpeechSynthesisUtterance(batchText);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = rate;

      utterance.onend = () => {
        if (thisUtteranceId === utteranceId) {
          if (continuousMode) {
            const nextPos = getNextBatchStart();
            if (nextPos) {
              activeBatch = getBatch(nextPos, true);
              speakBatch();
              return;
            }
          }
          activeBatch = [];
          renderContent();
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled") {
          console.error("TTS error:", e.error);
        }
      };

      speechSynthesis.speak(utterance);
    }
  }

  function startFrom(pos: Position) {
    if (audioElement) {
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
      audioElement = null;
    }
    speechSynthesis.cancel();
    activeBatch = getBatch(pos);
    speakBatch();
  }

  function pause() {
    utteranceId++;
    if (ttsEngine === "kokoro" && audioElement) {
      audioElement.pause();
    } else {
      speechSynthesis.cancel();
    }
    isPaused = true;
  }

  function resume() {
    isPaused = false;
    if (ttsEngine === "kokoro" && audioElement) {
      audioElement.play();
    } else if (activeBatch.length > 0) {
      speakBatch();
    }
  }

  function stop() {
    utteranceId++;
    if (ttsEngine === "kokoro" && audioElement) {
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
      audioElement = null;
    } else {
      speechSynthesis.cancel();
    }
    activeBatch = [];
    isPaused = false;
    renderContent();
  }
</script>

<div class="container">
  <div
    bind:this={editorEl}
    class="editor"
    class:editing={isEditing}
    contenteditable="true"
    role="textbox"
    tabindex="0"
    aria-multiline="true"
    onfocus={handleFocus}
    onblur={exitEditMode}
    onmousedown={handleMouseDown}
    onmouseover={handleMouseOver}
    onmouseout={handleMouseOut}
  ></div>

  {#if paragraphs.length === 0 && !isEditing}
    <div class="placeholder">Click to type or paste text...</div>
  {/if}

  <div class="controls" class:hidden={isEditing}>
    {#if activeBatch.length > 0}
        {#if isPaused}
          <button class="control-btn" onclick={resume}>Resume</button>
        {:else}
          <button class="control-btn" onclick={pause}>Pause</button>
        {/if}
        <button class="control-btn" onclick={stop}>Stop</button>
      {:else}
        <button class="control-btn" onclick={enterEditMode}>Edit</button>
      {/if}

      <div class="batch-controls">
        <label class="batch-label">
          Batch
          <input
            type="number"
            class="batch-input"
            min="1"
            max="20"
            bind:value={batchSize}
          />
        </label>
        <label class="batch-label">
          <input type="checkbox" bind:checked={forwardOnly} />
          Forward
        </label>
        <label class="batch-label">
          <input type="checkbox" bind:checked={continuousMode} />
          Continuous
        </label>
      </div>

      <div class="tts-controls">
        <label class="control-label">
          Engine
          <select class="control-select" bind:value={ttsEngine}>
            <option value="web">Web</option>
            <option value="kokoro">Kokoro</option>
          </select>
        </label>

        {#if ttsEngine === "kokoro"}
          <label class="control-label">
            Dtype
            <select class="control-select" bind:value={kokoroDtype} disabled={kokoroState !== "idle"}>
              <option value="fp32">FP32</option>
              <option value="fp16">FP16</option>
              <option value="q8">Q8</option>
              <option value="q4">Q4</option>
              <option value="q4f16">Q4F16</option>
            </select>
          </label>

          <label class="control-label">
            Device
            <select class="control-select" bind:value={kokoroDevice} disabled={kokoroState !== "idle"}>
              <option value="wasm">WASM</option>
              <option value="webgpu">WebGPU</option>
            </select>
          </label>

          {#if kokoroState === "idle"}
            <button class="control-btn" onclick={loadKokoroModel}>Load Model</button>
          {:else if kokoroState === "loading-package"}
            <div class="loading-status">Loading package...</div>
          {:else if kokoroState === "loading-model"}
            <div class="loading-status">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {kokoroProgress && kokoroProgress.total > 0 ? (kokoroProgress.loaded / kokoroProgress.total * 100) : 0}%"
                ></div>
              </div>
              {#if kokoroProgress}
                <span class="progress-text">
                  {Math.round(kokoroProgress.loaded / 1024 / 1024)}MB / {Math.round(kokoroProgress.total / 1024 / 1024)}MB
                </span>
              {/if}
            </div>
          {:else if kokoroState === "error"}
            <div class="error-status">{kokoroError}</div>
            <button class="control-btn" onclick={() => kokoroState = "idle"}>Retry</button>
          {:else if kokoroState === "ready"}
            <label class="control-label">
              Voice
              <select class="control-select" bind:value={kokoroVoice}>
                {#each KOKORO_VOICES as voice}
                  <option value={voice.id}>{voice.name}</option>
                {/each}
              </select>
            </label>
            {#if paragraphs.length > 0}
              <div class="device-info">Detected: {cpuCores} threads, ~{deviceMemoryGB}GB+ RAM</div>
              <label class="control-label">
                Workers
                <select class="control-select" bind:value={preGenWorkerCount} disabled={isPreGenerating}>
                  {#each Array.from({length: maxWorkers}, (_, i) => i + 1) as n}
                    <option value={n}>{n}{n === recommendedWorkers ? " (rec)" : ""} (~{n * modelSizeMB}MB)</option>
                  {/each}
                </select>
              </label>
              {#if memoryWarning}
                <div class="memory-warning">May exceed available memory</div>
              {/if}
              {#if isPreGenerating}
                <div class="loading-status">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      style="width: {preGenProgress.total > 0 ? (preGenProgress.current / preGenProgress.total * 100) : 0}%"
                    ></div>
                  </div>
                  <span class="progress-text">
                    {preGenProgress.current} / {preGenProgress.total} sentences
                  </span>
                </div>
              {:else}
                <button class="control-btn" onclick={preGenerateAll}>Pre-generate</button>
              {/if}
            {/if}
          {/if}

          {#if isGenerating}
            <div class="generating-status">Generating...</div>
          {/if}
        {:else}
          <div class="control-label">
            Voice
            <div class="voice-dropdown">
              <button
                class="voice-dropdown-btn"
                onclick={() => { voiceDropdownOpen = !voiceDropdownOpen; voiceDropdownMounted = true; }}
              >
                {selectedVoice?.name ?? "Select voice"}
              </button>
              {#if voiceDropdownMounted}
              <div class="voice-dropdown-menu" class:hidden={!voiceDropdownOpen}>
                <input
                  type="text"
                  class="voice-search"
                  placeholder="Search..."
                  bind:value={voiceSearch}
                />
                <label class="locale-filter">
                  <input type="checkbox" bind:checked={localeOnly} />
                  {userLang.toUpperCase()} only
                </label>
                <div class="voice-list">
                  {#each getFilteredVoices() as voice}
                    <button
                      class="voice-option"
                      class:selected={selectedVoice === voice}
                      onclick={() => { selectedVoice = voice; voiceDropdownOpen = false; }}
                    >
                      {voice.name}
                    </button>
                  {/each}
                </div>
              </div>
              {/if}
            </div>
          </div>
        {/if}

        <label class="control-label">
          Rate
          <input type="range" class="rate-slider" min="0.5" max="2" step="0.1" bind:value={rate} />
          <span class="rate-value">{rate}x</span>
        </label>
      </div>
  </div>
</div>


<style>
  .container {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .controls {
    position: fixed;
    top: 50%;
    left: calc(50% + 320px);
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 10;
  }

  .control-btn {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    background: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
    white-space: nowrap;
  }

  .control-btn:hover {
    background: #e8e8e8;
  }

  .editor {
    flex: 1;
    min-height: 300px;
    padding: 1rem;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.6;
    background: #fff;
    border: none;
    outline: none;
    overflow-y: auto;
    cursor: text;
  }

  .editor :global(p) {
    margin: 0 0 1em 0;
  }

  .editor :global(p:last-child) {
    margin-bottom: 0;
  }

  .placeholder {
    position: absolute;
    top: 1rem;
    left: 1rem;
    color: #999;
    pointer-events: none;
  }

  .editor :global(.sentence) {
    border-radius: 2px;
    transition: background-color 0.1s;
  }

  .editor:not(.editing) :global(.sentence) {
    cursor: pointer;
  }

  .editor:not(.editing) :global(.sentence.hovered) {
    background-color: #e0e0e0;
  }

  .editor :global(.sentence.active) {
    background-color: #ffd54f;
  }

  .batch-controls {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .batch-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    color: #555;
  }

  .batch-input {
    width: 3rem;
    padding: 0.25rem;
    font-size: 0.8125rem;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  .tts-controls {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8125rem;
    color: #555;
  }

  .control-select {
    padding: 0.25rem;
    font-size: 0.8125rem;
    border: 1px solid #ccc;
    border-radius: 3px;
    max-width: 120px;
  }

  .rate-slider {
    width: 80px;
  }

  .rate-value {
    font-size: 0.75rem;
    color: #777;
  }

  .voice-dropdown {
    position: relative;
  }

  .voice-dropdown-btn {
    width: 100%;
    padding: 0.25rem;
    font-size: 0.8125rem;
    text-align: left;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .voice-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 200px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 100;
  }

  .voice-search {
    width: 100%;
    padding: 0.375rem;
    font-size: 0.8125rem;
    border: none;
    border-bottom: 1px solid #eee;
    outline: none;
    box-sizing: border-box;
  }

  .locale-filter {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem;
    font-size: 0.75rem;
    color: #555;
    border-bottom: 1px solid #eee;
  }

  .voice-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .voice-option {
    display: block;
    width: 100%;
    padding: 0.375rem;
    font-size: 0.8125rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
  }

  .hidden {
    display: none;
  }

  .voice-option:hover {
    background: #f0f0f0;
  }

  .voice-option.selected {
    background: #e3f2fd;
  }

  .loading-status {
    font-size: 0.8125rem;
    color: #555;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: #ddd;
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #4a90d9;
    transition: width 0.2s;
  }

  .progress-text {
    font-size: 0.75rem;
    color: #777;
  }

  .error-status {
    font-size: 0.8125rem;
    color: #c00;
  }

  .generating-status {
    font-size: 0.8125rem;
    color: #555;
    font-style: italic;
  }

  .memory-warning {
    font-size: 0.75rem;
    color: #c00;
  }

  .device-info {
    font-size: 0.75rem;
    color: #777;
  }
</style>
