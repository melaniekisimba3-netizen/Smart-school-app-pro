import React, { useState, useEffect } from "react";
import { 
  Users, 
  Award, 
  FileText, 
  CheckCircle2, 
  BookOpen, 
  Download, 
  MessageSquare, 
  Bell, 
  Send, 
  Calendar,
  Check,
  ChevronRight,
  DollarSign,
  Printer,
  Sparkles,
  CreditCard,
  Smartphone,
  ShieldCheck,
  CheckCircle,
  Search,
  User,
  Building2,
  Landmark,
  AlertCircle,
  Clock,
  Info
} from "lucide-react";
import { PrintPreviewModal, PrintableDocumentType } from "./PrintPreviewModal";
import { getStudentSchedule } from "../utils/minervalSchedule";
import { NationalCultureHeritageModule } from "./NationalCultureHeritageModule";
import { MobileMoneyPaymentModal } from "./MobileMoneyPaymentModal";
import { usePedagogicalTimetable } from "../context/PedagogicalTimetableContext";
import { useSmartSchoolCore } from "../context/SmartSchoolCoreContext";
import { getStoredProfilePhoto } from "../services/userPhotoService";

interface ParentModuleProps {
  userRole: string;
  userName: string;
  userEmail?: string;
  currentUserId?: string;
  students?: any[];
  parents?: any[];
  payments?: any[];
  onAddPayment?: (payment: any) => void;
  onNavigateToMessagerie?: (targetUserId?: string) => void;
}

