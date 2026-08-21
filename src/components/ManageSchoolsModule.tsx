import React, { useState, useMemo } from "react";
import { 
   Building2, 
   Users, 
   Shield, 
   ShieldAlert, 
   ShieldCheck, 
   KeyRound, 
   Lock, 
   Unlock, 
   Power, 
   Search, 
   Filter, 
   Send, 
   Mail, 
   Phone, 
   Globe, 
   MapPin, 
   Calendar, 
   CheckCircle2, 
   XCircle, 
   AlertTriangle, 
   Plus, 
   Trash2, 
   Eye, 
   EyeOff, 
   Sparkles, 
   Activity, 
   FileText, 
   Layers, 
   Award, 
   GraduationCap, 
   Briefcase, 
   Clock, 
   Check, 
   X, 
   RefreshCw, 
   ChevronRight, 
   ArrowLeft, 
   Printer, 
   Crown, 
   UserCheck, 
   UserX, 
   Smartphone, 
   MessageSquare, 
   Laptop, 
   Fingerprint, 
   ExternalLink, 
   Copy, 
   Sliders,
   BadgeHelp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { School, UserAccount, Employee, Student, Parent } from "../types";
import { isFirebaseConfigured, sendPasswordResetEmailToUser } from "../services/firebase";
import { persistUniversalUserAccount } from "../services/accountActivationService";
import { safeLocalStorage } from "../utils/safeStorage";

interface ManageSchoolsModuleProps {
  schools?: School[];
  userAccounts?: UserAccount[];
  employees?: Employee[];
  students?: Student[];
  parents?: Parent[];
  userRole?: string;
  userName?: string;
  currentUserRole?: string;
  currentUserName?: string;
  onToggleSchoolStatus?: (schoolId: string, isSuspended: boolean) => void;
  onUpdateSchool?: (school: School) => void;
  onAddSchool?: (school: School) => void;
  onDeleteSchool?: (schoolId: string) => void;
  onUpdateUserAccount?: (accountId: string, updates: Partial<UserAccount>) => void;
  onSendMessageToSchools?: (params: { 
    targetSchoolId: "all" | string; 
    targetSchoolName: string;
    subject: string; 
    message: string; 
    channel: string; 
    priority: string 
  }) => void;
  onAuditLog?: (action: string, details: string) => void;
  activeSchoolId?: string;
  onSelectSchool?: (schoolId: string) => void;
}

export interface PlatformStaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "Actif" | "Suspendu";
  accessLevel: "Superviseur Global" | "Support Technique" | "Auditeur Sécurité" | "Développeur Cloud" | "Inspecteur National";
  createdAt: string;
  lastActive: string;
}

