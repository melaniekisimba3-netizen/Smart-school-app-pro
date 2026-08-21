import React, { useState, useMemo } from "react";
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Filter, 
  Users, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  RefreshCw, 
  Calendar, 
  Building, 
  ChevronRight, 
  Eye, 
  Award, 
  Sparkles, 
  Smartphone, 
  Landmark, 
  BookOpen, 
  Activity, 
  Receipt,
  Layers,
  Lock,
  ArrowRight,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Student, Employee, Parent, Payment, TimetableEntry, LessonPlanEntry, PedagogicalForecast } from "../types";
import { 
  OFFICIAL_DOSSIERS_CATALOG, 
  OfficialDossierType, 
  exportDossierToPDF, 
  exportDossierToExcel, 
  printOfficialDossier,
  getDossierData,
  ExportContextOptions 
} from "../services/universalDossierExportService";
import { useSmartSchoolCore } from "../context/SmartSchoolCoreContext";

interface UniversalExportCenterProps {
  students?: Student[];
  employees?: Employee[];
  parents?: Parent[];
  payments?: Payment[];
  timetables?: TimetableEntry[];
  lessonPlans?: LessonPlanEntry[];
  forecasts?: PedagogicalForecast[];
  schoolId?: string;
  schoolName?: string;
  schoolYear?: string;
  userName?: string;
  userRole?: string;
}

