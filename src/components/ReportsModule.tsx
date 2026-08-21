import React, { useState } from "react";
import { 
  FileText, 
  BarChart3, 
  Download, 
  Send, 
  Calendar, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  Building, 
  Activity, 
  ArrowRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Lock
} from "lucide-react";
import { motion } from "motion/react";

interface ReportsModuleProps {
  userRole: string;
  userName: string;
  students?: any[];
  teachers?: any[];
  payments?: any[];
}

interface AutomaticReport {
  id: string;
  title: string;
  nature: "caisse_journalier" | "hebdomadaire" | "mensuel" | "trimestriel" | "annuel" | "presences" | "notes" | "eleves" | "personnel" | "disciplinaire" | "rh" | "pedagogique";
  natureLabel: string;
  frequency: "Quotidien" | "Hebdomadaire" | "Mensuel" | "Trimestriel" | "Annuel";
  date: string;
  author: string;
  status: "Archivé & Envoyé" | "En attente de validation";
  audience: string[];
  summary: string;
  dataPoints: { label: string; value: string | number; change?: string; isPositive?: boolean }[];
  details: { label: string; value: string }[];
}

export function ReportsModule({ userRole, userName, students = [], teachers = [], payments = [] }: ReportsModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [natureFilter, setNatureFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<AutomaticReport | null>(null);
  const [exportingType, setExportingType] = useState<"pdf" | "excel" | null>(null);
  const [activeTab, setActiveTab] = useState<"automatic" | "archive" | "settings">("automatic");

  const normalizedRole = userRole.toUpperCase();

  // Helper to check access permissions based on role
  const canAccessReport = (nature: string) => {
    // Comptable : rapports financiers uniquement
    if (normalizedRole.includes("COMPTABLE")) {
      return ["caisse_journalier", "hebdomadaire", "mensuel", "trimestriel", "annuel"].includes(nature);
    }
    // Administrateur RH : rapports du personnel & RH uniquement
    if (normalizedRole === "ADMINISTRATEUR RH") {
      return ["personnel", "rh", "disciplinaire"].includes(nature);
    }
    // Directeur/Préfet : financiers, pédagogiques et administratifs
    if (normalizedRole.includes("DIRECTEUR") || normalizedRole.includes("PRÉFET") || normalizedRole.includes("SECÉTAIRE")) {
      return ["caisse_journalier", "hebdomadaire", "mensuel", "trimestriel", "annuel", "presences", "notes", "eleves", "personnel", "disciplinaire", "rh", "pedagogique"].includes(nature);
    }
    // Promoteur : rapports généraux (tous)
    if (normalizedRole === "PROMOTEUR" || normalizedRole.includes("SUPER ADMINISTRATEUR")) {
      return true;
    }
    // Inspection : rapports de sa province/ressort (tous au niveau de l'établissement)
    if (normalizedRole.includes("INSPECTION")) {
      return true;
    }
    // Administration Nationale : statistiques nationales et indicateurs autorisés
    if (normalizedRole.includes("ADMINISTRATEUR NATIONAL")) {
      return ["eleves", "notes", "presences", "pedagogique", "trimestriel"].includes(nature);
    }
    return false; // Autre rôle non-autorisé
  };

  // Mock auto reports database
  const reportsData: AutomaticReport[] = [
    {
      id: "REP-2026-0701-01",
      title: "Rapport journalier de caisse - Clôture",
      nature: "caisse_journalier",
      natureLabel: "Rapport journalier de caisse",
      frequency: "Quotidien",
      date: "01/07/2026",
      author: "Comptable Principal",
      status: "Archivé & Envoyé",
      audience: ["COMPTABLE", "DIRECTEUR", "PROMOTEUR"],
      summary: "Clôture quotidienne des encaissements physiques et mobile money du Complexe Scolaire SmartSchool.",
      dataPoints: [
        { label: "Total perçu (USD)", value: "2,450.00 USD", change: "+15%", isPositive: true },
        { label: "Total perçu (CDF)", value: "1,850,000.00 CDF", change: "-5%", isPositive: false },
        { label: "Paiements validés", value: "34 transactions" },
        { label: "Mode majoritaire", value: "Mobile Money (M-Pesa)" }
      ],
      details: [
        { label: "Encaissement Cash Gombe", value: "1,200.00 USD" },
        { label: "Mobile Money Orange Money", value: "850,000 CDF" },
        { label: "Virement bancaire Rawbank", value: "1,250.00 USD" },
        { label: "Taux de change appliqué", value: "2,850 CDF / USD" }
      ]
    },
    {
      id: "REP-2026-0628-02",
      title: "Rapport hebdomadaire académique & présences",
      nature: "hebdomadaire",
      natureLabel: "Rapport hebdomadaire",
      frequency: "Hebdomadaire",
      date: "28/06/2026",
      author: "Préfet des études",
      status: "Archivé & Envoyé",
      audience: ["DIRECTEUR", "PROMOTEUR", "INSPECTION"],
      summary: "Synthèse des heures d'enseignement prestées, taux de présence des élèves et statut des évaluations.",
      dataPoints: [
        { label: "Présence élèves", value: "96.4%", change: "+0.8%", isPositive: true },
        { label: "Présence enseignants", value: "98.1%" },
        { label: "Heures prestées", value: "320h / 320h" },
        { label: "Élèves exclus temporairement", value: "2" }
      ],
      details: [
        { label: "Section Maternelle", value: "94.2% présence" },
        { label: "Section Primaire", value: "97.5% présence" },
        { label: "Section Humanités Littéraires", value: "95.8% présence" },
        { label: "Section Humanités Scientifiques", value: "98.0% présence" }
      ]
    },
    {
      id: "REP-2026-0630-03",
      title: "Rapport mensuel financier consolidé",
      nature: "mensuel",
      natureLabel: "Rapport mensuel",
      frequency: "Mensuel",
      date: "30/06/2026",
      author: "Directeur Financier",
      status: "Archivé & Envoyé",
      audience: ["COMPTABLE", "DIRECTEUR", "PROMOTEUR", "INSPECTION"],
      summary: "Bilan global des recouvrements des frais de scolarité pour le mois de Juin 2026.",
      dataPoints: [
        { label: "Recouvrement cumulé", value: "48,920.00 USD", change: "+12.4%", isPositive: true },
        { label: "Taux de solvabilité", value: "84.2%", change: "+3.5%", isPositive: true },
        { label: "Frais de scolarité perçus", value: "42,300.00 USD" },
        { label: "Frais d'examen perçus", value: "6,620.00 USD" }
      ],
      details: [
        { label: "Élèves totalement en règle", value: "412 élèves (70%)" },
        { label: "Élèves en règle 1e tranche", value: "145 élèves (25%)" },
        { label: "Élèves non solvables", value: "29 élèves (5%)" },
        { label: "Relances parents envoyées", value: "174 notifications SMS/Email" }
      ]
    },
    {
      id: "REP-2026-0615-04",
      title: "Rapport de répartition et statistiques des élèves",
      nature: "eleves",
      natureLabel: "Rapport des élèves",
      frequency: "Trimestriel",
      date: "15/06/2026",
      author: "Secrétaire Académique",
      status: "Archivé & Envoyé",
      audience: ["DIRECTEUR", "PROMOTEUR", "INSPECTION", "ADMINISTRATEUR NATIONAL"],
      summary: "Statistiques démographiques, répartition par genre, option, et province d'origine.",
      dataPoints: [
        { label: "Total effectif", value: "586 élèves", change: "+4.1%", isPositive: true },
        { label: "Filles", value: "299 (51%)" },
        { label: "Garçons", value: "287 (49%)" },
        { label: "Taux d'abandon scolaire", value: "0.2%", change: "-0.5%", isPositive: true }
      ],
      details: [
        { label: "Inscriptions 1ère Année", value: "124 élèves" },
        { label: "Inscriptions Terminale", value: "98 élèves" },
        { label: "Option Scientifique", value: "210 élèves" },
        { label: "Option Littéraire", value: "154 élèves" }
      ]
    },
    {
      id: "REP-2026-0620-05",
      title: "Rapport disciplinaire et comportemental",
      nature: "disciplinaire",
      natureLabel: "Rapport disciplinaire",
      frequency: "Trimestriel",
      date: "20/06/2026",
      author: "Directeur de discipline",
      status: "Archivé & Envoyé",
      audience: ["DIRECTEUR", "ADMINISTRATEUR RH", "PROMOTEUR"],
      summary: "Synthèse des sanctions, manquements, retards récurrents et mesures prises par le conseil de discipline.",
      dataPoints: [
        { label: "Sanctions totales", value: "12 cas", change: "-25%", isPositive: true },
        { label: "Avertissements écrits", value: "7 cas" },
        { label: "Suspensions temporaires", value: "4 cas" },
        { label: "Exclusion définitive", value: "1 cas" }
      ],
      details: [
        { label: "Retards notables récurrents", value: "18 élèves signalés" },
        { label: "Conduites exemplaires primées", value: "45 élèves" },
        { label: "Conseils de discipline tenus", value: "3 séances" },
        { label: "Médiations parents-école", value: "8 réunions" }
      ]
    },
    {
      id: "REP-2026-0625-06",
      title: "Rapport trimestriel pédagogique national",
      nature: "pedagogique",
      natureLabel: "Rapport pédagogique",
      frequency: "Trimestriel",
      date: "25/06/2026",
      author: "Inspection Provinciale",
      status: "Archivé & Envoyé",
      audience: ["DIRECTEUR", "PROMOTEUR", "INSPECTION", "ADMINISTRATEUR NATIONAL"],
      summary: "Évaluation du niveau d'avancement des programmes scolaires nationaux et performances moyennes par classe.",
      dataPoints: [
        { label: "Progression programme", value: "92.6%", change: "+3.2%", isPositive: true },
        { label: "Moyenne générale école", value: "68.4 / 100", change: "+1.2", isPositive: true },
        { label: "Taux de réussite aux examens", value: "87.4%" },
        { label: "Cahier de textes numérisé", value: "100% à jour" }
      ],
      details: [
        { label: "Niveau Mathématiques (Moy.)", value: "64.5 / 100" },
        { label: "Niveau Physique-Technologie", value: "66.8 / 100" },
        { label: "Niveau Langue Française", value: "74.1 / 100" },
        { label: "Classes en retard de programme", value: "2 classes (retard de < 1 semaine)" }
      ]
    },
    {
      id: "REP-2026-0629-07",
      title: "Rapport RH et mouvements du personnel",
      nature: "rh",
      natureLabel: "Rapport RH",
      frequency: "Mensuel",
      date: "29/06/2026",
      author: "Administrateur RH",
      status: "Archivé & Envoyé",
      audience: ["ADMINISTRATEUR RH", "DIRECTEUR", "PROMOTEUR"],
      summary: "Fiche mensuelle de l'assiduité du personnel, gestion des congés accordés, promotions et recrutement.",
      dataPoints: [
        { label: "Personnel actif", value: "48 employés", change: "+2", isPositive: true },
        { label: "Assiduité moyenne", value: "97.8%", change: "+0.5%", isPositive: true },
        { label: "Enseignants titulaires", value: "32 titulaires" },
        { label: "Congés maladie validés", value: "2 congés" }
      ],
      details: [
        { label: "Nouvelles recrues (Juin)", value: "2 enseignants d'anglais" },
        { label: "Retards administratifs cumulés", value: "4 retards mineurs" },
        { label: "Formations professionnelles suivies", value: "12 enseignants (TICE)" },
        { label: "Heures supplémentaires à valider", value: "45 heures cumulées" }
      ]
    },
    {
      id: "REP-2026-0630-08",
      title: "Statistiques Nationales & Indicateurs de l'Enseignement",
      nature: "annuel",
      natureLabel: "Rapport annuel",
      frequency: "Annuel",
      date: "30/06/2026",
      author: "CNR-EPST",
      status: "Archivé & Envoyé",
      audience: ["INSPECTION", "ADMINISTRATEUR NATIONAL", "PROMOTEUR", "DIRECTEUR"],
      summary: "Statistiques consolidées annuelles transmises au ministère de l'EPST pour la carte scolaire nationale.",
      dataPoints: [
        { label: "Indice d'infrastructures", value: "Excellent", change: "Stable", isPositive: true },
        { label: "Ratio Élèves / Enseignant", value: "18.3", change: "-1.2", isPositive: true },
        { label: "Taux d'accès internet", value: "100% (Souverain)" },
        { label: "ID d'Établissement National", value: "ID-EPST-GOM-45091" }
      ],
      details: [
        { label: "Salles équipées d'écrans", value: "14 salles de classe" },
        { label: "Raccordement réseau national", value: "Fibre Optique Gombe" },
        { label: "Effectifs d'élèves boursiers RDC", value: "15 élèves (Soutenus)" },
        { label: "Homologation officielle RDC", value: "Agréé par Arrêté Ministériel 2026" }
      ]
    }
  ];

  const filteredReports = reportsData.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.natureLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNature = natureFilter === "all" || report.nature === natureFilter;
    const matchesPermission = canAccessReport(report.nature);
    return matchesSearch && matchesNature && matchesPermission;
  });

  const simulateExport = (type: "pdf" | "excel") => {
    setExportingType(type);
    setTimeout(() => {
      setExportingType(null);
      // Native-like file stream triggers can be simulated nicely or downloading a dummy text
      const content = `SMARTSCHOOL RDC - RAPPORT OFFICIEL EXPORTÉ\n\n` +
                      `Titre: ${selectedReport?.title || "Rapport consolidé"}\n` +
                      `Généré le: ${new Date().toLocaleDateString()}\n` +
                      `ID Rapport: ${selectedReport?.id || "N/A"}\n\n` +
                      `RÉSUMÉ:\n${selectedReport?.summary || ""}\n\n` +
                      `DONNÉES CLÉS:\n` +
                      (selectedReport?.dataPoints.map(dp => `- ${dp.label} : ${dp.value}`).join("\n") || "") +
                      `\n\nSmartSchool RDC - Souveraineté & Modernisation Pédagogique.`;
                      
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedReport?.id || "rapport"}_export.${type === "pdf" ? "pdf" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider">
              Souveraineté Académique RDC
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-none uppercase">Rapports & Statistiques</h2>
          <p className="text-slate-400 text-xs max-w-xl">
            Génération, archivage intelligent et routage automatique des bilans financiers, administratifs et pédagogiques nationaux.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3 rounded-2xl shrink-0">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div className="text-left text-xs">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Compte Actuel</p>
            <p className="font-bold text-slate-200 truncate max-w-[150px]">{userName}</p>
            <p className="text-[10px] text-indigo-400 font-mono font-bold">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("automatic")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "automatic"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Rapports Automatiques Actifs
        </button>
        <button
          onClick={() => setActiveTab("archive")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "archive"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Historique des Archives ({filteredReports.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "settings"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Distribution Automatique
        </button>
      </div>

      {activeTab === "settings" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-left space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase">Matrice de routage automatique des rapports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chaque type de rapport généré par le système est automatiquement archivé et partagé selon les rôles légitimes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60 space-y-3">
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Rôle : Comptable
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Accès exclusif aux **rapports financiers** (Caisse journalier, hebdomadaire, mensuel, trimestriel, annuel financiers). Les données pédagogiques et de personnel lui sont inaccessibles par souveraineté.
              </p>
              <div className="text-[10px] font-mono font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Règles de conformité strictes appliquées</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60 space-y-3">
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Rôle : Administrateur RH
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Accès exclusif aux **rapports du personnel, de présence administrative et disciplinaire**. Les rapports de notes et de caisse financière lui sont masqués.
              </p>
              <div className="text-[10px] font-mono font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Règles de conformité strictes appliquées</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60 space-y-3">
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Rôle : Directeur & Préfet
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Supervision consolidée : reçoit automatiquement l'intégralité des rapports financiers, pédagogiques, disciplinaires et administratifs.
              </p>
              <div className="text-[10px] font-mono font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Supervision globale active</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60 space-y-3">
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                Rôle : Inspection & EPST
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Audite l'établissement. Reçoit des indicateurs agrégés pédagogiques et de scolarisation sans les données nominatives sensibles, respectant la vie privée.
              </p>
              <div className="text-[10px] font-mono font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Indicateurs de conformité nationale</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Main reports list panel */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un rapport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={natureFilter}
                  onChange={(e) => setNatureFilter(e.target.value)}
                  className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">Toutes les natures</option>
                  <option value="caisse_journalier">Caisse journalière</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuel">Mensuelle</option>
                  <option value="eleves">Démographie Élèves</option>
                  <option value="disciplinaire">Disciplinaire</option>
                  <option value="pedagogique">Pédagogique</option>
                  <option value="rh">Ressources Humaines</option>
                  <option value="annuel">Statistiques EPST</option>
                </select>
              </div>
            </div>

            {/* Reports Cards */}
            <div className="space-y-3">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  Aucun rapport ne correspond à vos filtres ou à vos autorisations de rôle.
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div 
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-2xs hover:border-indigo-500/50 hover:shadow-xs transition-all cursor-pointer text-xs space-y-3 flex flex-col justify-between ${
                      selectedReport?.id === report.id ? "ring-2 ring-indigo-500 border-indigo-500" : "border-slate-200/60 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                            {report.natureLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{report.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{report.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{report.date}</span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] line-clamp-2">
                      {report.summary}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-[10px]">
                      <div className="flex items-center space-x-1 text-slate-500 font-medium">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>Routé vers : </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">
                          {report.audience.join(", ")}
                        </span>
                      </div>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center space-x-1">
                        <span>Consulter</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Report Viewer / Details panel */}
          <div className="space-y-4">
            {selectedReport ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-5 text-xs">
                {/* Header detail */}
                <div className="border-b pb-3.5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded">
                      {selectedReport.status}
                    </span>
                    <span className="text-slate-400 font-mono text-[9px]">{selectedReport.id}</span>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">{selectedReport.title}</h3>
                  <p className="text-slate-400 text-[10px] font-mono">
                    Généré le {selectedReport.date} par {selectedReport.author}
                  </p>
                </div>

                {/* KPI metrics row */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedReport.dataPoints.map((dp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60 space-y-1">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block leading-none">
                        {dp.label}
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white leading-tight block">
                        {dp.value}
                      </span>
                      {dp.change && (
                        <span className={`text-[9px] font-mono font-bold ${dp.isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {dp.change}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Comprehensive table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                    Détails analytiques consolidés
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60 divide-y divide-slate-100 dark:divide-slate-900">
                    {selectedReport.details.map((detail, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium">{detail.label}</span>
                        <span className="font-bold text-slate-900 dark:text-white text-right">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit & Legal Footer */}
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/40 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ce document analytique est généré de manière sécurisée et souveraine par SmartSchool RDC. Les données sont chiffrées et conformes aux protocoles de régulation académique de l'EPST.
                </div>

                {/* Download Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    disabled={exportingType !== null}
                    onClick={() => simulateExport("pdf")}
                    className="flex items-center justify-center space-x-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{exportingType === "pdf" ? "Export PDF..." : "Exporter PDF"}</span>
                  </button>
                  <button
                    disabled={exportingType !== null}
                    onClick={() => simulateExport("excel")}
                    className="flex items-center justify-center space-x-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>{exportingType === "excel" ? "Export Excel..." : "Exporter Excel"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs flex flex-col justify-center items-center h-[280px] space-y-2">
                <FileText className="h-10 w-10 text-slate-300" />
                <p className="font-bold">Aucun rapport sélectionné</p>
                <p className="max-w-[180px] text-[10px]">Sélectionnez un rapport à gauche pour visualiser ses indicateurs détaillés et lancer l'export.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
