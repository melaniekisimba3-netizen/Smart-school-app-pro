import React, { useState } from "react";
import { 
  Student, Parent, ClassRoom, Option, InscriptionAuditLog, StudentGuardianLink,
  UserAccount, Teacher, Employee
} from "../types";
import { searchParentsDatabase, generateParentAccountNumber } from "../context/SmartSchoolCoreContext";
import { OfficialLoginSheetModal } from "./OfficialLoginSheetModal";
import { 
  generateUniqueActivationCode, 
  persistUniversalUserAccount,
  getStoredUniversalUserAccounts
} from "../services/accountActivationService";
import { 
  Users, UserCheck, Plus, Search, Filter, Edit3, Trash2,
  Check, Sparkles, Clock, ShieldCheck, Building2, Eye, X, AlertCircle,
  School, Camera, Upload, AlertTriangle, ChevronRight, ArrowLeft, ArrowRight,
  KeyRound, User, CheckCircle2, Layers, BookOpen, GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PhotoUploadField } from "./common/PhotoUploadField";
import { saveUserProfilePhoto } from "../services/userPhotoService";
import { ParentDetailModal } from "./common/ParentDetailModal";
import { StudentDetailModal } from "./common/StudentDetailModal";
import { RelationshipManagerModal } from "./common/RelationshipManagerModal";

export interface PupilsViewProps {
  students: Student[];
  parents?: Parent[];
  onAddStudent: (student: Omit<Student, "id" | "registrationNumber"> & { registrationNumber?: string; hasUserAccount?: boolean; activationCode?: string; accountStatus?: any }) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddParent?: (parent: Omit<Parent, "id">) => Parent;
  onLinkParentToStudent?: (parentId: string, studentId: string, relationship: string, isPrimary?: boolean) => void;
  onUpdateParents?: React.Dispatch<React.SetStateAction<Parent[]>>;
  lang?: string;
  userRole?: string;
  userName?: string;
  auditLogs?: InscriptionAuditLog[];
  onValidateStudent?: (id: string) => void;
  classes?: ClassRoom[];
  options?: Option[];
  teachers?: Teacher[];
  employees?: Employee[];
  userAccounts?: UserAccount[];
  schoolId?: string;
  schoolName?: string;
}

function hasFullInscriptionRights(role: string): boolean {
  return ["Super Admin", "Directeur", "Préfet", "Comptable"].includes(role);
}

function isSecretary(role: string): boolean {
  return role === "Secrétariat" || role === "Secrétaire";
}

