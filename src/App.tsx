import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  School, 
  Eye, 
  EyeOff, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone, 
  Mail, 
  Lock, 
  Sparkles, 
  MessageSquare,
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  X, 
  BookOpen, 
  Activity, 
  UserCheck, 
  Award, 
  GraduationCap,
  Menu,
  LogOut,
  Users,
  Landmark,
  Calendar,
  Bell,
  ChevronRight,
  ChevronDown,
  Search,
  ChevronLeft,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  BadgeHelp,
  Clock,
  Plus,
  CheckCircle,
  Building,
  Building2,
  ArrowLeft,
  Briefcase,
  Fingerprint,
  FileSignature,
  QrCode,
  ScanLine,
  UserPlus,
  UserMinus,
  FileBadge,
  ShieldAlert,
  RefreshCw,
  Sliders,
  Server,
  Tv,
  Database,
  HardDrive,
  Film,
  Printer,
  Camera,
  Image as ImageIcon,
  Home
} from "lucide-react";

import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { PageHeaderNavigation } from "./components/PageHeaderNavigation";

import { 
  DashboardView, TeachersView, ParentsView, ClassesView, 
  OptionsView, SubjectsView, AttendanceView, GradesView, BulletinsView, 
  TimetableView, AccountsView, ReportsView, NotificationsView, SettingsView,
  CnrEpstView
} from "./components/ModuleComponents";
import { PupilsView } from "./components/PupilsView";

import { AdminWorkspaceView } from "./components/AdminWorkspaceView";
import { PedagogicalEvent } from "./types";

import { HrModuleView } from "./components/HrModuleView";
import { Messagerie } from "./components/Messagerie";
import { FinanceModule } from "./components/FinanceModule";
import { ReportsModule } from "./components/ReportsModule";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StudentModule } from "./components/StudentModule";
import { ParentModule } from "./components/ParentModule";
import { TeacherModule } from "./components/TeacherModule";
import { IntegratedTimetableManagementView } from "./components/IntegratedTimetableManagementView";
import { PedagogicalPlannerModule } from "./components/PedagogicalPlannerModule";
import { ClassJournalModule } from "./components/ClassJournalModule";
import { EvaluationGradingSystem } from "./components/EvaluationGradingSystem";

import { SmartTemplateEngine } from "./components/SmartTemplateEngine";
import { SchoolManagement } from "./components/SchoolManagement";
import { FirstUseWizard } from "./components/FirstUseWizard";
import { SuperAdminPlatform } from "./components/SuperAdminPlatform";
import { NationalJobsModule } from "./components/NationalJobsModule";
import { PromoVideoStudio } from "./components/PromoVideoStudio";
import { HomeworkModule } from "./components/HomeworkModule";
import { OfficialListsPrintingCenter } from "./components/OfficialListsPrintingCenter";
import { SchoolGalleryModule } from "./components/SchoolGalleryModule";
import { InterSchoolNetworkModule } from "./components/InterSchoolNetworkModule";
import { Crown, KeyRound, Presentation } from "lucide-react";
import { SmartSchoolPresentationDocument } from "./components/SmartSchoolPresentationDocument";
import { NationalCultureHeritageModule } from "./components/NationalCultureHeritageModule";
import { OwnerControlCenter } from "./components/OwnerControlCenter";
import { PromoterFinancialControlCenter } from "./components/PromoterFinancialControlCenter";
import { ManageSchoolsModule } from "./components/ManageSchoolsModule";
import { NationalUserAccountsIAMModule } from "./components/NationalUserAccountsIAMModule";
import { OfficialLoginSheetModal } from "./components/OfficialLoginSheetModal";
import { 
  openPortalForUserAccount, 
  getPortalConfigForRole, 
  getRoleRbacPermissions,
  canRoleManageStudents,
  canRoleManageTeachers,
  canRoleManageEmployees,
  canRoleCreateAccountsFor,
  verifyUniversalIdentity,
  finalizeUniversalAccountActivation,
  persistUniversalUserAccount,
  getStoredUniversalUserAccounts,
  UniversalVerificationResult
} from "./services/accountActivationService";
import { NationalInspectionModule } from "./components/NationalInspectionModule";
import { NationalBackupDisasterRecoveryModule } from "./components/NationalBackupDisasterRecoveryModule";
import { SchoolBackupAndTrashModule } from "./components/SchoolBackupAndTrashModule";
import { UserProfileSecurity } from "./components/UserProfileSecurity";
import { AIAnalystModule } from "./components/AIAnalystModule";
import { UniversalExportCenter } from "./components/UniversalExportCenter";
import { AutomatedSystemAuditAndTestCenter } from "./components/AutomatedSystemAuditAndTestCenter";
import { SchoolAdministrationPortalModule } from "./components/SchoolAdministrationPortalModule";
import { FirstTimeLoginWizard, FirstTimeLoginWizardUser } from "./components/FirstTimeLoginWizard";
import { safeLocalStorage, safeSessionStorage, getSafeOrigin } from "./utils/safeStorage";
import { centralAuthService } from "./services/centralAuthService";
import { initialTemplateModels } from "./data/templates";
import { INITIAL_PLATFORM_STAFF } from "./utils/platformStaffDefaults";
import { 
  loginWithFirebase, 
  registerWithFirebase, 
  logoutWithFirebase, 
  isFirebaseConfigured, 
  syncCollectionToFirestore, 
  fetchCollectionFromFirestore 
} from "./services/firebase";
import {
  loadPersistentCollection,
  savePersistentCollection,
  savePersistentItem,
  deletePersistentItem
} from "./services/dataPersistenceService";

import { fetchPlatformBranding } from "./services/platformBrandingService";
import { SmartSchoolLogo } from "./components/SmartSchoolLogo";
import { CongoleseStudentsStudyAnimation } from "./components/CongoleseStudentsStudyAnimation";
import { School3DLandingHero } from "./components/School3DLandingHero";
import { SchoolWelcome3DAnimation } from "./components/SchoolWelcome3DAnimation";
import { SMARTSCHOOL_OFFICIAL_LOGO, SMARTSCHOOL_SIGNATURE } from "./constants/branding";


import { 
  initialStudents, initialTeachers, initialParents, initialClasses, 
  initialOptions, initialSubjects, initialAttendances, initialGrades, 
  initialPayments, initialTimetable, initialNotifications 
} from "./data";

import {
  initialEmployees, initialHrAttendances, initialHrLeaves,
  initialHrPromotions, initialHrSanctions, initialHrEvaluations,
  initialHrTrainings, initialHrMutations, initialHrAuditLogs
} from "./data/hrData";

import { 
  Student, Teacher, Parent, ClassRoom, Option, Subject, Grade, 
  Attendance, Payment, TimetableEntry, NotificationItem, CnrResource, 
  CnrSyncLog, School as SchoolType, InscriptionAuditLog, ClassAnnouncement,
  Employee, EmployeeAttendance, EmployeeLeave, EmployeePromotion,
  EmployeeSanction, EmployeeEvaluation, EmployeeTraining, EmployeeMutation,
  HrAuditLog, UserAccount, StudentGuardianLink, ParentGuardianLink,
  PlatformStaffMember, SchoolBulletinPermissions
} from "./types";

export function getTabMetadata(tab: string) {
  switch (tab) {
    case "dashboard":
      return { title: "Tableau de Bord National & Établissement", category: "Principal", subtitle: "Vue d'ensemble et métriques clés de l'établissement" };
    case "etablissements":
      return { title: "Gestion des Établissements Scolaires", category: "Configuration", subtitle: "Supervision des structures et configurations d'école" };
    case "eleves":
      return { title: "Répertoire & Fiches des Élèves", category: "Pédagogie & Élèves", subtitle: "Inscriptions, matricules nationaux et dossiers scolaires" };
    case "enseignants":
      return { title: "Corps Enseignant & Professeurs", category: "Pédagogie & Élèves", subtitle: "Gestion des professeurs et charges horaires" };
    case "parents":
      return { title: "Portail & Fiches Parents Tuteurs", category: "Pédagogie & Élèves", subtitle: "Comptes de famille et suivi des enfants" };
    case "classes":
      return { title: "Salles de Classe & Effectifs", category: "Configuration d'Étude", subtitle: "Répartition des élèves et capacités des locaux" };
    case "options":
      return { title: "Options & Filières d'Enseignement", category: "Configuration d'Étude", subtitle: "Sections d'études et filières humanités" };
    case "matieres":
      return { title: "Matières & Cours Scolaires", category: "Configuration d'Étude", subtitle: "Programme d'études et pondérations" };
    case "presences":
      return { title: "Gestion des Présences & Absences", category: "Vie Scolaire & Suivi", subtitle: "Suivi quotidien des appels et ponctualité" };
    case "cotes":
      return { title: "Cahier de Cotes & Évaluations", category: "Vie Scolaire & Suivi", subtitle: "Saisie des notes, interrogations et examens" };
    case "bulletins":
      return { title: "Bulletins de Notes & Palmarès", category: "Vie Scolaire & Suivi", subtitle: "Calcul des pourcentages et génération des bulletins RDC" };
    case "devoirs":
      return { title: "Devoirs & Travaux à Domicile", category: "Vie Scolaire & Suivi", subtitle: "Distribution et suivi des devoirs d'élèves" };
    case "horaires":
      return { title: "Emplois du Temps & Affectations des Cours", category: "Pédagogie & Études", subtitle: "Gestion de la grille horaire, affectation des cours et détection des conflits" };
    case "planification_pedagogique":
      return { title: "Planification Pédagogique & Prévisions Annuelles", category: "Pédagogie & Études", subtitle: "Prévisions des matières, découpage hebdomadaire et suivi de progression" };
    case "journal_classe":
      return { title: "Journal de Classe & Cahier de Textes Officiel", category: "Pédagogie & Études", subtitle: "Journalisation quotidienne, objectifs opérationnels et visas de direction" };
    case "comptabilite":
      return { title: "Comptabilité & Caisse Scolaire", category: "Gestion Financière", subtitle: "Frais scolaires, paiements Mobile Money et reçus" };
    case "rapports":
      return { title: "Rapports Statistique & Synthèses", category: "Analyse & Alertes", subtitle: "Analyses de réussite et bilans financiers" };
    case "messagerie":
      return { title: "Messagerie & Discussion Directe", category: "Vie Scolaire & Suivi", subtitle: "Communication sécurisée entre administration, profs et parents" };
    case "sms":
      return { title: "Notifications & Alertes SMS", category: "Analyse & Alertes", subtitle: "Diffusion d'alertes par SMS et notifications officielles" };
    case "parametres":
      return { title: "Paramètres de l'Établissement", category: "Configuration", subtitle: "Identité visuelle, cachets, signatures et devise" };
    case "profil_securite":
      return { title: "Profil Utilisateur & Sécurité", category: "Compte", subtitle: "Données personnelles, mot de passe et sécurité M365" };
    case "rh":
    case "rh_dashboard":
    case "rh_personnel":
    case "rh_ajouter":
    case "rh_organigramme":
    case "rh_cartes":
    case "rh_comptes":
    case "rh_presences":
    case "rh_conges":
    case "rh_evaluations":
    case "rh_formations":
    case "rh_promotions":
    case "rh_sanctions":
    case "rh_mouvements":
    case "rh_journal":
    case "rh_parametres":
      return { title: "Gestion des Ressources Humaines (RH) & Paie", category: "Personnel & RH", subtitle: "Dossiers du personnel, paie, contrats et approbations" };
    case "iam_national":
    case "comptes_utilisateurs":
    case "gestion_comptes":
    case "sa_users":
      return { title: "Gestion Nationale des Comptes & IAM", category: "Régulation & Souveraineté", subtitle: "Directoire unifié des identités et réinitialisation des accès" };
    case "sa_saas_center":
    case "sa_dashboard":
    case "sa_schools":
    case "sa_provinces":
    case "sa_inspections":
    case "sa_years":
    case "sa_roles":
    case "sa_features":
    case "sa_announcements":
    case "sa_ai_assistant":
    case "sa_subscriptions":
    case "sa_payments":
    case "sa_support":
    case "sa_audit":
    case "sa_settings":
      return { title: "Centre de Contrôle SuperAdmin SaaS", category: "Administration Plateforme", subtitle: "Gestion globale du réseau d'écoles SmartSchool RDC" };
    case "cnr_epst":
      return { title: "Centre National des Ressources EPST (CNR-EPST)", category: "Régulation & Souveraineté", subtitle: "Modèles officiels, calendriers et normes du Ministère" };
    case "owner_control_center":
      return { title: "Centre de Contrôle du Propriétaire", category: "Administration Supérieure", subtitle: "Supervision exclusive et gouvernance financière" };
    case "manage_schools":
      return { title: "Gérer les Écoles & Comptes", category: "Espace Propriétaire", subtitle: "Supervision des établissements, fiches, comptes et messagerie officielle" };
    case "national_jobs":
      return { title: "Portail National de Recrutement EPST", category: "Souveraineté Éducative", subtitle: "Offres d'emploi, candidatures et recrutement d'enseignants" };
    case "culture_patrimoine_rdc":
      return { title: "Culture & Patrimoine National RDC", category: "Patrimoine National", subtitle: "Histoire, hymne national, symboles républicains et héros" };
    case "reseau_interscolaire":
      return { title: "Réseau Interscolaire National RDC", category: "Connexion Interscolaire", subtitle: "Coopération, jumelage et partage de ressources pédagogiques" };
    case "galerie_ecole":
      return { title: "Galerie d'Établissement & Médias", category: "Médiathèque", subtitle: "Photos, vidéos d'événements et cérémonies officielles" };
    case "impression_listes":
    case "exports_officiels":
    case "universal_exports":
      return { title: "Centre Universel d'Impression & d'Exportation", category: "Souveraineté Éducative", subtitle: "14 Dossiers Officiels RDC, PDF certifiés avec filigrane, Excel et registres" };
    case "audit_systeme":
    case "audit_tests":
      return { title: "Centre d'Audit & Validation Technique", category: "Gouvernance & Sécurité", subtitle: "Banc d'essai automatisé, sécurité financière MoMo et isolation multi-tenant" };
    case "promo_video":
      return { title: "Studio Vidéo Publicitaire SmartSchool", category: "Communication", subtitle: "Présentation vidéo interactive de la plateforme" };
    case "sauvegarde_etablissement":
      return { title: "Sauvegarde & Corbeille de l'Établissement", category: "Sécurité & Données", subtitle: "Restauration des données et archives de sécurité" };
    case "sa_backup_disaster_recovery":
      return { title: "Plan National de Sauvegarde & Reprise (PRA)", category: "Régulation & Souveraineté", subtitle: "Sauvegardes chiffrées et reprise d'activité d'urgence" };
    default:
      return { title: `Module ${tab}`, category: "Espace SmartSchool", subtitle: "Module de gestion SmartSchool RDC" };
  }
}

// Local translation dictionary for Congolese cultural inclusion
const translations = {
  fr: {
    slogan: "La gestion scolaire intelligente",
    developedBy: "Développé par : Ir IT Fred Kalonda",
    company: "Fred-Technique SARL",
    emailOrPhone: "Adresse e-mail ou numéro de téléphone",
    emailPlaceholder: "nom@ecole.cd ou +243...",
    password: "Mot de passe",
    passwordPlaceholder: "Saisissez votre mot de passe",
    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublié ?",
    signIn: "Se connecter",
    signingIn: "Connexion en cours...",
    version: "Version 1.5.0-PRO",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialité",
    copyright: "© 2026 Fred-Technique SARL. Tous droits réservés.",
    demoSection: "Comptes de test rapide",
    badgeSovereignty: "Souveraineté Éducative RDC",
    helpTitle: "Besoin d'aide ?",
    helpSubtitle: "Comment s'inscrire ou se connecter",
    errorEmpty: "Veuillez remplir tous les champs obligatoires.",
    errorFormat: "Format d'identifiant ou de numéro de téléphone invalide.",
    errorLength: "Le mot de passe doit contenir au moins 6 caractères.",
    successMsg: "Authentification réussie ! Chargement de votre espace personnel...",
    forgotModalTitle: "Récupération de mot de passe",
    forgotModalDesc: "Entrez votre e-mail ou numéro de téléphone associé pour recevoir un lien de réinitialisation instantané.",
    sendReset: "Envoyer le lien de récupération",
    back: "Retour",
    checkSmsEmail: "Un lien de réinitialisation a été envoyé à vos coordonnées.",
    whyTitle: "Pourquoi SmartSchool RDC ?",
    why1: "Hébergement Souverain et Sécurisé",
    why2: "Mode Hors-ligne avec synchronisation",
    why3: "Paiements Écolage par Mobile Money"
  },
  ln: { // Lingala
    slogan: "Boyangeli kelasi ya mayele mpenza",
    developedBy: "Esalemi na: Ir IT Fred Kalonda",
    company: "Fred-Technique SARL",
    emailOrPhone: "Adresse e-mail to nimero ya telefone",
    emailPlaceholder: "kombo@ecole.cd to +243...",
    password: "Liloba ya sekele",
    passwordPlaceholder: "Koma liloba ya sekele na yo",
    rememberMe: "Kanisa ngai",
    forgotPassword: "Obosani liloba ya sekele ?",
    signIn: "Kota na kelasi",
    signingIn: "Kozela moke...",
    version: "Version 1.5.0-PRO",
    terms: "Mibeko ya mosala",
    privacy: "Bobateli makambo ya sekele",
    copyright: "© 2026 Fred-Technique SARL. Nionso ebatelami.",
    demoSection: "Mekola na banzela oyo",
    badgeSovereignty: "Bokoli ya Kelasi na RDC",
    helpTitle: "Olingi lisalisi ?",
    helpSubtitle: "Ndenge nini kotiya nkombo",
    errorEmpty: "Tondisa makambo nionso basengi.",
    errorFormat: "E-mail to nimero ya telefone ezali malamu te.",
    errorLength: "Liloba ya sekele esengeli nkombo koleka 6.",
    successMsg: "Oyaki malamu ! Ozo kota sika...",
    forgotModalTitle: "Kobongola liloba ya sekele",
    forgotModalDesc: "Tiya e-mail to nimero na yo mpo totindela yo nzela ya sika.",
    sendReset: "Tinda nkasa ya kobongola",
    back: "Zonga",
    checkSmsEmail: "Totindeli yo liloba ya sika na telefone to e-mail na yo.",
    whyTitle: "Mpona nini SmartSchool RDC ?",
    why1: "Bobateli ya nivo ya likolo",
    why2: "Kosala ata Internet ezali te",
    why3: "Kofuta kelasi na Mobile Money"
  },
  sw: { // Swahili
    slogan: "Usimamizi wa shule wenye akili",
    developedBy: "Imetengenezwa na: Ir IT Fred Kalonda",
    company: "Fred-Technique SARL",
    emailOrPhone: "Barua pepe au nambari ya simu",
    emailPlaceholder: "jina@ecole.cd au +243...",
    password: "Nenosiri",
    passwordPlaceholder: "Andika nenosiri lako",
    rememberMe: "Nikumbuke",
    forgotPassword: "Umesahau nenosiri ?",
    signIn: "Ingia",
    signingIn: "Kuingia sasa...",
    version: "Toleo la 1.5.0-PRO",
    terms: "Masharti ya matumizi",
    privacy: "Sera ya faragha",
    copyright: "© 2026 Fred-Technique SARL. Haki zote zimehifadhiwa.",
    demoSection: "Akaunti za majaribio ya haraka",
    badgeSovereignty: "Sovereignty ya Elimu RDC",
    helpTitle: "Unahitaji msaada ?",
    helpSubtitle: "Jinsi ya kujiandikisha au kuingia",
    errorEmpty: "Tafadhali jaza sehemu zote zinazohitajika.",
    errorFormat: "Barua pepe au nambari ya simu sio sahihi.",
    errorLength: "Nenosiri lazima liwe na herufi angalau 6.",
    successMsg: "Umeingia kwa mafanikio! Inapakia ukurasa wako...",
    forgotModalTitle: "Rudisha nenosiri lako",
    forgotModalDesc: "Weka barua pepe au nambari yako ya simu ili kupokea kiungo cha kuweka nenosiri jipya.",
    sendReset: "Tuma kiungo cha kurejesha",
    back: "Rudi nyuma",
    checkSmsEmail: "Umetumiwa kiungo cha kurejesha nenosiri lako.",
    whyTitle: "Kwa nini SmartSchool RDC ?",
    why1: "Ulinzi mkubwa wa data zako",
    why2: "Inafanya kazi bila mtandao",
    why3: "Malipo ya shule kupitia simu"
  }
};

type Language = "fr" | "ln" | "sw";

const demoAccounts: { role: string; login: string; desc: string }[] = [];

