import React, { useState } from "react";
import { 
  Employee, EmployeeAttendance, EmployeeLeave, EmployeePromotion, 
  EmployeeSanction, EmployeeEvaluation, EmployeeTraining, EmployeeMutation, 
  HrAuditLog, UserAccount 
} from "../types";
import { HrDashboard } from "./HrDashboard";
import { HrAddEmployee } from "./HrAddEmployee";
import { HrOrganigramme } from "./HrOrganigramme";
import { HrCartes } from "./HrCartes";
import { HrComptes } from "./HrComptes";
import { HrFunctionsManagement } from "./HrFunctionsManagement";
import { OfficialLoginSheetModal } from "./OfficialLoginSheetModal";
import { generateUniqueActivationCode } from "../services/accountActivationService";
import { 
  Briefcase, Users, UserCheck, Calendar, ShieldCheck, CheckCircle, 
  XCircle, Clock, ShieldAlert, Award, FileText, Plus, Search, Filter, 
  Edit3, Trash2, Printer, Eye, EyeOff, Check, X, QrCode, RefreshCw, 
  ChevronRight, Sparkles, UserPlus, UserMinus, FileBadge, ArrowLeft, AlertCircle,
  Activity, Settings, Key, MapPin, TrendingUp, AlertTriangle, BookOpen, Signature, Sliders
} from "lucide-react";

interface HrModuleViewProps {
  students?: any[];
  employees: Employee[];
  attendances: EmployeeAttendance[];
  leaves: EmployeeLeave[];
  promotions: EmployeePromotion[];
  sanctions: EmployeeSanction[];
  evaluations: EmployeeEvaluation[];
  trainings: EmployeeTraining[];
  mutations: EmployeeMutation[];
  auditLogs: HrAuditLog[];
  userRole: string;
  userName: string;
  onAddEmployee: (emp: Omit<Employee, "id" | "matricule" | "qrCodeData">) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onCreateUserAccount: (empId: string, role: string) => void;
  onDeleteUserAccount: (empId: string) => void;
  onAddAttendance: (att: Omit<EmployeeAttendance, "id">) => void;
  onAddLeave: (lv: Omit<EmployeeLeave, "id">) => void;
  onUpdateLeaveStatus: (id: string, status: "Approuvé" | "Refusé", approver: string) => void;
  onAddPromotion: (prom: Omit<EmployeePromotion, "id">) => void;
  onAddSanction: (sanc: Omit<EmployeeSanction, "id">) => void;
  onAddEvaluation: (evalItem: Omit<EmployeeEvaluation, "id">) => void;
  onAddTraining: (trn: Omit<EmployeeTraining, "id">) => void;
  onAddMutation: (mut: Omit<EmployeeMutation, "id">) => void;
  onAddAuditLog: (action: string, targetName: string) => void;
  onOpenPortal?: (account: UserAccount) => void;
  activeSection?: string;
  onSectionChange?: (sec: string) => void;
  schoolMotto?: string;
  schoolLogo?: string;
  signatureSeal?: string;
}

