import React, { useState, useMemo, useEffect } from "react";
import { 
  LayoutDashboard, 
  School, 
  BookOpen, 
  Users, 
  CheckSquare, 
  Award, 
  FileText, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Send, 
  Folder, 
  Calendar, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Image as ImageIcon, 
  FileUp,
  Settings,
  ChevronRight,
  AlertCircle,
  Landmark,
  Bell,
  Sparkles,
  ShieldCheck,
  Building,
  UserCheck,
  UserX,
  Printer,
  Download,
  Check,
  Save,
  Lock,
  Eye,
  RefreshCw,
  Wallet,
  CreditCard,
  Smartphone,
  Receipt,
  Shield
} from "lucide-react";
import { NationalCultureHeritageModule } from "./NationalCultureHeritageModule";
import { usePedagogicalTimetable } from "../context/PedagogicalTimetableContext";
import { ClassJournalModule } from "./ClassJournalModule";
import { EvaluationGradingSystem } from "./EvaluationGradingSystem";
import { PrintPreviewModal } from "./PrintPreviewModal";
import { calculateOfficialStudentBulletin } from "../services/officialBulletinService";
import { 
  Student, 
  Teacher, 
  ClassRoom, 
  Subject, 
  Grade, 
  Attendance, 
  UserAccount,
  SchoolBulletinPermissions,
  TeacherPayoutDetails,
  TeacherSalaryPayment
} from "../types";
import { safeLocalStorage } from "../utils/safeStorage";
import { 
  broadcastRealtimeUpdate, 
  loadPersistentCollection, 
  savePersistentItem 
} from "../services/dataPersistenceService";
import { recordFinancialAudit } from "../services/financialAuditService";

interface TeacherModuleProps {
  userRole: string;
  userName: string;
  userEmail?: string;
  currentUserId?: string | null;
  currentUserAccount?: UserAccount | null;
  students?: Student[];
  teachers?: Teacher[];
  classes?: ClassRoom[];
  subjects?: Subject[];
  grades?: Grade[];
  attendances?: Attendance[];
  activeSchool?: any;
  academicYear?: string;
  schoolId?: string;
  onSaveAttendance?: (newAttendances: Attendance[]) => void;
  onSaveGrades?: (newGrades: Grade[]) => void;
  onAddNotification?: (notif: any) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  bulletinSettings?: SchoolBulletinPermissions;
}

