/**
 * SMART SCHOOL RDC — MOTEUR UNIFIÉ DE PERSISTANCE ET DE SYNCHRONISATION MULTI-TENANT
 * Gère la persistance synchrone et asynchrone pour :
 * 1. Base de données Firestore Cloud
 * 2. API REST persistante de backend Node.js / Express
 * 3. Stockage Local résilient (safeLocalStorage)
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
  serverTimestamp 
} from "firebase/firestore";

export interface DataPersistenceConfig {
  schoolId: string;
  collectionName: string;
}

/**
 * Charge une collection de données pour une école donnée
 * (Priorité : Serveur API -> Firestore -> Cache Local -> Données par défaut)
 */
export async function loadPersistentCollection<T extends { id: string }>(
  schoolId: string,
  collectionName: string,
  defaultItems: T[] = []
): Promise<T[]> {
  const cacheKey = `ssrdc_${schoolId || "global"}_${collectionName}`;

  // 1. Essayer l'API REST Persistante du Serveur Express
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

  // 2. Essayer Firestore si configuré
  if (isFirebaseConfigured && db) {
    try {
      let items: T[] = [];
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
        // Back-sync au serveur local
        syncToServerApi(schoolId, collectionName, items).catch(() => {});
        return items;
      }
    } catch (fsErr) {
      console.warn(`Firestore read failed for ${collectionName}:`, fsErr);
    }
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
 * Sauvegarde intégrale d'une collection pour une école (Server API + Firestore + Local Cache)
 */
export async function savePersistentCollection<T extends { id: string }>(
  schoolId: string,
  collectionName: string,
  items: T[]
): Promise<boolean> {
  const cacheKey = `ssrdc_${schoolId || "global"}_${collectionName}`;

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
