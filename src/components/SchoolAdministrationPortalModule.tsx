import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  KeyRound, 
  Printer, 
  Share2, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Check, 
  X, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Clock, 
  Sparkles, 
  Building, 
  GraduationCap, 
  Briefcase, 
  Landmark, 
  BookOpen, 
  Settings, 
  Sliders, 
  Layers, 
  ExternalLink, 
  Copy, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  RotateCcw,
  BadgeCheck,
  UserCheck,
  UserX,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { School, Employee, UserAccount, Role } from "../types";
import { safeLocalStorage, safeCopyToClipboard, getSafeOrigin } from "../utils/safeStorage";
import { persistUniversalUserAccount, ROLE_PORTAL_MAPPING } from "../services/accountActivationService";
import { OfficialLoginSheetModal } from "./OfficialLoginSheetModal";

export interface SchoolPortalDefinition {
  id: string;
  portalCode: string;
  name: string;
  targetRole: string;
  targetTab: string;
  category: "Direction & Gouvernance" | "Pédagogie & Études" | "Administration & Finances" | "Services & Support";
  iconName: "Crown" | "Building" | "Landmark" | "Briefcase" | "BookOpen" | "GraduationCap" | "ShieldCheck" | "Users" | "Settings" | "Sparkles";
  description: string;
  defaultPermissions: string[];
  requiredModule?: string;
}

export const CANONICAL_SCHOOL_PORTALS: SchoolPortalDefinition[] = [
  {
    id: "portal-promoteur",
    portalCode: "PORTAL_PROMOTER",
    name: "Promoteur de l'Établissement",
    targetRole: "Promoteur",
    targetTab: "dashboard",
    category: "Direction & Gouvernance",
    iconName: "Crown",
    description: "Supervision stratégique, audit global, gouvernance institutionnelle et validation exécutive",
    defaultPermissions: ["view_all", "audit_school", "finance_overview", "hr_overview", "admin_config"]
  },
  {
    id: "portal-directeur-gen",
    portalCode: "PORTAL_DIRECTOR_GEN",
    name: "Directeur Général / Chef d'Établissement",
    targetRole: "Directeur Général",
    targetTab: "dashboard",
    category: "Direction & Gouvernance",
    iconName: "Building",
    description: "Direction opérationnelle complète, validation des inscriptions, rapports EPST et gestion globale",
    defaultPermissions: ["manage_school", "validate_inscriptions", "manage_staff", "view_finances", "print_official_docs"]
  },
  {
    id: "portal-prefet",
    portalCode: "PORTAL_PREFECT",
    name: "Préfet des Études (Secondaire & Humanités)",
    targetRole: "Préfet des Études",
    targetTab: "dashboard",
    category: "Pédagogie & Études",
    iconName: "BookOpen",
    description: "Coordination pédagogique, grille horaire, affectation des cours, délibérations et cotes",
    defaultPermissions: ["manage_pedagogy", "manage_timetable", "validate_grades", "deliberations", "manage_discipline"]
  },
  {
    id: "portal-dir-primaire",
    portalCode: "PORTAL_DIR_PRIMAIRE",
    name: "Directeur du Primaire",
    targetRole: "Directeur du Primaire",
    targetTab: "dashboard",
    category: "Pédagogie & Études",
    iconName: "GraduationCap",
    description: "Gestion du cycle primaire, encadrement des instituteurs, présences et palmarès",
    defaultPermissions: ["manage_primary", "manage_teachers", "manage_students", "validate_grades"]
  },
  {
    id: "portal-dir-maternelle",
    portalCode: "PORTAL_DIR_MATERNELLE",
    name: "Directrice de la Maternelle",
    targetRole: "Directrice de la Maternelle",
    targetTab: "dashboard",
    category: "Pédagogie & Études",
    iconName: "Sparkles",
    description: "Gestion des sections d'éveil, suivi de la petite enfance et relations parents-maternelle",
    defaultPermissions: ["manage_maternelle", "manage_educatrices", "manage_students"]
  },
  {
    id: "portal-secretaire",
    portalCode: "PORTAL_SECRETARIAT",
    name: "Secrétaire Général / Secrétariat",
    targetRole: "Secrétaire",
    targetTab: "eleves",
    category: "Administration & Finances",
    iconName: "Briefcase",
    description: "Inscriptions d'élèves, registres officiels, impression des cartes et correspondances administratives",
    defaultPermissions: ["manage_inscriptions", "print_cards", "print_official_lists", "manage_student_files"]
  },
  {
    id: "portal-comptable",
    portalCode: "PORTAL_FINANCE",
    name: "Comptable Principal / Caisse",
    targetRole: "Comptable Principal",
    targetTab: "comptabilite",
    category: "Administration & Finances",
    iconName: "Landmark",
    description: "Encaissements des frais scolaires, paiements Mobile Money/Banque, gestion de la caisse et reçus",
    defaultPermissions: ["manage_finances", "manage_cashier", "validate_payments", "export_financial_reports"]
  },
  {
    id: "portal-rh",
    portalCode: "PORTAL_HR",
    name: "Administrateur des Ressources Humaines (RH)",
    targetRole: "Administrateur RH",
    targetTab: "rh",
    category: "Administration & Finances",
    iconName: "Users",
    description: "Dossiers du personnel, contrats, organigramme, présences, congés, évaluations et fiches de paie",
    defaultPermissions: ["manage_hr", "manage_contracts", "manage_attendance", "manage_evaluations", "manage_accounts"]
  },
  {
    id: "portal-gestionnaire",
    portalCode: "PORTAL_GESTIONNAIRE",
    name: "Gestionnaire / Intendant du Patrimoine",
    targetRole: "Gestionnaire",
    targetTab: "dashboard",
    category: "Services & Support",
    iconName: "Settings",
    description: "Logistique scolaire, stocks, matériel informatique, maintenance des bâtiments et inventaire",
    defaultPermissions: ["manage_inventory", "manage_logistics", "maintenance_tracking", "school_parameters"]
  }
];

