import React, { useState, useMemo } from "react";
import { 
  Camera, AlertCircle, CheckCircle2, Send, Download, Search, Filter, 
  Building2, Users, GraduationCap, Briefcase, RefreshCw, MessageSquare, 
  ExternalLink, Mail, Phone, Clock, FileSpreadsheet, ShieldAlert, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { School, Student, Employee, Teacher, UserAccount, PlatformStaffPermissions } from "../../types";
import { 
  scanPlatformForMissingPhotos, 
  recordMissingPhotoReminderSent, 
  buildSchoolMissingPhotoReminderText,
  MissingPhotoSchoolSummary,
  MissingPhotoRecord
} from "../../services/missingPhotosService";
import { safeCopyToClipboard } from "../../utils/safeStorage";

interface MissingPhotosAuditDashboardProps {
  schools: School[];
  students: Student[];
  employees: Employee[];
  teachers?: (Teacher | any)[];
  userAccounts?: UserAccount[];
  staffPermissions?: PlatformStaffPermissions;
  currentStaffName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function MissingPhotosAuditDashboard({
  schools,
  students,
  employees,
  teachers = [],
  userAccounts = [],
  staffPermissions,
  currentStaffName = "Support Plateforme SmartSchool",
  onAuditLog
}: MissingPhotosAuditDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [filterProfileType, setFilterProfileType] = useState<string>("all");
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [reminderModalSchool, setReminderModalSchool] = useState<MissingPhotoSchoolSummary | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Auto-scan execution
  const scanResult = useMemo(() => {
    return scanPlatformForMissingPhotos(schools, students, employees, teachers, userAccounts);
  }, [schools, students, employees, teachers, userAccounts, isRefreshing]);

  // Available provinces
  const provinces = useMemo(() => {
    const set = new Set<string>();
    scanResult.schoolSummaries.forEach(s => {
      if (s.province) set.add(s.province);
    });
    return Array.from(set).sort();
  }, [scanResult]);

  // Filtered schools
  const filteredSchoolSummaries = useMemo(() => {
    return scanResult.schoolSummaries.filter(summary => {
      const matchSearch = summary.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.records.some(r => r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || r.matriculeOrId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchProvince = selectedProvince === "all" || summary.province === selectedProvince;

      const matchType = filterProfileType === "all" || (
        filterProfileType === "eleve" && summary.studentsMissing > 0 ||
        filterProfileType === "enseignant" && summary.teachersMissing > 0 ||
        filterProfileType === "staff" && summary.staffMissing > 0
      );

      return matchSearch && matchProvince && matchType;
    });
  }, [scanResult, searchQuery, selectedProvince, filterProfileType]);

  const canNotify = staffPermissions ? staffPermissions.canNotifySchoolsForMissingPhotos : true;

  const handleSendReminder = (summary: MissingPhotoSchoolSummary) => {
    recordMissingPhotoReminderSent(summary.schoolId);
    if (onAuditLog) {
      onAuditLog(
        "Rappel Photos Manquantes Envoyé",
        `Rappel transmis à ${summary.schoolName} pour ${summary.missingCount} profils sans photo.`
      );
    }
    setActionFeedback(`Rappel officiel enregistré pour ${summary.schoolName}`);
    setTimeout(() => setActionFeedback(null), 4000);
    setReminderModalSchool(null);
  };

  const handleExportCSV = (summary?: MissingPhotoSchoolSummary) => {
    const recordsToExport = summary ? summary.records : scanResult.allMissingRecords;
    if (recordsToExport.length === 0) return;

    const headers = ["ID", "Établissement", "Type de Profil", "Nom Complet", "Matricule", "Classe/Fonction", "Téléphone", "Email", "Date Détection"];
    const rows = recordsToExport.map(r => [
      `"${r.id}"`,
      `"${r.schoolName.replace(/"/g, '""')}"`,
      `"${r.profileType}"`,
      `"${r.fullName.replace(/"/g, '""')}"`,
      `"${r.matriculeOrId}"`,
      `"${(r.classroomOrRole || "").replace(/"/g, '""')}"`,
      `"${r.contactPhone || ""}"`,
      `"${r.contactEmail || ""}"`,
      `"${r.detectedAt}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `profils_sans_photo_${summary ? summary.schoolId : "toutes_ecoles"}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const complianceRate = scanResult.totalScanned > 0
    ? Math.round(((scanResult.totalScanned - scanResult.totalMissing) / scanResult.totalScanned) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* HEADER WITH REALTIME ENGINE STATUS */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Moteur Proactif de Détection Automatique
              </span>
              <span className="text-xs text-slate-400 font-mono">Surveillance 24/7 Multi-Établissements</span>
            </div>
            
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <Camera className="h-7 w-7 text-amber-400" />
              <span>Contrôle & Détection des Profils Sans Photo</span>
            </h2>
            
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              SmartSchool RDC analyse automatiquement les dossiers de chaque école sans exiger d&apos;intervention manuelle des directeurs. Vous pouvez relancer directement les secrétariats ou exporter les fiches d&apos;anomalies.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setIsRefreshing(true);
                setTimeout(() => setIsRefreshing(false), 600);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
              <span>Rescanner</span>
            </button>

            <button
              onClick={() => handleExportCSV()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Exporter Rapport National (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Profils Scannés</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{scanResult.totalScanned}</p>
          <p className="text-[11px] text-slate-500">Élèves, enseignants & agents administratifs</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Sans Photo Détectés</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{scanResult.totalMissing}</p>
          <p className="text-[11px] text-slate-500">{scanResult.schoolSummaries.filter(s => s.missingCount > 0).length} établissements concernés</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Taux de Conformité Photos</span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{complianceRate}%</p>
            <span className="text-[10px] text-slate-400 font-bold">avec photo officielle</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${complianceRate}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Détail par Catégorie</span>
            <GraduationCap className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-600 dark:text-slate-400">Élèves :</span>
            <span className="font-mono font-bold text-amber-600">{scanResult.allMissingRecords.filter(r => r.profileType === "Élève").length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Enseignants & Staff :</span>
            <span className="font-mono font-bold text-rose-600">{scanResult.allMissingRecords.filter(r => r.profileType !== "Élève").length}</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher école, élève, matricule..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500 font-bold">Province :</span>
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="all">Toutes les provinces</option>
              {provinces.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-bold">Profil :</span>
            <select
              value={filterProfileType}
              onChange={e => setFilterProfileType(e.target.value)}
              className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="all">Tous profils</option>
              <option value="eleve">Élèves uniquement</option>
              <option value="enseignant">Enseignants uniquement</option>
              <option value="staff">Personnel administratif</option>
            </select>
          </div>
        </div>
      </div>

      {/* SCHOOLS SUMMARY LIST */}
      <div className="space-y-4">
        {filteredSchoolSummaries.map(summary => {
          const isExpanded = expandedSchoolId === summary.schoolId;

          return (
            <div
              key={summary.schoolId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase rounded-md">
                      {summary.province}
                    </span>
                    {summary.lastReminderSentAt && (
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Relancé le {summary.lastReminderSentAt}
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white truncate">
                    {summary.schoolName}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>Total inscrits : <strong>{summary.totalUsersCount}</strong></span>
                    <span>•</span>
                    <span className="text-amber-600 font-bold">Sans photo : {summary.missingCount}</span>
                  </div>
                </div>

                {/* BADGES & ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg">
                      Élèves : {summary.studentsMissing}
                    </span>
                    <span className="px-2 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg">
                      Staff & Profs : {summary.teachersMissing + summary.staffMissing}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedSchoolId(isExpanded ? null : summary.schoolId)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    {isExpanded ? "Masquer les détails" : `Voir ${summary.records.length} profils`}
                  </button>

                  <button
                    disabled={!canNotify}
                    onClick={() => setReminderModalSchool(summary)}
                    className={`px-3.5 py-1.5 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                      canNotify 
                        ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20" 
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    }`}
                    title={canNotify ? "Relancer l'école pour compléter les photos" : "Permission canNotifySchoolsForMissingPhotos requise"}
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Relancer l&apos;école</span>
                  </button>

                  <button
                    onClick={() => handleExportCSV(summary)}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer transition-colors"
                    title="Télécharger la liste CSV de cette école"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ACCORDION OF DETAILED MISSING PHOTO RECORDS */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Nom Complet</th>
                            <th className="p-2.5">Matricule</th>
                            <th className="p-2.5">Classe / Poste</th>
                            <th className="p-2.5">Contact Téléphone</th>
                            <th className="p-2.5">Statut Photo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {summary.records.map(rec => (
                            <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  rec.profileType === "Élève"
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300"
                                }`}>
                                  {rec.profileType}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                                {rec.fullName}
                              </td>
                              <td className="p-2.5 font-mono text-slate-500">
                                {rec.matriculeOrId}
                              </td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-300">
                                {rec.classroomOrRole || "-"}
                              </td>
                              <td className="p-2.5 font-mono text-slate-500">
                                {rec.contactPhone || "-"}
                              </td>
                              <td className="p-2.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                  <AlertCircle className="h-3 w-3" />
                                  Photo Absente
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredSchoolSummaries.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Aucun profil sans photo pour ces critères</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tous les profils répertoriés disposent d&apos;une photo officielle conforme ou la recherche ne correspond à aucun résultat.
            </p>
          </div>
        )}
      </div>

      {/* REMINDER MODAL WITH WHATSAPP / SMS / EMAIL INTEGRATION */}
      <AnimatePresence>
        {reminderModalSchool && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                    Notification Souveraine
                  </span>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Rappel Officiel : {reminderModalSchool.schoolName}
                  </h3>
                </div>
                <button
                  onClick={() => setReminderModalSchool(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
                  <span>Anomalies détectées :</span>
                  <span className="text-amber-600 font-mono font-black">{reminderModalSchool.missingCount} profils sans photo</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {buildSchoolMissingPhotoReminderText(reminderModalSchool, currentStaffName)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(buildSchoolMissingPhotoReminderText(reminderModalSchool, currentStaffName))}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleSendReminder(reminderModalSchool)}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all text-center"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp Direction</span>
                  </a>

                  <a
                    href={`mailto:contact@${reminderModalSchool.schoolId}.cd?subject=Rappel SmartSchool - Photos manquantes&body=${encodeURIComponent(buildSchoolMissingPhotoReminderText(reminderModalSchool, currentStaffName))}`}
                    onClick={() => handleSendReminder(reminderModalSchool)}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all text-center"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Officiel</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await safeCopyToClipboard(buildSchoolMissingPhotoReminderText(reminderModalSchool, currentStaffName));
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 2000);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {copiedNotification ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Send className="h-4 w-4" />}
                  <span>{copiedNotification ? "Texte copié dans le presse-papier !" : "Copier le texte du rappel"}</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSendReminder(reminderModalSchool)}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Enregistrer l&apos;envoi & Clôturer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
