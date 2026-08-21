import React from "react";
import {
  BarChart3,
  Globe,
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  Landmark,
  MapPin
} from "lucide-react";

interface OwnerNationalStatsProps {
  schoolsCount?: number;
  studentsCount?: number;
  teachersCount?: number;
}

export function OwnerNationalStatsModule({
  schoolsCount = 24,
  studentsCount = 14250,
  teachersCount = 820
}: OwnerNationalStatsProps) {
  const provincesData = [
    { name: "Kinshasa", count: 12, percentage: 50 },
    { name: "Kongo-Central", count: 4, percentage: 16.6 },
    { name: "Haut-Katanga", count: 3, percentage: 12.5 },
    { name: "Nord-Kivu", count: 3, percentage: 12.5 },
    { name: "Sud-Kivu", count: 2, percentage: 8.4 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 font-black text-[10px] uppercase rounded-full border border-indigo-500/30 mb-2">
            <Globe className="h-3.5 w-3.5 text-indigo-400" />
            <span>STATISTIQUES &amp; COUVERTURE NATIONALE EPST RDC</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Statistiques Nationales SaaS</h2>
          <p className="text-xs text-slate-300 mt-1">
            Indicateurs globaux d'adoption de SmartSchool RDC à travers les 26 provinces de la République Démocratique du Congo.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
            <span>Écoles Partenaires</span>
            <Building2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">{schoolsCount}</div>
          <div className="text-[10px] text-indigo-600 font-bold">Inscrites sur la plateforme</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
            <span>Total Élèves</span>
            <GraduationCap className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {studentsCount.toLocaleString("fr-FR")}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">Matriculés dans les registres</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
            <span>Total Enseignants</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">{teachersCount}</div>
          <div className="text-[10px] text-blue-600 font-bold">Comptes certifiés</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
            <span>Provinces Connectées</span>
            <MapPin className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">5 / 26</div>
          <div className="text-[10px] text-amber-600 font-bold">Expansion progressive</div>
        </div>
      </div>

      {/* Provinces Breakdown */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-800 pb-3">
          Répartition des Établissements par Province
        </h3>

        <div className="space-y-3 text-xs">
          {provincesData.map(p => (
            <div key={p.name} className="space-y-1">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>{p.name}</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{p.count} Écoles ({p.percentage}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${p.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
