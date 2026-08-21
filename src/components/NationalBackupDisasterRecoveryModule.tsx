import React, { useState, useMemo } from "react";
import {
  HardDrive,
  Database,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Download,
  Upload,
  Server,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
  FileText,
  Lock,
  Eye,
  Filter,
  Search,
  ChevronRight,
  Activity,
  Zap,
  Shield,
  Sparkles,
  Sliders,
  Play,
  Check,
  ArrowRight,
  CornerUpLeft,
  Info,
  HelpCircle,
  KeyRound,
  Building2,
  User,
  Users,
  DollarSign,
  Calendar,
  Globe,
  Radio,
  Printer,
  AlertOctagon,
  X,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { School, Student, Teacher } from "../types";

interface BackupRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  codeNational: string;
  province: string;
  timestamp: string;
  type: "HORAIRE" | "QUOTIDIENNE" | "HEBDOMADAIRE" | "MENSUELLE" | "MANUELLE";
  sizeMB: number;
  status: "REUSSITE" | "EN_COURS" | "ALERTE" | "ECHEC";
  primaryVault: "Kinshasa Tier-III (Actif)" | "Hors Ligne";
  secondaryVault: "Lubumbashi Vault (Répliqué)" | "Europe Cloud (Répliqué)";
  studentsCount: number;
  teachersCount: number;
  documentsCount: number;
  dbHealthScore: number;
  syncStatus: "SYNCHRONISÉ" | "EN_DÉCALAGE" | "HORS_LIGNE";
  lastRestoreTest: string;
  integrityTestStatus: "VALIDE" | "EN_TEST" | "CORROMPU";
  checksumSHA256: string;
}

interface TrashedItem {
  id: string;
  schoolId: string;
  schoolName: string;
  entityType: "Élève" | "Enseignant" | "Classe" | "Bulletin" | "Facture" | "Paiement" | "Document" | "Année Scolaire";
  entityName: string;
  deletedBy: string;
  deletedRole: string;
  deletedAt: string;
  expiresAt: string;
  daysRemaining: number;
  dataPayloadJson: string;
}

interface GranularVersionItem {
  id: string;
  schoolId: string;
  schoolName: string;
  entityType: "Élève" | "Enseignant" | "Classe" | "Bulletin" | "Facture" | "Paiement" | "Document" | "Année Scolaire";
  entityName: string;
  versionNumber: number;
  modifiedAt: string;
  modifiedBy: string;
  changesSummary: string;
}

interface AuditBackupLog {
  id: string;
  timestamp: string;
  action: "SAUVEGARDE_AUTO" | "SAUVEGARDE_MANUELLE" | "RESTAURATION_COMPLETE" | "RESTAURATION_GRANULAIRE" | "TEST_INTEGRITE" | "SYNCHRO_HORS_LIGNE" | "SUPPRESSION_CORBEILLE" | "TELECHARGEMENT_SMARTBAK" | "TENTATIVE_UNAUTHORIZED";
  schoolName: string;
  operator: string;
  role: string;
  status: "SUCCÈS" | "AVERTISSEMENT" | "BLOQUÉ" | "ERREUR";
  details: string;
  ipAddress: string;
}

interface Props {
  schools: School[];
  students: Student[];
  teachers: Teacher[];
  userRole: string;
  userName: string;
}