export function ParentModule({ 
  userRole, 
  userName, 
  userEmail,
  currentUserId,
  students = [], 
  parents = [], 
  payments = [], 
  onAddPayment, 
  onNavigateToMessagerie 
}: ParentModuleProps) {
  const { timetableEntries, classJournalEntries } = usePedagogicalTimetable();
  const { schoolMobileMoneyAccounts, calculatePaymentCommission, printConfig } = useSmartSchoolCore();
  const [activeSubTab, setActiveSubTab] = useState<string>("enfants");
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState("");
  const [parentSignedEntries, setParentSignedEntries] = useState<{ [key: string]: boolean }>({});

  // Print Preview Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<PrintableDocumentType>("bulletin_epst");
  const [printData, setPrintData] = useState<any>(null);

  // Payment form states for Parent
  const [payMotif, setPayMotif] = useState<string>("Minerval");
  const [payMonth, setPayMonth] = useState<string>("Octobre 2026");
  const [payAmount, setPayAmount] = useState<number>(45);
  const [payMethod, setPayMethod] = useState<string>("Mobile Money");
  const [payProvider, setPayProvider] = useState<string>("M-Pesa");
  const [payPhone, setPayPhone] = useState<string>("0812345678");
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [customPayRef, setCustomPayRef] = useState<string>("");
  const [isMomoModalOpen, setIsMomoModalOpen] = useState<boolean>(false);
  const [momoModalProps, setMomoModalProps] = useState<{ feeType: string; amount: number; currency: "USD" | "CDF" }>({
    feeType: "Minerval 2ème Tranche",
    amount: 45,
    currency: "USD"
  });

  const [photoRefreshKey, setPhotoRefreshKey] = useState(0);

  useEffect(() => {
    const handlePhotoUpdated = () => {
      setPhotoRefreshKey(prev => prev + 1);
    };
    window.addEventListener("smartschool_photo_updated", handlePhotoUpdated);
    return () => window.removeEventListener("smartschool_photo_updated", handlePhotoUpdated);
  }, []);

  // Dynamically resolve parent's children with strict matching & isolation
  const children = React.useMemo(() => {
    const matchedParent = parents.find(
      p => (currentUserId && p.id === currentUserId) ||
           (userName && `${p.firstName} ${p.lastName}`.toLowerCase() === userName.toLowerCase()) ||
           (userName && `${p.lastName} ${p.firstName}`.toLowerCase() === userName.toLowerCase()) ||
           (userEmail && p.email?.toLowerCase() === userEmail.toLowerCase())
    );

    const matchedStudents = students.filter(s => {
      // 1. By primaryParentId or parentIds array
      if (currentUserId && (s.primaryParentId === currentUserId || (s.parentIds && s.parentIds.includes(currentUserId)))) {
        return true;
      }
      if (matchedParent && (s.primaryParentId === matchedParent.id || (s.parentIds && s.parentIds.includes(matchedParent.id)))) {
        return true;
      }
      // 2. By childrenNames on parent object
      if (matchedParent && matchedParent.childrenNames && matchedParent.childrenNames.length > 0) {
        const isListed = matchedParent.childrenNames.some((cn: string) => 
          cn.toLowerCase().includes(s.lastName.toLowerCase()) || s.lastName.toLowerCase().includes(cn.toLowerCase()) ||
          (s.firstName && cn.toLowerCase().includes(s.firstName.toLowerCase()))
        );
        if (isListed) return true;
      }
      // 3. By phone or email matching
      if (matchedParent) {
        if (s.parentPhone && matchedParent.phone && s.parentPhone.replace(/\s+/g, "") === matchedParent.phone.replace(/\s+/g, "")) return true;
        if (s.parentEmail && matchedParent.email && s.parentEmail.toLowerCase() === matchedParent.email.toLowerCase()) return true;
      }
      // 4. By parentName string on student
      if (userName && s.parentName) {
        const cleanU = userName.toLowerCase();
        const cleanP = s.parentName.toLowerCase();
        if (cleanP.includes(cleanU) || cleanU.includes(cleanP)) return true;
      }
      return false;
    });

    if (matchedStudents.length > 0) {
      return matchedStudents.map((s, idx) => {
        const schId = s.schoolId || "sch-141992";
        const customPhoto = getStoredProfilePhoto(schId, s.id) || getStoredProfilePhoto(schId, s.registrationNumber);
        return {
          id: s.id,
          rawStudent: s,
          schoolId: schId,
          schoolName: s.schoolName || printConfig?.schoolName || "Complexe Scolaire SmartSchool RDC",
          name: `${s.lastName} ${s.firstName}`,
          class: s.className || "6ème Primaire",
          option: s.optionName || "Tronc Commun",
          matricule: s.registrationNumber || s.id || `ELE-${idx + 1}`,
          photoUrl: customPhoto || (s as any).photoUrl || (s.gender === "F" ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" : "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop"),
          absences: idx === 0 ? 1 : 0,
          average: "84.5%",
          conduct: "Excellente"
        };
      });
    }

    // If students list is populated but no specific parent link matched, let user select from students
    if (students.length > 0) {
      return students.slice(0, 3).map((s, idx) => {
        const schId = s.schoolId || "sch-141992";
        const customPhoto = getStoredProfilePhoto(schId, s.id) || getStoredProfilePhoto(schId, s.registrationNumber);
        return {
          id: s.id,
          rawStudent: s,
          schoolId: schId,
          schoolName: s.schoolName || printConfig?.schoolName || "Complexe Scolaire SmartSchool RDC",
          name: `${s.lastName} ${s.firstName}`,
          class: s.className || "6ème Primaire",
          option: s.optionName || "Tronc Commun",
          matricule: s.registrationNumber || s.id || `ELE-${idx + 1}`,
          photoUrl: customPhoto || (s as any).photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop",
          absences: idx === 0 ? 1 : 0,
          average: "84.5%",
          conduct: "Excellente"
        };
      });
    }

    return [
      {
        id: "child-default",
        rawStudent: null,
        schoolId: "sch-141992",
        schoolName: printConfig?.schoolName || "Complexe Scolaire SmartSchool RDC",
        name: "Élève SmartSchool",
        class: "6ème Primaire",
        option: "Générale",
        matricule: "ID-EPST-9012",
        photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop",
        absences: 0,
        average: "84.5%",
        conduct: "Excellente"
      }
    ];
  }, [students, parents, userName, userEmail, currentUserId, printConfig?.schoolName, photoRefreshKey]);

  const [selectedChildId, setSelectedChildId] = useState<string>(() => children[0]?.id || "child-default");

  React.useEffect(() => {
    if (children.length > 0 && !children.find(c => c.id === selectedChildId)) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const currentChild = children.find(c => c.id === selectedChildId) || children[0];

  // School Mobile Money Accounts for current child's school
  const activeSchoolMomoAccounts = React.useMemo(() => {
    const targetSchoolId = currentChild.schoolId;
    const filtered = schoolMobileMoneyAccounts.filter(
      a => (targetSchoolId === "default" || a.schoolId === targetSchoolId || a.schoolId === "all") && a.isActive
    );
    return filtered.length > 0 ? filtered : schoolMobileMoneyAccounts.filter(a => a.isActive);
  }, [schoolMobileMoneyAccounts, currentChild.schoolId]);

  // Filter payments specifically for current child
  const childPayments = React.useMemo(() => {
    return payments.filter(p => 
      p.studentId === currentChild.id || 
      (p.studentName && p.studentName.toLowerCase().includes(currentChild.name.toLowerCase()))
    );
  }, [payments, currentChild.id, currentChild.name]);

  // Calculate student minerval schedule for current child
  const childSchedule = getStudentSchedule(currentChild.id, currentChild.name, currentChild.class, childPayments);

  // Auto propose first unpaid month
  React.useEffect(() => {
    if (payMotif === "Minerval" && childSchedule) {
      if (childSchedule.firstUnpaidMonth) {
        setPayMonth(childSchedule.firstUnpaidMonth.fullLabel);
        setPayAmount(childSchedule.firstUnpaidMonth.amount);
      }
    }
  }, [payMotif, childSchedule.paidMonthsCount]);

  const handleParentPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || payAmount <= 0) return;

    // Calculate platform 2% commission (or school custom commission)
    const commCalc = calculatePaymentCommission(payAmount, currentChild.schoolId);

    const generatedRef = customPayRef.trim() || `REF-MOMO-${payProvider.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Date.now().toString().slice(-6)}`;

    // Strict Security & Traceability: Status starts at "En attente" until verified by school treasury!
    const newPayment = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: currentChild.id,
      studentName: currentChild.name,
      className: currentChild.class,
      schoolId: currentChild.schoolId,
      schoolName: currentChild.schoolName,
      amount: Number(payAmount),
      currency: "USD",
      paymentType: payMotif as any,
      paymentMonth: payMotif === "Minerval" ? payMonth : undefined,
      schoolYear: "2026-2027",
      remainingBalance: Math.max(0, childSchedule.remainingBalanceUSD - payAmount),
      paymentMethod: payMethod === "Mobile Money" ? "Mobile Money" : "Espèces",
      mobileMoneyGateway: payMethod === "Mobile Money" ? payProvider : undefined,
      reference: generatedRef,
      transactionRef: generatedRef,
      // Commission fields recorded separately
      platformCommissionRate: commCalc.ratePercent,
      platformCommissionAmount: commCalc.commissionAmount,
      netSchoolAmount: commCalc.netSchoolAmount,
      commissionStatus: commCalc.status,
      // Status strictly "En attente" until confirmed by the school bursar
      isValidated: false,
      transactionStatus: "En attente",
      status: "En attente",
      recordedBy: userName || "Portail Parent",
      parentName: userName || "Parent / Tuteur",
      parentPhone: payPhone,
      createdAt: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };

    if (onAddPayment) {
      onAddPayment(newPayment);
    }

    setPaymentSuccessMsg(`Déclaration de paiement de ${payAmount} USD pour ${currentChild.name} enregistrée ! Réf: ${generatedRef}. Statut : En attente de validation par la caisse de l'école.`);
    setCustomPayRef("");

    // Open print preview for official receipt declaration
    setPrintDocType("recu_minerval");
    setPrintData({ 
      payment: newPayment, 
      schoolName: currentChild.schoolName, 
      studentName: currentChild.name, 
      className: currentChild.class,
      matricule: currentChild.matricule
    });
    setPrintModalOpen(true);

    setTimeout(() => {
      setPaymentSuccessMsg(null);
    }, 6000);
  };

  // Notes/Grades
  const childGrades = [
    { course: "Mathématiques", score: "45/50", status: "Validé" },
    { course: "Physique Chimie", score: "39/50", status: "Validé" },
    { course: "Langue Française", score: "42/50", status: "Validé" },
    { course: "Histoire de la RDC", score: "48/50", status: "Validé" },
    { course: "Technologie", score: "44/50", status: "Validé" }
  ];

  // Bulletins
  const bulletins = [
    { id: "BUL-1", term: "1er Trimestre", globalRate: "84.5%", releaseDate: "18/12/2025" },
    { id: "BUL-2", term: "2ème Trimestre", globalRate: "82.1%", releaseDate: "02/04/2026" }
  ];

  // Absences
  const absences = [
    { date: "28/06/2026", status: "Absence Justifiée", comment: "Certificat de consultation pédiatrique déposé." }
  ];

  // Homework
  const activeHomeworks = [
    { id: "hw-1", title: "Exercices de structure atomique", course: "Physique Chimie", deadline: "02/07/2026", status: "Non soumis" },
    { id: "hw-2", title: "Dissertation philosophique", course: "Philosophie & Citoyenneté", deadline: "28/06/2026", status: "Soumis & Validé" }
  ];

  // Teachers for communication
  const childTeachers = [
    { name: "Ir IT Fred Kalonda", course: "Technologie / Physique", isOnline: true },
    { name: "M. Mukendi", course: "Mathématiques", isOnline: false }
  ];

  // Important Notifications
  const parentNotifications = [
    { id: "not-1", text: "Absence enregistrée pour Mutombo Jean-Bosco le 28/06/2026.", date: "28/06/2026 à 08:30" },
    { id: "not-2", text: "Le bulletin du 2ème Trimestre est disponible au téléchargement.", date: "02/04/2026 à 14:00" },
    { id: "not-3", text: "Paiement de 150 USD enregistré pour le Minerval 1e Trimestre.", date: "05/09/2025 à 11:20" }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageText("");
    }, 2500);
  };

  const tabs = [
    { id: "enfants", label: "Synthèse Enfants", icon: Users },
    { id: "horaire", label: "Emploi du Temps", icon: Calendar },
    { id: "journal_classe", label: "Journal de Classe", icon: FileText },
    { id: "paiements", label: "Paiement & Minerval", icon: DollarSign },
    { id: "notes", label: "Notes & Bulletins", icon: Award },
    { id: "presences", label: "Absences & Suivi", icon: CheckCircle2 },
    { id: "devoirs", label: "Devoirs & Exercices", icon: BookOpen },
    { id: "patrimoine_rdc", label: "Patrimoine & Culture RDC", icon: Landmark },
    { id: "annuaire", label: "Annuaire & Recherche", icon: Search },
    { id: "messagerie", label: "Message Enseignants", icon: MessageSquare },
    { id: "notifications", label: "Notifications ({N})".replace("{N}", String(parentNotifications.length)), icon: Bell },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs text-left font-sans">
      
      {/* Sidebar Selector */}
      <div className="lg:col-span-1 space-y-3">
        
        {/* Child Selector Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-xs text-center space-y-3">
          {children.length > 1 && (
            <div className="flex justify-center gap-1.5 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChildId(c.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    c.id === currentChild.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {c.name.split(" ")[0]}
                </button>
              ))}
            </div>
          )}

          <div className="relative inline-block">
            <img 
              src={currentChild.photoUrl} 
              alt={currentChild.name} 
              className="h-16 w-16 rounded-full mx-auto border-2 border-indigo-600 object-cover" 
            />
          </div>
          <div>
            <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-none">{currentChild.name}</h4>
            <p className="text-[10px] text-slate-500 mt-1 font-mono font-bold uppercase">{currentChild.class} • {currentChild.option}</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-2.5 rounded-2xl shadow-xs space-y-1">
          {tabs.map((tab) => {
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

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          
          {/* CULTURES & PATRIMOINE RDC TAB */}
          {activeSubTab === "patrimoine_rdc" && (
            <NationalCultureHeritageModule userRole={userRole} userName={userName} userPortal="parent" />
          )}

          {/* SYNTHESE TAB */}
          {activeSubTab === "enfants" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Espace Parent - Tableau de Suivi Scolaire</h3>
                <p className="text-slate-500 text-[10px]">Consultez et suivez de manière souveraine l'assiduité et la scolarité de vos enfants à SmartSchool RDC.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Moyenne Générale</span>
                  <span className="text-lg font-black text-indigo-600 font-mono">{currentChild.average}</span>
                  <p className="text-[9px] text-slate-500 font-medium">Position dans la classe : 4e sur 35</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Registre d'Absence</span>
                  <span className="text-lg font-black text-amber-600 font-mono">{currentChild.absences} absence</span>
                  <p className="text-[9px] text-emerald-600 font-bold">100% justifiée en ligne</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Appréciation de conduite</span>
                  <span className="text-lg font-black text-emerald-600">{currentChild.conduct}</span>
                  <p className="text-[9px] text-slate-500 font-medium">Conseil de discipline : Aucun incident</p>
                </div>
              </div>

              {/* Quick details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">Identifiants académiques officiels</h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border">
                  <div>
                    <span className="text-slate-400 block">Établissement rattaché :</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Complexe Scolaire SmartSchool</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Identifiant National :</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentChild.matricule}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TIMETABLE / EMPLOI DU TEMPS ENFANT */}
          {activeSubTab === "horaire" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Emploi du Temps Officiel ({currentChild.name} • {currentChild.class})</h3>
                <p className="text-slate-500 text-[10px]">Grille horaire hebdomadaire avec horaires, salles de cours et noms des professeurs assignés.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((day, dIdx) => {
                  const dayEntries = timetableEntries.filter(
                    t => (t.className.toLowerCase() === currentChild.class.toLowerCase() ||
                          t.className.toLowerCase().includes(currentChild.class.toLowerCase().slice(0, 3))) &&
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
                            Aucun cours
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* JOURNAL DE CLASSE & VISA PARENTAL */}
          {activeSubTab === "journal_classe" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Journal de Classe & Cahier de Textes ({currentChild.name})</h3>
                <p className="text-slate-500 text-[10px]">Contrôlez les notions enseignées à votre enfant et apposez votre visa parental électronique.</p>
              </div>

              <div className="space-y-4">
                {classJournalEntries
                  .filter(j => j.className.toLowerCase() === currentChild.class.toLowerCase() ||
                               j.className.toLowerCase().includes(currentChild.class.toLowerCase().slice(0, 3)))
                  .map((entry) => {
                    const isParentSigned = parentSignedEntries[entry.id];

                    return (
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
                            <strong className="text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold">Résumé de la leçon :</strong>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5">{entry.summaryContent}</p>
                          </div>
                        </div>

                        {entry.homeworkAssigned && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-1 text-amber-900 dark:text-amber-200">
                            <div className="font-bold text-[11px] flex items-center justify-between">
                              <span>Devoir à la maison prescrit :</span>
                              <span className="text-[10px] font-mono">À rendre le : {entry.homeworkDueDate || "Prochain cours"}</span>
                            </div>
                            <p className="text-xs">{entry.homeworkAssigned}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex-wrap gap-2">
                          <div className="space-y-0.5">
                            <div>Professeur : <strong>{entry.teacherName}</strong></div>
                            <div className={entry.directorVisa ? "text-emerald-600 font-bold" : "text-slate-400"}>
                              {entry.directorVisa ? `✓ Visa Direction : ${entry.directorVisaDate}` : "En attente du visa direction"}
                            </div>
                          </div>

                          <div>
                            {isParentSigned ? (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full font-bold inline-flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Visa Parental Apposé</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setParentSignedEntries({ ...parentSignedEntries, [entry.id]: true });
                                  alert(`Visa Parental électronique validé pour la leçon de ${entry.subjectName} ! Notification transmise à l'enseignant et à la direction.`);
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer transition-colors"
                              >
                                Apposer Visa Parental
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* PAIEMENT & MINERVAL DIRECT */}
          {activeSubTab === "paiements" && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span>Paiement Direct des Frais Scolaires & Minerval</span>
                  </h3>
                  <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>Élève sélectionné : <strong>{currentChild.name}</strong> ({currentChild.class})</span>
                  </div>
                </div>
                <p className="text-slate-500 text-[10px]">
                  Effectuez le règlement direct et sécurisé des frais d'études de votre enfant vers les comptes Mobile Money officiels de l'établissement.
                </p>
              </div>

              {/* Message Banner */}
              {paymentSuccessMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-start gap-3 animate-fade-in shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{paymentSuccessMsg}</p>
                    <p className="text-[10px] font-normal text-emerald-700 dark:text-emerald-300">
                      Un reçu provisoire a été généré. Dès que la caisse de l'école aura vérifié la réception des fonds, votre reçu officiel d'écolage sera automatiquement validé.
                    </p>
                  </div>
                </div>
              )}

              {/* Active School Receiving Accounts Banner */}
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-300 font-black text-xs uppercase tracking-wide">
                    <Landmark className="h-4 w-4 text-amber-600" />
                    <span>Comptes Mobile Money Officiels de l'École ({currentChild.schoolName})</span>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                    Vérifiez toujours le titulaire avant de valider votre code PIN
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {activeSchoolMomoAccounts.length > 0 ? (
                    activeSchoolMomoAccounts.map((acc, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-900/60 shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900 dark:text-white">{acc.provider}</span>
                          {acc.merchantCode && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded font-bold">
                              Marchand: {acc.merchantCode}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {acc.accountNumber || acc.phoneNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Titulaire : <strong>{acc.holderName || acc.accountName}</strong>
                        </div>
                        {(acc.instructions || acc.ussdInstruction) && (
                          <div className="text-[9px] text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                            {acc.instructions || acc.ussdInstruction}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 col-span-full text-xs text-slate-500">
                      Comptes officiels : Vodacom M-Pesa (+243 812 345 678), Orange Money (+243 893 456 789), Airtel Money (+243 994 567 890)
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Payment Gateway Interface */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form column */}
                <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase text-slate-800 dark:text-slate-200 tracking-wider flex items-center space-x-1.5">
                      <Smartphone className="h-4 w-4 text-indigo-600" />
                      <span>Déclarer ou Initier un Paiement</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-full font-bold">
                      Sécurisé EPST
                    </span>
                  </div>

                  <form onSubmit={handleParentPaymentSubmit} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Motif du Paiement</label>
                      <select 
                        value={payMotif}
                        onChange={(e) => setPayMotif(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100"
                      >
                        <option value="Minerval">Minerval Mensuel (Écolage)</option>
                        <option value="Frais d'Examen d'État">Frais d'Examen d'État / TENAFEP</option>
                        <option value="Frais d'Inscription">Frais d'Inscription / Réinscription</option>
                        <option value="Frais Connexes">Frais de Transport / Cantine</option>
                      </select>
                    </div>

                    {payMotif === "Minerval" && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mois Concerné</label>
                        <select 
                          value={payMonth}
                          onChange={(e) => setPayMonth(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100"
                        >
                          <option value="Septembre 2026">Septembre 2026</option>
                          <option value="Octobre 2026">Octobre 2026</option>
                          <option value="Novembre 2026">Novembre 2026</option>
                          <option value="Décembre 2026">Décembre 2026</option>
                          <option value="Janvier 2027">Janvier 2027</option>
                          <option value="Février 2027">Février 2027</option>
                          <option value="Mars 2027">Mars 2027</option>
                          <option value="Avril 2027">Avril 2027</option>
                          <option value="Mai 2027">Mai 2027</option>
                          <option value="Juin 2027">Juin 2027</option>
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Montant (USD)</label>
                        <input 
                          type="number" 
                          value={payAmount}
                          onChange={(e) => setPayAmount(Number(e.target.value))}
                          min="1" 
                          required 
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-100" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Opérateur</label>
                        <select 
                          value={payProvider}
                          onChange={(e) => setPayProvider(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100"
                        >
                          <option value="M-Pesa">Vodacom M-Pesa</option>
                          <option value="Orange Money">Orange Money</option>
                          <option value="Airtel Money">Airtel Money</option>
                          <option value="Afrimoney">Afrimoney</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Numéro Téléphone / Réf Transaction SMS (Optionnel)
                      </label>
                      <input 
                        type="text" 
                        value={customPayRef}
                        onChange={(e) => setCustomPayRef(e.target.value)}
                        placeholder="ex: MP260818.1402.G001 ou laisser vide"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100" 
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-[10px] text-indigo-900 dark:text-indigo-300 space-y-1">
                      <div className="flex items-center gap-1 font-bold">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Commission Plateforme : 2% calculée automatiquement</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">
                        Montant prélevé pour la plateforme : <strong>{(payAmount * 0.02).toFixed(2)} USD</strong> • Revenant net à l'école : <strong>{(payAmount * 0.98).toFixed(2)} USD</strong>.
                      </p>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Enregistrer la Déclaration de Paiement ({payAmount} USD)</span>
                    </button>
                  </form>
                </div>

                {/* Status & Summary column */}
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                      Solde Scolaire — {currentChild.name}
                    </span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        {childSchedule.totalPaidUSD} USD
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Payé sur {childSchedule.annualFeeUSD} USD
                      </span>
                    </div>
                    <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full transition-all"
                        style={{ width: `${Math.min(100, (childSchedule.totalPaidUSD / (childSchedule.annualFeeUSD || 1)) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Reste à payer : <strong>{childSchedule.remainingBalanceUSD} USD</strong> ({childSchedule.unpaidMonthsCount} mois restants).
                    </p>
                  </div>

                  {/* Anti-fraud Warning */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-bold text-xs">
                      <Info className="h-4 w-4 text-indigo-600" />
                      <span>Contrôle & Validation Caisse Établissement</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Conformément aux directives de gestion financière de SmartSchool RDC, tout paiement initié par un parent passe d'abord par le statut 
                      <strong className="text-amber-600"> « En attente »</strong> jusqu'à vérification physique ou électronique par la caisse de l'école.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction History for Current Child */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                    Historique des Paiements de {currentChild.name} ({childPayments.length})
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Filtre actif : {currentChild.name} uniquement
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                        <th className="p-3">Réf / Date</th>
                        <th className="p-3">Motif du Paiement</th>
                        <th className="p-3">Méthode / Opérateur</th>
                        <th className="p-3">Montant</th>
                        <th className="p-3 text-center">Statut Caisse</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {childPayments.length > 0 ? (
                        childPayments.map((pay, idx) => {
                          const isSuccess = pay.isValidated || pay.status === "Approuvé" || pay.status === "Validé" || pay.transactionStatus === "Succès";
                          const isPending = !isSuccess && (pay.status === "En attente" || pay.transactionStatus === "En attente" || !pay.isValidated);

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                              <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                                <div>{pay.reference || pay.transactionRef || pay.id}</div>
                                <span className="text-[9px] text-slate-400 font-normal">{pay.createdAt || pay.date || "Récemment"}</span>
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{pay.paymentType}</div>
                                {pay.paymentMonth && (
                                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">{pay.paymentMonth}</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold">
                                  {pay.mobileMoneyGateway || pay.paymentMethod || "Mobile Money"}
                                </span>
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-600">
                                {pay.amount} {pay.currency || "USD"}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border inline-flex items-center gap-1 ${
                                  isSuccess 
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                    : isPending
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    : "bg-red-500/10 text-red-600 border-red-500/30"
                                }`}>
                                  {isSuccess ? (
                                    <>
                                      <CheckCircle className="h-3 w-3" />
                                      <span>Validé</span>
                                    </>
                                  ) : isPending ? (
                                    <>
                                      <Clock className="h-3 w-3" />
                                      <span>En attente</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="h-3 w-3" />
                                      <span>Rejeté</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => {
                                    setPrintDocType("recu_minerval");
                                    setPrintData({
                                      payment: pay,
                                      schoolName: currentChild.schoolName,
                                      studentName: currentChild.name,
                                      className: currentChild.class,
                                      matricule: currentChild.matricule
                                    });
                                    setPrintModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 ml-auto cursor-pointer"
                                >
                                  <Printer className="h-3 w-3" />
                                  <span>Reçu</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400">
                            Aucun paiement enregistré pour {currentChild.name} pour le moment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NOTES & BULLETINS */}
          {activeSubTab === "notes" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Notes & Bulletins de l'Enfant</h3>
                <p className="text-slate-500 text-[10px]">Carnet de notes consolidé et téléchargement des bulletins scolaires trimestriels.</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-1.5 uppercase">Moyennes de Période</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b text-slate-500 font-bold">
                        <th className="p-3">Matière / Cours</th>
                        <th className="p-3 text-right">Note Validée</th>
                        <th className="p-3 text-right">Statut académique</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {childGrades.map((g, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{g.course}</td>
                          <td className="p-3 text-right font-black text-indigo-600 font-mono">{g.score}</td>
                          <td className="p-3 text-right">
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                              {g.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-1.5 uppercase">Bulletins Trimestriels de l'Enfant</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bulletins.map((b) => (
                    <div key={b.id} className="p-4 border rounded-2xl flex justify-between items-center bg-slate-50/40 dark:bg-slate-950/20">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-mono">{b.id}</span>
                        <h5 className="font-bold text-slate-800 dark:text-slate-200">{b.term}</h5>
                        <p className="text-slate-500 text-[10px]">Publié le : {b.releaseDate}</p>
                        <p className="text-xs font-black text-emerald-600">Moyenne : {b.globalRate}</p>
                      </div>

                      <button 
                        onClick={() => alert(`Téléchargement de ${b.id} validé...`)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRESENCES */}
          {activeSubTab === "presences" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Absences & Assiduité</h3>
                <p className="text-slate-500 text-[10px]">Suivi des absences, retards ou départs anticipés de vos enfants.</p>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b text-slate-500 font-bold">
                      <th className="p-3">Date de l'absence</th>
                      <th className="p-3">Statut administratif</th>
                      <th className="p-3">Justification du parent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {absences.map((abs, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-500">{abs.date}</td>
                        <td className="p-3">
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                            {abs.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">{abs.comment}</td>
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
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Cahier de Textes & Devoirs à faire</h3>
                <p className="text-slate-500 text-[10px]">Suivez l'avancement des devoirs de votre enfant pour l'accompagner dans sa réussite.</p>
              </div>

              <div className="space-y-3">
                {activeHomeworks.map((hw) => (
                  <div key={hw.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/10 flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                        {hw.course}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{hw.title}</h4>
                      <p className="text-[10px] text-slate-500">Date limite : {hw.deadline}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase ${
                      hw.status.includes("Validé") 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400" 
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400"
                    }`}>
                      {hw.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMMUNICATE WITH TEACHERS */}
          {activeSubTab === "messagerie" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Communication Directe Enseignants</h3>
                <p className="text-slate-500 text-[10px]">Échangez de manière sécurisée avec les enseignants responsables de la classe de votre enfant.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Teachers side list */}
                <div className="md:col-span-1 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Enseignants Titulaires</span>
                  <div className="space-y-2">
                    {childTeachers.map((teacher, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border flex items-center space-x-2.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                        <div className="text-left leading-tight min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{teacher.name}</p>
                          <p className="text-[9px] text-slate-400 truncate">{teacher.course}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form to email/message */}
                <form onSubmit={handleSendMessage} className="md:col-span-2 space-y-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Envoyer une requête officielle</span>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold mb-1 block">Sélectionnez le destinataire :</label>
                      <select className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-xs">
                        {childTeachers.map((t, idx) => (
                          <option key={idx} value={t.name}>{t.name} ({t.course})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold mb-1 block">Votre message ou motif de la consultation :</label>
                      <textarea
                        required
                        placeholder="Rédigez votre demande ici..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs h-[100px]"
                      />
                    </div>

                    {messageSent ? (
                      <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl flex items-center space-x-1.5 text-[11px] font-bold">
                        <Check className="h-4 w-4 shrink-0" />
                        <span>Message envoyé avec succès à l'enseignant !</span>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer flex items-center space-x-1.5"
                      >
                        <Send className="h-4 w-4" />
                        <span>Envoyer le Message</span>
                      </button>
                    )}
                  </div>
                </form>

              </div>
            </div>
          )}

          {/* ANNUAIRE & RECHERCHE DES UTILISATEURS */}
          {activeSubTab === "annuaire" && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                  <Search className="h-5 w-5 text-indigo-600" />
                  <span>Annuaire & Recherche du Personnel de l'Établissement</span>
                </h3>
                <p className="text-slate-500 text-[10px]">
                  Recherchez le Directeur, le Préfet, le Titulaire de votre enfant, ses enseignants ou la comptabilité pour entamer une discussion directe.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute inset-y-0 left-3.5 h-4 w-4 text-slate-400 my-auto" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, fonction, ou cours (ex: Directeur, Mathématiques, Titulaire)..."
                  value={directorySearchQuery}
                  onChange={(e) => setDirectorySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Contacts Directory Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "dir-1", name: "Sr. Marie-Therese Kasonia", function: "Directrice Générale", roleBadge: "Direction", course: "Administration Scolaire", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
                  { id: "dir-2", name: "M. Mbuyi Tshilombo", function: "Préfet des Études", roleBadge: "Direction", course: "Supervision Pédagogique", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
                  { id: "dir-3", name: "M. Bakala Antoine", function: "Titulaire de 6ème Primaire", roleBadge: "Titulaire", course: "Français & Discipline", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
                  { id: "dir-4", name: "Ir IT Fred Kalonda", function: "Enseignant", roleBadge: "Enseignant", course: "Technologie & Informatique", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
                  { id: "dir-5", name: "Mme. Sarah Mukendi", function: "Comptable Principale", roleBadge: "Finance", course: "Caisse & Minerval", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
                  { id: "dir-6", name: "M. Kabeya Joseph", function: "Secrétaire Général", roleBadge: "Administration", course: "Inscriptions & Fiches", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" }
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
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate">{contact.name}</h4>
                        </div>
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

          {/* NOTIFICATIONS */}
          {activeSubTab === "notifications" && (
            <div className="space-y-6">
              <div className="border-b pb-3 space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Canal de Notifications Alerte Parent</h3>
                <p className="text-slate-500 text-[10px]">Restez au courant instantanément de toute absence, note publiée ou paiement d'frais enregistré.</p>
              </div>

              <div className="space-y-3">
                {parentNotifications.map((not) => (
                  <div key={not.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900/60 flex items-start space-x-3 text-left">
                    <Bell className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{not.text}</p>
                      <span className="text-[9px] text-slate-400 font-mono block">{not.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Money Payment Modal */}
      {isMomoModalOpen && (
        <MobileMoneyPaymentModal
          isOpen={isMomoModalOpen}
          onClose={() => setIsMomoModalOpen(false)}
          student={students.find(s => s.id === currentChild.id) || {
            id: currentChild.id,
            firstName: currentChild.name.split(" ")[0] || "Jean-Bosco",
            lastName: currentChild.name.split(" ").slice(1).join(" ") || "Mutombo",
            className: currentChild.class,
            registrationNumber: currentChild.matricule,
            schoolId: "default"
          } as any}
          defaultFeeType={momoModalProps.feeType}
          defaultAmount={momoModalProps.amount}
          defaultCurrency={momoModalProps.currency}
          onPaymentSuccess={(payment) => {
            if (onAddPayment) {
              onAddPayment(payment);
            }
            setPaymentSuccessMsg(`Paiement de ${payment.amount} ${payment.currency} validé avec succès (Réf: ${payment.reference}). Reçu officiel généré.`);
            setIsMomoModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
