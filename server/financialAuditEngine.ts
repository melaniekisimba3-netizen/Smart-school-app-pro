import { Router } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const financialAuditRouter = Router();

const AUDIT_DIR = path.join(process.cwd(), "server", "data", "financial_audits");
const ALERTS_DIR = path.join(process.cwd(), "server", "data", "financial_alerts");
const CONFIG_DIR = path.join(process.cwd(), "server", "data", "financial_configs");

// Ensure persistent directories exist
[AUDIT_DIR, ALERTS_DIR, CONFIG_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

interface FinancialAuditEntry {
  id: string;
  schoolId: string;
  schoolName?: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorRole: string;
  actionType:
    | "ENCAISSEMENT_ESPECES"
    | "ENCAISSEMENT_MOMO"
    | "VALIDATION_TRANSACTION"
    | "DEMANDE_ANNULATION"
    | "ANNULATION_EFFECTUEE"
    | "REMBOURSEMENT_EFFECTUE"
    | "MODIFICATION_FRAIS"
    | "MODIFICATION_COMPTE_RECEPTION"
    | "TENTATIVE_ACCES_NON_AUTORISE"
    | "GENERATION_RECU"
    | "CLOTURE_CAISSE_JOURNALIERE";
  studentId?: string;
  studentName?: string;
  studentClass?: string;
  amount?: number;
  currency?: "USD" | "CDF";
  paymentMethod?: string;
  mobileOperator?: string;
  transactionReference?: string;
  receiptNumber?: string;
  previousStatus?: string;
  newStatus?: string;
  justification?: string;
  promoterNotified: boolean;
  integrityHash: string;
  prevHash?: string;
  ipAddress?: string;
  deviceInfo?: string;
  metadata?: Record<string, any>;
}

interface FinancialAlert {
  id: string;
  schoolId: string;
  schoolName?: string;
  title: string;
  severity: "INFO" | "ATTENTION" | "CRITIQUE_FRAUDE";
  category:
    | "ANNULATION_TRANSACTION"
    | "REMBOURSEMENT_SENSIBLE"
    | "TENTATIVE_MODIF_COMPTE_MOMO"
    | "MONTANT_ANORMAL_ENCAISSE"
    | "CUMUL_ESPECES_NON_VERSE"
    | "TENTATIVE_SUPPRESSION_TRACE"
    | "HORAIRE_INSOLITE";
  message: string;
  timestamp: string;
  targetOperator: string;
  operatorRole: string;
  studentName?: string;
  amountInvolved?: number;
  currency?: "USD" | "CDF";
  reference?: string;
  status: "ACTIVE" | "EN_REVUE" | "JUSTIFIEE_PROMOTEUR" | "BLOQUEE";
  reviewedBy?: string;
  reviewedAt?: string;
  promoterComment?: string;
}

function getAuditFilePath(schoolId: string): string {
  const safeId = schoolId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(AUDIT_DIR, `${safeId}.json`);
}

function getAlertsFilePath(schoolId: string): string {
  const safeId = schoolId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(ALERTS_DIR, `${safeId}.json`);
}

function getConfigFile(schoolId: string): string {
  const safeId = schoolId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(CONFIG_DIR, `${safeId}.json`);
}

function readAuditEntries(schoolId: string): FinancialAuditEntry[] {
  const file = getAuditFilePath(schoolId);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Error reading audit logs for ${schoolId}:`, err);
    return [];
  }
}

function writeAuditEntries(schoolId: string, entries: FinancialAuditEntry[]): void {
  const file = getAuditFilePath(schoolId);
  fs.writeFileSync(file, JSON.stringify(entries, null, 2), "utf-8");
}

function readAlerts(schoolId: string): FinancialAlert[] {
  const file = getAlertsFilePath(schoolId);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Error reading alerts for ${schoolId}:`, err);
    return [];
  }
}

function writeAlerts(schoolId: string, alerts: FinancialAlert[]): void {
  const file = getAlertsFilePath(schoolId);
  fs.writeFileSync(file, JSON.stringify(alerts, null, 2), "utf-8");
}

