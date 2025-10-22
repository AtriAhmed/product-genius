import { useCallback, useEffect, useState } from "react";

type Initializer<T> = T | (() => T);

/**
 * Minimal useLocalStorage hook (prefix hardcoded inside the hook)
 * - API matches useState: const [value, setValue] = useLocalStorage(key, initial)
 * - `initial` can be a value or a lazy initializer function
 * - prefix is hardcoded by editing the PREFIX constant below
 * - SSR-safe (won't access localStorage on server)
 */
export default function useLocalStorage<T = unknown>(
  key: string,
  initial: Initializer<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  // <- Edit this constant to change the prefix globally for this hook
  const PREFIX = "product-genius:";

  const storageKey = `${PREFIX}${key}`;

  const readInitial = (): T => {
    // If SSR, just return initial (don't access window/localStorage)
    if (typeof window === "undefined") {
      return typeof initial === "function" ? (initial as () => T)() : initial;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      // ignore JSON parse / access errors
    }

    return typeof initial === "function" ? (initial as () => T)() : initial;
  };

  const [state, setState] = useState<T>(readInitial);

  // Persist on state changes (writes to prefixed key)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore quota/permission errors
    }
  }, [storageKey, state]);

  // Setter that mirrors useState (supports functional updater)
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) =>
      typeof value === "function" ? (value as (p: T) => T)(prev) : value
    );
  }, []);

  return [state, setValue];
}
