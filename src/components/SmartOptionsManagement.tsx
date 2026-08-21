import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Archive, 
  Power, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Layers, 
  Clock, 
  History,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Option, OptionAuditLog, ClassRoom } from "../types";
import { safeLocalStorage } from "../utils/safeStorage";

// Official list of MINEPSP/EPST Homologated Options in RDC
export const OFFICIAL_EPST_OPTIONS = [
  { name: "Mathématiques-Physique", code: "MP", cycle: "Humanités Scientifiques", desc: "Sciences exactes, Mathématiques approfondies, Physique et Chimie (Filière Scientifique)." },
  { name: "Chimie-Biologie", code: "CB", cycle: "Humanités Scientifiques", desc: "Sciences expérimentales de la matière, Chimie organique et Biologie générale." },
  { name: "Commerciale et Gestion", code: "CG", cycle: "Humanités Commerciales", desc: "Comptabilité générale, droit commercial, secrétariat et techniques de gestion." },
  { name: "Commerciale Informatique", code: "CI", cycle: "Humanités Commerciales", desc: "Informatique de gestion, programmation de base et systèmes d'information commercial." },
  { name: "Littéraire", code: "LIT", cycle: "Humanités Littéraires", desc: "Langues vivantes, littérature française et africaine, histoire et géographie." },
  { name: "Latin-Philosophie", code: "LP", cycle: "Humanités Littéraires", desc: "Étude des langues anciennes (Latin), philosophie générale et logique." },
  { name: "Pédagogie Générale", code: "PG", cycle: "Humanités Pédagogiques", desc: "Psychologie de l'enfant, pédagogie appliquée et formation des maîtres de l'école primaire." },
  { name: "Électricité Industrielle", code: "EL", cycle: "Humanités Techniques", desc: "Électrotechnique, installations électriques industrielles, schémas et automatisme." },
  { name: "Électronique", code: "ELN", cycle: "Humanités Techniques", desc: "Systèmes électroniques numériques, télécommunications et maintenance d'équipements." },
  { name: "Mécanique Générale", code: "ME", cycle: "Humanités Techniques", desc: "Usinage sur machines-outils, ajustage, construction mécanique et dessin industriel." },
  { name: "Mécanique Automobile", code: "MA", cycle: "Humanités Techniques", desc: "Diagnostic et réparation de moteurs à combustion, électricité automobile et transmission." },
  { name: "Construction", code: "CO", cycle: "Humanités Techniques", desc: "Génie civil, bâtiment, métré, technologie des matériaux et dessin d'architecture." },
  { name: "Coupe et Couture", code: "CC", cycle: "Humanités Techniques", desc: "Patronnage, modélisme, confection industrielle et stylisme de mode." },
  { name: "Nutrition & Hôtellerie", code: "NU", cycle: "Humanités Techniques", desc: "Sciences alimentaires, diététique, hygiène, art culinaire et gestion hôtelière." },
  { name: "Agriculture & Agronomie", code: "AG", cycle: "Humanités Techniques", desc: "Production végétale, fertilité des sols, cultures vivrières et entrepreneuriat agricole." },
  { name: "Vétérinaire", code: "VET", cycle: "Humanités Techniques", desc: "Santé et hygiène animales, zootechnie et élevage de petit et grand bétail." },
  { name: "Informatique de Gestion", code: "INF", cycle: "Humanités Techniques", desc: "Génie logiciel, développement d'applications, réseaux et maintenance informatique." },
  { name: "Secrétariat & Bureautique", code: "SEC", cycle: "Humanités Commerciales", desc: "Assistance de direction, traitement de texte avancé et organisation administrative." },
  { name: "Technique Sociale", code: "TS", cycle: "Humanités Sociales", desc: "Éducation sociale, développement communautaire, santé publique et assistance sociale." },
  { name: "Arts Plastiques & Musique", code: "ART", cycle: "Humanités Artistiques", desc: "Dessin, peinture, sculpture, histoire de l'art et solfège musical." }
];

