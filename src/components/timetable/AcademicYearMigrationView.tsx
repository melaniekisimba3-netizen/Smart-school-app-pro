import React, { useState } from "react";
import { 
  Calendar, 
  ArrowRight, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  RefreshCw, 
  Layers 
} from "lucide-react";
import { Subject } from "../../types";
import { usePedagogicalTimetable } from "../../context/PedagogicalTimetableContext";

interface AcademicYearMigrationViewProps {
  subjects: Subject[];
  userRole?: string;
  userName?: string;
}

export const AcademicYearMigrationView: React.FC<AcademicYearMigrationViewProps> = ({
  subjects,
  userRole = "Préfet des Études",
  userName = "Direction"
}) => {
  const { duplicateYearConfig, courseAssignments, timetableEntries } = usePedagogicalTimetable();

  const [sourceYear, setSourceYear] = useState("2025-2026");
  const [targetYear, setTargetYear] = useState("2026-2027");
  const [isProcessing, setIsProcessing] = useState(false);
  const [migrationReport, setMigrationReport] = useState<{
    success: boolean;
    message: string;
    newAssignmentsCount: number;
    newTimetableCount: number;
  } | null>(null);

  const handleRunMigration = () => {
    setIsProcessing(true);
    setMigrationReport(null);

    setTimeout(() => {
      const result = duplicateYearConfig(sourceYear, targetYear, "sch-001", subjects);
      setMigrationReport({
        success: true,
        message: result.message,
        newAssignmentsCount: result.newAssignments.length,
        newTimetableCount: result.newTimetable.length
      });
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Gestion de l'Année Scolaire & Report de Configuration
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Permet de préparer la rentrée scolaire en reportant automatiquement le programme des matières, les affectations des enseignants et la grille des cours vers l'année scolaire suivante sans écraser les archives.
          </p>
        </div>

        {/* Year Transition Visual */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Année Source (Actuelle)</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{sourceYear}</div>
            <p className="text-xs text-slate-500">
              {subjects.length} matières • {courseAssignments.length} affectations • {timetableEntries.length} séances
            </p>
          </div>

          <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-full shadow-xs border">
            <ArrowRight className="w-6 h-6 text-brand-blue" />
          </div>

          <div className="flex-1 text-center md:text-right space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Année Cible (Nouvelle Rentrée)</span>
            <div className="text-2xl font-black text-brand-blue font-mono">{targetYear}</div>
            <p className="text-xs text-emerald-600 font-bold">
              Prêt pour duplication & ajustements
            </p>
          </div>
        </div>

        {/* Security & Integrity Safeguards */}
        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            <span>Garanties d'Intégrité & Non-Destruction des Données</span>
          </div>
          <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
            <li>Les données de l'année scolaire <strong>{sourceYear}</strong> restent scellées et accessibles pour les archives et relevés officiels.</li>
            <li>Les nouvelles affectations pour <strong>{targetYear}</strong> seront créées en mode <em>Brouillon modifiable</em>.</li>
            <li>Aucune perte de coefficients ni de pondérations officielles de l'EPST.</li>
          </ul>
        </div>

        {/* Result Report */}
        {migrationReport && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Report Pédagogique Effectué avec Succès !</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">{migrationReport.message}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            disabled={isProcessing}
            onClick={handleRunMigration}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Migration en cours...</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Dupliquer la Configuration vers {targetYear}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
