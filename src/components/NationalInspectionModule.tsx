import React, { useState, useMemo } from "react";
import {
  Building,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Globe,
  UserCheck,
  Users,
  GraduationCap,
  Award,
  FileText,
  Printer,
  Download,
  Plus,
  Eye,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Send,
  BarChart3,
  PieChart,
  Activity,
  Briefcase,
  ChevronRight,
  X,
  Landmark,
  Fingerprint,
  BadgeAlert,
  Sparkles,
  FileSpreadsheet,
  Camera
} from "lucide-react";
import { School, Student, Teacher, ClassRoom } from "../types";

interface CircularItem {
  id: string;
  code: string;
  title: string;
  targetAudience: string;
  category: "Pédagogique" | "Administrative" | "Financière" | "Calendrier" | "Sanctions";
  publishDate: string;
  author: string;
  content: string;
  status: "Publié" | "Brouillon" | "Archivé";
  urgency: "Normale" | "Urgente" | "Impérative";
}

interface InspectionMission {
  id: string;
  codeMission: string;
  schoolId: string;
  schoolName: string;
  province: string;
  inspectorName: string;
  type: "Contrôle Administratif" | "Audit Pédagogique" | "Inspection Thématique" | "Vérification Fiche E01" | "Contrôle Gratuité";
  scheduledDate: string;
  status: "Programmée" | "En cours" | "Rapport Déposé" | "Clôturée" | "Avertissement Émis";
  objectives: string;
  notes?: string;
}

interface InspectionCorrectionRequest {
  id: string;
  schoolId: string;
  schoolName: string;
  type: "Régularisation E01" | "Gratuité du Primaire" | "Mise à jour Fiche Enseignants" | "Conformité Option" | "Sécurité Bâtiment";
  sentDate: string;
  deadline: string;
  status: "Transmis" | "En cours par l'école" | "Régularisé" | "En retard";
  details: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  targetSchool: string;
  ipAddress: string;
  status: "AUTORISÉ" | "BLOQUÉ";
}

