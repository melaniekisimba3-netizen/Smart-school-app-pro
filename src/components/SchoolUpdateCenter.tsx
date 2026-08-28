import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
  Database,
  History,
  Lock,
  Sparkles,
  Server,
  Zap,
  ArrowRight,
  RotateCcw,
  Check,
  FileText,
  Clock,
  Layers
} from "lucide-react";
import {
  systemUpdateService,
  SystemVersionInfo,
  UpdateCheckResult,
  UpdateExecutionProgress,
  BackupSnapshot
} from "../services/systemUpdateService";

interface SchoolUpdateCenterProps {
  schoolName?: string;
  userRole?: string;
  userName?: string;
  activeSchoolId?: string;
}

export function SchoolUpdateCenter({
  schoolName = "Établissement Scolaire",
  userRole = "Promoteur",
  userName = "Direction",
  activeSchoolId = "default"
}: SchoolUpdateCenterProps) {
  const [versionInfo, setVersionInfo] = useState<SystemVersionInfo | null>(null);
  const [updateCheck, setUpdateCheck] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<UpdateExecutionProgress>({
    step: "idle",
    progressPercent: 0,
    message: ""
  });
  const [updateResult, setUpdateResult] = useState<{ success: boolean; message: string; snapshotId?: string; error?: string } | null>(null);

  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load initial version info and backup snapshots
  useEffect(() => {
    loadSystemState();
  }, []);

  const loadSystemState = async () => {
    try {
      const v = await systemUpdateService.getSystemVersion();
      setVersionInfo(v);
      const b = await systemUpdateService.getBackupSnapshots();
      setSnapshots(b);
    } catch (e) {
      console.error("Error loading system state:", e);
    }
  };

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    setUpdateResult(null);
    try {
      const res = await systemUpdateService.checkForUpdates();
      setUpdateCheck(res);
      // Reload version info
      const v = await systemUpdateService.getSystemVersion();
      setVersionInfo(v);
    } catch (e) {
      console.error("Update check failed:", e);
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplyUpdate = async () => {
    if (!updateCheck?.latestRelease) return;

    setIsUpdating(true);
    setUpdateResult(null);

    const result = await systemUpdateService.applyUpdate(
      updateCheck.latestRelease.version,
      { schoolId: activeSchoolId, userRole, userName },
      (progress) => setUpdateProgress(progress)
    );

    setUpdateResult(result);
    setIsUpdating(false);

    if (result.success) {
      // Reload system state and snapshots
      loadSystemState();
      // Clear update notice if matched
      setUpdateCheck(prev => prev ? { ...prev, hasUpdate: false } : null);
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (!window.confirm(`Confirmez-vous la restauration de la base de données vers le point "${snapshotId}" ? Un snapshot préventif de l'état actuel sera créé.`)) {
      return;
    }

    setIsRestoring(true);
    setRestoreMessage(null);

    const res = await systemUpdateService.restoreBackup(snapshotId, { userRole, userName });

    setIsRestoring(false);
    if (res.success) {
      setRestoreMessage({ text: res.message, type: "success" });
      loadSystemState();
    } else {
      setRestoreMessage({ text: res.error || "Échec de la restauration.", type: "error" });
    }
  };

  const hasNewerVersion = updateCheck?.hasUpdate && updateCheck.latestRelease && updateCheck.latestRelease.version !== versionInfo?.currentVersion;

  return (
    <div id="smartschool_update_center" className="space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER BANNER: SOUVERAINETÉ & SÉCURITÉ ZERO-DATA-LOSS */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Architecture SaaS Souveraine RDC
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Lock className="h-3.5 w-3.5 text-blue-400" />
                Garantie Zéro Perte de Données
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Mise à jour de SmartSchool RDC
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl">
              Système unifié de maintenance continue pour <strong>{schoolName}</strong>. Les élèves, notes, présences, comptes et reçus de caisse sont totalement découplés du code et restent inviolables lors de chaque publication.
            </p>
          </div>

          <button
            id="btn_check_updates_header"
            onClick={handleCheckUpdates}
            disabled={isChecking || isUpdating}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Vérification en cours..." : "Vérifier les mises à jour"}
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3.5 border border-slate-700/50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Version Active</span>
            <span className="text-base font-black text-white">{versionInfo?.currentVersion || "2026.2.1-LTS"}</span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3.5 border border-slate-700/50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Schéma Base</span>
            <span className="text-base font-black text-emerald-400">v{versionInfo?.databaseSchemaVersion || "2026.2.0"}</span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3.5 border border-slate-700/50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Patchs Sécurité</span>
            <span className="text-base font-black text-blue-300">Autonomes & Actifs</span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3.5 border border-slate-700/50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Dernier Check</span>
            <span className="text-xs font-bold text-slate-300">
              {versionInfo?.lastUpdateCheckedAt ? new Date(versionInfo.lastUpdateCheckedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "À l'instant"}
            </span>
          </div>
        </div>
      </div>

      {/* UPDATE STATUS NOTIFICATION & AVAILABLE UPDATE BOX */}
      {hasNewerVersion ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border-2 border-brand-blue/30 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-brand-blue flex items-center justify-center font-black">
                <Sparkles className="h-6 w-6 text-brand-blue" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-brand-blue dark:text-blue-300">
                    Nouvelle Version Disponible
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Sortie le {updateCheck?.latestRelease?.releaseDate ? new Date(updateCheck.latestRelease.releaseDate).toLocaleDateString("fr-FR") : "28/08/2026"}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  SmartSchool RDC {updateCheck?.latestRelease?.version}
                </h3>
              </div>
            </div>

            <button
              id="btn_apply_system_update"
              onClick={handleApplyUpdate}
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className={`h-4 w-4 ${isUpdating ? "animate-bounce" : ""}`} />
              {isUpdating ? "Mise à jour en cours..." : "Mettre à jour l'établissement"}
            </button>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
            {updateCheck?.latestRelease?.summary}
          </p>

          {/* CHANGELOG CATEGORIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {updateCheck?.latestRelease?.changelog.security && updateCheck.latestRelease.changelog.security.length > 0 && (
              <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Sécurité & Intégrité des Données
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                  {updateCheck.latestRelease.changelog.security.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {updateCheck?.latestRelease?.changelog.features && updateCheck.latestRelease.changelog.features.length > 0 && (
              <div className="bg-blue-50/70 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                <h4 className="text-xs font-black uppercase text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                  <Zap className="h-4 w-4 text-brand-blue" />
                  Nouvelles Fonctionnalités & Pédagogie
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-900 dark:text-blue-200">
                  {updateCheck.latestRelease.changelog.features.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {updateCheck?.latestRelease?.changelog.performance && updateCheck.latestRelease.changelog.performance.length > 0 && (
              <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                <h4 className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                  <Server className="h-4 w-4 text-amber-600" />
                  Performance & Synchronisation
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                  {updateCheck.latestRelease.changelog.performance.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {updateCheck?.latestRelease?.changelog.rdcCompliance && updateCheck.latestRelease.changelog.rdcCompliance.length > 0 && (
              <div className="bg-purple-50/70 dark:bg-purple-950/20 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                <h4 className="text-xs font-black uppercase text-purple-800 dark:text-purple-300 flex items-center gap-1.5 mb-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Conformité Réglementaire RDC & EPST
                </h4>
                <ul className="space-y-1.5 text-xs text-purple-900 dark:text-purple-200">
                  {updateCheck.latestRelease.changelog.rdcCompliance.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* REAL-TIME PROGRESS BAR IF UPDATING */}
          {isUpdating && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-brand-blue animate-spin" />
                  {updateProgress.message || "Préparation de la mise à jour..."}
                </span>
                <span>{updateProgress.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${updateProgress.progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                🛡️ Sauvegarde automatique préalable active. Vos données ne seront ni supprimées ni réinitialisées.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-100">
                Votre système SmartSchool RDC est à jour
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Version installée : <strong>{versionInfo?.currentVersion || "2026.2.1-LTS"}</strong>. Toutes les données réelles sont intègres et synchronisées.
              </p>
            </div>
          </div>
          <button
            onClick={handleCheckUpdates}
            disabled={isChecking}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0"
          >
            Re-vérifier
          </button>
        </div>
      )}

      {/* UPDATE RESULT FEEDBACK MESSAGE */}
      {updateResult && (
        <div
          className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
            updateResult.success
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100"
              : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100"
          }`}
        >
          {updateResult.success ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <p className="font-bold text-sm">{updateResult.message}</p>
            {updateResult.snapshotId && (
              <p className="text-emerald-700 dark:text-emerald-300 font-mono">
                Point de restauration créé : <strong>{updateResult.snapshotId}</strong>
              </p>
            )}
            {updateResult.error && <p className="text-rose-700 dark:text-rose-300">{updateResult.error}</p>}
          </div>
        </div>
      )}

      {/* ZERO-DATA-LOSS PILLARS CHECKLIST */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-brand-blue flex items-center justify-center">
            <Database className="h-5 w-5 text-brand-blue" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Garanties Architecturales de Préservation des Données
            </h3>
            <p className="text-xs text-slate-500">
              Protocoles de sécurité en production assurant l'étanchéité absolue de l'établissement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-3">
            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Non-suppression des données</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Les élèves, professeurs, bulletins et historiques ne sont jamais supprimés lors d'une publication.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-3">
            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Conservation des comptes & accès</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Les mots de passe, rôles, questions de sécurité et autorisations restent 100% intacts.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-3">
            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Historique financier scellé</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Les transactions Mobile Money, reçus et états de caisse sont verrouillés et immuables.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-3">
            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Sauvegarde pré-migration auto</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Un snapshot complet est généré avant tout changement structurel de base de données.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-3">
            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Sécurité critique autonome</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Les correctifs critiques de sécurité s'appliquent immédiatement sans dépendre d'un clic.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-700/50 flex items-start gap-3">
            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Compatibilité Firestore & Cloud</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Synchronisation sécurisée continue avec les règles ABAC Firestore déployées.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RESTORE POINTS & SNAPSHOTS MANAGER */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
              <History className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Points de Restauration Automatiques ({snapshots.length})
              </h3>
              <p className="text-xs text-slate-500">
                Snapshots de sécurité générés avant chaque mise à niveau de version.
              </p>
            </div>
          </div>
        </div>

        {restoreMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              restoreMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {restoreMessage.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {restoreMessage.text}
          </div>
        )}

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {snapshots.map((snap) => (
            <div
              key={snap.snapshotId}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {snap.snapshotId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                    {snap.sourceVersion || "2026.2.1-LTS"}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(snap.timestamp).toLocaleString("fr-FR")}
                  </span>
                  <span>• {snap.reason}</span>
                </p>
              </div>

              <button
                onClick={() => handleRestoreSnapshot(snap.snapshotId)}
                disabled={isRestoring || isUpdating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition text-xs cursor-pointer shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5 text-purple-600" />
                Restaurer ce point
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
