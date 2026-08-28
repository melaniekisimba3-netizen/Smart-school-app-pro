import React, { useState, useEffect } from "react";
import { 
  ClassRoom, 
  Student, 
  Parent, 
  Teacher, 
  Employee, 
  UserAccount,
  ClassTitularHistoryEntry 
} from "../../types";
import { 
  resolveClassTitulaire, 
  resolveClassResponsible, 
  getEligibleTitularsForSchool, 
  assignClassTitulaire, 
  assignClassResponsible,
  resolveStudentGuardians,
  resolveParentChildren,
  linkParentAndStudent,
  unlinkParentAndStudent,
  filterBySchool
} from "../../services/entityRelationshipService";
import { 
  generateUniqueActivationCode,
  persistUniversalUserAccount,
  getStoredUniversalUserAccounts,
  getSafeOrigin
} from "../../services/accountActivationService";
import { 
  Users, UserCheck, Shield, KeyRound, Link2, Unlink, UserPlus, 
  CheckCircle2, Clock, History, AlertCircle, Sparkles, X, ChevronRight,
  GraduationCap, BookOpen, School, Phone, Mail, Building, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type RelationshipTargetType = "class" | "student" | "parent";

export interface RelationshipManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: RelationshipTargetType;
  targetClass?: ClassRoom | null;
  targetStudent?: Student | null;
  targetParent?: Parent | null;
  schoolId?: string;
  schoolName?: string;
  teachers?: Teacher[];
  employees?: Employee[];
  userAccounts?: UserAccount[];
  students?: Student[];
  parents?: Parent[];
  classes?: ClassRoom[];
  onOpenParentProfile?: (parentId: string) => void;
  onOpenStudentProfile?: (studentId: string) => void;
  onUpdateClass?: (updatedClass: ClassRoom) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onUpdateParent?: (updatedParent: Parent) => void;
  onUpdateTeachers?: React.Dispatch<React.SetStateAction<Teacher[]>>;
  onRefreshAll?: () => void;
  actorName?: string;
  actorRole?: string;
}