export function UniversalExportCenter({
  students = [],
  employees = [],
  parents = [],
  payments = [],
  timetables = [],
  lessonPlans = [],
  forecasts = [],
  schoolId = "sch-001",
  schoolName = "Complexe Scolaire SmartSchool RDC",
  schoolYear = "2026-2027",
  userName = "Direction Générale",
  userRole = "Directeur Général"
}: UniversalExportCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDossier, setActiveDossier] = useState<OfficialDossierType>("students");
  const [filterClass, setFilterClass] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (title: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const { getSchoolPrintConfig } = useSmartSchoolCore();
  const schoolPrintConfig = useMemo(() => getSchoolPrintConfig({ id: schoolId, name: schoolName }), [getSchoolPrintConfig, schoolId, schoolName]);

  const contextOptions: ExportContextOptions = useMemo(() => ({
    schoolId,
    schoolName: schoolPrintConfig?.schoolName || schoolName,
    schoolYear: schoolPrintConfig?.schoolYear || schoolYear,
    province: schoolPrintConfig?.province || "Province Éducationnelle de Kinshasa-Gombe",
    address: schoolPrintConfig?.address,
    phone: schoolPrintConfig?.phone,
    email: schoolPrintConfig?.email,
    schoolMotto: schoolPrintConfig?.schoolMotto,
    schoolLogoUrl: schoolPrintConfig?.logoUrl,
    userName,
    userRole,
    filterClass: filterClass || undefined
  }), [schoolId, schoolName, schoolYear, userName, userRole, filterClass, schoolPrintConfig]);

  const categories = ["Tous", "Pédagogie & Élèves", "Personnel & RH", "Vie Scolaire", "Finance & Caisse", "Planification & Direction"];

  const filteredDossiers = useMemo(() => {
    return OFFICIAL_DOSSIERS_CATALOG.filter(d => {
      const matchCat = selectedCategory === "Tous" || d.category === selectedCategory;
      const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const rawData = useMemo(() => ({
    students,
    employees,
    parents,
    payments,
    timetables,
    lessonPlans,
    forecasts
  }), [students, employees, parents, payments, timetables, lessonPlans, forecasts]);

  const activeDossierData = useMemo(() => {
    return getDossierData(activeDossier, rawData, contextOptions);
  }, [activeDossier, rawData, contextOptions]);

  const handleExportPDF = async (dossierType: OfficialDossierType) => {
    try {
      setIsExporting(true);
      showToast(`Génération du PDF officiel avec filigrane RDC et sceau pour : ${dossierType}...`, "info");
      await exportDossierToPDF(dossierType, rawData, contextOptions);
      showToast("Document PDF officiel téléchargé avec succès !", "success");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la génération du fichier PDF.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = (dossierType: OfficialDossierType, format: "xlsx" | "csv" = "xlsx") => {
    try {
      showToast(`Exportation du fichier ${format.toUpperCase()} en cours...`, "info");
      exportDossierToExcel(dossierType, rawData, contextOptions, format);
      showToast(`Fichier ${format.toUpperCase()} généré et téléchargé avec succès !`, "success");
    } catch (err) {
      console.error(err);
      showToast(`Erreur lors de l'exportation ${format.toUpperCase()}.`, "error");
    }
  };

  const handlePrint = (dossierType: OfficialDossierType) => {
    try {
      printOfficialDossier(dossierType, rawData, contextOptions);
      showToast("Ouverture de la fenêtre d'impression officielle...", "info");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'impression.", "error");
    }
  };

  const renderDossierIcon = (iconName: string) => {
    switch (iconName) {
      case "GraduationCap": return <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case "Briefcase": return <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "Users": return <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "Layers": return <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case "Award": return <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case "CheckCircle2": return <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />;
      case "Landmark": return <Landmark className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
      case "Smartphone": return <Smartphone className="h-5 w-5 text-sky-600 dark:text-sky-400" />;
      case "Receipt": return <Receipt className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case "Calendar": return <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case "BookOpen": return <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "Sparkles": return <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />;
      case "Activity": return <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />;
      default: return <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 text-left" id="universal-export-center-root">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center space-x-2 ${
              toastMessage.type === "success" 
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-700 backdrop-blur-md" 
                : toastMessage.type === "error"
                ? "bg-rose-950/90 text-rose-200 border-rose-700 backdrop-blur-md"
                : "bg-blue-950/90 text-blue-200 border-blue-700 backdrop-blur-md"
            }`}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{toastMessage.title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold tracking-wider uppercase border border-indigo-500/30">
                14 Dossiers Officiels RDC • ÉPST
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>Isolation SchoolId : {schoolId}</span>
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <Printer className="h-7 w-7 text-indigo-400" />
              <span>Centre Universel d'Impression & d'Exportation</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Génération normalisée de tous les états, registres, fiches et documents administratifs certifiés conformes au programme de l'Enseignement Primaire, Secondaire et Technique (RDC).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Établissement Actif</p>
              <p className="text-xs font-black text-white">{schoolName}</p>
              <p className="text-[10px] text-indigo-300 font-mono">Année {schoolYear}</p>
            </div>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Tous les exports intègrent le Filigrane de Sécurité National, l'en-tête ministérielle et les blocs de signatures.</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleExportPDF(activeDossier)}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Exporter le dossier actif en PDF</span>
            </button>
            <button
              onClick={() => handleExportExcel(activeDossier, "xlsx")}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Exporter en Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handlePrint(activeDossier)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-slate-700 shadow-md cursor-pointer transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category filters */}
        <div className="flex overflow-x-auto gap-1.5 pb-2 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Class Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative w-full md:w-64">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un dossier..."
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="">Toutes les classes</option>
            <option value="6ème Math-Physique">6ème Math-Physique</option>
            <option value="6ème Commerciale & Gestion">6ème Commerciale</option>
            <option value="5ème Scientifique">5ème Scientifique</option>
            <option value="4ème Éducation de Base">4ème Éducation de Base</option>
            <option value="3ème Primaire A">3ème Primaire A</option>
            <option value="1ère Maternelle">1ère Maternelle</option>
          </select>
        </div>
      </div>

      {/* Main Workspace Layout: Dossier Catalog (Left) + Live Preview & Export Hub (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of 14 Official Dossiers */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Catalogue des 14 Dossiers ({filteredDossiers.length})
            </h2>
            <span className="text-[10px] text-slate-400 font-bold">Sélectionnez pour prévisualiser</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredDossiers.map(dossier => {
              const isSelected = activeDossier === dossier.id;
              return (
                <div
                  key={dossier.id}
                  onClick={() => setActiveDossier(dossier.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-md ring-1 ring-indigo-500/30"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}>
                      {renderDossierIcon(dossier.iconName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className={`text-xs font-bold truncate ${isSelected ? "text-indigo-950 dark:text-indigo-200 font-black" : "text-slate-900 dark:text-white"}`}>
                          {dossier.title}
                        </h3>
                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-indigo-600 translate-x-0.5" : "text-slate-400"}`} />
                      </div>
                      
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {dossier.description}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {dossier.category}
                        </span>

                        <div className="flex items-center space-x-1 text-[10px] font-mono">
                          {dossier.supportedFormats.map(fmt => (
                            <span 
                              key={fmt}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                fmt === "PDF" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" :
                                fmt === "Excel" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" :
                                fmt === "CSV" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" :
                                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {fmt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Table Preview & Targeted Export Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Header of the Selected Dossier */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Prévisualisation Document Officiel
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {activeDossierData.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeDossierData.subtitle}
                </p>
              </div>

              {/* Action Buttons for this specific dossier */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleExportPDF(activeDossier)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                  title="Télécharger en format PDF certifié"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>PDF RDC</span>
                </button>
                <button
                  onClick={() => handleExportExcel(activeDossier, "xlsx")}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                  title="Télécharger en format Excel (.xlsx)"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => handleExportExcel(activeDossier, "csv")}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                  title="Télécharger en format CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handlePrint(activeDossier)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                  title="Imprimer directement"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>

            {/* Official Watermark & National Header Representation */}
            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  <strong>Conformité : </strong> Modèle conforme aux normes de la Direction des Programmes Scolaires & Matériel Didactique (DIPROMAD / EPST).
                </span>
              </div>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                {activeDossierData.rows.length} lignes
              </span>
            </div>

            {/* Table Preview */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner">
              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider z-10">
                    <tr>
                      {activeDossierData.headers.map((header, hIdx) => (
                        <th key={hIdx} className="py-2.5 px-3 whitespace-nowrap border-b border-slate-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
                    {activeDossierData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={activeDossierData.headers.length} className="py-8 text-center text-slate-400">
                          Aucun enregistrement trouvé pour ce filtre d'école.
                        </td>
                      </tr>
                    ) : (
                      activeDossierData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 whitespace-nowrap font-medium text-[11px]">
                              {typeof cell === "string" && cell.startsWith("✓") ? (
                                <span className="text-emerald-600 font-bold">{cell}</span>
                              ) : typeof cell === "string" && cell.startsWith("⏳") ? (
                                <span className="text-amber-600 font-bold">{cell}</span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Footnote with Signatory Indicators */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Signataires automatiques : Secrétaire Administratif & Chef d'Établissement</span>
              </div>
              <div className="font-mono text-slate-400">
                SchoolId : <span className="text-indigo-600 font-bold">{schoolId}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