export function ManageSchoolsModule({
  schools = [],
  userAccounts = [],
  employees = [],
  students = [],
  parents = [],
  userRole: propUserRole = "PROPRIÉTAIRE DE LA PLATEFORME",
  userName: propUserName = "Propriétaire SmartSchool RDC",
  currentUserRole,
  currentUserName,
  onToggleSchoolStatus,
  onUpdateSchool,
  onAddSchool,
  onDeleteSchool,
  onUpdateUserAccount,
  onSendMessageToSchools,
  onAuditLog,
  activeSchoolId,
  onSelectSchool
}: ManageSchoolsModuleProps) {
  const userRole = currentUserRole || propUserRole;
  const userName = currentUserName || propUserName;

  // Main active navigation view inside "Gérer les écoles"
  const [activeSubView, setActiveSubView] = useState<
    | "schools_list"
    | "school_accounts_drilldown"
    | "platform_staff"
    | "broadcast_center"
    | "audit_logs"
  >("schools_list");

  // Selected school for account supervision & detail modal
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [viewingSchoolDetail, setViewingSchoolDetail] = useState<School | null>(null);

  // Search and filter states for schools
  const [schoolSearch, setSchoolSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Accounts drill-down filters
  const [accountSearch, setAccountSearch] = useState("");
  const [accountRoleFilter, setAccountRoleFilter] = useState<"ALL" | "direction" | "enseignants" | "eleves" | "parents" | "personnel">("ALL");
  const [accountStatusFilter, setAccountStatusFilter] = useState<"ALL" | "active" | "suspended">("ALL");

  // Reset password / credential modal
  const [resetModalAccount, setResetModalAccount] = useState<UserAccount | null>(null);
  const [newTempPassword, setNewTempPassword] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isResettingWithFirebase, setIsResettingWithFirebase] = useState(false);

  // Quick message modal (pre-targeted or national)
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [msgTargetSchoolId, setMsgTargetSchoolId] = useState<"all" | string>("all");
  const [msgChannel, setMsgChannel] = useState<"ALL" | "IN_APP" | "EMAIL" | "SMS">("ALL");
  const [msgPriority, setMsgPriority] = useState<"Normal" | "Important" | "Urgent">("Important");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null);

  // Broadcast History
  const [broadcastHistory, setBroadcastHistory] = useState<Array<{
    id: string;
    title: string;
    target: string;
    channel: string;
    priority: string;
    sentAt: string;
    status: string;
  }>>([
    {
      id: "bc-1",
      title: "Circulaire Officielle : Calendrier National des Évaluations Semestrielles EPST",
      target: "Toutes les écoles inscrites (National)",
      channel: "IN-APP + EMAIL",
      priority: "Important",
      sentAt: "15/08/2026 10:30",
      status: "Délivré avec succès"
    },
    {
      id: "bc-2",
      title: "Activation du Nouveau Protocole de Sauvegarde Souveraine & Chiffrement RDC",
      target: "Toutes les écoles inscrites (National)",
      channel: "TOUS CANAUX",
      priority: "Urgent",
      sentAt: "10/08/2026 14:00",
      status: "Délivré avec succès"
    }
  ]);

  // Platform Internal Staff State
  const [platformStaff, setPlatformStaff] = useState<PlatformStaffMember[]>([
    {
      id: "staff-1",
      name: "Ir IT Fred Kalonda",
      role: "Fondateur & Architecte Principal",
      email: "fredtech37@gmail.com",
      phone: "+243 994 202 940",
      status: "Actif",
      accessLevel: "Superviseur Global",
      createdAt: "01/01/2024",
      lastActive: "En ligne maintenant"
    },
    {
      id: "staff-2",
      name: "Ing. Patrick Mutombo",
      role: "Responsable Infrastructure Cloud & DevOps",
      email: "patrick.mutombo@smartschool.cd",
      phone: "+243 818 700 900",
      status: "Actif",
      accessLevel: "Développeur Cloud",
      createdAt: "15/03/2024",
      lastActive: "Il y a 15 min"
    },
    {
      id: "staff-3",
      name: "Mme Clarisse Mbala",
      role: "Superviseur Support Client & Relation Écoles RDC",
      email: "support.rdc@smartschool.cd",
      phone: "+243 822 450 110",
      status: "Actif",
      accessLevel: "Support Technique",
      createdAt: "01/06/2024",
      lastActive: "Il y a 1 heure"
    },
    {
      id: "staff-4",
      name: "Inspecteur National EPST Gaston Mukala",
      role: "Auditeur Conformité Pédagogique & Souveraineté",
      email: "gaston.mukala@epst.gouv.cd",
      phone: "+243 899 300 200",
      status: "Actif",
      accessLevel: "Inspecteur National",
      createdAt: "01/09/2024",
      lastActive: "Hier à 16:45"
    }
  ]);

  // Add new platform staff modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Ingénieur Support Technique");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("+243 ");
  const [newStaffLevel, setNewStaffLevel] = useState<PlatformStaffMember["accessLevel"]>("Support Technique");

  // Local school suspension status tracker
  const [schoolSuspensions, setSchoolSuspensions] = useState<Record<string, boolean>>({});

  // Local account suspension tracker
  const [accountSuspensions, setAccountSuspensions] = useState<Record<string, boolean>>({});

  // Security Audit Log records
  const [auditLogs, setAuditLogs] = useState<Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    target: string;
    details: string;
    severity: "info" | "warning" | "critical";
  }>>([
    {
      id: "log-1",
      timestamp: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR"),
      actor: userName,
      action: "Accès Espace Supervision Propriétaire",
      target: "Gérer les écoles",
      details: "Consultation du registre national et supervision des comptes",
      severity: "info"
    }
  ]);

  const addLocalAudit = (action: string, target: string, details: string, severity: "info" | "warning" | "critical" = "info") => {
    const newEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR"),
      actor: userName,
      action,
      target,
      details,
      severity
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    if (onAuditLog) {
      onAuditLog(action, `${target} - ${details}`);
    }
  };

  // Resolve currently selected school for account drilldown
  const activeSelectedSchool = useMemo(() => {
    if (!selectedSchoolId) return null;
    return schools.find(s => s.id === selectedSchoolId) || null;
  }, [selectedSchoolId, schools]);

  // Extract unique provinces
  const provincesList = useMemo(() => {
    return Array.from(new Set(schools.map(s => s.province).filter(Boolean))) as string[];
  }, [schools]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      const q = schoolSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        s.name.toLowerCase().includes(q) || 
        (s.codeNational || "").toLowerCase().includes(q) || 
        (s.province || "").toLowerCase().includes(q) || 
        (s.ville || "").toLowerCase().includes(q) || 
        (s.commune || "").toLowerCase().includes(q) ||
        (s.contactEmail || "").toLowerCase().includes(q);

      const matchesProvince = provinceFilter === "ALL" || s.province === provinceFilter;
      const matchesType = typeFilter === "ALL" || s.type === typeFilter;
      
      const isSusp = schoolSuspensions[s.id];
      const matchesStatus = statusFilter === "ALL" || 
        (statusFilter === "ACTIVE" && !isSusp) || 
        (statusFilter === "SUSPENDED" && isSusp);

      return matchesSearch && matchesProvince && matchesType && matchesStatus;
    });
  }, [schools, schoolSearch, provinceFilter, typeFilter, statusFilter, schoolSuspensions]);

  // Aggregate and calculate accounts for the selected school (or all accounts)
  const schoolAccounts = useMemo(() => {
    let list = userAccounts;
    if (selectedSchoolId) {
      list = userAccounts.filter(acc => {
        if (acc.schoolId) return acc.schoolId === selectedSchoolId;
        if (selectedSchoolId === "default") {
          return !acc.schoolId || acc.schoolId === "default" || acc.schoolName?.includes("SMARTSCHOOL");
        }
        return false;
      });
    }

    return list.filter(acc => {
      const q = accountSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        acc.username.toLowerCase().includes(q) || 
        (acc.fullName || "").toLowerCase().includes(q) || 
        (acc.email || "").toLowerCase().includes(q) || 
        (acc.phone || "").includes(q) || 
        acc.role.toLowerCase().includes(q) ||
        acc.dossierId.toLowerCase().includes(q);

      const roleLow = acc.role.toLowerCase();
      let matchesRole = true;
      if (accountRoleFilter === "direction") {
        matchesRole = roleLow.includes("directeur") || roleLow.includes("préfet") || roleLow.includes("promoteur") || roleLow.includes("secrétaire") || roleLow.includes("comptable") || roleLow.includes("caissier");
      } else if (accountRoleFilter === "enseignants") {
        matchesRole = roleLow.includes("enseignant") || roleLow.includes("professeur");
      } else if (accountRoleFilter === "eleves") {
        matchesRole = roleLow.includes("élève") || roleLow.includes("eleve") || acc.dossierType === "eleve";
      } else if (accountRoleFilter === "parents") {
        matchesRole = roleLow.includes("parent") || acc.dossierType === "parent";
      } else if (accountRoleFilter === "personnel") {
        matchesRole = acc.dossierType === "personnel" && !roleLow.includes("directeur") && !roleLow.includes("préfet") && !roleLow.includes("enseignant");
      }

      const isSusp = accountSuspensions[acc.id] ?? acc.isSuspended ?? !acc.isActive;
      let matchesStatus = true;
      if (accountStatusFilter === "active") matchesStatus = !isSusp;
      if (accountStatusFilter === "suspended") matchesStatus = isSusp;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [userAccounts, selectedSchoolId, accountSearch, accountRoleFilter, accountStatusFilter, accountSuspensions]);

  // Action handlers
  const handleToggleSchoolStatus = (school: School) => {
    const currentlySuspended = !!schoolSuspensions[school.id];
    const newSuspended = !currentlySuspended;
    setSchoolSuspensions(prev => ({ ...prev, [school.id]: newSuspended }));
    
    const actionLabel = newSuspended ? "Suspension Établissement" : "Réactivation Établissement";
    const detailMsg = newSuspended 
      ? `L'accès global de l'établissement '${school.name}' a été suspendu par le Propriétaire.`
      : `L'accès global de l'établissement '${school.name}' a été réactivé avec succès.`;

    addLocalAudit(actionLabel, school.name, detailMsg, newSuspended ? "warning" : "info");
  };

  const handleToggleAccountStatus = (account: UserAccount) => {
    const isCurrentlySuspended = accountSuspensions[account.id] ?? account.isSuspended ?? !account.isActive;
    const newSuspendedState = !isCurrentlySuspended;

    setAccountSuspensions(prev => ({ ...prev, [account.id]: newSuspendedState }));

    if (onUpdateUserAccount) {
      onUpdateUserAccount(account.id, {
        isActive: !newSuspendedState,
        isSuspended: newSuspendedState
      });
    }

    const action = newSuspendedState ? "Suspension de Compte" : "Réactivation de Compte";
    const target = `${account.fullName || account.username} (${account.role})`;
    const details = newSuspendedState 
      ? `Compte suspendu par le Propriétaire de la plateforme. Accès révoqué.`
      : `Compte réactivé par le Propriétaire de la plateforme.`;

    addLocalAudit(action, target, details, newSuspendedState ? "warning" : "info");
  };

  const handleOpenResetModal = (account: UserAccount) => {
    setResetModalAccount(account);
    setNewTempPassword(`Pass${Math.floor(1000 + Math.random() * 9000)}!`);
    setResetSuccessMessage(null);
  };

  const handleExecutePasswordReset = async () => {
    if (!resetModalAccount) return;

    if (isFirebaseConfigured && resetModalAccount.email) {
      setIsResettingWithFirebase(true);
      try {
        const res = await sendPasswordResetEmailToUser(resetModalAccount.email);
        setIsResettingWithFirebase(false);
        if (res.success) {
          setResetSuccessMessage(`E-mail officiel de réinitialisation Firebase envoyé à ${resetModalAccount.email}.`);
          addLocalAudit(
            "Réinitialisation Mot de Passe Firebase", 
            resetModalAccount.fullName || resetModalAccount.username, 
            `Envoi du lien officiel de réinitialisation à ${resetModalAccount.email}`
          );
          return;
        }
      } catch (e) {
        setIsResettingWithFirebase(false);
      }
    }

    // Standard Universal IAM Reset
    const newActivationCode = `ACT-RST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const accountUpdates: Partial<UserAccount> = {
      password: newTempPassword,
      tempPassword: newTempPassword,
      isTempPassword: true,
      activationCode: newActivationCode,
      isActivated: true,
      isActive: true,
      isSuspended: false,
      mustChangePasswordOnFirstLogin: true
    };

    const updatedAccountObj: UserAccount = {
      ...resetModalAccount,
      ...accountUpdates
    };

    persistUniversalUserAccount(updatedAccountObj);

    if (onUpdateUserAccount) {
      onUpdateUserAccount(resetModalAccount.id, accountUpdates);
    }

    // Sync partner schools registry in localStorage
    try {
      const rawPartnerSchools = safeLocalStorage.getItem("smartschool_partner_schools_registry_v2");
      if (rawPartnerSchools) {
        const partnerList = JSON.parse(rawPartnerSchools);
        const updatedPartnerList = partnerList.map((sch: any) => {
          if (sch.id === resetModalAccount.schoolId || sch.id === resetModalAccount.id || `acc-${sch.id}-admin` === resetModalAccount.id) {
            return {
              ...sch,
              tempPassword: newTempPassword,
              activationCode: newActivationCode,
              activationStatus: "Établissement Activé"
            };
          }
          return sch;
        });
        safeLocalStorage.setItem("smartschool_partner_schools_registry_v2", JSON.stringify(updatedPartnerList));
      }
    } catch {}

    setAccountSuspensions(prev => ({ ...prev, [resetModalAccount.id]: false }));
    setResetSuccessMessage(`Accès réinitialisé avec succès. Nouveau mot de passe temporaire : ${newTempPassword} (Code d'activation : ${newActivationCode})`);
    
    addLocalAudit(
      "Réinitialisation Accès & Mot de Passe", 
      resetModalAccount.fullName || resetModalAccount.username, 
      `Génération d'un mot de passe temporaire et déverrouillage du compte.`
    );
  };

  const handleSendOfficialBroadcast = () => {
    if (!msgSubject.trim() || !msgContent.trim()) return;

    const targetSchoolObj = msgTargetSchoolId === "all" 
      ? null 
      : schools.find(s => s.id === msgTargetSchoolId);

    const targetName = msgTargetSchoolId === "all" 
      ? "Toutes les écoles inscrites (Diffusion Nationale)" 
      : (targetSchoolObj?.name || "École Partenaire");

    const newBroadcast = {
      id: `bc-${Date.now()}`,
      title: msgSubject,
      target: targetName,
      channel: msgChannel,
      priority: msgPriority,
      sentAt: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR").slice(0, 5),
      status: "Délivré avec succès"
    };

    setBroadcastHistory(prev => [newBroadcast, ...prev]);

    if (onSendMessageToSchools) {
      onSendMessageToSchools({
        targetSchoolId: msgTargetSchoolId,
        targetSchoolName: targetName,
        subject: msgSubject,
        message: msgContent,
        channel: msgChannel,
        priority: msgPriority
      });
    }

    addLocalAudit(
      "Diffusion Communiqué Officiel", 
      targetName, 
      `Objet: '${msgSubject}' • Canal: ${msgChannel} • Priorité: ${msgPriority}`,
      msgPriority === "Urgent" ? "warning" : "info"
    );

    setBroadcastToast(`Votre message officiel a été transmis à : ${targetName}`);
    setMsgSubject("");
    setMsgContent("");
    setShowMessageModal(false);

    setTimeout(() => setBroadcastToast(null), 4000);
  };

  const handleAddPlatformStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    const newMember: PlatformStaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      role: newStaffRole,
      email: newStaffEmail.trim().toLowerCase(),
      phone: newStaffPhone,
      status: "Actif",
      accessLevel: newStaffLevel,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      lastActive: "Jamais connecté"
    };

    setPlatformStaff(prev => [...prev, newMember]);
    setShowAddStaffModal(false);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPhone("+243 ");

    addLocalAudit(
      "Création Collaborateur Plateforme", 
      newMember.name, 
      `Rôle: ${newMember.role} (${newMember.accessLevel}) • Email: ${newMember.email}`
    );
  };

  const handleToggleStaffStatus = (staffId: string) => {
    setPlatformStaff(prev => prev.map(s => {
      if (s.id === staffId) {
        const nextStatus = s.status === "Actif" ? "Suspendu" : "Actif";
        addLocalAudit(
          nextStatus === "Suspendu" ? "Suspension Personnel Interne" : "Réactivation Personnel Interne",
          s.name,
          `Statut modifié en: ${nextStatus}`
        );
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* --------------------------------------------------------------------------- */}
      {/* TOP HEADER: TITRE OFFICIEL, BADGE SOUVERAINETÉ & ACTIONS RAPIDES           */}
      {/* --------------------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Espace Réservé : Propriétaire de la Plateforme</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Multi-Tenancy Isolé &amp; Souverain RDC</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <Building2 className="h-8 w-8 text-indigo-400 shrink-0" />
              <span>Gérer les Écoles &amp; Comptes de la Plateforme</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Supervision globale des établissements scolaires enregistrés, consultation des fiches officielles, administration des comptes utilisateurs (personnels, administrateurs, enseignants, élèves), réinitialisation des accès et gestion de l&apos;équipe interne SmartSchool RDC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setMsgTargetSchoolId("all");
                setShowMessageModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Envoyer un Message aux Écoles</span>
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Écoles Enregistrées</span>
            <span className="text-xl sm:text-2xl font-black text-white">{schools.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">100% isolées en multi-tenant</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Comptes Supervisés</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-300">{userAccounts.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Admins, Enseignants, Élèves</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Équipe Interne RDC</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300">{platformStaff.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Personnel autorisé plateforme</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Provinces Couvertes</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-300">{provincesList.length || 1}</span>
            <span className="text-[10px] text-cyan-400 block mt-0.5">République Démocratique du Congo</span>
          </div>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      <AnimatePresence>
        {broadcastToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-900/90 text-emerald-100 rounded-2xl border border-emerald-500 shadow-xl flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{broadcastToast}</span>
            </div>
            <button onClick={() => setBroadcastToast(null)} className="text-emerald-300 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------- */}
      {/* NAVIGATION TABS DEDICATED TO "GÉRER LES ÉCOLES"                             */}
      {/* --------------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setActiveSubView("schools_list");
              setSelectedSchoolId(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubView === "schools_list" && !selectedSchoolId
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="h-4 w-4 text-indigo-400" />
            <span>1. Établissements &amp; Fiches ({schools.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubView("school_accounts_drilldown");
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubView === "school_accounts_drilldown"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="h-4 w-4 text-amber-400" />
            <span>2. Comptes Utilisateurs Écoles ({userAccounts.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubView("platform_staff");
              setSelectedSchoolId(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubView === "platform_staff"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Shield className="h-4 w-4 text-amber-300" />
            <span>3. Personnels Internes Plateforme ({platformStaff.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubView("broadcast_center");
              setSelectedSchoolId(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubView === "broadcast_center"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Send className="h-4 w-4 text-cyan-300" />
            <span>4. Communication &amp; Messages aux Écoles</span>
          </button>

          <button
            onClick={() => {
              setActiveSubView("audit_logs");
              setSelectedSchoolId(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubView === "audit_logs"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="h-4 w-4 text-slate-400" />
            <span>5. Journal d&apos;Audit Sécurité ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* VUE 1 : TOUTES LES ÉCOLES & FICHES INSTITUTIONNELLES                        */}
      {/* --------------------------------------------------------------------------- */}
      {activeSubView === "schools_list" && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom d'école, code EPST, province, ville, email..."
                value={schoolSearch}
                onChange={e => setSchoolSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={provinceFilter}
                onChange={e => setProvinceFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="ALL">Toutes les Provinces</option>
                {provincesList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="ALL">Tous régimes juridiques</option>
                <option value="Privé">Privé agréé</option>
                <option value="Conventionné">Conventionné</option>
                <option value="Public">Public officiel</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Établissements Actifs</option>
                <option value="SUSPENDED">Établissements Suspendus</option>
              </select>
            </div>
          </div>

          {/* SCHOOLS CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSchools.map(school => {
              const isSuspended = !!schoolSuspensions[school.id];
              const schoolAccountsCount = userAccounts.filter(a => a.schoolId === school.id || (school.id === "default" && (!a.schoolId || a.schoolId === "default"))).length;

              return (
                <div
                  key={school.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
                    isSuspended 
                      ? "border-amber-400/60 dark:border-amber-600/40 bg-amber-50/20 dark:bg-amber-950/10" 
                      : "border-slate-200 dark:border-slate-800 hover:border-indigo-400/50"
                  }`}
                >
                  <div className="p-6 space-y-4">
                    {/* TOP BADGE & NAME */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-base shadow-sm ${
                          isSuspended 
                            ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300"
                            : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                        }`}>
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base truncate">
                            {school.name}
                          </h3>
                          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                            Code National EPST : <span className="font-bold text-slate-700 dark:text-slate-300">{school.codeNational || "EPS-RDC-GEN"}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
                        isSuspended
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                      }`}>
                        {isSuspended ? "● Accès Suspendu" : "● Établissement Actif"}
                      </span>
                    </div>

                    {/* SCHOOL METADATA CHIPS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Province &amp; Ville</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{school.province} • {school.ville || school.commune || "Gombe"}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Régime Juridique</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{school.type || "Privé agréé"}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Comptes Utilisateurs</span>
                        <p className="font-black text-indigo-600 dark:text-indigo-400">{schoolAccountsCount} comptes supervisés</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Email Officiel</span>
                        <p className="font-medium text-slate-600 dark:text-slate-400 truncate">{school.contactEmail || "admin@smartschool.cd"}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Téléphone</span>
                        <p className="font-mono text-slate-600 dark:text-slate-400">{school.phonePrincipal || "+243 812 345 678"}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Année Scolaire</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{school.schoolYear || "2025-2026"}</p>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BAR PER SCHOOL */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSchoolId(school.id);
                          setActiveSubView("school_accounts_drilldown");
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Voir &amp; Gérer les Comptes</span>
                      </button>

                      <button
                        onClick={() => setViewingSchoolDetail(school)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Fiche Complète</span>
                      </button>

                      <button
                        onClick={() => {
                          setMsgTargetSchoolId(school.id);
                          setShowMessageModal(true);
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5 text-cyan-500" />
                        <span>Message Direct</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleSchoolStatus(school)}
                      className={`px-3 py-1.5 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 ${
                        isSuspended
                          ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                      }`}
                    >
                      <Power className="h-3 w-3" />
                      <span>{isSuspended ? "Réactiver l'École" : "Suspendre l'École"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* VUE 2 : COMPTES ET UTILISATEURS DE L'ÉTABLISSEMENT SÉLECTIONNÉ              */}
      {/* --------------------------------------------------------------------------- */}
      {activeSubView === "school_accounts_drilldown" && (
        <div className="space-y-6">
          {/* TOP BREADCRUMB & CONTEXT */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedSchoolId(null);
                  setActiveSubView("schools_list");
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Supervision des Comptes :</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {activeSelectedSchool ? activeSelectedSchool.name : "Tous les Établissements"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {schoolAccounts.length} compte(s) identifié(s) • Mots de passe, états d&apos;activation, suspensions et sessions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSchoolId || "ALL"}
                onChange={e => setSelectedSchoolId(e.target.value === "ALL" ? null : e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">Toutes les écoles confondues</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GOVERNANCE PRINCIPLE NOTICE */}
          <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-indigo-950 dark:text-indigo-200">
                Principe de Gouvernance &amp; Intégrité Institutionnelle :
              </p>
              <p className="text-indigo-900/80 dark:text-indigo-300 leading-relaxed">
                En tant que <strong>Propriétaire de la plateforme</strong>, vous supervisez l&apos;infrastructure, auditez la sécurité et administrez les accès (suspension, réactivation, réinitialisation de mot de passe). L&apos;inscription pédagogique des élèves, le recrutement des enseignants et la création des fiches de personnel relèvent de la responsabilité exclusive de la Direction de l&apos;école (Promoteur, Préfet, Secrétariat).
              </p>
            </div>
          </div>

          {/* ACCOUNTS FILTERS & SEARCH */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un compte par nom, email, identifiant, rôle ou matricule..."
                value={accountSearch}
                onChange={e => setAccountSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={accountRoleFilter}
                onChange={e => setAccountRoleFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="ALL">Toutes les catégories de rôles</option>
                <option value="direction">Direction &amp; Administrateurs</option>
                <option value="enseignants">Corps Enseignant</option>
                <option value="eleves">Élèves &amp; Apprenants</option>
                <option value="parents">Parents &amp; Tuteurs</option>
                <option value="personnel">Personnel d&apos;Appui</option>
              </select>

              <select
                value={accountStatusFilter}
                onChange={e => setAccountStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="ALL">Tous les statuts de compte</option>
                <option value="active">Comptes Actifs</option>
                <option value="suspended">Comptes Suspendus</option>
              </select>
            </div>
          </div>

          {/* ACCOUNTS TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Identité &amp; Compte</th>
                    <th className="p-3.5">Rôle Attribué</th>
                    <th className="p-3.5">Établissement</th>
                    <th className="p-3.5">Matricule / Dossier</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions d&apos;Administration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {schoolAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        Aucun compte utilisateur ne correspond aux critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    schoolAccounts.map(account => {
                      const isSuspended = accountSuspensions[account.id] ?? account.isSuspended ?? !account.isActive;
                      const roleLow = account.role.toLowerCase();

                      return (
                        <tr key={account.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/30 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{account.fullName || account.username}</span>
                              {account.isActivated && (
                                <span title="Compte Activé">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 inline" />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {account.username} {account.email ? `• ${account.email}` : ""}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                              roleLow.includes("directeur") || roleLow.includes("préfet") || roleLow.includes("promoteur")
                                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                : roleLow.includes("enseignant")
                                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                : roleLow.includes("élève") || roleLow.includes("eleve")
                                ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}>
                              {account.role}
                            </span>
                          </td>

                          <td className="p-3.5 text-slate-600 dark:text-slate-400">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {account.schoolName || (schools.find(s => s.id === account.schoolId)?.name) || "Complexe Scolaire RDC"}
                            </p>
                          </td>

                          <td className="p-3.5 font-mono text-slate-500 text-[10px]">
                            {account.dossierId || "DOSSIER-RDC"}
                          </td>

                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                              isSuspended ? "text-amber-500" : "text-emerald-500"
                            }`}>
                              ● {isSuspended ? "Suspendu" : "Actif"}
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              onClick={() => handleOpenResetModal(account)}
                              className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 transition-all cursor-pointer"
                              title="Réinitialiser l'accès ou le mot de passe"
                            >
                              <KeyRound className="h-3 w-3" />
                              <span>Reset MDP</span>
                            </button>

                            <button
                              onClick={() => handleToggleAccountStatus(account)}
                              className={`px-2.5 py-1.5 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 transition-all cursor-pointer ${
                                isSuspended
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300"
                                  : "bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              <Power className="h-3 w-3" />
                              <span>{isSuspended ? "Réactiver" : "Suspendre"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* VUE 3 : PERSONNELS INTERNES DE LA PLATEFORME (ÉQUIPE SMARTSCHOOL RDC)       */}
      {/* --------------------------------------------------------------------------- */}
      {activeSubView === "platform_staff" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                <span>Personnels Internes &amp; Opérateurs de la Plateforme SmartSchool RDC</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Membres de l&apos;équipe technique, développeurs cloud, auditeurs de sécurité et conseillers nationaux habilités.
              </p>
            </div>

            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Collaborateur Interne</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Collaborateur</th>
                    <th className="p-3.5">Fonction &amp; Rôle</th>
                    <th className="p-3.5">Niveau de Privilège</th>
                    <th className="p-3.5">Contacts</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {platformStaff.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/30">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{member.name}</div>
                        <div className="text-[10px] text-slate-400">Créé le : {member.createdAt}</div>
                      </td>

                      <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {member.role}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {member.accessLevel}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500 space-y-0.5 text-[11px]">
                        <p>{member.email}</p>
                        <p className="font-mono text-[10px]">{member.phone}</p>
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold ${
                          member.status === "Actif" ? "text-emerald-500" : "text-amber-500"
                        }`}>
                          ● {member.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleToggleStaffStatus(member.id)}
                          className={`px-2.5 py-1.5 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 transition-all cursor-pointer ${
                            member.status === "Actif"
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          <span>{member.status === "Actif" ? "Suspendre" : "Activer"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* VUE 4 : CENTRE DE COMMUNICATION & MESSAGES AUX ÉCOLES                        */}
      {/* --------------------------------------------------------------------------- */}
      {activeSubView === "broadcast_center" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Send className="h-5 w-5 text-indigo-600" />
                  <span>Diffuser un Message / Circulaire Officielle aux Établissements</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Envoyez des messages d&apos;information, alertes de sécurité et circulaires à toutes les écoles ou à un établissement ciblé.
                </p>
              </div>

              <button
                onClick={() => {
                  setMsgTargetSchoolId("all");
                  setShowMessageModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
              >
                <Send className="h-4 w-4" />
                <span>Rédiger un Nouveau Message</span>
              </button>
            </div>

            {/* BROADCAST HISTORY TABLE */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Historique des Messages et Communications Diffusées
              </h4>

              <div className="space-y-2.5">
                {broadcastHistory.map(item => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          item.priority === "Urgent" 
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                        }`}>
                          {item.priority}
                        </span>
                        <h5 className="font-black text-slate-800 dark:text-slate-200">{item.title}</h5>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Destinataire : <span className="font-bold text-slate-700 dark:text-slate-300">{item.target}</span> • Canal : {item.channel}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[11px]">
                      <span className="font-mono">{item.sentAt}</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* VUE 5 : JOURNAL D'AUDIT SÉCURITÉ                                            */}
      {/* --------------------------------------------------------------------------- */}
      {activeSubView === "audit_logs" && (
        <div className="space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <span>Journal d&apos;Audit des Opérations d&apos;Administration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Traçabilité immuable des actions effectuées par le Propriétaire et les administrateurs autorisés.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {auditLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">{log.target}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{log.details}</p>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[10px] text-slate-400">
                    <p>{log.timestamp}</p>
                    <p className="font-bold text-slate-600 dark:text-slate-300">{log.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* MODAL : FICHE INSTITUTIONNELLE DE L'ÉCOLE                                  */}
      {/* --------------------------------------------------------------------------- */}
      <AnimatePresence>
        {viewingSchoolDetail && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg">{viewingSchoolDetail.name}</h3>
                    <p className="text-xs text-indigo-300 font-mono mt-0.5">
                      Code National EPST : {viewingSchoolDetail.codeNational || "EPS-RDC-GEN"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setViewingSchoolDetail(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
                {/* IDENTITÉ OFFICIELLE */}
                <div className="space-y-2">
                  <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Identité Institutionnelle &amp; Localisation
                  </h4>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Devise</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{viewingSchoolDetail.motto || "Discipline - Travail - Excellence"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Province Éducationnelle</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{viewingSchoolDetail.provinceEducationnelle || viewingSchoolDetail.province}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Adresse Complète</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{viewingSchoolDetail.adresseComplete || "Av. de la Science, Commune de la Gombe"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Régime Juridique</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{viewingSchoolDetail.type || "Privé agréé"}</span>
                    </div>
                  </div>
                </div>

                {/* CONTACTS OFFICIELS */}
                <div className="space-y-2">
                  <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Contacts &amp; Représentation
                  </h4>
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email de Contact</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{viewingSchoolDetail.contactEmail || "direction@smartschool.cd"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Téléphone Principal</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewingSchoolDetail.phonePrincipal || "+243 812 345 678"}</span>
                    </div>
                  </div>
                </div>

                {/* STRUCTURE PÉDAGOGIQUE */}
                <div className="space-y-2">
                  <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Cycles &amp; Options Organisées
                  </h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Niveaux Organisés :</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(viewingSchoolDetail.levels || ["Primaire", "Secondaire", "Humanités"]).map((lvl, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded font-bold text-[10px]">
                            {lvl}
                          </span>
                        ))}
                      </div>
                    </div>

                    {viewingSchoolDetail.options && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Options Spécifiques :</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {viewingSchoolDetail.options.map((opt, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold text-[10px]">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const schId = viewingSchoolDetail.id;
                    setViewingSchoolDetail(null);
                    setSelectedSchoolId(schId);
                    setActiveSubView("school_accounts_drilldown");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Users className="h-4 w-4" />
                  <span>Superviser les Comptes de cette École</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------- */}
      {/* MODAL : RÉINITIALISATION DU MOT DE PASSE / ACCÈS                           */}
      {/* --------------------------------------------------------------------------- */}
      <AnimatePresence>
        {resetModalAccount && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">
                    Réinitialisation d&apos;Accès Sécurisé
                  </h3>
                </div>
                <button onClick={() => setResetModalAccount(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Utilisateur : {resetModalAccount.fullName || resetModalAccount.username}
                  </p>
                  <p className="text-slate-500">Rôle : {resetModalAccount.role}</p>
                  <p className="text-slate-500 font-mono">Identifiant : {resetModalAccount.username}</p>
                  {resetModalAccount.email && <p className="text-slate-500">Email : {resetModalAccount.email}</p>}
                </div>

                {isFirebaseConfigured && resetModalAccount.email ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-1">
                    <p className="font-bold">Firebase Authentication Détecté :</p>
                    <p>Un e-mail officiel de réinitialisation sécurisé peut être directement envoyé à l&apos;adresse de l&apos;utilisateur.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">Nouveau Mot de Passe Temporaire :</label>
                    <input
                      type="text"
                      value={newTempPassword}
                      onChange={e => setNewTempPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs"
                    />
                    <p className="text-[10px] text-slate-400">
                      L&apos;utilisateur sera invité à modifier ce mot de passe dès sa prochaine connexion.
                    </p>
                  </div>
                )}

                {resetSuccessMessage && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{resetSuccessMessage}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setResetModalAccount(null)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={handleExecutePasswordReset}
                    disabled={isResettingWithFirebase}
                    className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isResettingWithFirebase ? "Envoi..." : "Réinitialiser l'Accès"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------- */}
      {/* MODAL : RÉDIGER UN MESSAGE / COMMUNIQUÉ AUX ÉCOLES                         */}
      {/* --------------------------------------------------------------------------- */}
      <AnimatePresence>
        {showMessageModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-xl w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">
                    Transmission d&apos;un Message / Communiqué Officiel
                  </h3>
                </div>
                <button onClick={() => setShowMessageModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Destinataire :</label>
                  <select
                    value={msgTargetSchoolId}
                    onChange={e => setMsgTargetSchoolId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-indigo-600 dark:text-indigo-400"
                  >
                    <option value="all">📢 TOUTES LES ÉCOLES (Diffusion Nationale Globale)</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>🏫 {s.name} ({s.province})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Canal de Transmission :</label>
                    <select
                      value={msgChannel}
                      onChange={e => setMsgChannel(e.target.value as any)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                    >
                      <option value="ALL">Tous Canaux (In-App + Email + SMS)</option>
                      <option value="IN_APP">Notification In-App Uniquement</option>
                      <option value="EMAIL">E-mail Officiel</option>
                      <option value="SMS">SMS Direct RDC</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Niveau de Priorité :</label>
                    <select
                      value={msgPriority}
                      onChange={e => setMsgPriority(e.target.value as any)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                    >
                      <option value="Normal">Normal (Information standard)</option>
                      <option value="Important">Important (Circulaire / Notification)</option>
                      <option value="Urgent">Urgent (Sécurité / Clôture Impérative)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Objet / Titre du Message :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rappel de conformité des grilles de cotation EPST..."
                    value={msgSubject}
                    onChange={e => setMsgSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Contenu Officiel :</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Rédigez ici le texte officiel destiné aux directions d'établissements et gestionnaires..."
                    value={msgContent}
                    onChange={e => setMsgContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSendOfficialBroadcast}
                    disabled={!msgSubject.trim() || !msgContent.trim()}
                    className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Diffuser le Message</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------- */}
      {/* MODAL : AJOUTER UN PERSONNEL INTERNE DE LA PLATEFORME                       */}
      {/* --------------------------------------------------------------------------- */}
      <AnimatePresence>
        {showAddStaffModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">
                    Nouveau Collaborateur Interne SmartSchool RDC
                  </h3>
                </div>
                <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddPlatformStaff} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nom Complet :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ing. Alain Kazadi"
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Professionnel :</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: alain.kazadi@smartschool.cd"
                    value={newStaffEmail}
                    onChange={e => setNewStaffEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Téléphone de Contact :</label>
                  <input
                    type="text"
                    placeholder="+243 810 000 000"
                    value={newStaffPhone}
                    onChange={e => setNewStaffPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Intitulé du Poste :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ingénieur Infrastructure &amp; Sécurité"
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Niveau d&apos;Accès &amp; Privilège :</label>
                  <select
                    value={newStaffLevel}
                    onChange={e => setNewStaffLevel(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-amber-600 dark:text-amber-400"
                  >
                    <option value="Support Technique">Support Technique &amp; Relation Écoles</option>
                    <option value="Développeur Cloud">Développeur Cloud &amp; DevOps</option>
                    <option value="Auditeur Sécurité">Auditeur Sécurité &amp; Conformité</option>
                    <option value="Inspecteur National">Inspecteur National Pédagogique</option>
                    <option value="Superviseur Global">Superviseur Global Plateforme</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md cursor-pointer"
                  >
                    Enregistrer Collaborateur
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