export function NationalBackupDisasterRecoveryModule({
  schools,
  students,
  teachers,
  userRole,
  userName
}: Props) {
  // Main Tab Navigation inside Disaster Recovery Module
  const [activeTab, setActiveTab] = useState<
    "overview" | "surveillance" | "restoration" | "granular" | "trash" | "offline_sync" | "audit" | "config"
  >("overview");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("TOUTES");
  const [statusFilter, setStatusFilter] = useState("TOUS");

  // Automated backup frequency configurations (Owner controllable)
  const [frequencies, setFrequencies] = useState({
    hourly: { enabled: true, retentionDays: 7, label: "Toutes les heures" },
    daily: { enabled: true, retentionDays: 30, label: "Quotidienne (02:00)" },
    weekly: { enabled: true, retentionWeeks: 12, label: "Hebdomadaire (Dimanche 03:00)" },
    monthly: { enabled: true, retentionMonths: 36, label: "Mensuelle (1er du mois)" }
  });

  // Dual Vault Status State
  const [dualVaultActive, setDualVaultActive] = useState(true);
  const [primaryVaultStatus, setPrimaryVaultStatus] = useState<"ONLINE" | "DEGRADED">("ONLINE");
  const [secondaryVaultStatus, setSecondaryVaultStatus] = useState<"ONLINE" | "SYNCING">("ONLINE");

  // Interactive Action Notifications / Alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Mock initial backup records generated from real school list
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>(() => {
    return schools.map((s, idx) => {
      const schoolStudentsCount = students.filter(st => st.schoolId === s.id || s.id === "default").length || (120 + idx * 45);
      const schoolTeachersCount = teachers.filter(t => t.schoolId === s.id || s.id === "default").length || (12 + idx * 3);
      const docsCount = Math.round(schoolStudentsCount * 4.2 + 80);
      const sizeMB = Math.round((schoolStudentsCount * 1.8 + docsCount * 0.4 + 150) * 10) / 10;
      
      const statuses: ("REUSSITE" | "EN_COURS" | "ALERTE")[] = ["REUSSITE", "REUSSITE", "REUSSITE", "REUSSITE", "ALERTE"];
      const currentStatus = idx === 3 ? "ALERTE" : statuses[idx % statuses.length];

      return {
        id: `bak-${s.id}-${Date.now()}`,
        schoolId: s.id,
        schoolName: s.name,
        codeNational: s.codeEtablissement || `SE-RDC-${1000 + idx}`,
        province: s.province || "",
        timestamp: new Date(Date.now() - (idx * 32 + 12) * 60000).toISOString(),
        type: idx % 2 === 0 ? "HORAIRE" : "QUOTIDIENNE",
        sizeMB,
        status: currentStatus,
        primaryVault: "Kinshasa Tier-III (Actif)",
        secondaryVault: idx % 2 === 0 ? "Lubumbashi Vault (Répliqué)" : "Europe Cloud (Répliqué)",
        studentsCount: schoolStudentsCount,
        teachersCount: schoolTeachersCount,
        documentsCount: docsCount,
        dbHealthScore: currentStatus === "ALERTE" ? 88 : 99,
        syncStatus: currentStatus === "ALERTE" ? "EN_DÉCALAGE" : "SYNCHRONISÉ",
        lastRestoreTest: new Date(Date.now() - (idx * 2 + 1) * 3600000 * 24).toLocaleDateString("fr-FR"),
        integrityTestStatus: currentStatus === "ALERTE" ? "EN_TEST" : "VALIDE",
        checksumSHA256: `a8f9c2d1e04b7890${idx}e5f6a7b8c9d0e1f2a3b4c5d6e7f8`
      };
    });
  });

  // Mock Trashed Items (Corbeille Sécurisée)
  const [trashedItems, setTrashedItems] = useState<TrashedItem[]>([
    {
      id: "trash-01",
      schoolId: schools[0]?.id || "default",
      schoolName: schools[0]?.name || "Complexe Scolaire La Sagesse",
      entityType: "Élève",
      entityName: "KABAMBA MBUYI Christian (Mat. 2025-0891)",
      deletedBy: "Jean-Paul Mukendi",
      deletedRole: "Préfet des Études",
      deletedAt: "2026-08-08 14:22",
      expiresAt: "2026-10-07 14:22",
      daysRemaining: 58,
      dataPayloadJson: '{"id":"st-0891", "name":"KABAMBA MBUYI Christian", "class":"4ème Humanités Math-Physique"}'
    },
    {
      id: "trash-02",
      schoolId: schools[1]?.id || "school-2",
      schoolName: schools[1]?.name || "Institut Technique de la Gombe",
      entityType: "Bulletin",
      entityName: "Bulletin T1 - MASANGU Grace (1ère C.O)",
      deletedBy: "Claire Ilunga",
      deletedRole: "Secrétaire",
      deletedAt: "2026-08-09 09:10",
      expiresAt: "2026-10-08 09:10",
      daysRemaining: 59,
      dataPayloadJson: '{"id":"bul-99", "student":"MASANGU Grace", "term":"T1", "percentage": 78.4}'
    },
    {
      id: "trash-03",
      schoolId: schools[0]?.id || "default",
      schoolName: schools[0]?.name || "Complexe Scolaire La Sagesse",
      entityType: "Facture",
      entityName: "Facture Frais de Scolarité #FAC-2026-0412",
      deletedBy: "Antoine Tshimanga",
      deletedRole: "Comptable",
      deletedAt: "2026-08-01 16:45",
      expiresAt: "2026-08-31 16:45",
      daysRemaining: 21,
      dataPayloadJson: '{"id":"fac-0412", "amount":150, "currency":"USD"}'
    }
  ]);

  // Mock Granular Versions
  const [granularVersions] = useState<GranularVersionItem[]>([
    {
      id: "v-101",
      schoolId: schools[0]?.id || "default",
      schoolName: schools[0]?.name || "Complexe Scolaire La Sagesse",
      entityType: "Bulletin",
      entityName: "Bulletin Trimestre 2 - KASONGO Alain (6ème Math-Info)",
      versionNumber: 3,
      modifiedAt: "2026-08-10 10:15",
      modifiedBy: "Prof. BAKAMBA (Titulaire)",
      changesSummary: "Recalcul de la moyenne générale (74.2% -> 76.5%) après délibération de Mathématiques"
    },
    {
      id: "v-102",
      schoolId: schools[0]?.id || "default",
      schoolName: schools[0]?.name || "Complexe Scolaire La Sagesse",
      entityType: "Enseignant",
      entityName: "Prof. LUKUSA François (Physique / Chimie)",
      versionNumber: 2,
      modifiedAt: "2026-08-09 11:30",
      modifiedBy: "Directeur de l'Établissement",
      changesSummary: "Mise à jour des heures hebdomadaires (18h -> 22h) et assignation classe 3ème Scientifique"
    },
    {
      id: "v-103",
      schoolId: schools[1]?.id || "school-2",
      schoolName: schools[1]?.name || "Institut Technique de la Gombe",
      entityType: "Paiement",
      entityName: "Reçu de Caisse #REC-2026-8841 (MABIALA Sarah)",
      versionNumber: 1,
      modifiedAt: "2026-08-08 15:00",
      modifiedBy: "Caissier Principal",
      changesSummary: "Validation paiement partiel 80 USD via M-Pesa avec génération QR Code sécurisé"
    }
  ]);

  // Mock Audit Log
  const [auditLogs, setAuditLogs] = useState<AuditBackupLog[]>([
    {
      id: "log-1",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      action: "SAUVEGARDE_AUTO",
      schoolName: "Système National RDC (Tous Établissements)",
      operator: "Moteur Automatique SmartSchool Vault",
      role: "CRON_SYSTEM",
      status: "SUCCÈS",
      details: "Exécution de la sauvegarde horaire répliquée sur Vault Kinshasa & Vault Lubumbashi (100% OK)",
      ipAddress: "10.0.4.102 (Internal Vault)"
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString().replace("T", " ").substring(0, 19),
      action: "TEST_INTEGRITE",
      schoolName: "Lycée Tobongisa (Kinshasa)",
      operator: "Système de Contrôle Automatique",
      role: "INTEGRITY_CHECKER",
      status: "SUCCÈS",
      details: "Contrôle checksum SHA-256 et simulation de restauration en bac à sable réussis sans corruption",
      ipAddress: "10.0.4.108"
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString().replace("T", " ").substring(0, 19),
      action: "TELECHARGEMENT_SMARTBAK",
      schoolName: "Complexe Scolaire La Sagesse",
      operator: "M. MUKENDI Jean-Paul",
      role: "Directeur Général",
      status: "SUCCÈS",
      details: "Téléchargement du fichier de sauvegarde chiffré (.smartbak AES-256) pour archivage local d'établissement",
      ipAddress: "197.234.221.14"
    },
    {
      id: "log-4",
      timestamp: new Date(Date.now() - 300 * 60000).toISOString().replace("T", " ").substring(0, 19),
      action: "TENTATIVE_UNAUTHORIZED",
      schoolName: "Collège Alfajiri (Bukavu)",
      operator: "Adresse IP Inconnue",
      role: "EXTERNE",
      status: "BLOQUÉ",
      details: "Blocage de sécurité : Tentative d'accès non autorisé au coffre-fort de sauvegarde. Clé invalide.",
      ipAddress: "105.178.42.11"
    }
  ]);

  // Selected school for Restoration Assistant Wizard
  const [selectedSchoolForRestore, setSelectedSchoolForRestore] = useState<string>(schools[0]?.id || "default");
  const [restoreStep, setRestoreStep] = useState<number>(1);
  const [restoreSnapshotId, setRestoreSnapshotId] = useState<string>("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  // Granular Restore Modal State
  const [selectedGranularVersion, setSelectedGranularVersion] = useState<GranularVersionItem | null>(null);

  // Overall Statistics calculated dynamically
  const totalStorageMB = useMemo(() => {
    return backupRecords.reduce((acc, b) => acc + b.sizeMB, 0) + 4820000; // Adding national archived baseline
  }, [backupRecords]);

  const successRate = useMemo(() => {
    const ok = backupRecords.filter(b => b.status === "REUSSITE").length;
    return Math.round((ok / (backupRecords.length || 1)) * 100);
  }, [backupRecords]);

  const activeAlertsCount = useMemo(() => {
    return backupRecords.filter(b => b.status === "ALERTE" || b.status === "ECHEC").length;
  }, [backupRecords]);

  // Filtered schools for Surveillance Grid
  const filteredRecords = useMemo(() => {
    return backupRecords.filter(rec => {
      const matchesSearch =
        rec.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.codeNational.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.province.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProvince = provinceFilter === "TOUTES" || rec.province === provinceFilter;
      const matchesStatus = statusFilter === "TOUS" || rec.status === statusFilter;

      return matchesSearch && matchesProvince && matchesStatus;
    });
  }, [backupRecords, searchQuery, provinceFilter, statusFilter]);

  // Trigger manual global backup for all schools
  const handleTriggerGlobalBackup = () => {
    const newLogs: AuditBackupLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      action: "SAUVEGARDE_MANUELLE",
      schoolName: "Tous les Établissements (National RDC)",
      operator: userName || "Propriétaire SmartSchool RDC",
      role: userRole || "Propriétaire",
      status: "SUCCÈS",
      details: "Déclenchement d'une sauvegarde nationale à la demande avec double réplication immédiate.",
      ipAddress: "102.164.18.9"
    };

    setAuditLogs(prev => [newLogs, ...prev]);

    // Update all backup records
    setBackupRecords(prev =>
      prev.map(r => ({
        ...r,
        timestamp: new Date().toISOString(),
        status: "REUSSITE",
        syncStatus: "SYNCHRONISÉ",
        integrityTestStatus: "VALIDE",
        sizeMB: Math.round((r.sizeMB + 1.2) * 10) / 10
      }))
    );

    showNotification("Sauvegarde Nationale Immédiate déclenchée ! Double réplication Kinshasa/Lubumbashi terminée avec succès.");
  };

  // Trigger Automated Integrity Test for all backups
  const handleRunIntegrityTests = () => {
    setBackupRecords(prev =>
      prev.map(r => ({
        ...r,
        integrityTestStatus: "VALIDE",
        lastRestoreTest: new Date().toLocaleDateString("fr-FR"),
        status: "REUSSITE",
        dbHealthScore: 100
      }))
    );

    const audit: AuditBackupLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      action: "TEST_INTEGRITE",
      schoolName: "Parc Complet d'Établissements RDC",
      operator: userName || "Propriétaire SmartSchool RDC",
      role: userRole || "Propriétaire",
      status: "SUCCÈS",
      details: "Exécution du test de restaurabilité bac à sable sur 100% des images d'écoles. 0 corruption détectée.",
      ipAddress: "10.0.4.1"
    };

    setAuditLogs(prev => [audit, ...prev]);
    showNotification("Test d'intégrité et de restaurabilité automatisé terminé : 100% des sauvegardes sont valides !");
  };

  // Handle restoring an item from trash
  const handleRestoreFromTrash = (item: TrashedItem) => {
    setTrashedItems(prev => prev.filter(i => i.id !== item.id));

    const audit: AuditBackupLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      action: "SUPPRESSION_CORBEILLE",
      schoolName: item.schoolName,
      operator: userName || "Directeur / Propriétaire",
      role: userRole || "Administration",
      status: "SUCCÈS",
      details: `Restauration immédiate depuis la Corbeille Sécurisée : ${item.entityType} '${item.entityName}'`,
      ipAddress: "197.234.12.8"
    };

    setAuditLogs(prev => [audit, ...prev]);
    showNotification(`L'élément '${item.entityName}' (${item.entityType}) a été restauré dans la base active de l'école.`);
  };

  // Handle Granular Item Restore execution
  const handleExecuteGranularRestore = () => {
    if (!selectedGranularVersion) return;

    const item = selectedGranularVersion;
    const audit: AuditBackupLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      action: "RESTAURATION_GRANULAIRE",
      schoolName: item.schoolName,
      operator: userName || "Propriétaire / Superviseur",
      role: userRole || "Propriétaire",
      status: "SUCCÈS",
      details: `Restauration granulaire sans réinitialisation de la BD : ${item.entityType} '${item.entityName}' rétabli à la version v${item.versionNumber}`,
      ipAddress: "10.0.4.12"
    };

    setAuditLogs(prev => [audit, ...prev]);
    setSelectedGranularVersion(null);
    showNotification(`Restauration Granulaire Réussie : ${item.entityName} à sa version v${item.versionNumber}.`);
  };

  // School Download encrypted backup payload (.smartbak)
  const handleDownloadSchoolBackup = (school: BackupRecord) => {
    const audit: AuditBackupLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      action: "TELECHARGEMENT_SMARTBAK",
      schoolName: school.schoolName,
      operator: userName || "Propriétaire / Directeur",
      role: userRole || "Gestionnaire",
      status: "SUCCÈS",
      details: `Génération du conteneur chiffré AES-256 (${school.sizeMB} MB) sous le nom '${school.codeNational}_sauvegarde_${new Date().toISOString().slice(0, 10)}.smartbak'`,
      ipAddress: "102.164.12.4"
    };

    setAuditLogs(prev => [audit, ...prev]);

    // Create a mock encrypted file blob download
    const dummyContent = JSON.stringify({
      header: "SMART_SCHOOL_RDC_ENCRYPTED_BACKUP_V4",
      cipher: "AES-256-GCM",
      schoolCode: school.codeNational,
      schoolName: school.schoolName,
      checksum: school.checksumSHA256,
      studentsCount: school.studentsCount,
      teachersCount: school.teachersCount,
      timestamp: school.timestamp,
      payloadEncryptedData: "U2FsdGVkX19x8A7d/mQ8N9wL..."
    }, null, 2);

    const blob = new Blob([dummyContent], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${school.codeNational}_SAUVEGARDE_${new Date().toISOString().slice(0, 10)}.smartbak`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification(`Téléchargement amorcé : Conteneur chiffré .smartbak pour ${school.schoolName}`);
  };

  // Execute School Full Restoration Wizard process
  const startRestorationWizard = () => {
    setIsRestoring(true);
    setRestoreProgress(10);

    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRestoring(false);
          setRestoreStep(4); // Success step

          const schoolObj = backupRecords.find(b => b.schoolId === selectedSchoolForRestore) || backupRecords[0];
          
          const audit: AuditBackupLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
            action: "RESTAURATION_COMPLETE",
            schoolName: schoolObj.schoolName,
            operator: userName || "Superviseur National",
            role: userRole || "Propriétaire",
            status: "SUCCÈS",
            details: `Restauration de l'image de sauvegarde du ${new Date(schoolObj.timestamp).toLocaleString("fr-FR")} finalisée avec succès.`,
            ipAddress: "10.0.4.55"
          };

          setAuditLogs(p => [audit, ...p]);
          showNotification(`Restauration de ${schoolObj.schoolName} exécutée avec succès !`);
          return 100;
        }
        return prev + 22;
      });
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Floating Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 max-w-md bg-slate-900 dark:bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-500/80 flex items-start space-x-3"
          >
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                Notification Système - Protection des Données
              </h4>
              <p className="text-xs font-semibold text-slate-200 mt-0.5 leading-snug">
                {toastMessage}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Module Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/30">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>MODULE STRICTEMENTRÉSERVÉ AU PROPRIÉTAIRE SMARTSCHOOL RDC</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center space-x-3">
              <Database className="h-8 w-8 text-emerald-400" />
              <span>CENTRE NATIONAL DE SAUVEGARDE & REPRISE APRÈS SINISTRE</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Supervision de niveau souverain de la haute disponibilité, de la double réplication géographique (Kinshasa / Lubumbashi / Europe), du versionnement granulaire et de la restauration anti-sinistre sans ingérence dans les données pédagogiques et financières des écoles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTriggerGlobalBackup}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg flex items-center space-x-2 cursor-pointer border border-emerald-400/30 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Sauvegarde Immédiate Globale</span>
            </button>

            <button
              onClick={handleRunIntegrityTests}
              className="px-5 py-3 bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 text-xs font-black uppercase tracking-wider rounded-xl transition-all border border-indigo-600/50 flex items-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Lancer Test d&apos;Intégrité</span>
            </button>
          </div>
        </div>

        {/* Non-Interference Guarantee Disclaimer Banner */}
        <div className="mt-6 pt-4 border-t border-indigo-800/50 flex items-start space-x-3 text-xs text-indigo-200/90 font-mono">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Garantie de Confidentialité &amp; Non-Ingérence :</strong> Le Propriétaire supervise l&apos;intégrité physique et la santé des sauvegardes. Les opérations de sauvegarde et de restauration s&apos;exécutent sous chiffrement AES-256 sans altération directe des contenus internes des établissements.
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === "overview"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Tableau de Bord National</span>
        </button>

        <button
          onClick={() => setActiveTab("surveillance")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === "surveillance"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Surveillance des Écoles ({backupRecords.length})</span>
          {activeAlertsCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
              {activeAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("restoration")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === "restoration"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Assistant de Restauration</span>
        </button>

        <button
          onClick={() => setActiveTab("granular")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === "granular"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Versionnement Granulaire</span>
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === "trash"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Trash2 className="h-4 w-4" />
          <span>Corbeille Sécurisée ({trashedItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("offline_sync")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === "offline_sync"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>Mode Hors Ligne &amp; Synchro</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === "audit"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Journal d&apos;Audit ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
            activeTab === "config"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Fréquences &amp; Rétention</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW / TABLEAU DE BORD NATIONAL */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Total Image Sauvegardes
                </span>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Database className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  14,890
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                  +120 / heure
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                100% des écoles sauvegardées
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Taux de Réussite &amp; Santé
                </span>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {successRate}%
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                  SLA Conforme
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Tests de restaurabilité : 100% OK
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Stockage Chiffré Utilise
                </span>
                <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                  <HardDrive className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {(totalStorageMB / 1024).toFixed(1)} GB
                </span>
                <span className="text-xs font-bold text-slate-500 ml-2">
                  sur 50 TB Vault
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Chiffrement AES-256 Active
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  SLA RTO &amp; RPO National
                </span>
                <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Zap className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  RTO &lt; 4m
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-2">
                  RPO &lt; 1s
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Disponibilité : 99.99%
              </p>
            </div>
          </div>

          {/* DUAL REDUNDANCY TOPOLOGY PANEL */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Architecture de Double Redondance Géographique</span>
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Chaque snapshot d&apos;école est automatiquement copié et vérifié sur 2 emplacements physiques indépendants.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5" />
                  DOUBLAGE ACTIF ET SYNCHRONISÉ
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* Connector line on large screens */}
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-900 text-white p-2 rounded-full border-2 border-indigo-500 shadow-lg">
                <RefreshCw className="h-5 w-5 text-emerald-400 animate-spin" />
              </div>

              {/* Vault 1: Primary Kinshasa */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-indigo-600 text-white rounded-xl shadow">
                      <Server className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                        Vault Principal - Kinshasa Tier-III
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Serveur National Principal (Fibre Optique RDC)
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-black text-[10px] rounded border border-emerald-300 dark:border-emerald-800">
                    PRIMAIRE ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>Taux d&apos;Occupation: <strong>38.2 GB</strong></div>
                  <div>Latence Écriture: <strong>1.2 ms</strong></div>
                  <div>Chiffrement: <strong>AES-256-GCM</strong></div>
                  <div>Contrôle Checksum: <strong>SHA-256 Strict</strong></div>
                </div>
              </div>

              {/* Vault 2: Secondary Lubumbashi / Europe */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-teal-600 text-white rounded-xl shadow">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                        Vault Secondaire - Lubumbashi / Cloud Isol&#233;
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Site de Reprise après Sinistre en Miroir Temps Réel
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-black text-[10px] rounded border border-emerald-300 dark:border-emerald-800">
                    MIROIR 100% CONFORME
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>Décalage Synchro: <strong>0.00 seconde</strong></div>
                  <div>Protection Anti-Ransomware: <strong>WORM Immuable</strong></div>
                  <div>Isolation Physique: <strong>Isolé du réseau direct</strong></div>
                  <div>Basculement Auto: <strong>Instantané (Failover)</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* AUTOMATED FREQUENCY SUMMARY & HEALTH GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>Séquences de Sauvegardes Automatiques</span>
                </h3>
                <button
                  onClick={() => setActiveTab("config")}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Configurer les Règles
                </button>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Sauvegarde Horaire</span>
                  </div>
                  <span className="font-mono text-slate-500">Toutes les 60 min (Rétention 7 jours)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Sauvegarde Quotidienne</span>
                  </div>
                  <span className="font-mono text-slate-500">Chaque nuit à 02:00 (Rétention 30 jours)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Sauvegarde Hebdomadaire</span>
                  </div>
                  <span className="font-mono text-slate-500">Chaque Dimanche à 03:00 (Rétention 12 sem.)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Sauvegarde Mensuelle</span>
                  </div>
                  <span className="font-mono text-slate-500">1er du mois à 04:00 (Rétention 36 mois)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Actions Rapides du Propri&#233;taire</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab("surveillance")}
                  className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all group"
                >
                  <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-black text-xs text-slate-900 dark:text-white uppercase">
                    Registre des Écoles
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Inspecter la santé DB de chaque école
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("restoration")}
                  className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all group"
                >
                  <RotateCcw className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-black text-xs text-slate-900 dark:text-white uppercase">
                    Assistant de Restauration
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Superviser la reprise d&apos;un établissement
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("trash")}
                  className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all group"
                >
                  <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-black text-xs text-slate-900 dark:text-white uppercase">
                    Corbeille Sécurisée
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Accéder aux éléments supprimés ({trashedItems.length})
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("granular")}
                  className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-left transition-all group"
                >
                  <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-black text-xs text-slate-900 dark:text-white uppercase">
                    Restaurer un Élément
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Restaurer élève/bulletin/facture unique
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SURVEILLANCE DES ÉCOLES */}
      {activeTab === "surveillance" && (
        <div className="space-y-6">
          {/* Search & Filter Controls */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom d'école, code national SE-RDC ou province..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
              >
                <option value="TOUTES">Toutes les Provinces RDC</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Haut-Katanga">Haut-Katanga</option>
                <option value="Nord-Kivu">Nord-Kivu</option>
                <option value="Sud-Kivu">Sud-Kivu</option>
                <option value="Lualaba">Lualaba</option>
                <option value="Kasaï-Central">Kasaï-Central</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
              >
                <option value="TOUS">Tous les Statuts</option>
                <option value="REUSSITE">REUSSITE (OK)</option>
                <option value="ALERTE">ALERTE / DECALAGE</option>
              </select>
            </div>
          </div>

          {/* Surveillance Table Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Registre de Surveillance des Établissements
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Affichage des données de santé et de dernière sauvegarde pour {filteredRecords.length} école(s).
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-slate-500">
                Total Fichiers : {filteredRecords.length} snapshots actifs
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4">Établissement &amp; Code</th>
                    <th className="py-3.5 px-4">Dernière Sauvegarde</th>
                    <th className="py-3.5 px-4">Statut &amp; Santé DB</th>
                    <th className="py-3.5 px-4">Taille</th>
                    <th className="py-3.5 px-4">Volume (Élèves / Docs)</th>
                    <th className="py-3.5 px-4">Test d&apos;Intégrité</th>
                    <th className="py-3.5 px-4 text-right">Action Chiffrée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium">
                  {filteredRecords.map((school) => (
                    <tr
                      key={school.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 dark:text-white">
                          {school.schoolName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {school.codeNational}
                          </span>
                          <span>• {school.province}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div>{new Date(school.timestamp).toLocaleDateString("fr-FR")}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(school.timestamp).toLocaleTimeString("fr-FR")} ({school.type})
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          {school.status === "REUSSITE" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                              REUSSITE (100%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                              <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
                              EN DÉCALAGE
                            </span>
                          )}

                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            DB: {school.dbHealthScore}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {school.sizeMB} MB
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <div>Élèves: <strong>{school.studentsCount}</strong></div>
                        <div>Docs &amp; Notes: <strong>{school.documentsCount}</strong></div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                          {school.integrityTestStatus} ({school.lastRestoreTest})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDownloadSchoolBackup(school)}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 text-[11px] font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 ml-auto cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>.smartbak</span>
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

      {/* TAB 3: ASSISTANT DE RESTAURATION */}
      {activeTab === "restoration" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[10px] uppercase tracking-widest rounded-full border border-indigo-300 dark:border-indigo-800">
                ASSISTANT DE REPRISE APRÈS SINISTRE DE L&apos;ÉTABLISSEMENT
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-2 flex items-center space-x-2">
                <RotateCcw className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <span>Restauration Sécurisée d&apos;une École</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Le Propriétaire ou le Directeur autorisé peut restaurer l&apos;intégralité des données d&apos;un établissement à partir d&apos;un snapshot chiffré sans affecter les autres écoles du réseau national.
              </p>
            </div>

            {/* Stepper Header */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-black">
              <div className={`p-2 rounded-xl border ${restoreStep >= 1 ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                1. Choix École
              </div>
              <div className={`p-2 rounded-xl border ${restoreStep >= 2 ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                2. Vérification
              </div>
              <div className={`p-2 rounded-xl border ${restoreStep >= 3 ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                3. Simulation
              </div>
              <div className={`p-2 rounded-xl border ${restoreStep >= 4 ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                4. Confirmation
              </div>
            </div>

            {/* STEP 1: SELECT SCHOOL & SNAPSHOT */}
            {restoreStep === 1 && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Sélectionner l&apos;Établissement à Restaurer
                  </label>
                  <select
                    value={selectedSchoolForRestore}
                    onChange={(e) => setSelectedSchoolForRestore(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {backupRecords.map(b => (
                      <option key={b.schoolId} value={b.schoolId}>
                        {b.schoolName} ({b.codeNational}) - {b.province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Choisir l&apos;Image de Sauvegarde Chiffrée (.smartbak)
                  </label>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border-2 border-indigo-500/50 flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="font-bold text-indigo-900 dark:text-indigo-200">
                          Sauvegarde Horaire Automatique (Dernier Etat Recommandé)
                        </div>
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                          Horodatage : {new Date().toLocaleString("fr-FR")} • Taille : 24.8 MB
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500 text-white font-black text-[10px] rounded">VALIDE</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <div>
                        <div className="font-bold">Snapshot Quotidien (Hier 02:00)</div>
                        <div className="text-[11px]">Horodatage : hier à 02:00 • Checksum OK</div>
                      </div>
                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] rounded">ARCHIVE</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setRestoreStep(2)}
                    className="px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Poursuivre la Vérification</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: VERIFICATION & CHECKSUM */}
            {restoreStep === 2 && (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span>Diagnostic Pré-Restauration</span>
                    <span className="text-emerald-500">100% SUCCÈS</span>
                  </div>

                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <p>✓ Déchiffrement de la Clé AES-256 : <strong className="text-emerald-600">SUCCÈS</strong></p>
                    <p>✓ Validation du Checksum SHA-256 : <strong className="text-emerald-600">CONFORME (0 corruption)</strong></p>
                    <p>✓ Intégrité des Fichiers Pédagogiques &amp; Financiers : <strong className="text-emerald-600">4,280 enregistrements scellés</strong></p>
                    <p>✓ Isolement Réseau : <strong className="text-emerald-600">Aucune fuite inter-écoles</strong></p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setRestoreStep(1)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Retour
                  </button>

                  <button
                    onClick={() => setRestoreStep(3)}
                    className="px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Lancer la Simulation de Reprise</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SIMULATION & EXECUTION */}
            {restoreStep === 3 && (
              <div className="space-y-5 pt-2">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-2">
                  <h4 className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Avertissement de Restauration d&apos;Établissement</span>
                  </h4>
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    Cette action va synchroniser la base de données active de l&apos;école avec l&apos;image sélectionnée. Une copie temporaire de sécurité de la base actuelle est automatiquement conservée avant la bascule.
                  </p>
                </div>

                {isRestoring ? (
                  <div className="space-y-3 py-6 text-center">
                    <RefreshCw className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
                    <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                      Restauration en cours... ({restoreProgress}%)
                    </h4>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden max-w-md mx-auto">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${restoreProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setRestoreStep(2)}
                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                    >
                      Retour
                    </button>

                    <button
                      onClick={startRestorationWizard}
                      className="px-8 py-3.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-lg flex items-center space-x-2 cursor-pointer animate-bounce"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Exécuter la Restauration Réelle</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {restoreStep === 4 && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">
                  Restauration Finalisée avec Succès !
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto font-medium">
                  Les données de l&apos;établissement ont été remises en état conforme. Le journal d&apos;audit national a consigné la transaction avec succès.
                </p>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setRestoreStep(1);
                      setActiveTab("overview");
                    }}
                    className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-xs uppercase rounded-xl cursor-pointer"
                  >
                    Retourner au Tableau de Bord
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: VERSIONNEMENT GRANULAIRE */}
      {activeTab === "granular" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Versionnement et Restauration Granulaire d&apos;Éléments</span>
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Permet de restaurer un élève, un enseignant, une classe, un bulletin ou une facture spécifique sans réinitialiser la totalité de la base de l&apos;école.
                </p>
              </div>

              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[10px] uppercase rounded-full">
                GRANULAR RECOVERY ENGINE ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {granularVersions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-indigo-600 text-white font-black text-[10px] rounded">
                        {item.entityType}
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {item.entityName}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        (Version v{item.versionNumber})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Modifié par : <strong>{item.modifiedBy}</strong> le {item.modifiedAt}
                    </p>

                    <p className="text-[11px] text-slate-500 font-mono italic">
                      Détails : {item.changesSummary}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedGranularVersion(item)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restaurer cet Élément</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Granular Restore Confirmation Modal */}
          {selectedGranularVersion && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                    <RotateCcw className="h-4 w-4 text-indigo-600" />
                    <span>Confirmer Restauration Granulaire</span>
                  </h3>
                  <button
                    onClick={() => setSelectedGranularVersion(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400">Établissement :</span>{" "}
                    <strong>{selectedGranularVersion.schoolName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Type d&apos;Élément :</span>{" "}
                    <strong>{selectedGranularVersion.entityType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Désignation :</span>{" "}
                    <strong>{selectedGranularVersion.entityName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Cible Version :</span>{" "}
                    <strong className="text-indigo-600">v{selectedGranularVersion.versionNumber}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Cette opération va rétablir exclusivement cet enregistrement sans effacer ou impacter les autres modules de l&apos;école.
                </p>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setSelectedGranularVersion(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Annuler
                  </button>

                  <button
                    onClick={handleExecuteGranularRestore}
                    className="px-5 py-2 bg-indigo-600 text-white font-black text-xs uppercase rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    Confirmer la Restauration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CORBEILLE SÉCURISÉE (TRASH) */}
      {activeTab === "trash" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span>Corbeille Sécurisée &amp; Protection Anti-Suppression</span>
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Aucune suppression définitive immédiate. Tous les éléments supprimés sont conservés en quarantaine pendant une période ajustable.
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-[10px] uppercase rounded-full border border-amber-300 dark:border-amber-800">
                POLITIQUE ANTI-PERTE : 60 JOURS
              </span>
            </div>

            {trashedItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-medium">
                La Corbeille Sécurisée est actuellement vide. Aucun élément en quarantaine.
              </div>
            ) : (
              <div className="space-y-3">
                {trashedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded">
                          {item.entityType}
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {item.entityName}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          • {item.schoolName}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Supprimé par : <strong>{item.deletedBy}</strong> ({item.deletedRole}) le {item.deletedAt}
                      </p>

                      <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                        Rétention restante : <strong>{item.daysRemaining} jours</strong> (Expiration le {item.expiresAt})
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreFromTrash(item)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restaurer l&apos;Élément</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: MODE HORS LIGNE & SYNCHRO */}
      {activeTab === "offline_sync" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <Radio className="h-5 w-5 text-emerald-500" />
                  <span>Mode Hors Ligne &amp; Synchronisation Résiliente</span>
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Fonctionnement ininterrompu en cas de coupure Internet. Stockage local temporaire (IndexedDB) et auto-synchronisation transparente au retour du réseau.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase rounded-full">
                MOTEUR OFFLINE OPÉRATIONNEL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <span className="text-xs font-black text-slate-500 uppercase">Écoles en Mode Offline</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">2 Écoles</div>
                <p className="text-[11px] text-slate-500 font-mono">Nord-Kivu &amp; Kasaï</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <span className="text-xs font-black text-slate-500 uppercase">Enregistrements en Attente</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">142 Transactions</div>
                <p className="text-[11px] text-slate-500 font-mono">Mises en file d&apos;attente locales</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <span className="text-xs font-black text-slate-500 uppercase">Conflits Réseau Résolus</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Automatique</div>
                <p className="text-[11px] text-slate-500 font-mono">0 perte de donnée</p>
              </div>
            </div>

            {/* Simulated Conflict Resolver */}
            <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-200 flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>Gestionnaire Intelligent de Conflit de Synchronisation</span>
              </h4>
              <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                Si une fiche élève ou un paiement est modifié localement sans réseau et simultanément sur le serveur national, le système propose une fusion intelligente basée sur les horodatages et les signatures cryptographiques.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: JOURNAL D'AUDIT NATIONAL */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Journal d&apos;Audit National des Sauvegardes &amp; Restaurations
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Enregistrement inaltérable de toutes les opérations de protection des données, téléchargements et tentatives d&apos;accès.
                </p>
              </div>

              <button
                onClick={() => showNotification("Journal d'Audit National exporté sous format officiel scellé PDF/CSV.")}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center space-x-2 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Exporter le Journal d&apos;Audit</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Horodatage</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Établissement</th>
                    <th className="py-3 px-4">Opérateur / Rôle</th>
                    <th className="py-3 px-4">Résultat</th>
                    <th className="py-3 px-4">Détails Opérationnels</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">
                        {log.schoolName}
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">
                        {log.operator} ({log.role})
                      </td>

                      <td className="py-3 px-4">
                        {log.status === "SUCCÈS" ? (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded">
                            SUCCÈS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px] rounded animate-pulse">
                            {log.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: CONFIGURATION DES FRÉQUENCES */}
      {activeTab === "config" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Configuration des Fréquences de Sauvegarde &amp; Rétention</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Le Propriétaire de SmartSchool RDC peut modifier les paramètres globaux d&apos;automatisation et de conservation pour l&apos;ensemble du réseau national.
              </p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    Sauvegarde Horaire
                  </div>
                  <div className="text-slate-500">Capture l&apos;état toutes les 60 minutes</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    Rétention: {frequencies.hourly.retentionDays} jours
                  </span>
                  <input
                    type="checkbox"
                    checked={frequencies.hourly.enabled}
                    onChange={(e) =>
                      setFrequencies(f => ({ ...f, hourly: { ...f.hourly, enabled: e.target.checked } }))
                    }
                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    Sauvegarde Quotidienne
                  </div>
                  <div className="text-slate-500">Exécutée chaque nuit à 02:00 heure de Kinshasa</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    Rétention: {frequencies.daily.retentionDays} jours
                  </span>
                  <input
                    type="checkbox"
                    checked={frequencies.daily.enabled}
                    onChange={(e) =>
                      setFrequencies(f => ({ ...f, daily: { ...f.daily, enabled: e.target.checked } }))
                    }
                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    Sauvegarde Hebdomadaire &amp; Mensuelle
                  </div>
                  <div className="text-slate-500">Scellés archivés sur bande virtuelle et cloud froid</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded">
                  ACTIVÉ PAR DÉFAUT
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => showNotification("Paramètres de fréquence et de rétention enregistrés avec succès.")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Enregistrer les Modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
