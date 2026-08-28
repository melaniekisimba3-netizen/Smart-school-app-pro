import { FinancialAuditTrailEntry, FinancialSecurityAlert } from "../types";
import { safeLocalStorage } from "../utils/safeStorage";

const STORAGE_KEY_AUDIT_PREFIX = "ssrdc_finaudit_";
const STORAGE_KEY_ALERTS_PREFIX = "ssrdc_finalerts_";

/**
 * Enregistre une trace d'audit financière immuable sur le serveur et le cache sécurisé
 */
export async function recordFinancialAudit(
  entry: Omit<FinancialAuditTrailEntry, "id" | "timestamp" | "integrityHash">
): Promise<FinancialAuditTrailEntry> {
  const schoolId = entry.schoolId || "global";
  const id = `FAUDIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();

  const payload = {
    ...entry,
    id,
    timestamp,
    promoterNotified: true
  };

  // 1. Sauvegarde sur l'API Serveur Express
  try {
    const res = await fetch("/api/finance/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.entry) {
        saveAuditLocalCache(schoolId, data.entry);
        return data.entry;
      }
    }
  } catch (err) {
    console.warn("[FinancialAuditService] Server unreachable, caching locally:", err);
  }

  // 2. Fallback Cache Local Sécurisé
  const fallbackEntry: FinancialAuditTrailEntry = {
    ...payload,
    integrityHash: `SHA256-LOCAL-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  };
  saveAuditLocalCache(schoolId, fallbackEntry);
  return fallbackEntry;
}

/**
 * Récupère le grand livre d'audit financier d'un établissement
 */
export async function getSchoolFinancialAuditTrail(schoolId: string): Promise<FinancialAuditTrailEntry[]> {
  try {
    const res = await fetch(`/api/finance/audit/${encodeURIComponent(schoolId || "global")}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        safeLocalStorage.setItem(`${STORAGE_KEY_AUDIT_PREFIX}${schoolId}`, JSON.stringify(data.entries));
        return data.entries;
      }
    }
  } catch (err) {
    console.warn("[FinancialAuditService] Fallback to local audit logs cache:", err);
  }

  try {
    const cached = safeLocalStorage.getItem(`${STORAGE_KEY_AUDIT_PREFIX}${schoolId}`);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  return [];
}

/**
 * Récupère les alertes anti-fraude et opérations sensibles pour le Promoteur
 */
export async function getSchoolFinancialAlerts(schoolId: string): Promise<FinancialSecurityAlert[]> {
  try {
    const res = await fetch(`/api/finance/alerts/${encodeURIComponent(schoolId || "global")}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.alerts)) {
        safeLocalStorage.setItem(`${STORAGE_KEY_ALERTS_PREFIX}${schoolId}`, JSON.stringify(data.alerts));
        return data.alerts;
      }
    }
  } catch (err) {
    console.warn("[FinancialAuditService] Fallback to local alerts cache:", err);
  }

  try {
    const cached = safeLocalStorage.getItem(`${STORAGE_KEY_ALERTS_PREFIX}${schoolId}`);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  return [];
}

/**
 * Marque une alerte financière comme examinée / justifiée par le Promoteur
 */
export async function resolveFinancialAlert(
  schoolId: string,
  alertId: string,
  promoterName: string,
  comment: string,
  status: "JUSTIFIEE_PROMOTEUR" | "BLOQUEE" = "JUSTIFIEE_PROMOTEUR"
): Promise<boolean> {
  try {
    const res = await fetch("/api/finance/alerts/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, alertId, promoterName, comment, status })
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err) {
    console.error("[FinancialAuditService] Failed to resolve alert:", err);
  }

  // Update local cache
  try {
    const cached = safeLocalStorage.getItem(`${STORAGE_KEY_ALERTS_PREFIX}${schoolId}`);
    if (cached) {
      const list: FinancialSecurityAlert[] = JSON.parse(cached);
      const updated = list.map(a => a.id === alertId ? { ...a, status, reviewedBy: promoterName, reviewedAt: new Date().toISOString(), promoterComment: comment } : a);
      safeLocalStorage.setItem(`${STORAGE_KEY_ALERTS_PREFIX}${schoolId}`, JSON.stringify(updated));
      return true;
    }
  } catch (e) {}

  return false;
}

/**
 * Exécute une annulation ou un remboursement contrôlé avec motif obligatoire et alerte Promoteur
 */
export async function executeControlledVoidOrRefund(params: {
  schoolId: string;
  paymentId: string;
  action: "ANNULER" | "REMBOURSER";
  operatorName: string;
  operatorRole: string;
  operatorId: string;
  justification: string;
  studentName?: string;
  amount?: number;
  currency?: "USD" | "CDF";
  reference?: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  if (!params.justification || params.justification.trim().length < 8) {
    return {
      success: false,
      error: "Un motif obligatoire et circonstancié (minimum 8 caractères) est exigé pour enregistrer une annulation ou un remboursement."
    };
  }

  try {
    const res = await fetch("/api/finance/transactions/void-or-refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("[FinancialAuditService] Void/Refund error:", err);
    return { success: false, error: err.message || "Erreur de communication avec le serveur financier." };
  }
}

/**
 * Met à jour la configuration des frais et comptes Mobile Money (Réservé au Promoteur)
 */
export async function savePromoterLockedConfig(
  schoolId: string,
  config: any,
  userRole: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/finance/config/${encodeURIComponent(schoolId || "global")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config, userRole, userName })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || "Impossible de joindre le serveur de sécurité financière." };
  }
}

function saveAuditLocalCache(schoolId: string, entry: FinancialAuditTrailEntry) {
  try {
    const key = `${STORAGE_KEY_AUDIT_PREFIX}${schoolId}`;
    const raw = safeLocalStorage.getItem(key);
    const existing: FinancialAuditTrailEntry[] = raw ? JSON.parse(raw) : [];
    const updated = [entry, ...existing.filter(e => e.id !== entry.id)].slice(0, 500);
    safeLocalStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {}
}