export function PupilsView({ 
  students, 
  parents = [],
  onAddStudent, 
  onEditStudent, 
  onDeleteStudent, 
  onAddParent,
  onLinkParentToStudent,
  onUpdateParents,
  lang = "fr",
  userRole = "Directeur",
  userName = "Direction",
  auditLogs = [],
  onValidateStudent = () => {},
  classes = [],
  options = [],
  teachers = [],
  employees = [],
  userAccounts = [],
  schoolId,
  schoolName
}: PupilsViewProps) {
  // Main view mode: "parcours" (Classes & Options first), "registre" (Full search registry), "audit" (Audit logs)
  const [activeViewMode, setActiveViewMode] = useState<"parcours" | "registre" | "audit">("parcours");

  // Selection state for hierarchical navigation
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<string | null>(null);
  const [selectedOptionFilter, setSelectedOptionFilter] = useState<string>("all");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("all");

  // Registry filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [photoFilter, setPhotoFilter] = useState<"all" | "missing" | "has_photo">("all");

  // Modal states
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [autoCreateAccount, setAutoCreateAccount] = useState(true);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [address, setAddress] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  // Guardian / Parent Relational Management
  const [attachedGuardians, setAttachedGuardians] = useState<StudentGuardianLink[]>([]);
  const [isParentSearchModalOpen, setIsParentSearchModalOpen] = useState(false);
  const [parentSearchQuery, setParentSearchQuery] = useState("");
  const [parentSearchTab, setParentSearchTab] = useState<"search" | "create">("search");

  // New Parent Form fields for quick creation during registration
  const [newPLastName, setNewPLastName] = useState("");
  const [newPFirstName, setNewPFirstName] = useState("");
  const [newPPhone, setNewPPhone] = useState("");
  const [newPEmail, setNewPEmail] = useState("");
  const [newPAddress, setNewPAddress] = useState("");
  const [newPRelationship, setNewPRelationship] = useState("Tuteur légal");
  const [newPIsPrimary, setNewPIsPrimary] = useState(true);

  const availableClasses = classes.length > 0 
    ? classes.map(c => c.name || `${c.classGrade || c.level} ${c.roomLetter}`.trim()).filter(Boolean) 
    : [];
  
  const activeOptions = options.length > 0
    ? options.filter(o => o.isActivated !== false).map(o => o.name)
    : ["Mathématiques-Physique", "Commerciale et Gestion", "Pédagogie Générale", "Électricité", "Nutrition", "Néant"];

  const [className, setClassName] = useState("");
  const [optionName, setOptionName] = useState("");

  React.useEffect(() => {
    if (availableClasses.length > 0 && !className) {
      setClassName(availableClasses[0]);
    }
  }, [classes]);

  React.useEffect(() => {
    if (activeOptions.length > 0 && !optionName) {
      setOptionName(activeOptions[0]);
    }
  }, [options]);

  const [studentStatus, setStudentStatus] = useState<Student["status"]>("Validé");
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedStudentForSheet, setSelectedStudentForSheet] = useState<UserAccount | null>(null);

  // Detailed Modal states (Student Dossier & Parent Profile)
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<string | null>(null);
  const [selectedParentForDetail, setSelectedParentForDetail] = useState<Parent | null>(null);
  const [relationshipModalTarget, setRelationshipModalTarget] = useState<{ type: "parent" | "student" | "class"; entity: any } | null>(null);

  // Permission helpers
  const isAuthorized = hasFullInscriptionRights(userRole);
  const isSec = isSecretary(userRole);
  const canEnroll = isAuthorized || isSec;

  // Set default status when form opens
  React.useEffect(() => {
    if (isAdding) {
      setStudentStatus(isAuthorized ? "Validé" : "Brouillon");
      setPhotoUrl("");
      setAttachedGuardians([]);
      setAutoCreateAccount(true);
    }
  }, [isAdding, userRole]);

  // Open Student Access Sheet (READ-ONLY: strictly loads credentials without Firestore writes or notifications)
  const openStudentAccessSheet = (s: Student) => {
    // 1. Retrieve account from persistent store if present
    const storedAccounts = getStoredUniversalUserAccounts();
    const existingAcc = storedAccounts.find(
      a => a.dossierId === s.id || (a.username && a.username.toLowerCase() === s.registrationNumber.toLowerCase())
    );

    // 2. Build in-memory user account payload for display (NO MUTATION, NO DB WRITE)
    const userAcc: UserAccount = existingAcc ? {
      ...existingAcc,
      photoUrl: s.photoUrl || (existingAcc as any).photoUrl
    } : {
      id: `acc-elv-${s.id}`,
      dossierId: s.id,
      dossierType: "eleve",
      fullName: `${s.lastName.toUpperCase()} ${s.firstName}`,
      username: s.registrationNumber,
      role: "Élève",
      functionTitle: `Classe: ${s.className}${s.optionName && s.optionName !== "Tronc Commun" && s.optionName !== "Néant" ? ` • Option: ${s.optionName}` : ""}`,
      activationCode: s.activationCode || generateUniqueActivationCode("ELEVE"),
      phone: s.parentPhone,
      email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@smartschool.cd`,
      isActive: true,
      isActivated: s.accountStatus === "active",
      schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
      targetPortalTab: "eleves",
      createdAt: s.createdAtDate || new Date().toLocaleDateString("fr-FR"),
      photoUrl: s.photoUrl
    } as any;

    // 3. Directly open modal without triggering onEditStudent or persistUniversalUserAccount
    setSelectedStudentForSheet(userAcc);
  };

  // Account creation logic (Performs account generation, Firestore persistence and confirmation)
  const handleCreateStudentAccount = (s: Student) => {
    const generatedCode = s.activationCode || generateUniqueActivationCode("ELEVE");
    const updatedStudent: Student = {
      ...s,
      hasUserAccount: true,
      accountStatus: "pending_activation",
      activationCode: generatedCode
    };
    onEditStudent(updatedStudent);

    const userAcc: UserAccount = {
      id: `acc-elv-${s.id}`,
      dossierId: s.id,
      dossierType: "eleve",
      fullName: `${s.lastName.toUpperCase()} ${s.firstName}`,
      username: s.registrationNumber,
      role: "Élève",
      functionTitle: `Classe: ${s.className}${s.optionName && s.optionName !== "Tronc Commun" && s.optionName !== "Néant" ? ` • Option: ${s.optionName}` : ""}`,
      activationCode: generatedCode,
      phone: s.parentPhone,
      email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@smartschool.cd`,
      isActive: true,
      isActivated: false,
      schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
      targetPortalTab: "eleves",
      createdAt: new Date().toLocaleDateString("fr-FR"),
      photoUrl: s.photoUrl
    } as any;
    persistUniversalUserAccount(userAcc);
    setSelectedStudentForSheet(userAcc);
  };

  const getUniqueClasses = () => {
    const studentClasses = students.map(s => s.className);
    const createdClasses = classes.map(c => `${c.classGrade || c.level} ${c.roomLetter}`);
    return Array.from(new Set([...studentClasses, ...createdClasses]));
  };

  // Filtered students for global registry
  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.firstName} ${s.lastName} ${s.registrationNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || s.className === classFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesPhoto = photoFilter === "all" || 
      (photoFilter === "missing" && !s.photoUrl) || 
      (photoFilter === "has_photo" && !!s.photoUrl);
    return matchesSearch && matchesClass && matchesStatus && matchesPhoto;
  });

  // Filtered students for hierarchical class view
  const classRosterStudents = students.filter(s => {
    if (!selectedClassForRoster) return false;
    const matchesClass = s.className === selectedClassForRoster;
    const matchesOpt = selectedOptionFilter === "all" || s.optionName === selectedOptionFilter;
    return matchesClass && matchesOpt;
  });

  // Determine Level Category for class
  const getLevelForClass = (clsName: string): "Maternelle" | "Primaire" | "Secondaire" => {
    const lower = clsName.toLowerCase();
    if (lower.includes("section") || lower.includes("maternelle")) return "Maternelle";
    if (lower.includes("année") && !lower.includes("humanit")) return "Primaire";
    return "Secondaire";
  };

  // Group classes for the card grid
  const allKnownClasses = getUniqueClasses().map(clsName => {
    const matchedClassRoom = classes.find(c => `${c.classGrade || c.level} ${c.roomLetter}` === clsName);
    const enrolledStudents = students.filter(s => s.className === clsName);
    const maleCount = enrolledStudents.filter(s => s.gender === "M").length;
    const femaleCount = enrolledStudents.filter(s => s.gender === "F").length;
    const validatedCount = enrolledStudents.filter(s => s.status === "Validé" || s.status === "Actif").length;
    const accountCount = enrolledStudents.filter(s => s.hasUserAccount).length;
    const levelCat = matchedClassRoom?.levelCategory || getLevelForClass(clsName);
    const capacity = matchedClassRoom?.maxStudents || 45;
    const defaultOption = matchedClassRoom?.optionName || (enrolledStudents[0]?.optionName) || "Tronc Commun";

    return {
      className: clsName,
      levelCategory: levelCat,
      optionName: defaultOption,
      capacity,
      enrolledCount: enrolledStudents.length,
      maleCount,
      femaleCount,
      validatedCount,
      accountCount,
      mainTeacher: matchedClassRoom?.classTeacherName || "Titulaire assigné"
    };
  });

  const filteredClassCards = allKnownClasses.filter(c => {
    if (selectedLevelFilter !== "all" && c.levelCategory !== selectedLevelFilter) return false;
    if (selectedOptionFilter !== "all" && c.optionName !== selectedOptionFilter) return false;
    return true;
  });

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const primaryG = attachedGuardians.find(g => g.isPrimary) || attachedGuardians[0];
    const finalParentName = primaryG ? primaryG.parentName : (parentName || "Parent non renseigné");
    const finalParentPhone = primaryG ? primaryG.parentPhone : (parentPhone || "+243 000 000 000");
    const finalParentAcc = primaryG ? primaryG.parentAccountNumber : undefined;
    const parentIds = attachedGuardians.map(g => g.parentId).filter(Boolean) as string[];
    const primaryParentId = primaryG?.parentId;

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        firstName, 
        lastName, 
        birthDate, 
        gender, 
        address, 
        parentName: finalParentName, 
        parentPhone: finalParentPhone, 
        parentAccountNumber: finalParentAcc,
        guardians: attachedGuardians,
        parentIds,
        primaryParentId,
        className, 
        optionName,
        status: studentStatus,
        photoUrl: photoUrl || undefined
      };
      onEditStudent(updated);

      if (autoCreateAccount && !editingStudent.hasUserAccount) {
        handleCreateStudentAccount(updated);
      }
      setEditingStudent(null);
    } else {
      const generatedMatricule = `RDC-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedCode = generateUniqueActivationCode("ELEVE");

      const newStudentPayload = {
        registrationNumber: generatedMatricule,
        firstName, 
        lastName, 
        birthDate, 
        gender, 
        address, 
        parentName: finalParentName, 
        parentPhone: finalParentPhone, 
        parentAccountNumber: finalParentAcc,
        guardians: attachedGuardians,
        parentIds,
        primaryParentId,
        className, 
        optionName, 
        status: studentStatus,
        photoUrl: photoUrl || undefined,
        hasUserAccount: autoCreateAccount,
        activationCode: autoCreateAccount ? generatedCode : undefined,
        accountStatus: autoCreateAccount ? ("pending_activation" as const) : undefined
      };

      onAddStudent(newStudentPayload);

      if (autoCreateAccount) {
        const userAcc: UserAccount = {
          id: `acc-elv-${Date.now()}`,
          dossierId: `std-${Date.now()}`,
          dossierType: "eleve",
          fullName: `${lastName.toUpperCase()} ${firstName}`,
          username: generatedMatricule,
          role: "Élève",
          activationCode: generatedCode,
          phone: finalParentPhone,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@smartschool.cd`,
          isActive: true,
          isActivated: false,
          schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
          targetPortalTab: "eleves",
          createdAt: new Date().toLocaleDateString("fr-FR"),
          photoUrl: photoUrl || undefined
        };
        persistUniversalUserAccount(userAcc);
        if (photoUrl) {
          saveUserProfilePhoto({
            targetId: generatedMatricule,
            photoUrl: photoUrl,
            schoolId: schoolId || "sch-141992",
            role: "Élève",
            actorName: userName
          }).catch(console.error);
        }
        setSelectedStudentForSheet(userAcc);
      }

      setIsAdding(false);
    }

    // Reset Form
    setFirstName(""); setLastName(""); setBirthDate(""); setAddress(""); setParentName(""); setParentPhone(""); setPhotoUrl("");
    setAttachedGuardians([]);
  };

  const startEdit = (s: Student) => {
    setEditingStudent(s);
    setFirstName(s.firstName);
    setLastName(s.lastName);
    setBirthDate(s.birthDate);
    setGender(s.gender);
    setAddress(s.address);
    setParentName(s.parentName);
    setParentPhone(s.parentPhone);
    setClassName(s.className);
    setOptionName(s.optionName);
    setStudentStatus(s.status);
    setPhotoUrl(s.photoUrl || "");
    setAutoCreateAccount(!s.hasUserAccount);
    if (s.guardians && s.guardians.length > 0) {
      setAttachedGuardians(s.guardians);
    } else if (s.parentName) {
      setAttachedGuardians([{
        parentId: s.primaryParentId || `par-${s.id}`,
        parentAccountNumber: s.parentAccountNumber || "PAR-2026-0001",
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        relationshipType: "Tuteur légal",
        isPrimary: true
      }]);
    } else {
      setAttachedGuardians([]);
    }
  };

  const openEnrollForClass = (clsName: string, optName?: string) => {
    setClassName(clsName);
    if (optName && optName !== "Tronc Commun") {
      setOptionName(optName);
    }
    setEditingStudent(null);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestion & Inscriptions des Élèves
            </h2>
            <span className="bg-brand-blue/10 text-brand-blue dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {students.length} Élève(s) au Registre
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Parcours hiérarchique par classe et option, création immédiate des fiches de connexion officielles et gestion des effectifs.
          </p>
        </div>
        
        {canEnroll && (
          <button
            onClick={() => { 
              setEditingStudent(null);
              setIsAdding(true); 
            }}
            className="text-xs bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold px-4.5 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center space-x-1.5 self-start md:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>{isSec ? "Préparer une inscription" : "Nouvelle inscription d'élève"}</span>
          </button>
        )}
      </div>

      {/* PHOTO REMINDER BANNER */}
      {students.filter(s => !s.photoUrl).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 p-4 rounded-2xl border border-amber-200/55 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 dark:text-amber-200">Alerte Registre & Dossiers Photos</h4>
              <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                Il y a <strong className="font-black text-amber-600 dark:text-amber-400">{students.filter(s => !s.photoUrl).length} élève(s)</strong> sans photo de profil officielle. Cliquez sur le dossier pour capturer ou joindre la photo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {photoFilter !== "missing" ? (
              <button
                onClick={() => {
                  setActiveViewMode("registre");
                  setPhotoFilter("missing");
                }}
                className="px-3 py-1.5 bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600 text-white font-bold rounded-lg transition-all text-[11px] cursor-pointer"
              >
                Voir les dossiers sans photo
              </button>
            ) : (
              <button
                onClick={() => setPhotoFilter("all")}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-all text-[11px] cursor-pointer"
              >
                Tout afficher
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* TOP LEVEL NAVIGATION MODES */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setActiveViewMode("parcours");
            setSelectedClassForRoster(null);
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeViewMode === "parcours"
              ? "border-brand-blue text-brand-blue dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Parcours par Classes & Options</span>
        </button>

        <button
          onClick={() => setActiveViewMode("registre")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeViewMode === "registre"
              ? "border-brand-blue text-brand-blue dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Répertoire Général Complet ({students.length})</span>
        </button>

        {isAuthorized && (
          <button
            onClick={() => setActiveViewMode("audit")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeViewMode === "audit"
                ? "border-brand-blue text-brand-blue dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Journal d'Audit National ({auditLogs.length})</span>
          </button>
        )}
      </div>

      {/* VIEW 1: PARCOURS PAR CLASSES & OPTIONS */}
      {activeViewMode === "parcours" && (
        <div className="space-y-5">
          {/* If no class is selected: Grid of classes */}
          {!selectedClassForRoster ? (
            <div className="space-y-4">
              {/* Level and Option Filters Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Niveau :
                  </span>
                  {[
                    { id: "all", label: "Tous les Niveaux" },
                    { id: "Maternelle", label: "Maternelle" },
                    { id: "Primaire", label: "Primaire" },
                    { id: "Secondaire", label: "Secondaire & Humanités" }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedLevelFilter(lvl.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        selectedLevelFilter === lvl.id
                          ? "bg-brand-blue text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Option :</span>
                  <select
                    value={selectedOptionFilter}
                    onChange={(e) => setSelectedOptionFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
                  >
                    <option value="all">Toutes les options</option>
                    {activeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClassCards.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                    <Building2 className="h-8 w-8 mx-auto opacity-40 text-slate-400" />
                    <p className="text-xs font-semibold">Aucune classe ne correspond aux filtres sélectionnés.</p>
                  </div>
                ) : (
                  filteredClassCards.map(c => {
                    const pct = Math.min(100, Math.round((c.enrolledCount / c.capacity) * 100));
                    const isMaternelle = c.levelCategory === "Maternelle";
                    const isPrimaire = c.levelCategory === "Primaire";
                    const badgeColor = isMaternelle ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300" :
                                      isPrimaire ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" :
                                      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";

                    return (
                      <motion.div
                        key={c.className}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                        className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand-blue/50 transition-all text-left"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColor}`}>
                              {c.levelCategory}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {c.enrolledCount} / {c.capacity} places
                            </span>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                              {c.className}
                            </h3>
                            <p className="text-xs text-brand-blue dark:text-blue-400 font-semibold mt-0.5">
                              {c.optionName}
                            </p>
                          </div>

                          {/* Capacity progress bar */}
                          <div className="space-y-1 pt-1">
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"}`} 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                              <span>👦 Garçons: {c.maleCount}</span>
                              <span>👧 Filles: {c.femaleCount}</span>
                              <span>🔑 Comptes: {c.accountCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => openEnrollForClass(c.className, c.optionName)}
                            className="text-[11px] font-bold text-brand-blue hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Inscrire</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedClassForRoster(c.className)}
                            className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-brand-blue dark:hover:bg-blue-600 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>Voir les élèves ({c.enrolledCount})</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* CLASS ROSTER DRILL-DOWN VIEW */
            <div className="space-y-4">
              {/* Breadcrumb Header */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedClassForRoster(null)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Revenir à la liste des classes"
                  >
                    <ArrowLeft className="h-4.5 w-4.5" />
                  </button>
                  <div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-semibold">
                      <span>Classes</span>
                      <span>/</span>
                      <span className="text-slate-600 dark:text-slate-300 font-bold">{getLevelForClass(selectedClassForRoster)}</span>
                      <span>/</span>
                      <span className="text-brand-blue font-extrabold">{selectedClassForRoster}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Liste des Élèves de la classe : {selectedClassForRoster}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEnrollForClass(selectedClassForRoster)}
                    className="text-xs bg-brand-blue hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Inscrire dans cette classe</span>
                  </button>
                </div>
              </div>

              {/* Class Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Effectif Total</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {classRosterStudents.length} élèves
                  </div>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Répartition Genre</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    👦 {classRosterStudents.filter(s => s.gender === "M").length} M · 👧 {classRosterStudents.filter(s => s.gender === "F").length} F
                  </div>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dossiers Validés</span>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ✅ {classRosterStudents.filter(s => s.status === "Validé" || s.status === "Actif").length} confirmés
                  </div>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Comptes d'Accès Créés</span>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    🔑 {classRosterStudents.filter(s => s.hasUserAccount).length} portails actifs
                  </div>
                </div>
              </div>

              {/* DESKTOP TABLE FOR CLASS ROSTER */}
              <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden text-left">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Matricule</th>
                      <th className="py-3.5 px-4">Nom Complet</th>
                      <th className="py-3.5 px-4">Genre</th>
                      <th className="py-3.5 px-4">Option</th>
                      <th className="py-3.5 px-4">Tuteur Principal</th>
                      <th className="py-3.5 px-4">Statut Dossier</th>
                      <th className="py-3.5 px-4 text-right">Actions & Accès</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {classRosterStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Aucun élève inscrit dans cette classe pour le moment.
                        </td>
                      </tr>
                    ) : (
                      classRosterStudents.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                          <td className="py-3.5 px-4 font-mono font-bold text-brand-blue dark:text-blue-400">
                            {s.registrationNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div 
                                onClick={() => setSelectedStudentForDetail(s.id)}
                                className="relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                {s.photoUrl ? (
                                  <img 
                                    src={s.photoUrl} 
                                    alt={`${s.lastName} ${s.firstName}`} 
                                    className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-850" 
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border-2 border-dashed border-amber-300 dark:border-amber-800 text-amber-500">
                                    <Camera className="h-4.5 w-4.5" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentForDetail(s.id)}
                                  className="font-bold text-slate-900 dark:text-white block hover:text-brand-blue dark:hover:text-blue-400 transition-colors text-left cursor-pointer"
                                >
                                  {s.lastName} {s.firstName}
                                </button>
                                <span className="text-[10px] text-slate-400">{s.birthDate || "Date non spécifiée"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold">{s.gender}</td>
                          <td className="py-3.5 px-4">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {s.optionName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                const p = parents.find(x => x.id === s.primaryParentId || (s.parentPhone && x.phone === s.parentPhone) || (s.parentName && `${x.lastName} ${x.firstName}`.toLowerCase() === s.parentName.toLowerCase()));
                                if (p) setSelectedParentForDetail(p);
                              }}
                              className="font-semibold text-slate-800 dark:text-slate-200 block hover:text-brand-blue transition-colors text-left cursor-pointer"
                            >
                              {s.parentName || "Non spécifié"}
                            </button>
                            <span className="text-[10px] text-slate-400">{s.parentPhone || "—"}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              s.status === "Validé" || s.status === "Actif" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400" :
                              s.status === "En attente" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400" :
                              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* DEDICATED VOIR FICHE BUTTON */}
                              <button
                                type="button"
                                onClick={() => setSelectedStudentForDetail(s.id)}
                                className="text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all flex items-center space-x-1 cursor-pointer"
                                title="Voir le dossier complet de l'élève"
                              >
                                <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>Fiche élève</span>
                              </button>

                              {s.hasUserAccount ? (
                                <button
                                  type="button"
                                  onClick={() => openStudentAccessSheet(s)}
                                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                                  title="Consulter la fiche d'accès officielle (Lecture seule)"
                                >
                                  <KeyRound className="h-3.5 w-3.5" />
                                  <span>Accès</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCreateStudentAccount(s)}
                                  className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                                  title="Générer les identifiants et le code d'activation pour le portail Élève"
                                >
                                  <KeyRound className="h-3.5 w-3.5" />
                                  <span>Créer</span>
                                </button>
                              )}
                              <button
                                onClick={() => startEdit(s)}
                                className="p-1.5 text-slate-400 hover:text-brand-blue rounded-lg cursor-pointer transition-colors"
                                title="Modifier"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onDeleteStudent(s.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS FOR CLASS ROSTER */}
              <div className="block lg:hidden space-y-3">
                {classRosterStudents.length === 0 ? (
                  <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                    Aucun élève dans cette classe.
                  </div>
                ) : (
                  classRosterStudents.map(s => (
                    <div 
                      key={s.id} 
                      className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <div className="relative shrink-0">
                            {s.photoUrl ? (
                              <img src={s.photoUrl} alt="" className="h-11 w-11 rounded-xl object-cover border border-slate-200" />
                            ) : (
                              <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-dashed border-amber-300 text-amber-500">
                                <Camera className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {s.lastName} {s.firstName}
                            </h4>
                            <span className="text-xs font-mono font-bold text-brand-blue dark:text-blue-400">
                              {s.registrationNumber}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === "Validé" || s.status === "Actif" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Option:</span>
                          <span className="font-bold">{s.optionName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Parent:</span>
                          <span className="font-semibold">{s.parentName} ({s.parentPhone})</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => s.hasUserAccount ? openStudentAccessSheet(s) : handleCreateStudentAccount(s)}
                          className={`min-h-[44px] flex-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                            s.hasUserAccount 
                              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800" 
                              : "text-white bg-indigo-600 hover:bg-indigo-700"
                          }`}
                        >
                          <KeyRound className="h-4 w-4" />
                          <span>{s.hasUserAccount ? "Fiche d'accès" : "Créer compte"}</span>
                        </button>
                        <button
                          onClick={() => startEdit(s)}
                          className="min-h-[44px] px-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: RÉPERTOIRE GÉNÉRAL COMPLET */}
      {activeViewMode === "registre" && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm text-left">
            <div className="relative sm:col-span-2 md:col-span-2">
              <Search className="absolute inset-y-0 left-3 h-4 w-4 text-slate-400 flex items-center my-auto" />
              <input
                type="text"
                placeholder="Rechercher par Nom, Prénom ou Matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
            <div>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none font-semibold"
              >
                <option value="all">Toutes les classes</option>
                {getUniqueClasses().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none font-semibold"
              >
                <option value="all">Tous les statuts</option>
                <option value="Brouillon">Brouillon</option>
                <option value="En attente">En attente</option>
                <option value="À compléter">À compléter</option>
                <option value="Validé">Validé</option>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Archivé">Archivé</option>
              </select>
            </div>
            <div>
              <select
                value={photoFilter}
                onChange={(e) => setPhotoFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none font-semibold"
              >
                <option value="all">Filtre Photo (Tous)</option>
                <option value="has_photo">Avec photo de profil</option>
                <option value="missing">Sans photo ⚠️</option>
              </select>
            </div>
          </div>

          {/* DESKTOP TABLE FOR ALL STUDENTS */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden text-left">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Matricule</th>
                  <th className="py-3.5 px-4">Nom Complet</th>
                  <th className="py-3.5 px-4">Genre</th>
                  <th className="py-3.5 px-4">Classe & Option</th>
                  <th className="py-3.5 px-4">Parent / Tuteur</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions & Portail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Aucun élève trouvé dans le registre pour cette recherche.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isPending = ["Brouillon", "En attente", "À compléter"].includes(s.status);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-blue dark:text-blue-400">
                          {s.registrationNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              onClick={() => setSelectedStudentForDetail(s.id)}
                              className="relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              {s.photoUrl ? (
                                <img src={s.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="h-9 w-9 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border-2 border-dashed border-amber-300 text-amber-500">
                                  <Camera className="h-4.5 w-4.5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedStudentForDetail(s.id)}
                                className="font-bold text-slate-900 dark:text-white block hover:text-brand-blue dark:hover:text-blue-400 transition-colors text-left cursor-pointer"
                              >
                                {s.lastName} {s.firstName}
                              </button>
                              {!s.photoUrl && (
                                <span className="inline-flex items-center text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 px-1.5 py-0.2 rounded mt-0.5">
                                  ⚠️ Photo manquante
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold">{s.gender}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{s.className}</span>
                          <span className="text-[10px] text-slate-400">{s.optionName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              const p = parents.find(x => x.id === s.primaryParentId || (s.parentPhone && x.phone === s.parentPhone) || (s.parentName && `${x.lastName} ${x.firstName}`.toLowerCase() === s.parentName.toLowerCase()));
                              if (p) setSelectedParentForDetail(p);
                            }}
                            className="font-medium text-slate-700 dark:text-slate-300 block hover:text-brand-blue transition-colors text-left cursor-pointer"
                          >
                            {s.parentName || "Non spécifié"}
                          </button>
                          <span className="text-[10px] text-slate-400">{s.parentPhone || "—"}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            s.status === "Validé" || s.status === "Actif" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400" :
                            s.status === "En attente" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400" :
                            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* DEDICATED VOIR FICHE BUTTON */}
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForDetail(s.id)}
                              className="text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 transition-all flex items-center space-x-1 cursor-pointer"
                              title="Voir le dossier complet de l'élève"
                            >
                              <Eye className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                              <span>Fiche</span>
                            </button>

                            {isPending && isAuthorized && (
                              <button
                                onClick={() => onValidateStudent(s.id)}
                                className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded transition-colors flex items-center space-x-0.5 cursor-pointer"
                                title="Valider l'inscription"
                              >
                                <Check className="h-3 w-3" />
                                <span>Valider</span>
                              </button>
                            )}

                            {s.hasUserAccount ? (
                              <button
                                type="button"
                                onClick={() => openStudentAccessSheet(s)}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                                title="Consulter la fiche d'accès officielle (Lecture seule)"
                              >
                                <KeyRound className="h-3 w-3" />
                                <span>Fiche d'accès</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCreateStudentAccount(s)}
                                className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                                title="Générer compte et code d'activation"
                              >
                                <KeyRound className="h-3 w-3" />
                                <span>Créer compte</span>
                              </button>
                            )}

                            <button
                              onClick={() => startEdit(s)}
                              className="p-1 text-slate-400 hover:text-brand-blue rounded transition-colors cursor-pointer"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteStudent(s.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS FOR GLOBAL REGISTRY */}
          <div className="block lg:hidden space-y-3 text-left">
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Aucun élève trouvé.
              </div>
            ) : (
              filteredStudents.map(s => (
                <div 
                  key={s.id} 
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="relative shrink-0">
                        {s.photoUrl ? (
                          <img src={s.photoUrl} alt="" className="h-11 w-11 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-dashed border-amber-300 text-amber-500">
                            <Camera className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {s.lastName} {s.firstName}
                        </h4>
                        <span className="text-xs font-mono font-bold text-brand-blue dark:text-blue-400">
                          {s.registrationNumber}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === "Validé" || s.status === "Actif" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Classe:</span>
                      <span className="font-bold">{s.className} ({s.optionName})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Parent:</span>
                      <span className="font-semibold">{s.parentName} - {s.parentPhone}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => s.hasUserAccount ? openStudentAccessSheet(s) : handleCreateStudentAccount(s)}
                      className={`min-h-[44px] flex-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        s.hasUserAccount 
                          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800" 
                          : "text-white bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      <KeyRound className="h-4 w-4" />
                      <span>{s.hasUserAccount ? "Fiche d'accès" : "Créer compte"}</span>
                    </button>
                    <button
                      onClick={() => startEdit(s)}
                      className="min-h-[44px] px-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: JOURNAL D'AUDIT NATIONAL */}
      {activeViewMode === "audit" && (
        <div className="space-y-4 text-left">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-blue" />
              <span>Souveraineté des données d'inscription & Traçabilité (Audit Trail)</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Toutes les inscriptions, validations et modifications de dossiers élèves sont auditées et conservées au niveau institutionnel.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Élève Concerné</th>
                    <th className="py-3 px-4">Opérateur</th>
                    <th className="py-3 px-4">Rôle</th>
                    <th className="py-3 px-4">Adresse IP</th>
                    <th className="py-3 px-4">Action Effectuée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-[11px]">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-300">
                        {log.date} - {log.time}
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-blue dark:text-blue-400">
                        {log.studentName}
                      </td>
                      <td className="py-3 px-4">{log.actorName}</td>
                      <td className="py-3 px-4 uppercase">{log.actorRole}</td>
                      <td className="py-3 px-4">{log.ipAddress}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          log.action.includes("Valid") ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          {log.action}
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

      {/* STUDENT REGISTRATION / EDIT MODAL */}
      {(isAdding || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white text-base">
                  {editingStudent ? `Modifier le dossier de ${editingStudent.firstName} ${editingStudent.lastName}` : isSec ? "Préparer un dossier d'inscription" : "Nouvelle Inscription d'Élève"}
                </h3>
                <p className="text-[11px] text-slate-400">Génération automatique des identifiants et fiche d'accès officielle.</p>
              </div>
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); setEditingStudent(null); }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Photo de profil */}
              <PhotoUploadField
                label="Photo d'identité de l'élève (Facultative)"
                value={photoUrl}
                onChange={(photo) => setPhotoUrl(photo)}
                helperText="Téléversez le portrait officiel de l'élève (depuis téléphone ou ordinateur)"
                previewSize="md"
                id="student-photo-upload"
              />

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nom de famille *</label>
                  <input required placeholder="ex: KASONGO" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Prénom *</label>
                  <input required placeholder="ex: Patrick" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Date de naissance *</label>
                  <input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Genre *</label>
                  <select value={gender} onChange={e => setGender(e.target.value as "M" | "F")} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Adresse résidentielle *</label>
                <input required placeholder="ex: Av. Colonel Mondjiba n°42, Ngaliema, Kinshasa" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
              </div>

              {/* Class & Option */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Classe *</label>
                  <select 
                    value={className} 
                    onChange={e => {
                      const val = e.target.value;
                      setClassName(val);
                      const matchedClass = classes.find(c => `${c.classGrade || c.level} ${c.roomLetter}` === val);
                      if (matchedClass && matchedClass.optionName && matchedClass.optionName !== "Néant") {
                        setOptionName(matchedClass.optionName);
                      }
                    }} 
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-semibold"
                  >
                    {availableClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Option / Filière *</label>
                  <select value={optionName} onChange={e => setOptionName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-semibold">
                    {activeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="Tronc Commun">Tronc Commun</option>
                  </select>
                </div>
              </div>

              {/* PARENTS & GUARDIANS RATTACHEMENT */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand-blue" />
                    Responsable Légal / Parent Tuteur
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsParentSearchModalOpen(true);
                      setParentSearchQuery("");
                      setParentSearchTab("search");
                    }}
                    className="text-[11px] bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue dark:text-blue-400 font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="h-3 w-3" />
                    <span>Associer Parent Existant</span>
                  </button>
                </div>

                {attachedGuardians.length > 0 ? (
                  <div className="space-y-1.5">
                    {attachedGuardians.map((g, idx) => (
                      <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{g.parentName}</span>
                            <span className="text-[10px] text-brand-blue bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded font-mono font-bold">
                              {g.parentAccountNumber || "PAR-2026-X"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">📞 {g.parentPhone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachedGuardians(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 p-1 hover:bg-red-50 rounded"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Nom complet du Tuteur *</label>
                      <input
                        required
                        placeholder="ex: KASONGO Jean-Pierre"
                        value={parentName}
                        onChange={e => setParentName(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Téléphone (WhatsApp / SMS) *</label>
                      <input
                        required
                        placeholder="ex: +243 812 345 678"
                        value={parentPhone}
                        onChange={e => setParentPhone(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Statut de l'inscription</label>
                <select 
                  value={studentStatus} 
                  onChange={e => setStudentStatus(e.target.value as any)} 
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-semibold"
                >
                  <option value="Validé">Validé (Inscription Officielle)</option>
                  <option value="En attente">En attente (Pour validation)</option>
                  <option value="Brouillon">Brouillon</option>
                  <option value="À compléter">À compléter</option>
                  <option value="Actif">Actif</option>
                </select>
              </div>

              {/* AUTOMATIC ACCOUNT CREATION CHECKBOX */}
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="autoCreateAccountStudent"
                  checked={autoCreateAccount}
                  onChange={e => setAutoCreateAccount(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="autoCreateAccountStudent" className="cursor-pointer space-y-0.5">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 block text-xs flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                    Créer le compte d'accès élève & afficher la Fiche Officielle immédiatement
                  </span>
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-300 block leading-tight">
                    Génère le matricule unique RDC, le code d'activation sécurisé et ouvre directement la Fiche d'Accès A4 prête pour impression ou partage WhatsApp/SMS.
                  </span>
                </label>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingStudent(null); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {editingStudent ? "Enregistrer les modifications" : "Valider l'Inscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PARENT SEARCH MODAL */}
      {isParentSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-3 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-blue" />
                Rattachement d'un Parent / Tuteur
              </h3>
              <button onClick={() => setIsParentSearchModalOpen(false)} className="text-slate-400 p-1 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par Nom, Prénom, N° Téléphone..."
                  value={parentSearchQuery}
                  onChange={e => setParentSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchParentsDatabase(parents, parentSearchQuery).length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">Aucun parent trouvé.</p>
                ) : (
                  searchParentsDatabase(parents, parentSearchQuery).map(p => (
                    <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs block">{p.lastName} {p.firstName}</span>
                        <span className="text-[10px] text-slate-400">📞 {p.phone} · {p.parentAccountNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const link: StudentGuardianLink = {
                            parentId: p.id,
                            parentAccountNumber: p.parentAccountNumber || `PAR-2026-${p.id}`,
                            parentName: `${p.lastName} ${p.firstName}`,
                            parentPhone: p.phone,
                            parentEmail: p.email,
                            relationshipType: p.relationship || "Tuteur légal",
                            isPrimary: true
                          };
                          setAttachedGuardians([link]);
                          setParentName(`${p.lastName} ${p.firstName}`);
                          setParentPhone(p.phone);
                          setIsParentSearchModalOpen(false);
                        }}
                        className="px-3 py-1 bg-brand-blue text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                      >
                        Associer
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL LOGIN SHEET MODAL */}
      {selectedStudentForSheet && (
        <OfficialLoginSheetModal
          account={selectedStudentForSheet}
          photoUrl={(selectedStudentForSheet as any).photoUrl || students.find(s => s.id === selectedStudentForSheet.dossierId || s.registrationNumber === selectedStudentForSheet.username)?.photoUrl}
          onClose={() => setSelectedStudentForSheet(null)}
          schoolName="COMPLEXE SCOLAIRE SMARTSCHOOL RDC"
          creatorName={userName}
          creatorRole={userRole}
        />
      )}

      {/* DETAILED STUDENT DOSSIER MODAL */}
      <StudentDetailModal
        isOpen={!!selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        studentId={selectedStudentForDetail}
        students={students}
        parents={parents}
        classes={classes}
        schoolId={schoolId}
        schoolName={schoolName}
        onOpenParentFile={(parentId) => {
          const p = parents.find(x => x.id === parentId || x.parentAccountNumber === parentId);
          if (p) setSelectedParentForDetail(p);
        }}
        onOpenRelationshipManager={(s) => {
          setRelationshipModalTarget({ type: "student", entity: s });
        }}
        onOpenLoginSheet={(s) => {
          openStudentAccessSheet(s);
        }}
      />

      {/* DETAILED PARENT PROFILE MODAL */}
      <ParentDetailModal
        isOpen={!!selectedParentForDetail}
        onClose={() => setSelectedParentForDetail(null)}
        parent={selectedParentForDetail}
        parentId={selectedParentForDetail?.id}
        parents={parents}
        students={students}
        classes={classes}
        schoolId={schoolId}
        schoolName={schoolName}
        onOpenStudentFile={(studentId) => {
          setSelectedStudentForDetail(studentId);
        }}
        onOpenRelationshipManager={(p) => {
          setRelationshipModalTarget({ type: "parent", entity: p });
        }}
        onUpdateParent={(updated) => {
          if (onUpdateParents) {
            onUpdateParents(prev => prev.map(p => p.id === updated.id ? updated : p));
          }
          setSelectedParentForDetail(updated);
        }}
      />

      {/* RELATIONSHIP MANAGER MODAL */}
      {relationshipModalTarget && (
        <RelationshipManagerModal
          isOpen={!!relationshipModalTarget}
          targetType={relationshipModalTarget.type}
          targetParent={relationshipModalTarget.type === "parent" ? relationshipModalTarget.entity : null}
          targetStudent={relationshipModalTarget.type === "student" ? relationshipModalTarget.entity : null}
          targetClass={relationshipModalTarget.type === "class" ? relationshipModalTarget.entity : null}
          teachers={teachers}
          employees={employees}
          userAccounts={userAccounts}
          students={students}
          parents={parents}
          classes={classes}
          schoolId={schoolId}
          schoolName={schoolName}
          onOpenParentProfile={(parentId) => {
            const p = parents.find(x => x.id === parentId || x.parentAccountNumber === parentId);
            if (p) setSelectedParentForDetail(p);
          }}
          onOpenStudentProfile={(studentId) => {
            setSelectedStudentForDetail(studentId);
          }}
          onClose={() => setRelationshipModalTarget(null)}
          onUpdateParent={(updatedParent) => {
            if (onUpdateParents) {
              onUpdateParents(prev => prev.map(p => p.id === updatedParent.id ? updatedParent : p));
            }
            setRelationshipModalTarget(null);
          }}
          onUpdateStudent={(updatedStudent) => {
            onEditStudent(updatedStudent);
            setRelationshipModalTarget(null);
          }}
        />
      )}
    </div>
  );
}