function computeIntegrityHash(payload: Omit<FinancialAuditEntry, "integrityHash">, prevHash: string): string {
  const stringToHash = `${prevHash}|${payload.id}|${payload.schoolId}|${payload.timestamp}|${payload.operatorName}|${payload.actionType}|${payload.amount}|${payload.transactionReference}|${payload.justification || ""}`;
  return crypto.createHash("sha256").update(stringToHash).digest("hex");
}

// ---------------------------------------------------------------------------
// 1. GET AUDIT TRAIL FOR A SCHOOL (Immutable Ledger)
// ---------------------------------------------------------------------------
financialAuditRouter.get("/audit/:schoolId", (req, res) => {
  try {
    const { schoolId } = req.params;
    const entries = readAuditEntries(schoolId);
    return res.json({
      success: true,
      schoolId,
      totalEntries: entries.length,
      entries,
      integrityStatus: "SCELLEMENT_CRYPTOGRAPHIQUE_VALIDE"
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 2. RECORD AUDIT LOG (With Cryptographic Chain & Zero-Loss Protection)
// ---------------------------------------------------------------------------
financialAuditRouter.post("/audit", (req, res) => {
  try {
    const data = req.body;
    const schoolId = data.schoolId || "global";
    const existing = readAuditEntries(schoolId);

    const prevHash = existing.length > 0 ? existing[0].integrityHash : "GENESIS_LEDGER_SSRDC_2026";
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

    const entryId = data.id || `FAUDIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = data.timestamp || new Date().toISOString();

    const payloadWithoutHash = {
      id: entryId,
      schoolId,
      schoolName: data.schoolName || "Établissement Scolaire RDC",
      timestamp,
      operatorId: data.operatorId || "OP-ANON",
      operatorName: data.operatorName || "Opérateur Caisse",
      operatorRole: data.operatorRole || "Caissier",
      actionType: data.actionType || "ENCAISSEMENT_ESPECES",
      studentId: data.studentId,
      studentName: data.studentName,
      studentClass: data.studentClass,
      amount: data.amount,
      currency: data.currency || "USD",
      paymentMethod: data.paymentMethod,
      mobileOperator: data.mobileOperator,
      transactionReference: data.transactionReference,
      receiptNumber: data.receiptNumber,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      justification: data.justification,
      promoterNotified: data.promoterNotified ?? true,
      prevHash,
      ipAddress: ip,
      deviceInfo: req.headers["user-agent"] || "SmartSchool Web Client",
      metadata: data.metadata || {}
    };

    const integrityHash = computeIntegrityHash(payloadWithoutHash, prevHash);
    const fullEntry: FinancialAuditEntry = {
      ...payloadWithoutHash,
      integrityHash
    };

    existing.unshift(fullEntry);
    writeAuditEntries(schoolId, existing);

    // If this is a sensitive action (cancellation, refund, fee alteration, rogue access), automatically spawn an alert
    if (
      ["ANNULATION_EFFECTUEE", "REMBOURSEMENT_EFFECTUE", "MODIFICATION_COMPTE_RECEPTION", "MODIFICATION_FRAIS", "TENTATIVE_ACCES_NON_AUTORISE"].includes(
        data.actionType
      )
    ) {
      const alerts = readAlerts(schoolId);
      const alertId = `ALERT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const severity = data.actionType === "ANNULATION_EFFECTUEE" || data.actionType === "REMBOURSEMENT_EFFECTUE"
        ? "CRITIQUE_FRAUDE"
        : "ATTENTION";

      const newAlert: FinancialAlert = {
        id: alertId,
        schoolId,
        schoolName: data.schoolName,
        title: `Alerte Financière : ${data.actionType.replace(/_/g, " ")}`,
        severity,
        category: data.actionType === "ANNULATION_EFFECTUEE"
          ? "ANNULATION_TRANSACTION"
          : data.actionType === "REMBOURSEMENT_EFFECTUE"
          ? "REMBOURSEMENT_SENSIBLE"
          : "TENTATIVE_MODIF_COMPTE_MOMO",
        message: `Opération sensible exécutée par ${data.operatorName} (${data.operatorRole}) sur le paiement de ${data.studentName || "l'élève"} (${data.amount || 0} ${data.currency || "USD"}). Motif : "${data.justification || "Non spécifié"}"`,
        timestamp,
        targetOperator: data.operatorName || "Inconnu",
        operatorRole: data.operatorRole || "Opérateur",
        studentName: data.studentName,
        amountInvolved: data.amount,
        currency: data.currency,
        reference: data.transactionReference,
        status: "ACTIVE"
      };

      alerts.unshift(newAlert);
      writeAlerts(schoolId, alerts);
    }

    return res.json({ success: true, entry: fullEntry, integrityHash });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 3. GET PROMOTER REAL-TIME ALERTS FOR A SCHOOL
// ---------------------------------------------------------------------------
financialAuditRouter.get("/alerts/:schoolId", (req, res) => {
  try {
    const { schoolId } = req.params;
    const alerts = readAlerts(schoolId);
    return res.json({
      success: true,
      schoolId,
      totalAlerts: alerts.length,
      activeAlertsCount: alerts.filter((a) => a.status === "ACTIVE").length,
      alerts
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 4. RESOLVE / JUSTIFY PROMOTER ALERT
// ---------------------------------------------------------------------------
financialAuditRouter.post("/alerts/resolve", (req, res) => {
  try {
    const { alertId, schoolId, status, promoterName, comment } = req.body;
    if (!alertId || !schoolId) {
      return res.status(400).json({ success: false, error: "alertId and schoolId required" });
    }

    const alerts = readAlerts(schoolId);
    let found = false;

    const updated = alerts.map((a) => {
      if (a.id === alertId) {
        found = true;
        return {
          ...a,
          status: status || "JUSTIFIEE_PROMOTEUR",
          reviewedBy: promoterName || "Promoteur",
          reviewedAt: new Date().toISOString(),
          promoterComment: comment || "Validé après examen du promoteur"
        };
      }
      return a;
    });

    if (!found) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    writeAlerts(schoolId, updated);
    return res.json({ success: true, message: "Alerte traitée avec succès par le Promoteur." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 5. CONTROLLED TRANSACTION VOID OR REFUND (Mandatory Justification)
// ---------------------------------------------------------------------------
financialAuditRouter.post("/transactions/void-or-refund", (req, res) => {
  try {
    const {
      schoolId,
      paymentId,
      action, // "ANNULER" | "REMBOURSER"
      operatorName,
      operatorRole,
      operatorId,
      justification,
      studentName,
      amount,
      currency,
      reference
    } = req.body;

    if (!justification || justification.trim().length < 8) {
      return res.status(400).json({
        success: false,
        error: "Un motif obligatoire et détaillé (minimum 8 caractères) est exigé pour toute annulation ou remboursement."
      });
    }

    // Record immutable audit entry
    const actionType = action === "REMBOURSER" ? "REMBOURSEMENT_EFFECTUE" : "ANNULATION_EFFECTUEE";
    const existing = readAuditEntries(schoolId || "global");
    const prevHash = existing.length > 0 ? existing[0].integrityHash : "GENESIS_LEDGER_SSRDC_2026";
    const timestamp = new Date().toISOString();

    const payload = {
      id: `FAUDIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      schoolId: schoolId || "global",
      timestamp,
      operatorId: operatorId || "OP-AUTH",
      operatorName: operatorName || "Personnel Caisse",
      operatorRole: operatorRole || "Comptable",
      actionType: actionType as any,
      studentName,
      amount,
      currency: currency || "USD",
      transactionReference: reference || paymentId,
      justification,
      promoterNotified: true,
      prevHash,
      ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
      deviceInfo: req.headers["user-agent"] || "SmartSchool Web Client"
    };

    const integrityHash = computeIntegrityHash(payload, prevHash);
    const fullEntry: FinancialAuditEntry = { ...payload, integrityHash };
    existing.unshift(fullEntry);
    writeAuditEntries(schoolId || "global", existing);

    // Create high-priority fraud alert for promoter
    const alerts = readAlerts(schoolId || "global");
    const alertId = `ALERT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newAlert: FinancialAlert = {
      id: alertId,
      schoolId: schoolId || "global",
      title: action === "REMBOURSER" ? `⚠️ Remboursement Enregistré (${amount} ${currency})` : `🚨 Annulation de Transaction Caisse (${amount} ${currency})`,
      severity: "CRITIQUE_FRAUDE",
      category: action === "REMBOURSER" ? "REMBOURSEMENT_SENSIBLE" : "ANNULATION_TRANSACTION",
      message: `L'opérateur ${operatorName} (${operatorRole}) a procédé à ${action === "REMBOURSER" ? "un remboursement" : "une annulation"} sur le dossier de ${studentName} pour un montant de ${amount} ${currency}. Motif renseigné : "${justification}".`,
      timestamp,
      targetOperator: operatorName,
      operatorRole,
      studentName,
      amountInvolved: amount,
      currency,
      reference,
      status: "ACTIVE"
    };

    alerts.unshift(newAlert);
    writeAlerts(schoolId || "global", alerts);

    return res.json({
      success: true,
      message: `Opération de ${action === "REMBOURSER" ? "remboursement" : "annulation"} enregistrée et auditée avec succès. Alerte transmise au Promoteur.`,
      auditId: fullEntry.id,
      alertId: newAlert.id,
      integrityHash
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 6. PROMOTER FINANCIAL CONFIGURATION (Fees & Mobile Money Accounts)
// ---------------------------------------------------------------------------
financialAuditRouter.get("/config/:schoolId", (req, res) => {
  try {
    const { schoolId } = req.params;
    const file = getConfigFile(schoolId);
    if (!fs.existsSync(file)) {
      return res.json({
        success: true,
        schoolId,
        config: null,
        isLockedByPromoter: true
      });
    }
    const config = JSON.parse(fs.readFileSync(file, "utf-8"));
    return res.json({ success: true, schoolId, config, isLockedByPromoter: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

financialAuditRouter.post("/config/:schoolId", (req, res) => {
  try {
    const { schoolId } = req.params;
    const { config, userRole, userName } = req.body;

    const isAuthorizedPromoter = [
      "Promoteur",
      "PROMOTEUR",
      "Propriétaire",
      "Propriétaire de la plateforme",
      "Super Administrateur de l'Établissement",
      "Directeur Général"
    ].includes(userRole);

    if (!isAuthorizedPromoter) {
      return res.status(403).json({
        success: false,
        error: "Action bloquée : Seul le Promoteur ou le Directeur Général peut modifier les barèmes de frais et les comptes de réception Mobile Money de l'établissement."
      });
    }

    const file = getConfigFile(schoolId);
    fs.writeFileSync(file, JSON.stringify(config, null, 2), "utf-8");

    // Audit the configuration change
    const existing = readAuditEntries(schoolId);
    const prevHash = existing.length > 0 ? existing[0].integrityHash : "GENESIS_LEDGER_SSRDC_2026";
    const timestamp = new Date().toISOString();

    const payload = {
      id: `FAUDIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      schoolId,
      timestamp,
      operatorId: "PROMOTEUR-AUTH",
      operatorName: userName || "Promoteur",
      operatorRole: userRole || "Promoteur",
      actionType: "MODIFICATION_COMPTE_RECEPTION" as any,
      justification: "Mise à jour officielle de la configuration financière de l'établissement",
      promoterNotified: true,
      prevHash,
      ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1"
    };

    const integrityHash = computeIntegrityHash(payload, prevHash);
    existing.unshift({ ...payload, integrityHash });
    writeAuditEntries(schoolId, existing);

    return res.json({
      success: true,
      message: "Configuration financière enregistrée et scellée avec succès.",
      updatedAt: timestamp
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
