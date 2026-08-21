import React from "react";
import {
  Crown,
  HelpCircle,
  Lightbulb,
  Sparkles,
  DollarSign,
  Clock,
  Activity,
  ShieldAlert,
  Send,
  Code,
  Globe,
  ArrowRight,
  TrendingUp,
  Server,
  Building2,
  CheckCircle2,
  HardDrive,
  Award
} from "lucide-react";
import { motion } from "motion/react";

interface OwnerDashboardOverviewProps {
  userName?: string;
  schoolsCount?: number;
  studentsCount?: number;
  onNavigateTab: (tab: any) => void;
  onAuditLog?: (action: string, details: string) => void;
}

export function OwnerDashboardOverview({
  userName = "Propriétaire SmartSchool RDC",
  schoolsCount = 24,
  studentsCount = 14250,
  onNavigateTab,
  onAuditLog
}: OwnerDashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-800/50 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 text-amber-300 font-black text-[10px] uppercase rounded-full border border-amber-500/30">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>PORTAIL EXCLUSIF DU PROPRIÉTAIRE SAAS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Tableau de Bord du Propriétaire
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Supervision totale et souveraine de SmartSchool RDC. Accès indépendant et totalement invisible aux établissements scolaires pour gérer le support national, la feuille de route, les abonnements financiers, la télémesure et la sécurité de la plateforme.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-300">Revenu Mensuel (MRR)</div>
              <div className="text-xl font-black font-mono text-emerald-400">$14,500</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-300">Uptime Serveurs</div>
              <div className="text-xl font-black font-mono text-indigo-300">99.98%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Modules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Support */}
        <div
          onClick={() => onNavigateTab("support")}
          className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <HelpCircle className="h-5 w-5" />
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-black text-[10px] rounded-full">
              2 Tickets
            </span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
              Centre de Support National
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Guichet d'assistance technique, bugs et paiements.</p>
          </div>
          <div className="text-[10px] font-bold text-indigo-600 flex items-center space-x-1 pt-1">
            <span>Accéder au support</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Suggestions */}
        <div
          onClick={() => onNavigateTab("suggestions")}
          className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Lightbulb className="h-5 w-5" />
            </div>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-black text-[10px] rounded-full">
              3 Propositions
            </span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-amber-600 transition-colors">
              Centre des Suggestions
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Boîte à idées et classement par popularité des écoles.</p>
          </div>
          <div className="text-[10px] font-bold text-amber-600 flex items-center space-x-1 pt-1">
            <span>Voir les suggestions</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Updates */}
        <div
          onClick={() => onNavigateTab("updates")}
          className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[10px] rounded-full">
              v4.8.5 Active
            </span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">
              Centre des Mises à Jour
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Diffusion des notes de version et nouvelles fonctionnalités.</p>
          </div>
          <div className="text-[10px] font-bold text-blue-600 flex items-center space-x-1 pt-1">
            <span>Gérer les versions</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Financial */}
        <div
          onClick={() => onNavigateTab("financial")}
          className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">$14.5k/mois</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">
              Centre Financier SaaS
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Abonnements, MRR, ARR, commissions Mobile Money.</p>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1 pt-1">
            <span>Consulter la finance</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Trials */}
        <div
          onClick={() => onNavigateTab("trials")}
          className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Clock className="h-5 w-5" />
            </div>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-black text-[10px] rounded-full">
              3 Écoles en Essai
            </span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
              Gestion des Périodes d'Essai
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Prolongations, suspensions et conversions en abonnements.</p>
          </div>
          <div className="text-[10px] font-bold text-indigo-600 flex items-center space-x-1 pt-1">
            <span>Gérer les essais</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Servers */}
        <div
          onClick={() => onNavigateTab("servers")}
          className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-700 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl">
              <Server className="h-5 w-5" />
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[10px] rounded-full">
              24% CPU
            </span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-indigo-500 transition-colors">
              Surveillance des Serveurs
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Télémesure cluster, latence DB et détection d'incidents.</p>
          </div>
          <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1 pt-1">
            <span>Voir la télémesure</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Visual Identity & Sovereign Emblems */}
        <div
          onClick={() => onNavigateTab("visual_identity")}
          className="p-5 bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-slate-900/5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500/40 dark:border-amber-500/30 shadow-md hover:border-amber-500 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Award className="h-5 w-5" />
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-black text-[10px] rounded-full uppercase">
              Exclusif Propriétaire
            </span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-amber-600 transition-colors">
              Identité Visuelle & Emblèmes RDC
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Gestion centrale du Logo Officiel, Drapeau RDC et Armoirie Nationale.</p>
          </div>
          <div className="text-[10px] font-bold text-amber-600 flex items-center space-x-1 pt-1">
            <span>Gérer l'identité visuelle</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
