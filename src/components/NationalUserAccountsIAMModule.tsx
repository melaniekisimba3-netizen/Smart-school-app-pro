import React, { useState, useMemo } from "react";
import { UserAccount, School, Employee, Student, Parent, InscriptionAuditLog } from "../types";
import { 
  ShieldCheck, ShieldAlert, KeyRound, UserPlus, Users, Search, Filter, 
  Lock, Unlock, Power, RefreshCw, Printer, MessageSquare, Phone, Mail, 
  X, Check, Crown, Building2, Code, Laptop, Smartphone, Eye, EyeOff, 
  AlertTriangle, Sparkles, Activity, FileText, CheckCircle2, XCircle,
  HelpCircle, Trash2, Send, Clock, Layers, Shield, UserCheck, UserX,
  ExternalLink, QrCode, User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OfficialLoginSheetModal } from "./OfficialLoginSheetModal";
import { 
  provisionUserAccountForPerson, 
  generateUniqueActivationCode,
  ROLE_PORTAL_MAPPING 
} from "../services/accountActivationService";

interface NationalUserAccountsIAMModuleProps {
  userRole: string;
  userName: string;
  userAccounts: UserAccount[];
  schools: School[];
  employees: Employee[];
  students: Student[];
  parents: Parent[];
  onCreateUserAccount: (accountData: Partial<UserAccount>) => UserAccount;
  onUpdateUserAccount: (accountId: string, updates: Partial<UserAccount>) => void;
  onDeleteUserAccount: (accountId: string) => void;
  onOpenPortal?: (account: UserAccount) => void;
  onAuditLog?: (action: string, targetName: string) => void;
  activeSchoolId?: string;
  schoolMotto?: string;
  schoolLogo?: string;
}