export interface SchoolPortalAssignment {
  portalId: string;
  schoolId: string;
  status: "Disponible" | "Attribué" | "Actif";
  assignedPersonId?: string;
  assignedPersonName?: string;
  assignedPersonEmail?: string;
  assignedPersonPhone?: string;
  assignedPersonMatricule?: string;
  assignedPersonPhoto?: string;
  assignedAccountId?: string;
  assignedRole: string;
  assignedAt?: string;
  lastLoginAt?: string;
  isAccountActive?: boolean;
}

export interface PortalAuditLog {
  id: string;
  schoolId: string;
  date: string;
  portalName: string;
  action: "Nomination" | "Remplacement" | "Suspension" | "Réactivation" | "Réinitialisation Mot de Passe";
  operatorName: string;
  details: string;
}

interface SchoolAdministrationPortalModuleProps {
  school: School;
  employees: Employee[];
  userAccounts: UserAccount[];
  currentUserRole: string;
  currentUserName: string;
  onUpdateSchool?: (updatedSchool: School) => void;
  onAddEmployee?: (employee: Employee) => void;
  onUpdateEmployee?: (employee: Employee) => void;
  onAddUserAccount?: (account: UserAccount) => void;
  onUpdateUserAccount?: (account: UserAccount) => void;
  onOpenPortal?: (account: UserAccount) => void;
}

