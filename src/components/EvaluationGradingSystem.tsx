import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Edit,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  HelpCircle,
  Layers,
  Lock,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Unlock,
  Upload,
  UserCheck,
  UserX,
  Users,
  XCircle,
  AlertTriangle
} from "lucide-react";
import {
  Evaluation,
  EvaluationType,
  EvaluationStatus,
  EvaluationScore,
  EvaluationAuditLog,
  Student,
  Teacher,
  ClassRoom,
  Subject,
  SchoolBulletinPermissions,
  UserAccount
} from "../types";
import {
  getStoredEvaluations,
  saveEvaluation,
  deleteEvaluation,
  getStoredEvaluationScores,
  saveEvaluationScores,
  getEvaluationAudits,
  updateEvaluationStatus,
  calculateClassMarkSheet,
  ClassMarkSheetData
} from "../services/evaluationService";
import { usePedagogicalTimetable } from "../context/PedagogicalTimetableContext";

interface EvaluationGradingSystemProps {
  userRole: string;
  userName: string;
  userEmail?: string;
  currentUserId?: string | null;
  currentUserAccount?: UserAccount | null;
  students: Student[];
  teachers?: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  schoolId: string;
  academicYear?: string;
  schoolName?: string;
  schoolLogoUrl?: string;
  isDirectionUser?: boolean;
  bulletinSettings?: SchoolBulletinPermissions;
  onAddNotification?: (notif: any) => void;
}

// Helper to normalize strings for robust accent-, punctuation- and case-insensitive matching
const normalizeText = (text: string | undefined | null): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-_()]/g, "")
    .trim();
};

