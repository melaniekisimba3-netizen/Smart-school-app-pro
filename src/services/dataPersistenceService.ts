/**
 * SMART SCHOOL RDC — MOTEUR UNIFIÉ DE PERSISTANCE ET DE SYNCHRONISATION MULTI-TENANT
 * Gère la persistance synchrone et asynchrone pour :
 * 1. Base de données Firestore Cloud (Temps réel onSnapshot)
 * 2. API REST persistante de backend Node.js / Express
 * 3. Canal de synchronisation inter-fenêtres (BroadcastChannel)
 * 4. Stockage Local résilient (safeLocalStorage)
 */

import { safeLocalStorage } from "../utils/safeStorage";
import { db, isFirebaseConfigured } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  Unsubscribe 
} from "firebase/firestore";

export interface DataPersistenceConfig {
  schoolId: string;
  collectionName: string;
}

// Inter-tab / cross-window realtime synchronization channel
let realtimeSyncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    realtimeSyncChannel = new BroadcastChannel("smartschool_rdc_realtime_sync");
  }
} catch (e) {
  console.warn("BroadcastChannel not supported in current environment", e);
}

export function broadcastRealtimeUpdate(schoolId: string, collectionName: string, action: "upsert" | "delete" | "reload", data?: any) {
  const payload = {
    schoolId: schoolId || "global",
    collectionName,
    action,
    data,
    timestamp: Date.now()
  };

  // 1. Post via BroadcastChannel to other tabs
  if (realtimeSyncChannel) {
    try {
      realtimeSyncChannel.postMessage(payload);
    } catch (e) {}
  }

  // 2. Dispatch custom DOM event for current window
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("smartschool_realtime_data_changed", { detail: payload }));
    } catch (e) {}
  }
}

/**
 * Charge une collection de données pour une école donnée
 * (Priorité : Firestore -> Serveur API -> Cache Local -> Données par défaut)
 */
export async function loadPersistentCollection<T extends { id: string }>(
  schoolId: string,
  collectionName: string,
  defaultItems: T[] = []
): Promise<T[]> {
  const cacheKey = `ssrdc_${schoolId || "global"}_${collectionName}`;

  // 1. Essayer Firestore Cloud si configuré
  if (isFirebaseConfigured && db) {
    try {
      const items: T[] = [];
      if (schoolId && schoolId !== "global") {
        const q = query(collection(db, collectionName), where("schoolId", "==", schoolId));
        const snap = await getDocs(q);
        snap.forEach(d => {
          items.push({ id: d.id, ...d.data() } as T);
        });
      } else {
        const snap = await getDocs(collection(db, collectionName));
        snap.forEach(d => {
          items.push({ id: d.id, ...d.data() } as T);
        });
      }
      if (items.length > 0 || (schoolId && schoolId !== "default" && schoolId !== "sch-001")) {
        safeLocalStorage.setItem(cacheKey, JSON.stringify(items));
        syncToServerApi(schoolId, collectionName, items).catch(() => {});
        return items;
      }
    } catch (fsErr) {
      console.warn(`Firestore read failed for ${collectionName}:`, fsErr);
    }
  }

  // 2. Essayer l'API REST Persistante du Serveur Express
  try {
    const res = await fetch(`/api/data/${schoolId || "global"}/${collectionName}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        if (json.data.length > 0 || (schoolId && schoolId !== "default" && schoolId !== "sch-001")) {
          safeLocalStorage.setItem(cacheKey, JSON.stringify(json.data));
          return json.data;
        }
      }
    }
  } catch (err) {
    // Mode hors-ligne ou transition réseau
  }

  // 3. Fallback au Cache Local (safeLocalStorage)
  try {
    const localRaw = safeLocalStorage.getItem(cacheKey);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Error parsing cached ${collectionName}:`, e);
  }

  // 4. Retourner les données par défaut si aucune donnée stockée
  return defaultItems;
}

/**
 * Souscrit en temps réel aux mises à jour d'une collection (Firestore onSnapshot + BroadcastChannel fallback)
 */
export function subscribeToPersistentCollection<T extends { id: string }>(
  schoolId: string,
  collectionName: string,
  callback: (items: T[]) => void
): () => void {
  const cacheKey = `ssrdc_${schoolId || "global"}_${collectionName}`;
  const unsubs: (() => void)[] = [];

  // 1. Firestore Real-time Snapshot listener
  if (isFirebaseConfigured && db) {
    try {
      const q = schoolId && schoolId !== "global"
        ? query(collection(db, collectionName), where("schoolId", "==", schoolId))
        : collection(db, collectionName);

      const fsUnsub = onSnapshot(q as any, (snap: any) => {
        const items: T[] = [];
        snap.forEach((d: any) => {
          items.push({ id: d.id, ...d.data() } as T);
        });
        if (items.length > 0 || (schoolId && schoolId !== "default" && schoolId !== "sch-001")) {
          safeLocalStorage.setItem(cacheKey, JSON.stringify(items));
          callback(items);
        }
      }, (err) => {
        console.warn(`Firestore onSnapshot error for ${collectionName}:`, err);
      });

      unsubs.push(fsUnsub);
    } catch (e) {
      console.warn("Firestore subscription error:", e);
    }
  }

  // 2. BroadcastChannel inter-session listener
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.collectionName === collectionName) {
      if (!schoolId || schoolId === "global" || event.data.schoolId === schoolId) {
        loadPersistentCollection<T>(schoolId, collectionName).then(fresh => {
          if (Array.isArray(fresh)) callback(fresh);
        }).catch(() => {});
      }
    }
  };

  if (realtimeSyncChannel) {
    realtimeSyncChannel.addEventListener("message", handleBroadcast);
    unsubs.push(() => realtimeSyncChannel?.removeEventListener("message", handleBroadcast));
  }

  // 3. Custom DOM Event for same tab
  const handleDomEvent = (e: any) => {
    if (e.detail && e.detail.collectionName === collectionName) {
      if (!schoolId || schoolId === "global" || e.detail.schoolId === schoolId) {
        loadPersistentCollection<T>(schoolId, collectionName).then(fresh => {
          if (Array.isArray(fresh)) callback(fresh);
        }).catch(() => {});
      }
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("smartschool_realtime_data_changed", handleDomEvent);
    unsubs.push(() => window.removeEventListener("smartschool_realtime_data_changed", handleDomEvent));
  }

  return () => {
    unsubs.forEach(fn => {
      try { fn(); } catch (e) {}
    });
  };
}

