import React, { useState, useMemo } from "react";
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
  UserX
} from "lucide-react";
import { NationalCultureHeritageModule } from "./NationalCultureHeritageModule";
import { usePedagogicalTimetable } from "../context/PedagogicalTimetableContext";
import { ClassJournalModule } from "./ClassJournalModule";

interface TeacherModuleProps {
  userRole: string;
  userName: string;
  students?: any[];
  onAddNotification?: (notif: any) => void;
}

export function TeacherModule({ userRole, userName, students = [], onAddNotification }: TeacherModuleProps) {
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

  // Dynamic Course Assignments for this Teacher
  const teacherAssignments = useMemo(() => {
    return getTeacherAssignments(userName);
  }, [getTeacherAssignments, userName]);

  // Assigned Classes and Subjects derived dynamically
  const teachersClasses = useMemo(() => {
    if (teacherAssignments.length > 0) {
      return Array.from(new Set(teacherAssignments.map(a => a.className)));
    }
    return ["6ème Primaire A", "6ème Primaire B", "5ème Humanités Scientifique A"];
  }, [teacherAssignments]);

  const teachersSubjects = useMemo(() => {
    if (teacherAssignments.length > 0) {
      return Array.from(new Set(teacherAssignments.map(a => a.subjectName)));
    }
    return ["Mathématiques", "Physique", "Sciences Naturelles"];
  }, [teacherAssignments]);

  const [selectedClass, setSelectedClass] = useState<string>(() => teachersClasses[0] || "6ème Primaire A");

  // Filter students by assigned classes
  const assignedStudents = useMemo(() => {
    if (students.length > 0) {
      return students.filter(s => teachersClasses.includes(s.className));
    }
    return [
      { id: "std-1", fullName: "Mutombo Jean-Bosco", className: "6ème Primaire A" },
      { id: "std-2", fullName: "Mbuyi Astrid", className: "6ème Primaire A" },
      { id: "std-3", fullName: "Kapinga Sarah", className: "6ème Primaire A" },
      { id: "std-4", fullName: "Tshibanda Pierre", className: "6ème Primaire A" }
    ];
  }, [students, teachersClasses]);

  // Teacher Schedule
  const teacherWeeklySchedule = useMemo(() => {
    return timetableEntries.filter(
      t => t.teacherName.toLowerCase() === userName.toLowerCase() ||
           (t.isSubstituted && t.substituteTeacherName?.toLowerCase() === userName.toLowerCase())
    );
  }, [timetableEntries, userName]);

  // Daily Live Reminders
  const activeReminders = useMemo(() => {
    return generateDailyRemindersForTeacher(userName);
  }, [generateDailyRemindersForTeacher, userName]);

  // 1. Attendance registry state
  const [attendanceSheet, setAttendanceSheet] = useState<{ [key: string]: "Présent" | "Absent" | "Retard" }>({});

  // 2. Question Bank database
  const [questionBank, setQuestionBank] = useState<any[]>([
    { id: "q-1", type: "QCM", text: "Quelle est la formule chimique de l'eau ?", options: ["A) CO2", "B) H2O", "C) NaCl", "D) CH4"], correct: "B", image: null },
    { id: "q-2", type: "Vrai/Faux", text: "Kinshasa est la capitale de la République Démocratique du Congo.", options: ["Vrai", "Faux"], correct: "Vrai", image: null },
    { id: "q-3", type: "Réponse courte", text: "Qui est le premier président de la RDC ?", correct: "Joseph Kasa-Vubu", image: null }
  ]);

  // Question Creator State
  const [newQType, setNewQType] = useState("QCM");
  const [newQText, setNewQText] = useState("");
  const [newQCorrect, setNewQCorrect] = useState("");
  const [newQOptions, setNewQOptions] = useState<string[]>(["", "", "", ""]);
  
  // 3. Homework database
  const [homeworks, setHomeworks] = useState<any[]>([
    { id: "hw-101", title: "Devoir de synthèse - Fractions décimales", course: "Mathématiques", className: "6ème Primaire A", optionName: "Générale", deadline: "05/07/2026", points: 20, submissionsCount: 3 },
    { id: "hw-102", title: "Travaux pratiques de cinématique", course: "Physique", className: "5ème Humanités Scientifique A", optionName: "Scientifique", deadline: "08/07/2026", points: 10, submissionsCount: 1 }
  ]);

  // Devoir creator Form state
  const [hwTitle, setHwTitle] = useState("");
  const [hwDesc, setHwDesc] = useState("");
  const [hwCourse, setHwCourse] = useState(teachersSubjects[0] || "Mathématiques");
  const [hwClass, setHwClass] = useState(teachersClasses[0] || "6ème Primaire A");
  const [hwOption, setHwOption] = useState("Générale");
  const [hwDeadline, setHwDeadline] = useState("");
  const [hwPoints, setHwPoints] = useState(20);
  const [hwCreatedSuccess, setHwCreatedSuccess] = useState(false);

  // 4. Student replies for Correction & Grading
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([
    { id: "sub-1", studentName: "Mutombo Jean-Bosco", homeworkTitle: "Devoir de synthèse - Fractions décimales", text: "Voici mes équations résolues : 3/4 = 0,75...", score: "", isGraded: false, comments: "" },
    { id: "sub-2", studentName: "Astrid Mbuyi", homeworkTitle: "Devoir de synthèse - Fractions décimales", text: "Réponses formulées dans le fichier joint.", fileAttached: "astrid_calculs_fractions.pdf", score: "18", isGraded: true, comments: "Excellent travail d'analyse." }
  ]);

  // 5. Virtual classroom state
  const [announcements, setAnnouncements] = useState<any[]>([
    { id: "ann-1", author: userName, text: "Bienvenue sur le mur virtuel de la classe ! Retrouvez ici tous vos devoirs et supports de cours.", date: "01/09/2025 à 08:00" }
  ]);
  const [newAnnounceText, setNewAnnounceText] = useState("");

  // Grade Input States
  const [editingStudentScores, setEditingStudentScores] = useState<{ [key: string]: string }>({
    "std-1": "38",
    "std-2": "42",
    "std-3": "29",
    "std-4": "35"
  });

  const handleSaveAttendance = () => {
    alert(`Registre d'appel validé pour la classe ${selectedClass} ! Notification automatique transmise à la direction et aux parents.`);
    if (onAddNotification) {
      onAddNotification({
        id: "not-abs-" + Date.now(),
        text: `Appel effectué par ${userName} en ${selectedClass}.`,
        targetRoles: ["Parent", "Directeur du Primaire", "Préfet des Études"]
      });
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;
    const newQ = {
      id: "q-" + (questionBank.length + 1),
      type: newQType,
      text: newQText,
      options: newQType === "QCM" ? newQOptions.filter(o => o.trim() !== "") : newQType === "Vrai/Faux" ? ["Vrai", "Faux"] : [],
      correct: newQCorrect,
      image: null
    };
    setQuestionBank([...questionBank, newQ]);
    setNewQText("");
    setNewQCorrect("");
    setNewQOptions(["", "", "", ""]);
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;
    const newHw = {
      id: "hw-" + (homeworks.length + 101),
      title: hwTitle,
      description: hwDesc,
      course: hwCourse,
      className: hwClass,
      optionName: hwOption,
      deadline: hwDeadline,
      points: hwPoints,
      submissionsCount: 0
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
        text: `Nouveau devoir de ${hwCourse} publié pour les classes de ${hwClass} : "${hwTitle}".`,
        targetRoles: ["Élève", "Parent"]
      });
    }
  };

  const handleGradeSubmission = (subId: string, score: string, comments: string) => {
    setStudentSubmissions(studentSubmissions.map(sub => 
      sub.id === subId ? { ...sub, score, comments, isGraded: true } : sub
    ));
    alert("Note enregistrée avec succès ! La note a été transmise automatiquement au carnet de cotes (gradebook).");
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounceText.trim()) return;
    const ann = {
      id: "ann-" + (announcements.length + 1),
      author: userName,
      text: newAnnounceText,
      date: new Date().toLocaleDateString() + " à " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setAnnouncements([ann, ...announcements]);
    setNewAnnounceText("");
  };

  const menuItems = [
    { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { id: "journal_classe", label: "Journal de Classe & Séances", icon: FileText },
    { id: "horaire_prof", label: "Mon Emploi du Temps", icon: Calendar },
    { id: "classes", label: "Mes Classes & Affectations", icon: School },
    { id: "presences", label: "Registre d'Appel (Présences)", icon: CheckSquare },
    { id: "cotes", label: "Saisie de Notes & Cotes", icon: Award },
    { id: "devoirs", label: "Créateur de Devoirs", icon: BookOpen },
    { id: "banque", label: "Banque de Questions", icon: HelpCircle },
    { id: "correction", label: "Correction & Validation", icon: CheckCircle2 },
    { id: "classe_virtuelle", label: "Classe Virtuelle", icon: Folder },
    { id: "patrimoine_rdc", label: "Patrimoine & Culture RDC", icon: Landmark }
  ];

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
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-1.5 flex-wrap">
            {teachersClasses.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {c}
              </span>
            ))}
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
        
        {/* INTELLIGENT LIVE REMINDER BANNER */}
        {activeReminders.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200">
            <Bell className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-xs">
                Rappel de Cours Imminent
              </h4>
              <p className="text-[11px] leading-relaxed">
                {activeReminders[0].message}
              </p>
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

          {/* JOURNAL DE CLASSE & CAHIER DE TEXTES */}
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
                studentCount: 35, 
                maxStudents: 45, 
                levelCategory: "Secondaire" as const, 
                classGrade: c,
                schoolId: "sch-001" 
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
            </div>
          )}

          {/* DASHBOARD */}
          {activeSubTab === "dashboard" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Tableau de bord de l'Enseignant</h3>
                <p className="text-slate-500 text-[10px]">Aperçu de vos activités de cours, corrections en attente, et assiduité courante.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Classes Attribuées</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">{teachersClasses.length} classes</span>
                  <p className="text-[9px] text-slate-500">{teachersClasses.join(", ")}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Matières Enseignées</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">{teachersSubjects.length} matières</span>
                  <p className="text-[9px] text-indigo-600 font-bold">{teachersSubjects.join(", ")}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Séances au Planning</span>
                  <span className="text-xl font-black text-blue-600 font-mono">{teacherWeeklySchedule.length} cours / sem.</span>
                  <p className="text-[9px] text-slate-500">Conformité horaire EPST</p>
                </div>
              </div>

              {/* Quick links to actions */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Vos raccourcis d'action rapide</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setActiveSubTab("journal_classe")}
                    className="p-3.5 border border-slate-150 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950/20 rounded-xl text-left font-bold space-y-1 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-blue-600 mb-1" />
                    <span>Remplir le Journal de Classe</span>
                    <p className="text-[9px] text-slate-400 font-medium">Consigner les notions abordées aujourd'hui</p>
                  </button>

                  <button 
                    onClick={() => setActiveSubTab("presences")}
                    className="p-3.5 border border-slate-150 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-950/20 rounded-xl text-left font-bold space-y-1 cursor-pointer"
                  >
                    <CheckSquare className="h-4 w-4 text-indigo-600 mb-1" />
                    <span>Faire l'appel du cours</span>
                    <p className="text-[9px] text-slate-400 font-medium">Lancer le registre de présence de {selectedClass}</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MES CLASSES & MATIERES */}
          {activeSubTab === "classes" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Mes Classes & Affectations Officielles</h3>
                <p className="text-slate-500 text-[10px]">Affectations attribuées par le Préfet des études ou le Directeur du primaire.</p>
              </div>

              <div className="space-y-3">
                {teacherAssignments.map((asg) => (
                  <div key={asg.id} className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{asg.subjectName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                          {asg.className}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Option : {asg.optionName || "Général"} • Volume : {asg.weeklyHours}h / semaine
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <div>Affecté par : {asg.assignedByRole}</div>
                      <div className="text-[10px]">{asg.assignedDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRESENCES (REGISTRE D'APPEL) */}
          {activeSubTab === "presences" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Registre de Présences de la Classe</h3>
                <p className="text-slate-500 text-[10px]">Faites l'appel et cochez les élèves présents pour vos cours.</p>
              </div>

              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3.5 border rounded-xl">
                <div className="text-left">
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">Sélectionner la classe :</span>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 p-1.5 bg-white dark:bg-slate-900 rounded text-xs mt-1 font-bold"
                  >
                    {teachersClasses.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                  </select>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">Date : {new Date().toLocaleDateString()}</span>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b text-slate-500 font-bold">
                      <th className="p-3">Nom de l'élève</th>
                      <th className="p-3">Statut de présence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {assignedStudents
                      .filter(s => s.className === selectedClass || (!s.className && selectedClass.includes("6ème")))
                      .map((std) => {
                        const currentStatus = attendanceSheet[std.id] || "Présent";
                        return (
                          <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{std.fullName}</td>
                            <td className="p-3 flex items-center space-x-2">
                              <button
                                onClick={() => setAttendanceSheet({ ...attendanceSheet, [std.id]: "Présent" })}
                                className={`px-3 py-1 rounded-xl text-[10px] font-black cursor-pointer ${
                                  currentStatus === "Présent" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                              >
                                Présent
                              </button>
                              <button
                                onClick={() => setAttendanceSheet({ ...attendanceSheet, [std.id]: "Absent" })}
                                className={`px-3 py-1 rounded-xl text-[10px] font-black cursor-pointer ${
                                  currentStatus === "Absent" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => setAttendanceSheet({ ...attendanceSheet, [std.id]: "Retard" })}
                                className={`px-3 py-1 rounded-xl text-[10px] font-black cursor-pointer ${
                                  currentStatus === "Retard" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                              >
                                Retard
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="text-right">
                <button
                  onClick={handleSaveAttendance}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Enregistrer & Valider l'Appel
                </button>
              </div>
            </div>
          )}

          {/* NOTES & BULLETINS */}
          {activeSubTab === "cotes" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Saisie du Carnet de Cotes & Bulletins</h3>
                <p className="text-slate-500 text-[10px]">Entrez et gérez les cotes périodiques des élèves pour vos cours attribués.</p>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b text-slate-500 font-bold">
                      <th className="p-3">Élève</th>
                      <th className="p-3">Moyenne Courante (/50)</th>
                      <th className="p-3 text-right">Appréciation conseil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {assignedStudents
                      .filter(s => s.className === selectedClass || (!s.className && selectedClass.includes("6ème")))
                      .map((std) => (
                        <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{std.fullName}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={editingStudentScores[std.id] || ""}
                              onChange={(e) => setEditingStudentScores({ ...editingStudentScores, [std.id]: e.target.value })}
                              className="w-16 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 rounded font-bold text-center"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-[10px] text-slate-400 italic">Généré automatiquement par le système</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
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

              <form onSubmit={handleCreateHomework} className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Titre du Devoir</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Devoir de géométrie - Triangles"
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
                {homeworks.map((hw) => (
                  <div key={hw.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{hw.title}</span>
                      <span className="text-[10px] text-slate-500">{hw.course} • {hw.className} • À rendre le {hw.deadline}</span>
                    </div>
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {hw.submissionsCount} réponse(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BANQUE DE QUESTIONS */}
          {activeSubTab === "banque" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Banque de Questions d'Évaluation</h3>
                <p className="text-slate-500 text-[10px]">Générez des questions à choix multiples (QCM) ou ouvertes pour vos interrogations.</p>
              </div>

              <form onSubmit={handleAddQuestion} className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                      placeholder="Ex: B ou Vrai ou Valeur exacte"
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
                {questionBank.map((q) => (
                  <div key={q.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{q.type}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Réponse : {q.correct}</span>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{q.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CORRECTION */}
          {activeSubTab === "correction" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Correction & Validation des Devoirs</h3>
                <p className="text-slate-500 text-[10px]">Notez et annotez les travaux rendus par vos élèves.</p>
              </div>

              <div className="space-y-3">
                {studentSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{sub.studentName}</span>
                      <span className="text-[10px] text-slate-500">{sub.homeworkTitle}</span>
                    </div>
                    <p className="text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border text-slate-700 dark:text-slate-300">{sub.text}</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Note /20"
                        defaultValue={sub.score}
                        id={`score-${sub.id}`}
                        className="w-24 p-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Commentaire pédagogique..."
                        defaultValue={sub.comments}
                        id={`comm-${sub.id}`}
                        className="flex-1 p-2 rounded-xl border bg-white dark:bg-slate-900"
                      />
                      <button
                        onClick={() => {
                          const sc = (document.getElementById(`score-${sub.id}`) as HTMLInputElement)?.value;
                          const cm = (document.getElementById(`comm-${sub.id}`) as HTMLInputElement)?.value;
                          handleGradeSubmission(sub.id, sc, cm);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shrink-0"
                      >
                        Valider la Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLASSE VIRTUELLE */}
          {activeSubTab === "classe_virtuelle" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Mur Virtuel de la Classe</h3>
                <p className="text-slate-500 text-[10px]">Publiez des annonces et consignes visibles directement par les élèves et leurs parents.</p>
              </div>

              <form onSubmit={handleAddAnnouncement} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Écrire un message ou une annonce officielle..."
                  value={newAnnounceText}
                  onChange={(e) => setNewAnnounceText(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  <span>Publier</span>
                </button>
              </form>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold text-indigo-600">{ann.author}</span>
                      <span>{ann.date}</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{ann.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
