import React, { useState, useEffect } from "react";
import { 
  Building, Users, Landmark, School, Award, FileText, Bell, Shield, 
  Settings, Activity, BadgeHelp, Clock, BarChart3, TrendingUp, CheckCircle, 
  XCircle, AlertTriangle, Plus, Search, Filter, RefreshCw, Send, Check, 
  UserPlus, Mail, Phone, Lock, Eye, DollarSign, Calendar, Server, Key, Terminal,
  Globe, Fingerprint, Sparkles, Trash2, Edit, BookOpen, QrCode, FileSpreadsheet,
  Sliders, ShieldAlert, Layers, Smartphone
} from "lucide-react";
import { School as SchoolType } from "../types";
import { SaasCenterModule } from "./SaasCenterModule";
import { ErrorBoundary } from "./ErrorBoundary";
import { NationalIdentitySettingsComponent } from "./NationalIdentitySettingsComponent";
import { safeLocalStorage } from "../utils/safeStorage";
import { SmartSchoolLogo } from "./SmartSchoolLogo";

interface SuperAdminPlatformProps {
  schools: SchoolType[];
  onUpdateSchool: (school: SchoolType) => void;
  onAddSchool: (school: SchoolType) => void;
  onDeleteSchool: (schoolId: string) => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  lang: string;
  drapeauUrl?: string;
  onUpdateDrapeauUrl?: (url: string) => void;
  watermarkUrl?: string;
  onUpdateWatermarkUrl?: (url: string) => void;
  userRole?: string;
  userName?: string;
  onUpdateNationalIdentity?: (settings: any) => void;
}