export function NationalUserAccountsIAMModule({
  userRole = "Propriétaire",
  userName = "Propriétaire SmartSchool RDC",
  userAccounts = [],
  schools = [],
  employees = [],
  students = [],
  parents = [],
  onCreateUserAccount,
  onUpdateUserAccount,
  onDeleteUserAccount,
  onOpenPortal,
  onAuditLog,
  activeSchoolId = "default",
  schoolMotto = "Discipline - Travail - Excellence",
  schoolLogo = "https://images.unsplash.com/photo-1590086782957-93c06ef21604?auto=format&fit=crop&q=80&w=150"
}: NationalUserAccountsIAMModuleProps) {

  const isOwner = userRole.toLowerCase().includes("propriétaire") || userRole.toLowerCase().includes("super admin");
  const isSchoolAdmin = userRole.toLowerCase().includes("directeur") || userRole.toLowerCase().includes("promoteur") || userRole.toLowerCase().includes("préfet") || userRole.toLowerCase().includes("comptable") || userRole.toLowerCase().includes("rh");

  // Tab selection
  const [activeTab, setActiveTab] = useState<
    | "comptes_globaux"
    | "personnes_sans_compte"
    | "equipe_ssrdc"
    | "comptes_ecoles"
    | "journal_securite"
  >("comptes_globaux");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>("ALL");
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>("ALL");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [unprovisionedCategoryFilter, setUnprovisionedCategoryFilter] = useState<"ALL" | "students" | "parents" | "employees">("ALL");

  // Modal for Official Login Sheet
  const [selectedAccountForSheet, setSelectedAccountForSheet] = useState<UserAccount | null>(null);

  // Modal for Password Reset (Generates new activation code for first login re-setup)
  const [resetModalAccount, setResetModalAccount] = useState<UserAccount | null>(null);

  // Modal for Connected Devices / Kill Session
  const [devicesModalAccount, setDevicesModalAccount] = useState<UserAccount | null>(null);

  // Modal for Creating SmartSchool RDC Staff / Manual New Account
  const [isCreatingAccountModalOpen, setIsCreatingAccountModalOpen] = useState(false);
  const [createDossierType, setCreateDossierType] = useState<"smartschool_staff" | "school_admin" | "epst_inspector">("smartschool_staff");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState("Développeur SmartSchool RDC");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("+243 ");
  const [newSchoolId, setNewSchoolId] = useState(schools[0]?.id || "");
  const [newProvince, setNewProvince] = useState("Kinshasa");

  // Audit Logs Local State
  const [securityAuditLogs, setSecurityAuditLogs] = useState<Array<{
    id: string;
    actor: string;
    action: string;
    target: string;
    timestamp: string;
    ipAddress: string;
    device: string;
  }>>([
    {
      id: "sec-log-1",
      actor: "Propriétaire SmartSchool RDC",
      action: "Création de compte collaborateur",
      target: "Ir. Marc Kasongo (Développeur Cloud)",
      timestamp: new Date().toLocaleString("fr-FR"),
      ipAddress: "197.242.144.12",
      device: "MacBook Pro M3 (Kinshasa)"
    },
    {
      id: "sec-log-2",
      actor: "Direction des Études",
      action: "Création compte et Fiche de Connexion",
      target: "Gaston Tshibanda (Élève - 4ème Scientifique)",
      timestamp: new Date(Date.now() - 3600000).toLocaleString("fr-FR"),
      ipAddress: "197.242.145.88",
      device: "Chrome sur Windows 11"
    }
  ]);

  // Security checks
  if (!isOwner && !isSchoolAdmin) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl">
        <div className="p-4 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Accès Restreint IAM</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          La gestion des comptes utilisateurs est réservée exclusivement au Propriétaire de SmartSchool RDC et aux Administrateurs autorisés des établissements.
        </p>
      </div>
    );
  }

  // Filtered accounts
  const filteredUserAccounts = useMemo(() => {
    const seen = new Set<string>();
    return userAccounts.filter(acc => {
      if (!acc) return false;
      const uniqueKey = acc.id || acc.username || `acc-${Math.random()}`;
      if (seen.has(uniqueKey)) return false;
      seen.add(uniqueKey);

      // Tenant Isolation
      if (!isOwner && activeSchoolId && activeSchoolId !== "default") {
        if (acc.schoolId && acc.schoolId !== activeSchoolId) return false;
      }

      // Tab Specific Filters
      if (activeTab === "equipe_ssrdc") {
        if (acc.dossierType !== "smartschool_staff" && !acc.role.toLowerCase().includes("smartschool")) return false;
      } else if (activeTab === "comptes_ecoles") {
        if (!acc.role.toLowerCase().includes("directeur") && !acc.role.toLowerCase().includes("promoteur") && acc.dossierType !== "school_admin") return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (acc.fullName || "").toLowerCase().includes(q);
        const userMatch = (acc.username || "").toLowerCase().includes(q);
        const phoneMatch = (acc.phone || "").toLowerCase().includes(q);
        const roleMatch = (acc.role || "").toLowerCase().includes(q);
        const codeMatch = (acc.activationCode || "").toLowerCase().includes(q);
        const schoolMatch = (acc.schoolName || "").toLowerCase().includes(q);
        if (!nameMatch && !userMatch && !phoneMatch && !roleMatch && !codeMatch && !schoolMatch) return false;
      }

      // Dropdown Filters
      if (selectedSchoolFilter !== "ALL" && acc.schoolId !== selectedSchoolFilter) return false;
      if (selectedProvinceFilter !== "ALL" && acc.province !== selectedProvinceFilter) return false;
      if (selectedRoleFilter !== "ALL" && acc.role !== selectedRoleFilter) return false;
      if (selectedStatusFilter !== "ALL") {
        if (selectedStatusFilter === "Actif" && (!acc.isActive || acc.isSuspended || acc.isLocked)) return false;
        if (selectedStatusFilter === "Suspendu" && !acc.isSuspended) return false;
        if (selectedStatusFilter === "Verrouillé" && !acc.isLocked) return false;
        if (selectedStatusFilter === "NonActivé" && acc.isActivated) return false;
      }

      return true;
    });
  }, [userAccounts, isOwner, activeSchoolId, activeTab, searchQuery, selectedSchoolFilter, selectedProvinceFilter, selectedRoleFilter, selectedStatusFilter]);

  // List of registered people without accounts (Unprovisioned Dossiers)
  const unprovisionedPeople = useMemo(() => {
    const list: Array<{
      id: string;
      category: "student" | "parent" | "employee";
      categoryLabel: string;
      fullName: string;
      matriculeOrId: string;
      functionOrClass: string;
      contact: string;
      schoolName: string;
      schoolId?: string;
      rawObject: Student | Parent | Employee;
    }> = [];

    // 1. Students without user account
    students.forEach(s => {
      const existingAcc = userAccounts.find(a => a.dossierId === s.id || a.username.toLowerCase() === s.registrationNumber.toLowerCase());
      if (!s.hasUserAccount && !existingAcc) {
        list.push({
          id: s.id,
          category: "student",
          categoryLabel: "Élève",
          fullName: `${s.lastName} ${s.firstName} ${s.postName || ""}`.trim(),
          matriculeOrId: s.registrationNumber,
          functionOrClass: `${s.className} (${s.optionName})`,
          contact: s.parentPhone || "Parent : " + s.parentName,
          schoolName: "Établissement Scolaire",
          schoolId: s.schoolId,
          rawObject: s
        });
      }
    });

    // 2. Parents without user account
    parents.forEach(p => {
      const existingAcc = userAccounts.find(a => a.dossierId === p.id || a.phone === p.phone);
      if (!p.hasUserAccount && !p.accountCreated && !existingAcc) {
        list.push({
          id: p.id,
          category: "parent",
          categoryLabel: "Parent / Tuteur",
          fullName: `${p.lastName} ${p.firstName} ${p.postName || ""}`.trim(),
          matriculeOrId: p.parentAccountNumber || `PAR-${p.id.slice(-6).toUpperCase()}`,
          functionOrClass: p.relationship || "Tuteur légal",
          contact: p.phone || p.email,
          schoolName: "Établissement Scolaire",
          rawObject: p
        });
      }
    });

    // 3. Employees without user account
    employees.forEach(e => {
      const existingAcc = userAccounts.find(a => a.dossierId === e.id || a.username.toLowerCase() === e.matricule.toLowerCase());
      if (!e.hasUserAccount && !existingAcc) {
        list.push({
          id: e.id,
          category: "employee",
          categoryLabel: "Personnel RH",
          fullName: `${e.lastName} ${e.firstName}`.trim(),
          matriculeOrId: e.matricule,
          functionOrClass: `${e.function} - ${e.department}`,
          contact: e.phone || e.email,
          schoolName: "Établissement Scolaire",
          schoolId: e.schoolId,
          rawObject: e
        });
      }
    });

    return list.filter(item => {
      // Tenant filter
      if (!isOwner && activeSchoolId && activeSchoolId !== "default") {
        if (item.schoolId && item.schoolId !== activeSchoolId) return false;
      }

      // Category filter
      if (unprovisionedCategoryFilter === "students" && item.category !== "student") return false;
      if (unprovisionedCategoryFilter === "parents" && item.category !== "parent") return false;
      if (unprovisionedCategoryFilter === "employees" && item.category !== "employee") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.fullName.toLowerCase().includes(q);
        const matMatch = item.matriculeOrId.toLowerCase().includes(q);
        const catMatch = item.categoryLabel.toLowerCase().includes(q);
        const contactMatch = item.contact.toLowerCase().includes(q);
        if (!nameMatch && !matMatch && !catMatch && !contactMatch) return false;
      }

      return true;
    });
  }, [students, parents, employees, userAccounts, isOwner, activeSchoolId, unprovisionedCategoryFilter, searchQuery]);

  // Account Metrics
  const metrics = useMemo(() => {
    const total = userAccounts.length;
    const active = userAccounts.filter(a => a.isActive && !a.isSuspended && !a.isLocked).length;
    const suspended = userAccounts.filter(a => a.isSuspended).length;
    const locked = userAccounts.filter(a => a.isLocked).length;
    const pendingActivation = userAccounts.filter(a => !a.isActivated && !a.securityQuestionsSet).length;
    const unprovisionedCount = unprovisionedPeople.length;

    return { total, active, suspended, locked, pendingActivation, unprovisionedCount };
  }, [userAccounts, unprovisionedPeople]);

  // Action: Create account for registered person
  const handleCreateAccountForPerson = (person: typeof unprovisionedPeople[0]) => {
    const currentSchool = schools.find(s => s.id === (person.schoolId || activeSchoolId)) || {
      id: "school-1",
      name: "Établissement Scolaire SmartSchool RDC",
      province: "Kinshasa"
    };

    let targetRole = "Élève";
    let dossierType: "eleve" | "parent" | "personnel" = "eleve";

    if (person.category === "parent") {
      targetRole = "Parent";
      dossierType = "parent";
    } else if (person.category === "employee") {
      targetRole = (person.rawObject as Employee).function || "Enseignant";
      dossierType = "personnel";
    }

    const { userAccount, auditEvent } = provisionUserAccountForPerson(
      {
        dossierId: person.id,
        dossierType,
        fullName: person.fullName,
        identifierOrMatricule: person.matriculeOrId,
        targetRole,
        phone: (person.rawObject as any).phone || (person.rawObject as any).parentPhone,
        email: (person.rawObject as any).email || (person.rawObject as any).parentEmail,
        functionOrClass: person.functionOrClass,
        schoolId: currentSchool.id,
        schoolName: currentSchool.name,
        province: (currentSchool as any).province || ""
      },
      {
        operatorName: userName,
        operatorRole: userRole
      }
    );

    // Save to user accounts
    const createdAcc = onCreateUserAccount(userAccount);

    // Add Audit Log
    setSecurityAuditLogs(prev => [
      {
        id: `sec-log-${Date.now()}`,
        actor: `${userName} (${userRole})`,
        action: "Création de compte & Génération Fiche",
        target: `${person.fullName} (${targetRole})`,
        timestamp: new Date().toLocaleString("fr-FR"),
        ipAddress: "197.242.144.55",
        device: "Console Administrative SmartSchool RDC"
      },
      ...prev
    ]);

    if (onAuditLog) {
      onAuditLog("Création de compte utilisateur", `${person.fullName} (${targetRole})`);
    }

    // Automatically open the Official Login Sheet Modal
    setSelectedAccountForSheet(createdAcc || userAccount);
  };

  // Action: Toggle Account Suspension
  const handleToggleSuspend = (acc: UserAccount) => {
    const isSuspending = !acc.isSuspended;
    onUpdateUserAccount(acc.id, { isSuspended: isSuspending });
    if (onAuditLog) {
      onAuditLog(isSuspending ? "Suspension de compte" : "Réactivation de compte", acc.fullName || acc.username);
    }
  };

  // Action: Toggle Lock
  const handleToggleLock = (acc: UserAccount) => {
    const isLocking = !acc.isLocked;
    onUpdateUserAccount(acc.id, { isLocked: isLocking, failedLoginAttempts: 0 });
    if (onAuditLog) {
      onAuditLog(isLocking ? "Verrouillage de compte" : "Déverrouillage de compte", acc.fullName || acc.username);
    }
  };

  // Action: Regenerate Activation Code
  const handleRegenerateActivationCode = (acc: UserAccount) => {
    const newCode = generateUniqueActivationCode(acc.role || "USER");
    onUpdateUserAccount(acc.id, { 
      activationCode: newCode,
      isActivated: false,
      securityQuestionsSet: false 
    });

    if (onAuditLog) onAuditLog("Régénération Code d'Activation", acc.fullName || acc.username);
    alert(`⚡ Nouveau Code d'Activation généré : ${newCode}\nL'ancien code a été révoqué.`);
  };

  // Action: Delete Account
  const handleDeleteAccount = (acc: UserAccount) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le compte d'accès de ${acc.fullName || acc.username} ? Le dossier administratif sous-jacent sera conservé.`)) {
      onDeleteUserAccount(acc.id);
      if (onAuditLog) onAuditLog("Suppression de compte utilisateur", acc.fullName || acc.username);
    }
  };

  return (
    <div className="space-y-6 text-left" id="national-iam-root">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-blue to-indigo-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <ShieldCheck className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase rounded-full tracking-wider flex items-center gap-1">
                <Crown className="h-3 w-3 text-amber-400" />
                {isOwner ? "Centre National Propriétaire" : "Gestion IAM & Comptes Établissement"}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Zero-Trust IAM • SmartSchool RDC
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {isOwner ? "Gestion Nationale des Comptes Utilisateurs & Portails" : "Gestion des Comptes & Codes d'Activation"}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Création des comptes en 1 clic depuis les dossiers administratifs, distribution des codes d'activation uniques (sans mot de passe par défaut) et fiches officielles imprimables et partageables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("personnes_sans_compte")}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              id="view-unprovisioned-people-btn"
            >
              <UserPlus className="h-4 w-4" />
              <span>Dossiers sans Compte ({metrics.unprovisionedCount})</span>
            </button>
          </div>
        </div>

        {/* METRICS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-6 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
            <span className="text-[10px] text-slate-300 font-bold uppercase block">Comptes Créés</span>
            <span className="text-lg font-black text-white">{metrics.total}</span>
          </div>
          <div className="bg-emerald-500/20 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">Comptes Actifs</span>
            <span className="text-lg font-black text-emerald-300">{metrics.active}</span>
          </div>
          <div className="bg-amber-500/20 backdrop-blur-md p-3 rounded-2xl border border-amber-500/30">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">En attente 1ère Connexion</span>
            <span className="text-lg font-black text-amber-300">{metrics.pendingActivation}</span>
          </div>
          <div className="bg-purple-500/20 backdrop-blur-md p-3 rounded-2xl border border-purple-500/30">
            <span className="text-[10px] text-purple-300 font-bold uppercase block">Dossiers sans Compte</span>
            <span className="text-lg font-black text-purple-300">{metrics.unprovisionedCount}</span>
          </div>
          <div className="bg-rose-500/20 backdrop-blur-md p-3 rounded-2xl border border-rose-500/30">
            <span className="text-[10px] text-rose-300 font-bold uppercase block">Suspendus / Bloqués</span>
            <span className="text-lg font-black text-rose-300">{metrics.suspended + metrics.locked}</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("comptes_globaux")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "comptes_globaux"
              ? "bg-brand-blue text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
          id="tab-comptes-globaux-btn"
        >
          <Users className="h-4 w-4" />
          <span>Comptes Créés ({filteredUserAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("personnes_sans_compte")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "personnes_sans_compte"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
          id="tab-personnes-sans-compte-btn"
        >
          <UserPlus className="h-4 w-4" />
          <span>Dossiers sans Compte ({unprovisionedPeople.length})</span>
        </button>

        {isOwner && (
          <>
            <button
              onClick={() => setActiveTab("equipe_ssrdc")}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "equipe_ssrdc"
                  ? "bg-purple-700 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Code className="h-4 w-4" />
              <span>Équipe SmartSchool RDC</span>
            </button>

            <button
              onClick={() => setActiveTab("comptes_ecoles")}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "comptes_ecoles"
                  ? "bg-indigo-700 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Comptes Écoles ({schools.length})</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab("journal_securite")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "journal_securite"
              ? "bg-slate-900 dark:bg-slate-700 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Journal d'Audit IAM & Sécurité</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      {activeTab !== "journal_securite" && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par Nom, Matricule, Téléphone (+243), Code Activation..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {activeTab === "personnes_sans_compte" ? (
              <div>
                <select
                  value={unprovisionedCategoryFilter}
                  onChange={e => setUnprovisionedCategoryFilter(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                >
                  <option value="ALL">👥 Toutes les Catégories</option>
                  <option value="students">🎓 Élèves uniquement</option>
                  <option value="parents">👨‍👩‍👧 Parents uniquement</option>
                  <option value="employees">👔 Personnel / Enseignants</option>
                </select>
              </div>
            ) : (
              <div>
                <select
                  value={selectedStatusFilter}
                  onChange={e => setSelectedStatusFilter(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                >
                  <option value="ALL">⚡ Tous les Statuts</option>
                  <option value="Actif">🟢 Comptes Activés</option>
                  <option value="NonActivé">⏳ En attente de 1ère connexion</option>
                  <option value="Suspendu">🔴 Suspendus</option>
                  <option value="Verrouillé">🔒 Verrouillés</option>
                </select>
              </div>
            )}

            {/* Role filter */}
            <div>
              <select
                value={selectedRoleFilter}
                onChange={e => setSelectedRoleFilter(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
              >
                <option value="ALL">👤 Tous les Profils</option>
                <option value="Élève">Élève</option>
                <option value="Parent">Parent / Tuteur</option>
                <option value="Enseignant">Enseignant</option>
                <option value="Directeur">Directeur</option>
                <option value="Promoteur">Promoteur</option>
                <option value="Comptable">Comptable</option>
                <option value="Secrétaire">Secrétaire</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 1: DOSSIERS SANS COMPTE (À PROVISIONNER) */}
      {activeTab === "personnes_sans_compte" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-500" />
                <span>Personnes Enregistrées sans Compte d'Accès</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cliquez sur <strong>« Créer le compte »</strong> pour générer l'identifiant, le code d'activation unique et imprimer la fiche de connexion.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {unprovisionedPeople.length} personne(s) à activer
            </span>
          </div>

          {unprovisionedPeople.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tous les dossiers enregistrés disposent déjà d'un compte d'accès actif !
              </h4>
              <p className="text-xs text-slate-400">
                Lors de l'enregistrement de nouveaux élèves, parents ou agents, ils apparaîtront automatiquement ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {unprovisionedPeople.map((person, idx) => {
                const badgeColor = person.category === "student"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200"
                  : person.category === "parent"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200";

                return (
                  <div key={`${person.id}-${idx}`} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-950/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-sm">
                        {person.fullName ? person.fullName.substring(0, 2).toUpperCase() : "DP"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            {person.fullName}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badgeColor}`}>
                            {person.categoryLabel}
                          </span>
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold">
                            Matricule / ID : {person.matriculeOrId}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4 flex-wrap">
                          <span>📍 <strong>{person.functionOrClass}</strong></span>
                          <span>📞 {person.contact}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCreateAccountForPerson(person)}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
                        id={`create-account-btn-${person.id}`}
                      >
                        <KeyRound className="h-4 w-4" />
                        <span>Créer le compte</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: COMPTES CRÉÉS */}
      {activeTab === "comptes_globaux" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Répertoire des Comptes Utilisateurs ({filteredUserAccounts.length})</span>
            </h3>
            <span className="text-xs text-slate-500">
              Protection Zero-Trust & Code d'activation
            </span>
          </div>

          {filteredUserAccounts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="h-10 w-10 text-slate-400 mx-auto opacity-40" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Aucun compte utilisateur ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUserAccounts.map((acc, accIdx) => {
                const isAccActive = acc.isActive && !acc.isSuspended && !acc.isLocked;

                return (
                  <div key={`${acc.id || 'acc'}-${accIdx}`} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-950/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-sm">
                        {acc.fullName ? acc.fullName.substring(0, 2).toUpperCase() : "US"}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {acc.fullName || acc.username}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-brand-blue dark:text-blue-300 font-bold text-[10px] rounded">
                            {acc.role}
                          </span>
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold">
                            Code : {acc.activationCode || "ACT-VALIDÉ"}
                          </span>

                          {/* Status Badge */}
                          {acc.isSuspended ? (
                            <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold text-[10px] rounded flex items-center gap-1">
                              <Power className="h-3 w-3" /> Suspendu
                            </span>
                          ) : acc.isLocked ? (
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold text-[10px] rounded flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Verrouillé
                            </span>
                          ) : acc.isActivated || acc.securityQuestionsSet ? (
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Activé
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-[10px] rounded border border-amber-200 dark:border-amber-800">
                              ⏳ En attente d'activation
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4 flex-wrap">
                          <span>🔑 Login : <strong className="text-slate-800 dark:text-slate-200 font-mono">{acc.username}</strong></span>
                          <span>📞 {acc.phone || "Non renseigné"}</span>
                          <span>🏫 {acc.schoolName || "SmartSchool RDC"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Direct Open Portal Button */}
                      {onOpenPortal && (
                        <button
                          onClick={() => onOpenPortal(acc)}
                          className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          id={`open-portal-btn-${acc.id}`}
                          title={`Ouvrir directement le portail ${acc.portalName || acc.role}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Ouvrir le portail</span>
                        </button>
                      )}

                      {/* View & Print Official Sheet */}
                      <button
                        onClick={() => setSelectedAccountForSheet(acc)}
                        className="px-3.5 py-2 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        id={`view-login-sheet-btn-${acc.id}`}
                      >
                        <Printer className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Fiche Officielle</span>
                      </button>

                      {/* Regenerate Activation Code (if pending) */}
                      {!acc.isActivated && (
                        <button
                          onClick={() => handleRegenerateActivationCode(acc)}
                          className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          title="Régénérer le Code d'Activation"
                          id={`regen-code-btn-${acc.id}`}
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-brand-blue" />
                          <span>Nouveau Code</span>
                        </button>
                      )}

                      {/* Suspend / Reactivate */}
                      <button
                        onClick={() => handleToggleSuspend(acc)}
                        className={`px-2.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                          acc.isSuspended
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                        }`}
                        title={acc.isSuspended ? "Réactiver le compte" : "Suspendre le compte"}
                      >
                        <Power className="h-3.5 w-3.5" />
                        <span>{acc.isSuspended ? "Réactiver" : "Suspendre"}</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteAccount(acc)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                        title="Supprimer le compte"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: JOURNAL D'AUDIT SÉCURITÉ */}
      {activeTab === "journal_securite" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-blue" />
              <span>Journal d'Audit IAM & Traçabilité Nationale</span>
            </h3>
            <span className="text-xs text-slate-400">Total : {securityAuditLogs.length} événements</span>
          </div>

          <div className="space-y-2">
            {securityAuditLogs.map(log => (
              <div key={log.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white">{log.actor}</span>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-brand-blue dark:text-blue-300 font-bold rounded text-[10px]">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Cible : <strong className="text-slate-900 dark:text-white">{log.target}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    IP : {log.ipAddress} • Terminal : {log.device}
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-mono">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OFFICIAL LOGIN SHEET MODAL */}
      {selectedAccountForSheet && (
        <OfficialLoginSheetModal
          account={selectedAccountForSheet}
          schoolName={selectedAccountForSheet.schoolName || "ÉTABLISSEMENT SCOLAIRE SMARTSCHOOL RDC"}
          schoolLogoUrl={schoolLogo}
          schoolMotto={schoolMotto}
          creatorName={userName}
          creatorRole={userRole}
          onOpenPortal={onOpenPortal}
          onRegenerateCode={(accountId) => {
            handleRegenerateActivationCode(selectedAccountForSheet);
          }}
          onClose={() => setSelectedAccountForSheet(null)}
        />
      )}

    </div>
  );
}
