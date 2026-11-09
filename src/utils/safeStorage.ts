/**
 * Bulletproof Storage Utility for ZERO POINT FF
 * Guards against SecurityError, QuotaExceededError, Private/Incognito modes,
 * and Mobile In-App WebViews (Facebook, Messenger, Samsung Internet, TikTok, Instagram).
 * Seamlessly falls back to an in-memory store if web storage is disabled or blocked.
 */

const memoryStore = new Map<string, string>();
const sessionMemoryStore = new Map<string, string>();

let localStorageAvailable: boolean | null = null;
let sessionStorageAvailable: boolean | null = null;

function checkStorageAvailability(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const storage = window[type];
    if (!storage) return false;
    const testKey = `__zp_probe_${Math.random()}__`;
    storage.setItem(testKey, '1');
    const read = storage.getItem(testKey);
    storage.removeItem(testKey);
    return read === '1';
  } catch {
    return false;
  }
}

export function isLocalStorageAvailable(): boolean {
  if (localStorageAvailable === null) {
    localStorageAvailable = checkStorageAvailability('localStorage');
  }
  return localStorageAvailable;
}

export function isSessionStorageAvailable(): boolean {
  if (sessionStorageAvailable === null) {
    sessionStorageAvailable = checkStorageAvailability('sessionStorage');
  }
  return sessionStorageAvailable;
}

/**
 * Safely get an item from localStorage with memory fallback
 */
export function safeGetItem(key: string): string | null {
  if (isLocalStorageAvailable()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Storage access blocked during execution
    }
  }
  return memoryStore.get(key) ?? null;
}

/**
 * Safely set an item in localStorage with quota error handling & memory fallback
 */
export function safeSetItem(key: string, value: string): boolean {
  memoryStore.set(key, value);
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (e: any) {
      // QuotaExceededError or permission denied
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        console.warn(`[safeStorage] Quota exceeded for "${key}", using in-memory store.`);
      }
      return false;
    }
  }
  return false;
}

/**
 * Safely remove an item
 */
export function safeRemoveItem(key: string): void {
  memoryStore.delete(key);
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Safely parse JSON from storage with robust validation and fallback
 */
export function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = safeGetItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch (err) {
    console.warn(`[safeStorage] Failed parsing JSON for "${key}", using fallback:`, err);
    return fallback;
  }
}

/**
 * Safely serialize and save JSON
 */
export function safeSetJSON(key: string, value: any): boolean {
  try {
    const serialized = JSON.stringify(value);
    return safeSetItem(key, serialized);
  } catch (err) {
    console.warn(`[safeStorage] Failed stringifying for "${key}":`, err);
    return false;
  }
}

/**
 * Safely get item from sessionStorage with memory fallback
 */
export function safeSessionGet(key: string): string | null {
  if (isSessionStorageAvailable()) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {}
  }
  return sessionMemoryStore.get(key) ?? null;
}

/**
 * Safely set item in sessionStorage
 */
export function safeSessionSet(key: string, value: string): boolean {
  sessionMemoryStore.set(key, value);
  if (isSessionStorageAvailable()) {
    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch {}
  }
  return false;
}

/**
 * Safely clear application caches without deleting critical state
 */
export function safeClearCache(): void {
  memoryStore.clear();
  sessionMemoryStore.clear();
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem('zp_settings');
      window.localStorage.removeItem('zp_accounts');
      window.localStorage.removeItem('zp_reviews');
      window.localStorage.removeItem('zp_orders');
      window.localStorage.removeItem('zp_topup_packages');
    } catch {}
  }
  if (isSessionStorageAvailable()) {
    try {
      window.sessionStorage.clear();
    } catch {}
  }
}