export function TeacherModule({ 
  userRole, 
  userName, 
  userEmail,
  currentUserId,
  currentUserAccount,
  students = [], 
  teachers = [],
  classes = [],
  subjects = [],
  grades: initialGrades = [],
  attendances: initialAttendances = [],
  activeSchool,
  academicYear = "2026-2027",
  schoolId = "sch-001",
  onSaveAttendance,
  onSaveGrades,
  onAddNotification,
  onUpdateTeacher,
  bulletinSettings
}: TeacherModuleProps) {
  const {
    getTeacherAssignments,
    timetableEntries,
    classJournalEntries,
    saveClassJournalEntry,
    generateDailyRemindersForTeacher,
    getTodayPendingCoursesForTeacher,
    courseReminders,
    dismissReminder
  } = usePedagogicalTimetable();

  const [activeSubTab, setActiveSubTab] = useState<string>("dashboard");

  // 1. DYNAMICALLY RESOLVE ACTIVE TEACHER PROFILE
  const activeTeacher = useMemo(() => {
    // Match by ID / UserAccount / Username / Name
    const matched = teachers.find(t => {
      if (currentUserId && t.id === currentUserId) return true;
      if (currentUserAccount?.dossierId && t.id === currentUserAccount.dossierId) return true;
      if (currentUserAccount?.username && t.username === currentUserAccount.username) return true;
      if (t.username && userName && t.username.toLowerCase() === userName.toLowerCase()) return true;
      if (t.matriculeEtat && userName && t.matriculeEtat.toLowerCase() === userName.toLowerCase()) return true;
      const fullName = `${t.firstName || ""} ${t.lastName || ""}`.trim().toLowerCase();
      const reverseName = `${t.lastName || ""} ${t.firstName || ""}`.trim().toLowerCase();
      const uClean = (userName || "").toLowerCase();
      return fullName === uClean || reverseName === uClean || uClean.includes(t.lastName?.toLowerCase() || "");
    });
    return matched || null;
  }, [teachers, currentUserId, currentUserAccount, userName]);

  // 1.b TEACHER SELF-SERVICE PAYOUT DETAILS & SALARY SLIPS
  const [payoutForm, setPayoutForm] = useState<TeacherPayoutDetails>(() => {
    return activeTeacher?.payoutDetails || {
      paymentMethod: "M-Pesa",
      receivingNumberOrIban: activeTeacher?.phone || "",
      accountHolderName: `${activeTeacher?.lastName || ""} ${activeTeacher?.firstName || ""}`.trim() || userName,
      bankName: "Rawbank RDC",
      preferredCurrency: activeTeacher?.salaryCurrency || "USD",
      isVerifiedByTeacher: true,
      notes: ""
    };
  });

  useEffect(() => {
    if (activeTeacher?.payoutDetails) {
      setPayoutForm(activeTeacher.payoutDetails);
    } else if (activeTeacher) {
      setPayoutForm({
        paymentMethod: "M-Pesa",
        receivingNumberOrIban: activeTeacher.phone || "",
        accountHolderName: `${activeTeacher.lastName || ""} ${activeTeacher.firstName || ""}`.trim() || userName,
        bankName: "Rawbank RDC",
        preferredCurrency: activeTeacher.salaryCurrency || "USD",
        isVerifiedByTeacher: true,
        notes: ""
      });
    }
  }, [activeTeacher, userName]);

  const [payoutSaveSuccess, setPayoutSaveSuccess] = useState<string | null>(null);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [salaryPayments, setSalaryPayments] = useState<TeacherSalaryPayment[]>([]);
  const [selectedPaySlipForModal, setSelectedPaySlipForModal] = useState<TeacherSalaryPayment | null>(null);

  // Load teacher's salary payment history
  useEffect(() => {
    loadPersistentCollection<TeacherSalaryPayment>(schoolId, "teacher_salary_payments", []).then(records => {
      if (Array.isArray(records)) {
        const myPayments = records.filter(p => 
          p.teacherId === activeTeacher?.id || 
          (activeTeacher?.lastName && p.teacherName?.toLowerCase().includes(activeTeacher.lastName.toLowerCase())) ||
          (userName && p.teacherName?.toLowerCase().includes(userName.toLowerCase()))
        );
        setSalaryPayments(myPayments);
      }
    });
  }, [schoolId, activeTeacher, userName]);

  const handleSavePayoutDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeacher) return;
    setIsSavingPayout(true);

    const updatedPayout: TeacherPayoutDetails = {
      ...payoutForm,
      lastUpdatedByTeacherAt: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      isVerifiedByTeacher: true
    };

    const updatedTeacher: Teacher = {
      ...activeTeacher,
      payoutDetails: updatedPayout,
      salaryCurrency: updatedPayout.preferredCurrency
    };

    // Save in persistent collection
    await savePersistentItem<Teacher>(schoolId, "teachers", updatedTeacher);

    if (onUpdateTeacher) {
      onUpdateTeacher(updatedTeacher);
    }

    // Record audit trail
    await recordFinancialAudit({
      schoolId,
      schoolName: activeSchool?.name || "Établissement Scolaire",
      operatorId: activeTeacher.id || currentUserId || "tch-anon",
      operatorName: `${activeTeacher.firstName} ${activeTeacher.lastName}`,
      operatorRole: "Enseignant",
      actionType: "MODIFICATION_COORDONNEES_PAIE",
      currency: updatedPayout.preferredCurrency,
      paymentMethod: updatedPayout.paymentMethod,
      mobileOperator: updatedPayout.paymentMethod,
      transactionReference: `PAYOUT-CFG-${(activeTeacher.id || "0000").slice(-4)}`,
      justification: `Mise à jour des coordonnées de réception salaire (${updatedPayout.paymentMethod} - ${updatedPayout.receivingNumberOrIban}) par l'enseignant.`,
      metadata: {
        receivingNumber: updatedPayout.receivingNumberOrIban,
        accountHolder: updatedPayout.accountHolderName,
        bankName: updatedPayout.bankName
      }
    });

    setIsSavingPayout(false);
    setPayoutSaveSuccess("Vos coordonnées de réception ont été enregistrées avec succès ! Elles seront utilisées par le Promoteur lors du paiement de votre salaire.");
    setTimeout(() => setPayoutSaveSuccess(null), 6000);
  };

  // 2. DYNAMICALLY RESOLVE ASSIGNED CLASSES (Strictly from real DB assignments)
  const teacherAssignments = useMemo(() => {
    const fromTimetable = getTeacherAssignments(activeTeacher?.id || userName);
    return fromTimetable || [];
  }, [getTeacherAssignments, activeTeacher, userName]);

  const teachersClasses = useMemo(() => {
    // 1. Build a strict lookup of valid classes belonging to this school
    const validSchoolClasses = classes.filter(Boolean);
    if (validSchoolClasses.length === 0) return [];

    const matchedClasses = new Set<string>();

    validSchoolClasses.forEach(cls => {
      const clsId = cls.id?.toLowerCase().trim();
      const clsName = cls.name?.toLowerCase().trim();
      const clsComposite = `${cls.classGrade || cls.level} ${cls.roomLetter}`.toLowerCase().trim();
      const canonicalName = cls.name || `${cls.classGrade || cls.level} ${cls.roomLetter}`.trim();

      // Check A: Teacher object direct assignments (assignedClasses or assignedClassIds)
      const directClasses = (activeTeacher?.assignedClasses || []).concat((activeTeacher as any)?.assignedClassIds || []);
      const isDirectlyAssigned = directClasses.some(ac => {
        if (!ac || typeof ac !== "string") return false;
        const norm = ac.toLowerCase().trim();
        return norm === clsId || norm === clsName || norm === clsComposite || (clsName && norm.includes(clsName)) || (clsName && clsName.includes(norm));
      });

      // Check B: Timetable course assignments
      const isTimetableAssigned = teacherAssignments.some(asg => {
        if (!asg || !asg.className) return false;
        const norm = asg.className.toLowerCase().trim();
        return norm === clsId || norm === clsName || norm === clsComposite;
      });

      // Check C: Titulaire of this class
      const isTitulaire = 
        (activeTeacher?.id && cls.classTeacherId === activeTeacher.id) ||
        (activeTeacher?.id && (cls as any).classTeacherUserId === activeTeacher.id) ||
        (currentUserAccount?.dossierId && cls.classTeacherId === currentUserAccount.dossierId) ||
        (currentUserAccount?.id && (cls as any).classTeacherUserId === currentUserAccount.id) ||
        (userName && cls.classTeacherName && cls.classTeacherName.toLowerCase().trim() === userName.toLowerCase().trim()) ||
        (activeTeacher?.lastName && cls.classTeacherName && cls.classTeacherName.toLowerCase().includes(activeTeacher.lastName.toLowerCase().trim()));

      if (isDirectlyAssigned || isTimetableAssigned || isTitulaire) {
        matchedClasses.add(canonicalName);
      }
    });

    return Array.from(matchedClasses);
  }, [activeTeacher, teacherAssignments, classes, userName, currentUserAccount]);

  // 3. DYNAMICALLY RESOLVE ASSIGNED SUBJECTS (Strictly from real DB assignments)
  const teachersSubjects = useMemo(() => {
    const subjectSet = new Set<string>();

    // A. From Teacher object
    if (activeTeacher?.assignedSubjects && Array.isArray(activeTeacher.assignedSubjects)) {
      activeTeacher.assignedSubjects.forEach(s => {
        if (s && s.trim()) subjectSet.add(s.trim());
      });
    }
    if (activeTeacher?.specialty && activeTeacher.specialty.trim()) {
      subjectSet.add(activeTeacher.specialty.trim());
    }

    // B. From Timetable assignments
    teacherAssignments.forEach(asg => {
      if (asg.subjectName && asg.subjectName.trim()) subjectSet.add(asg.subjectName.trim());
    });

    // C. From Global Subjects assigned to this teacher
    subjects.forEach(sub => {
      if (teachersClasses.includes(sub.className || "") && activeTeacher?.specialty && sub.name.toLowerCase().includes(activeTeacher.specialty.toLowerCase())) {
        subjectSet.add(sub.name);
      }
    });

    return Array.from(subjectSet);
  }, [activeTeacher, teacherAssignments, subjects, teachersClasses]);

  // Selection states
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("P1");

  useEffect(() => {
    if (teachersClasses.length > 0 && (!selectedClass || !teachersClasses.includes(selectedClass))) {
      setSelectedClass(teachersClasses[0]);
    } else if (teachersClasses.length === 0) {
      setSelectedClass("");
    }
  }, [teachersClasses, selectedClass]);

  useEffect(() => {
    if (teachersSubjects.length > 0 && (!selectedSubject || !teachersSubjects.includes(selectedSubject))) {
      setSelectedSubject(teachersSubjects[0]);
    } else if (teachersSubjects.length === 0) {
      setSelectedSubject("");
    }
  }, [teachersSubjects, selectedSubject]);

  // Filter students strictly belonging to assigned classes
  const assignedStudents = useMemo(() => {
    if (students.length === 0 || teachersClasses.length === 0) return [];
    return students.filter(s => {
      if (!s.className) return false;
      return teachersClasses.some(tc => 
        tc.toLowerCase() === s.className.toLowerCase() ||
        tc.toLowerCase().includes(s.className.toLowerCase()) ||
        s.className.toLowerCase().includes(tc.toLowerCase())
      );
    });
  }, [students, teachersClasses]);

  // Students in currently selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return assignedStudents.filter(s => 
      s.className.toLowerCase() === selectedClass.toLowerCase() ||
      selectedClass.toLowerCase().includes(s.className.toLowerCase()) ||
      s.className.toLowerCase().includes(selectedClass.toLowerCase())
    );
  }, [assignedStudents, selectedClass]);

  // Teacher Schedule
  const teacherWeeklySchedule = useMemo(() => {
    return timetableEntries.filter(
      t => (t.teacherId && activeTeacher?.id && t.teacherId === activeTeacher.id) ||
           t.teacherName.toLowerCase() === userName.toLowerCase() ||
           (activeTeacher && t.teacherName.toLowerCase().includes(activeTeacher.lastName.toLowerCase())) ||
           (t.isSubstituted && t.substituteTeacherName?.toLowerCase() === userName.toLowerCase())
    );
  }, [timetableEntries, userName, activeTeacher]);

  // Daily Live Reminders
  const activeReminders = useMemo(() => {
    return generateDailyRemindersForTeacher(userName);
  }, [generateDailyRemindersForTeacher, userName]);

  // ---------------------------------------------------------------------------
  // ATTENDANCE MANAGEMENT (REGISTRE D'APPEL)
  // ---------------------------------------------------------------------------
  const [attendanceDate, setAttendanceDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [attendanceTime, setAttendanceTime] = useState<string>("08:00");
  const [attendanceSheet, setAttendanceSheet] = useState<{ [studentId: string]: { status: "Présent" | "Absent" | "Retard" | "Absent Justifié"; reason?: string } }>({});
  const [attendanceSuccessMessage, setAttendanceSuccessMessage] = useState<string | null>(null);

  // Initialize or load attendance for the selected date & class
  useEffect(() => {
    if (!selectedClass) return;
    const initialSheet: { [studentId: string]: { status: "Présent" | "Absent" | "Retard" | "Absent Justifié"; reason?: string } } = {};
    
    // Check if there are already recorded attendances for this date and class
    const existing = initialAttendances.filter(
      a => a.className === selectedClass && a.date === attendanceDate
    );

    classStudents.forEach(std => {
      const match = existing.find(e => e.studentId === std.id);
      if (match) {
        initialSheet[std.id] = { 
          status: (match.status as any) || "Présent", 
          reason: match.reason 
        };
      } else {
        initialSheet[std.id] = { status: "Présent" };
      }
    });

    setAttendanceSheet(initialSheet);
  }, [selectedClass, attendanceDate, classStudents, initialAttendances]);

  const handleSaveAttendance = () => {
    if (!selectedClass || classStudents.length === 0) {
      alert("Veuillez sélectionner une classe contenant des élèves.");
      return;
    }

    const recordedEntries: Attendance[] = classStudents.map(std => {
      const entry = attendanceSheet[std.id] || { status: "Présent" };
      return {
        id: `att-${std.id}-${attendanceDate}-${Date.now()}`,
        studentId: std.id,
        studentName: `${std.lastName} ${std.firstName} ${std.postName || ""}`.trim(),
        className: selectedClass,
        classId: (std as any).classId || selectedClass,
        date: attendanceDate,
        time: attendanceTime,
        status: entry.status,
        isJustified: entry.status === "Absent Justifié",
        reason: entry.reason || (entry.status === "Présent" ? "À l'heure" : ""),
        recordedBy: userName,
        schoolId: schoolId,
        academicYear: academicYear,
        teacherId: activeTeacher?.id || currentUserId || "",
        teacherName: userName
      };
    });

    if (onSaveAttendance) {
      onSaveAttendance(recordedEntries);
    }

    // Persist to local storage & cloud broadcast
    const cacheKey = `ssrdc_${schoolId}_attendances`;
    const currentStored = JSON.parse(safeLocalStorage.getItem(cacheKey) || "[]");
    const updated = [
      ...recordedEntries,
      ...currentStored.filter((a: any) => !(a.className === selectedClass && a.date === attendanceDate))
    ];
    safeLocalStorage.setItem(cacheKey, JSON.stringify(updated));
    broadcastRealtimeUpdate(schoolId, "attendances", "upsert", recordedEntries);

    const absentCount = recordedEntries.filter(a => a.status === "Absent" || a.status === "Absent Justifié").length;
    const retardCount = recordedEntries.filter(a => a.status === "Retard").length;

    setAttendanceSuccessMessage(
      `✓ Appel enregistré avec succès pour ${selectedClass} le ${attendanceDate} (${recordedEntries.length} élèves : ${recordedEntries.length - absentCount - retardCount} présents, ${absentCount} absents, ${retardCount} retards).`
    );
    setTimeout(() => setAttendanceSuccessMessage(null), 5000);

    if (onAddNotification) {
      onAddNotification({
        id: "not-abs-" + Date.now(),
        text: `Appel effectué par ${userName} en ${selectedClass} (${absentCount} absent(s)).`,
        targetRoles: ["Parent", "Directeur du Primaire", "Préfet des Études"]
      });
    }
  };

  // ---------------------------------------------------------------------------
  // GRADES & NOTES MANAGEMENT (CARNET DE COTES & SOUMISSION DIRECTION)
  // ---------------------------------------------------------------------------
  const [editingScores, setEditingScores] = useState<{ [studentId: string]: { score: string; maxScore: number; comments?: string } }>({});
  const [defaultMaxScore, setDefaultMaxScore] = useState<number>(20);
  const [gradeStatusMap, setGradeStatusMap] = useState<{ [period: string]: "draft" | "submitted" | "validated" }>({});
  const [gradeSuccessMessage, setGradeSuccessMessage] = useState<string | null>(null);

  // Load existing grades for selected class, subject, period
  useEffect(() => {
    if (!selectedClass || !selectedSubject) return;

    const currentPeriodGrades = initialGrades.filter(
      g => (g.className === selectedClass || (g as any).classId === selectedClass) &&
           g.subjectName?.toLowerCase() === selectedSubject.toLowerCase() &&
           g.period === selectedPeriod
    );

    const newScores: { [studentId: string]: { score: string; maxScore: number; comments?: string } } = {};
    let status: "draft" | "submitted" | "validated" = "draft";

    classStudents.forEach(std => {
      const match = currentPeriodGrades.find(g => g.studentId === std.id);
      if (match) {
        newScores[std.id] = {
          score: String(match.scoreObtained),
          maxScore: match.maxScore || defaultMaxScore,
          comments: match.comments || ""
        };
        if (match.status) status = match.status as any;
      } else {
        newScores[std.id] = {
          score: "",
          maxScore: defaultMaxScore,
          comments: ""
        };
      }
    });

    setEditingScores(newScores);
    setGradeStatusMap(prev => ({ ...prev, [selectedPeriod]: status }));
  }, [selectedClass, selectedSubject, selectedPeriod, classStudents, initialGrades, defaultMaxScore]);

  const handleSaveGrades = (targetStatus: "draft" | "submitted" = "draft") => {
    if (!selectedClass || !selectedSubject) {
      alert("Veuillez sélectionner une classe et une matière.");
      return;
    }

    const newGradeRecords: Grade[] = classStudents
      .filter(std => editingScores[std.id] && editingScores[std.id].score !== "")
      .map(std => {
        const val = editingScores[std.id];
        const numScore = parseFloat(val.score);
        return {
          id: `grd-${std.id}-${selectedSubject}-${selectedPeriod}-${Date.now()}`,
          studentId: std.id,
          studentName: `${std.lastName} ${std.firstName} ${std.postName || ""}`.trim(),
          subjectId: selectedSubject,
          subjectName: selectedSubject,
          period: selectedPeriod as any,
          scoreObtained: isNaN(numScore) ? 0 : numScore,
          maxScore: val.maxScore || defaultMaxScore,
          recordedBy: userName,
          recordedDate: new Date().toLocaleDateString("fr-FR"),
          schoolId: schoolId,
          classId: (std as any).classId || selectedClass,
          className: selectedClass,
          academicYear: academicYear,
          teacherId: activeTeacher?.id || currentUserId || "",
          teacherName: userName,
          status: targetStatus,
          comments: val.comments || ""
        };
      });

    if (newGradeRecords.length === 0) {
      alert("Veuillez saisir au moins une note avant d'enregistrer.");
      return;
    }

    if (onSaveGrades) {
      onSaveGrades(newGradeRecords);
    }

    // Persist to safeLocalStorage & broadcast
    const cacheKey = `ssrdc_${schoolId}_grades`;
    const currentStored = JSON.parse(safeLocalStorage.getItem(cacheKey) || "[]");
    const updated = [
      ...newGradeRecords,
      ...currentStored.filter((g: any) => 
        !(g.className === selectedClass && g.subjectName === selectedSubject && g.period === selectedPeriod)
      )
    ];
    safeLocalStorage.setItem(cacheKey, JSON.stringify(updated));
    broadcastRealtimeUpdate(schoolId, "grades", "upsert", newGradeRecords);

    setGradeStatusMap(prev => ({ ...prev, [selectedPeriod]: targetStatus }));

    if (targetStatus === "submitted") {
      setGradeSuccessMessage(`✓ Notes de ${selectedSubject} (${selectedPeriod}) soumises avec succès à la Direction pour validation.`);
      if (onAddNotification) {
        onAddNotification({
          id: "not-grd-" + Date.now(),
          text: `Le Prof. ${userName} a soumis les notes de ${selectedSubject} pour ${selectedClass} (${selectedPeriod}).`,
          targetRoles: ["Préfet des Études", "Directeur du Primaire", "Directeur des Études"]
        });
      }
    } else {
      setGradeSuccessMessage(`✓ Notes enregistrées en brouillon pour ${selectedSubject} (${selectedPeriod}).`);
    }

    setTimeout(() => setGradeSuccessMessage(null), 5000);
  };

  // ---------------------------------------------------------------------------
  // BULLETINS / REPORT CARDS VIEW FOR TEACHER
  // ---------------------------------------------------------------------------
  const [selectedStudentForBulletin, setSelectedStudentForBulletin] = useState<string>("");
  const selectedStudentObj = useMemo(() => {
    return classStudents.find(s => s.id === selectedStudentForBulletin) || classStudents[0] || null;
  }, [classStudents, selectedStudentForBulletin]);

  const studentGrades = useMemo(() => {
    if (!selectedStudentObj) return [];
    return initialGrades.filter(g => g.studentId === selectedStudentObj.id);
  }, [initialGrades, selectedStudentObj]);

  const sumScores = studentGrades.reduce((sum, g) => sum + (g.scoreObtained || 0), 0);
  const sumMax = studentGrades.reduce((sum, g) => sum + (g.maxScore || 20), 0);
  const finalPercentage = sumMax > 0 ? ((sumScores / sumMax) * 100).toFixed(1) : "0.0";

  // Official Congolese Bulletin Calculation (EPST RDC Source of Truth)
  const officialBulletin = useMemo(() => {
    if (!selectedStudentObj) return null;
    return calculateOfficialStudentBulletin({
      student: selectedStudentObj,
      allClassStudents: classStudents,
      subjects,
      grades: initialGrades,
      academicYear,
      schoolName: activeSchool?.name || "Complexe Scolaire SmartSchool RDC"
    });
  }, [selectedStudentObj, classStudents, subjects, initialGrades, academicYear, activeSchool]);

  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Check direction permissions for teacher
  const canTeacherDownload = bulletinSettings?.allowTeacherDownload ?? true;
  const canTeacherPrint = bulletinSettings?.allowTeacherPrint ?? true;

  // ---------------------------------------------------------------------------
  // HOMEWORKS (DEVOIRS) STATE
  // ---------------------------------------------------------------------------
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [hwTitle, setHwTitle] = useState("");
  const [hwDesc, setHwDesc] = useState("");
  const [hwCourse, setHwCourse] = useState(teachersSubjects[0] || "");
  const [hwClass, setHwClass] = useState(teachersClasses[0] || "");
  const [hwDeadline, setHwDeadline] = useState("");
  const [hwPoints, setHwPoints] = useState(20);
  const [hwCreatedSuccess, setHwCreatedSuccess] = useState(false);

  useEffect(() => {
    if (teachersSubjects.length > 0 && !hwCourse) setHwCourse(teachersSubjects[0]);
    if (teachersClasses.length > 0 && !hwClass) setHwClass(teachersClasses[0]);
  }, [teachersSubjects, teachersClasses, hwCourse, hwClass]);

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim() || !hwClass || !hwCourse) return;
    const newHw = {
      id: "hw-" + Date.now(),
      title: hwTitle,
      description: hwDesc,
      course: hwCourse,
      className: hwClass,
      deadline: hwDeadline,
      points: hwPoints,
      submissionsCount: 0,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      teacherName: userName
    };
    setHomeworks([newHw, ...homeworks]);
    setHwCreatedSuccess(true);
    setTimeout(() => {
      setHwCreatedSuccess(false);
      setHwTitle("");
      setHwDesc("");
      setHwDeadline("");
    }, 2000);

    if (onAddNotification) {
      onAddNotification({
        id: "not-hw-" + Date.now(),
        text: `Nouveau devoir de ${hwCourse} publié par ${userName} pour ${hwClass} : "${hwTitle}".`,
        targetRoles: ["Élève", "Parent"]
      });
    }
  };

  // ---------------------------------------------------------------------------
  // QUESTION BANK STATE
  // ---------------------------------------------------------------------------
  const [questionBank, setQuestionBank] = useState<any[]>([]);
  const [newQType, setNewQType] = useState("QCM");
  const [newQText, setNewQText] = useState("");
  const [newQCorrect, setNewQCorrect] = useState("");
  const [newQOptions, setNewQOptions] = useState<string[]>(["", "", "", ""]);
  const [newQSubject, setNewQSubject] = useState(teachersSubjects[0] || "");

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;
    const newQ = {
      id: "q-" + Date.now(),
      subject: newQSubject || selectedSubject || "Général",
      type: newQType,
      text: newQText,
      options: newQType === "QCM" ? newQOptions.filter(o => o.trim() !== "") : newQType === "Vrai/Faux" ? ["Vrai", "Faux"] : [],
      correct: newQCorrect
    };
    setQuestionBank([...questionBank, newQ]);
    setNewQText("");
    setNewQCorrect("");
    setNewQOptions(["", "", "", ""]);
  };

  // ---------------------------------------------------------------------------
  // VIRTUAL CLASSROOM ANNOUNCEMENTS
  // ---------------------------------------------------------------------------
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnounceText, setNewAnnounceText] = useState("");

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounceText.trim() || !selectedClass) return;
    const ann = {
      id: "ann-" + Date.now(),
      author: userName,
      className: selectedClass,
      text: newAnnounceText,
      date: new Date().toLocaleDateString("fr-FR") + " à " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setAnnouncements([ann, ...announcements]);
    setNewAnnounceText("");

    if (onAddNotification) {
      onAddNotification({
        id: "not-ann-" + Date.now(),
        text: `Message du Prof. ${userName} pour la classe de ${selectedClass} : "${ann.text.slice(0, 50)}..."`,
        targetRoles: ["Élève", "Parent"]
      });
    }
  };

  // Navigation Items
  const menuItems = [
    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { id: "coordonnees_paie", label: "Coordonnées de Paie & Salaire", icon: Wallet },
    { id: "classes", label: "Mes Classes & Élèves", icon: School },
    { id: "presences", label: "Registre d'Appel (Présences)", icon: CheckSquare },
    { id: "cotes", label: "Évaluations & Cotation Scolaire", icon: Award },
    { id: "bulletins", label: "Bulletins Scolaires", icon: FileText },
    { id: "journal_classe", label: "Journal de Classe & Séances", icon: BookOpen },
    { id: "horaire_prof", label: "Mon Emploi du Temps", icon: Calendar },
    { id: "devoirs", label: "Créateur de Devoirs", icon: BookOpen },
    { id: "banque", label: "Banque d'Évaluations", icon: HelpCircle },
    { id: "classe_virtuelle", label: "Classe Virtuelle & Annonces", icon: Folder },
    { id: "patrimoine_rdc", label: "Patrimoine & Culture RDC", icon: Landmark }
  ];

  // If no classes are assigned, show dedicated banner
  const hasNoAssignedClasses = teachersClasses.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs text-left font-sans">
      
      {/* Sidebar navigation */}
      <div className="lg:col-span-1 space-y-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-xs text-center space-y-3">
          <div className="h-14 w-14 rounded-full mx-auto bg-gradient-to-tr from-brand-blue to-brand-green flex items-center justify-center font-black text-white text-lg shadow-md">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-none">{userName}</h4>
            <p className="text-[10px] text-slate-500 mt-1 font-mono font-bold uppercase">{userRole}</p>
            {activeTeacher?.matriculeEtat && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {activeTeacher.matriculeEtat}
              </span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Classes Attribuées</span>
            {teachersClasses.length > 0 ? (
              <div className="flex justify-center gap-1.5 flex-wrap">
                {teachersClasses.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
                Aucune classe attribuée
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-2.5 rounded-2xl shadow-xs space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main workspace panels */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* LIVE REMINDER BANNER */}
        {activeReminders.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200">
            <Bell className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-xs">Rappel de Cours Imminent</h4>
              <p className="text-[11px] leading-relaxed">{activeReminders[0].message}</p>
            </div>
            <button
              onClick={() => setActiveSubTab("journal_classe")}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] transition-colors cursor-pointer shrink-0"
            >
              Remplir Journal
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          
          {/* CULTURES & PATRIMOINE RDC TAB */}
          {activeSubTab === "patrimoine_rdc" && (
            <NationalCultureHeritageModule userRole={userRole} userName={userName} userPortal="enseignant" />
          )}

          {/* DASHBOARD */}
          {activeSubTab === "dashboard" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Tableau de bord de l'Enseignant</h3>
                <p className="text-slate-500 text-[10px]">Aperçu de vos classes attribuées, élèves, cotes en cours et planification.</p>
              </div>

              {hasNoAssignedClasses ? (
                <div className="p-8 border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl text-center space-y-3">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                  <h4 className="font-black text-base text-slate-900 dark:text-white">Aucune classe ne vous a encore été attribuée</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    La direction de l'établissement n'a pas encore configuré vos affectations de classes pour l'année scolaire <strong>{academicYear}</strong>. Vos élèves, cotes, présences et bulletins apparaîtront automatiquement dès que l'attribution sera validée par la direction.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Classes Attribuées</span>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-100">{teachersClasses.length} classe(s)</span>
                      <p className="text-[9px] text-slate-500 font-bold">{teachersClasses.join(", ")}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Matières Enseignées</span>
                      <span className="text-xl font-black text-slate-800 dark:text-slate-100">{teachersSubjects.length} matière(s)</span>
                      <p className="text-[9px] text-indigo-600 font-bold">{teachersSubjects.join(", ") || "Non spécifié"}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Élèves sous Supervision</span>
                      <span className="text-xl font-black text-emerald-600 font-mono">{assignedStudents.length} élèves</span>
                      <p className="text-[9px] text-slate-500">Effectif total attribué</p>
                    </div>
                  </div>

                  {/* Action Shortcuts */}
                  <div className="space-y-3.5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Raccourcis d'actions rapides</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button 
                        onClick={() => setActiveSubTab("presences")}
                        className="p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950/20 rounded-xl text-left font-bold space-y-1 cursor-pointer transition-all hover:border-indigo-500"
                      >
                        <CheckSquare className="h-4 w-4 text-indigo-600 mb-1" />
                        <span>Faire l'appel du jour</span>
                        <p className="text-[9px] text-slate-400 font-medium">Registre des présences en {selectedClass || "classe"}</p>
                      </button>

                      <button 
                        onClick={() => setActiveSubTab("cotes")}
                        className="p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950/20 rounded-xl text-left font-bold space-y-1 cursor-pointer transition-all hover:border-indigo-500"
                      >
                        <Award className="h-4 w-4 text-emerald-600 mb-1" />
                        <span>Saisir les cotes & notes</span>
                        <p className="text-[9px] text-slate-400 font-medium">Évaluations et examens par période</p>
                      </button>

                      <button 
                        onClick={() => setActiveSubTab("bulletins")}
                        className="p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950/20 rounded-xl text-left font-bold space-y-1 cursor-pointer transition-all hover:border-indigo-500"
                      >
                        <FileText className="h-4 w-4 text-blue-600 mb-1" />
                        <span>Consulter les bulletins</span>
                        <p className="text-[9px] text-slate-400 font-medium">Préparation et impression des résultats</p>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* COORDONNEES DE PAIE & SALAIRE (TEACHER SELF-SERVICE) */}
          {activeSubTab === "coordonnees_paie" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-emerald-600" />
                      Coordonnées de Paie & Rémunération
                    </h3>
                    <p className="text-slate-500 text-[10px]">
                      Gérez en toute autonomie le compte Mobile Money ou bancaire sur lequel vous souhaitez recevoir votre salaire.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    Profil Sécurisé
                  </span>
                </div>
              </div>

              {/* SECURITY & GOVERNANCE MANDATE BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3.5">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs mt-0.5 shrink-0">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-xs text-blue-950 dark:text-blue-200 uppercase tracking-wide">
                    Règle Fondamentale de Sécurité Financière SmartSchool RDC
                  </h4>
                  <p className="text-[11px] text-blue-900/90 dark:text-blue-300 leading-relaxed">
                    Chaque enseignant enregistre lui-même et met à jour ses coordonnées de réception (Mobile Money ou Banque). 
                    Pour prévenir toute fraude ou manipulation non autorisée, <strong>l'enseignant ne peut jamais déclencher ou valider son propre paiement</strong>. 
                    <strong>Le Promoteur de l'établissement</strong> détient le contrôle final exclusif et valide chaque ordre de virement salarial.
                  </p>
                </div>
              </div>

              {payoutSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold leading-relaxed">{payoutSaveSuccess}</span>
                </div>
              )}

              {/* SALARY PROFILE SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Mode de Réception Actif</span>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    <span className="font-black text-sm text-slate-800 dark:text-white">
                      {payoutForm.paymentMethod || "Non configuré"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 font-bold">
                    {payoutForm.receivingNumberOrIban || "Aucun numéro enregistré"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Devise Salariale Préférée</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {payoutForm.preferredCurrency || "USD"}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {payoutForm.preferredCurrency === "CDF" ? "Francs Congolais (CDF)" : "Dollars Américains (USD)"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Séparation stricte sans conversion arbitraire</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Salaire Contractuel Fixé</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {(activeTeacher?.salaryBase || 0).toLocaleString("fr-FR")}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {activeTeacher?.salaryCurrency || payoutForm.preferredCurrency || "USD"}
                    </span>
                  </div>
                  <span className="inline-block text-[9px] font-bold text-slate-400 italic">
                    Fixé par la direction (non modifiable)
                  </span>
                </div>
              </div>

              {/* PAYOUT FORM */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    Formulaire de Déclaration des Coordonnées Bancaires / Mobile Money
                  </h4>
                  {payoutForm.lastUpdatedByTeacherAt && (
                    <span className="text-[10px] text-slate-400">
                      Dernière mise à jour : {payoutForm.lastUpdatedByTeacherAt}
                    </span>
                  )}
                </div>

                <form onSubmit={handleSavePayoutDetails} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Moyen de paiement */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        Moyen de Paiement Souhaité *
                      </label>
                      <select
                        value={payoutForm.paymentMethod}
                        onChange={(e) => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value as any })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      >
                        <option value="M-Pesa">Vodacom M-Pesa (RDC)</option>
                        <option value="Orange Money">Orange Money (RDC)</option>
                        <option value="Airtel Money">Airtel Money (RDC)</option>
                        <option value="Afrimoney">Africell Afrimoney (RDC)</option>
                        <option value="Virement Bancaire">Virement Bancaire (Rawbank, EquityBCDC, TMB, etc.)</option>
                        <option value="Espèces">Espèces (Guichet de la Caisse)</option>
                      </select>
                    </div>

                    {/* Devise préférée */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        Devise de Réception Préférée *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPayoutForm({ ...payoutForm, preferredCurrency: "USD" })}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                            payoutForm.preferredCurrency === "USD"
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <span className="font-mono font-black">$ USD</span>
                          <span>Dollars Américains</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayoutForm({ ...payoutForm, preferredCurrency: "CDF" })}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                            payoutForm.preferredCurrency === "CDF"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <span className="font-mono font-black">FC CDF</span>
                          <span>Francs Congolais</span>
                        </button>
                      </div>
                    </div>

                    {/* Numéro Mobile Money ou Numéro de Compte */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        {payoutForm.paymentMethod === "Virement Bancaire"
                          ? "Numéro de Compte Bancaire (IBAN / RIB) *"
                          : "Numéro de Téléphone Mobile Money *"}
                      </label>
                      <input
                        type="text"
                        value={payoutForm.receivingNumberOrIban}
                        onChange={(e) => setPayoutForm({ ...payoutForm, receivingNumberOrIban: e.target.value })}
                        placeholder={payoutForm.paymentMethod === "Virement Bancaire" ? "Ex: 00018-01001-12345678901-44" : "Ex: 0812345678 / 0991234567"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        required={payoutForm.paymentMethod !== "Espèces"}
                      />
                    </div>

                    {/* Nom officiel du titulaire du compte */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        Nom Exact du Titulaire du Compte / SIM *
                      </label>
                      <input
                        type="text"
                        value={payoutForm.accountHolderName}
                        onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })}
                        placeholder="Ex: MULAMBA KABANGU JEAN"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                      <p className="text-[10px] text-slate-400">
                        Doit correspondre exactement à l'identité enregistrée chez l'opérateur ou à la banque.
                      </p>
                    </div>

                    {/* Nom de la banque (si virement bancaire) */}
                    {payoutForm.paymentMethod === "Virement Bancaire" && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                          Nom de l'Institution Bancaire *
                        </label>
                        <select
                          value={payoutForm.bankName}
                          onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="Rawbank RDC">Rawbank RDC</option>
                          <option value="Equity BCDC">Equity BCDC</option>
                          <option value="Trust Merchant Bank (TMB)">Trust Merchant Bank (TMB)</option>
                          <option value="FirstBank DRC">FirstBank DRC</option>
                          <option value="Stanbic Bank RDC">Stanbic Bank RDC</option>
                          <option value="Access Bank RDC">Access Bank RDC</option>
                          <option value="Ecobank RDC">Ecobank RDC</option>
                          <option value="Autre Institution">Autre Institution Bancaire Agréée BCC</option>
                        </select>
                      </div>
                    )}

                    {/* Notes complémentaires */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        Précisions / Consignes Particulières pour la Comptabilité
                      </label>
                      <input
                        type="text"
                        value={payoutForm.notes || ""}
                        onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                        placeholder="Ex: Compte personnel principal, numéro WhatsApp actif pour confirmation"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={isSavingPayout}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingPayout ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Enregistrement sécurisé en cours...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Enregistrer mes Coordonnées de Paie</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* SALARY PAYMENT HISTORY / BULLETINS DE PAIE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                    Historique de Mes Bulletins de Paie & Rémunérations Reçues
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    {salaryPayments.length} paiement(s) exécuté(s)
                  </span>
                </div>

                {salaryPayments.length === 0 ? (
                  <div className="p-8 border rounded-3xl bg-slate-50 dark:bg-slate-950 text-center space-y-2 border-slate-200 dark:border-slate-800">
                    <Receipt className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Aucun bulletin de paie archivé pour le moment.
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Dès que le Promoteur ou la direction générale exécutera le versement de votre salaire pour une période donnée, votre bulletin officiel apparaîtra ici avec son numéro de référence certifié.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                          <th className="py-3 px-4">Période</th>
                          <th className="py-3 px-4">Montant Net</th>
                          <th className="py-3 px-4">Mode / Référence</th>
                          <th className="py-3 px-4">Validation Promoteur</th>
                          <th className="py-3 px-4">Date de Paiement</th>
                          <th className="py-3 px-4 text-right">Fiche Officielle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {salaryPayments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              {pay.period}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-black text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                                {pay.netAmountPaid.toLocaleString("fr-FR")} {pay.currency}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                              <div>{pay.paymentMethod}</div>
                              <div className="text-[9px] text-slate-400">{pay.transactionReference}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" />
                                {pay.authorizedByPromoterName || "Promoteur Certifié"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-medium text-[11px]">
                              {pay.paymentDate}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setSelectedPaySlipForModal(pay)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Fiche de Paie</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MES CLASSES & ELEVES */}
          {activeSubTab === "classes" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Mes Classes & Élèves Attribués</h3>
                <p className="text-slate-500 text-[10px]">Liste dynamique des classes et des élèves rattachés à votre charge pédagogique.</p>
              </div>

              {hasNoAssignedClasses ? (
                <div className="p-8 text-center text-slate-500 italic">
                  Aucune classe ne vous a encore été attribuée par la direction.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {teachersClasses.map((clsName) => {
                      const isSelected = selectedClass === clsName;
                      const count = assignedStudents.filter(s => s.className.toLowerCase().includes(clsName.toLowerCase()) || clsName.toLowerCase().includes(s.className.toLowerCase())).length;
                      return (
                        <button
                          key={clsName}
                          onClick={() => setSelectedClass(clsName)}
                          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                            isSelected 
                              ? "bg-indigo-600 text-white shadow-xs" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {clsName} ({count} élèves)
                        </button>
                      );
                    })}
                  </div>

                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Élèves inscrits en {selectedClass} ({classStudents.length})
                      </span>
                      <span className="text-[10px] text-slate-500">Année scolaire : {academicYear}</span>
                    </div>

                    {classStudents.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 italic">
                        Aucun élève trouvé dans cette classe pour le moment.
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b bg-slate-50/50 dark:bg-slate-950/50 text-[10px] text-slate-500 font-bold uppercase">
                            <th className="p-3">Matricule</th>
                            <th className="p-3">Nom & Prénom</th>
                            <th className="p-3">Genre</th>
                            <th className="p-3">Option</th>
                            <th className="p-3">Contact Parent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {classStudents.map((std) => (
                            <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="p-3 font-mono font-bold text-indigo-600">{std.registrationNumber || std.id}</td>
                              <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                                {std.lastName} {std.firstName} {std.postName || ""}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  std.gender === "F" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                  {std.gender || "M"}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-400">{std.optionName || "Tronc Commun"}</td>
                              <td className="p-3 text-slate-500 text-[10px]">{std.parentPhone || std.parentName || "Non renseigné"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REGISTRE DE PRESENCES */}
          {activeSubTab === "presences" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Registre d'Appel des Présences</h3>
                <p className="text-slate-500 text-[10px]">Effectuez l'appel pour vos classes attribuées. Les données sont instantanément enregistrées et accessibles par la direction et les parents.</p>
              </div>

              {attendanceSuccessMessage && (
                <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl font-bold flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{attendanceSuccessMessage}</span>
                </div>
              )}

              {hasNoAssignedClasses ? (
                <div className="p-8 text-center text-slate-500 italic">
                  Aucune classe ne vous a encore été attribuée pour faire l'appel.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Classe</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                      >
                        {teachersClasses.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date de la séance</label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Heure de la séance</label>
                      <input
                        type="time"
                        value={attendanceTime}
                        onChange={(e) => setAttendanceTime(e.target.value)}
                        className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  {classStudents.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 italic border rounded-xl">
                      Aucun élève trouvé dans cette classe pour effectuer l'appel.
                    </div>
                  ) : (
                    <div className="border rounded-2xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b text-slate-500 font-bold text-[10px] uppercase">
                            <th className="p-3">Élève</th>
                            <th className="p-3">Statut de Présence</th>
                            <th className="p-3">Motif / Justification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {classStudents.map((std) => {
                            const entry = attendanceSheet[std.id] || { status: "Présent" };
                            return (
                              <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                                  {std.lastName} {std.firstName} {std.postName || ""}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center space-x-1.5">
                                    {(["Présent", "Absent", "Retard", "Absent Justifié"] as const).map((st) => {
                                      const isSelected = entry.status === st;
                                      const colorClass = 
                                        st === "Présent" ? (isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600") :
                                        st === "Absent" ? (isSelected ? "bg-rose-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600") :
                                        st === "Retard" ? (isSelected ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600") :
                                        (isSelected ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600");
                                      
                                      return (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => setAttendanceSheet({
                                            ...attendanceSheet,
                                            [std.id]: { ...entry, status: st }
                                          })}
                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${colorClass}`}
                                        >
                                          {st}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <input
                                    type="text"
                                    placeholder="Motif facultatif..."
                                    value={entry.reason || ""}
                                    onChange={(e) => setAttendanceSheet({
                                      ...attendanceSheet,
                                      [std.id]: { ...entry, reason: e.target.value }
                                    })}
                                    className="w-full p-1 text-[11px] rounded-lg border bg-white dark:bg-slate-900"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-slate-500">
                      Enregistrement certifié avec horodatage et traçabilité pour les parents.
                    </span>
                    <button
                      onClick={handleSaveAttendance}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-sm flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Enregistrer & Valider l'Appel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GESTION COMPLÈTE DES ÉVALUATIONS & COTATION SCOLAIRE */}
          {activeSubTab === "cotes" && (
            <EvaluationGradingSystem
              userRole={userRole}
              userName={userName}
              userEmail={userEmail}
              currentUserId={currentUserId}
              currentUserAccount={currentUserAccount}
              students={students}
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              schoolId={schoolId}
              academicYear={academicYear}
              schoolName={activeSchool?.name || "Établissement Scolaire"}
              schoolLogoUrl={activeSchool?.logoUrl || ""}
              isDirectionUser={false}
              bulletinSettings={bulletinSettings}
              onAddNotification={onAddNotification}
            />
          )}

          {/* BULLETINS SCOLAIRES */}
          {activeSubTab === "bulletins" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Consultation & Impression des Bulletins</h3>
                <p className="text-slate-500 text-[10px]">Visualisez et imprimez les bulletins pour les élèves de vos classes attribuées.</p>
              </div>

              {hasNoAssignedClasses ? (
                <div className="p-8 text-center text-slate-500 italic">
                  Aucune classe ne vous a encore été attribuée pour consulter les bulletins.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Classe</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                      >
                        {teachersClasses.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Sélectionner l'Élève</label>
                      <select
                        value={selectedStudentForBulletin || (selectedStudentObj?.id || "")}
                        onChange={(e) => setSelectedStudentForBulletin(e.target.value)}
                        className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                      >
                        {classStudents.map((std) => (
                          <option key={std.id} value={std.id}>
                            {std.lastName} {std.firstName} ({std.registrationNumber || std.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!canTeacherDownload && !canTeacherPrint && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
                      ℹ️ La direction de l'établissement n'a pas encore activé le téléchargement et l'impression des bulletins pour les enseignants. Vous pouvez consulter l'aperçu à l'écran.
                    </div>
                  )}

                  {selectedStudentObj ? (
                    <div className="p-6 border rounded-2xl bg-white dark:bg-slate-900 shadow-sm space-y-4">
                      {/* Report card header */}
                      <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-3">
                          {activeSchool?.logoUrl ? (
                            <img src={activeSchool.logoUrl} alt="Logo École" className="h-14 w-14 object-contain rounded-xl border" />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-300">
                              {(activeSchool?.name || "ECOLE").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-black text-base text-slate-900 dark:text-white uppercase">
                              {activeSchool?.name || "Établissement Scolaire"}
                            </h4>
                            <p className="text-[10px] text-slate-500">{activeSchool?.motto || "Science - Conscience - Excellence"}</p>
                            <span className="text-[10px] font-mono text-indigo-600 font-bold">Année Scolaire : {academicYear}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full font-bold text-xs block">
                            Bulletin Officiel
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Matricule : {selectedStudentObj.registrationNumber || selectedStudentObj.id}
                          </span>
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-[11px]">
                        <div><strong>Élève :</strong> {selectedStudentObj.lastName} {selectedStudentObj.firstName}</div>
                        <div><strong>Classe :</strong> {selectedStudentObj.className}</div>
                        <div><strong>Option :</strong> {selectedStudentObj.optionName || "Générale"}</div>
                        <div><strong>Moyenne :</strong> <span className="font-bold text-emerald-600">{finalPercentage}%</span></div>
                      </div>

                      {/* Grades Table */}
                      <div className="border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b text-[10px] text-slate-500 font-bold uppercase">
                              <th className="p-2.5">Matière</th>
                              <th className="p-2.5 text-center">Période</th>
                              <th className="p-2.5 text-center">Note / Max</th>
                              <th className="p-2.5 text-center">%</th>
                              <th className="p-2.5">Enseignant</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {studentGrades.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                                  Aucune note enregistrée pour cet élève.
                                </td>
                              </tr>
                            ) : (
                              studentGrades.map((g) => (
                                <tr key={g.id}>
                                  <td className="p-2.5 font-bold">{g.subjectName}</td>
                                  <td className="p-2.5 text-center font-mono">{g.period}</td>
                                  <td className="p-2.5 text-center font-bold">{g.scoreObtained}/{g.maxScore}</td>
                                  <td className="p-2.5 text-center font-mono font-bold text-emerald-600">
                                    {((g.scoreObtained / g.maxScore) * 100).toFixed(1)}%
                                  </td>
                                  <td className="p-2.5 text-slate-500 text-[10px]">{g.recordedBy}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Print / Export Bar */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        {canTeacherPrint && (
                          <button
                            onClick={() => setPrintModalOpen(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition-all"
                          >
                            <Printer className="h-4 w-4" />
                            <span>Imprimer Bulletin Officiel EPST</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 italic">
                      Aucun élève sélectionné.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DEVOIRS */}
          {activeSubTab === "devoirs" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Créateur & Distributeur de Devoirs</h3>
                <p className="text-slate-500 text-[10px]">Publiez des exercices à faire à domicile pour vos classes attribuées.</p>
              </div>

              {hwCreatedSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl font-bold">
                  ✓ Devoir publié avec succès pour les élèves et parents !
                </div>
              )}

              {hasNoAssignedClasses ? (
                <div className="p-8 text-center text-slate-500 italic">
                  Aucune classe ne vous a encore été attribuée pour publier des devoirs.
                </div>
              ) : (
                <>
                  <form onSubmit={handleCreateHomework} className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Titre du Devoir</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Exercices de géométrie"
                          value={hwTitle}
                          onChange={(e) => setHwTitle(e.target.value)}
                          className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Matière</label>
                        <select
                          value={hwCourse}
                          onChange={(e) => setHwCourse(e.target.value)}
                          className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                        >
                          {teachersSubjects.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Classe Destinataire</label>
                        <select
                          value={hwClass}
                          onChange={(e) => setHwClass(e.target.value)}
                          className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                        >
                          {teachersClasses.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date Limite de Dépôt</label>
                        <input
                          type="date"
                          required
                          value={hwDeadline}
                          onChange={(e) => setHwDeadline(e.target.value)}
                          className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Barème de Points</label>
                        <input
                          type="number"
                          value={hwPoints}
                          onChange={(e) => setHwPoints(Number(e.target.value))}
                          className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Consignes Pédagogiques</label>
                      <textarea
                        rows={2}
                        value={hwDesc}
                        onChange={(e) => setHwDesc(e.target.value)}
                        placeholder="Instructions détaillées..."
                        className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="text-right">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                      >
                        Publier le Devoir
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs">Historique des devoirs actifs</h4>
                    {homeworks.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 italic border rounded-xl">
                        Aucun devoir publié pour le moment.
                      </div>
                    ) : (
                      homeworks.map((hw) => (
                        <div key={hw.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{hw.title}</span>
                            <span className="text-[10px] text-slate-500">{hw.course} • {hw.className} • À rendre le {hw.deadline}</span>
                          </div>
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            {hw.points} pts
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* BANQUE D'EVALUATIONS */}
          {activeSubTab === "banque" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Banque de Questions d'Évaluation</h3>
                <p className="text-slate-500 text-[10px]">Créez et organisez votre réservoir de questions pour vos interrogations et examens.</p>
              </div>

              <form onSubmit={handleAddQuestion} className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Matière</label>
                    <select
                      value={newQSubject}
                      onChange={(e) => setNewQSubject(e.target.value)}
                      className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                    >
                      {teachersSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Type de Question</label>
                    <select
                      value={newQType}
                      onChange={(e) => setNewQType(e.target.value)}
                      className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                    >
                      <option value="QCM">QCM (Choix Multiples)</option>
                      <option value="Vrai/Faux">Vrai ou Faux</option>
                      <option value="Réponse courte">Réponse Courte / Définition</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Bonne Réponse</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: B ou Vrai ou Solution"
                      value={newQCorrect}
                      onChange={(e) => setNewQCorrect(e.target.value)}
                      className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Énoncé de la Question</label>
                  <input
                    type="text"
                    required
                    placeholder="Saisissez l'énoncé complet..."
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900"
                  />
                </div>

                {newQType === "QCM" && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {["Option A", "Option B", "Option C", "Option D"].map((optLabel, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`${optLabel}...`}
                        value={newQOptions[idx]}
                        onChange={(e) => {
                          const updated = [...newQOptions];
                          updated[idx] = e.target.value;
                          setNewQOptions(updated);
                        }}
                        className="p-2 rounded-xl border bg-white dark:bg-slate-900 text-xs"
                      />
                    ))}
                  </div>
                )}

                <div className="text-right">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Ajouter à la Banque
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs">Questions enregistrées ({questionBank.length})</h4>
                {questionBank.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic border rounded-xl">
                    Aucune question enregistrée. Utilisez le formulaire ci-dessus pour ajouter des questions réelles.
                  </div>
                ) : (
                  questionBank.map((q) => (
                    <div key={q.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{q.text}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
                          {q.type} • {q.subject}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Réponse : {q.correct}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CLASSE VIRTUELLE & ANNONCES */}
          {activeSubTab === "classe_virtuelle" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Classe Virtuelle & Tableau d'Affichage</h3>
                <p className="text-slate-500 text-[10px]">Publiez des annonces pédagogiques et des consignes pour vos classes.</p>
              </div>

              {hasNoAssignedClasses ? (
                <div className="p-8 text-center text-slate-500 italic">
                  Aucune classe ne vous a encore été attribuée.
                </div>
              ) : (
                <>
                  <form onSubmit={handleAddAnnouncement} className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1/3">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Classe Destinataire</label>
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                        >
                          {teachersClasses.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Message d'Annonce</label>
                        <input
                          type="text"
                          required
                          placeholder="Écrivez une annonce officielle pour la classe..."
                          value={newAnnounceText}
                          onChange={(e) => setNewAnnounceText(e.target.value)}
                          className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                      >
                        Publier l'Annonce
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs">Annonces actives ({announcements.length})</h4>
                    {announcements.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 italic border rounded-xl">
                        Aucune annonce publiée pour le moment.
                      </div>
                    ) : (
                      announcements.map((ann) => (
                        <div key={ann.id} className="p-4 bg-white dark:bg-slate-900 border rounded-2xl space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Classe : <strong className="text-indigo-600">{ann.className}</strong></span>
                            <span>{ann.date}</span>
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{ann.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* JOURNAL DE CLASSE & SEANCES */}
          {activeSubTab === "journal_classe" && (
            <ClassJournalModule
              userRole={userRole}
              userName={userName}
              students={assignedStudents}
              classes={teachersClasses.map((c, i) => ({ 
                id: `c-${i}`, 
                level: c, 
                roomLetter: "", 
                optionName: "Générale", 
                classTeacherName: userName, 
                studentCount: classStudents.length, 
                maxStudents: 45, 
                levelCategory: "Secondaire" as const, 
                classGrade: c,
                schoolId: schoolId 
              }))}
              onAddNotification={onAddNotification}
            />
          )}

          {/* MON EMPLOI DU TEMPS */}
          {activeSubTab === "horaire_prof" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Mon Emploi du Temps Hebdomadaire</h3>
                <p className="text-slate-500 text-[10px]">Grille officielle de vos heures de cours synchronisée avec l'administration.</p>
              </div>

              {teacherWeeklySchedule.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic border rounded-2xl">
                  Aucun cours planifié pour le moment dans l'emploi du temps pour votre compte.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {teacherWeeklySchedule.map((entry) => (
                    <div key={entry.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {entry.day}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {entry.period}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {entry.subjectName}
                      </h4>

                      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                        <div><strong>Classe :</strong> {entry.className}</div>
                        <div><strong>Local / Salle :</strong> {entry.room || "Salle standard"}</div>
                        {entry.isSubstituted && (
                          <div className="text-amber-600 dark:text-amber-400 font-bold">
                            Remplaçant : {entry.substituteTeacherName}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL FICHE / BULLETIN DE PAIE OFFICIEL DE L'ENSEIGNANT */}
      {selectedPaySlipForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase">Bulletin de Rémunération Enseignant</h3>
                  <p className="text-[10px] text-slate-300 font-mono">
                    Réf: {selectedPaySlipForModal.transactionReference} • {selectedPaySlipForModal.slipNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaySlipForModal(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Body */}
            <div className="p-6 space-y-5 overflow-y-auto print:p-0">
              <div className="border-b pb-4 text-center space-y-1">
                <h4 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wide">
                  {activeSchool?.name || "Complexe Scolaire SmartSchool RDC"}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • MINISTÈRE DE L'ÉDUCATION NATIONALE
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full font-black text-xs font-mono">
                  BULLETIN DE PAIE MENSUEL - {selectedPaySlipForModal.period}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Bénéficiaire</span>
                  <span className="font-black text-slate-800 dark:text-slate-200">{selectedPaySlipForModal.teacherName}</span>
                  <p className="text-[10px] font-mono text-slate-500">ID: {selectedPaySlipForModal.teacherId}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mode de Réception</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPaySlipForModal.paymentMethod}</span>
                  <p className="text-[10px] font-mono text-slate-500 font-bold">{selectedPaySlipForModal.receivingNumberOrIban}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date d'Exécution</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedPaySlipForModal.paymentDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Validation Promoteur</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {selectedPaySlipForModal.authorizedByPromoterName}
                  </span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="border rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Rubrique</th>
                      <th className="p-3 text-right">Montant ({selectedPaySlipForModal.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3">Salaire de Base Contractuel</td>
                      <td className="p-3 text-right font-mono font-bold">
                        {selectedPaySlipForModal.baseAmount.toLocaleString("fr-FR")} {selectedPaySlipForModal.currency}
                      </td>
                    </tr>
                    {selectedPaySlipForModal.bonusAmount > 0 && (
                      <tr className="text-emerald-600">
                        <td className="p-3">+ Primes Pédagogiques & Gratifications</td>
                        <td className="p-3 text-right font-mono font-bold">
                          +{selectedPaySlipForModal.bonusAmount.toLocaleString("fr-FR")} {selectedPaySlipForModal.currency}
                        </td>
                      </tr>
                    )}
                    {selectedPaySlipForModal.deductionsAmount > 0 && (
                      <tr className="text-rose-600">
                        <td className="p-3">- Retenues / Avances sur salaire</td>
                        <td className="p-3 text-right font-mono font-bold">
                          -{selectedPaySlipForModal.deductionsAmount.toLocaleString("fr-FR")} {selectedPaySlipForModal.currency}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-black text-sm">
                      <td className="p-3 text-emerald-950 dark:text-emerald-200">MONTANT NET VERSÉ</td>
                      <td className="p-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                        {selectedPaySlipForModal.netAmountPaid.toLocaleString("fr-FR")} {selectedPaySlipForModal.currency}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[10px] text-slate-500 font-mono text-center">
                Certifié conforme et archivé au registre comptable inaltérable SmartSchool RDC • ID: {selectedPaySlipForModal.id}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer la Fiche</span>
              </button>
              <button
                onClick={() => setSelectedPaySlipForModal(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

      {printModalOpen && selectedStudentObj && officialBulletin && (
        <PrintPreviewModal
          documentType="bulletin_epst"
          data={{
            studentName: `${selectedStudentObj.lastName} ${selectedStudentObj.firstName}`.trim(),
            className: selectedStudentObj.className,
            optionName: selectedStudentObj.optionName || "Générale",
            studentGender: selectedStudentObj.gender || "M",
            permanentId: (selectedStudentObj as any).permanentId || `EPST-2026-${selectedStudentObj.id?.slice(-6) || "9921"}`,
            academicYear,
            bulletin: officialBulletin
          }}
          onClose={() => setPrintModalOpen(false)}
          title={`Bulletin Officiel EPST - ${selectedStudentObj.lastName} ${selectedStudentObj.firstName}`}
        />
      )}
    </div>
  );
}
