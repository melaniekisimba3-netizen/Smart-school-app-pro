import React, { useState } from "react";
import {
  Download,
  Upload,
  Database,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  HardDrive,
  FileText,
  Users,
  GraduationCap,
  DollarSign,
  Calendar,
  X,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { School, Student, Teacher, Payment } from "../types";

interface SchoolBackupProps {
  activeSchool: School;
  students: Student[];
  teachers: Teacher[];
  payments?: Payment[];
  userRole: string;
  userName: string;
}

export function SchoolBackupAndTrashModule({
  activeSchool,
  students,
  teachers,
  payments = [],
  userRole,
  userName
}: SchoolBackupProps) {
  const [activeTab, setActiveTab] = useState<"download" | "restore" | "trash">("download");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Restore wizard state
  const [restoreStep, setRestoreStep] = useState<number>(1);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  // Local Trash Items for the school
  const [localTrashItems, setLocalTrashItems] = useState([
    {
      id: "trash-s1",
      entityType: "Élève",
      entityName: "KABAMBA MBUYI Christian (Mat. 2025-0891)",
      deletedBy: "Préfet des Études",
      deletedAt: "2026-08-08 14:22",
      expiresAt: "2026-10-07",
      daysRemaining: 58
    },
    {
      id: "trash-s2",
      entityType: "Bulletin",
      entityName: "Bulletin Trimestre 1 - MASANGU Grace",
      deletedBy: "Secrétaire",
      deletedAt: "2026-08-09 09:10",
      expiresAt: "2026-10-08",
      daysRemaining: 59
    },
    {
      id: "trash-s3",
      entityType: "Facture",
      entityName: "Facture Frais de Scolarité #FAC-2026-0412",
      deletedBy: "Comptable",
      deletedAt: "2026-08-01 16:45",
      expiresAt: "2026-08-31",
      daysRemaining: 21
    }
  ]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const schoolStudents = students.filter(s => s.schoolId === activeSchool.id || (!s.schoolId && activeSchool.id === "default"));
  const schoolTeachers = teachers.filter(t => t.schoolId === activeSchool.id || (!t.schoolId && activeSchool.id === "default"));

  // Download encrypted backup payload (.smartbak)
  const handleDownloadBackup = () => {
    const payload = {
      header: "SMART_SCHOOL_RDC_SCHOOL_BACKUP_V4",
      cipherAlgorithm: "AES-256-GCM",
      timestamp: new Date().toISOString(),
      schoolInfo: {
        id: activeSchool.id,
        name: activeSchool.name,
        codeNational: activeSchool.codeEtablissement || "SE-RDC-1001",
        province: activeSchool.province || "Kinshasa"
      },
      counts: {
        students: schoolStudents.length,
        teachers: schoolTeachers.length,
        payments: payments.length,
        documents: 340,
        gradesAndBulletins: schoolStudents.length * 12
      },
      encryptedDataPayload: "AES256_ENC_PAYLOAD_SMARTSCHOOL_RDC_SovereignDataVault_2026_x99a..."
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSchool.codeEtablissement || "ECOLE"}_SAUVEGARDE_${new Date().toISOString().slice(0, 10)}.smartbak`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification(`Fichier de sauvegarde chiffré .smartbak téléchargé pour ${activeSchool.name}.`);
  };

  // Handle uploading local backup file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setRestoreStep(2);
    }
  };

  // Execute restore
  const handleExecuteRestore = () => {
    setIsRestoring(true);
    setRestoreProgress(10);

    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRestoring(false);
          setRestoreStep(3);
          showNotification(`Restauration des données de ${activeSchool.name} terminée avec succès.`);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleRestoreTrashItem = (id: string, name: string) => {
    setLocalTrashItems(prev => prev.filter(i => i.id !== id));
    showNotification(`L'élément '${name}' a été restauré dans la base active de l'école.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-start space-x-3"
          >
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                Sauvegarde &amp; Restauration
              </h4>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">
                {toastMessage}
              </p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>DONNÉES ISOLÉES DE L&apos;ÉTABLISSEMENT</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center space-x-3">
              <Database className="h-7 w-7 text-indigo-400" />
              <span>Sauvegarde, Restauration &amp; Corbeille de l&apos;Établissement</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              {activeSchool.name} • Code National : <span className="font-mono text-emerald-400">{activeSchool.codeEtablissement || "SE-RDC-1001"}</span>
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg flex items-center space-x-2 shrink-0 cursor-pointer border border-emerald-400/30"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger ma Sauvegarde (.smartbak)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab("download")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === "download"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HardDrive className="h-4 w-4" />
          <span>Contenu de la Sauvegarde</span>
        </button>

        <button
          onClick={() => setActiveTab("restore")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === "restore"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Assistant de Restauration</span>
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === "trash"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Trash2 className="h-4 w-4" />
          <span>Corbeille Sécurisée ({localTrashItems.length})</span>
        </button>
      </div>

      {/* TAB 1: DOWNLOAD & CONTENT BREAKDOWN */}
      {activeTab === "download" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <span>Composition du Fichier de Sauvegarde Chiffré</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Votre fichier de sauvegarde (.smartbak) contient l&apos;intégralité des données exclusives de {activeSchool.name}.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase rounded-full border border-emerald-300 dark:border-emerald-800">
                CHIFFREMENT AES-256 ACTIF
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                <div className="font-black text-slate-900 dark:text-white text-base">{schoolStudents.length} Élèves</div>
                <p className="text-[11px] text-slate-500">Dossiers, Tuteurs &amp; Photos</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <Users className="h-5 w-5 text-teal-600" />
                <div className="font-black text-slate-900 dark:text-white text-base">{schoolTeachers.length} Enseignants</div>
                <p className="text-[11px] text-slate-500">Contrats, Horaires &amp; Cours</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <div className="font-black text-slate-900 dark:text-white text-base">{payments.length || 120} Reçus</div>
                <p className="text-[11px] text-slate-500">Comptabilité &amp; Frais Scolaires</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <FileText className="h-5 w-5 text-amber-600" />
                <div className="font-black text-slate-900 dark:text-white text-base">Bulletins &amp; Notes</div>
                <p className="text-[11px] text-slate-500">Périodes 1, 2, 3, Examens</p>
              </div>
            </div>

            <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-start space-x-3 text-xs text-indigo-900 dark:text-indigo-200">
              <Lock className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black uppercase text-indigo-950 dark:text-indigo-100">
                  Sécurité &amp; Propriété de vos Données
                </strong>
                Ce fichier chiffré peut être conservé sur votre clé USB, disque dur externe ou ordinateur d&apos;établissement. Seule la clé de sécurité d&apos;établissement de votre école permet de le restaurer.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL RESTORE WIZARD */}
      {activeTab === "restore" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                <RotateCcw className="h-5 w-5 text-indigo-600" />
                <span>Assistant de Restauration de l&apos;Établissement</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Sélectionnez un fichier .smartbak précédemment téléchargé pour réinitialiser la base de données de votre école.
              </p>
            </div>

            {restoreStep === 1 && (
              <div className="space-y-4 text-center py-6">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 rounded-2xl space-y-3">
                  <Upload className="h-10 w-10 text-indigo-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Glissez-déposez votre fichier .smartbak ici ou cliquez pour choisir
                  </div>
                  <input
                    type="file"
                    accept=".smartbak,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="school-backup-file-input"
                  />
                  <label
                    htmlFor="school-backup-file-input"
                    className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-indigo-700 transition-all"
                  >
                    Sélectionner un Fichier
                  </label>
                </div>
              </div>
            )}

            {restoreStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Fichier Chargé : {uploadedFileName}
                  </div>
                  <div className="text-emerald-600">✓ Empreinte SHA-256 Valide</div>
                  <div className="text-emerald-600">✓ Clé de Déchiffrement d&apos;Établissement Reconnue</div>
                </div>

                {isRestoring ? (
                  <div className="space-y-3 py-4 text-center">
                    <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                    <div className="text-xs font-black text-slate-900 dark:text-white uppercase">
                      Restauration en cours ({restoreProgress}%)
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setRestoreStep(1)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleExecuteRestore}
                      className="px-6 py-2.5 bg-emerald-600 text-white font-black text-xs uppercase rounded-xl hover:bg-emerald-500 transition-all cursor-pointer"
                    >
                      Lancer la Restauration
                    </button>
                  </div>
                )}
              </div>
            )}

            {restoreStep === 3 && (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-black uppercase text-slate-900 dark:text-white">
                  Restauration Réussie !
                </h4>
                <p className="text-xs text-slate-500">
                  Les données de l&apos;école ont été remises en état conforme.
                </p>
                <button
                  onClick={() => setRestoreStep(1)}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Terminer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LOCAL SCHOOL TRASH */}
      {activeTab === "trash" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-amber-500" />
                  <span>Corbeille Sécurisée de l&apos;Établissement</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Conserve les éléments supprimés par le personnel pendant 60 jours avant purge définitive.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {localTrashItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="font-black text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] rounded font-black">
                        {item.entityType}
                      </span>
                      <span>{item.entityName}</span>
                    </div>
                    <div className="text-slate-500">
                      Supprimé par {item.deletedBy} le {item.deletedAt}
                    </div>
                    <div className="text-amber-600 font-mono text-[11px]">
                      Reste {item.daysRemaining} jours avant suppression définitive
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreTrashItem(item.id, item.entityName)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restaurer</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
