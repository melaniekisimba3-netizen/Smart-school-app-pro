import React, { useState, useMemo } from "react";
import { PrintPreviewModal, PrintableDocumentType } from "./PrintPreviewModal";
import { 
  User, 
  Image as ImageIcon, 
  CreditCard, 
  Award, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Bell, 
  BookOpen, 
  HelpCircle, 
  MessageSquare, 
  Folder, 
  AlertTriangle, 
  Send, 
  Clock, 
  ShieldAlert,
  Printer, 
  Download, 
  Check, 
  Smartphone, 
  MapPin, 
  SmartphoneNfc, 
  Search, 
  Landmark 
} from "lucide-react";
import { motion } from "motion/react";
import { NationalCultureHeritageModule } from "./NationalCultureHeritageModule";
import { Student, Payment, Grade, Attendance, UserAccount } from "../types";
import { getStoredUniversalUserAccounts } from "../services/accountActivationService";
import { usePedagogicalTimetable } from "../context/PedagogicalTimetableContext";
import { PhotoUploadField } from "./common/PhotoUploadField";
import { saveUserProfilePhoto, getStoredProfilePhoto } from "../services/userPhotoService";

interface StudentModuleProps {
  userRole: string;
  userName: string;
  userEmail?: string;
  currentUserId?: string;
  currentUserAccount?: UserAccount | null;
  students?: Student[];
  payments?: Payment[];
  grades?: Grade[];
  attendances?: Attendance[];
  onNavigateToMessagerie?: (targetUserId?: string) => void;
}

