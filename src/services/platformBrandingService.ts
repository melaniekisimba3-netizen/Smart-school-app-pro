/**
 * SMART SCHOOL RDC — SERVICE CENTRAL D'IDENTITÉ VISUELLE & DE MARQUE
 * Gère le stockage persistant serveur, la synchronisation Firestore et
 * la propagation en temps réel du Logo Officiel, du Drapeau RDC et des Armoiries RDC.
 */

import { safeLocalStorage } from "../utils/safeStorage";
import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface PlatformBranding {
  logoUrl: string;
  flagUrl: string;
  coatOfArmsUrl: string;
  platformName: string;
  platformSlogan: string;
  watermarkOpacity: number;
  updatedAt: string;
  updatedBy: string;
  updatedByRole: string;
  history?: Array<{
    id: string;
    timestamp: string;
    actor: string;
    role: string;
    action: string;
    details: string;
  }>;
}

export const DEFAULT_PLATFORM_BRANDING: PlatformBranding = {
  logoUrl: "/branding/smartschool-rdc-logo.png",
  flagUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/512px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png",
  coatOfArmsUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png",
  platformName: "SmartSchool RDC",
  platformSlogan: "Gérer • Enseigner • Apprendre • Réussir — FRED-TECH",
  watermarkOpacity: 0.06,
  updatedAt: "2026-08-20T00:00:00.000Z",
  updatedBy: "Ir IT Fred Kalonda",
  updatedByRole: "Propriétaire",
  history: [
    {
      id: "hist-init",
      timestamp: "2026-08-20T00:00:00.000Z",
      actor: "Ir IT Fred Kalonda",
      role: "Propriétaire",
      action: "INITIALISATION_OFFICIELLE",
      details: "Initialisation des emblèmes souverains nationaux et du logo officiel SmartSchool RDC"
    }
  ]
};

const STORAGE_KEY = "smartschool_platform_branding_cache";

/**
 * Lit le branding depuis le serveur / Firestore / cache local
 */
export async function fetchPlatformBranding(): Promise<PlatformBranding> {
  // 1. Essayer l'API REST persistante du serveur
  try {
    const res = await fetch("/api/platform/branding");
    if (res.ok) {
      const data = await res.json();
      if (data && data.branding) {
        // Mettre en cache
        safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(data.branding));
        return data.branding;
      }
    }
  } catch (err) {
    console.warn("Erreur lecture API branding serveur, tentative Firestore/Cache:", err);
  }

  // 2. Essayer Firestore si configuré
  if (db) {
    try {
      const docRef = doc(db, "system_branding", "official_identity");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const firestoreData = docSnap.data() as PlatformBranding;
        safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreData));
        return firestoreData;
      }
    } catch (firestoreErr) {
      console.warn("Erreur lecture Firestore branding:", firestoreErr);
    }
  }

  // 3. Fallback au cache local
  const cached = safeLocalStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
  }

  return DEFAULT_PLATFORM_BRANDING;
}

/**
 * Sauvegarde persistante de l'identité visuelle (Serveur API + Firestore + Local + Propagation d'événement)
 */
export async function savePlatformBranding(
  brandingUpdates: Partial<PlatformBranding>,
  userRole: string = "Propriétaire",
  userName: string = "Propriétaire SmartSchool RDC"
): Promise<{ success: boolean; branding: PlatformBranding; message?: string; error?: string }> {
  const current = await fetchPlatformBranding();
  const merged: PlatformBranding = {
    ...current,
    ...brandingUpdates,
    updatedAt: new Date().toISOString(),
    updatedBy: userName,
    updatedByRole: userRole,
    history: [
      {
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: userName,
        role: userRole,
        action: "MISE_A_JOUR_IDENTITE_VISUELLE",
        details: "Mise à jour persistante des éléments officiels (Logo, Drapeau RDC, Armoiries RDC)"
      },
      ...(current.history || [])
    ].slice(0, 50)
  };

  let savedToServer = false;

  // 1. Envoi au serveur Express pour écriture sur disque persistant
  try {
    const res = await fetch("/api/platform/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...merged,
        userRole,
        userName
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.branding) {
        Object.assign(merged, data.branding);
        savedToServer = true;
      }
    }
  } catch (err) {
    console.warn("Avertissement: Impossible de contacter le serveur persistant:", err);
  }

  // 2. Synchronisation avec Firestore
  if (db) {
    try {
      const docRef = doc(db, "system_branding", "official_identity");
      await setDoc(docRef, {
        ...merged,
        serverSyncedAt: serverTimestamp()
      }, { merge: true });
    } catch (firestoreErr) {
      console.warn("Avertissement synchronisation Firestore branding:", firestoreErr);
    }
  }

  // 3. Mise en cache local pour résilience instantanée
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  safeLocalStorage.setItem("smartschool_platform_logo_url", merged.logoUrl);
  safeLocalStorage.setItem("rdc_drapeau_url", merged.flagUrl);
  safeLocalStorage.setItem("rdc_watermark_url", merged.coatOfArmsUrl);

  // 4. Émission de l'événement global pour mise à jour immédiate de tous les composants
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("smartschool_branding_updated", { detail: merged }));
  }

  return {
    success: true,
    branding: merged,
    message: savedToServer
      ? "Éléments visuels officiels enregistrés avec succès dans le stockage persistant serveur & Firestore."
      : "Éléments visuels enregistrés avec succès."
  };
}

/**
 * Réinitialisation aux valeurs officielles par défaut
 */
export async function resetPlatformBrandingToDefaults(
  userRole: string = "Propriétaire",
  userName: string = "Propriétaire SmartSchool RDC"
): Promise<{ success: boolean; branding: PlatformBranding }> {
  try {
    const res = await fetch("/api/platform/branding/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userRole, userName })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.branding) {
        safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(data.branding));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("smartschool_branding_updated", { detail: data.branding }));
        }
        return { success: true, branding: data.branding };
      }
    }
  } catch (err) {
    console.error("Erreur réinitialisation branding:", err);
  }

  // Fallback
  const resetData: PlatformBranding = {
    ...DEFAULT_PLATFORM_BRANDING,
    updatedAt: new Date().toISOString(),
    updatedBy: userName,
    updatedByRole: userRole
  };
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("smartschool_branding_updated", { detail: resetData }));
  }
  return { success: true, branding: resetData };
}
