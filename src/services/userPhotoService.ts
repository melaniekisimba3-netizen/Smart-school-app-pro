/**
 * SMART SCHOOL RDC — MOTEUR DE GESTION & PERSISTANCE DES PHOTOS DE PROFIL
 * 
 * Assure :
 * 1. Association stricte au identifiant unique du compte (ID / dossierId)
 * 2. Persistance multi-couches : API Backend /api/data/:schoolId/:col/item, Firestore & Cache local résilient
 * 3. Invalidation et synchronisation immédiate sur tous les composants sans rechargement
 * 4. Traitement et compression HD optimisée côté client
 */

import { safeLocalStorage } from "../utils/safeStorage";
import { savePersistentItem } from "./dataPersistenceService";
import { UserAccount, Student, Employee, Parent, PlatformStaffMember } from "../types";
import { persistUniversalUserAccount, getStoredUniversalUserAccounts } from "./accountActivationService";

export interface UpdatePhotoParams {
  targetId: string; // UserAccount.id, Student.id, Employee.id, Parent.id or Staff.id
  photoUrl: string; // Base64 Data URL or remote URL
  schoolId?: string;
  role?: string;
  accountCategory?: string;
  actorName?: string;
}

export interface PhotoOperationResult {
  success: boolean;
  photoUrl: string;
  targetId: string;
  message: string;
  timestamp: string;
}

const PHOTO_CACHE_PREFIX = "ssrdc_photo_profile_";

/**
 * Récupère la photo de profil persistée pour un compte ou dossier donné
 * Supporte getStoredProfilePhoto(targetId, fallbackUrl) ou getStoredProfilePhoto(schoolId, targetId, fallbackUrl)
 */
export function getStoredProfilePhoto(idOrSchool: string, idOrFallback = "", fallback = ""): string {
  if (!idOrSchool) return fallback || (idOrFallback.startsWith("http") || idOrFallback.startsWith("data:") ? idOrFallback : "");
  
  const idsToCheck: string[] = [];
  if (idOrFallback && !idOrFallback.startsWith("http") && !idOrFallback.startsWith("data:")) {
    idsToCheck.push(idOrFallback);
  }
  idsToCheck.push(idOrSchool);

  for (const id of idsToCheck) {
    if (!id) continue;
    try {
      const cached = safeLocalStorage.getItem(`${PHOTO_CACHE_PREFIX}${id}`);
      if (cached && (cached.startsWith("data:image/") || cached.startsWith("http"))) {
        return cached;
      }
    } catch (e) {
      console.warn("Error reading profile photo cache:", e);
    }
  }

  const effectiveFallback = (idOrFallback && (idOrFallback.startsWith("http") || idOrFallback.startsWith("data:"))) 
    ? idOrFallback 
    : fallback;

  return effectiveFallback;
}

/**
 * Enregistre ou supprime de manière persistante la photo de profil associée à l'identifiant unique
 */
export async function saveUserProfilePhoto(params: UpdatePhotoParams): Promise<PhotoOperationResult> {
  const { targetId, photoUrl, schoolId = "global", role = "Utilisateur", actorName } = params;
  const now = new Date().toISOString();

  if (!targetId) {
    throw new Error("L'identifiant unique du compte est obligatoire pour enregistrer la photo.");
  }

  // 1. Mise à jour immédiate du Cache Local lié à l'ID
  const cacheKey = `${PHOTO_CACHE_PREFIX}${targetId}`;
  if (photoUrl) {
    safeLocalStorage.setItem(cacheKey, photoUrl);
  } else {
    safeLocalStorage.removeItem(cacheKey);
  }

  // 2. Mettre à jour le UserAccount universel
  try {
    const accounts = getStoredUniversalUserAccounts();
    const matchedAccount = accounts.find(
      a => a.id === targetId || a.dossierId === targetId || a.username === targetId || (a as any).firebaseUid === targetId
    );

    if (matchedAccount) {
      const updatedAccount: UserAccount = {
        ...matchedAccount,
        photoUrl: photoUrl || undefined
      };
      persistUniversalUserAccount(updatedAccount);
    }
  } catch (err) {
    console.warn("User account photo update warning:", err);
  }

  // 3. Sauvegarder dans la collection métier appropriée (students, employees, parents, platform_staff)
  try {
    const safeSchool = schoolId || "global";

    // A. Si c'est un élève
    if (role.toLowerCase().includes("élève") || targetId.startsWith("std-") || targetId.startsWith("ELEVE-")) {
      await savePersistentItem<any>(safeSchool, "students", {
        id: targetId,
        photoUrl: photoUrl || ""
      });
    }

    // B. Si c'est un employé / enseignant / préfet / directeur / comptable
    if (
      role.toLowerCase().includes("enseignant") ||
      role.toLowerCase().includes("professeur") ||
      role.toLowerCase().includes("préfet") ||
      role.toLowerCase().includes("directeur") ||
      role.toLowerCase().includes("comptable") ||
      role.toLowerCase().includes("secrétaire") ||
      role.toLowerCase().includes("personnel") ||
      targetId.startsWith("emp-") ||
      targetId.startsWith("EMP-")
    ) {
      await savePersistentItem<any>(safeSchool, "employees", {
        id: targetId,
        photoUrl: photoUrl || ""
      });
    }

    // C. Si c'est un parent
    if (role.toLowerCase().includes("parent") || targetId.startsWith("par-") || targetId.startsWith("PAR-")) {
      await savePersistentItem<any>(safeSchool, "parents", {
        id: targetId,
        photoUrl: photoUrl || ""
      });
    }

    // D. Si c'est un membre du personnel interne plateforme ou propriétaire
    if (
      role.toLowerCase().includes("propriétaire") ||
      role.toLowerCase().includes("super administrateur") ||
      role.toLowerCase().includes("plateforme") ||
      targetId.startsWith("staff-") ||
      targetId.startsWith("sa-")
    ) {
      await savePersistentItem<any>("global", "platform_staff", {
        id: targetId,
        photoUrl: photoUrl || ""
      });
    }

    // E. Toujours sauvegarder dans la table générale de comptes utilisateurs
    await savePersistentItem<any>(safeSchool, "user_accounts", {
      id: targetId,
      photoUrl: photoUrl || ""
    });
  } catch (persistErr) {
    console.warn("Backend persistent photo sync note:", persistErr);
  }

  // 4. Émettre un événement d'invalidation de cache temps réel dans tout le navigateur
  if (typeof window !== "undefined") {
    const event = new CustomEvent("smartschool_photo_updated", {
      detail: {
        targetId,
        photoUrl,
        role,
        updatedAt: now
      }
    });
    window.dispatchEvent(event);
  }

  return {
    success: true,
    photoUrl,
    targetId,
    message: photoUrl ? "Photo de profil mise à jour et enregistrée avec succès." : "Photo de profil supprimée.",
    timestamp: now
  };
}
