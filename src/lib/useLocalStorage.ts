"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

/**
 * localStorage-backed state built on useSyncExternalStore so that:
 *  - server render and first client render agree (server snapshot = null → fallback)
 *  - several components share the same key and stay in sync (same tab + other tabs)
 *  - nothing is sent anywhere: data stays in this browser only
 * If storage is blocked (private mode), values fall back to in-memory for the session.
 */

const listeners = new Set<() => void>();
const memory = new Map<string, string>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readRaw(key: string): string | null {
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    /* storage unavailable: fall through to memory */
  }
  return memory.get(key) ?? null;
}

function writeRaw(key: string, value: string | null): void {
  if (value === null) memory.delete(key);
  else memory.set(key, value);
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable or full: memory copy keeps the session working */
  }
  listeners.forEach((listener) => listener());
}

function parse<T>(
  raw: string | null,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  if (raw === null) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
  validate?: (value: unknown) => value is T,
) {
  const [fallback] = useState(initial);
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );
  const value = useMemo(() => parse(raw, fallback, validate), [raw, fallback, validate]);

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const previous = parse(readRaw(key), fallback, validate);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(previous) : next;
      writeRaw(key, JSON.stringify(resolved));
    },
    [key, fallback, validate],
  );

  const reset = useCallback(() => writeRaw(key, null), [key]);

  return [value, setValue, reset] as const;
}

/** Remove every key this app owns (used by "erase all data"). */
export function eraseAllHomePathData(): void {
  const prefix = "homepath.";
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  Array.from(memory.keys())
    .filter((k) => k.startsWith(prefix))
    .forEach((k) => memory.delete(k));
  listeners.forEach((listener) => listener());
}
