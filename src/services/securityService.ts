/**
 * SMARTSCHOOL RDC - ENTERPRISE SECURITY & RBAC SERVICE
 * Architecture: Defense in Depth + Zero Trust + Multi-Tenant Isolation + RBAC
 */

import { Role, Student, Payment, Employee, School, Parent } from "../types";

export type SecurityPermission =
  | "students.read"
  | "students.create"
  | "students.update"
  | "students.delete"
  | "teachers.read"
  | "teachers.manage"
  | "hr.read"
  | "hr.manage"
  | "payments.read"
  | "payments.create"
  | "payments.validate"
  | "payments.refund"
  | "finance.read"
  | "finance.configure"
  | "platform.commission.manage"
  | "platform.mobile_money.manage"
  | "owner.security.manage"
  | "owner.control_center.access"
  | "epst.national_registry.read"
  | "epst.provincial_stats.read"
  | "epst.national_stats.read"
  | "backups.manage"
  | "audit_logs.view";

export interface SecurityUserContext {
  id: string;
  username: string;
  role: Role | "Propriétaire" | "Administrateur National EPST" | "Inspecteur Provincial" | "Inspecteur Général";
  tenantId: string; // schoolId
  isOwner?: boolean;
  mfaEnabled?: boolean;
  mfaVerified?: boolean;
  sessionId?: string;
  ipAddress?: string;
  loginTimestamp?: string;
}

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  tenantId: string; // schoolId
  schoolName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: "SUCCESS" | "DENIED" | "BLOCKED" | "WARNING";
  severity: "INFO" | "WARNING" | "CRITICAL";
  ipAddress: string;
  userAgent?: string;
  details?: string;
  riskScore?: number; // 0 to 100
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  category: "MULTI_TENANT_VIOLATION" | "PRIVILEGE_ESCALATION" | "BRUTE_FORCE" | "PAYMENT_TAMPERING" | "IDOR_ATTEMPT" | "UNAUTHORIZED_ACCESS";
  title: string;
  description: string;
  actor: string;
  tenantId: string;
  ipAddress: string;
  status: "ACTIVE" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
  recommendedAction: string;
}

// ---------------------------------------------------------------------------
// RBAC PERMISSION MATRIX (Source of Truth)
// ---------------------------------------------------------------------------
const ROLE_PERMISSIONS: Record<string, SecurityPermission[]> = {
  "Super Admin": [
    "owner.control_center.access",
    "owner.security.manage",
    "platform.commission.manage",
    "platform.mobile_money.manage",
    "backups.manage",
    "audit_logs.view",
    "students.read", "students.create", "students.update", "students.delete",
    "teachers.read", "teachers.manage",
    "hr.read", "hr.manage",
    "payments.read", "payments.create", "payments.validate", "payments.refund",
    "finance.read", "finance.configure",
    "epst.national_registry.read", "epst.provincial_stats.read", "epst.national_stats.read"
  ],
  "Propriétaire": [
    "owner.control_center.access",
    "owner.security.manage",
    "platform.commission.manage",
    "platform.mobile_money.manage",
    "backups.manage",
    "audit_logs.view",
    "students.read", "students.create", "students.update", "students.delete",
    "teachers.read", "teachers.manage",
    "hr.read", "hr.manage",
    "payments.read", "payments.create", "payments.validate", "payments.refund",
    "finance.read", "finance.configure",
    "epst.national_registry.read", "epst.provincial_stats.read", "epst.national_stats.read"
  ],
  "Directeur": [
    "students.read", "students.create", "students.update",
    "teachers.read", "teachers.manage",
    "hr.read", "hr.manage",
    "payments.read", "payments.create", "payments.validate",
    "finance.read", "finance.configure",
    "audit_logs.view"
  ],
  "Préfet": [
    "students.read", "students.create", "students.update",
    "teachers.read",
    "hr.read"
  ],
  "Secrétariat": [
    "students.read", "students.create", "students.update",
    "teachers.read"
  ],
  "Comptable": [
    "payments.read", "payments.create", "payments.validate",
    "finance.read",
    "students.read"
  ],
  "Enseignant": [
    "students.read"
  ],
  "Parent": [
    "students.read",
    "payments.read", "payments.create"
  ],
  "Élève": [
    "students.read"
  ],
  "Inspecteur Provincial": [
    "epst.provincial_stats.read"
  ],
  "Inspecteur Général": [
    "epst.national_stats.read"
  ],
  "Administrateur National EPST": [
    "epst.national_registry.read",
    "epst.provincial_stats.read",
    "epst.national_stats.read"
  ]
};

