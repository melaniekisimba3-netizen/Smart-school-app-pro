import React, { useState, useMemo } from "react";
import { 
  Users, UserPlus, Shield, KeyRound, Lock, Unlock, RefreshCw, 
  Check, X, Search, Filter, Phone, Mail, FileText, Printer, 
  ExternalLink, Eye, EyeOff, Sparkles, CheckCircle2, AlertTriangle, 
  Sliders, UserCheck, ShieldAlert, Clock, ArrowRight, Smartphone, Copy,
  RotateCcw, Layers, History, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PlatformStaffMember, 
  PlatformStaffFunction, 
  PlatformStaffPermissions, 
  UserAccount,
  InternalPortalConfig,
  ResponsibilityTransferRecord
} from "../../types";
import { 
  DEFAULT_PERMISSIONS_BY_FUNCTION, 
  OWNER_FULL_PERMISSIONS, 
  INITIAL_PLATFORM_STAFF,
  DEFAULT_INTERNAL_PORTALS,
  SYSTEM_RESPONSIBILITIES_CATALOG
} from "../../utils/platformStaffDefaults";
import { safeLocalStorage, safeCopyToClipboard, getSafeOrigin } from "../../utils/safeStorage";
import { persistUniversalUserAccount } from "../../services/accountActivationService";
import { registerSecondaryUserWithFirebase } from "../../services/firebase";
import { OfficialLoginSheetModal } from "../OfficialLoginSheetModal";
import { StaffTransferResponsibilityModal } from "./StaffTransferResponsibilityModal";
import { StaffTransferHistoryTable } from "./StaffTransferHistoryTable";
import { InternalPortalsManagerTab } from "./InternalPortalsManagerTab";
import { StaffAddEditModal } from "./StaffAddEditModal";

const STORAGE_KEY_PLATFORM_STAFF = "ss_platform_internal_staff_v2";
const STORAGE_KEY_INTERNAL_PORTALS = "ss_internal_portals_v2";
const STORAGE_KEY_TRANSFER_RECORDS = "ss_platform_staff_transfers_v2";

interface OwnerStaffManagementModuleProps {
  currentOwnerName?: string;
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
  onSelectStaffPortal?: (staffMember: PlatformStaffMember) => void;
  onOpenStaffPortal?: (staffMember: PlatformStaffMember) => void;
}

export const PERMISSION_LABELS: Record<keyof PlatformStaffPermissions, { label: string; category: string; description: string }> = {
  canManageSchools: {
    label: "Gestion des Établissements",
    category: "Établissements & Réseau",
    description: "Créer, configurer et approuver les nouvelles écoles clientes"
  },
  canSuspendSchools: {
    label: "Suspension / Blocage d'Écoles",
    category: "Établissements & Réseau",
    description: "Coupe-circuit et suspension administrative d'établissements"
  },
  canManageInternalStaff: {
    label: "Gestion du Personnel Interne",
    category: "Gouvernance Plateforme",
    description: "Créer, éditer et attribuer des permissions au personnel SmartSchool"
  },
  canViewPlatformFinances: {
    label: "Consultation Financière Plateforme",
    category: "Finances & Commissions",
    description: "Visualiser les flux SaaS, commissions Mobile Money et soldes"
  },
  canManagePlatformFinances: {
    label: "Administration Financière & Versements",
    category: "Finances & Commissions",
    description: "Effectuer des réconciliations, modifier commissions et valider retraits"
  },
  canManageServerMaintenance: {
    label: "Maintenance & Monitoring Serveurs",
    category: "Technique & Infrastructure",
    description: "Visualiser l'état des serveurs, bases de données et sauvegardes cloud"
  },
  canAccessKillSwitches: {
    label: "Coupe-Circuits & Verrouillage d'Urgence",
    category: "Technique & Infrastructure",
    description: "Activer le mode lecture seule, verrouiller les API ou mode maintenance"
  },
  canManageSupportTickets: {
    label: "Support Client & Tickets",
    category: "Support & Assistance",
    description: "Traiter les demandes d'assistance des écoles, enseignants et parents"
  },
  canViewMissingPhotosAlerts: {
    label: "Visualisation Alertes Photos Manquantes",
    category: "Support & Assistance",
    description: "Accéder au tableau de détection automatique des photos absentes"
  },
  canNotifySchoolsForMissingPhotos: {
    label: "Relance Écoles Photos Manquantes",
    category: "Support & Assistance",
    description: "Transmettre des rappels officiels (WhatsApp/SMS/Email) aux directions"
  },
  canManagePlatformCommunications: {
    label: "Diffusion & Communications Nationales",
    category: "Communication",
    description: "Publier des annonces globales et des alertes sur tous les portails"
  },
  canViewNationalAnalytics: {
    label: "Statistiques & Données Nationales",
    category: "Statistiques & Métriques",
    description: "Consulter la cartographie des élèves, enseignants et performances"
  },
  canManageSecurityAlerts: {
    label: "Sécurité & Détection d'Intrusions",
    category: "Gouvernance Plateforme",
    description: "Analyser les tentatives de connexion suspectes et bannir des IP"
  },
  canAuditLogs: {
    label: "Consultation du Journal d'Audit",
    category: "Gouvernance Plateforme",
    description: "Voir l'historique inaltérable de toutes les opérations du personnel"
  },
  canManageCommercialLeads: {
    label: "Prospection & Déploiement Commercial",
    category: "Commercial & Partenariats",
    description: "Suivre les opportunités de contractualisation avec de nouvelles écoles"
  },
  canManageTrainingModules: {
    label: "Formations & Guides Pratiques",
    category: "Formation",
    description: "Créer et animer les sessions d'initiation pour les écoles partenaires"
  }
};