export function SchoolAdministrationPortalModule({
  school,
  employees,
  userAccounts,
  currentUserRole,
  currentUserName,
  onUpdateSchool,
  onAddEmployee,
  onUpdateEmployee,
  onAddUserAccount,
  onUpdateUserAccount,
  onOpenPortal
}: SchoolAdministrationPortalModuleProps) {
  const schoolId = school.id;
  const storageKeyAssignments = `ss_portal_assignments_${schoolId}`;
  const storageKeyAuditLogs = `ss_portal_audit_logs_${schoolId}`;
  const storageKeyModules = `ss_school_enabled_modules_${schoolId}`;

  // 1. Initial State: Assignments
  const [assignments, setAssignments] = useState<Record<string, SchoolPortalAssignment>>(() => {
    try {
      const raw = safeLocalStorage.getItem(storageKeyAssignments);
      if (raw) return JSON.parse(raw);
    } catch {}

    // Auto-seed initial assignments from existing employees and accounts
    const initial: Record<string, SchoolPortalAssignment> = {};
    CANONICAL_SCHOOL_PORTALS.forEach(portal => {
      // Look for a matching employee or user account
      const matchedEmp = employees.find(e => 
        (e.schoolId === schoolId || !e.schoolId) &&
        (
          e.function?.toLowerCase().includes(portal.targetRole.toLowerCase()) ||
          portal.targetRole.toLowerCase().includes(e.function?.toLowerCase() || "") ||
          (portal.id === "portal-comptable" && (e.function?.toLowerCase().includes("comptab") || e.function?.toLowerCase().includes("caisse"))) ||
          (portal.id === "portal-rh" && (e.function?.toLowerCase().includes("rh") || e.function?.toLowerCase().includes("ressource"))) ||
          (portal.id === "portal-prefet" && (e.function?.toLowerCase().includes("préfet") || e.function?.toLowerCase().includes("prefet") || e.function?.toLowerCase().includes("études"))) ||
          (portal.id === "portal-secretaire" && e.function?.toLowerCase().includes("secrét"))
        )
      );

      if (matchedEmp) {
        initial[portal.id] = {
          portalId: portal.id,
          schoolId: schoolId,
          status: matchedEmp.hasUserAccount ? "Actif" : "Attribué",
          assignedPersonId: matchedEmp.id,
          assignedPersonName: `${matchedEmp.firstName} ${matchedEmp.lastName}`,
          assignedPersonEmail: matchedEmp.email,
          assignedPersonPhone: matchedEmp.phone,
          assignedPersonMatricule: matchedEmp.matricule,
          assignedPersonPhoto: matchedEmp.photoUrl,
          assignedAccountId: matchedEmp.userAccountId,
          assignedRole: portal.targetRole,
          assignedAt: matchedEmp.hireDate || "2026-01-15",
          isAccountActive: matchedEmp.status === "Actif"
        };
      } else {
        initial[portal.id] = {
          portalId: portal.id,
          schoolId: schoolId,
          status: "Disponible",
          assignedRole: portal.targetRole
        };
      }
    });
    return initial;
  });

  const saveAssignments = (updated: Record<string, SchoolPortalAssignment>) => {
    setAssignments(updated);
    safeLocalStorage.setItem(storageKeyAssignments, JSON.stringify(updated));
  };

  // 2. Audit Logs State
  const [auditLogs, setAuditLogs] = useState<PortalAuditLog[]>(() => {
    try {
      const raw = safeLocalStorage.getItem(storageKeyAuditLogs);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: "log-init-1",
        schoolId: schoolId,
        date: new Date().toLocaleDateString("fr-FR") + " 08:30",
        portalName: "Directeur Général",
        action: "Nomination",
        operatorName: currentUserName || "Direction SmartSchool",
        details: "Attribution initiale du portail de direction de l'établissement."
      }
    ];
  });

  const addAuditLog = (portalName: string, action: PortalAuditLog["action"], details: string) => {
    const newLog: PortalAuditLog = {
      id: `log-${Date.now()}`,
      schoolId: schoolId,
      date: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      portalName,
      action,
      operatorName: currentUserName || "Administrateur",
      details
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    safeLocalStorage.setItem(storageKeyAuditLogs, JSON.stringify(updated));
  };

  // 3. Enabled Modules State
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>(() => {
    try {
      const raw = safeLocalStorage.getItem(storageKeyModules);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      pedagogie: true,
      comptabilite: true,
      rh: true,
      bulletins: true,
      horaires: true,
      messagerie_sms: true,
      impression_listes: true,
      vitrine_reseau: true
    };
  });

  const toggleModule = (moduleKey: string) => {
    const updated = { ...enabledModules, [moduleKey]: !enabledModules[moduleKey] };
    setEnabledModules(updated);
    safeLocalStorage.setItem(storageKeyModules, JSON.stringify(updated));
    addAuditLog("Configuration Modules", "Nomination", `Module [${moduleKey}] basculé à ${updated[moduleKey] ? "Activé" : "Désactivé"}`);
  };

  // UI Tabs & Filters
  const [activeTab, setActiveTab] = useState<"portails" | "modules" | "audit">("portails");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [selectedPortalForAction, setSelectedPortalForAction] = useState<SchoolPortalDefinition | null>(null);
  const [sheetAccount, setSheetAccount] = useState<UserAccount | null>(null);

  // Form State for Assigning / Creating Person
  const [assignMode, setAssignMode] = useState<"existing_employee" | "new_person">("existing_employee");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonEmail, setNewPersonEmail] = useState("");
  const [newPersonPhone, setNewPersonPhone] = useState("+243 ");
  const [newPersonPassword, setNewPersonPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Form State for Replace Modal
  const [replaceMode, setReplaceMode] = useState<"existing_employee" | "new_person">("new_person");
  const [replaceEmployeeId, setReplaceEmployeeId] = useState("");
  const [replaceName, setReplaceName] = useState("");
  const [replaceEmail, setReplaceEmail] = useState("");
  const [replacePhone, setReplacePhone] = useState("+243 ");
  const [replacePassword, setReplacePassword] = useState("");
  const [replaceReason, setReplaceReason] = useState("Changement d'affectation / Nouvelle nomination");

  // Form State for Password Reset
  const [newTempPasswordInput, setNewTempPasswordInput] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filtered Portals List
  const filteredPortals = useMemo(() => {
    return CANONICAL_SCHOOL_PORTALS.filter(portal => {
      const assignment = (assignments[portal.id] || { status: "Disponible" }) as Partial<SchoolPortalAssignment>;
      const matchesSearch = 
        portal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        portal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((assignment.assignedPersonName || "").toLowerCase().includes(searchQuery.toLowerCase())) ||
        ((assignment.assignedPersonEmail || "").toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === "Tous" || portal.category === categoryFilter;
      const matchesStatus = statusFilter === "Tous" || assignment.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, categoryFilter, statusFilter, assignments]);

  // Quick statistics
  const stats = useMemo(() => {
    const total = CANONICAL_SCHOOL_PORTALS.length;
    let active = 0;
    let attributed = 0;
    let available = 0;

    CANONICAL_SCHOOL_PORTALS.forEach(p => {
      const a = assignments[p.id];
      if (!a || a.status === "Disponible") available++;
      else if (a.status === "Actif") active++;
      else if (a.status === "Attribué") attributed++;
    });

    return { total, active, attributed, available };
  }, [assignments]);

  // Handlers
  const handleOpenAssignModal = (portal: SchoolPortalDefinition) => {
    setSelectedPortalForAction(portal);
    setAssignMode("existing_employee");
    setSelectedEmployeeId("");
    setNewPersonName("");
    setNewPersonEmail(`agent.${portal.targetRole.toLowerCase().replace(/[^a-z0-9]/g, "")}@${school.name.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 10)}.cd`);
    setNewPersonPhone("+243 8");
    setNewPersonPassword(`Smart${Math.floor(1000 + Math.random() * 9000)}!`);
    setShowAssignModal(true);
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortalForAction) return;

    let targetPersonName = "";
    let targetPersonEmail = "";
    let targetPersonPhone = "";
    let targetPersonMatricule = "";
    let targetPersonPhoto = "";
    let targetEmployeeId = "";
    const chosenPassword = newPersonPassword.trim() || `Smart${Math.floor(1000 + Math.random() * 9000)}!`;

    if (assignMode === "existing_employee") {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (!emp) {
        alert("Veuillez sélectionner un membre du personnel existant.");
        return;
      }
      targetPersonName = `${emp.firstName} ${emp.lastName}`;
      targetPersonEmail = emp.email || `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@smartschool.cd`;
      targetPersonPhone = emp.phone;
      targetPersonMatricule = emp.matricule;
      targetPersonPhoto = emp.photoUrl;
      targetEmployeeId = emp.id;

      if (onUpdateEmployee) {
        onUpdateEmployee({
          ...emp,
          hasUserAccount: true,
          userAccountRole: selectedPortalForAction.targetRole,
          status: "Actif"
        });
      }
    } else {
      if (!newPersonName.trim() || !newPersonEmail.trim()) {
        alert("Veuillez renseigner le nom et l'adresse e-mail.");
        return;
      }
      targetPersonName = newPersonName.trim();
      targetPersonEmail = newPersonEmail.trim().toLowerCase();
      targetPersonPhone = newPersonPhone.trim();
      targetPersonMatricule = `MAT-${schoolId.slice(-3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      targetEmployeeId = `emp-${Date.now().toString().slice(-5)}`;

      if (onAddEmployee) {
        const newEmp: Employee = {
          id: targetEmployeeId,
          matricule: targetPersonMatricule,
          photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
          firstName: targetPersonName.split(" ")[0] || targetPersonName,
          lastName: targetPersonName.split(" ").slice(1).join(" ") || "Personnel",
          gender: "M",
          birthDate: "1988-05-12",
          phone: targetPersonPhone,
          email: targetPersonEmail,
          function: selectedPortalForAction.targetRole,
          department: selectedPortalForAction.category,
          hireDate: new Date().toISOString().slice(0, 10),
          status: "Actif",
          hasUserAccount: true,
          userAccountRole: selectedPortalForAction.targetRole,
          schoolId: schoolId,
          salaryBase: 350,
          contractType: "CDI",
          nationality: "Congolaise",
          address: "",
          birthPlace: "",
          civilStatus: "Célibataire",
          service: selectedPortalForAction.category,
          diplomas: [],
          experience: [],
          documents: [],
          emergencyContact: { name: targetPersonName, relationship: "Titulaire", phone: targetPersonPhone },
          qrCodeData: `STAFF-${targetEmployeeId}`
        };
        onAddEmployee(newEmp);
      }
    }

    const newAccountId = `acc-${schoolId}-${selectedPortalForAction.id}-${Date.now().toString().slice(-4)}`;
    const newAccount: UserAccount = {
      id: newAccountId,
      dossierId: targetEmployeeId,
      dossierType: "personnel",
      matricule: targetPersonMatricule,
      schoolId: schoolId,
      schoolName: school.name,
      fullName: targetPersonName,
      email: targetPersonEmail,
      username: targetPersonEmail,
      phone: targetPersonPhone,
      password: chosenPassword,
      tempPassword: chosenPassword,
      activationCode: `ACT-${selectedPortalForAction.targetRole.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      role: selectedPortalForAction.targetRole,
      functionTitle: selectedPortalForAction.name,
      isActive: true,
      isActivated: true,
      mustChangePasswordOnFirstLogin: false,
      targetPortalTab: selectedPortalForAction.targetTab,
      portalUrl: `${getSafeOrigin()}/login`,
      permissions: selectedPortalForAction.defaultPermissions,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
      creatorRole: currentUserRole
    };

    persistUniversalUserAccount(newAccount);
    if (onAddUserAccount) onAddUserAccount(newAccount);

    const updatedAssignments = {
      ...assignments,
      [selectedPortalForAction.id]: {
        portalId: selectedPortalForAction.id,
        schoolId: schoolId,
        status: "Attribué" as const,
        assignedPersonId: targetEmployeeId,
        assignedPersonName: targetPersonName,
        assignedPersonEmail: targetPersonEmail,
        assignedPersonPhone: targetPersonPhone,
        assignedPersonMatricule: targetPersonMatricule,
        assignedPersonPhoto: targetPersonPhoto,
        assignedAccountId: newAccountId,
        assignedRole: selectedPortalForAction.targetRole,
        assignedAt: new Date().toLocaleDateString("fr-FR"),
        isAccountActive: true
      }
    };
    saveAssignments(updatedAssignments);

    addAuditLog(
      selectedPortalForAction.name, 
      "Nomination", 
      `Attribution du portail [${selectedPortalForAction.name}] à ${targetPersonName} (${targetPersonEmail}). Identifiant et mot de passe générés.`
    );

    setShowAssignModal(false);
    setSheetAccount(newAccount);
    setShowSheetModal(true);

    setFeedbackMessage(`Portail attribué avec succès à ${targetPersonName}. Fiche de connexion disponible.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Handler for Replace Modal (Portail ≠ Personne)
  const handleOpenReplaceModal = (portal: SchoolPortalDefinition) => {
    setSelectedPortalForAction(portal);
    setReplaceMode("new_person");
    setReplaceEmployeeId("");
    setReplaceName("");
    setReplaceEmail(`successeur.${portal.targetRole.toLowerCase().replace(/[^a-z0-9]/g, "")}@${school.name.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 10)}.cd`);
    setReplacePhone("+243 8");
    setReplacePassword(`Smart${Math.floor(1000 + Math.random() * 9000)}!`);
    setReplaceReason("Changement d'affectation / Passation de service");
    setShowReplaceModal(true);
  };

  const handleConfirmReplacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortalForAction) return;

    const currentAssignment = assignments[selectedPortalForAction.id];
    const previousPersonName = currentAssignment?.assignedPersonName || "Ancien titulaire";
    const previousAccountId = currentAssignment?.assignedAccountId;

    // 1. Deactivate old person's account if existing
    if (previousAccountId) {
      const stored = userAccounts.find(a => a.id === previousAccountId);
      if (stored) {
        const deactivatedAccount: UserAccount = {
          ...stored,
          isActive: false,
          isSuspended: true,
          statusNote: `Révoqué suite au remplacement de la fonction par ${currentUserName} le ${new Date().toLocaleDateString("fr-FR")}`
        } as any;
        persistUniversalUserAccount(deactivatedAccount);
        if (onUpdateUserAccount) onUpdateUserAccount(deactivatedAccount);
      }
    }

    // 2. Prepare new person
    let newTargetName = "";
    let newTargetEmail = "";
    let newTargetPhone = "";
    let newTargetMatricule = "";
    let newTargetEmployeeId = "";
    const newChosenPassword = replacePassword.trim() || `Smart${Math.floor(1000 + Math.random() * 9000)}!`;

    if (replaceMode === "existing_employee") {
      const emp = employees.find(e => e.id === replaceEmployeeId);
      if (!emp) {
        alert("Veuillez sélectionner le nouveau titulaire parmi le personnel.");
        return;
      }
      newTargetName = `${emp.firstName} ${emp.lastName}`;
      newTargetEmail = emp.email || `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@smartschool.cd`;
      newTargetPhone = emp.phone;
      newTargetMatricule = emp.matricule;
      newTargetEmployeeId = emp.id;

      if (onUpdateEmployee) {
        onUpdateEmployee({
          ...emp,
          hasUserAccount: true,
          userAccountRole: selectedPortalForAction.targetRole,
          status: "Actif"
        });
      }
    } else {
      if (!replaceName.trim() || !replaceEmail.trim()) {
        alert("Veuillez renseigner le nom et l'adresse e-mail du nouveau titulaire.");
        return;
      }
      newTargetName = replaceName.trim();
      newTargetEmail = replaceEmail.trim().toLowerCase();
      newTargetPhone = replacePhone.trim();
      newTargetMatricule = `MAT-${schoolId.slice(-3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      newTargetEmployeeId = `emp-${Date.now().toString().slice(-5)}`;

      if (onAddEmployee) {
        const newEmp: Employee = {
          id: newTargetEmployeeId,
          matricule: newTargetMatricule,
          photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
          firstName: newTargetName.split(" ")[0] || newTargetName,
          lastName: newTargetName.split(" ").slice(1).join(" ") || "Personnel",
          gender: "M",
          birthDate: "1989-08-20",
          phone: newTargetPhone,
          email: newTargetEmail,
          function: selectedPortalForAction.targetRole,
          department: selectedPortalForAction.category,
          hireDate: new Date().toISOString().slice(0, 10),
          status: "Actif",
          hasUserAccount: true,
          userAccountRole: selectedPortalForAction.targetRole,
          schoolId: schoolId,
          salaryBase: 350,
          contractType: "CDI",
          nationality: "Congolaise",
          address: "",
          birthPlace: "",
          civilStatus: "Célibataire",
          service: selectedPortalForAction.category,
          diplomas: [],
          experience: [],
          documents: [],
          emergencyContact: { name: newTargetName, relationship: "Titulaire", phone: newTargetPhone },
          qrCodeData: `STAFF-${newTargetEmployeeId}`
        };
        onAddEmployee(newEmp);
      }
    }

    // 3. Create fresh new account for the new person
    const newAccountId = `acc-${schoolId}-${selectedPortalForAction.id}-${Date.now().toString().slice(-4)}`;
    const newAccount: UserAccount = {
      id: newAccountId,
      dossierId: newTargetEmployeeId,
      dossierType: "personnel",
      matricule: newTargetMatricule,
      schoolId: schoolId,
      schoolName: school.name,
      fullName: newTargetName,
      email: newTargetEmail,
      username: newTargetEmail,
      phone: newTargetPhone,
      password: newChosenPassword,
      tempPassword: newChosenPassword,
      activationCode: `ACT-${selectedPortalForAction.targetRole.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      role: selectedPortalForAction.targetRole,
      functionTitle: selectedPortalForAction.name,
      isActive: true,
      isActivated: true,
      mustChangePasswordOnFirstLogin: false,
      targetPortalTab: selectedPortalForAction.targetTab,
      portalUrl: `${getSafeOrigin()}/login`,
      permissions: selectedPortalForAction.defaultPermissions,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
      creatorRole: currentUserRole
    };

    persistUniversalUserAccount(newAccount);
    if (onAddUserAccount) onAddUserAccount(newAccount);

    // 4. Update assignment
    const updatedAssignments: Record<string, SchoolPortalAssignment> = {
      ...assignments,
      [selectedPortalForAction.id]: {
        portalId: selectedPortalForAction.id,
        schoolId: schoolId,
        status: "Attribué",
        assignedPersonId: newTargetEmployeeId,
        assignedPersonName: newTargetName,
        assignedPersonEmail: newTargetEmail,
        assignedPersonPhone: newTargetPhone,
        assignedPersonMatricule: newTargetMatricule,
        assignedAccountId: newAccountId,
        assignedRole: selectedPortalForAction.targetRole,
        assignedAt: new Date().toLocaleDateString("fr-FR"),
        isAccountActive: true
      }
    };
    saveAssignments(updatedAssignments);

    addAuditLog(
      selectedPortalForAction.name,
      "Remplacement",
      `Règle "Portail ≠ Personne" appliquée : ${previousPersonName} désactivé(e) -> ${newTargetName} nommé(e) avec nouveau compte et mot de passe. Motif : ${replaceReason}`
    );

    setShowReplaceModal(false);
    setSheetAccount(newAccount);
    setShowSheetModal(true);

    setFeedbackMessage(`Responsable remplacé avec succès. L'ancien compte est désactivé et le nouveau compte de ${newTargetName} est opérationnel.`);
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  // Toggle Account Suspension
  const handleToggleAccountSuspension = (portal: SchoolPortalDefinition) => {
    const assign = assignments[portal.id];
    if (!assign || !assign.assignedPersonName) return;

    const newActiveState = !(assign.isAccountActive ?? true);
    const newStatus: "Actif" | "Disponible" = newActiveState ? "Actif" : "Disponible";
    const updated: Record<string, SchoolPortalAssignment> = {
      ...assignments,
      [portal.id]: {
        ...assign,
        isAccountActive: newActiveState,
        status: newStatus
      }
    };
    saveAssignments(updated);

    if (assign.assignedAccountId) {
      const stored = userAccounts.find(a => a.id === assign.assignedAccountId);
      if (stored) {
        const updatedAcc: UserAccount = {
          ...stored,
          isActive: newActiveState,
          isSuspended: !newActiveState
        };
        persistUniversalUserAccount(updatedAcc);
        if (onUpdateUserAccount) onUpdateUserAccount(updatedAcc);
      }
    }

    addAuditLog(
      portal.name,
      newActiveState ? "Réactivation" : "Suspension",
      `Le compte de ${assign.assignedPersonName} (${portal.name}) a été ${newActiveState ? "Réactivé" : "Suspendu temporairement"}.`
    );

    setFeedbackMessage(`Accès de ${assign.assignedPersonName} : ${newActiveState ? "Réactivé" : "Suspendu"}`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Open Sheet Modal
  const handleViewConnectionSheet = (portal: SchoolPortalDefinition) => {
    const assign = assignments[portal.id];
    if (!assign || !assign.assignedPersonName) return;

    const pseudoAccount: UserAccount = {
      id: assign.assignedAccountId || `acc-${portal.id}`,
      dossierId: assign.assignedPersonId || `dossier-${portal.id}`,
      dossierType: "personnel",
      schoolId: schoolId,
      schoolName: school.name,
      fullName: assign.assignedPersonName,
      email: assign.assignedPersonEmail || `${portal.id}@smartschool.cd`,
      username: assign.assignedPersonEmail || `${portal.id}@smartschool.cd`,
      phone: assign.assignedPersonPhone,
      role: portal.targetRole,
      functionTitle: portal.name,
      password: "Mot de passe sécurisé (protégé)",
      tempPassword: "Mot de passe sécurisé (protégé)",
      activationCode: `ACT-${portal.targetRole.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      isActive: assign.isAccountActive !== false,
      isActivated: true,
      targetPortalTab: portal.targetTab,
      portalUrl: `${getSafeOrigin()}/login`,
      createdAt: assign.assignedAt || new Date().toISOString()
    };

    setSheetAccount(pseudoAccount);
    setShowSheetModal(true);
  };

  // Reset Password Modal
  const handleOpenResetPassword = (portal: SchoolPortalDefinition) => {
    setSelectedPortalForAction(portal);
    setNewTempPasswordInput(`Pass${Math.floor(10000 + Math.random() * 90000)}!`);
    setShowResetPasswordModal(true);
  };

  const handleConfirmResetPassword = () => {
    if (!selectedPortalForAction) return;
    const assign = assignments[selectedPortalForAction.id];
    if (!assign || !assign.assignedAccountId) return;

    const stored = userAccounts.find(a => a.id === assign.assignedAccountId);
    const updatedAcc: UserAccount = stored ? {
      ...stored,
      password: newTempPasswordInput,
      tempPassword: newTempPasswordInput,
      mustChangePasswordOnFirstLogin: true
    } : {
      id: assign.assignedAccountId,
      dossierId: assign.assignedPersonId || "emp-1",
      dossierType: "personnel",
      schoolId: schoolId,
      schoolName: school.name,
      fullName: assign.assignedPersonName || "Responsable",
      email: assign.assignedPersonEmail || "email@smartschool.cd",
      username: assign.assignedPersonEmail || "email@smartschool.cd",
      role: selectedPortalForAction.targetRole,
      password: newTempPasswordInput,
      tempPassword: newTempPasswordInput,
      activationCode: newTempPasswordInput,
      isActive: true,
      isActivated: true,
      mustChangePasswordOnFirstLogin: true,
      createdAt: new Date().toISOString()
    };

    persistUniversalUserAccount(updatedAcc);
    if (onUpdateUserAccount) onUpdateUserAccount(updatedAcc);

    addAuditLog(
      selectedPortalForAction.name,
      "Réinitialisation Mot de Passe",
      `Nouveau mot de passe temporaire défini pour ${assign.assignedPersonName} (${assign.assignedPersonEmail}). Le mot de passe précédent est révoqué.`
    );

    setShowResetPasswordModal(false);
    setSheetAccount(updatedAcc);
    setShowSheetModal(true);

    setFeedbackMessage(`Mot de passe réinitialisé pour ${assign.assignedPersonName}. Nouvelle fiche disponible.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast feedback */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold border border-emerald-400"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{feedbackMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span>Administration de mon École</span>
              </span>
              <span className="text-xs text-slate-400">Règle fondamentale : <strong>Portail ≠ Personne</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-3">
              <span>Gestion des Portails & Responsabilités</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Supervision des fonctions institutionnelles de <strong>{school.name}</strong>. Attribuez les portails (Comptable, Préfet, Secrétaire, RH, Promoteur), partagez les accès, réinitialisez les mots de passe et remplacez les titulaires en toute sécurité.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Portails</p>
              <p className="text-xl font-black text-white">{stats.total}</p>
            </div>
            <div className="text-center px-2 border-x border-white/10">
              <p className="text-[10px] uppercase font-bold text-emerald-400">Actifs</p>
              <p className="text-xl font-black text-emerald-400">{stats.active + stats.attributed}</p>
            </div>
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-amber-400">Disponibles</p>
              <p className="text-xl font-black text-amber-400">{stats.available}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveTab("portails")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === "portails"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Portails & Responsabilités ({stats.total})</span>
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === "modules"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Modules de l'École</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === "audit"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Journal des Affectations ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PORTAILS & RESPONSABILITÉS */}
      {activeTab === "portails" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une fonction, un titulaire, un email..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Tous">Toutes les catégories</option>
                <option value="Direction & Gouvernance">Direction & Gouvernance</option>
                <option value="Pédagogie & Études">Pédagogie & Études</option>
                <option value="Administration & Finances">Administration & Finances</option>
                <option value="Services & Support">Services & Support</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Attribué">Attribué</option>
                <option value="Disponible">Disponible</option>
              </select>
            </div>
          </div>

          {/* Portals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredPortals.map(portal => {
              const assignment: SchoolPortalAssignment = assignments[portal.id] || {
                portalId: portal.id,
                schoolId: schoolId,
                status: "Disponible",
                assignedRole: portal.targetRole,
                isAccountActive: false
              };
              const isAssigned = assignment.status !== "Disponible" && Boolean(assignment.assignedPersonName);
              const isSuspended = assignment.isAccountActive === false && isAssigned;

              return (
                <motion.div
                  key={portal.id}
                  layout
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-sm hover:shadow-md ${
                    isSuspended
                      ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10"
                      : isAssigned
                      ? "border-slate-200 dark:border-slate-800"
                      : "border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/10 dark:bg-amber-950/10"
                  }`}
                >
                  <div>
                    {/* Card Top: Category & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        {portal.category}
                      </span>

                      {isSuspended ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center space-x-1">
                          <Lock className="h-3 w-3" />
                          <span>Suspendu</span>
                        </span>
                      ) : isAssigned ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center space-x-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{assignment.status === "Actif" ? "Actif & Opérationnel" : "Attribué"}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center space-x-1">
                          <Sparkles className="h-3 w-3" />
                          <span>Disponible</span>
                        </span>
                      )}
                    </div>

                    {/* Portal Header */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`p-3 rounded-xl shrink-0 ${
                        isAssigned 
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900" 
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900"
                      }`}>
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                          {portal.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {portal.description}
                        </p>
                      </div>
                    </div>

                    {/* Titulaire actuel or empty state */}
                    <div className="my-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {isAssigned ? (
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                          <div className="flex items-center space-x-2.5">
                            <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {assignment.assignedPersonName?.substring(0, 2).toUpperCase() || "SS"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {assignment.assignedPersonName}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center space-x-1 mt-0.5">
                                <Mail className="h-2.5 w-2.5 shrink-0" />
                                <span>{assignment.assignedPersonEmail}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                            <span>Tél : {assignment.assignedPersonPhone || "N/A"}</span>
                            <span>Affecté le : {assignment.assignedAt || "2026-01-15"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-center">
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            Aucun titulaire nommé
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                            Le portail est prêt à être attribué à un membre du personnel.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                    {isAssigned ? (
                      <div className="space-y-2">
                        {/* Primary Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleViewConnectionSheet(portal)}
                            className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Fiche & Accès</span>
                          </button>

                          <button
                            onClick={() => handleOpenReplaceModal(portal)}
                            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                            title="Remplacer le titulaire (Portail ≠ Personne)"
                          >
                            <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Remplacer</span>
                          </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <button
                            onClick={() => handleOpenResetPassword(portal)}
                            className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1 cursor-pointer font-semibold"
                          >
                            <KeyRound className="h-3 w-3" />
                            <span>Réinitialiser MDP</span>
                          </button>

                          <button
                            onClick={() => handleToggleAccountSuspension(portal)}
                            className={`flex items-center space-x-1 cursor-pointer font-semibold ${
                              isSuspended 
                                ? "text-emerald-600 dark:text-emerald-400 hover:underline" 
                                : "text-rose-600 dark:text-rose-400 hover:underline"
                            }`}
                          >
                            {isSuspended ? (
                              <>
                                <Unlock className="h-3 w-3" />
                                <span>Réactiver</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3" />
                                <span>Suspendre</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenAssignModal(portal)}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Attribuer ce portail</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MODULES & FONCTIONNALITÉS */}
      {activeTab === "modules" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Sliders className="h-5 w-5 text-indigo-600" />
              <span>Modules & Fonctionnalités Disponibles</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Activez ou désactivez les services utilisés par l'établissement. Ces paramètres conditionnent les options visibles dans les tableaux de bord.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: "pedagogie",
                title: "Pédagogie & Notes Numériques",
                desc: "Journal de classe, encodage des cotes, calcul automatique des moyennes et pondérations.",
                icon: BookOpen,
                badge: "Essentiel"
              },
              {
                key: "comptabilite",
                title: "Frais Scolaires & Paiements Mobile Money",
                desc: "Encaissements M-Pesa, Orange Money, Airtel, caisse centrale et balances financières.",
                icon: Landmark,
                badge: "Recommandé"
              },
              {
                key: "rh",
                title: "Ressources Humaines (RH) & Paie",
                desc: "Contrats de travail, organigramme, présences, fiches de paie et évaluations du personnel.",
                icon: Users,
                badge: "Opérationnel"
              },
              {
                key: "bulletins",
                title: "Bulletins Officiels & Palmarès EPST",
                desc: "Génération et impression des bulletins officiels conformes aux référentiels congolais.",
                icon: FileText,
                badge: "National"
              },
              {
                key: "horaires",
                title: "Emploi du Temps & Grille Horaire",
                desc: "Planification des créneaux, gestion des salles de classe et affectation des professeurs.",
                icon: Clock,
                badge: "Pédagogique"
              },
              {
                key: "messagerie_sms",
                title: "Messagerie & Notifications SMS aux Parents",
                desc: "Diffusion des alertes d'absence, convocations, rappels de frais et communication directe.",
                icon: Mail,
                badge: "Communication"
              },
              {
                key: "impression_listes",
                title: "Impression des Listes & Cartes Scolaires Sécurisées",
                desc: "Production des cartes élèves à QR Code, listes d'appel et attestations de fréquentation.",
                icon: Printer,
                badge: "Secrétariat"
              },
              {
                key: "vitrine_reseau",
                title: "Vitrine & Réseau Interscolaire RDC",
                desc: "Publication sur l'annuaire national, offres d'emploi d'enseignants et médiathèque CNR.",
                icon: Building,
                badge: "Réseau"
              }
            ].map(mod => {
              const isEnabled = enabledModules[mod.key] ?? true;
              const Icon = mod.icon;

              return (
                <div
                  key={mod.key}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    isEnabled
                      ? "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isEnabled ? "bg-indigo-600 text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-600"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{mod.title}</h4>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full">
                          {mod.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleModule(mod.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isEnabled
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {isEnabled ? "Activé" : "Désactivé"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <span>Journal d'Audit des Portails & Affectations</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Traçabilité inaltérable de toutes les nominations, révocations, réinitialisations et changements de titulaires.
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl">
              {auditLogs.length} événements
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      log.action === "Nomination"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                        : log.action === "Remplacement"
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300"
                        : log.action === "Suspension"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{log.portalName}</span>
                    <span className="text-[10px] text-slate-400">par {log.operatorName}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{log.details}</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">{log.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ATTRIBUER UN PORTAIL */}
      <AnimatePresence>
        {showAssignModal && selectedPortalForAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <UserPlus className="h-5 w-5 text-indigo-600" />
                    <span>Attribuer le Portail : {selectedPortalForAction.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Nommez un titulaire et générez ses identifiants de connexion réels.
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mode Selection */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setAssignMode("existing_employee")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    assignMode === "existing_employee"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Membre existant du personnel
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode("new_person")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    assignMode === "new_person"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Créer un nouvel agent
                </button>
              </div>

              <form onSubmit={handleConfirmAssignment} className="space-y-4">
                {assignMode === "existing_employee" ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sélectionner un employé ({employees.length} disponibles)
                    </label>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Choisir un employé --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} — {emp.function} ({emp.matricule})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nom complet du responsable *
                      </label>
                      <input
                        type="text"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        placeholder="Ex: M. Sylvain KABULO"
                        required
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Adresse E-mail / Identifiant *
                        </label>
                        <input
                          type="email"
                          value={newPersonEmail}
                          onChange={(e) => setNewPersonEmail(e.target.value)}
                          placeholder="Ex: comptable@ecole.cd"
                          required
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          value={newPersonPhone}
                          onChange={(e) => setNewPersonPhone(e.target.value)}
                          placeholder="+243 8..."
                          required
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Initial Password Definition */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mot de passe initial pour ce compte *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordInput ? "text" : "password"}
                      value={newPersonPassword}
                      onChange={(e) => setNewPersonPassword(e.target.value)}
                      required
                      placeholder="Mot de passe initial"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInput(!showPasswordInput)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswordInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Ce mot de passe sera inscrit sur la fiche officielle de connexion à remettre à l'agent.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Confirmer & Générer les Accès</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: REMPLACER UN RESPONSABLE (PORTAIL ≠ PERSONNE) */}
      <AnimatePresence>
        {showReplaceModal && selectedPortalForAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 text-indigo-600" />
                    <span>Remplacement de Titulaire : {selectedPortalForAction.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Application stricte de la règle <strong>Portail ≠ Personne</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setShowReplaceModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Règle d'or notification */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Comment fonctionne le remplacement ?</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Le portail <strong>{selectedPortalForAction.name}</strong> reste disponible et opérationnel. Le compte de l'ancien titulaire (<strong>{assignments[selectedPortalForAction.id]?.assignedPersonName}</strong>) est désactivé. Un nouveau compte distinct sera créé pour le nouveau titulaire.
                </p>
              </div>

              <form onSubmit={handleConfirmReplacement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Motif officiel du remplacement *
                  </label>
                  <input
                    type="text"
                    value={replaceReason}
                    onChange={(e) => setReplaceReason(e.target.value)}
                    required
                    placeholder="Ex: Passation de service, fin de contrat..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nom complet du nouveau titulaire *
                  </label>
                  <input
                    type="text"
                    value={replaceName}
                    onChange={(e) => setReplaceName(e.target.value)}
                    required
                    placeholder="Ex: Mme Marie MASENGU"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nouvel Identifiant / E-mail *
                    </label>
                    <input
                      type="email"
                      value={replaceEmail}
                      onChange={(e) => setReplaceEmail(e.target.value)}
                      required
                      placeholder="Ex: marie.masengu@ecole.cd"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={replacePhone}
                      onChange={(e) => setReplacePhone(e.target.value)}
                      required
                      placeholder="+243 8..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mot de passe pour le nouveau compte *
                  </label>
                  <input
                    type="text"
                    value={replacePassword}
                    onChange={(e) => setReplacePassword(e.target.value)}
                    required
                    placeholder="Mot de passe du nouveau compte"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowReplaceModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Appliquer le Remplacement</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: RÉINITIALISATION DE MOT DE PASSE */}
      <AnimatePresence>
        {showResetPasswordModal && selectedPortalForAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <KeyRound className="h-4 w-4 text-indigo-600" />
                  <span>Réinitialisation du Mot de Passe</span>
                </h3>
                <button onClick={() => setShowResetPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conformément aux normes de sécurité, vous ne pouvez pas consulter le mot de passe actuel de l'utilisateur. Vous pouvez uniquement en définir un nouveau.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nouveau Mot de Passe Temporaire *
                </label>
                <input
                  type="text"
                  value={newTempPasswordInput}
                  onChange={(e) => setNewTempPasswordInput(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmResetPassword}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Confirmer la Réinitialisation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: FICHE OFFICIELLE DE CONNEXION */}
      {showSheetModal && sheetAccount && (
        <OfficialLoginSheetModal
          account={sheetAccount}
          schoolName={school.name}
          schoolLogoUrl={school.logoUrl}
          schoolMotto={school.motto}
          onClose={() => {
            setShowSheetModal(false);
            setSheetAccount(null);
          }}
          onOpenPortal={(acc) => {
            if (onOpenPortal) onOpenPortal(acc);
          }}
        />
      )}
    </div>
  );
}
