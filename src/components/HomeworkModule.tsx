import React, { useState } from "react";
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
  ClipboardList
} from "lucide-react";

// Mock homework data
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
}

interface HomeworkModuleProps {
  userRole: string;
  userName: string;
  students: any[];
  classes: any[];
  onAddNotification?: (notif: any) => void;
}

export function HomeworkModule({ 
  userRole, 
  userName, 
  students, 
  classes,
  onAddNotification 
}: HomeworkModuleProps) {
  const roleUpper = userRole.toUpperCase();
  const isTeacher = ["ENSEIGNANT", "PROFESSEUR"].includes(roleUpper) || roleUpper.includes("DIRECTEUR") || roleUpper.includes("PREFET");
  const isStudent = roleUpper === "ÉLÈVE" || roleUpper === "ELEVE";
  const isParent = roleUpper === "PARENT";

  // State
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "hw-1",
      title: "Devoir d'Algèbre : Équations du second degré",
      subject: "Mathématiques",
      className: "3ème Humanités A",
      deadline: "2026-07-12",
      maxScore: 20,
      description: "Résoudre les équations suivantes et détailler la méthode du discriminant (Delta) : \n1) 2x² - 5x + 2 = 0 \n2) x² - 4x + 4 = 0 \n3) 3x² + 2x + 1 = 0.",
      hasAttachment: true,
      attachmentName: "exercices_second_degre.pdf",
      submissionsCount: 15,
      totalStudents: 42
    },
    {
      id: "hw-2",
      title: "Dissertation Littéraire : Le rôle de la littérature",
      subject: "Français",
      className: "4ème Humanités B",
      deadline: "2026-07-15",
      maxScore: 40,
      description: "Dans quelle mesure pensez-vous que l'écrivain doit être le porte-parole de sa société ? Justifiez votre réponse à l'aide d'exemples d'œuvres congolaises étudiées.",
      hasAttachment: false,
      submissionsCount: 8,
      totalStudents: 38
    },
    {
      id: "hw-3",
      title: "Rapport de Laboratoire : Conductivité des Solutions",
      subject: "Physique Spéciale",
      className: "3ème Humanités A",
      deadline: "2026-07-10",
      maxScore: 10,
      description: "Rédiger le compte-rendu de la manipulation n°2 effectuée en classe. N'oubliez pas d'inclure le schéma du circuit et les calculs de résistivité.",
      hasAttachment: true,
      attachmentName: "guide_labo_conductivite.pdf",
      submissionsCount: 42,
      totalStudents: 42
    }
  ]);

  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "sub-1",
      assignmentId: "hw-1",
      studentId: "std-1",
      studentName: "Gaston Tshibanda",
      submissionDate: "2026-07-05 14:32",
      status: "Graded",
      submittedText: "Voici mes réponses pour le devoir d'algèbre : \n1) 2x² - 5x + 2 = 0. Delta = 25 - 16 = 9. x1 = (5+3)/4 = 2. x2 = (5-3)/4 = 1/2.\n2) x² - 4x + 4 = 0. Delta = 16 - 16 = 0. x = 4/2 = 2 (Solution double).\n3) 3x² + 2x + 1 = 0. Delta = 4 - 12 = -8 < 0. Pas de solution réelle.",
      score: 18,
      feedback: "Excellent travail Gaston! La rédaction est claire et rigoureuse. Attention au soin."
    },
    {
      id: "sub-2",
      assignmentId: "hw-1",
      studentId: "std-3",
      studentName: "Christian Mukendi",
      submissionDate: "2026-07-06 09:11",
      status: "Submitted",
      submittedText: "Monsieur, j'ai fait le devoir. Pour l'équation 1, j'ai trouvé x=2 et x=0.5. Pour l'équation 2, x=2. Pour la 3ème, pas de solution."
    },
    {
      id: "sub-3",
      assignmentId: "hw-2",
      studentId: "std-2",
      studentName: "Naomi Mwamba",
      submissionDate: "2026-07-06 11:20",
      status: "Submitted",
      submittedText: "Introduction : La littérature a toujours été un miroir pour l'humanité. En RDC, des auteurs comme Zamenga Batukezanga ont dénoncé les maux sociaux..."
    }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState<"list" | "create" | "grading">("list");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("hw-1");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Create homework Form state
  const [newHwTitle, setNewHwTitle] = useState("");
  const [newHwSubject, setNewHwSubject] = useState("");
  const [newHwClass, setNewHwClass] = useState("");
  const [newHwDeadline, setNewHwDeadline] = useState("");
  const [newHwMaxScore, setNewHwMaxScore] = useState(20);
  const [newHwDesc, setNewHwDesc] = useState("");
  const [newHwFile, setNewHwFile] = useState<string>("");

  // Submit homework Form state
  const [studentText, setStudentText] = useState("");

  // Grading Form state
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState("");

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
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentText.trim() && !uploadedFile) {
      alert("Veuillez saisir une réponse textuelle ou joindre un fichier.");
      return;
    }

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId: activeAssignment.id,
      studentId: "std-1", // Gaston Tshibanda in mock
      studentName: userName || "Gaston Tshibanda",
      submissionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: "Submitted",
      submittedText: studentText + (uploadedFile ? `\n[Fichier attaché : ${uploadedFile.name}]` : "")
    };

    setSubmissions([newSub, ...submissions]);
    
    // Increment assignments counter
    setAssignments(assignments.map(a => {
      if (a.id === activeAssignment.id) {
        return { ...a, submissionsCount: a.submissionsCount + 1 };
      }
      return a;
    }));

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

  // Creation handler
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle || !newHwSubject || !newHwClass || !newHwDeadline) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

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
      totalStudents: 40 // Default approximation
    };

    setAssignments([newHw, ...assignments]);
    setSelectedAssignmentId(newHw.id);
    setActiveTab("list");

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
    setNewHwClass("");
    setNewHwDeadline("");
    setNewHwDesc("");
    setNewHwFile("");
  };

  // Evaluation saving handler
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionId) return;

    setSubmissions(submissions.map(s => {
      if (s.id === selectedSubmissionId) {
        return {
          ...s,
          status: "Graded" as const,
          score: gradeScore,
          feedback: gradeFeedback
        };
      }
      return s;
    }));

    alert("L'évaluation de l'élève a été enregistrée.");
    setSelectedSubmissionId(null);
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
              Liste des Devoirs
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
            <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider mb-3">Devoirs en Cours</h3>
            
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
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{hw.submissionsCount} / {hw.totalStudents}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300" 
                        style={{ width: `${(hw.submissionsCount / hw.totalStudents) * 100}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right pane: Details & Interactive Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. VIEW / EDIT/ DELETE AS TEACHER */}
          {activeTab === "list" && (
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
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{activeAssignment.attachmentName}</span>
                    </div>
                    <button 
                      onClick={() => alert(`Téléchargement de la pièce jointe "${activeAssignment.attachmentName}"...`)}
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
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="text-left space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-slate-900 dark:text-white">{sub.studentName}</span>
                              <span className="text-[9px] text-slate-400">({sub.submissionDate})</span>
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
                    <span>Soumettre votre Travail (Gaston)</span>
                  </h3>

                  {/* Submission feedback score if graded */}
                  {submissions.find(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1")?.status === "Graded" ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-emerald-900 dark:text-emerald-300 text-xs uppercase tracking-wider">TRAVAIL CORRIGÉ</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 text-lg">
                          {submissions.find(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1")?.score} / {activeAssignment.maxScore} Pts
                        </span>
                      </div>
                      <p className="text-xs text-emerald-950/80 dark:text-slate-300">
                        <strong>Commentaire du Professeur :</strong> "{submissions.find(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1")?.feedback || "Aucune observation."}"
                      </p>
                    </div>
                  ) : submissions.find(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1")?.status === "Submitted" ? (
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

                      {/* File Upload drag and drop */}
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
                    <span>Suivi Parental (Pupille : Gaston)</span>
                  </h3>

                  {submissions.some(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1") ? (
                    <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-950 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase">Copie rendue le :</span>
                        <span className="font-mono text-slate-900 dark:text-slate-100">
                          {submissions.find(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1")?.submissionDate}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase">Statut d'évaluation :</span>
                        {submissions.find(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1")?.status === "Graded" ? (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                            Corrigé & Évalué
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                            En cours de correction
                          </span>
                        )}
                      </div>

                      {submissions.find(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1")?.status === "Graded" && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-slate-800 dark:text-slate-300 text-xs uppercase">Note de votre enfant :</span>
                            <span className="font-black text-indigo-700 dark:text-indigo-400 text-lg">
                              {submissions.find(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1")?.score} / {activeAssignment.maxScore} Pts
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal italic">
                            <strong>Remarque de l'enseignant :</strong> "{submissions.find(s => s.assignmentId === activeAssignment.id && s.studentId === "std-1")?.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-center">
                      <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-rose-950 dark:text-slate-300 uppercase">Devoir non encore rendu par l'élève</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Veuillez encourager Gaston à remettre sa copie avant la date limite ({activeAssignment.deadline}).</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Discipline / Cours *</label>
                    <select
                      value={newHwSubject}
                      onChange={(e) => setNewHwSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                      required
                    >
                      <option value="">Sélectionner un cours...</option>
                      <option value="Mathématiques">Mathématiques</option>
                      <option value="Physique">Physique</option>
                      <option value="Chimie">Chimie</option>
                      <option value="Français">Français</option>
                      <option value="Histoire">Histoire</option>
                      <option value="Comptabilité">Comptabilité</option>
                      <option value="Technologie">Technologie</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Classe Cible *</label>
                    <select
                      value={newHwClass}
                      onChange={(e) => setNewHwClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                      required
                    >
                      <option value="">Sélectionner la classe...</option>
                      {classes.map(c => (
                        <option key={c.id} value={`${c.level} ${c.roomLetter}`}>{c.level} {c.roomLetter}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Date de Remise Limite *</label>
                    <input
                      type="date"
                      value={newHwDeadline}
                      onChange={(e) => setNewHwDeadline(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Cote Maximale (Points) *</label>
                    <input
                      type="number"
                      value={newHwMaxScore}
                      onChange={(e) => setNewHwMaxScore(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                      required
                      min={1}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Fiche ou Énoncé Complet du Devoir</label>
                  <textarea
                    rows={6}
                    value={newHwDesc}
                    onChange={(e) => setNewHwDesc(e.target.value)}
                    placeholder="Saisissez les consignes, les questions et les exercices pour les élèves..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Attacher un document (Optionnel)</label>
                  <input
                    type="text"
                    value={newHwFile}
                    onChange={(e) => setNewHwFile(e.target.value)}
                    placeholder="Nom du document (ex: sujet_chimie_2026.pdf)"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-600"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-6 rounded-xl transition-all text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 px-6 rounded-xl transition-all shadow-md text-xs cursor-pointer"
                >
                  Publier aux Élèves
                </button>
              </div>
            </form>
          )}

          {/* 3. FORM: EVALUATE SUBMISSION */}
          {activeTab === "grading" && isTeacher && activeSubmission && (
            <form onSubmit={handleSaveEvaluation} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xs text-left space-y-5">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">Évaluation de la Copie</h3>
                  <p className="text-xs text-slate-500">Élève : <strong className="text-slate-900 dark:text-white uppercase">{activeSubmission.studentName}</strong></p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedSubmissionId(null)}
                  className="text-[10px] bg-slate-100 dark:bg-slate-800 font-bold px-2.5 py-1 rounded hover:bg-slate-200 text-slate-500"
                >
                  Retour
                </button>
              </div>

              {/* Student Answer */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Copie rendue par l'élève :</span>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-300">
                  {activeSubmission.submittedText}
                </div>
              </div>

              {/* Score & Feedback Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Note attribuée / {activeAssignment.maxScore} *</label>
                  <input
                    type="number"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                    required
                    min={0}
                    max={activeAssignment.maxScore}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Observations & Feedback Pédagogique</label>
                  <input
                    type="text"
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Ex: Excellent raisonnement, soin de rédaction à améliorer."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubmissionId(null);
                    setActiveTab("list");
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-6 rounded-xl transition-all text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 px-6 rounded-xl transition-all shadow-md text-xs cursor-pointer"
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