export function NationalInspectionModule({
  userRole = "Inspection Générale",
  userName = "Inspecteur Général EPST",
  userProvince = "Kinshasa",
  schools = [],
  students = [],
  teachers = [],
  classes = [],
  cnrResources = [],
  onAddCnrResource,
  onUpdateCnrResource,
  lang = "fr"
}: {
  userRole?: string;
  userName?: string;
  userProvince?: string;
  schools?: School[];
  students?: Student[];
  teachers?: Teacher[];
  classes?: ClassRoom[];
  cnrResources?: any[];
  onAddCnrResource?: (res: any) => void;
  onUpdateCnrResource?: (res: any) => void;
  lang?: string;
}) {
  const isProvincial = userRole.toUpperCase().includes("PROVINCIALE") || userRole.toUpperCase().includes("PROVINCIAL");
  const isEPSTAdmin = userRole.toUpperCase().includes("EPST") || userRole.toUpperCase().includes("NATIONAL");

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    "registre" | "statistiques" | "circulaires" | "missions" | "rapports_e01" | "audit"
  >("registre");

  // Filter States for Register
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>(
    isProvincial ? userProvince : "Toutes"
  );
  const [typeFilter, setTypeFilter] = useState<string>("Tous");
  const [statusFilter, setStatusFilter] = useState<string>("Tous");

  // Selected School for Supervision Modal
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolModalTab, setSchoolModalTab] = useState<
    "identite" | "stats" | "historique" | "carte" | "actions"
  >("identite");

  // Modal State for New Inspection Mission
  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [missionTargetSchoolId, setMissionTargetSchoolId] = useState<string>("");
  const [missionType, setMissionType] = useState<InspectionMission["type"]>("Audit Pédagogique");
  const [missionDate, setMissionDate] = useState("");
  const [missionObjectives, setMissionObjectives] = useState("");
  const [missionInspector, setMissionInspector] = useState(userName);

  // Modal State for Correction Request
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionSchoolId, setCorrectionSchoolId] = useState<string>("");
  const [correctionType, setCorrectionType] = useState<InspectionCorrectionRequest["type"]>("Régularisation E01");
  const [correctionDeadline, setCorrectionDeadline] = useState("");
  const [correctionDetails, setCorrectionDetails] = useState("");

  // Modal State for New Circular (EPST Admin / Inspection Générale)
  const [showNewCircularModal, setShowNewCircularModal] = useState(false);
  const [circTitle, setCircTitle] = useState("");
  const [circAudience, setCircAudience] = useState("Toutes les écoles de RDC");
  const [circCategory, setCircCategory] = useState<CircularItem["category"]>("Administrative");
  const [circUrgency, setCircUrgency] = useState<CircularItem["urgency"]>("Normale");
  const [circContent, setCircContent] = useState("");

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const triggerToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Mock Circulars
  const [circulars, setCirculars] = useState<CircularItem[]>([
    {
      id: "CIRC-2026-001",
      code: "MINEPST/IG/001/2026",
      title: "Rappel Strict sur la Gratuité de l'Enseignement Primaire Public en RDC",
      targetAudience: "Directeurs d'Écoles Primaires Publiques & Conventionnées",
      category: "Administrative",
      publishDate: "2026-01-15",
      author: "Inspection Générale EPST",
      content: "Conformément à la Constitution de la RDC et aux instructions ministérielles, aucun frais de minerval, d'inscription, de bulletin ou de construction ne doit être exigé des parents d'élèves du cycle primaire dans les établissements publics et conventionnés.",
      status: "Publié",
      urgency: "Impérative"
    },
    {
      id: "CIRC-2026-002",
      code: "MINEPST/IG/002/2026",
      title: "Directive Relative à l'Homologation des Options Techniques et Professionnelles",
      targetAudience: "Promoteurs & Préfets des Écoles Secondaires",
      category: "Pédagogique",
      publishDate: "2026-02-10",
      author: "Ministère de l'Éducation Nationale EPST",
      content: "Toutes les options techniques (Électricité, Mécanique, Commerciale & Gestion, Agronomie) ouvertes sans arrêté d'homologation préalable de l'Inspection Générale doivent soumettre leur dossier de régularisation avant le 30 avril 2026.",
      status: "Publié",
      urgency: "Normale"
    },
    {
      id: "CIRC-2026-003",
      code: "MINEPST/IG/003/2026",
      title: "Calendrier des Épreuves d'État (ENAFEP & Examen d'État 2026)",
      targetAudience: "Tous les Établissements Scolaires de RDC",
      category: "Calendrier",
      publishDate: "2026-03-01",
      author: "Inspection Générale EPST",
      content: "Le déroulement des épreuves hors-session de l'Examen d'État aura lieu du 18 au 23 mai 2026. L'ENAFEP (Cycle Primaire) est fixé aux 04 et 05 juin 2026.",
      status: "Publié",
      urgency: "Urgente"
    }
  ]);

  // Mock Inspection Missions
  const [missions, setMissions] = useState<InspectionMission[]>([
    {
      id: "MIS-001",
      codeMission: "INSP-KIN-2026-089",
      schoolId: schools[0]?.id || "default",
      schoolName: schools[0]?.name || "Complexe Scolaire Lumumba",
      province: schools[0]?.province || "Kinshasa",
      inspectorName: "Inspecteur Proved Kin-Gombe",
      type: "Vérification Fiche E01",
      scheduledDate: "2026-08-20",
      status: "Programmée",
      objectives: "Vérification de la conformité des effectifs déclarés par classe et contrôle de la grille horaire officielle.",
      notes: "Mission programmée suite au dépôt initial de la fiche E01."
    },
    {
      id: "MIS-002",
      codeMission: "INSP-KAT-2026-042",
      schoolId: "sch_katanga_1",
      schoolName: "Institut Technique de Lubumbashi",
      province: "Haut-Katanga",
      inspectorName: "Inspecteur Mbuyi Jean",
      type: "Audit Pédagogique",
      scheduledDate: "2026-08-12",
      status: "Rapport Déposé",
      objectives: "Inspection des laboratoires d'électricité et qualification des corps enseignants.",
      notes: "Laboratoires conformes à 85%. Recommandation d'acquisition de 2 oscilloscopes supplémentaires."
    }
  ]);

  // Mock Correction Requests
  const [corrections, setCorrections] = useState<InspectionCorrectionRequest[]>([
    {
      id: "COR-001",
      schoolId: schools[0]?.id || "default",
      schoolName: schools[0]?.name || "Complexe Scolaire Lumumba",
      type: "Régularisation E01",
      sentDate: "2026-07-10",
      deadline: "2026-08-30",
      status: "Transmis",
      details: "Mise en conformité du nombre d'enseignants certifiés inscrits sur le registre central du Ministère."
    }
  ]);

  // Mock Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: "LOG-1001",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      userName,
      userRole,
      action: "Consultation du Registre National des Établissements",
      targetSchool: "Ressort Global RDC",
      ipAddress: "197.234.221.12",
      status: "AUTORISÉ"
    },
    {
      id: "LOG-1002",
      timestamp: new Date(Date.now() - 3600000).toISOString().replace("T", " ").substring(0, 19),
      userName: "Utilisateur Externe Non Qualifié",
      userRole: "Directeur Établissement A",
      action: "Tentative d'accès au Centre de Contrôle du Propriétaire",
      targetSchool: "SmartSchool RDC System",
      ipAddress: "105.28.44.190",
      status: "BLOQUÉ"
    }
  ]);

  // Filtered Schools according to role (Provincial vs National) and filters
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      // 1. Provincial Scope Enforcement
      if (isProvincial && userProvince) {
        const schoolProv = (school.province || school.provinceEducationnelle || "").toLowerCase();
        const userProvLower = userProvince.toLowerCase();
        if (!schoolProv.includes(userProvLower) && !userProvLower.includes(schoolProv)) {
          return false;
        }
      } else if (selectedProvinceFilter !== "Toutes") {
        const schoolProv = (school.province || school.provinceEducationnelle || "").toLowerCase();
        if (!schoolProv.includes(selectedProvinceFilter.toLowerCase())) {
          return false;
        }
      }

      // 2. Search Query (Name, Code National, City, Commune)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = school.name.toLowerCase().includes(q);
        const matchCode = (school.codeNational || "").toLowerCase().includes(q);
        const matchCity = (school.ville || "").toLowerCase().includes(q);
        const matchCommune = (school.commune || "").toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCity && !matchCommune) {
          return false;
        }
      }

      // 3. Type Filter
      if (typeFilter !== "Tous") {
        if ((school.type || "Privé") !== typeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [schools, isProvincial, userProvince, selectedProvinceFilter, searchQuery, typeFilter]);

  // Helper to compute aggregated stats for a school cleanly without student/teacher individual records
  const getAggregatedSchoolStats = (school: School) => {
    // School-filtered count approximations
    const schoolStudents = students.filter(s => s.schoolId === school.id || (!s.schoolId && school.id === "default"));
    const totalStudentsCount = schoolStudents.length > 0 ? schoolStudents.length : 420;
    
    // Male / Female parity
    const boysCount = schoolStudents.filter(s => (s.gender as string) === "M" || (s.gender as string) === "G").length || Math.round(totalStudentsCount * 0.52);
    const girlsCount = totalStudentsCount - boysCount;

    const schoolTeachers = teachers.filter(t => t.schoolId === school.id || (!t.schoolId && school.id === "default"));
    const totalTeachersCount = schoolTeachers.length > 0 ? schoolTeachers.length : 24;

    const totalClassesCount = school.classes ? school.classes.length : (classes.length > 0 ? classes.length : 14);
    const optionsCount = school.options ? school.options.length : 3;

    return {
      totalStudentsCount,
      boysCount,
      girlsCount,
      totalTeachersCount,
      totalAdminStaffCount: Math.round(totalTeachersCount * 0.25) || 5,
      totalClassesCount,
      optionsCount,
      finalistsCount: Math.round(totalStudentsCount * 0.18) || 68,
      globalPassRate: 88.5,
      globalAttendanceRate: 94.2,
      classroomsCount: totalClassesCount + 2,
      buildingsCount: 3
    };
  };

  // National / Provincial Global Statistics
  const totalSchoolsInScope = filteredSchools.length;
  const globalStudentsEstimate = filteredSchools.reduce((acc, sch) => acc + getAggregatedSchoolStats(sch).totalStudentsCount, 0);
  const globalTeachersEstimate = filteredSchools.reduce((acc, sch) => acc + getAggregatedSchoolStats(sch).totalTeachersCount, 0);

  // Handle Schedule Mission
  const handleScheduleMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTargetSchoolId || !missionDate || !missionObjectives) {
      triggerToast("Veuillez remplir tous les champs obligatoires pour la mission.", "error");
      return;
    }
    const targetSch = schools.find(s => s.id === missionTargetSchoolId) || schools[0];
    const newMission: InspectionMission = {
      id: "MIS-" + Math.floor(1000 + Math.random() * 9000),
      codeMission: `INSP-${(targetSch?.province || "RDC").substring(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`,
      schoolId: targetSch.id,
      schoolName: targetSch.name,
      province: targetSch.province || "Kinshasa",
      inspectorName: missionInspector || userName,
      type: missionType,
      scheduledDate: missionDate,
      status: "Programmée",
      objectives: missionObjectives
    };

    setMissions(prev => [newMission, ...prev]);
    setShowNewMissionModal(false);
    setMissionObjectives("");
    triggerToast(`Mission d'inspection ${newMission.codeMission} programmée avec succès pour ${targetSch.name}.`, "success");

    // Add log
    setAuditLogs(prev => [
      {
        id: "LOG-" + Math.floor(2000 + Math.random() * 8000),
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        userName,
        userRole,
        action: `Programmation mission d'inspection (${missionType})`,
        targetSchool: targetSch.name,
        ipAddress: "197.234.221.12",
        status: "AUTORISÉ"
      },
      ...prev
    ]);
  };

  // Handle Send Correction Request
  const handleSendCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionSchoolId || !correctionDeadline || !correctionDetails) {
      triggerToast("Veuillez remplir tous les champs pour la demande de régularisation.", "error");
      return;
    }
    const targetSch = schools.find(s => s.id === correctionSchoolId) || schools[0];
    const newCorr: InspectionCorrectionRequest = {
      id: "COR-" + Math.floor(100 + Math.random() * 900),
      schoolId: targetSch.id,
      schoolName: targetSch.name,
      type: correctionType,
      sentDate: new Date().toISOString().split("T")[0],
      deadline: correctionDeadline,
      status: "Transmis",
      details: correctionDetails
    };

    setCorrections(prev => [newCorr, ...prev]);
    setShowCorrectionModal(false);
    setCorrectionDetails("");
    triggerToast(`Demande de correction officielle transmise à la direction de ${targetSch.name}.`, "success");
  };

  // Handle Publish Circular
  const handlePublishCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circTitle || !circContent) {
      triggerToast("Le titre et le contenu de la circulaire sont requis.", "error");
      return;
    }

    const newCirc: CircularItem = {
      id: "CIRC-2026-" + Math.floor(100 + Math.random() * 900),
      code: `MINEPST/IG/${Math.floor(100 + Math.random() * 900)}/2026`,
      title: circTitle,
      targetAudience: circAudience,
      category: circCategory,
      publishDate: new Date().toISOString().split("T")[0],
      author: userName,
      content: circContent,
      status: "Publié",
      urgency: circUrgency
    };

    setCirculars(prev => [newCirc, ...prev]);
    setShowNewCircularModal(false);
    setCircTitle("");
    setCircContent("");
    triggerToast(`Circulaire officielle "${newCirc.title}" publiée avec succès dans le registre CNR-EPST.`, "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center space-x-3 text-xs font-bold transition-all animate-bounce ${
            toastMessage.type === "error"
              ? "bg-red-900 text-white border-red-700"
              : toastMessage.type === "info"
              ? "bg-blue-900 text-white border-blue-700"
              : "bg-emerald-900 text-white border-emerald-700"
          }`}
        >
          {toastMessage.type === "error" ? (
            <ShieldAlert className="h-5 w-5 text-red-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER BANNER - OFFICIAL REGULATORY PORTAL */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Portail de Supervision Officiel EPSST</span>
              </span>
              {isProvincial ? (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Ressort Provincial : {userProvince}
                </span>
              ) : (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Juridiction Nationale (26 Provinces RDC)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase">
              {isProvincial
                ? `Inspection Provinciale de l'Éducation - ${userProvince}`
                : isEPSTAdmin
                ? "Secrétariat Général EPST - Direction Nationale des Registres"
                : "Inspection Générale de l'Éducation Nationale RDC"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Dispositif souverain de contrôle, régulation et agrégation statistique. Protection absolue du secret des données individuelles d&apos;établissements.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-3 justify-center items-start lg:items-end">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 space-y-1 text-right">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Inspecteur / Titulaire connecté</div>
              <div className="text-sm font-black text-amber-300 flex items-center justify-end space-x-2">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <span>{userName}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{userRole}</div>
            </div>

            <button
              onClick={() => {
                triggerToast("Exportation du rapport de couverture d'inspection généré au format officiel E01.", "info");
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Exporter Bilan National E01 (PDF)</span>
            </button>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Écoles Sous Supervision</div>
            <div className="text-xl font-black text-white">{totalSchoolsInScope}</div>
            <div className="text-[10px] text-emerald-400 font-medium">100% enregistrées CNR</div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Effectif Élèves Agrégé</div>
            <div className="text-xl font-black text-amber-300">~{globalStudentsEstimate.toLocaleString("fr-FR")}</div>
            <div className="text-[10px] text-slate-300 font-medium">Données anonymisées</div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Enseignants Recensés</div>
            <div className="text-xl font-black text-blue-300">~{globalTeachersEstimate.toLocaleString("fr-FR")}</div>
            <div className="text-[10px] text-slate-300 font-medium">Fiches matricules EPST</div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Missions d'Inspection</div>
            <div className="text-xl font-black text-purple-300">{missions.length}</div>
            <div className="text-[10px] text-purple-300 font-medium">{missions.filter(m => m.status === "Programmée").length} programmée(s)</div>
          </div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("registre")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === "registre"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Building className="h-4 w-4 text-indigo-500" />
          <span>Registre National des Établissements ({filteredSchools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("statistiques")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === "statistiques"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <BarChart3 className="h-4 w-4 text-amber-500" />
          <span>Statistiques Globales & Ratios</span>
        </button>

        <button
          onClick={() => setActiveTab("circulaires")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === "circulaires"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <FileText className="h-4 w-4 text-blue-500" />
          <span>Circulaires & Directives EPST ({circulars.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("missions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === "missions"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Missions d'Inspection ({missions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("rapports_e01")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === "rapports_e01"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4 text-purple-500" />
          <span>Rapports E01 & Bilans</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === "audit"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Clock className="h-4 w-4 text-rose-500" />
          <span>Journal d'Audit ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: REGISTRE NATIONAL DES ÉTABLISSEMENTS */}
      {activeTab === "registre" && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom d'école, Code National (RDC-KIN-...), ville, commune..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Province Filter */}
                {!isProvincial && (
                  <div className="flex items-center space-x-2">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={selectedProvinceFilter}
                      onChange={(e) => setSelectedProvinceFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                    >
                      <option value="Toutes">Toutes les Provinces (26)</option>
                      <option value="Kinshasa">Kinshasa</option>
                      <option value="Haut-Katanga">Haut-Katanga</option>
                      <option value="Kongo-Central">Kongo-Central</option>
                      <option value="Nord-Kivu">Nord-Kivu</option>
                      <option value="Sud-Kivu">Sud-Kivu</option>
                      <option value="Lualaba">Lualaba</option>
                      <option value="Tshopo">Tshopo</option>
                      <option value="Kasai-Central">Kasaï-Central</option>
                    </select>
                  </div>
                )}

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="Tous">Tous les Statuts (Public/Privé/Conv.)</option>
                  <option value="Public">Public (Gratuité du Primaire)</option>
                  <option value="Privé">Privé Aggréé</option>
                  <option value="Conventionné">Conventionné (Catholique/Prot...)</option>
                </select>

                <button
                  onClick={() => {
                    setShowNewMissionModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5 ml-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Programmer une Mission</span>
                </button>
              </div>
            </div>

            {/* Strict Notice banner on Privacy */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 flex items-center space-x-3 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>Supervision Officielle :</strong> Seules les fiches d&apos;identité administrative et les données statistiques globalisées sont affichées. Les dossiers nominatifs d&apos;élèves, enseignants, notes et paiements ne sont jamais exposés à l&apos;inspection.
              </span>
            </div>
          </div>

          {/* SCHOOL CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchools.map((school) => {
              const stats = getAggregatedSchoolStats(school);
              return (
                <div
                  key={school.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                          {school.logoUrl ? (
                            <img src={school.logoUrl} alt={school.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building className="h-6 w-6 text-indigo-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {school.name}
                          </h3>
                          <div className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-bold rounded mt-0.5">
                            Code: {school.codeNational || "RDC-KIN-10022"}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full shrink-0 ${
                          school.type === "Public"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                            : school.type === "Conventionné"
                            ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300"
                            : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300"
                        }`}
                      >
                        {school.type || "Privé"}
                      </span>
                    </div>

                    {/* Location & Contacts */}
                    <div className="bg-slate-50 dark:bg-slate-850/60 p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">
                          {school.province || "Kinshasa"} - {school.ville || "Kinshasa"}, {school.commune || "Gombe"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-[11px]">
                        <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{school.phonePrincipal || "+243 812 000 111"}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-[11px]">
                        <Mail className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{school.contactEmail || "direction@ecole.cd"}</span>
                      </div>
                    </div>

                    {/* Aggregated Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-100/80 dark:bg-slate-800/80 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Élèves</div>
                        <div className="font-black text-slate-900 dark:text-white">{stats.totalStudentsCount}</div>
                      </div>
                      <div className="bg-slate-100/80 dark:bg-slate-800/80 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Enseignants</div>
                        <div className="font-black text-slate-900 dark:text-white">{stats.totalTeachersCount}</div>
                      </div>
                      <div className="bg-slate-100/80 dark:bg-slate-800/80 p-2 rounded-lg">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Réussite</div>
                        <div className="font-black text-emerald-600 dark:text-emerald-400">{stats.globalPassRate}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Fiche E01 : Homologuée</span>

                    <button
                      onClick={() => {
                        setSelectedSchool(school);
                        setSchoolModalTab("identite");
                      }}
                      className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1 border border-indigo-200 dark:border-indigo-800"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Consulter la Fiche</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSchools.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <Building className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="font-black text-base text-slate-800 dark:text-slate-200 uppercase">Aucun établissement trouvé</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Aucune école ne correspond aux critères de recherche ou à la province sélectionnée.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STATISTIQUES GLOBALES & RATIOS */}
      {activeTab === "statistiques" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Bilan Synthétique & Ratios d&apos;Enseignement (EPST)
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Aggrégation nationale des données d&apos;effectifs, de parité et d&apos;infrastructure.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-300">
                Données Conformes RDC 2026
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Distribution Parité F/G */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs uppercase text-slate-700 dark:text-slate-200 flex items-center space-x-2">
                    <PieChart className="h-4 w-4 text-indigo-500" />
                    <span>Parité Garçons / Filles</span>
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Agrégé</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-blue-600 dark:text-blue-400">Garçons : 52%</span>
                    <span className="text-rose-600 dark:text-rose-400">Filles : 48%</span>
                  </div>
                  <div className="w-full bg-rose-200 dark:bg-rose-950 rounded-full h-3 overflow-hidden flex">
                    <div className="bg-blue-600 h-full" style={{ width: "52%" }} />
                    <div className="bg-rose-500 h-full" style={{ width: "48%" }} />
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Indice de parité de genre conforme aux objectifs ministériels de scolarisation universelle.
                  </p>
                </div>
              </div>

              {/* Card 2: Ratio Élèves / Enseignant */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs uppercase text-slate-700 dark:text-slate-200 flex items-center space-x-2">
                    <Users className="h-4 w-4 text-emerald-500" />
                    <span>Ratio Élèves par Enseignant</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Norme UNESCO</span>
                </div>

                <div className="space-y-2">
                  <div className="text-3xl font-black text-slate-900 dark:text-white">1 : 35</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Moyenne nationale observée : 35 élèves par enseignant qualifié.
                  </p>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Conforme aux normes de charge pédagogique</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Taux de Réussite Examen d'État */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs uppercase text-slate-700 dark:text-slate-200 flex items-center space-x-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span>Taux Global de Réussite</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Session 2025</span>
                </div>

                <div className="space-y-2">
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400">88.5 %</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Pourcentage moyen de réussite sur le sous-ensemble des écoles homologuées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CIRCULAIRES & DIRECTIVES OFFICIELLES */}
      {activeTab === "circulaires" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Registre des Circulaires & Directives Ministérielles (CNR-EPST)
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Publication officielle des instructions exécutoires adressées aux établissements scolaires.
                </p>
              </div>

              {(isEPSTAdmin || !isProvincial) && (
                <button
                  onClick={() => setShowNewCircularModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publier une Nouvelle Circulaire</span>
                </button>
              )}
            </div>

            {/* Circulars List */}
            <div className="space-y-4">
              {circulars.map((circ) => (
                <div
                  key={circ.id}
                  className="p-5 bg-slate-50 dark:bg-slate-850/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[10px] font-black rounded border border-blue-300">
                        {circ.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                          circ.urgency === "Impérative"
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : circ.urgency === "Urgente"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Urgence : {circ.urgency}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">Publié le {circ.publishDate}</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white">{circ.title}</h3>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {circ.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                    <div className="flex items-center space-x-4">
                      <span>Destinataires : <strong className="text-slate-800 dark:text-slate-200">{circ.targetAudience}</strong></span>
                      <span>Auteur : <strong className="text-indigo-600 dark:text-indigo-400">{circ.author}</strong></span>
                    </div>

                    <button
                      onClick={() => triggerToast(`Téléchargement de la circulaire certifiée ${circ.code}.`, "info")}
                      className="px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Télécharger PDF Officiel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MISSIONS D'INSPECTION */}
      {activeTab === "missions" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Missions & Ordres de Service d&apos;Inspection sur le Terrain
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Programmation et suivi des vérifications administratives, pédagogiques et financières.
                </p>
              </div>

              <button
                onClick={() => setShowNewMissionModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Programmer une Mission</span>
              </button>
            </div>

            <div className="space-y-4">
              {missions.map((m) => (
                <div
                  key={m.id}
                  className="p-5 bg-slate-50 dark:bg-slate-850/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-black rounded border border-emerald-300">
                        {m.codeMission}
                      </span>
                      <span className="font-black text-sm text-slate-900 dark:text-white">{m.schoolName}</span>
                      <span className="text-xs text-slate-500">({m.province})</span>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs font-black rounded-full ${
                        m.status === "Programmée"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : m.status === "Rapport Déposé"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500 font-mono">
                      <span>Type de mission : <strong className="text-slate-800 dark:text-slate-200">{m.type}</strong></span>
                      <span>Date prévue : <strong className="text-slate-800 dark:text-slate-200">{m.scheduledDate}</strong></span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      <strong>Objectifs :</strong> {m.objectives}
                    </p>
                    {m.notes && (
                      <p className="text-slate-500 italic text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                        Notes d&apos;observation : {m.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Inspecteur désigné : <strong className="text-indigo-600 dark:text-indigo-400">{m.inspectorName}</strong></span>

                    <button
                      onClick={() => triggerToast(`Impression de l'ordre de mission officiel ${m.codeMission}.`, "info")}
                      className="px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Imprimer Ordre de Mission</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RAPPORTS E01 & BILANS */}
      {activeTab === "rapports_e01" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Génération Centralisée des Fiches Officielles E01 (EPST)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Compilation automatique des fiches de statistiques officielles certifiées pour archivage ministériel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">Fiche Synthétique E01 - Province</h3>
                    <p className="text-xs text-slate-500">Rapport de couverture globale des établissements enregistrés.</p>
                  </div>
                </div>
                <button
                  onClick={() => triggerToast("Fiche E01 provinciale générée et téléchargée.", "success")}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Télécharger Fiche E01 Provinciale (.pdf)</span>
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">Annuaire Statistique National</h3>
                    <p className="text-xs text-slate-500">Tableau récapitulatif des effectifs et infrastructures RDC 2026.</p>
                  </div>
                </div>
                <button
                  onClick={() => triggerToast("Annuaire statistique national prêt au téléchargement.", "success")}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Télécharger Annuaire Statistique (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: JOURNAL D'AUDIT */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Journal d&apos;Audit Cryptographique de Supervision
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Traçabilité inaltérable des requêtes de consultation et verrouillages d&apos;accès.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Horodatage</th>
                    <th className="pb-3">Utilisateur</th>
                    <th className="pb-3">Rôle</th>
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Cible</th>
                    <th className="pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                      <td className="py-3 text-slate-500">{log.timestamp}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{log.userName}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{log.userRole}</td>
                      <td className="py-3 text-slate-800 dark:text-slate-200">{log.action}</td>
                      <td className="py-3 text-slate-500">{log.targetSchool}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            log.status === "AUTORISÉ"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAILED SCHOOL SUPERVISION CARD (FICHE D'UNE ÉCOLE) */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedSchool(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* School Modal Header */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 overflow-hidden shrink-0">
                {selectedSchool.logoUrl ? (
                  <img src={selectedSchool.logoUrl} alt={selectedSchool.name} className="w-full h-full object-contain" />
                ) : (
                  <Building className="h-8 w-8 text-indigo-500" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold rounded">
                    Code: {selectedSchool.codeNational || "RDC-KIN-10022"}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded uppercase">
                    Statut : {selectedSchool.type || "Privé Aggréé"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase">
                  {selectedSchool.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedSchool.province || "Kinshasa"} • {selectedSchool.ville || "Kinshasa"}, {selectedSchool.commune || "Gombe"}
                </p>
              </div>
            </div>

            {/* Modal Nav Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setSchoolModalTab("identite")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  schoolModalTab === "identite"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                1. Identité & Direction
              </button>
              <button
                onClick={() => setSchoolModalTab("stats")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  schoolModalTab === "stats"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                2. Statistiques Globales
              </button>
              <button
                onClick={() => setSchoolModalTab("historique")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  schoolModalTab === "historique"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                3. Historique Administratif
              </button>
              <button
                onClick={() => setSchoolModalTab("actions")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  schoolModalTab === "actions"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                4. Régulation & Injonctions
              </button>
            </div>

            {/* Modal Body */}
            {schoolModalTab === "identite" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Promoteur / Entité Fondatrice :</span>
                    <div className="font-extrabold text-slate-900 dark:text-white">M. le Promoteur Référent</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Chef d&apos;Établissement (Préfet / Directeur) :</span>
                    <div className="font-extrabold text-slate-900 dark:text-white">M. le Directeur Général</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Téléphone Principal :</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{selectedSchool.phonePrincipal || "+243 812 000 111"}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Email de Contact Officiel :</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{selectedSchool.contactEmail || "contact@ecole.cd"}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Adresse Physique Complète :</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedSchool.adresseComplete || "Avenue de la Justice, Gombe, Kinshasa, RDC"}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200/60 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                  <strong>Périmètre du Secret Professionnel :</strong> Conformément aux règles d&apos;inspection EPST, aucun dossier d&apos;élève ou d&apos;enseignant n&apos;est accessible dans cette vue.
                </div>
              </div>
            )}

            {schoolModalTab === "stats" && (
              <div className="space-y-4 text-xs">
                {(() => {
                  const stats = getAggregatedSchoolStats(selectedSchool);
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Total Élèves</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalStudentsCount}</div>
                        <div className="text-[10px] text-slate-500">{stats.boysCount} Garçons / {stats.girlsCount} Filles</div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Enseignants</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalTeachersCount}</div>
                        <div className="text-[10px] text-slate-500">Duplicata matricules</div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Classes / Salles</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalClassesCount}</div>
                        <div className="text-[10px] text-slate-500">{stats.classroomsCount} Salles physiques</div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Taux Réussite</div>
                        <div className="text-xl font-black text-emerald-600">{stats.globalPassRate}%</div>
                        <div className="text-[10px] text-slate-500">{stats.finalistsCount} Finalistes Exétat</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {schoolModalTab === "historique" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Arrêté Ministériel d&apos;Homologation #MINEPST/CABMIN/2022-045</div>
                  <div className="text-slate-500">Délivré le 14 Septembre 2022 par le Ministère de l&apos;Éducation Nationale EPST.</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Dernière Mission d&apos;Inspection Pédagogique</div>
                  <div className="text-slate-500">Effectuée le 12 Février 2026 • Avis : Très Favorable avec félicitations.</div>
                </div>
              </div>
            )}

            {schoolModalTab === "actions" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setMissionTargetSchoolId(selectedSchool.id);
                      setSelectedSchool(null);
                      setShowNewMissionModal(true);
                    }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-left space-y-1 cursor-pointer transition-all"
                  >
                    <div className="font-black text-emerald-800 dark:text-emerald-300 flex items-center space-x-1">
                      <Plus className="h-4 w-4" />
                      <span>Programmer une Mission sur le Terrain</span>
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                      Émettre un ordre de mission officiel pour contrôle des registres ou des locaux.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setCorrectionSchoolId(selectedSchool.id);
                      setSelectedSchool(null);
                      setShowCorrectionModal(true);
                    }}
                    className="p-4 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 rounded-2xl text-left space-y-1 cursor-pointer transition-all"
                  >
                    <div className="font-black text-amber-800 dark:text-amber-300 flex items-center space-x-1">
                      <Send className="h-4 w-4" />
                      <span>Envoyer une Demande de Régularisation</span>
                    </div>
                    <p className="text-amber-700 dark:text-amber-400 text-[11px]">
                      Notifier formellement la direction pour mise en conformité administrative.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSchool(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROGRAMMER UNE MISSION D'INSPECTION */}
      {showNewMissionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowNewMissionModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">
                Nouvelle Mission d&apos;Inspection
              </h3>
              <p className="text-xs text-slate-500">
                Établissement d&apos;un ordre de service exécutoire.
              </p>
            </div>

            <form onSubmit={handleScheduleMission} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Établissement Scolaire Cible *
                </label>
                <select
                  value={missionTargetSchoolId}
                  onChange={(e) => setMissionTargetSchoolId(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  required
                >
                  <option value="">-- Sélectionner une école --</option>
                  {filteredSchools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.province || "Kinshasa"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Type de Mission *
                </label>
                <select
                  value={missionType}
                  onChange={(e) => setMissionType(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="Audit Pédagogique">Audit Pédagogique</option>
                  <option value="Contrôle Administratif">Contrôle Administratif</option>
                  <option value="Vérification Fiche E01">Vérification Fiche E01</option>
                  <option value="Contrôle Gratuité">Contrôle Gratuité du Primaire</option>
                  <option value="Inspection Thématique">Inspection Thématique</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date Prévue d&apos;Intervention *
                </label>
                <input
                  type="date"
                  value={missionDate}
                  onChange={(e) => setMissionDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Objectifs Spécifiques de la Mission *
                </label>
                <textarea
                  value={missionObjectives}
                  onChange={(e) => setMissionObjectives(e.target.value)}
                  rows={3}
                  placeholder="Détaillez les points à vérifier lors de la visite d'inspection..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewMissionModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg"
                >
                  Confirmer et Valider Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOUVELLE CIRCULAIRE */}
      {showNewCircularModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowNewCircularModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">
                Publication d&apos;une Circulaire Officielle
              </h3>
              <p className="text-xs text-slate-500">
                Diffusion exécutoire dans le Registre National CNR-EPST.
              </p>
            </div>

            <form onSubmit={handlePublishCircular} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Titre de la Circulaire Ministérielle *
                </label>
                <input
                  type="text"
                  value={circTitle}
                  onChange={(e) => setCircTitle(e.target.value)}
                  placeholder="Ex: Instruction Générale relative aux examens de repêchage..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
                  <select
                    value={circCategory}
                    onChange={(e) => setCircCategory(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Administrative">Administrative</option>
                    <option value="Pédagogique">Pédagogique</option>
                    <option value="Calendrier">Calendrier</option>
                    <option value="Financière">Financière</option>
                    <option value="Sanctions">Sanctions</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Niveau d&apos;Urgence</label>
                  <select
                    value={circUrgency}
                    onChange={(e) => setCircUrgency(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Normale">Normale</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Impérative">Impérative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Public Cible
                </label>
                <input
                  type="text"
                  value={circAudience}
                  onChange={(e) => setCircAudience(e.target.value)}
                  placeholder="Ex: Directeurs d'écoles secondaires, Chefs d'établissements publics..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contenu / Directive Intégrale *
                </label>
                <textarea
                  value={circContent}
                  onChange={(e) => setCircContent(e.target.value)}
                  rows={4}
                  placeholder="Rédigez le texte officiel exécutoire..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewCircularModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-lg"
                >
                  Publier la Circulaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEMANDE DE CORRECTION */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowCorrectionModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">
                Demande de Régularisation Officielle
              </h3>
              <p className="text-xs text-slate-500">Injonction administrative transmise à la direction.</p>
            </div>

            <form onSubmit={handleSendCorrection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Type de régularisation</label>
                <select
                  value={correctionType}
                  onChange={(e) => setCorrectionType(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="Régularisation E01">Régularisation Fiche E01</option>
                  <option value="Gratuité du Primaire">Gratuité du Primaire</option>
                  <option value="Mise à jour Fiche Enseignants">Mise à jour Fiche Enseignants</option>
                  <option value="Conformité Option">Homologation d&apos;Option</option>
                  <option value="Sécurité Bâtiment">Sécurité des Bâtiments</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Délai Limite de Conformité *</label>
                <input
                  type="date"
                  value={correctionDeadline}
                  onChange={(e) => setCorrectionDeadline(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Injonctions & Précisions *</label>
                <textarea
                  value={correctionDetails}
                  onChange={(e) => setCorrectionDetails(e.target.value)}
                  rows={3}
                  placeholder="Inscrivez les motifs exacts du rappel à l'ordre..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-lg"
                >
                  Transmettre Injonction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
