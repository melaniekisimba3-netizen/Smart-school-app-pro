import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Sliders, 
  Play, 
  RefreshCw, 
  X,
  Building,
  Check,
  Send
} from "lucide-react";
import { 
  ClassRoom, 
  Subject, 
  Teacher, 
  TimetableGenerationReport, 
  TimetableGenerationOptions 
} from "../../types";
import { usePedagogicalTimetable } from "../../context/PedagogicalTimetableContext";

interface AutomatedTimetableGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  userRole?: string;
  userName?: string;
}

export const AutomatedTimetableGeneratorModal: React.FC<AutomatedTimetableGeneratorModalProps> = ({
  isOpen,
  onClose,
  classes,
  subjects,
  teachers,
  userRole = "Préfet des Études",
  userName = "Direction"
}) => {
  const { 
    scheduleConfig, 
    updateScheduleConfig, 
    schoolRooms, 
    runAutoScheduleGeneration, 
    publishTimetable,
    isTimetablePublished 
  } = usePedagogicalTimetable();

  const [activeDays, setActiveDays] = useState<string[]>(scheduleConfig.activeDays || ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]);
  const [periodDurationMinutes, setPeriodDurationMinutes] = useState<number>(scheduleConfig.periodDurationMinutes || 50);
  const [periodsPerDay, setPeriodsPerDay] = useState<number>(scheduleConfig.periodsPerDay || 6);
  const [respectTeacherAvailabilities, setRespectTeacherAvailabilities] = useState(true);
  const [distributeAcrossDays, setDistributeAcrossDays] = useState(true);
  const [assignRoomsAutomatically, setAssignRoomsAutomatically] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<TimetableGenerationReport | null>(null);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    if (activeDays.includes(day)) {
      if (activeDays.length > 1) {
        setActiveDays(activeDays.filter(d => d !== day));
      }
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

  const handleLaunchGeneration = () => {
    setIsGenerating(true);
    setReport(null);

    // Save updated configuration first
    updateScheduleConfig({
      activeDays,
      periodDurationMinutes,
      periodsPerDay
    });

    setTimeout(() => {
      const genReport = runAutoScheduleGeneration(classes, subjects, teachers, {
        respectTeacherAvailabilities,
        distributeAcrossDays,
        assignRoomsAutomatically,
        clearExistingDrafts: true
      });

      setReport(genReport);
      setIsGenerating(false);
    }, 600);
  };

  const handlePublish = () => {
    publishTimetable(userName, userRole, "Emploi du temps officiel validé et diffusé pour toute l'école.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Générateur Automatique d'Emploi du Temps sans Conflit
              </h3>
              <p className="text-xs text-slate-500">
                Algorithme d'optimisation sous contraintes pédagogiques (EPST / RDC)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Parameters */}
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-blue" />
              <span>Paramètres du Planning Hebdomadaire</span>
            </h4>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Jours Actifs d'Enseignement</label>
              <div className="flex flex-wrap gap-2">
                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      activeDays.includes(day)
                        ? "bg-brand-blue text-white shadow-xs"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Périodes / Séances par Jour</label>
                <input
                  type="number"
                  min="4"
                  max="9"
                  value={periodsPerDay}
                  onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Durée d'une Période (Minutes)</label>
                <input
                  type="number"
                  min="40"
                  max="60"
                  value={periodDurationMinutes}
                  onChange={(e) => setPeriodDurationMinutes(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Constraints Checkboxes */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contraintes & Règles de Non-Collision</span>
            </h4>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={respectTeacherAvailabilities}
                onChange={(e) => setRespectTeacherAvailabilities(e.target.checked)}
                className="w-4 h-4 text-brand-blue rounded"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Garantir 0 conflit enseignant (aucun enseignant dans 2 classes au même moment)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={distributeAcrossDays}
                onChange={(e) => setDistributeAcrossDays(e.target.checked)}
                className="w-4 h-4 text-brand-blue rounded"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Équilibrer la charge pédagogique sur tous les jours de la semaine
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={assignRoomsAutomatically}
                onChange={(e) => setAssignRoomsAutomatically(e.target.checked)}
                className="w-4 h-4 text-brand-blue rounded"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Affectation automatique et gestion des locaux ({schoolRooms.length} salles configurées)
              </span>
            </label>
          </div>
        </div>

        {/* Live Generation Report */}
        {report && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Génération Terminée avec Succès (Mode Brouillon)</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                0 Conflit Détecté
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Séances Générées</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {report.totalSlotsScheduled}
                </span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Classes Couvertes</span>
                <span className="text-lg font-black text-brand-blue font-mono">
                  {report.classesCovered.length}
                </span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900">
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Enseignants Mobilisés</span>
                <span className="text-lg font-black text-purple-600 font-mono">
                  {report.teachersAssigned.length}
                </span>
              </div>
            </div>

            {report.warnings && report.warnings.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Observations :</span>
                <ul className="text-[10px] text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5">
                  {report.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Fermer
          </button>

          <div className="flex items-center gap-2">
            <button
              disabled={isGenerating}
              onClick={handleLaunchGeneration}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calcul de la grille sans collision...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Lancer la Génération Automatique</span>
                </>
              )}
            </button>

            {report && (
              <button
                onClick={handlePublish}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                <span>Publier Officiellement l'Horaire</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