class SecurityService {
  private auditLogs: SecurityAuditEvent[] = [];
  private threatAlerts: ThreatAlert[] = [];
  private failedAttempts: Record<string, { count: number; lastTime: number }> = {};
  private activeSessions: Map<string, SecurityUserContext> = new Map();

  constructor() {
    this.seedInitialAuditLogs();
  }

  /**
   * Seed baseline audit trail for monitoring
   */
  private seedInitialAuditLogs() {
    this.auditLogs = [
      {
        id: "sec-log-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        actorId: "owner-001",
        actorName: "Ir IT Fred Kalonda (Propriétaire)",
        actorRole: "Propriétaire",
        tenantId: "SYSTEM_GLOBAL",
        schoolName: "SmartSchool RDC Platform",
        action: "INITIALISATION_SYSTEME_SECURITE",
        resource: "SYSTEM_CONFIG",
        result: "SUCCESS",
        severity: "INFO",
        ipAddress: "197.243.12.8",
        details: "Activation du moteur de cyberdéfense Zero Trust et vérification de l'isolation multi-tenant.",
        riskScore: 0
      },
      {
        id: "sec-log-2",
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        actorId: "user-unk-1",
        actorName: "Tentative Inconnue",
        actorRole: "Inconnu",
        tenantId: "SCHOOL_DEMO_01",
        schoolName: "Institut Mwanga",
        action: "CROSS_TENANT_ACCESS_ATTEMPT",
        resource: "FINANCIAL_LEDGER",
        resourceId: "fin-9981",
        result: "BLOCKED",
        severity: "CRITICAL",
        ipAddress: "41.242.105.14",
        details: "Tentative d'accès non autorisé aux données financières de l'école B rejetée par le filtre multi-tenant.",
        riskScore: 95
      }
    ];

    this.threatAlerts = [
      {
        id: "alert-101",
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        severity: "CRITICAL",
        category: "MULTI_TENANT_VIOLATION",
        title: "Tentative de franchissement de frontière Multi-Tenant bloquée",
        description: "L'adresse IP 41.242.105.14 a tenté de solliciter l'API financière de l'établissement 'Complexe Scolaire Saint-Joseph' avec une identité rattachée à 'Institut Mwanga'.",
        actor: "Utilisateur inconnu (IP: 41.242.105.14)",
        tenantId: "SCHOOL_DEMO_02",
        ipAddress: "41.242.105.14",
        status: "ACTIVE",
        recommendedAction: "Vérifier le journal des accès et bloquer l'adresse IP si les tentatives persistent."
      }
    ];
  }

  // ---------------------------------------------------------------------------
  // 1. RBAC & PERMISSION CHECKING
  // ---------------------------------------------------------------------------
  public hasPermission(user: SecurityUserContext | null, permission: SecurityPermission): boolean {
    if (!user) return false;
    // Owner has unrestricted full platform access
    if (user.role === "Propriétaire" || user.isOwner) return true;

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  }

  // ---------------------------------------------------------------------------
  // 2. MULTI-TENANT ISOLATION & IDOR PROTECTION
  // ---------------------------------------------------------------------------
  public validateTenantAccess(
    user: SecurityUserContext | null,
    targetTenantId?: string
  ): { allowed: boolean; reason?: string } {
    if (!user) {
      return { allowed: false, reason: "Session utilisateur non authentifiée." };
    }

    // Platform Owner can navigate across tenants for support/administration
    if (user.role === "Propriétaire" || user.isOwner) {
      return { allowed: true };
    }

    // National EPST Inspectors have read-only statistical aggregate access
    if (
      user.role === "Administrateur National EPST" ||
      user.role === "Inspecteur Général" ||
      user.role === "Inspecteur Provincial"
    ) {
      return { allowed: true };
    }

    // Strict Tenant Boundary Check
    if (targetTenantId && user.tenantId && user.tenantId !== targetTenantId) {
      this.recordThreatAlert({
        severity: "CRITICAL",
        category: "MULTI_TENANT_VIOLATION",
        title: "Tentative d'accès Inter-Établissements (Multi-Tenant)",
        description: `L'utilisateur ${user.username} (${user.role}) du tenant ${user.tenantId} a tenté d'accéder aux données du tenant ${targetTenantId}.`,
        actor: user.username,
        tenantId: targetTenantId,
        ipAddress: user.ipAddress || "127.0.0.1",
        recommendedAction: "Conserver l'événement dans le journal d'audit et suspendre la session en cas de récidive."
      });

      this.logSecurityEvent({
        actorId: user.id,
        actorName: user.username,
        actorRole: user.role,
        tenantId: user.tenantId,
        action: "MULTI_TENANT_CROSSING_DENIED",
        resource: "TENANT_BOUNDARY",
        resourceId: targetTenantId,
        result: "BLOCKED",
        severity: "CRITICAL",
        ipAddress: user.ipAddress || "127.0.0.1",
        details: `Violation de frontière multi-tenant bloquée: Attaque IDOR empêchée.`
      });

      return {
        allowed: false,
        reason: "Accès refusé. Vous n'êtes pas autorisé à consulter ou modifier les données d'un autre établissement."
      };
    }

    return { allowed: true };
  }

