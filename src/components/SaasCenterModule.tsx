import React, { useState, useEffect } from "react";
import { 
  Server, Building, Users, Key, Shield, Activity, Clock, Plus, Search, 
  Filter, Check, X, AlertTriangle, RefreshCw, Sliders, Download, Eye, Zap, 
  Database, Cpu, Layers, Lock, Unlock, Send, Globe, Calendar, DollarSign, 
  CheckCircle2, XCircle, Terminal, Smartphone, Mail, FileText, Sparkles, 
  Laptop, RotateCcw, FileSpreadsheet, ShieldAlert, Fingerprint, HardDrive, 
  Wifi, WifiOff, Edit, Trash2, ArrowUpRight, CheckCircle, ShieldCheck,
  Percent, ToggleLeft, ToggleRight, TrendingUp, BarChart3, Award, Printer
} from "lucide-react";
import { School as SchoolType } from "../types";

interface SaasCenterModuleProps {
  schools: SchoolType[];
  onUpdateSchool?: (school: SchoolType) => void;
  onAddSchool?: (school: SchoolType) => void;
  onDeleteSchool?: (schoolId: string) => void;
}

export function SaasCenterModule({ schools: initialSchools, onUpdateSchool, onAddSchool, onDeleteSchool }: SaasCenterModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>("registre");

  // 1. REGISTRE CENTRAL DES ÉCOLES & IDENTIFIANT UNIQUE
  const [schoolsList, setSchoolsList] = useState<any[]>(() => {
    return initialSchools.map((s, idx) => ({
      ...s,
      schoolId: s.codeNational ? `SSRDC-${s.codeNational}` : `SSRDC-00000${idx + 1}`,
      establishmentCode: `EPST-${s.province ? s.province.substring(0, 3).toUpperCase() : "KIN"}-${100 + idx}`,
      apiKey: `sk_live_ssrdc_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`,
      createdAt: "2025-09-01",
      activationDate: "2025-09-02",
      expirationDate: "2026-08-31",
      version: "v4.8.2-Enterprise",
      status: idx % 4 === 3 ? "Suspendu" : "Actif",
      promoter: (s as any).directorName || "Promoteur Établissement",
      phone: (s as any).phonePrincipal || (s as any).phone || "+243 810 000 000",
      email: s.contactEmail || (s as any).email || `contact@${s.name.toLowerCase().replace(/\s+/g, '')}.cd`,
      studentsCount: (s as any).studentsCount || 450,
      teachersCount: Math.floor(((s as any).studentsCount || 450) / 18),
      usersCount: ((s as any).studentsCount || 450) + Math.floor(((s as any).studentsCount || 450) / 18) + 12,
      plan: idx % 3 === 0 ? "Premium" : idx % 3 === 1 ? "Professionnel" : "Standard",
      lastLogin: `${Math.floor(Math.random() * 55) + 1} min`,
      storageUsedGB: (Math.random() * 45 + 5).toFixed(1),
      maxStorageGB: 100,
      licenseKey: `LIC-RDC-${Math.floor(1000 + Math.random() * 9000)}-2026-PROV`,
      digitalSignature: `SIG-EPST-OK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }));
  });

  const [searchSchool, setSearchSchool] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [planFilter, setPlanFilter] = useState("Tous");

  // Remote Inspection Modal State
  const [inspectSchool, setInspectSchool] = useState<any | null>(null);

  // Edit / Add School Modal
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolProvince, setNewSchoolProvince] = useState("Kinshasa");
  const [newSchoolCity, setNewSchoolCity] = useState("Kinshasa");
  const [newSchoolPromoter, setNewSchoolPromoter] = useState("");
  const [newSchoolPhone, setNewSchoolPhone] = useState("");
  const [newSchoolEmail, setNewSchoolEmail] = useState("");
  const [newSchoolPlan, setNewSchoolPlan] = useState("Standard");

  // 2. ABONNEMENTS & LIMITES CONFIGURABLES
  const [plans, setPlans] = useState([
    { id: "p1", name: "Gratuit", maxStudents: 50, maxTeachers: 5, maxParents: 50, maxUsers: 100, maxStorageGB: 5, maxSMS: 100, maxEmails: 500, maxBackups: 1, maxApi: 100, priceUSD: 0, status: "Actif" },
    { id: "p2", name: "Standard", maxStudents: 300, maxTeachers: 20, maxParents: 300, maxUsers: 600, maxStorageGB: 25, maxSMS: 1000, maxEmails: 5000, maxBackups: 7, maxApi: 2000, priceUSD: 250, status: "Actif" },
    { id: "p3", name: "Professionnel", maxStudents: 800, maxTeachers: 50, maxParents: 800, maxUsers: 1600, maxStorageGB: 100, maxSMS: 5000, maxEmails: 20000, maxBackups: 30, maxApi: 10000, priceUSD: 600, status: "Actif" },
    { id: "p4", name: "Premium", maxStudents: 2000, maxTeachers: 120, maxParents: 2000, maxUsers: 4000, maxStorageGB: 500, maxSMS: 20000, maxEmails: 100000, maxBackups: 90, maxApi: 50000, priceUSD: 1200, status: "Actif" },
    { id: "p5", name: "Entreprise", maxStudents: 10000, maxTeachers: 500, maxParents: 10000, maxUsers: 20000, maxStorageGB: 2000, maxSMS: 100000, maxEmails: 500000, maxBackups: 365, maxApi: 500000, priceUSD: 3000, status: "Actif" },
    { id: "p6", name: "Personnalisé (Gouvernement)", maxStudents: 50000, maxTeachers: 2500, maxParents: 50000, maxUsers: 100000, maxStorageGB: 10000, maxSMS: 500000, maxEmails: 2000000, maxBackups: 1000, maxApi: 2000000, priceUSD: 8000, status: "Actif" }
  ]);

  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  // 3. FEATURE MATRIX (CENTRE DES FONCTIONNALITÉS)
  const [featuresList, setFeaturesList] = useState([
    { id: "f1", name: "Messagerie Intelligente & Pièces Jointes", key: "messaging", category: "Communication", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" },
    { id: "f2", name: "Paiements Mobile Money Directs (M-Pesa, Orange, Airtel)", key: "mobile_money", category: "Finances", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" },
    { id: "f3", name: "Bibliothèque Numérique & Médiathèque CNR", key: "library", category: "Pédagogie", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" },
    { id: "f4", name: "Inventaire & Gestion Matérielle", key: "inventory", category: "Administration", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" },
    { id: "f5", name: "Ressources Humaines & Fiches de Paie", key: "rh", category: "RH & Paie", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "Professionnel,Premium,Entreprise" },
    { id: "f6", name: "Transport Scolaire & Géolocalisation Bus", key: "transport", category: "Services", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "Premium,Entreprise" },
    { id: "f7", name: "Cantine Scolaire & Abonnements Repas", key: "cantine", category: "Services", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" },
    { id: "f8", name: "Module Inspection Officielle EPST", key: "inspection", category: "Souveraineté", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" },
    { id: "f9", name: "Assistant Analyste IA National & Prédictions", key: "ai_assistant", category: "IA & Data", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" },
    { id: "f10", name: "API REST & Webhooks d'Intégration", key: "api_access", category: "Developer", status: "limited", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "Premium,Entreprise" },
    { id: "f11", name: "Scan QR Code Présences & Cartes d'Élèves", key: "qrcode_attendance", category: "Pédagogie", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" },
    { id: "f12", name: "Sauvegardes Automatiques Cloud & Local", key: "backups", category: "Sécurité", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" },
    { id: "f13", name: "Bulletins Numériques EPST & Signatures", key: "bulletins", category: "Pédagogie", status: "active", scheduledActivation: "2026-01-01", scheduledDeactivation: "", targetSchools: "all", targetProvince: "all", targetPlan: "all" }
  ]);

  // 4. SURVEILLANCE TEMPS RÉEL (TELEMETRY)
  const [telemetry, setTelemetry] = useState({
    connectedSchools: 18,
    totalSchools: 24,
    activeUsersNow: 1420,
    liveConnections: 3840,
    paymentsProcessedUSD: 184500,
    smsSentTotal: 84200,
    emailsSentTotal: 412000,
    systemErrorsCount: 2,
    serverCpuLoad: 18.4,
    serverRamLoad: 42.1,
    storageUsedTB: 4.8,
    totalStorageTB: 20.0,
    backupsStatus: "Opérationnel (Dernière: 12 min)"
  });

  // 5. PARAMÈTRES GLOBAUX SAAS
  const [platformConfig, setPlatformConfig] = useState({
    platformName: "SmartSchool RDC SaaS Platform",
    logoUrl: "",
    version: "v4.8.2-Enterprise-RDC",
    maintenanceMode: false,
    environmentMode: "Production", // Demo, Production, Test
    systemMessage: "Bienvenue sur le portail national SmartSchool RDC. Session administrative active.",
    globalBroadcastNotification: "Avis EPST : Les clôtures du 2ème trimestre sont ouvertes pour toutes les provinces."
  });

  // 6. CENTRES DE MISES À JOUR (DEPLOYMENT CENTER)
  const [releaseHistory, setReleaseHistory] = useState([
    { version: "v4.8.2-Enterprise-RDC", releaseDate: "2026-06-01", targetSchools: "Toutes les écoles (100%)", status: "Déployé", notes: "Optimisation de l'exportation des bulletins PDF et intégration des paiements Airtel Money direct." },
    { version: "v4.8.1-Enterprise-RDC", releaseDate: "2026-04-15", targetSchools: "Province de Kinshasa", status: "Déployé", notes: "Correction mineure du module d'inspection EPST et mise à jour des grilles horaires." },
    { version: "v4.8.0-Major", releaseDate: "2026-02-01", targetSchools: "Toutes les écoles", status: "Déployé", notes: "Refonte majeure de l'Assistant IA National et de l'annuaire d'établissement." }
  ]);
  const [newDeployVersion, setNewDeployVersion] = useState("v4.9.0-Pro-RDC");
  const [newDeployTarget, setNewDeployTarget] = useState("Toutes");
  const [newDeployNotes, setNewDeployNotes] = useState("");

  // 7. JOURNAL GLOBAL D'AUDIT
  const [auditLogs, setAuditLogs] = useState([
    { id: "LOG-1001", timestamp: "2026-08-08 11:42:10", school: "Lycée Prince de Liège", user: "Admin Mbaye", province: "Kinshasa", action: "Validation des fiches de paie RH (Juillet 2026)", ip: "197.234.221.10", severity: "Info" },
    { id: "LOG-1002", timestamp: "2026-08-08 11:20:05", school: "Complexe Scolaire Shaumba", user: "Comptable Sarah", province: "Kinshasa", action: "Paiement Minerval M-Pesa de 45 USD enregistré", ip: "41.243.12.88", severity: "Success" },
    { id: "LOG-1003", timestamp: "2026-08-08 10:15:40", school: "C.S. Cardinal Malula", user: "Directeur Joseph", province: "Kinshasa", action: "Génération du bulletin de notes d'élève (6ème Primaire)", ip: "197.234.190.5", severity: "Info" },
    { id: "LOG-1004", timestamp: "2026-08-08 09:05:12", school: "Collège Alfajiri", user: "Inconnu (Tentative)", province: "Sud-Kivu", action: "Tentative de connexion échouée (Mot de passe incorrect 3x)", ip: "105.178.42.19", severity: "Avertissement" },
    { id: "LOG-1005", timestamp: "2026-08-08 08:30:00", school: "Institut Mwanga", user: "Système Cron", province: "Nord-Kivu", action: "Sauvegarde Cloud automatique réussie (12.4 GB)", ip: "10.0.0.1", severity: "Success" }
  ]);
  const [auditSearch, setAuditSearch] = useState("");

  // 8. SÉCURITÉ SAAS
  const [securitySessions, setSecuritySessions] = useState([
    { id: "SESS-101", user: "Créateur / Super Admin (Vous)", role: "SuperAdmin RDC", ip: "197.234.221.1", location: "Kinshasa, RDC", device: "Chrome sur macOS", status: "Session Active", twoFactorAuth: "Activé" },
    { id: "SESS-102", user: "Inspecteur Gén. Gaston Mukala", role: "Inspection EPST", ip: "41.243.12.14", location: "Kinshasa, RDC", device: "Safari sur iPad OS", status: "Actif (il y a 5 min)", twoFactorAuth: "Activé" },
    { id: "SESS-103", user: "Directeur C.S. Shaumba", role: "Chef d'Établissement", ip: "197.234.198.12", location: "Kinshasa, RDC", device: "Edge sur Windows 11", status: "Actif (il y a 12 min)", twoFactorAuth: "Désactivé" }
  ]);

  // 9. GESTION DES ABONNEMENTS, ESSAIS & COMMISSIONS
  const [globalTrialEnabled, setGlobalTrialEnabled] = useState(true);
  const [globalTrialDays, setGlobalTrialDays] = useState(30);
  const [globalTrialStartDate, setGlobalTrialStartDate] = useState("2026-08-01");
  const [globalTrialEndDate, setGlobalTrialEndDate] = useState("2026-08-31");
  const [alertJ7Enabled, setAlertJ7Enabled] = useState(true);
  const [alertJ3Enabled, setAlertJ3Enabled] = useState(true);
  const [alertJ1Enabled, setAlertJ1Enabled] = useState(true);

  // Per-School Trial & Commission Settings
  const [schoolConfigs, setSchoolConfigs] = useState<any[]>([
    {
      id: "sch-101",
      schoolName: "Lycée Prince de Liège",
      codeNational: "884102-KIN",
      province: "Kinshasa",
      trialEnabled: true,
      trialDays: 30,
      trialStartDate: "2026-08-01",
      trialEndDate: "2026-08-31",
      trialStatus: "En essai (23j restants)",
      trialAlertJ7Sent: false,
      trialAlertJ3Sent: false,
      trialAlertJ1Sent: false,
      commissionEnabled: true,
      customRatePercent: 1.5,
      isExempt: false,
      exemptionReason: "",
      currentPlan: "Premium"
    },
    {
      id: "sch-102",
      schoolName: "Complexe Scolaire Mgr Shaumba",
      codeNational: "884105-KIN",
      province: "Kinshasa",
      trialEnabled: true,
      trialDays: 30,
      trialStartDate: "2026-07-10",
      trialEndDate: "2026-08-09",
      trialStatus: "Alerte J-1 (Expire Demain)",
      trialAlertJ7Sent: true,
      trialAlertJ3Sent: true,
      trialAlertJ1Sent: true,
      commissionEnabled: true,
      customRatePercent: 2.0,
      isExempt: false,
      exemptionReason: "",
      currentPlan: "Standard"
    },
    {
      id: "sch-103",
      schoolName: "C.S. Cardinal Malula",
      codeNational: "884110-KIN",
      province: "Kinshasa",
      trialEnabled: false,
      trialDays: 30,
      trialStartDate: "2026-05-01",
      trialEndDate: "2026-05-31",
      trialStatus: "Abonné Payant",
      trialAlertJ7Sent: true,
      trialAlertJ3Sent: true,
      trialAlertJ1Sent: true,
      commissionEnabled: true,
      customRatePercent: 2.0,
      isExempt: false,
      exemptionReason: "",
      currentPlan: "Professionnel"
    },
    {
      id: "sch-104",
      schoolName: "Institut Technique de N'djili",
      codeNational: "884201-NDJ",
      province: "Kinshasa",
      trialEnabled: false,
      trialDays: 30,
      trialStartDate: "2026-06-01",
      trialEndDate: "2026-07-01",
      trialStatus: "Exonéré (École Publique)",
      trialAlertJ7Sent: true,
      trialAlertJ3Sent: true,
      trialAlertJ1Sent: true,
      commissionEnabled: false,
      customRatePercent: 0.0,
      isExempt: true,
      exemptionReason: "Directive MINEPSP Gratuité",
      currentPlan: "Standard"
    },
    {
      id: "sch-105",
      schoolName: "Collège Boboto",
      codeNational: "884101-KIN",
      province: "Kinshasa",
      trialEnabled: true,
      trialDays: 30,
      trialStartDate: "2026-07-15",
      trialEndDate: "2026-08-14",
      trialStatus: "Alerte J-7",
      trialAlertJ7Sent: true,
      trialAlertJ3Sent: false,
      trialAlertJ1Sent: false,
      commissionEnabled: true,
      customRatePercent: 2.0,
      isExempt: false,
      exemptionReason: "",
      currentPlan: "Premium"
    }
  ]);

  // Global Commission Configuration
  const [commissionsGlobalEnabled, setCommissionsGlobalEnabled] = useState(true);
  const [commissionsDefaultRate, setCommissionsDefaultRate] = useState(2.0);
  const [commissionsEffectiveDate, setCommissionsEffectiveDate] = useState("2026-08-01");

  // Official Ledger Registers
  const [commissionLedger, setCommissionLedger] = useState<any[]>([
    {
      id: "TX-COMM-8001",
      timestamp: "2026-08-08 12:30:15",
      schoolName: "Lycée Prince de Liège",
      province: "Kinshasa",
      paymentType: "Minerval Trimestre 3",
      channel: "M-Pesa Vodacom",
      grossAmountUSD: 100.00,
      appliedRatePercent: 1.5,
      commissionAmountUSD: 1.50,
      netAmountSchoolUSD: 98.50,
      settlementStatus: "Prélévé Automatiquement",
      isExempt: false
    },
    {
      id: "TX-COMM-8002",
      timestamp: "2026-08-08 11:15:40",
      schoolName: "Complexe Scolaire Mgr Shaumba",
      province: "Kinshasa",
      paymentType: "Frais d'Examen D'État",
      channel: "Orange Money RDC",
      grossAmountUSD: 50.00,
      appliedRatePercent: 2.0,
      commissionAmountUSD: 1.00,
      netAmountSchoolUSD: 49.00,
      settlementStatus: "Prélévé Automatiquement",
      isExempt: false
    },
    {
      id: "TX-COMM-8003",
      timestamp: "2026-08-08 10:05:22",
      schoolName: "C.S. Cardinal Malula",
      province: "Kinshasa",
      paymentType: "Acompte Minerval T1 2026-2027",
      channel: "Rawbank Visa/Mastercard",
      grossAmountUSD: 250.00,
      appliedRatePercent: 2.0,
      commissionAmountUSD: 5.00,
      netAmountSchoolUSD: 245.00,
      settlementStatus: "Prélévé Automatiquement",
      isExempt: false
    },
    {
      id: "TX-COMM-8004",
      timestamp: "2026-08-08 09:40:00",
      schoolName: "Institut Technique de N'djili",
      province: "Kinshasa",
      paymentType: "Frais de Bulletin EPST",
      channel: "Airtel Money RDC",
      grossAmountUSD: 15.00,
      appliedRatePercent: 0.0,
      commissionAmountUSD: 0.00,
      netAmountSchoolUSD: 15.00,
      settlementStatus: "Exonéré (0%)",
      isExempt: true
    },
    {
      id: "TX-COMM-8005",
      timestamp: "2026-08-07 16:20:10",
      schoolName: "Collège Boboto",
      province: "Kinshasa",
      paymentType: "Frais de Réinscription",
      channel: "M-Pesa Vodacom",
      grossAmountUSD: 120.00,
      appliedRatePercent: 2.0,
      commissionAmountUSD: 2.40,
      netAmountSchoolUSD: 117.60,
      settlementStatus: "Prélévé Automatiquement",
      isExempt: false
    }
  ]);

  const [commissionSearch, setCommissionSearch] = useState("");
  const [commissionStatusFilter, setCommissionStatusFilter] = useState("Tous");

  // Modals for Extension, Conversion, and PDF Report
  const [extendTrialModalSchool, setExtendTrialModalSchool] = useState<any | null>(null);
  const [extensionDaysToAdd, setExtensionDaysToAdd] = useState(15);
  const [convertPaidModalSchool, setConvertPaidModalSchool] = useState<any | null>(null);
  const [newPaidPlanSelected, setNewPaidPlanSelected] = useState("Professionnel");
  const [pdfReportModalOpen, setPdfReportModalOpen] = useState(false);

  // Handlers for Abonnements & Commissions
  const handleSaveGlobalTrial = () => {
    const log = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      school: "Plateforme Nationale SaaS",
      user: "Super Admin (FREDTECH)",
      province: "Kinshasa",
      action: `Mise à jour Période Essai: ${globalTrialDays} jours (Début: ${globalTrialStartDate}, Fin: ${globalTrialEndDate}). Alerts J-7, J-3, J-1 actives.`,
      ip: "197.234.221.1",
      severity: "Success"
    };
    setAuditLogs(prev => [log, ...prev]);
    alert("Paramètres globaux de la période d'essai enregistrés avec succès.");
  };

  const handleSaveGlobalCommissions = () => {
    const log = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      school: "Plateforme Nationale SaaS",
      user: "Super Admin (FREDTECH)",
      province: "Kinshasa",
      action: `Barème Global Commissions mis à jour: ${commissionsDefaultRate}% (Actif: ${commissionsGlobalEnabled ? "Oui" : "Non"}, Effet: ${commissionsEffectiveDate}).`,
      ip: "197.234.221.1",
      severity: "Success"
    };
    setAuditLogs(prev => [log, ...prev]);
    alert("Nouveau barème des commissions enregistré et appliqué au registre.");
  };

  const handleConfirmExtendTrial = () => {
    if (!extendTrialModalSchool) return;
    setSchoolConfigs(prev => prev.map(s => {
      if (s.id === extendTrialModalSchool.id) {
        const newDays = (s.trialDays || 30) + extensionDaysToAdd;
        return {
          ...s,
          trialDays: newDays,
          trialStatus: `En essai (+${extensionDaysToAdd}j accordés)`,
          trialEnabled: true
        };
      }
      return s;
    }));

    const log = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      school: extendTrialModalSchool.schoolName,
      user: "Super Admin (FREDTECH)",
      province: extendTrialModalSchool.province || "Kinshasa",
      action: `Extension de la période d'essai gratuit de +${extensionDaysToAdd} jours accordée à ${extendTrialModalSchool.schoolName}.`,
      ip: "197.234.221.1",
      severity: "Success"
    };
    setAuditLogs(prev => [log, ...prev]);
    setExtendTrialModalSchool(null);
    alert(`Période d'essai prolongée de +${extensionDaysToAdd} jours pour ${extendTrialModalSchool.schoolName}.`);
  };

  const handleConfirmConvertPaid = () => {
    if (!convertPaidModalSchool) return;
    setSchoolConfigs(prev => prev.map(s => {
      if (s.id === convertPaidModalSchool.id) {
        return {
          ...s,
          trialEnabled: false,
          trialStatus: "Abonné Payant",
          currentPlan: newPaidPlanSelected
        };
      }
      return s;
    }));

    const log = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      school: convertPaidModalSchool.schoolName,
      user: "Super Admin (FREDTECH)",
      province: convertPaidModalSchool.province || "Kinshasa",
      action: `Conversion d'essai vers Abonnement Payant Plan ${newPaidPlanSelected} pour ${convertPaidModalSchool.schoolName}.`,
      ip: "197.234.221.1",
      severity: "Success"
    };
    setAuditLogs(prev => [log, ...prev]);
    setConvertPaidModalSchool(null);
    alert(`${convertPaidModalSchool.schoolName} est désormais abonnée au Plan Payant ${newPaidPlanSelected}.`);
  };

  const handleStopTrial = (school: any) => {
    if (!confirm(`Voulez-vous vraiment arrêter la période d'essai pour ${school.schoolName} ?`)) return;
    setSchoolConfigs(prev => prev.map(s => {
      if (s.id === school.id) {
        return {
          ...s,
          trialEnabled: false,
          trialStatus: "Essai Arrété (Expiration anticipée)"
        };
      }
      return s;
    }));

    const log = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      school: school.schoolName,
      user: "Super Admin (FREDTECH)",
      province: school.province || "Kinshasa",
      action: `Arrêt anticipé de la période d'essai pour ${school.schoolName}.`,
      ip: "197.234.221.1",
      severity: "Avertissement"
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleToggleSchoolExemption = (schoolId: string) => {
    setSchoolConfigs(prev => prev.map(s => {
      if (s.id === schoolId) {
        const nextExempt = !s.isExempt;
        const log = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          school: s.schoolName,
          user: "Super Admin (FREDTECH)",
          province: s.province || "Kinshasa",
          action: `Exonération des commissions ${nextExempt ? "ACTIVÉE (0%)" : "DÉSACTIVÉE"} pour ${s.schoolName}.`,
          ip: "197.234.221.1",
          severity: nextExempt ? "Avertissement" : "Info"
        };
        setAuditLogs(l => [log, ...l]);
        return {
          ...s,
          isExempt: nextExempt,
          customRatePercent: nextExempt ? 0 : s.customRatePercent || commissionsDefaultRate,
          trialStatus: nextExempt ? "Exonéré (0%)" : s.trialStatus
        };
      }
      return s;
    }));
  };

  const handleExportCSV = () => {
    let csv = "ID_Transaction,Date_Heure,Ecole,Province,Paiement,Canal,Montant_Brut_USD,Taux_Percent,Commission_USD,Net_Ecole_USD,Statut\n";
    commissionLedger.forEach(row => {
      csv += `${row.id},${row.timestamp},"${row.schoolName}",${row.province},"${row.paymentType}",${row.channel},${row.grossAmountUSD},${row.appliedRatePercent},${row.commissionAmountUSD},${row.netAmountSchoolUSD},${row.settlementStatus}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Registre_Commissions_SmartSchoolRDC_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    handleExportCSV();
  };

  // Handle toggling school status (Actif, Suspendu, Désactivé)
  const handleToggleSchoolStatus = (schoolId: string) => {
    setSchoolsList(prev => prev.map(s => {
      if (s.id === schoolId || s.schoolId === schoolId) {
        const nextStatus = s.status === "Actif" ? "Suspendu" : s.status === "Suspendu" ? "Désactivé" : "Actif";
        if (onUpdateSchool) {
          onUpdateSchool({ ...s, status: nextStatus });
        }
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // Add new school handler
  const handleCreateNewSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    const count = schoolsList.length + 1;
    const newSchoolObj: any = {
      id: `sch-${Date.now()}`,
      name: newSchoolName,
      schoolId: `SSRDC-${100000 + count}`,
      establishmentCode: `EPST-${newSchoolProvince.substring(0, 3).toUpperCase()}-${300 + count}`,
      apiKey: `sk_live_ssrdc_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`,
      province: newSchoolProvince,
      city: newSchoolCity,
      commune: "Gombe",
      address: "Avenue de l'Éducation n°12",
      promoter: newSchoolPromoter || "Promoteur Établissement",
      phone: newSchoolPhone || "+243 810 000 000",
      email: newSchoolEmail || `info@${newSchoolName.toLowerCase().replace(/\s+/g, '')}.cd`,
      createdAt: new Date().toISOString().split('T')[0],
      activationDate: new Date().toISOString().split('T')[0],
      expirationDate: "2027-08-31",
      version: "v4.8.2-Enterprise",
      status: "Actif",
      studentsCount: 250,
      teachersCount: 15,
      usersCount: 280,
      plan: newSchoolPlan,
      lastLogin: "À l'instant",
      storageUsedGB: "1.2",
      maxStorageGB: 50,
      licenseKey: `LIC-RDC-${Math.floor(1000 + Math.random() * 9000)}-2027-NEW`,
      digitalSignature: `SIG-EPST-OK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };

    setSchoolsList(prev => [newSchoolObj, ...prev]);
    if (onAddSchool) {
      onAddSchool(newSchoolObj);
    }

    setNewSchoolName("");
    setNewSchoolPromoter("");
    setNewSchoolPhone("");
    setNewSchoolEmail("");
    setShowAddSchoolModal(false);
    alert(`✓ Établissement "${newSchoolName}" enregistré avec succès ! Identifiant attribué : ${newSchoolObj.schoolId}`);
  };

  // Deploy new release
  const handleDeployRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeployVersion.trim()) return;

    const newRelease = {
      version: newDeployVersion,
      releaseDate: new Date().toISOString().split('T')[0],
      targetSchools: newDeployTarget === "Toutes" ? "Toutes les écoles (100%)" : `Écoles cibles : ${newDeployTarget}`,
      status: "Déployé",
      notes: newDeployNotes || "Mise à jour système générale déployée par le Super Administrateur."
    };

    setReleaseHistory(prev => [newRelease, ...prev]);
    setNewDeployNotes("");
    alert(`🚀 La version ${newDeployVersion} a été déployée avec succès sur ${newRelease.targetSchools} !`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL / BANNIÈRE SAAS EXECUTIVE */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Server className="h-80 w-80 -mr-16 -mt-16 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-red-600 text-white font-mono font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                <ShieldCheck className="h-3 w-3" />
                <span>EXCLUSIF CRÉATEUR SMARTSCHOOL RDC</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>RÉSEAU SAAS SOUVERAIN EN LIGNE</span>
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center space-x-3">
              <span>Centre de Gestion SaaS SmartSchool RDC</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl font-medium leading-relaxed">
              Console d'administration souveraine et de télémesure multi-établissements. Pilotez le réseau scolaire, contrôlez les abonnements, les fonctionnalités et la sécurité nationale depuis une interface centrale unifiée.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddSchoolModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Connecter un Établissement</span>
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL NAVIGATION SUB-TABS */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: "registre", label: "Registre Central Écoles", icon: Building },
          { id: "abonnements", label: "Abonnements & Limites", icon: DollarSign },
          { id: "commissions_essai", label: "Abonnements & Commissions", icon: Percent },
          { id: "fonctionnalites", label: "Matrice Fonctionnalités", icon: Sliders },
          { id: "licences", label: "Centre des Licences", icon: Key },
          { id: "surveillance", label: "Surveillance Temps Réel", icon: Activity },
          { id: "deploiement", label: "Mises à Jour & Releases", icon: RotateCcw },
          { id: "audit", label: "Journal d'Audit Global", icon: Clock },
          { id: "securite", label: "Sécurité & Accès", icon: ShieldAlert },
          { id: "parametres", label: "Paramètres Globaux", icon: HardDrive }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 shrink-0 transition-all cursor-pointer ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. REGISTRE CENTRAL DES ÉCOLES & IDENTIFIANT UNIQUE */}
      {activeSubTab === "registre" && (
        <div className="space-y-6">
          {/* Top Filters & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative md:col-span-2">
              <Search className="absolute inset-y-0 left-3.5 h-4 w-4 text-slate-400 my-auto" />
              <input
                type="text"
                placeholder="Rechercher par nom, School ID, Code EPST, promoteur..."
                value={searchSchool}
                onChange={e => setSearchSchool(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                value={provinceFilter}
                onChange={e => setProvinceFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="Tous">Toutes les Provinces</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Kongo Central">Kongo Central</option>
                <option value="Haut-Katanga">Haut-Katanga</option>
                <option value="Nord-Kivu">Nord-Kivu</option>
                <option value="Sud-Kivu">Sud-Kivu</option>
                <option value="Lualaba">Lualaba</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="Tous">Tous les Statuts</option>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Désactivé">Désactivé</option>
              </select>
            </div>
          </div>

          {/* Central Schools Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
                  Registre Central des Établissements RDC ({schoolsList.length})
                </h3>
                <p className="text-[10px] text-slate-500">
                  Identifiants uniques immuables SSRDC-XXXXXX attribués automatiquement lors de la création.
                </p>
              </div>

              <button
                onClick={() => {
                  alert("Exportation du Registre Central générée au format CSV / Excel.");
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exporter Registre CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3">Établissement & ID</th>
                    <th className="p-3">Localisation</th>
                    <th className="p-3">Promoteur & Contacts</th>
                    <th className="p-3 text-center">Effectifs & Stockage</th>
                    <th className="p-3">Plan & Expiration</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions de Contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {schoolsList
                    .filter(s => {
                      if (provinceFilter !== "Tous" && s.province !== provinceFilter) return false;
                      if (statusFilter !== "Tous" && s.status !== statusFilter) return false;
                      if (searchSchool.trim() && !s.name.toLowerCase().includes(searchSchool.toLowerCase()) && !s.schoolId.toLowerCase().includes(searchSchool.toLowerCase())) return false;
                      return true;
                    })
                    .map(sch => (
                      <tr key={sch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xs shrink-0">
                              {sch.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs">{sch.name}</h4>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className="font-mono font-bold text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                                  {sch.schoolId}
                                </span>
                                <span className="font-mono text-[9px] text-slate-400">{sch.establishmentCode}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{sch.province || "Kinshasa"}</div>
                          <div className="text-[10px] text-slate-400">{sch.city || "Kinshasa"}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{sch.promoter}</div>
                          <div className="text-[10px] font-mono text-slate-400">{sch.phone}</div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{sch.studentsCount} élèves</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sch.storageUsedGB} GB / {sch.maxStorageGB} GB</div>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold rounded text-[10px] block w-fit mb-1">
                            {sch.plan}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Exp : {sch.expirationDate}</span>
                        </td>

                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            sch.status === "Actif" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" :
                            sch.status === "Suspendu" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                            "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}>
                            {sch.status}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setInspectSchool(sch)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg text-[10px] flex items-center space-x-1 cursor-pointer"
                              title="Infiltration / Télémesure de l'école"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Inspecter</span>
                            </button>

                            <button
                              onClick={() => handleToggleSchoolStatus(sch.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                                sch.status === "Actif" 
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40" 
                                  : "bg-emerald-600 text-white"
                              }`}
                            >
                              {sch.status === "Actif" ? "Suspendre" : "Réactiver"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABONNEMENTS & LIMITES CONFIGURABLES */}
      {activeSubTab === "abonnements" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span>Plans d'Abonnement SaaS & Limites Système</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Configurez les quotas de stockage, d'élèves, d'enseignants, d'e-mails et de requêtes API par offre.
              </p>
            </div>
          </div>

          {/* Grid of Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4 hover:border-indigo-500 transition-all relative">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">Plan Offert</span>
                    <h4 className="font-black text-lg text-slate-900 dark:text-white">{plan.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-xl text-emerald-600">{plan.priceUSD} $</span>
                    <span className="text-[9px] text-slate-400 block">/ an / école</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500 font-medium">Élèves Max :</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.maxStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500 font-medium">Enseignants Max :</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.maxTeachers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500 font-medium">Utilisateurs Total :</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.maxUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500 font-medium">Stockage Cloud :</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.maxStorageGB} GB</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500 font-medium">SMS Notifications :</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.maxSMS.toLocaleString()} / an</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500 font-medium">Requêtes API :</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plan.maxApi.toLocaleString()} / mois</span>
                  </div>
                </div>

                <button
                  onClick={() => setEditingPlan(plan)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Modifier Quotas & Tarification</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.b. GESTION DES ABONNEMENTS, ESSAIS & COMMISSIONS */}
      {activeSubTab === "commissions_essai" && (
        <div className="space-y-6">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight flex items-center space-x-2">
                <Percent className="h-6 w-6 text-indigo-600" />
                <span>Gestion des Abonnements, Périodes d'Essai & Commissions</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Centre d'administration des essais gratuits (30 jours), alertes de relance J-7/J-3/J-1, barème des commissions Mobile Money & enregistrement comptable au registre officiel.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPdfReportModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-2 transition-all hover:scale-105"
              >
                <FileText className="h-4 w-4" />
                <span>Rapport PDF Officiel</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-2 transition-all hover:scale-105"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Exporter Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* TOP KPI CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Transactions</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">1 482</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> 100% Validées
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Volume Brut Encaissé</span>
              <div className="text-xl font-black text-indigo-600 font-mono">184 500,00 $</div>
              <span className="text-[10px] text-slate-500 font-medium">Mobile Money & Cards</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Commissions</span>
              <div className="text-xl font-black text-emerald-600 font-mono">3 690,00 $</div>
              <span className="text-[10px] text-emerald-600 font-bold">Taux moyen : {commissionsDefaultRate}%</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Solde Net Écoles</span>
              <div className="text-xl font-black text-slate-800 dark:text-slate-200 font-mono">180 810,00 $</div>
              <span className="text-[10px] text-indigo-500 font-bold">À reverser aux comptes</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Périodes d'Essai</span>
              <div className="text-xl font-black text-amber-500 font-mono">4 Écoles</div>
              <span className="text-[10px] text-amber-600 font-bold">1 Alerte J-1 active</span>
            </div>
          </div>

          {/* SECTION 1: CONFIGURATION PÉRIODE D'ESSAI GRATUITE */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-2xl">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Période d'Essai Gratuite Globale
                  </h4>
                  <p className="text-xs text-slate-500">
                    Définissez la durée initiale offerte à chaque nouvel établissement avec décompte automatique et système de notification avant expiration.
                  </p>
                </div>
              </div>

              {/* Global Trial Toggle Switch */}
              <button
                onClick={() => setGlobalTrialEnabled(!globalTrialEnabled)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  globalTrialEnabled 
                    ? "bg-amber-500 text-white shadow-md" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {globalTrialEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                <span>{globalTrialEnabled ? "Période d'Essai ACTIVÉE" : "Période d'Essai DÉSACTIVÉE"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Durée par défaut (Jours)</label>
                <input
                  type="number"
                  value={globalTrialDays}
                  onChange={e => setGlobalTrialDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Date de Début par Défaut</label>
                <input
                  type="date"
                  value={globalTrialStartDate}
                  onChange={e => setGlobalTrialStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Date de Fin Estimée</label>
                <input
                  type="date"
                  value={globalTrialEndDate}
                  onChange={e => setGlobalTrialEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSaveGlobalTrial}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Enregistrer Paramètres d'Essai</span>
                </button>
              </div>
            </div>

            {/* PRE-EXPIRY NOTIFICATIONS STATUS & TRIGGERS */}
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl space-y-3">
              <span className="font-extrabold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wide block">
                Alertes et Relances Automatiques d'Expiration de l'Essai :
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${alertJ7Enabled ? "bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700" : "bg-slate-100 opacity-60"}`}>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Alerte J-7 (7 Jours Avant)</span>
                    <span className="text-[10px] text-slate-500">Notification in-app + Email promoteur</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertJ7Enabled}
                    onChange={e => setAlertJ7Enabled(e.target.checked)}
                    className="h-4 w-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${alertJ3Enabled ? "bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700" : "bg-slate-100 opacity-60"}`}>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Alerte J-3 (3 Jours Avant)</span>
                    <span className="text-[10px] text-slate-500">SMS Direct + Alerte Bannière Directeur</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertJ3Enabled}
                    onChange={e => setAlertJ3Enabled(e.target.checked)}
                    className="h-4 w-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${alertJ1Enabled ? "bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700" : "bg-slate-100 opacity-60"}`}>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">Alerte J-1 (Dernier Jour)</span>
                    <span className="text-[10px] text-amber-600 font-bold">Relance d'urgence + Option de conversion</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertJ1Enabled}
                    onChange={e => setAlertJ1Enabled(e.target.checked)}
                    className="h-4 w-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CENTRE DE CONFIGURATION DES COMMISSIONS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Centre de Configuration des Commissions
                  </h4>
                  <p className="text-xs text-slate-500">
                    Définition du taux de commission prélevé automatiquement sur chaque transaction financière Mobile Money et Carte Bancaire.
                  </p>
                </div>
              </div>

              {/* Global Commissions Toggle Switch */}
              <button
                onClick={() => setCommissionsGlobalEnabled(!commissionsGlobalEnabled)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  commissionsGlobalEnabled 
                    ? "bg-emerald-600 text-white shadow-md" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {commissionsGlobalEnabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                <span>{commissionsGlobalEnabled ? "Commissions ACTIVÉES" : "Commissions DÉSACTIVÉES"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Taux de Commission Global (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={commissionsDefaultRate}
                    onChange={e => setCommissionsDefaultRate(Number(e.target.value))}
                    className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-indigo-600 text-base"
                  />
                  <span className="absolute right-3 top-3 font-bold text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Date d'Entrée en Vigueur</label>
                <input
                  type="date"
                  value={commissionsEffectiveDate}
                  onChange={e => setCommissionsEffectiveDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={handleSaveGlobalCommissions}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Enregistrer & Appliquer le Taux de {commissionsDefaultRate}%</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex items-start space-x-3 text-xs">
              <Zap className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-emerald-900 dark:text-emerald-200">
                <strong>Principe de Calcul Automatique :</strong> Lors de chaque paiement effectué par les parents via Mobile Money (M-Pesa, Orange, Airtel, Afrimoney) ou Carte Bancaire, la commission de <strong>{commissionsDefaultRate}%</strong> est calculée à la volée. L'école perçoit immédiatement <strong>{(100 - commissionsDefaultRate).toFixed(1)}%</strong> nets et la commission est comptabilisée dans le Registre Officiel de SmartSchool RDC.
              </div>
            </div>
          </div>

          {/* SECTION 3: PARAMÈTRES ET GESTION PAR ÉTABLISSEMENT */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Paramètres Spécifiques par Établissement
                </h4>
                <p className="text-xs text-slate-500">
                  Ajustez les droits d'essai, le taux de commission personnalisé, l'exonération et le statut d'abonnement pour chaque école.
                </p>
              </div>
            </div>

            {/* SCHOOLS CONFIG TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold">
                    <th className="p-3">Établissement</th>
                    <th className="p-3">Plan Actuel</th>
                    <th className="p-3">Période d'Essai</th>
                    <th className="p-3">Commissions</th>
                    <th className="p-3">Taux (%)</th>
                    <th className="p-3">Exonération</th>
                    <th className="p-3 text-right">Actions SuperAdmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {schoolConfigs.map(sch => (
                    <tr key={sch.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors">
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 dark:text-white">{sch.schoolName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sch.codeNational} • {sch.province}</div>
                      </td>

                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-[10px] border border-indigo-200/50 dark:border-indigo-800/40">
                          {sch.currentPlan}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] inline-block ${
                            sch.trialStatus.includes("Alerte J-1") ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                            sch.trialStatus.includes("Alerte J-7") ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                            sch.trialStatus.includes("Abonné") ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                            sch.trialStatus.includes("Exonéré") ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" :
                            "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {sch.trialStatus}
                          </span>
                          {sch.trialEnabled && (
                            <div className="text-[9px] text-slate-400">Du {sch.trialStartDate} au {sch.trialEndDate}</div>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSchoolConfigs(prev => prev.map(s => s.id === sch.id ? { ...s, commissionEnabled: !s.commissionEnabled } : s));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors ${
                            sch.commissionEnabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {sch.commissionEnabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>{sch.commissionEnabled ? "Activée" : "Désactivée"}</span>
                        </button>
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          step="0.1"
                          disabled={sch.isExempt}
                          value={sch.customRatePercent}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setSchoolConfigs(prev => prev.map(s => s.id === sch.id ? { ...s, customRatePercent: val } : s));
                          }}
                          className="w-16 p-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center rounded-lg text-xs"
                        />
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => handleToggleSchoolExemption(sch.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            sch.isExempt ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {sch.isExempt ? "Exonéré (0%)" : "Non Exonéré"}
                        </button>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setExtendTrialModalSchool(sch)}
                            title="Prolonger l'essai gratuit"
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 rounded-lg text-[10px] font-bold cursor-pointer flex items-center space-x-1"
                          >
                            <Clock className="h-3 w-3" />
                            <span>Prolonger</span>
                          </button>

                          <button
                            onClick={() => setConvertPaidModalSchool(sch)}
                            title="Transformer en abonnement payant"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer flex items-center space-x-1"
                          >
                            <DollarSign className="h-3 w-3" />
                            <span>Convertir Payant</span>
                          </button>

                          {sch.trialEnabled && (
                            <button
                              onClick={() => handleStopTrial(sch)}
                              title="Arrêter l'essai"
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Arrêter
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: REGISTRE OFFICIEL DES COMMISSIONS & REVERSEMENTS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <Database className="h-4 w-4 text-indigo-600" />
                  <span>Registre Officiel des Commissions Encaissées</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Consignation chronologique inaltérable de chaque prélèvement de commission sur les frais scolaires.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute inset-y-0 left-2.5 h-3.5 w-3.5 text-slate-400 my-auto" />
                  <input
                    type="text"
                    placeholder="Chercher transaction, école..."
                    value={commissionSearch}
                    onChange={e => setCommissionSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>

                <select
                  value={commissionStatusFilter}
                  onChange={e => setCommissionStatusFilter(e.target.value)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  <option value="Tous">Tous Statuts</option>
                  <option value="Prélévé Automatiquement">Prélévé Automatiquement</option>
                  <option value="Exonéré (0%)">Exonéré (0%)</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer hover:bg-slate-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* LEDGER TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold">
                    <th className="p-3">Ref Transaction</th>
                    <th className="p-3">Date & Heure</th>
                    <th className="p-3">Établissement</th>
                    <th className="p-3">Canal de Paiement</th>
                    <th className="p-3">Montant Brut</th>
                    <th className="p-3">Taux (%)</th>
                    <th className="p-3">Commission SmartSchool</th>
                    <th className="p-3">Net École</th>
                    <th className="p-3">Statut Réversement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {commissionLedger
                    .filter(tx => {
                      const matchSearch = tx.schoolName.toLowerCase().includes(commissionSearch.toLowerCase()) || tx.id.toLowerCase().includes(commissionSearch.toLowerCase());
                      const matchStatus = commissionStatusFilter === "Tous" || tx.settlementStatus === commissionStatusFilter;
                      return matchSearch && matchStatus;
                    })
                    .map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors">
                        <td className="p-3 font-bold text-indigo-600">{tx.id}</td>
                        <td className="p-3 text-slate-500 text-[10px]">{tx.timestamp}</td>
                        <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                          {tx.schoolName}
                          <span className="text-[9px] text-slate-400 block">{tx.province} • {tx.paymentType}</span>
                        </td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-[10px]">
                            {tx.channel}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{tx.grossAmountUSD.toFixed(2)} $</td>
                        <td className="p-3 text-amber-600 font-bold">{tx.appliedRatePercent}%</td>
                        <td className="p-3 font-bold text-emerald-600">{tx.commissionAmountUSD.toFixed(2)} $</td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{tx.netAmountSchoolUSD.toFixed(2)} $</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            tx.isExempt ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}>
                            {tx.settlementStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 5: JOURNAL D'AUDIT SPÉCIFIQUE DES ABONNEMENTS ET COMMISSIONS */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">
                  Journal de Traçabilité Inaltérable (Audit Trail Commissions & Essais)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Clef Cryptographique SHA-256 Validée
              </span>
            </div>

            <div className="divide-y divide-slate-800 text-xs font-mono">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px]">{log.timestamp} • IP: {log.ip}</span>
                    <p className="text-slate-200 font-sans font-medium">{log.action}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded text-[10px] border border-indigo-800/40 shrink-0 self-start sm:self-auto">
                    {log.user}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MATRICE DES FONCTIONNALITÉS */}
      {activeSubTab === "fonctionnalites" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-indigo-600" />
                <span>Centre des Fonctionnalités & Feature Flags</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Activez, désactivez ou programmez l'activation de chaque module sur toute la plateforme ou par ciblage.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {featuresList.map(feat => (
                <div key={feat.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-mono text-[9px] font-bold">
                        {feat.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{feat.name}</h4>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Clé système: <strong className="text-indigo-600 dark:text-indigo-400">{feat.key}</strong> • Plans cibles: {feat.targetPlan}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      feat.status === "active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" :
                      feat.status === "limited" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                      "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    }`}>
                      {feat.status === "active" ? "Actif (Plateforme)" : feat.status === "limited" ? "Limité" : "Désactivé"}
                    </span>

                    <button
                      onClick={() => {
                        setFeaturesList(prev => prev.map(f => {
                          if (f.id === feat.id) {
                            const next = f.status === "active" ? "disabled" : "active";
                            return { ...f, status: next };
                          }
                          return f;
                        }));
                      }}
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

      {/* 4. CENTRE DES LICENCES */}
      {activeSubTab === "licences" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <Key className="h-5 w-5 text-indigo-600" />
                <span>Centre des Licences & Signatures Numériques EPST</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Génération, renouvellement et validation cryptographique des licences d'exploitation des écoles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schoolsList.map(sch => (
              <div key={sch.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{sch.name}</h4>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 font-mono font-bold text-[9px] rounded">
                    {sch.schoolId}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1 font-mono text-[10px]">
                  <div className="text-slate-400">Clé de Licence Officielle:</div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold select-all">{sch.licenseKey}</div>
                  <div className="text-slate-400 mt-2">Signature Cryptographique:</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold select-all">{sch.digitalSignature}</div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Expire le : <strong>{sch.expirationDate}</strong></span>
                  <button
                    onClick={() => {
                      alert(`✓ Licence de "${sch.name}" prolongée d'une année supplémentaire (Jusqu'en 2028). Nouvelle signature numérique générée.`);
                    }}
                    className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg hover:bg-emerald-500 cursor-pointer"
                  >
                    Prolonger Licence
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SURVEILLANCE TEMPS RÉEL (TELEMETRY & SERVER LOAD) */}
      {activeSubTab === "surveillance" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <span>Télémesure & Surveillance Serveur en Temps Réel</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Indicateurs de performance réseau, charge processeur, trafic et sauvegardes nationales.
              </p>
            </div>
          </div>

          {/* Grid of Telemetry Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Écoles Connectées</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{telemetry.connectedSchools} / {telemetry.totalSchools}</div>
              <span className="text-[10px] text-emerald-600 font-bold">98.4% Disponibilité</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Utilisateurs En Ligne</span>
              <div className="text-2xl font-black text-indigo-600 font-mono">{telemetry.activeUsersNow.toLocaleString()}</div>
              <span className="text-[10px] text-slate-400 font-medium">Session Live</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Charge CPU / RAM</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{telemetry.serverCpuLoad}% / {telemetry.serverRamLoad}%</div>
              <span className="text-[10px] text-emerald-600 font-bold">Optimale (Cloud Run)</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Volume Paiements SaaS</span>
              <div className="text-2xl font-black text-emerald-600 font-mono">{telemetry.paymentsProcessedUSD.toLocaleString()} USD</div>
              <span className="text-[10px] text-slate-400 font-medium">Mobile Money & Carte</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. MISES À JOUR & RELEASES (DEPLOYMENT CENTER) */}
      {activeSubTab === "deploiement" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <RotateCcw className="h-5 w-5 text-indigo-600" />
                <span>Centre de Déploiement & Versions Plateforme</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Déployez de nouvelles versions sur l'ensemble ou une partie des établissements, avec retour arrière instantané.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
              <h4 className="font-bold text-xs uppercase text-slate-800 dark:text-slate-200">Déployer une Nouvelle Version</h4>
              <form onSubmit={handleDeployRelease} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Numéro de Version</label>
                  <input
                    type="text"
                    value={newDeployVersion}
                    onChange={e => setNewDeployVersion(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cible de Déploiement</label>
                  <select
                    value={newDeployTarget}
                    onChange={e => setNewDeployTarget(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  >
                    <option value="Toutes">Toutes les écoles (100% du réseau)</option>
                    <option value="Kinshasa">Écoles de Kinshasa uniquement</option>
                    <option value="Abonnés Premium">Écoles du Plan Premium / Entreprise</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Notes de Mise à Jour (Release Notes)</label>
                  <textarea
                    rows={3}
                    value={newDeployNotes}
                    onChange={e => setNewDeployNotes(e.target.value)}
                    placeholder="Saisissez les améliorations apportées..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>

                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105">
                  Lancer le Déploiement
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="font-bold text-xs uppercase text-slate-800 dark:text-slate-200">Historique des Versions & Rollback</h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {releaseHistory.map((rel, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">{rel.version}</span>
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full">{rel.status}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{rel.notes}</p>
                        <div className="text-[10px] text-slate-400 font-mono">Date : {rel.releaseDate} • Cible : {rel.targetSchools}</div>
                      </div>

                      <button
                        onClick={() => {
                          alert(`! Restauration vers la version ${rel.version} amorcée sur le réseau.`);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] rounded-xl cursor-pointer shrink-0"
                      >
                        Rollback
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. JOURNAL D'AUDIT GLOBAL */}
      {activeSubTab === "audit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <span>Journal Central d'Audit Global Multi-Écoles</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Traçabilité absolue et horodatée de toutes les opérations effectuées sur le réseau national SmartSchool RDC.
              </p>
            </div>

            <button
              onClick={() => {
                alert("Journal d'audit global exporté au format PDF certifié.");
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exporter Rapport PDF</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Filtrer l'audit par école, utilisateur, action, IP..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
              />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs
                .filter(a => !auditSearch.trim() || a.action.toLowerCase().includes(auditSearch.toLowerCase()) || a.school.toLowerCase().includes(auditSearch.toLowerCase()))
                .map(log => (
                  <div key={log.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{log.school}</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">({log.user})</span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 font-medium">{log.action}</div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-400">
                      <div>IP: {log.ip}</div>
                      <span className={`font-bold ${log.severity === "Success" ? "text-emerald-600" : log.severity === "Avertissement" ? "text-amber-600" : "text-indigo-600"}`}>
                        {log.severity}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. SÉCURITÉ SAAS */}
      {activeSubTab === "securite" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                <span>Sécurité & Gestion des Appareils Connectés</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Déconnexion à distance, double authentification (2FA) et blocage préventif des accès suspects.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-4 space-y-4">
            <h4 className="font-bold text-xs uppercase text-slate-800 dark:text-slate-200">Sessions Super Administrateurs & Directeurs Actives</h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
              {securitySessions.map(sess => (
                <div key={sess.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{sess.user}</span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 text-[9px] rounded font-mono">{sess.role}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Appareil : {sess.device} • IP : {sess.ip} • Localisation : {sess.location}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSecuritySessions(prev => prev.filter(s => s.id !== sess.id));
                      alert(`✓ Session de ${sess.user} révoquée à distance.`);
                    }}
                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Déconnecter à distance
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. PARAMÈTRES GLOBAUX */}
      {activeSubTab === "parametres" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-indigo-600" />
                <span>Paramètres Globaux du Système SmartSchool RDC</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Définissez la bannière système, le nom officiel et les modes d'exécution (Maintenance / Démo / Production).
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nom Officiel de la Plateforme SaaS</label>
                <input
                  type="text"
                  value={platformConfig.platformName}
                  onChange={e => setPlatformConfig({ ...platformConfig, platformName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mode d'Environnement</label>
                <select
                  value={platformConfig.environmentMode}
                  onChange={e => setPlatformConfig({ ...platformConfig, environmentMode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                >
                  <option value="Production">Mode Production (Souverain RDC)</option>
                  <option value="Demo">Mode Démonstration EPST</option>
                  <option value="Test">Mode Test & Sandbox</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Avis Officiel & Diffusion Nationale</label>
              <input
                type="text"
                value={platformConfig.globalBroadcastNotification}
                onChange={e => setPlatformConfig({ ...platformConfig, globalBroadcastNotification: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="maintCheck"
                  checked={platformConfig.maintenanceMode}
                  onChange={e => setPlatformConfig({ ...platformConfig, maintenanceMode: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <label htmlFor="maintCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Activer le Mode Maintenance Nationale (Accès restreint au Super Administrateur uniquement)
                </label>
              </div>

              <button
                onClick={() => {
                  alert("✓ Paramètres globaux SaaS enregistrés avec succès.");
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Sauvegarder les Paramètres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INFILTRATION / INSPECTION D'UNE ÉCOLE */}
      {inspectSchool && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setInspectSchool(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 px-2 py-0.5 rounded uppercase">
                INSPECTION SaaS À DISTANCE (MODE LECTURE SEULE)
              </span>
              <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase">{inspectSchool.name}</h3>
              <p className="text-xs text-slate-500">ID Unique : {inspectSchool.schoolId} • Clé API: {inspectSchool.apiKey}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Province</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{inspectSchool.province || "Kinshasa"}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Promoteur</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{inspectSchool.promoter}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Effectif Élèves</span>
                <span className="font-bold text-indigo-600 font-mono">{inspectSchool.studentsCount} élèves</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 rounded-2xl space-y-2">
              <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-200 uppercase">Télémesure de l'Établissement</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Stockage Utilisé : <strong>{inspectSchool.storageUsedGB} GB</strong></div>
                <div>Dernière Connexion : <strong>{inspectSchool.lastLogin}</strong></div>
                <div>Licence Expiration : <strong>{inspectSchool.expirationDate}</strong></div>
                <div>Statut Serveur : <strong className="text-emerald-600">En ligne</strong></div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setInspectSchool(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Fermer l'Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRÉER UN ÉTABLISSEMENT */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddSchoolModal(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white uppercase">Nouveau Raccordement d'Établissement</h3>
              <p className="text-xs text-slate-500">Un School ID unique SSRDC-XXXXXX sera généré automatiquement.</p>
            </div>

            <form onSubmit={handleCreateNewSchool} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Nom de l'École</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Collège Saint Joseph Elikya"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500 uppercase block mb-1">Province</label>
                  <select
                    value={newSchoolProvince}
                    onChange={e => setNewSchoolProvince(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  >
                    <option value="Kinshasa">Kinshasa</option>
                    <option value="Kongo Central">Kongo Central</option>
                    <option value="Haut-Katanga">Haut-Katanga</option>
                    <option value="Nord-Kivu">Nord-Kivu</option>
                    <option value="Sud-Kivu">Sud-Kivu</option>
                    <option value="Lualaba">Lualaba</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase block mb-1">Plan SaaS</label>
                  <select
                    value={newSchoolPlan}
                    onChange={e => setNewSchoolPlan(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Professionnel">Professionnel</option>
                    <option value="Premium">Premium</option>
                    <option value="Entreprise">Entreprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Promoteur / Chef d'Établissement</label>
                <input
                  type="text"
                  placeholder="ex: Abbé Patrick Mukendi"
                  value={newSchoolPromoter}
                  onChange={e => setNewSchoolPromoter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500 uppercase block mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+243 812 345 678"
                    value={newSchoolPhone}
                    onChange={e => setNewSchoolPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase block mb-1">Email Officiel</label>
                  <input
                    type="email"
                    placeholder="contact@ecole.cd"
                    value={newSchoolEmail}
                    onChange={e => setNewSchoolEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105">
                Créer l'Établissement & Générer Identifiants
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: PROLONGER L'ESSAI GRATUIT */}
      {extendTrialModalSchool && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm uppercase text-amber-600 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Prolonger la Période d'Essai</span>
              </h3>
              <button onClick={() => setExtendTrialModalSchool(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>Établissement : <strong className="text-slate-900 dark:text-white">{extendTrialModalSchool.schoolName}</strong></p>
              <p>Durée actuelle : <strong>{extendTrialModalSchool.trialDays || 30} jours</strong></p>
              
              <div className="pt-2">
                <label className="font-bold text-slate-500 uppercase block mb-1">Nombre de jours à ajouter :</label>
                <select
                  value={extensionDaysToAdd}
                  onChange={e => setExtensionDaysToAdd(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                >
                  <option value={7}>+7 jours (1 Semaine)</option>
                  <option value={15}>+15 jours (Demie-Mois)</option>
                  <option value={30}>+30 jours (1 Mois)</option>
                  <option value={60}>+60 jours (2 Mois)</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2 pt-3">
              <button
                onClick={() => setExtendTrialModalSchool(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmExtendTrial}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Confirmer Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONVERTIR EN ABONNEMENT PAYANT */}
      {convertPaidModalSchool && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm uppercase text-emerald-600 flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Conversion vers Abonnement Payant</span>
              </h3>
              <button onClick={() => setConvertPaidModalSchool(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3">
              <p>Établissement : <strong className="text-slate-900 dark:text-white">{convertPaidModalSchool.schoolName}</strong></p>

              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Choisir le Plan de souscription :</label>
                <select
                  value={newPaidPlanSelected}
                  onChange={e => setNewPaidPlanSelected(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                >
                  <option value="Standard">Standard (150 $/mois)</option>
                  <option value="Professionnel">Professionnel (350 $/mois)</option>
                  <option value="Premium">Premium (650 $/mois)</option>
                  <option value="Entreprise">Entreprise (Sur-mesure)</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200">
                La conversion mettra immédiatement fin à l'essai gratuit et basculera le compte en facturation mensuelle avec prélèvement de commission de {commissionsDefaultRate}%.
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setConvertPaidModalSchool(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmConvertPaid}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Activer l'Abonnement Payant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RAPPORT PDF OFFICIEL PRINT VIEW */}
      {pdfReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div id="smartschool-printable-zone" className="bg-white text-slate-900 rounded-3xl p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-7 w-7 text-indigo-600" />
                  <span className="font-black text-xl tracking-tight text-slate-900">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                </div>
                <p className="text-xs font-extrabold text-indigo-700 tracking-wider uppercase mt-1">
                  Ministère de l'Éducation Nationale et Nouvelle Citoyenneté (MINEPSP / EPST)
                </p>
                <p className="text-[10px] text-slate-500 font-mono">PLATEFORME NATIONALE SMARTSCHOOL RDC • DIRECTION DES FINANCES SAAS</p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-mono font-bold rounded-lg uppercase">DOCUMENT OFFICIEL</span>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-black uppercase text-slate-900 tracking-wide underline decoration-indigo-600 underline-offset-4">
                RAPPORT OFFICIEL DES COMMISSIONS ET GESTION DES ABONNEMENTS
              </h2>
              <p className="text-xs text-slate-600 italic">
                Synthèse des transactions financières, des prélèvements de commissions et des périodes d'essai gratuites des établissements scolaires.
              </p>
            </div>

            {/* SYNTHESE STATISTIQUE */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-center font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Total Transactions</span>
                <strong className="text-sm text-slate-900">1 482</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Volume Brut Encaissé</span>
                <strong className="text-sm text-indigo-600">184 500,00 $</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Commissions Prélevées</span>
                <strong className="text-sm text-emerald-600">3 690,00 $</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Nets Écoles</span>
                <strong className="text-sm text-slate-800">180 810,00 $</strong>
              </div>
            </div>

            {/* TABLEAU EXTRAIT DU REGISTRE */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs uppercase text-slate-700 tracking-wider">
                Extrait du Registre Officiel des Commissions :
              </h4>
              <table className="w-full text-left text-[10px] font-mono border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase font-black border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">REF TX</th>
                    <th className="p-2 border-r border-slate-300">ÉTABLISSEMENT</th>
                    <th className="p-2 border-r border-slate-300">PAIEMENT</th>
                    <th className="p-2 border-r border-slate-300">BRUT (USD)</th>
                    <th className="p-2 border-r border-slate-300">TAUX</th>
                    <th className="p-2 border-r border-slate-300">COMMISSION</th>
                    <th className="p-2">NET ÉCOLE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {commissionLedger.map(tx => (
                    <tr key={tx.id}>
                      <td className="p-2 border-r border-slate-200 font-bold">{tx.id}</td>
                      <td className="p-2 border-r border-slate-200 font-sans font-bold">{tx.schoolName}</td>
                      <td className="p-2 border-r border-slate-200 font-sans">{tx.paymentType} ({tx.channel})</td>
                      <td className="p-2 border-r border-slate-200">{tx.grossAmountUSD.toFixed(2)} $</td>
                      <td className="p-2 border-r border-slate-200 text-amber-600">{tx.appliedRatePercent}%</td>
                      <td className="p-2 border-r border-slate-200 font-bold text-emerald-600">{tx.commissionAmountUSD.toFixed(2)} $</td>
                      <td className="p-2 font-bold">{tx.netAmountSchoolUSD.toFixed(2)} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
              <div>
                <p className="font-bold text-slate-900">Signé numériquement par :</p>
                <p className="text-slate-600 font-sans font-semibold">Ir IT FRED KALONDA — Architecte en Chef</p>
                <p className="text-[9px] text-slate-400">Certificat de sécurité FREDTECH SHA-256</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimer / Sauvegarder PDF</span>
                </button>
                <button
                  onClick={() => setPdfReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
