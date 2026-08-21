/**
 * SmartSchool RDC - Safe Storage & Security Shield Utility
 * Prevents "The operation is insecure" DOMExceptions and SecurityErrors
 * when running inside restricted iframes, private windows, or sandboxed environments.
 */

class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

// In-memory fallback singletons
const memoryLocalStorage = new MemoryStorage();
const memorySessionStorage = new MemoryStorage();

// Test whether native localStorage is accessible without throwing
function isStorageAvailable(type: "localStorage" | "sessionStorage"): boolean {
  try {
    if (typeof window === "undefined") return false;
    const storage = window[type];
    if (!storage) return false;
    const testKey = `__ss_security_shield_${Date.now()}_${Math.random()}`;
    storage.setItem(testKey, "test");
    const val = storage.getItem(testKey);
    storage.removeItem(testKey);
    return val === "test";
  } catch (_err) {
    return false;
  }
}

let nativeLocalStorageWorking = false;
let nativeSessionStorageWorking = false;

try {
  nativeLocalStorageWorking = isStorageAvailable("localStorage");
} catch {
  nativeLocalStorageWorking = false;
}

try {
  nativeSessionStorageWorking = isStorageAvailable("sessionStorage");
} catch {
  nativeSessionStorageWorking = false;
}

// Global Safe Polyfill to patch window.localStorage & window.sessionStorage if insecure
export function installSafeStoragePolyfill(): void {
  if (typeof window === "undefined") return;

  // Safe patch for localStorage
  if (!nativeLocalStorageWorking) {
    try {
      Object.defineProperty(window, "localStorage", {
        get: () => memoryLocalStorage,
        set: () => {},
        configurable: true,
        enumerable: true
      });
    } catch (_e) {
      try {
        Object.defineProperty(Window.prototype, "localStorage", {
          get: () => memoryLocalStorage,
          set: () => {},
          configurable: true,
          enumerable: true
        });
      } catch (_err2) {
        try {
          (window as any).localStorage = memoryLocalStorage;
        } catch (_err3) {}
      }
    }
  }

  // Safe patch for sessionStorage
  if (!nativeSessionStorageWorking) {
    try {
      Object.defineProperty(window, "sessionStorage", {
        get: () => memorySessionStorage,
        set: () => {},
        configurable: true,
        enumerable: true
      });
    } catch (_e) {
      try {
        Object.defineProperty(Window.prototype, "sessionStorage", {
          get: () => memorySessionStorage,
          set: () => {},
          configurable: true,
          enumerable: true
        });
      } catch (_err2) {
        try {
          (window as any).sessionStorage = memorySessionStorage;
        } catch (_err3) {}
      }
    }
  }
}

// Run polyfill immediately on module load
try {
  installSafeStoragePolyfill();
} catch (_e) {
  // Silent fail
}

/**
 * Returns a safe origin URL for links, QR codes and invitations even in sandboxed iframes.
 */
export function getSafeOrigin(): string {
  try {
    if (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin !== "null") {
      return window.location.origin;
    }
  } catch (_e) {}
  return "https://smartschool.cd";
}

/**
 * Safe local storage getter/setter with automatic in-memory fallback
 */
export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (nativeLocalStorageWorking && typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (_err) {
      nativeLocalStorageWorking = false;
    }
    return memoryLocalStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    try {
      if (nativeLocalStorageWorking && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (_err) {
      nativeLocalStorageWorking = false;
    }
    memoryLocalStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    try {
      if (nativeLocalStorageWorking && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (_err) {
      nativeLocalStorageWorking = false;
    }
    memoryLocalStorage.removeItem(key);
  },

  clear(): void {
    try {
      if (nativeLocalStorageWorking && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (_err) {
      nativeLocalStorageWorking = false;
    }
    memoryLocalStorage.clear();
  }
};

/**
 * Safe session storage getter/setter with automatic in-memory fallback
 */
export const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      if (nativeSessionStorageWorking && typeof window !== "undefined" && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (_err) {
      nativeSessionStorageWorking = false;
    }
    return memorySessionStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    try {
      if (nativeSessionStorageWorking && typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch (_err) {
      nativeSessionStorageWorking = false;
    }
    memorySessionStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    try {
      if (nativeSessionStorageWorking && typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
        return;
      }
    } catch (_err) {
      nativeSessionStorageWorking = false;
    }
    memorySessionStorage.removeItem(key);
  },

  clear(): void {
    try {
      if (nativeSessionStorageWorking && typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch (_err) {
      nativeSessionStorageWorking = false;
    }
    memorySessionStorage.clear();
  }
};

/**
 * Safe Clipboard copy that handles iframe permission denials without throwing SecurityError
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. Try Modern Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_err) {
      // Continue to fallback
    }
  }

  // 2. Fallback using temporary textarea + execCommand
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (_err) {
    return false;
  }
}
