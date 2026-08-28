import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  FileText, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Award, 
  MessageSquare,
  Upload,
  ArrowRight,
  ClipboardList,
  Check,
  FileCheck
} from "lucide-react";
import { 
  loadPersistentCollection, 
  savePersistentItem, 
  deletePersistentItem, 
  subscribeToPersistentCollection 
} from "../services/dataPersistenceService";

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  className: string;
  deadline: string;
  maxScore: number;
  description: string;
  hasAttachment: boolean;
  attachmentName?: string;
  submissionsCount: number;
  totalStudents: number;
  schoolId?: string;
  teacherName?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  status: "Submitted" | "Graded" | "Late";
  submittedText: string;
  score?: number;
  feedback?: string;
  schoolId?: string;
  parentVisaDate?: string;
  parentVisaName?: string;
}

interface HomeworkModuleProps {
  userRole: string;
  userName: string;
  schoolId?: string;
  students: any[];
  classes: any[];
  onAddNotification?: (notif: any) => void;
}

export function HomeworkModule({ 
  userRole, 
  userName, 
  schoolId = "default",
  students = [], 
  classes = [],
  onAddNotification 
}: HomeworkModuleProps) {
  const roleUpper = userRole.toUpperCase();
  const isTeacher = ["ENSEIGNANT", "PROFESSEUR"].includes(roleUpper) || roleUpper.includes("DIRECTEUR") || roleUpper.includes("PREFET") || roleUpper.includes("ADMIN");
  const isStudent = roleUpper === "ÉLÈVE" || roleUpper === "ELEVE";
  const isParent = roleUpper === "PARENT";

  // State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load persistent assignments & submissions
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      loadPersistentCollection<Assignment>(schoolId, "assignments", []),
      loadPersistentCollection<Submission>(schoolId, "homework_submissions", [])
    ]).then(([loadedAssignments, loadedSubmissions]) => {
      if (isMounted) {
        if (Array.isArray(loadedAssignments)) setAssignments(loadedAssignments);
        if (Array.isArray(loadedSubmissions)) setSubmissions(loadedSubmissions);
        setIsLoading(false);
      }
    }).catch(err => {
      console.warn("Error loading homework data:", err);
      if (isMounted) setIsLoading(false);
    });

    const unsubAssignments = subscribeToPersistentCollection<Assignment>(schoolId, "assignments", (list) => {
      if (isMounted && Array.isArray(list)) setAssignments(list);
    });

    const unsubSubmissions = subscribeToPersistentCollection<Submission>(schoolId, "homework_submissions", (list) => {
      if (isMounted && Array.isArray(list)) setSubmissions(list);
    });

    return () => {
      isMounted = false;
      unsubAssignments();
      unsubSubmissions();
    };
  }, [schoolId]);

  // UI state
  const [activeTab, setActiveTab] = useState<"list" | "create" | "grading">("list");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Create homework Form state
  const [newHwTitle, setNewHwTitle] = useState("");
  const [newHwSubject, setNewHwSubject] = useState("");
  const [newHwClass, setNewHwClass] = useState(classes[0]?.name || (classes[0] ? `${classes[0].level} ${classes[0].roomLetter}`.trim() : ""));
  const [newHwDeadline, setNewHwDeadline] = useState("");
  const [newHwMaxScore, setNewHwMaxScore] = useState(20);
  const [newHwDesc, setNewHwDesc] = useState("");
  const [newHwFile, setNewHwFile] = useState<string>("");

  // Sync default class on classes change
  useEffect(() => {
    if (classes.length > 0 && (!newHwClass || !classes.some(c => (c.name === newHwClass || `${c.level} ${c.roomLetter}`.trim() === newHwClass)))) {
      setNewHwClass(classes[0].name || `${classes[0].level} ${classes[0].roomLetter}`.trim());
    }
  }, [classes]);

  // Submit homework Form state
  const [studentText, setStudentText] = useState("");

  // Grading Form state
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState("");

  // Auto-select first assignment
  useEffect(() => {
    if (!selectedAssignmentId && assignments.length > 0) {
      setSelectedAssignmentId(assignments[0].id);
    }
  }, [assignments, selectedAssignmentId]);

  // Helper selectors
  const activeAssignment = assignments.find(a => a.id === selectedAssignmentId) || assignments[0];
  const activeSubmission = submissions.find(s => s.id === selectedSubmissionId);

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Submission handler
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;
    if (!studentText.trim() && !uploadedFile) {
      alert("Veuillez saisir une réponse textuelle ou joindre un fichier.");
      return;
    }

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId: activeAssignment.id,
      studentId: `std-${userName.toLowerCase().replace(/\s+/g, "-")}`,
      studentName: userName,
      submissionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: "Submitted",
      submittedText: studentText + (uploadedFile ? `\n[Fichier attaché : ${uploadedFile.name}]` : ""),
      schoolId
    };

    const updatedSubmissions = [newSub, ...submissions];
    setSubmissions(updatedSubmissions);
    
    // Increment assignments counter
    const updatedAssignments = assignments.map(a => {
      if (a.id === activeAssignment.id) {
        return { ...a, submissionsCount: (a.submissionsCount || 0) + 1 };
      }
      return a;
    });
    setAssignments(updatedAssignments);

    await savePersistentItem(schoolId, "homework_submissions", newSub);
    await savePersistentItem(schoolId, "assignments", updatedAssignments.find(a => a.id === activeAssignment.id)!);

    if (onAddNotification) {
      onAddNotification({
        id: `notif-${Date.now()}`,
        title: "Devoir Soumis avec Succès",
        message: `Votre travail pour "${activeAssignment.title}" a bien été remis au professeur.`,
        type: "success",
        time: "À l'instant",
        isRead: false
      });
    }

    alert("Votre devoir a été soumis au professeur avec succès !");
    setStudentText("");
    setUploadedFile(null);
  };

  // Parent signature / visa handler
  const handleSignParentVisa = async (sub: Submission) => {
    const parentName = userName || "Parent / Tuteur";
    const dateStr = new Date().toLocaleDateString("fr-FR") + " à " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const updatedSub: Submission = {
      ...sub,
      parentVisaName: parentName,
      parentVisaDate: dateStr
    };

    setSubmissions(prev => prev.map(s => s.id === sub.id ? updatedSub : s));
    await savePersistentItem(schoolId, "homework_submissions", updatedSub);

    alert(`Visa parental apposé avec succès par ${parentName} (${dateStr}).`);
  };

  // Creation handler
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle || !newHwSubject || !newHwClass || !newHwDeadline) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const classStudentsCount = students.filter(s => s.className === newHwClass).length || 35;

    const newHw: Assignment = {
      id: `hw-${Date.now()}`,
      title: newHwTitle,
      subject: newHwSubject,
      className: newHwClass,
      deadline: newHwDeadline,
      maxScore: Number(newHwMaxScore),
      description: newHwDesc,
      hasAttachment: !!newHwFile,
      attachmentName: newHwFile ? "document_devoir.pdf" : undefined,
      submissionsCount: 0,
      totalStudents: classStudentsCount,
      schoolId,
      teacherName: userName
    };

    const updated = [newHw, ...assignments];
    setAssignments(updated);
    setSelectedAssignmentId(newHw.id);
    setActiveTab("list");

    await savePersistentItem(schoolId, "assignments", newHw);

    if (onAddNotification) {
      onAddNotification({
        id: `notif-${Date.now()}`,
        title: "Nouveau Devoir Publié",
        message: `Le devoir de ${newHwSubject} pour la classe de ${newHwClass} a été mis en ligne.`,
        type: "info",
        time: "À l'instant",
        isRead: false
      });
    }

    alert("Le devoir a été créé et mis à la disposition des élèves.");
    setNewHwTitle("");
    setNewHwSubject("");
    setNewHwClass(classes[0]?.name || (classes[0] ? `${classes[0].level} ${classes[0].roomLetter}`.trim() : ""));
    setNewHwDeadline("");
    setNewHwDesc("");
    setNewHwFile("");
  };

  // Delete assignment handler
  const handleDeleteAssignment = async (hwId: string) => {
    if (confirm("Confirmez-vous la suppression définitive de ce devoir ?")) {
      const updated = assignments.filter(a => a.id !== hwId);
      setAssignments(updated);
      if (selectedAssignmentId === hwId) {
        setSelectedAssignmentId(updated[0]?.id || "");
      }
      await deletePersistentItem(schoolId, "assignments", hwId);
    }
  };

  // Evaluation saving handler
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionId) return;

    const sub = submissions.find(s => s.id === selectedSubmissionId);
    if (!sub) return;

    const updatedSub: Submission = {
      ...sub,
      status: "Graded",
      score: Number(gradeScore),
      feedback: gradeFeedback
    };

    setSubmissions(prev => prev.map(s => s.id === selectedSubmissionId ? updatedSub : s));
    await savePersistentItem(schoolId, "homework_submissions", updatedSub);

    alert("L'évaluation de l'élève a été enregistrée avec succès.");
    setSelectedSubmissionId(null);
    setActiveTab("list");
  };

  const handleOpenGrading = (sub: Submission) => {
    setSelectedSubmissionId(sub.id);
    setGradeScore(sub.score || 0);
    setGradeFeedback(sub.feedback || "");
    setActiveTab("grading");
  };

  return (
    <div className="space-y-6" id="devoirs-module-container">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
            <ClipboardList className="h-6 w-6 text-indigo-600" />
            <span>Gestion des Devoirs & Exercices</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mise en ligne, réception de devoirs numérisés et évaluation des copies scolaires en République Démocratique du Congo.
          </p>
        </div>

        {isTeacher && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveTab("list");
                setSelectedSubmissionId(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "list" 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              Liste des Devoirs ({assignments.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "create" 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Publier un Devoir</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left pane: Assignments List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-4 shadow-xs text-left">
            <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider mb-3">
              Devoirs de l'Établissement ({assignments.length})
            </h3>
            
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Chargement des devoirs...</div>
            ) : assignments.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Aucun devoir en cours.</p>
                {isTeacher && (
                  <button
                    onClick={() => setActiveTab("create")}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    + Publier un devoir
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {assignments.map(hw => (
                  <button
                    key={hw.id}
                    onClick={() => {
                      setSelectedAssignmentId(hw.id);
                      setSelectedSubmissionId(null);
                      if (activeTab === "grading") setActiveTab("list");
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col space-y-2 ${
                      selectedAssignmentId === hw.id 
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-slate-900 dark:text-white" 
                        : "border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/40"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider">
                        {hw.subject}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">
                        Max: {hw.maxScore} Pts
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs leading-snug line-clamp-2">
                      {hw.title}
                    </h4>

                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold pt-1 border-t border-slate-100 dark:border-slate-850/60 w-full">
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{hw.className}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-red-500">
                        <Calendar className="h-3 w-3" />
                        <span>Limite : {hw.deadline}</span>
                      </span>
                    </div>

                    {/* Submission gauge */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-mono">
                        <span>Rendus :</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{hw.submissionsCount || 0} / {hw.totalStudents || 35}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, ((hw.submissionsCount || 0) / (hw.totalStudents || 35)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Details & Interactive Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. VIEW / EDIT/ DELETE AS TEACHER */}
          {activeTab === "list" && activeAssignment && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xs text-left space-y-6">
              {/* Assignment Title Block */}
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                    {activeAssignment.subject}
                  </span>
                  <div className="flex items-center space-x-3 text-[10px] font-mono font-black text-slate-400">
                    <span>CLASSE : {activeAssignment.className}</span>
                    <span>|</span>
                    <span className="text-red-500 uppercase">DATE LIMITE : {activeAssignment.deadline}</span>
                    {isTeacher && (
                      <button
                        onClick={() => handleDeleteAssignment(activeAssignment.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        title="Supprimer devoir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  {activeAssignment.title}
                </h2>
              </div>

              {/* Description & Instruction */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-2">Instructions & Énoncé :</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans font-medium">
                  {activeAssignment.description}
                </p>
                {activeAssignment.hasAttachment && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-red-500" />
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{activeAssignment.attachmentName || "Document Joint.pdf"}</span>
                    </div>
                    <button 
                      onClick={() => alert(`Téléchargement de la pièce jointe "${activeAssignment.attachmentName || 'Document'}"...`)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                    >
                      Télécharger
                    </button>
                  </div>
                )}
              </div>

              {/* Submissions Section for Teachers */}
              {isTeacher && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider border-b pb-2">
                    Copies Remises par les Élèves ({submissions.filter(s => s.assignmentId === activeAssignment.id).length})
                  </h3>

                  <div className="space-y-3">
                    {submissions.filter(s => s.assignmentId === activeAssignment.id).map(sub => {
                      const isGraded = sub.status === "Graded";
                      return (
                        <div 
                          key={sub.id}
                          className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="text-left space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-slate-900 dark:text-white">{sub.studentName}</span>
                              <span className="text-[9px] text-slate-400">({sub.submissionDate})</span>
                              {sub.parentVisaName && (
                                <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                                  ✓ Visé par parent ({sub.parentVisaName})
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono truncate max-w-md italic">
                              "{sub.submittedText}"
                            </p>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                            {isGraded ? (
                              <div className="text-right">
                                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-[9px] px-2 py-1 rounded-md uppercase border border-emerald-100 dark:border-emerald-900/30">
                                  Corrigé : {sub.score} / {activeAssignment.maxScore}
                                </span>
                              </div>
                            ) : (
                              <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-extrabold text-[9px] px-2 py-1 rounded-md uppercase border border-amber-100 dark:border-amber-900/30">
                                À corriger
                              </span>
                            )}

                            <button
                              onClick={() => handleOpenGrading(sub)}
                              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-900 dark:text-indigo-300 font-extrabold rounded-xl transition-all cursor-pointer text-[10px]"
                            >
                              {isGraded ? "Modifier Note" : "Corriger Copie"}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {submissions.filter(s => s.assignmentId === activeAssignment.id).length === 0 && (
                      <div className="text-center py-6 text-slate-400">
                        <AlertCircle className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-[11px] font-bold uppercase">Aucune copie remise pour le moment.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submission Form for Students */}
              {isStudent && (
                <form onSubmit={handleStudentSubmit} className="space-y-5 border-t pt-5">
                  <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    <span>Soumettre votre Travail ({userName})</span>
                  </h3>

                  {submissions.find(s => s.assignmentId === activeAssignment.id && s.studentName === userName)?.status === "Graded" ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-emerald-900 dark:text-emerald-300 text-xs uppercase tracking-wider">TRAVAIL CORRIGÉ</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 text-lg">
                          {submissions.find(s => s.assignmentId === activeAssignment.id && s.studentName === userName)?.score} / {activeAssignment.maxScore} Pts
                        </span>
                      </div>
                      <p className="text-xs text-emerald-950/80 dark:text-slate-300">
                        <strong>Commentaire du Professeur :</strong> "{submissions.find(s => s.assignmentId === activeAssignment.id && s.studentName === userName)?.feedback || "Aucune observation."}"
                      </p>
                    </div>
                  ) : submissions.find(s => s.assignmentId === activeAssignment.id && s.studentName === userName)?.status === "Submitted" ? (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-center">
                      <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-indigo-950 dark:text-slate-300 uppercase">Vous avez déjà remis votre devoir</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">En attente de correction par votre enseignant.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Rédiger votre réponse en ligne</label>
                        <textarea
                          rows={5}
                          value={studentText}
                          onChange={(e) => setStudentText(e.target.value)}
                          placeholder="Saisissez vos réponses, démonstrations ou explications textuelles ici..."
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-sans"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Ou joindre un document de travail (PDF, Photo d'exercice rédigé sur cahier)
                        </label>
                        
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                            dragActive 
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" 
                              : uploadedFile 
                                ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10" 
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50"
                          }`}
                        >
                          <input 
                            type="file" 
                            id="file-upload" 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          />
                          
                          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                            <Upload className={`h-8 w-8 ${uploadedFile ? "text-emerald-500 animate-bounce" : "text-slate-400"}`} />
                            {uploadedFile ? (
                              <div className="text-xs">
                                <p className="font-extrabold text-emerald-800 dark:text-emerald-400 uppercase">Document Attaché avec Succès</p>
                                <p className="text-slate-500 font-mono mt-0.5">{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</p>
                              </div>
                            ) : (
                              <div className="text-xs">
                                <p className="font-bold text-slate-700 dark:text-slate-300 uppercase">Glissez-déposez votre fichier ici</p>
                                <p className="text-slate-400 mt-1">ou <span className="text-indigo-600 hover:underline">parcourez vos fichiers</span> (Max 10Mo)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 px-6 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center space-x-1.5"
                        >
                          <span>SOUMETTRE MA COPIE AU PROFESSEUR</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* Parent tracking module */}
              {isParent && (
                <div className="space-y-4 border-t pt-5 text-left">
                  <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    <Award className="h-4 w-4 text-emerald-500" />
                    <span>Suivi Parental & Visa Électronique</span>
                  </h3>

                  {submissions.some(s => s.assignmentId === activeAssignment.id) ? (
                    <div className="space-y-3">
                      {submissions.filter(s => s.assignmentId === activeAssignment.id).map(sub => (
                        <div key={sub.id} className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-500 uppercase">Élève :</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{sub.studentName}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-500 uppercase">Copie rendue le :</span>
                            <span className="font-mono text-slate-900 dark:text-slate-100">{sub.submissionDate}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-500 uppercase">Statut d'évaluation :</span>
                            {sub.status === "Graded" ? (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                                Corrigé ({sub.score} / {activeAssignment.maxScore} Pts)
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                                En cours de correction
                              </span>
                            )}
                          </div>

                          {/* Visa Parental Status */}
                          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            {sub.parentVisaName ? (
                              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1.5">
                                <Check className="h-4 w-4" />
                                <span>Visa Parental apposé le {sub.parentVisaDate} par {sub.parentVisaName}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSignParentVisa(sub)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                              >
                                <FileCheck className="h-3.5 w-3.5" />
                                <span>Apposer mon Visa Parental (Signer)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-center">
                      <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-rose-950 dark:text-slate-300 uppercase">Devoir non encore rendu par l'élève</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Veuillez encourager votre enfant à remettre sa copie avant la date limite ({activeAssignment.deadline}).</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. FORM: CREATE HOMEWORK */}
          {activeTab === "create" && isTeacher && (
            <form onSubmit={handleCreateAssignment} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xs text-left space-y-5">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Créer un Nouveau Devoir</h3>
                <p className="text-xs text-slate-500">Mettre en ligne une fiche d'exercices ou un sujet de composition.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Sujet / Titre du Devoir *</label>
                  <input
                    type="text"
                    value={newHwTitle}
                    onChange={(e) => setNewHwTitle(e.target.value)}
                    placeholder="Ex: Devoir de grammaire française : Les pronoms relatifs"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Discipline / Cours *</label>
                    <input
                      type="text"
                      value={newHwSubject}
                      onChange={(e) => setNewHwSubject(e.target.value)}
                      placeholder="Ex: Mathématiques"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Classe Ciblée *</label>
                    <select
                      value={newHwClass}
                      onChange={(e) => setNewHwClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                      required
                    >
                      {classes.map(c => {
                        const val = c.name || `${c.level} ${c.roomLetter}`.trim();
                        return <option key={c.id || val} value={val}>{val}</option>;
                      })}
                      {classes.length === 0 && (
                        <option value="" disabled>Aucune classe disponible</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Date Limite de Remise *</label>
                    <input
                      type="date"
                      value={newHwDeadline}
                      onChange={(e) => setNewHwDeadline(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Pondération Maximale (Points) *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newHwMaxScore}
                    onChange={(e) => setNewHwMaxScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Énoncé & Consignes Pédagogiques *</label>
                  <textarea
                    rows={4}
                    value={newHwDesc}
                    onChange={(e) => setNewHwDesc(e.target.value)}
                    placeholder="Saisissez l'intégralité des exercices, équations ou questions à résoudre..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
                >
                  Publier le Devoir
                </button>
              </div>
            </form>
          )}

          {/* 3. FORM: GRADING */}
          {activeTab === "grading" && activeSubmission && isTeacher && (
            <form onSubmit={handleSaveEvaluation} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xs text-left space-y-5">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">
                  Correction de Copie : {activeSubmission.studentName}
                </h3>
                <p className="text-xs text-slate-500">Attribution de la cote et appréciation formative pour l'élève.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Réponse fournie par l'élève :</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono">
                  {activeSubmission.submittedText}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Note Attribuée (sur {activeAssignment?.maxScore || 20} Pts) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={activeAssignment?.maxScore || 20}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Appréciation / Commentaires Pédagogiques
                  </label>
                  <input
                    type="text"
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Ex: Très bon raisonnement, soignez la calligraphie..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("list");
                    setSelectedSubmissionId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
                >
                  Enregistrer l'Évaluation
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