function UnauthorizedOwnerAccessView({
  userRole,
  userName,
  schoolName,
  tabAttempted,
  onBack
}: {
  userRole: string;
  userName: string;
  schoolName: string;
  tabAttempted: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border-2 border-red-500/30 dark:border-red-600/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-2xl border border-red-300 dark:border-red-800 shadow-inner mx-auto animate-pulse">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 bg-red-100 dark:bg-red-950/90 text-red-700 dark:text-red-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-300 dark:border-red-800">
            Alerte de Sécurité - Accès Refusé (403 Forbidden)
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Accès Non Autorisé
          </h2>
          <p className="text-sm font-bold text-red-600 dark:text-red-400 max-w-lg mx-auto">
            Le module &quot;{tabAttempted}&quot; appartient EXCLUSIVEMENT au Propriétaire de la Plateforme SmartSchool RDC.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-500 uppercase">Journal d&apos;Audit d&apos;Intrusion</span>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">CONSIGNÉ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400 font-normal">Utilisateur :</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">{userName || "Inconnu"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-normal">Rôle Détecté :</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">{userRole || "Inconnu"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-normal">Établissement :</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">{schoolName || "Établissement non spécifié"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-normal">Adresse IP :</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">192.168.1.105 (Sécurisée)</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 font-normal">Horodatage :</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR")}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 italic">
            Cette tentative d&apos;accès non autorisée a été immédiatement enregistrée dans le journal d&apos;audit souverain pour contrôle et suivi réglementaire.
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-extrabold text-sm rounded-xl hover:from-slate-800 hover:to-indigo-900 transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retourner au Tableau de Bord Autorisé</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function UnauthorizedInspectionAccessView({
  userRole,
  userName,
  tabAttempted,
  onBack
}: {
  userRole: string;
  userName: string;
  tabAttempted: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border-2 border-amber-500/40 dark:border-amber-600/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-300 dark:border-amber-800 shadow-inner mx-auto animate-pulse">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-300 dark:border-amber-800">
            Protection des Données Interne - Accès Refusé
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Accès refusé. Les données internes des établissements sont protégées.
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Les portails de l&apos;Inspection et de l&apos;Administration Nationale sont réservés exclusivement à la supervision et aux statistiques agrégées. Les dossiers individuels, notes, bulletins et comptabilités d&apos;écoles restent strictly confidentiels.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-500 uppercase">Journal d&apos;Audit d&apos;Inspection</span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">VERROUILLÉ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400 font-normal">Inspecteur / Agent :</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">{userName || "Inconnu"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-normal">Rôle Détecté :</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">{userRole || "Inspection"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-normal">Module Sollicité :</span>{" "}
              <span className="font-bold text-amber-600 dark:text-amber-400">{tabAttempted}</span>
            </div>
            <div>
              <span className="text-slate-400 font-normal">Niveau Sécurité :</span>{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Verrouillage RDC EPST</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 font-normal">Horodatage :</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR")}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 italic">
            Tentative de consultation directe consignée dans le Journal d&apos;Audit National pour contrôle réglementaire.
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-900 text-white font-extrabold text-sm rounded-xl hover:from-blue-800 hover:to-indigo-950 transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retourner au Registre National des Établissements</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>("fr");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successState, setSuccessState] = useState(false);
  const [showWelcome3DAnimation, setShowWelcome3DAnimation] = useState(false);
  const [userRole, setUserRole] = useState("Préfet des études");
  const [userName, setUserName] = useState("Ir IT Fred Kalonda");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "warning" | "info" } | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [landingChoice, setLandingChoice] = useState<"login" | "create_establishment" | "activate_account">("login");
  
  // Activation wizard states
  const [activationStep, setActivationStep] = useState<number>(1);
  const [activationMatricule, setActivationMatricule] = useState<string>("");
  const [activationCodeInput, setActivationCodeInput] = useState<string>("");
  const [universalVerification, setUniversalVerification] = useState<UniversalVerificationResult | null>(null);
  const [activatedDossier, setActivatedDossier] = useState<any>(null);
  const [activatedDossierType, setActivatedDossierType] = useState<"personnel" | "eleve" | "parent" | "enseignant" | "admin" | "inspecteur" | "generic" | null>(null);
  const [activationUsername, setActivationUsername] = useState<string>("");
  const [activationPassword, setActivationPassword] = useState<string>("");
  const [activationConfirmPassword, setActivationConfirmPassword] = useState<string>("");
  const [activationRecoveryPhone, setActivationRecoveryPhone] = useState<string>("");
  const [activationRecoveryEmail, setActivationRecoveryEmail] = useState<string>("");
  const [activationSecurityQuestions, setActivationSecurityQuestions] = useState<{ question: string; answer: string }[]>([
    { question: "Quel est le nom de votre ville ou localité de naissance ?", answer: "" },
    { question: "Quel est le nom de jeune fille de votre mère ?", answer: "" },
    { question: "Quel est le nom de votre première école primaire ?", answer: "" }
  ]);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [isActivatingAccount, setIsActivatingAccount] = useState<boolean>(false);
  
  // Real Database States initialized with mock data
  const [students, setStudents] = useState<Student[]>(() => {
    return initialStudents.map((std, idx) => {
      const codes = ["ACT-ELV-GASTON", "ACT-ELV-NAOMI", "ACT-ELV-CHRISTIAN"];
      const code = codes[idx] || `ACT-ELV-${std.lastName.toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;
      const matricule = std.registrationNumber || `RDC-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        ...std,
        registrationNumber: matricule,
        activationCode: code,
        accountStatus: "pending_activation",
        hasUserAccount: true,
        qrCodeData: std.qrCodeData || `https://smartschool.cd/verify/${matricule}`,
        photoUrl: std.photoUrl || undefined
      };
    });
  });
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [parents, setParents] = useState<Parent[]>(() => {
    return initialParents.map((prt, idx) => {
      const parentAccNum = `PAR-${prt.lastName.toUpperCase()}-${idx === 0 ? "7938" : 7930 + idx}`;
      const code = idx === 0 ? "PARENT-2648-8641" : `PARENT-2648-${8640 + idx}`;
      return {
        ...prt,
        parentAccountNumber: prt.parentAccountNumber || parentAccNum,
        username: parentAccNum,
        activationCode: prt.activationCode || code,
        accountCreated: true,
        portalAccess: true,
        accountStatus: "pending_activation",
        activationDate: new Date().toLocaleDateString("fr-FR")
      };
    });
  });
  const [classes, setClasses] = useState<ClassRoom[]>(initialClasses);
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances);
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [bulletinSettings, setBulletinSettings] = useState<SchoolBulletinPermissions>(() => {
    try {
      const saved = safeLocalStorage.getItem(`ssrdc_${activeSchoolId}_bulletin_permissions`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      allowTeacherDownload: true,
      allowTeacherPrint: true,
      publishToStudents: false,
      publishToParents: false,
      requireDirectionValidation: true
    };
  });
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(initialTimetable);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  const [pedagogicalEvents, setPedagogicalEvents] = useState<PedagogicalEvent[]>(() => {
    return [
      {
        id: "ev-1",
        title: "Examen de Physique - Premier Trimestre",
        type: "Examen",
        category: "Secondaire",
        date: "2026-07-15",
        time: "08:30",
        room: "Laboratoire de Physique",
        className: "3ème Humanités Scientifique A",
        description: "Examen trimestriel de mécanique, d'optique et de thermodynamique."
      },
      {
        id: "ev-2",
        title: "Interrogation écrite de Vocabulaire",
        type: "Interrogation",
        category: "Primaire",
        date: "2026-07-10",
        time: "09:00",
        room: "Local 102",
        className: "4ème année A",
        description: "Évaluation sur les synonymes, antonymes et les expressions courantes."
      },
      {
        id: "ev-3",
        title: "Atelier de modelage d'argile",
        type: "Journée pédagogique",
        category: "Maternelle",
        date: "2026-07-12",
        time: "10:15",
        room: "Salle de jeux d'éveil",
        className: "Petite Section A",
        description: "Activité d'éveil de motricité fine et créative."
      },
      {
        id: "ev-4",
        title: "Conseil de Classe de Délibération",
        type: "Conseil de classe",
        category: "Secondaire",
        date: "2026-07-18",
        time: "15:00",
        room: "Bureau du Préfet",
        className: "4ème Humanités Commerciale A",
        description: "Examen des performances scolaires et décisions d'orientation."
      }
    ];
  });

  const handleAddPedagogicalEvent = (newEventData: Omit<PedagogicalEvent, "id">) => {
    const newEvent: PedagogicalEvent = {
      ...newEventData,
      id: `ev-${Date.now()}`
    };
    setPedagogicalEvents(prev => [newEvent, ...prev]);
  };

  const handleAddTimetableEntry = (entry: TimetableEntry) => {
    setTimetable(prev => [...prev, entry]);
  };

  const handleDeleteTimetableEntry = (id: string) => {
    setTimetable(prev => prev.filter(t => t.id !== id));
  };

  const [cnrResources, setCnrResources] = useState<CnrResource[]>(initialTemplateModels);

  // HR Module States
  const [employees, setEmployees] = useState<Employee[]>(() => {
    return initialEmployees.map((emp, idx) => {
      const codes = ["ACT-PERS-ASTRID", "ACT-PERS-SYLVAIN", "ACT-PERS-PREFET"];
      const code = codes[idx] || `ACT-PERS-${emp.lastName.toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;
      const ssrdc = emp.idSsrdc || `SSRDC-PE-${10000 + idx * 147 + Math.floor(Math.random() * 99)}`;
      return {
        ...emp,
        activationCode: code,
        idSsrdc: ssrdc,
        qrCodeData: emp.qrCodeData || `https://smartschool.cd/verify/${emp.matricule}`
      };
    });
  });
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const defaultAccounts: UserAccount[] = [
      {
        id: "acc-1",
        dossierId: "emp-1", // Astrid Mutombo
        dossierType: "personnel",
        fullName: "Astrid Mutombo",
        username: "secretaire@smartschool.cd",
        password: "Secretaire2026!",
        role: "Secrétaire",
        isActive: true,
        isActivated: true,
        activationCode: "ACT-PERS-ASTRID",
        schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
        targetPortalTab: "secretariat",
        createdAt: "10/01/2024"
      },
      {
        id: "acc-2",
        dossierId: "emp-2", // Sylvain Kabulo
        dossierType: "personnel",
        fullName: "Sylvain Kabulo",
        username: "comptable@smartschool.cd",
        password: "Comptable2026!",
        role: "Comptable Principal",
        isActive: true,
        isActivated: true,
        activationCode: "ACT-PERS-SYLVAIN",
        schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
        targetPortalTab: "finance",
        createdAt: "15/09/2022"
      },
      {
        id: "acc-3",
        dossierId: "emp-3", // Sylvestre Ilunga
        dossierType: "personnel",
        fullName: "Sylvestre Ilunga",
        username: "prefet.kalonda@smartschool.cd",
        password: "Prefet2026!",
        role: "Préfet des études",
        isActive: true,
        isActivated: true,
        activationCode: "ACT-PERS-PREFET",
        schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
        targetPortalTab: "prefet_pedagogie",
        createdAt: "01/09/2020"
      },
      {
        id: "acc-std-1",
        dossierId: "std-1", // Gaston Tshibanda
        dossierType: "eleve",
        fullName: "Gaston Tshibanda",
        username: "eleve.tshibanda@smartschool.cd",
        password: "Eleve2026!",
        role: "Élève",
        isActive: true,
        isActivated: true,
        activationCode: "ACT-ELV-GASTON",
        schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
        targetPortalTab: "eleves",
        createdAt: "01/01/2026"
      },
      {
        id: "acc-std-3",
        dossierId: "std-3", // Christian Mukendi
        dossierType: "eleve",
        fullName: "Christian Mukendi",
        username: "eleve.mukendi@smartschool.cd",
        password: "Eleve2026!",
        role: "Élève",
        isActive: true,
        isActivated: true,
        activationCode: "ACT-ELV-MUKENDI",
        schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
        targetPortalTab: "eleves",
        createdAt: "01/01/2026"
      },
      {
        id: "acc-std-5",
        dossierId: "std-5", // Jean-Bosco Mutombo
        dossierType: "eleve",
        fullName: "Jean-Bosco Mutombo",
        username: "eleve.mutombo@smartschool.cd",
        password: "Eleve2026!",
        role: "Élève",
        isActive: true,
        isActivated: true,
        activationCode: "ACT-ELV-MUTOMBO",
        schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
        targetPortalTab: "eleves",
        createdAt: "01/01/2026"
      },
      {
        id: "acc-5",
        dossierId: "prt-1", // Joseph Tshibanda
        dossierType: "parent",
        fullName: "Joseph Tshibanda",
        username: "PAR-TSHIBANDA-7938",
        role: "Parent",
        activationCode: "PARENT-2648-8641",
        phone: "+243 821 234 567",
        email: "j.tshibanda@gmail.com",
        isActive: true,
        isActivated: false,
        schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
        targetPortalTab: "parents",
        createdAt: "01/06/2026"
      }
    ];

    const stored = getStoredUniversalUserAccounts();
    const map = new Map<string, UserAccount>();
    defaultAccounts.forEach(a => map.set(a.id, a));
    stored.forEach(a => map.set(a.id || a.username, a));
    return Array.from(map.values());
  });
  const [hrAttendances, setHrAttendances] = useState<EmployeeAttendance[]>(initialHrAttendances);
  const [hrLeaves, setHrLeaves] = useState<EmployeeLeave[]>(initialHrLeaves);
  const [hrPromotions, setHrPromotions] = useState<EmployeePromotion[]>(initialHrPromotions);
  const [hrSanctions, setHrSanctions] = useState<EmployeeSanction[]>(initialHrSanctions);
  const [hrEvaluations, setHrEvaluations] = useState<EmployeeEvaluation[]>(initialHrEvaluations);
  const [hrTrainings, setHrTrainings] = useState<EmployeeTraining[]>(initialHrTrainings);
  const [hrMutations, setHrMutations] = useState<EmployeeMutation[]>(initialHrMutations);
  const [hrAuditLogs, setHrAuditLogs] = useState<HrAuditLog[]>(initialHrAuditLogs);

  // Inscription, audit, settings & announcements management states
  const [isFirstLoginWizardActive, setIsFirstLoginWizardActive] = useState<boolean>(false);
  const [wizardUserData, setWizardUserData] = useState<FirstTimeLoginWizardUser | null>(null);
  const [selectedOfficialSheetAccount, setSelectedOfficialSheetAccount] = useState<UserAccount | null>(null);
  const [announceNewStudents, setAnnounceNewStudents] = useState<boolean>(true);
  const [privacySetting, setPrivacySetting] = useState<"name_only" | "name_and_photo" | "no_publish">("name_and_photo");

  // Personnalisation des documents officiels (Filigrane, Drapeau RDC, Logo École, Logo Plateforme, Cachet, Signatures)
  const [platformLogoUrl, setPlatformLogoUrl] = useState<string>(() => {
    return safeLocalStorage.getItem("smartschool_platform_logo_url") || "/branding/smartschool-rdc-logo.png";
  });
  const [watermarkUrl, setWatermarkUrl] = useState<string>(() => {
    return safeLocalStorage.getItem("rdc_watermark_url") || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png";
  });
  const [drapeauUrl, setDrapeauUrl] = useState<string>(() => {
    return safeLocalStorage.getItem("rdc_drapeau_url") || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/512px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png";
  });
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string>(() => {
    return safeLocalStorage.getItem("rdc_school_logo_url") || "https://images.unsplash.com/photo-1590086782957-93c06ef21604?auto=format&fit=crop&q=80&w=150";
  });
  const [schoolStampUrl, setSchoolStampUrl] = useState<string>(() => {
    return safeLocalStorage.getItem("rdc_school_stamp_url") || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/240px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png";
  });
  const [schoolSignatureUrl, setSchoolSignatureUrl] = useState<string>(() => {
    return safeLocalStorage.getItem("rdc_school_signature_url") || "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Jon_Foreman_Signature.svg/180px-Jon_Foreman_Signature.svg.png";
  });
  const [isSignatureEnabled, setIsSignatureEnabled] = useState<boolean>(() => {
    const saved = safeLocalStorage.getItem("rdc_is_signature_enabled");
    return saved === null ? true : saved === "true";
  });
  const [schoolMotto, setSchoolMotto] = useState<string>(() => {
    return safeLocalStorage.getItem("rdc_school_motto") || "Travail - Justice - Paix";
  });
  const [initialTargetChatUserId, setInitialTargetChatUserId] = useState<string | null>(null);
  const [showPresentationModal, setShowPresentationModal] = useState<boolean>(false);

  // Cross-component and universal accounts synchronization
  useEffect(() => {
    const handleAccountSynced = (e: any) => {
      if (e.detail) {
        const syncedAccount = e.detail as UserAccount;
        setUserAccounts(prev => {
          const index = prev.findIndex(
            a => a.id === syncedAccount.id || (a.username && a.username.toLowerCase() === syncedAccount.username?.toLowerCase())
          );
          if (index >= 0) {
            return prev.map((a, i) => i === index ? { ...a, ...syncedAccount } : a);
          }
          return [syncedAccount, ...prev.filter(a => a.id !== syncedAccount.id)];
        });
      }
    };
    window.addEventListener("smartschool_account_synced", handleAccountSynced);
    return () => window.removeEventListener("smartschool_account_synced", handleAccountSynced);
  }, []);

  // Synchronisation dynamique du Logo Officiel SmartSchool RDC, Drapeau RDC et Armoirie depuis la persistance centralisée
  useEffect(() => {
    fetchPlatformBranding().then((b) => {
      if (b.logoUrl) {
        setPlatformLogoUrl(b.logoUrl);
        safeLocalStorage.setItem("smartschool_platform_logo_url", b.logoUrl);
      }
      if (b.flagUrl) {
        setDrapeauUrl(b.flagUrl);
        safeLocalStorage.setItem("rdc_drapeau_url", b.flagUrl);
      }
      if (b.coatOfArmsUrl) {
        setWatermarkUrl(b.coatOfArmsUrl);
        safeLocalStorage.setItem("rdc_watermark_url", b.coatOfArmsUrl);
      }
    }).catch(console.error);

    const handleBrandingUpdated = (e: any) => {
      if (e.detail) {
        if (e.detail.logoUrl) {
          setPlatformLogoUrl(e.detail.logoUrl);
          safeLocalStorage.setItem("smartschool_platform_logo_url", e.detail.logoUrl);
        }
        if (e.detail.flagUrl) {
          setDrapeauUrl(e.detail.flagUrl);
          safeLocalStorage.setItem("rdc_drapeau_url", e.detail.flagUrl);
        }
        if (e.detail.coatOfArmsUrl) {
          setWatermarkUrl(e.detail.coatOfArmsUrl);
          safeLocalStorage.setItem("rdc_watermark_url", e.detail.coatOfArmsUrl);
        }
      }
    };

    window.addEventListener("smartschool_branding_updated", handleBrandingUpdated);
    return () => window.removeEventListener("smartschool_branding_updated", handleBrandingUpdated);
  }, []);

  // URL Parameter detector for direct portal activation links (#activation?matricule=...&code=...)
  useEffect(() => {
    try {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      let params = new URLSearchParams(search);
      if (hash.includes("activation") || hash.includes("activate")) {
        const qIndex = hash.indexOf("?");
        if (qIndex >= 0) {
          params = new URLSearchParams(hash.substring(qIndex + 1));
        }
      }

      const matParam = params.get("matricule") || params.get("username") || params.get("id");
      const codeParam = params.get("code") || params.get("activationCode") || params.get("activation");
      const loginParam = params.get("login") || params.get("user") || params.get("email") || params.get("staff_id");
      const schoolIdParam = params.get("schoolId");

      if (loginParam) {
        setEmailOrPhone(loginParam);
        setLandingChoice("login");
      }
      if (schoolIdParam) {
        setActiveSchoolId(schoolIdParam);
        const matchedSchool = schools.find(s => s.id === schoolIdParam);
        if (matchedSchool) {
          setSchoolName(matchedSchool.name);
        }
      }

      if (matParam || codeParam || hash.includes("activation") || search.includes("activate")) {
        setLandingChoice("activate_account");
        if (matParam) setActivationMatricule(matParam);
        if (codeParam) setActivationCodeInput(codeParam);

        if (matParam && codeParam) {
          const checkRes = verifyUniversalIdentity({
            matriculeOrId: matParam,
            activationCode: codeParam,
            schoolId: activeSchoolId,
            userAccounts,
            students,
            employees,
            parents,
            teachers
          });

          if (checkRes.found) {
            setUniversalVerification(checkRes);
            setActivatedDossier(checkRes.dossier);
            setActivatedDossierType(checkRes.dossierType as any);
            setActivationStep(2);
            setActivationError(null);
          }
        }
      }
    } catch (err) {
      console.warn("Auto activation URL parser warning:", err);
    }
  }, []);

  const handleUpdateWatermarkUrl = (url: string) => {
    setWatermarkUrl(url);
    safeLocalStorage.setItem("rdc_watermark_url", url);
  };
  const handleUpdateDrapeauUrl = (url: string) => {
    setDrapeauUrl(url);
    safeLocalStorage.setItem("rdc_drapeau_url", url);
  };
  const handleUpdateSchoolLogoUrl = (url: string) => {
    setSchoolLogoUrl(url);
    safeLocalStorage.setItem("rdc_school_logo_url", url);
  };
  const handleUpdateSchoolStampUrl = (url: string) => {
    setSchoolStampUrl(url);
    safeLocalStorage.setItem("rdc_school_stamp_url", url);
  };
  const handleUpdateSchoolSignatureUrl = (url: string) => {
    setSchoolSignatureUrl(url);
    safeLocalStorage.setItem("rdc_school_signature_url", url);
  };
  const handleUpdateIsSignatureEnabled = (val: boolean) => {
    setIsSignatureEnabled(val);
    safeLocalStorage.setItem("rdc_is_signature_enabled", val ? "true" : "false");
  };
  const handleUpdateSchoolMotto = (val: string) => {
    setSchoolMotto(val);
    safeLocalStorage.setItem("rdc_school_motto", val);
  };

  const [inscriptionAuditLogs, setInscriptionAuditLogs] = useState<InscriptionAuditLog[]>([
    {
      id: "log-init-1",
      studentName: "Gaston Tshibanda",
      actorName: "M. Sylvain Kabulo",
      actorRole: "Comptable",
      date: "25/06/2026",
      time: "10h15",
      ipAddress: "197.242.144.53",
      device: "Chrome sur Windows 11",
      action: "Validation d'inscription"
    },
    {
      id: "log-init-2",
      studentName: "Naomi Mwamba",
      actorName: "Mlle Astrid Mutombo",
      actorRole: "Secrétaire",
      date: "24/06/2026",
      time: "14h30",
      ipAddress: "197.242.145.109",
      device: "Firefox sur Android Mobile",
      action: "Création (Brouillon)"
    }
  ]);

  const [classAnnouncements, setClassAnnouncements] = useState<ClassAnnouncement[]>([
    {
      id: "ann-init-1",
      className: "3ème A",
      studentId: "std-1",
      title: "🎉 Bienvenue dans notre classe !",
      content: "Nous souhaitons la bienvenue à Gaston Tshibanda en classe de 3ème A. Nous lui souhaitons beaucoup de réussite durant son parcours scolaire.",
      studentName: "Gaston Tshibanda",
      createdAt: "25/06/2026",
      time: "10h15"
    }
  ]);

  const [schoolSyncLogs, setSchoolSyncLogs] = useState<CnrSyncLog[]>([
    {
      id: "log-1",
      resourceId: "cnr-1",
      resourceTitle: "Bulletin National Unifié Primaire (6ème Année)",
      installedVersion: "v2.0.0",
      latestVersion: "v2.1.0",
      syncedAt: "10/05/2026",
      status: "outdated"
    },
    {
      id: "log-2",
      resourceId: "cnr-2",
      resourceTitle: "Calendrier Académique National Officiel 2025-2026",
      installedVersion: "v1.0.3",
      latestVersion: "v1.0.3",
      syncedAt: "24/05/2026",
      status: "installed"
    },
    {
      id: "log-3",
      resourceId: "cnr-3",
      resourceTitle: "Attestation de Fréquentation Scolaire Standardisée",
      installedVersion: "v1.1.0",
      latestVersion: "v1.1.0",
      syncedAt: "28/05/2026",
      status: "installed"
    },
    {
      id: "log-4",
      resourceId: "cnr-4",
      resourceTitle: "Certificat d'Aptitude Professionnelle (Arts & Métiers)",
      installedVersion: "not_installed",
      latestVersion: "v1.0.1",
      syncedAt: "Jamais",
      status: "not_installed"
    }
  ]);

  const handleAddCnrResource = (newRes: CnrResource) => {
    setCnrResources(prev => [newRes, ...prev]);
    const newLog: CnrSyncLog = {
      id: `log-${Date.now()}`,
      resourceId: newRes.id,
      resourceTitle: newRes.title,
      installedVersion: "not_installed",
      latestVersion: newRes.version,
      syncedAt: "Jamais",
      status: "not_installed"
    };
    setSchoolSyncLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateCnrResource = (updatedRes: CnrResource) => {
    setCnrResources(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
    setSchoolSyncLogs(prev => prev.map(log => {
      if (log.resourceId === updatedRes.id) {
        const isUpToDate = log.installedVersion === updatedRes.version;
        return {
          ...log,
          resourceTitle: updatedRes.title,
          latestVersion: updatedRes.version,
          status: isUpToDate ? "installed" as const : (log.installedVersion === "not_installed" ? "not_installed" as const : "outdated" as const)
        };
      }
      return log;
    }));
  };

  const handleSyncCnrResource = (resourceId: string) => {
    setSchoolSyncLogs(prev => prev.map(log => {
      if (log.resourceId === resourceId) {
        return {
          ...log,
          installedVersion: log.latestVersion,
          syncedAt: new Date().toLocaleDateString("fr-FR"),
          status: "installed" as const
        };
      }
      return log;
    }));
  };

  const handleSyncAllCnrResources = () => {
    setSchoolSyncLogs(prev => prev.map(log => ({
      ...log,
      installedVersion: log.latestVersion,
      syncedAt: new Date().toLocaleDateString("fr-FR"),
      status: "installed" as const
    })));
  };
  
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [activeSchoolId, setActiveSchoolId] = useState<string>("");
  const [schoolName, setSchoolName] = useState<string>("");
  const [schoolYear, setSchoolYear] = useState<string>("2026-2027");

  const activeSchool = schools.find(s => s.id === activeSchoolId) || schools[0];

  // Load persistent schools on mount
  useEffect(() => {
    loadPersistentCollection<SchoolType>("global", "schools", []).then(loadedSchools => {
      if (loadedSchools && loadedSchools.length > 0) {
        setSchools(loadedSchools);
        if (!activeSchoolId) {
          setActiveSchoolId(loadedSchools[0].id);
          setSchoolName(loadedSchools[0].name);
          if (loadedSchools[0].schoolYear) {
            setSchoolYear(loadedSchools[0].schoolYear);
          }
        }
      }
    }).catch(console.error);
  }, []);

  // Save schools whenever modified
  useEffect(() => {
    if (schools.length > 0) {
      savePersistentCollection("global", "schools", schools).catch(console.error);
    }
  }, [schools]);

  // Load persistent school data when activeSchoolId changes
  useEffect(() => {
    if (!activeSchoolId) return;

    loadPersistentCollection<Student>(activeSchoolId, "students", []).then(data => {
      if (Array.isArray(data)) setStudents(data);
    }).catch(console.error);

    loadPersistentCollection<Teacher>(activeSchoolId, "teachers", []).then(data => {
      if (Array.isArray(data)) setTeachers(data);
    }).catch(console.error);

    loadPersistentCollection<Parent>(activeSchoolId, "parents", []).then(data => {
      if (Array.isArray(data)) setParents(data);
    }).catch(console.error);

    loadPersistentCollection<ClassRoom>(activeSchoolId, "classes", []).then(data => {
      if (Array.isArray(data)) setClasses(data);
    }).catch(console.error);

    loadPersistentCollection<Option>(activeSchoolId, "options", []).then(data => {
      if (Array.isArray(data)) setOptions(data);
    }).catch(console.error);

    loadPersistentCollection<Subject>(activeSchoolId, "subjects", []).then(data => {
      if (Array.isArray(data)) setSubjects(data);
    }).catch(console.error);

    loadPersistentCollection<Attendance>(activeSchoolId, "attendances", []).then(data => {
      if (Array.isArray(data)) setAttendances(data);
    }).catch(console.error);

    loadPersistentCollection<Grade>(activeSchoolId, "grades", []).then(data => {
      if (Array.isArray(data)) setGrades(data);
    }).catch(console.error);

    loadPersistentCollection<Payment>(activeSchoolId, "payments", []).then(data => {
      if (Array.isArray(data)) setPayments(data);
    }).catch(console.error);

    loadPersistentCollection<Employee>(activeSchoolId, "employees", []).then(data => {
      if (Array.isArray(data)) setEmployees(data);
    }).catch(console.error);
  }, [activeSchoolId]);

  // Auto-sync school data to persistent database on changes
  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "students", students).catch(() => {});
    }
  }, [students, activeSchoolId]);

  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "teachers", teachers).catch(() => {});
    }
  }, [teachers, activeSchoolId]);

  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "parents", parents).catch(() => {});
    }
  }, [parents, activeSchoolId]);

  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "classes", classes).catch(() => {});
    }
  }, [classes, activeSchoolId]);

  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "options", options).catch(() => {});
    }
  }, [options, activeSchoolId]);

  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "subjects", subjects).catch(() => {});
    }
  }, [subjects, activeSchoolId]);

  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "attendances", attendances).catch(() => {});
    }
  }, [attendances, activeSchoolId]);

  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "grades", grades).catch(() => {});
    }
  }, [grades, activeSchoolId]);

  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "payments", payments).catch(() => {});
    }
  }, [payments, activeSchoolId]);

  useEffect(() => {
    if (activeSchoolId) {
      savePersistentCollection(activeSchoolId, "employees", employees).catch(() => {});
    }
  }, [employees, activeSchoolId]);

  const handleSelectSchool = (schoolId: string) => {
    setActiveSchoolId(schoolId);
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      setSchoolName(school.name);
      if (school.schoolYear) {
        setSchoolYear(school.schoolYear);
      }
    }
    setActiveTab("dashboard");
  };

  const handleAddSchool = (newSchool: SchoolType) => {
    setSchools(prev => [...prev, newSchool]);
    setActiveSchoolId(newSchool.id);
    setSchoolName(newSchool.name);
    if (newSchool.schoolYear) {
      setSchoolYear(newSchool.schoolYear);
    }
    setActiveTab("dashboard");
  };

  const handleDeleteSchool = (schoolId: string) => {
    if (!schoolId) return;
    setSchools(prev => prev.filter(s => s.id !== schoolId));
    if (activeSchoolId === schoolId) {
      const remaining = schools.filter(s => s.id !== schoolId);
      setActiveSchoolId(remaining[0]?.id || "");
      setSchoolName(remaining[0]?.name || "");
      setSchoolYear(remaining[0]?.schoolYear || "2026-2027");
    }
  };

  const handleUpdateSchool = (updatedSchool: SchoolType) => {
    setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
    if (activeSchoolId === updatedSchool.id) {
      setSchoolName(updatedSchool.name);
    }
  };

  const handleFirstUseOnboardingComplete = (newSchool: SchoolType, admin: { fullName: string; fonction: string; email: string; phone: string; password?: string }) => {
    setSchools(prev => {
      const exists = prev.some(s => s.id === newSchool.id);
      return exists ? prev.map(s => s.id === newSchool.id ? newSchool : s) : [...prev, newSchool];
    });
    setActiveSchoolId(newSchool.id);
    setSchoolName(newSchool.name);
    if (newSchool.schoolYear) {
      setSchoolYear(newSchool.schoolYear);
    }
    setUserName(admin.fullName);
    const assignedRole = admin.fonction || "Directeur Général";
    setUserRole(assignedRole);
    setEmailOrPhone(admin.email);

    // Create and link employee & user account
    const newEmpId = `emp-${Date.now().toString().slice(-5)}`;
    const newAccountId = `acc-${newSchool.id}-admin`;
    const newEmp: Employee = {
      id: newEmpId,
      matricule: `MAT-${newSchool.id.slice(-3).toUpperCase()}-001`,
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      firstName: admin.fullName.split(" ")[0] || admin.fullName,
      lastName: admin.fullName.split(" ").slice(1).join(" ") || "Direction",
      gender: "M",
      birthDate: "1985-01-01",
      phone: admin.phone,
      email: admin.email,
      function: assignedRole,
      department: "Direction & Administration",
      hireDate: new Date().toISOString().slice(0, 10),
      status: "Actif",
      hasUserAccount: true,
      userAccountId: newAccountId,
      userAccountRole: assignedRole,
      schoolId: newSchool.id,
      salaryBase: 500,
      contractType: "CDI",
      nationality: "Congolaise",
      address: [newSchool.adresseComplete, newSchool.ville].filter(Boolean).join(", "),
      birthPlace: newSchool.ville || "",
      civilStatus: "Marié(e)",
      service: "Direction Générale",
      diplomas: ["Diplôme d'État / Licence"],
      experience: ["Expérience de gestion"],
      documents: [],
      emergencyContact: { name: admin.fullName, relationship: "Titulaire", phone: admin.phone },
      qrCodeData: `STAFF-${newEmpId}`
    };
    setEmployees(prev => [newEmp, ...prev]);

    const createdAccount: UserAccount = {
      id: newAccountId,
      dossierId: newEmpId,
      dossierType: "personnel",
      schoolId: newSchool.id,
      schoolName: newSchool.name,
      fullName: admin.fullName,
      email: admin.email,
      username: admin.email,
      phone: admin.phone,
      password: admin.password || "Admin2026!",
      tempPassword: admin.password || "Admin2026!",
      activationCode: `ACT-${assignedRole.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      role: assignedRole,
      functionTitle: `${assignedRole} & Responsable Principal`,
      isActive: true,
      isActivated: true,
      mustChangePasswordOnFirstLogin: false,
      targetPortalTab: "dashboard",
      portalUrl: `${getSafeOrigin()}/login`,
      createdAt: new Date().toISOString(),
      createdBy: "Enrôlement SmartSchool RDC",
      creatorRole: "Système Central"
    };

    setUserAccounts(prev => [createdAccount, ...prev.filter(a => a.id !== createdAccount.id)]);
    persistUniversalUserAccount(createdAccount);

    centralAuthService.startSession({
      userId: newEmpId,
      userName: admin.fullName,
      userRole: assignedRole,
      userEmail: admin.email,
      schoolId: newSchool.id,
      schoolName: newSchool.name,
      portalTargetTab: "dashboard",
      portalPath: "/portail/direction",
      portalName: `Portail ${assignedRole}`,
      isPlatformOwner: false,
      isInternalStaff: false,
      userAccount: createdAccount,
      loginTimestamp: new Date().toISOString()
    });

    setCurrentUserId(newEmpId);
    setCurrentUserAccount(createdAccount);
    setSuccessState(true);
    setShowWelcome3DAnimation(true);
    setActiveTab("admin_ecole");
    setToast({
      message: `Bienvenue sur SmartSchool RDC ! Établissement "${newSchool.name}" enrôlé avec succès.`,
      type: "success"
    });
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Principal": true,
    "Pédagogie & Élèves": true,
    "Configuration d'Étude": false,
    "Vie Scolaire & Suivi": false,
    "Analyse & Alertes": false,
    "Régulation & Souveraineté": true
  });

  // Handlers for modifying records reactively
  // Helper to parse browser / userAgent
  const getDeviceString = () => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return "Mobile Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS (iPhone/iPad)";
    if (/windows/i.test(ua)) return "Windows PC (Chrome)";
    if (/macintosh/i.test(ua)) return "macOS (Apple Safari)";
    if (/linux/i.test(ua)) return "Linux System";
    return "Navigateur Web standard";
  };

  const handleAddStudent = (studentData: Omit<Student, "id" | "registrationNumber">) => {
    if (!canRoleManageStudents(userRole)) {
      setToast({
        message: "Action non autorisée : votre rôle n'a pas les droits de gestion des élèves.",
        type: "warning"
      });
      return;
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString("fr-FR");
    const formattedTime = today.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
    
    // Generate simulated IP and device
    const simulatedIp = `197.242.${Math.floor(100 + Math.random() * 155)}.${Math.floor(10 + Math.random() * 230)}`;
    const currentDevice = getDeviceString();

    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
      registrationNumber: `RDC-${Math.floor(100000 + Math.random() * 900000)}`,
      createdBy: userName,
      createdByRole: userRole,
      createdAtDate: formattedDate,
      createdAtTime: formattedTime,
      schoolId: activeSchoolId
    };

    setStudents(prev => [newStudent, ...prev]);

    // Create Audit Log
    const isDraft = ["Brouillon", "En attente", "À compléter"].includes(newStudent.status);
    const logAction = isDraft ? `Préparation Dossier (${newStudent.status})` : "Inscription d'office (Validée)";
    
    const newLog: InscriptionAuditLog = {
      id: `audit-${Date.now()}`,
      studentName: `${newStudent.lastName} ${newStudent.firstName}`,
      actorName: userName,
      actorRole: userRole,
      date: formattedDate,
      time: formattedTime,
      ipAddress: simulatedIp,
      device: currentDevice,
      action: logAction
    };
    setInscriptionAuditLogs(prev => [newLog, ...prev]);

    setToast({
      message: `Élève ${newStudent.firstName} ${newStudent.lastName} enregistré avec succès !`,
      type: "success"
    });

    // Trigger Internal Notification for relevant roles
    const targetRoles = [
      "Promoteur",
      "Super Administrateur de l'établissement",
      "Directeur Général",
      "Directrice de la Maternelle",
      "Directeur du Primaire",
      "Directeur du Secondaire",
      "Préfet des études",
      "Préfet"
    ];
    // Include Comptable if current user is not a Comptable
    if (!userRole.toLowerCase().includes("comptable")) {
      targetRoles.push("Comptable", "Comptable Principal");
    }

    const notifTitle = isDraft ? "📂 Dossier d'inscription préparé" : "🎉 Nouvelle inscription enregistrée";
    const notifMessage = `Élève :\n${newStudent.firstName} ${newStudent.lastName}\n\nClasse :\n${newStudent.className}\n\nRéalisée par :\n${userName}\n\nFonction :\n${userRole}\n\nDate :\n${formattedDate}\n\nHeure :\n${formattedTime}`;

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: notifTitle,
      message: notifMessage,
      time: "À l'instant",
      type: isDraft ? "info" : "success",
      isRead: false,
    };
    
    (newNotif as any).targetRoles = targetRoles;

    setNotifications(prev => [newNotif, ...prev]);

    // Publish class announcement if enabled and status is "Validé"
    if (newStudent.status === "Validé" && announceNewStudents && privacySetting !== "no_publish") {
      const showPhoto = privacySetting === "name_and_photo";
      const photoPlaceholderUrl = newStudent.gender === "F" 
        ? "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200" // young female student avatar
        : "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=200"; // young male student avatar

      const newAnn: ClassAnnouncement = {
        id: `ann-${Date.now()}`,
        className: newStudent.className,
        studentId: newStudent.id,
        title: "🎉 Bienvenue dans notre classe !",
        content: `Nous souhaitons la bienvenue à ${newStudent.lastName} ${newStudent.firstName} en classe de ${newStudent.className}. Nous lui souhaitons beaucoup de réussite durant son parcours scolaire.`,
        studentName: `${newStudent.lastName} ${newStudent.firstName}`,
        photoUrl: showPhoto ? photoPlaceholderUrl : undefined,
        createdAt: formattedDate,
        time: formattedTime
      };

      setClassAnnouncements(prev => [newAnn, ...prev]);
    }
  };

  const handleValidateStudent = (studentId: string) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("fr-FR");
    const formattedTime = today.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
    
    const simulatedIp = `197.242.${Math.floor(100 + Math.random() * 155)}.${Math.floor(10 + Math.random() * 230)}`;
    const currentDevice = getDeviceString();

    setStudents(prev => {
      return prev.map(s => {
        if (s.id === studentId) {
          const updated = { ...s, status: "Validé" as const };
          
          // Add Audit Log for validation
          const newLog: InscriptionAuditLog = {
            id: `audit-${Date.now()}`,
            studentName: `${updated.lastName} ${updated.firstName}`,
            actorName: userName,
            actorRole: userRole,
            date: formattedDate,
            time: formattedTime,
            ipAddress: simulatedIp,
            device: currentDevice,
            action: "Validation d'inscription"
          };
          setInscriptionAuditLogs(logs => [newLog, ...logs]);

          // Trigger Internal Notification
          const targetRoles = [
            "Promoteur",
            "Super Administrateur de l'établissement",
            "Directeur Général",
            "Directrice de la Maternelle",
            "Directeur du Primaire",
            "Directeur du Secondaire",
            "Préfet des études",
            "Préfet"
          ];
          if (!userRole.toLowerCase().includes("comptable")) {
            targetRoles.push("Comptable", "Comptable Principal");
          }

          const notifMessage = `Élève :\n${updated.firstName} ${updated.lastName}\n\nClasse :\n${updated.className}\n\nValidée par :\n${userName}\n\nFonction :\n${userRole}\n\nDate :\n${formattedDate}\n\nHeure :\n${formattedTime}`;

          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: "✅ Inscription validée définitivement",
            message: notifMessage,
            time: "À l'instant",
            type: "success",
            isRead: false,
          };
          (newNotif as any).targetRoles = targetRoles;
          setNotifications(notifications => [newNotif, ...notifications]);

          // Publish welcome announcement
          if (announceNewStudents && privacySetting !== "no_publish") {
            const showPhoto = privacySetting === "name_and_photo";
            const photoPlaceholderUrl = updated.gender === "F" 
              ? "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200"
              : "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=200";

            const newAnn: ClassAnnouncement = {
              id: `ann-${Date.now()}`,
              className: updated.className,
              studentId: updated.id,
              title: "🎉 Bienvenue dans notre classe !",
              content: `Nous souhaitons la bienvenue à ${updated.lastName} ${updated.firstName} en classe de ${updated.className}. Nous lui souhaitons beaucoup de réussite durant son parcours scolaire.`,
              studentName: `${updated.lastName} ${updated.firstName}`,
              photoUrl: showPhoto ? photoPlaceholderUrl : undefined,
              createdAt: formattedDate,
              time: formattedTime
            };
            setClassAnnouncements(anns => [newAnn, ...anns]);
          }

          return updated;
        }
        return s;
      });
    });
  };

  const handleEditStudent = (updatedStudent: Student) => {
    if (!canRoleManageStudents(userRole)) {
      setToast({
        message: "Action non autorisée : votre rôle n'a pas les droits de modification des élèves.",
        type: "warning"
      });
      return;
    }
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setToast({
      message: `Fiche élève ${updatedStudent.firstName} ${updatedStudent.lastName} mise à jour avec succès.`,
      type: "success"
    });
  };

  const handleDeleteStudent = (id: string) => {
    if (!canRoleManageStudents(userRole)) {
      setToast({
        message: "Action non autorisée : votre rôle n'a pas les droits de suppression des élèves.",
        type: "warning"
      });
      return;
    }
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    setToast({
      message: student ? `Élève ${student.firstName} ${student.lastName} supprimé avec succès.` : "Élève supprimé.",
      type: "success"
    });
  };
  const handleAddTeacher = (teacherData: Omit<Teacher, "id">) => {
    const newTeacher: Teacher = {
      ...teacherData,
      schoolId: activeSchoolId,
      id: `tch-${Date.now()}`
    };
    setTeachers(prev => [newTeacher, ...prev]);
  };
  const handleDeleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };
  const handleAddParent = (parentData: Omit<Parent, "id">): Parent => {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const parentAccNum = parentData.parentAccountNumber || `PAR-${year}-${randomDigits}`;
    const newParent: Parent = {
      ...parentData,
      schoolId: activeSchoolId,
      id: `prt-${Date.now()}`,
      parentAccountNumber: parentAccNum
    };
    setParents(prev => [newParent, ...prev]);
    return newParent;
  };

  const handleLinkParentToStudent = (parentId: string, studentId: string, relationshipType: string, isPrimary: boolean = true) => {
    const targetParent = parents.find(p => p.id === parentId);
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetParent || !targetStudent) return;

    // Update Student
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const existingGuardians = s.guardians || [];
      let updatedGuardians = [...existingGuardians];
      if (isPrimary) {
        updatedGuardians = updatedGuardians.map(g => ({ ...g, isPrimary: false }));
      }
      const idx = updatedGuardians.findIndex(g => g.parentId === parentId);
      const newGLink: StudentGuardianLink = {
        parentId: targetParent.id,
        parentAccountNumber: targetParent.parentAccountNumber || `PAR-2026-${targetParent.id}`,
        parentName: `${targetParent.firstName} ${targetParent.lastName}`,
        parentPhone: targetParent.phone,
        parentEmail: targetParent.email,
        relationshipType,
        isPrimary
      };
      if (idx >= 0) {
        updatedGuardians[idx] = newGLink;
      } else {
        updatedGuardians.push(newGLink);
      }
      const primaryG = updatedGuardians.find(g => g.isPrimary) || updatedGuardians[0];
      return {
        ...s,
        guardians: updatedGuardians,
        parentIds: Array.from(new Set([...(s.parentIds || []), parentId])),
        primaryParentId: primaryG?.parentId,
        parentName: primaryG ? primaryG.parentName : s.parentName,
        parentPhone: primaryG ? primaryG.parentPhone : s.parentPhone,
        parentAccountNumber: primaryG ? primaryG.parentAccountNumber : s.parentAccountNumber
      };
    }));

    // Update Parent
    setParents(prev => prev.map(p => {
      if (p.id !== parentId) return p;
      const existingLinks = p.guardianLinks || [];
      let updatedLinks = [...existingLinks];
      const idx = updatedLinks.findIndex(l => l.studentId === studentId);
      const newPLink: ParentGuardianLink = {
        studentId: targetStudent.id,
        studentName: `${targetStudent.firstName} ${targetStudent.postName ? targetStudent.postName + ' ' : ''}${targetStudent.lastName}`,
        className: targetStudent.className,
        optionName: targetStudent.optionName,
        registrationNumber: targetStudent.registrationNumber,
        relationshipType,
        isPrimary
      };
      if (idx >= 0) {
        updatedLinks[idx] = newPLink;
      } else {
        updatedLinks.push(newPLink);
      }
      const newChildNames = Array.from(new Set([...p.childrenNames, newPLink.studentName]));
      const newChildIds = Array.from(new Set([...(p.childrenIds || []), studentId]));
      return {
        ...p,
        guardianLinks: updatedLinks,
        childrenNames: newChildNames,
        childrenIds: newChildIds
      };
    }));

    // Log Audit Entry
    const today = new Date();
    setInscriptionAuditLogs(prev => [
      {
        id: `aud-${Date.now()}`,
        studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
        actorName: userName,
        actorRole: userRole,
        date: today.toLocaleDateString("fr-FR"),
        time: today.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        ipAddress: "192.168.1.10",
        device: "SmartSchool Admin Workstation",
        action: `Rattachement Tuteur (${relationshipType}) : ${targetParent.lastName} ${targetParent.firstName} [${targetParent.parentAccountNumber}] <-> ${targetStudent.firstName} ${targetStudent.lastName}`
      },
      ...prev
    ]);
  };
  const handleAddClass = (classData: Omit<ClassRoom, "id"> | Omit<ClassRoom, "id">[]) => {
    if (Array.isArray(classData)) {
      const newClasses = classData.map((c, idx) => {
        const canonicalName = c.name || `${c.classGrade || c.level} ${c.roomLetter}`.trim();
        return {
          ...c,
          name: canonicalName,
          schoolId: activeSchoolId,
          id: `cls-${Date.now()}-${idx}-${Math.random().toString(36).substring(2,5)}`
        };
      });
      setClasses(prev => {
        const filteredNew = newClasses.filter(newC => 
          !prev.some(oldC => 
            String(oldC.levelCategory).toLowerCase() === String(newC.levelCategory).toLowerCase() &&
            String(oldC.classGrade).toLowerCase() === String(newC.classGrade).toLowerCase() &&
            String(oldC.roomLetter).toLowerCase() === String(newC.roomLetter).toLowerCase() &&
            String(oldC.optionName).toLowerCase() === String(newC.optionName).toLowerCase()
          )
        );
        return [...prev, ...filteredNew];
      });
    } else {
      const canonicalName = classData.name || `${classData.classGrade || classData.level} ${classData.roomLetter}`.trim();
      const newClass: ClassRoom = {
        ...classData,
        name: canonicalName,
        schoolId: activeSchoolId,
        id: `cls-${Date.now()}`
      };
      setClasses(prev => {
        const exists = prev.some(oldC => 
          String(oldC.levelCategory).toLowerCase() === String(newClass.levelCategory).toLowerCase() &&
          String(oldC.classGrade).toLowerCase() === String(newClass.classGrade).toLowerCase() &&
          String(oldC.roomLetter).toLowerCase() === String(newClass.roomLetter).toLowerCase() &&
          String(oldC.optionName).toLowerCase() === String(newClass.optionName).toLowerCase()
        );
        if (exists) return prev;
        return [...prev, newClass];
      });
    }
  };

  const handleDeleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const handleToggleOption = (id: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, isActivated: !o.isActivated, status: o.isActivated ? "Inactive" : "Active" } : o));
  };

  const handleAddOption = (newOpt: Option) => {
    setOptions(prev => [...prev, newOpt]);
  };

  const handleUpdateOption = (updatedOpt: Option) => {
    setOptions(prev => prev.map(o => o.id === updatedOpt.id ? updatedOpt : o));
  };

  const handleToggleOptionStatus = (id: string, newStatus: "Active" | "Inactive" | "Archivée") => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, isActivated: newStatus === "Active" } : o));
  };

  const handleDeleteOption = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };
  const handleAddAttendance = (attData: Omit<Attendance, "id">) => {
    const newAtt: Attendance = {
      ...attData,
      schoolId: activeSchoolId,
      id: `att-${Date.now()}`
    };
    setAttendances(prev => [newAtt, ...prev]);
  };
  const handleAddGrade = (gradeData: Omit<Grade, "id" | "recordedDate">) => {
    const newGrade: Grade = {
      ...gradeData,
      schoolId: activeSchoolId,
      id: `grd-${Date.now()}`,
      recordedDate: new Date().toLocaleDateString("fr-FR")
    };
    setGrades(prev => [newGrade, ...prev]);
  };
  const handleAddPayment = (paymentData: Omit<Payment, "id" | "createdAt" | "isValidated">) => {
    const newPayment: Payment = {
      ...paymentData,
      schoolId: activeSchoolId,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      isValidated: false
    };
    setPayments(prev => [newPayment, ...prev]);
  };
  const handleValidatePayment = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, isValidated: true } : p));
  };
  const handleDispatchSms = (title: string, message: string) => {
    const newNotif: NotificationItem = {
      id: `not-${Date.now()}`,
      title,
      message,
      time: "À l'instant",
      type: "info",
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };
  const handleUpdateSchoolName = (name: string) => {
    setSchoolName(name);
  };

  // HR Module Actions
  const handleAddEmployee = (empData: Omit<Employee, "id" | "matricule" | "qrCodeData">) => {
    if (!canRoleManageEmployees(userRole)) {
      setToast({
        message: "Action non autorisée : votre rôle n'a pas les droits de gestion du personnel.",
        type: "warning"
      });
      return;
    }
    const year = new Date().getFullYear();
    const count = employees.length + 1;
    const countStr = count.toString().padStart(4, "0");
    const matricule = `PERS-${year}-${countStr}`;
    const code = `ACT-PERS-${empData.lastName.toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;
    const ssrdc = `SSRDC-PE-${Math.floor(10000 + Math.random() * 89999)}`;
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      matricule,
      activationCode: code,
      idSsrdc: ssrdc,
      qrCodeData: `https://smartschool.cd/verify/${matricule}`
    };
    setEmployees(prev => [newEmp, ...prev]);

    // Architectural Integration with existing modules:
    // If the employee is Enseignant or Professeur, let's also add them automatically to the teachers list!
    if (empData.department === "Enseignement" || empData.function.toLowerCase().includes("enseignant") || empData.function.toLowerCase().includes("professeur")) {
      const newTeacher: Teacher = {
        id: `tch-${Date.now()}`,
        firstName: empData.firstName,
        lastName: empData.lastName,
        email: empData.email,
        phone: empData.phone,
        matriculeEtat: matricule,
        specialty: empData.function,
        assignedClasses: [],
        weeklyHours: 18,
        salaryBase: empData.salaryBase
      };
      setTeachers(prev => [newTeacher, ...prev]);
    }

    setToast({
      message: `Employé ${newEmp.firstName} ${newEmp.lastName} (${newEmp.function}) créé avec succès.`,
      type: "success"
    });
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    if (!canRoleManageEmployees(userRole)) {
      setToast({
        message: "Action non autorisée : votre rôle n'a pas les droits de modification du personnel.",
        type: "warning"
      });
      return;
    }
    setEmployees(prev => prev.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));
    setToast({
      message: `Dossier agent ${updatedEmp.firstName} ${updatedEmp.lastName} mis à jour.`,
      type: "success"
    });
  };

  const handleDeleteEmployee = (id: string) => {
    if (!canRoleManageEmployees(userRole)) {
      setToast({
        message: "Action non autorisée : votre rôle n'a pas les droits de suppression du personnel.",
        type: "warning"
      });
      return;
    }
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setToast({
      message: emp ? `Employé ${emp.firstName} ${emp.lastName} retiré.` : "Employé supprimé.",
      type: "success"
    });
  };

  const handleCreateUserAccount = (empId: string, role: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          hasUserAccount: true,
          userAccountId: `acc-${Date.now()}`,
          userAccountRole: role
        };
      }
      return emp;
    }));
  };

  const handleDeleteUserAccount = (empId: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          hasUserAccount: false,
          userAccountId: undefined,
          userAccountRole: undefined
        };
      }
      return emp;
    }));
  };

  const handleOpenPortal = (account: UserAccount) => {
    openPortalForUserAccount(account, {
      setUserName,
      setUserRole,
      setActiveTab,
      setActiveSchoolId,
      onToast: (msg, type) => setToast({ message: msg, type })
    });
  };

  const handleCreateGenericUserAccount = (accountData: Partial<UserAccount>): UserAccount => {
    const role = accountData.role || "Utilisateur";
    const portalConfig = getPortalConfigForRole(role);
    const rbacPermissions = getRoleRbacPermissions(role);
    const matchedSchool = schools.find(s => s.id === (accountData.schoolId || activeSchoolId));

    const newAcc: UserAccount = {
      id: accountData.id || `acc-${Date.now()}`,
      dossierId: accountData.dossierId || `dossier-${Date.now()}`,
      dossierType: accountData.dossierType || "personnel",
      username: accountData.username || `user-${Date.now()}@smartschool.cd`,
      password: accountData.password || accountData.tempPassword || "Temp2026!",
      tempPassword: accountData.tempPassword || "Temp2026!",
      role: role,
      portalCode: accountData.portalCode || portalConfig.portalCode,
      portalName: accountData.portalName || portalConfig.portalName,
      targetPortalTab: accountData.targetPortalTab || portalConfig.targetTab,
      portalUrl: accountData.portalUrl || portalConfig.portalPath,
      rbacPermissions: accountData.rbacPermissions || rbacPermissions,
      permissions: accountData.permissions || [portalConfig.portalCode, "profile_view"],
      isActive: accountData.isActive ?? true,
      isActivated: accountData.isActivated ?? true,
      activationCode: accountData.activationCode || `ACT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: accountData.createdAt || new Date().toLocaleDateString("fr-FR"),
      fullName: accountData.fullName,
      phone: accountData.phone,
      email: accountData.email,
      schoolId: accountData.schoolId || activeSchoolId,
      schoolName: accountData.schoolName || matchedSchool?.name || schoolName || "",
      province: accountData.province || matchedSchool?.province || "",
      securityQuestionsSet: false,
      connectedDevices: accountData.connectedDevices || []
    };
    setUserAccounts(prev => [newAcc, ...prev.filter(a => a.id !== newAcc.id)]);
    return newAcc;
  };

  const handleUpdateGenericUserAccount = (accountId: string, updates: Partial<UserAccount>) => {
    setUserAccounts(prev => prev.map(a => a.id === accountId ? { ...a, ...updates } : a));
  };

  const handleDeleteGenericUserAccount = (accountId: string) => {
    setUserAccounts(prev => prev.filter(a => a.id !== accountId));
  };

  const handleApproveRequest = (requestId: string) => {
    const request = pendingApprovals.find(r => r.id === requestId);
    if (!request) return;

    if (request.type === "student_create") {
      const studentData = request.payload;
      const today = new Date();
      const formattedDate = today.toLocaleDateString("fr-FR");
      const formattedTime = today.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
      const simulatedIp = `197.242.${Math.floor(100 + Math.random() * 155)}.${Math.floor(10 + Math.random() * 230)}`;
      
      const newStudent: Student = {
        ...studentData,
        id: `std-${Date.now()}`,
        registrationNumber: `RDC-${Math.floor(100000 + Math.random() * 900000)}`,
        createdBy: request.requestedBy,
        createdByRole: request.requestedByRole,
        createdAtDate: formattedDate,
        createdAtTime: formattedTime,
        schoolId: activeSchoolId
      };
      setStudents(prev => [newStudent, ...prev]);

      const isDraft = ["Brouillon", "En attente", "À compléter"].includes(newStudent.status);
      const logAction = `Inscription (Approuvée par RH)`;
      const newLog: InscriptionAuditLog = {
        id: `audit-${Date.now()}`,
        studentName: `${newStudent.lastName} ${newStudent.firstName}`,
        actorName: userName,
        actorRole: userRole,
        date: formattedDate,
        time: formattedTime,
        ipAddress: simulatedIp,
        device: "Système de Validation RH",
        action: logAction
      };
      setInscriptionAuditLogs(prev => [newLog, ...prev]);

    } else if (request.type === "student_edit") {
      const updatedStudent = request.payload;
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));

    } else if (request.type === "student_delete") {
      const targetId = request.targetId;
      setStudents(prev => prev.filter(s => s.id !== targetId));

    } else if (request.type === "employee_create") {
      const empData = request.payload;
      const year = new Date().getFullYear();
      const count = employees.length + 1;
      const countStr = count.toString().padStart(4, "0");
      const matricule = `PERS-${year}-${countStr}`;
      const code = `ACT-PERS-${empData.lastName.toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;
      const ssrdc = `SSRDC-PE-${Math.floor(10000 + Math.random() * 89999)}`;
      
      const newEmp: Employee = {
        ...empData,
        id: `emp-${Date.now()}`,
        matricule,
        activationCode: code,
        idSsrdc: ssrdc,
        qrCodeData: `https://smartschool.cd/verify/${matricule}`
      };
      setEmployees(prev => [newEmp, ...prev]);

      if (empData.department === "Enseignement" || empData.function.toLowerCase().includes("enseignant") || empData.function.toLowerCase().includes("professeur")) {
        const newTeacher: Teacher = {
          id: `tch-${Date.now()}`,
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email,
          phone: empData.phone,
          matriculeEtat: matricule,
          specialty: empData.function,
          assignedClasses: [],
          weeklyHours: 18,
          salaryBase: empData.salaryBase
        };
        setTeachers(prev => [newTeacher, ...prev]);
      }

    } else if (request.type === "employee_edit") {
      const updatedEmp = request.payload;
      setEmployees(prev => prev.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));

    } else if (request.type === "employee_delete") {
      const targetId = request.targetId;
      setEmployees(prev => prev.filter(emp => emp.id !== targetId));
    }

    setPendingApprovals(prev => prev.map(r => r.id === requestId ? { ...r, status: "approved" as const } : r));
    setToast({
      message: `Demande de ${request.requestedBy} approuvée et appliquée !`,
      type: "success"
    });
  };

  const handleRejectRequest = (requestId: string) => {
    setPendingApprovals(prev => prev.map(r => r.id === requestId ? { ...r, status: "rejected" as const } : r));
    setToast({
      message: "Demande d'approbation rejetée !",
      type: "warning"
    });
  };

  const handleAddHrAttendance = (att: Omit<EmployeeAttendance, "id">) => {
    const newAtt: EmployeeAttendance = {
      ...att,
      id: `att-hr-${Date.now()}`
    };
    setHrAttendances(prev => [newAtt, ...prev]);
  };

  const handleAddHrLeave = (lv: Omit<EmployeeLeave, "id">) => {
    const newLeave: EmployeeLeave = {
      ...lv,
      id: `lv-${Date.now()}`
    };
    setHrLeaves(prev => [newLeave, ...prev]);
  };

  const handleUpdateHrLeaveStatus = (id: string, status: "Approuvé" | "Refusé", approver: string) => {
    setHrLeaves(prev => prev.map(lv => {
      if (lv.id === id) {
        // Also if approved, set the employee status to "En congé"
        if (status === "Approuvé") {
          setEmployees(empPrev => empPrev.map(emp => emp.id === lv.employeeId ? { ...emp, status: "En congé" } : emp));
        }
        return {
          ...lv,
          status,
          approvedBy: approver
        };
      }
      return lv;
    }));
  };

  const handleAddHrPromotion = (prom: Omit<EmployeePromotion, "id">) => {
    const newProm: EmployeePromotion = {
      ...prom,
      id: `prom-${Date.now()}`
    };
    setHrPromotions(prev => [newProm, ...prev]);
  };

  const handleAddHrSanction = (sanc: Omit<EmployeeSanction, "id">) => {
    const newSanc: EmployeeSanction = {
      ...sanc,
      id: `sanc-${Date.now()}`
    };
    setHrSanctions(prev => [newSanc, ...prev]);
  };

  const handleAddHrEvaluation = (evalItem: Omit<EmployeeEvaluation, "id">) => {
    const newEval: EmployeeEvaluation = {
      ...evalItem,
      id: `eval-${Date.now()}`
    };
    setHrEvaluations(prev => [newEval, ...prev]);
  };

  const handleAddHrTraining = (trn: Omit<EmployeeTraining, "id">) => {
    const newTrn: EmployeeTraining = {
      ...trn,
      id: `trn-${Date.now()}`
    };
    setHrTrainings(prev => [newTrn, ...prev]);
  };

  const handleAddHrMutation = (mut: Omit<EmployeeMutation, "id">) => {
    const newMut: EmployeeMutation = {
      ...mut,
      id: `mut-${Date.now()}`
    };
    setHrMutations(prev => [newMut, ...prev]);
  };

  const handleAddHrAuditLog = (action: string, targetName: string) => {
    const newLog: HrAuditLog = {
      id: `aud-hr-${Date.now()}`,
      actorName: userName,
      actorFunction: userRole,
      action,
      targetName,
      date: new Date().toLocaleDateString("fr-FR"),
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      ipAddress: "197.242.144.10",
      device: "Chrome (Windows 11)"
    };
    setHrAuditLogs(prev => [newLog, ...prev]);
  };

  // Modals
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotInput, setForgotInput] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const t = translations[lang];

  // Platform Owner Dedicated Account State
  const [loginMode, setLoginMode] = useState<"standard" | "owner">("standard");
  const [ownerEmailInput, setOwnerEmailInput] = useState("fredtech37@gmail.com");
  const [ownerPasswordInput, setOwnerPasswordInput] = useState("SmartOwner2026!");
  const [ownerMasterKeyInput, setOwnerMasterKeyInput] = useState("KEY-SS-RDC-2026-OWNER");
  const [showOwnerSetupWizard, setShowOwnerSetupWizard] = useState(false);

  const [ownerConfig, setOwnerConfig] = useState(() => {
    const saved = safeLocalStorage.getItem("ss_platform_owner_data");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: "Ir IT Fred Kalonda",
      email: "fredtech37@gmail.com",
      phone: "0994202940",
      password: "SmartOwner2026!",
      masterKey: "KEY-SS-RDC-2026-OWNER"
    };
  });

  const handleSaveOwnerConfig = (newConfig: any) => {
    setOwnerConfig(newConfig);
    safeLocalStorage.setItem("ss_platform_owner_data", JSON.stringify(newConfig));
    setOwnerEmailInput(newConfig.email);
    setOwnerPasswordInput(newConfig.password);
    setOwnerMasterKeyInput(newConfig.masterKey);
    setShowOwnerSetupWizard(false);
  };

  const handleOwnerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      ownerEmailInput.trim().toLowerCase() === ownerConfig.email.toLowerCase() &&
      ownerPasswordInput === ownerConfig.password &&
      ownerMasterKeyInput.trim() === ownerConfig.masterKey
    ) {
      setIsSubmitting(true);
      setSubmitStep(1);
      setTimeout(() => {
        setSubmitStep(2);
        setTimeout(() => {
          setIsSubmitting(false);
          setUserRole("Propriétaire de la plateforme");
          setUserName(ownerConfig.name);
          setSchoolName("Plateforme Nationale SmartSchool RDC");
          setSuccessState(true);
          setShowWelcome3DAnimation(true);
          setActiveTab("owner_control_center");
        }, 500);
      }, 500);
    } else {
      setErrorMessage("Identifiant Propriétaire, Mot de Passe Master ou Clé de Sécurité invalides.");
    }
  };

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Load saved credentials if any
  useEffect(() => {
    const savedEmail = safeLocalStorage.getItem("smartschool_email");
    if (savedEmail) {
      setEmailOrPhone(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Auto-clear toast notifications
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle connection submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!emailOrPhone.trim() || !password.trim()) {
      setErrorMessage(t.errorEmpty);
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t.errorLength);
      return;
    }

    setIsSubmitting(true);
    setSubmitStep(1); // "Vérification des certificats de sécurité Fred-Technique..."

    const loginRes = await centralAuthService.login(emailOrPhone, password, userAccounts);

    if (!loginRes.success || !loginRes.session) {
      setTimeout(() => {
        setIsSubmitting(false);
        setErrorMessage(loginRes.error || "Identifiant ou mot de passe incorrect. Vérifiez vos identifiants ou utilisez votre fiche de connexion officielle.");
      }, 600);
      return;
    }

    const session = loginRes.session;

    setTimeout(() => {
      setSubmitStep(2); // "Authentification sur le serveur de base de données RDC..."
      setTimeout(() => {
        setSubmitStep(3); // "Initialisation du profil utilisateur..."
        setTimeout(() => {
          setIsSubmitting(false);
          setUserRole(session.userRole);
          setUserName(session.userName);
          setCurrentUserId(session.userId);
          setCurrentUserAccount(session.userAccount || null);

          // Configure active school based on user account
          let schoolIdToSet = session.schoolId || "sch-001";
          let schoolNameToSet = session.schoolName || "Établissement Scolaire";

          if (schoolIdToSet !== "default" && schoolIdToSet !== "smartschool-national-rdc") {
            setSchools(prev => {
              if (!prev.find(s => s.id === schoolIdToSet)) {
                const newSchool: SchoolType = {
                  id: schoolIdToSet,
                  name: schoolNameToSet,
                  codeNational: "RDC-" + Math.floor(10000 + Math.random() * 90000) + "-M",
                  provinceEducationnelle: session.userAccount?.province || "",
                  contactEmail: session.userEmail,
                  motto: "",
                  province: session.userAccount?.province || "",
                  ville: "",
                  commune: "",
                  adresseComplete: "",
                  phonePrincipal: session.userAccount?.phone || "",
                  type: "Privé",
                  schoolYear: "2026-2027",
                  levels: session.userRole === "Directrice de la Maternelle" ? ["Maternelle"] : 
                          session.userRole === "Directeur du Primaire" ? ["Maternelle", "Primaire"] : 
                          ["Secondaire", "Humanités"],
                  sections: session.userRole === "Directrice de la Maternelle" ? ["Section Maternelle"] :
                            session.userRole === "Directeur du Primaire" ? ["Section Maternelle", "Section Primaire"] :
                            ["Section Secondaire", "Section Scientifique", "Section Littéraire"],
                  classes: []
                };
                return [...prev, newSchool];
              }
              return prev;
            });
          }
          setActiveSchoolId(schoolIdToSet);
          setSchoolName(schoolNameToSet);

          setSuccessState(true);
          setShowWelcome3DAnimation(true);
          
          // Trigger First-Time Login Security Wizard only if user requires initial password configuration
          if (loginRes.mustChangePassword) {
            setWizardUserData({
              name: session.userName,
              role: session.userRole,
              schoolName: schoolNameToSet,
              username: emailOrPhone || "utilisateur@smartschool.cd",
              email: emailOrPhone.includes("@") ? emailOrPhone : `${emailOrPhone.toLowerCase().replace(/\s+/g, ".")}@smartschool.cd`,
              phone: "+243 812 345 678",
              tempPassword: password || "Temp2026!"
            });
            setIsFirstLoginWizardActive(true);
          } else {
            setIsFirstLoginWizardActive(false);
          }

          // Direct automatic orientation to appropriate portal based on role
          setActiveTab(session.portalTargetTab);

          if (rememberMe) {
            safeLocalStorage.setItem("smartschool_email", emailOrPhone);
          } else {
            safeLocalStorage.removeItem("smartschool_email");
          }
        }, 400);
      }, 400);
    }, 400);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotPassword(false);
      setForgotInput("");
    }, 4000);
  };

  const resetForm = () => {
    centralAuthService.logout();
    setSuccessState(false);
    setShowWelcome3DAnimation(false);
    setPassword("");
    setEmailOrPhone("");
    setUserName("");
    setUserRole("");
    setCurrentUserId(null);
    setCurrentUserAccount(null);
    setLandingChoice("login");
  };

  const getSidebarItemsForSchool = () => {
    const roleUpper = userRole.toUpperCase();

    if (
      roleUpper.includes("INSPECTION") ||
      roleUpper.includes("ADMINISTRATEUR NATIONAL EPST") ||
      roleUpper.includes("INSPECTEUR")
    ) {
      return [
        {
          group: "Supervision & Registre National",
          items: [
            { tab: "registre_ecoles", label: "Registre Établissements", icon: Building },
            { tab: "statistiques_nationales", label: "Statistiques Globales & Ratios", icon: BarChart3 },
          ]
        },
        {
          group: "Missions & Régulation EPST",
          items: [
            { tab: "demandes_inspection", label: "Missions d'Inspection", icon: ShieldCheck },
            { tab: "circulaires_nationales", label: "Circulaires & Directives EPST", icon: FileText },
            { tab: "cnr_epst", label: "Référentiels Nationaux (CNR)", icon: BookOpen },
            { tab: "culture_patrimoine_rdc", label: "Culture & Patrimoine RDC", icon: Landmark },
          ]
        },
        {
          group: "Audit & Rapports Officiels",
          items: [
            { tab: "rapports_supervision", label: "Rapports E01 / Bilans", icon: Printer },
            { tab: "audit_supervision", label: "Journal d'Audit Supervision", icon: Clock },
          ]
        }
      ];
    }

    const activeSchool = schools.find(s => s.id === activeSchoolId) || schools[0];
    const lvls = activeSchool?.levels || ["Maternelle", "Primaire", "Secondaire", "Humanités"];
    
    const hasSecondaire = lvls.includes("Secondaire");
    const hasHumanites = lvls.includes("Humanités");

    const groups: { group: string; items: { tab: string; label: string; icon: any }[] }[] = [];

    if (roleUpper === "ADMINISTRATEUR RH") {
      groups.push({
        group: "Administration RH & Portails",
        items: [
          { tab: "rh_dashboard", label: "Tableau de bord RH", icon: Activity },
          { tab: "admin_ecole", label: "Administration de mon école", icon: ShieldCheck },
          { tab: "rh_approbations", label: "Approbations RH", icon: ShieldCheck },
          { tab: "messagerie", label: "Messagerie & Chat", icon: MessageSquare },
          { tab: "rh_personnel", label: "Personnel", icon: Users },
          { tab: "rh_ajouter", label: "Ajouter un employé", icon: UserPlus },
          { tab: "rh_organigramme", label: "Organigramme", icon: Briefcase },
          { tab: "rh_cartes", label: "Cartes professionnelles", icon: QrCode },
          { tab: "rh_comptes", label: "Comptes utilisateurs", icon: ShieldCheck },
          { tab: "rh_presences", label: "Présences du personnel", icon: UserCheck },
          { tab: "rh_conges", label: "Congés", icon: Calendar },
          { tab: "rh_evaluations", label: "Évaluations", icon: Award },
          { tab: "rh_formations", label: "Formations", icon: BookOpen },
          { tab: "rh_promotions", label: "Promotions", icon: Sparkles },
          { tab: "rh_sanctions", label: "Sanctions", icon: ShieldAlert },
          { tab: "rh_mouvements", label: "Historique des mouvements", icon: RefreshCw },
          { tab: "rh_journal", label: "Journal RH", icon: Clock },
          { tab: "rh_parametres", label: "Paramètres RH", icon: Settings }
        ]
      });
      return groups;
    }

    // 1. Group: Principal
    const principalItems = [];
    principalItems.push({ tab: "dashboard", label: "Tableau de Bord", icon: Activity });
    
    if (["PROMOTEUR", "SUPER ADMINISTRATEUR DE L'ÉTABLISSEMENT", "DIRECTEUR GÉNÉRAL", "PROPRIÉTAIRE", "PRÉFET DES ÉTUDES", "PRÉFET", "SECRÉTAIRE", "GESTIONNAIRE", "ADMINISTRATEUR RH"].some(r => roleUpper.includes(r))) {
      principalItems.push({ tab: "promoteur_finance_center", label: "Contrôle Suprême du Promoteur", icon: Crown });
      principalItems.push({ tab: "admin_ecole", label: "Administration de mon école", icon: ShieldCheck });
    }

    principalItems.push({ tab: "presentation_officielle", label: "Dossier & Plaquette (PDF/PPTX)", icon: Presentation });
    principalItems.push({ tab: "promo_video", label: "Vidéo Pub Officielle", icon: Tv });
    principalItems.push({ tab: "messagerie", label: "Messagerie & Chat", icon: MessageSquare });
    principalItems.push({ tab: "national_jobs", label: "Offres d'Emploi RDC", icon: Briefcase });
    
    if (["PROMOTEUR", "SUPER ADMINISTRATEUR DE L'ÉTABLISSEMENT", "DIRECTEUR GÉNÉRAL", "INSPECTION PROVINCIALE", "INSPECTION GÉNÉRALE"].includes(roleUpper)) {
      principalItems.push({ tab: "etablissements", label: "Établissements", icon: Building });
    }
    
    if (["PROMOTEUR", "SUPER ADMINISTRATEUR DE L'ÉTABLISSEMENT", "DIRECTEUR GÉNÉRAL", "COMPTABLE", "COMPTABLE PRINCIPAL", "GESTIONNAIRE", "INSPECTION PROVINCIALE", "INSPECTION GÉNÉRALE"].includes(roleUpper)) {
      principalItems.push({ tab: "comptabilite", label: "Frais & Comptabilité", icon: Landmark });
    }
    
    if (principalItems.length > 0) {
      groups.push({ group: "Principal", items: principalItems });
    }

    // 2. Group: Pédagogie & Élèves
    const pedagoItems = [];
    if (roleUpper !== "COMPTABLE") {
      pedagoItems.push({ tab: "eleves", label: "Élèves", icon: GraduationCap });
    }
    
    if (["PROMOTEUR", "SUPER ADMINISTRATEUR DE L'ÉTABLISSEMENT", "DIRECTEUR GÉNÉRAL", "DIRECTRICE DE LA MATERNELLE", "DIRECTEUR DU PRIMAIRE", "DIRECTEUR DU SECONDAIRE", "PRÉFET DES ÉTUDES", "SECRÉTAIRE", "INSPECTION PROVINCIALE", "INSPECTION GÉNÉRALE"].includes(roleUpper)) {
      pedagoItems.push({ tab: "enseignants", label: "Enseignants", icon: Users });
    }

    if (["PROMOTEUR", "SUPER ADMINISTRATEUR DE L'ÉTABLISSEMENT", "DIRECTEUR GÉNÉRAL", "DIRECTRICE DE LA MATERNELLE", "DIRECTEUR DU PRIMAIRE", "DIRECTEUR DU SECONDAIRE", "PRÉFET DES ÉTUDES", "SECRÉTAIRE", "INSPECTION PROVINCIALE", "INSPECTION GÉNÉRALE", "GESTIONNAIRE"].includes(roleUpper)) {
      pedagoItems.push({ tab: "rh", label: "Ressources Humaines (RH)", icon: Briefcase });
    }
    
    if (!["COMPTABLE", "ENSEIGNANT", "ÉLÈVE"].includes(roleUpper)) {
      pedagoItems.push({ tab: "parents", label: "Parents & Tuteurs", icon: Users });
    }
    
    if (!["PARENT", "ÉLÈVE", "COMPTABLE", "ENSEIGNANT"].includes(roleUpper)) {
      pedagoItems.push({ tab: "classes", label: "Classes & Salles", icon: School });
    }

    if (pedagoItems.length > 0) {
      groups.push({ group: "Pédagogie & Élèves", items: pedagoItems });
    }

    // 3. Group: Configuration d'Étude
    const configItems = [];
    if (hasHumanites || hasSecondaire) {
      if (!["PARENT", "ÉLÈVE", "COMPTABLE", "ENSEIGNANT"].includes(roleUpper)) {
        configItems.push({ tab: "options", label: "Options d'Étude", icon: BookOpen });
      }
    }
    
    if (!["PARENT", "ÉLÈVE", "COMPTABLE"].includes(roleUpper)) {
      configItems.push({ tab: "matieres", label: "Matières & Cours", icon: Award });
    }
    
    if (roleUpper !== "COMPTABLE") {
      configItems.push({ tab: "horaires", label: "Emplois du Temps & Affectations", icon: Calendar });
      configItems.push({ tab: "planification_pedagogique", label: "Planification Pédagogique", icon: BookOpen });
      configItems.push({ tab: "journal_classe", label: "Journal de Classe", icon: FileText });
    }

    if (configItems.length > 0) {
      groups.push({ group: "Configuration d'Étude", items: configItems });
    }

    // 4. Group: Vie Scolaire & Suivi
    const suivisItems = [];
    if (roleUpper !== "COMPTABLE") {
      suivisItems.push({ tab: "presences", label: "Présences (Appel)", icon: UserCheck });
    }
    
    if (!["COMPTABLE", "PARENT"].includes(roleUpper)) {
      suivisItems.push({ tab: "cotes", label: "Cotes & Évaluations", icon: Award });
    }
    
    suivisItems.push({ tab: "bulletins", label: "Bulletins de Période", icon: FileText });

    if (roleUpper !== "COMPTABLE") {
      suivisItems.push({ tab: "devoirs", label: "Devoirs & Exercices", icon: BookOpen });
    }

    if (suivisItems.length > 0) {
      groups.push({ group: "Vie Scolaire & Suivi", items: suivisItems });
    }

    // 5. Group: Analyse & Alertes
    const analyseItems = [];
    analyseItems.push({ tab: "analyste_ia", label: "Analyste IA & Assistant", icon: Sparkles });
    if (!["PARENT", "ÉLÈVE", "COMPTABLE", "ENSEIGNANT"].includes(roleUpper)) {
      analyseItems.push({ tab: "sms", label: "SMS & Notifications", icon: Bell });
    }
    if (["PROMOTEUR", "SUPER ADMINISTRATEUR DE L'ÉTABLISSEMENT", "DIRECTEUR GÉNÉRAL", "DIRECTRICE DE LA MATERNELLE", "DIRECTEUR DU PRIMAIRE", "DIRECTEUR DU SECONDAIRE", "PRÉFET DES ÉTUDES", "INSPECTION PROVINCIALE", "INSPECTION GÉNÉRALE"].includes(roleUpper)) {
      analyseItems.push({ tab: "rapports", label: "Rapports Statistiques", icon: BarChart3 });
    }
    if (["PROMOTEUR", "SUPER ADMINISTRATEUR DE L'ÉTABLISSEMENT", "DIRECTEUR GÉNÉRAL", "GESTIONNAIRE"].includes(roleUpper)) {
      analyseItems.push({ tab: "parametres", label: "Paramètres", icon: Settings });
    }
    analyseItems.push({ tab: "profil_securite", label: "Profil & Sécurité", icon: ShieldCheck });
    if (["PROMOTEUR", "SUPER ADMINISTRATEUR DE L'ÉTABLISSEMENT", "DIRECTEUR GÉNÉRAL", "DIRECTRICE DE LA MATERNELLE", "DIRECTEUR DU PRIMAIRE", "DIRECTEUR DU SECONDAIRE", "PRÉFET DES ÉTUDES", "GESTIONNAIRE", "SECRÉTAIRE"].includes(roleUpper)) {
      analyseItems.push({ tab: "sauvegarde_etablissement", label: "Sauvegarde & Restauration", icon: HardDrive });
    }

    if (analyseItems.length > 0) {
      groups.push({ group: "Analyse & Alertes", items: analyseItems });
    }

    // 6. Group: Éditions & Réseau National
    const networkAndEditionsItems = [];
    networkAndEditionsItems.push({ tab: "impression_listes", label: "Centre 14 Exports & PDF", icon: Printer });
    networkAndEditionsItems.push({ tab: "audit_systeme", label: "Audit & Validation Tests", icon: ShieldAlert });
    networkAndEditionsItems.push({ tab: "galerie_ecole", label: "Galerie & Vitrine École", icon: Camera });
    networkAndEditionsItems.push({ tab: "reseau_interscolaire", label: "Réseau Interscolaire", icon: Globe });
    networkAndEditionsItems.push({ tab: "culture_patrimoine_rdc", label: "Culture & Patrimoine RDC", icon: Landmark });
    groups.push({ group: "Éditions, Exports & Audits", items: networkAndEditionsItems });

    // 7. Group: Régulation & Souveraineté
    const stateItems = [];
    if (["PROMOTEUR", "SUPER ADMINISTRATEUR DE L'ÉTABLISSEMENT", "DIRECTEUR GÉNÉRAL", "PRÉFET DES ÉTUDES", "INSPECTION PROVINCIALE", "INSPECTION GÉNÉRALE", "ADMINISTRATEUR NATIONAL EPST"].includes(roleUpper)) {
      stateItems.push({ tab: "cnr_epst", label: "Centre National (CNR)", icon: ShieldCheck });
      // NOTE: "owner_control_center" and "sa_saas_center" are STRICTLY ISOLATED and reserved exclusively for the Platform Owner
    }

    if (stateItems.length > 0) {
      groups.push({ group: "Régulation & Souveraineté", items: stateItems });
    }

    return groups;
  };

  const isPlatformRole = [
    "Propriétaire de la plateforme",
    "PROPRIÉTAIRE DE LA PLATEFORME",
    "Créateur de SmartSchool RDC",
    "Super Administrateur",
    "SuperAdmin RDC",
    "Super Admin",
    "Administrateur technique",
    "Support client",
    "Comptable SmartSchool",
    "Développeur"
  ].includes(userRole);

  const isPlatformOwner = [
    "Propriétaire de la plateforme",
    "PROPRIÉTAIRE DE LA PLATEFORME",
    "Propriétaire"
  ].includes(userRole);

  const visibleNotifications = notifications.filter(n => {
    const target = (n as any).targetRoles;
    if (!target) return true; // public/system notification
    return target.includes(userRole);
  });

  const sidebarItems = isPlatformOwner 
    ? [
        {
          group: "Contrôle Suprême",
          items: [
            { tab: "owner_control_center", label: "Centre de Contrôle Propriétaire", icon: Crown },
            { tab: "promoteur_finance_center", label: "Surveillance Financière & Anti-Fraude", icon: ShieldAlert },
            { tab: "manage_schools", label: "Gérer les écoles", icon: Building2 },
            { tab: "sa_backup_disaster_recovery", label: "Sauvegarde & Reprise Sinistre", icon: Database },
          ]
        },
        {
          group: "Super Administration SaaS",
          items: [
            { tab: "sa_saas_center", label: "Centre de Gestion SaaS", icon: Server },
            { tab: "sa_dashboard", label: "Tableau de Bord National", icon: Activity },
            { tab: "sa_schools", label: "Établissements RDC", icon: Building },
            { tab: "sa_users", label: "Utilisateurs Interne", icon: Users },
            { tab: "sa_provinces", label: "Provinces Éducationnelles", icon: Globe },
          ]
        },
        {
          group: "Inspections & Souveraineté",
          items: [
            { tab: "sa_inspections", label: "Inspections RDC", icon: Fingerprint },
            { tab: "cnr_epst", label: "Médiathèque CNR-EPST", icon: BookOpen },
            { tab: "culture_patrimoine_rdc", label: "Culture & Patrimoine RDC", icon: Landmark },
            { tab: "national_jobs", label: "Offres d'Emploi RDC", icon: Briefcase },
            { tab: "sa_years", label: "Années Scolaires", icon: Calendar },
            { tab: "sa_roles", label: "Rôles & Permissions", icon: Shield },
            { tab: "sa_features", label: "Gestion Fonctionnalités", icon: Sliders },
          ]
        },
        {
          group: "Abonnements & Finances",
          items: [
            { tab: "sa_subscriptions", label: "Gestion des Abonnements", icon: School },
            { tab: "sa_payments", label: "Paiements Centralisés", icon: Landmark },
          ]
        },
        {
          group: "Maintenance, Alertes & IA",
          items: [
            { tab: "sa_support", label: "Support Technique", icon: BadgeHelp },
            { tab: "sa_announcements", label: "Annonces Nationales", icon: Bell },
            { tab: "sa_ai_assistant", label: "Analyste IA National", icon: Sparkles },
            { tab: "sa_audit", label: "Journal d'Audit", icon: Clock },
            { tab: "sa_settings", label: "Paramètres Plateforme", icon: Settings },
          ]
        }
      ]
    : getSidebarItemsForSchool();

  const renderTabContent = () => {
    const activeSchool = schools.find(s => s.id === activeSchoolId) || schools[0];
    
    const roleUpper = userRole.toUpperCase();
    const isMaternelleOnly = roleUpper.includes("MATERNELLE");
    const isPrimaireOnly = roleUpper.includes("PRIMAIRE");
    const isSecondaireOnly = roleUpper.includes("SECONDAIRE") || roleUpper.includes("PRÉFET") || roleUpper.includes("PREFET");
    const isAnyAdmin = isMaternelleOnly || isPrimaireOnly || isSecondaireOnly;

    // Filter classes and students automatically based on the user's role/scope
    const getRoleFilteredClasses = (rawClasses: ClassRoom[]) => {
      const schoolFiltered = rawClasses.filter(c => c.schoolId === activeSchoolId || (!c.schoolId && (activeSchoolId === "default" || activeSchoolId === "sch-001")));
      if (isMaternelleOnly) {
        return schoolFiltered.filter(c => c.levelCategory === "Maternelle" || String(c.level).toLowerCase().includes("section") || String(c.classGrade).toLowerCase().includes("section"));
      }
      if (isPrimaireOnly) {
        return schoolFiltered.filter(c => c.levelCategory === "Primaire" || String(c.level).toLowerCase().includes("primaire") || (String(c.level).toLowerCase().includes("année") && !String(c.level).toLowerCase().includes("humanités") && !String(c.level).toLowerCase().includes("eb")) || (String(c.classGrade).toLowerCase().includes("année") && !String(c.classGrade).toLowerCase().includes("humanités") && !String(c.classGrade).toLowerCase().includes("eb")));
      }
      if (isSecondaireOnly) {
        return schoolFiltered.filter(c => c.levelCategory === "Secondaire" || String(c.level).toLowerCase().includes("humanités") || String(c.level).toLowerCase().includes("eb") || String(c.classGrade).toLowerCase().includes("humanités") || String(c.classGrade).toLowerCase().includes("eb") || String(c.sectionName || "").toLowerCase().includes("secondaire") || String(c.sectionName || "").toLowerCase().includes("humanit") || String(c.sectionName || "").toLowerCase().includes("base"));
      }
      return schoolFiltered;
    };

    const getRoleFilteredStudents = (rawStudents: Student[], filteredClsList: ClassRoom[]) => {
      const schoolFiltered = rawStudents.filter(s => s.schoolId === activeSchoolId || (!s.schoolId && (activeSchoolId === "default" || activeSchoolId === "sch-001")));
      
      // If no section restriction, return all students of this school
      if (!isMaternelleOnly && !isPrimaireOnly && !isSecondaireOnly) {
        return schoolFiltered;
      }

      if (isMaternelleOnly) {
        const matStds = schoolFiltered.filter(s => 
          filteredClsList.some(c => 
            s.className === `${c.classGrade || c.level} ${c.roomLetter}` ||
            s.className === `${c.level} ${c.roomLetter}` ||
            s.className === c.classGrade ||
            s.className === String(c.level) ||
            (c.id && (s as any).classId === c.id)
          ) || 
          s.className.toLowerCase().includes("maternelle") || 
          s.className.toLowerCase().includes("section") ||
          s.levelCategory === "Maternelle"
        );
        return matStds.length > 0 ? matStds : schoolFiltered;
      }

      if (isPrimaireOnly) {
        const primStds = schoolFiltered.filter(s => 
          filteredClsList.some(c => 
            s.className === `${c.classGrade || c.level} ${c.roomLetter}` ||
            s.className === `${c.level} ${c.roomLetter}` ||
            s.className === c.classGrade ||
            s.className === String(c.level) ||
            (c.id && (s as any).classId === c.id)
          ) || 
          (s.className.toLowerCase().includes("année") && !s.className.toLowerCase().includes("humanit") && !s.className.toLowerCase().includes("eb")) ||
          s.levelCategory === "Primaire"
        );
        return primStds.length > 0 ? primStds : schoolFiltered;
      }

      if (isSecondaireOnly) {
        const secStds = schoolFiltered.filter(s => 
          filteredClsList.some(c => 
            s.className === `${c.classGrade || c.level} ${c.roomLetter}` ||
            s.className === `${c.level} ${c.roomLetter}` ||
            s.className === c.classGrade ||
            s.className === String(c.level) ||
            (c.id && (s as any).classId === c.id)
          ) || 
          s.className.toLowerCase().includes("humanit") || 
          s.className.toLowerCase().includes("eb") || 
          s.className.toLowerCase().includes("secondaire") ||
          s.levelCategory === "Secondaire"
        );
        return secStds.length > 0 ? secStds : schoolFiltered;
      }

      return schoolFiltered;
    };

    const filteredCls = getRoleFilteredClasses(classes);
    const filteredStds = getRoleFilteredStudents(students, filteredCls);

    // Redirect role-specific users to their customized private workspaces
    if (userRole && userRole.toUpperCase().includes("ÉLÈVE")) {
      return (
        <StudentModule
          userRole={userRole}
          userName={userName}
          userEmail={emailOrPhone}
          currentUserId={currentUserId || undefined}
          currentUserAccount={currentUserAccount}
          students={students}
          payments={payments}
          grades={grades}
          attendances={attendances}
          bulletinSettings={bulletinSettings}
          onNavigateToMessagerie={(targetId) => {
            setInitialTargetChatUserId(targetId || null);
            setActiveTab("messagerie");
          }}
        />
      );
    }
    if (userRole && (userRole.toUpperCase().includes("PARENT") || userRole.toUpperCase().includes("TUTEUR"))) {
      return (
        <ParentModule
          userRole={userRole}
          userName={userName}
          userEmail={emailOrPhone}
          currentUserId={currentUserId || undefined}
          students={students}
          parents={parents}
          teachers={teachers}
          classes={filteredCls}
          subjects={subjects}
          payments={payments}
          grades={grades}
          attendances={attendances}
          bulletinSettings={bulletinSettings}
          onNavigateToMessagerie={(targetId) => {
            setInitialTargetChatUserId(targetId || null);
            setActiveTab("messagerie");
          }}
          onAddPayment={(newPayment) => {
            setPayments(prev => [newPayment, ...prev]);
            setNotifications(prev => [
              {
                id: `notif-${Date.now()}`,
                title: "Nouveau Paiement Reçu",
                message: `Paiement de ${newPayment.amount} ${newPayment.currency} reçu pour ${newPayment.studentName} (${newPayment.paymentType}).`,
                time: "À l'instant",
                isRead: false,
                type: "info"
              },
              ...prev
            ]);
          }}
        />
      );
    }
    if (userRole && userRole.toUpperCase().includes("ENSEIGNANT")) {
      return (
        <TeacherModule
          userRole={userRole}
          userName={userName}
          userEmail={emailOrPhone}
          currentUserId={currentUserId || undefined}
          currentUserAccount={currentUserAccount}
          students={filteredStds}
          teachers={teachers}
          classes={filteredCls}
          subjects={subjects}
          grades={grades}
          attendances={attendances}
          activeSchool={activeSchool}
          academicYear="2025-2026"
          schoolId={activeSchoolId}
          onSaveAttendance={(newAtts) => {
            setAttendances(prev => {
              const ids = new Set(newAtts.map(a => `${a.studentId}_${a.date}`));
              return [...newAtts, ...prev.filter(a => !ids.has(`${a.studentId}_${a.date}`))];
            });
          }}
          onSaveGrades={(newGrds) => {
            setGrades(prev => {
              const ids = new Set(newGrds.map(g => `${g.studentId}_${g.subjectId || g.subjectName}_${g.period || g.evaluationType || "T1"}`));
              return [...newGrds, ...prev.filter(g => !ids.has(`${g.studentId}_${g.subjectId || g.subjectName}_${g.period || g.evaluationType || "T1"}`))];
            });
          }}
          bulletinSettings={bulletinSettings}
          onAddNotification={(notif) => setNotifications(prev => [notif, ...prev])}
        />
      );
    }

    const isInspection = [
      "INSPECTION PROVINCIALE",
      "INSPECTION GÉNÉRALE",
      "INSPECTION GENERALE",
      "ADMINISTRATEUR NATIONAL EPST",
      "INSPECTEUR PROVINCIAL",
      "INSPECTEUR GÉNÉRAL",
      "INSPECTEUR GENERAL"
    ].some(target => roleUpper.includes(target));

    if (isInspection) {
      const allowedInspectionTabs = [
        "dashboard",
        "registre_ecoles",
        "statistiques_nationales",
        "demandes_inspection",
        "circulaires_nationales",
        "cnr_epst",
        "rapports_supervision",
        "audit_supervision",
        "sa_inspections",
        "culture_patrimoine_rdc"
      ];

      if (!allowedInspectionTabs.includes(activeTab)) {
        return (
          <UnauthorizedInspectionAccessView
            userRole={userRole}
            userName={userName}
            tabAttempted={activeTab}
            onBack={() => setActiveTab("registre_ecoles")}
          />
        );
      }

      if (activeTab === "culture_patrimoine_rdc") {
        return <NationalCultureHeritageModule userRole={userRole} userName={userName} />;
      }

      return (
        <NationalInspectionModule
          userRole={userRole}
          userName={userName}
          userProvince={activeSchool?.province || currentUserAccount?.province || ""}
          schools={schools}
          students={students}
          teachers={teachers}
          classes={classes}
          cnrResources={cnrResources}
          onAddCnrResource={handleAddCnrResource}
          onUpdateCnrResource={handleUpdateCnrResource}
          lang={lang}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        if (isAnyAdmin) {
          return (
            <AdminWorkspaceView
              userRole={userRole}
              userName={userName}
              classes={classes}
              teachers={teachers}
              students={students}
              subjects={subjects}
              grades={grades}
              timetable={timetable}
              options={options}
              pedagogicalEvents={pedagogicalEvents}
              attendances={attendances}
              onAddTimetableEntry={handleAddTimetableEntry}
              onDeleteTimetableEntry={handleDeleteTimetableEntry}
              onAddNotification={(notif) => setNotifications(prev => [{ ...notif, id: `notif-${Date.now()}`, time: "À l'instant" }, ...prev])}
              onAddPedagogicalEvent={handleAddPedagogicalEvent}
            />
          );
        }
        return (
          <DashboardView
            students={students}
            teachers={teachers}
            payments={payments}
            classes={classes.filter(c => c.schoolId === activeSchoolId || (!c.schoolId && activeSchoolId === "default"))}
            grades={grades}
            onNavigate={setActiveTab}
            lang={lang}
            userRole={userRole}
            classAnnouncements={classAnnouncements}
          />
        );
      case "admin_ecole":
        return (
          <SchoolAdministrationPortalModule
            school={activeSchool}
            employees={employees.filter(e => e.schoolId === activeSchoolId || (!e.schoolId && (activeSchoolId === "default" || activeSchoolId === "sch-001")))}
            userAccounts={userAccounts}
            currentUserRole={userRole}
            currentUserName={userName}
            onUpdateSchool={handleUpdateSchool}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onAddUserAccount={(acc) => {
              setUserAccounts(prev => {
                const idx = prev.findIndex(a => a.id === acc.id || (a.username && a.username.toLowerCase() === acc.username.toLowerCase()));
                if (idx >= 0) return prev.map((a, i) => i === idx ? { ...a, ...acc } : a);
                return [acc, ...prev.filter(a => a.id !== acc.id)];
              });
              persistUniversalUserAccount(acc);
            }}
            onUpdateUserAccount={(acc) => {
              setUserAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
              persistUniversalUserAccount(acc);
            }}
            onOpenPortal={handleOpenPortal}
          />
        );
      case "etablissements":
        return (
          <SchoolManagement
            schools={schools}
            activeSchoolId={activeSchoolId}
            onSelectSchool={handleSelectSchool}
            onAddSchool={handleAddSchool}
            onDeleteSchool={handleDeleteSchool}
            onUpdateSchool={handleUpdateSchool}
            lang={lang}
          />
        );
      case "eleves":
        return (
          <PupilsView
            students={filteredStds}
            parents={parents}
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onAddParent={handleAddParent}
            onLinkParentToStudent={handleLinkParentToStudent}
            onUpdateParents={setParents}
            lang={lang}
            userRole={userRole}
            userName={userName}
            auditLogs={inscriptionAuditLogs}
            onValidateStudent={handleValidateStudent}
            classes={filteredCls}
            options={options}
            teachers={teachers}
            employees={employees}
            userAccounts={userAccounts}
            schoolId={activeSchoolId}
            schoolName={schoolName}
          />
        );
      case "enseignants":
        return (
          <TeachersView
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onUpdateTeacher={(updated) => {
              setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
            }}
            onUpdateTeachers={setTeachers}
            userAccounts={userAccounts}
            onUpdateUserAccounts={setUserAccounts}
            classes={filteredCls}
            subjects={subjects}
            schoolId={activeSchoolId}
            schoolName={schoolName}
            schoolLogoUrl={schoolLogoUrl}
            schoolMotto={schoolMotto}
            onOpenPortal={(acc) => {
              setUserRole(acc.role);
              setUserName(acc.fullName);
              setEmailOrPhone(acc.email || acc.phone || acc.username);
              setCurrentUserId(acc.dossierId || acc.id);
              setCurrentUserAccount(acc);
              if (acc.schoolId) setActiveSchoolId(acc.schoolId);
              if (acc.schoolName) setSchoolName(acc.schoolName);
              setActiveTab(acc.targetPortalTab || "dashboard");
              setToast({
                message: `Basculement direct sur le ${acc.role} : ${acc.fullName}`,
                type: "success"
              });
            }}
            onAddAuditLog={(action, target) => {
              setInscriptionAuditLogs(prev => [
                {
                  id: `log-${Date.now()}`,
                  studentName: target,
                  actorName: userName,
                  actorRole: userRole,
                  date: new Date().toLocaleDateString("fr-FR"),
                  time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                  ipAddress: "192.168.1.10",
                  device: "SmartSchool Admin",
                  action: `${action} [${target}]`
                },
                ...prev
              ]);
            }}
          />
        );
      case "rh":
      case "rh_dashboard":
      case "rh_personnel":
      case "rh_ajouter":
      case "rh_organigramme":
      case "rh_cartes":
      case "rh_comptes":
      case "rh_presences":
      case "rh_conges":
      case "rh_evaluations":
      case "rh_formations":
      case "rh_promotions":
      case "rh_sanctions":
      case "rh_mouvements":
      case "rh_journal":
      case "rh_parametres":
        const subTab = activeTab.startsWith("rh_") ? activeTab.substring(3) : "dashboard";
        return (
          <HrModuleView
            activeSection={subTab}
            onSectionChange={(newSec) => {
              if (userRole.toUpperCase() === "ADMINISTRATEUR RH") {
                setActiveTab("rh_" + newSec);
              } else {
                setActiveTab("rh");
              }
            }}
            students={students}
            employees={employees}
            attendances={hrAttendances}
            leaves={hrLeaves}
            promotions={hrPromotions}
            sanctions={hrSanctions}
            evaluations={hrEvaluations}
            trainings={hrTrainings}
            mutations={hrMutations}
            auditLogs={hrAuditLogs}
            userRole={userRole}
            userName={userName}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onCreateUserAccount={handleCreateUserAccount}
            onDeleteUserAccount={handleDeleteUserAccount}
            onAddAttendance={handleAddHrAttendance}
            onAddLeave={handleAddHrLeave}
            onUpdateLeaveStatus={handleUpdateHrLeaveStatus}
            onAddPromotion={handleAddHrPromotion}
            onAddSanction={handleAddHrSanction}
            onAddEvaluation={handleAddHrEvaluation}
            onAddTraining={handleAddHrTraining}
            onAddMutation={handleAddHrMutation}
            onAddAuditLog={handleAddHrAuditLog}
            onOpenPortal={handleOpenPortal}
            schoolMotto={schoolMotto}
            schoolLogo={schoolLogoUrl}
            signatureSeal={schoolStampUrl}
          />
        );
      case "parents":
        return (
          <ParentsView
            parents={parents}
            students={students}
            onAddParent={handleAddParent}
            onLinkParentToStudent={handleLinkParentToStudent}
            onUpdateParents={setParents}
            schoolName={schoolName}
            schoolLogoUrl={schoolLogoUrl}
            schoolMotto={schoolMotto}
            onOpenPortal={handleOpenPortal}
          />
        );
      case "classes":
        return (
          <ClassesView
            classes={filteredCls}
            onAddClass={handleAddClass}
            schoolLevels={activeSchool?.levels}
            students={filteredStds}
            userRole={userRole}
            classAnnouncements={classAnnouncements}
            options={options}
            teachers={teachers}
            employees={employees}
            userAccounts={userAccounts}
            parents={parents}
            schoolId={activeSchoolId}
            schoolName={schoolName}
            onUpdateClass={(updatedClass) => {
              setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
            }}
            onUpdateClasses={setClasses}
            onUpdateTeachers={setTeachers}
            onDeleteClass={handleDeleteClass}
          />
        );
      case "options":
        return (
          <OptionsView
            options={options}
            classes={classes}
            userRole={userRole}
            userName={schoolName || "Direction Pédagogique"}
            onToggleOption={handleToggleOption}
            onAddOption={handleAddOption}
            onUpdateOption={handleUpdateOption}
            onToggleStatus={handleToggleOptionStatus}
            onDeleteOption={handleDeleteOption}
          />
        );
      case "matieres":
        return (
          <IntegratedTimetableManagementView
            userRole={userRole}
            userName={userName}
            classes={classes}
            subjects={subjects}
            setSubjects={setSubjects}
            teachers={teachers}
            schoolName={schoolName}
            schoolMotto={schoolMotto}
            initialTab="subjects"
            onAddNotification={(notif) => setNotifications(prev => [{ ...notif, id: `notif-${Date.now()}`, time: "À l'instant" }, ...prev])}
          />
        );
      case "presences":
        return (
          <AttendanceView
            attendances={attendances}
            onAddAttendance={handleAddAttendance}
            students={filteredStds}
            classes={filteredCls}
          />
        );
      case "cotes":
      case "evaluations":
        return (
          <EvaluationGradingSystem
            userRole={userRole}
            userName={userName}
            userEmail={emailOrPhone}
            currentUserId={currentUserId}
            currentUserAccount={currentUserAccount}
            students={filteredStds}
            teachers={teachers}
            classes={filteredCls}
            subjects={subjects}
            schoolId={activeSchoolId}
            academicYear="2025-2026"
            schoolName={activeSchool?.name || schoolName}
            schoolLogoUrl={schoolLogoUrl}
            isDirectionUser={isAnyAdmin || userRole.toUpperCase().includes("PRÉFET") || userRole.toUpperCase().includes("DIRECTEUR")}
            bulletinSettings={bulletinSettings}
            onAddNotification={(notif) => setNotifications(prev => [notif, ...prev])}
          />
        );
      case "bulletins":
        return (
          <BulletinsView
            students={filteredStds}
            grades={grades}
            watermarkUrl={watermarkUrl}
            drapeauUrl={drapeauUrl}
            schoolLogoUrl={schoolLogoUrl}
            schoolStampUrl={schoolStampUrl}
            schoolSignatureUrl={schoolSignatureUrl}
            isSignatureEnabled={isSignatureEnabled}
            schoolName={schoolName}
            schoolMotto={schoolMotto}
          />
        );
      case "devoirs":
        return (
          <HomeworkModule
            userRole={userRole}
            userName={userName}
            students={students}
            classes={classes}
            onAddNotification={(notif) => setNotifications(prev => [{ ...notif, id: `notif-${Date.now()}`, time: "À l'instant" }, ...prev])}
          />
        );
      case "horaires":
        return (
          <IntegratedTimetableManagementView
            userRole={userRole}
            userName={userName}
            classes={classes}
            subjects={subjects}
            setSubjects={setSubjects}
            teachers={teachers}
            schoolName={schoolName}
            schoolMotto={schoolMotto}
            initialTab="timetable"
            onAddNotification={(notif) => setNotifications(prev => [{ ...notif, id: `notif-${Date.now()}`, time: "À l'instant" }, ...prev])}
          />
        );
      case "planification_pedagogique":
        return (
          <PedagogicalPlannerModule
            userRole={userRole}
            userName={userName}
            classes={classes}
            subjects={subjects}
            teachers={teachers}
          />
        );
      case "journal_classe":
        return (
          <ClassJournalModule
            userRole={userRole}
            userName={userName}
            students={students}
            classes={classes}
            teachers={teachers}
          />
        );
      case "comptabilite":
        return (
          <FinanceModule
            payments={payments}
            onAddPayment={handleAddPayment}
            onValidatePayment={handleValidatePayment}
            userRole={userRole}
            userName={userName}
            students={students}
            parents={parents}
          />
        );
      case "rapports":
        return (
          <ReportsModule
            userRole={userRole}
            userName={userName}
            students={students}
            teachers={employees}
            payments={payments}
          />
        );
      case "sms":
        return (
          <NotificationsView
            notifications={visibleNotifications}
            onDispatchSms={handleDispatchSms}
            onToggleRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n))}
            onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
            onDeleteNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
          />
        );
      case "parametres":
        return (
          <SettingsView
            schoolName={schoolName}
            onUpdateSchoolName={handleUpdateSchoolName}
            announceNewStudents={announceNewStudents}
            onUpdateAnnounceNewStudents={setAnnounceNewStudents}
            privacySetting={privacySetting}
            onUpdatePrivacySetting={(val: any) => setPrivacySetting(val)}
            watermarkUrl={watermarkUrl}
            onUpdateWatermarkUrl={handleUpdateWatermarkUrl}
            drapeauUrl={drapeauUrl}
            onUpdateDrapeauUrl={handleUpdateDrapeauUrl}
            schoolLogoUrl={schoolLogoUrl}
            onUpdateSchoolLogoUrl={handleUpdateSchoolLogoUrl}
            schoolStampUrl={schoolStampUrl}
            onUpdateSchoolStampUrl={handleUpdateSchoolStampUrl}
            schoolSignatureUrl={schoolSignatureUrl}
            onUpdateSchoolSignatureUrl={handleUpdateSchoolSignatureUrl}
            isSignatureEnabled={isSignatureEnabled}
            onUpdateIsSignatureEnabled={handleUpdateIsSignatureEnabled}
            schoolMotto={schoolMotto}
            onUpdateSchoolMotto={handleUpdateSchoolMotto}
            activeSchool={activeSchool}
            onUpdateSchool={handleUpdateSchool}
            userName={userName}
            userRole={userRole}
          />
        );
      case "profil_securite":
        return (
          <UserProfileSecurity
            userName={userName}
            userRole={userRole}
            userEmail={userRole.includes("Propriétaire") ? ownerConfig.email : (emailOrPhone || ownerConfig.email)}
            userPhone={userRole.includes("Propriétaire") ? ownerConfig.phone : ownerConfig.phone}
            schoolName={activeSchool?.name || schoolName}
            schoolId={activeSchool?.id || activeSchoolId || "sch-141992"}
            currentUserId={currentUserId}
            currentUserAccount={currentUserAccount}
            onAuditLog={(action, details) => {
              setHrAuditLogs(prev => [
                {
                  id: `hr-log-${Date.now()}`,
                  actorName: userName,
                  actorFunction: userRole,
                  action: action,
                  targetName: details,
                  date: new Date().toLocaleDateString("fr-FR"),
                  time: new Date().toLocaleTimeString("fr-FR"),
                  ipAddress: "197.234.221.14",
                  device: "Station Sécurisée RDC"
                },
                ...prev
              ]);
            }}
          />
        );
      case "sa_backup_disaster_recovery":
        if (!isPlatformOwner) {
          return (
            <UnauthorizedOwnerAccessView
              userRole={userRole}
              userName={userName}
              schoolName={activeSchool?.name || schoolName || "Établissement Scolaire"}
              tabAttempted="Centre National de Sauvegarde & Reprise"
              onBack={() => setActiveTab("dashboard")}
            />
          );
        }
        return (
          <NationalBackupDisasterRecoveryModule
            schools={schools}
            students={students}
            teachers={teachers}
            userRole={userRole}
            userName={userName}
          />
        );
      case "sauvegarde_etablissement":
        return (
          <SchoolBackupAndTrashModule
            activeSchool={activeSchool}
            students={students}
            teachers={teachers}
            payments={payments}
            userRole={userRole}
            userName={userName}
          />
        );
      case "cnr_epst":
        return (
          <SmartTemplateEngine
            students={students}
            grades={grades}
            cnrResources={cnrResources}
            onAddResource={handleAddCnrResource}
            onUpdateResource={handleUpdateCnrResource}
            schoolSyncLogs={schoolSyncLogs}
            onSyncResource={handleSyncCnrResource}
            onSyncAll={handleSyncAllCnrResources}
            lang={lang}
          />
        );
      case "iam_national":
      case "comptes_utilisateurs":
      case "gestion_comptes":
      case "sa_users":
        return (
          <NationalUserAccountsIAMModule
            userRole={userRole}
            userName={userName}
            userAccounts={userAccounts}
            schools={schools}
            employees={employees}
            students={students}
            parents={parents}
            onCreateUserAccount={handleCreateGenericUserAccount}
            onUpdateUserAccount={handleUpdateGenericUserAccount}
            onDeleteUserAccount={handleDeleteGenericUserAccount}
            onAuditLog={(action, details) => {
              setHrAuditLogs(prev => [
                {
                  id: `audit-${Date.now()}`,
                  actorName: userName,
                  actorFunction: userRole,
                  action,
                  targetName: details,
                  date: new Date().toLocaleDateString("fr-FR"),
                  time: new Date().toLocaleTimeString("fr-FR"),
                  ipAddress: "197.242.144.12",
                  device: "Station IAM Sécurisée"
                },
                ...prev
              ]);
            }}
            activeSchoolId={activeSchool?.id}
            schoolMotto={schoolMotto}
            schoolLogo={schoolLogoUrl}
            onOpenPortal={handleOpenPortal}
          />
        );
      case "sa_saas_center":
      case "sa_dashboard":
      case "sa_schools":
      case "sa_provinces":
      case "sa_inspections":
      case "sa_years":
      case "sa_roles":
      case "sa_features":
      case "sa_announcements":
      case "sa_ai_assistant":
      case "sa_subscriptions":
      case "sa_payments":
      case "sa_support":
      case "sa_audit":
      case "sa_settings":
        if (!isPlatformOwner) {
          return (
            <UnauthorizedOwnerAccessView
              userRole={userRole}
              userName={userName}
              schoolName={activeSchool?.name || schoolName || "Établissement Scolaire"}
              tabAttempted={activeTab === "sa_saas_center" ? "Centre de Gestion SaaS" : "Administration SaaS"}
              onBack={() => setActiveTab("dashboard")}
            />
          );
        }
        return (
          <SuperAdminPlatform
            schools={schools}
            onUpdateSchool={handleUpdateSchool}
            onAddSchool={handleAddSchool}
            onDeleteSchool={handleDeleteSchool}
            activeTab={activeTab}
            onNavigate={setActiveTab}
            lang={lang}
            userRole={userRole}
            userName={userName}
            drapeauUrl={drapeauUrl}
            onUpdateDrapeauUrl={handleUpdateDrapeauUrl}
            watermarkUrl={watermarkUrl}
            onUpdateWatermarkUrl={handleUpdateWatermarkUrl}
          />
        );
      case "analyste_ia":
        return (
          <AIAnalystModule
            activeSchoolId={activeSchool?.id || "default"}
            schools={schools}
            userRole={userRole}
            userName={userName}
            userEmail={emailOrPhone}
            students={students}
            payments={payments}
            feeTypes={[]}
            classes={classes}
            options={options}
            grades={grades}
            attendances={attendances}
            teachers={teachers}
          />
        );
      case "messagerie":
        return (
          <Messagerie
            userRole={userRole}
            userName={userName}
            schoolId={activeSchoolId}
            employees={employees}
            teachers={teachers}
            students={students}
            parents={parents}
            initialTargetUserId={initialTargetChatUserId}
            onClearInitialTarget={() => setInitialTargetChatUserId(null)}
            onSendMessageNotification={(notif) => {
              setNotifications(prev => [
                {
                  id: `notif-${Date.now()}`,
                  title: "Nouveau Message de Discussion",
                  message: notif.message,
                  time: "À l'instant",
                  isRead: false,
                  type: "info"
                },
                ...prev
              ]);
            }}
          />
        );
      case "promo_video":
        return (
          <PromoVideoStudio
            onNavigateTab={(tabId) => setActiveTab(tabId)}
            userName={userName}
            userRole={userRole}
          />
        );
      case "impression_listes":
      case "exports_officiels":
      case "universal_exports":
        return (
          <UniversalExportCenter
            students={students}
            employees={employees}
            parents={parents}
            payments={payments}
            schoolId={activeSchool?.id || "SCH-KIN-001"}
            schoolName={activeSchool?.name || "COMPLEXE SCOLAIRE SMARTSCHOOL RDC"}
            schoolYear={activeSchool?.schoolYear || "2026-2027"}
            userName={userName}
            userRole={userRole}
          />
        );
      case "audit_systeme":
      case "audit_tests":
        return (
          <AutomatedSystemAuditAndTestCenter
            students={students}
            employees={employees}
            parents={parents}
            payments={payments}
            schoolId={activeSchool?.id || "SCH-KIN-001"}
            schoolName={activeSchool?.name || "COMPLEXE SCOLAIRE SMARTSCHOOL RDC"}
            userName={userName}
            userRole={userRole}
          />
        );
      case "galerie_ecole":
        return (
          <SchoolGalleryModule
            schoolName={activeSchool?.name || "COMPLEXE SCOLAIRE SMARTSCHOOL RDC"}
            schoolLogoUrl={activeSchool?.logoUrl}
            schoolYear={activeSchool?.schoolYear || "2026-2027"}
            userRole={userRole}
            userName={userName}
            onAuditLog={(action, details) => {
              setHrAuditLogs(prev => [
                {
                  id: `audit-${Date.now()}`,
                  actorName: userName,
                  actorFunction: userRole,
                  action,
                  targetName: details,
                  date: new Date().toLocaleDateString("fr-FR"),
                  time: new Date().toLocaleTimeString("fr-FR"),
                  ipAddress: "10.0.4.12",
                  device: "Navigateur Web"
                },
                ...prev
              ]);
            }}
          />
        );
      case "reseau_interscolaire":
        return (
          <InterSchoolNetworkModule
            currentSchoolId={activeSchool?.id || "SCH-KIN-001"}
            currentSchoolName={activeSchool?.name || "COMPLEXE SCOLAIRE SMARTSCHOOL RDC"}
            userRole={userRole}
            userName={userName}
            onAuditLog={(action, details) => {
              setHrAuditLogs(prev => [
                {
                  id: `audit-${Date.now()}`,
                  actorName: userName,
                  actorFunction: userRole,
                  action,
                  targetName: details,
                  date: new Date().toLocaleDateString("fr-FR"),
                  time: new Date().toLocaleTimeString("fr-FR"),
                  ipAddress: "10.0.4.12",
                  device: "Navigateur Web"
                },
                ...prev
              ]);
            }}
          />
        );
      case "culture_patrimoine_rdc":
        return (
          <NationalCultureHeritageModule
            userRole={userRole}
            userName={userName}
            userPortal={isPlatformRole ? "superadmin" : "admin"}
            onAuditLog={(action, details) => {
              setHrAuditLogs(prev => [
                {
                  id: `audit-${Date.now()}`,
                  actorName: userName,
                  actorFunction: userRole,
                  action,
                  targetName: details,
                  date: new Date().toLocaleDateString("fr-FR"),
                  time: new Date().toLocaleTimeString("fr-FR"),
                  ipAddress: "10.0.4.12",
                  device: "Navigateur Web"
                },
                ...prev
              ]);
            }}
          />
        );
      case "promoteur_finance_center":
        return (
          <PromoterFinancialControlCenter
            schoolId={activeSchool?.id || activeSchoolId || "sch-001"}
            schoolName={activeSchool?.name || schoolName || "Complexe Scolaire SmartSchool RDC"}
            userRole={userRole}
            userName={userName}
            payments={payments}
            students={students}
            teachers={teachers}
            onAddPayment={handleAddPayment}
            onUpdatePayment={(upPayment) => {
              setPayments(prev => prev.map(p => p.id === upPayment.id ? upPayment : p));
            }}
            onUpdateTeacher={(upTeacher) => {
              setTeachers(prev => prev.map(t => t.id === upTeacher.id ? upTeacher : t));
            }}
          />
        );
      case "owner_control_center":
        if (!isPlatformOwner) {
          return (
            <UnauthorizedOwnerAccessView
              userRole={userRole}
              userName={userName}
              schoolName={activeSchool?.name || schoolName || "Établissement Scolaire"}
              tabAttempted="Centre de Contrôle du Propriétaire"
              onBack={() => setActiveTab("dashboard")}
            />
          );
        }
        return (
          <OwnerControlCenter
            userRole={userRole}
            userName={userName}
            payments={payments}
            schools={schools}
            userAccounts={userAccounts}
            students={students}
            employees={employees}
            teachers={teachers}
            onAddSchool={(newSchool) => {
              setSchools(prev => {
                if (prev.find(s => s.id === newSchool.id)) return prev;
                return [newSchool, ...prev];
              });
            }}
            onRegisterSchoolAccount={(newAcc) => {
              setUserAccounts(prev => {
                if (prev.find(a => a.id === newAcc.id)) return prev;
                return [newAcc, ...prev];
              });
            }}
            onOpenSchoolPortal={(schoolId, account) => {
              const targetSchool = schools.find(s => s.id === schoolId);
              if (targetSchool) {
                setActiveSchoolId(targetSchool.id);
                setSchoolName(targetSchool.name);
              } else {
                setActiveSchoolId(schoolId);
              }
              if (account) {
                setUserRole(account.role || "Super Administrateur");
                setUserName(account.fullName || account.username);
                setCurrentUserId(account.id);
                setCurrentUserAccount(account);
              }
              setActiveTab("dashboard");
            }}
            onToggleSchoolStatus={(schoolId, isSuspended) => {
              setHrAuditLogs(prev => [
                {
                  id: `audit-${Date.now()}`,
                  actorName: userName,
                  actorFunction: userRole,
                  action: isSuspended ? "Suspension Établissement" : "Réactivation Établissement",
                  targetName: `École ID: ${schoolId}`,
                  date: new Date().toLocaleDateString("fr-FR"),
                  time: new Date().toLocaleTimeString("fr-FR"),
                  ipAddress: "10.0.0.1",
                  device: "Station Propriétaire"
                },
                ...prev
              ]);
            }}
            onUpdateUserAccount={(accountId, updates) => {
              setUserAccounts(prev => prev.map(acc => {
                if (acc.id === accountId) {
                  const updated = { ...acc, ...updates };
                  persistUniversalUserAccount(updated);
                  return updated;
                }
                return acc;
              }));
            }}
            onSendMessageToSchools={(msg) => {
              setNotifications(prev => [
                {
                  id: `bc-notif-${Date.now()}`,
                  title: `[COMMUNIQUÉ PROPRIÉTAIRE] ${msg.subject}`,
                  message: msg.message,
                  date: new Date().toLocaleDateString("fr-FR"),
                  read: false,
                  type: "system",
                  priority: msg.priority === "Urgent" ? "high" : "normal"
                } as any,
                ...prev
              ]);
            }}
            onAuditLog={(action, details) => {
              setHrAuditLogs(prev => [
                {
                  id: `audit-${Date.now()}`,
                  actorName: userName,
                  actorFunction: userRole,
                  action,
                  targetName: details,
                  date: new Date().toLocaleDateString("fr-FR"),
                  time: new Date().toLocaleTimeString("fr-FR"),
                  ipAddress: "10.0.0.1",
                  device: "Station Propriétaire"
                },
                ...prev
              ]);
            }}
          />
        );
      case "manage_schools":
        if (!isPlatformOwner && !isPlatformRole) {
          return (
            <UnauthorizedOwnerAccessView
              userRole={userRole}
              userName={userName}
              schoolName={activeSchool?.name || schoolName || "Établissement Scolaire"}
              tabAttempted="Gérer les écoles"
              onBack={() => setActiveTab("dashboard")}
            />
          );
        }
        return (
          <ManageSchoolsModule
            schools={schools}
            userAccounts={userAccounts}
            currentUserRole={userRole}
            currentUserName={userName}
            onUpdateUserAccount={(accountId, updates) => {
              setUserAccounts(prev => prev.map(acc => {
                if (acc.id === accountId) {
                  const updated = { ...acc, ...updates };
                  persistUniversalUserAccount(updated);
                  return updated;
                }
                return acc;
              }));
            }}
            onSendMessageToSchools={(msg) => {
              setNotifications(prev => [
                {
                  id: `bc-notif-${Date.now()}`,
                  title: `[COMMUNIQUÉ PROPRIÉTAIRE] ${msg.subject}`,
                  message: msg.message,
                  date: new Date().toLocaleDateString("fr-FR"),
                  read: false,
                  type: "system",
                  priority: msg.priority === "Urgent" ? "high" : "normal"
                } as any,
                ...prev
              ]);
            }}
            onAuditLog={(action, details) => {
              setHrAuditLogs(prev => [
                {
                  id: `audit-${Date.now()}`,
                  actorName: userName,
                  actorFunction: userRole,
                  action,
                  targetName: details,
                  date: new Date().toLocaleDateString("fr-FR"),
                  time: new Date().toLocaleTimeString("fr-FR"),
                  ipAddress: "10.0.0.1",
                  device: "Station Propriétaire"
                },
                ...prev
              ]);
            }}
          />
        );
      case "national_jobs":
        return (
          <NationalJobsModule
            schools={schools}
            userName={userName}
            userRole={userRole}
            userEmail={userName ? `${userName.toLowerCase().replace(/\s+/g, ".")}@smartschool.cd` : "utilisateur@smartschool.cd"}
            onSendNotification={(notif) => {
              setNotifications(prev => [
                {
                  id: `notif-${Date.now()}`,
                  title: notif.title,
                  message: notif.message,
                  time: "À l'instant",
                  isRead: false,
                  type: notif.type
                },
                ...prev
              ]);
            }}
          />
        );
      case "presentation_officielle":
        return (
          <div className="space-y-6">
            <SmartSchoolPresentationDocument
              isOpen={true}
              onClose={() => setActiveTab("dashboard")}
            />
          </div>
        );
      case "rh_approbations":
        return (
          <div className="space-y-6" id="approbations-module-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <ShieldCheck className="h-6 w-6 text-indigo-600" />
                  <span>Centre d'Approbations & Dérogations Administratives</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Espace de traitement des demandes exceptionnelles (congés du personnel, avances sur salaires, mutations et dérogations). Les opérations courantes sont exécutées en toute autonomie par chaque portail selon son périmètre.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="font-bold">{pendingApprovals.filter(p => p.status === "pending").length} en attente de décision</span>
              </div>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase">Aucune demande en attente</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tous les portails opèrent en autonomie selon leurs responsabilités fonctionnelles. Aucune dérogation ou demande exceptionnelle n'est en attente d'arbitrage.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map(req => {
                  const isPending = req.status === "pending";
                  const isApproved = req.status === "approved";
                  const isRejected = req.status === "rejected";

                  // Label and Color depending on action type
                  const getActionBadge = (type: string) => {
                    switch (type) {
                      case "student_create": return { label: "Création Élève", color: "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900" };
                      case "student_edit": return { label: "Modification Élève", color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900" };
                      case "student_delete": return { label: "Suppression Élève", color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900" };
                      case "employee_create": return { label: "Création Personnel", color: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900" };
                      case "employee_edit": return { label: "Modification Personnel", color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900" };
                      case "employee_delete": return { label: "Suppression Personnel", color: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" };
                      default: return { label: "Action Générique", color: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-900" };
                    }
                  };

                  const badge = getActionBadge(req.type);

                  return (
                    <div 
                      key={req.id} 
                      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all duration-200 ${
                        isPending 
                          ? "border-slate-200/80 dark:border-slate-800" 
                          : isApproved 
                          ? "border-emerald-100 dark:border-emerald-900/40 opacity-80" 
                          : "border-rose-100 dark:border-rose-900/40 opacity-75"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {req.id}</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 font-mono">
                          Soumis le {req.createdAt}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Requester Info */}
                        <div className="space-y-1 text-xs">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Demandeur</span>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{req.requestedBy}</p>
                          <p className="text-[10px] font-semibold text-slate-500 block">{req.requestedByRole}</p>
                        </div>

                        {/* Target Info */}
                        <div className="space-y-1 text-xs">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Cible de l'action</span>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{req.targetName}</p>
                          {req.targetId && (
                            <p className="text-[9px] text-slate-500 font-mono">ID Système : {req.targetId}</p>
                          )}
                        </div>

                        {/* Action Decision buttons */}
                        <div className="flex items-center md:justify-end gap-2 text-xs">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleRejectRequest(req.id)}
                                className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-100 dark:border-rose-900 cursor-pointer transition-all"
                              >
                                Rejeter
                              </button>
                              <button
                                onClick={() => handleApproveRequest(req.id)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm cursor-pointer transition-all hover:scale-[1.03]"
                              >
                                Approuver
                              </button>
                            </>
                          ) : (
                            <span className={`px-3 py-1 text-[11px] font-black uppercase rounded-lg ${
                              isApproved 
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                            }`}>
                              {isApproved ? "✓ Approuvée" : "✗ Rejetée"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expanded Data Payload Table if it's creation/edit */}
                      {isPending && req.payload && req.type !== "student_delete" && req.type !== "employee_delete" && (
                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-2">Aperçu des données soumises</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-[10px] leading-relaxed">
                            {Object.entries(req.payload).map(([key, value]) => {
                              if (typeof value === "object" || !value) return null;
                              // Beautiful key translations
                              const getFrKey = (k: string) => {
                                switch (k) {
                                  case "firstName": return "Prénom";
                                  case "lastName": return "Nom de famille";
                                  case "birthDate": return "Date Naissance";
                                  case "birthPlace": return "Lieu Naissance";
                                  case "gender": return "Genre";
                                  case "nationality": return "Nationalité";
                                  case "address": return "Adresse";
                                  case "parentName": return "Parent";
                                  case "parentPhone": return "Tél Parent";
                                  case "className": return "Classe";
                                  case "optionName": return "Option";
                                  case "phone": return "Téléphone";
                                  case "email": return "E-mail";
                                  case "function": return "Fonction";
                                  case "department": return "Département";
                                  case "salaryBase": return "Salaire de base";
                                  default: return k;
                                }
                              };
                              return (
                                <div key={key} className="space-y-0.5">
                                  <span className="text-slate-400 font-bold block">{getFrKey(key)}</span>
                                  <span className="font-mono text-slate-700 dark:text-slate-300 block truncate">{String(value)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-slate-500">
            Module non trouvé.
          </div>
        );
    }
  };

  if (successState) {
    const activeTabLabel = sidebarItems
      .flatMap(g => g.items)
      .find(i => i.tab === activeTab)?.label || "Tableau de Bord";

    const getBadgeForTab = (tab: string) => {
      if (tab === "comptabilite") {
        const pending = payments.filter(p => !p.isValidated).length;
        if (pending > 0) return { count: pending, type: "warning" as const };
      }
      if (tab === "rh" || tab === "rh_approbations") {
        const pending = pendingApprovals.filter(p => p.status === "pending").length;
        if (pending > 0) return { count: pending, type: "warning" as const };
      }
      if (tab === "messagerie") {
        return { count: 1, type: "info" as const };
      }
      if (tab === "sms") {
        const unread = notifications.filter(n => !n.isRead).length;
        if (unread > 0) return { count: unread, type: "info" as const };
      }
      if (tab === "cnr_epst") {
        const outdatedCount = schoolSyncLogs.filter(log => log.status === "outdated" || log.status === "not_installed").length;
        if (outdatedCount > 0) return { count: outdatedCount, type: "warning" as const };
      }
      return null;
    };

    return (
      <NavigationProvider activeTab={activeTab} setActiveTab={setActiveTab}>
        {showWelcome3DAnimation && (
          <SchoolWelcome3DAnimation
            schoolName={schoolName || activeSchool?.name || "Établissement Scolaire"}
            userName={userName}
            userRole={userRole}
            schoolLogoUrl={activeSchool?.logoUrl}
            onComplete={() => setShowWelcome3DAnimation(false)}
          />
        )}
        <SmartSchoolAppContent
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          schoolName={schoolName}
          schoolYear={schoolYear}
          sidebarItems={sidebarItems}
          expandedGroups={expandedGroups}
          setExpandedGroups={setExpandedGroups}
          getBadgeForTab={getBadgeForTab}
          userName={userName}
          userRole={userRole}
          resetForm={resetForm}
          activeTabLabel={activeTabLabel}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          isGlobalSearchOpen={isGlobalSearchOpen}
          setIsGlobalSearchOpen={setIsGlobalSearchOpen}
          students={students}
          teachers={teachers}
          visibleNotifications={visibleNotifications}
          isNotifDropdownOpen={isNotifDropdownOpen}
          setIsNotifDropdownOpen={setIsNotifDropdownOpen}
          isPlatformOwner={isPlatformOwner}
          lang={lang}
          setLang={setLang}
          renderTabContent={renderTabContent}
          toast={toast}
          setToast={setToast}
          setShowPresentationModal={setShowPresentationModal}
        />
      </NavigationProvider>
    );
  }

  function SmartSchoolAppContent({
    darkMode,
    setDarkMode,
    mobileMenuOpen,
    setMobileMenuOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    schoolName,
    schoolYear,
    sidebarItems,
    expandedGroups,
    setExpandedGroups,
    getBadgeForTab,
    userName,
    userRole,
    resetForm,
    activeTabLabel,
    globalSearch,
    setGlobalSearch,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    students,
    teachers,
    visibleNotifications,
    isNotifDropdownOpen,
    setIsNotifDropdownOpen,
    isPlatformOwner,
    lang,
    setLang,
    renderTabContent,
    toast,
    setToast,
    setNotifications,
    setShowPresentationModal
  }: any) {
    const { activeTab, navigateTo } = useNavigation();
    const tabMeta = getTabMetadata(activeTab);

    return (
      <div className={`min-h-screen font-sans flex overflow-hidden transition-colors duration-300 ${
        darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}>
        
        {/* MOBILE MENU DRAWERS / SLIDE-IN OVERLAYS */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
              />
              
              {/* Slide-out Sidebar Drawer */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`fixed top-0 bottom-0 left-0 w-72 z-50 flex flex-col border-r h-full overflow-y-auto lg:hidden ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                {/* Drawer Header */}
                <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <SmartSchoolLogo size="sm" withShadow />
                    <div className="min-w-0">
                      <span className="font-bold text-sm bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent block truncate">SmartSchool RDC</span>
                      <span className="text-[8px] font-mono block -mt-0.5 font-bold text-amber-600 dark:text-amber-400 truncate">FRED-TECH • Ir IT Fred Kalonda</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Drawer School Info Block */}
                <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-slate-950 dark:to-slate-950/50 rounded-xl border border-indigo-100/30 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center space-x-2">
                    <School className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{schoolName}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500 font-mono font-semibold">
                    <span>ANNÉE SCOLAIRE :</span>
                    <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-black">
                      {schoolYear}
                    </span>
                  </div>
                </div>

                {/* Drawer Navigation List */}
                <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
                  {sidebarItems.map((group, gIdx) => {
                    const isExpanded = expandedGroups[group.group] !== false;
                    return (
                      <div key={gIdx} className="space-y-1">
                        <button
                          onClick={() => setExpandedGroups(prev => ({ ...prev, [group.group]: !isExpanded }))}
                          className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left"
                        >
                          <span>{group.group}</span>
                          <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                        </button>
                        
                        {isExpanded && (
                          <div className="space-y-0.5 mt-1 pl-1">
                            {group.items.map((item, itemIdx) => {
                              const Icon = item.icon;
                              const isActive = activeTab === item.tab;
                              const badge = getBadgeForTab(item.tab);
                              return (
                                <button
                                  key={`${group.group}-${item.tab}-${itemIdx}`}
                                  onClick={() => {
                                    setActiveTab(item.tab);
                                    setMobileMenuOpen(false);
                                  }}
                                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                                    isActive 
                                      ? "bg-gradient-to-r from-brand-blue/15 to-brand-green/10 text-brand-blue dark:text-blue-400 border-l-4 border-brand-blue pl-2" 
                                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center space-x-3 min-w-0">
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                  </div>
                                  {badge && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                      badge.type === "warning" 
                                        ? "bg-amber-100 text-amber-600" 
                                        : "bg-blue-100 text-blue-600"
                                    }`}>
                                      {badge.count}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Drawer Profile Card */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center font-bold text-brand-blue text-xs shrink-0">
                        {userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{userName}</p>
                        <p className="text-[9px] font-mono font-semibold text-slate-400 uppercase tracking-wider">{userRole}</p>
                      </div>
                    </div>
                    <button 
                      onClick={resetForm}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Se Déconnecter"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* DESKTOP SIDEBAR PANEL */}
        <aside className={`hidden lg:flex lg:flex-col shrink-0 border-r transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-72"
        } ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          {/* Sidebar Header */}
          <div className="p-4.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0 min-h-[64px]">
            {sidebarCollapsed ? (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="mx-auto flex items-center justify-center cursor-pointer hover:scale-105 transition-all p-1"
                title="Développer le menu"
              >
                <SmartSchoolLogo size="sm" withShadow />
              </button>
            ) : (
              <>
                <div className="flex items-center space-x-2.5 min-w-0">
                  <SmartSchoolLogo size="sm" withShadow />
                  <div className="min-w-0">
                    <span className="font-black text-xs tracking-tight bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent block truncate">SmartSchool RDC</span>
                    <span className="text-[8px] font-mono block -mt-0.5 font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate">FRED-TECH • Ir IT Fred Kalonda</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer shrink-0"
                  title="Réduire le menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Sidebar Navigation Scroll Area */}
          {sidebarCollapsed ? (
            <div className="flex-1 px-2 py-6 space-y-4 overflow-y-auto flex flex-col items-center">
              {sidebarItems.flatMap((g, gIdx) => g.items.map((it, itIdx) => ({ ...it, _uniqueKey: `${g.group}-${it.tab}-${gIdx}-${itIdx}` }))).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                const badge = getBadgeForTab(item.tab);
                return (
                  <button
                    key={item._uniqueKey}
                    onClick={() => setActiveTab(item.tab)}
                    className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? "bg-gradient-to-tr from-brand-blue to-brand-blue/80 text-white shadow-sm scale-105" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                    {badge && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-brand-green rounded-full border border-white dark:border-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
              {sidebarItems.map((group, gIdx) => {
                const isExpanded = expandedGroups[group.group] !== false;
                return (
                  <div key={gIdx} className="space-y-1">
                    <button
                      onClick={() => setExpandedGroups(prev => ({ ...prev, [group.group]: !isExpanded }))}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer text-left"
                    >
                      <span>{group.group}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`} />
                    </button>
                    
                    {isExpanded && (
                      <div className="space-y-0.5 mt-1 pl-1">
                        {group.items.map((item, itemIdx) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.tab;
                          const badge = getBadgeForTab(item.tab);
                          return (
                            <button
                              key={`${group.group}-${item.tab}-${itemIdx}`}
                              onClick={() => setActiveTab(item.tab)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                                isActive 
                                  ? "bg-gradient-to-r from-brand-blue/15 to-brand-green/10 text-brand-blue dark:text-blue-400 border-l-4 border-brand-blue pl-2" 
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <Icon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              
                              {badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                  badge.type === "warning" 
                                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400" 
                                    : "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                                }`}>
                                  {badge.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Desktop Sidebar Profile Card */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-green flex items-center justify-center font-bold text-white text-xs shadow-sm" title={`${userName} (${userRole})`}>
                  {userName.slice(0, 2).toUpperCase()}
                </div>
                <button 
                  onClick={resetForm}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  title="Se Déconnecter"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Connected School & Active School Year */}
                <div className="p-3 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-slate-950 dark:to-slate-950/50 rounded-xl border border-indigo-100/30 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center space-x-2">
                    <School className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate" title={schoolName}>{schoolName}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-500 font-mono font-bold">
                    <span>ANNÉE SCOLAIRE :</span>
                    <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-black">
                      {schoolYear}
                    </span>
                  </div>
                </div>

                {/* Profile Information Block */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-green flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0">
                      {userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{userName}</p>
                      <p className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate" title={userRole}>{userRole}</p>
                    </div>
                  </div>
                  <button 
                    onClick={resetForm}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Se Déconnecter"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT CONTENT PANEL (HEADER + MAIN CONTAINER) */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Header Panel */}
          <header className={`h-16 px-6 flex items-center justify-between border-b shrink-0 z-10 ${
            darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center space-x-3 min-w-0">
              {/* Mobile Sidebar Trigger */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Breadcrumbs or active panel name */}
              <div className="min-w-0 shrink-0 flex items-center space-x-2.5">
                <SmartSchoolLogo size="xs" withShadow />
                <div className="min-w-0">
                  <h1 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate flex items-center space-x-2">
                    <span className="bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-slate-200/50 dark:border-slate-800 uppercase tracking-wider text-indigo-500">
                      RDC
                    </span>
                    <span>{activeTabLabel}</span>
                  </h1>
                  <p className="hidden md:block text-[10px] text-slate-400 truncate mt-0.5 font-medium">{schoolName}</p>
                </div>
              </div>
            </div>

            {/* MICROSOFT 365 COMMAND SEARCH BAR */}
            <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans SmartSchool (Élèves, Enseignants, Caisse)..."
                  value={globalSearch}
                  onChange={e => {
                    setGlobalSearch(e.target.value);
                    setIsGlobalSearchOpen(true);
                  }}
                  onFocus={() => setIsGlobalSearchOpen(true)}
                  className="w-full pl-9 pr-12 py-1.5 text-xs rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700/80 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  <span>Ctrl</span><span>K</span>
                </div>
              </div>

              {/* LIVE COMMAND SEARCH RESULTS DROPDOWN */}
              <AnimatePresence>
                {isGlobalSearchOpen && globalSearch.trim().length > 0 && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsGlobalSearchOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden text-xs max-h-80 overflow-y-auto p-2 space-y-2"
                    >
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                        <span>Résultats de recherche</span>
                        <span className="font-mono text-brand-blue">SmartSchool Engine</span>
                      </div>

                      {/* Matching Students */}
                      {students.filter(s => `${s.firstName} ${s.lastName} ${s.registrationNumber}`.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 3).map(st => (
                        <div
                          key={st.id}
                          onClick={() => {
                            setActiveTab("eleves");
                            setIsGlobalSearchOpen(false);
                            setGlobalSearch("");
                          }}
                          className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <GraduationCap className="h-4 w-4 text-brand-blue shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100">{st.firstName} {st.lastName}</p>
                              <p className="text-[10px] text-slate-400">{st.className} • Mat: {st.registrationNumber}</p>
                            </div>
                          </div>
                          <span className="text-[9px] bg-blue-50 dark:bg-blue-950 text-brand-blue font-bold px-2 py-0.5 rounded-md">Élève</span>
                        </div>
                      ))}

                      {/* Matching Teachers */}
                      {teachers.filter(t => `${t.firstName} ${t.lastName} ${(t as any).matricule || ''}`.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 3).map(tc => (
                        <div
                          key={tc.id}
                          onClick={() => {
                            setActiveTab("enseignants");
                            setIsGlobalSearchOpen(false);
                            setGlobalSearch("");
                          }}
                          className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100">{tc.firstName} {tc.lastName}</p>
                              <p className="text-[10px] text-slate-400">{(tc as any).title || (tc as any).mainSubject || "Enseignant"} • Mat: {(tc as any).matricule || tc.id}</p>
                            </div>
                          </div>
                          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold px-2 py-0.5 rounded-md">Enseignant</span>
                        </div>
                      ))}

                      {/* Navigation Shortcut Match */}
                      {["bulletins", "comptabilite", "cotes", "presences", "rh", "rapports", "horaires"].filter(tabKey => tabKey.includes(globalSearch.toLowerCase())).map(tabKey => (
                        <div
                          key={tabKey}
                          onClick={() => {
                            setActiveTab(tabKey);
                            setIsGlobalSearchOpen(false);
                            setGlobalSearch("");
                          }}
                          className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100 capitalize">Module {tabKey}</p>
                              <p className="text-[10px] text-slate-400">Accès rapide vers l'espace {tabKey}</p>
                            </div>
                          </div>
                          <span className="text-[9px] bg-amber-50 dark:bg-amber-950 text-amber-600 font-bold px-2 py-0.5 rounded-md">Module</span>
                        </div>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick action shortcuts */}
            <div className="flex items-center space-x-3.5">
              
              <button
                onClick={() => setActiveTab("promo_video")}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-sm transition-transform hover:scale-105 cursor-pointer"
                title="Regarder la Vidéo Publicitaire Officielle"
              >
                <Tv className="h-3.5 w-3.5" />
                <span>Vidéo Pub 2026</span>
              </button>

              {/* Notifications shortcut & Popover */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                  className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200/40 dark:border-slate-700/40 cursor-pointer"
                  title="Avis & Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {visibleNotifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-indigo-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-2xs">
                      {visibleNotifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsNotifDropdownOpen(false)} 
                      />

                      {/* Animated Popover */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-xs"
                      >
                        {/* Header */}
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 dark:text-white text-xs">Notifications System</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                              {visibleNotifications.filter(n => !n.isRead).length} non lue(s)
                            </span>
                          </div>
                          {visibleNotifications.some(n => !n.isRead) && (
                            <button
                              type="button"
                              onClick={() => {
                                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                              }}
                              className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              Tout marquer lu
                            </button>
                          )}
                        </div>

                        {/* Quick list */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                          {visibleNotifications.length > 0 ? (
                            visibleNotifications.slice(0, 5).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                                }}
                                className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                  !n.isRead ? "bg-indigo-50/60 dark:bg-indigo-950/40" : ""
                                }`}
                              >
                                <div className="shrink-0 mt-0.5 relative">
                                  <div className={`p-1.5 rounded-lg ${
                                    n.type === "success" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600" :
                                    n.type === "warning" ? "bg-amber-100 dark:bg-amber-950 text-amber-600" : "bg-indigo-100 dark:bg-indigo-950 text-indigo-600"
                                  }`}>
                                    <Bell className="h-3.5 w-3.5" />
                                  </div>
                                  {!n.isRead && (
                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900"></span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className={`text-slate-900 dark:text-white truncate ${!n.isRead ? "font-extrabold" : "font-medium"}`}>
                                      {n.title}
                                    </p>
                                    <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                    {n.message}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center text-slate-400 text-xs">
                              Aucune notification récente.
                            </div>
                          )}
                        </div>

                        {/* Footer link */}
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("sms");
                              setIsNotifDropdownOpen(false);
                            }}
                            className="text-[11px] font-extrabold text-brand-blue hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer w-full"
                          >
                            Voir toutes les alertes & le journal SMS →
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Presentation & Official Document Modal Trigger */}
              <button
                onClick={() => setShowPresentationModal(true)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 transition-all cursor-pointer shadow-xs"
                title="Consulter et exporter la plaquette de présentation officielle (PDF / PPTX)"
              >
                <Presentation className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden md:inline">Dossier Officiel</span>
                <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-black">PDF / PPTX</span>
              </button>

              {/* Exclusive Platform Owner Header Badge */}
              {isPlatformOwner && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900/90 text-amber-300 border border-purple-500/40 shadow-xs">
                  <Crown className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
                  <span className="hidden sm:inline">Espace Propriétaire RDC</span>
                </div>
              )}

              {/* Language Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/40 dark:border-slate-700/40">
                {(["fr", "ln", "sw"] as const).map((langId) => (
                  <button
                    key={langId}
                    onClick={() => setLang(langId)}
                    className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      lang === langId 
                        ? "bg-white dark:bg-slate-700 text-brand-blue dark:text-white shadow-xs" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {langId.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Theme switcher */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200/40 dark:border-slate-700/40 cursor-pointer"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Logout button */}
              <button
                onClick={resetForm}
                className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all cursor-pointer border border-red-200/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </header>

          {/* Core Content View Area */}
          <main className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between">
            <div className="w-full max-w-7xl mx-auto">
              <PageHeaderNavigation
                title={tabMeta.title}
                subtitle={tabMeta.subtitle}
                category={tabMeta.category}
              />
              <ErrorBoundary fallbackTitle={`Module ${activeTab} - Protégé par Bouclier Anti-Crash`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </ErrorBoundary>
            </div>

            {/* Microsoft 365 SaaS Institutional Footer */}
            <footer className="w-full max-w-7xl mx-auto mt-12 pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 pb-2">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-slate-800 dark:text-slate-200">SmartSchool RDC</span>
                <span>—</span>
                <span className="italic text-slate-500">“Le système intelligent de gestion scolaire nouvelle génération.”</span>
              </div>
              <div className="font-semibold text-[11px] text-slate-500">
                Signature Produit : <strong className="text-brand-blue dark:text-blue-400 font-black">FREDTECH par Freddy kalonda</strong>
              </div>
            </footer>
          </main>
        </div>

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 max-w-sm"
            >
              <div className={`p-4 rounded-2xl shadow-2xl border flex items-start space-x-3 backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-emerald-500/90 text-white border-emerald-400"
                  : toast.type === "warning"
                  ? "bg-amber-500/90 text-white border-amber-400"
                  : "bg-indigo-600/95 text-white border-indigo-500"
              }`}>
                <div className="shrink-0 mt-0.5">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold uppercase tracking-wider text-[10px] opacity-90">Notification Système</p>
                  <p className="mt-1 font-semibold leading-relaxed">{toast.message}</p>
                </div>
                <button onClick={() => setToast(null)} className="shrink-0 p-0.5 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col justify-between ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* BACKGROUND GRAPHICAL ACCENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${
          darkMode ? "bg-blue-900" : "bg-blue-300"
        }`} />
        <div className={`absolute bottom-10 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${
          darkMode ? "bg-emerald-900" : "bg-emerald-300"
        }`} />
        {/* Abstract pattern grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* TOP CONTROL NAVIGATION */}
      <header className="relative w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <SmartSchoolLogo size="lg" showLabel showSubtitle subtitle="FRED-TECH • SYSTÈME OFFICIEL RDC" withShadow />
        </div>

        {/* CONTROLS (Presentation, Lang & Theme) */}
        <div className="flex items-center space-x-3">
          {/* Public Official Presentation Button */}
          <button
            onClick={() => setShowPresentationModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900/80 border border-amber-300 dark:border-amber-700/60 transition-all cursor-pointer shadow-xs"
            title="Consulter et télécharger la plaquette de présentation officielle"
          >
            <Presentation className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Plaquette & Dossier Officiel</span>
            <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black">PDF / PPTX</span>
          </button>

          {/* Language Selector */}
          <div className="flex bg-slate-200/80 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-300/40 dark:border-slate-700/40">
            {(["fr", "ln", "sw"] as const).map((langId) => (
              <button
                key={langId}
                onClick={() => setLang(langId)}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  lang === langId 
                    ? "bg-white dark:bg-slate-700 text-brand-blue dark:text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {langId.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-all border border-slate-300/40 dark:border-slate-700/40 cursor-pointer"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* MAIN SCREEN GRID */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-8 md:py-12 z-10 w-full max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* LEFT COLUMN: DESKTOP BRAND PRESENTATION & STATISTICS */}
          <div className="hidden lg:flex lg:col-span-6 flex-col space-y-6 text-left">
            
            {/* 3D HD CAMPUS HERO VISUAL */}
            <School3DLandingHero schoolName={activeSchool?.name || schoolName} />

            <div className="space-y-4">
              <span className="bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-300 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider border border-brand-blue/20 inline-block">
                {t.badgeSovereignty}
              </span>
              <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {t.slogan}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-md">
                La plateforme de référence conçue pour moderniser, sécuriser et unifier la gestion administrative, pédagogique et financière des écoles congolaises.
              </p>
            </div>

            {/* Showcase feature lists */}
            <div className="space-y-4 pt-4 max-w-lg">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.whyTitle}</h3>
              
              <div className="grid grid-cols-1 gap-3.5">
                <div className="flex items-start space-x-3.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-brand-blue dark:text-blue-300 rounded-lg shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.why1}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Données hébergées avec isolation multi-tenant logique pour chaque école congolaise.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-brand-green dark:text-emerald-300 rounded-lg shrink-0">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.why2}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Saisie des notes et des appels même sans réseau avec synchronisation automatique.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 rounded-lg shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.why3}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Paiements d'écolage directs par M-Pesa, Orange Money et Airtel Money.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Engineer bio tag */}
            <div className="flex items-center space-x-3 pt-6 border-t border-slate-200 dark:border-slate-800 max-w-md">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-blue to-brand-green flex items-center justify-center font-bold text-white text-sm shadow-md">
                FK
              </div>
              <div>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Architecte Logiciel</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.developedBy}</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LOGIN FORM CARD */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto flex flex-col items-center">
            
            {/* Mobile-only branding banner */}
            <div className="text-center lg:hidden mb-6 space-y-4 w-full">
              <School3DLandingHero schoolName={activeSchool?.name || schoolName} className="mb-2" />
              <div>
                <span className="bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-300 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-brand-blue/20 inline-block mb-2">
                  {t.badgeSovereignty}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.slogan}</h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.developedBy}</p>
              </div>
            </div>

            {/* Outer card with border glow */}
            <div className={`relative w-full rounded-2xl transition-all duration-300 shadow-2xl overflow-hidden p-6 md:p-8 border ${
              darkMode 
                ? "bg-slate-900/90 border-slate-800 backdrop-blur-xl" 
                : "bg-white/95 border-slate-200/80 backdrop-blur-xl"
            }`}>
              
              {/* BRAND COLOR DECORATION BAR */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-brand-green to-brand-blue" />

              {/* SUCCESS SIMULATION STATE */}
              <AnimatePresence mode="wait">
                {successState ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-8 flex flex-col items-center"
                    id="success-login-container"
                  >
                    <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/80 text-brand-green rounded-full flex items-center justify-center shadow-lg shadow-brand-green/15 mb-6 animate-bounce">
                      <Check className="h-8 w-8 stroke-[3]" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Bienvenue sur SmartSchool RDC
                    </h3>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-8">
                      {t.successMsg}
                    </p>

                    {/* Simulating some mock student database metrics that would load */}
                    <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-left space-y-3 mb-8">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Utilisateur</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{emailOrPhone}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Statut Session</span>
                        <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1.5">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                          <span>Session Active</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Autorisé par</span>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Fred-Technique</span>
                      </div>
                    </div>

                    <button
                      onClick={resetForm}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-sm"
                    >
                      Se déconnecter (Démo)
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={landingChoice}
                  >
                    {landingChoice === "create_establishment" && (
                      <FirstUseWizard
                        darkMode={darkMode}
                        onCancel={() => setLandingChoice("login")}
                        onComplete={handleFirstUseOnboardingComplete}
                      />
                    )}

                    {landingChoice === "activate_account" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                              <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                              <span>Activation de Compte</span>
                            </h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Assistant de première connexion SmartSchool RDC.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setLandingChoice("login");
                              setActivationStep(1);
                              setActivationMatricule("");
                              setActivationCodeInput("");
                              setActivatedDossier(null);
                              setActivatedDossierType(null);
                              setActivationUsername("");
                              setActivationPassword("");
                              setActivationConfirmPassword("");
                              setActivationError(null);
                            }}
                            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center space-x-1 cursor-pointer"
                          >
                            <ArrowLeft className="h-3 w-3" />
                            <span>Retour à la connexion</span>
                          </button>
                        </div>

                        {/* STEP INDICATOR */}
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                          <span className={activationStep === 1 ? "text-emerald-600 dark:text-emerald-400 font-black" : ""}>1. Clés d'accès</span>
                          <span>→</span>
                          <span className={activationStep === 2 ? "text-emerald-600 dark:text-emerald-400 font-black" : ""}>2. Fiche</span>
                          <span>→</span>
                          <span className={activationStep === 3 ? "text-emerald-600 dark:text-emerald-400 font-black" : ""}>3. Identifiants</span>
                        </div>

                        {activationError && (
                          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">{activationError}</p>
                          </div>
                        )}

                        {/* STEP 1: ENTER MATRICULE AND ACTIVATION CODE */}
                        {activationStep === 1 && (
                          <div className="space-y-4 text-xs">
                            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
                              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="font-black text-[11px] uppercase tracking-wider">Portail d'activation universel</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                Saisissez votre **Matricule ou Identifiant** ainsi que votre **Code d'activation unique** figurant sur votre Fiche Officielle de Connexion.
                              </p>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
                                  Matricule / Identifiant de dossier
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Ex: PAR-TSHIBANDA-7938 ou PERS-2024-0012"
                                    value={activationMatricule}
                                    onChange={(e) => {
                                      setActivationMatricule(e.target.value);
                                      if (activationError) setActivationError(null);
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                  />
                                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-1.5 text-[9px] text-slate-400">
                                  <span>Exemples :</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivationMatricule("PAR-TSHIBANDA-7938");
                                      setActivationCodeInput("PARENT-2648-8641");
                                      setActivationError(null);
                                    }}
                                    className="text-emerald-600 hover:underline font-semibold cursor-pointer"
                                  >
                                    Parent (PAR-TSHIBANDA-7938)
                                  </button>
                                  <span>•</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivationMatricule("PERS-2024-0012");
                                      setActivationCodeInput("ACT-PERS-ASTRID");
                                      setActivationError(null);
                                    }}
                                    className="text-emerald-600 hover:underline font-semibold cursor-pointer"
                                  >
                                    Personnel (PERS-2024-0012)
                                  </button>
                                  <span>•</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivationMatricule("RDC-100001");
                                      setActivationCodeInput("ACT-ELV-GASTON");
                                      setActivationError(null);
                                    }}
                                    className="text-emerald-600 hover:underline font-semibold cursor-pointer"
                                  >
                                    Élève (RDC-100001)
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
                                  Code d'activation unique
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Ex: PARENT-2648-8641 ou ACT-PERS-ASTRID"
                                    value={activationCodeInput}
                                    onChange={(e) => {
                                      setActivationCodeInput(e.target.value);
                                      if (activationError) setActivationError(null);
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-xs font-mono font-bold tracking-wider text-slate-800 dark:text-white uppercase focus:outline-none focus:border-emerald-500 transition-colors"
                                  />
                                  <Sparkles className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setActivationError(null);
                                if (!activationMatricule.trim() || !activationCodeInput.trim()) {
                                  setActivationError("Veuillez renseigner à la fois votre matricule et votre code d'activation.");
                                  return;
                                }

                                const verifyResult = verifyUniversalIdentity({
                                  matriculeOrId: activationMatricule,
                                  activationCode: activationCodeInput,
                                  schoolId: activeSchoolId,
                                  userAccounts,
                                  students,
                                  employees,
                                  parents,
                                  teachers
                                });

                                if (verifyResult.found) {
                                  setUniversalVerification(verifyResult);
                                  setActivatedDossier(verifyResult.dossier);
                                  setActivatedDossierType(verifyResult.dossierType as any);
                                  setActivationUsername(verifyResult.userAccount?.username || verifyResult.matricule || "");
                                  setActivationStep(2);
                                } else {
                                  setActivationError(verifyResult.error || "Aucun dossier correspondant trouvé avec ce matricule et ce code d'activation.");
                                }
                              }}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center space-x-2"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              <span>Vérifier mon identité</span>
                            </button>
                          </div>
                        )}

                        {/* STEP 2: VERIFY AND CONFIRM DOSSIER DETAILS */}
                        {activationStep === 2 && universalVerification && (
                          <div className="space-y-4 text-xs">
                            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <p className="text-[11px] font-semibold">
                                Dossier identifié avec succès. Veuillez confirmer vos informations officielles :
                              </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                              <div className="flex gap-3 items-center">
                                <img
                                  src={universalVerification.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                                  alt="Photo de profil"
                                  className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-500/50 shrink-0"
                                />
                                <div>
                                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                    {universalVerification.fullName}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                      {universalVerification.role}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {universalVerification.matricule}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 grid grid-cols-2 gap-2 text-[10px]">
                                {universalVerification.details.map((field, idx) => (
                                  <div key={idx} className={idx === 0 ? "col-span-2" : ""}>
                                    <span className="text-slate-400 block font-bold text-[8px] uppercase tracking-wider">{field.label}</span>
                                    <strong className="text-slate-700 dark:text-slate-200">{field.value}</strong>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setActivationStep(1)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                              >
                                Retour
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!activationUsername) {
                                    setActivationUsername(universalVerification.userAccount?.username || universalVerification.matricule);
                                  }
                                  setActivationStep(3);
                                }}
                                className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                              >
                                C'est bien moi !
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: CONFIGURE LOGIN USERNAME, PASSWORD & SECURITY */}
                        {activationStep === 3 && universalVerification && (
                          <div className="space-y-4 text-xs">
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Définissez vos identifiants définitifs et vos questions de sécurité pour accéder directement à votre <strong>{universalVerification.portalConfig.portalName}</strong> :
                            </p>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
                                  Identifiant de connexion (Matricule, Email ou Téléphone)
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Ex: astrid.mutombo@smartschool.cd ou PAR-TSHIBANDA-7938"
                                    value={activationUsername}
                                    onChange={(e) => setActivationUsername(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                  />
                                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
                                    Nouveau Mot de passe
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="password"
                                      placeholder="Min. 6 car."
                                      value={activationPassword}
                                      onChange={(e) => setActivationPassword(e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
                                    Confirmer Mot de passe
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="password"
                                      placeholder="Confirmer"
                                      value={activationConfirmPassword}
                                      onChange={(e) => setActivationConfirmPassword(e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                  </div>
                                </div>
                              </div>

                              {/* SECURITY QUESTION */}
                              <div>
                                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
                                  Question secrète de récupération
                                </label>
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                                    {activationSecurityQuestions[0]?.question}
                                  </p>
                                  <input
                                    type="text"
                                    placeholder="Votre réponse secrète"
                                    value={activationSecurityQuestions[0]?.answer || ""}
                                    onChange={(e) => {
                                      const ans = e.target.value;
                                      setActivationSecurityQuestions(prev => [
                                        { ...prev[0], answer: ans },
                                        prev[1],
                                        prev[2]
                                      ]);
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setActivationStep(2)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                              >
                                Retour
                              </button>
                              <button
                                type="button"
                                disabled={isActivatingAccount}
                                onClick={async () => {
                                  setActivationError(null);
                                  if (!activationUsername.trim() || !activationPassword.trim() || !activationConfirmPassword.trim()) {
                                    setActivationError("Veuillez renseigner tous les champs obligatoires.");
                                    return;
                                  }

                                  if (activationPassword.length < 6) {
                                    setActivationError("Le mot de passe doit comporter au moins 6 caractères.");
                                    return;
                                  }

                                  if (activationPassword !== activationConfirmPassword) {
                                    setActivationError("Les deux mots de passe ne correspondent pas.");
                                    return;
                                  }

                                  setIsActivatingAccount(true);
                                  try {
                                    const activationResult = await finalizeUniversalAccountActivation({
                                      verifiedResult: universalVerification,
                                      newUsername: activationUsername.trim(),
                                      newPassword: activationPassword,
                                      securityQuestions: activationSecurityQuestions,
                                      recoveryPhone: activationRecoveryPhone,
                                      recoveryEmail: activationRecoveryEmail
                                    });

                                    if (!activationResult.success) {
                                      setActivationError(activationResult.error || "Erreur lors de l'activation du compte.");
                                      setIsActivatingAccount(false);
                                      return;
                                    }

                                    const activatedAcc = activationResult.userAccount;

                                    // Update state arrays
                                    setUserAccounts(prev => {
                                      const idx = prev.findIndex(a => a.id === activatedAcc.id || a.username === activatedAcc.username);
                                      if (idx >= 0) return prev.map((a, i) => i === idx ? activatedAcc : a);
                                      return [activatedAcc, ...prev];
                                    });

                                    // Synchronize parents list if parent
                                    if (universalVerification.dossierType === "parent") {
                                      setParents(prev => prev.map(p => {
                                        if (p.id === universalVerification.dossier?.id || p.parentAccountNumber === universalVerification.matricule) {
                                          return {
                                            ...p,
                                            accountStatus: "active",
                                            hasUserAccount: true,
                                            userAccountId: activatedAcc.id,
                                            userAccountRole: "Parent",
                                            portalAccess: true
                                          };
                                        }
                                        return p;
                                      }));
                                    } else if (universalVerification.dossierType === "eleve") {
                                      setStudents(prev => prev.map(s => {
                                        if (s.id === universalVerification.dossier?.id || s.registrationNumber === universalVerification.matricule) {
                                          return {
                                            ...s,
                                            accountStatus: "active",
                                            hasUserAccount: true,
                                            userAccountId: activatedAcc.id,
                                            userAccountRole: "Élève"
                                          };
                                        }
                                        return s;
                                      }));
                                    } else if (universalVerification.dossierType === "personnel") {
                                      setEmployees(prev => prev.map(e => {
                                        if (e.id === universalVerification.dossier?.id || e.matricule === universalVerification.matricule) {
                                          return {
                                            ...e,
                                            accountStatus: "active",
                                            hasUserAccount: true,
                                            userAccountId: activatedAcc.id,
                                            userAccountRole: activatedAcc.role
                                          };
                                        }
                                        return e;
                                      }));
                                    }

                                    // Record Audit Logs
                                    const today = new Date();
                                    const formattedDate = today.toLocaleDateString("fr-FR");
                                    const formattedTime = today.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
                                    const simulatedIp = `197.242.${Math.floor(100 + Math.random() * 155)}.${Math.floor(10 + Math.random() * 230)}`;
                                    const currentDevice = getDeviceString();

                                    const newLog: InscriptionAuditLog = {
                                      id: `audit-${Date.now()}`,
                                      studentName: universalVerification.fullName,
                                      actorName: universalVerification.fullName,
                                      actorRole: activatedAcc.role,
                                      date: formattedDate,
                                      time: formattedTime,
                                      ipAddress: simulatedIp,
                                      device: currentDevice,
                                      action: `Activation Universelle Compte (${activatedAcc.role})`
                                    };
                                    setInscriptionAuditLogs(prev => [newLog, ...prev]);

                                    const newHrLog: HrAuditLog = {
                                      id: `hrlog-${Date.now()}`,
                                      actorName: universalVerification.fullName,
                                      actorFunction: activatedAcc.role,
                                      action: `Première connexion - Activation réussie du portail ${activationResult.portalConfig.portalName} via matricule ${universalVerification.matricule}`,
                                      targetName: universalVerification.fullName,
                                      date: formattedDate,
                                      time: formattedTime,
                                      ipAddress: simulatedIp,
                                      device: currentDevice
                                    };
                                    setHrAuditLogs(prev => [newHrLog, ...prev]);

                                    // Direct Portal Access
                                    setUserName(activatedAcc.fullName || activatedAcc.username);
                                    setUserRole(activatedAcc.role);
                                    setEmailOrPhone(activatedAcc.username);
                                    if (activatedAcc.schoolId) setActiveSchoolId(activatedAcc.schoolId);
                                    setSuccessState(true);
                                    setShowWelcome3DAnimation(true);
                                    setActiveTab(activationResult.targetTab || "dashboard");
                                    setToast({
                                      message: `Bienvenue sur votre ${activationResult.portalConfig.portalName} !`,
                                      type: "success"
                                    });
                                  } catch (err: any) {
                                    setActivationError(err?.message || "Une erreur est survenue lors de la finalisation de l'activation.");
                                  } finally {
                                    setIsActivatingAccount(false);
                                  }
                                }}
                                className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center space-x-2"
                              >
                                {isActivatingAccount ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )}
                                <span>Finaliser & Ouvrir le Portail</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {landingChoice === "login" && (
                      <div className="space-y-4" id="central-login-card">
                        {/* 1. ANIMATION DES ÉLÈVES CONGOLAIS EN TRAIN D'ÉTUDIER */}
                        <CongoleseStudentsStudyAnimation className="w-full shadow-xs" />

                        {/* 2. LOGO OFFICIEL SMARTSCHOOL RDC & EN-TÊTE MODERNE */}
                        <div className="text-center flex flex-col items-center pt-1 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                          {/* Official Logo Container with Elegant Gold & Royal Blue Ring */}
                          <div className="relative group mb-2.5">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400/50 via-blue-600/30 to-amber-500/50 blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
                            <SmartSchoolLogo
                              size="2xl"
                              withRing
                              withShadow
                              alt="Logo Officiel SmartSchool RDC — FRED-TECH"
                              className="relative"
                            />
                          </div>

                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            SMARTSCHOOL RDC
                          </h2>

                          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                            <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/50 uppercase tracking-wider">
                              FRED-TECH
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/50 uppercase tracking-wider">
                              Gérer • Enseigner • Apprendre
                            </span>
                          </div>

                          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mt-2.5 flex items-center justify-center gap-1.5">
                            <span>Connectez-vous à votre espace</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Porte d'entrée centrale unique — Accès automatique selon vos droits
                          </p>
                        </div>

                        {/* ERROR MESSAGES */}
                        {errorMessage && (
                          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 flex items-start space-x-2.5">
                            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-red-800 dark:text-red-300">Erreur d'authentification</p>
                              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{errorMessage}</p>
                            </div>
                          </div>
                        )}

                        {/* SUBMIT LOADER SEQUENCE */}
                        {isSubmitting ? (
                          <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-full border-4 border-slate-100 dark:border-slate-800 animate-pulse"></div>
                              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-brand-blue border-r-indigo-600 border-b-brand-green animate-spin"></div>
                            </div>
                            <div className="text-center space-y-1">
                              <p className="text-sm font-bold text-slate-800 dark:text-white">Authentification en cours...</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 animate-pulse">
                                {submitStep === 1 && "Vérification des certificats et sécurité..."}
                                {submitStep === 2 && "Détermination automatique du rôle et de l'établissement..."}
                                {submitStep === 3 && "Ouverture sécurisée de votre portail dédié..."}
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* UNIFIED LOGIN FORM */
                          <form onSubmit={handleLoginSubmit} className="space-y-4" id="central-unified-login-form">
                            
                            {/* IDENTIFIER INPUT */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block" htmlFor="email">
                                Identifiant ou adresse e-mail
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                  <Mail className="h-4.5 w-4.5" />
                                </div>
                                <input
                                  type="text"
                                  id="email"
                                  required
                                  value={emailOrPhone}
                                  onChange={(e) => setEmailOrPhone(e.target.value)}
                                  placeholder="ex. email@domaine.cd, matricule, code d'accès..."
                                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium ${
                                    darkMode 
                                      ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-blue" 
                                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-blue"
                                  }`}
                                />
                              </div>
                            </div>

                            {/* PASSWORD INPUT */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block" htmlFor="password">
                                  Mot de passe
                                </label>
                                
                                <button
                                  type="button"
                                  onClick={() => setShowForgotPassword(true)}
                                  className="text-xs font-semibold text-brand-blue dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                  Mot de passe oublié ?
                                </button>
                              </div>
                              
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                  <Lock className="h-4.5 w-4.5" />
                                </div>
                                <input
                                  type={showPassword ? "text" : "password"}
                                  id="password"
                                  required
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="••••••••••••"
                                  className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium ${
                                    darkMode 
                                      ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-blue" 
                                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-blue"
                                  }`}
                                />
                                
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                                >
                                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                                </button>
                              </div>
                            </div>

                            {/* REMEMBER ME CHECKBOX & HELP */}
                            <div className="flex items-center justify-between pt-1">
                              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="sr-only"
                                  />
                                  <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                                    rememberMe 
                                      ? "bg-brand-blue border-brand-blue text-white" 
                                      : "border-slate-300 dark:border-slate-700 bg-transparent"
                                  }`}>
                                    {rememberMe && <Check className="h-3 w-3 stroke-[3]" />}
                                  </div>
                                </div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                  Se souvenir de moi
                                </span>
                              </label>

                              <button
                                type="button"
                                onClick={() => setShowHelpModal(true)}
                                className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 flex items-center space-x-1 cursor-pointer font-medium"
                              >
                                <HelpCircle className="h-3.5 w-3.5" />
                                <span>Besoin d'aide ?</span>
                              </button>
                            </div>

                            {/* PRIMARY SUBMIT BUTTON */}
                            <button
                              type="submit"
                              className="w-full mt-4 bg-gradient-to-r from-brand-blue via-indigo-600 to-brand-green hover:from-brand-blue-hover hover:to-brand-green-hover text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/30 transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm uppercase tracking-wider"
                            >
                              <Lock className="h-4 w-4" />
                              <span>SE CONNECTER</span>
                              <ArrowRight className="h-4 w-4" />
                            </button>

                            {/* SECONDARY ACTIONS: ACTIVATION & ENROLLMENT */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => setLandingChoice("activate_account")}
                                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Activer un compte</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setLandingChoice("create_establishment")}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Building className="h-3.5 w-3.5 text-indigo-500" />
                                <span>Créer un établissement</span>
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SECURE PRODUCTION AUTHENTICATION NOTICE */}
            {landingChoice === "login" && (
              <div className="w-full mt-6">
                <div className="bg-emerald-500/10 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-500/20 dark:border-emerald-800/30 text-center">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Authentification Sécurisée Firebase
                  </p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                    Saisissez votre email d'établissement pour accéder à votre espace sécurisé. Les comptes sont créés et gérés via Firebase Authentication.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* FOOTER & COMPLIANCE STATEMENTS */}
      <footer className="relative w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/80 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 text-xs">
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            SmartSchool RDC <span className="text-[10px] font-mono text-brand-blue font-bold px-1.5 py-0.5 bg-brand-blue/10 rounded ml-1">{t.version}</span>
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="text-slate-500 dark:text-slate-400">{t.copyright}</span>
        </div>

        {/* Legal buttons */}
        <div className="flex items-center space-x-3 text-xs">
          <button 
            onClick={() => setShowTermsModal(true)} 
            className="text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
          >
            {t.terms}
          </button>
          <span className="text-slate-300">•</span>
          <button 
            onClick={() => setShowTermsModal(true)} 
            className="text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
          >
            {t.privacy}
          </button>
          <span className="text-slate-300">•</span>
          <button 
            type="button"
            onClick={() => {
              setLandingChoice("login");
              setLoginMode("owner");
              setErrorMessage(null);
            }} 
            className="text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium cursor-pointer flex items-center gap-1 opacity-70 hover:opacity-100"
            title="Accès Administration Propriétaire"
          >
            <Crown className="h-3 w-3 text-amber-500" />
            <span>Accès Propriétaire</span>
          </button>
        </div>
      </footer>

      {/* MODAL: FORGOT PASSWORD */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative overflow-hidden ${
                darkMode ? "bg-slate-900 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-brand-blue rounded-lg">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-base">{t.forgotModalTitle}</h4>
                </div>
                <button
                  onClick={() => { setShowForgotPassword(false); setForgotSuccess(false); }}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {forgotSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-950/80 text-brand-green rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="h-6 w-6 stroke-[3]" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Lien envoyé avec succès !</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    {t.checkSmsEmail}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.forgotModalDesc}
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t.emailOrPhone}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="nom@ecole.cd ou +243..."
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all ${
                        darkMode 
                          ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-blue" 
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-blue"
                      }`}
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {t.back}
                    </button>
                    <button
                      type="submit"
                      className="flex-2 bg-gradient-to-r from-brand-blue to-brand-green hover:from-brand-blue-hover hover:to-brand-green-hover text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      {t.sendReset}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: TERMS OF SERVICE / PRIVACY */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] ${
                darkMode ? "bg-slate-900 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-green" />
              
              <div className="flex justify-between items-start mb-4 shrink-0">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-brand-blue" />
                  <h4 className="font-bold text-base">Aspects Légaux & de Confidentialité</h4>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Scrollable text contents */}
              <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white mb-1">1. Protection des Données Éducatives</h5>
                  <p>SmartSchool RDC, développé par Fred-Technique SARL sous la direction de l'Ir IT Fred Kalonda, applique une politique stricte d'isolation des données éducatives. En conformité avec les directives du Ministère de l'Éducation Nationale et Nouvelle Citoyenneté de la République Démocratique du Congo, chaque établissement scolaire bénéficie d'une base de données logique autonome.</p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white mb-1">2. Sécurité Financière & Mobile Money</h5>
                  <p>Toutes les transactions effectuées sur la plateforme via les passerelles Mobile Money de nos partenaires télécom locaux (Orange Money, Airtel Money, M-Pesa) font l'objet d'un chiffrement robuste et d'un rapprochement comptable systématique. Aucun numéro de carte ou code secret de portefeuille électronique n'est stocké sur nos serveurs.</p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white mb-1">3. Intégrité des Cotes et Bulletins</h5>
                  <p>La modification des registres de cotes et des structures de bulletins par semestre est soumise au contrôle d'audit cryptographique non répudiable. Toute modification frauduleuse de points fait l'objet d'une journalisation traçable par le Super Administrateur Fred-Technique SARL.</p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white mb-1">4. Conditions de Licence SaaS</h5>
                  <p>L'utilisation de SmartSchool RDC est concédée sous forme de licence annuelle d'abonnement selon la taille de l'établissement scolaire cliente. Les fiches de scolarité historiques restent consultables par l'école pendant un délai de 10 ans, conformément aux lois de l'enseignement en RDC.</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full bg-gradient-to-r from-brand-blue to-brand-green hover:from-brand-blue-hover hover:to-brand-green-hover text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  J'ai compris et j'accepte les conditions
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DETAILED RDC SCHOOL SYSTEM HELP */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative overflow-hidden ${
                darkMode ? "bg-slate-900 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-green" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950 text-brand-green rounded-lg">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-base">{t.helpSubtitle}</h4>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Qui peut s'authentifier ?</strong><br />
                  Seuls les utilisateurs (Préfets, Comptables, Enseignants, Parents, Élèves) préalablement enregistrés par le Secrétariat académique de leur établissement scolaire peuvent se connecter à l'aide de leur identifiant national unique ou de leur numéro de téléphone vérifié.
                </p>

                <p>
                  <strong>Vous n'avez pas de compte ?</strong><br />
                  Veuillez vous adresser physiquement au secrétariat de votre établissement scolaire muni de la carte d'élève ou du certificat d'inscription. Un SMS d'invitation contenant votre mot de passe temporaire sera envoyé sur le téléphone du parent d'élève désigné.
                </p>

                <p>
                  <strong>Problèmes avec les paiements ?</strong><br />
                  Si un paiement de frais d'écolage n'a pas débloqué l'accès au bulletin de période, veuillez présenter la référence de la transaction Mobile Money au comptable de l'établissement pour rapprochement manuel direct.
                </p>

                <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/50 mt-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">📞 Assistance technique Fred-Technique :</p>
                  <p className="font-mono text-[11px]">Support Hotline: +243 820 000 000<br />Email: support@fred-technique.cd</p>
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OWNER SETUP WIZARD MODAL */}
      <AnimatePresence>
        {showOwnerSetupWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-slate-900 border border-amber-500/40 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-amber-300">Assistant Compte Propriétaire</h3>
                    <p className="text-xs text-slate-400">Configuration unique du compte suprême de la plateforme</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOwnerSetupWizard(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
                const password = (form.elements.namedItem("password") as HTMLInputElement).value;
                const masterKey = (form.elements.namedItem("masterKey") as HTMLInputElement).value;

                handleSaveOwnerConfig({ name, email, phone, password, masterKey });
                setToast({
                  message: "Compte Propriétaire mis à jour et sauvegardé avec succès !",
                  type: "success"
                });
              }} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nom complet du Propriétaire</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={ownerConfig.name}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Email Propriétaire</label>
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={ownerConfig.email}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Téléphone Direct</label>
                    <input
                      name="phone"
                      type="text"
                      required
                      defaultValue={ownerConfig.phone}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mot de Passe Master</label>
                  <input
                    name="password"
                    type="text"
                    required
                    defaultValue={ownerConfig.password}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-400 mb-1">Clé de Sécurité Master RDC</label>
                  <input
                    name="masterKey"
                    type="text"
                    required
                    defaultValue={ownerConfig.masterKey}
                    className="w-full px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOwnerSetupWizard(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    <Crown className="h-4 w-4" /> Enregistrer Compte
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mandatory First-Time Login Security Wizard Overlay */}
      {isFirstLoginWizardActive && wizardUserData && (
        <FirstTimeLoginWizard
          user={wizardUserData}
          darkMode={darkMode}
          onWizardComplete={(updatedData) => {
            setIsFirstLoginWizardActive(false);
            setUserName(updatedData.name);
            setUserRole(updatedData.role);
            setToast({
              message: "Assistant de première connexion validé ! Le mot de passe temporaire a été révoqué définitivement.",
              type: "success"
            });
            setHrAuditLogs(prev => [
              {
                id: `audit-${Date.now()}`,
                actorName: updatedData.name,
                actorFunction: updatedData.role,
                action: "Première Connexion Sécurisée Complétée",
                targetName: "Attribution du mot de passe personnel + 3 questions + OTP téléphone/email.",
                date: new Date().toLocaleDateString("fr-FR"),
                time: new Date().toLocaleTimeString("fr-FR"),
                ipAddress: "197.234.221.14",
                device: "Terminal Sécurisé SmartSchool"
              },
              ...prev
            ]);
          }}
        />
      )}

      {/* Official Login Sheet Modal */}
      {selectedOfficialSheetAccount && (
        <OfficialLoginSheetModal
          account={selectedOfficialSheetAccount}
          onClose={() => setSelectedOfficialSheetAccount(null)}
          schoolName={selectedOfficialSheetAccount.schoolName || schoolName || "ÉTABLISSEMENT SCOLAIRE SMARTSCHOOL RDC"}
          creatorName={userName}
          creatorRole={userRole}
        />
      )}

      {/* Official Presentation and Commercial/Technical Document Modal (PDF & PPTX) */}
      <SmartSchoolPresentationDocument
        isOpen={showPresentationModal}
        onClose={() => setShowPresentationModal(false)}
      />

    </div>
  );
}
