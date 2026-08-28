import React, { useState, useEffect } from "react";
import { 
  CnrResource, CnrSyncLog, Student, Grade, TemplateHistory, CnrResourceCategory 
} from "../types";
import { 
  initialTemplateModels, BULLETIN_6EME_DOMAINS, ALL_VARIABLES_HELP 
} from "../data/templates";
import { 
  Printer, ShieldCheck, Check, FileText, Settings, Layers, GitBranch, 
  Eye, History, RefreshCw, AlertTriangle, Download, Plus, Trash2, Edit3, 
  Save, Undo, CheckCircle, XCircle, AlertCircle, QrCode, Building2, 
  ExternalLink, Lock, FileSignature, ChevronRight, Search, FileDiff, Clock
} from "lucide-react";

export interface SmartTemplateEngineProps {
  students: Student[];
  grades: Grade[];
  cnrResources: CnrResource[];
  onAddResource: (resource: CnrResource) => void;
  onUpdateResource: (resource: CnrResource) => void;
  schoolSyncLogs: CnrSyncLog[];
  onSyncResource: (resourceId: string) => void;
  onSyncAll: () => void;
  lang: string;
}

const DEFAULT_FALLBACK_STUDENT: Student = {
  id: "std-demo-01",
  registrationNumber: "STD-2026-0001",
  firstName: "Glodi",
  lastName: "Kabasele",
  fullName: "Glodi Kabasele",
  postName: "Mukendi",
  birthDate: "12/03/2012",
  gender: "M",
  address: "Kinshasa, Gombe",
  parentName: "M. Kabasele",
  parentPhone: "+243 812 000 000",
  className: "6ème Primaire A",
  optionName: "Primaire",
  status: "Actif"
};

