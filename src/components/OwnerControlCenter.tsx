import React, { useState, useEffect, useMemo } from "react";
import {
  Crown,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Users,
  Building2,
  Sliders,
  CheckSquare,
  Square,
  AlertTriangle,
  Power,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Search,
  Filter,
  Lock,
  Unlock,
  FileText,
  Download,
  Upload,
  Printer,
  Share2,
  MessageSquare,
  Eye,
  EyeOff,
  UserPlus,
  Landmark,
  Activity,
  Check,
  X,
  RefreshCw,
  FileCheck,
  Archive,
  HelpCircle,
  Send,
  Database,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Zap,
  RotateCcw,
  Lightbulb,
  DollarSign,
  Code,
  Globe,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Camera,
  ArrowRight,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OwnerDashboardOverview } from "./owner/OwnerDashboardOverview";
import { SmartSchoolLogo } from "./SmartSchoolLogo";
import { OwnerSupportModule } from "./owner/OwnerSupportModule";
import { OwnerSuggestionsModule } from "./owner/OwnerSuggestionsModule";
import { OwnerUpdatesModule } from "./owner/OwnerUpdatesModule";
import { OwnerFinancialModule } from "./owner/OwnerFinancialModule";
import { OwnerTrialsModule } from "./owner/OwnerTrialsModule";
import { OwnerServerMonitorModule } from "./owner/OwnerServerMonitorModule";
import { OwnerCommunicationModule } from "./owner/OwnerCommunicationModule";
import { OwnerDeveloperModule } from "./owner/OwnerDeveloperModule";
import { OwnerNationalStatsModule } from "./owner/OwnerNationalStatsModule";
import { OwnerSecurityAlertsModule } from "./owner/OwnerSecurityAlertsModule";
import { OwnerStaffManagementModule } from "./owner/OwnerStaffManagementModule";
import { MissingPhotosAuditDashboard } from "./owner/MissingPhotosAuditDashboard";
import { PlatformStaffPortalView } from "./owner/PlatformStaffPortalView";
import { ManageSchoolsModule } from "./ManageSchoolsModule";
import { OwnerVisualIdentityModule } from "./owner/OwnerVisualIdentityModule";
import { School, UserAccount, Student, Employee, Teacher, PlatformStaffMember } from "../types";
import { safeLocalStorage, safeCopyToClipboard, getSafeOrigin } from "../utils/safeStorage";
import { persistUniversalUserAccount } from "../services/accountActivationService";
import { registerSecondaryUserWithFirebase } from "../services/firebase";

// ROLES LIST (15 ROLES)
export const ALL_SYSTEM_ROLES = [
  "Propriétaire",
  "Super Administrateur",
  "Promoteur",
  "Directeur",
  "Préfet des Études",
  "Enseignant",
  "Comptable",
  "Caissier",
  "Secrétaire",
  "Bibliothécaire",
  "Personnel",
  "Parent",
  "Élève",
  "Inspecteur",
  "Administration Nationale"
] as const;

export const OWNER_SECURITY_CAPABILITIES = [
  { id: "canChangePassword", label: "Modifier son mot de passe" },
  { id: "canResetPassword", label: "Réinitialiser son mot de passe" },
  { id: "canEditSecurityQuestions", label: "Modifier ses questions de sécurité" },
  { id: "canEditEmail", label: "Modifier son adresse e-mail" },
  { id: "canEditPhone", label: "Modifier son numéro de téléphone" },
  { id: "canEnable2FA", label: "Activer l'authentification à deux facteurs (2FA)" },
  { id: "canManageDevices", label: "Gérer les appareils connectés" },
  { id: "canLogoutAllDevices", label: "Se déconnecter de tous les appareils" }
] as const;

export type SystemRoleType = typeof ALL_SYSTEM_ROLES[number];

// GRANULAR ACTIONS (15 ACTIONS)
export const ALL_GRANULAR_ACTIONS = [
  "Voir",
  "Ajouter",
  "Modifier",
  "Supprimer",
  "Imprimer",
  "Télécharger",
  "Exporter",
  "Importer",
  "Valider",
  "Publier",
  "Commenter",
  "Partager",
  "Créer",
  "Désactiver",
  "Activer"
] as const;

export type GranularActionType = typeof ALL_GRANULAR_ACTIONS[number];

// PATRIMOINE SPECIFIC ACTIONS (15 SPECIFIC PERMISSIONS)
export const HERITAGE_SPECIFIC_PERMISSIONS = [
  "Consulter",
  "Ajouter des contenus",
  "Modifier",
  "Supprimer",
  "Publier",
  "Télécharger",
  "Imprimer",
  "Commenter",
  "Proposer des corrections",
  "Ajouter des photos",
  "Ajouter des vidéos",
  "Ajouter des documents",
  "Ajouter des références",
  "Gérer les catégories",
  "Valider les publications"
] as const;

export type HeritagePermissionType = typeof HERITAGE_SPECIFIC_PERMISSIONS[number];

// SYSTEM MODULES LIST
export const SYSTEM_MODULES = [
  { id: "culture_patrimoine_rdc", label: "Patrimoine & Culture RDC", category: "Éducation & Souveraineté" },
  { id: "messagerie", label: "Messagerie & Tchat Interne", category: "Communication" },
  { id: "paiements", label: "Paiements & Minerval", category: "Finance" },
  { id: "national_jobs", label: "Offres d'Emploi RDC", category: "Ressources Humaines" },
  { id: "downloads", label: "Téléchargements & Impressions PDF", category: "Documents" },
  { id: "student_parent_portals", label: "Portails Élèves & Parents", category: "Portails" },
  { id: "virtual_classroom", label: "Classe Virtuelle & Visio", category: "Pédagogie" },
  { id: "inter_school_network", label: "Réseau Interscolaire RDC", category: "Réseau" },
  { id: "grades_bulletins", label: "Notes & Bulletins Scolaires", category: "Évaluation" },
  { id: "saas_management", label: "Gestion SaaS & Établissements", category: "Administration" }
];

export interface EmergencyKillSwitch {
  id: string;
  name: string;
  category: string;
  disabled: boolean;
  message: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ModerationItem {
  id: string;
  title: string;
  type: "Patrimoine" | "Culture" | "Article" | "Photo" | "Document" | "Vidéo";
  authorName: string;
  authorRole: string;
  schoolName: string;
  submittedAt: string;
  category: string;
  summary: string;
  status: "pending" | "approved" | "rejected" | "archived";
  rejectionReason?: string;
}

export interface AuditRecord {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  schoolName: string;
}

import { Payment } from "../types";

interface OwnerControlCenterProps {
  userRole?: string;
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
  payments?: Payment[];
  schools?: School[];
  userAccounts?: UserAccount[];
  students?: Student[];
  employees?: Employee[];
  teachers?: Teacher[];
  onToggleSchoolStatus?: (schoolId: string, isSuspended: boolean) => void;
  onUpdateUserAccount?: (accountId: string, updates: Partial<UserAccount>) => void;
  onAddSchool?: (school: School) => void;
  onRegisterSchoolAccount?: (account: UserAccount) => void;
  onOpenSchoolPortal?: (schoolId: string, account?: UserAccount) => void;
  onSendMessageToSchools?: (messagePayload: {
    targetSchoolId: string;
    targetSchoolName: string;
    subject: string;
    message: string;
    channel: string;
    priority: string;
  }) => void;
}

export function OwnerControlCenter({
  userRole = "Propriétaire de la plateforme",
  userName = "Propriétaire SmartSchool RDC",
  onAuditLog,
  payments,
  schools = [],
  userAccounts = [],
  students = [],
  employees = [],
  teachers = [],
  onToggleSchoolStatus,
  onUpdateUserAccount,
  onAddSchool,
  onRegisterSchoolAccount,
  onOpenSchoolPortal,
  onSendMessageToSchools
}: OwnerControlCenterProps) {

  // Active Sub-tab
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "visual_identity"
    | "manage_schools"
    | "cyberdefense"
    | "partner_onboarding"
    | "support"
    | "suggestions"
    | "updates"
    | "financial"
    | "trials"
    | "servers"
    | "communication"
    | "developer"
    | "national_stats"
    | "emergency"
    | "global_matrix"
    | "heritage_matrix"
    | "moderation"
    | "total_control"
    | "audit_log"
    | "security_matrix"
    | "internal_users"
    | "missing_photos"
    | "staff_portal_preview"
  >("overview");

  const [previewStaffMember, setPreviewStaffMember] = useState<PlatformStaffMember | null>(null);

  // Owner Password Change Modal State
  const [showOwnerPasswordModal, setShowOwnerPasswordModal] = useState(false);
  const [currentOwnerPassInput, setCurrentOwnerPassInput] = useState("");
  const [newOwnerPassInput, setNewOwnerPassInput] = useState("");
  const [confirmOwnerPassInput, setConfirmOwnerPassInput] = useState("");
  const [showOwnerPass, setShowOwnerPass] = useState(false);

  // Owner Contact Info State
  const [ownerPhone, setOwnerPhone] = useState("0994202940");
  const [ownerEmail, setOwnerEmail] = useState("fredtech37@gmail.com");

  // Internal Users State
  const [internalUsersList, setInternalUsersList] = useState<Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: "Actif" | "Inactif";
    createdAt: string;
  }>>(() => {
    const saved = safeLocalStorage.getItem("ss_internal_users_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: "usr-1", name: "Prof. Alphonse Mukendi", email: "mukendi@lasagesse.cd", phone: "+243 812 345 678", role: "Directeur", status: "Actif", createdAt: "2026-08-01" },
      { id: "usr-2", name: "Ir Jean-Paul Kabamba", email: "kabamba@lasagesse.cd", phone: "+243 998 765 432", role: "Préfet des Études", status: "Actif", createdAt: "2026-08-02" },
      { id: "usr-3", name: "Mme Marie-Thérèse Bondo", email: "bondo@lasagesse.cd", phone: "+243 897 112 233", role: "Comptable", status: "Actif", createdAt: "2026-08-03" },
      { id: "usr-4", name: "M. Patrick Kasongo", email: "kasongo@lasagesse.cd", phone: "+243 822 445 566", role: "Secrétaire", status: "Actif", createdAt: "2026-08-04" },
      { id: "usr-5", name: "Mme Christine Ilunga", email: "ilunga@lasagesse.cd", phone: "+243 810 998 877", role: "Enseignant", status: "Actif", createdAt: "2026-08-05" },
      { id: "usr-6", name: "M. Christian Tshimanga", email: "tshimanga@lasagesse.cd", phone: "+243 990 334 455", role: "Caissier", status: "Actif", createdAt: "2026-08-06" }
    ];
  });