export function StudentModule({ 
  userRole, 
  userName, 
  userEmail,
  currentUserId,
  currentUserAccount,
  students = [], 
  payments = [], 
  grades = [],
  attendances: globalAttendances = [],
  onNavigateToMessagerie 
}: StudentModuleProps) {
  const { timetableEntries, classJournalEntries } = usePedagogicalTimetable();
  const [activeSubTab, setActiveSubTab] = useState<string>("profil");
  const [printModal, setPrintModal] = useState<{ docType: PrintableDocumentType; data: any; title?: string } | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingMessage, setReportingMessage] = useState("");
  const [reportedSuccessfully, setReportedSuccessfully] = useState(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState("");
  
  // Local states for custom interactive homework / exercises
  const [homeworkReplies, setHomeworkReplies] = useState<{ [key: string]: { text: string; fileAttached: string | null; submitted: boolean } }>({
    "hw-1": { text: "", fileAttached: null, submitted: false },
    "hw-2": { text: "Réponse envoyée pour l'exercice de Physique", fileAttached: "exercice_resolu_physique.pdf", submitted: true }
  });

  const [exerciseReplies, setExerciseReplies] = useState<{ [key: string]: { answers: { [key: number]: string }; submitted: boolean } }>({
    "ex-1": { answers: {}, submitted: false }
  });

  // Chat/Internal Message States
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: "m1", sender: "Ir IT Fred Kalonda", role: "Enseignant", text: "N'oubliez pas de soumettre vos devoirs de Physique avant ce soir à 23h59.", time: "09:00", reported: false },
    { id: "m2", sender: "Mlle Astrid Mutombo", role: "Élève (Classe)", text: "Bonjour, est-ce que quelqu'un a compris l'exercice 4 de Mathématiques ?", time: "10:15", reported: false },
    { id: "m3", sender: "Vous", role: "Élève", text: "Oui Astrid, il faut appliquer le théorème de Pythagore.", time: "10:18", reported: false }
  ]);
  const [newChatText, setNewChatText] = useState("");

  // Photo management state
  const [persistedPhoto, setPersistedPhoto] = useState<string>("");
  const [stagedStudentPhoto, setStagedStudentPhoto] = useState<string>("");
  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState<boolean>(false);
  const [photoFeedback, setPhotoFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Resolving the authenticated student dynamically from Firebase UID / currentUserId / username / email
  const resolvedStudent = useMemo(() => {
    // 1. Direct match by currentUserId (matching student ID, registration number or authUid)
    if (currentUserId) {
      const match = students.find(
        s => s.id === currentUserId ||
             s.registrationNumber?.toLowerCase() === currentUserId.toLowerCase() ||
             (s as any).firebaseUid === currentUserId ||
             (s as any).authUid === currentUserId ||
             (s as any).dossierId === currentUserId
      );
      if (match) return match;
    }

    // 2. Direct match by currentUserAccount
    if (currentUserAccount) {
      if (currentUserAccount.dossierId) {
        const match = students.find(s => s.id === currentUserAccount.dossierId);
        if (match) return match;
      }
      if (currentUserAccount.username) {
        const match = students.find(
          s => s.registrationNumber?.toLowerCase() === currentUserAccount.username.toLowerCase() ||
               s.id.toLowerCase() === currentUserAccount.username.toLowerCase()
        );
        if (match) return match;
      }
    }

    // 3. Match from universal user accounts repository
    try {
      const stored = getStoredUniversalUserAccounts();
      const matchedAcc = stored.find(
        a => (currentUserId && (a.id === currentUserId || a.dossierId === currentUserId || a.firebaseUid === currentUserId)) ||
             (userEmail && (a.username?.toLowerCase() === userEmail.toLowerCase() || a.email?.toLowerCase() === userEmail.toLowerCase())) ||
             (userName && a.fullName?.toLowerCase() === userName.toLowerCase()) ||
             (userName && a.username?.toLowerCase() === userName.toLowerCase())
      );
      if (matchedAcc && matchedAcc.dossierId) {
        const byDossier = students.find(s => s.id === matchedAcc.dossierId);
        if (byDossier) return byDossier;
      }
    } catch {
      // ignore
    }

    // 4. Match by email or matricule in userEmail
    if (userEmail) {
      const cleanEmail = userEmail.toLowerCase().trim();
      const byEmail = students.find(
        s => s.registrationNumber?.toLowerCase() === cleanEmail ||
             s.id.toLowerCase() === cleanEmail ||
             (s as any).email?.toLowerCase() === cleanEmail ||
             s.parentEmail?.toLowerCase() === cleanEmail ||
             `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@smartschool.cd` === cleanEmail ||
             `${s.lastName.toLowerCase()}.${s.firstName.toLowerCase()}@smartschool.cd` === cleanEmail
      );
      if (byEmail) return byEmail;
    }

    // 5. Match by userName (permutations: "Mukendi Christian", "Christian Mukendi", "MUKENDI Christian")
    if (userName && userName.trim()) {
      const cleanName = userName.toLowerCase().trim();
      
      const byReg = students.find(
        s => s.registrationNumber?.toLowerCase() === cleanName || 
             s.id.toLowerCase() === cleanName
      );
      if (byReg) return byReg;

      // Full Name exact matches
      const byFullName = students.find(s => {
        const n1 = `${s.lastName} ${s.firstName}`.toLowerCase();
        const n2 = `${s.firstName} ${s.lastName}`.toLowerCase();
        const n3 = `${s.lastName} ${s.postName || ''} ${s.firstName}`.toLowerCase().replace(/\s+/g, ' ').trim();
        const n4 = `${s.firstName} ${s.lastName} ${s.postName || ''}`.toLowerCase().replace(/\s+/g, ' ').trim();
        return n1 === cleanName || n2 === cleanName || n3 === cleanName || n4 === cleanName;
      });
      if (byFullName) return byFullName;

      // Both first and last name present in cleanName
      const byBoth = students.find(s => {
        const last = s.lastName.toLowerCase();
        const first = s.firstName.toLowerCase();
        return cleanName.includes(last) && cleanName.includes(first);
      });
      if (byBoth) return byBoth;

      // Last name match if unique
      const byLast = students.filter(s => cleanName.includes(s.lastName.toLowerCase()));
      if (byLast.length === 1) return byLast[0];

      // First name match if unique
      const byFirst = students.filter(s => cleanName.includes(s.firstName.toLowerCase()));
      if (byFirst.length === 1) return byFirst[0];
    }

    return null;
  }, [currentUserId, currentUserAccount, userEmail, userName, students]);

  // Construct complete normalized student profile object from authenticated identity
  const studentInfo = useMemo(() => {
    if (resolvedStudent) {
      return {
        id: resolvedStudent.registrationNumber || resolvedStudent.id,
        rawId: resolvedStudent.id,
        firstName: resolvedStudent.firstName,
        lastName: resolvedStudent.lastName,
        postName: resolvedStudent.postName || "",
        photoUrl: (resolvedStudent as any).photoUrl || (resolvedStudent.gender === "F"
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
          : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop"),
        className: resolvedStudent.className || "",
        optionName: resolvedStudent.optionName || "",
        birthDate: resolvedStudent.birthDate || "",
        birthPlace: (resolvedStudent as any).birthPlace || "",
        gender: resolvedStudent.gender || "M",
        nationality: (resolvedStudent as any).nationality || "Congolaise (RDC)",
        address: resolvedStudent.address || "",
        parentName: resolvedStudent.parentName || "",
        parentPhone: resolvedStudent.parentPhone || "",
        email: (resolvedStudent as any).email || ""
      };
    }

    // Dynamic profile strictly mirroring the authenticated user's actual credentials
    const cleanAuthName = (userName || "Élève SmartSchool").trim();
    const parts = cleanAuthName.split(" ");
    const fName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    const lName = parts.length > 1 ? parts.slice(0, -1).join(" ") : cleanAuthName;

    return {
      id: currentUserId || "",
      rawId: currentUserId || "std-user",
      firstName: fName,
      lastName: lName,
      postName: "",
      photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
      className: "",
      optionName: "",
      birthDate: "",
      birthPlace: "",
      gender: "M" as const,
      nationality: "Congolaise (RDC)",
      address: "",
      parentName: "",
      parentPhone: "",
      email: userEmail || ""
    };
  }, [resolvedStudent, userName, userEmail, currentUserId]);

  // Sync photo with persistent storage & events
  React.useEffect(() => {
    const targetId = studentInfo.id || studentInfo.rawId || currentUserId || userName;
    const initialPhoto = getStoredProfilePhoto(targetId, studentInfo.photoUrl || "");
    setPersistedPhoto(initialPhoto);
    setStagedStudentPhoto(initialPhoto);

    const handlePhotoUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ targetId: string; photoUrl: string }>;
      if (customEvent.detail && (
        customEvent.detail.targetId === studentInfo.id || 
        customEvent.detail.targetId === studentInfo.rawId ||
        customEvent.detail.targetId === currentUserId
      )) {
        setPersistedPhoto(customEvent.detail.photoUrl);
        setStagedStudentPhoto(customEvent.detail.photoUrl);
      }
    };

    window.addEventListener("smartschool_photo_updated", handlePhotoUpdated);
    return () => {
      window.removeEventListener("smartschool_photo_updated", handlePhotoUpdated);
    };
  }, [studentInfo.id, studentInfo.rawId, currentUserId, studentInfo.photoUrl]);

  const effectivePhoto = persistedPhoto || studentInfo.photoUrl;

  const handleSaveStudentPhoto = async () => {
    const targetId = studentInfo.id || studentInfo.rawId || currentUserId || userName;
    setIsSavingPhoto(true);
    try {
      await saveUserProfilePhoto({
        targetId,
        photoUrl: stagedStudentPhoto,
        schoolId: "sch-141992",
        role: "Élève",
        actorName: `${studentInfo.lastName} ${studentInfo.firstName}`
      });
      setPersistedPhoto(stagedStudentPhoto);
      setIsEditingPhoto(false);
      setPhotoFeedback({ text: "Votre photo de profil a été enregistrée avec succès !", type: "success" });
      setTimeout(() => setPhotoFeedback(null), 4000);
    } catch (err: any) {
      setPhotoFeedback({ text: err.message || "Erreur lors de l'enregistrement de la photo.", type: "error" });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleDeleteStudentPhoto = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer votre photo de profil ?")) return;
    const targetId = studentInfo.id || studentInfo.rawId || currentUserId || userName;
    setIsSavingPhoto(true);
    try {
      await saveUserProfilePhoto({
        targetId,
        photoUrl: "",
        schoolId: "sch-141992",
        role: "Élève",
        actorName: `${studentInfo.lastName} ${studentInfo.firstName}`
      });
      setStagedStudentPhoto("");
      setPersistedPhoto("");
      setIsEditingPhoto(false);
      setPhotoFeedback({ text: "Photo de profil supprimée.", type: "success" });
      setTimeout(() => setPhotoFeedback(null), 4000);
    } catch (err: any) {
      setPhotoFeedback({ text: "Erreur lors de la suppression.", type: "error" });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Payments filtered specifically for this student
  const studentPayments = useMemo(() => {
    const matched = payments.filter(
      p => p.studentId === studentInfo.rawId || 
           p.studentId === studentInfo.id ||
           p.studentName?.toLowerCase().includes(studentInfo.lastName.toLowerCase()) ||
           p.studentName?.toLowerCase().includes(studentInfo.firstName.toLowerCase())
    );

    if (matched.length > 0) {
      return matched.map(p => ({
        id: p.id,
        feeType: p.paymentType || "Minerval Trimestriel",
        amount: p.amount,
        currency: p.currency || "USD",
        date: p.createdAt ? p.createdAt.split(" ")[0] : "05/09/2025",
        method: p.paymentMethod || "M-Pesa Mobile Money",
        status: p.isValidated ? "Validé" : "En attente"
      }));
    }

    return [
      { id: "PAI-9011", feeType: "Minerval - 1er Trimestre", amount: 150, currency: "USD", date: "05/09/2025", method: "M-Pesa Mobile Money", status: "Validé" },
      { id: "PAI-9042", feeType: "Frais d'Examen & Laboratoire", amount: 45, currency: "USD", date: "15/12/2025", method: "Cash Caisse", status: "Validé" },
      { id: "PAI-9109", feeType: "Minerval - 2ème Trimestre", amount: 150, currency: "USD", date: "22/02/2026", method: "Orange Money", status: "Validé" }
    ];
  }, [payments, studentInfo]);

  // Notes/Grades filtered specifically for this student
  const studentGrades = useMemo(() => {
    const matched = grades.filter(
      g => g.studentId === studentInfo.rawId || 
           g.studentId === studentInfo.id ||
           g.studentName?.toLowerCase().includes(studentInfo.lastName.toLowerCase())
    );

    if (matched.length > 0) {
      return matched.map(g => ({
        course: g.subjectName || "Matière",
        examScore: `${Math.round(g.scoreObtained * 4)}/40`,
        periodicScore: `${g.scoreObtained}/${g.maxScore}`,
        teacher: g.recordedBy || "Professeur"
      }));
    }

    return [
      { course: "Mathématiques", examScore: "45/50", periodicScore: "38/40", teacher: "M. Mukendi" },
      { course: "Physique Chimie", examScore: "39/50", periodicScore: "35/40", teacher: "Mme Nabintu" },
      { course: "Langue Française", examScore: "42/50", periodicScore: "37/40", teacher: "M. Mwamba" },
      { course: "Histoire de la RDC", examScore: "48/50", periodicScore: "39/40", teacher: "M. Kalonda" },
      { course: "Technologie & Informatique", examScore: "44/50", periodicScore: "36/40", teacher: "Ir IT Fred Kalonda" }
    ];
  }, [grades, studentInfo]);

  // Bulletins personalized for this student
  const bulletins = useMemo(() => [
    { id: `BUL-${studentInfo.id}-T1`, term: "1er Trimestre - Consolidé", status: "Publié", releaseDate: "18/12/2025", globalRate: "84.5%", decision: "Excellent" },
    { id: `BUL-${studentInfo.id}-T2`, term: "2ème Trimestre - Consolidé", status: "Publié", releaseDate: "02/04/2026", globalRate: "82.1%", decision: "Félicitations" },
    { id: `BUL-${studentInfo.id}-T3`, term: "3ème Trimestre - En cours", status: "En cours d'édition", releaseDate: "Fin d'année", globalRate: "-", decision: "-" }
  ], [studentInfo]);

  // Attendances filtered specifically for this student
  const attendances = useMemo(() => {
    const matched = globalAttendances.filter(
      a => a.studentId === studentInfo.rawId || 
           a.studentId === studentInfo.id ||
           a.studentName?.toLowerCase().includes(studentInfo.lastName.toLowerCase())
    );

    if (matched.length > 0) {
      return matched.map(a => ({
        date: a.date,
        status: a.status,
        comment: a.isJustified ? "Justifié par tuteur" : (a.status === "Présent" ? "À l'heure" : "Non justifié")
      }));
    }

    return [
      { date: "30/06/2026", status: "Présent", comment: "À l'heure" },
      { date: "29/06/2026", status: "Présent", comment: "À l'heure" },
      { date: "28/06/2026", status: "Absent Justifié", comment: "Rendez-vous médical certifié" },
      { date: "27/06/2026", status: "Présent", comment: "À l'heure" },
      { date: "26/06/2026", status: "Présent", comment: "À l'heure" },
    ];
  }, [globalAttendances, studentInfo]);

  // Devoirs / Homework
  const activeHomeworks = [
    { id: "hw-1", title: "Exercices de structure atomique", course: "Physique Chimie", deadline: "02/07/2026", maxPoints: "20 pts", file: "chimie_devoir_instructions.pdf" },
    { id: "hw-2", title: "Dissertation philosophique", course: "Philosophie & Citoyenneté", deadline: "28/06/2026", maxPoints: "10 pts", file: "dissert_instructions.pdf" }
  ];

  // Exercises
  const activeExercises = [
    { 
      id: "ex-1", 
      title: "QCM d'auto-évaluation sur l'histoire de la RDC", 
      course: "Histoire", 
      deadline: "03/07/2026",
      questions: [
        { id: 1, type: "qcm", text: "En quelle année la RDC a-t-elle obtenu son indépendance ?", options: ["A) 1959", "B) 1960", "C) 1965"], correct: "B" },
        { id: 2, type: "vrai_faux", text: "Le fleuve Congo est le plus long fleuve du monde.", options: ["Vrai", "Faux"], correct: "Faux" }
      ]
    }
  ];

  // School calendar
  const calendarEvents = [
    { title: "Début des examens du 3ème Trimestre", date: "05/07/2026", type: "academic" },
    { title: "Clôture de l'année scolaire RDC", date: "12/07/2026", type: "event" },
    { title: "Remise officielle des bulletins nationaux", date: "15/07/2026", type: "release" }
  ];

  const handleSendMessage = () => {
    if (!newChatText.trim()) return;
    const msg = {
      id: "m_new_" + Date.now(),
      sender: "Vous",
      role: "Élève",
      text: newChatText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reported: false
    };
    setChatMessages([...chatMessages, msg]);
    setNewChatText("");
  };

  const handleReportMessage = (msgId: string) => {
    setChatMessages(chatMessages.map(m => m.id === msgId ? { ...m, reported: true } : m));
    setReportModalOpen(true);
    setReportedSuccessfully(true);
    setTimeout(() => {
      setReportedSuccessfully(false);
      setReportModalOpen(false);
    }, 2000);
  };

  const submitHomework = (hwId: string) => {
    setHomeworkReplies({
      ...homeworkReplies,
      [hwId]: { ...homeworkReplies[hwId], submitted: true }
    });
  };

  const handleQcmAnswer = (exId: string, qId: number, option: string) => {
    const currentEx = exerciseReplies[exId] || { answers: {}, submitted: false };
    setExerciseReplies({
      ...exerciseReplies,
      [exId]: {
        ...currentEx,
        answers: { ...currentEx.answers, [qId]: option }
      }
    });
  };

  const submitExercise = (exId: string) => {
    setExerciseReplies({
      ...exerciseReplies,
      [exId]: { ...exerciseReplies[exId], submitted: true }
    });
  };

  // Nav categories for student workspace
  const studentTabs = [
    { id: "profil", label: "Mon Profil", icon: User },
    { id: "horaire", label: "Emploi du Temps", icon: Calendar },
    { id: "journal_classe", label: "Journal de Classe", icon: FileText },
    { id: "carte", label: "Carte Scolaire", icon: CreditCard },
    { id: "notes", label: "Mes Notes", icon: Award },
    { id: "bulletins", label: "Mes Bulletins", icon: FileText },
    { id: "presences", label: "Mes Présences", icon: CheckCircle2 },
    { id: "paiements", label: "Mes Paiements", icon: DollarSign },
    { id: "devoirs", label: "Devoirs & Exercices", icon: BookOpen },
    { id: "annuaire", label: "Annuaire & Recherche", icon: Search },
    { id: "messagerie", label: "Ma Messagerie", icon: MessageSquare },
    { id: "documents", label: "Supports de Cours", icon: Folder },
    { id: "patrimoine_rdc", label: "Patrimoine & Culture RDC", icon: Landmark },
    { id: "calendrier", label: "Calendrier", icon: Calendar },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs text-left font-sans">
      
      {/* 1. Left Nav list (mobile scrollable, desktop sidebar) */}
      <div className="lg:col-span-1 space-y-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-xs text-center space-y-3">
          <div className="relative inline-block group">
            {effectivePhoto ? (
              <img 
                src={effectivePhoto} 
                alt="Profil" 
                className="h-16 w-16 rounded-full mx-auto border-2 border-indigo-600 object-cover shadow-xs" 
              />
            ) : (
              <div className="h-16 w-16 rounded-full mx-auto border-2 border-indigo-600 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-black text-xl text-indigo-600">
                {studentInfo.firstName[0]}
              </div>
            )}
            <span className="absolute bottom-0 right-0 h-4.5 w-4.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black">
              ✓
            </span>
          </div>
          <div>
            <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-none">{studentInfo.firstName} {studentInfo.lastName}</h4>
            <p className="text-[10px] text-slate-500 mt-1 font-mono font-bold uppercase">{studentInfo.className} • {studentInfo.optionName}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("profil");
              setIsEditingPhoto(true);
            }}
            className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Modifier ma photo</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-2.5 rounded-2xl shadow-xs space-y-1">
          {studentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main content display box */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* Dynamic Panel Renderer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          
          {/* CULTURES & PATRIMOINE RDC TAB */}
          {activeSubTab === "patrimoine_rdc" && (
            <NationalCultureHeritageModule userRole={userRole} userName={userName} userPortal="eleve" />
          )}

          {/* PROFILE TAB */}
          {activeSubTab === "profil" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Informations personnelles de l'Élève</h3>
                  <p className="text-slate-500 text-[10px]">Profil confidentiel vérifié et certifié par la direction.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>{isEditingPhoto ? "Fermer l'éditeur photo" : "Modifier ma photo de profil"}</span>
                </button>
              </div>

              {/* Toast Feedback */}
              {photoFeedback && (
                <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  photoFeedback.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  <span>{photoFeedback.text}</span>
                  <button onClick={() => setPhotoFeedback(null)} className="text-xs">✕</button>
                </div>
              )}

              {/* Interactive Photo Editor Section */}
              {isEditingPhoto && (
                <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-indigo-600" />
                      Modifier votre photo de profil (Depuis la galerie)
                    </h4>
                    <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300">
                      ID: {studentInfo.id}
                    </span>
                  </div>

                  <PhotoUploadField
                    label="Choisir une photo"
                    value={stagedStudentPhoto}
                    onChange={(photo) => setStagedStudentPhoto(photo)}
                    helperText="Sélectionnez une photo nette de votre visage depuis la galerie de votre appareil."
                    previewSize="md"
                    allowDelete={true}
                    id="student-module-photo-upload"
                  />

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveStudentPhoto}
                      disabled={isSavingPhoto || (!stagedStudentPhoto && stagedStudentPhoto === persistedPhoto)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      {isSavingPhoto ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      <span>Enregistrer ma photo</span>
                    </button>

                    {persistedPhoto && (
                      <button
                        type="button"
                        onClick={handleDeleteStudentPhoto}
                        disabled={isSavingPhoto}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        Supprimer
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setStagedStudentPhoto(persistedPhoto);
                        setIsEditingPhoto(false);
                      }}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Nom & Prénom</span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold">{studentInfo.lastName} {studentInfo.firstName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Identifiant national RDC</span>
                  <p className="text-slate-800 dark:text-slate-200 font-mono font-bold">{studentInfo.id}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Classe d'affectation</span>
                  <p className="text-indigo-600 dark:text-indigo-400 font-black">{studentInfo.className}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Option académique</span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold">{studentInfo.optionName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Date de naissance</span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold">{studentInfo.birthDate} ({studentInfo.birthPlace})</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Nationalité</span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold">{studentInfo.nationality}</p>
                </div>
                <div className="space-y-1 col-span-1 md:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-black">Adresse du domicile</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{studentInfo.address}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border space-y-2">
                <span className="text-[10px] text-indigo-600 font-black uppercase block tracking-wider">Parents et contact de secours</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Responsable légal :</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{studentInfo.parentName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Numéro d'appel :</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{studentInfo.parentPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHOOL CARD TAB */}
          {activeSubTab === "carte" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Carte d'Identité Scolaire Numérique</h3>
                <p className="text-slate-500 text-[10px]">Carte de conformité légale sécurisée par puce NFC et code QR unique.</p>
              </div>

              {/* School Card Preview */}
              <div className="max-w-md mx-auto bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black uppercase text-brand-green">Souveraineté Nationale RDC</h4>
                    <p className="text-[9px] text-slate-400 uppercase">Ministère de l'Enseignement Primaire (EPST)</p>
                  </div>
                  <SmartphoneNfc className="h-6 w-6 text-emerald-400" />
                </div>

                <div className="flex space-x-4">
                  {effectivePhoto ? (
                    <img 
                      src={effectivePhoto} 
                      alt="Photo" 
                      className="h-20 w-20 rounded-xl border border-white/20 object-cover shrink-0" 
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-xl border border-white/20 bg-indigo-900/60 flex items-center justify-center font-black text-2xl text-white shrink-0">
                      {studentInfo.firstName[0]}
                    </div>
                  )}
                  <div className="space-y-2 text-left min-w-0">
                    <div>
                      <span className="text-[7px] text-slate-400 uppercase block leading-none">ÉLÈVE</span>
                      <p className="font-bold text-xs truncate leading-tight uppercase text-slate-100">{studentInfo.lastName}</p>
                      <p className="font-bold text-[10px] truncate text-slate-300">{studentInfo.firstName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[8px] leading-tight">
                      <div>
                        <span className="text-slate-400 uppercase block">CLASSE</span>
                        <p className="font-black text-brand-green">{studentInfo.className}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase block">OPTION</span>
                        <p className="font-black text-slate-200">{studentInfo.optionName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                  <div className="text-[8px] font-mono text-slate-400">
                    <span>ID : </span>
                    <span className="font-bold text-white">{studentInfo.id}</span>
                  </div>
                  <span className="bg-brand-green/20 text-brand-green border border-brand-green/30 px-2 py-0.5 rounded text-[8px] font-bold">
                    VALIDÉ ACADÉMIQUE
                  </span>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setPrintModal({
                    docType: "carte_eleve",
                    data: {
                      studentName: `${studentInfo.lastName} ${studentInfo.firstName}`,
                      className: studentInfo.className,
                      matricule: studentInfo.id,
                      schoolYear: "2026-2027"
                    },
                    title: `Carte d'Élève CR-80 - ${studentInfo.lastName} ${studentInfo.firstName}`
                  })}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer inline-flex items-center space-x-1.5 shadow-md"
                >
                  <Printer className="h-4 w-4" />
                  <span>Aperçu & Imprimer Carte CR-80</span>
                </button>
              </div>
            </div>
          )}

          {/* NOTES & EVALUATIONS */}
          {activeSubTab === "notes" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Relevé de Notes Courant</h3>
                <p className="text-slate-500 text-[10px]">Notes des interrogations, examens et travaux dirigés.</p>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b text-slate-500 font-bold">
                      <th className="p-3">Matière / Cours</th>
                      <th className="p-3">Interro / Continu</th>
                      <th className="p-3">Examen final</th>
                      <th className="p-3">Enseignant responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentGrades.map((grade, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{grade.course}</td>
                        <td className="p-3 font-bold text-emerald-600">{grade.periodicScore}</td>
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{grade.examScore}</td>
                        <td className="p-3 text-slate-500">{grade.teacher}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BULLETINS */}
          {activeSubTab === "bulletins" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Bulletins Trimestriels Officiels</h3>
                <p className="text-slate-500 text-[10px]">Téléchargement sécurisé des carnets de cotes trimestriels validés par l'Inspection.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bulletins.map((b) => (
                  <div key={b.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50/40 dark:bg-slate-950/20">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase font-mono">{b.id}</span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{b.term}</h4>
                      <p className="text-slate-500 text-[10px]">Publié le : {b.releaseDate}</p>
                      {b.globalRate !== "-" && (
                        <div className="mt-2 text-xs font-black text-emerald-600">
                          Moyenne Générale : {b.globalRate} ({b.decision})
                        </div>
                      )}
                    </div>

                    {b.status === "Publié" ? (
                      <button 
                        onClick={() => setPrintModal({
                          docType: "bulletin_epst",
                          data: {
                            studentName: `${studentInfo.lastName} ${studentInfo.firstName}`,
                            className: studentInfo.className,
                            bulletin: { term: b.term, globalRate: b.globalRate, decision: b.decision }
                          },
                          title: `Bulletin - ${b.term}`
                        })}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Imprimer</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">En cours d'édition</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRESENCES */}
          {activeSubTab === "presences" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Registre des Présences Personnel</h3>
                <p className="text-slate-500 text-[10px]">Historique d'assiduité enregistré lors de l'appel matinal souverain.</p>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b text-slate-500 font-bold">
                      <th className="p-3">Date de l'appel</th>
                      <th className="p-3">Statut d'assiduité</th>
                      <th className="p-3">Remarques & Justifications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {attendances.map((att, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-500">{att.date}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase ${
                            att.status === "Présent" 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400" 
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400"
                          }`}>
                            {att.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">{att.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TIMETABLE / HORAIRE */}
          {activeSubTab === "horaire" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Mon Emploi du Temps Officiel ({studentInfo.className})</h3>
                <p className="text-slate-500 text-[10px]">Heures de cours, enseignants et locaux affectés synchronisés avec la direction des études.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((day, dIdx) => {
                  const dayEntries = timetableEntries.filter(
                    t => (t.className.toLowerCase() === studentInfo.className.toLowerCase() ||
                          t.className.toLowerCase().includes(studentInfo.className.toLowerCase().slice(0, 3))) &&
                         t.day.toLowerCase() === day.toLowerCase()
                  );

                  return (
                    <div key={dIdx} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-left">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 border-b pb-1.5 uppercase tracking-wider">{day}</h4>
                      <div className="space-y-2">
                        {dayEntries.length > 0 ? (
                          dayEntries.map((entry) => (
                            <div key={entry.id} className="p-2.5 bg-white dark:bg-slate-900 border rounded-xl space-y-1 shadow-2xs">
                              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold block">{entry.period}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">{entry.subjectName}</span>
                              <div className="text-[10px] text-slate-500">
                                <span>{entry.isSubstituted ? `Rempl.: ${entry.substituteTeacherName}` : entry.teacherName}</span>
                                <span className="block text-slate-400 font-mono text-[9px]">{entry.room || "Salle standard"}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-400 text-[10px] italic">
                            Aucun cours prévu
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* JOURNAL DE CLASSE QUOTIDIEN */}
          {activeSubTab === "journal_classe" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Journal de Classe & Cahier de Textes</h3>
                <p className="text-slate-500 text-[10px]">Consultez les notions enseignées le jour même, devoirs à domicile et signatures de visa.</p>
              </div>

              <div className="space-y-4">
                {classJournalEntries
                  .filter(j => j.className.toLowerCase() === studentInfo.className.toLowerCase() ||
                               j.className.toLowerCase().includes(studentInfo.className.toLowerCase().slice(0, 3)))
                  .map((entry) => (
                    <div key={entry.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            {entry.subjectName}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {entry.lessonTopic}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{entry.date}</span>
                          <span>•</span>
                          <span>{entry.period}</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1.5 text-xs">
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold">Objectif opérationnel :</strong>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">{entry.operationalObjective}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold">Résumé de la matière :</strong>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">{entry.summaryContent}</p>
                        </div>
                      </div>

                      {entry.homeworkAssigned && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-1 text-amber-900 dark:text-amber-200">
                          <div className="font-bold text-[11px] flex items-center justify-between">
                            <span>Devoir à domicile consigné :</span>
                            <span className="text-[10px] font-mono">Pour le : {entry.homeworkDueDate || "Prochain cours"}</span>
                          </div>
                          <p className="text-xs">{entry.homeworkAssigned}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span>Enseignant : <strong>{entry.teacherName}</strong></span>
                        <span className={entry.directorVisa ? "text-emerald-600 font-bold" : "text-slate-400"}>
                          {entry.directorVisa ? `✓ Visé par la Direction (${entry.directorVisaDate})` : "En attente du visa direction"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {activeSubTab === "paiements" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Relevé de mes Règlement de Frais</h3>
                <p className="text-slate-500 text-[10px]">Suivi des paiements effectués par vos parents avec historique détaillé.</p>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b text-slate-500 font-bold">
                      <th className="p-3">Type de frais</th>
                      <th className="p-3">Montant acquitté</th>
                      <th className="p-3">Date du versement</th>
                      <th className="p-3">Méthode de règlement</th>
                      <th className="p-3">Statut administratif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentPayments.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{p.feeType}</td>
                        <td className="p-3 font-black text-indigo-600 font-mono">{p.amount} {p.currency}</td>
                        <td className="p-3 font-mono text-slate-500">{p.date}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{p.method}</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DEVOIRS & EXERCICES */}
          {activeSubTab === "devoirs" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Devoirs à Soumettre & Exercices</h3>
                <p className="text-slate-500 text-[10px]">Rendez vos devoirs à temps et auto-évaluez vous avec les exercices interactifs.</p>
              </div>

              {/* Homeworks section */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-1.5 uppercase">Travaux Pratiques & Devoirs</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeHomeworks.map((hw) => {
                    const status = homeworkReplies[hw.id];
                    return (
                      <div key={hw.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 space-y-3.5">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                              {hw.course}
                            </span>
                            <h5 className="font-bold text-slate-800 dark:text-slate-200">{hw.title}</h5>
                          </div>
                          <span className="text-[10px] font-bold text-rose-600">Max : {hw.maxPoints}</span>
                        </div>

                        <div className="text-[11px] text-slate-500 font-medium">
                          Date limite : <span className="font-bold text-slate-700 dark:text-slate-300">{hw.deadline}</span>
                        </div>

                        {/* Actions submission */}
                        {status?.submitted ? (
                          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl flex items-center space-x-2 text-[11px]">
                            <Check className="h-4 w-4 shrink-0" />
                            <span>Devoir correctement soumis au professeur</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <textarea
                              placeholder="Écrivez vos réponses ici ou attachez des pièces jointes..."
                              value={status?.text || ""}
                              onChange={(e) => {
                                setHomeworkReplies({
                                  ...homeworkReplies,
                                  [hw.id]: { ...status, text: e.target.value }
                                });
                              }}
                              className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 rounded-xl text-xs"
                            />
                            <div className="flex justify-between items-center">
                              <button 
                                onClick={() => {
                                  setHomeworkReplies({
                                    ...homeworkReplies,
                                    [hw.id]: { ...status, fileAttached: "devoir_resolu.pdf" }
                                  });
                                }}
                                className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                              >
                                {status?.fileAttached ? `✓ ${status.fileAttached}` : "+ Attacher un document PDF"}
                              </button>
                              <button
                                onClick={() => submitHomework(hw.id)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer"
                              >
                                Envoyer le Devoir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Exercises section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-1.5 uppercase">Exercices interactifs QCM & Auto-évaluation</h4>
                {activeExercises.map((ex) => {
                  const reply = exerciseReplies[ex.id] || { answers: {}, submitted: false };
                  return (
                    <div key={ex.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-indigo-50/10 dark:bg-indigo-950/5 space-y-4">
                      <div>
                        <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                          {ex.course}
                        </span>
                        <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-1">{ex.title}</h5>
                        <p className="text-[10px] text-slate-400">Complétez l'exercice ci-dessous.</p>
                      </div>

                      {ex.questions.map((q) => (
                        <div key={q.id} className="space-y-2 p-3 bg-white dark:bg-slate-900 border rounded-xl">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{q.id}. {q.text}</p>
                          <div className="flex flex-wrap gap-2">
                            {q.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                disabled={reply.submitted}
                                onClick={() => handleQcmAnswer(ex.id, q.id, opt[0])}
                                className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                                  reply.answers[q.id] === opt[0]
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      {reply.submitted ? (
                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl space-y-1 text-left">
                          <span className="font-black">Exercice corrigé automatiquement !</span>
                          <p className="text-[10px]">Félicitations ! Vous avez complété avec succès l'auto-évaluation.</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => submitExercise(ex.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer"
                        >
                          Soumettre les Réponses de l'Exercice
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MESSAGERIE INTERNE & MODÉRATION */}
          {activeSubTab === "messagerie" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Messagerie Interne de la Classe</h3>
                <p className="text-slate-500 text-[10px]">
                  Discutez uniquement avec les élèves de votre classe. Toutes les conversations sont enregistrées pour garantir la conformité et la modération.
                </p>
              </div>

              {/* Chat Interface Box */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[350px] bg-slate-50/50 dark:bg-slate-950/20">
                
                {/* Chat Header */}
                <div className="p-3 bg-slate-100 dark:bg-slate-900 border-b flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Chat Canaux - {studentInfo.className}</span>
                  <span className="text-[10px] text-emerald-600 font-mono flex items-center space-x-1">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full inline-block"></span>
                    <span>Modération Active</span>
                  </span>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.map((msg) => {
                    const isMe = msg.sender === "Vous";
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-bold mb-0.5">
                          <span>{msg.sender} ({msg.role})</span>
                          <span>•</span>
                          <span>{msg.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 max-w-[80%] group">
                          <div className={`p-3 rounded-2xl ${
                            isMe 
                              ? "bg-indigo-600 text-white rounded-tr-none" 
                              : "bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 rounded-tl-none"
                          } ${msg.reported ? "opacity-50 line-through" : ""}`}>
                            <p>{msg.text}</p>
                            {msg.reported && (
                              <p className="text-[8px] text-rose-500 italic mt-1 font-bold">Message signalé pour modération</p>
                            )}
                          </div>
                          
                          {!isMe && !msg.reported && (
                            <button
                              onClick={() => handleReportMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition-opacity cursor-pointer"
                              title="Signaler ce message"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Footer Input */}
                <div className="p-3 bg-white dark:bg-slate-900 border-t flex gap-2">
                  <input
                    type="text"
                    placeholder="Tapez votre message..."
                    value={newChatText}
                    onChange={(e) => setNewChatText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    className="flex-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* COURSE DOCUMENTS TAB */}
          {activeSubTab === "documents" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Supports de Cours et Documents Pédagogiques</h3>
                <p className="text-slate-500 text-[10px]">Retrouvez les polycopiés, fiches de révision et ressources recommandés par vos enseignants.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded uppercase">Physique Chimie</span>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">Guide de cinématique linéaire</h5>
                    <p className="text-[10px] text-slate-400">PDF • 1.2 Mo • Publié le 20/06</p>
                  </div>
                  <button className="p-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg cursor-pointer">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded uppercase">Mathématiques</span>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">Algèbre et matrices de base</h5>
                    <p className="text-[10px] text-slate-400">PDF • 3.5 Mo • Publié le 18/06</p>
                  </div>
                  <button className="p-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg cursor-pointer">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ANNUAIRE & RECHERCHE DES ENSEIGNANTS ET CAMARADES */}
          {activeSubTab === "annuaire" && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <Search className="h-5 w-5 text-indigo-600" />
                  <span>Annuaire & Recherche de l'Établissement</span>
                </h3>
                <p className="text-slate-500 text-[10px]">
                  Recherchez vos enseignants, votre titulaire de classe, la direction ou vos camarades pour échanger ou demander de l'aide sur vos cours.
                </p>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute inset-y-0 left-3.5 h-4 w-4 text-slate-400 my-auto" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, cours ou rôle (ex: Titulaire, Physique, Camarade)..."
                  value={directorySearchQuery}
                  onChange={(e) => setDirectorySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Directory grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "stu-dir-1", name: "Ir IT Fred Kalonda", function: "Titulaire & Enseignant", course: "Informatique & Physique", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
                  { id: "stu-dir-2", name: "M. Mbuyi Tshilombo", function: "Préfet des Études", course: "Direction Pédagogique", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
                  { id: "stu-dir-3", name: "Mme. Marie Kasongo", function: "Enseignante", course: "Français & Littérature", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
                  { id: "stu-dir-4", name: "Kambale Christian", function: "Élève (Camarade)", course: "6ème Primaire • Délégué", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
                ]
                .filter(u => u.name.toLowerCase().includes(directorySearchQuery.toLowerCase()) || u.function.toLowerCase().includes(directorySearchQuery.toLowerCase()) || u.course.toLowerCase().includes(directorySearchQuery.toLowerCase()))
                .map(contact => (
                  <div key={contact.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between gap-3 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center space-x-3 min-w-0">
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.name} className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0">
                          {contact.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{contact.name}</h4>
                        <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">{contact.function}</p>
                        <p className="text-[9px] text-slate-400 truncate">{contact.course}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (onNavigateToMessagerie) {
                          onNavigateToMessagerie(contact.id);
                        } else {
                          setActiveSubTab("messagerie");
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-xl shrink-0 flex items-center space-x-1 shadow-xs cursor-pointer transition-transform hover:scale-105"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Discuter</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CALENDAR */}
          {activeSubTab === "calendrier" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Calendrier Académique</h3>
                <p className="text-slate-500 text-[10px]">Suivi des événements importants, vacances scolaires, et dates clés d'évaluation.</p>
              </div>

              <div className="space-y-3">
                {calendarEvents.map((ev, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900/60 flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded uppercase">
                        {ev.type === "academic" ? "Évaluation" : ev.type === "release" ? "Publication" : "Événement"}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{ev.title}</h4>
                    </div>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">{ev.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 rounded-2xl p-6 max-w-sm w-full border shadow-2xl text-center space-y-4">
            <ShieldAlert className="h-10 w-10 text-rose-600 mx-auto" />
            <h4 className="font-bold text-base">Message Signalé</h4>
            <p className="text-slate-500 text-xs">
              Ce message a été envoyé avec succès à l'équipe de modération de SmartSchool RDC et archivé de manière sécurisée dans le journal de surveillance de l'école.
            </p>
            <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-[10px] font-bold">
              ✓ Signalement enregistré avec succès.
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Engine Modal */}
      {printModal && (
        <PrintPreviewModal
          documentType={printModal.docType}
          data={printModal.data}
          onClose={() => setPrintModal(null)}
          title={printModal.title}
        />
      )}

    </div>
  );
}
