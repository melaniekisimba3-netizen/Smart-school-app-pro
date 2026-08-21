/**
 * SmartSchool RDC - IAM & Account Activation Service
 * 
 * Secure provisioning, unique activation code generation, Zero-Trust first login wizard,
 * and Official Connection Sheet (Fiche Officielle de Connexion) generation.
 */

import { UserAccount, Student, Employee, Parent, Teacher } from "../types";
import { safeLocalStorage, getSafeOrigin } from "../utils/safeStorage";
export { getSafeOrigin };
import { isFirebaseConfigured, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export interface SecurityQuestionItem {
  id: string;
  question: string;
}

export const OFFICIAL_SECURITY_QUESTIONS: SecurityQuestionItem[] = [
  { id: "q1", question: "Quel est le nom de jeune fille de votre mère ?" },
  { id: "q2", question: "Dans quelle ville ou commune de la RDC êtes-vous né(e) ?" },
  { id: "q3", question: "Quel était le nom de votre première école primaire ?" },
  { id: "q4", question: "Quel est le prénom de votre grand-père maternel ?" },
  { id: "q5", question: "Quel est votre plat traditionnel congolais préféré (ex: Pondu, Fumbwa, Liboke) ?" },
  { id: "q6", question: "Quel est le nom de votre commune ou quartier d'enfance ?" },
  { id: "q7", question: "Quel était le nom de votre premier enseignant marquant ?" },
  { id: "q8", question: "Quel est le deuxième prénom (post-nom) de votre tuteur légal ?" }
];

export interface PortalConfig {
  role: string;
  portalName: string;
  portalCode: string;
  portalPath: string;
  targetTab: string;
  componentName: string;
  description: string;
  badgeColor: string;
  defaultPermissions: string[];
}

export const ROLE_PORTAL_MAPPING: Record<string, PortalConfig> = {
  "Élève": {
    role: "Élève",
    portalName: "Portail Élève SmartSchool RDC",
    portalCode: "PORTAL_STUDENT",
    portalPath: "/portail/eleve",
    targetTab: "eleves",
    componentName: "StudentPortal.tsx",
    description: "Consultation des cours, devoirs numériques, notes, horaires et bulletins scolaires",
    badgeColor: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400",
    defaultPermissions: ["portal_student_access", "view_courses", "submit_homework", "view_grades", "view_timetable", "chat_messagerie"]
  },
  "Parent": {
    role: "Parent",
    portalName: "Portail Parent & Tuteur SmartSchool RDC",
    portalCode: "PORTAL_PARENT",
    portalPath: "/portail/parent",
    targetTab: "parents",
    componentName: "ParentPortal.tsx",
    description: "Suivi des présences en temps réel, alertes SMS, bulletins et paiement sécurisé des frais",
    badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400",
    defaultPermissions: ["portal_parent_access", "view_student_grades", "view_student_attendance", "view_bulletins", "pay_fees", "chat_messagerie"]
  },
  "Enseignant": {
    role: "Enseignant",
    portalName: "Portail Pédagogique Enseignant",
    portalCode: "PORTAL_TEACHER",
    portalPath: "/portail/enseignant",
    targetTab: "enseignants",
    componentName: "TeacherPortal.tsx",
    description: "Saisie des cotes, journal de classe numérique, encadrement des devoirs et présences",
    badgeColor: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400",
    defaultPermissions: ["portal_teacher_access", "grade_entry", "homework_management", "attendance_recording", "view_classes", "chat_messagerie"]
  },
  "Directeur": {
    role: "Directeur",
    portalName: "Portail Direction Générale & Chef d'Établissement",
    portalCode: "PORTAL_DIRECTOR",
    portalPath: "/portail/direction",
    targetTab: "dashboard",
    componentName: "DirectorDashboard.tsx",
    description: "Supervision académique globale, validation des inscriptions, rapports statistiques EPST",
    badgeColor: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400",
    defaultPermissions: [
      "portal_director_access", 
      "system_admin", 
      "manage_school_accounts",
      "create_staff_accounts",
      "create_teacher_accounts",
      "create_student_accounts",
      "create_parent_accounts",
      "generate_connection_sheets",
      "manage_students", 
      "manage_teachers",
      "manage_hr", 
      "manage_finances", 
      "manage_classes", 
      "view_reports", 
      "validate_inscriptions", 
      "print_official_docs"
    ]
  },
  "Directeur Général": {
    role: "Directeur Général",
    portalName: "Portail Direction Générale & Chef d'Établissement",
    portalCode: "PORTAL_DIRECTOR_GEN",
    portalPath: "/portail/direction-generale",
    targetTab: "dashboard",
    componentName: "DirectorDashboard.tsx",
    description: "Supervision exécutive de tous les départements, validation des actes d'autorité et conformité légale",
    badgeColor: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400",
    defaultPermissions: [
      "portal_director_access", 
      "system_admin", 
      "manage_school_accounts",
      "create_staff_accounts",
      "create_teacher_accounts",
      "create_student_accounts",
      "create_parent_accounts",
      "generate_connection_sheets",
      "manage_students", 
      "manage_teachers",
      "manage_hr", 
      "manage_finances", 
      "manage_classes", 
      "view_reports", 
      "validate_inscriptions", 
      "print_official_docs"
    ]
  },
  "Préfet des Études": {
    role: "Préfet des Études",
    portalName: "Portail Préfecture des Études",
    portalCode: "PORTAL_PREFECT",
    portalPath: "/portail/prefecture",
    targetTab: "dashboard",
    componentName: "PrefectDashboard.tsx",
    description: "Coordination pédagogique, affectation des cours, horaires et validation des délibérations",
    badgeColor: "text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/60 dark:text-violet-400",
    defaultPermissions: [
      "portal_prefect_access",
      "manage_pedagogy",
      "create_teacher_accounts",
      "create_student_accounts",
      "generate_connection_sheets",
      "manage_teachers",
      "manage_students",
      "manage_classes",
      "manage_timetable",
      "validate_grades",
      "deliberations",
      "manage_discipline",
      "print_official_docs",
      "export_pedagogical_data"
    ]
  },
  "Préfet": {
    role: "Préfet",
    portalName: "Portail Préfecture des Études",
    portalCode: "PORTAL_PREFECT",
    portalPath: "/portail/prefecture",
    targetTab: "dashboard",
    componentName: "PrefectDashboard.tsx",
    description: "Coordination pédagogique, affectation des cours, horaires et validation des délibérations",
    badgeColor: "text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/60 dark:text-violet-400",
    defaultPermissions: [
      "portal_prefect_access",
      "manage_pedagogy",
      "create_teacher_accounts",
      "create_student_accounts",
      "generate_connection_sheets",
      "manage_teachers",
      "manage_students",
      "manage_classes",
      "manage_timetable",
      "validate_grades",
      "deliberations",
      "manage_discipline",
      "print_official_docs",
      "export_pedagogical_data"
    ]
  },
  "Directeur des Études": {
    role: "Directeur des Études",
    portalName: "Portail Direction des Études",
    portalCode: "PORTAL_STUDIES_DIRECTOR",
    portalPath: "/portail/etudes",
    targetTab: "dashboard",
    componentName: "PrefectDashboard.tsx",
    description: "Direction pédagogique du cycle, coordination des programmes et des délibérations",
    badgeColor: "text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/60 dark:text-violet-400",
    defaultPermissions: [
      "portal_prefect_access",
      "manage_pedagogy",
      "create_teacher_accounts",
      "create_student_accounts",
      "generate_connection_sheets",
      "manage_teachers",
      "manage_students",
      "manage_classes",
      "manage_timetable",
      "validate_grades",
      "deliberations",
      "print_official_docs"
    ]
  },
  "Comptable": {
    role: "Comptable",
    portalName: "Portail Comptabilité & Trésorerie",
    portalCode: "PORTAL_FINANCE",
    portalPath: "/portail/finance",
    targetTab: "comptabilite",
    componentName: "AccountantDashboard.tsx",
    description: "Encaissement des écolages, bordereaux bancaires, Mobile Money et balance financière",
    badgeColor: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400",
    defaultPermissions: [
      "portal_finance_access", 
      "manage_finances", 
      "manage_payments", 
      "manage_cashier", 
      "view_financial_reports", 
      "print_receipts",
      "export_financial_data",
      "manage_tuition_fees"
    ]
  },
  "Comptable Principal": {
    role: "Comptable Principal",
    portalName: "Portail Comptabilité & Trésorerie",
    portalCode: "PORTAL_FINANCE",
    portalPath: "/portail/finance",
    targetTab: "comptabilite",
    componentName: "AccountantDashboard.tsx",
    description: "Supervision de la comptabilité générale, validation des décaissements et états financiers",
    badgeColor: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400",
    defaultPermissions: [
      "portal_finance_access", 
      "manage_finances", 
      "manage_payments", 
      "manage_cashier", 
      "view_financial_reports", 
      "print_receipts",
      "export_financial_data",
      "manage_tuition_fees"
    ]
  },
  "Caissier": {
    role: "Caissier",
    portalName: "Portail Caisse & Guichet",
    portalCode: "PORTAL_CASHIER",
    portalPath: "/portail/caisse",
    targetTab: "comptabilite",
    componentName: "AccountantDashboard.tsx",
    description: "Perception physique au guichet, reçus thermiques et clôture journalière de caisse",
    badgeColor: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400",
    defaultPermissions: ["portal_cashier_access", "manage_payments", "print_receipts", "cashier_close", "verify_receipts"]
  },
  "Secrétaire": {
    role: "Secrétaire",
    portalName: "Portail Secrétariat Administratif",
    portalCode: "PORTAL_SECRETARIAT",
    portalPath: "/portail/secretariat",
    targetTab: "eleves",
    componentName: "SecretaryDashboard.tsx",
    description: "Enregistrement des dossiers administratifs, attestations scolaires et courriers officiels",
    badgeColor: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/60 dark:text-sky-400",
    defaultPermissions: [
      "portal_secretary_access", 
      "manage_students", 
      "manage_inscriptions", 
      "create_student_accounts",
      "create_parent_accounts",
      "generate_connection_sheets",
      "print_certificates", 
      "official_lists",
      "manage_mail",
      "archive_records"
    ]
  },
  "Secrétaire de Direction": {
    role: "Secrétaire de Direction",
    portalName: "Portail Secrétariat Administratif",
    portalCode: "PORTAL_SECRETARIAT",
    portalPath: "/portail/secretariat",
    targetTab: "eleves",
    componentName: "SecretaryDashboard.tsx",
    description: "Gestion des actes administratifs, rédaction des procès-verbaux et classement des dossiers",
    badgeColor: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/60 dark:text-sky-400",
    defaultPermissions: [
      "portal_secretary_access", 
      "manage_students", 
      "manage_inscriptions", 
      "create_student_accounts",
      "create_parent_accounts",
      "generate_connection_sheets",
      "print_certificates", 
      "official_lists",
      "manage_mail",
      "archive_records"
    ]
  },
  "Bibliothécaire": {
    role: "Bibliothécaire",
    portalName: "Portail Bibliothèque & Documentation CNR-EPST",
    portalCode: "PORTAL_LIBRARY",
    portalPath: "/portail/bibliotheque",
    targetTab: "cnr_epst",
    componentName: "LibraryPortal.tsx",
    description: "Gestion du fonds documentaire, prêts de manuels et centre national de ressources pédagogiques",
    badgeColor: "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/60 dark:text-teal-400",
    defaultPermissions: ["portal_library_access", "manage_books", "manage_loans", "access_cnr_epst"]
  },
  "Inspection Provinciale": {
    role: "Inspection Provinciale",
    portalName: "Portail Inspection Provinciale EPST",
    portalCode: "PORTAL_INSPECTION_PROV",
    portalPath: "/portail/inspection-provinciale",
    targetTab: "sa_inspections",
    componentName: "ProvincialInspectionDashboard.tsx",
    description: "Supervision provinciale des écoles, audits pédagogiques et contrôle de conformité",
    badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300",
    defaultPermissions: ["portal_inspection_access", "inspect_schools_provincial", "view_statistics", "issue_circulars", "audit_pedagogy"]
  },
  "Inspecteur Provincial": {
    role: "Inspecteur Provincial",
    portalName: "Portail Inspection Provinciale EPST",
    portalCode: "PORTAL_INSPECTION_PROV",
    portalPath: "/portail/inspection-provinciale",
    targetTab: "sa_inspections",
    componentName: "ProvincialInspectionDashboard.tsx",
    description: "Supervision provinciale des écoles, audits pédagogiques et contrôle de conformité",
    badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300",
    defaultPermissions: ["portal_inspection_access", "inspect_schools_provincial", "view_statistics", "issue_circulars", "audit_pedagogy"]
  },
  "Inspection Générale": {
    role: "Inspection Générale",
    portalName: "Portail Inspection Générale EPST",
    portalCode: "PORTAL_INSPECTION_GEN",
    portalPath: "/portail/inspection-generale",
    targetTab: "sa_inspections",
    componentName: "GeneralInspectionDashboard.tsx",
    description: "Haute supervision nationale, étalonnage des épreuves et directives ministérielles",
    badgeColor: "text-emerald-800 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300",
    defaultPermissions: ["portal_inspection_general_access", "inspect_schools_national", "national_statistics", "publish_national_circulars", "audit_supervision"]
  },
  "Inspecteur Général": {
    role: "Inspecteur Général",
    portalName: "Portail Inspection Générale EPST",
    portalCode: "PORTAL_INSPECTION_GEN",
    portalPath: "/portail/inspection-generale",
    targetTab: "sa_inspections",
    componentName: "GeneralInspectionDashboard.tsx",
    description: "Haute supervision nationale, étalonnage des épreuves et directives ministérielles",
    badgeColor: "text-emerald-800 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300",
    defaultPermissions: ["portal_inspection_general_access", "inspect_schools_national", "national_statistics", "publish_national_circulars", "audit_supervision"]
  },
  "Administrateur National EPST": {
    role: "Administrateur National EPST",
    portalName: "Portail National EPST",
    portalCode: "PORTAL_NATIONAL_EPST",
    portalPath: "/portail/epst-national",
    targetTab: "iam_national",
    componentName: "NationalEPSTDashboard.tsx",
    description: "Gestion du registre national des écoles, annuaire des identifiants et statistiques nationales",
    badgeColor: "text-indigo-800 bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300",
    defaultPermissions: ["portal_national_epst_access", "manage_national_iam", "national_supervision", "manage_educational_provinces", "audit_system"]
  },
  "Responsable informatique": {
    role: "Responsable informatique",
    portalName: "Portail IAM & Infrastructure IT",
    portalCode: "PORTAL_IT_ADMIN",
    portalPath: "/portail/it-admin",
    targetTab: "iam_national",
    componentName: "NationalUserAccountsIAMModule.tsx",
    description: "Gestion des comptes, attribution des privilèges RBAC, sécurité et audits systèmes",
    badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-400",
    defaultPermissions: ["portal_it_admin_access", "manage_user_accounts", "manage_rbac", "system_security", "audit_logs"]
  },
  "Administrateur RH": {
    role: "Administrateur RH",
    portalName: "Portail Ressources Humaines & Personnel",
    portalCode: "PORTAL_HR_ADMIN",
    portalPath: "/portail/rh",
    targetTab: "rh",
    componentName: "HrModuleView.tsx",
    description: "Gestion des dossiers agents, contrats, présences biométriques et paie du personnel",
    badgeColor: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400",
    defaultPermissions: ["portal_hr_admin_access", "manage_hr", "manage_employees", "manage_leaves", "manage_promotions", "manage_sanctions", "audit_hr"]
  },
  "Promoteur / Fondateur": {
    role: "Promoteur / Fondateur",
    portalName: "Portail Propriétaire & Gouvernance",
    portalCode: "PORTAL_FOUNDER",
    portalPath: "/portail/promoteur",
    targetTab: "owner_control_center",
    componentName: "OwnerControlCenter.tsx",
    description: "Vision exécutive financière, gestion des investissements et gouvernance d'établissement",
    badgeColor: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400",
    defaultPermissions: ["portal_owner_access", "owner_master_control", "view_all_finances", "manage_schools", "platform_config"]
  },
  "Propriétaire": {
    role: "Propriétaire",
    portalName: "Centre de Contrôle du Propriétaire",
    portalCode: "PORTAL_OWNER",
    portalPath: "/portail/proprietaire",
    targetTab: "owner_control_center",
    componentName: "OwnerControlCenter.tsx",
    description: "Contrôle global, encaissements SaaS des commissions MoMo et supervision des établissements",
    badgeColor: "text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300",
    defaultPermissions: ["portal_owner_access", "owner_master_control", "manage_saas", "view_all_finances", "manage_schools", "backup_disaster_recovery", "platform_config"]
  },
  "SuperAdmin RDC": {
    role: "SuperAdmin RDC",
    portalName: "Centre de Gestion SaaS & Administration Plateforme",
    portalCode: "PORTAL_SUPERADMIN",
    portalPath: "/portail/saas-center",
    targetTab: "sa_saas_center",
    componentName: "SuperAdminPlatform.tsx",
    description: "Administration technique globale de l'écosystème SmartSchool RDC",
    badgeColor: "text-blue-700 bg-blue-50 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
    defaultPermissions: ["portal_superadmin_access", "manage_saas_platform", "support_tickets", "audit_platform", "system_health"]
  },
  "Super Administrateur": {
    role: "Super Administrateur",
    portalName: "Centre de Gestion SaaS & Administration Plateforme",
    portalCode: "PORTAL_SUPERADMIN",
    portalPath: "/portail/saas-center",
    targetTab: "sa_saas_center",
    componentName: "SuperAdminPlatform.tsx",
    description: "Administration technique globale de l'écosystème SmartSchool RDC",
    badgeColor: "text-blue-700 bg-blue-50 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
    defaultPermissions: ["portal_superadmin_access", "manage_saas_platform", "support_tickets", "audit_platform", "system_health"]
  }
};

/**
 * Normalizes and resolves Portal Configuration for any specified role string
 */
export function getPortalConfigForRole(role: string): PortalConfig {
  if (!role) {
    return {
      role: "Utilisateur",
      portalName: "Portail SmartSchool RDC",
      portalCode: "PORTAL_GENERIC",
      portalPath: "/dashboard",
      targetTab: "dashboard",
      componentName: "DashboardView.tsx",
      description: "Espace de travail sécurisé SmartSchool RDC",
      badgeColor: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
      defaultPermissions: ["portal_access"]
    };
  }

  // Exact match first
  if (ROLE_PORTAL_MAPPING[role]) {
    return ROLE_PORTAL_MAPPING[role];
  }

  const roleUpper = role.toUpperCase();
  
  if (roleUpper.includes("ÉLÈVE") || roleUpper.includes("ELEVE")) return ROLE_PORTAL_MAPPING["Élève"];
  if (roleUpper.includes("PARENT") || roleUpper.includes("TUTEUR")) return ROLE_PORTAL_MAPPING["Parent"];
  if (roleUpper.includes("ENSEIGNANT") || roleUpper.includes("PROFESSEUR")) return ROLE_PORTAL_MAPPING["Enseignant"];
  if (roleUpper.includes("DIRECTEUR GÉNÉRAL") || roleUpper.includes("DIRECTEUR GENERAL")) return ROLE_PORTAL_MAPPING["Directeur Général"];
  if (roleUpper.includes("DIRECTEUR DES ÉTUDES") || roleUpper.includes("DIRECTEUR DES ETUDES")) return ROLE_PORTAL_MAPPING["Directeur des Études"];
  if (roleUpper.includes("DIRECTEUR")) return ROLE_PORTAL_MAPPING["Directeur"];
  if (roleUpper.includes("PRÉFET") || roleUpper.includes("PREFET")) return ROLE_PORTAL_MAPPING["Préfet des Études"];
  if (roleUpper.includes("COMPTABLE")) return ROLE_PORTAL_MAPPING["Comptable"];
  if (roleUpper.includes("CAISSIER") || roleUpper.includes("PERCEPTEUR")) return ROLE_PORTAL_MAPPING["Caissier"];
  if (roleUpper.includes("SECRÉTAIRE") || roleUpper.includes("SECRETAIRE")) return ROLE_PORTAL_MAPPING["Secrétaire"];
  if (roleUpper.includes("BIBLIOTHÉCAIRE") || roleUpper.includes("BIBLIOTHECAIRE")) return ROLE_PORTAL_MAPPING["Bibliothécaire"];
  if (roleUpper.includes("INSPECTION PROVINCIALE") || roleUpper.includes("INSPECTEUR PROVINCIAL")) return ROLE_PORTAL_MAPPING["Inspection Provinciale"];
  if (roleUpper.includes("INSPECTION GÉNÉRALE") || roleUpper.includes("INSPECTEUR GÉNÉRAL") || roleUpper.includes("INSPECTION GENERALE")) return ROLE_PORTAL_MAPPING["Inspection Générale"];
  if (roleUpper.includes("EPST") || roleUpper.includes("MINISTÈRE") || roleUpper.includes("NATIONAL")) return ROLE_PORTAL_MAPPING["Administrateur National EPST"];
  if (roleUpper.includes("RH") || roleUpper.includes("RESSOURCES HUMAINES")) return ROLE_PORTAL_MAPPING["Administrateur RH"];
  if (roleUpper.includes("INFORMATIQUE") || roleUpper.includes("IT")) return ROLE_PORTAL_MAPPING["Responsable informatique"];
  if (roleUpper.includes("PROPRIÉTAIRE") || roleUpper.includes("PROPRIETAIRE") || roleUpper.includes("PROMOTEUR") || roleUpper.includes("FONDATEUR")) return ROLE_PORTAL_MAPPING["Propriétaire"];
  if (roleUpper.includes("SUPERADMIN") || roleUpper.includes("SUPER ADMIN") || roleUpper.includes("COLLABORATEUR")) return ROLE_PORTAL_MAPPING["SuperAdmin RDC"];

  // Default fallback
  return {
    role,
    portalName: `Portail ${role}`,
    portalCode: `PORTAL_${role.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`,
    portalPath: `/portail/${role.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    targetTab: "dashboard",
    componentName: "DashboardView.tsx",
    description: `Accès sécurisé pour le rôle ${role}`,
    badgeColor: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400",
    defaultPermissions: ["portal_access", "view_dashboard"]
  };
}

/**
 * Returns default RBAC permissions for a given role
 */
export function getRoleRbacPermissions(role: string): string[] {
  const config = getPortalConfigForRole(role);
  return config.defaultPermissions || ["portal_access"];
}

/**
 * Validates if an operator role can create or generate accounts for a target role
 * without requiring higher hierarchical approval.
 */
export function canRoleCreateAccountsFor(operatorRole: string, targetRole: string): boolean {
  if (!operatorRole || !targetRole) return false;
  const op = operatorRole.toLowerCase();
  const tgt = targetRole.toLowerCase();

  // SuperAdmins, Owners, Promoters and Directors have full autonomy to provision any school account
  if (
    op.includes("propriétaire") || 
    op.includes("proprietaire") || 
    op.includes("super admin") || 
    op.includes("promoteur") || 
    op.includes("directeur") || 
    op.includes("directrice")
  ) {
    return true;
  }

  // Préfet des Études / Directeur des Études has direct authority over pedagogical personnel, teachers, students, and parents
  if (op.includes("préfet") || op.includes("prefet") || op.includes("études") || op.includes("etudes")) {
    return (
      tgt.includes("enseignant") || 
      tgt.includes("professeur") || 
      tgt.includes("titulaire") || 
      tgt.includes("élève") || 
      tgt.includes("eleve") || 
      tgt.includes("parent") || 
      tgt.includes("tuteur") || 
      tgt.includes("bibliothécaire") || 
      tgt.includes("bibliothecaire") ||
      tgt.includes("discipline") ||
      tgt.includes("surveillant")
    );
  }

  // Secrétaire has direct authority over student and parent records/accounts
  if (op.includes("secrétaire") || op.includes("secretaire")) {
    return (
      tgt.includes("élève") || 
      tgt.includes("eleve") || 
      tgt.includes("parent") || 
      tgt.includes("tuteur")
    );
  }

  // Administrateur RH has authority over staff and employee accounts
  if (op.includes("rh") || op.includes("ressources humaines")) {
    return (
      tgt.includes("enseignant") || 
      tgt.includes("comptable") || 
      tgt.includes("caissier") || 
      tgt.includes("secrétaire") || 
      tgt.includes("secretaire") || 
      tgt.includes("ouvrier") || 
      tgt.includes("personnel") || 
      tgt.includes("agent") ||
      tgt.includes("chauffeur") ||
      tgt.includes("gardien")
    );
  }

  // National EPST / IT Administrators
  if (op.includes("national") || op.includes("epst") || op.includes("informatique") || op.includes("it")) {
    return true;
  }

  return false;
}

/**
 * Checks whether an operator role has direct autonomy for student management (creation, edition, deletion)
 */
export function canRoleManageStudents(role: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return (
    r.includes("directeur") ||
    r.includes("directrice") ||
    r.includes("préfet") ||
    r.includes("prefet") ||
    r.includes("études") ||
    r.includes("etudes") ||
    r.includes("secrétaire") ||
    r.includes("secretaire") ||
    r.includes("promoteur") ||
    r.includes("propriétaire") ||
    r.includes("proprietaire") ||
    r.includes("super admin") ||
    r.includes("rh") ||
    r.includes("ressources humaines")
  );
}

/**
 * Checks whether an operator role has direct autonomy for teacher management
 */
export function canRoleManageTeachers(role: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return (
    r.includes("directeur") ||
    r.includes("directrice") ||
    r.includes("préfet") ||
    r.includes("prefet") ||
    r.includes("études") ||
    r.includes("etudes") ||
    r.includes("promoteur") ||
    r.includes("propriétaire") ||
    r.includes("proprietaire") ||
    r.includes("super admin") ||
    r.includes("rh") ||
    r.includes("ressources humaines")
  );
}

/**
 * Checks whether an operator role has direct autonomy for general staff / employee management
 */
export function canRoleManageEmployees(role: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return (
    r.includes("directeur") ||
    r.includes("directrice") ||
    r.includes("promoteur") ||
    r.includes("propriétaire") ||
    r.includes("proprietaire") ||
    r.includes("super admin") ||
    r.includes("rh") ||
    r.includes("ressources humaines") ||
    r.includes("préfet") ||
    r.includes("prefet")
  );
}

/**
 * Checks whether an operator role has direct autonomy for finances
 */
export function canRoleManageFinances(role: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return (
    r.includes("comptable") ||
    r.includes("caissier") ||
    r.includes("directeur") ||
    r.includes("promoteur") ||
    r.includes("propriétaire") ||
    r.includes("proprietaire") ||
    r.includes("super admin")
  );
}

/**
 * Generates a unique, high-entropy cryptographic activation code
 * Format: ACT-XXXX-XXXX (ex: ACT-8392-4910)
 */
export function generateUniqueActivationCode(prefix: string = "ACT"): string {
  const segment1 = Math.floor(1000 + Math.random() * 9000);
  const segment2 = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${segment1}-${segment2}`;
}

/**
 * Generates or normalizes the login identifier/matricule for an entity
 */
export function generateUniqueLoginIdentifier(
  type: "eleve" | "parent" | "personnel",
  person: Student | Employee | Parent | { id: string; firstName: string; lastName: string }
): string {
  const currentYear = new Date().getFullYear();
  
  if (type === "eleve") {
    const student = person as Student;
    if (student.registrationNumber && student.registrationNumber.trim() !== "") {
      return student.registrationNumber.trim();
    }
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `ELV-${currentYear}-${rand}`;
  }

  if (type === "parent") {
    const parent = person as Parent;
    if (parent.parentAccountNumber && parent.parentAccountNumber.trim() !== "") {
      return parent.parentAccountNumber.trim();
    }
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `PAR-${currentYear}-${rand}`;
  }

  if (type === "personnel") {
    const emp = person as Employee;
    if (emp.matricule && emp.matricule.trim() !== "") {
      return emp.matricule.trim();
    }
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `PERS-${currentYear}-${rand}`;
  }

  return `ID-${currentYear}-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Validates password strength policy
 */
export function validatePasswordPolicy(password: string): { valid: boolean; errors: string[]; score: number } {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères.");
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre majuscule.");
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre minuscule.");
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre (0-9).");
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
    errors.push("Le mot de passe doit inclure au moins un caractère spécial (!@#$%...).");
  } else {
    score += 1;
  }

  return {
    valid: errors.length === 0,
    errors,
    score
  };
}

/**
 * Validates security questions
 */
export function validateSecurityQuestions(
  questions: { question: string; answer: string }[]
): { valid: boolean; error?: string } {
  if (!questions || questions.length < 3) {
    return { valid: false, error: "Vous devez obligatoirement configurer au moins 3 questions de sécurité distinctes." };
  }

  // Check duplicates in question strings
  const questionTexts = questions.map(q => q.question.trim().toLowerCase());
  const uniqueQuestions = new Set(questionTexts);
  if (uniqueQuestions.size < 3) {
    return { valid: false, error: "Les 3 questions de sécurité doivent être différentes les unes des autres." };
  }

  // Check answers
  for (let i = 0; i < 3; i++) {
    const ans = questions[i].answer ? questions[i].answer.trim() : "";
    if (ans.length < 2) {
      return { valid: false, error: `La réponse à la question n°${i + 1} est trop courte (au moins 2 caractères).` };
    }
  }

  return { valid: true };
}

/**
 * Complete Official Login Sheet Data Structure
 */
export interface OfficialLoginSheetData {
  schoolName: string;
  schoolMotto?: string;
  province?: string;
  schoolYear?: string;
  minepspCode?: string;
  logoUrl?: string;
  beneficiaryPhotoUrl?: string;
  
  personName: string;
  role: string;
  functionOrClass: string;
  loginIdentifier: string; // Matricule / Login ID
  activationCode: string; // Unique one-time code
  portalName: string;
  portalPath: string;
  directAccessUrl: string;
  qrCodePayload: string;
  
  permissions?: string[];
  responsibilities?: string[];
  status?: string;

  phone?: string;
  email?: string;
  generatedDate: string;
  generatedBy?: string;
}

/**
 * Builds the official login sheet payload from a UserAccount and institution configuration
 */
export function buildOfficialLoginSheet(
  account: UserAccount,
  schoolConfig?: {
    schoolName?: string;
    schoolMotto?: string;
    province?: string;
    schoolYear?: string;
    minepspConformityCode?: string;
    logoUrl?: string;
    beneficiaryPhotoUrl?: string;
  },
  operatorName: string = "Secrétariat de Direction"
): OfficialLoginSheetData {
  const currentSchoolName = schoolConfig?.schoolName || account.schoolName || "COMPLEXE SCOLAIRE SMARTSCHOOL RDC";
  const portalInfo = ROLE_PORTAL_MAPPING[account.role] || {
    role: account.role,
    portalName: `Portail ${account.role} SmartSchool RDC`,
    portalCode: "PORTAL_GENERIC",
    portalPath: "/login",
    description: "Accès sécurisé à la plateforme scolaire",
    badgeColor: "text-brand-blue bg-blue-50 border-blue-200"
  };

  const domain = getSafeOrigin();
  const directAccessUrl = `${domain}/#activation?matricule=${encodeURIComponent(account.username)}&code=${encodeURIComponent(account.activationCode)}`;
  
  const resolvedPortalName = (account as any).assignedPortalName || portalInfo.portalName;
  const permissionsList = Array.isArray(account.permissions) ? account.permissions : [];
  const responsibilitiesList = Array.isArray((account as any).responsibilities) ? (account as any).responsibilities : [];

  const qrCodePayload = JSON.stringify({
    app: "SmartSchoolRDC",
    matricule: account.username,
    code: account.activationCode,
    role: account.role,
    portal: resolvedPortalName,
    school: currentSchoolName,
    directUrl: directAccessUrl
  });

  return {
    schoolName: currentSchoolName,
    schoolMotto: schoolConfig?.schoolMotto || "",
    province: schoolConfig?.province || account.province || "",
    schoolYear: schoolConfig?.schoolYear || "2026-2027",
    minepspCode: schoolConfig?.minepspConformityCode || "",
    logoUrl: schoolConfig?.logoUrl || "",
    beneficiaryPhotoUrl: schoolConfig?.beneficiaryPhotoUrl || (account as any).photoUrl || (account as any).photo,
    
    personName: account.fullName || account.username,
    role: account.role,
    functionOrClass: account.functionTitle || account.role,
    loginIdentifier: account.username,
    activationCode: account.activationCode,
    portalName: resolvedPortalName,
    portalPath: portalInfo.portalPath,
    directAccessUrl,
    qrCodePayload,
    
    permissions: permissionsList,
    responsibilities: responsibilitiesList,
    status: account.isActive ? "Actif" : "Inactif",

    phone: account.phone,
    email: account.email,
    generatedDate: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    generatedBy: operatorName
  };
}

/**
 * Generate formatted WhatsApp message for credentials dispatch
 */
export function buildWhatsAppShareUrl(sheet: OfficialLoginSheetData): string {
  const text = `🎓 *FICHE OFFICIELLE D'ACCÈS SMARTSCHOOL RDC*
🏛️ *${sheet.schoolName.toUpperCase()}*

Bonjour *${sheet.personName}*,

Votre compte d'accès officiel a été créé avec succès pour l'année scolaire *${sheet.schoolYear}*.

👤 *Bénéficiaire :* ${sheet.personName}
🏷️ *Rôle / Profil :* ${sheet.role} (${sheet.functionOrClass})
🌐 *Portail d'accès :* ${sheet.portalName}

🔑 *VOS IDENTIFIANTS DE 1ÈRE CONNEXION :*
━━━━━━━━━━━━━━━━━━━━━━
🆔 *Identifiant / Matricule :* \`${sheet.loginIdentifier}\`
⚡ *Code d'activation unique :* \`${sheet.activationCode}\`
━━━━━━━━━━━━━━━━━━━━━━

⚠️ *Procédure obligatoire lors de votre première connexion :*
1. Rendez-vous sur la plateforme : ${getSafeOrigin()}
2. Entrez votre *Matricule* et votre *Code d'activation*.
3. Créez votre mot de passe personnel sécurisé.
4. Répondez aux 3 questions de sécurité obligatoires.
Le code d'activation deviendra alors définitivement expiré.

🔗 *Lien d'activation rapide :*
${sheet.directAccessUrl}

_Document officiel généré par ${sheet.generatedBy} le ${sheet.generatedDate}._`;

  const phoneClean = sheet.phone ? sheet.phone.replace(/[^0-9]/g, "") : "";
  if (phoneClean) {
    return `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Generate formatted SMS body and share URL
 */
export function buildSmsShareUrl(sheet: OfficialLoginSheetData): string {
  const text = `SMARTSCHOOL RDC - ${sheet.schoolName}: Compte cree pour ${sheet.personName} (${sheet.role}). Matricule: ${sheet.loginIdentifier} | Code Activation: ${sheet.activationCode}. Activez votre compte sur: ${getSafeOrigin()}`;
  const phoneClean = sheet.phone ? sheet.phone.replace(/[^0-9]/g, "") : "";
  if (phoneClean) {
    return `sms:${phoneClean}?body=${encodeURIComponent(text)}`;
  }
  return `sms:?body=${encodeURIComponent(text)}`;
}

/**
 * Generate Email Mailto URL
 */
export function buildMailtoShareUrl(sheet: OfficialLoginSheetData): string {
  const subject = `Fiche d'accès officiel SmartSchool RDC - ${sheet.personName} (${sheet.loginIdentifier})`;
  const body = `Bonjour ${sheet.personName},

Voici votre fiche de connexion officielle pour accéder à votre portail sur la plateforme SmartSchool RDC au sein de l'établissement "${sheet.schoolName}".

INFORMATIONS DE CONNEXION :
- Nom : ${sheet.personName}
- Rôle : ${sheet.role} (${sheet.functionOrClass})
- Portail : ${sheet.portalName}
- Matricule / Identifiant : ${sheet.loginIdentifier}
- Code d'activation (Usage unique) : ${sheet.activationCode}

DIRECTIVES DE SÉCURITÉ :
Lors de votre première connexion, vous devrez obligatoirement définir votre propre mot de passe personnel et configurer 3 questions de sécurité. Le code d'activation temporaire sera alors définitivement invalidé.

Lien direct d'activation :
${sheet.directAccessUrl}

Secrétariat Administratif & IAM
${sheet.schoolName}
République Démocratique du Congo`;

  const to = sheet.email || "";
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Payload for provisioning a new user account from an existing dossier
 */
export interface ProvisionUserAccountPayload {
  dossierId: string;
  dossierType: "personnel" | "eleve" | "parent" | "smartschool_staff" | "school_admin" | "epst_inspector";
  fullName: string;
  identifierOrMatricule?: string;
  targetRole: string;
  phone?: string;
  email?: string;
  functionOrClass?: string;
  schoolId?: string;
  schoolName?: string;
  province?: string;
}

export interface ProvisionOperatorInfo {
  operatorName?: string;
  operatorRole?: string;
}

export interface ProvisionResult {
  userAccount: UserAccount;
  auditEvent?: {
    id: string;
    actor: string;
    action: string;
    target: string;
    timestamp: string;
    details: string;
  };
}

/**
 * Provision a user account object and generate activation credentials for an entity
 * Automatically binds:
 * 1. Unique account identifier (id and username/matricule)
 * 2. Role
 * 3. Associated portal (portalUrl, portalCode, portalName, targetPortalTab, componentName)
 * 4. RBAC permissions (rbacPermissions and permissions)
 * 5. Associated institution/establishment (schoolId, schoolName, province)
 */
export function provisionUserAccountForPerson(
  payload: ProvisionUserAccountPayload,
  operator?: ProvisionOperatorInfo
): ProvisionResult {
  const portalInfo = getPortalConfigForRole(payload.targetRole);
  const rbacPermissions = getRoleRbacPermissions(payload.targetRole);

  const codePrefix =
    payload.targetRole === "Élève" ? "ELV" :
    payload.targetRole === "Parent" ? "PAR" :
    payload.targetRole === "Enseignant" ? "ENS" :
    payload.targetRole === "Directeur" || payload.targetRole === "Directeur Général" ? "DIR" :
    payload.targetRole.includes("Préfet") || payload.targetRole.includes("Etudes") ? "PREF" :
    payload.targetRole.includes("Comptable") ? "CPT" :
    payload.targetRole.includes("Caissier") ? "CSH" :
    payload.targetRole.includes("Secrétaire") ? "SEC" :
    payload.targetRole.includes("Bibliothécaire") ? "BIB" :
    payload.targetRole.includes("Inspect") ? "INSP" :
    payload.targetRole.includes("RH") ? "RH" :
    "ACT";

  const activationCode = generateUniqueActivationCode(codePrefix);

  const username = payload.identifierOrMatricule && payload.identifierOrMatricule.trim() !== ""
    ? payload.identifierOrMatricule.trim()
    : generateUniqueLoginIdentifier(
        payload.dossierType === "eleve" ? "eleve" :
        payload.dossierType === "parent" ? "parent" : "personnel",
        { id: payload.dossierId, firstName: payload.fullName, lastName: "" }
      );

  const userAccount: UserAccount = {
    id: `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dossierId: payload.dossierId,
    dossierType: payload.dossierType,
    fullName: payload.fullName,
    functionTitle: payload.functionOrClass || payload.targetRole,
    phone: payload.phone,
    phoneVerified: false,
    email: payload.email,
    emailVerified: false,
    username,
    role: payload.targetRole,
    accountCategory: payload.dossierType,
    isActive: true,
    isActivated: false,
    isSuspended: false,
    isLocked: false,
    failedLoginAttempts: 0,
    activationCode,
    createdAt: new Date().toLocaleDateString("fr-FR"),
    schoolId: payload.schoolId || "",
    schoolName: payload.schoolName || "",
    province: payload.province || "",
    
    // Explicit portal associations
    portalUrl: portalInfo.portalPath,
    portalCode: portalInfo.portalCode,
    portalName: portalInfo.portalName,
    targetPortalTab: portalInfo.targetTab,
    
    // Explicit RBAC Permissions
    rbacPermissions: rbacPermissions,
    permissions: rbacPermissions,
    
    securityQuestionsSet: false,
    mustChangePasswordOnFirstLogin: true,
    createdBy: operator?.operatorName || "Secrétariat IAM",
    creatorRole: operator?.operatorRole || "Administrateur"
  };

  // Automatically persist in Universal Repository and synchronize
  persistUniversalUserAccount(userAccount);

  const auditEvent = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actor: `${operator?.operatorName || "Système IAM"} (${operator?.operatorRole || "Admin"})`,
    action: "Création de compte & Association Portail",
    target: `${payload.fullName} (${payload.targetRole}) - ${username}`,
    timestamp: new Date().toLocaleString("fr-FR"),
    details: `Attribution du rôle "${payload.targetRole}", liaison au "${portalInfo.portalName}" (${portalInfo.targetTab}), permissions RBAC [${rbacPermissions.length} droits] et code d'activation ${activationCode}`
  };

  return { userAccount, auditEvent };
}

/**
 * Executes direct opening of the associated portal for any user account
 */
export function openPortalForUserAccount(
  account: UserAccount,
  callbacks: {
    setUserName: (name: string) => void;
    setUserRole: (role: string) => void;
    setActiveTab: (tab: string) => void;
    setActiveSchoolId?: (schoolId: string) => void;
    onToast?: (message: string, type: "success" | "info" | "warning") => void;
    closeModal?: () => void;
  }
) {
  const portalConfig = getPortalConfigForRole(account.role);
  
  // 1. Establish session identity
  callbacks.setUserName(account.fullName || account.username);
  callbacks.setUserRole(account.role);
  
  // 2. Associate school context if available
  if (account.schoolId && callbacks.setActiveSchoolId) {
    callbacks.setActiveSchoolId(account.schoolId);
  }

  // 3. Switch to target portal tab
  const targetTab = account.targetPortalTab || portalConfig.targetTab || "dashboard";
  callbacks.setActiveTab(targetTab);

  // 4. Close any open modal
  if (callbacks.closeModal) {
    callbacks.closeModal();
  }

  // 5. Notify user
  if (callbacks.onToast) {
    callbacks.onToast(`Portail ouvert avec succès : ${portalConfig.portalName} (${account.fullName || account.username})`, "success");
  }
}

/* ==========================================================================
   UNIVERSAL REPOSITORY, IDENTITY VERIFICATION & SECURE ACTIVATION ENGINE
   ========================================================================== */

export const UNIVERSAL_ACCOUNTS_STORAGE_KEY = "smartschool_universal_user_accounts";

/**
 * Normalizes input credential strings (strips invisible characters, trims, normalizes dashes, lowercase)
 */
export function normalizeCredentialString(input?: string | null): string {
  if (!input) return "";
  return String(input)
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "") // remove zero-width & non-breaking spaces
    .replace(/[\u2010\u2012\u2013\u2014\u2212]/g, "-") // normalize dashes
    .trim()
    .toLowerCase();
}

/**
 * Load all user accounts from local storage persistence
 */
export function getStoredUniversalUserAccounts(): UserAccount[] {
  try {
    const raw = safeLocalStorage.getItem(UNIVERSAL_ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Erreur lors de la lecture des comptes universels:", err);
    return [];
  }
}

/**
 * Persists a user account to localStorage and Firestore (if configured)
 */
export async function persistUniversalUserAccount(account: UserAccount): Promise<UserAccount> {
  try {
    const existing = getStoredUniversalUserAccounts();
    const index = existing.findIndex(
      a => a.id === account.id || (a.username && a.username.toLowerCase() === account.username.toLowerCase())
    );
    let updated: UserAccount[];
    if (index >= 0) {
      updated = existing.map((a, i) => (i === index ? { ...a, ...account } : a));
    } else {
      updated = [account, ...existing];
    }
    safeLocalStorage.setItem(UNIVERSAL_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));

    // Also dispatch a browser custom event for instant cross-component synchronization
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("smartschool_account_synced", { detail: account }));
    }

    // Persist to Server API
    try {
      fetch(`/api/data/${account.schoolId || "global"}/user_accounts/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: account })
      }).catch(() => {});
    } catch (e) {}

    // Persist to Firestore if available
    if (isFirebaseConfigured && db && account.id) {
      try {
        await setDoc(doc(db, "user_accounts", account.id), {
          ...account,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (fbErr) {
        console.warn("Firestore user_accounts sync warning:", fbErr);
      }
    }
  } catch (err) {
    console.error("Erreur lors de l'enregistrement du compte universel:", err);
  }
  return account;
}

export interface UniversalIdentityField {
  label: string;
  value: string;
}

export interface UniversalVerificationResult {
  found: boolean;
  dossierType: "parent" | "eleve" | "personnel" | "enseignant" | "admin" | "inspecteur" | "generic";
  dossier: any;
  userAccount?: UserAccount;
  fullName: string;
  role: string;
  matricule: string;
  activationCode: string;
  photoUrl?: string;
  schoolName: string;
  schoolId?: string;
  details: UniversalIdentityField[];
  isAlreadyActivated?: boolean;
  mustChangePassword?: boolean;
  portalConfig: PortalConfig;
  error?: string;
}

/**
 * Universally searches and verifies identity against all registered dossiers & accounts
 */
export function verifyUniversalIdentity(payload: {
  matriculeOrId: string;
  activationCode: string;
  schoolId?: string;
  userAccounts?: UserAccount[];
  students?: Student[];
  employees?: Employee[];
  parents?: Parent[];
  teachers?: Teacher[];
}): UniversalVerificationResult {
  const normMatricule = normalizeCredentialString(payload.matriculeOrId);
  const normCode = normalizeCredentialString(payload.activationCode);

  if (!normMatricule || !normCode) {
    return {
      found: false,
      dossierType: "generic",
      dossier: null,
      fullName: "",
      role: "",
      matricule: payload.matriculeOrId || "",
      activationCode: payload.activationCode || "",
      schoolName: "",
      details: [],
      portalConfig: getPortalConfigForRole(""),
      error: "Veuillez renseigner à la fois votre matricule/identifiant et votre code d'activation."
    };
  }

  // Aggregate user accounts from in-memory state and localStorage
  const storedAccounts = getStoredUniversalUserAccounts();
  const allAccountsMap = new Map<string, UserAccount>();
  
  (payload.userAccounts || []).forEach(acc => {
    if (acc.id) allAccountsMap.set(acc.id, acc);
    if (acc.username) allAccountsMap.set(`user:${acc.username.toLowerCase()}`, acc);
  });
  storedAccounts.forEach(acc => {
    if (acc.id && !allAccountsMap.has(acc.id)) allAccountsMap.set(acc.id, acc);
    if (acc.username && !allAccountsMap.has(`user:${acc.username.toLowerCase()}`)) {
      allAccountsMap.set(`user:${acc.username.toLowerCase()}`, acc);
    }
  });

  const allAccounts = Array.from(allAccountsMap.values());

  // 1. Search in Universal UserAccounts
  const matchedAcc = allAccounts.find(acc => {
    const accUser = normalizeCredentialString(acc.username);
    const accCode = normalizeCredentialString(acc.activationCode);
    const accPhone = normalizeCredentialString(acc.phone);
    const accEmail = normalizeCredentialString(acc.email);
    const accDossierId = normalizeCredentialString(acc.dossierId);
    const accId = normalizeCredentialString(acc.id);

    const userMatches =
      accUser === normMatricule ||
      accPhone === normMatricule ||
      accEmail === normMatricule ||
      accDossierId === normMatricule ||
      accId === normMatricule;

    const codeMatches =
      accCode === normCode ||
      (acc.tempPassword && normalizeCredentialString(acc.tempPassword) === normCode);

    return userMatches && codeMatches;
  });

  if (matchedAcc) {
    const portalConfig = getPortalConfigForRole(matchedAcc.role);
    const details: UniversalIdentityField[] = [
      { label: "Matricule / Identifiant", value: matchedAcc.username },
      { label: "Rôle attribué", value: matchedAcc.role },
      { label: "Portail d'accès", value: portalConfig.portalName },
      { label: "Établissement", value: matchedAcc.schoolName || "Établissement SmartSchool RDC" }
    ];

    if (matchedAcc.phone) details.push({ label: "Téléphone", value: matchedAcc.phone });
    if (matchedAcc.email) details.push({ label: "Email", value: matchedAcc.email });

    return {
      found: true,
      dossierType: (matchedAcc.dossierType as any) || "generic",
      dossier: matchedAcc,
      userAccount: matchedAcc,
      fullName: matchedAcc.fullName || matchedAcc.username,
      role: matchedAcc.role,
      matricule: matchedAcc.username,
      activationCode: matchedAcc.activationCode,
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      schoolName: matchedAcc.schoolName || "Établissement SmartSchool RDC",
      schoolId: matchedAcc.schoolId,
      details,
      isAlreadyActivated: matchedAcc.isActivated === true,
      mustChangePassword: matchedAcc.mustChangePasswordOnFirstLogin !== false,
      portalConfig
    };
  }

  // 2. Search in Parents registry
  const matchedParent = (payload.parents || []).find(p => {
    const pAccNum = normalizeCredentialString(p.parentAccountNumber);
    const pUsername = normalizeCredentialString(p.username);
    const pPhone = normalizeCredentialString(p.phone);
    const pEmail = normalizeCredentialString(p.email);
    const pId = normalizeCredentialString(p.id);
    const pCode = normalizeCredentialString(p.activationCode);

    const userMatches =
      pAccNum === normMatricule ||
      pUsername === normMatricule ||
      pPhone === normMatricule ||
      pEmail === normMatricule ||
      pId === normMatricule;

    const codeMatches = pCode === normCode;

    return userMatches && codeMatches;
  });

  if (matchedParent) {
    const portalConfig = getPortalConfigForRole("Parent");
    const parentMatricule = matchedParent.parentAccountNumber || matchedParent.username || payload.matriculeOrId;
    const details: UniversalIdentityField[] = [
      { label: "Matricule Parent", value: parentMatricule },
      { label: "Qualité / Lien", value: matchedParent.relationship || "Parent / Tuteur légal" },
      { label: "Enfants rattachés", value: (matchedParent.childrenNames && matchedParent.childrenNames.length > 0) ? matchedParent.childrenNames.join(", ") : "En attente d'affectation" },
      { label: "Téléphone", value: matchedParent.phone || "Non renseigné" },
      { label: "Adresse", value: matchedParent.address || "Non renseignée" }
    ];

    return {
      found: true,
      dossierType: "parent",
      dossier: matchedParent,
      fullName: `${matchedParent.lastName} ${matchedParent.firstName}`.trim(),
      role: "Parent",
      matricule: parentMatricule,
      activationCode: matchedParent.activationCode || payload.activationCode,
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
      details,
      isAlreadyActivated: matchedParent.accountStatus === "active",
      mustChangePassword: true,
      portalConfig
    };
  }

  // 3. Search in Employees registry
  const matchedEmp = (payload.employees || []).find(e => {
    const eMatricule = normalizeCredentialString(e.matricule);
    const eIdSsrdc = normalizeCredentialString(e.idSsrdc);
    const eEmail = normalizeCredentialString(e.email);
    const ePhone = normalizeCredentialString(e.phone);
    const eId = normalizeCredentialString(e.id);
    const eCode = normalizeCredentialString(e.activationCode);

    const userMatches =
      eMatricule === normMatricule ||
      eIdSsrdc === normMatricule ||
      eEmail === normMatricule ||
      ePhone === normMatricule ||
      eId === normMatricule;

    const codeMatches = eCode === normCode;

    return userMatches && codeMatches;
  });

  if (matchedEmp) {
    const empRole = matchedEmp.userAccountRole || matchedEmp.function || "Personnel";
    const portalConfig = getPortalConfigForRole(empRole);
    const details: UniversalIdentityField[] = [
      { label: "Matricule Agent", value: matchedEmp.matricule },
      { label: "Fonction / Rôle", value: empRole },
      { label: "Département", value: matchedEmp.department || "Pédagogie" },
      { label: "Téléphone", value: matchedEmp.phone || "Non renseigné" },
      { label: "Statut administratif", value: matchedEmp.contractType || "Actif" }
    ];

    return {
      found: true,
      dossierType: "personnel",
      dossier: matchedEmp,
      fullName: `${matchedEmp.lastName} ${matchedEmp.firstName}`.trim(),
      role: empRole,
      matricule: matchedEmp.matricule,
      activationCode: matchedEmp.activationCode || payload.activationCode,
      photoUrl: matchedEmp.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
      details,
      isAlreadyActivated: (matchedEmp as any).accountStatus === "active" || (matchedEmp.hasUserAccount && (matchedEmp as any).isActivated),
      mustChangePassword: true,
      portalConfig
    };
  }

  // 4. Search in Students registry
  const matchedStd = (payload.students || []).find(s => {
    const sReg = normalizeCredentialString(s.registrationNumber);
    const sEmail = normalizeCredentialString(s.parentEmail);
    const sPhone = normalizeCredentialString(s.parentPhone);
    const sId = normalizeCredentialString(s.id);
    const sCode = normalizeCredentialString(s.activationCode);

    const userMatches =
      sReg === normMatricule ||
      sEmail === normMatricule ||
      sPhone === normMatricule ||
      sId === normMatricule;

    const codeMatches = sCode === normCode;

    return userMatches && codeMatches;
  });

  if (matchedStd) {
    const portalConfig = getPortalConfigForRole("Élève");
    const details: UniversalIdentityField[] = [
      { label: "Matricule / Registre", value: matchedStd.registrationNumber },
      { label: "Classe", value: matchedStd.className || "Non assignée" },
      { label: "Parent / Tuteur", value: matchedStd.parentName || "Non spécifié" },
      { label: "Contact d'urgence", value: matchedStd.parentPhone || "Non renseigné" }
    ];

    return {
      found: true,
      dossierType: "eleve",
      dossier: matchedStd,
      fullName: `${matchedStd.lastName} ${matchedStd.firstName}`.trim(),
      role: "Élève",
      matricule: matchedStd.registrationNumber,
      activationCode: matchedStd.activationCode || payload.activationCode,
      photoUrl: matchedStd.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
      details,
      isAlreadyActivated: matchedStd.accountStatus === "active",
      mustChangePassword: true,
      portalConfig
    };
  }

  // 5. Search in Teachers registry
  const matchedTeacher = (payload.teachers || []).find(t => {
    const tMat = normalizeCredentialString(t.matriculeEtat);
    const tEmail = normalizeCredentialString(t.email);
    const tPhone = normalizeCredentialString(t.phone);
    const tId = normalizeCredentialString(t.id);

    const userMatches =
      tMat === normMatricule ||
      tEmail === normMatricule ||
      tPhone === normMatricule ||
      tId === normMatricule;

    const codeMatches = normCode.length >= 4;
    return userMatches && codeMatches;
  });

  if (matchedTeacher) {
    const portalConfig = getPortalConfigForRole("Enseignant");
    const details: UniversalIdentityField[] = [
      { label: "Matricule Enseignant", value: matchedTeacher.matriculeEtat || payload.matriculeOrId },
      { label: "Discipline / Spécialité", value: matchedTeacher.specialty || "Pédagogie générale" },
      { label: "Classes assignées", value: (matchedTeacher.assignedClasses || []).join(", ") || "En cours" },
      { label: "Téléphone", value: matchedTeacher.phone || "Non renseigné" }
    ];

    return {
      found: true,
      dossierType: "enseignant",
      dossier: matchedTeacher,
      fullName: `${matchedTeacher.lastName} ${matchedTeacher.firstName}`.trim(),
      role: "Enseignant",
      matricule: matchedTeacher.matriculeEtat || payload.matriculeOrId,
      activationCode: payload.activationCode,
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
      details,
      isAlreadyActivated: false,
      mustChangePassword: true,
      portalConfig
    };
  }

  return {
    found: false,
    dossierType: "generic",
    dossier: null,
    fullName: "",
    role: "",
    matricule: payload.matriculeOrId,
    activationCode: payload.activationCode,
    schoolName: "",
    details: [],
    portalConfig: getPortalConfigForRole(""),
    error: "Aucun dossier correspondant trouvé avec ce matricule et ce code d'activation. Veuillez vérifier l'exactitude des informations saisies."
  };
}

/**
 * Finalizes account activation for any verified identity
 */
export async function finalizeUniversalAccountActivation(payload: {
  verifiedResult: UniversalVerificationResult;
  newUsername?: string;
  newPassword?: string;
  securityQuestions?: { question: string; answer: string }[];
  recoveryPhone?: string;
  recoveryEmail?: string;
}): Promise<{
  success: boolean;
  userAccount: UserAccount;
  targetTab: string;
  portalConfig: PortalConfig;
  error?: string;
}> {
  const { verifiedResult, newPassword, securityQuestions, recoveryPhone, recoveryEmail } = payload;
  const username = (payload.newUsername || verifiedResult.matricule).trim();

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      userAccount: null as any,
      targetTab: "dashboard",
      portalConfig: verifiedResult.portalConfig,
      error: "Le mot de passe doit comporter au moins 6 caractères."
    };
  }

  const role = verifiedResult.role || "Utilisateur";
  const portalConfig = getPortalConfigForRole(role);
  const rbacPermissions = getRoleRbacPermissions(role);
  const nowStr = new Date().toLocaleDateString("fr-FR");

  const finalAccount: UserAccount = {
    ...(verifiedResult.userAccount || {}),
    id: verifiedResult.userAccount?.id || `acc-univ-${Date.now()}`,
    dossierId: verifiedResult.dossier?.id || verifiedResult.matricule,
    dossierType: verifiedResult.dossierType === "enseignant" ? "personnel" : (verifiedResult.dossierType as any),
    fullName: verifiedResult.fullName,
    username,
    password: newPassword,
    role,
    isActive: true,
    isActivated: true,
    isSuspended: false,
    isLocked: false,
    activationCode: verifiedResult.activationCode,
    createdAt: verifiedResult.userAccount?.createdAt || nowStr,
    activatedAt: new Date().toLocaleString("fr-FR"),
    schoolId: verifiedResult.schoolId || verifiedResult.userAccount?.schoolId || "default",
    schoolName: verifiedResult.schoolName || verifiedResult.userAccount?.schoolName || "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
    portalUrl: portalConfig.portalPath,
    portalCode: portalConfig.portalCode,
    portalName: portalConfig.portalName,
    targetPortalTab: portalConfig.targetTab,
    rbacPermissions,
    permissions: rbacPermissions,
    securityQuestionsSet: Boolean(securityQuestions && securityQuestions.length >= 3),
    securityQuestions: securityQuestions || [],
    mustChangePasswordOnFirstLogin: false,
    firstLoginCompleted: true,
    phone: recoveryPhone || verifiedResult.dossier?.phone || verifiedResult.userAccount?.phone,
    email: recoveryEmail || verifiedResult.dossier?.email || verifiedResult.userAccount?.email
  };

  // Persist to universal storage
  await persistUniversalUserAccount(finalAccount);

  return {
    success: true,
    userAccount: finalAccount,
    targetTab: portalConfig.targetTab,
    portalConfig
  };
}