export function OwnerStaffManagementModule({
  currentOwnerName,
  userName,
  onAuditLog,
  onSelectStaffPortal,
  onOpenStaffPortal
}: OwnerStaffManagementModuleProps) {
  const effectiveOwnerName = currentOwnerName || userName || "Freddy KALONDA KAZADI";
  const handleOpenPortal = onSelectStaffPortal || onOpenStaffPortal;

  // Active Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<"staff_list" | "internal_portals" | "transfer_history">("staff_list");

  // Load Internal Portals
  const [portals, setPortals] = useState<InternalPortalConfig[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEY_INTERNAL_PORTALS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading portals:", e);
    }
    return DEFAULT_INTERNAL_PORTALS;
  });

  const savePortalsList = (updated: InternalPortalConfig[]) => {
    setPortals(updated);
    safeLocalStorage.setItem(STORAGE_KEY_INTERNAL_PORTALS, JSON.stringify(updated));
  };

  // Load Internal Staff
  const [staffList, setStaffList] = useState<PlatformStaffMember[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEY_PLATFORM_STAFF);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading staff list:", e);
    }
    return INITIAL_PLATFORM_STAFF;
  });

  const saveStaffList = (updated: PlatformStaffMember[]) => {
    setStaffList(updated);
    safeLocalStorage.setItem(STORAGE_KEY_PLATFORM_STAFF, JSON.stringify(updated));
  };

  // Load Transfer Records
  const [transferRecords, setTransferRecords] = useState<ResponsibilityTransferRecord[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEY_TRANSFER_RECORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error loading transfer records:", e);
    }
    return [];
  });

  const saveTransferRecords = (updated: ResponsibilityTransferRecord[]) => {
    setTransferRecords(updated);
    safeLocalStorage.setItem(STORAGE_KEY_TRANSFER_RECORDS, JSON.stringify(updated));
  };

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFonction, setFilterFonction] = useState<string>("all");
  const [filterPortal, setFilterPortal] = useState<string>("all");

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<PlatformStaffMember | null>(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSourceStaff, setTransferSourceStaff] = useState<PlatformStaffMember | null>(null);

  const [showLoginSheetModal, setShowLoginSheetModal] = useState(false);
  const [sheetAccountTarget, setSheetAccountTarget] = useState<UserAccount | null>(null);

  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetTargetStaff, setResetTargetStaff] = useState<PlatformStaffMember | null>(null);
  const [newTempPassword, setNewTempPassword] = useState("");

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Available functions
  const availableFunctions: PlatformStaffFunction[] = Object.keys(DEFAULT_PERMISSIONS_BY_FUNCTION) as PlatformStaffFunction[];

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchSearch = 
        staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone.includes(searchQuery) ||
        (staff.fonction || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staff.assignedPortalName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === "all" || staff.status === filterStatus;
      const matchFonction = filterFonction === "all" || staff.fonction === filterFonction;
      const matchPortal = filterPortal === "all" || staff.assignedPortalId === filterPortal;

      return matchSearch && matchStatus && matchFonction && matchPortal;
    });
  }, [staffList, searchQuery, filterStatus, filterFonction, filterPortal]);

  // Open modal for new staff
  const handleOpenCreateModal = () => {
    setEditingStaff(null);
    setShowAddEditModal(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (staff: PlatformStaffMember) => {
    setEditingStaff(staff);
    setShowAddEditModal(true);
  };

  // Open Transfer Modal
  const handleOpenTransferModal = (staff: PlatformStaffMember) => {
    setTransferSourceStaff(staff);
    setShowTransferModal(true);
  };

  // Confirm Transfer execution
  const handleConfirmTransfer = (
    record: ResponsibilityTransferRecord,
    updatedSource: PlatformStaffMember,
    updatedTarget: PlatformStaffMember
  ) => {
    // 1. Update Staff list
    const updatedList = staffList.map(s => {
      if (s.id === updatedSource.id) return updatedSource;
      if (s.id === updatedTarget.id) return updatedTarget;
      return s;
    });
    saveStaffList(updatedList);

    // 2. Add to Transfer history
    const updatedTransfers = [record, ...transferRecords];
    saveTransferRecords(updatedTransfers);

    // 3. Persist IAM accounts
    const sourceAccount = buildUserAccountFromStaff(updatedSource, "Staff2026!");
    persistUniversalUserAccount(sourceAccount);

    const targetAccount = buildUserAccountFromStaff(updatedTarget, "Staff2026!");
    persistUniversalUserAccount(targetAccount);

    if (onAuditLog) {
      onAuditLog(
        "Passation de Responsabilités",
        `Transfert de ${record.transferredResponsibilities.length} responsabilité(s) de ${record.sourceStaffName} vers ${record.targetStaffName} (Motif: ${record.reason}).`
      );
    }

    setShowTransferModal(false);
    setActionFeedback(`Passation réussie ! ${updatedTarget.fullName} a hérité des responsabilités.`);
    setTimeout(() => setActionFeedback(null), 4500);

    // Prompt to display the successor's updated Login Sheet
    handleGenerateLoginSheet(updatedTarget);
  };

  // Helper to build UserAccount from PlatformStaffMember
  const buildUserAccountFromStaff = (staff: PlatformStaffMember, assignedPassword?: string): UserAccount => {
    const pwd = assignedPassword || "Staff2026!";
    const assignedRole = staff.role === "Propriétaire" 
      ? "Propriétaire de la plateforme" 
      : staff.fonction === "Comptable de la plateforme" 
      ? "Comptable SmartSchool" 
      : staff.fonction === "Support technique" || staff.fonction === "Support utilisateurs" 
      ? "Support client" 
      : staff.role;

    const grantedPermissions = Object.keys(staff.assignedPermissions || {}).filter(
      k => (staff.assignedPermissions as any)[k]
    );

    const userAcc: UserAccount = {
      id: staff.id,
      dossierId: staff.id,
      dossierType: "smartschool_staff",
      username: staff.email.trim().toLowerCase(),
      fullName: staff.fullName,
      email: staff.email.trim().toLowerCase(),
      phone: staff.phone,
      role: assignedRole,
      functionTitle: staff.customFonctionTitle || staff.fonction,
      schoolId: "smartschool-national-rdc",
      schoolName: "PLATEFORME NATIONALE SMARTSCHOOL RDC",
      password: pwd,
      tempPassword: pwd,
      activationCode: pwd,
      isActive: staff.status === "Actif",
      isActivated: staff.status === "Actif",
      mustChangePasswordOnFirstLogin: false,
      createdAt: staff.createdAt,
      createdBy: effectiveOwnerName,
      creatorRole: "Propriétaire & Fondateur",
      portalUrl: `${getSafeOrigin()}/?schoolId=smartschool-national-rdc&login=${encodeURIComponent(staff.email.trim().toLowerCase())}&ref=staff_slip`,
      permissions: grantedPermissions,
      portalName: staff.assignedPortalName,
      ...( { 
        photoUrl: staff.photoUrl,
        photo: staff.photoUrl,
        status: staff.status,
        responsibilities: staff.responsibilities || [] 
      } as any )
    };

    return userAcc;
  };

  // Save new or edited staff from modal
  const handleSaveStaffFromModal = (staffData: Partial<PlatformStaffMember>, rawPassword?: string) => {
    const assignedPassword = rawPassword || "Staff2026!";

    if (editingStaff) {
      // Update
      const updatedList = staffList.map(s => {
        if (s.id === editingStaff.id) {
          return {
            ...s,
            ...staffData
          } as PlatformStaffMember;
        }
        return s;
      });
      saveStaffList(updatedList);

      const targetMember = updatedList.find(s => s.id === editingStaff.id)!;
      const account = buildUserAccountFromStaff(targetMember, assignedPassword);
      persistUniversalUserAccount(account);
      registerSecondaryUserWithFirebase(account.username, assignedPassword).catch(() => {});

      if (onAuditLog) {
        onAuditLog("Mise à Jour Personnel Interne", `Profil, portail et permissions de ${targetMember.fullName} enregistrés.`);
      }
      setActionFeedback(`Personnel ${targetMember.fullName} mis à jour.`);
      setTimeout(() => setActionFeedback(null), 3500);
      setShowAddEditModal(false);
    } else {
      // Create new
      const newStaffId = `staff-${Date.now().toString().slice(-4)}`;
      const newStaff: PlatformStaffMember = {
        id: newStaffId,
        nom: staffData.nom || "",
        postnom: staffData.postnom || "",
        prenom: staffData.prenom || "",
        fullName: staffData.fullName || "",
        phone: staffData.phone || "",
        email: staffData.email || "",
        photoUrl: staffData.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
        fonction: staffData.fonction || "Support utilisateurs",
        customFonctionTitle: staffData.customFonctionTitle,
        role: staffData.role || "Personnel Interne",
        status: staffData.status || "Actif",
        assignedPortalId: staffData.assignedPortalId,
        assignedPortalName: staffData.assignedPortalName,
        responsibilities: staffData.responsibilities || [],
        assignedPermissions: staffData.assignedPermissions || DEFAULT_PERMISSIONS_BY_FUNCTION["Support utilisateurs"],
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        notes: staffData.notes
      };

      const updatedList = [newStaff, ...staffList];
      saveStaffList(updatedList);

      const account = buildUserAccountFromStaff(newStaff, assignedPassword);
      persistUniversalUserAccount(account);
      registerSecondaryUserWithFirebase(account.username, assignedPassword).catch(() => {});

      if (onAuditLog) {
        onAuditLog("Création Personnel Interne", `Nouveau compte créé pour ${newStaff.fullName} (${newStaff.fonction}).`);
      }

      setShowAddEditModal(false);
      handleGenerateLoginSheet(newStaff, assignedPassword);
    }
  };

  // Toggle account status
  const handleToggleStatus = (staff: PlatformStaffMember) => {
    const newStatus = staff.status === "Actif" ? "Inactif" : "Actif";
    const updatedList = staffList.map(s => s.id === staff.id ? { ...s, status: newStatus as any } : s);
    saveStaffList(updatedList);

    const updatedStaff = updatedList.find(s => s.id === staff.id)!;
    const account = buildUserAccountFromStaff(updatedStaff);
    persistUniversalUserAccount(account);

    if (onAuditLog) {
      onAuditLog(
        `Statut Personnel : ${newStatus}`,
        `Le compte de ${staff.fullName} a été basculé à l'état ${newStatus}.`
      );
    }
    setActionFeedback(`Compte de ${staff.fullName} : ${newStatus}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Generate & Open Login Sheet Modal
  const handleGenerateLoginSheet = (staff: PlatformStaffMember, initialPassword?: string) => {
    const userAccount = buildUserAccountFromStaff(staff, initialPassword);
    setSheetAccountTarget(userAccount);
    setShowLoginSheetModal(true);
  };

  // Reset password handler
  const handleOpenPasswordReset = (staff: PlatformStaffMember) => {
    setResetTargetStaff(staff);
    setNewTempPassword(`SS-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowPasswordResetModal(true);
  };

  const handleConfirmPasswordReset = () => {
    if (!resetTargetStaff) return;

    const account = buildUserAccountFromStaff(resetTargetStaff, newTempPassword);
    persistUniversalUserAccount(account);
    registerSecondaryUserWithFirebase(account.username, newTempPassword).catch(() => {});

    if (onAuditLog) {
      onAuditLog(
        "Réinitialisation Mot de Passe Personnel",
        `Nouveau code temporaire et réinitialisation pour ${resetTargetStaff.fullName}`
      );
    }

    setShowPasswordResetModal(false);
    handleGenerateLoginSheet(resetTargetStaff, newTempPassword);
  };

  // Portal Management Handlers
  const handleSavePortal = (portal: InternalPortalConfig) => {
    const exists = portals.some(p => p.id === portal.id);
    let updated: InternalPortalConfig[];
    if (exists) {
      updated = portals.map(p => p.id === portal.id ? portal : p);
    } else {
      updated = [portal, ...portals];
    }
    savePortalsList(updated);
    setActionFeedback(`Portail "${portal.name}" enregistré avec succès.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleDeletePortal = (portalId: string) => {
    const updated = portals.filter(p => p.id !== portalId);
    savePortalsList(updated);
    setActionFeedback("Portail supprimé.");
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-indigo-400" />
                Gouvernance Souveraine du Propriétaire
              </span>
              <span className="text-xs text-slate-400 font-mono">IAM & Habilitations Opérationnelles</span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <Users className="h-7 w-7 text-amber-400" />
              <span>Gestion Complète du Personnel Interne SmartSchool RDC</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Supervisez les collaborateurs nationaux : création de comptes officiels, attribution des portails dédiés, matrice des permissions granulaires, génération des fiches d'accès sécurisées et passation inaltérable des responsabilités.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              id="create-staff-btn"
            >
              <UserPlus className="h-4 w-4" />
              <span>Nouveau Collaborateur Interne</span>
            </button>
          </div>
        </div>

        {/* SUB-TABS NAVIGATION */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab("staff_list")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "staff_list"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="h-4 w-4 text-indigo-500" />
            <span>Collaborateurs & Comptes ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("internal_portals")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "internal_portals"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layers className="h-4 w-4 text-indigo-500" />
            <span>Portails Dédiés & Espaces ({portals.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("transfer_history")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "transfer_history"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <History className="h-4 w-4 text-amber-500" />
            <span>Registre des Passations ({transferRecords.length})</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 1: STAFF LIST */}
      {activeSubTab === "staff_list" && (
        <div className="space-y-6">
          {/* SEARCH AND FILTER BAR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher nom, poste, email, portail..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500 font-bold">Fonction :</span>
                <select
                  value={filterFonction}
                  onChange={e => setFilterFonction(e.target.value)}
                  className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Toutes ({staffList.length})</option>
                  {availableFunctions.map(fn => (
                    <option key={fn} value={fn}>{fn}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold">Portail :</span>
                <select
                  value={filterPortal}
                  onChange={e => setFilterPortal(e.target.value)}
                  className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Tous les portails</option>
                  {portals.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold">Statut :</span>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Tous</option>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                  <option value="Suspendu">Suspendu</option>
                  <option value="Transféré">Transféré</option>
                </select>
              </div>
            </div>
          </div>

          {/* STAFF CARDS & GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredStaff.map(staff => {
              const grantedPermissionsCount = Object.values(staff.assignedPermissions || {}).filter(Boolean).length;
              const isOwner = staff.role === "Propriétaire";
              const assignedPortal = portals.find(p => p.id === staff.assignedPortalId) || {
                name: staff.assignedPortalName || `Portail ${staff.fonction}`,
                code: "PORTAL_DEDIE"
              };

              return (
                <div
                  key={staff.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all group"
                >
                  {/* TOP HEADER: PHOTO, NAMES & STATUS */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={staff.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                          alt={staff.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-800 shadow-md shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              isOwner 
                                ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                                : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                            }`}>
                              {staff.role}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {staff.id}</span>
                          </div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                            {staff.fullName}
                          </h4>
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {staff.fonction}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
                        staff.status === "Actif"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : staff.status === "Transféré"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                      }`}>
                        {staff.status}
                      </span>
                    </div>

                    {/* ASSIGNED PORTAL BADGE */}
                    <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 font-bold truncate">
                        <Layers className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{assignedPortal.name}</span>
                      </div>
                      <span className="text-[9px] font-mono font-black bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                        {assignedPortal.code}
                      </span>
                    </div>

                    {/* CONTACT INFO */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{staff.phone || "Non renseigné"}</span>
                      </div>
                    </div>

                    {/* RESPONSIBILITIES PREVIEW */}
                    {staff.responsibilities && staff.responsibilities.length > 0 && (
                      <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300 block">
                          📌 {staff.responsibilities.length} Responsabilité(s) attribuée(s) :
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {staff.responsibilities.slice(0, 2).map((r, i) => (
                            <span key={i} className="text-[10px] font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 truncate max-w-[200px]">
                              • {r}
                            </span>
                          ))}
                          {staff.responsibilities.length > 2 && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                              +{staff.responsibilities.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PERMISSIONS COUNTER */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                        <Sliders className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{grantedPermissionsCount} permissions actives</span>
                      </div>
                      {staff.lastLoginAt && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Actif: {staff.lastLoginAt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleGenerateLoginSheet(staff)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Générer et imprimer la fiche d'accès officielle avec QR code"
                      >
                        <FileText className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Fiche d&apos;Accès</span>
                      </button>

                      <button
                        onClick={() => handleOpenPasswordReset(staff)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Réinitialiser le mot de passe"
                      >
                        <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                        <span>Réinitialiser</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => handleOpenEditModal(staff)}
                        className="w-full py-2 bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        <span>Éditer Rôle, Portail & Permissions</span>
                      </button>
                    </div>

                    {/* Transfer Responsibilities and Suspend Row */}
                    <div className="flex items-center gap-2">
                      {!isOwner && (
                        <button
                          onClick={() => handleOpenTransferModal(staff)}
                          className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-amber-200 dark:border-amber-800"
                          title="Transférer et déléguer les responsabilités à un successeur"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                          <span>Transférer Responsabilités</span>
                        </button>
                      )}

                      {!isOwner && (
                        <button
                          onClick={() => handleToggleStatus(staff)}
                          className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            staff.status === "Actif"
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                          title={staff.status === "Actif" ? "Désactiver le compte" : "Activer le compte"}
                        >
                          {staff.status === "Actif" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                      )}
                    </div>

                    {handleOpenPortal && (
                      <button
                        onClick={() => handleOpenPortal(staff)}
                        className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-200/60 dark:border-indigo-800/60"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Tester le Portail Dédié ({assignedPortal.name})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INTERNAL PORTALS MANAGER */}
      {activeSubTab === "internal_portals" && (
        <InternalPortalsManagerTab
          portals={portals}
          staffList={staffList}
          currentOwnerName={effectiveOwnerName}
          onSavePortal={handleSavePortal}
          onDeletePortal={handleDeletePortal}
          onOpenPortalPreview={(p) => {
            const pseudoStaff = staffList.find(s => s.assignedPortalId === p.id) || staffList[0];
            if (pseudoStaff && handleOpenPortal) {
              handleOpenPortal(pseudoStaff);
            }
          }}
        />
      )}

      {/* TAB 3: TRANSFER HISTORY REGISTRY */}
      {activeSubTab === "transfer_history" && (
        <StaffTransferHistoryTable
          records={transferRecords}
        />
      )}

      {/* ADD / EDIT STAFF MODAL */}
      <StaffAddEditModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        editingStaff={editingStaff}
        portals={portals}
        availableFunctions={availableFunctions}
        onSave={handleSaveStaffFromModal}
      />

      {/* TRANSFER RESPONSIBILITY MODAL */}
      <StaffTransferResponsibilityModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        sourceStaff={transferSourceStaff}
        allStaff={staffList}
        portals={portals}
        currentOwnerName={effectiveOwnerName}
        onConfirmTransfer={handleConfirmTransfer}
      />

      {/* RESET PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordResetModal && resetTargetStaff && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                    Sécurité des Accès IAM
                  </span>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Réinitialiser le Compte : {resetTargetStaff.fullName}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPasswordResetModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Un nouveau code d'activation temporaire va être généré. L&apos;ancien mot de passe sera immédiatement invalidé et une nouvelle fiche d&apos;accès avec QR code sera produite.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block text-xs">Nouveau code temporaire / Mot de passe</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTempPassword}
                    onChange={e => setNewTempPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-indigo-600 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setNewTempPassword(`SS-${Math.floor(100000 + Math.random() * 900000)}`)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Générer un autre code aléatoire"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  onClick={() => setShowPasswordResetModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmPasswordReset}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  Valider & Générer la Fiche
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFFICIAL LOGIN SHEET PRINT/SHARE MODAL */}
      {showLoginSheetModal && sheetAccountTarget && (
        <OfficialLoginSheetModal
          account={sheetAccountTarget}
          onClose={() => setShowLoginSheetModal(false)}
          onOpenPortal={(acc) => {
            const member = staffList.find(s => s.id === acc.id || s.email.toLowerCase() === acc.email?.toLowerCase());
            if (member && handleOpenPortal) {
              handleOpenPortal(member);
            }
          }}
          schoolName="PLATEFORME NATIONALE SMARTSCHOOL RDC"
          provinceName="Kinshasa (Siège National)"
          schoolMotto="Technologie - Éducation - Souveraineté"
          schoolYear="2026-2027"
          creatorName={effectiveOwnerName}
          creatorRole="Propriétaire & Fondateur"
          photoUrl={(sheetAccountTarget as any).photoUrl}
        />
      )}
    </div>
  );
}