export function EvaluationGradingSystem({
  userRole,
  userName,
  userEmail,
  currentUserId,
  currentUserAccount,
  students = [],
  teachers = [],
  classes = [],
  subjects = [],
  schoolId,
  academicYear = "2026-2027",
  schoolName = "Complexe Scolaire SmartSchool RDC",
  schoolLogoUrl,
  isDirectionUser = false,
  bulletinSettings,
  onAddNotification
}: EvaluationGradingSystemProps) {
  const { courseAssignments } = usePedagogicalTimetable();
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"marksheet" | "evaluations" | "entry" | "calendar" | "audits" | "direction">("marksheet");

  // Multi-Class & Multi-Subject Context
  const isTeacher = userRole.toLowerCase().includes("enseignant") || userRole.toLowerCase().includes("professeur");
  
  // Find current teacher object if applicable
  const activeTeacher = useMemo(() => {
    if (!isTeacher) return null;
    const uClean = (userName || "").toLowerCase().replace(/^prof(\.|\s+)/i, "").replace(/^m(\.|\s+)/i, "").trim();
    const uNorm = normalizeText(uClean);

    return teachers.find(t => {
      if (currentUserId && (t.id === currentUserId || (t as any).userId === currentUserId || (t as any).userAccountId === currentUserId)) return true;
      if (currentUserAccount?.dossierId && t.id === currentUserAccount.dossierId) return true;
      if (currentUserAccount?.id && (t.id === currentUserAccount.id || (t as any).userAccountId === currentUserAccount.id)) return true;
      if (currentUserAccount?.username && t.username === currentUserAccount.username) return true;
      if (currentUserAccount?.email && t.email && t.email.toLowerCase() === currentUserAccount.email.toLowerCase()) return true;
      if (userEmail && t.email && t.email.toLowerCase() === userEmail.toLowerCase()) return true;
      if (userEmail && t.phone && t.phone === userEmail) return true;
      if (t.username && userName && t.username.toLowerCase() === userName.toLowerCase()) return true;

      const fullName = `${t.firstName || ""} ${t.lastName || ""}`.trim();
      const reverseName = `${t.lastName || ""} ${t.firstName || ""}`.trim();
      const directName = t.name || "";
      const fNorm = normalizeText(fullName);
      const rNorm = normalizeText(reverseName);
      const dNorm = normalizeText(directName);
      const lastNorm = normalizeText(t.lastName);
      const firstNorm = normalizeText(t.firstName);

      if (uNorm && (fNorm === uNorm || rNorm === uNorm || dNorm === uNorm || fNorm.includes(uNorm) || rNorm.includes(uNorm) || dNorm.includes(uNorm) || uNorm.includes(fNorm) || uNorm.includes(rNorm))) {
        return true;
      }
      if (lastNorm && lastNorm.length >= 3 && uNorm.includes(lastNorm)) return true;
      if (firstNorm && firstNorm.length >= 3 && uNorm.includes(firstNorm)) return true;

      return false;
    }) || null;
  }, [teachers, currentUserId, currentUserAccount, userEmail, userName, isTeacher]);

  // Normalize classes safely to prevent undefined name property errors
  const safeClasses: ClassRoom[] = useMemo(() => {
    if (!Array.isArray(classes)) return [];
    return classes
      .filter(Boolean)
      .map((c: any, idx) => {
        if (typeof c === "string") {
          return {
            id: `cls-${idx}-${c.replace(/\s+/g, "_")}`,
            name: c,
            classGrade: c,
            level: c,
            roomLetter: "",
            optionName: "Tronc Commun",
            schoolId: schoolId || ""
          } as ClassRoom;
        }
        const rawName = c.name || c.className || c.title || c.label || c.id || `Classe ${idx + 1}`;
        return {
          ...c,
          id: c.id || `cls-${idx}-${String(rawName).replace(/\s+/g, "_")}`,
          name: String(rawName),
          optionName: c.optionName || "Tronc Commun",
        } as ClassRoom;
      });
  }, [classes, schoolId]);

  // Normalize subjects safely
  const safeSubjects: Subject[] = useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    return subjects
      .filter(Boolean)
      .map((s: any, idx) => {
        if (typeof s === "string") {
          return {
            id: `sub-${idx}-${s.replace(/\s+/g, "_")}`,
            name: s,
            category: "Générale",
            maxPoints: 20,
            maxPointsInterro: 20,
            maxPointsExamen: 20,
            hoursPerWeek: 2,
            schoolId: schoolId || ""
          } as unknown as Subject;
        }
        const rawName = s.name || s.subjectName || s.title || s.label || s.id || `Matière ${idx + 1}`;
        return {
          ...s,
          id: s.id || `sub-${idx}-${String(rawName).replace(/\s+/g, "_")}`,
          name: String(rawName)
        } as Subject;
      });
  }, [subjects, schoolId]);

  // Determine authorized classes (Strictly from safeClasses for this school)
  const authorizedClasses = useMemo(() => {
    if (!isTeacher || isDirectionUser) {
      return safeClasses;
    }

    const tClassIds = ((activeTeacher as any)?.assignedClassIds || []).map((id: any) => String(id));
    const tAssignedClasses = (activeTeacher?.assignedClasses || []).map(ac => normalizeText(String(ac))).filter(Boolean);

    // Timetable course assignments for this teacher
    const effectiveTeacherId = activeTeacher?.id || currentUserId || currentUserAccount?.id || currentUserAccount?.dossierId;
    const uCleanNorm = normalizeText((userName || "").replace(/^prof(\.|\s+)/i, "").replace(/^m(\.|\s+)/i, ""));
    const activeTeacherNorm = normalizeText(activeTeacher?.name || `${activeTeacher?.firstName || ""} ${activeTeacher?.lastName || ""}`);
    const activeLastNameNorm = normalizeText(activeTeacher?.lastName || "");

    const teacherCourseAssignments = (courseAssignments || []).filter(asg => {
      if (!asg) return false;
      if (effectiveTeacherId && asg.teacherId === effectiveTeacherId) return true;
      if (currentUserId && asg.teacherId === currentUserId) return true;
      const asgTeacherNorm = normalizeText(asg.teacherName);
      if (asgTeacherNorm && activeTeacherNorm && (asgTeacherNorm === activeTeacherNorm || asgTeacherNorm.includes(activeTeacherNorm) || activeTeacherNorm.includes(asgTeacherNorm))) return true;
      if (asgTeacherNorm && uCleanNorm && (asgTeacherNorm === uCleanNorm || asgTeacherNorm.includes(uCleanNorm) || uCleanNorm.includes(asgTeacherNorm))) return true;
      if (activeLastNameNorm && activeLastNameNorm.length >= 3 && asgTeacherNorm.includes(activeLastNameNorm)) return true;
      return false;
    });

    const timetableClassNames = teacherCourseAssignments.map(asg => normalizeText(asg.className || "")).filter(Boolean);
    const timetableClassIds = teacherCourseAssignments.map(asg => String(asg.classId || "")).filter(Boolean);

    const matches = safeClasses.filter(c => {
      if (!c) return false;
      const cId = String(c.id || "");
      const cNormName = normalizeText(c.name);
      const cNormComposite = normalizeText(`${c.classGrade || c.level || ""} ${c.roomLetter || ""}`);
      const cNormGrade = normalizeText(c.classGrade || String(c.level) || "");

      // 1. Direct assignedClassIds
      if (tClassIds.length > 0 && (tClassIds.includes(cId) || (c.name && tClassIds.includes(c.name)))) {
        return true;
      }

      // 2. Direct assignedClasses list
      if (tAssignedClasses.length > 0 && tAssignedClasses.some(ac => 
        ac === cNormName || ac === cNormComposite || ac === cNormGrade || 
        cNormName.includes(ac) || ac.includes(cNormName) ||
        cNormComposite.includes(ac) || ac.includes(cNormComposite)
      )) {
        return true;
      }

      // 3. Timetable course assignments
      if (timetableClassIds.includes(cId) || timetableClassNames.some(tc => 
        tc === cNormName || tc === cNormComposite || tc === cNormGrade ||
        cNormName.includes(tc) || tc.includes(cNormName)
      )) {
        return true;
      }

      // 4. Titulaire of this class
      const isTitulaire = 
        (effectiveTeacherId && c.classTeacherId === effectiveTeacherId) ||
        (effectiveTeacherId && (c as any).classTeacherUserId === effectiveTeacherId) ||
        (currentUserAccount?.dossierId && c.classTeacherId === currentUserAccount.dossierId) ||
        (currentUserAccount?.id && (c as any).classTeacherUserId === currentUserAccount.id) ||
        (uCleanNorm && c.classTeacherName && normalizeText(c.classTeacherName) === uCleanNorm) ||
        (activeTeacherNorm && c.classTeacherName && normalizeText(c.classTeacherName) === activeTeacherNorm) ||
        (activeLastNameNorm && activeLastNameNorm.length >= 3 && c.classTeacherName && normalizeText(c.classTeacherName).includes(activeLastNameNorm));

      if (isTitulaire) {
        return true;
      }

      return false;
    });

    return matches.length > 0 ? matches : safeClasses;
  }, [safeClasses, isTeacher, isDirectionUser, activeTeacher, currentUserId, userName, currentUserAccount, courseAssignments]);

  // Selected state filters
  const [selectedClassId, setSelectedClassId] = useState<string>(() => authorizedClasses[0]?.id || "");
  
  useEffect(() => {
    if (authorizedClasses.length > 0 && !authorizedClasses.some(c => c.id === selectedClassId)) {
      setSelectedClassId(authorizedClasses[0].id);
    }
  }, [authorizedClasses, selectedClassId]);

  const selectedClassObj = useMemo(() => {
    return safeClasses.find(c => c && (c.id === selectedClassId || c.name === selectedClassId)) || authorizedClasses[0] || null;
  }, [safeClasses, authorizedClasses, selectedClassId]);

  // Helper to resolve authorized subjects for any class
  const getAuthorizedSubjectsForClass = useCallback((targetClass: ClassRoom | null): Subject[] => {
    if (!targetClass) return [];

    const normClassGrade = normalizeText(targetClass.classGrade || String(targetClass.level) || "");
    const normClassName = normalizeText(targetClass.name || `${targetClass.classGrade || targetClass.level} ${targetClass.roomLetter}`);
    const isPrimaryOrMat = targetClass.levelCategory === "Maternelle" || 
                           targetClass.levelCategory === "Primaire" ||
                           normClassGrade.includes("section") || 
                           normClassGrade.includes("primaire") || 
                           (normClassGrade.includes("annee") && !normClassGrade.includes("humanites") && !normClassGrade.includes("eb"));

    // 1. All real subjects registered in the system that match this school and class cycle/option
    const baseSubjects = safeSubjects.filter(s => {
      if (!s) return false;
      // Multi-school check
      if (schoolId && s.schoolId && s.schoolId !== schoolId && s.schoolId !== "default" && s.schoolId !== "sch-001") {
        return false;
      }
      // Option check: if class has an option, filter out subjects belonging exclusively to a DIFFERENT option
      if (targetClass.optionName && targetClass.optionName !== "Tronc Commun" && targetClass.optionName !== "Néant" && s.optionName && s.optionName !== "Tronc Commun" && s.optionName !== "Néant" && s.optionName !== "Toutes") {
        if (normalizeText(s.optionName) !== normalizeText(targetClass.optionName)) {
          return false;
        }
      }
      // Level Category check: if subject has levelCategory specified
      if (s.levelCategory && targetClass.levelCategory && s.levelCategory !== targetClass.levelCategory) {
        return false;
      }
      // Specific class check: if subject is bound to a specific class
      if (s.className && normalizeText(s.className) !== normClassName) {
        return false;
      }
      return true;
    });

    const candidates = baseSubjects.length > 0 ? baseSubjects : safeSubjects;

    // Direction/Admin users have access to all registered subjects of the class
    if (!isTeacher || isDirectionUser) {
      return candidates;
    }

    // Check if activeTeacher is titulaire of this class
    const effectiveTeacherId = activeTeacher?.id || currentUserId || currentUserAccount?.id || currentUserAccount?.dossierId;
    const uCleanNorm = normalizeText((userName || "").replace(/^prof(\.|\s+)/i, "").replace(/^m(\.|\s+)/i, ""));
    const activeTeacherNorm = normalizeText(activeTeacher?.name || `${activeTeacher?.firstName || ""} ${activeTeacher?.lastName || ""}`);
    const activeLastNameNorm = normalizeText(activeTeacher?.lastName || "");

    const isTitulaire = 
      (effectiveTeacherId && targetClass.classTeacherId === effectiveTeacherId) ||
      (effectiveTeacherId && (targetClass as any).classTeacherUserId === effectiveTeacherId) ||
      (currentUserAccount?.dossierId && targetClass.classTeacherId === currentUserAccount.dossierId) ||
      (currentUserAccount?.id && (targetClass as any).classTeacherUserId === currentUserAccount.id) ||
      (uCleanNorm && targetClass.classTeacherName && normalizeText(targetClass.classTeacherName) === uCleanNorm) ||
      (activeTeacherNorm && targetClass.classTeacherName && normalizeText(targetClass.classTeacherName) === activeTeacherNorm) ||
      (activeLastNameNorm && activeLastNameNorm.length >= 3 && targetClass.classTeacherName && normalizeText(targetClass.classTeacherName).includes(activeLastNameNorm));

    // In primary or nursery, the titular teacher teaches all subjects of the class
    if (isTitulaire && isPrimaryOrMat) {
      return candidates;
    }

    // 2. Identify subjects assigned to this teacher for THIS class from timetable course assignments
    const assignedSubjectKeys = new Set<string>();
    let hasClassSpecificAssignment = false;

    (courseAssignments || []).forEach(asg => {
      if (!asg) return;
      const asgTeacherId = asg.teacherId;
      const asgTeacherNameNorm = normalizeText(asg.teacherName);

      const isThisTeacher = 
        (effectiveTeacherId && asgTeacherId === effectiveTeacherId) ||
        (asgTeacherId && (asgTeacherId === currentUserId || asgTeacherId === currentUserAccount?.id || asgTeacherId === currentUserAccount?.dossierId)) ||
        (asgTeacherNameNorm && activeTeacherNorm && (asgTeacherNameNorm === activeTeacherNorm || asgTeacherNameNorm.includes(activeTeacherNorm) || activeTeacherNorm.includes(asgTeacherNameNorm))) ||
        (asgTeacherNameNorm && uCleanNorm && (asgTeacherNameNorm === uCleanNorm || asgTeacherNameNorm.includes(uCleanNorm) || uCleanNorm.includes(asgTeacherNameNorm))) ||
        (activeLastNameNorm && activeLastNameNorm.length >= 3 && asgTeacherNameNorm.includes(activeLastNameNorm));

      if (!isThisTeacher) return;

      const asgClassNorm = normalizeText(asg.className || "");
      const isForThisClass = 
        (asg.classId && (asg.classId === targetClass.id || asg.classId === (targetClass as any).name)) ||
        (asgClassNorm && (asgClassNorm === normClassName || asgClassNorm === normClassGrade || normClassName.includes(asgClassNorm) || asgClassNorm.includes(normClassName)));

      if (isForThisClass) {
        hasClassSpecificAssignment = true;
        if (asg.subjectId) assignedSubjectKeys.add(asg.subjectId.toLowerCase().trim());
        if (asg.subjectName) assignedSubjectKeys.add(normalizeText(asg.subjectName));
      }
    });

    // If teacher has course assignments specifically for this class, filter candidates strictly by those assignments
    if (hasClassSpecificAssignment && assignedSubjectKeys.size > 0) {
      const filtered = candidates.filter(s => {
        const sId = (s.id || "").toLowerCase().trim();
        const sNormName = normalizeText(s.name);
        const sCode = normalizeText((s as any).code || "");
        return assignedSubjectKeys.has(sId) || 
               assignedSubjectKeys.has(sNormName) || 
               assignedSubjectKeys.has(sCode) ||
               Array.from(assignedSubjectKeys).some(k => k.length >= 3 && (sNormName.includes(k) || k.includes(sNormName)));
      });
      if (filtered.length > 0) return filtered;
    }

    // 3. Check Teacher Profile direct assigned subjects (assignedSubjects list)
    const directSubjectList = (activeTeacher?.assignedSubjects || []).concat((activeTeacher as any)?.assignedSubjectIds || []);
    if (directSubjectList.length > 0) {
      const directKeys = new Set(directSubjectList.map(ds => normalizeText(ds)).filter(Boolean));
      const filtered = candidates.filter(s => {
        const sId = (s.id || "").toLowerCase().trim();
        const sNormName = normalizeText(s.name);
        const sCode = normalizeText((s as any).code || "");
        return directKeys.has(sId) || 
               directKeys.has(sNormName) || 
               directKeys.has(sCode) ||
               Array.from(directKeys).some(k => k.length >= 3 && (sNormName.includes(k) || k.includes(sNormName)));
      });
      if (filtered.length > 0) return filtered;
    }

    // 4. Check Teacher Specialty
    const specialty = activeTeacher?.specialty || (activeTeacher as any)?.speciality;
    if (specialty && specialty.trim() && specialty.toLowerCase() !== "toutes" && specialty.toLowerCase() !== "matières générales") {
      const normSpec = normalizeText(specialty);
      const filtered = candidates.filter(s => {
        const sNormName = normalizeText(s.name);
        return sNormName.includes(normSpec) || normSpec.includes(sNormName);
      });
      if (filtered.length > 0) return filtered;
    }

    // 5. If teacher is titulaire of the secondary class or general assigned teacher, return the registered candidates of the class
    return candidates;
  }, [safeSubjects, schoolId, isTeacher, isDirectionUser, activeTeacher, currentUserId, currentUserAccount, userName, courseAssignments]);

  // Determine authorized subjects for the currently selected class
  const authorizedSubjects = useMemo(() => {
    return getAuthorizedSubjectsForClass(selectedClassObj);
  }, [selectedClassObj, getAuthorizedSubjectsForClass]);

  const [selectedSubjectName, setSelectedSubjectName] = useState<string>(() => authorizedSubjects[0]?.name || "");

  useEffect(() => {
    if (authorizedSubjects.length > 0 && !authorizedSubjects.some(s => s.name === selectedSubjectName)) {
      setSelectedSubjectName(authorizedSubjects[0].name);
    }
  }, [authorizedSubjects, selectedSubjectName]);

  const selectedSubjectObj = useMemo(() => {
    return safeSubjects.find(s => s && (s.name === selectedSubjectName || s.id === selectedSubjectName)) || authorizedSubjects[0] || null;
  }, [safeSubjects, authorizedSubjects, selectedSubjectName]);

  // Period / Semestre filter
  const [selectedPeriod, setSelectedPeriod] = useState<string>("P1");

  // Data state
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [scores, setScores] = useState<EvaluationScore[]>([]);
  const [audits, setAudits] = useState<EvaluationAuditLog[]>([]);
  const [activeEvaluationId, setActiveEvaluationId] = useState<string | null>(null);

  // Load from storage
  const reloadData = () => {
    const evs = getStoredEvaluations(schoolId);
    const scs = getStoredEvaluationScores(schoolId);
    const ads = getEvaluationAudits(schoolId);
    setEvaluations(evs);
    setScores(scs);
    setAudits(ads);
  };

  useEffect(() => {
    reloadData();
    const handleRealtime = () => reloadData();
    window.addEventListener("smartschool_realtime_data_changed", handleRealtime);
    return () => window.removeEventListener("smartschool_realtime_data_changed", handleRealtime);
  }, [schoolId]);

  // Filter students belonging to the selected class
  const classStudents = useMemo(() => {
    if (!selectedClassObj || !selectedClassObj.name) return [];
    const targetName = (selectedClassObj.name || "").toLowerCase();
    const targetId = selectedClassObj.id;
    return students.filter(s => {
      if (!s) return false;
      const sClass = (s.className || "").toLowerCase();
      const sClassId = (s as any).classId;
      return sClass === targetName || (targetId && sClassId === targetId);
    });
  }, [students, selectedClassObj]);

  // Evaluations filtered by current selection
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      const matchClass = !selectedClassObj || e.className === selectedClassObj.name || e.classId === selectedClassObj.id;
      const matchSubject = !selectedSubjectName || e.subjectName === selectedSubjectName || e.subjectId === selectedSubjectName;
      const matchPeriod = !selectedPeriod || e.period === selectedPeriod;
      return matchClass && matchSubject && matchPeriod;
    });
  }, [evaluations, selectedClassObj, selectedSubjectName, selectedPeriod]);

  // All evaluations accessible for score entry (across teacher's classes)
  const availableEvaluationsForEntry = useMemo(() => {
    if (evaluations.length === 0) return [];
    if (!isTeacher || isDirectionUser) return evaluations;
    const authClassNames = authorizedClasses.map(c => (c.name || "").toLowerCase());
    const authClassIds = authorizedClasses.map(c => c.id);
    return evaluations.filter(e => 
      authClassIds.includes(e.classId) || 
      authClassNames.includes((e.className || "").toLowerCase()) ||
      (e.teacherId && activeTeacher && e.teacherId === activeTeacher.id) ||
      (e.teacherName && userName && e.teacherName.toLowerCase() === userName.toLowerCase())
    );
  }, [evaluations, isTeacher, isDirectionUser, authorizedClasses, activeTeacher, userName]);

  // Active evaluation object for score entry
  const activeEvaluation = useMemo(() => {
    if (activeEvaluationId) {
      const found = evaluations.find(e => e.id === activeEvaluationId);
      if (found) return found;
    }
    return filteredEvaluations[0] || availableEvaluationsForEntry[0] || null;
  }, [evaluations, activeEvaluationId, filteredEvaluations, availableEvaluationsForEntry]);

  // Students for current active evaluation in entry mode
  const entryClassStudents = useMemo(() => {
    if (activeEvaluation) {
      const evalClassName = (activeEvaluation.className || "").toLowerCase();
      const evalClassId = activeEvaluation.classId;
      const matched = students.filter(s => {
        if (!s) return false;
        const sClass = (s.className || "").toLowerCase();
        const sClassId = (s as any).classId;
        return (evalClassName && sClass === evalClassName) || (evalClassId && sClassId === evalClassId);
      });
      if (matched.length > 0) return matched;
    }
    return classStudents;
  }, [students, activeEvaluation, classStudents]);

  // Fiche de Cotation computation
  const markSheetData: ClassMarkSheetData = useMemo(() => {
    return calculateClassMarkSheet(classStudents, filteredEvaluations, scores);
  }, [classStudents, filteredEvaluations, scores]);

  // ---------------------------------------------------------------------------
  // NEW / EDIT EVALUATION MODAL FORM
  // ---------------------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalEvaluationId, setModalEvaluationId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    type: EvaluationType;
    classId: string;
    className: string;
    optionName: string;
    subjectId: string;
    subjectName: string;
    period: string;
    date: string;
    time: string;
    durationMinutes: number;
    maxScore: number;
    coefficient: number;
    description: string;
    instructions: string;
    isScheduled: boolean;
  }>({
    title: "",
    type: "Interrogation",
    classId: "",
    className: "",
    optionName: "",
    subjectId: "",
    subjectName: "",
    period: "P1",
    date: new Date().toISOString().split("T")[0],
    time: "08:30",
    durationMinutes: 45,
    maxScore: 20,
    coefficient: 1,
    description: "",
    instructions: "",
    isScheduled: false
  });

  const openCreateModal = (presetType?: EvaluationType) => {
    setModalEvaluationId(null);
    const targetClass = selectedClassObj || authorizedClasses[0] || null;
    const targetSubjects = getAuthorizedSubjectsForClass(targetClass);
    const targetSubject = targetSubjects.find(s => s.name === selectedSubjectName) || targetSubjects[0] || null;

    setFormData({
      title: "",
      type: presetType || "Interrogation",
      classId: targetClass?.id || "",
      className: targetClass?.name || "",
      optionName: targetClass?.optionName || "Tronc Commun",
      subjectId: targetSubject?.id || "",
      subjectName: targetSubject?.name || "",
      period: selectedPeriod || "P1",
      date: new Date().toISOString().split("T")[0],
      time: "08:30",
      durationMinutes: 45,
      maxScore: targetSubject?.maxPointsInterro || 20,
      coefficient: 1,
      description: "",
      instructions: "",
      isScheduled: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (evalItem: Evaluation) => {
    setModalEvaluationId(evalItem.id);
    setFormData({
      title: evalItem.title,
      type: evalItem.type as EvaluationType,
      classId: evalItem.classId,
      className: evalItem.className,
      optionName: evalItem.optionName || "",
      subjectId: evalItem.subjectId,
      subjectName: evalItem.subjectName,
      period: evalItem.period,
      date: evalItem.date,
      time: evalItem.time || "08:30",
      durationMinutes: evalItem.durationMinutes || 45,
      maxScore: evalItem.maxScore,
      coefficient: evalItem.coefficient || 1,
      description: evalItem.description || "",
      instructions: evalItem.instructions || "",
      isScheduled: !!evalItem.isScheduled
    });
    setIsModalOpen(true);
  };

  // Dynamically resolve class and authorized subjects for modal
  const modalClassObj = useMemo(() => {
    return safeClasses.find(c => c && (c.id === formData.classId || c.name === formData.classId)) || authorizedClasses[0] || null;
  }, [safeClasses, authorizedClasses, formData.classId]);

  const modalSubjects = useMemo(() => {
    return getAuthorizedSubjectsForClass(modalClassObj);
  }, [modalClassObj, getAuthorizedSubjectsForClass]);

  // Automatically ensure a valid subject is selected in modal if current subjectName is missing or not in modalSubjects
  useEffect(() => {
    if (isModalOpen && modalSubjects.length > 0) {
      const isCurrentValid = modalSubjects.some(s => s.name === formData.subjectName || s.id === formData.subjectId);
      if (!isCurrentValid || !formData.subjectName) {
        const firstSub = modalSubjects[0];
        setFormData(prev => ({
          ...prev,
          subjectId: firstSub.id,
          subjectName: firstSub.name,
          maxScore: prev.type === "Examen Semestriel" ? (firstSub.maxPointsExamen || 40) : (firstSub.maxPointsInterro || 20)
        }));
      }
    }
  }, [isModalOpen, modalSubjects, formData.subjectName, formData.subjectId]);

  const handleSaveEvaluationModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Veuillez saisir le titre de l'évaluation.");
      return;
    }
    if (!formData.className || !formData.subjectName) {
      alert("Veuillez sélectionner une classe et une matière valides.");
      return;
    }
    if (formData.maxScore <= 0) {
      alert("Le barème maximal doit être supérieur à 0.");
      return;
    }

    const newEval: Evaluation = {
      id: modalEvaluationId || `eval-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: formData.title.trim(),
      type: formData.type,
      subjectId: formData.subjectId || formData.subjectName,
      subjectName: formData.subjectName,
      classId: formData.classId || formData.className,
      className: formData.className,
      optionName: formData.optionName,
      period: formData.period,
      date: formData.date,
      time: formData.time,
      durationMinutes: formData.durationMinutes,
      maxScore: Number(formData.maxScore),
      coefficient: Number(formData.coefficient) || 1,
      description: formData.description,
      instructions: formData.instructions,
      status: "draft",
      isScheduled: formData.isScheduled,
      scheduledDate: formData.isScheduled ? `${formData.date}T${formData.time}` : undefined,
      teacherId: activeTeacher?.id || currentUserId || "ens-01",
      teacherName: userName,
      schoolId: schoolId,
      academicYear: academicYear,
      createdAt: new Date().toISOString()
    };

    saveEvaluation(schoolId, newEval);
    reloadData();
    setIsModalOpen(false);

    // Auto-select and navigate straight to score entry view for this evaluation
    if (newEval.classId) setSelectedClassId(newEval.classId);
    if (newEval.subjectName) setSelectedSubjectName(newEval.subjectName);
    if (newEval.period) setSelectedPeriod(newEval.period);
    setActiveEvaluationId(newEval.id);
    setActiveTab("entry");
    setSaveFeedback(`✓ Évaluation "${newEval.title}" enregistrée avec succès. Vous pouvez maintenant encoder les points des élèves ci-dessous.`);
    setTimeout(() => setSaveFeedback(null), 5000);

    if (formData.isScheduled && onAddNotification) {
      onAddNotification({
        id: `not-sched-${Date.now()}`,
        text: `Évaluation programmée : ${newEval.title} (${newEval.className} - ${newEval.subjectName}) le ${newEval.date} à ${newEval.time}.`,
        targetRoles: ["Élève", "Parent", "Préfet des Études", "Directeur des Études"]
      });
    }
  };

  // ---------------------------------------------------------------------------
  // DIRECT SCORE ENTRY MATRIX FOR CURRENT EVALUATION
  // ---------------------------------------------------------------------------
  const [editingScores, setEditingScores] = useState<{
    [studentId: string]: {
      score: string;
      isAbsent: boolean;
      isJustified: boolean;
      isDispensed: boolean;
      comments: string;
      error?: string;
    };
  }>({});

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Initialize entry scores whenever activeEvaluation changes
  useEffect(() => {
    if (!activeEvaluation) {
      setEditingScores({});
      return;
    }

    const currentEvalScores = scores.filter(s => s.evaluationId === activeEvaluation.id);
    const scoreMap: { [studentId: string]: any } = {};

    entryClassStudents.forEach(std => {
      const match = currentEvalScores.find(s => s.studentId === std.id);
      if (match) {
        scoreMap[std.id] = {
          score: match.scoreObtained !== null && match.scoreObtained !== undefined ? String(match.scoreObtained) : "",
          isAbsent: !!match.isAbsent,
          isJustified: !!match.isJustified,
          isDispensed: !!match.isDispensed,
          comments: match.comments || ""
        };
      } else {
        scoreMap[std.id] = {
          score: "",
          isAbsent: false,
          isJustified: false,
          isDispensed: false,
          comments: ""
        };
      }
    });

    setEditingScores(scoreMap);
    setSaveStatus("idle");
  }, [activeEvaluation, entryClassStudents, scores]);

  const handleScoreChange = (studentId: string, value: string) => {
    if (!activeEvaluation) return;

    let error: string | undefined = undefined;
    if (value !== "") {
      const num = parseFloat(value);
      if (isNaN(num)) {
        error = "Valeur numérique requise";
      } else if (num < 0) {
        error = "Note positive requise";
      } else if (num > activeEvaluation.maxScore) {
        error = `Max dépassé (Max: ${activeEvaluation.maxScore})`;
      }
    }

    setEditingScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: value,
        isAbsent: false,
        isDispensed: false,
        error
      }
    }));
    setSaveStatus("idle");
  };

  const handleToggleAbsent = (studentId: string) => {
    setEditingScores(prev => {
      const current = prev[studentId] || { score: "", isAbsent: false, isJustified: false, isDispensed: false, comments: "" };
      const nextAbsent = !current.isAbsent;
      return {
        ...prev,
        [studentId]: {
          ...current,
          isAbsent: nextAbsent,
          score: nextAbsent ? "" : current.score,
          isDispensed: false,
          error: undefined
        }
      };
    });
  };

  const handleSaveScores = (targetStatus: EvaluationStatus = "draft") => {
    if (!activeEvaluation) {
      alert("Veuillez sélectionner une évaluation.");
      return;
    }

    // Check for any validation errors
    const hasErrors = Object.values(editingScores).some(e => e.error);
    if (hasErrors) {
      alert("Veuillez corriger les notes invalides qui dépassent le barème maximal avant d'enregistrer.");
      return;
    }

    setSaveStatus("saving");

    const scoresToSave: EvaluationScore[] = entryClassStudents.map(std => {
      const entry = editingScores[std.id] || { score: "", isAbsent: false, isJustified: false, isDispensed: false, comments: "" };
      const numScore = entry.score !== "" && !entry.isAbsent && !entry.isDispensed ? parseFloat(entry.score) : null;

      return {
        id: `sc-${activeEvaluation.id}-${std.id}`,
        evaluationId: activeEvaluation.id,
        studentId: std.id,
        studentName: `${std.lastName} ${std.firstName} ${std.postName || ""}`.trim(),
        registrationNumber: std.registrationNumber || std.id,
        scoreObtained: numScore,
        isAbsent: entry.isAbsent,
        isJustified: entry.isJustified,
        isDispensed: entry.isDispensed,
        comments: entry.comments,
        status: targetStatus,
        recordedBy: userName,
        recordedAt: new Date().toISOString(),
        schoolId: schoolId,
        classId: activeEvaluation.classId,
        className: activeEvaluation.className,
        subjectId: activeEvaluation.subjectId,
        subjectName: activeEvaluation.subjectName,
        period: activeEvaluation.period
      };
    });

    const result = saveEvaluationScores(
      schoolId,
      activeEvaluation,
      scoresToSave,
      { id: currentUserId || "usr", name: userName, role: userRole },
      targetStatus === "submitted" ? "Soumission des notes pour validation Direction" : "Saisie des cotes"
    );

    if (!result.success) {
      setSaveStatus("error");
      setSaveFeedback(`Erreur : ${result.errors.join(", ")}`);
      return;
    }

    // Update evaluation status if changed
    if (targetStatus !== activeEvaluation.status) {
      updateEvaluationStatus(schoolId, activeEvaluation.id, targetStatus, { name: userName, role: userRole });
    }

    reloadData();
    setSaveStatus("saved");
    setSaveFeedback(
      targetStatus === "submitted"
        ? `✓ Épreuve "${activeEvaluation.title}" et notes soumises avec succès à la Direction.`
        : `✓ Notes enregistrées en brouillon pour "${activeEvaluation.title}".`
    );

    if (targetStatus === "submitted" && onAddNotification) {
      onAddNotification({
        id: `notif-sub-${Date.now()}`,
        text: `Le Prof. ${userName} a soumis les notes de l'épreuve "${activeEvaluation.title}" (${activeEvaluation.className} - ${activeEvaluation.subjectName}).`,
        targetRoles: ["Préfet des Études", "Directeur du Primaire", "Directeur des Études"]
      });
    }

    setTimeout(() => {
      setSaveFeedback(null);
    }, 4500);
  };

  // Direction action handler
  const handleDirectionAction = (evalId: string, action: "validate" | "publish" | "unpublish" | "reject") => {
    let targetStatus: EvaluationStatus = "draft";
    if (action === "validate") targetStatus = "validated";
    if (action === "publish") targetStatus = "published";
    if (action === "unpublish") targetStatus = "validated";
    if (action === "reject") targetStatus = "draft";

    updateEvaluationStatus(schoolId, evalId, targetStatus, { name: userName, role: userRole });
    reloadData();

    if (onAddNotification) {
      const targetEval = evaluations.find(e => e.id === evalId);
      if (targetEval) {
        onAddNotification({
          id: `notif-dir-${Date.now()}`,
          text: `Direction : L'épreuve "${targetEval.title}" a été ${action === "validate" ? "validée" : action === "publish" ? "publiée aux élèves et parents" : "rejetée pour révision"}.`,
          targetRoles: ["Enseignant", "Élève", "Parent"]
        });
      }
    }
  };

  // Student search query in data grid
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>("");

  const filteredMarkSheetRows = useMemo(() => {
    if (!studentSearchQuery.trim()) return markSheetData.rows;
    const q = studentSearchQuery.toLowerCase();
    return markSheetData.rows.filter(r => 
      `${r.student.lastName} ${r.student.firstName} ${r.student.postName || ""}`.toLowerCase().includes(q) ||
      (r.student.registrationNumber && r.student.registrationNumber.toLowerCase().includes(q))
    );
  }, [markSheetData.rows, studentSearchQuery]);

  // Printable mark sheet export
  const handlePrintMarkSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* -----------------------------------------------------------------------
          TOP TITLE & SUB-NAV
      ------------------------------------------------------------------------ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-teal-600 rounded-2xl text-white shadow-md shadow-indigo-500/20">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <span>Système de Cotation & Évaluations Scolaires</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                  EPST RDC
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestion des épreuves, encodage des cotes, fiche de cotation dynamique, validation et publication.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Create Action */}
          <button
            onClick={() => openCreateModal()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Évaluation</span>
          </button>

          <button
            onClick={handlePrintMarkSheet}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer la Fiche</span>
          </button>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          SELECTORS CONTEXT BAR (Classe -> Option -> Matière -> Période)
      ------------------------------------------------------------------------ */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Classe Selector */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
              Classe Attribuée
            </label>
            {authorizedClasses.length === 0 ? (
              <div className="p-2.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 font-medium">
                Aucune classe attribuée
              </div>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {authorizedClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.optionName && cls.optionName !== "Tronc Commun" ? `(${cls.optionName})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Option Indicator */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
              Option / Section
            </label>
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs truncate">
              {selectedClassObj?.optionName || "Tronc Commun"}
            </div>
          </div>

          {/* Matière Selector */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
              Matière Enseignée
            </label>
            {authorizedSubjects.length === 0 ? (
              <div className="p-2.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 font-medium">
                Aucune matière disponible
              </div>
            ) : (
              <select
                value={selectedSubjectName}
                onChange={(e) => setSelectedSubjectName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {authorizedSubjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name} (Max {sub.maxPointsInterro || 20} pts)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Période / Examen */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
              Période Scolaire / Session
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="P1">1ère Période (P1) - 1er Semestre</option>
              <option value="P2">2ème Période (P2) - 1er Semestre</option>
              <option value="EXAM1">Examen du 1er Semestre</option>
              <option value="P3">3ème Période (P3) - 2ème Semestre</option>
              <option value="P4">4ème Période (P4) - 2ème Semestre</option>
              <option value="EXAM2">Examen du 2ème Semestre</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation Switches */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab("marksheet")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "marksheet"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Fiche de Cotation Consolidée</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-700/50 text-white">
              {filteredEvaluations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("evaluations")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "evaluations"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Liste des Évaluations</span>
          </button>

          <button
            onClick={() => setActiveTab("entry")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "entry"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <Edit className="h-4 w-4" />
            <span>Saisie des Résultats d'une Épreuve</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "calendar"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Épreuves Programmées</span>
          </button>

          <button
            onClick={() => setActiveTab("audits")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "audits"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Historique & Audit</span>
          </button>

          {isDirectionUser && (
            <button
              onClick={() => setActiveTab("direction")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
                activeTab === "direction"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Supervision Direction</span>
            </button>
          )}
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          STATUS FEEDBACK BANNER
      ------------------------------------------------------------------------ */}
      {saveFeedback && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 1: FICHE DE COTATION CONSOLIDÉE (DATA GRID WITH 2D SCROLLING)
      ------------------------------------------------------------------------ */}
      {activeTab === "marksheet" && (
        <div className="space-y-4">
          {/* Header Controls inside MarkSheet */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un élève..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium w-48 sm:w-64"
                />
              </div>

              <span className="text-[11px] text-slate-500">
                <strong>{classStudents.length}</strong> élève(s) dans la classe
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Épreuves créées : <strong className="text-indigo-600 dark:text-indigo-400">{filteredEvaluations.length}</strong>
              </span>
            </div>
          </div>

          {authorizedClasses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 dark:text-white">Aucune classe ne vous a été attribuée</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                La direction n'a pas encore assigné de classe ou de matière à votre compte enseignant.
              </p>
            </div>
          ) : classStudents.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Users className="h-10 w-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 dark:text-white">Aucun élève trouvé dans cette classe</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Aucun élève n'est encore inscrit dans la classe <strong>{selectedClassObj?.name}</strong>.
              </p>
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
              <BookOpen className="h-10 w-10 text-indigo-400 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                  Aucune évaluation n'a encore été créée pour {selectedSubjectName} ({selectedPeriod})
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Créez d'abord une épreuve (Interrogation, TP, Devoir, Contrôle ou Examen) pour pouvoir enregistrer des points et générer automatiquement la fiche de cotation.
                </p>
              </div>
              <button
                onClick={() => openCreateModal()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Créer la première évaluation</span>
              </button>
            </div>
          ) : (
            /* -----------------------------------------------------------------
               THE PROFESSIONAL 2D DATA GRID (STICKY HEADERS & STICKY FIRST COLUMN)
            ------------------------------------------------------------------ */
            <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div className="w-full overflow-x-auto max-h-[620px] overflow-y-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  {/* Fixed Table Header */}
                  <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-850 shadow-xs">
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">
                      {/* Top-Left Corner: Pinned horizontally and vertically */}
                      <th className="sticky left-0 top-0 z-30 bg-slate-200 dark:bg-slate-800 p-3 min-w-[200px] border-r border-slate-300 dark:border-slate-700">
                        Noms des Élèves & Matricule
                      </th>

                      {/* Evaluation Columns */}
                      {filteredEvaluations.map((ev) => (
                        <th
                          key={ev.id}
                          className="p-3 text-center min-w-[120px] border-r border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                          onClick={() => {
                            setActiveEvaluationId(ev.id);
                            setActiveTab("entry");
                          }}
                          title="Cliquez pour saisir ou modifier les notes de cette épreuve"
                        >
                          <div className="font-extrabold text-slate-900 dark:text-white truncate">
                            {ev.title}
                          </div>
                          <div className="flex items-center justify-center space-x-1 mt-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                            <span>/{ev.maxScore}</span>
                            {ev.coefficient > 1 && <span>(coef {ev.coefficient})</span>}
                          </div>
                          <div className="text-[8px] text-slate-400 font-normal">
                            {ev.date} • {ev.type}
                          </div>
                        </th>
                      ))}

                      {/* Synthesis Columns */}
                      <th className="p-3 text-center min-w-[90px] bg-slate-150 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-black">
                        Total Pts
                      </th>
                      <th className="p-3 text-center min-w-[90px] bg-slate-150 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-black text-indigo-700 dark:text-indigo-300">
                        Moy /20
                      </th>
                      <th className="p-3 text-center min-w-[90px] bg-slate-150 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-black">
                        Pourcentage
                      </th>
                      <th className="p-3 text-center min-w-[80px] bg-slate-150 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-black">
                        Rang
                      </th>
                      <th className="p-3 min-w-[130px] bg-slate-150 dark:bg-slate-900 font-black">
                        Appréciation
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredMarkSheetRows.map((row, idx) => {
                      const isPassing = row.percentage >= 50;

                      return (
                        <tr key={row.student.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Sticky Student Name & Registration */}
                          <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 p-3 border-r border-slate-200 dark:border-slate-800 font-medium">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono text-slate-400 w-5">
                                {idx + 1}.
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                  {row.student.lastName} {row.student.firstName} {row.student.postName || ""}
                                </p>
                                <p className="text-[9px] font-mono text-slate-400 truncate">
                                  {row.student.registrationNumber || row.student.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Evaluation Scores Cells */}
                          {filteredEvaluations.map((ev) => {
                            const sc = row.scores[ev.id];
                            const hasScore = sc && sc.scoreObtained !== null && sc.scoreObtained !== undefined;
                            const isAbsent = sc?.isAbsent;
                            const isDispensed = sc?.isDispensed;

                            let scoreText = "-";
                            let cellBg = "";
                            let textColor = "text-slate-400";

                            if (isAbsent) {
                              scoreText = sc.isJustified ? "AJ" : "Abs";
                              textColor = "text-rose-600 font-bold";
                              cellBg = "bg-rose-50/50 dark:bg-rose-950/20";
                            } else if (isDispensed) {
                              scoreText = "Disp";
                              textColor = "text-amber-600 font-bold";
                            } else if (hasScore) {
                              scoreText = `${sc.scoreObtained}`;
                              const pct = (sc.scoreObtained! / ev.maxScore) * 100;
                              textColor = pct >= 50 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-rose-600 font-bold";
                              cellBg = pct < 50 ? "bg-rose-50/30 dark:bg-rose-950/10" : "";
                            }

                            return (
                              <td
                                key={ev.id}
                                onClick={() => {
                                  setActiveEvaluationId(ev.id);
                                  setActiveTab("entry");
                                }}
                                className={`p-3 text-center border-r border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-indigo-100/40 transition-colors ${cellBg}`}
                                title={`Modifier la note de ${row.student.lastName} pour ${ev.title}`}
                              >
                                <span className={`font-mono text-xs ${textColor}`}>
                                  {scoreText}
                                </span>
                              </td>
                            );
                          })}

                          {/* Total Score */}
                          <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/30 border-r border-slate-100 dark:border-slate-800">
                            {row.totalMax > 0 ? `${row.totalObtained}/${row.totalMax}` : "-"}
                          </td>

                          {/* Weighted Average /20 */}
                          <td className="p-3 text-center font-mono font-black text-indigo-600 dark:text-indigo-400 bg-slate-50/50 dark:bg-slate-950/30 border-r border-slate-100 dark:border-slate-800">
                            {row.totalMax > 0 ? `${row.weightedAverage}/20` : "-"}
                          </td>

                          {/* Percentage */}
                          <td className="p-3 text-center bg-slate-50/50 dark:bg-slate-950/30 border-r border-slate-100 dark:border-slate-800">
                            {row.totalMax > 0 ? (
                              <span className={`font-mono font-extrabold px-1.5 py-0.5 rounded-md text-[11px] ${
                                isPassing
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              }`}>
                                {row.percentage}%
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Rank */}
                          <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/30 border-r border-slate-100 dark:border-slate-800">
                            {row.rankFormatted || "-"}
                          </td>

                          {/* Mention */}
                          <td className="p-3 text-[10px] bg-slate-50/50 dark:bg-slate-950/30">
                            <span className={row.mentionColor}>{row.mention}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Summary Footer */}
                  <tfoot className="bg-slate-100 dark:bg-slate-850 font-bold text-xs border-t-2 border-slate-300 dark:border-slate-700">
                    <tr>
                      <td className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-850 p-3 border-r border-slate-300 dark:border-slate-700 uppercase text-[10px] font-black text-slate-700 dark:text-slate-200">
                        Synthèse Pédagogique
                      </td>
                      <td colSpan={filteredEvaluations.length} className="p-3 text-slate-500 text-[10px]">
                        Moyenne Générale Classe : <strong className="text-slate-900 dark:text-white font-mono">{markSheetData.classAverage}%</strong> • Taux de Réussite : <strong className="text-emerald-600 font-mono">{markSheetData.successRate}%</strong>
                      </td>
                      <td colSpan={5} className="p-3 text-right text-[10px] text-slate-500">
                        Max: <strong className="font-mono text-emerald-600">{markSheetData.highestPercentage}%</strong> • Min: <strong className="font-mono text-rose-600">{markSheetData.lowestPercentage}%</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 2: LISTE DES ÉVALUATIONS & ACTIONS
      ------------------------------------------------------------------------ */}
      {activeTab === "evaluations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white">
              Évaluations créées pour {selectedClassObj?.name} - {selectedSubjectName} ({selectedPeriod})
            </h3>
            <button
              onClick={() => openCreateModal()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Créer une épreuve</span>
            </button>
          </div>

          {filteredEvaluations.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Aucune évaluation n'a encore été créée.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvaluations.map((ev) => {
                const isDraft = ev.status === "draft";
                const isSubmitted = ev.status === "submitted";
                const isValidated = ev.status === "validated";
                const isPublished = ev.status === "published";

                return (
                  <div
                    key={ev.id}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {ev.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            isPublished
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : isValidated
                              ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                              : isSubmitted
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {isPublished
                            ? "✓ Publié aux Parents"
                            : isValidated
                            ? "✓ Validé par Direction"
                            : isSubmitted
                            ? "⏳ Soumis à Direction"
                            : "✏️ Brouillon"}
                        </span>
                      </div>

                      <h4 className="font-black text-slate-900 dark:text-white text-sm">
                        {ev.title}
                      </h4>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                        <div>
                          Barème : <strong className="text-slate-800 dark:text-slate-200 font-mono">/{ev.maxScore} pts</strong>
                        </div>
                        <div>
                          Coefficient : <strong className="text-slate-800 dark:text-slate-200 font-mono">{ev.coefficient}</strong>
                        </div>
                        <div>
                          Date : <strong className="text-slate-800 dark:text-slate-200">{ev.date}</strong>
                        </div>
                        <div>
                          Durée : <strong className="text-slate-800 dark:text-slate-200">{ev.durationMinutes || 45} min</strong>
                        </div>
                      </div>

                      {ev.description && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border">
                          "{ev.description}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setActiveEvaluationId(ev.id);
                          setActiveTab("entry");
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Saisir les points</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(ev)}
                          disabled={isValidated || isPublished}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-30 cursor-pointer"
                          title="Modifier l'épreuve"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Confirmez-vous la suppression de l'épreuve "${ev.title}" ?`)) {
                              deleteEvaluation(schoolId, ev.id);
                              reloadData();
                            }
                          }}
                          disabled={isValidated || isPublished}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg text-rose-500 disabled:opacity-30 cursor-pointer"
                          title="Supprimer l'épreuve"
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
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 3: SAISIE DES RÉSULTATS POUR L'ÉVALUATION SÉLECTIONNÉE
      ------------------------------------------------------------------------ */}
      {activeTab === "entry" && (
        <div className="space-y-4">
          {/* Active evaluation selector */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Épreuve à coter (Sélection directe sans recréation)
                </label>
                {availableEvaluationsForEntry.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">
                    Aucune épreuve trouvée. Veuillez d'abord en créer une ci-dessous.
                  </div>
                ) : (
                  <select
                    value={activeEvaluation?.id || ""}
                    onChange={(e) => {
                      const chosenId = e.target.value;
                      setActiveEvaluationId(chosenId);
                      const chosenEval = evaluations.find(ev => ev.id === chosenId);
                      if (chosenEval) {
                        if (chosenEval.classId) setSelectedClassId(chosenEval.classId);
                        if (chosenEval.subjectName) setSelectedSubjectName(chosenEval.subjectName);
                        if (chosenEval.period) setSelectedPeriod(chosenEval.period);
                      }
                    }}
                    className="w-full max-w-xl p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs"
                  >
                    {availableEvaluationsForEntry.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} — {ev.className} ({ev.subjectName}, {ev.period}, /{ev.maxScore} pts)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openCreateModal()}
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-indigo-200 dark:border-indigo-800 cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle Évaluation</span>
                </button>

                {activeEvaluation && (
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                      activeEvaluation.status === "published"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : activeEvaluation.status === "validated"
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                        : activeEvaluation.status === "submitted"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {activeEvaluation.status === "published"
                      ? "✓ Publié aux Parents"
                      : activeEvaluation.status === "validated"
                      ? "✓ Validé par la Direction"
                      : activeEvaluation.status === "submitted"
                      ? "⏳ Soumis à la Direction"
                      : "✏️ Brouillon Enseignant"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!activeEvaluation ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <BookOpen className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Veuillez sélectionner ou créer une évaluation pour commencer la saisie.</p>
              <button
                onClick={() => openCreateModal()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1 shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Nouvelle Évaluation</span>
              </button>
            </div>
          ) : entryClassStudents.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed text-xs text-slate-500">
              Aucun élève trouvé dans la classe <strong className="text-slate-800 dark:text-slate-200">{activeEvaluation.className}</strong> pour saisir les notes.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-4 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Saisie des points : {activeEvaluation.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {activeEvaluation.className} • {activeEvaluation.subjectName} ({activeEvaluation.period})
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Barème maximal autorisé : <strong className="text-indigo-600 dark:text-indigo-400 font-mono">/{activeEvaluation.maxScore}</strong>. Toute note supérieure sera automatiquement refusée.
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-500">
                  {saveStatus === "saving" && <span className="text-blue-600 animate-pulse">Enregistrement en cours...</span>}
                  {saveStatus === "saved" && <span className="text-emerald-600">✓ Enregistré</span>}
                </div>
              </div>

              {/* Score Input Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase border-b">
                      <th className="p-3 w-12 text-center">N°</th>
                      <th className="p-3">Élève</th>
                      <th className="p-3 text-center w-36">Note Obtenue (/{activeEvaluation.maxScore})</th>
                      <th className="p-3 text-center w-28">Présence</th>
                      <th className="p-3 text-center w-28">Pourcentage</th>
                      <th className="p-3">Observation / Remarque</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {entryClassStudents.map((std, idx) => {
                      const entry = editingScores[std.id] || { score: "", isAbsent: false, isJustified: false, isDispensed: false, comments: "" };
                      const numVal = parseFloat(entry.score);
                      const maxVal = activeEvaluation.maxScore;
                      const hasNum = !isNaN(numVal) && !entry.isAbsent;
                      const pct = hasNum && maxVal > 0 ? ((numVal / maxVal) * 100).toFixed(1) : null;
                      const isPassing = pct ? parseFloat(pct) >= 50 : true;
                      const isLocked = (activeEvaluation.status === "validated" || activeEvaluation.status === "published") && !isDirectionUser;

                      return (
                        <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                          <td className="p-3 text-center font-mono text-slate-400 text-[10px]">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                            <div>{std.lastName} {std.firstName} {std.postName || ""}</div>
                            <span className="text-[9px] font-mono text-slate-400">{std.registrationNumber || std.id}</span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={maxVal}
                                disabled={isLocked || entry.isAbsent || entry.isDispensed}
                                value={entry.score}
                                onChange={(e) => handleScoreChange(std.id, e.target.value)}
                                className={`w-24 p-2 text-center rounded-xl font-mono font-bold text-sm border ${
                                  entry.error
                                    ? "border-rose-500 bg-rose-50 text-rose-900 focus:ring-rose-500"
                                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                } disabled:opacity-40`}
                                placeholder={`/${maxVal}`}
                              />
                              {entry.error && (
                                <span className="text-[9px] font-bold text-rose-600 mt-1 flex items-center gap-0.5">
                                  <AlertTriangle className="h-3 w-3" />
                                  {entry.error}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleToggleAbsent(std.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                entry.isAbsent
                                  ? "bg-rose-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                              }`}
                            >
                              {entry.isAbsent ? "Absent" : "Présent"}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            {entry.isAbsent ? (
                              <span className="text-rose-600 font-bold text-[11px]">0.0% (Abs)</span>
                            ) : pct !== null ? (
                              <span className={`font-mono font-extrabold text-[11px] ${isPassing ? "text-emerald-600" : "text-rose-600"}`}>
                                {pct}%
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              disabled={isLocked}
                              value={entry.comments || ""}
                              onChange={(e) => setEditingScores({
                                ...editingScores,
                                [std.id]: { ...entry, comments: e.target.value }
                              })}
                              placeholder="Remarque..."
                              className="w-full p-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons for Score Entry */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
                <div className="text-[11px] text-slate-500">
                  Total : <strong>{entryClassStudents.length}</strong> élève(s) dans la classe.
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSaveScores("draft")}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    <span>Enregistrer Brouillon</span>
                  </button>

                  <button
                    onClick={() => handleSaveScores("submitted")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="h-4 w-4" />
                    <span>Soumettre à la Direction</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 4: CALENDRIER DES ÉPREUVES PROGRAMMÉES
      ------------------------------------------------------------------------ */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white">
              Épreuves & Contrôles Programmés à l'Avance
            </h3>
            <button
              onClick={() => openCreateModal()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Programmer une épreuve</span>
            </button>
          </div>

          {evaluations.filter(e => e.isScheduled || new Date(e.date) >= new Date()).length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed text-xs text-slate-500">
              Aucune épreuve n'est actuellement programmée à l'avance.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluations
                .filter(e => e.isScheduled || new Date(e.date) >= new Date())
                .map((ev) => (
                  <div key={ev.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {ev.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ev.time || "08:30"} ({ev.durationMinutes || 45} min)
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ev.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Classe : <strong className="text-slate-800 dark:text-slate-200">{ev.className}</strong> • Matière : <strong className="text-slate-800 dark:text-slate-200">{ev.subjectName}</strong>
                    </p>
                    <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-[10px] text-slate-600 dark:text-slate-400">
                      Date prévue : <strong>{ev.date}</strong> • Barème : <strong>/{ev.maxScore}</strong>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 5: AUDIT TRAIL / HISTORIQUE DES MODIFICATIONS
      ------------------------------------------------------------------------ */}
      {activeTab === "audits" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white">
              Historique et Traçabilité des Cotes Scolaires
            </h3>
            <span className="text-xs text-slate-500">
              {audits.length} modification(s) enregistrée(s)
            </span>
          </div>

          {audits.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed text-xs text-slate-500">
              Aucune modification de note enregistrée dans le journal d'audit.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-black text-[10px] uppercase border-b">
                    <th className="p-3">Date & Heure</th>
                    <th className="p-3">Auteur</th>
                    <th className="p-3">Élève</th>
                    <th className="p-3">Épreuve & Matière</th>
                    <th className="p-3 text-center">Ancienne Note</th>
                    <th className="p-3 text-center">Nouvelle Note</th>
                    <th className="p-3">Motif / Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {audits.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                      <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">{a.date} à {a.time}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {a.actorName} <span className="text-[10px] font-normal text-slate-400">({a.actorRole})</span>
                      </td>
                      <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{a.studentName}</td>
                      <td className="p-3">
                        <div className="font-semibold">{a.evaluationTitle}</div>
                        <span className="text-[10px] text-slate-400">{a.className} • {a.subjectName}</span>
                      </td>
                      <td className="p-3 text-center font-mono text-rose-600 font-bold">{a.oldScore ?? "-"}</td>
                      <td className="p-3 text-center font-mono text-emerald-600 font-bold">{a.newScore ?? "-"}</td>
                      <td className="p-3 text-[11px] text-slate-500 italic">{a.reason || "Modification"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 6: SUPERVISION DIRECTION (POUR PRÉFET / DOYEN / DIRECTEUR)
      ------------------------------------------------------------------------ */}
      {activeTab === "direction" && isDirectionUser && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl">
            <h3 className="text-sm font-black uppercase text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Tableau de Contrôle et Validation des Cotes par la Direction</span>
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              Validez formellement les résultats soumis par les enseignants avant de les publier aux bulletins des élèves et aux parents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.map((ev) => (
              <div key={ev.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {ev.className} • {ev.subjectName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      ev.status === "published"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : ev.status === "validated"
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                        : ev.status === "submitted"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ev.title}</h4>
                <div className="text-xs text-slate-500">
                  Enseignant : <strong>{ev.teacherName}</strong> • Barème : <strong>/{ev.maxScore}</strong> • Période : <strong>{ev.period}</strong>
                </div>

                <div className="pt-3 border-t flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveEvaluationId(ev.id);
                      setActiveTab("marksheet");
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Consulter la Fiche</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    {ev.status === "submitted" && (
                      <button
                        onClick={() => handleDirectionAction(ev.id, "validate")}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Valider</span>
                      </button>
                    )}

                    {(ev.status === "validated" || ev.status === "submitted") && (
                      <button
                        onClick={() => handleDirectionAction(ev.id, "publish")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        <span>Publier aux Parents</span>
                      </button>
                    )}

                    {ev.status === "published" && (
                      <button
                        onClick={() => handleDirectionAction(ev.id, "unpublish")}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>Dé-publier</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          CREATE / EDIT EVALUATION MODAL
      ------------------------------------------------------------------------ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                <span>{modalEvaluationId ? "Modifier l'Évaluation" : "Créer une Nouvelle Évaluation"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluationModal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Titre de l'évaluation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Interrogation N°1 sur les Fonctions Logarithmiques"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Type d'épreuve *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EvaluationType })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="Interrogation">Interrogation</option>
                    <option value="Interrogation Écrite">Interrogation Écrite</option>
                    <option value="Interrogation Orale">Interrogation Orale</option>
                    <option value="Exercice">Exercice</option>
                    <option value="Devoir à Domicile">Devoir à Domicile</option>
                    <option value="Contrôle">Contrôle</option>
                    <option value="Travail Pratique (TP)">Travail Pratique (TP)</option>
                    <option value="Examen Semestriel">Examen Semestriel</option>
                    <option value="Composition">Composition</option>
                    <option value="Autre">Autre Évaluation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Période Scolaire *
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="P1">1ère Période (P1)</option>
                    <option value="P2">2ème Période (P2)</option>
                    <option value="EXAM1">Examen 1er Semestre</option>
                    <option value="P3">3ème Période (P3)</option>
                    <option value="P4">4ème Période (P4)</option>
                    <option value="EXAM2">Examen 2ème Semestre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Classe *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => {
                      const chosenClassId = e.target.value;
                      const cls = safeClasses.find(c => c && (c.id === chosenClassId || c.name === chosenClassId));
                      const newSubjects = getAuthorizedSubjectsForClass(cls);
                      const firstSub = newSubjects[0] || null;
                      setFormData({
                        ...formData,
                        classId: chosenClassId,
                        className: cls?.name || chosenClassId,
                        optionName: cls?.optionName || "Tronc Commun",
                        subjectId: firstSub?.id || "",
                        subjectName: firstSub?.name || "",
                        maxScore: firstSub?.maxPointsInterro || formData.maxScore
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    {authorizedClasses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.optionName ? `(${c.optionName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Matière *
                  </label>
                  <select
                    value={formData.subjectName}
                    onChange={(e) => {
                      const sub = modalSubjects.find(s => s.name === e.target.value);
                      setFormData({
                        ...formData,
                        subjectId: sub?.id || e.target.value,
                        subjectName: e.target.value,
                        maxScore: sub?.maxPointsInterro || formData.maxScore
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    {modalSubjects.length === 0 ? (
                      <option value="">Aucune matière attribuée</option>
                    ) : (
                      modalSubjects.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Barème Max (/Pts) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Coefficient *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.coefficient}
                    onChange={(e) => setFormData({ ...formData, coefficient: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Durée (min)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date de l'épreuve *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isScheduledCheck"
                  checked={formData.isScheduled}
                  onChange={(e) => setFormData({ ...formData, isScheduled: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="isScheduledCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Programmer cette épreuve à l'avance (visible dans le calendrier et sur les portails)
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Consignes pour les élèves
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Chapitres concernés, matériel autorisé (calculatrice, compas)..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {modalEvaluationId ? "Mettre à jour" : "Enregistrer l'évaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