/**
 * Sauvegarde intégrale d'une collection pour une école (Server API + Firestore + Local Cache + Broadcast)
 * Protection Zero-Data-Loss : empêche l'écrasement intempestif de collections peuplées par des tableaux vides
 */
export async function savePersistentCollection<T extends { id: string }>(
  schoolId: string,
  collectionName: string,
  items: T[],
  options?: { allowEmptyOverride?: boolean }
): Promise<boolean> {
  const cacheKey = `ssrdc_${schoolId || "global"}_${collectionName}`;

  // Zero-Data-Loss Safety Guard: if items is empty and not explicitly allowed, check if there's already real data
  if (items.length === 0 && !options?.allowEmptyOverride) {
    try {
      const existing = safeLocalStorage.getItem(cacheKey);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.warn(`[Zero-Data-Loss Protection] Ignored empty save attempt for populated collection "${collectionName}" (${schoolId}). Existing ${parsed.length} records preserved.`);
          return false;
        }
      }
    } catch (e) {}
  }

  // 1. Sauvegarde dans le Cache Local immédiat
  try {
    safeLocalStorage.setItem(cacheKey, JSON.stringify(items));
  } catch (e) {
    console.warn("Local storage cache write warning:", e);
  }

  // 2. Sauvegarde sur l'API Serveur Express
  syncToServerApi(schoolId, collectionName, items).catch(err => {
    console.warn("Server API sync warning:", err);
  });

  // 3. Sauvegarde sur Firestore (Cloud)
  if (isFirebaseConfigured && db) {
    try {
      for (const item of items) {
        const docRef = doc(db, collectionName, item.id);
        await setDoc(docRef, {
          ...item,
          schoolId: schoolId || (item as any).schoolId || "global",
          persistedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (fsErr) {
      console.warn(`Firestore sync warning for ${collectionName}:`, fsErr);
    }
  }

  // 4. Broadcast Realtime Sync to other tabs and sessions
  broadcastRealtimeUpdate(schoolId, collectionName, "reload", items);

  return true;
}

/**
 * Sauvegarde ou met à jour un élément unique dans une collection
 */
export async function savePersistentItem<T extends { id: string }>(
  schoolId: string,
  collectionName: string,
  item: T
): Promise<boolean> {
  const cacheKey = `ssrdc_${schoolId || "global"}_${collectionName}`;
  
  // Local cache update
  try {
    const raw = safeLocalStorage.getItem(cacheKey);
    let list: T[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    const idx = list.findIndex(x => x.id === item.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.unshift(item);
    }
    safeLocalStorage.setItem(cacheKey, JSON.stringify(list));
  } catch (e) {
    console.warn("Local storage item update error:", e);
  }

  // Server API item upsert
  try {
    fetch(`/api/data/${schoolId || "global"}/${collectionName}/item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item })
    }).catch(() => {});
  } catch (e) {}

  // Firestore update
  if (isFirebaseConfigured && db && item.id) {
    try {
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, {
        ...item,
        schoolId: schoolId || (item as any).schoolId || "global",
        persistedAt: serverTimestamp()
      }, { merge: true });
    } catch (fsErr) {
      console.warn("Firestore item sync warning:", fsErr);
    }
  }

  // Broadcast Realtime Update
  broadcastRealtimeUpdate(schoolId, collectionName, "upsert", item);

  return true;
}

/**
 * Supprime un élément d'une collection
 */
export async function deletePersistentItem(
  schoolId: string,
  collectionName: string,
  itemId: string
): Promise<boolean> {
  const cacheKey = `ssrdc_${schoolId || "global"}_${collectionName}`;
  
  // Local cache delete
  try {
    const raw = safeLocalStorage.getItem(cacheKey);
    let list: any[] = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list)) {
      list = list.filter(x => x.id !== itemId);
      safeLocalStorage.setItem(cacheKey, JSON.stringify(list));
    }
  } catch (e) {}

  // Server API delete
  try {
    fetch(`/api/data/${schoolId || "global"}/${collectionName}/item/${itemId}`, {
      method: "DELETE"
    }).catch(() => {});
  } catch (e) {}

  // Firestore delete
  if (isFirebaseConfigured && db && itemId) {
    try {
      const docRef = doc(db, collectionName, itemId);
      await deleteDoc(docRef);
    } catch (fsErr) {
      console.warn("Firestore delete warning:", fsErr);
    }
  }

  // Broadcast Realtime Update
  broadcastRealtimeUpdate(schoolId, collectionName, "delete", { id: itemId });

  return true;
}

async function syncToServerApi<T>(schoolId: string, collectionName: string, data: T[]): Promise<void> {
  try {
    await fetch(`/api/data/${schoolId || "global"}/${collectionName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data })
    });
  } catch (err) {
    // Silent on network error
  }
}
