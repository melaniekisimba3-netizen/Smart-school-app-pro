import React, { useState } from "react";
import { safeLocalStorage } from "../../utils/safeStorage";
import {
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert,
  Zap,
  Plus
} from "lucide-react";

export interface TrialSchool {
  id: string;
  name: string;
  codeNational: string;
  province: string;
  contactEmail: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  studentsCount: number;
  status: "En essai" | "Prolongé" | "Converti" | "Suspendu" | "Expiré";
}

interface OwnerTrialsProps {
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function OwnerTrialsModule({ userName = "Propriétaire SmartSchool RDC", onAuditLog }: OwnerTrialsProps) {
  const [trials, setTrials] = useState<TrialSchool[]>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_trials");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "tr-1",
        name: "Complexe Scolaire Ndani (Matadi / Kongo-Central)",
        codeNational: "SE-3301",
        province: "Kongo-Central",
        contactEmail: "direction@ndani.cd",
        startDate: "2026-08-01",
        endDate: "2026-08-15",
        daysRemaining: 5,
        studentsCount: 310,
        status: "En essai"
      },
      {
        id: "tr-2",
        name: "Institut Technique Boma (Boma)",
        codeNational: "SE-3309",
        province: "Kongo-Central",
        contactEmail: "itboma@gmail.com",
        startDate: "2026-07-28",
        endDate: "2026-08-11",
        daysRemaining: 1,
        studentsCount: 180,
        status: "En essai"
      },
      {
        id: "tr-3",
        name: "Lycée Mwanga (Goma / Nord-Kivu)",
        codeNational: "SE-6102",
        province: "Nord-Kivu",
        contactEmail: "mwanga_goma@yahoo.fr",
        startDate: "2026-07-15",
        endDate: "2026-08-25",
        daysRemaining: 15,
        studentsCount: 520,
        status: "Prolongé"
      }
    ];
  });

  const [toast, setToast] = useState<string | null>(null);

  const saveTrials = (updated: TrialSchool[]) => {
    setTrials(updated);
    safeLocalStorage.setItem("ss_owner_trials", JSON.stringify(updated));
  };

  const handleExtendTrial = (id: string, days: number) => {
    const updated = trials.map(t => {
      if (t.id === id) {
        return {
          ...t,
          daysRemaining: t.daysRemaining + days,
          status: "Prolongé" as const
        };
      }
      return t;
    });

    saveTrials(updated);
    const school = trials.find(t => t.id === id);
    if (onAuditLog) onAuditLog("Prolongation Essai", `Période d'essai de '${school?.name}' prolongée de ${days} jours.`);
    showToast(`Période d'essai de '${school?.name}' prolongée de +${days} jours.`);
  };

  const handleStatusChange = (id: string, newStatus: TrialSchool["status"]) => {
    const updated = trials.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus
        };
      }
      return t;
    });

    saveTrials(updated);
    const school = trials.find(t => t.id === id);
    if (onAuditLog) onAuditLog("Changement Statut Essai", `Statut d'essai de '${school?.name}' changé vers ${newStatus}`);
    showToast(`Établissement '${school?.name}' passé en statut : ${newStatus}`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 font-black text-[10px] uppercase rounded-full border border-indigo-500/30 mb-2">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>GESTION DES ÉTABLISSEMENTS EN PERIODE D'ESSAI</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Gestion des Périodes d'Essai</h2>
          <p className="text-xs text-slate-300 mt-1">
            Surveillez les comptes en démo, prolongez les délais d'évaluation ou convertissez-les directement en abonnements payants.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl border border-emerald-500 flex items-center space-x-2 text-xs font-bold shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Trial Schools List */}
      <div className="space-y-4">
        {trials.map(t => (
          <div
            key={t.id}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  <span>{t.name}</span>
                </h3>
                <div className="text-[11px] text-slate-500">
                  Code EPST: <span className="font-mono text-indigo-600 font-bold">{t.codeNational}</span> • Province: {t.province} • {t.studentsCount} élèves
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono font-black text-xs rounded-full">
                  ⏱ Reste {t.daysRemaining} jours
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    t.status === "Converti"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : t.status === "Suspendu"
                      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="text-slate-500">
                Période: du <strong className="text-slate-700 dark:text-slate-300">{t.startDate}</strong> au <strong className="text-slate-700 dark:text-slate-300">{t.endDate}</strong>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleExtendTrial(t.id, 7)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[10px] uppercase rounded-xl border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                >
                  +7 Jours
                </button>
                <button
                  onClick={() => handleExtendTrial(t.id, 14)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[10px] uppercase rounded-xl border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                >
                  +14 Jours
                </button>
                <button
                  onClick={() => handleStatusChange(t.id, "Converti")}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase rounded-xl cursor-pointer shadow-sm"
                >
                  Convertir en Abonnement
                </button>
                <button
                  onClick={() => handleStatusChange(t.id, "Suspendu")}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase rounded-xl cursor-pointer"
                >
                  Suspendre
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
