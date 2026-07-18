// SPDX-FileCopyrightText: 2026 Jason Scheffel <contact@jasonscheffel.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface Doc {
  id: string;
  title: string;
  kind: "text";
  body: string;
  createdAt: number;
  updatedAt: number;
}

const store = $state({
  items: [] as Doc[],
});

export function listDocs(): Doc[] {
  return [...store.items].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getDoc(id: string): Doc | undefined {
  return store.items.find((d) => d.id === id);
}

export function createDoc(input: { title: string; body: string }): Doc {
  const now = Date.now();
  const doc: Doc = {
    id: crypto.randomUUID(),
    title: input.title.trim() || "untitled",
    kind: "text",
    body: input.body,
    createdAt: now,
    updatedAt: now,
  };
  store.items = [...store.items, doc];
  return doc;
}

export function updateDoc(id: string, body: string): Doc | undefined {
  const i = store.items.findIndex((d) => d.id === id);
  if (i === -1) return undefined;
  const next: Doc = { ...store.items[i], body, updatedAt: Date.now() };
  store.items = store.items.map((d, idx) => (idx === i ? next : d));
  return next;
}

export function renameDoc(id: string, title: string): Doc | undefined {
  const i = store.items.findIndex((d) => d.id === id);
  if (i === -1) return undefined;
  const next: Doc = {
    ...store.items[i],
    title: title.trim() || "untitled",
    updatedAt: Date.now(),
  };
  store.items = store.items.map((d, idx) => (idx === i ? next : d));
  return next;
}

export function deleteDoc(id: string): boolean {
  const before = store.items.length;
  store.items = store.items.filter((d) => d.id !== id);
  return store.items.length < before;
}
