import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Award, 
  Check, 
  X,
  Layers,
  ArrowRight
} from "lucide-react";
import { Subject, ClassRoom, PedagogicalCurriculumModel } from "../../types";
import { NATIONAL_CURRICULUM_MODELS } from "../../data/nationalCurriculumModels";

interface SubjectsCurriculumManagerProps {
  subjects: Subject[];
  onAddSubject?: (subj: Omit<Subject, "id">) => void;
  onUpdateSubject?: (subj: Subject) => void;
  onDeleteSubject?: (id: string) => void;
  onImportCurriculumModel?: (model: PedagogicalCurriculumModel, targetClassName?: string) => void;
  classes?: ClassRoom[];
  userRole?: string;
}

export const SubjectsCurriculumManager: React.FC<SubjectsCurriculumManagerProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onImportCurriculumModel,
  classes = [],
  userRole = "Direction Pédagogique"
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cycleFilter, setCycleFilter] = useState<string>("Tous");
  const [categoryFilter, setCategoryFilter] = useState<string>("Tous");
  const [optionFilter, setOptionFilter] = useState<string>("Tous");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<PedagogicalCurriculumModel | null>(null);
  const [targetClassForModel, setTargetClassForModel] = useState<string>("Toutes les classes correspondantes");

  // New Subject Form
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [cycle, setCycle] = useState<"Maternelle" | "Primaire" | "Secondaire">("Secondaire");
  const [level, setLevel] = useState("1ère Humanités");
  const [optionName, setOptionName] = useState("Scientifique");
  const [category, setCategory] = useState<"Culture Générale" | "Scientifique" | "Professionnelle">("Scientifique");
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [coefficient, setCoefficient] = useState(3);
  const [isCommon, setIsCommon] = useState(false);
  const [isOptional, setIsOptional] = useState(false);
  const [maxPointsInterro, setMaxPointsInterro] = useState(20);
  const [maxPointsExamen, setMaxPointsExamen] = useState(40);
  const [targetClass, setTargetClass] = useState("");

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sub.code && sub.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (sub.optionName && sub.optionName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCycle = cycleFilter === "Tous" || sub.cycle === cycleFilter || sub.levelCategory === cycleFilter;
    const matchesCategory = categoryFilter === "Tous" || sub.category === categoryFilter;
    const matchesOption = optionFilter === "Tous" || sub.optionName === optionFilter || (!sub.optionName && optionFilter === "Tronc Commun");
    return matchesSearch && matchesCycle && matchesCategory && matchesOption;
  });

  const handleOpenAddModal = (subjToEdit?: Subject) => {
    if (subjToEdit) {
      setEditingSubjectId(subjToEdit.id);
      setName(subjToEdit.name);
      setCycle((subjToEdit.cycle as any) || (subjToEdit.levelCategory as any) || "Secondaire");
      setLevel(subjToEdit.level || "1ère Humanités");
      setOptionName(subjToEdit.optionName || "Scientifique");
      setCategory((subjToEdit.category as any) || "Scientifique");
      setHoursPerWeek(subjToEdit.hoursPerWeek || 4);
      setCoefficient(subjToEdit.coefficient || 3);
      setIsCommon(subjToEdit.isCommon || false);
      setIsOptional(subjToEdit.isOptional || false);
      setMaxPointsInterro(subjToEdit.maxPointsInterro || 20);
      setMaxPointsExamen(subjToEdit.maxPointsExamen || 40);
      setTargetClass(subjToEdit.className || "");
    } else {
      setEditingSubjectId(null);
      setName("");
      setCycle("Secondaire");
      setLevel("1ère Humanités");
      setOptionName("Scientifique");
      setCategory("Scientifique");
      setHoursPerWeek(4);
      setCoefficient(3);
      setIsCommon(false);
      setIsOptional(false);
      setMaxPointsInterro(20);
      setMaxPointsExamen(40);
      setTargetClass("");
    }
    setShowAddModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubjectId && onUpdateSubject) {
      onUpdateSubject({
        id: editingSubjectId,
        name: name.trim(),
        cycle,
        levelCategory: cycle,
        level,
        optionName,
        category,
        hoursPerWeek: Number(hoursPerWeek),
        coefficient: Number(coefficient),
        isCommon,
        isOptional,
        maxPointsInterro: Number(maxPointsInterro),
        maxPointsExamen: Number(maxPointsExamen),
        className: targetClass || undefined,
        schoolYear: "2025-2026"
      });
    } else if (onAddSubject) {
      onAddSubject({
        name: name.trim(),
        cycle,
        levelCategory: cycle,
        level,
        optionName,
        category,
        hoursPerWeek: Number(hoursPerWeek),
        coefficient: Number(coefficient),
        isCommon,
        isOptional,
        maxPointsInterro: Number(maxPointsInterro),
        maxPointsExamen: Number(maxPointsExamen),
        className: targetClass || undefined,
        schoolYear: "2025-2026"
      });
    }

    setShowAddModal(false);
  };

  const handleApplyModel = () => {
    if (!selectedModel || !onImportCurriculumModel) return;
    onImportCurriculumModel(selectedModel, targetClassForModel);
    setShowModelModal(false);
    setSelectedModel(null);
  };

  // Distinct Options in system
  const availableOptions = Array.from(new Set(subjects.map(s => s.optionName).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header with KPI and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 dark:bg-blue-950/50 text-brand-blue rounded-xl">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Matières, Cours & Programmes Pédagogiques RDC
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enregistrement des cours par cycle, filière et option • Pondération, coefficients et modèles nationaux officiels MINEPST.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowModelModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/40 rounded-xl border border-amber-200 dark:border-amber-800 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Modèles Pédagogiques RDC</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Matière</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Matières</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{subjects.length}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Heures Hebdo Totales</span>
          <span className="text-2xl font-black text-brand-blue font-mono">
            {subjects.reduce((sum, s) => sum + (s.hoursPerWeek || 0), 0)}h / sem
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cours Obligatoires</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {subjects.filter(s => !s.isOptional).length}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filières / Options</span>
          <span className="text-2xl font-black text-purple-600 font-mono">
            {availableOptions.length || 1}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une matière, code, filière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="Tous">Tous les Cycles</option>
            <option value="Maternelle">Maternelle</option>
            <option value="Primaire">Primaire</option>
            <option value="Secondaire">Secondaire</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="Tous">Toutes Catégories</option>
            <option value="Culture Générale">Culture Générale</option>
            <option value="Scientifique">Scientifique</option>
            <option value="Professionnelle">Professionnelle</option>
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Matière & Code</th>
                <th className="py-3 px-4">Cycle & Option</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Heures / Sem.</th>
                <th className="py-3 px-4">Coeff.</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Pondération (Interro / Examen)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucune matière trouvée avec ces critères.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{sub.name}</div>
                      {sub.code && <span className="text-[10px] text-slate-400 font-mono">{sub.code}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {sub.cycle || sub.levelCategory || "Secondaire"}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {sub.optionName || "Tronc Commun"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.category === "Scientifique" 
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          : sub.category === "Professionnelle"
                          ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {sub.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-brand-blue">
                      {sub.hoursPerWeek}h / sem
                    </td>
                    <td className="py-3 px-4 font-bold font-mono">
                      {sub.coefficient || 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${
                          sub.isOptional ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}>
                          {sub.isOptional ? "Optionnel" : "Obligatoire"}
                        </span>
                        {sub.isCommon && (
                          <span className="text-[9px] font-medium text-slate-400">Tronc Commun</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">{sub.maxPointsInterro} pts</span> / <span className="font-bold text-slate-900 dark:text-white">{sub.maxPointsExamen} pts</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenAddModal(sub)}
                          className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteSubject && (
                          <button
                            onClick={() => onDeleteSubject(sub.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT SUBJECT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {editingSubjectId ? "Modifier la Matière" : "Ajouter une Nouvelle Matière"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nom de la Matière *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Mathématiques Générales & Analyse"
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Cycle Pédagogique</label>
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                  >
                    <option value="Maternelle">Maternelle</option>
                    <option value="Primaire">Primaire</option>
                    <option value="Secondaire">Secondaire</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Option / Filière</label>
                  <input
                    type="text"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="ex: Scientifique, Commerciale..."
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                  >
                    <option value="Culture Générale">Culture Générale</option>
                    <option value="Scientifique">Scientifique</option>
                    <option value="Professionnelle">Professionnelle</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Volume Horaire (Heures/Semaine)</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Coefficient</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={coefficient}
                    onChange={(e) => setCoefficient(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Max Interrogation (Cotes)</label>
                  <input
                    type="number"
                    value={maxPointsInterro}
                    onChange={(e) => setMaxPointsInterro(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Max Examen Session</label>
                  <input
                    type="number"
                    value={maxPointsExamen}
                    onChange={(e) => setMaxPointsExamen(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCommon}
                    onChange={(e) => setIsCommon(e.target.checked)}
                    className="w-4 h-4 text-brand-blue rounded"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Tronc Commun</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOptional}
                    onChange={(e) => setIsOptional(e.target.checked)}
                    className="w-4 h-4 text-brand-blue rounded"
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Cours Optionnel</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-blue text-white font-bold rounded-xl shadow-sm hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NATIONAL CURRICULUM MODELS RDC */}
      {showModelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Modèles Pédagogiques Officiels RDC (MINEPST)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sélectionnez un modèle pour charger automatiquement les matières, pondérations et volumes horaires.
                </p>
              </div>
              <button onClick={() => setShowModelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {NATIONAL_CURRICULUM_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`p-4 rounded-xl border cursor-pointer transition text-left space-y-2 ${
                    selectedModel?.id === model.id
                      ? "border-brand-blue bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-brand-blue/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {model.cycle} • {model.level}
                    </span>
                    <span className="text-xs font-bold font-mono text-brand-blue">
                      {model.subjects.length} matières
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{model.name}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{model.description}</p>
                  
                  <div className="text-[10px] text-slate-400 font-mono">
                    Total : {model.subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0)}h / semaine
                  </div>
                </div>
              ))}
            </div>

            {selectedModel && (
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="font-bold text-xs text-blue-900 dark:text-blue-200">
                  Matières incluses dans le modèle sélectionné ({selectedModel.name}) :
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                  {selectedModel.subjects.map((sub, idx) => (
                    <div key={idx} className="p-1.5 bg-white dark:bg-slate-900 rounded border text-[11px]">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{sub.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{sub.hoursPerWeek}h • Coeff {sub.coefficient}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setShowModelModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                Fermer
              </button>
              <button
                disabled={!selectedModel}
                onClick={handleApplyModel}
                className="flex items-center gap-1.5 px-5 py-2 bg-brand-blue hover:bg-blue-700 text-white font-bold rounded-xl text-xs disabled:opacity-50 transition shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Importer ce Modèle Pédagogique</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