export function RelationshipManagerModal({
  isOpen,
  onClose,
  targetType,
  targetClass,
  targetStudent,
  targetParent,
  schoolId,
  schoolName = "Établissement Scolaire",
  teachers = [],
  employees = [],
  userAccounts = [],
  students = [],
  parents = [],
  classes = [],
  onOpenParentProfile,
  onOpenStudentProfile,
  onUpdateClass,
  onUpdateStudent,
  onUpdateParent,
  onUpdateTeachers,
  onRefreshAll,
  actorName = "Direction",
  actorRole = "Administrateur"
}: RelationshipManagerModalProps) {
  if (!isOpen) return null;

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (targetType === "class") return "titulaire";
    if (targetType === "student") return "account";
    return "children";
  });

  // Local state for Class titular selection
  const [selectedTitularId, setSelectedTitularId] = useState<string>(() => {
    return targetClass?.classTeacherId || "";
  });
  const [titularNote, setTitularNote] = useState("");

  // Local state for Class responsible selection
  const [selectedRespId, setSelectedRespId] = useState<string>(() => {
    return targetClass?.responsibleStaffId || "";
  });
  const [respNote, setRespNote] = useState("");

  // Sync selected titular and responsible when targetClass or data changes
  useEffect(() => {
    if (targetClass) {
      const resolved = resolveClassTitulaire(targetClass, teachers, employees, userAccounts);
      if (resolved.id) {
        setSelectedTitularId(resolved.id);
      } else if (targetClass.classTeacherId) {
        setSelectedTitularId(targetClass.classTeacherId);
      } else {
        setSelectedTitularId("");
      }
      setSelectedRespId(targetClass.responsibleStaffId || "");
    }
  }, [targetClass, teachers, employees, userAccounts]);

  // Local state for Student parent linkage
  const [selectedParentIdToLink, setSelectedParentIdToLink] = useState("");
  const [parentSearchQuery, setParentSearchQuery] = useState("");
  const [relationshipType, setRelationshipType] = useState("Tuteur légal");
  const [isPrimaryGuardian, setIsPrimaryGuardian] = useState(false);

  // Local state for Parent child linkage
  const [selectedStudentIdToLink, setSelectedStudentIdToLink] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [parentChildRelType, setParentChildRelType] = useState("Enfant à charge");

  // Success / notification message
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Eligible Titulars & Staff
  const eligibleTitulars = getEligibleTitularsForSchool(schoolId, teachers, employees, userAccounts);
  const eligibleStaff = filterBySchool(employees, schoolId);
  const schoolStudents = filterBySchool(students, schoolId);
  const schoolParents = filterBySchool(parents, schoolId);

  // -------------------------------------------------------------------------
  // CLASS ACTIONS
  // -------------------------------------------------------------------------
  const handleSaveClassTitulaire = () => {
    if (!targetClass || !onUpdateClass) return;

    if (!selectedTitularId || selectedTitularId === "none") {
      const updated = assignClassTitulaire(targetClass, null, actorName, titularNote || "Retrait du titulaire");
      onUpdateClass(updated);
      showFeedback("Titulaire de classe réinitialisé à 'Non attribué'.");
      return;
    }

    const found = eligibleTitulars.find(t => t.id === selectedTitularId);
    if (!found) {
      showFeedback("Compte titulaire introuvable.", "error");
      return;
    }

    const updated = assignClassTitulaire(
      targetClass,
      {
        id: found.id,
        name: found.name,
        type: found.type,
        userAccountId: found.userAccountId
      },
      actorName,
      titularNote || "Nouvelle affectation officielle"
    );

    // If titulaire is a teacher, sync into teacher's assignedClasses
    if (found.type === "teacher" && onUpdateTeachers) {
      const classNameLabel = updated.name || `${updated.classGrade || updated.level} ${updated.roomLetter}`.trim();
      onUpdateTeachers(prev => prev.map(t => {
        if (t.id === found.id) {
          const currentAssigned = t.assignedClasses || [];
          if (!currentAssigned.includes(classNameLabel)) {
            return {
              ...t,
              assignedClasses: [...currentAssigned, classNameLabel],
              assignedClassIds: [...((t as any).assignedClassIds || []), updated.id]
            };
          }
        }
        return t;
      }));
    }

    onUpdateClass(updated);
    showFeedback(`Titulaire de la classe affecté : ${found.name}`);
    setTitularNote("");
  };

  const handleSaveClassResponsible = () => {
    if (!targetClass || !onUpdateClass) return;

    if (!selectedRespId || selectedRespId === "none") {
      const updated = assignClassResponsible(targetClass, null, actorName, respNote || "Retrait du personnel responsable");
      onUpdateClass(updated);
      showFeedback("Personnel responsable retiré.");
      return;
    }

    const foundEmp = eligibleStaff.find(e => e.id === selectedRespId);
    if (!foundEmp) {
      showFeedback("Membre du personnel introuvable.", "error");
      return;
    }

    const fullName = `${foundEmp.lastName || ""} ${foundEmp.firstName || ""}`.trim();
    const updated = assignClassResponsible(
      targetClass,
      {
        id: foundEmp.id,
        name: fullName,
        userAccountId: foundEmp.userAccountId,
        roleTitle: foundEmp.function || "Personnel Responsable"
      },
      actorName,
      respNote || "Attribution de la responsabilité de classe"
    );

    onUpdateClass(updated);
    showFeedback(`Personnel responsable lié : ${fullName}`);
    setRespNote("");
  };

  // -------------------------------------------------------------------------
  // STUDENT ACTIONS
  // -------------------------------------------------------------------------
  const handleCreateOrLinkStudentAccount = (student: Student) => {
    if (!onUpdateStudent) return;

    const cleanFirst = (student.firstName || "eleve").toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLast = (student.lastName || "etudiant").toLowerCase().replace(/[^a-z0-9]/g, "");
    const generatedUsername = student.registrationNumber || `ELV-${cleanLast.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedCode = generateUniqueActivationCode("STUDENT");
    const defaultPassword = `Eleve${new Date().getFullYear()}!`;

    const userAcc: UserAccount = {
      id: `acc-student-${student.id}`,
      dossierId: student.id,
      dossierType: "eleve",
      fullName: `${student.lastName} ${student.firstName} ${student.postName || ""}`.trim(),
      username: generatedUsername,
      role: "Élève",
      activationCode: generatedCode,
      password: defaultPassword,
      tempPassword: defaultPassword,
      phone: student.parentPhone,
      email: `${cleanFirst}.${cleanLast}@smartschool.cd`,
      isActive: true,
      isActivated: false,
      mustChangePasswordOnFirstLogin: true,
      schoolName: schoolName,
      schoolId: schoolId || student.schoolId,
      targetPortalTab: "eleves",
      portalUrl: `${getSafeOrigin()}/login`,
      createdAt: new Date().toLocaleDateString("fr-FR")
    };

    persistUniversalUserAccount(userAcc);

    const updatedStudent: Student = {
      ...student,
      hasUserAccount: true,
      userAccountId: userAcc.id,
      accountStatus: "active",
      activationCode: generatedCode
    };

    onUpdateStudent(updatedStudent);
    showFeedback(`Compte élève créé et lié avec succès (@${generatedUsername}).`);
  };

  const handleLinkParentToStudentAction = (student: Student) => {
    if (!selectedParentIdToLink || !onUpdateStudent) return;
    const parentObj = parents.find(p => p.id === selectedParentIdToLink);
    if (!parentObj) {
      showFeedback("Parent sélectionné introuvable.", "error");
      return;
    }

    const { updatedParent, updatedStudent } = linkParentAndStudent(
      parentObj,
      student,
      relationshipType,
      isPrimaryGuardian
    );

    onUpdateStudent(updatedStudent);
    if (onUpdateParent) onUpdateParent(updatedParent);
    setSelectedParentIdToLink("");
    showFeedback(`Parent ${updatedParent.lastName} ${updatedParent.firstName} rattaché à l'élève.`);
  };

  const handleUnlinkParentFromStudentAction = (student: Student, parentId: string) => {
    if (!onUpdateStudent) return;
    const parentObj = parents.find(p => p.id === parentId);
    if (!parentObj) return;

    const { updatedParent, updatedStudent } = unlinkParentAndStudent(parentObj, student);
    onUpdateStudent(updatedStudent);
    if (onUpdateParent) onUpdateParent(updatedParent);
    showFeedback(`Liaison avec le parent ${updatedParent.lastName} retirée.`);
  };

  // -------------------------------------------------------------------------
  // PARENT ACTIONS
  // -------------------------------------------------------------------------
  const handleLinkStudentToParentAction = (parent: Parent) => {
    if (!selectedStudentIdToLink || !onUpdateParent) return;
    const studentObj = students.find(s => s.id === selectedStudentIdToLink);
    if (!studentObj) {
      showFeedback("Élève sélectionné introuvable.", "error");
      return;
    }

    const { updatedParent, updatedStudent } = linkParentAndStudent(
      parent,
      studentObj,
      parentChildRelType,
      false
    );

    onUpdateParent(updatedParent);
    if (onUpdateStudent) onUpdateStudent(updatedStudent);
    setSelectedStudentIdToLink("");
    showFeedback(`Élève ${updatedStudent.lastName} ${updatedStudent.firstName} lié au compte tuteur.`);
  };

  const handleUnlinkStudentFromParentAction = (parent: Parent, studentId: string) => {
    if (!onUpdateParent) return;
    const studentObj = students.find(s => s.id === studentId);
    if (!studentObj) return;

    const { updatedParent, updatedStudent } = unlinkParentAndStudent(parent, studentObj);
    onUpdateParent(updatedParent);
    if (onUpdateStudent) onUpdateStudent(updatedStudent);
    showFeedback(`Liaison avec l'élève ${studentObj.lastName} retirée.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-left"
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-brand-blue dark:text-blue-400">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Gérer les liaisons & relations</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase">
                  {targetType === "class" ? "Classe" : targetType === "student" ? "Élève" : "Parent / Tuteur"}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {targetType === "class" && targetClass && `${targetClass.classGrade || targetClass.level} ${targetClass.roomLetter} · ${targetClass.optionName}`}
                {targetType === "student" && targetStudent && `${targetStudent.lastName} ${targetStudent.firstName} (${targetStudent.registrationNumber}) · ${targetStudent.className}`}
                {targetType === "parent" && targetParent && `${targetParent.lastName} ${targetParent.firstName} · ${targetParent.phone}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FEEDBACK TOAST */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between border-b ${
                feedbackMsg.type === "success" 
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" 
                  : "bg-red-50 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
              <button onClick={() => setFeedbackMsg(null)} className="cursor-pointer font-black text-sm">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 text-xs">
          {targetType === "class" && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("titulaire")}
                className={`py-3 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "titulaire" 
                    ? "border-brand-blue text-brand-blue dark:text-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Titulaire de la classe</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("responsable")}
                className={`py-3 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "responsable" 
                    ? "border-brand-blue text-brand-blue dark:text-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Personnel Responsable</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`py-3 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "history" 
                    ? "border-brand-blue text-brand-blue dark:text-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <History className="h-4 w-4" />
                <span>Historique des affectations ({targetClass?.titularHistory?.length || 0})</span>
              </button>
            </>
          )}

          {targetType === "student" && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("account")}
                className={`py-3 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "account" 
                    ? "border-brand-blue text-brand-blue dark:text-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <KeyRound className="h-4 w-4" />
                <span>Compte Utilisateur Élève</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("parents")}
                className={`py-3 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "parents" 
                    ? "border-brand-blue text-brand-blue dark:text-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Parents & Tuteurs rattachés</span>
              </button>
            </>
          )}

          {targetType === "parent" && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("children")}
                className={`py-3 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "children" 
                    ? "border-brand-blue text-brand-blue dark:text-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Enfants & Élèves rattachés</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("account")}
                className={`py-3 px-4 font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "account" 
                    ? "border-brand-blue text-brand-blue dark:text-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <KeyRound className="h-4 w-4" />
                <span>Compte Portail Parent</span>
              </button>
            </>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* ============================================================= */}
          {/* CLASSROOM: TITULAIRE TAB                                      */}
          {/* ============================================================= */}
          {targetType === "class" && targetClass && activeTab === "titulaire" && (() => {
            const currentTitulaire = resolveClassTitulaire(targetClass, teachers, employees, userAccounts);
            return (
              <div className="space-y-5">
                {/* Current Status Box */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Titulaire Actuellement Attribué
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl font-bold ${
                        currentTitulaire.isAssigned 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {currentTitulaire.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {currentTitulaire.roleTitle || (currentTitulaire.isAssigned ? "Enseignant titulaire" : "Aucun titulaire assigné")}
                          {currentTitulaire.phone && ` · 📞 ${currentTitulaire.phone}`}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      currentTitulaire.isAssigned
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    }`}>
                      {currentTitulaire.isAssigned ? "Attribué" : "Non attribué"}
                    </span>
                  </div>
                </div>

                {/* Selection Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Sélectionner un enseignant / membre du personnel titulaire :
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      Seuls les membres du personnel appartenant à votre établissement ({schoolName}) sont affichés.
                    </p>
                    <select
                      value={selectedTitularId}
                      onChange={e => setSelectedTitularId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-brand-blue focus:outline-none"
                    >
                      <option value="none">-- Laisser vide / Non attribué --</option>
                      <optgroup label="Enseignants & Personnel autorisés de l'établissement">
                        {eligibleTitulars.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} — {t.roleTitle} {t.phone ? `(${t.phone})` : ""}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Motif / Note d'affectation (facultatif) :
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Décision de la direction pour l'année scolaire en cours"
                      value={titularNote}
                      onChange={e => setTitularNote(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs placeholder:text-slate-400"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-[11px] flex items-start gap-2">
                    <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Règle de non-suppression :</strong> En remplaçant un titulaire, son compte utilisateur et ses autres affectations ne sont jamais supprimés. L'historique de son affectation précédente dans cette classe est automatiquement archivé.
                    </span>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer transition-colors"
                    >
                      Fermer
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveClassTitulaire}
                      className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Enregistrer l'affectation</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================================= */}
          {/* CLASSROOM: RESPONSABLE TAB                                    */}
          {/* ============================================================= */}
          {targetType === "class" && targetClass && activeTab === "responsable" && (() => {
            const currentResp = resolveClassResponsible(targetClass, employees, userAccounts, teachers);
            return (
              <div className="space-y-5">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Personnel Responsable Actuel
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl font-bold ${
                        currentResp.isAssigned 
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" 
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {currentResp.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {currentResp.roleTitle || "Aucun personnel responsable assigné"}
                          {currentResp.phone && ` · 📞 ${currentResp.phone}`}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      currentResp.isAssigned
                        ? "bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {currentResp.isAssigned ? "Responsable assigné" : "Aucun"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Sélectionner le membre du personnel responsable :
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      (ex: Surveillant général, Éducateur de niveau, Coordinateur de cycle).
                    </p>
                    <select
                      value={selectedRespId}
                      onChange={e => setSelectedRespId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-brand-blue focus:outline-none"
                    >
                      <option value="none">-- Aucun personnel responsable --</option>
                      {eligibleStaff.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.lastName} {e.firstName} — {e.function} ({e.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Note / Mandat de responsabilité :
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Responsable de la discipline et du suivi éducatif"
                      value={respNote}
                      onChange={e => setRespNote(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                    >
                      Fermer
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveClassResponsible}
                      className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Enregistrer le Responsable</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================================= */}
          {/* CLASSROOM: HISTORY TAB                                        */}
          {/* ============================================================= */}
          {targetType === "class" && targetClass && activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  Historique des affectations de la classe
                </span>
                <span className="text-[11px] text-slate-400">
                  {targetClass.titularHistory?.length || 0} enregistrement(s)
                </span>
              </div>

              {(!targetClass.titularHistory || targetClass.titularHistory.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-1">
                  <History className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-bold text-slate-600 dark:text-slate-300">Aucun historique d'affectation antérieur</p>
                  <p className="text-[11px]">Les changements futurs de titulaire seront consignés ici avec leurs dates.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {targetClass.titularHistory.map((h, idx) => (
                    <div 
                      key={h.id || idx}
                      className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          h.type === "titulaire" 
                            ? "bg-blue-50 text-brand-blue dark:bg-blue-950 dark:text-blue-400" 
                            : "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                        }`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-2">
                            <span>{h.staffName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {h.roleTitle || (h.type === "titulaire" ? "Titulaire" : "Responsable")}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Période : Du <strong>{h.startDate}</strong> {h.endDate ? `au ${h.endDate}` : "(Actif actuellement)"}
                          </div>
                          {h.notes && (
                            <div className="text-[10px] text-slate-400 italic mt-0.5">
                              Note : {h.notes} {h.assignedBy ? `· Par: ${h.assignedBy}` : ""}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        !h.endDate 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400" 
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {!h.endDate ? "En poste" : "Archivé"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* STUDENT: USER ACCOUNT TAB                                     */}
          {/* ============================================================= */}
          {targetType === "student" && targetStudent && activeTab === "account" && (() => {
            const hasAcc = !!(targetStudent.hasUserAccount || targetStudent.userAccountId);
            return (
              <div className="space-y-5">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Statut du Compte Portail Élève
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl font-bold ${
                        hasAcc 
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" 
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {hasAcc ? `Compte élève actif : @${targetStudent.registrationNumber}` : "Compte élève : Non lié"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {hasAcc 
                            ? `Identifiant partagé avec le matricule scolaire · Accès portail élève configuré` 
                            : `Aucun compte utilisateur n'est actuellement lié à ce dossier élève`}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      hasAcc
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    }`}>
                      {hasAcc ? "Compte Lié" : "Non Lié"}
                    </span>
                  </div>
                </div>

                {!hasAcc ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900 space-y-2">
                      <h4 className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        Génération instantanée & Liaison sans doublon
                      </h4>
                      <p className="text-[11px] text-indigo-800 dark:text-indigo-300">
                        La création génère automatiquement les identifiants officiels liés au matricule de l'élève <strong>{targetStudent.registrationNumber}</strong>. Aucune duplication d'identité n'est effectuée.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCreateOrLinkStudentAccount(targetStudent)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
                      >
                        <KeyRound className="h-4 w-4" />
                        <span>Créer & Lier le compte élève maintenant</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Identifiant de connexion :</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{targetStudent.registrationNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Code d'activation :</span>
                        <span className="font-mono font-bold text-brand-blue">{targetStudent.activationCode || "Actif / Configuré"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Portail :</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Portail Élève SmartSchool</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateStudent) {
                            onUpdateStudent({
                              ...targetStudent,
                              hasUserAccount: false,
                              userAccountId: undefined
                            });
                            showFeedback("Compte dissocié de l'élève.");
                          }
                        }}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <Unlink className="h-4 w-4" />
                        <span>Dissocier le compte</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ============================================================= */}
          {/* STUDENT: PARENTS & GUARDIANS TAB                              */}
          {/* ============================================================= */}
          {targetType === "student" && targetStudent && activeTab === "parents" && (() => {
            const { guardians } = resolveStudentGuardians(targetStudent, parents);
            const filteredSchoolParents = schoolParents.filter(p => {
              if (!parentSearchQuery) return true;
              const q = parentSearchQuery.toLowerCase();
              return (
                p.lastName?.toLowerCase().includes(q) ||
                p.firstName?.toLowerCase().includes(q) ||
                p.phone?.toLowerCase().includes(q) ||
                p.parentAccountNumber?.toLowerCase().includes(q) ||
                p.id?.toLowerCase().includes(q)
              );
            });

            return (
              <div className="space-y-5">
                {/* List of currently linked parents */}
                <div className="space-y-3">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Parents & Tuteurs Rattachés ({guardians.length})
                  </span>

                  {guardians.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
                      Aucun tuteur ou parent rattaché à cet élève pour le moment.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {guardians.map(g => (
                        <div 
                          key={g.parentId}
                          className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{g.parentName}</span>
                                {g.isPrimary && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {g.relationship} · 📞 {g.parentPhone || "Téléphone non renseigné"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {onOpenParentProfile && (
                              <button
                                type="button"
                                onClick={() => onOpenParentProfile(g.parentId)}
                                className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Voir fiche
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUnlinkParentFromStudentAction(targetStudent, g.parentId)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                              title="Retirer cette liaison"
                            >
                              <Unlink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add / Link Parent Section */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-brand-blue" />
                    Lier un parent / tuteur enregistré dans l'école
                  </h4>

                  {/* Search box */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Filtrer par nom, prénom ou téléphone :
                    </label>
                    <input
                      type="text"
                      placeholder="🔎 Rechercher un parent/tuteur..."
                      value={parentSearchQuery}
                      onChange={e => setParentSearchQuery(e.target.value)}
                      className="w-full p-2.5 mb-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Sélectionner le compte parent ({filteredSchoolParents.length} disponibles) :
                      </label>
                      <select
                        value={selectedParentIdToLink}
                        onChange={e => setSelectedParentIdToLink(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                      >
                        <option value="">-- Choisir un parent existant --</option>
                        {filteredSchoolParents.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.lastName} {p.firstName} — {p.phone || "Sans tél"} ({p.parentAccountNumber || p.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Lien de parenté :
                      </label>
                      <select
                        value={relationshipType}
                        onChange={e => setRelationshipType(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      >
                        <option value="Père">Père</option>
                        <option value="Mère">Mère</option>
                        <option value="Tuteur">Tuteur</option>
                        <option value="Tuteur légal">Tuteur légal</option>
                        <option value="Responsable légal">Responsable légal</option>
                        <option value="Autre responsable autorisé">Autre responsable autorisé</option>
                        <option value="Oncle / Tante">Oncle / Tante</option>
                        <option value="Grand-parent">Grand-parent</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="isPrimaryCheck"
                      checked={isPrimaryGuardian}
                      onChange={e => setIsPrimaryGuardian(e.target.checked)}
                      className="h-4 w-4 rounded text-brand-blue focus:ring-brand-blue"
                    />
                    <label htmlFor="isPrimaryCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Définir comme tuteur principal (prioritaire pour les alertes SMS et notifications de crise)
                    </label>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={!selectedParentIdToLink}
                      onClick={() => handleLinkParentToStudentAction(targetStudent)}
                      className="px-4 py-2 bg-brand-blue hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Link2 className="h-4 w-4" />
                      <span>Rattacher ce parent</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================================= */}
          {/* PARENT: LINKED CHILDREN TAB                                   */}
          {/* ============================================================= */}
          {targetType === "parent" && targetParent && activeTab === "children" && (() => {
            const children = resolveParentChildren(targetParent, students);
            const filteredSchoolStudents = schoolStudents.filter(s => {
              if (!studentSearchQuery) return true;
              const q = studentSearchQuery.toLowerCase();
              return (
                s.lastName?.toLowerCase().includes(q) ||
                s.firstName?.toLowerCase().includes(q) ||
                s.postName?.toLowerCase().includes(q) ||
                s.registrationNumber?.toLowerCase().includes(q) ||
                s.className?.toLowerCase().includes(q)
              );
            });

            return (
              <div className="space-y-5">
                <div className="space-y-3">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Enfants & Élèves Rattachés ({children.length})
                  </span>

                  {children.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
                      Aucun élève n’est actuellement lié à ce compte parent.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {children.map(c => (
                        <div 
                          key={c.studentId}
                          className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-50 text-brand-blue dark:bg-blue-950 dark:text-blue-400">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{c.studentName}</span>
                                <span className="font-mono text-[10px] text-brand-blue bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded font-bold">
                                  {c.registrationNumber}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                Classe : <strong>{c.className}</strong> · {c.optionName} · {c.relationship}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {onOpenStudentProfile && (
                              <button
                                type="button"
                                onClick={() => onOpenStudentProfile(c.studentId)}
                                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Voir fiche élève
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUnlinkStudentFromParentAction(targetParent, c.studentId)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                              title="Retirer cet élève"
                            >
                              <Unlink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Child Selector */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-brand-blue" />
                    Lier un élève inscrit dans l'établissement
                  </h4>

                  {/* Search box for students */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Filtrer par nom, matricule ou classe :
                    </label>
                    <input
                      type="text"
                      placeholder="🔎 Rechercher un élève (nom, matricule, classe)..."
                      value={studentSearchQuery}
                      onChange={e => setStudentSearchQuery(e.target.value)}
                      className="w-full p-2.5 mb-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Sélectionner l'élève inscrit ({filteredSchoolStudents.length} trouvés) :
                      </label>
                      <select
                        value={selectedStudentIdToLink}
                        onChange={e => setSelectedStudentIdToLink(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                      >
                        <option value="">-- Choisir un élève inscrit --</option>
                        {filteredSchoolStudents.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.lastName} {s.firstName} ({s.registrationNumber}) — {s.className}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Lien avec l'enfant :
                      </label>
                      <select
                        value={parentChildRelType}
                        onChange={e => setParentChildRelType(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      >
                        <option value="Enfant à charge">Enfant à charge</option>
                        <option value="Fils / Fille">Fils / Fille</option>
                        <option value="Pupille">Pupille</option>
                        <option value="Neveu / Nièce">Neveu / Nièce</option>
                        <option value="Père">Père</option>
                        <option value="Mère">Mère</option>
                        <option value="Tuteur légal">Tuteur légal</option>
                        <option value="Autre lien de tutelle">Autre lien de tutelle</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={!selectedStudentIdToLink}
                      onClick={() => handleLinkStudentToParentAction(targetParent)}
                      className="px-4 py-2 bg-brand-blue hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Link2 className="h-4 w-4" />
                      <span>Rattacher l'élève à ce tuteur</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================================= */}
          {/* PARENT: USER ACCOUNT TAB                                      */}
          {/* ============================================================= */}
          {targetType === "parent" && targetParent && activeTab === "account" && (() => {
            const hasAcc = !!(targetParent.accountCreated || targetParent.userAccountId);
            return (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Compte Portail Parent
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl font-bold ${
                        hasAcc 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {hasAcc ? `Compte Parent Actif (${targetParent.parentAccountNumber || targetParent.phone})` : "Compte Parent : Non créé"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {hasAcc ? "Portail d'accès parent opérationnel" : "Le tuteur n'a pas encore de compte utilisateur activé"}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      hasAcc
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    }`}>
                      {hasAcc ? "Compte Actif" : "Non Créé"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Numéro de Compte Parent :</span>
                    <span className="font-mono font-bold text-brand-blue">{targetParent.parentAccountNumber || "Généré à l'enregistrement"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Téléphone de réception alertes :</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{targetParent.phone}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Isolation multi-tenant certifiée · {schoolName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer transition-colors"
          >
            Terminer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