export function SuperAdminPlatform({ 
  schools: initialSchools, 
  onUpdateSchool, 
  onAddSchool, 
  onDeleteSchool,
  activeTab,
  onNavigate,
  lang,
  drapeauUrl = "",
  onUpdateDrapeauUrl,
  watermarkUrl = "",
  onUpdateWatermarkUrl,
  userRole = "Propriétaire",
  userName = "Propriétaire SmartSchool RDC",
  onUpdateNationalIdentity
}: SuperAdminPlatformProps) {
  const [schools, setSchools] = useState<SchoolType[]>(initialSchools);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Tous");

  const [drapeauUrlInput, setDrapeauUrlInput] = useState(drapeauUrl);
  const [watermarkUrlInput, setWatermarkUrlInput] = useState(watermarkUrl);

  useEffect(() => {
    setDrapeauUrlInput(drapeauUrl);
  }, [drapeauUrl]);

  useEffect(() => {
    setWatermarkUrlInput(watermarkUrl);
  }, [watermarkUrl]);

  // Global Feature Toggles State
  const [features, setFeatures] = useState(() => {
    const saved = safeLocalStorage.getItem("smartschool_platform_feature_toggles");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: "feat_messaging", name: "Messagerie Intelligente & Fichiers", category: "Communication", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_mobile_money", name: "Paiements Mobile Money (M-Pesa, Orange, Airtel)", category: "Finances", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_bank_card", name: "Paiements Carte Bancaire & Virement", category: "Finances", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_receipts", name: "Génération de Reçus Officiels", category: "Finances", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_pdf_export", name: "Exportation PDF Officielle (Bulletins, Fiches)", category: "Impression", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_excel_export", name: "Exportation Tableur Excel", category: "Impression", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_rh", name: "Ressources Humaines & Paie", category: "Administration", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_epst_inspection", name: "Module Inspection EPST & Rapports", category: "Souveraineté", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_bulletins", name: "Bulletins de Notes Numériques EPST", category: "Pédagogie", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_attendance", name: "Suivi des Présences & QR Code", category: "Pédagogie", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_ai_assistant", name: "Analyste & Assistant IA National", category: "Intelligence Artificielle", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" },
      { id: "feat_audit_logs", name: "Journal d'Audit & Sécurité", category: "Sécurité", status: "active", allowedSchools: "all", allowedProvinces: "all", allowedRoles: "all", activationDate: "2026-01-01", deactivationDate: "" }
    ];
  });

  const [featureSearch, setFeatureSearch] = useState("");
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState("all");

  useEffect(() => {
    safeLocalStorage.setItem("smartschool_platform_feature_toggles", JSON.stringify(features));
  }, [features]);

  const toggleFeatureStatus = (id: string) => {
    setFeatures((prev: any[]) => prev.map(f => {
      if (f.id === id) {
        const nextStatus = f.status === "active" ? "disabled" : f.status === "disabled" ? "limited" : "active";
        return { ...f, status: nextStatus };
      }
      return f;
    }));
  };

  // Provinces State
  const [provinces, setProvinces] = useState([
    { id: "1", name: "Kinshasa", schoolsCount: 14, studentsCount: 4500, status: "Actif", code: "KIN", regionalDirector: "M. Dieudonné Lwamba", budgetAllocation: "1,200,000 USD" },
    { id: "2", name: "Kongo Central", schoolsCount: 5, studentsCount: 1800, status: "Actif", code: "KGC", regionalDirector: "Mme Thérèse Mambu", budgetAllocation: "450,000 USD" },
    { id: "3", name: "Haut-Katanga", schoolsCount: 8, studentsCount: 3100, status: "Actif", code: "HKT", regionalDirector: "M. Jean-Paul Kasongo", budgetAllocation: "850,000 USD" },
    { id: "4", name: "Nord-Kivu", schoolsCount: 6, studentsCount: 2200, status: "Actif", code: "NKV", regionalDirector: "Mme Antoinette Kavira", budgetAllocation: "600,000 USD" },
    { id: "5", name: "Sud-Kivu", schoolsCount: 4, studentsCount: 1400, status: "Actif", code: "SKV", regionalDirector: "M. Patient Bisimwa", budgetAllocation: "400,000 USD" },
    { id: "6", name: "Lualaba", schoolsCount: 3, studentsCount: 1250, status: "Actif", code: "LUA", regionalDirector: "M. Robert Nawej", budgetAllocation: "500,000 USD" }
  ]);

  // Inspectors State
  const [inspectors, setInspectors] = useState([
    { id: "INS-001", name: "Inspecteur Gén. Gaston Mukala", province: "Kinshasa", role: "National", phone: "+243 811 122 333", email: "g.mukala@epst.gouv.cd", status: "Actif" },
    { id: "INS-002", name: "Inspecteur Prov. Théo Kanyinda", province: "Kongo Central", role: "Provincial", phone: "+243 822 334 455", email: "t.kanyinda@epst.gouv.cd", status: "Actif" },
    { id: "INS-003", name: "Inspectrice Prov. Béatrice Kabedi", province: "Haut-Katanga", role: "Provincial", phone: "+243 855 443 221", email: "b.kabedi@epst.gouv.cd", status: "Actif" },
    { id: "INS-004", name: "Inspecteur Prov. Marc Bisimwa", province: "Sud-Kivu", role: "Provincial", phone: "+243 899 776 554", email: "m.bisimwa@epst.gouv.cd", status: "En mission" }
  ]);

  // Inspection Reports State
  const [inspectionReports, setInspectionReports] = useState([
    { id: "REP-901", school: "Lycée Prince de Liège", date: "2026-06-15", inspector: "Inspecteur Gén. Gaston Mukala", rating: "Très Satisfaisant (90%)", findings: "Excellente conformité aux programmes nationaux de mathématiques. Recommandation: Mettre à jour les équipements du labo informatique.", status: "Traité" },
    { id: "REP-902", school: "Complexe Scolaire Mgr Shaumba", date: "2026-06-20", inspector: "Inspecteur Prov. Théo Kanyinda", rating: "Satisfaisant (78%)", findings: "Bonne tenue générale des registres matricules. Retard constaté dans l'encodage des fiches pédagogiques du premier cycle.", status: "Traité" },
    { id: "REP-903", school: "C.S. Cardinal Malula", date: "2026-06-28", inspector: "Inspectrice Prov. Béatrice Kabedi", rating: "À Améliorer (55%)", findings: "Effectif pléthorique constaté dans les classes de 1ère et 2ème Année EB (plus de 55 élèves par classe). Manque de manuels d'histoire officiels.", status: "Nouveau" }
  ]);

  // School Years State
  const [schoolYears, setSchoolYears] = useState([
    { id: "1", label: "2024-2025", status: "Archivé", startDate: "2024-09-02", endDate: "2025-07-02", registrationActive: false, isCurrent: false },
    { id: "2", label: "2025-2026", status: "Actif", startDate: "2025-09-01", endDate: "2026-07-02", registrationActive: true, isCurrent: true },
    { id: "3", label: "2026-2027", status: "Planification", startDate: "2026-09-07", endDate: "2027-07-02", registrationActive: true, isCurrent: false }
  ]);

  // Roles & Permissions State
  const [rolesPermissions, setRolesPermissions] = useState([
    { id: "role-1", name: "Préfet des études", cycle: "Secondaire", description: "Chef d'établissement secondaire", permissions: { canSchedule: true, canGrade: true, canValidate: true, canViewFinances: true, canManageUsers: true } },
    { id: "role-2", name: "Directeur d'école", cycle: "Primaire", description: "Chef d'établissement primaire", permissions: { canSchedule: true, canGrade: true, canValidate: true, canViewFinances: true, canManageUsers: true } },
    { id: "role-3", name: "Enseignant", cycle: "Tous", description: "Titulaire de cours et éducateur", permissions: { canSchedule: false, canGrade: true, canValidate: false, canViewFinances: false, canManageUsers: false } },
    { id: "role-4", name: "Comptable", cycle: "Tous", description: "Responsable financier", permissions: { canSchedule: false, canGrade: false, canValidate: false, canViewFinances: true, canManageUsers: false } },
    { id: "role-5", name: "Secrétaire", cycle: "Tous", description: "Gestion administrative et encodages", permissions: { canSchedule: true, canGrade: false, canValidate: false, canViewFinances: false, canManageUsers: false } },
    { id: "role-6", name: "Élève", cycle: "Tous", description: "Apprenant inscrit", permissions: { canSchedule: false, canGrade: false, canValidate: false, canViewFinances: false, canManageUsers: false } },
    { id: "role-7", name: "Parent", cycle: "Tous", description: "Représentant légal", permissions: { canSchedule: false, canGrade: false, canValidate: false, canViewFinances: false, canManageUsers: false } }
  ]);

  // National Announcements State
  const [nationalAnnouncements, setNationalAnnouncements] = useState([
    { id: "ANN-101", title: "Circulaire n°084/MIN-EPST/2026 - Calendrier des Examens d'État", content: "Chers Préfets et Directeurs, le calendrier officiel de la session ordinaire de l'Examen d'État 2026 est arrêté du 22 au 25 juin 2026. Veillez à la stricte conformité des inscriptions.", date: "2026-06-25", author: "Directeur de Cabinet EPST", views: 184, audience: "Toutes les Écoles" },
    { id: "ANN-102", title: "Directives relatives à la gratuité de l'enseignement primaire", content: "Rappel à tous les Directeurs d'écoles primaires publiques : aucun frais d'inscription, de bulletin ou de minerval ne doit être exigé des parents. Des sanctions sévères seront appliquées aux contrevenants.", date: "2026-06-20", author: "Inspection Générale", views: 322, audience: "Écoles Primaires" }
  ]);

  // Modals & form state controllers
  const [showAddProvince, setShowAddProvince] = useState(false);
  const [newProvName, setNewProvName] = useState("");
  const [newProvCode, setNewProvCode] = useState("");
  const [newProvDir, setNewProvDir] = useState("");
  const [newProvBudget, setNewProvBudget] = useState("500,000 USD");

  const [showAddInspector, setShowAddInspector] = useState(false);
  const [newInspName, setNewInspName] = useState("");
  const [newInspProvince, setNewInspProvince] = useState("Kinshasa");
  const [newInspRole, setNewInspRole] = useState("Provincial");
  const [newInspPhone, setNewInspPhone] = useState("");
  const [newInspEmail, setNewInspEmail] = useState("");

  const [showAddYear, setShowAddYear] = useState(false);
  const [newYearLabel, setNewYearLabel] = useState("");
  const [newYearStart, setNewYearStart] = useState("");
  const [newYearEnd, setNewYearEnd] = useState("");

  const [showAddAnn, setShowAddAnn] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnAudience, setNewAnnAudience] = useState("Toutes les Écoles");

  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchName, setNewSchName] = useState("");
  const [newSchCode, setNewSchCode] = useState("");
  const [newSchProvince, setNewSchProvince] = useState("Kinshasa");
  const [newSchType, setNewSchType] = useState("Privé agréé");

  // AI Assistant Chat state
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      sender: "assistant",
      text: "Bonjour Ir IT Fred Kalonda. Je suis Fred IA, votre analyste et conseiller réglementaire pour SmartSchool RDC. J'analyse l'ensemble de l'infrastructure nationale en temps réel pour y déceler toute anomalie pédagogique, financière, ou d'abonnement. Comment puis-je vous éclairer aujourd'hui ?"
    }
  ]);

  // Platform Staff State
  const [platformStaff, setPlatformStaff] = useState([
    { id: "1", name: "Ir IT Fred Kalonda", role: "Propriétaire de la plateforme", email: "fred.kalonda@smartschool.cd", phone: "+243 812 345 678", status: "Actif" },
    { id: "2", name: "Mlle Astrid Mutombo", role: "Support client", email: "astrid.mutombo@smartschool.cd", phone: "+243 822 456 789", status: "Actif" },
    { id: "3", name: "M. Sylvain Kabulo", role: "Comptable SmartSchool", email: "sylvain.kabulo@smartschool.cd", phone: "+243 855 789 123", status: "Actif" },
    { id: "4", name: "Ir Jean Mwamba", role: "Administrateur technique", email: "jean.mwamba@smartschool.cd", phone: "+243 899 987 654", status: "Actif" },
    { id: "5", name: "Dev Alpha", role: "Développeur", email: "dev.alpha@smartschool.cd", phone: "+243 833 222 111", status: "En pause" }
  ]);

  // Support Tickets State
  const [tickets, setTickets] = useState([
    { id: "TCK-489", school: "Lycée Prince de Liège", author: "M. Sylvain Kabulo", subject: "Problème d'impression des bulletins P1", priority: "Haute", status: "Nouveau", date: "Il y a 14 mins" },
    { id: "TCK-488", school: "Complexe Scolaire Mgr Shaumba", author: "Sœur Albertine", subject: "Erreur de synchronisation du registre national", priority: "Critique", status: "En cours", date: "Il y a 2 h" },
    { id: "TCK-487", school: "Collège Boboto", author: "Père Lwanga", subject: "Ajout d'un nouveau comptable secondaire", priority: "Moyenne", status: "Résolu", date: "Hier" },
    { id: "TCK-486", school: "C.S. Cardinal Malula", author: "M. Joseph Kalombo", subject: "Problème de réception des alertes SMS parents", priority: "Haute", status: "Résolu", date: "Il y a 2 jours" }
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { id: "1", user: "Ir IT Fred Kalonda", action: "Déploiement du modèle officiel de bulletin Maternelle V2", target: "CNR-EPST", status: "Réussite", date: "2026-06-29 00:32" },
    { id: "2", user: "Ir Jean Mwamba", action: "Réinitialisation du mot de passe admin de C.S. Cardinal Malula", target: "Établissement #004", status: "Réussite", date: "2026-06-29 00:15" },
    { id: "3", user: "M. Sylvain Kabulo", action: "Validation de la facture d'abonnement trimestriel Boboto", target: "Finances", status: "Réussite", date: "2026-06-28 18:45" },
    { id: "4", user: "Mlle Astrid Mutombo", action: "Suspension temporaire de l'école 'Inst. Technique de N'djili'", target: "Établissement #012", status: "Réussite", date: "2026-06-28 14:10" },
    { id: "5", user: "Ir IT Fred Kalonda", action: "Tentative d'accès non autorisée de l'adresse IP 197.243.2.12", target: "Sécurité", status: "Bloqué", date: "2026-06-28 12:05" }
  ]);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState([
    { id: "SUB-001", school: "Lycée Prince de Liège", plan: "Premium", price: 250, currency: "USD", billing: "Mensuel", nextDue: "2026-07-15", status: "Payé" },
    { id: "SUB-002", school: "C.S. Cardinal Malula", plan: "Standard", price: 150, currency: "USD", billing: "Mensuel", nextDue: "2026-07-20", status: "Payé" },
    { id: "SUB-003", school: "Collège Boboto", plan: "Premium", price: 2500, currency: "USD", billing: "Annuel", nextDue: "2027-01-10", status: "Payé" },
    { id: "SUB-004", school: "Complexe Scolaire Mgr Shaumba", plan: "Standard", price: 150, currency: "USD", billing: "Mensuel", nextDue: "2026-06-30", status: "En retard" },
    { id: "SUB-005", school: "Institut Technique de N'djili", plan: "Basic", price: 50, currency: "USD", billing: "Mensuel", nextDue: "2026-06-25", status: "Suspendu" }
  ]);

  // Platform Developer Receiving Accounts & Commission Rules State (Concepteur SmartSchool RDC / FREDTECH)
  const [devReceivingAccount, setDevReceivingAccount] = useState({
    mobileMoneyEnabled: true,
    cardEnabled: true,
    paymentMode: "Mobile Money + Carte Bancaire", // "Mobile Money uniquement", "Carte Bancaire uniquement", "Mobile Money + Carte Bancaire"
    mobileMoney: {
      mpesa: { phone: "+243 812 345 678", holder: "Ir IT Fred Kalonda (FREDTECH RDC)", operator: "Vodacom RDC", validated: true, status: "Validé" as const },
      orange: { phone: "+243 890 000 111", holder: "Ir IT Fred Kalonda (FREDTECH RDC)", operator: "Orange RDC", validated: true, status: "Validé" as const },
      airtel: { phone: "0994202940", holder: "Ir IT Fred Kalonda", operator: "Airtel RDC", validated: true, status: "Validé" as const }
    },
    bankCard: {
      bankName: "Rawbank RDC",
      holderName: "FREDTECH SARL (SmartSchool RDC)",
      accountNumber: "00018-09012-771234-99 USD",
      merchantGatewayToken: "FREDTECH-SK-BANK-2026-RDC",
      validated: true,
      status: "Validé" as const
    }
  });

  const [platformCommissionRules, setPlatformCommissionRules] = useState({
    isCommissionActive: true,
    defaultRatePercent: 2.0,
    fixedFeeUSD: 0.00,
    schoolCustomRates: [
      { schoolName: "Lycée Prince de Liège", ratePercent: 1.5, type: "Remise Grands Effectifs" },
      { schoolName: "Complexe Scolaire Mgr Shaumba", ratePercent: 2.0, type: "Taux Standard" },
      { schoolName: "C.S. Cardinal Malula", ratePercent: 2.0, type: "Taux Standard" },
      { schoolName: "Institut Technique de N'djili", ratePercent: 1.0, type: "Taux Spécial École Publique" }
    ]
  });

  // Selected Transaction Receipt Modal state for full traceability & PDF/QR generation
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Sub-navigation inside Financial SaaS Engine
  const [financeSubTab, setFinanceSubTab] = useState<"overview" | "merchants" | "security_audit" | "notifications" | "reconciliation">("overview");

  // School Merchant Accounts State for Verification and Authorization
  const [schoolMerchantAccountsList, setSchoolMerchantAccountsList] = useState([
    {
      id: "MERCH-001",
      schoolName: "Lycée Prince de Liège",
      codeNational: "884102-KIN",
      operator: "Vodacom M-Pesa",
      holderName: "Lycée Prince de Liège Kinshasa",
      accountNumber: "+243 812 888 102",
      type: "Mobile Money",
      status: "Validé" as "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion",
      lastChecked: "2026-08-07 12:45",
      totalCollectedUSD: 45200,
      apiToken: "MPESA-MERCH-TOK-8841"
    },
    {
      id: "MERCH-002",
      schoolName: "Complexe Scolaire Mgr Shaumba",
      codeNational: "884105-KIN",
      operator: "Orange Money RDC",
      holderName: "C.S. Mgr Shaumba Administration",
      accountNumber: "+243 890 123 999",
      type: "Mobile Money",
      status: "Validé" as "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion",
      lastChecked: "2026-08-07 11:30",
      totalCollectedUSD: 28400,
      apiToken: "ORANGE-MERCH-TOK-8845"
    },
    {
      id: "MERCH-003",
      schoolName: "C.S. Cardinal Malula",
      codeNational: "884110-KIN",
      operator: "Rawbank Visa/Mastercard",
      holderName: "Fondation Cardinal Malula SARL",
      accountNumber: "00018-09012-554123-11 USD",
      type: "Carte Bancaire",
      status: "Validé" as "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion",
      lastChecked: "2026-08-07 10:15",
      totalCollectedUSD: 36100,
      apiToken: "RAW-MERCH-TOK-3392"
    },
    {
      id: "MERCH-004",
      schoolName: "Institut Technique de N'djili",
      codeNational: "884201-NDJ",
      operator: "Airtel Money RDC",
      holderName: "Institut Technique N'djili B/C",
      accountNumber: "+243 990 111 888",
      type: "Mobile Money",
      status: "En attente de validation" as "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion",
      lastChecked: "2026-08-07 09:00",
      totalCollectedUSD: 0,
      apiToken: "AIRTEL-MERCH-TOK-PENDING"
    },
    {
      id: "MERCH-005",
      schoolName: "Collège Boboto",
      codeNational: "884101-KIN",
      operator: "Afrimoney RDC",
      holderName: "Collège Boboto Kinshasa",
      accountNumber: "+243 900 444 333",
      type: "Mobile Money",
      status: "Erreur de connexion" as "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion",
      lastChecked: "2026-08-06 18:20",
      totalCollectedUSD: 0,
      apiToken: "AFRI-MERCH-ERR-401"
    }
  ]);

  // Financial Audit Logs (Immutable, Crytographic anti-tamper log)
  const [financialAuditLogs, setFinancialAuditLogs] = useState([
    {
      id: "AUD-9901",
      timestamp: "2026-08-07 13:10:02",
      actor: "SuperAdmin (FREDTECH)",
      role: "Concepteur Système",
      action: "VALIDATION_COMPTE_MARCHAND",
      details: "Validation API réussie pour le compte Rawbank C.S. Cardinal Malula (Token RAW-MERCH-TOK-3392). Status passé à Validé.",
      ipAddress: "197.242.128.45",
      hashSignature: "SHA256: 8f3a9a12c4e5b6a78d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c"
    },
    {
      id: "AUD-9902",
      timestamp: "2026-08-07 11:22:45",
      actor: "SuperAdmin (FREDTECH)",
      role: "Concepteur Système",
      action: "CONFIGURATION_COMMISSION",
      details: "Mise à jour du taux standard de commission SmartSchool RDC à 2.0% avec prélèvement automatique bilatéral.",
      ipAddress: "197.242.128.45",
      hashSignature: "SHA256: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
    },
    {
      id: "AUD-9903",
      timestamp: "2026-08-06 16:05:12",
      actor: "API Webhook Vodacom",
      role: "System Operator",
      action: "SPLIT_PAYMENT_EXECUTION",
      details: "Transaction TX-MPESA-8841 : Brut 100 USD | Net École 98.00 USD | Commission Concepteur 2.00 USD. Status : Transfert Instantané Succès.",
      ipAddress: "10.200.4.18",
      hashSignature: "SHA256: 7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f"
    }
  ]);

  // Reconciliation Module Records
  const [reconciliationRecords, setReconciliationRecords] = useState([
    {
      id: "REC-2026-07",
      period: "Juillet 2026",
      channel: "M-Pesa Vodacom RDC",
      smartSchoolLedgerAmount: 65400,
      providerStatementAmount: 65400,
      bankSettledAmount: 65400,
      discrepancyAmount: 0,
      status: "Parfaite" as "Parfaite" | "Écart Décelé" | "En Réconciliation",
      lastVerifiedAt: "2026-08-01 02:00"
    },
    {
      id: "REC-2026-06",
      period: "Juin 2026",
      channel: "Orange Money RDC",
      smartSchoolLedgerAmount: 38200,
      providerStatementAmount: 38200,
      bankSettledAmount: 38200,
      discrepancyAmount: 0,
      status: "Parfaite" as "Parfaite" | "Écart Décelé" | "En Réconciliation",
      lastVerifiedAt: "2026-07-01 02:00"
    },
    {
      id: "REC-2026-05",
      period: "Mai 2026",
      channel: "Rawbank Visa/Mastercard",
      smartSchoolLedgerAmount: 24850,
      providerStatementAmount: 24850,
      bankSettledAmount: 24850,
      discrepancyAmount: 0,
      status: "Parfaite" as "Parfaite" | "Écart Décelé" | "En Réconciliation",
      lastVerifiedAt: "2026-06-01 02:00"
    }
  ]);

  // Multi-Party Notification Dispatch Logs
  const [paymentNotificationLogs, setPaymentNotificationLogs] = useState([
    {
      id: "NOTIF-8801",
      recipientType: "Parent",
      recipientName: "M. Mbuyi Kabeya (+243 812 888 102)",
      channel: "SMS Mobile Money + In-App",
      title: "Confirmation de paiement Minerval T3",
      message: "Votre règlement de 100 USD pour Mbuyi Kabeya (Lycée Prince de Liège) est validé. Reçu PDF N° REC-MPESA8841 généré avec QR Code.",
      timestamp: "2026-06-29 09:12:05",
      status: "Délivré"
    },
    {
      id: "NOTIF-8802",
      recipientType: "École",
      recipientName: "Comptabilité Lycée Prince de Liège",
      channel: "Webhook API & Notification In-App",
      title: "Encaissement Net Réceptionné",
      message: "Nouveau versement net de 98.00 USD crédité sur votre compte marchand M-Pesa (Réf TX-MPESA-8841). Commission 2.00 USD prélevée.",
      timestamp: "2026-06-29 09:12:06",
      status: "Délivré"
    },
    {
      id: "NOTIF-8803",
      recipientType: "SmartSchool RDC",
      recipientName: "Ir IT Fred Kalonda (FREDTECH)",
      channel: "System Webhook & Email",
      title: "Commission Plateforme Créditée",
      message: "Commission de 2.00 USD (2%) générée sur la transaction TX-MPESA-8841 et transférée vers le compte marchand FREDTECH.",
      timestamp: "2026-06-29 09:12:06",
      status: "Délivré"
    }
  ]);

  // Double Authorization Modal State
  const [doubleAuthModal, setDoubleAuthModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionPayload: (() => void) | null;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionPayload: null
  });
  const [authPinInput, setAuthPinInput] = useState("");
  const [authPinError, setAuthPinError] = useState("");

  // School Status Tracker
  const [schoolStatuses, setSchoolStatuses] = useState<Record<string, "Actif" | "Suspendu" | "Désactivé">>({
    "default": "Actif",
    "school-1": "Actif",
    "school-2": "Actif",
    "school-3": "Suspendu"
  });

  const toggleSchoolStatus = (schoolId: string) => {
    setSchoolStatuses(prev => {
      const current = prev[schoolId] || "Actif";
      const next = current === "Actif" ? "Suspendu" : current === "Suspendu" ? "Désactivé" : "Actif";
      return { ...prev, [schoolId]: next };
    });
  };

  const resetAdminPasswordSimulate = (schoolName: string) => {
    alert(`Le mot de passe de l'administrateur de l'école "${schoolName}" a été réinitialisé à sa valeur par défaut : "SmartSchool2026!". Un email de notification a été envoyé.`);
  };

  // Provinces list
  const provincesRDC = ["Kinshasa", "Kongo Central", "Haut-Katanga", "Nord-Kivu", "Sud-Kivu", "Lualaba"];

  // Filtered Schools
  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          school.codeNational.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvince = selectedProvince === "Tous" || school.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  // Support Tickets update
  const handleResolveTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "Résolu" } : t));
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Top Header Info Banner */}
      <div className="bg-gradient-to-r from-red-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 opacity-10">
          <Server className="h-64 w-64 -mr-10 -mt-10" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-red-600/30 text-red-200 border border-red-500/20 px-3 py-1 rounded-full">
            ESPACE DE CONTRÔLE CENTRAL NATIONAL RDC
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-2">SmartSchool RDC Plateforme</h2>
          <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
            Bienvenue dans le cockpit de gestion de l'infrastructure nationale SmartSchool RDC. Vous administrez l'ensemble des établissements scolaires, les finances et la régulation officielle de l'EPST.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <SmartSchoolLogo size="lg" withShadow withRing />
        </div>
      </div>

      {/* RENDER MODULES BASED ON ACTIVE TAB */}
      <ErrorBoundary key={activeTab} fallbackTitle={`Sous-Module SuperAdmin ${activeTab} Protégé`}>
      {activeTab === "sa_saas_center" && (
        <SaasCenterModule
          schools={schools}
          onUpdateSchool={onUpdateSchool}
          onAddSchool={onAddSchool}
          onDeleteSchool={onDeleteSchool}
        />
      )}

      {activeTab === "sa_dashboard" && (
        <div className="space-y-6">
          {/* Dashboard National KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Écoles Enregistrées</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{schools.length + 8}</p>
                <p className="text-[10px] text-emerald-500 font-bold mt-1">▲ +3 cette semaine</p>
              </div>
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <School className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Élèves Nationwide</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">14,250</p>
                <p className="text-[10px] text-emerald-500 font-bold mt-1">▲ +840 ce mois-ci</p>
              </div>
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Revenus SmartSchool</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">42,850 USD</p>
                <p className="text-[10px] text-emerald-500 font-bold mt-1">▲ +12.5% vs mai</p>
              </div>
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
                <Landmark className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Santé Serveurs</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">99.98 %</p>
                <p className="text-[10px] text-emerald-500 font-bold mt-1">● Nominal (Fred Server)</p>
              </div>
              <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-sky-600 dark:text-sky-400">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* National Enrollment Graph SVG */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Évolution de l'Adoption Nationale</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Nombre de comptes actifs par province éducationnelle RDC.</p>
                </div>
                <div className="flex gap-2 text-[10px] font-bold">
                  <span className="flex items-center space-x-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block"></span>
                    <span className="text-slate-500">Kinshasa</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-slate-500">Katanga</span>
                  </span>
                </div>
              </div>

              {/* Graphical representation placeholder */}
              <div className="h-56 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900/60 flex flex-col justify-end p-4">
                <div className="flex items-end justify-between h-40 px-4">
                  {[45, 60, 52, 78, 90, 110, 142, 130, 168, 195, 220, 245].map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-2 w-full">
                      <div className="bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-md w-4 sm:w-6 hover:opacity-80 transition-all cursor-pointer" style={{ height: `${val / 1.8}px` }} title={`${val} écoles`} />
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">M{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 lg:col-span-4 space-y-4">
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Raccourcis Administrateur</h3>
              <div className="grid grid-cols-1 gap-2.5">
                <button onClick={() => onNavigate("sa_schools")} className="text-left w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-900/60 flex items-center space-x-3 cursor-pointer">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-lg">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">Gérer les Écoles</p>
                    <p className="text-[9px] text-slate-500">Activer ou suspendre des licences d'utilisation</p>
                  </div>
                </button>

                <button onClick={() => onNavigate("sa_cnr")} className="text-left w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-900/60 flex items-center space-x-3 cursor-pointer">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">Publier des Modèles CNR</p>
                    <p className="text-[9px] text-slate-500">Publier bulletins et circulaires de l'EPST</p>
                  </div>
                </button>

                <button onClick={() => onNavigate("sa_support")} className="text-left w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-900/60 flex items-center space-x-3 cursor-pointer">
                  <div className="p-2 bg-red-100 dark:bg-red-950 text-red-600 rounded-lg">
                    <BadgeHelp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">Support Technique</p>
                    <p className="text-[9px] text-slate-500">
                      Voir les tickets d'aide ({tickets.filter(t => t.status !== "Résolu").length} en attente)
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: ETABLISSEMENTS (SCHOOLS) */}
      {activeTab === "sa_schools" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Registre National des Établissements Scolaires</h3>
              <p className="text-xs text-slate-500">Supervisez l'état, l'activation, et le mot de passe d'administration de chaque établissement.</p>
            </div>
            <button 
              onClick={() => setShowAddSchool(!showAddSchool)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddSchool ? "Masquer le formulaire" : "Enregistrer un Établissement"}</span>
            </button>
          </div>

          {showAddSchool && (
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Formulaire d'Enregistrement National d'École</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nom de l'école</label>
                  <input 
                    type="text" 
                    placeholder="ex: Collège Boboto" 
                    value={newSchName}
                    onChange={(e) => setNewSchName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Code National EPST</label>
                  <input 
                    type="text" 
                    placeholder="ex: EPS-KIN-78901" 
                    value={newSchCode}
                    onChange={(e) => setNewSchCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Province</label>
                  <select 
                    value={newSchProvince}
                    onChange={(e) => setNewSchProvince(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold"
                  >
                    {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Régime juridique</label>
                  <select 
                    value={newSchType}
                    onChange={(e) => setNewSchType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold"
                  >
                    <option value="Privé agréé">Privé agréé</option>
                    <option value="Public conventionné">Public conventionné</option>
                    <option value="Public non conventionné">Public non conventionné</option>
                    <option value="Consulaire">Consulaire</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <button 
                  onClick={() => {
                    setNewSchName("");
                    setNewSchCode("");
                    setShowAddSchool(false);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    if (!newSchName.trim() || !newSchCode.trim()) {
                      alert("Veuillez remplir le nom et le code national !");
                      return;
                    }
                    const newSchool: SchoolType = {
                      id: "sch-" + Date.now(),
                      name: newSchName,
                      codeNational: newSchCode,
                      province: newSchProvince,
                      provinceEducationnelle: newSchProvince,
                      contactEmail: `admin.${newSchName.toLowerCase().replace(/[^a-z]/g, "")}@smartschool.cd`,
                      type: newSchType === "Privé agréé" ? "Privé" : newSchType === "Public conventionné" ? "Conventionné" : "Public",
                      levels: ["Primaire", "Secondaire", "Humanités"],
                      classes: ["7ème Année", "8ème Année", "3ème Humanités", "4ème Humanités"]
                    };
                    onAddSchool(newSchool);
                    setSchools([newSchool, ...schools]);
                    setNewSchName("");
                    setNewSchCode("");
                    setShowAddSchool(false);
                    alert(`L'établissement ${newSchName} a été enregistré avec succès et son matricule national est activé.`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Confirmer et Activer
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom d'école ou code national..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none font-bold"
            >
              <option value="Tous">Toutes les Provinces</option>
              {provincesRDC.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchools.map((school) => {
              const status = schoolStatuses[school.id] || "Actif";
              return (
                <div key={school.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                          <Building className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs truncate">{school.name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{school.codeNational}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        status === "Actif" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" :
                        status === "Suspendu" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                        "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 border-t border-slate-50 dark:border-slate-850 pt-2 text-[10px]">
                      <div>
                        <span className="text-slate-400">Province :</span> <span className="text-slate-700 dark:text-slate-300 font-bold">{school.province}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Type :</span> <span className="text-slate-700 dark:text-slate-300 font-bold">{school.type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Cycles :</span> <span className="text-slate-700 dark:text-slate-300 font-bold">{(school.levels || []).join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Classes :</span> <span className="text-slate-700 dark:text-slate-300 font-bold">{(school.classes || []).length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50 dark:border-slate-850">
                    <button 
                      onClick={() => toggleSchoolStatus(school.id)}
                      className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex-1 ${
                        status === "Actif" 
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400" 
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
                      }`}
                    >
                      {status === "Actif" ? "Suspendre" : "Activer"}
                    </button>
                    
                    <button 
                      onClick={() => resetAdminPasswordSimulate(school.name)}
                      className="text-[9px] font-black uppercase bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer flex-1"
                    >
                      Reset Pass
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE 3: UTILISATEURS INTERNES */}
      {activeTab === "sa_users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Équipe SmartSchool RDC</h3>
              <p className="text-xs text-slate-500">Membres internes avec accès privilégié à l'administration de la plateforme.</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl flex items-center space-x-1 transition-colors cursor-pointer">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Nouveau Collaborateur</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 uppercase tracking-widest text-[9px] font-black border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3.5">Collaborateur</th>
                    <th className="p-3.5">Rôle Plateforme</th>
                    <th className="p-3.5">Contacts</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {platformStaff.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{staff.name}</td>
                      <td className="p-3.5">
                        <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                          {staff.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 space-y-0.5">
                        <p>{staff.email}</p>
                        <p className="text-[10px] font-mono">{staff.phone}</p>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold ${staff.status === "Actif" ? "text-emerald-500" : "text-amber-500"}`}>
                          ● {staff.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: SUBSCRIPTIONS */}
      {activeTab === "sa_subscriptions" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Abonnements des Établissements</h3>
            <p className="text-xs text-slate-500">Suivi des licences d'exploitation SmartSchool RDC et échéanciers de facturation.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 uppercase tracking-widest text-[9px] font-black border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3.5">ID Facture</th>
                    <th className="p-3.5">Établissement</th>
                    <th className="p-3.5">Formule Plan</th>
                    <th className="p-3.5">Montant Facturé</th>
                    <th className="p-3.5">Échéance Due</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {subscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="p-3.5 font-mono font-bold text-slate-400">{sub.id}</td>
                      <td className="p-3.5 font-black text-slate-850 dark:text-slate-100">{sub.school}</td>
                      <td className="p-3.5">
                        <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded font-black uppercase text-[10px]">
                          {sub.plan}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{sub.price} USD / {sub.billing}</td>
                      <td className="p-3.5 text-slate-500">{sub.nextDue}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          sub.status === "Payé" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" :
                          sub.status === "En retard" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                          "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: PLATFORM PAYMENTS & REVENUE ENGINE (SMARTSCHOOL RDC / FREDTECH) */}
      {activeTab === "sa_payments" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500 text-emerald-950 text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full">
                  Moteur Financier SaaS
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Infrastructure Financière Sécurisée SmartSchool RDC
                </span>
              </div>
              <h3 className="font-sans font-black text-slate-800 dark:text-slate-100 text-base uppercase tracking-wider mt-1">
                Administration Financière Propriétaire & Validation Marchande
              </h3>
              <p className="text-xs text-slate-500">
                Superviser la validation API des comptes marchands scolaires, le portefeuille virtuel, le journal d'audit cryptographique et la réconciliation.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  alert("Génération du rapport financier SaaS consolidé (Excel & PDF) des commissions SmartSchool RDC...");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                <span>Exporter Rapport Consolidé</span>
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
            {[
              { id: "overview", label: "Vue d'Ensemble & Revenus", icon: DollarSign },
              { id: "merchants", label: "Comptes Marchands Écoles", icon: Landmark },
              { id: "security_audit", label: "Sécurité & Audit Cryptographique", icon: Shield },
              { id: "notifications", label: "Notifications Multi-Parties", icon: Bell },
              { id: "reconciliation", label: "Module de Réconciliation", icon: Activity }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = financeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFinanceSubTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SUB-TAB 1: OVERVIEW & REVENUE CONFIGURATION */}
          {financeSubTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Dashboard Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Total Volume Transigé</span>
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">148 200 $ <span className="text-xs text-slate-400 font-normal">USD</span></p>
                  <p className="text-[10px] text-slate-400 font-bold">14 écosystèmes scolaires connectés</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Commissions Concepteur (2%)</span>
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">2 964 $ <span className="text-xs text-slate-400 font-normal">USD</span></p>
                  <p className="text-[10px] text-emerald-500 font-bold">↑ +18.5% revenus ce mois-ci</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Élèves en Paiement Numérique</span>
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">18 450 <span className="text-xs text-slate-400 font-normal">Élèves</span></p>
                  <p className="text-[10px] text-slate-400 font-bold">Payent via Mobile Money & Cartes</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Réconciliation & Sécurité</span>
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">100 %</p>
                  <p className="text-[10px] text-emerald-500 font-bold">Système tokenisé anti-fraude actif</p>
                </div>
              </div>

              {/* Developer Accounts Configuration */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        Espace Propriétaire SmartSchool RDC
                      </span>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Comptes de Réception des Commissions Concepteur (Ir IT Fred Kalonda / FREDTECH)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Définissez les comptes marchands destinés à recevoir la part de commission de 2% SmartSchool RDC lors de chaque transaction.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mode de Réception :</label>
                    <select
                      value={devReceivingAccount.paymentMode}
                      onChange={(e) => setDevReceivingAccount({ ...devReceivingAccount, paymentMode: e.target.value })}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    >
                      <option value="Mobile Money + Carte Bancaire">Mobile Money + Carte Bancaire (Recommandé)</option>
                      <option value="Mobile Money uniquement">Mobile Money uniquement</option>
                      <option value="Carte Bancaire uniquement">Carte Bancaire uniquement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Dev Mobile Money Accounts */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-emerald-500" /> Comptes Mobile Money Concepteur
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                        Validé & Synchronisé
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                        <p className="text-[9px] font-bold uppercase text-red-600">Vodacom M-Pesa Concepteur</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Titulaire :</span>
                            <input
                              type="text"
                              value={devReceivingAccount.mobileMoney.mpesa.holder}
                              onChange={(e) => setDevReceivingAccount({
                                ...devReceivingAccount,
                                mobileMoney: {
                                  ...devReceivingAccount.mobileMoney,
                                  mpesa: { ...devReceivingAccount.mobileMoney.mpesa, holder: e.target.value }
                                }
                              })}
                              className="w-full font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[11px]"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block">Numéro M-Pesa :</span>
                            <input
                              type="text"
                              value={devReceivingAccount.mobileMoney.mpesa.phone}
                              onChange={(e) => setDevReceivingAccount({
                                ...devReceivingAccount,
                                mobileMoney: {
                                  ...devReceivingAccount.mobileMoney,
                                  mpesa: { ...devReceivingAccount.mobileMoney.mpesa, phone: e.target.value }
                                }
                              })}
                              className="w-full font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[11px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                        <p className="text-[9px] font-bold uppercase text-orange-600">Orange Money Concepteur</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Titulaire :</span>
                            <input
                              type="text"
                              value={devReceivingAccount.mobileMoney.orange.holder}
                              onChange={(e) => setDevReceivingAccount({
                                ...devReceivingAccount,
                                mobileMoney: {
                                  ...devReceivingAccount.mobileMoney,
                                  orange: { ...devReceivingAccount.mobileMoney.orange, holder: e.target.value }
                                }
                              })}
                              className="w-full font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[11px]"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block">Numéro Orange :</span>
                            <input
                              type="text"
                              value={devReceivingAccount.mobileMoney.orange.phone}
                              onChange={(e) => setDevReceivingAccount({
                                ...devReceivingAccount,
                                mobileMoney: {
                                  ...devReceivingAccount.mobileMoney,
                                  orange: { ...devReceivingAccount.mobileMoney.orange, phone: e.target.value }
                                }
                              })}
                              className="w-full font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[11px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                        <p className="text-[9px] font-bold uppercase text-amber-600">Airtel Money Concepteur</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Titulaire :</span>
                            <input
                              type="text"
                              value={devReceivingAccount.mobileMoney.airtel.holder}
                              onChange={(e) => setDevReceivingAccount({
                                ...devReceivingAccount,
                                mobileMoney: {
                                  ...devReceivingAccount.mobileMoney,
                                  airtel: { ...devReceivingAccount.mobileMoney.airtel, holder: e.target.value }
                                }
                              })}
                              className="w-full font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[11px]"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block">Numéro Airtel :</span>
                            <input
                              type="text"
                              value={devReceivingAccount.mobileMoney.airtel.phone}
                              onChange={(e) => setDevReceivingAccount({
                                ...devReceivingAccount,
                                mobileMoney: {
                                  ...devReceivingAccount.mobileMoney,
                                  airtel: { ...devReceivingAccount.mobileMoney.airtel, phone: e.target.value }
                                }
                              })}
                              className="w-full font-mono font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dev Bank Accounts */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Landmark className="h-4 w-4 text-blue-500" /> Compte Bancaire / Carte Concepteur
                      </span>
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                        Passerelle Tokenisée PCI-DSS
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Banque Dépôt :</span>
                          <select
                            value={devReceivingAccount.bankCard.bankName}
                            onChange={(e) => setDevReceivingAccount({
                              ...devReceivingAccount,
                              bankCard: { ...devReceivingAccount.bankCard, bankName: e.target.value }
                            })}
                            className="w-full font-bold px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950"
                          >
                            <option value="Rawbank RDC">Rawbank RDC</option>
                            <option value="Equity BCDC">Equity BCDC</option>
                            <option value="TMB RDC">TMB RDC</option>
                          </select>
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Raison Sociale Titulaire :</span>
                          <input
                            type="text"
                            value={devReceivingAccount.bankCard.holderName}
                            onChange={(e) => setDevReceivingAccount({
                              ...devReceivingAccount,
                              bankCard: { ...devReceivingAccount.bankCard, holderName: e.target.value }
                            })}
                            className="w-full font-bold px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Numéro de Compte / IBAN :</span>
                        <input
                          type="text"
                          value={devReceivingAccount.bankCard.accountNumber}
                          onChange={(e) => setDevReceivingAccount({
                            ...devReceivingAccount,
                            bankCard: { ...devReceivingAccount.bankCard, accountNumber: e.target.value }
                          })}
                          className="w-full font-mono font-bold px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-xs"
                        />
                      </div>

                      <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded border border-blue-200/40 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Jeton API Sécurisé :</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{devReceivingAccount.bankCard.merchantGatewayToken}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        onClick={() => {
                          setDoubleAuthModal({
                            isOpen: true,
                            title: "Double Validation Requise - Modification Comptes Concepteur",
                            description: "Veuillez entrer le code PIN d'autorisation SuperAdmin (1234) pour valider les modifications des comptes de réception des commissions.",
                            actionPayload: () => {
                              alert("Comptes récepteurs mis à jour avec succès dans le coffre-fort financier.");
                              setFinancialAuditLogs([
                                {
                                  id: `AUD-${Math.floor(Math.random()*9000+1000)}`,
                                  timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                                  actor: "SuperAdmin (FREDTECH)",
                                  role: "Concepteur Système",
                                  action: "MODIFICATION_COMPTES_CONCEPTEUR",
                                  details: "Comptes de réception mis à jour avec double validation PIN réussie.",
                                  ipAddress: "197.242.128.45",
                                  hashSignature: `SHA256: ${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
                                },
                                ...financialAuditLogs
                              ]);
                            }
                          });
                        }}
                        className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1 ml-auto"
                      >
                        <Lock className="h-3.5 w-3.5 text-amber-400" />
                        <span>Enregistrer (Double Validation)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Traceability & Split Wallet View */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      Registre Récent des Transactions & Répartition Automatique (Split Payment)
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Décomposition en direct du montant brut, de la commission SmartSchool et du versement net à l'école.
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-200">
                    Split Wallet Instantané
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[9px] font-black uppercase">
                        <th className="p-3">Réf. Transaction</th>
                        <th className="p-3">Établissement</th>
                        <th className="p-3">Élève & Motif</th>
                        <th className="p-3">Opérateur</th>
                        <th className="p-3">Paiement Brut Parent</th>
                        <th className="p-3">Net École (98%)</th>
                        <th className="p-3">Commission SmartSchool (2%)</th>
                        <th className="p-3">Statut Transfert</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { id: "TX-MPESA-8841", date: "2026-06-29 09:12", school: "Lycée Prince de Liège", student: "Mbuyi Kabeya", fee: "Minerval T3", channel: "Vodacom M-Pesa", gross: "100.00 USD", net: "98.00 USD", commission: "2.00 USD", splitStatus: "Succès Instantané", phone: "+243 812 888 102" },
                        { id: "TX-ORANGE-9923", date: "2026-06-29 08:45", school: "Complexe Scolaire Mgr Shaumba", student: "Naomi Mwamba", fee: "Frais d'Examen", channel: "Orange Money", gross: "50.00 USD", net: "49.00 USD", commission: "1.00 USD", splitStatus: "Succès Instantané", phone: "+243 890 123 999" },
                        { id: "TX-CARD-7721", date: "2026-06-29 07:30", school: "C.S. Cardinal Malula", student: "Tshibanda Gaston", fee: "Minerval T3", channel: "Rawbank Visa", gross: "150.00 USD", net: "147.00 USD", commission: "3.00 USD", splitStatus: "Succès Instantané", phone: "+243 820 444 111" }
                      ].map((pay, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-medium">
                          <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{pay.id}</td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{pay.school}</td>
                          <td className="p-3">{pay.student} ({pay.fee})</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{pay.channel}</span></td>
                          <td className="p-3 font-mono font-black text-slate-900 dark:text-slate-100">{pay.gross}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600">{pay.net}</td>
                          <td className="p-3 font-mono font-bold text-amber-600">{pay.commission}</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" /> {pay.splitStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedReceipt(pay)}
                              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center space-x-1"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Reçu & QR</span>
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

          {/* SUB-TAB 2: SCHOOL MERCHANT ACCOUNTS & API VALIDATION */}
          {financeSubTab === "merchants" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        Validation Marchande
                      </span>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Gestion & Vérification API des Comptes Marchands des Établissements
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chaque école enregistre ses comptes marchands Mobile Money ou bancaires. Le système interroge l'API du fournisseur de paiement pour vérifier leur validité.
                    </p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center space-x-2 text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 leading-tight">
                      Règle de Sécurité : Les comptes au statut non-validé ne peuvent jamais recevoir de fonds en direct.
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[9px] font-black uppercase">
                        <th className="p-3">Établissement & Code</th>
                        <th className="p-3">Opérateur / Banque</th>
                        <th className="p-3">Titulaire Légitime</th>
                        <th className="p-3">Numéro / RIB</th>
                        <th className="p-3">Statut API Marchand</th>
                        <th className="p-3">Jeton Passerelle API</th>
                        <th className="p-3">Actions de Vérification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {schoolMerchantAccountsList.map((merch, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-medium">
                          <td className="p-3 space-y-0.5">
                            <p className="font-bold text-slate-800 dark:text-slate-100">{merch.schoolName}</p>
                            <p className="text-[9px] text-slate-400 font-mono">{merch.codeNational}</p>
                          </td>
                          <td className="p-3 font-bold text-indigo-600">{merch.operator}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{merch.holderName}</td>
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">{merch.accountNumber}</td>
                          <td className="p-3">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit ${
                              merch.status === "Validé" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40" :
                              merch.status === "En attente de validation" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40" :
                              merch.status === "Suspendu" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40" :
                              "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40"
                            }`}>
                              {merch.status === "Validé" && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                              {merch.status === "En attente de validation" && <Clock className="h-3 w-3 text-amber-600 animate-spin" />}
                              {merch.status === "Suspendu" && <XCircle className="h-3 w-3 text-red-600" />}
                              {merch.status === "Erreur de connexion" && <AlertTriangle className="h-3 w-3 text-rose-600" />}
                              <span>{merch.status}</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-400">{merch.apiToken}</td>
                          <td className="p-3 space-x-1.5 flex items-center">
                            <button
                              onClick={() => {
                                // Simulate API verification
                                const updated = [...schoolMerchantAccountsList];
                                updated[i].status = "Validé";
                                updated[i].lastChecked = new Date().toISOString().replace('T', ' ').slice(0, 16);
                                setSchoolMerchantAccountsList(updated);

                                alert(`Vérification API exécutée avec succès auprès de ${merch.operator} : Le compte marchand de ${merch.schoolName} est officiellement VALIDÉ.`);

                                setFinancialAuditLogs([
                                  {
                                    id: `AUD-${Math.floor(Math.random()*9000+1000)}`,
                                    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                                    actor: "SuperAdmin (FREDTECH)",
                                    role: "Concepteur Système",
                                    action: "VALIDER_COMPTE_MARCHAND_API",
                                    details: `Compte ${merch.operator} de ${merch.schoolName} validé avec succès via API Provider.`,
                                    ipAddress: "197.242.128.45",
                                    hashSignature: `SHA256: ${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
                                  },
                                  ...financialAuditLogs
                                ]);
                              }}
                              className="bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 text-[10px] font-black px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer flex items-center space-x-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Tester API</span>
                            </button>

                            <button
                              onClick={() => {
                                setDoubleAuthModal({
                                  isOpen: true,
                                  title: `Suspension / Modification du Compte Marchand : ${merch.schoolName}`,
                                  description: "Veuillez saisir le code PIN d'autorisation SuperAdmin (1234) pour changer le statut marchand de cet établissement.",
                                  actionPayload: () => {
                                    const updated = [...schoolMerchantAccountsList];
                                    updated[i].status = updated[i].status === "Suspendu" ? "Validé" : "Suspendu";
                                    setSchoolMerchantAccountsList(updated);
                                    alert(`Statut du compte marchand mis à jour.`);
                                  }
                                });
                              }}
                              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-slate-200 cursor-pointer"
                            >
                              Changer Statut
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

          {/* SUB-TAB 3: FINANCIAL SECURITY & IMMUTABLE AUDIT LOG */}
          {financeSubTab === "security_audit" && (
            <div className="space-y-6">
              {/* Security Standards Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Shield className="h-5 w-5" />
                    <h4 className="font-bold text-xs uppercase">Cryptographie Anti-Altération</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Chaque action financière est signée par une empreinte SHA256 unique, rendant le journal d'audit totalement inaltérable.
                  </p>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Lock className="h-5 w-5" />
                    <h4 className="font-bold text-xs uppercase">Double Validation PIN</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Les modifications critiques (taux de commission, comptes marchands concepteur) exigent la saisie d'un code d'autorisation administrateur.
                  </p>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Fingerprint className="h-5 w-5" />
                    <h4 className="font-bold text-xs uppercase">Conformité Tokenisée PCI-DSS</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Aucune donnée brute de carte bancaire n'est conservée sur les serveurs. Seuls des jetons temporaires sécurisés sont échangés.
                  </p>
                </div>
              </div>

              {/* Audit Log Table */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      Journal d'Audit Financier Anti-Altération (SaaS Immutable Audit Trail)
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Horodatage certifié, adresse IP de l'opérateur et signatures de hachage cryptographique.
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded-full border border-emerald-200">
                    SHA256 Encrypted
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[9px] font-black uppercase">
                        <th className="p-3">Horodatage</th>
                        <th className="p-3">Acteur / Rôle</th>
                        <th className="p-3">Action Système</th>
                        <th className="p-3">Détails Opérationnels</th>
                        <th className="p-3">IP Operateur</th>
                        <th className="p-3">Empreinte Cryptographique (SHA256)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {financialAuditLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                          <td className="p-3 font-bold text-slate-600 dark:text-slate-300">{log.timestamp}</td>
                          <td className="p-3 text-indigo-600 font-bold">{log.actor} ({log.role})</td>
                          <td className="p-3"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 dark:text-slate-200">{log.action}</span></td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 font-sans">{log.details}</td>
                          <td className="p-3 text-slate-400">{log.ipAddress || "197.242.128.45"}</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] truncate max-w-[150px]">{log.hashSignature}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: MULTI-PARTY AUTOMATIC NOTIFICATIONS */}
          {financeSubTab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-purple-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        Diffusion Tripartite
                      </span>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Module de Notifications Automatiques Instantanées
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Après chaque règlement : le Parent reçoit le reçu PDF & QR, l'École reçoit la confirmation d'encaissement et le Concepteur reçoit la notification de commission.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
                      const newNotifs = [
                        {
                          id: `NOTIF-${Math.floor(Math.random()*9000+1000)}`,
                          recipientType: "Parent" as const,
                          recipientName: "Parent Test (+243 812 000 000)",
                          channel: "SMS Mobile Money + In-App",
                          title: "Confirmation de paiement Minerval",
                          message: "Votre versement de 100 USD pour l'élève Mbaye K. est validé. Reçu PDF N° REC-SIM8890 généré avec QR Code.",
                          timestamp: now,
                          status: "Délivré"
                        },
                        {
                          id: `NOTIF-${Math.floor(Math.random()*9000+1000)}`,
                          recipientType: "École" as const,
                          recipientName: "Comptabilité Lycée Prince de Liège",
                          channel: "Webhook API & Notification In-App",
                          title: "Encaissement Net Réceptionné",
                          message: "Nouveau versement net de 98.00 USD crédité sur votre compte marchand M-Pesa. Commission 2.00 USD prélevée.",
                          timestamp: now,
                          status: "Délivré"
                        },
                        {
                          id: `NOTIF-${Math.floor(Math.random()*9000+1000)}`,
                          recipientType: "SmartSchool RDC" as const,
                          recipientName: "Ir IT Fred Kalonda (FREDTECH)",
                          channel: "System Webhook & Email",
                          title: "Commission Plateforme Créditée",
                          message: "Commission de 2.00 USD (2%) générée et transférée vers le compte marchand FREDTECH.",
                          timestamp: now,
                          status: "Délivré"
                        }
                      ];
                      setPaymentNotificationLogs([...newNotifs, ...paymentNotificationLogs]);
                      alert("Simulation de paiement exécutée : 3 notifications distribuées simultanément (Parent, École, Concepteur).");
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="h-4 w-4" />
                    <span>Simuler Flux de Notification Tripartite</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentNotificationLogs.map((notif, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            notif.recipientType === "Parent" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                            notif.recipientType === "École" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" :
                            "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}>
                            Destinataire : {notif.recipientType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{notif.channel}</span>
                          <span className="text-[10px] font-mono text-slate-400">{notif.timestamp}</span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{notif.title}</h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 font-bold">À : {notif.recipientName}</p>
                      </div>

                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        ✓ {notif.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 5: RECONCILIATION MODULE */}
          {financeSubTab === "reconciliation" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        Module de Audit & Réconciliation
                      </span>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Réconciliation Financière Automatisée (Grand Livre vs Opérateurs vs Banques)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Comparaison continue des écritures SmartSchool RDC avec les relevés officiels Vodacom M-Pesa, Orange Money, Airtel Money et Rawbank.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      alert("Réconciliation automatisée lancée via Webhook API : Toutes les écritures SmartSchool RDC concordent à 100% avec les relevés des opérateurs Mobile Money et des banques (Écart 0.00 USD).");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Lancer Réconciliation Webhook API</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[9px] font-black uppercase">
                        <th className="p-3">Période Comptable</th>
                        <th className="p-3">Canal Opérateur</th>
                        <th className="p-3">Montant Registre SmartSchool</th>
                        <th className="p-3">Relevé Opérateur API</th>
                        <th className="p-3">Versement Banques</th>
                        <th className="p-3">Écart Décelé</th>
                        <th className="p-3">Statut Réconciliation</th>
                        <th className="p-3">Horodatage Vérification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {reconciliationRecords.map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{rec.period}</td>
                          <td className="p-3 font-bold text-indigo-600">{rec.channel}</td>
                          <td className="p-3 font-mono font-bold">{rec.smartSchoolLedgerAmount.toLocaleString()} USD</td>
                          <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{rec.providerStatementAmount.toLocaleString()} USD</td>
                          <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{rec.bankSettledAmount.toLocaleString()} USD</td>
                          <td className="p-3 font-mono font-black text-emerald-600">0.00 USD</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" /> {rec.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[10px]">{rec.lastVerifiedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DOUBLE AUTHORIZATION PIN MODAL */}
      {doubleAuthModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-sans font-black text-slate-900 dark:text-slate-100 text-sm uppercase">
                    {doubleAuthModal.title}
                  </h3>
                  <p className="text-[10px] text-slate-400">Sécurité Financière SmartSchool RDC</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setDoubleAuthModal({ isOpen: false, title: "", description: "", actionPayload: null });
                  setAuthPinInput("");
                  setAuthPinError("");
                }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {doubleAuthModal.description}
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block">Saisir Code PIN d'Autorisation Administrateur :</label>
              <input
                type="password"
                maxLength={4}
                value={authPinInput}
                onChange={(e) => {
                  setAuthPinInput(e.target.value);
                  setAuthPinError("");
                }}
                placeholder="Ex: 1234"
                className="w-full text-center text-xl font-mono tracking-widest font-black py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
              {authPinError && <p className="text-[10px] text-red-600 font-bold text-center">{authPinError}</p>}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  if (authPinInput === "1234" || authPinInput === "9988") {
                    if (doubleAuthModal.actionPayload) {
                      doubleAuthModal.actionPayload();
                    }
                    setDoubleAuthModal({ isOpen: false, title: "", description: "", actionPayload: null });
                    setAuthPinInput("");
                    setAuthPinError("");
                  } else {
                    setAuthPinError("Code PIN d'autorisation incorrect (Essayez : 1234)");
                  }
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Valider l'Opération
              </button>
              <button
                onClick={() => {
                  setDoubleAuthModal({ isOpen: false, title: "", description: "", actionPayload: null });
                  setAuthPinInput("");
                  setAuthPinError("");
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

          {/* Modal Receipt & Traceability Viewer */}
          {selectedReceipt && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Reçu Numérique Officiel
                    </span>
                    <h3 className="font-sans font-black text-slate-900 dark:text-slate-100 text-base uppercase mt-1">
                      Attestation de Paiement & Répartition
                    </h3>
                    <p className="text-xs text-slate-500">Traçabilité bilatérale SmartSchool RDC</p>
                  </div>

                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Top info */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 uppercase font-bold text-[9px]">Réf. Transaction :</span>
                      <span className="font-mono font-black text-slate-800 dark:text-slate-200">{selectedReceipt.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 uppercase font-bold text-[9px]">Établissement Bénéficiaire :</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedReceipt.school}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 uppercase font-bold text-[9px]">Élève :</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedReceipt.student} ({selectedReceipt.fee})</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 uppercase font-bold text-[9px]">Moyen de Paiement :</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedReceipt.channel}</span>
                    </div>
                  </div>

                  {/* Financial Split Breakdown */}
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Montant Total Payé :</span>
                      <span className="font-black text-white">{selectedReceipt.gross}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 pt-0.5">
                      <span>Part Net École (98%) :</span>
                      <span className="font-bold">{selectedReceipt.net}</span>
                    </div>
                    <div className="flex justify-between text-amber-400 pt-0.5">
                      <span>Commission SmartSchool RDC (2%) :</span>
                      <span className="font-bold">{selectedReceipt.commission}</span>
                    </div>
                  </div>

                  {/* QR Code Verification Simulation */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/50 flex items-center space-x-4">
                    <div className="bg-white p-2 rounded-xl shadow-xs border border-emerald-200">
                      {/* Generated QR code SVG representation */}
                      <svg className="w-16 h-16" viewBox="0 0 100 100">
                        <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                        <rect x="10" y="10" width="30" height="30" fill="#059669" />
                        <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                        <rect x="20" y="20" width="10" height="10" fill="#059669" />
                        
                        <rect x="60" y="10" width="30" height="30" fill="#059669" />
                        <rect x="65" y="15" width="20" height="20" fill="#ffffff" />
                        <rect x="70" y="20" width="10" height="10" fill="#059669" />

                        <rect x="10" y="60" width="30" height="30" fill="#059669" />
                        <rect x="15" y="65" width="20" height="20" fill="#ffffff" />
                        <rect x="20" y="70" width="10" height="10" fill="#059669" />

                        <rect x="50" y="50" width="10" height="10" fill="#059669" />
                        <rect x="70" y="50" width="15" height="10" fill="#059669" />
                        <rect x="50" y="70" width="20" height="15" fill="#059669" />
                        <rect x="75" y="75" width="15" height="15" fill="#059669" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase">
                        Tampon Numérique & QR Code Anti-Fraude
                      </p>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Scannable avec l'application mobile des inspecteurs et parents pour vérifier l'authenticité auprès des serveurs centraux SmartSchool RDC.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => {
                      alert(`Téléchargement du reçu numérique PDF pour la transaction ${selectedReceipt.id} en cours...`);
                      setSelectedReceipt(null);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Télécharger Reçu PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* MODULE 6: TECHNICAL SUPPORT */}
      {activeTab === "sa_support" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Centre d'Assistance & Support Client</h3>
            <p className="text-xs text-slate-500">Tickets d'aide technique escaladés par les directeurs et comptables d'écoles.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-black text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 px-2 py-0.5 rounded">
                      {ticket.id}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      ticket.priority === "Critique" ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400" :
                      ticket.priority === "Haute" ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                      "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                    }`}>
                      {ticket.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-400">{ticket.date}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{ticket.subject}</h4>
                  <p className="text-[10px] text-slate-500">
                    Établissement : <span className="font-bold text-slate-700 dark:text-slate-300">{ticket.school}</span> (Saisi par {ticket.author})
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl ${
                    ticket.status === "Résolu" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                    ticket.status === "En cours" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400" :
                    "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                  }`}>
                    {ticket.status}
                  </span>

                  {ticket.status !== "Résolu" && (
                    <button 
                      onClick={() => handleResolveTicket(ticket.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Marquer Résolu
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 7: AUDIT LOGS */}
      {activeTab === "sa_audit" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Journaux d'Activité de Sécurité (Audit Trail)</h3>
            <p className="text-xs text-slate-500">Registre chronologique inaltérable des actions exécutées par les administrateurs de la plateforme.</p>
          </div>

          <div className="bg-slate-950 text-slate-200 p-5 rounded-3xl border border-slate-900 font-mono text-[10px] space-y-3.5 shadow-xl relative">
            <div className="absolute top-4 right-4 text-slate-600 uppercase text-[9px] font-black">
              System Live Console
            </div>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-2 gap-1">
                  <div className="flex items-start space-x-2 min-w-0">
                    <span className="text-slate-500">[{log.date}]</span>
                    <span className="text-indigo-400 font-bold">[{log.user}]</span>
                    <span className="text-slate-300 truncate">{log.action}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-slate-500">({log.target})</span>
                    <span className={log.status === "Réussite" ? "text-emerald-400" : "text-rose-500 font-bold"}>
                      [{log.status}]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 8: SYSTEM SETTINGS & NATIONAL IDENTITY */}
      {activeTab === "sa_settings" && (
        <div className="space-y-8">
          {/* IDENTITÉ NATIONALE & RESSOURCES OFFICIELLES (SECTION PROPRIÉTAIRE) */}
          <NationalIdentitySettingsComponent
            currentUserRole={userRole}
            currentUserName={userName}
            onUpdateNationalIdentity={onUpdateNationalIdentity}
          />

          {/* PARAMÈTRES TECHNIQUES SECONDAIRES */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Configurations Techniques Secondaires</h3>
              <p className="text-xs text-slate-500">Sauvegardes automatiques et passerelles téléphoniques SMS.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Fréquence des Sauvegardes Système</label>
                  <select className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none">
                    <option>Toutes les heures (Recommandé)</option>
                    <option>Toutes les 12 heures</option>
                    <option>Une fois par jour</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Passerelle Téléphonique de Sécurisation (SMS)</label>
                  <select className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none">
                    <option>Vodacom RDC (API Passerelle)</option>
                    <option>Airtel RDC SMS Gateway</option>
                    <option>Orange RDC Carrier API</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 9: PROVINCES ÉDUCATIONNELLES */}
      {activeTab === "sa_provinces" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Provinces Éducationnelles de la RDC</h3>
              <p className="text-xs text-slate-500">Supervisez la répartition géographique, les budgets d'investissement et les directions provinciales.</p>
            </div>
            <button 
              onClick={() => setShowAddProvince(!showAddProvince)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer self-start"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddProvince ? "Masquer le formulaire" : "Ajouter une Province"}</span>
            </button>
          </div>

          {showAddProvince && (
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Enregistrer une Nouvelle Province</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nom de la Province</label>
                  <input 
                    type="text" 
                    placeholder="ex: Haut-Katanga" 
                    value={newProvName}
                    onChange={(e) => setNewProvName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Code Postal/ID</label>
                  <input 
                    type="text" 
                    placeholder="ex: HKT" 
                    value={newProvCode}
                    onChange={(e) => setNewProvCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Directeur Provincial (PROVED)</label>
                  <input 
                    type="text" 
                    placeholder="ex: M. Sylvain Nkulu" 
                    value={newProvDir}
                    onChange={(e) => setNewProvDir(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Budget d'allocation provincial</label>
                  <input 
                    type="text" 
                    placeholder="ex: 750,000 USD" 
                    value={newProvBudget}
                    onChange={(e) => setNewProvBudget(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <button 
                  onClick={() => setShowAddProvince(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    if (!newProvName || !newProvCode || !newProvDir) {
                      alert("Veuillez renseigner toutes les informations !");
                      return;
                    }
                    const newProv = {
                      id: String(provinces.length + 1),
                      name: newProvName,
                      code: newProvCode.toUpperCase(),
                      regionalDirector: newProvDir,
                      schoolsCount: 0,
                      studentsCount: 0,
                      budgetAllocation: newProvBudget,
                      status: "Actif"
                    };
                    setProvinces([...provinces, newProv]);
                    setNewProvName("");
                    setNewProvCode("");
                    setNewProvDir("");
                    setShowAddProvince(false);
                    alert(`La province de ${newProvName} a été configurée et activée sur la plateforme.`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Activer la Province
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {provinces.map((p) => (
              <div key={p.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                        {p.code}
                      </div>
                      <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">{p.name}</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {p.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-50 dark:border-slate-850 pt-2.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Directeur Provincial (PROVED) :</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{p.regionalDirector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Établissements enregistrés :</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{p.schoolsCount > 0 ? p.schoolsCount : schools.filter(s => s.province === p.name).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Élèves recensés :</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{p.studentsCount || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subvention allouée :</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.budgetAllocation}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-slate-50 dark:border-slate-850">
                  <button 
                    onClick={() => {
                      const newDir = prompt("Entrez le nom du nouveau Directeur Provincial :", p.regionalDirector);
                      if (newDir) {
                        setProvinces(provinces.map(prov => prov.id === p.id ? { ...prov, regionalDirector: newDir } : prov));
                        alert(`Le PROVED de la province ${p.name} a été changé.`);
                      }
                    }}
                    className="text-[10px] font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 py-1.5 px-3 rounded-lg flex-1 transition-colors border border-slate-100 dark:border-slate-900/40 cursor-pointer"
                  >
                    Changer PROVED
                  </button>
                  <button 
                    onClick={() => {
                      const val = prompt("Entrez le montant de la subvention :", p.budgetAllocation);
                      if (val) {
                        setProvinces(provinces.map(prov => prov.id === p.id ? { ...prov, budgetAllocation: val } : prov));
                        alert("Le budget a été réévalué.");
                      }
                    }}
                    className="text-[10px] font-bold bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 py-1.5 px-3 rounded-lg flex-1 transition-colors cursor-pointer"
                  >
                    Réévaluer budget
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 10: INSPECTIONS ET AUDITS */}
      {activeTab === "sa_inspections" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Corps National des Inspecteurs scolaires</h3>
              <p className="text-xs text-slate-500">Planifiez les audits de conformité, suivez les rapports et nommez les inspecteurs provinciaux.</p>
            </div>
            <button 
              onClick={() => setShowAddInspector(!showAddInspector)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer self-start"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddInspector ? "Masquer le formulaire" : "Nommer un Inspecteur"}</span>
            </button>
          </div>

          {showAddInspector && (
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Formulaire de Nomination d'Inspecteur</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nom Complet</label>
                  <input 
                    type="text" 
                    placeholder="ex: M. Joseph Kapenda" 
                    value={newInspName}
                    onChange={(e) => setNewInspName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Province assignée</label>
                  <select 
                    value={newInspProvince}
                    onChange={(e) => setNewInspProvince(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold"
                  >
                    {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Type d'Inspecteur</label>
                  <select 
                    value={newInspRole}
                    onChange={(e) => setNewInspRole(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold"
                  >
                    <option value="National">National (Général)</option>
                    <option value="Provincial">Provincial</option>
                    <option value="Itinérant">Itinérant</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Téléphone</label>
                  <input 
                    type="text" 
                    placeholder="ex: +243 812 000 000" 
                    value={newInspPhone}
                    onChange={(e) => setNewInspPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">E-mail Professionnel</label>
                  <input 
                    type="email" 
                    placeholder="ex: j.kapenda@epst.gouv.cd" 
                    value={newInspEmail}
                    onChange={(e) => setNewInspEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <button 
                  onClick={() => setShowAddInspector(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    if (!newInspName || !newInspPhone || !newInspEmail) {
                      alert("Veuillez remplir toutes les informations d'identification !");
                      return;
                    }
                    const newInsp = {
                      id: "INS-" + String(inspectors.length + 101),
                      name: newInspName,
                      province: newInspProvince,
                      role: newInspRole,
                      phone: newInspPhone,
                      email: newInspEmail,
                      status: "Actif"
                    };
                    setInspectors([...inspectors, newInsp]);
                    setNewInspName("");
                    setNewInspPhone("");
                    setNewInspEmail("");
                    setShowAddInspector(false);
                    alert(`L'inspecteur ${newInspName} a été assermenté et enregistré avec succès.`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Nommer Inspecteur
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of Inspectors */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Liste des inspecteurs actifs</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inspectors.map(insp => (
                  <div key={insp.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start space-x-3 shadow-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 text-indigo-600 rounded-xl shrink-0">
                      <Fingerprint className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-400">{insp.id}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          insp.status === "Actif" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        }`}>{insp.status}</span>
                      </div>
                      <h5 className="font-black text-slate-800 dark:text-slate-100 text-xs truncate">{insp.name}</h5>
                      <p className="text-[9px] text-slate-500 font-bold">{insp.role} • {insp.province}</p>
                      <div className="pt-1.5 text-[9px] text-slate-400 space-y-0.5 border-t border-slate-50 dark:border-slate-850">
                        <p>{insp.phone}</p>
                        <p className="truncate">{insp.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* List of Inspection Reports */}
            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Rapports d'audit récents</h4>
              <div className="space-y-3">
                {inspectionReports.map(rep => (
                  <div key={rep.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-indigo-500 font-bold">{rep.id}</span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        rep.status === "Traité" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                      }`}>{rep.status}</span>
                    </div>
                    <h5 className="font-black text-slate-800 dark:text-slate-100 text-xs">{rep.school}</h5>
                    <p className="text-[10px] text-slate-600 leading-relaxed italic">"{rep.findings}"</p>
                    <div className="flex justify-between items-center text-[9px] border-t border-slate-50 dark:border-slate-850 pt-2 text-slate-400 font-bold">
                      <span>Score: <span className="text-emerald-500">{rep.rating}</span></span>
                      <span>Le {rep.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 11: ANNÉES SCOLAIRES (TRANSITION / ROLLOVER) */}
      {activeTab === "sa_years" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Gestion des Années Scolaires et Rollover</h3>
              <p className="text-xs text-slate-500">Contrôlez l'ouverture et la clôture officielle des sessions. Automatisez la bascule des élèves et des classes.</p>
            </div>
            <button 
              onClick={() => setShowAddYear(!showAddYear)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer self-start"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddYear ? "Masquer le formulaire" : "Créer une Année"}</span>
            </button>
          </div>

          {showAddYear && (
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Planifier une Nouvelle Année Scolaire</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Intitulé de l'année</label>
                  <input 
                    type="text" 
                    placeholder="ex: 2026-2027" 
                    value={newYearLabel}
                    onChange={(e) => setNewYearLabel(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date officielle de rentrée</label>
                  <input 
                    type="date" 
                    value={newYearStart}
                    onChange={(e) => setNewYearStart(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date officielle de fin</label>
                  <input 
                    type="date" 
                    value={newYearEnd}
                    onChange={(e) => setNewYearEnd(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <button 
                  onClick={() => setShowAddYear(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    if (!newYearLabel || !newYearStart || !newYearEnd) {
                      alert("Veuillez remplir l'ensemble des champs.");
                      return;
                    }
                    const newYr = {
                      id: String(schoolYears.length + 1),
                      label: newYearLabel,
                      status: "Planification",
                      startDate: newYearStart,
                      endDate: newYearEnd,
                      registrationActive: true,
                      isCurrent: false
                    };
                    setSchoolYears([...schoolYears, newYr]);
                    setNewYearLabel("");
                    setNewYearStart("");
                    setNewYearEnd("");
                    setShowAddYear(false);
                    alert(`L'année scolaire ${newYearLabel} a été ajoutée aux registres de planification.`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Valider l'Année
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Chronologie des sessions d'apprentissage</h4>
              <div className="space-y-4">
                {schoolYears.map(yr => (
                  <div key={yr.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 dark:bg-slate-950 dark:hover:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-900/40 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-black text-slate-850 dark:text-slate-100 text-sm">Année Scolaire {yr.label}</h5>
                          {yr.isCurrent && (
                            <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                              Année en cours
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold">
                          Période légale : {yr.startDate} au {yr.endDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3.5">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl ${
                        yr.status === "Actif" ? "bg-emerald-50 text-emerald-600" :
                        yr.status === "Archivé" ? "bg-slate-100 text-slate-500" :
                        "bg-amber-50 text-amber-600"
                      }`}>{yr.status}</span>

                      {yr.status === "Actif" && (
                        <button 
                          onClick={() => {
                            if (confirm("ATTENTION : Clôturer l'année active va forcer la bascule (Rollover) de tous les élèves de RDC à la classe supérieure et archiver les cotes courantes. Êtes-vous sûr ?")) {
                              setSchoolYears(schoolYears.map(y => {
                                if (y.status === "Actif") return { ...y, status: "Archivé", isCurrent: false };
                                if (y.label === "2026-2027") return { ...y, status: "Actif", isCurrent: true };
                                return y;
                              }));
                              alert("Rollover exécuté avec succès ! Tous les élèves ont été inscrits dans l'année supérieure pour l'exercice 2026-2027.");
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          Clôturer et Exécuter Rollover
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 12: RÔLES & PERMISSIONS (MATRIX) */}
      {activeTab === "sa_roles" && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Matrice des Rôles et Permissions</h3>
            <p className="text-xs text-slate-500">Régulez les privilèges d'accès nationaux et restrictifs de chaque profil utilisateur au sein de la plateforme.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-widest text-[9px] font-black border-b border-slate-100 dark:border-slate-800">
                    <th className="p-4">Rôle & Cycle</th>
                    <th className="p-4 text-center">Gérer les Horaires</th>
                    <th className="p-4 text-center">Saisir les cotes</th>
                    <th className="p-4 text-center">Valider bulletins</th>
                    <th className="p-4 text-center">Voir les Finances</th>
                    <th className="p-4 text-center">Gérer utilisateurs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {rolesPermissions.map(role => (
                    <tr key={role.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="p-4">
                        <div className="font-black text-slate-800 dark:text-slate-100">{role.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{role.description} • <span className="font-black">{role.cycle}</span></div>
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={role.permissions.canSchedule} 
                          onChange={() => {
                            const updated = rolesPermissions.map(r => r.id === role.id ? { ...r, permissions: { ...r.permissions, canSchedule: !r.permissions.canSchedule } } : r);
                            setRolesPermissions(updated);
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={role.permissions.canGrade} 
                          onChange={() => {
                            const updated = rolesPermissions.map(r => r.id === role.id ? { ...r, permissions: { ...r.permissions, canGrade: !r.permissions.canGrade } } : r);
                            setRolesPermissions(updated);
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={role.permissions.canValidate} 
                          onChange={() => {
                            const updated = rolesPermissions.map(r => r.id === role.id ? { ...r, permissions: { ...r.permissions, canValidate: !r.permissions.canValidate } } : r);
                            setRolesPermissions(updated);
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={role.permissions.canViewFinances} 
                          onChange={() => {
                            const updated = rolesPermissions.map(r => r.id === role.id ? { ...r, permissions: { ...r.permissions, canViewFinances: !r.permissions.canViewFinances } } : r);
                            setRolesPermissions(updated);
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={role.permissions.canManageUsers} 
                          onChange={() => {
                            const updated = rolesPermissions.map(r => r.id === role.id ? { ...r, permissions: { ...r.permissions, canManageUsers: !r.permissions.canManageUsers } } : r);
                            setRolesPermissions(updated);
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 13: ANNONCES NATIONALES (COMMUNICATION) */}
      {activeTab === "sa_announcements" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Bulletins & Annonces Officielles de l'EPST</h3>
              <p className="text-xs text-slate-500">Diffusez des notes ministérielles, circulaires nationales, et instructions urgentes aux établissements.</p>
            </div>
            <button 
              onClick={() => setShowAddAnn(!showAddAnn)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer self-start"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddAnn ? "Masquer le formulaire" : "Publier une Annonce"}</span>
            </button>
          </div>

          {showAddAnn && (
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Rédiger un Communiqué Officiel</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sujet de l'annonce</label>
                    <input 
                      type="text" 
                      placeholder="ex: Rappel sur le calendrier scolaire officiel" 
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Audience Cible</label>
                    <select 
                      value={newAnnAudience}
                      onChange={(e) => setNewAnnAudience(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold"
                    >
                      <option value="Toutes les Écoles">Toutes les Écoles</option>
                      <option value="Écoles Primaires">Écoles Primaires uniquement</option>
                      <option value="Écoles Secondaires">Écoles Secondaires uniquement</option>
                      <option value="Inspecteurs et Auditeurs">Inspecteurs et Auditeurs</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Corps du Communiqué</label>
                  <textarea 
                    rows={4} 
                    placeholder="Rédigez le texte réglementaire ici..."
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-medium leading-relaxed"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <button 
                  onClick={() => setShowAddAnn(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    if (!newAnnTitle || !newAnnContent) {
                      alert("Veuillez remplir le titre et le contenu du communiqué !");
                      return;
                    }
                    const newAnn = {
                      id: "ANN-" + String(nationalAnnouncements.length + 101),
                      title: newAnnTitle,
                      content: newAnnContent,
                      audience: newAnnAudience,
                      date: "Aujourd'hui",
                      author: "Super Administrateur National",
                      views: 0
                    };
                    setNationalAnnouncements([newAnn, ...nationalAnnouncements]);
                    setNewAnnTitle("");
                    setNewAnnContent("");
                    setShowAddAnn(false);
                    alert("Le communiqué a été publié et est désormais visible par tous les utilisateurs concernés.");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Publier l'Annonce
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {nationalAnnouncements.map(ann => (
              <div key={ann.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-indigo-500 font-bold">{ann.id}</span>
                    <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      Cible: {ann.audience}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Publié le {ann.date} par {ann.author}</span>
                </div>
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs">{ann.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{ann.content}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-50 dark:border-slate-850 pt-2 font-bold">
                  <span>Lu par {ann.views} établissements</span>
                  <button 
                    onClick={() => {
                      setNationalAnnouncements(nationalAnnouncements.filter(a => a.id !== ann.id));
                      alert("Annonce retirée.");
                    }}
                    className="text-red-500 hover:text-red-600 font-black cursor-pointer text-[9px] uppercase"
                  >
                    Retirer du réseau
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 14: ANALYSTE IA NATIONAL (INTELLIGENCE & COHÉRENCE) */}
      {activeTab === "sa_ai_assistant" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Compliance anomalies / alerts */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">Alertes de Cohérence Nationale</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Fred IA • En temps réel</p>
                </div>
              </div>

              <div className="space-y-3 text-[11px] font-medium">
                <div className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-2xl space-y-1">
                  <p className="font-black text-red-700 dark:text-red-400">Surcharge d'heures d'enseignement</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    L'enseignant Jean-Pierre Mwamba est programmé pour 38h/semaine. La directive nationale de l'EPST limite la charge à 30h.
                  </p>
                </div>

                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl space-y-1">
                  <p className="font-black text-amber-700 dark:text-amber-400">Incohérence Pédagogique</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Matière 'Physique' programmée sans enseignant assigné en 5ème Scientifique au C.S. Cardinal Malula.
                  </p>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl space-y-1">
                  <p className="font-black text-indigo-700 dark:text-indigo-400">Alerte d'Abonnement</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Le C.S. Mgr Shaumba a dépassé la période de tolérance pour l'abonnement mensuel (retard de 6 jours).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Assistant */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[600px] shadow-sm">
            <div className="space-y-4 flex-1 flex flex-col justify-between overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="h-9 w-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                    IA
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs">Fred IA — Expert Réglementaire</h4>
                    <p className="text-[9px] text-emerald-500 font-bold flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Modèle EPST-Cohérence v2 • En ligne</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setAiMessages([
                    {
                      sender: "assistant",
                      text: "Bonjour Ir IT Fred Kalonda. Je suis Fred IA, votre analyste et conseiller réglementaire pour SmartSchool RDC. Comment puis-je vous aider ?"
                    }
                  ])}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-slate-400 transition-colors"
                  title="Réinitialiser la conversation"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 scrollbar-thin text-xs">
                {aiMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    {msg.sender === "assistant" ? (
                      <div className="h-7 w-7 bg-red-600 text-white font-black text-[9px] rounded-lg flex items-center justify-center shrink-0">
                        IA
                      </div>
                    ) : (
                      <div className="h-7 w-7 bg-indigo-600 text-white font-black text-[9px] rounded-lg flex items-center justify-center shrink-0">
                        FK
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl font-medium leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/20 dark:border-slate-800/30"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiIsTyping && (
                  <div className="flex items-center space-x-2.5 mr-auto">
                    <div className="h-7 w-7 bg-red-600 text-white font-black text-[9px] rounded-lg flex items-center justify-center shrink-0">
                      IA
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl rounded-tl-none text-slate-400 font-bold tracking-widest text-[10px]">
                      Fred IA réfléchit...
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Query suggestions */}
              <div className="border-t border-slate-50 dark:border-slate-850 pt-3">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2">Requêtes analytiques suggérées :</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Quelles sont les anomalies d'heures d'enseignement ?",
                    "Rapport de conformité pour la gratuité du primaire",
                    "Fais-moi l'analyse d'abonnement des écoles"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiChatInput(chip);
                      }}
                      className="text-[9px] font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-850 text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input message form */}
            <div className="flex items-center space-x-2 mt-3.5 border-t border-slate-50 dark:border-slate-850 pt-3.5">
              <input
                type="text"
                placeholder="Posez une question réglementaire ou d'audit..."
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (!aiChatInput.trim()) return;
                    const text = aiChatInput;
                    setAiChatInput("");
                    
                    // Add user message
                    const updatedMsgs = [...aiMessages, { sender: "user", text }];
                    setAiMessages(updatedMsgs);
                    setAiIsTyping(true);

                    // Simulate AI response
                    setTimeout(() => {
                      let aiResponse = "Je procède actuellement à l'analyse de cohésion de vos bases de données scolaires pour y valider les normes réglementaires nationales.";
                      const normText = text.toLowerCase();
                      
                      if (normText.includes("anomalie") || normText.includes("heure") || normText.includes("surcharge")) {
                        aiResponse = "ANALYSE DE COHÉRENCE : L'Inspecteur Général a relevé que l'enseignant Jean-Pierre Mwamba est programmé à hauteur de 38 heures de cours par semaine à Kinshasa. Cela viole le décret d'organisation pédagogique de l'EPST fixant la charge maximale d'un enseignant à 30 heures par semaine. Une action d'ajustement horaire ou de recrutement d'un enseignant suppléant est requise.";
                      } else if (normText.includes("gratuité") || normText.includes("frais") || normText.includes("primaire")) {
                        aiResponse = "RAPPORT DE CONFORMITÉ (GRATUITÉ) : En vertu de la constitution de la RDC et des directives ministérielles de l'EPST, l'enseignement primaire dans les établissements publics conventionnés et non conventionnés est strictement gratuit. Nos algorithmes d'analyse ont audité 100% des établissements primaires recensés : aucun frais illégal d'inscription ou de bulletin n'a été décelé ce mois-ci sur SmartSchool RDC.";
                      } else if (normText.includes("abonnement") || normText.includes("facture") || normText.includes("paye")) {
                        aiResponse = "ÉTAT DES LICENCES D'ABONNEMENT : 14 établissements sur 17 sont parfaitement à jour de leur redevance d'utilisation SmartSchool RDC. Deux établissements bénéficient d'un sursis d'enregistrement. Le Complexe Scolaire Mgr Shaumba accuse un retard d'abonnement de 6 jours (facture SUB-004, montant de 150 USD échue). Une relance automatique a été émise.";
                      }
                      
                      setAiMessages([...updatedMsgs, { sender: "assistant", text: aiResponse }]);
                      setAiIsTyping(false);
                    }, 1200);
                  }
                }}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none font-medium"
              />
              <button 
                onClick={() => {
                  if (!aiChatInput.trim()) return;
                  const text = aiChatInput;
                  setAiChatInput("");
                  
                  const updatedMsgs = [...aiMessages, { sender: "user", text }];
                  setAiMessages(updatedMsgs);
                  setAiIsTyping(true);

                  setTimeout(() => {
                    let aiResponse = "Je procède actuellement à l'analyse de cohésion de vos bases de données scolaires pour y valider les normes réglementaires nationales.";
                    const normText = text.toLowerCase();
                    
                    if (normText.includes("anomalie") || normText.includes("heure") || normText.includes("surcharge")) {
                      aiResponse = "ANALYSE DE COHÉRENCE : L'Inspecteur Général a relevé que l'enseignant Jean-Pierre Mwamba est programmé à hauteur de 38 heures de cours par semaine à Kinshasa. Cela viole le décret d'organisation pédagogique de l'EPST fixant la charge maximale d'un enseignant à 30 heures par semaine. Une action d'ajustement horaire ou de recrutement d'un enseignant suppléant est requise.";
                    } else if (normText.includes("gratuité") || normText.includes("frais") || normText.includes("primaire")) {
                      aiResponse = "RAPPORT DE CONFORMITÉ (GRATUITÉ) : En vertu de la constitution de la RDC et des directives ministérielles de l'EPST, l'enseignement primaire dans les établissements publics conventionnés et non conventionnés est strictement gratuit. Nos algorithmes d'analyse ont audité 100% des établissements primaires recensés : aucun frais illégal d'inscription ou de bulletin n'a été décelé ce mois-ci sur SmartSchool RDC.";
                    } else if (normText.includes("abonnement") || normText.includes("facture") || normText.includes("paye")) {
                      aiResponse = "ÉTAT DES LICENCES D'ABONNEMENT : 14 établissements sur 17 sont parfaitement à jour de leur redevance d'utilisation SmartSchool RDC. Deux établissements bénéficient d'un sursis d'enregistrement. Le Complexe Scolaire Mgr Shaumba accuse un retard d'abonnement de 6 jours (facture SUB-004, montant de 150 USD échue). Une relance automatique a été émise.";
                    }
                    
                    setAiMessages([...updatedMsgs, { sender: "assistant", text: aiResponse }]);
                    setAiIsTyping(false);
                  }, 1200);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODULE: CENTRE GLOBAL DE GESTION DES FONCTIONNALITÉS (SUPER ADMIN EXCLUSIF) */}
      {activeTab === "sa_features" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-600 text-white text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full">
                  Exclusif Créateur RDC
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Souveraineté & Pilotage Système
                </span>
              </div>
              <h3 className="font-sans font-black text-slate-800 dark:text-slate-100 text-base uppercase tracking-wider mt-1 flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-indigo-600" />
                <span>Centre Global d'Activation & Limite des Fonctionnalités</span>
              </h3>
              <p className="text-xs text-slate-500">
                Activez, désactivez ou limitez les fonctionnalités du système à l'échelle nationale, par établissement, par province ou par rôle.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  alert("Configuration des fonctionnalités sauvegardée et répercutée en temps réel sur toute la plateforme.");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Sauvegarder les Directives</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative md:col-span-2">
              <Search className="absolute inset-y-0 left-3.5 h-4 w-4 text-slate-400 my-auto" />
              <input
                type="text"
                placeholder="Rechercher une fonctionnalité (ex: Messagerie, Mobile Money, Bulletins)..."
                value={featureSearch}
                onChange={e => setFeatureSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none"
              />
            </div>
            <div>
              <select
                value={featureCategoryFilter}
                onChange={e => setFeatureCategoryFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">Toutes les Catégories</option>
                <option value="Communication">Communication</option>
                <option value="Finances">Finances</option>
                <option value="Pédagogie">Pédagogie</option>
                <option value="Impression">Impression</option>
                <option value="Administration">Administration</option>
                <option value="Sécurité">Sécurité</option>
              </select>
            </div>
          </div>

          {/* Features Table / Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {features
                .filter(f => {
                  if (featureCategoryFilter !== "all" && f.category !== featureCategoryFilter) return false;
                  if (featureSearch.trim() && !f.name.toLowerCase().includes(featureSearch.toLowerCase())) return false;
                  return true;
                })
                .map(feat => (
                  <div key={feat.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          feat.category === "Communication" ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40" :
                          feat.category === "Finances" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" :
                          feat.category === "Pédagogie" ? "bg-purple-50 text-purple-600 dark:bg-purple-950/40" :
                          "bg-slate-100 text-slate-600 dark:bg-slate-800"
                        }`}>
                          {feat.category}
                        </span>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{feat.name}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-medium">
                        <span>Écoles : <strong className="text-slate-700 dark:text-slate-300">{feat.allowedSchools === "all" ? "Toutes" : "Sélectionnées"}</strong></span>
                        <span>Provinces : <strong className="text-slate-700 dark:text-slate-300">{feat.allowedProvinces === "all" ? "Toutes" : "Sélectionnées"}</strong></span>
                        <span>Rôles : <strong className="text-slate-700 dark:text-slate-300">{feat.allowedRoles === "all" ? "Tous" : "Sélectionnés"}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${
                        feat.status === "active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" :
                        feat.status === "limited" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                        "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}>
                        {feat.status === "active" ? "Actif (National)" : feat.status === "limited" ? "Limité" : "Désactivé"}
                      </span>

                      <button
                        onClick={() => toggleFeatureStatus(feat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          feat.status === "active"
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40"
                            : "bg-emerald-600 text-white hover:bg-emerald-500"
                        }`}
                      >
                        {feat.status === "active" ? "Désactiver" : "Activer"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      </ErrorBoundary>
    </div>
  );
}
