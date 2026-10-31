import "@testing-library/jest-dom";
import { beforeEach } from 'vitest';

// Test storage must not depend on Node's optional --localstorage-file API.
beforeEach(() => {
  for (const name of ['localStorage', 'sessionStorage']) {
    const values = new Map<string, string>();
    const storage: Storage = {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, String(value)); },
      removeItem: key => { values.delete(key); }, clear: () => values.clear(),
      key: index => [...values.keys()][index] ?? null,
      get length() { return values.size; },
    };
    Object.defineProperty(window, name, { configurable: true, value: storage });
    Object.defineProperty(globalThis, name, { configurable: true, value: storage });
  }
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