  /**
   * Validates resource-level IDOR/BOLA ownership
   */
  public validateResourceOwnership<T extends { schoolId?: string; tenantId?: string; parentId?: string; studentId?: string }>(
    user: SecurityUserContext | null,
    resource: T,
    resourceName: string
  ): boolean {
    if (!user) return false;
    if (user.role === "Propriétaire" || user.isOwner) return true;

    const resourceTenant = resource.tenantId || resource.schoolId;
    
    // 1. Tenant Check
    const tenantCheck = this.validateTenantAccess(user, resourceTenant);
    if (!tenantCheck.allowed) return false;

    // 2. Parent-Student IDOR check
    if (user.role === "Parent" && resource.parentId) {
      if (resource.parentId !== user.id) {
        this.logSecurityEvent({
          actorId: user.id,
          actorName: user.username,
          actorRole: user.role,
          tenantId: user.tenantId,
          action: "IDOR_PARENT_RESOURCE_DENIED",
          resource: resourceName,
          result: "DENIED",
          severity: "WARNING",
          ipAddress: user.ipAddress || "127.0.0.1",
          details: `Un parent a tenté d'accéder au dossier d'un autre enfant.`
        });
        return false;
      }
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // 3. AUTHENTICATION, PASSWORD POLICY & BRUTE-FORCE PROTECTION
  // ---------------------------------------------------------------------------
  public validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Le mot de passe doit contenir au moins 8 caractères.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une lettre majuscule.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre.");
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un caractère spécial.");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Tracks failed login attempts to prevent brute-force attacks
   */
  public checkBruteForceLockout(ipOrUsername: string): { lockedOut: boolean; remainingSeconds?: number } {
    const record = this.failedAttempts[ipOrUsername];
    if (!record) return { lockedOut: false };

    const LOCKOUT_WINDOW = 15 * 60 * 1000; // 15 minutes
    const MAX_ATTEMPTS = 5;

    if (record.count >= MAX_ATTEMPTS) {
      const elapsed = Date.now() - record.lastTime;
      if (elapsed < LOCKOUT_WINDOW) {
        const remainingSeconds = Math.ceil((LOCKOUT_WINDOW - elapsed) / 1000);
        return { lockedOut: true, remainingSeconds };
      } else {
        // Reset after lockout window expires
        delete this.failedAttempts[ipOrUsername];
        return { lockedOut: false };
      }
    }

    return { lockedOut: false };
  }

  public recordFailedLoginAttempt(ipOrUsername: string, username: string, ipAddress: string) {
    const now = Date.now();
    const current = this.failedAttempts[ipOrUsername] || { count: 0, lastTime: now };
    current.count += 1;
    current.lastTime = now;
    this.failedAttempts[ipOrUsername] = current;

    this.logSecurityEvent({
      actorId: "ANONYMOUS",
      actorName: username,
      actorRole: "ANONYMOUS",
      tenantId: "UNKNOWN",
      action: "LOGIN_FAILED",
      resource: "AUTHENTICATION",
      result: "DENIED",
      severity: current.count >= 3 ? "WARNING" : "INFO",
      ipAddress: ipAddress,
      details: `Échec d'authentification (${current.count}/5 tentatives).`
    });

    if (current.count >= 5) {
      this.recordThreatAlert({
        severity: "WARNING",
        category: "BRUTE_FORCE",
        title: "Attaque Brute-Force suspectée",
        description: `5 échecs consécutifs de connexion détectés pour le compte '${username}' depuis l'adresse IP ${ipAddress}. Compte temporairement verrouillé pendant 15 minutes.`,
        actor: username,
        tenantId: "UNKNOWN",
        ipAddress: ipAddress,
        recommendedAction: "Vérifier la légitimité de la connexion et inciter l'utilisateur à réinitialiser son mot de passe."
      });
    }
  }

  public resetFailedLoginAttempts(ipOrUsername: string) {
    delete this.failedAttempts[ipOrUsername];
  }

  // ---------------------------------------------------------------------------
  // 4. SECURE PAYMENT ENGINE & COMMISSION PROTECTION
  // ---------------------------------------------------------------------------
  public calculatePaymentDistribution(
    totalAmountUSD: number,
    customSchoolRatePercent?: number
  ): { totalAmount: number; platformCommissionPercent: number; platformCommissionUSD: number; schoolShareUSD: number } {
    const defaultRate = 2.0; // 2% SmartSchool commission default
    const commissionRate = typeof customSchoolRatePercent === "number" ? customSchoolRatePercent : defaultRate;
    
    // Server-side rounding to prevent float manipulation
    const platformCommissionUSD = Math.round((totalAmountUSD * (commissionRate / 100)) * 100) / 100;
    const schoolShareUSD = Math.round((totalAmountUSD - platformCommissionUSD) * 100) / 100;

    return {
      totalAmount: totalAmountUSD,
      platformCommissionPercent: commissionRate,
      platformCommissionUSD,
      schoolShareUSD
    };
  }

  /**
   * Protects financial transactions from client-side status tampering
   */
  public validateFinancialTransaction(
    user: SecurityUserContext,
    paymentData: {
      studentId: string;
      schoolId: string;
      amountUSD: number;
      claimedStatus?: string;
      reference?: string;
    }
  ): { isValid: boolean; distribution?: ReturnType<typeof this.calculatePaymentDistribution>; error?: string } {
    // 1. Tenant Check
    const tenantValid = this.validateTenantAccess(user, paymentData.schoolId);
    if (!tenantValid.allowed) {
      return { isValid: false, error: tenantValid.reason };
    }

    // 2. Client Status Injection Check
    if (paymentData.claimedStatus === "SUCCESS" && !user.isOwner && user.role !== "Comptable" && user.role !== "Directeur") {
      this.recordThreatAlert({
        severity: "CRITICAL",
        category: "PAYMENT_TAMPERING",
        title: "Tentative de validation de paiement frauduleuse détectée",
        description: `L'utilisateur ${user.username} (${user.role}) a tenté de forcer le statut 'SUCCESS' sur un paiement sans validation bancaire/gateway.`,
        actor: user.username,
        tenantId: paymentData.schoolId,
        ipAddress: user.ipAddress || "127.0.0.1",
        recommendedAction: "Auditer immédiatement le compte utilisateur et rejeter la transaction."
      });
      return { isValid: false, error: "Validation de paiement refusée: Seul le serveur ou le passerelle de paiement peut confirmer un paiement." };
    }

    // 3. Amount sanity check
    if (paymentData.amountUSD <= 0 || isNaN(paymentData.amountUSD)) {
      return { isValid: false, error: "Le montant du paiement doit être un nombre positif supérieur à zéro." };
    }

    const distribution = this.calculatePaymentDistribution(paymentData.amountUSD);
    return { isValid: true, distribution };
  }

  // ---------------------------------------------------------------------------
  // 5. SECURITY AUDIT LOGS & THREAT ALERTING SYSTEM
  // ---------------------------------------------------------------------------
  public logSecurityEvent(event: Omit<SecurityAuditEvent, "id" | "timestamp">): SecurityAuditEvent {
    const fullLog: SecurityAuditEvent = {
      ...event,
      id: `sec-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(fullLog);
    if (this.auditLogs.length > 500) this.auditLogs.pop(); // Keep last 500 logs in memory
    return fullLog;
  }

  public recordThreatAlert(alert: Omit<ThreatAlert, "id" | "timestamp" | "status">): ThreatAlert {
    const fullAlert: ThreatAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      status: "ACTIVE"
    };
    this.threatAlerts.unshift(fullAlert);
    return fullAlert;
  }

  public registerActiveSession(session: SecurityUserContext) {
    this.activeSessions.set(session.id, session);
    this.logSecurityEvent({
      actorId: session.id,
      actorName: session.username,
      actorRole: session.role,
      tenantId: session.tenantId,
      action: "SESSION_AUTHENTICATED",
      resource: "IAM_AUTH_GATEWAY",
      result: "SUCCESS",
      severity: "INFO",
      ipAddress: session.ipAddress || "197.234.221.14",
      details: `Authentification réussie pour ${session.username} (${session.role}) sur l'infrastructure souveraine.`
    });
  }

  public getActiveSession(userId: string): SecurityUserContext | undefined {
    return this.activeSessions.get(userId);
  }

  public clearActiveSession(userId: string) {
    this.activeSessions.delete(userId);
  }

  public getAuditLogs(): SecurityAuditEvent[] {
    return [...this.auditLogs];
  }

  public getThreatAlerts(): ThreatAlert[] {
    return [...this.threatAlerts];
  }

  public resolveThreatAlert(alertId: string, status: "RESOLVED" | "DISMISSED"): boolean {
    const alert = this.threatAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      return true;
    }
    return false;
  }
}

export const securityService = new SecurityService();
