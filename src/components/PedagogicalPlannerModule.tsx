import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  BarChart3,
  Clock,
  Printer
} from "lucide-react";
import { usePedagogicalTimetable } from "../context/PedagogicalTimetableContext";
import { ClassRoom, PedagogicalForecast, Subject, Teacher } from "../types";

interface PedagogicalPlannerModuleProps {
  userRole?: string;
  userName?: string;
  classes?: ClassRoom[];
  subjects?: Subject[];
  teachers?: Teacher[];
  onAddNotification?: (notif: any) => void;
}

export const PedagogicalPlannerModule: React.FC<PedagogicalPlannerModuleProps> = ({
  userRole = "Préfet des Études",
  userName = "Direction Pédagogique",
  classes = [],
  subjects = [],
  teachers = [],
  onAddNotification
}) => {
  const {
    pedagogicalForecasts,
    addPedagogicalForecast,
    updatePedagogicalForecast,
    deletePedagogicalForecast,
    getUserResponsibilityScope
  } = usePedagogicalTimetable();

  const userScope = useMemo(() => getUserResponsibilityScope(userRole, userName), [userRole, userName]);

  const getTeacherDisplayName = (t: Teacher) => {
    if (t.name) return t.name;
    const full = `${t.firstName || ""} ${t.lastName || ""}`.trim();
    return full || "Enseignant";
  };

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("Tous");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [formClassName, setFormClassName] = useState(classes[0] ? (classes[0].name || `${classes[0].level} ${classes[0].roomLetter}`.trim()) : "");
  const [formSubjectName, setFormSubjectName] = useState("Mathématiques");
  const [formTeacherName, setFormTeacherName] = useState(teachers[0] ? getTeacherDisplayName(teachers[0]) : "Jean Mukendi");
  const [formChapterTitle, setFormChapterTitle] = useState("");
  const [formMonth, setFormMonth] = useState("Septembre");
  const [formWeekNumber, setFormWeekNumber] = useState(1);
  const [formPlannedHours, setFormPlannedHours] = useState(16);
  const [formCurriculumRef, setFormCurriculumRef] = useState("EPST-CURR-2025-001");
  const [formObjective1, setFormObjective1] = useState("");
  const [formObjective2, setFormObjective2] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Forecasts
  const filteredForecasts = useMemo(() => {
    return pedagogicalForecasts.filter((pf) => {
      if (userScope.levelCategoryScope !== "Tous" && pf.levelCategory !== userScope.levelCategoryScope) {
        return false;
      }
      if (selectedClassFilter !== "Tous" && pf.className !== selectedClassFilter) {
        return false;
      }
      if (selectedMonthFilter !== "Tous" && pf.month !== selectedMonthFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          pf.chapterTitle.toLowerCase().includes(q) ||
          pf.subjectName.toLowerCase().includes(q) ||
          pf.teacherName.toLowerCase().includes(q) ||
          pf.className.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pedagogicalForecasts, userScope, selectedClassFilter, selectedMonthFilter, searchQuery]);

  // Global Progression Metrics
  const metrics = useMemo(() => {
    const totalPlanned = filteredForecasts.reduce((acc, curr) => acc + curr.plannedHours, 0);
    const totalCompleted = filteredForecasts.reduce((acc, curr) => acc + curr.completedHours, 0);
    const avgPercent = totalPlanned > 0 ? Number(((totalCompleted / totalPlanned) * 100).toFixed(1)) : 0;
    const completedChapters = filteredForecasts.filter(f => f.status === "Achevé").length;

    return {
      totalPlanned,
      totalCompleted,
      avgPercent,
      completedChapters,
      totalChapters: filteredForecasts.length
    };
  }, [filteredForecasts]);

  const handleCreateForecast = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formChapterTitle.trim()) {
      setFormError("Veuillez renseigner le titre du chapitre ou du module.");
      return;
    }

    const targetClassObj = classes.find(c => `${c.level} ${c.roomLetter}` === formClassName);
    const levelCat = targetClassObj?.levelCategory || (formClassName.toLowerCase().includes("primaire") ? "Primaire" : "Secondaire");

    const objectives = [formObjective1.trim(), formObjective2.trim()].filter(Boolean);

    addPedagogicalForecast({
      schoolId: "sch-001",
      schoolYear: "2025-2026",
      levelCategory: levelCat,
      className: formClassName,
      subjectName: formSubjectName,
      teacherName: formTeacherName,
      chapterTitle: formChapterTitle.trim(),
      weekNumber: Number(formWeekNumber),
      month: formMonth,
      plannedHours: Number(formPlannedHours),
      completedHours: 0,
      progressionPercent: 0,
      learningObjectives: objectives.length > 0 ? objectives : ["Conformité au programme national EPST"],
      nationalCurriculumReference: formCurriculumRef.trim(),
      status: "Non démarré"
    });

    if (onAddNotification) {
      onAddNotification({
        title: "Nouveau Module Pédagogique Planifié",
        message: `Chapitre "${formChapterTitle}" planifié en ${formClassName} (${formSubjectName}).`,
        type: "info",
        targetRoles: ["Enseignant", "Préfet des Études", "Directeur du Primaire"]
      });
    }

    setShowAddModal(false);
    setFormChapterTitle("");
    setFormObjective1("");
    setFormObjective2("");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Planification Pédagogique & Programme National
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Suivi en Temps Réel
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Planificateur Annuel & Progression des Cours
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronisation en direct entre prévisions programmatiques et heures dispensées réelles validées dans le journal de classe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {userScope.canManageAssignments && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un Chapitre / Module</span>
            </button>
          )}
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-bold">
            <span>Progression Moyenne</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.avgPercent}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all" 
              style={{ width: `${Math.min(100, metrics.avgPercent)}%` }} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-bold">
            <span>Heures Dispensées</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalCompleted} h / {metrics.totalPlanned} h
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Basé sur les séances du journal
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-bold">
            <span>Modules & Chapitres</span>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.completedChapters} / {metrics.totalChapters} achevés
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Conformité programme RDC
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-bold">
            <span>Supervision Pédagogique</span>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Normes EPST Actives
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            ✓ Calendrier scolaire synchronisé
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par chapitre, matière, enseignant ou classe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-9 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500"
          >
            <option value="Tous">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={`${c.level} ${c.roomLetter}`}>
                {c.level} {c.roomLetter}
              </option>
            ))}
          </select>

          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500"
          >
            <option value="Tous">Tous les mois</option>
            <option value="Septembre">Septembre</option>
            <option value="Octobre">Octobre</option>
            <option value="Novembre">Novembre</option>
            <option value="Décembre">Décembre</option>
            <option value="Janvier">Janvier</option>
            <option value="Février">Février</option>
            <option value="Mars">Mars</option>
            <option value="Avril">Avril</option>
            <option value="Mai">Mai</option>
            <option value="Juin">Juin</option>
          </select>
        </div>
      </div>

      {/* FORECAST CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredForecasts.map((forecast) => (
          <div
            key={forecast.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {forecast.month} • Semaine {forecast.weekNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {forecast.className}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {forecast.chapterTitle}
                </h4>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                  {forecast.subjectName} • Prof. {forecast.teacherName}
                </div>
              </div>

              {userScope.canManageAssignments && (
                <button
                  onClick={() => deletePedagogicalForecast(forecast.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                  title="Supprimer ce module"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* PROGRESSION BAR */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-500">Progression horaire :</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {forecast.completedHours}h sur {forecast.plannedHours}h prévues ({forecast.progressionPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    forecast.progressionPercent >= 100 
                      ? "bg-emerald-500" 
                      : forecast.progressionPercent > 50 
                      ? "bg-blue-500" 
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, forecast.progressionPercent)}%` }}
                />
              </div>
            </div>

            {/* OBJECTIVES */}
            {forecast.learningObjectives && forecast.learningObjectives.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">
                  Objectifs d'apprentissage :
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {forecast.learningObjectives.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Réf : {forecast.nationalCurriculumReference || "EPST-OFFICIEL"}</span>
              <span className={`font-bold ${
                forecast.status === "Achevé" 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-amber-600 dark:text-amber-400"
              }`}>
                {forecast.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: AJOUT D'UN MODULE / CHAPITRE                                   */}
      {/* --------------------------------------------------------------------- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span>Planifier un Nouveau Module / Chapitre</span>
                </h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateForecast} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Classe
                  </label>
                  <select
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={`${c.level} ${c.roomLetter}`}>
                        {c.level} {c.roomLetter}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Matière / Cours
                  </label>
                  <input
                    type="text"
                    value={formSubjectName}
                    onChange={(e) => setFormSubjectName(e.target.value)}
                    placeholder="Ex: Mathématiques, Physique"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Enseignant Titulaire
                  </label>
                  <select
                    value={formTeacherName}
                    onChange={(e) => setFormTeacherName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    {teachers.map(t => {
                      const tName = getTeacherDisplayName(t);
                      return <option key={t.id} value={tName}>{tName}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Intitulé du Chapitre / Module *
                  </label>
                  <input
                    type="text"
                    required
                    value={formChapterTitle}
                    onChange={(e) => setFormChapterTitle(e.target.value)}
                    placeholder="Ex: Chapitre 2 - Géométrie dans l'espace"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Mois
                    </label>
                    <select
                      value={formMonth}
                      onChange={(e) => setFormMonth(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Septembre">Septembre</option>
                      <option value="Octobre">Octobre</option>
                      <option value="Novembre">Novembre</option>
                      <option value="Décembre">Décembre</option>
                      <option value="Janvier">Janvier</option>
                      <option value="Février">Février</option>
                      <option value="Mars">Mars</option>
                      <option value="Avril">Avril</option>
                      <option value="Mai">Mai</option>
                      <option value="Juin">Juin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Semaine
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={formWeekNumber}
                      onChange={(e) => setFormWeekNumber(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Heures prévues
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formPlannedHours}
                      onChange={(e) => setFormPlannedHours(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Objectif d'apprentissage 1
                  </label>
                  <input
                    type="text"
                    value={formObjective1}
                    onChange={(e) => setFormObjective1(e.target.value)}
                    placeholder="Ex: Identifier les solides usuels"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Objectif d'apprentissage 2
                  </label>
                  <input
                    type="text"
                    value={formObjective2}
                    onChange={(e) => setFormObjective2(e.target.value)}
                    placeholder="Ex: Calculer les aires latérales et volumes"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Enregistrer le Module
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