interface SmartOptionsManagementProps {
  options: Option[];
  classes?: ClassRoom[];
  userRole?: string;
  userName?: string;
  onAddOption?: (newOpt: Option) => void;
  onUpdateOption?: (updatedOpt: Option) => void;
  onToggleStatus?: (id: string, newStatus: "Active" | "Inactive" | "Archivée") => void;
  onDeleteOption?: (id: string) => void;
}

export function SmartOptionsManagement({
  options = [],
  classes = [],
  userRole = "Directeur",
  userName = "Direction Pédagogique",
  onAddOption,
  onUpdateOption,
  onToggleStatus,
  onDeleteOption
}: SmartOptionsManagementProps) {

  const [activeTab, setActiveTab] = useState<"toutes" | "actives" | "inactives" | "archivees" | "audit">("toutes");
  const [searchQuery, setSearchQuery] = useState("");
  const [cycleFilter, setCycleFilter] = useState("Tous");

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOptionToEdit, setSelectedOptionToEdit] = useState<Option | null>(null);
  
  // Deletion restriction alert modal
  const [blockedDeleteModal, setBlockedDeleteModal] = useState<{ option: Option; classesCount: number } | null>(null);

  // Quick EPST Pick mode inside Add Modal
  const [addMode, setAddMode] = useState<"homologuee" | "personnalisee">("homologuee");
  const [selectedEpstPick, setSelectedEpstPick] = useState<string>("");

  // Custom Option Form State
  const [customForm, setCustomForm] = useState({
    name: "",
    code: "",
    cycle: "Humanités Scientifiques",
    desc: "",
    status: "Active" as "Active" | "Inactive"
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<OptionAuditLog[]>(() => {
    const saved = safeLocalStorage.getItem("ss_options_audit_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "opt-log-1",
        optionName: "Mathématiques-Physique",
        optionCode: "MP",
        actorName: "M. Mwamba - Directeur",
        actorRole: "Directeur",
        action: "Création",
        timestamp: "2026-08-01 09:15",
        details: "Option homologuée MINEPSP activée lors de l'initialisation de l'école."
      },
      {
        id: "opt-log-2",
        optionName: "Commerciale et Gestion",
        optionCode: "CG",
        actorName: "Mme Kabulo - Préfet des études",
        actorRole: "Préfet des études",
        action: "Modification",
        timestamp: "2026-08-03 11:30",
        details: "Mise à jour de la description et du code de filière."
      }
    ];
  });

  // Save audit logs locally
  useEffect(() => {
    safeLocalStorage.setItem("ss_options_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Log audit helper
  const addAuditLog = (
    optName: string, 
    optCode: string, 
    action: "Création" | "Modification" | "Désactivation" | "Réactivation" | "Archivage" | "Suppression", 
    details: string
  ) => {
    const newEntry: OptionAuditLog = {
      id: `opt-log-${Date.now()}`,
      optionName: optName,
      optionCode: optCode,
      actorName: userName,
      actorRole: userRole,
      action,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      details
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Calculate classes count per option
  const getOptionClassesCount = (optName: string, optCode: string) => {
    return classes.filter(c => 
      c.optionName?.toLowerCase().trim() === optName.toLowerCase().trim() ||
      c.optionName?.toLowerCase().trim() === optCode.toLowerCase().trim()
    ).length;
  };

  // Helper cycle list
  const cyclesList = [
    "Tous",
    "Humanités Scientifiques",
    "Humanités Commerciales",
    "Humanités Littéraires",
    "Humanités Pédagogiques",
    "Humanités Techniques",
    "Humanités Sociales",
    "Éducation de Base"
  ];

  // Helper status resolution
  const getResolvedStatus = (opt: Option): "Active" | "Inactive" | "Archivée" => {
    if (opt.status) return opt.status;
    return opt.isActivated !== false ? "Active" : "Inactive";
  };

  // Filter options list
  const filteredOptions = options.filter(opt => {
    const status = getResolvedStatus(opt);
    
    // Tab filter
    if (activeTab === "actives" && status !== "Active") return false;
    if (activeTab === "inactives" && status !== "Inactive") return false;
    if (activeTab === "archivees" && status !== "Archivée") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = opt.name.toLowerCase().includes(q);
      const matchCode = opt.code.toLowerCase().includes(q);
      const matchCycle = (opt.cycle || "").toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCycle) return false;
    }

    // Cycle filter
    if (cycleFilter !== "Tous" && opt.cycle && opt.cycle !== cycleFilter) {
      return false;
    }

    return true;
  });

  // Count stats
  const totalCount = options.length;
  const activeCount = options.filter(o => getResolvedStatus(o) === "Active").length;
  const inactiveCount = options.filter(o => getResolvedStatus(o) === "Inactive").length;
  const archivedCount = options.filter(o => getResolvedStatus(o) === "Archivée").length;

  // Handle Pick from EPST List
  const handleSelectEpstPick = (code: string) => {
    setSelectedEpstPick(code);
    const item = OFFICIAL_EPST_OPTIONS.find(o => o.code === code);
    if (item) {
      setCustomForm({
        name: item.name,
        code: item.code,
        cycle: item.cycle,
        desc: item.desc,
        status: "Active"
      });
    }
  };

  // Handle Form Submit for Adding New Option
  const handleCreateOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name.trim() || !customForm.code.trim()) return;

    // Check duplicate
    const existing = options.find(o => o.name.toLowerCase() === customForm.name.toLowerCase() || o.code.toLowerCase() === customForm.code.toLowerCase());
    if (existing) {
      alert(`L'option "${customForm.name}" (${customForm.code}) existe déjà dans la base de données.`);
      return;
    }

    const newOpt: Option = {
      id: `opt-custom-${Date.now()}`,
      name: customForm.name.trim(),
      code: customForm.code.trim().toUpperCase(),
      cycle: customForm.cycle,
      desc: customForm.desc.trim() || `Option d'étude ${customForm.name} homologuée par l'EPST.`,
      status: customForm.status,
      isActivated: customForm.status === "Active",
      createdAt: new Date().toLocaleDateString("fr-FR"),
      isCustom: addMode === "personnalisee"
    };

    onAddOption?.(newOpt);
    addAuditLog(
      newOpt.name, 
      newOpt.code, 
      "Création", 
      `Création d'une option ${addMode === "personnalisee" ? "personnalisée" : "homologuée EPST"} avec le cycle ${newOpt.cycle}.`
    );

    setAddModalOpen(false);
    setCustomForm({ name: "", code: "", cycle: "Humanités Scientifiques", desc: "", status: "Active" });
    setSelectedEpstPick("");
  };

  // Handle Edit Submit
  const handleEditOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionToEdit || !selectedOptionToEdit.name.trim()) return;

    const updated: Option = {
      ...selectedOptionToEdit,
      isActivated: selectedOptionToEdit.status === "Active"
    };

    onUpdateOption?.(updated);
    addAuditLog(
      updated.name,
      updated.code,
      "Modification",
      `Modification des paramètres de l'option (Cycle: ${updated.cycle}, Statut: ${updated.status}).`
    );

    setEditModalOpen(false);
    setSelectedOptionToEdit(null);
  };

  // Handle Toggle Active/Inactive
  const handleToggleStatusClick = (opt: Option) => {
    const currentStatus = getResolvedStatus(opt);
    let newStatus: "Active" | "Inactive" = currentStatus === "Active" ? "Inactive" : "Active";

    onToggleStatus?.(opt.id, newStatus);
    addAuditLog(
      opt.name,
      opt.code,
      newStatus === "Active" ? "Réactivation" : "Désactivation",
      newStatus === "Active" 
        ? "Option réactivée. Elle est de nouveau disponible pour les nouvelles inscriptions et créations de classes."
        : "Option désactivée. Interdiction de nouvelles inscriptions, les archives d'élèves sont conservées."
    );
  };

  // Handle Archive
  const handleArchiveClick = (opt: Option) => {
    onToggleStatus?.(opt.id, "Archivée");
    addAuditLog(
      opt.name,
      opt.code,
      "Archivage",
      "Option déplacée dans les archives historiques de l'établissement."
    );
  };

  // Handle Delete with Safety Control
  const handleDeleteClick = (opt: Option) => {
    const count = getOptionClassesCount(opt.name, opt.code);
    if (count > 0) {
      setBlockedDeleteModal({ option: opt, classesCount: count });
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'option "${opt.name}" (${opt.code}) ? Cette action est irréversible.`)) {
      onDeleteOption?.(opt.id);
      addAuditLog(
        opt.name,
        opt.code,
        "Suppression",
        "Suppression définitive de l'option (aucune classe n'y était rattachée)."
      );
    }
  };

  return (
    <div className="space-y-6 text-left" id="options-management-module">
      
      {/* HEADER TITLE & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> MINEPSP / EPST Homologation RDC
            </span>
            <span className="text-slate-400 text-xs font-mono">• Portée Globale Plateforme</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            Gestion Dynamique des Options d'Étude
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configurez les filières et options organisées. Les modifications impactent instantanément les inscriptions, classes, enseignants et bulletins.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setActiveTab("audit")}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <History className="h-4 w-4 text-indigo-500" />
            <span>Journal d'Audit ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => {
              setAddMode("homologuee");
              setCustomForm({ name: "", code: "", cycle: "Humanités Scientifiques", desc: "", status: "Active" });
              setSelectedEpstPick("");
              setAddModalOpen(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter / Organiser une Option</span>
          </button>
        </div>
      </div>

      {/* STATS COUNTER CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Options</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">filières</span>
          </div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Options Actives
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{activeCount}</span>
            <span className="text-[10px] text-emerald-600/70 font-bold">sélectionnables</span>
          </div>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Inactives
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300">{inactiveCount}</span>
            <span className="text-[10px] text-amber-600/70 font-bold">bloquées</span>
          </div>
        </div>

        <div className="bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Archive className="h-3 w-3" /> Archivées
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-slate-700 dark:text-slate-300">{archivedCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">historique</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TABS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* TABS */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("toutes")}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "toutes" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Toutes ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("actives")}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "actives" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Actives ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("inactives")}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "inactives" ? "bg-amber-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Inactives ({inactiveCount})
            </button>
            <button
              onClick={() => setActiveTab("archivees")}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "archivees" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Archivées ({archivedCount})
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center space-x-1 ${
                activeTab === "audit" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Audit</span>
            </button>
          </div>

          {/* SEARCH & CYCLE FILTER */}
          {activeTab !== "audit" && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Cycle Dropdown */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={cycleFilter}
                  onChange={(e) => setCycleFilter(e.target.value)}
                  className="w-full sm:w-auto pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-200 outline-none"
                >
                  {cyclesList.map(c => (
                    <option key={c} value={c}>{c === "Tous" ? "Tous les Cycles" : c}</option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher nom, code, filière..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* AUDIT LOG TAB VIEW */}
      {activeTab === "audit" ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase flex items-center space-x-2">
                <History className="h-5 w-5 text-indigo-500" />
                <span>Journal d'Audit - Historique des Modifications d'Options</span>
              </h3>
              <p className="text-xs text-slate-500">Traçabilité légale de chaque création, modification, désactivation ou suppression d'option.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider bg-slate-50 dark:bg-slate-950">
                  <th className="p-3">Horodatage</th>
                  <th className="p-3">Option</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Auteur & Rôle</th>
                  <th className="p-3">Détails de l'opération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="p-3 font-mono text-slate-500 text-[11px] font-bold">{log.timestamp}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white">{log.optionName}</span>
                      <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-[10px] text-indigo-600 dark:text-indigo-400">{log.optionCode}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                        log.action === "Création" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                        log.action === "Désactivation" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                        log.action === "Réactivation" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" :
                        log.action === "Suppression" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" :
                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{log.actorName}</p>
                      <p className="text-[10px] text-slate-400">{log.actorRole}</p>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 leading-relaxed">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* OPTIONS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOptions.map((opt) => {
            const status = getResolvedStatus(opt);
            const classesCount = getOptionClassesCount(opt.name, opt.code);
            const isCustom = opt.isCustom;

            return (
              <div 
                key={opt.id} 
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                  status === "Active" 
                    ? "border-slate-200 dark:border-slate-800" 
                    : status === "Inactive" 
                    ? "border-amber-200/80 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10" 
                    : "border-slate-200/60 dark:border-slate-800 opacity-60 bg-slate-50/50"
                }`}
              >
                {/* Top Colored Accent Banner */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  status === "Active" ? "bg-emerald-500" : status === "Inactive" ? "bg-amber-500" : "bg-slate-400"
                }`} />

                <div className="space-y-3">
                  {/* Code & Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-sm px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-200 dark:border-indigo-900">
                        {opt.code}
                      </span>
                      {isCustom ? (
                        <span className="bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[9px] font-bold px-2 py-0.5 rounded">
                          Personnalisée
                        </span>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded">
                          EPST Homologuée
                        </span>
                      )}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase flex items-center space-x-1 ${
                      status === "Active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                      status === "Inactive" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                      "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-emerald-500 animate-pulse" : status === "Inactive" ? "bg-amber-500" : "bg-slate-400"}`} />
                      <span>{status}</span>
                    </span>
                  </div>

                  {/* Name & Cycle */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">{opt.name}</h3>
                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                      <Layers className="h-3 w-3" /> {opt.cycle || "Humanités Générales"}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {opt.desc}
                  </p>

                  {/* Class assignment badge */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400 font-medium">Classes rattachées :</span>
                    <span className={`font-mono font-extrabold px-2 py-0.5 rounded-lg text-[10px] ${
                      classesCount > 0 ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}>
                      {classesCount} classe(s)
                    </span>
                  </div>
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 flex items-center justify-between gap-1">
                  
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatusClick(opt)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                      status === "Active" 
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" 
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{status === "Active" ? "Désactiver" : "Activer"}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setSelectedOptionToEdit(opt);
                        setEditModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                      title="Modifier les détails"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    {/* Archive Button */}
                    {status !== "Archivée" && (
                      <button
                        onClick={() => handleArchiveClick(opt)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        title="Archiver"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteClick(opt)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                      title="Supprimer l'option"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD OPTION (HOMOLOGUÉE EPST OU PERSONNALISÉE) */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8 text-left"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Ajouter une Option d'Étude
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sélectionnez une option officielle du répertoire national MINEPSP ou créez une option personnalisée.
                  </p>
                </div>
                <button 
                  onClick={() => setAddModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODE TOGGLE */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAddMode("homologuee")}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    addMode === "homologuee" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span>Option Homologuée MINEPSP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("personnalisee")}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    addMode === "personnalisee" ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Option Personnalisée</span>
                </button>
              </div>

              <form onSubmit={handleCreateOptionSubmit} className="space-y-4">
                
                {/* QUICK PICK FROM HOMOLOGATED REPOSITORY */}
                {addMode === "homologuee" && (
                  <div className="space-y-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900">
                    <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                      Sélectionnez dans le répertoire officiel EPST :
                    </label>
                    <select
                      value={selectedEpstPick}
                      onChange={(e) => handleSelectEpstPick(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-white"
                    >
                      <option value="">-- Choisissez une option homologuée RDC --</option>
                      {OFFICIAL_EPST_OPTIONS.map((epst) => (
                        <option key={epst.code} value={epst.code}>
                          {epst.name} ({epst.code}) - {epst.cycle}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* NOM DE L'OPTION */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Nom de l'Option *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Chimie-Biologie"
                      value={customForm.name}
                      onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* CODE DE L'OPTION */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Code / Sigle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: CB, MP, CG..."
                      value={customForm.code}
                      onChange={(e) => setCustomForm({ ...customForm, code: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
                    />
                  </div>

                  {/* CYCLE CONCERNÉ */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Cycle Concerné *
                    </label>
                    <select
                      value={customForm.cycle}
                      onChange={(e) => setCustomForm({ ...customForm, cycle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {cyclesList.filter(c => c !== "Tous").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* STATUT INITIAL */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Statut Initial *
                    </label>
                    <select
                      value={customForm.status}
                      onChange={(e) => setCustomForm({ ...customForm, status: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Active">Active (Immédiatement ouverte)</option>
                      <option value="Inactive">Inactive (Provisoirement fermée)</option>
                    </select>
                  </div>

                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Description & Orientation Professionnelle
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brève description du programme et des compétences visées..."
                    value={customForm.desc}
                    onChange={(e) => setCustomForm({ ...customForm, desc: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3 border-t">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Enregistrer l'Option</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDIT OPTION */}
      <AnimatePresence>
        {editModalOpen && selectedOptionToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8 text-left"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Modifier l'Option - {selectedOptionToEdit.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ajustez les paramètres de cette option.
                  </p>
                </div>
                <button 
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditOptionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nom de l'Option *</label>
                    <input
                      type="text"
                      required
                      value={selectedOptionToEdit.name}
                      onChange={(e) => setSelectedOptionToEdit({ ...selectedOptionToEdit, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Code Sigle *</label>
                    <input
                      type="text"
                      required
                      value={selectedOptionToEdit.code}
                      onChange={(e) => setSelectedOptionToEdit({ ...selectedOptionToEdit, code: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Cycle Concerné *</label>
                    <select
                      value={selectedOptionToEdit.cycle || "Humanités Générales"}
                      onChange={(e) => setSelectedOptionToEdit({ ...selectedOptionToEdit, cycle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {cyclesList.filter(c => c !== "Tous").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Statut *</label>
                    <select
                      value={getResolvedStatus(selectedOptionToEdit)}
                      onChange={(e) => setSelectedOptionToEdit({ ...selectedOptionToEdit, status: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Archivée">Archivée</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Description</label>
                  <textarea
                    rows={3}
                    value={selectedOptionToEdit.desc}
                    onChange={(e) => setSelectedOptionToEdit({ ...selectedOptionToEdit, desc: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3 border-t">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Mettre à jour</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: DELETION BLOCKED NOTICE */}
      <AnimatePresence>
        {blockedDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center space-x-3 text-amber-500">
                <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-2xl">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase">
                    Suppression Impossible
                  </h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                    Règle d'Inviolabilité des Données Académiques
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p>
                  L'option <strong className="text-indigo-600 dark:text-indigo-400 font-black">{blockedDeleteModal.option.name}</strong> ({blockedDeleteModal.option.code}) ne peut pas être supprimée car elle est actuellement rattachée à <strong className="font-black text-slate-900 dark:text-white">{blockedDeleteModal.classesCount} classe(s)</strong> actives dans l'établissement.
                </p>
                <p className="text-[11px] text-slate-500">
                  Afin de préserver l'historique des élèves et des bulletins, vous devez plutôt <strong>désactiver</strong> cette option pour bloquer toute nouvelle inscription.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                <button
                  onClick={() => setBlockedDeleteModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handleToggleStatusClick(blockedDeleteModal.option);
                    setBlockedDeleteModal(null);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-md"
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>Désactiver à la place</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