  // Internal User Modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userFormName, setUserFormName] = useState("");
  const [userFormEmail, setUserFormEmail] = useState("");
  const [userFormPhone, setUserFormPhone] = useState("");
  const [userFormRole, setUserFormRole] = useState("Enseignant");
  const [userFormPassword, setUserFormPassword] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Search queries
  const [matrixSearchRole, setMatrixSearchRole] = useState<string>("");
  const [matrixSearchModule, setMatrixSearchModule] = useState<string>("Tous");
  const [moderationFilterStatus, setModerationFilterStatus] = useState<string>("all");

  // Emergency Kill Switches State (Default all enabled)
  const [killSwitches, setKillSwitches] = useState<Record<string, EmergencyKillSwitch>>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_kill_switches_data");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const initial: Record<string, EmergencyKillSwitch> = {};
    SYSTEM_MODULES.forEach((mod) => {
      initial[mod.id] = {
        id: mod.id,
        name: mod.label,
        category: mod.category,
        disabled: false,
        message: "Cette fonctionnalité est temporairement désactivée par le Propriétaire de SmartSchool RDC pour maintenance ou régulation.",
        updatedAt: new Date().toLocaleDateString("fr-FR"),
        updatedBy: userName
      };
    });
    return initial;
  });

  // Global Features Permissions Matrix State
  // Structure: { [moduleId]: { [role]: { [action]: boolean } } }
  const [globalMatrix, setGlobalMatrix] = useState<Record<string, Record<string, Record<string, boolean>>>>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_global_permissions_matrix");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const initial: Record<string, Record<string, Record<string, boolean>>> = {};
    SYSTEM_MODULES.forEach((mod) => {
      initial[mod.id] = {};
      ALL_SYSTEM_ROLES.forEach((role) => {
        initial[mod.id][role] = {};
        ALL_GRANULAR_ACTIONS.forEach((action) => {
          // Default rule: Admins & Directors have true, Students/Parents have limited true
          if (["Super Administrateur", "Promoteur", "Directeur", "Préfet", "Administration Nationale"].includes(role)) {
            initial[mod.id][role][action] = true;
          } else if (["Élève", "Parent"].includes(role)) {
            initial[mod.id][role][action] = ["Voir", "Télécharger", "Imprimer", "Commenter"].includes(action);
          } else {
            initial[mod.id][role][action] = !["Supprimer", "Désactiver", "Activer"].includes(action);
          }
        });
      });
    });
    return initial;
  });

  // Heritage Specific Permissions Matrix State
  // Structure: { [role]: { [permission]: boolean } }
  const [heritageMatrix, setHeritageMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_heritage_permissions_matrix");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const initial: Record<string, Record<string, boolean>> = {};
    ALL_SYSTEM_ROLES.forEach((role) => {
      initial[role] = {};
      HERITAGE_SPECIFIC_PERMISSIONS.forEach((perm) => {
        if (["Super Administrateur", "Promoteur", "Directeur", "Administration Nationale"].includes(role)) {
          initial[role][perm] = true;
        } else if (role === "Enseignant") {
          initial[role][perm] = !["Supprimer", "Gérer les catégories"].includes(perm);
        } else if (role === "Élève" || role === "Parent") {
          initial[role][perm] = ["Consulter", "Télécharger", "Imprimer", "Commenter", "Proposer des corrections"].includes(perm);
        } else {
          initial[role][perm] = ["Consulter", "Télécharger", "Imprimer", "Commenter", "Proposer des corrections", "Ajouter des photos", "Ajouter des documents"].includes(perm);
        }
      });
    });
    return initial;
  });

  // Owner Security & Password Permissions Matrix State
  // Structure: { [role]: { [capabilityId]: boolean } }
  const [securityMatrix, setSecurityMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_security_permissions");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const initial: Record<string, Record<string, boolean>> = {};
    ALL_SYSTEM_ROLES.forEach((role) => {
      initial[role] = {
        canChangePassword: true,
        canResetPassword: true,
        canEditSecurityQuestions: true,
        canEditEmail: true,
        canEditPhone: true,
        canEnable2FA: true,
        canManageDevices: true,
        canLogoutAllDevices: true
      };
    });
    return initial;
  });

  // Password Policy Rules
  const [securityPolicy, setSecurityPolicy] = useState(() => {
    const saved = safeLocalStorage.getItem("ss_owner_security_policy");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    };
  });

  // Moderation Queue State
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_moderation_items");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Owner Audit Logs
  const [ownerLogs, setOwnerLogs] = useState<AuditRecord[]>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_audit_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "log-001",
        actorName: userName,
        actorRole: userRole,
        action: "Initialisation du Centre de Contrôle du Propriétaire",
        details: "Activation de la matrice globale des autorisations et des coupe-circuits d'urgence.",
        timestamp: "2026-08-09 08:00:00",
        ipAddress: "10.0.0.1 (IP Réservée Propriétaire)",
        schoolName: "Plateforme Nationale SmartSchool RDC"
      }
    ];
  });

  // Feedback Toast Message
  const [toastMsg, setToastMsg] = useState<string>("");

  // Sync state to LocalStorage & window trigger for instant application
  useEffect(() => {
    safeLocalStorage.setItem("ss_owner_kill_switches_data", JSON.stringify(killSwitches));
    // Save simpler boolean map for quick module checking
    const quickMap: Record<string, boolean> = {};
    Object.keys(killSwitches).forEach((k) => {
      quickMap[k] = killSwitches[k].disabled;
    });
    safeLocalStorage.setItem("ss_owner_kill_switches", JSON.stringify(quickMap));
  }, [killSwitches]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_owner_global_permissions_matrix", JSON.stringify(globalMatrix));
  }, [globalMatrix]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_owner_heritage_permissions_matrix", JSON.stringify(heritageMatrix));
  }, [heritageMatrix]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_owner_security_permissions", JSON.stringify(securityMatrix));
  }, [securityMatrix]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_owner_security_policy", JSON.stringify(securityPolicy));
  }, [securityPolicy]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_owner_moderation_items", JSON.stringify(moderationItems));
  }, [moderationItems]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_owner_audit_logs", JSON.stringify(ownerLogs));
  }, [ownerLogs]);

  // Helper to log audit
  const addOwnerAuditLog = (action: string, details: string) => {
    const newRecord: AuditRecord = {
      id: `log-${Date.now()}`,
      actorName: userName,
      actorRole: userRole,
      action,
      details,
      timestamp: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR"),
      ipAddress: "10.0.0.1 (IP Propriétaire)",
      schoolName: "Toutes Écoles RDC"
    };
    setOwnerLogs((prev) => [newRecord, ...prev]);

    if (onAuditLog) {
      onAuditLog(action, details);
    }
  };

  // Toggle Emergency Kill Switch Action
  const toggleEmergencySwitch = (moduleId: string) => {
    const current = killSwitches[moduleId];
    if (!current) return;
    const updatedDisabled = !current.disabled;
    const updatedItem = {
      ...current,
      disabled: updatedDisabled,
      updatedAt: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR"),
      updatedBy: userName
    };

    setKillSwitches((prev) => ({ ...prev, [moduleId]: updatedItem }));

    const actionText = updatedDisabled ? "DÉSACTIVATION D'URGENCE" : "RÉACTIVATION DU SERVICE";
    addOwnerAuditLog(
      `${actionText} : ${current.name}`,
      `Le module '${current.name}' est désormais ${updatedDisabled ? "HORS-LIGNE (Désactivé)" : "EN LIGNE (Opérationnel)"} sur toute la plateforme.`
    );

    setToastMsg(`Statut du module '${current.name}' mis à jour : ${updatedDisabled ? "Désactivé en Urgence" : "Rétabli avec succès"}`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Bulk Emergency Actions
  const handleBulkEmergency = (disableAll: boolean) => {
    const confirmText = disableAll
      ? "ATTENTION ! Voulez-vous DÉSACTIVER TOUS LES MODULES de la plateforme en mode d'urgence ?"
      : "Voulez-vous RÉTABLIR ET ACTIVER TOUS LES MODULES de la plateforme ?";
    
    if (window.confirm(confirmText)) {
      setKillSwitches((prev) => {
        const nextState = { ...prev };
        Object.keys(nextState).forEach((key) => {
          nextState[key] = {
            ...nextState[key],
            disabled: disableAll,
            updatedAt: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR"),
            updatedBy: userName
          };
        });
        return nextState;
      });

      addOwnerAuditLog(
        disableAll ? "COUPE-CIRCUIT GLOBAL ACTIVÉ" : "RESTAURATION GLOBALE ACTIVÉE",
        disableAll ? "Tous les modules ont été désactivés en mode d'urgence." : "Tous les modules ont été réactivés."
      );

      setToastMsg(disableAll ? "Alerte : Tous les modules sont désactivés !" : "Succès : Tous les modules sont en ligne !");
      setTimeout(() => setToastMsg(""), 4000);
    }
  };

  // Toggle Single Action in Global Matrix
  const toggleGlobalMatrixCell = (moduleId: string, role: string, action: string) => {
    const currentVal = globalMatrix[moduleId]?.[role]?.[action] ?? false;
    const newVal = !currentVal;

    setGlobalMatrix((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [role]: {
          ...prev[moduleId]?.[role],
          [action]: newVal
        }
      }
    }));

    addOwnerAuditLog(
      "Mise à jour Permission Globale",
      `Module: '${moduleId}', Rôle: '${role}', Action: '${action}' -> ${newVal ? "AUTORISÉ" : "INTERDIT"}.`
    );
  };

  // Toggle Single Heritage Specific Permission
  const toggleHeritageCell = (role: string, perm: string) => {
    const currentVal = heritageMatrix[role]?.[perm] ?? false;
    const newVal = !currentVal;

    setHeritageMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: newVal
      }
    }));

    addOwnerAuditLog(
      "Mise à jour Permission Patrimoine RDC",
      `Rôle: '${role}', Droit Patrimoine: '${perm}' -> ${newVal ? "ACCORDÉ" : "RESTREINT"}.`
    );
  };

  // Bulk Master Toggle for Heritage Permissions per Role
  const toggleHeritageRoleAll = (role: string, enableAll: boolean) => {
    const newRoleObj: Record<string, boolean> = {};
    HERITAGE_SPECIFIC_PERMISSIONS.forEach((p) => {
      newRoleObj[p] = enableAll;
    });

    setHeritageMatrix((prev) => ({
      ...prev,
      [role]: newRoleObj
    }));

    addOwnerAuditLog(
      "Modification Masse Patrimoine",
      `Tous les droits Patrimoine RDC pour le rôle '${role}' ont été définis sur ${enableAll ? "ACCORDÉS" : "RESTREINTS"}.`
    );
  };

  // Toggle Single Security Matrix Capability Cell
  const toggleSecurityCell = (role: string, capId: string) => {
    const currentVal = securityMatrix[role]?.[capId] ?? true;
    const newVal = !currentVal;

    setSecurityMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [capId]: newVal
      }
    }));

    addOwnerAuditLog(
      "Mise à jour Habilitation Sécurité",
      `Rôle: '${role}', Fonctionnalité Sécurité: '${capId}' -> ${newVal ? "ACTIVÉ" : "DÉSACTIVÉ"}.`
    );
  };

  // Bulk Master Toggle for Security Permissions per Role
  const toggleSecurityRoleAll = (role: string, enableAll: boolean) => {
    const newRoleObj: Record<string, boolean> = {};
    OWNER_SECURITY_CAPABILITIES.forEach((cap) => {
      newRoleObj[cap.id] = enableAll;
    });

    setSecurityMatrix((prev) => ({
      ...prev,
      [role]: newRoleObj
    }));

    addOwnerAuditLog(
      "Modification Masse Sécurité Rôle",
      `Toutes les options de sécurité pour le rôle '${role}' ont été définies sur ${enableAll ? "AUTORISÉES" : "DÉSACTIVÉES"}.`
    );
  };

  // Moderation Item Action (Approve / Reject / Archive)
  const handleModerationAction = (itemId: string, newStatus: "approved" | "rejected" | "archived", reason?: string) => {
    setModerationItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: newStatus,
            rejectionReason: reason || item.rejectionReason
          };
        }
        return item;
      })
    );

    const targetItem = moderationItems.find((i) => i.id === itemId);
    addOwnerAuditLog(
      `Modération Contenu (${newStatus.toUpperCase()})`,
      `Article '${targetItem?.title}' proposé par ${targetItem?.authorName} (${targetItem?.schoolName}) a été ${newStatus === "approved" ? "APPROUVÉ ET PUBLIÉ" : newStatus === "rejected" ? "REFUSÉ" : "ARCHIVÉ"}.`
    );

    setToastMsg(`Statut du contenu mis à jour : ${newStatus.toUpperCase()}`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Handle Owner Password Change
  const handleSaveOwnerPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOwnerPassInput) {
      setToastMsg("Veuillez saisir votre mot de passe actuel.");
      return;
    }
    if (newOwnerPassInput.length < 6) {
      setToastMsg("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newOwnerPassInput !== confirmOwnerPassInput) {
      setToastMsg("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      const currentConfig = {
        name: userName || "Ir IT Fred Kalonda",
        email: ownerEmail,
        phone: ownerPhone,
        password: newOwnerPassInput,
        masterKey: "KEY-SS-RDC-2026-OWNER"
      };
      safeLocalStorage.setItem("ss_platform_owner_data", JSON.stringify(currentConfig));
      addOwnerAuditLog("Changement Mot de Passe Propriétaire", "Le Propriétaire de la plateforme a mis à jour son mot de passe principal.");
      setToastMsg("✅ Votre mot de passe Propriétaire a été mis à jour et sauvegardé avec succès !");
      setShowOwnerPasswordModal(false);
      setCurrentOwnerPassInput("");
      setNewOwnerPassInput("");
      setConfirmOwnerPassInput("");
    } catch (e) {
      console.error(e);
      setToastMsg("Erreur lors de la sauvegarde du mot de passe.");
    }
  };

  // Internal User Management Handlers
  const handleSaveInternalUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormName || !userFormEmail) {
      setToastMsg("Veuillez remplir au moins le nom et l'adresse e-mail.");
      return;
    }

    if (editingUser) {
      setInternalUsersList(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        name: userFormName,
        email: userFormEmail,
        phone: userFormPhone || "+243 800 000 000",
        role: userFormRole
      } : u));
      addOwnerAuditLog("Modification Utilisateur Interne", `Mise à jour du rôle et coordonnées pour ${userFormName} (${userFormRole})`);
      setToastMsg(`✅ Utilisateur ${userFormName} modifié avec succès !`);
    } else {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: userFormName,
        email: userFormEmail,
        phone: userFormPhone || "+243 800 000 000",
        role: userFormRole,
        status: "Actif" as const,
        createdAt: new Date().toISOString().split("T")[0]
      };
      setInternalUsersList(prev => [newUser, ...prev]);
      addOwnerAuditLog("Création Utilisateur Interne", `Nouveau compte créé pour ${userFormName} avec le rôle ${userFormRole}`);
      setToastMsg(`✅ Utilisateur ${userFormName} créé avec succès !`);
    }

    setShowAddUserModal(false);
    setEditingUser(null);
    setUserFormName("");
    setUserFormEmail("");
    setUserFormPhone("");
    setUserFormRole("Enseignant");
    setUserFormPassword("");
  };

  const handleDeleteInternalUser = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte interne de ${name} ?`)) {
      setInternalUsersList(prev => prev.filter(u => u.id !== id));
      addOwnerAuditLog("Suppression Utilisateur Interne", `Suppression du compte de ${name}`);
      setToastMsg(`Compte de ${name} supprimé avec succès.`);
    }
  };

  const handleToggleInternalUserStatus = (id: string) => {
    setInternalUsersList(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Actif" ? "Inactif" : "Actif" } : u));
  };

  // Moderated Items Stats
  const pendingCount = moderationItems.filter((i) => i.status === "pending").length;
  const approvedCount = moderationItems.filter((i) => i.status === "approved").length;
  const rejectedCount = moderationItems.filter((i) => i.status === "rejected").length;

  return (
    <div className="space-y-6 text-left" id="owner-control-center">
      
      {/* OWNER HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900 text-white p-6 rounded-3xl shadow-2xl border-2 border-amber-500/60 relative overflow-hidden space-y-4">
        
        {/* Glow & Pattern Effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                <Crown className="h-4 w-4" /> CENTRE DE CONTRÔLE DU PROPRIÉTAIRE
              </span>
              <span className="bg-red-500/20 text-red-300 font-mono text-xs px-2.5 py-0.5 rounded-md border border-red-500/40 font-bold flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> Pouvoir Suprême & Contrôle Total
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-amber-200">
              SmartSchool RDC • Administration Souveraine Plateforme
            </h2>

            <p className="text-xs lg:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Supervision globale de tous les établissements, gestion instantanée de la matrice des permissions, modération préalable des contenus du Patrimoine RDC et coupe-circuits d'urgence sans interruption de service.
            </p>
          </div>

          {/* QUICK OWNER STATS & ACTIONS */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/30 text-center">
              <div className="text-[10px] uppercase font-bold text-amber-300">Statut Urgence</div>
              <div className="text-sm font-black flex items-center justify-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> 100% Opérationnel
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/30 text-center">
              <div className="text-[10px] uppercase font-bold text-amber-300">Modération</div>
              <div className="text-sm font-black text-amber-400">
                {pendingCount} En attente
              </div>
            </div>
          </div>
        </div>

        {/* OWNER CONTACT & SECURITY BAR */}
        <div className="relative z-10 pt-3 border-t border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-amber-200 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
              <Phone className="h-4 w-4 text-amber-400" />
              <span>Contact Téléphone :</span>
              <a href="tel:0994202940" className="font-mono font-black text-amber-300 hover:underline">0994202940</a>
            </div>

            <div className="flex items-center gap-1.5 text-amber-200 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
              <Mail className="h-4 w-4 text-amber-400" />
              <span>Contact E-mail :</span>
              <a href="mailto:fredtech37@gmail.com" className="font-mono font-black text-amber-300 hover:underline">fredtech37@gmail.com</a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOwnerPasswordModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <KeyRound className="h-4 w-4" />
              <span>Changer mon Mot de Passe Propriétaire</span>
            </button>

            <button
              onClick={() => setActiveTab("internal_users")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Users className="h-4 w-4" />
              <span>Gestion Utilisateurs Internes</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-slate-900 text-amber-300 border-2 border-amber-500 rounded-2xl shadow-xl flex items-center justify-between font-bold text-xs"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg("")} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-NAVIGATION BAR */}
      <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Crown className="h-4 w-4 text-amber-300" />
            <span>Tableau de Bord</span>
          </button>

          <button
            onClick={() => setActiveTab("visual_identity")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "visual_identity"
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 shadow-md ring-2 ring-amber-400 font-black"
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            <Award className="h-4 w-4 text-amber-500" />
            <span>Identité Visuelle (Logo, Drapeau, Armoirie)</span>
          </button>

          <button
            onClick={() => setActiveTab("manage_schools")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "manage_schools"
                ? "bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-md ring-2 ring-amber-400/30"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="h-4 w-4 text-amber-300" />
            <span>Gérer les Écoles</span>
          </button>

          <button
            onClick={() => setActiveTab("cyberdefense")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "cyberdefense"
                ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/30"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-emerald-300 animate-pulse" />
            <span>Cyberdéfense & Sécurité</span>
          </button>

          <button
            onClick={() => setActiveTab("internal_users")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "internal_users"
                ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/30"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="h-4 w-4 text-amber-300" />
            <span>Personnel Interne Plateforme</span>
          </button>

          <button
            onClick={() => setActiveTab("missing_photos")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "missing_photos"
                ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-400/30"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Camera className="h-4 w-4 text-orange-300" />
            <span>Audit Photos Manquantes</span>
          </button>

          <button
            onClick={() => setActiveTab("partner_onboarding")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "partner_onboarding"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400/30"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="h-4 w-4 text-cyan-300" />
            <span>Enrôlement Écoles & Transmission Identifiants</span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "support"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <HelpCircle className="h-4 w-4 text-indigo-400" />
            <span>Support National</span>
          </button>

          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "suggestions"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Lightbulb className="h-4 w-4 text-amber-300" />
            <span>Suggestions</span>
          </button>

          <button
            onClick={() => setActiveTab("updates")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "updates"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="h-4 w-4 text-blue-300" />
            <span>Mises à Jour</span>
          </button>

          <button
            onClick={() => setActiveTab("financial")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "financial"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <DollarSign className="h-4 w-4 text-emerald-300" />
            <span>Finances SaaS</span>
          </button>

          <button
            onClick={() => setActiveTab("trials")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "trials"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="h-4 w-4 text-indigo-300" />
            <span>Essais</span>
          </button>

          <button
            onClick={() => setActiveTab("servers")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "servers"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Surveillance Serveurs</span>
          </button>

          <button
            onClick={() => setActiveTab("communication")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "communication"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Send className="h-4 w-4 text-indigo-300" />
            <span>Communication</span>
          </button>

          <button
            onClick={() => setActiveTab("developer")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "developer"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Code className="h-4 w-4 text-indigo-400" />
            <span>Développeur</span>
          </button>

          <button
            onClick={() => setActiveTab("national_stats")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "national_stats"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Globe className="h-4 w-4 text-blue-300" />
            <span>Stats Nationales</span>
          </button>

          <button
            onClick={() => setActiveTab("emergency")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "emergency"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Power className="h-4 w-4 text-yellow-300" />
            <span>Urgences & Coupe-Circuits</span>
          </button>

          <button
            onClick={() => setActiveTab("global_matrix")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "global_matrix"
                ? "bg-slate-900 dark:bg-amber-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sliders className="h-4 w-4 text-amber-500" />
            <span>Matrice RBAC</span>
          </button>

          <button
            onClick={() => setActiveTab("audit_log")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "audit_log"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="h-4 w-4 text-purple-400" />
            <span>Audit ({ownerLogs.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1 bg-amber-500/10 rounded-xl text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 border border-amber-500/30">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Contrôle Souverain RDC Active</span>
        </div>
      </div>

      {/* SUB-TAB 0: TABLEAU DE BORD GÉNÉRAL */}
      {activeTab === "overview" && (
        <OwnerDashboardOverview
          userName={userName}
          onNavigateTab={setActiveTab}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: IDENTITÉ VISUELLE & GESTION CENTRALE DES EMBLÈMES */}
      {activeTab === "visual_identity" && (
        <OwnerVisualIdentityModule
          userRole={userRole}
          userName={userName}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: GÉRER LES ÉCOLES (SUPERVISION & ADMINISTRATION) */}
      {activeTab === "manage_schools" && (
        <ManageSchoolsModule
          schools={schools}
          userAccounts={userAccounts}
          currentUserRole={userRole}
          currentUserName={userName}
          onToggleSchoolStatus={onToggleSchoolStatus}
          onUpdateUserAccount={onUpdateUserAccount}
          onSendMessageToSchools={onSendMessageToSchools}
          onAuditLog={(action, details) => {
            if (onAuditLog) {
              onAuditLog(action, details);
            }
          }}
        />
      )}

      {/* SUB-TAB: GESTION DU PERSONNEL INTERNE DE LA PLATEFORME */}
      {activeTab === "internal_users" && (
        <OwnerStaffManagementModule
          userName={userName}
          onAuditLog={addOwnerAuditLog}
          onOpenStaffPortal={(member) => {
            setPreviewStaffMember(member);
            setActiveTab("staff_portal_preview");
          }}
        />
      )}

      {/* SUB-TAB: DÉTECTION & AUDIT DES PHOTOS MANQUANTES DANS LES ÉCOLES */}
      {activeTab === "missing_photos" && (
        <MissingPhotosAuditDashboard
          schools={schools}
          students={students}
          employees={employees}
          teachers={teachers}
          userAccounts={userAccounts}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: PORTAIL DÉDIÉ PERSONNEL INTERNE (APERÇU OU SESSION) */}
      {activeTab === "staff_portal_preview" && previewStaffMember && (
        <PlatformStaffPortalView
          staffMember={previewStaffMember}
          schools={schools}
          students={students}
          employees={employees}
          teachers={teachers}
          userAccounts={userAccounts}
          onBackToOwner={() => setActiveTab("internal_users")}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: CYBERDÉFENSE & SÉCURITÉ */}
      {activeTab === "cyberdefense" && (
        <OwnerSecurityAlertsModule />
      )}

      {/* SUB-TAB: ENRÔLEMENT DES ÉCOLES PARTENAIRES & TRANSMISSION IDENTIFIANTS */}
      {activeTab === "partner_onboarding" && (
        <PartnerSchoolsOnboardingSection 
          onAuditLog={addOwnerAuditLog}
          schools={schools}
          onAddSchool={onAddSchool}
          userAccounts={userAccounts}
          onRegisterSchoolAccount={onRegisterSchoolAccount}
          onOpenSchoolPortal={onOpenSchoolPortal}
        />
      )}

      {/* SUB-TAB: SUPPORT NATIONAL */}
      {activeTab === "support" && (
        <OwnerSupportModule
          userName={userName}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: SUGGESTIONS */}
      {activeTab === "suggestions" && (
        <OwnerSuggestionsModule
          userName={userName}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: MISES À JOUR */}
      {activeTab === "updates" && (
        <OwnerUpdatesModule
          userName={userName}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: FINANCES SAAS */}
      {activeTab === "financial" && (
        <OwnerFinancialModule
          userName={userName}
          onAuditLog={addOwnerAuditLog}
          payments={payments}
        />
      )}

      {/* SUB-TAB: ESSAIS */}
      {activeTab === "trials" && (
        <OwnerTrialsModule
          userName={userName}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: SERVEURS & INCIDENTS */}
      {activeTab === "servers" && (
        <OwnerServerMonitorModule
          userName={userName}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: COMMUNICATION */}
      {activeTab === "communication" && (
        <OwnerCommunicationModule
          userName={userName}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: DÉVELOPPEUR */}
      {activeTab === "developer" && (
        <OwnerDeveloperModule
          userName={userName}
          onAuditLog={addOwnerAuditLog}
        />
      )}

      {/* SUB-TAB: STATISTIQUES NATIONALES */}
      {activeTab === "national_stats" && (
        <OwnerNationalStatsModule />
      )}

      {/* SUB-TAB 1: MODE D'URGENCE & COUPE-CIRCUITS */}
      {activeTab === "emergency" && (
        <div className="space-y-6">
          <div className="bg-red-950/20 border-2 border-red-500/50 p-6 rounded-3xl space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-black text-lg text-red-500 uppercase flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" /> Coupe-Circuits Globaux & Mode d'Urgence
                </h3>
                <p className="text-xs text-slate-300">
                  En un clic, le Propriétaire peut couper immédiatement l'accès à un module dans toute la République Démocratique du Congo.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleBulkEmergency(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg cursor-pointer"
                >
                  <Power className="h-4 w-4" />
                  <span>DÉSACTIVER TOUS LES MODULES</span>
                </button>

                <button
                  onClick={() => handleBulkEmergency(false)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>RÉTABLIR TOUS LES SERVICES</span>
                </button>
              </div>
            </div>
          </div>

          {/* GRID OF EMERGENCY MODULE SWITCHES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SYSTEM_MODULES.map((mod) => {
              const sw = killSwitches[mod.id] || {
                id: mod.id,
                name: mod.label,
                category: mod.category,
                disabled: false,
                message: "Module sous contrôle",
                updatedAt: "-",
                updatedBy: userName
              };

              return (
                <div
                  key={mod.id}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                    sw.disabled
                      ? "bg-red-950/30 border-red-500/80 text-white shadow-xl"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {mod.category}
                      </span>

                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-black uppercase ${sw.disabled ? "text-red-400" : "text-emerald-500"}`}>
                          {sw.disabled ? "Désactivé (Hors-Ligne)" : "Actif (En Ligne)"}
                        </span>

                        {/* Toggle Switch Button */}
                        <button
                          onClick={() => toggleEmergencySwitch(mod.id)}
                          className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                            sw.disabled ? "bg-red-600 justify-end" : "bg-emerald-500 justify-start"
                          }`}
                        >
                          <motion.div
                            layout
                            className="bg-white w-6 h-6 rounded-full shadow-md flex items-center justify-center"
                          >
                            <Power className={`h-3.5 w-3.5 ${sw.disabled ? "text-red-600" : "text-emerald-600"}`} />
                          </motion.div>
                        </button>
                      </div>
                    </div>

                    <h4 className="font-black text-base uppercase">{mod.label}</h4>

                    {/* Custom Message input if disabled */}
                    <div className="space-y-1 pt-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Message affiché aux utilisateurs en cas d'arrêt :
                      </label>
                      <input
                        type="text"
                        value={sw.message}
                        onChange={(e) => {
                          const val = e.target.value;
                          setKillSwitches((prev) => ({
                            ...prev,
                            [mod.id]: { ...prev[mod.id], message: val }
                          }));
                        }}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/40 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Modifié le : {sw.updatedAt}</span>
                    <span>Par : {sw.updatedBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MATRICE GLOBALE DES AUTORISATIONS */}
      {activeTab === "global_matrix" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-amber-500" />
                <span>Matrice Globale des Autorisations des Fonctionnalités</span>
              </h3>
              <p className="text-xs text-slate-500">
                Définissez précisément les droits d'action (Voir, Ajouter, Modifier, Supprimer, Imprimer, Valider...) pour chaque rôle.
              </p>
            </div>

            {/* Filter Module selector */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-400">Module :</span>
              <select
                value={matrixSearchModule}
                onChange={(e) => setMatrixSearchModule(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="Tous">Tous les Modules ({SYSTEM_MODULES.length})</option>
                {SYSTEM_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* MATRIX TABLE */}
          <div className="overflow-x-auto scrollbar-thin space-y-8">
            {SYSTEM_MODULES.filter((m) => matrixSearchModule === "Tous" || matrixSearchModule === m.id).map((mod) => (
              <div key={mod.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-900 text-white p-3 font-black text-xs uppercase flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-amber-400" />
                    <span>Module : {mod.label}</span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono">{mod.category}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500">
                        <th className="p-3 min-w-[140px] sticky left-0 bg-slate-100 dark:bg-slate-950">Rôles Utilisateurs</th>
                        {ALL_GRANULAR_ACTIONS.map((action) => (
                          <th key={action} className="p-2 text-center min-w-[70px]">{action}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {ALL_SYSTEM_ROLES.map((role) => (
                        <tr key={role} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-all">
                          <td className="p-3 font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 shadow-xs border-r border-slate-100 dark:border-slate-800 text-[11px]">
                            {role}
                          </td>
                          {ALL_GRANULAR_ACTIONS.map((action) => {
                            const isAllowed = globalMatrix[mod.id]?.[role]?.[action] ?? false;
                            return (
                              <td key={action} className="p-2 text-center">
                                <button
                                  onClick={() => toggleGlobalMatrixCell(mod.id, role, action)}
                                  className={`w-6 h-6 rounded-md mx-auto flex items-center justify-center cursor-pointer transition-all ${
                                    isAllowed
                                      ? "bg-emerald-500 text-white shadow-xs"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-300 hover:bg-slate-200"
                                  }`}
                                  title={`${action} - ${role} (${isAllowed ? 'Autorisé' : 'Interdit'})`}
                                >
                                  {isAllowed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: MATRICE SÉCURITÉ & MOTS DE PASSE */}
      {activeTab === "security_matrix" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-indigo-500" />
                <span>Matrice des Habilitations de Sécurité du Compte (15 Rôles x 8 Habilitations)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Le Propriétaire de SmartSchool RDC peut activer ou désactiver individuellement pour chaque rôle la modification de mot de passe, le 2FA, la gestion des appareils et la récupération.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                Garantie Souveraine de Protection RDC
              </span>
            </div>
          </div>

          {/* POLICY CONFIGURATION PANEL */}
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-black text-xs uppercase text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Politique Globale de Complexité des Mots de Passe</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-600 dark:text-slate-300 block">Longueur Minimale :</label>
                <select
                  value={securityPolicy.minLength}
                  onChange={(e) => setSecurityPolicy(prev => ({ ...prev, minLength: Number(e.target.value) }))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-white"
                >
                  <option value={6}>6 Caractères</option>
                  <option value={8}>8 Caractères (Recommandé)</option>
                  <option value={10}>10 Caractères</option>
                  <option value={12}>12 Caractères (Haute Sécurité)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="pol_upper"
                  checked={securityPolicy.requireUppercase}
                  onChange={(e) => setSecurityPolicy(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                  className="h-4 w-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="pol_upper" className="font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer">
                  Majuscule obligatoire (A-Z)
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="pol_num"
                  checked={securityPolicy.requireNumbers}
                  onChange={(e) => setSecurityPolicy(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                  className="h-4 w-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="pol_num" className="font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer">
                  Chiffre obligatoire (0-9)
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="pol_spec"
                  checked={securityPolicy.requireSpecialChars}
                  onChange={(e) => setSecurityPolicy(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                  className="h-4 w-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="pol_spec" className="font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer">
                  Caractère spécial (@, #, $, etc.)
                </label>
              </div>
            </div>
          </div>

          {/* SECURITY MATRIX TABLE */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-indigo-950 text-indigo-200 text-[10px] font-black uppercase">
                  <th className="p-3 min-w-[160px] sticky left-0 bg-indigo-950">Rôle Système</th>
                  {OWNER_SECURITY_CAPABILITIES.map((cap) => (
                    <th key={cap.id} className="p-2 text-center min-w-[110px] border-l border-indigo-900" title={cap.label}>
                      {cap.label}
                    </th>
                  ))}
                  <th className="p-2 text-center min-w-[110px] border-l border-indigo-900">Action Masse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ALL_SYSTEM_ROLES.map((role) => (
                  <tr key={role} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-all">
                    <td className="p-3 font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 shadow-xs border-r border-slate-100 dark:border-slate-800 text-[11px]">
                      {role}
                    </td>

                    {OWNER_SECURITY_CAPABILITIES.map((cap) => {
                      const isAllowed = securityMatrix[role]?.[cap.id] ?? true;
                      return (
                        <td key={cap.id} className="p-2 text-center border-l border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => toggleSecurityCell(role, cap.id)}
                            className={`w-6 h-6 rounded-md mx-auto flex items-center justify-center cursor-pointer transition-all ${
                              isAllowed
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-300 hover:bg-slate-200"
                            }`}
                            title={`${cap.label} pour ${role} : ${isAllowed ? 'AUTORISÉ' : 'DESACTIVÉ'}`}
                          >
                            {isAllowed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      );
                    })}

                    <td className="p-2 text-center border-l border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => toggleSecurityRoleAll(role, true)}
                          className="px-1.5 py-1 bg-emerald-600 text-white text-[9px] font-black rounded hover:bg-emerald-500 cursor-pointer"
                          title="Tout autoriser pour ce rôle"
                        >
                          TOUT
                        </button>
                        <button
                          onClick={() => toggleSecurityRoleAll(role, false)}
                          className="px-1.5 py-1 bg-red-600 text-white text-[9px] font-black rounded hover:bg-red-500 cursor-pointer"
                          title="Tout bloquer pour ce rôle"
                        >
                          STOP
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DROITS SPÉCIFIQUES PATRIMOINE & CULTURE RDC */}
      {activeTab === "heritage_matrix" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Landmark className="h-5 w-5 text-amber-500" />
                <span>Matrice Spécifique : Patrimoine & Culture de la RDC</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configuration détaillée des 15 autorisations du Centre de la Culture et du Patrimoine National RDC pour chaque rôle.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-amber-950 text-amber-200 text-[10px] font-black uppercase">
                  <th className="p-3 min-w-[160px] sticky left-0 bg-amber-950">Rôle / Acteur</th>
                  {HERITAGE_SPECIFIC_PERMISSIONS.map((perm) => (
                    <th key={perm} className="p-2 text-center min-w-[90px] border-l border-amber-900">{perm}</th>
                  ))}
                  <th className="p-2 text-center min-w-[110px] border-l border-amber-900">Masse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ALL_SYSTEM_ROLES.map((role) => (
                  <tr key={role} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-all">
                    <td className="p-3 font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 shadow-xs border-r border-slate-100 dark:border-slate-800 text-[11px]">
                      {role}
                    </td>

                    {HERITAGE_SPECIFIC_PERMISSIONS.map((perm) => {
                      const isAllowed = heritageMatrix[role]?.[perm] ?? false;
                      return (
                        <td key={perm} className="p-2 text-center border-l border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => toggleHeritageCell(role, perm)}
                            className={`w-6 h-6 rounded-md mx-auto flex items-center justify-center cursor-pointer transition-all ${
                              isAllowed
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-300 hover:bg-slate-200"
                            }`}
                            title={`${perm} pour ${role}`}
                          >
                            {isAllowed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      );
                    })}

                    <td className="p-2 text-center border-l border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => toggleHeritageRoleAll(role, true)}
                          className="px-1.5 py-1 bg-emerald-600 text-white text-[9px] font-black rounded hover:bg-emerald-500 cursor-pointer"
                          title="Tout accorder"
                        >
                          TOUT
                        </button>
                        <button
                          onClick={() => toggleHeritageRoleAll(role, false)}
                          className="px-1.5 py-1 bg-red-600 text-white text-[9px] font-black rounded hover:bg-red-500 cursor-pointer"
                          title="Tout restreindre"
                        >
                          STOP
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MODÉRATION & VALIDATION DES CONTENUS */}
      {activeTab === "moderation" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-blue-500" />
                <span>File de Modération & Validation Préalable des Publications</span>
              </h3>
              <p className="text-xs text-slate-500">
                Aucun contenu proposé par les écoles, enseignants ou élèves ne devient public sans l'approbation du Propriétaire ou des modérateurs.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2 text-xs font-bold">
              <button
                onClick={() => setModerationFilterStatus("all")}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                  moderationFilterStatus === "all" ? "bg-slate-900 text-white" : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                Tous ({moderationItems.length})
              </button>

              <button
                onClick={() => setModerationFilterStatus("pending")}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                  moderationFilterStatus === "pending" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"
                }`}
              >
                En Attente ({pendingCount})
              </button>

              <button
                onClick={() => setModerationFilterStatus("approved")}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                  moderationFilterStatus === "approved" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                Approuvés ({approvedCount})
              </button>
            </div>
          </div>

          {/* LIST OF PROPOSED SUBMISSIONS */}
          <div className="space-y-4">
            {moderationItems
              .filter((item) => moderationFilterStatus === "all" || item.status === moderationFilterStatus)
              .map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[10px] font-black uppercase rounded-md">
                        {item.type}
                      </span>
                      <span className="text-xs font-bold text-slate-400">• {item.category}</span>
                      <span className="text-xs font-mono text-slate-400">• Soumis le : {item.submittedAt}</span>
                    </div>

                    <span
                      className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                        item.status === "pending"
                          ? "bg-amber-500/20 text-amber-600"
                          : item.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-600"
                          : "bg-red-500/20 text-red-600"
                      }`}
                    >
                      {item.status === "pending" ? "En Attente de Validation" : item.status === "approved" ? "Approuvé & En Ligne" : "Refusé"}
                    </span>
                  </div>

                  <h4 className="font-black text-base text-slate-900 dark:text-white">{item.title}</h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div className="text-slate-500">
                      Proposé par : <strong>{item.authorName}</strong> ({item.authorRole}) — <em>{item.schoolName}</em>
                    </div>

                    {item.status === "pending" && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleModerationAction(item.id, "approved")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approuver & Publier</span>
                        </button>

                        <button
                          onClick={() => {
                            const reason = window.prompt("Motif du refus / demande de correction :", "Renseignements historiques incomplets");
                            if (reason) handleModerationAction(item.id, "rejected", reason);
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Refuser</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {moderationItems.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-bold text-xs">
                Aucun contenu à afficher pour le filtre sélectionné.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: CONTRÔLE TOTAL PLATEFORME */}
      {activeTab === "total_control" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="border-b pb-4">
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-emerald-500" />
              <span>Supervision des Établissements & Utilisateurs Nationaux</span>
            </h3>
            <p className="text-xs text-slate-500">
              Visualisation et actions directes du Propriétaire sur toutes les écoles enregistrées dans la plateforme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-black uppercase text-amber-600">Établissements RDC</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">1.240 Écoles</div>
              <p className="text-[11px] text-slate-500">Toutes provinces confondues sous licence SmartSchool RDC.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-black uppercase text-blue-600">Utilisateurs Actifs</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">485.000 Comptes</div>
              <p className="text-[11px] text-slate-500">Élèves, Parents, Enseignants, Préfets et Inspecteurs.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-black uppercase text-emerald-600">Sécurité & Audit</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">Active (24/7)</div>
              <p className="text-[11px] text-slate-500">Protection contre les intrusions et journalisation continue.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: JOURNAL D'AUDIT DU PROPRIÉTAIRE */}
      {activeTab === "audit_log" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span>Journal d'Audit Inaltérable du Propriétaire</span>
              </h3>
              <p className="text-xs text-slate-500">
                Toutes les modifications d'autorisations, coupe-circuits et approbations sont tracées avec horodatage et IP.
              </p>
            </div>

            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ownerLogs, null, 2));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `audit_log_proprietaire_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exporter Journal (JSON)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Horodatage</th>
                  <th className="p-3">Acteur / Rôle</th>
                  <th className="p-3">Action Exécutée</th>
                  <th className="p-3">Détails & Impact</th>
                  <th className="p-3">Adresse IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ownerLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{log.actorName} ({log.actorRole})</td>
                    <td className="p-3 font-black text-amber-600">{log.action}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 max-w-md">{log.details}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OWNER PASSWORD MODAL */}
      <AnimatePresence>
        {showOwnerPasswordModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-amber-500/60 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-amber-500" />
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">
                    Modification Mot de Passe Propriétaire
                  </h3>
                </div>
                <button
                  onClick={() => setShowOwnerPasswordModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOwnerPassword} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Mot de Passe Actuel</label>
                  <input
                    required
                    type="password"
                    value={currentOwnerPassInput}
                    onChange={e => setCurrentOwnerPassInput(e.target.value)}
                    placeholder="Saisissez votre mot de passe actuel"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nouveau Mot de Passe</label>
                  <div className="relative">
                    <input
                      required
                      type={showOwnerPass ? "text" : "password"}
                      value={newOwnerPassInput}
                      onChange={e => setNewOwnerPassInput(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOwnerPass(!showOwnerPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showOwnerPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Confirmer le Nouveau Mot de Passe</label>
                  <input
                    required
                    type="password"
                    value={confirmOwnerPassInput}
                    onChange={e => setConfirmOwnerPassInput(e.target.value)}
                    placeholder="Ressaisissez le mot de passe"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOwnerPasswordModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
                  >
                    Enregistrer Mot de Passe
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT INTERNAL USER MODAL */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">
                    {editingUser ? `Modifier Utilisateur Interne : ${editingUser.name}` : "Créer un Compte Utilisateur Interne"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveInternalUser} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nom Complet</label>
                  <input
                    required
                    type="text"
                    value={userFormName}
                    onChange={e => setUserFormName(e.target.value)}
                    placeholder="Ex: Prof. Alphonse Mukendi"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Adresse E-mail</label>
                  <input
                    required
                    type="email"
                    value={userFormEmail}
                    onChange={e => setUserFormEmail(e.target.value)}
                    placeholder="Ex: mukendi@smartschool.cd"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Téléphone Contact</label>
                  <input
                    type="text"
                    value={userFormPhone}
                    onChange={e => setUserFormPhone(e.target.value)}
                    placeholder="Ex: 0994202940"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Rôle Système attribué</label>
                  <select
                    value={userFormRole}
                    onChange={e => setUserFormRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-indigo-600 dark:text-indigo-400"
                  >
                    <option value="Directeur">Directeur</option>
                    <option value="Préfet des Études">Préfet des Études</option>
                    <option value="Comptable">Comptable</option>
                    <option value="Caissier">Caissier</option>
                    <option value="Secrétaire">Secrétaire</option>
                    <option value="Enseignant">Enseignant</option>
                    <option value="Responsable informatique">Responsable informatique</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Mot de passe {editingUser ? "(Optionnel - réinitialisation)" : "initial"}
                  </label>
                  <input
                    type="text"
                    value={userFormPassword}
                    onChange={e => setUserFormPassword(e.target.value)}
                    placeholder={editingUser ? "Laisser vide pour conserver le mot de passe actuel" : "Mot de passe temporaire"}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md cursor-pointer"
                  >
                    {editingUser ? "Enregistrer Modifications" : "Créer le Compte"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: ENRÔLEMENT DES ÉCOLES PARTENAIRES & TRANSMISSION IDENTIFIANTS
// ---------------------------------------------------------------------------
interface PartnerSchool {
  id: string;
  name: string;
  epstCode: string;
  province: string;
  city: string;
  promoterName: string;
  promoterEmail: string;
  promoterPhone: string;
  plan: "Standard" | "Professionnel" | "Premium" | "Entreprise";
  schoolCode: string;
  superAdminUsername: string;
  tempPassword: string;
  activationCode: string;
  licenseKey: string;
  activationStatus: "En attente de 1ère connexion" | "Établissement Activé";
  createdAt: string;
}

export function PartnerSchoolsOnboardingSection({
  onAuditLog,
  schools = [],
  onAddSchool,
  userAccounts = [],
  onRegisterSchoolAccount,
  onOpenSchoolPortal
}: {
  onAuditLog?: (action: string, details: string) => void;
  schools?: School[];
  onAddSchool?: (school: School) => void;
  userAccounts?: UserAccount[];
  onRegisterSchoolAccount?: (account: UserAccount) => void;
  onOpenSchoolPortal?: (schoolId: string, account?: UserAccount) => void;
}) {
  const [partnerSchools, setPartnerSchools] = useState<PartnerSchool[]>(() => {
    const saved = safeLocalStorage.getItem("smartschool_partner_schools_registry_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [epstCode, setEpstCode] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [promoterName, setPromoterName] = useState("");
  const [promoterEmail, setPromoterEmail] = useState("");
  const [promoterPhone, setPromoterPhone] = useState("");
  const [plan, setPlan] = useState<"Standard" | "Professionnel" | "Premium" | "Entreprise">("Premium");

  // Modal State for Activation Pack
  const [activeModalSchool, setActiveModalSchool] = useState<PartnerSchool | null>(null);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [copiedLinkStatus, setCopiedLinkStatus] = useState(false);

  const savePartnerSchools = (list: PartnerSchool[]) => {
    setPartnerSchools(list);
    safeLocalStorage.setItem("smartschool_partner_schools_registry_v2", JSON.stringify(list));
  };

  const handleRegisterSchool = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newSchoolId = `sch-${Date.now().toString().slice(-6)}`;
    const generatedSchoolCode = `SCH-${cleanName.substring(0, 8).toUpperCase()}-2026`;
    const generatedUsername = promoterEmail ? promoterEmail.trim().toLowerCase() : `superadmin.${cleanName.substring(0, 10)}@smartschool.cd`;
    const generatedPassword = `ActiSchool${Math.floor(100 + Math.random() * 900)}!`;
    const generatedCode = `ACT-SCH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const generatedLicense = `LIC-SSRDC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPartnerSchool: PartnerSchool = {
      id: newSchoolId,
      name,
      epstCode: epstCode || `${Math.floor(100000 + Math.random() * 900000)}-EPST`,
      province,
      city: city || "Chef-lieu provincial",
      promoterName: promoterName || `Promoteur ${name}`,
      promoterEmail: promoterEmail || generatedUsername,
      promoterPhone: promoterPhone || "+243 800 000 000",
      plan,
      schoolCode: generatedSchoolCode,
      superAdminUsername: generatedUsername,
      tempPassword: generatedPassword,
      activationCode: generatedCode,
      licenseKey: generatedLicense,
      activationStatus: "En attente de 1ère connexion",
      createdAt: new Date().toLocaleDateString("fr-FR")
    };

    const newSchoolObj: School = {
      id: newSchoolId,
      name,
      codeNational: newPartnerSchool.epstCode,
      provinceEducationnelle: "Kinshasa 1",
      contactEmail: promoterEmail ? promoterEmail.trim().toLowerCase() : generatedUsername,
      province,
      ville: city || "Chef-lieu provincial",
      motto: "Discipline - Travail - Succès",
      schoolYear: "2026-2027",
      levels: ["Maternelle", "Primaire", "Secondaire", "Humanités"],
      sections: ["Section Primaire", "Section Scientifique", "Section Littéraire", "Section Commerciale & Gestion", "Section Pédagogique"]
    };

    const superAdminAccount: UserAccount = {
      id: `acc-${newSchoolId}-admin`,
      dossierId: newSchoolId,
      dossierType: "personnel",
      schoolId: newSchoolId,
      schoolName: name,
      fullName: promoterName || `SuperAdmin ${name}`,
      email: promoterEmail ? promoterEmail.trim().toLowerCase() : generatedUsername,
      username: generatedUsername,
      password: generatedPassword,
      tempPassword: generatedPassword,
      activationCode: generatedCode,
      role: "Directeur Général",
      functionTitle: "Promoteur & Super-Administrateur Établissement",
      phone: promoterPhone,
      isActive: true,
      isActivated: false,
      mustChangePasswordOnFirstLogin: true,
      targetPortalTab: "dashboard",
      portalUrl: `${getSafeOrigin()}/?schoolId=${newSchoolId}&login=${encodeURIComponent(generatedUsername)}&ref=school_pack`,
      createdAt: new Date().toISOString(),
      createdBy: "Propriétaire SmartSchool RDC",
      creatorRole: "Propriétaire de la plateforme"
    };

    persistUniversalUserAccount(superAdminAccount);
    registerSecondaryUserWithFirebase(generatedUsername, generatedPassword).catch(() => {});

    if (onAddSchool) onAddSchool(newSchoolObj);
    if (onRegisterSchoolAccount) onRegisterSchoolAccount(superAdminAccount);

    const updatedSchools = [newPartnerSchool, ...partnerSchools];
    savePartnerSchools(updatedSchools);
    setActiveModalSchool(newPartnerSchool);
    setIsCreatingSchool(false);

    if (onAuditLog) {
      onAuditLog(
        "Enrôlement École Partenaire",
        `Création de l'établissement ${name} (${newPartnerSchool.epstCode}) par le Propriétaire. Identifiant SuperAdmin: ${generatedUsername}`
      );
    }

    // Reset Form
    setName("");
    setEpstCode("");
    setCity("");
    setPromoterName("");
    setPromoterEmail("");
    setPromoterPhone("");
  };

  const filteredSchools = useMemo(() => {
    return partnerSchools.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.epstCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.promoterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.province.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [partnerSchools, searchTerm]);

  const handleCopyPack = async (school: PartnerSchool) => {
    const directUrl = `${getSafeOrigin()}/?schoolId=${school.id}&login=${encodeURIComponent(school.superAdminUsername)}&ref=school_pack`;
    const textToCopy = `=== FICHE OFFICIELLE D'ACTIVATION ÉTABLISSEMENT PARTENAIRE ===
SmartSchool RDC — Ministère de l'Éducation Nationale (EPST)

Établissement : ${school.name}
Code National EPST : ${school.epstCode}
Province / Ville : ${school.province} / ${school.city}
Promoteur / SuperAdmin : ${school.promoterName}
Formule d'Abonnement : ${school.plan}

--- IDENTIFIANTS D'ACCÈS & D'ACTIVATION ---
Code Établissement : ${school.schoolCode}
Identifiant SuperAdmin : ${school.superAdminUsername}
Mot de Passe Initial : ${school.tempPassword}
Code d'Activation Unique : ${school.activationCode}
Clé de Licence Certifiée : ${school.licenseKey}

Lien Direct de Connexion & Activation : ${directUrl}

Instructions : Lors de votre 1ère connexion, le SuperAdmin sera guidé pour modifier son mot de passe et configurer les questions de sécurité d'établissement.`;

    await safeCopyToClipboard(textToCopy);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  const handleCopyDirectLink = async (school: PartnerSchool) => {
    const directUrl = `${getSafeOrigin()}/?schoolId=${school.id}&login=${encodeURIComponent(school.superAdminUsername)}&ref=school_pack`;
    await safeCopyToClipboard(directUrl);
    setCopiedLinkStatus(true);
    setTimeout(() => setCopiedLinkStatus(false), 2500);
  };

  const handlePrintPack = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 relative z-10">
          <SmartSchoolLogo size="lg" withShadow withRing className="shrink-0 mt-1" />
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-bold border border-amber-500/30">
              <Crown className="h-3.5 w-3.5" /> Espace Réservé Propriétaire Suprême — FRED-TECH
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Enrôlement des Écoles Partenaires & Transmission d'Identifiants
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Générez les accès initiaux pour les promoteurs et chefs d'établissements partenaires sur le territoire national de la RDC. Transmettez les packs d'activation certifiés par SMS, WhatsApp ou Fiche Officielle PDF.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingSchool(true)}
          className="relative z-10 px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl text-xs shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="h-4.5 w-4.5 stroke-[3]" />
          <span>Enrôler une Nouvelle École</span>
        </button>
      </div>

      {/* FORM: ENRÔLEMENT NOUVELLE ÉCOLE PARTENAIRE */}
      <AnimatePresence>
        {isCreatingSchool && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Formulaire d'Enrôlement Établissement Partenaire
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Saisie des métadonnées officielles de l'école et du SuperAdmin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingSchool(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSchool} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Nom Officiel de l'Établissement <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="ex: Complexe Scolaire La Sagesse"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Code National EPST / SECOPE <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="ex: 884102-KIN"
                    value={epstCode}
                    onChange={e => setEpstCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Province RDC <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  >
                    <option value="">-- Sélectionner la province --</option>
                    <option value="Kinshasa">Kinshasa</option>
                    <option value="Haut-Katanga">Haut-Katanga</option>
                    <option value="Kongo-Central">Kongo-Central</option>
                    <option value="Tshopo">Tshopo</option>
                    <option value="Lualaba">Lualaba</option>
                    <option value="Sud-Kivu">Sud-Kivu</option>
                    <option value="Nord-Kivu">Nord-Kivu</option>
                    <option value="Kwilu">Kwilu</option>
                    <option value="Ituri">Ituri</option>
                    <option value="Equateur">Equateur</option>
                    <option value="Kasai-Central">Kasaï-Central</option>
                    <option value="Kasai-Oriental">Kasaï-Oriental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Ville / Commune <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="ex: Commune ou ville"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Nom du Promoteur / SuperAdmin <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="ex: Prof. Alphonse Mukendi"
                    value={promoterName}
                    onChange={e => setPromoterName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    E-mail officiel du Promoteur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ex: promoteur@lasagesse.cd"
                    value={promoterEmail}
                    onChange={e => setPromoterEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Téléphone (SMS / WhatsApp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="ex: +243 812 345 678"
                    value={promoterPhone}
                    onChange={e => setPromoterPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Formule d'Abonnement SaaS <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={plan}
                    onChange={e => setPlan(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  >
                    <option value="Standard">Standard — 500$ / an</option>
                    <option value="Professionnel">Professionnel — 1 200$ / an</option>
                    <option value="Premium">Premium — 2 500$ / an</option>
                    <option value="Entreprise">Entreprise Multi-Campus — 5 000$ / an</option>
                  </select>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950/50 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Attribution Automatique des Licences & Clés d'Activation
                  </span>
                </div>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-mono">
                  SuperAdmin + Clé Inviolable Certifiée
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingSchool(false)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer transition-all shadow-md text-xs flex items-center gap-2"
                >
                  <Crown className="h-4 w-4 text-amber-300" />
                  <span>Générer Accès & Imprimer Fiche Officielle</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            placeholder="Rechercher école, code EPST, promoteur ou province..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <span>{filteredSchools.length} école(s) enrôlée(s)</span>
        </div>
      </div>

      {/* TABLEAU DES ÉCOLES PARTENAIRES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 font-black uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Établissement & EPST</th>
                <th className="py-3.5 px-4">Localisation</th>
                <th className="py-3.5 px-4">Promoteur / SuperAdmin</th>
                <th className="py-3.5 px-4">Plan SaaS</th>
                <th className="py-3.5 px-4">Statut Activation</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {filteredSchools.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-900 dark:text-white block">{sch.name}</span>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      EPST: {sch.epstCode} | Code: {sch.schoolCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{sch.province}</span>
                    <span className="text-[10px] text-slate-400">{sch.city}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{sch.promoterName}</span>
                    <span className="text-[10px] text-slate-400 block">{sch.promoterPhone}</span>
                    <span className="text-[10px] text-slate-400">{sch.promoterEmail}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {sch.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {sch.activationStatus === "Établissement Activé" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> Établissement Activé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                        <Clock className="h-3 w-3" /> En attente de 1ère connexion
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveModalSchool(sch)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-xs"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Transmission Identifiants</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FICHE OFFICIELLE D'ACTIVATION ÉTABLISSEMENT */}
      <AnimatePresence>
        {activeModalSchool && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative overflow-hidden space-y-6 text-left"
            >
              {/* RDC ARMOIRIES / HEADER */}
              <div className="border-b-2 border-indigo-500/30 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                    <Crown className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase block">
                      RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                    </span>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      Fiche Officielle d'Activation Établissement
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      SmartSchool RDC — Centre de Contrôle Propriétaire
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalSchool(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* SCHOOL & PROMOTER SUMMARY */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Établissement</span>
                    <p className="font-extrabold text-slate-900 dark:text-white">{activeModalSchool.name}</p>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      Code EPST: {activeModalSchool.epstCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Promoteur / SuperAdmin</span>
                    <p className="font-extrabold text-slate-900 dark:text-white">{activeModalSchool.promoterName}</p>
                    <span className="text-[10px] text-slate-500 font-semibold block">{activeModalSchool.promoterPhone}</span>
                  </div>
                </div>

                {/* IDENTIFIANTS CRITIQUES */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Code Établissement</span>
                    <p className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      {activeModalSchool.schoolCode}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Identifiant SuperAdmin</span>
                    <p className="font-mono font-bold text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 truncate">
                      {activeModalSchool.superAdminUsername}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mot de Passe Temporaire</span>
                    <p className="font-mono font-extrabold text-xs text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      {activeModalSchool.tempPassword}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Code Activation Licence</span>
                    <p className="font-mono font-extrabold text-xs text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      {activeModalSchool.activationCode}
                    </p>
                  </div>
                </div>

                {/* DIRECT URL BOX */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Lien Direct de Connexion & Activation
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyDirectLink(activeModalSchool)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLinkStatus ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedLinkStatus ? "Lien Copié !" : "Copier le Lien"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl font-mono text-[11px] text-indigo-950 dark:text-indigo-200 break-all select-all flex items-center justify-between gap-2">
                    <span className="truncate">
                      {`${getSafeOrigin()}/?schoolId=${activeModalSchool.id}&login=${encodeURIComponent(activeModalSchool.superAdminUsername)}&ref=school_pack`}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  </div>
                </div>
              </div>

              {/* FIRST LOGIN MANDATE */}
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-amber-600" /> Protocole de Première Connexion SuperAdmin :
                </p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  Dès sa première connexion sur l'application, le SuperAdmin sera automatiquement redirigé vers l'Assistant de Première Installation d'Établissement. Il devra obligatoirement modifier son mot de passe, le confirmer et définir 3 questions de sécurité.
                </p>
              </div>

              {/* DIRECT CONNECT BUTTON */}
              {onOpenSchoolPortal && (
                <button
                  onClick={() => {
                    onOpenSchoolPortal(activeModalSchool.id);
                    setActiveModalSchool(null);
                  }}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Ouvrir et Connecter le Portail École Immédiatement</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              )}

              {/* ACTIONS PACK */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleCopyPack(activeModalSchool)}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-2xl text-xs transition-all cursor-pointer"
                >
                  {copiedStatus ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedStatus ? "Copié !" : "Copier Pack"}</span>
                </button>

                <button
                  onClick={handlePrintPack}
                  className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-md"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimer PDF</span>
                </button>

                <a
                  href={`https://wa.me/${activeModalSchool.promoterPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${activeModalSchool.promoterName},\n\nVoici la Fiche Officielle d'Activation SmartSchool RDC pour votre établissement ${activeModalSchool.name}.\n\nIdentifiant SuperAdmin : ${activeModalSchool.superAdminUsername}\nMot de Passe Initial : ${activeModalSchool.tempPassword}\nCode d'Activation : ${activeModalSchool.activationCode}\nLien Direct : ${getSafeOrigin()}/?schoolId=${activeModalSchool.id}&login=${encodeURIComponent(activeModalSchool.superAdminUsername)}&ref=school_pack`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-md"
                >
                  <Send className="h-4 w-4" />
                  <span>WhatsApp / SMS</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