export function HrModuleView({
  students = [],
  employees,
  attendances,
  leaves,
  promotions,
  sanctions,
  evaluations,
  trainings,
  mutations,
  auditLogs,
  userRole,
  userName,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onCreateUserAccount,
  onDeleteUserAccount,
  onAddAttendance,
  onAddLeave,
  onUpdateLeaveStatus,
  onAddPromotion,
  onAddSanction,
  onAddEvaluation,
  onAddTraining,
  onAddMutation,
  onAddAuditLog,
  onOpenPortal,
  activeSection,
  onSectionChange,
  schoolMotto = "Science - Conscience - Excellence",
  schoolLogo = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120",
  signatureSeal = "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=80"
}: HrModuleViewProps) {
  // Support either controlled or uncontrolled state for the 15 sub-tabs
  const [localActiveSubTab, setLocalActiveSubTab] = useState<string>("dashboard");
  const activeSubTab = activeSection || localActiveSubTab;
  
  const setActiveSubTab = (tab: string) => {
    setLocalActiveSubTab(tab);
    if (onSectionChange) {
      onSectionChange(tab);
    }
  };
  
  // Filtering & searching states
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");

  // Selection & Details modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Forms states
  const [newEmp, setNewEmp] = useState({
    firstName: "",
    lastName: "",
    gender: "M" as "M" | "F",
    birthDate: "",
    birthPlace: "",
    nationality: "Congolaise (RDC)",
    civilStatus: "Célibataire" as any,
    address: "",
    phone: "",
    email: "",
    function: "Enseignant",
    department: "Enseignement",
    service: "Département Pédagogique",
    hireDate: new Date().toLocaleDateString("fr-FR"),
    contractType: "CDI" as any,
    salaryBase: 350,
    diplomas: "",
    experience: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
  });

  // Action modals states
  const [showAccountModal, setShowAccountModal] = useState<Employee | null>(null);
  const [accountRole, setAccountRole] = useState("Enseignant");
  const [selectedAccountForSheet, setSelectedAccountForSheet] = useState<UserAccount | null>(null);
  const [showSanctionForm, setShowSanctionForm] = useState(false);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [showMutationForm, setShowMutationForm] = useState(false);

  // Leave Form State
  const [leaveData, setLeaveData] = useState({ leaveType: "Congé Annuel" as any, startDate: "", endDate: "", reason: "" });
  // Sanction Form State
  const [sanctionData, setSanctionData] = useState({ type: "Avertissement" as any, reason: "" });
  // Promotion Form State
  const [promotionData, setPromotionData] = useState({ newFunction: "", newSalary: 0, reason: "", decisionRef: "" });
  // Evaluation Form State
  const [evaluationData, setEvaluationData] = useState({ score: 85, comments: "", objectives: "" });
  // Training Form State
  const [trainingData, setTrainingData] = useState({ trainingName: "", provider: "", startDate: "", endDate: "" });

  // Custom HR Sub-menu specific states
  const [newEmpPhoto, setNewEmpPhoto] = useState<string>("");
  const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);
  const [showSuccessAdd, setShowSuccessAdd] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCardEmployee, setSelectedCardEmployee] = useState<Employee | null>(null);
  const [selectedAccountEmployee, setSelectedAccountEmployee] = useState<Employee | null>(null);
  const [newAccountData, setNewAccountData] = useState({ username: "", password: "", confirmPassword: "", showPassword: false });
  const [importIdSsrdc, setImportIdSsrdc] = useState("");
  const [importResult, setImportResult] = useState<any | null>(null);

  const [selectedEvaluationEmployee, setSelectedEvaluationEmployee] = useState<Employee | null>(null);
  const [selectedTrainingEmployee, setSelectedTrainingEmployee] = useState<Employee | null>(null);
  const [selectedPromotionEmployee, setSelectedPromotionEmployee] = useState<Employee | null>(null);
  const [selectedSanctionEmployee, setSelectedSanctionEmployee] = useState<Employee | null>(null);
  const [selectedMutationEmployee, setSelectedMutationEmployee] = useState<Employee | null>(null);
  // Mutation Form State
  const [mutationData, setMutationData] = useState({ oldLocation: "Complexe Scolaire Principal", newLocation: "", reason: "" });

  // Scan simulator state
  const [scanMatricule, setScanMatricule] = useState("");
  const [scanResult, setScanResult] = useState<Employee | null>(null);
  const [scanStatusMsg, setScanStatusMsg] = useState("");

  // RBAC validation:
  const isAuthorizedToSeeFinancials = () => {
    const r = userRole.toLowerCase();
    return (
      r.includes("promoteur") ||
      r.includes("super administrateur") ||
      r.includes("directeur") ||
      r.includes("directrice") ||
      r.includes("préfet") ||
      r.includes("comptable") ||
      r.includes("gestionnaire")
    );
  };

  // Supported departments
  const departments = ["Direction", "Enseignement", "Administration", "Technique", "Sécurité", "Entretien", "Médical"];
  
  // Predefined Functions
  const predefinedFunctionsByDept: Record<string, string[]> = {
    "Direction": ["Promoteur", "Directeur Général", "Directeur", "Directrice de la Maternelle", "Directeur du Primaire", "Directeur du Secondaire", "Préfet des Études", "Gestionnaire", "Comptable", "Secrétaire"],
    "Enseignement": ["Enseignant", "Titulaire de classe", "Professeur", "Chef de travaux", "Préfet de discipline", "Bibliothécaire"],
    "Administration": ["Réceptionniste", "Archiviste", "Responsable informatique", "Informaticien", "Responsable des achats", "Caissier"],
    "Technique": ["Technicien informatique", "Technicien réseau", "Électricien", "Plombier", "Technicien de laboratoire", "Technicien de maintenance"],
    "Sécurité": ["Gardien", "Agent de sécurité"],
    "Entretien": ["Jardinier", "Ménagère", "Agent d'entretien", "Cuisinier", "Chauffeur"],
    "Médical": ["Infirmier", "Médecin scolaire", "Psychologue", "Assistant social"]
  };

  // Handle adding employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee({
      firstName: newEmp.firstName,
      lastName: newEmp.lastName,
      gender: newEmp.gender,
      birthDate: newEmp.birthDate,
      birthPlace: newEmp.birthPlace,
      nationality: newEmp.nationality,
      civilStatus: newEmp.civilStatus,
      address: newEmp.address,
      phone: newEmp.phone,
      email: newEmp.email,
      function: newEmp.function,
      department: newEmp.department,
      service: newEmp.service,
      hireDate: newEmp.hireDate,
      contractType: newEmp.contractType,
      salaryBase: Number(newEmp.salaryBase),
      diplomas: newEmp.diplomas.split(",").map(d => d.trim()).filter(Boolean),
      experience: newEmp.experience.split(";").map(ex => ex.trim()).filter(Boolean),
      photoUrl: newEmp.photoUrl,
      documents: [],
      emergencyContact: {
        name: newEmp.emergencyName,
        relationship: newEmp.emergencyRelationship,
        phone: newEmp.emergencyPhone
      },
      status: "Actif",
      hasUserAccount: false
    });

    onAddAuditLog("Création dossier RH", `${newEmp.firstName} ${newEmp.lastName}`);

    setIsAddingEmployee(false);
    // Reset form
    setNewEmp({
      firstName: "",
      lastName: "",
      gender: "M",
      birthDate: "",
      birthPlace: "",
      nationality: "Congolaise (RDC)",
      civilStatus: "Célibataire",
      address: "",
      phone: "",
      email: "",
      function: "Enseignant",
      department: "Enseignement",
      service: "Département Pédagogique",
      hireDate: new Date().toLocaleDateString("fr-FR"),
      contractType: "CDI",
      salaryBase: 350,
      diplomas: "",
      experience: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
    });
  };

  const handleCreateAccount = () => {
    if (!showAccountModal) return;
    onCreateUserAccount(showAccountModal.id, accountRole);
    onAddAuditLog("Création de compte", `${showAccountModal.firstName} ${showAccountModal.lastName}`);
    
    // Auto Update current selected to avoid desync
    if (selectedEmployee && selectedEmployee.id === showAccountModal.id) {
      setSelectedEmployee({
        ...selectedEmployee,
        hasUserAccount: true,
        userAccountRole: accountRole
      });
    }

    setShowAccountModal(null);
  };

  const handleDeleteAccount = (emp: Employee) => {
    if (confirm(`Voulez-vous vraiment désactiver le compte de connexion de ${emp.firstName} ${emp.lastName} ? Le dossier RH sera conservé.`)) {
      onDeleteUserAccount(emp.id);
      onAddAuditLog("Désactivation de compte", `${emp.firstName} ${emp.lastName}`);
      
      if (selectedEmployee && selectedEmployee.id === emp.id) {
        setSelectedEmployee({
          ...selectedEmployee,
          hasUserAccount: false,
          userAccountRole: undefined,
          userAccountId: undefined
        });
      }
    }
  };

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    setScanStatusMsg("");
    const matched = employees.find(emp => emp.matricule.toLowerCase() === scanMatricule.trim().toLowerCase());
    if (matched) {
      setScanResult(matched);
      onAddAuditLog("Scan Carte Pro", `${matched.firstName} ${matched.lastName}`);
    } else {
      setScanResult(null);
      setScanStatusMsg("❌ Aucun employé trouvé avec ce numéro matricule ! Veuillez vérifier la saisie.");
    }
  };

  const handleAddSanctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    onAddSanction({
      employeeId: selectedEmployee.id,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      type: sanctionData.type,
      reason: sanctionData.reason,
      date: new Date().toLocaleDateString("fr-FR"),
      approvedBy: `${userName} (${userRole})`,
      status: "Active"
    });
    onAddAuditLog("Sanction infligée", `${selectedEmployee.firstName} ${selectedEmployee.lastName} (${sanctionData.type})`);
    setSanctionData({ type: "Avertissement", reason: "" });
    setShowSanctionForm(false);
  };

  const handleAddLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    onAddLeave({
      employeeId: selectedEmployee.id,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      status: "En attente",
      reason: leaveData.reason
    });
    onAddAuditLog("Demande de congé enregistrée", `${selectedEmployee.firstName} ${selectedEmployee.lastName}`);
    setLeaveData({ leaveType: "Congé Annuel", startDate: "", endDate: "", reason: "" });
    setShowLeaveForm(false);
  };

  const handleAddPromotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    onAddPromotion({
      employeeId: selectedEmployee.id,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      oldFunction: selectedEmployee.function,
      newFunction: promotionData.newFunction,
      oldSalary: selectedEmployee.salaryBase,
      newSalary: Number(promotionData.newSalary),
      date: new Date().toLocaleDateString("fr-FR"),
      reason: promotionData.reason,
      decisionRef: promotionData.decisionRef || `DEC-PR-${Math.floor(1000 + Math.random() * 9000)}`
    });
    
    // Live update local view state
    const updated: Employee = {
      ...selectedEmployee,
      function: promotionData.newFunction,
      salaryBase: Number(promotionData.newSalary)
    };
    onUpdateEmployee(updated);
    setSelectedEmployee(updated);

    onAddAuditLog("Promotion salariale/poste", `${selectedEmployee.firstName} ${selectedEmployee.lastName} vers ${promotionData.newFunction}`);
    setPromotionData({ newFunction: "", newSalary: 0, reason: "", decisionRef: "" });
    setShowPromotionForm(false);
  };

  const handleAddEvaluationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    onAddEvaluation({
      employeeId: selectedEmployee.id,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      evaluatorName: `${userName} (${userRole})`,
      date: new Date().toLocaleDateString("fr-FR"),
      score: Number(evaluationData.score),
      comments: evaluationData.comments,
      objectives: evaluationData.objectives
    });
    onAddAuditLog("Évaluation de rendement", `${selectedEmployee.firstName} ${selectedEmployee.lastName}`);
    setEvaluationData({ score: 85, comments: "", objectives: "" });
    setShowEvaluationForm(false);
  };

  const handleAddTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    onAddTraining({
      employeeId: selectedEmployee.id,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      trainingName: trainingData.trainingName,
      provider: trainingData.provider,
      startDate: trainingData.startDate,
      endDate: trainingData.endDate,
      status: "Planifié"
    });
    onAddAuditLog("Inscription en formation", `${selectedEmployee.firstName} ${selectedEmployee.lastName}`);
    setTrainingData({ trainingName: "", provider: "", startDate: "", endDate: "" });
    setShowTrainingForm(false);
  };

  const handleAddMutationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    onAddMutation({
      employeeId: selectedEmployee.id,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      oldLocation: mutationData.oldLocation,
      newLocation: mutationData.newLocation,
      date: new Date().toLocaleDateString("fr-FR"),
      reason: mutationData.reason
    });
    onAddAuditLog("Mutation d'établissement", `${selectedEmployee.firstName} ${selectedEmployee.lastName} vers ${mutationData.newLocation}`);
    setMutationData({ oldLocation: "Complexe Scolaire Principal", newLocation: "", reason: "" });
    setShowMutationForm(false);
  };

  const handleClockInSimulator = (emp: Employee) => {
    const timeNow = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    onAddAttendance({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      date: new Date().toLocaleDateString("fr-FR"),
      status: "Présent",
      timeIn: timeNow,
      recordedBy: "Pointage Manuel (Portail Admin)"
    });
    onAddAuditLog("Pointage Présence", `${emp.firstName} ${emp.lastName} à ${timeNow}`);
  };

  // Filtered employees list
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matricule = emp.matricule.toLowerCase();
    const func = emp.function.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesQuery = fullName.includes(query) || matricule.includes(query) || func.includes(query);
    const matchesDept = deptFilter === "Tous" || emp.department === deptFilter;
    const matchesStatus = statusFilter === "Tous" || emp.status === statusFilter;

    return matchesQuery && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* MODULE MAIN HERO BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black tracking-widest bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full uppercase">
                République Démocratique du Congo
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans">
              Gestion des Ressources Humaines
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Dossier RH universel, cartes de service sécurisées, pointage par QR Code, congés et gestion du personnel administratif, technique, sécuritaire et médical du Complexe Scolaire.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setIsAddingEmployee(true);
                setSelectedEmployee(null);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Enregistrer un employé</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab("scanner");
                setSelectedEmployee(null);
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span>Scanner Carte</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block">Effectif Global</span>
            <span className="text-2xl font-black text-white">{employees.length} Agents</span>
          </div>
          <div>
            <span className="text-slate-400 block">Comptes Utilisateurs</span>
            <span className="text-2xl font-black text-indigo-300">
              {employees.filter(e => e.hasUserAccount).length} Actifs
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">En Congé / Mission</span>
            <span className="text-2xl font-black text-amber-300">
              {employees.filter(e => e.status === "En congé" || e.status === "Suspendu").length} Personnel
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Présents Aujourd'hui</span>
            <span className="text-2xl font-black text-emerald-400">
              {attendances.filter(a => a.date === new Date().toLocaleDateString("fr-FR") && a.status === "Présent").length} Présents
            </span>
          </div>
        </div>
      </div>

      {students.filter(s => !s.photoUrl).length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/40 flex items-start space-x-3 text-xs shadow-xs">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-950 dark:text-amber-200">Rappel Administration & Direction RH</h4>
            <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
              Il y a actuellement <strong className="font-black text-amber-600 dark:text-amber-400">{students.filter(s => !s.photoUrl).length} élève(s)</strong> sans photo de profil à jour dans les dossiers d'inscription. Veuillez coordonner avec les parents d'élèves pour téléverser une photo d'identité.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB NAV BAR (Hidden for Administrateur RH, because they navigate via the main left sidebar menu) */}
      {userRole !== "Administrateur RH" && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-1">
          {[
            { id: "dashboard", label: "Tableau de Bord", icon: Activity },
            { id: "personnel", label: "Dossiers Personnels (RH)", icon: Users },
            { id: "fonctions", label: "Gestion des Fonctions & Services", icon: Sliders },
            { id: "presences", label: "Présence & Pointage", icon: Clock },
            { id: "conges", label: "Gestion des Congés", icon: Calendar },
            { id: "historique", label: "Parcours & Évaluations", icon: Award },
            { id: "scanner", label: "Scanner Carte Pro", icon: QrCode },
            { id: "audit", label: "Journal d'Audit RH", icon: ShieldCheck }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  setScanResult(null);
                  setSelectedEmployee(null);
                }}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-bold text-xs shrink-0 transition-all cursor-pointer ${
                  isActive 
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <IconComp className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* SUB-VIEW CONTENTS */}
      {(activeSubTab === "dashboard" || activeSubTab === "") && (
        <HrDashboard
          employees={employees}
          attendances={attendances}
          leaves={leaves}
          sanctions={sanctions}
          trainings={trainings}
          auditLogs={auditLogs}
          onNavigateToTab={(tab) => {
            setActiveSubTab(tab);
            if (onSectionChange) onSectionChange("rh_" + tab);
          }}
          departments={departments}
        />
      )}

      {activeSubTab === "personnel" && (
        <div className="space-y-6" id="personnel-tab-view">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, matricule, ID SSRDC, téléphone, fonction, QR Code..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Département:</span>
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <option value="Tous">Tous</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Statut:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <option value="Tous">Tous</option>
                  <option value="Actif">Actif</option>
                  <option value="En congé">En congé</option>
                  <option value="Suspendu">Suspendu</option>
                  <option value="Retraité">Retraité</option>
                  <option value="Fin de contrat">Fin de contrat</option>
                </select>
              </div>

              {/* View mode toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-0.5 border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${viewMode === "grid" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600" : "text-slate-500"}`}
                >
                  Grille
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${viewMode === "table" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600" : "text-slate-500"}`}
                >
                  Tableau
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC RENDERING: GRID VS TABLE */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="personnel-grid">
              {filteredEmployees.map(emp => {
                const hasAccount = emp.hasUserAccount;
                return (
                  <div 
                    key={emp.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3.5">
                        <img 
                          src={emp.photoUrl} 
                          alt={emp.lastName} 
                          className="h-12 w-12 rounded-xl object-cover border border-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded uppercase">
                            {emp.matricule}
                          </span>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm truncate font-sans">
                            {emp.lastName} {emp.firstName}
                          </h3>
                          <p className="text-[11px] font-medium text-slate-500 truncate">{emp.function}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[8px]">Département</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{emp.department}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[8px]">ID SSRDC</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate block">{emp.idSsrdc || "Non défini"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[8px]">Téléphone</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">{emp.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[8px]">Accès</span>
                          <span className={`font-bold uppercase text-[9px] block ${hasAccount ? "text-emerald-500" : "text-slate-400"}`}>
                            {hasAccount ? "✅ Actif" : "❌ Aucun"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-3 flex items-center justify-between text-[11px]">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        emp.status === "Actif" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400" :
                        emp.status === "En congé" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400" :
                        "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400"
                      }`}>
                        {emp.status}
                      </span>

                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer"
                      >
                        Consulter dossier & Carte →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm" id="personnel-table-container">
              <div className="overflow-x-auto text-left">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                      <th className="p-4">Photo & Agent</th>
                      <th className="p-4">Matricule</th>
                      <th className="p-4">ID SSRDC</th>
                      <th className="p-4">Département & Fonction</th>
                      <th className="p-4">Téléphone</th>
                      <th className="p-4">Compte</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions Réparatrices / Administration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                        <td className="p-4 flex items-center space-x-3">
                          <img src={emp.photoUrl} className="h-9 w-9 object-cover rounded-xl border" alt="" />
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{emp.lastName} {emp.firstName}</p>
                            <p className="text-[10px] text-slate-400">{emp.email}</p>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-500">{emp.matricule}</td>
                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{emp.idSsrdc || "---"}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{emp.function}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{emp.department}</p>
                        </td>
                        <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{emp.phone}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${emp.hasUserAccount ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50" : "bg-slate-100 text-slate-400"}`}>
                            {emp.hasUserAccount ? "Créé" : "Aucun"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            emp.status === "Actif" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50" :
                            emp.status === "En congé" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50" :
                            "bg-rose-100 text-rose-800 dark:bg-rose-950/50"
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedEmployee(emp)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer"
                              title="Consulter Dossier"
                            >
                              Dossier
                            </button>
                            <button
                              onClick={() => {
                                setEditingEmployee(emp);
                                setIsEditingEmployee(true);
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer"
                              title="Modifier Fiche"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => {
                                if (emp.status === "Actif") {
                                  onUpdateEmployee({ ...emp, status: "Suspendu" });
                                  onAddAuditLog("Suspension d'agent", `${emp.firstName} ${emp.lastName}`);
                                } else {
                                  onUpdateEmployee({ ...emp, status: "Actif" });
                                  onAddAuditLog("Réactivation d'agent", `${emp.firstName} ${emp.lastName}`);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer ${emp.status === "Actif" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                            >
                              {emp.status === "Actif" ? "Suspendre" : "Réactiver"}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Êtes-vous sûr de vouloir déclarer la fin de contrat de ${emp.firstName} ${emp.lastName} ?`)) {
                                  onUpdateEmployee({ ...emp, status: "Fin de contrat" });
                                  onAddAuditLog("Fin de contrat de l'agent", `${emp.firstName} ${emp.lastName}`);
                                }
                              }}
                              className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer"
                            >
                              Fin Contrat
                            </button>
                            <button
                              onClick={() => {
                                const newCode = `ACT-PERS-${emp.lastName.toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;
                                onUpdateEmployee({ ...emp, activationCode: newCode });
                                onAddAuditLog("Régénération de code d'activation", `${emp.firstName} ${emp.lastName}`);
                                alert(`✅ Code régénéré avec succès pour l'agent ${emp.firstName} ${emp.lastName} :\n\n${newCode}\n\nNotez-le précieusement.`);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer"
                              title="Régénérer code"
                            >
                              Code
                            </button>
                            <button
                              onClick={() => {
                                setActiveSubTab("cartes");
                                if (onSectionChange) onSectionChange("rh_cartes");
                              }}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer"
                              title="Imprimer carte"
                            >
                              Imprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "fonctions" && (
        <HrFunctionsManagement
          employees={employees}
          userRole={userRole}
          userName={userName}
          onAddAuditLog={onAddAuditLog}
        />
      )}

      {activeSubTab === "ajouter" && (
        <HrAddEmployee
          onAddEmployee={onAddEmployee}
          departments={departments}
          predefinedFunctionsByDept={predefinedFunctionsByDept}
          onNavigateToTab={(tab) => {
            setActiveSubTab(tab);
            if (onSectionChange) onSectionChange("rh_" + tab);
          }}
          onSelectEmployee={(emp) => setSelectedEmployee(emp)}
          employees={employees}
        />
      )}

      {activeSubTab === "organigramme" && (
        <HrOrganigramme
          employees={employees}
          onSelectEmployee={(emp) => setSelectedEmployee(emp)}
        />
      )}

      {activeSubTab === "cartes" && (
        <HrCartes
          employees={employees}
          schoolMotto={schoolMotto}
          schoolLogo={schoolLogo}
          signatureSeal={signatureSeal}
        />
      )}

      {activeSubTab === "comptes" && (
        <HrComptes
          employees={employees}
          onCreateUserAccount={onCreateUserAccount}
          onDeleteUserAccount={onDeleteUserAccount}
          onAddAuditLog={onAddAuditLog}
          onOpenPortal={onOpenPortal}
          schoolLogo={schoolLogo}
          schoolMotto={schoolMotto}
        />
      )}

      {/* SUB-VIEW PRESENT LOG */}
      {activeSubTab === "presences" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Pointage Journalier des Agents</h3>
                <p className="text-[11px] text-slate-500">Marquez la présence des agents arrivés à l'établissement aujourd'hui ou consultez l'historique complet.</p>
              </div>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 px-3 py-1 rounded-full font-bold">
                Date: {new Date().toLocaleDateString("fr-FR")}
              </span>
            </div>

            {/* Quick pointage list */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              {employees.map(emp => {
                const todayAttendance = attendances.find(a => a.employeeId === emp.id && a.date === new Date().toLocaleDateString("fr-FR"));
                return (
                  <div key={emp.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                    <div className="flex items-center space-x-3">
                      <img src={emp.photoUrl} className="h-8 w-8 rounded-lg object-cover" />
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-white block">{emp.lastName} {emp.firstName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{emp.function} | {emp.department}</span>
                      </div>
                    </div>

                    <div>
                      {todayAttendance ? (
                        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <Check className="h-4 w-4" />
                          <span className="font-bold text-[10px]">Présent à {todayAttendance.timeIn}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClockInSimulator(emp)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer"
                        >
                          Pointer Présent (Arrivée)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HISTORIQUE GENERAL DES POINTAGES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Historique des Pointages de Présence</h3>
            <div className="overflow-x-auto text-left">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800 text-[9px] tracking-wider">
                    <th className="p-3">Employé</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Heure Arrivée</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Pointé Par</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendances.slice().reverse().map(att => (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20">
                      <td className="p-3 font-bold text-slate-800 dark:text-white">{att.employeeName}</td>
                      <td className="p-3 font-mono text-slate-500">{att.date}</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{att.timeIn || "-- : --"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          att.status === "Présent" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 italic">{att.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW LEAVES */}
      {activeSubTab === "conges" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Demandes actives de congé & absence</h3>
            <div className="overflow-x-auto text-left">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800 text-[9px] tracking-wider">
                    <th className="p-3">Employé</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Période</th>
                    <th className="p-3">Raison</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leaves.map(lv => (
                    <tr key={lv.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20">
                      <td className="p-3 font-bold text-slate-800 dark:text-white">{lv.employeeName}</td>
                      <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400">{lv.leaveType}</td>
                      <td className="p-3 font-mono text-slate-500">Du {lv.startDate} au {lv.endDate}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-[180px] truncate" title={lv.reason}>{lv.reason}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          lv.status === "Approuvé" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30" :
                          lv.status === "Refusé" ? "bg-rose-100 text-rose-800 dark:bg-rose-950/30" :
                          "bg-amber-100 text-amber-800 dark:bg-amber-950/30"
                        }`}>
                          {lv.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {lv.status === "En attente" && isAuthorizedToSeeFinancials() ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                onUpdateLeaveStatus(lv.id, "Approuvé", userName);
                                onAddAuditLog("Approbation congé", `${lv.employeeName}`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Valider
                            </button>
                            <button
                              onClick={() => {
                                onUpdateLeaveStatus(lv.id, "Refusé", userName);
                                onAddAuditLog("Refus congé", `${lv.employeeName}`);
                              }}
                              className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Refuser
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Dossier fermé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW PRO/EVAL HISTORY */}
      {activeSubTab === "historique" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EVALUATIONS GRID */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Rendement & Évaluations Annuelles</h3>
            <div className="space-y-3.5 max-h-[400px] overflow-y-auto">
              {evaluations.map(ev => (
                <div key={ev.id} className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-[11px]">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-white block">{ev.employeeName}</span>
                      <span className="text-[9px] text-slate-400">Date d'évaluation: {ev.date}</span>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      ev.score >= 85 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      Note: {ev.score} / 100
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">"{ev.comments}"</p>
                  <p className="text-[10px] text-slate-400 mt-1"><strong>Objectifs fixés:</strong> {ev.objectives}</p>
                  <div className="text-[9px] text-slate-400 text-right">Évaluateur: {ev.evaluatorName}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PROMOTIONS & MUTATIONS HISTORIC */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Historique des Promotions</h3>
              <div className="space-y-3">
                {promotions.map(pr => (
                  <div key={pr.id} className="p-3 bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/40 rounded-xl text-[11px] space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-100">{pr.employeeName}</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">{pr.decisionRef}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Changement de poste : <span className="font-semibold text-slate-700 dark:text-slate-300">{pr.oldFunction}</span> → <span className="font-semibold text-indigo-600 dark:text-indigo-400">{pr.newFunction}</span>
                    </div>
                    {isAuthorizedToSeeFinancials() && (
                      <div className="text-[10px] text-slate-500">
                        Ajustement Salaire : <span className="font-semibold">${pr.oldSalary}</span> → <span className="font-bold text-emerald-600">${pr.newSalary} / mois</span>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 italic mt-1">Raison: {pr.reason}</p>
                    <span className="text-[9px] text-slate-400 block text-right font-mono">{pr.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Sanctions administratives</h3>
              <div className="space-y-3">
                {sanctions.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Aucune sanction administrative n'a été enregistrée.</p>
                ) : (
                  sanctions.map(sc => (
                    <div key={sc.id} className="p-3 bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-950/40 rounded-xl text-[11px] space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800 dark:text-slate-100">{sc.employeeName}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          sc.status === "Active" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-800"
                        }`}>{sc.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">Type : {sc.type}</p>
                      <p className="text-[10px] text-slate-400 italic">Motif : {sc.reason}</p>
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono pt-1">
                        <span>Par: {sc.approvedBy}</span>
                        <span>{sc.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW SCANNER */}
      {activeSubTab === "scanner" && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 animate-pulse">
              <QrCode className="h-8 w-8" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base uppercase">Simulateur de Scan Carte Pro</h3>
            <p className="text-xs text-slate-400">Entrez le numéro matricule unique d'un agent pour simuler le scan laser/QR code de sa carte professionnelle.</p>
          </div>

          <form onSubmit={handleSimulateScan} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-500 block">Code Matricule Unique (Ex: PERS-2024-0012)</label>
              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  placeholder="Saisissez ou collez le matricule..."
                  value={scanMatricule}
                  onChange={e => setScanMatricule(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold font-mono text-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 rounded-xl font-bold cursor-pointer"
                >
                  Scanner
                </button>
              </div>
            </div>
            {scanStatusMsg && <p className="text-xs text-rose-500 font-medium text-center">{scanStatusMsg}</p>}
          </form>

          {/* DETAILED SCANNER RESULTS IF SUCCESS */}
          {scanResult && (
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 p-5 rounded-2xl space-y-4">
              <div className="flex items-center space-x-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                <img src={scanResult.photoUrl} className="h-16 w-16 rounded-2xl object-cover border border-white shadow" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{scanResult.matricule}</span>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">{scanResult.lastName} {scanResult.firstName}</h4>
                  <p className="text-[11px] font-medium text-slate-500">{scanResult.function} ({scanResult.department})</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-bold text-[8px] uppercase">Téléphone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{scanResult.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[8px] uppercase">Service de Rattachement</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{scanResult.service}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[8px] uppercase">Statut d'activité</span>
                  <span className="font-bold text-emerald-500 uppercase text-[9px]">{scanResult.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[8px] uppercase">Accès utilisateur</span>
                  <span className="font-bold text-indigo-600 uppercase text-[9px]">{scanResult.hasUserAccount ? `OUI (Rôle : ${scanResult.userAccountRole})` : "NON"}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/50 dark:border-slate-850 pt-3 text-[10px] text-slate-400">
                <strong>Vérifié avec succès</strong> par le registre SmartSchool RDC. Code de signature électronique valide.
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW AUDIT LOGS */}
      {activeSubTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Journal de Traçabilité (Audit RH)</h3>
              <p className="text-[11px] text-slate-500">Registre légal contenant la traçabilité complète de chaque action de création, de modification ou d'attribution de compte.</p>
            </div>
            <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold uppercase">Souveraineté Nationale RDC</span>
          </div>

          <div className="overflow-x-auto text-left">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800 text-[9px] tracking-wider">
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3">Fonction / Rôle</th>
                  <th className="p-3">Opération / Action</th>
                  <th className="p-3">Cible</th>
                  <th className="p-3">Date & Heure</th>
                  <th className="p-3">IP / Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.slice().reverse().map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20">
                    <td className="p-3 font-bold text-slate-800 dark:text-white">{log.actorName}</td>
                    <td className="p-3 text-slate-500 font-medium">{log.actorFunction}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        log.action.includes("Création") ? "bg-indigo-100 text-indigo-800" :
                        log.action.includes("Désactivation") ? "bg-rose-100 text-rose-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{log.targetName}</td>
                    <td className="p-3 font-mono text-slate-500">{log.date} | {log.time}</td>
                    <td className="p-3 text-[10px] text-slate-400 font-mono">{log.ipAddress || "192.168.1.100"} ({log.device || "Chrome RDC"})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE EMPLOYEE MODAL DIALOG */}
      {isAddingEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-mono">Dossier de recrutement</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Créer un nouveau Dossier RH</h3>
                </div>
                <button 
                  onClick={() => setIsAddingEmployee(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
                {/* General identities */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Nom de famille (Majeur)</label>
                    <input required value={newEmp.lastName} onChange={e => setNewEmp({...newEmp, lastName: e.target.value})} placeholder="Ex: MUTOMBO" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Prénom(s)</label>
                    <input required value={newEmp.firstName} onChange={e => setNewEmp({...newEmp, firstName: e.target.value})} placeholder="Ex: Astrid" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Sexe</label>
                    <select value={newEmp.gender} onChange={e => setNewEmp({...newEmp, gender: e.target.value as any})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <option value="M">Masculin (M)</option>
                      <option value="F">Féminin (F)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Date de naissance</label>
                    <input type="text" placeholder="Ex: 14/05/1993" required value={newEmp.birthDate} onChange={e => setNewEmp({...newEmp, birthDate: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Lieu de naissance</label>
                    <input required value={newEmp.birthPlace} onChange={e => setNewEmp({...newEmp, birthPlace: e.target.value})} placeholder="Ex: Lubumbashi" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                  </div>
                </div>

                {/* Status elements */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Département d'affectation</label>
                    <select 
                      value={newEmp.department} 
                      onChange={e => {
                        const dept = e.target.value;
                        const defaultFunc = predefinedFunctionsByDept[dept]?.[0] || "Autre";
                        setNewEmp({...newEmp, department: dept, function: defaultFunc});
                      }} 
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    >
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Fonction officielle</label>
                    <select 
                      value={newEmp.function} 
                      onChange={e => setNewEmp({...newEmp, function: e.target.value})}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                    >
                      {(predefinedFunctionsByDept[newEmp.department] || []).map(fn => <option key={fn} value={fn}>{fn}</option>)}
                      <option value="Autre / Personnalisé">Autre / Personnalisé</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Type de contrat</label>
                    <select value={newEmp.contractType} onChange={e => setNewEmp({...newEmp, contractType: e.target.value as any})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                      <option value="Prestation">Prestation</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Salaire de base (USD)</label>
                    <input type="number" required value={newEmp.salaryBase} onChange={e => setNewEmp({...newEmp, salaryBase: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Téléphone</label>
                    <input required value={newEmp.phone} onChange={e => setNewEmp({...newEmp, phone: e.target.value})} placeholder="Ex: +243 812..." className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Adresse Complète</label>
                  <input required value={newEmp.address} onChange={e => setNewEmp({...newEmp, address: e.target.value})} placeholder="Av. No, Quartier, Ville, Province" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                </div>

                {/* Emergency elements */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl space-y-2">
                  <span className="font-bold text-indigo-600 uppercase text-[9px] block">Personne à contacter en cas d'urgence</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input required placeholder="Nom du contact" value={newEmp.emergencyName} onChange={e => setNewEmp({...newEmp, emergencyName: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                    <input required placeholder="Lien (Ex: Épouse)" value={newEmp.emergencyRelationship} onChange={e => setNewEmp({...newEmp, emergencyRelationship: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                    <input required placeholder="Téléphone contact" value={newEmp.emergencyPhone} onChange={e => setNewEmp({...newEmp, emergencyPhone: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2.5 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingEmployee(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold cursor-pointer"
                  >
                    Valider l'embauche
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ACCOUNT DIALOG MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Créer un compte utilisateur</h3>
              <button onClick={() => setShowAccountModal(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Vous allez accorder un accès de connexion sécurisé à l'agent <strong>{showAccountModal.firstName} {showAccountModal.lastName}</strong>. Ses identifiants seront automatiquement générés et liés à sa fiche d'identité RH.
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-500">Rôle de Connexion & Permissions</label>
              <select 
                value={accountRole} 
                onChange={e => setAccountRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              >
                <option value="Enseignant">Enseignant (Accès notes, horaire, présence)</option>
                <option value="Comptable">Comptable (Frais, rapports financiers, validation)</option>
                <option value="Secrétaire">Secrétaire (Inscription élèves, formulaires, courrier)</option>
                <option value="Directeur">Directeur (Suivi global, approbations)</option>
                <option value="Responsable informatique">Responsable informatique (Admin infrastructure, audits)</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setShowAccountModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={handleCreateAccount}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Confirmer & Générer l'accès
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED EMPLOYEE DRAWER VIEW & CARD GENERATOR */}
      {selectedEmployee && (() => {
        const emp = selectedEmployee;
        const hasAccount = emp.hasUserAccount;
        
        // Filter sub events
        const empAttendances = attendances.filter(a => a.employeeId === emp.id);
        const empLeaves = leaves.filter(l => l.employeeId === emp.id);
        const empSanctions = sanctions.filter(s => s.employeeId === emp.id);
        const empEvaluations = evaluations.filter(ev => ev.employeeId === emp.id);
        const empTrainings = trainings.filter(t => t.employeeId === emp.id);
        const empMutations = mutations.filter(m => m.employeeId === emp.id);

        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 block uppercase font-mono tracking-widest">{emp.matricule}</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-sans">{emp.lastName} {emp.firstName}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedEmployee(null)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Identity Column */}
                  <div className="lg:col-span-4 space-y-4">
                    {emp.photoUrl ? (
                      <img src={emp.photoUrl} className="w-full h-48 object-cover rounded-2xl shadow border border-slate-150" alt={emp.firstName} />
                    ) : (
                      <div className="w-full h-48 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-4xl text-indigo-600 dark:text-indigo-400 shadow">
                        {emp.firstName[0]}
                      </div>
                    )}
                    
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Fonction officielle</span>
                        <p className="font-extrabold text-slate-800 dark:text-slate-200">{emp.function}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Département / Service</span>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{emp.department} ({emp.service})</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Statut d'embauche</span>
                        <p className="font-bold text-emerald-600">{emp.status}</p>
                      </div>

                      {/* User account action toggle */}
                      <div className="p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl space-y-2">
                        <span className="text-[9px] text-indigo-600 font-black block uppercase">Identifiants Plateforme</span>
                        {hasAccount ? (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-600 block">Rôle de connexion : <strong className="text-indigo-600">{emp.userAccountRole || "Enseignant"}</strong></span>
                            <button
                              onClick={() => handleDeleteAccount(emp)}
                              className="text-[10px] bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-bold px-2 py-1 rounded w-full flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                              <span>Désactiver le compte de connexion</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowAccountModal(emp)}
                            className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg w-full flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Créer un compte de connexion</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Content Tabs (Dossier + Pro Card) */}
                  <div className="lg:col-span-8 space-y-5 text-xs">
                    {/* DOSSIER NUMÉRIQUE TAB */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider">Fiche d'identité numérique</h4>
                        <span className="text-[9px] text-slate-400">Embauché le : {emp.hireDate}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <span className="text-slate-400 block font-bold text-[8px] uppercase">Lieu et Date de naissance</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{emp.birthPlace}, {emp.birthDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold text-[8px] uppercase">Nationalité</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{emp.nationality}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold text-[8px] uppercase">État civil</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{emp.civilStatus}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold text-[8px] uppercase">Téléphone</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{emp.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold text-[8px] uppercase">Email</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{emp.email || "Néant"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold text-[8px] uppercase">Contrat de travail</span>
                          <span className="font-semibold text-indigo-600">{emp.contractType}</span>
                        </div>
                      </div>

                      {/* SENSITIVE BLOCK WITH RBAC CHECK */}
                      <div className="p-3.5 bg-indigo-50/10 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/20 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-indigo-600 uppercase text-[9px] tracking-wider flex items-center space-x-1">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Données Contractuelles & Salariales (RBAC)</span>
                          </span>
                          <button 
                            onClick={() => setShowSensitiveData(!showSensitiveData)}
                            className="text-[9px] font-bold text-slate-400 hover:underline cursor-pointer"
                          >
                            {showSensitiveData ? "Masquer" : "Consulter"}
                          </button>
                        </div>

                        {showSensitiveData ? (
                          isAuthorizedToSeeFinancials() ? (
                            <div className="grid grid-cols-2 gap-4 pt-1">
                              <div>
                                <span className="text-slate-400 text-[8px] uppercase block">Salaire Mensuel</span>
                                <span className="text-sm font-black text-emerald-600">${emp.salaryBase} USD / mois</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[8px] uppercase block">Diplômes & Qualifs</span>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 text-[10px]">
                                  {emp.diplomas.join(", ") || "Aucun diplôme enregistré."}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-semibold flex items-center space-x-1.5">
                              <ShieldAlert className="h-4 w-4" />
                              <span>Accès restreint - Rôle non autorisé selon le système RBAC.</span>
                            </div>
                          )
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Cliquez sur consulter pour déverrouiller le panneau sécurisé.</p>
                        )}
                      </div>

                      {/* EMERGENCY BLOCK */}
                      <div className="p-3 bg-amber-50/10 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-950/20 rounded-xl">
                        <span className="text-[9px] text-amber-600 font-bold block uppercase">Urgence</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {emp.emergencyContact.name} ({emp.emergencyContact.relationship}) : <strong>{emp.emergencyContact.phone}</strong>
                        </p>
                      </div>
                    </div>

                    {/* INTERACTIVE CARTE PROFESSIONNELLE */}
                    <div className="space-y-3">
                      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1">
                        <FileBadge className="h-4 w-4 text-emerald-500" />
                        <span>Carte Professionnelle Générée</span>
                      </h4>

                      {/* Official DRC Card design */}
                      <div id="smartschool-printable-zone" className="max-w-md bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-2xl relative overflow-hidden font-sans">
                        {/* RDC banner with official flag colors */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-yellow-400 to-rose-500"></div>
                        
                        <div className="flex justify-between items-start border-b border-white/10 pb-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-black text-xs text-indigo-400">SMART</span>
                            <span className="font-black text-xs text-white">SCHOOL</span>
                          </div>
                          
                          {/* Official Flag of RDC */}
                          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[8px] font-bold">
                            <div className="w-4 h-3 bg-sky-500 relative flex items-center justify-center overflow-hidden shrink-0">
                              <div className="absolute w-full h-0.5 bg-yellow-400 rotate-[30deg]"></div>
                              <div className="absolute w-full h-0.5 bg-rose-500 rotate-[-30deg]"></div>
                              <span className="text-[6px] text-yellow-300 absolute left-0 top-0">★</span>
                            </div>
                            <span>RDC CONGO</span>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                          <div className="shrink-0 space-y-2">
                            {emp.photoUrl ? (
                              <img src={emp.photoUrl} className="h-24 w-20 object-cover rounded-xl border-2 border-indigo-500/50 shadow" alt={emp.firstName} />
                            ) : (
                              <div className="h-24 w-20 rounded-xl border-2 border-indigo-500/50 bg-slate-800 flex items-center justify-center font-black text-xl text-indigo-300 shadow">
                                {emp.firstName[0]}
                              </div>
                            )}
                            <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[7px] font-black text-center uppercase tracking-widest">
                              {emp.status}
                            </div>
                          </div>

                          <div className="flex-1 space-y-1 text-slate-100">
                            <div>
                              <span className="text-[7px] text-slate-400 block uppercase font-bold tracking-wider">Nom Complet</span>
                              <span className="font-black text-xs tracking-tight text-white">{emp.lastName} {emp.firstName}</span>
                            </div>
                            <div>
                              <span className="text-[7px] text-slate-400 block uppercase font-bold tracking-wider">Fonction Officielle</span>
                              <span className="font-extrabold text-[10px] text-indigo-300 block leading-tight">{emp.function}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <span className="text-[6px] text-slate-400 block uppercase font-bold">Département</span>
                                <span className="font-bold text-[8px] text-slate-200">{emp.department}</span>
                              </div>
                              <div>
                                <span className="text-[6px] text-slate-400 block uppercase font-bold">Matricule</span>
                                <span className="font-mono text-[8px] text-yellow-400">{emp.matricule}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[6px] text-slate-400 block uppercase font-bold">Année Scolaire</span>
                            <span className="text-[8px] font-bold text-slate-300">2025 - 2026</span>
                            <span className="text-[5px] text-rose-400 block uppercase">Expire fin contrat</span>
                          </div>

                          {/* Digital cachet/signature of School */}
                          <div className="text-right">
                            <div className="inline-block p-1 bg-white/5 rounded-lg border border-white/10">
                              <QrCode className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-[5px] text-indigo-400 block uppercase tracking-wider font-mono mt-0.5">CACHET SECURE SMART-RDC</span>
                          </div>
                        </div>
                      </div>

                      {/* Print action trigger */}
                      <button
                        onClick={() => window.print()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Imprimer la Carte d'Identité</span>
                      </button>
                    </div>

                    {/* EVENT MANAGER ATTACHED MODULES (LEAVES, SANCTIONS, PROMOTIONS, EVALUATIONS, TRAININGS) */}
                    <div className="space-y-4 pt-3 border-t border-slate-150">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider">Actions Administratives & Suivis</h4>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => { setShowSanctionForm(true); setShowLeaveForm(false); setShowPromotionForm(false); setShowEvaluationForm(false); setShowTrainingForm(false); setShowMutationForm(false); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer">+ Sanction</button>
                          <button onClick={() => { setShowPromotionForm(true); setShowSanctionForm(false); setShowLeaveForm(false); setShowEvaluationForm(false); setShowTrainingForm(false); setShowMutationForm(false); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer">+ Promotion</button>
                          <button onClick={() => { setShowEvaluationForm(true); setShowSanctionForm(false); setShowPromotionForm(false); setShowLeaveForm(false); setShowTrainingForm(false); setShowMutationForm(false); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer">+ Évaluation</button>
                          <button onClick={() => { setShowLeaveForm(true); setShowSanctionForm(false); setShowPromotionForm(false); setShowEvaluationForm(false); setShowTrainingForm(false); setShowMutationForm(false); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer">+ Congé</button>
                          <button onClick={() => { setShowTrainingForm(true); setShowLeaveForm(false); setShowSanctionForm(false); setShowPromotionForm(false); setShowEvaluationForm(false); setShowMutationForm(false); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer">+ Formation</button>
                          <button onClick={() => { setShowMutationForm(true); setShowTrainingForm(false); setShowLeaveForm(false); setShowSanctionForm(false); setShowPromotionForm(false); setShowEvaluationForm(false); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer">+ Mutation</button>
                        </div>
                      </div>

                      {/* Sanction Form Panel */}
                      {showSanctionForm && (
                        <form onSubmit={handleAddSanctionSubmit} className="p-3 bg-rose-50/20 dark:bg-rose-950/20 border border-rose-100 rounded-xl space-y-3">
                          <span className="font-bold text-rose-600 block">Infliger une sanction administrative</span>
                          <div className="grid grid-cols-2 gap-2">
                            <select value={sanctionData.type} onChange={e => setSanctionData({...sanctionData, type: e.target.value as any})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900">
                              <option value="Avertissement">Avertissement</option>
                              <option value="Blâme">Blâme</option>
                              <option value="Mise à pied">Mise à pied</option>
                              <option value="Suspension">Suspension</option>
                              <option value="Révocation">Révocation</option>
                            </select>
                            <input required placeholder="Raison de la sanction" value={sanctionData.reason} onChange={e => setSanctionData({...sanctionData, reason: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowSanctionForm(false)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold">Annuler</button>
                            <button type="submit" className="bg-rose-600 text-white px-3 py-1.5 rounded-lg font-bold">Confirmer</button>
                          </div>
                        </form>
                      )}

                      {/* Leave Form Panel */}
                      {showLeaveForm && (
                        <form onSubmit={handleAddLeaveSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <span className="font-bold text-indigo-600 block">Formulaire de demande d'absence</span>
                          <div className="grid grid-cols-3 gap-2">
                            <select value={leaveData.leaveType} onChange={e => setLeaveData({...leaveData, leaveType: e.target.value as any})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900">
                              <option value="Congé Annuel">Congé Annuel</option>
                              <option value="Maladie">Maladie</option>
                              <option value="Maternité">Maternité</option>
                              <option value="Circonstance">Circonstance</option>
                              <option value="Sans solde">Sans solde</option>
                            </select>
                            <input required type="text" placeholder="Début (Ex: 05/07/2026)" value={leaveData.startDate} onChange={e => setLeaveData({...leaveData, startDate: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                            <input required type="text" placeholder="Fin (Ex: 12/07/2026)" value={leaveData.endDate} onChange={e => setLeaveData({...leaveData, endDate: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                          </div>
                          <input required placeholder="Justification / Raison" value={leaveData.reason} onChange={e => setLeaveData({...leaveData, reason: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                          <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowLeaveForm(false)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold">Annuler</button>
                            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold">Soumettre</button>
                          </div>
                        </form>
                      )}

                      {/* Promotion Form Panel */}
                      {showPromotionForm && (
                        <form onSubmit={handleAddPromotionSubmit} className="p-3 bg-indigo-50/20 border border-indigo-100 rounded-xl space-y-3">
                          <span className="font-bold text-indigo-600 block">Saisir une promotion</span>
                          <div className="grid grid-cols-3 gap-2">
                            <input required placeholder="Nouvelle fonction" value={promotionData.newFunction} onChange={e => setPromotionData({...promotionData, newFunction: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                            <input required type="number" placeholder="Nouveau Salaire Base ($)" value={promotionData.newSalary || ""} onChange={e => setPromotionData({...promotionData, newSalary: Number(e.target.value)})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                            <input placeholder="Réf décision (Optionnel)" value={promotionData.decisionRef} onChange={e => setPromotionData({...promotionData, decisionRef: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                          </div>
                          <input required placeholder="Justification de la promotion" value={promotionData.reason} onChange={e => setPromotionData({...promotionData, reason: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                          <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowPromotionForm(false)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold">Annuler</button>
                            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold">Promouvoir l'agent</button>
                          </div>
                        </form>
                      )}

                      {/* Evaluation Form Panel */}
                      {showEvaluationForm && (
                        <form onSubmit={handleAddEvaluationSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <span className="font-bold text-indigo-600 block">Formulaire d'Évaluation de Performance</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-400 block">Note de rendement (0-100)</label>
                              <input required type="number" min={0} max={100} value={evaluationData.score} onChange={e => setEvaluationData({...evaluationData, score: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-400 block">Objectifs d'avenir</label>
                              <input required placeholder="Fixer les nouveaux buts..." value={evaluationData.objectives} onChange={e => setEvaluationData({...evaluationData, objectives: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                            </div>
                          </div>
                          <textarea required placeholder="Commentaires généraux du Préfet / Directeur..." value={evaluationData.comments} onChange={e => setEvaluationData({...evaluationData, comments: e.target.value})} rows={2} className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                          <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowEvaluationForm(false)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold">Annuler</button>
                            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold">Enregistrer l'évaluation</button>
                          </div>
                        </form>
                      )}

                      {/* Training Form Panel */}
                      {showTrainingForm && (
                        <form onSubmit={handleAddTrainingSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <span className="font-bold text-indigo-600 block">Inscrire à un programme de Formation</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input required placeholder="Nom du cours / de la formation" value={trainingData.trainingName} onChange={e => setTrainingData({...trainingData, trainingName: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                            <input required placeholder="Organisme de formation (Ex: INPP)" value={trainingData.provider} onChange={e => setTrainingData({...trainingData, provider: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                            <input required placeholder="Début (Ex: 05/07/2026)" value={trainingData.startDate} onChange={e => setTrainingData({...trainingData, startDate: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                            <input required placeholder="Fin (Ex: 08/07/2026)" value={trainingData.endDate} onChange={e => setTrainingData({...trainingData, endDate: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowTrainingForm(false)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold">Annuler</button>
                            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold">Confirmer l'inscription</button>
                          </div>
                        </form>
                      )}

                      {/* Mutation Form Panel */}
                      {showMutationForm && (
                        <form onSubmit={handleAddMutationSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <span className="font-bold text-indigo-600 block">Déclarer une Mutation d'établissement</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input required placeholder="Établissement d'origine" value={mutationData.oldLocation} onChange={e => setMutationData({...mutationData, oldLocation: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                            <input required placeholder="Établissement cible (Mutation)" value={mutationData.newLocation} onChange={e => setMutationData({...mutationData, newLocation: e.target.value})} className="p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                          </div>
                          <input required placeholder="Raison officielle de la mutation de poste" value={mutationData.reason} onChange={e => setMutationData({...mutationData, reason: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-white dark:bg-slate-900" />
                          <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowMutationForm(false)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold">Annuler</button>
                            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold">Déclarer Mutation</button>
                          </div>
                        </form>
                      )}

                      {/* ACTIVITY SUMMARY STATS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-xl space-y-1.5">
                          <span className="font-bold text-slate-400 block uppercase text-[8px]">Présences et assiduité</span>
                          <p>Pointages enregistrés : <strong>{empAttendances.length}</strong> aujourd'hui.</p>
                          <div className="max-h-24 overflow-y-auto divide-y divide-slate-100 text-[10px] text-slate-500 font-mono">
                            {empAttendances.map(a => <div key={a.id} className="py-1">Le {a.date} à {a.timeIn} ({a.status})</div>)}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-xl space-y-1.5">
                          <span className="font-bold text-slate-400 block uppercase text-[8px]">Évaluations & Congés enregistrés</span>
                          <p>Congés pris : <strong>{empLeaves.length}</strong>. Évaluations de rendement : <strong>{empEvaluations.length}</strong>.</p>
                          <p>Mutations : <strong>{empMutations.length}</strong>. Inscriptions formations : <strong>{empTrainings.length}</strong>.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex justify-between">
                <button
                  onClick={() => {
                    if (confirm(`Voulez-vous vraiment supprimer définitivement le dossier RH de ${emp.firstName} ${emp.lastName} ? Cette opération est irréversible.`)) {
                      onDeleteEmployee(emp.id);
                      onAddAuditLog("Suppression dossier RH", `${emp.firstName} ${emp.lastName}`);
                      setSelectedEmployee(null);
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Supprimer Dossier RH
                </button>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-6 rounded-xl font-bold transition-all text-xs cursor-pointer"
                >
                  Fermer la fiche
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