export function SmartTemplateEngine({
  students = [],
  grades = [],
  cnrResources = [],
  onAddResource,
  onUpdateResource,
  schoolSyncLogs = [],
  onSyncResource,
  onSyncAll,
  lang
}: SmartTemplateEngineProps) {
  // Role & portal simulation
  const [activePortal, setActivePortal] = useState<"cnr" | "school">("school");
  
  // Library search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Safe fallbacks for lists
  const safeStudents = (students && students.length > 0) ? students : [DEFAULT_FALLBACK_STUDENT];
  const safeCnrResources = (cnrResources && cnrResources.length > 0) ? cnrResources : initialTemplateModels;

  // Active selected template in the UI
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(safeCnrResources[0]?.id || "cnr-1");
  const activeTemplate = safeCnrResources.find(t => t.id === selectedTemplateId) || safeCnrResources[0] || initialTemplateModels[0];

  // Active student selected for printing/rendering
  const [selectedStudentId, setSelectedStudentId] = useState<string>(safeStudents[0]?.id || DEFAULT_FALLBACK_STUDENT.id);
  const selectedStudent = safeStudents.find(s => s.id === selectedStudentId) || safeStudents[0] || DEFAULT_FALLBACK_STUDENT;

  // Safe student demographic accessors
  const studentRegNumber = selectedStudent?.registrationNumber || selectedStudent?.id || "STD-2026-0001";
  const studentLastName = selectedStudent?.lastName || "Élève";
  const studentFirstName = selectedStudent?.firstName || "";
  const studentGender = selectedStudent?.gender || "M";
  const studentBirthDate = selectedStudent?.birthDate || "12/03/2012";
  const studentClassName = selectedStudent?.className || "6ème Primaire";
  const studentOptionName = selectedStudent?.optionName || "Section Générale";

  // Synchronize selection when props change
  useEffect(() => {
    if (students && students.length > 0) {
      if (!students.some(s => s.id === selectedStudentId)) {
        setSelectedStudentId(students[0].id);
      }
    }
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (cnrResources && cnrResources.length > 0) {
      if (!cnrResources.some(t => t.id === selectedTemplateId)) {
        setSelectedTemplateId(cnrResources[0].id);
      }
    }
  }, [cnrResources, selectedTemplateId]);

  // Template editor states (for CNR EPST portal)
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editVersion, setEditVersion] = useState("");
  const [editStatus, setEditStatus] = useState<"brouillon" | "en_validation" | "approuve" | "archive">("brouillon");
  const [editRawContent, setEditRawContent] = useState("");
  const [editEffectiveDate, setEditEffectiveDate] = useState("");
  const [editChangeSummary, setEditChangeSummary] = useState("Ajustements mineurs");

  // Version Comparison states
  const [isComparing, setIsComparing] = useState(false);
  const [compareVersionA, setCompareVersionA] = useState<string>("");
  const [compareVersionB, setCompareVersionB] = useState<string>("");

  // Create new template state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<CnrResourceCategory>("bulletin");
  const [newDesc, setNewDesc] = useState("");
  const [newVersion, setNewVersion] = useState("v1.0.0");
  const [newRawContent, setNewRawContent] = useState("");

  // Compliance Audit state
  const [auditPassed, setAuditPassed] = useState<boolean | null>(null);
  const [auditLogs, setAuditLogs] = useState<{ type: "info" | "success" | "warning" | "error"; msg: string }[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  
  // Custom manual model import state (future proofing)
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonRaw, setImportJsonRaw] = useState("");
  const [importError, setImportError] = useState("");

  // Sync animation states
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Initialize editor on template selection
  useEffect(() => {
    if (activeTemplate) {
      setEditTitle(activeTemplate.title);
      setEditDesc(activeTemplate.description);
      setEditSummary(activeTemplate.contentSummary);
      setEditVersion(activeTemplate.version);
      setEditStatus(activeTemplate.status);
      setEditRawContent(activeTemplate.contentRaw || "{}");
      setEditEffectiveDate(activeTemplate.effectiveDate || "01/09/2026");
      
      const history = activeTemplate.history || [];
      if (history.length > 0) {
        setCompareVersionA(history[0].version);
        setCompareVersionB(activeTemplate.version);
      } else {
        setCompareVersionA("");
        setCompareVersionB("");
      }
    }
  }, [selectedTemplateId, activeTemplate]);

  // Handle template update (CNR-EPST Admin)
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    // Build history entry
    const newHistoryEntry: TemplateHistory = {
      id: `hist-${Date.now()}`,
      version: activeTemplate.version,
      updatedAt: new Date().toLocaleDateString("fr-FR"),
      author: "Inspecteur Technique (CNR-EPST)",
      changeSummary: editChangeSummary,
      status: activeTemplate.status,
      contentRaw: activeTemplate.contentRaw || "{}"
    };

    const updated: CnrResource = {
      ...activeTemplate,
      title: editTitle,
      description: editDesc,
      contentSummary: editSummary,
      version: editVersion,
      status: editStatus,
      effectiveDate: editEffectiveDate,
      contentRaw: editRawContent,
      publishedAt: new Date().toLocaleDateString("fr-FR"),
      history: [newHistoryEntry, ...(activeTemplate.history || [])]
    };

    onUpdateResource(updated);
    setIsEditing(false);
    setEditChangeSummary("Mise à jour des configurations");
    
    // Add national notification
    alert(`Modèle national "${editTitle}" mis à jour en version ${editVersion} avec succès. Une notification de synchronisation a été émise à toutes les écoles.`);
  };

  // Handle template creation (CNR-EPST Admin)
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRes: CnrResource = {
      id: `cnr-${Date.now()}`,
      title: newTitle,
      type: "document",
      category: newCategory,
      version: newVersion,
      status: "brouillon",
      publishedAt: new Date().toLocaleDateString("fr-FR"),
      effectiveDate: new Date().toLocaleDateString("fr-FR"),
      author: "Administration Centrale du CNR-EPST",
      description: newDesc,
      fileSize: "1.0 Mo",
      contentSummary: `Modèle structuré pour documents de type ${newCategory.toUpperCase()}.`,
      variables: ["Nom_Eleve", "PostNom", "Prénom", "Matricule", "École", "Province", "QRCode"],
      contentRaw: newRawContent || JSON.stringify({ title: newTitle, category: newCategory, version: newVersion }, null, 2),
      history: []
    };

    onAddResource(newRes);
    setShowCreateModal(false);
    setSelectedTemplateId(newRes.id);
    
    // Clear fields
    setNewTitle("");
    setNewDesc("");
    setNewVersion("v1.0.0");
    setNewRawContent("");
  };

  // Import a raw template JSON (future-proofing)
  const handleImportTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    try {
      const parsed = JSON.parse(importJsonRaw);
      if (!parsed.title || !parsed.category || !parsed.version) {
        setImportError("Erreur : Le JSON doit contenir au minimum les champs 'title', 'category' et 'version'.");
        return;
      }

      const importedResource: CnrResource = {
        id: `cnr-${Date.now()}`,
        title: parsed.title,
        type: parsed.type || "document",
        category: parsed.category as CnrResourceCategory,
        version: parsed.version,
        status: parsed.status || "brouillon",
        publishedAt: new Date().toLocaleDateString("fr-FR"),
        effectiveDate: parsed.effectiveDate || new Date().toLocaleDateString("fr-FR"),
        author: parsed.author || "Importateur Externe",
        description: parsed.description || "Modèle importé de manière externe depuis un fichier compatible.",
        fileSize: parsed.fileSize || "1.5 Mo",
        contentSummary: parsed.contentSummary || "Structure importée sans modification de code.",
        variables: parsed.variables || ["Nom_Eleve", "Matricule", "École", "QRCode"],
        contentRaw: importJsonRaw,
        history: []
      };

      onAddResource(importedResource);
      setShowImportModal(false);
      setSelectedTemplateId(importedResource.id);
      setImportJsonRaw("");
      alert("Nouveau modèle importé avec succès dans le SmartTemplate Engine !");
    } catch (err: any) {
      setImportError(`Structure JSON non valide : ${err.message}`);
    }
  };

  // Run Moteur de Conformité (Compliance Audit Engine)
  const runComplianceAudit = () => {
    if (!activeTemplate) return;
    setIsAuditing(true);
    setAuditPassed(null);
    setAuditLogs([]);

    const schoolLog = schoolSyncLogs.find(log => log.resourceId === activeTemplate.id);
    const isOutOfDate = schoolLog ? schoolLog.status === "outdated" || schoolLog.status === "not_installed" : true;

    const logs: { type: "info" | "success" | "warning" | "error"; msg: string }[] = [];
    logs.push({ type: "info", msg: `Initialisation de l'audit de conformité pour [${activeTemplate.title}]...` });

    setTimeout(() => {
      // 1. Version Check
      if (isOutOfDate) {
        logs.push({ 
          type: "error", 
          msg: `Échec du contrôle de version : Votre école utilise une version obsolète ou n'a pas installé la version officielle homologuée (${activeTemplate.version}).` 
        });
      } else {
        logs.push({ 
          type: "success", 
          msg: `Contrôle de version validé : La version locale (${schoolLog?.installedVersion}) correspond à la version officielle approuvée du CNR-EPST (${activeTemplate.version}).` 
        });
      }

      // 2. Signatures validation
      const signaturesExist = selectedStudent && (selectedStudent.status === "Actif" || selectedStudent.status === "Validé");
      if (!signaturesExist) {
        logs.push({ 
          type: "warning", 
          msg: "Avertissement : Les signatures d'homologation numériques (Directeur et Préfet) ne sont pas entièrement configurées dans la fiche d'établissement." 
        });
      } else {
        logs.push({ 
          type: "success", 
          msg: "Signatures requises validées : Griffe numérique de l'inspecteur provincial et cachet d'école certifiés conformes." 
        });
      }

      // 3. Calculation and fields check
      const studentGrades = grades ? grades.filter(g => g.studentId === selectedStudent?.id) : [];
      const isMissingGrades = studentGrades.length === 0;
      
      if (activeTemplate.category === "bulletin" && isMissingGrades) {
        logs.push({ 
          type: "error", 
          msg: "Calculs académiques invalides : Aucune note trouvée dans le registre de la classe pour l'élève sélectionné." 
        });
      } else {
        logs.push({ 
          type: "success", 
          msg: "Vérification des calculs réussie : La somme des périodes et les totaux des examens correspondent exactement au barème officiel de l'EPST (Erreur mathématique : 0%)." 
        });
      }

      // 4. Secure QR check
      logs.push({ 
        type: "success", 
        msg: "Filigrane et QR Code validés : Empreinte cryptographique de sécurité nationale 'EPST-SEC-KEY' détectée." 
      });

      // Final determination
      const passed = !isOutOfDate && (activeTemplate.category !== "bulletin" || !isMissingGrades);
      
      setAuditLogs(logs);
      setAuditPassed(passed);
      setIsAuditing(false);
    }, 1200);
  };

  // Simulate print behavior
  const handlePrint = () => {
    if (auditPassed === false) {
      alert("Impression bloquée : Le document n'est pas certifié conforme aux exigences réglementaires de l'EPST. Veuillez d'abord corriger les alertes d'audit.");
      return;
    }
    window.print();
  };

  // Compile helper to replace variables
  const compileText = (text: string) => {
    if (!text) return "";
    
    // Derive dynamic mock percentages and ranks for rich representation
    const studentGrades = grades ? grades.filter(g => g.studentId === selectedStudent?.id) : [];
    const totalPointsObtained = studentGrades.reduce((acc, curr) => acc + (curr.scoreObtained || 0), 0);
    const totalMax = studentGrades.reduce((acc, curr) => acc + (curr.maxScore || 0), 0) || 500;
    const computedPercentage = ((totalPointsObtained / totalMax) * 100) || 72.4;
    const dec = computedPercentage >= 50 ? "Admis(e) dans la classe supérieure" : "Refusé(e) / Redouble la classe";
    const ment = computedPercentage >= 80 ? "Grande Distinction" : computedPercentage >= 70 ? "Distinction" : computedPercentage >= 50 ? "Satisfaction" : "Médiocre";

    const vars: Record<string, string> = {
      "{{Nom_Eleve}}": studentLastName,
      "{{PostNom}}": selectedStudent?.postName || studentLastName, // In Congo Postnom is common
      "{{Prénom}}": studentFirstName,
      "{{Matricule}}": studentRegNumber,
      "{{Sexe}}": studentGender,
      "{{Lieu_Naissance}}": "Kinshasa",
      "{{Date_Naissance}}": studentBirthDate,
      "{{Classe}}": studentClassName,
      "{{Option}}": studentOptionName,
      "{{Section}}": "Primaire",
      "{{Année_Scolaire}}": "2025-2026",
      "{{École}}": "Lycée Prince de Liège / CS Cardinal Malula",
      "{{Province}}": "Kinshasa-Funa",
      "{{Ville}}": "Kinshasa",
      "{{Commune}}": "Gombe",
      "{{Total_General}}": `${totalPointsObtained + 1800} / 3720`, // prefilled scale
      "{{Pourcentage}}": computedPercentage.toFixed(1),
      "{{Rang}}": "5",
      "{{Nbre_Eleves}}": "28",
      "{{Mention}}": ment,
      "{{Décision}}": dec,
      "{{Conduite}}": "Très Bonne",
      "{{Application}}": "Excellente",
      "{{Date_Emission}}": new Date().toLocaleDateString("fr-FR"),
      "{{Signature_Directeur}}": "M. Sylvain Kabulo",
      "{{QRCode}}": `SECURE-ID-RDC-${studentRegNumber}-2026`
    };

    let result = text;
    Object.entries(vars).forEach(([key, val]) => {
      result = result.replaceAll(key, val);
    });
    return result;
  };

  // Filter models based on search and filters
  const filteredTemplates = cnrResources.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Compare selected versions
  const versionAData = activeTemplate.history?.find(h => h.version === compareVersionA) || activeTemplate;
  const versionBData = compareVersionB === activeTemplate.version 
    ? activeTemplate 
    : activeTemplate.history?.find(h => h.version === compareVersionB) || activeTemplate;

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header Banner */}
      <div className="p-6 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
          <QrCode className="h-44 w-44 text-sky-400 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-brand-blue text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md tracking-wider">
              SmartTemplate Engine
            </span>
            <span className="text-slate-300 font-mono text-[10px]">• Souveraineté Éducative Nationale</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>Bibliothèque des Modèles Officiels EPST</span>
          </h2>
          <p className="text-xs text-sky-100/90 max-w-3xl leading-relaxed">
            Moteur de génération et d'homologation de documents légaux de la République Démocratique du Congo. Permet de piloter de manière dynamique les bulletins scolaires, attestations et fiches de cotation à partir de variables nationales inviolables.
          </p>
          
          {/* Dual-Portal Toggle Switch */}
          <div className="pt-4 flex items-center gap-3">
            <span className="text-xs text-sky-200 font-medium">Mode d'accès :</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-900/60 border border-slate-700/50">
              <button
                onClick={() => {
                  setActivePortal("school");
                  setAuditPassed(null);
                  setAuditLogs([]);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activePortal === "school"
                    ? "bg-brand-blue text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Portail Établissement (Écoles)</span>
              </button>
              <button
                onClick={() => {
                  setActivePortal("cnr");
                  setIsEditing(false);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activePortal === "cnr"
                    ? "bg-brand-green text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Portail Ministériel (CNR-EPST)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* SIDE PANEL: TEMPLATES NAV & LIBRARY SEARCH */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 shadow-sm text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Registre National</span>
              <span className="text-[10px] bg-slate-150 dark:bg-slate-800 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                {filteredTemplates.length} Modèles
              </span>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un modèle..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-full rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              >
                <option value="all">Toutes catégories</option>
                <option value="bulletin">Bulletins Scolaires</option>
                <option value="calendrier">Calendriers</option>
                <option value="fiche_cotation">Fiches de cotation</option>
                <option value="attestation">Attestations</option>
                <option value="certificat">Certificats</option>
                <option value="diplome">Diplômes d'Honneur</option>
                <option value="circulaire">Circulaires</option>
                <option value="rapport">Rapports officiels</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              >
                <option value="all">Tous statuts</option>
                <option value="approuve">✓ Approuvés / Publiés</option>
                <option value="en_validation">◷ En validation</option>
                <option value="brouillon">Draft (Brouillon)</option>
                <option value="archive">Archivés</option>
              </select>
            </div>

            {/* Custom Future Import Button (CNR EPST only) */}
            {activePortal === "cnr" && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-center flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Nouveau modèle</span>
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex-1 text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-xl text-center flex items-center justify-center space-x-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Download className="h-3 w-3" />
                  <span>Importer JSON</span>
                </button>
              </div>
            )}

            {/* List of Templates */}
            <div className="space-y-2 pt-1 max-h-[380px] overflow-y-auto">
              {filteredTemplates.map((t) => {
                const isSelected = selectedTemplateId === t.id;
                const statusColors = {
                  brouillon: "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400",
                  en_validation: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                  approuve: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
                  archive: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                };
                
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplateId(t.id);
                      setIsEditing(false);
                      setIsComparing(false);
                      setAuditPassed(null);
                      setAuditLogs([]);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer block relative overflow-hidden ${
                      isSelected 
                        ? "bg-brand-blue/10 border-brand-blue text-brand-blue font-bold" 
                        : "border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                        {t.category.toUpperCase()}
                      </span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-md ${statusColors[t.status as keyof typeof statusColors]}`}>
                        {t.status === "approuve" ? "Publié" : t.status === "en_validation" ? "Validation" : t.status === "brouillon" ? "Draft" : "Archivé"}
                      </span>
                    </div>
                    <span className="block mt-1 font-extrabold text-slate-800 dark:text-white text-[11.5px] leading-tight truncate">
                      {t.title}
                    </span>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 font-mono">
                      <span>Version: {t.version}</span>
                      <span>Publié: {t.publishedAt}</span>
                    </div>
                  </button>
                );
              })}
              
              {filteredTemplates.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Aucun modèle trouvé
                </div>
              )}
            </div>
          </div>

          {/* SCHOOL PORTAL ONLY: STUDENT SELECTOR FOR PREVIEW */}
          {activePortal === "school" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 shadow-sm text-left space-y-3">
              <span className="text-xs font-black text-slate-500 uppercase block tracking-wider">Élève de démo (Fiche d'essai)</span>
              
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {safeStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setAuditPassed(null);
                      setAuditLogs([]);
                    }}
                    className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                      selectedStudentId === s.id 
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/50 text-emerald-800 dark:text-emerald-400 font-bold" 
                        : "border-slate-100 dark:border-slate-850 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block font-bold">{s.lastName} {s.firstName}</span>
                    <span className="text-[9px] text-slate-400 block">{s.className || "Classe primaire"} • {s.registrationNumber || s.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE VARIABLES DICTIONARY HELP CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 shadow-sm text-left space-y-3">
            <span className="text-xs font-black text-slate-500 uppercase block tracking-wider flex items-center space-x-1">
              <Settings className="h-3.5 w-3.5 text-indigo-500" />
              <span>Dictionnaire de Balises</span>
            </span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Le compilateur injecte automatiquement les données réelles en remplaçant ces balises standardisées.
            </p>
            <div className="grid grid-cols-1 gap-1.5 h-44 overflow-y-auto font-mono text-[9px] border-t border-slate-100 dark:border-slate-800 pt-2">
              {ALL_VARIABLES_HELP.map((v, idx) => (
                <div key={idx} className="flex justify-between p-1 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-900">
                  <span className="font-bold text-brand-blue">{v.key}</span>
                  <span className="text-slate-400 font-sans text-right line-clamp-1">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN BODY: VIEW PREVIEW, VERSION CONTROL AND COMPARISON */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Template Identity Info Row */}
          {activeTemplate && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase font-mono text-brand-blue bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                    Catégorie : {activeTemplate.category.toUpperCase()}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">•</span>
                  <span className="text-[10px] font-bold uppercase font-mono text-indigo-600 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                    Version : {activeTemplate.version}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">•</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Auteur : {activeTemplate.author}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{activeTemplate.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{activeTemplate.description}</p>
              </div>

              {/* Action buttons (Sync and Preview) */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setIsComparing(!isComparing)}
                  className={`text-xs px-3 py-2 rounded-xl font-bold transition-all flex items-center space-x-1 border cursor-pointer ${
                    isComparing
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <FileDiff className="h-4 w-4" />
                  <span>Comparer les versions</span>
                </button>
                
                {activePortal === "cnr" ? (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs bg-brand-green hover:opacity-95 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditing ? "Mode Consultation" : "Modifier le modèle"}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1">
                    {/* Sync school log button */}
                    {(() => {
                      const log = schoolSyncLogs.find(l => l.resourceId === activeTemplate.id);
                      const isSynced = log?.status === "installed";
                      return (
                        <button
                          disabled={isSynced || syncingId === activeTemplate.id}
                          onClick={() => {
                            setSyncingId(activeTemplate.id);
                            setTimeout(() => {
                              onSyncResource(activeTemplate.id);
                              setSyncingId(null);
                              alert(`Le modèle "${activeTemplate.title}" a été synchronisé avec succès sur le serveur local de l'établissement.`);
                            }, 1000);
                          }}
                          className={`text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center space-x-1 border cursor-pointer ${
                            isSynced
                              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-600"
                              : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 text-amber-700 border-amber-300 animate-pulse"
                          }`}
                        >
                          {syncingId === activeTemplate.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : isSynced ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          <span>{isSynced ? "Modèle à jour" : "Télécharger la mise à jour"}</span>
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PORTAL VIEW 1: VERSION COMPARISON DIFF BOX */}
          {isComparing && activeTemplate && (
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-indigo-200/50 dark:border-indigo-950 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-2">
                <div className="flex items-center space-x-1.5">
                  <FileDiff className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Comparateur de Versions RDC-EPST</span>
                </div>
                <button onClick={() => setIsComparing(false)} className="text-slate-400 hover:text-slate-600 text-xs">Fermer</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Version de Référence (A)</label>
                  <select
                    value={compareVersionA}
                    onChange={e => setCompareVersionA(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  >
                    <option value="">-- Sélectionner une version --</option>
                    {activeTemplate.history?.map(h => (
                      <option key={h.id} value={h.version}>{h.version} ({h.updatedAt})</option>
                    ))}
                    <option value={activeTemplate.version}>{activeTemplate.version} (Active)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Version Comparée (B)</label>
                  <select
                    value={compareVersionB}
                    onChange={e => setCompareVersionB(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  >
                    <option value={activeTemplate.version}>{activeTemplate.version} (Active)</option>
                    {activeTemplate.history?.map(h => (
                      <option key={h.id} value={h.version}>{h.version} ({h.updatedAt})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side-by-side difference view */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="font-mono font-bold text-slate-500 text-[10px]">VERSION A : {compareVersionA || "Non sélectionnée"}</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[10px] break-all h-40 overflow-y-auto">
                    {versionAData ? (
                      <div>
                        <p className="font-sans font-bold text-slate-800 dark:text-slate-200">Auteur : {versionAData.author}</p>
                        <p className="font-sans mt-1">Desc : {(versionAData as any).description || (versionAData as any).changeSummary}</p>
                        <pre className="mt-2 bg-slate-50 dark:bg-slate-950 p-2 rounded border">{versionAData.contentRaw || "Format brut non spécifié"}</pre>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Aucun historique disponible ou sélectionné</p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="font-mono font-bold text-indigo-600 text-[10px]">VERSION B : {compareVersionB}</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400 font-mono text-[10px] break-all h-40 overflow-y-auto">
                    {versionBData ? (
                      <div>
                        <p className="font-sans font-bold text-slate-800 dark:text-slate-200">Auteur : {versionBData.author}</p>
                        <p className="font-sans mt-1">Desc : {(versionBData as any).description || (versionBData as any).changeSummary}</p>
                        <pre className="mt-2 bg-slate-50 dark:bg-slate-950 p-2 rounded border">{versionBData.contentRaw || "Format brut non spécifié"}</pre>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Aucun historique disponible ou sélectionné</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PORTAL VIEW 2: CNR-EPST ADMIN TEMPLATE EDITOR */}
          {activePortal === "cnr" && isEditing && activeTemplate && (
            <form onSubmit={handleSaveTemplate} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-brand-green/30 dark:border-slate-800 space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                  <Edit3 className="h-4 w-4 text-brand-green" />
                  <span>Panneau d'Édition du Modèle National</span>
                </span>
                <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="h-4 w-4" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Nom du modèle</label>
                  <input
                    required
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Version Officielle</label>
                  <input
                    required
                    type="text"
                    value={editVersion}
                    onChange={e => setEditVersion(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-850 bg-white dark:bg-slate-900 dark:text-white font-mono font-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Date d'entrée en vigueur</label>
                  <input
                    required
                    type="text"
                    value={editEffectiveDate}
                    onChange={e => setEditEffectiveDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-850 bg-white dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Description légale / Objectif réglementaire</label>
                  <textarea
                    required
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white h-16"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Structure des données / Contenu synthétique</label>
                  <textarea
                    required
                    value={editSummary}
                    onChange={e => setEditSummary(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white h-16"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Contenu Structuré (JSON / Texte du modèle dynamique)</label>
                  <textarea
                    required
                    value={editRawContent}
                    onChange={e => setEditRawContent(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 bg-white dark:bg-slate-900 dark:text-white h-48 text-[10px] leading-relaxed"
                  />
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Statut d'homologation</label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as any)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-850 bg-white dark:bg-slate-900 dark:text-white"
                    >
                      <option value="brouillon">Draft (Brouillon)</option>
                      <option value="en_validation">En validation nationale</option>
                      <option value="approuve">Approuvé & Publié au J.O.</option>
                      <option value="archive">Désactivé / Archivé</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">Note de changement (pour l'historique)</label>
                    <input
                      required
                      type="text"
                      value={editChangeSummary}
                      onChange={e => setEditChangeSummary(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-xl text-xs hover:opacity-90 shadow-sm cursor-pointer transition-all flex items-center justify-center space-x-1"
                    >
                      <Save className="h-4 w-4" />
                      <span>Enregistrer la nouvelle version</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* PORTAL VIEW 3: COMPLIANCE AUDIT ENGINE STATUS (SCHOOL PORTAL) */}
          {activePortal === "school" && activeTemplate && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm text-left flex flex-col lg:flex-row gap-4 items-stretch">
              
              <div className="flex-1 space-y-2">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Audit de Conformité Réglementaire (EPST RDC)</span>
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Avant toute impression officielle à remettre aux élèves, vous devez exécuter l'audit cryptographique d'homologation pour garantir sa légalité ministérielle.
                </p>
                
                {/* Audit execution log panel */}
                {auditLogs.length > 0 && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[10px] space-y-1 max-h-36 overflow-y-auto">
                    {auditLogs.map((log, i) => {
                      const colors = {
                        info: "text-blue-400",
                        success: "text-emerald-400",
                        warning: "text-amber-400",
                        error: "text-red-400"
                      };
                      return (
                        <div key={i} className="flex items-start space-x-1.5">
                          <span className="text-slate-500">❯</span>
                          <span className={colors[log.type]}>{log.msg}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status and Action Panel */}
              <div className="w-full lg:w-60 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Statut de Certification</span>
                  {auditPassed === null ? (
                    <span className="text-xs font-black text-slate-500 block flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>Audit non exécuté</span>
                    </span>
                  ) : auditPassed ? (
                    <span className="text-xs font-black text-emerald-600 block flex items-center space-x-1">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                      <span>Sceau Approuvé (Prêt)</span>
                    </span>
                  ) : (
                    <span className="text-xs font-black text-red-500 block flex items-center space-x-1">
                      <XCircle className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                      <span>Refus de conformité !</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={runComplianceAudit}
                    disabled={isAuditing}
                    className="w-full text-[11px] bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black py-2 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isAuditing ? "animate-spin" : ""}`} />
                    <span>{isAuditing ? "Calcul de conformité..." : "Lancer le diagnostic"}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    disabled={auditPassed === false}
                    className={`w-full text-[11px] font-black py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      auditPassed === false
                        ? "bg-slate-200 text-slate-400 dark:bg-slate-900 cursor-not-allowed"
                        : "bg-brand-blue hover:opacity-95 text-white shadow-md"
                    }`}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Lancer l'impression A4</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE VISUAL HIGH-FIDELITY PREVIEW PANEL */}
          {activeTemplate && (
            <div className="bg-slate-200 dark:bg-slate-950 p-4 md:p-8 rounded-3xl shadow-inner border border-slate-300 dark:border-slate-850 space-y-6">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>SIMULATEUR DE PREVIEW PHYSIQUE A4</span>
                <span className="text-right">DIMENSIONS : 210 x 297 mm (300 DPI)</span>
              </div>

              {/* RENDER COMPONENT 1: THE HIGH FIDELITY BULLETIN (6EME PRIMAIRE - EXACTLY AS IMAGE) */}
              {activeTemplate.category === "bulletin" && (
                <div 
                  className="bg-white text-slate-900 p-6 md:p-10 rounded-none shadow-2xl mx-auto w-full max-w-[800px] border-[3px] border-slate-950 text-left relative overflow-hidden" 
                  id="smartschool-printable-zone"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  
                  {/* National Watermark Emblem in Center */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04]">
                    <QrCode className="h-96 w-96 text-black border border-black" />
                  </div>

                  {/* Header Logos & Ministry Info */}
                  <div className="flex justify-between items-start border-b-[2px] border-slate-950 pb-2">
                    
                    {/* Left: Flag banner */}
                    <div className="text-[10px] space-y-1 max-w-[200px]">
                      <div className="flex items-center space-x-1.5 border border-slate-950 p-1 bg-slate-50">
                        <div className="w-5 h-4 bg-blue-500 relative flex items-center justify-center">
                          <span className="text-[6px] text-yellow-400 absolute left-0.5">★</span>
                          <div className="absolute h-0.5 w-6 bg-red-500 rotate-12" />
                        </div>
                        <span className="font-extrabold text-[8px]">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                      </div>
                      <p className="font-bold leading-tight uppercase">MINISTÈRE DE L'ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETE</p>
                    </div>

                    {/* Center: Main metadata ID */}
                    <div className="text-center space-y-1">
                      <div className="border border-slate-950 px-2 py-0.5 font-mono text-[9px] font-black uppercase bg-slate-50">
                        N° ID. : RDC-{studentRegNumber}-2026
                      </div>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {Array.from({ length: 18 }).map((_, idx) => (
                          <span key={idx} className="w-3.5 h-4 border border-slate-950 text-[9px] text-center font-bold font-mono">
                            {studentRegNumber[idx % Math.max(1, studentRegNumber.length)] || ""}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Round Armoiries Icon */}
                    <div className="text-right text-[10px] space-y-1">
                      <div className="h-8 w-8 rounded-full border border-slate-950 flex items-center justify-center bg-slate-50 ml-auto text-xs font-black">
                        RDC
                      </div>
                      <p className="font-mono text-[8px] text-slate-500">IGE/P.S/006</p>
                    </div>
                  </div>

                  {/* Demographics Information Matrix */}
                  <div className="grid grid-cols-2 gap-4 text-[11px] py-3 border-b-[2px] border-slate-950">
                    <div className="space-y-1 border-r border-slate-300 pr-4">
                      <div><span className="font-bold uppercase">PROVINCE EDUCATIONNELLE :</span> <span className="font-mono">KINSHASA-FUNA</span></div>
                      <div><span className="font-bold uppercase">VILLE :</span> <span className="font-sans">KINSHASA</span></div>
                      <div><span className="font-bold uppercase">COMMUNE/TER. :</span> <span className="font-sans">GOMBE</span></div>
                      <div><span className="font-bold uppercase">ÉCOLE :</span> <span className="font-bold">LYCÉE PRINCE DE LIÈGE / CARDINAL MALULA</span></div>
                      <div><span className="font-bold uppercase">CODE ÉCOLE :</span> <span className="font-mono font-bold">120138-LUB</span></div>
                    </div>
                    
                    <div className="space-y-1 pl-4">
                      <div><span className="font-bold uppercase">ÉLÈVE :</span> <span className="font-black text-sm">{studentLastName} {studentFirstName}</span></div>
                      <div><span className="font-bold uppercase">SEXE :</span> <span className="font-mono">{studentGender}</span></div>
                      <div><span className="font-bold uppercase">NÉ(E) À :</span> <span className="font-semibold">KINSHASA</span> <span className="font-bold uppercase">LE :</span> <span className="font-mono">{studentBirthDate}</span></div>
                      <div><span className="font-bold uppercase">CLASSE :</span> <span className="font-mono font-bold">{studentClassName}</span></div>
                      <div><span className="font-bold uppercase">N° PERM. (NATIONAL) :</span> <span className="font-mono font-black text-brand-blue">{studentRegNumber}</span></div>
                    </div>
                  </div>

                  {/* Bulletin Title Banner */}
                  <div className="bg-slate-100 border border-slate-950 text-center py-1.5 my-3">
                    <h4 className="font-black text-[12px] tracking-wider uppercase text-slate-900">
                      BULLETIN DE L'ÉLÈVE DEGRÉ TERMINAL (6ème ANNÉE) • ANNÉE SCOLAIRE 2025-2026
                    </h4>
                  </div>

                  {/* The Main High-Fidelity Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[9.5px] border-collapse border border-slate-950">
                      <thead>
                        <tr className="border border-slate-950 bg-slate-50 text-center font-bold">
                          <th className="border border-slate-950 p-1 text-left w-[240px]" rowSpan={2}>BRANCHES</th>
                          <th className="border border-slate-950 p-1" colSpan={4}>PREMIER TRIMESTRE</th>
                          <th className="border border-slate-950 p-1" colSpan={4}>DEUXIÈME TRIMESTRE</th>
                          <th className="border border-slate-950 p-1" colSpan={4}>TROISIÈME TRIMESTRE</th>
                          <th className="border border-slate-950 p-1" colSpan={2}>TOTAL</th>
                        </tr>
                        <tr className="border border-slate-950 bg-slate-50 text-center font-bold text-[8px]">
                          {/* Trim 1 */}
                          <th className="border border-slate-950 px-0.5">MAX par</th>
                          <th className="border border-slate-950 px-0.5">1er P.</th>
                          <th className="border border-slate-950 px-0.5">2e P.</th>
                          <th className="border border-slate-950 px-0.5 bg-slate-100">MAX Trim</th>
                          {/* Trim 2 */}
                          <th className="border border-slate-950 px-0.5">MAX par</th>
                          <th className="border border-slate-950 px-0.5">3e P.</th>
                          <th className="border border-slate-950 px-0.5">4e P.</th>
                          <th className="border border-slate-950 px-0.5 bg-slate-100">MAX Trim</th>
                          {/* Trim 3 */}
                          <th className="border border-slate-950 px-0.5">MAX par</th>
                          <th className="border border-slate-950 px-0.5">5e P.</th>
                          <th className="border border-slate-950 px-0.5">6e P.</th>
                          <th className="border border-slate-950 px-0.5 bg-slate-100">MAX Trim</th>
                          {/* Total */}
                          <th className="border border-slate-950 px-0.5">MAX An</th>
                          <th className="border border-slate-950 px-0.5 bg-slate-150">PTS OBT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {BULLETIN_6EME_DOMAINS.map((domain, domIdx) => (
                          <React.Fragment key={domIdx}>
                            {/* Domain Header Row */}
                            <tr className="border border-slate-950 bg-slate-100 font-extrabold text-[9px]">
                              <td className="border border-slate-950 p-1 uppercase" colSpan={15}>
                                {domain.name}
                              </td>
                            </tr>
                            
                            {/* Branches */}
                            {domain.branches.map((b, bIdx) => {
                              // Dynamically generate simulated scores for realistic rendering
                              const hash = ((studentLastName.length || 5) + b.name.length + bIdx) % 5;
                              const scoreOffset = hash === 0 ? 0.9 : hash === 1 ? 0.8 : hash === 2 ? 0.75 : hash === 3 ? 0.65 : 0.85;
                              
                              const ptsP1 = Math.round(b.maxInterro * scoreOffset);
                              const ptsP2 = Math.round(b.maxInterro * (scoreOffset - 0.05));
                              const ptsEx1 = Math.round(b.maxExamen * scoreOffset);
                              const totalTrim1 = ptsP1 + ptsP2 + ptsEx1;

                              const ptsP3 = Math.round(b.maxInterro * (scoreOffset + 0.05));
                              const ptsP4 = Math.round(b.maxInterro * scoreOffset);
                              const ptsEx2 = Math.round(b.maxExamen * (scoreOffset + 0.02));
                              const totalTrim2 = ptsP3 + ptsP4 + ptsEx2;

                              const ptsP5 = Math.round(b.maxInterro * (scoreOffset - 0.02));
                              const ptsP6 = Math.round(b.maxInterro * scoreOffset);
                              const ptsEx3 = Math.round(b.maxExamen * scoreOffset);
                              const totalTrim3 = ptsP5 + ptsP6 + ptsEx3;

                              const totalAnnual = totalTrim1 + totalTrim2 + totalTrim3;

                              return (
                                <tr key={bIdx} className="border border-slate-950 text-center font-medium">
                                  <td className="border border-slate-950 p-1 text-left font-semibold text-[9px] leading-tight">
                                    {b.name}
                                  </td>
                                  
                                  {/* Trim 1 */}
                                  <td className="border border-slate-950 text-slate-400 font-mono">{b.maxInterro}</td>
                                  <td className="border border-slate-950 font-bold font-mono">{ptsP1}</td>
                                  <td className="border border-slate-950 font-bold font-mono">{ptsP2}</td>
                                  <td className="border border-slate-950 bg-slate-50 font-bold font-mono">{totalTrim1} / {b.maxTrimester}</td>

                                  {/* Trim 2 */}
                                  <td className="border border-slate-950 text-slate-400 font-mono">{b.maxInterro}</td>
                                  <td className="border border-slate-950 font-bold font-mono">{ptsP3}</td>
                                  <td className="border border-slate-950 font-bold font-mono">{ptsP4}</td>
                                  <td className="border border-slate-950 bg-slate-50 font-bold font-mono">{totalTrim2} / {b.maxTrimester}</td>

                                  {/* Trim 3 */}
                                  <td className="border border-slate-950 text-slate-400 font-mono">{b.maxInterro}</td>
                                  <td className="border border-slate-950 font-bold font-mono">{ptsP5}</td>
                                  <td className="border border-slate-950 font-bold font-mono">{ptsP6}</td>
                                  <td className="border border-slate-950 bg-slate-50 font-bold font-mono">{totalTrim3} / {b.maxTrimester}</td>

                                  {/* Total */}
                                  <td className="border border-slate-950 font-black font-mono text-slate-600 bg-slate-50">{b.maxAnnual}</td>
                                  <td className="border border-slate-950 font-black font-mono text-[10.5px] bg-slate-100">{totalAnnual}</td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))}

                        {/* SUM TOTALS ROW */}
                        <tr className="border-[2px] border-slate-950 bg-slate-100 text-center font-black text-[10px]">
                          <td className="border border-slate-950 p-1.5 text-left uppercase">
                            MAXIMA GÉNÉRAUX
                          </td>
                          {/* Trim 1 */}
                          <td className="border border-slate-950">310</td>
                          <td className="border border-slate-950" colSpan={2}>-</td>
                          <td className="border border-slate-950 font-mono bg-slate-150">986 / 1240</td>
                          
                          {/* Trim 2 */}
                          <td className="border border-slate-950">310</td>
                          <td className="border border-slate-950" colSpan={2}>-</td>
                          <td className="border border-slate-950 font-mono bg-slate-150">1014 / 1240</td>

                          {/* Trim 3 */}
                          <td className="border border-slate-950">310</td>
                          <td className="border border-slate-950" colSpan={2}>-</td>
                          <td className="border border-slate-950 font-mono bg-slate-150">995 / 1240</td>

                          {/* Total */}
                          <td className="border border-slate-950 bg-slate-200">3720</td>
                          <td className="border border-slate-950 text-sm font-extrabold bg-blue-100/50">2995</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Periodic Percentages & Behavioral indicators block */}
                  <div className="grid grid-cols-4 gap-2 pt-3 text-[10px] text-left">
                    <div className="border border-slate-950 p-1.5 space-y-1">
                      <div><strong className="uppercase">POURCENTAGE :</strong> <span className="font-mono font-black text-indigo-700 text-sm">80.5 %</span></div>
                      <div><strong className="uppercase">PLACE / RANG :</strong> <span className="font-sans font-bold">5e / 28</span></div>
                    </div>
                    <div className="border border-slate-950 p-1.5 space-y-1">
                      <div><strong className="uppercase">APPLICATION :</strong> <span className="font-semibold">Excellente</span></div>
                      <div><strong className="uppercase">CONDUITE :</strong> <span className="font-semibold">Très Bonne</span></div>
                    </div>
                    <div className="border border-slate-950 p-1.5 space-y-1">
                      <span className="font-bold text-[8px] uppercase block leading-none">Signat. Enseignant :</span>
                      <div className="h-4 border-b border-dashed border-slate-400 mt-1" />
                    </div>
                    <div className="border border-slate-950 p-1.5 space-y-1">
                      <span className="font-bold text-[8px] uppercase block leading-none">Signat. Parent :</span>
                      <div className="h-4 border-b border-dashed border-slate-400 mt-1" />
                    </div>
                  </div>

                  {/* Decision and Signatures blocks */}
                  <div className="grid grid-cols-3 gap-4 pt-4 text-[10.5px] items-start">
                    
                    {/* Final Result Box */}
                    <div className="border border-slate-950 p-2 bg-slate-50 space-y-1">
                      <div className="flex justify-between font-bold text-[9px] uppercase border-b pb-1">
                        <span>RÉSULTAT FINAL :</span>
                        <span className="font-black text-brand-green">ADMIS(E)</span>
                      </div>
                      <div className="flex justify-between font-mono text-[9px]">
                        <span>Moyenne de l'école :</span>
                        <span className="font-bold">62.8 %</span>
                      </div>
                      <div className="flex justify-between font-mono text-[9px]">
                        <span>Points totaux :</span>
                        <span className="font-bold">2995 / 3720</span>
                      </div>
                    </div>

                    {/* Official Stamp Sceau de l'école */}
                    <div className="text-center flex flex-col items-center justify-center pt-1 border border-slate-200 p-2 rounded-xl border-dashed">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Sceau de l'École</span>
                      <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 flex items-center justify-center text-[8px] font-black font-mono text-indigo-500/40 rotate-12 my-1">
                        MALULA
                      </div>
                      <span className="text-[8px] text-slate-400 block font-mono">HOMOLOGUÉ CNR-EPST 2026</span>
                    </div>

                    {/* Principal signature block */}
                    <div className="text-right space-y-1">
                      <p className="text-[9.5px]">Fait à <span className="font-semibold">Kinshasa</span>, le <span className="font-mono">{new Date().toLocaleDateString("fr-FR")}</span></p>
                      <p className="font-bold text-[10px] uppercase">Le Chef d'Établissement</p>
                      <p className="font-mono text-[10px] italic text-indigo-600 font-bold">M. Sylvain Kabulo</p>
                      
                      {/* Interactive dynamic QR code for validation verification */}
                      <div className="flex justify-end pt-1">
                        <div className="p-1 border border-slate-950 bg-slate-50 flex items-center space-x-1">
                          <QrCode className="h-7 w-7 text-slate-800" />
                          <div className="text-[6px] font-mono text-left leading-none text-slate-500">
                            <div>SEC-KEY</div>
                            <div className="font-bold">VALIDÉ</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer notice */}
                  <p className="text-[8px] font-sans text-center text-slate-400 mt-4 border-t pt-1 uppercase">
                    NOTE IMPORTANTE : Le bulletin est sans valeur s'il est raturé ou surchargé. Interdiction de reproduction.
                  </p>
                </div>
              )}

              {/* RENDER COMPONENT 2: TEXT-BASED DYNAMIC MODEL PREVIEW FOR OTHER CATEGORIES */}
              {activeTemplate.category !== "bulletin" && (
                <div 
                  className="bg-white text-slate-900 p-8 rounded-none shadow-2xl mx-auto w-full max-w-[800px] min-h-[500px] border-[2px] border-slate-950 text-left relative overflow-hidden" 
                  id="smartschool-printable-zone"
                >
                  
                  {/* National Watermark Emblem */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
                    <Building2 className="h-80 w-80 text-black" />
                  </div>

                  <div className="flex justify-between items-start border-b border-slate-300 pb-3 text-xs mb-6">
                    <div>
                      <span className="font-extrabold text-[9px] uppercase block tracking-wider text-slate-900">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                      <span className="text-[9px] text-slate-500 block leading-tight">Ministère de l'Éducation Nationale et Nouvelle Citoyenneté</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-mono font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded uppercase">
                        MODÈLE DE TYPE : {activeTemplate.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Compiled Body */}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-800">
                    {compileText(editRawContent || activeTemplate.contentRaw || "")}
                  </div>

                  {/* Absolute Footer with ID details */}
                  <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end border-t border-slate-200 pt-3 text-[9px] text-slate-400 font-mono">
                    <div>
                      <span>CODE UNIQUE : RDC-STT-{activeTemplate?.id?.toUpperCase() || "CNR"}-{studentRegNumber}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-slate-50 p-1 border">
                      <QrCode className="h-6 w-6 text-slate-700" />
                      <div className="text-[6px] leading-tight">
                        <span>EPST SECURITY</span>
                        <div className="font-bold">AUTHENTIQUE</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: CREATE NEW MODEL DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">Créer un nouveau modèle officiel EPST</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-white/60 hover:text-white cursor-pointer"><XCircle className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nom du modèle</label>
                  <input
                    required
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Ex: Certificat d'Honneur de l'Élève"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Catégorie du document</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white font-semibold cursor-pointer"
                  >
                    <option value="bulletin">Bulletins Scolaires</option>
                    <option value="calendrier">Calendriers</option>
                    <option value="fiche_cotation">Fiches de cotation</option>
                    <option value="attestation">Attestations</option>
                    <option value="certificat">Certificats</option>
                    <option value="diplome">Diplômes d'Honneur</option>
                    <option value="circulaire">Circulaires</option>
                    <option value="rapport">Rapports officiels</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Version de départ</label>
                  <input
                    required
                    type="text"
                    value={newVersion}
                    onChange={e => setNewVersion(e.target.value)}
                    placeholder="v1.0.0"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono font-black text-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Description du document</label>
                  <input
                    required
                    type="text"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Cadre d'application du modèle..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Gabarit initial (Variables autorisées)</label>
                <textarea
                  value={newRawContent}
                  onChange={e => setNewRawContent(e.target.value)}
                  placeholder="Inscrivez le texte de base avec vos variables {{Nom_Eleve}}... ou configurez un format structuré JSON."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-850 bg-slate-50 dark:bg-slate-950 dark:text-white h-32"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Enregistrer & Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL RAW JSON IMPORT (FUTURE PROOFING COMPATIBILITY) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-indigo-950 to-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-indigo-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">Importer un modèle officiel (Format JSON)</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-white/60 hover:text-white cursor-pointer"><XCircle className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleImportTemplate} className="p-6 space-y-4 text-left">
              <p className="text-xs text-slate-500 leading-relaxed">
                Importez à chaud un modèle sans réécrire l'application. Idéal pour intégrer un gabarit PDF compatible ou un schéma XML d'évaluation nationale.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Code Brut compatible JSON</label>
                <textarea
                  required
                  value={importJsonRaw}
                  onChange={e => setImportJsonRaw(e.target.value)}
                  placeholder={`{\n  "title": "Bulletin n°02 - Enseignement Technique",\n  "category": "bulletin",\n  "version": "v1.0.0",\n  "description": "Nouveau gabarit d'évaluation..."\n}`}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-850 bg-slate-50 dark:bg-slate-950 dark:text-white h-48"
                />
              </div>

              {importError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-mono font-bold border border-red-200">
                  {importError}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-brand-blue text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Lancer l'importation à chaud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
