import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Check, 
  AlertCircle, 
  Trash2, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Megaphone, 
  UserCheck, 
  Smile, 
  FileCheck, 
  Eye, 
  CheckCircle2, 
  MapPin, 
  School, 
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Search,
  Bell
} from "lucide-react";
import { 
  ClassRoom, 
  Teacher, 
  Student, 
  Subject, 
  Grade, 
  TimetableEntry, 
  NotificationItem, 
  Option, 
  PedagogicalEvent,
  Attendance
} from "../types";

interface AdminWorkspaceViewProps {
  userRole: string;
  userName: string;
  classes: ClassRoom[];
  teachers: Teacher[];
  students: Student[];
  subjects: Subject[];
  grades: Grade[];
  timetable: TimetableEntry[];
  options: Option[];
  pedagogicalEvents: PedagogicalEvent[];
  attendances: Attendance[];
  onAddTimetableEntry: (entry: TimetableEntry) => void;
  onDeleteTimetableEntry?: (id: string) => void;
  onAddNotification: (notif: Omit<NotificationItem, "id" | "time">) => void;
  onAddPedagogicalEvent: (event: Omit<PedagogicalEvent, "id">) => void;
}

export function AdminWorkspaceView({
  userRole,
  userName,
  classes,
  teachers,
  students,
  subjects,
  grades,
  timetable,
  options,
  pedagogicalEvents,
  attendances,
  onAddTimetableEntry,
  onDeleteTimetableEntry,
  onAddNotification,
  onAddPedagogicalEvent
}: AdminWorkspaceViewProps) {
  // Identify cycle based on role
  const roleUpper = userRole.toUpperCase();
  const isMaternelle = roleUpper.includes("MATERNELLE");
  const isPrimaire = roleUpper.includes("PRIMAIRE");
  const isSecondaire = roleUpper.includes("SECONDAIRE") || roleUpper.includes("PRÉFET");

  // Determine active scope
  const activeCycle: "Maternelle" | "Primaire" | "Secondaire" = 
    isMaternelle ? "Maternelle" :
    isPrimaire ? "Primaire" :
    isSecondaire ? "Secondaire" : "Secondaire";

  // Cycle title helper
  const getCycleTitle = () => {
    if (activeCycle === "Maternelle") return "Espace Responsable de la Maternelle";
    if (activeCycle === "Primaire") return "Espace Directeur des Études (Primaire)";
    return "Espace Préfet des Études (Secondaire & Humanités)";
  };

  // State managers
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "horaires" | "calendar" | "teachers" | "validation" | "maternelle">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter classes, students, subjects, timetable based on active role permissions
  const filteredClasses = classes.filter(c => {
    if (c.levelCategory) return c.levelCategory === activeCycle;
    // Fallback inference
    const lvl = String(c.level).toLowerCase();
    if (lvl.includes("section") || lvl.includes("maternelle")) return activeCycle === "Maternelle";
    if (lvl.includes("primaire") || (lvl.includes("année") && !lvl.includes("eb") && !lvl.includes("humanités"))) return activeCycle === "Primaire";
    return activeCycle === "Secondaire";
  });

  const filteredStudents = students.filter(s => {
    return filteredClasses.some(c => `${c.level} ${c.roomLetter}` === s.className);
  });

  const filteredTimetable = timetable.filter(t => {
    return filteredClasses.some(c => `${c.level} ${c.roomLetter}` === t.className);
  });

  const filteredEvents = pedagogicalEvents.filter(ev => {
    return ev.category === activeCycle || ev.category === "Tous";
  });

  // Scheduling states
  const [schedYear, setSchedYear] = useState("2026-2027");
  const [schedClass, setSchedClass] = useState("");
  const [schedDay, setSchedDay] = useState("Lundi");
  const [schedPeriod, setSchedPeriod] = useState("1ère Heure (07h30-08h20)");
  const [schedRoom, setSchedRoom] = useState("");
  const [schedSubject, setSchedSubject] = useState("");
  const [schedTeacher, setSchedTeacher] = useState("");
  const [schedOption, setSchedOption] = useState("Néant");

  // Conflicts list
  const [conflicts, setConflicts] = useState<{ type: string; message: string }[]>([]);

  // Automatically select first class on load
  useEffect(() => {
    if (filteredClasses.length > 0 && !schedClass) {
      const firstClass = `${filteredClasses[0].level} ${filteredClasses[0].roomLetter}`;
      setSchedClass(firstClass);
      
      // Select option if humanities
      if (filteredClasses[0].optionName) {
        setSchedOption(filteredClasses[0].optionName);
      }
    }
  }, [filteredClasses, schedClass]);

  // Select defaults for subjects and teachers
  useEffect(() => {
    if (subjects.length > 0 && !schedSubject) {
      setSchedSubject(subjects[0].name);
    }
    if (teachers.length > 0 && !schedTeacher) {
      setSchedTeacher(`${teachers[0].firstName} ${teachers[0].lastName}`);
    }
  }, [subjects, teachers, schedSubject, schedTeacher]);

  // Real-time conflict checking
  useEffect(() => {
    if (!schedClass || !schedDay || !schedPeriod) return;

    const newConflicts: { type: string; message: string }[] = [];
    const normalizedPeriod = schedPeriod.split(" ")[0]; // e.g. "1ère" or "2ème"

    // 1. Teacher busy
    if (schedTeacher) {
      const busyTeacher = timetable.find(t => 
        t.day === schedDay && 
        t.period.startsWith(normalizedPeriod) && 
        t.teacherName.toLowerCase() === schedTeacher.toLowerCase()
      );
      if (busyTeacher) {
        newConflicts.push({
          type: "Enseignant",
          message: `Le professeur ${schedTeacher} est déjà programmé à la classe ${busyTeacher.className} le ${schedDay} à la même heure.`
        });
      }
    }

    // 2. Room occupied
    if (schedRoom) {
      const busyRoom = timetable.find(t => 
        t.day === schedDay && 
        t.period.startsWith(normalizedPeriod) && 
        t.room.toLowerCase() === schedRoom.toLowerCase()
      );
      if (busyRoom) {
        newConflicts.push({
          type: "Salle occupée",
          message: `La salle/local ${schedRoom} est déjà occupée par la classe de ${busyRoom.className} le ${schedDay} à cette heure.`
        });
      }
    }

    // 3. Class already has course
    if (schedClass) {
      const busyClass = timetable.find(t => 
        t.day === schedDay && 
        t.period.startsWith(normalizedPeriod) && 
        t.className === schedClass
      );
      if (busyClass) {
        newConflicts.push({
          type: "Classe occupée",
          message: `La classe ${schedClass} a déjà un cours de ${busyClass.subjectName} programmé le ${schedDay} à cette heure.`
        });
      }
    }

    setConflicts(newConflicts);
  }, [schedClass, schedDay, schedPeriod, schedRoom, schedTeacher, timetable]);

  // Submit Schedule entry
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflicts.length > 0) {
      alert("Impossible d'enregistrer : veuillez d'abord résoudre les conflits d'horaires.");
      return;
    }
    if (!schedClass || !schedSubject || !schedTeacher || !schedRoom) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    onAddTimetableEntry({
      id: `time-${Date.now()}`,
      className: schedClass,
      day: schedDay,
      period: schedPeriod,
      subjectName: schedSubject,
      teacherName: schedTeacher,
      room: schedRoom
    });

    // Notify users
    onAddNotification({
      title: "Emploi du Temps Modifié",
      message: `Un nouveau cours de ${schedSubject} a été programmé pour la classe de ${schedClass} le ${schedDay} (${schedPeriod}) dans le local ${schedRoom}.`,
      type: "info",
      isRead: false
    });

    alert(`Cours de ${schedSubject} enregistré avec succès !`);
  };

  // Create Pedagogical Event
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState<"Examen" | "Interrogation" | "Devoir commun" | "Réunion pédagogique" | "Conseil de classe" | "Journée pédagogique">("Examen");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventRoom, setEventRoom] = useState("");
  const [eventClass, setEventClass] = useState("Toutes");
  const [eventDesc, setEventDesc] = useState("");

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventTime) {
      alert("Veuillez remplir les informations de l'événement.");
      return;
    }

    onAddPedagogicalEvent({
      title: eventTitle,
      type: eventType,
      category: activeCycle,
      date: eventDate,
      time: eventTime,
      room: eventRoom || "À définir",
      className: eventClass,
      description: eventDesc
    });

    // Notify
    onAddNotification({
      title: `Nouvel événement : ${eventType}`,
      message: `${eventTitle} prévu le ${eventDate} à ${eventTime} (Niveau: ${activeCycle}, Classe: ${eventClass}).`,
      type: "info",
      isRead: false
    });

    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventRoom("");
    setEventClass("Toutes");
    setEventDesc("");

    alert("Événement enregistré et publié avec succès ! Les enseignants, élèves et parents concernés ont reçu une notification.");
  };

  // Bulletin validation states
  const [validatedClasses, setValidatedClasses] = useState<string[]>([]);
  const toggleValidateClass = (clsName: string) => {
    if (validatedClasses.includes(clsName)) {
      setValidatedClasses(validatedClasses.filter(c => c !== clsName));
    } else {
      setValidatedClasses([...validatedClasses, clsName]);
      onAddNotification({
        title: "Validation des Bulletins",
        message: `Les bulletins de la classe ${clsName} ont été officiellement validés et scellés par ${userRole} (${userName}).`,
        type: "success",
        isRead: false
      });
    }
  };

  // Teachers presence mock tracker
  const [teacherPresence, setTeacherPresence] = useState<{ [key: string]: "present" | "absent" | "retard" }>({});
  const handleToggleTeacherPresence = (tId: string, status: "present" | "absent" | "retard") => {
    setTeacherPresence(prev => ({
      ...prev,
      [tId]: status
    }));
  };

  // Maternelle custom observations
  const [nurseryObservations, setNurseryObservations] = useState<any[]>(() => {
    return [
      { id: 1, child: "Bébé Mwamba", area: "Motricité", obs: "Très bonne coordination lors des jeux d'empilement.", date: "06/07/2026" },
      { id: 2, child: "Ngalula Alice", area: "Langage", obs: "Formule des phrases courtes et commence à mémoriser les comptines.", date: "05/07/2026" }
    ];
  });
  const [obsChild, setObsChild] = useState("");
  const [obsArea, setObsArea] = useState("Motricité");
  const [obsText, setObsText] = useState("");

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsChild || !obsText) return;
    const newObs = {
      id: Date.now(),
      child: obsChild,
      area: obsArea,
      obs: obsText,
      date: new Date().toLocaleDateString("fr-FR")
    };
    setNurseryObservations([newObs, ...nurseryObservations]);
    setObsChild("");
    setObsText("");
  };

  // Maternelle custom activities
  const [nurseryActivities, setNurseryActivities] = useState<any[]>(() => {
    return [
      { id: 1, title: "Peinture au doigt", date: "06/07/2026", desc: "Éveil sensoriel artistique avec des gouaches lavables." },
      { id: 2, title: "Sieste contée", date: "07/07/2026", desc: "Récit d'un conte africain traditionnel avant le repos de l'après-midi." }
    ];
  });
  const [actTitle, setActTitle] = useState("");
  const [actDate, setActDate] = useState("");
  const [actDesc, setActDesc] = useState("");

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle || !actDate || !actDesc) return;
    const newAct = {
      id: Date.now(),
      title: actTitle,
      date: actDate,
      desc: actDesc
    };
    setNurseryActivities([newAct, ...nurseryActivities]);
    setActTitle("");
    setActDate("");
    setActDesc("");
  };

  // Generic counts for widgets
  const totalMyClasses = filteredClasses.length;
  const totalMyStudents = filteredStudents.length;
  const totalMyEvents = filteredEvents.length;

  return (
    <div className="space-y-6 text-xs text-left" id="admin_workspace_root">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-44 w-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1.5 z-10">
          <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest text-[9px]">
            {activeCycle} Cycle
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">{getCycleTitle()}</h2>
          <p className="text-indigo-200 text-[10px] md:text-xs">
            Responsable académique connecté : <strong className="text-white">{userName}</strong> — Gestion administrative autonome du cycle.
          </p>
        </div>
        <div className="z-10 flex items-center bg-white/10 border border-white/10 px-4 py-2 rounded-2xl">
          <Bell className="h-4 w-4 text-indigo-300 shrink-0 mr-2 animate-bounce" />
          <div className="text-[10px] font-mono">
            <span className="text-slate-300 block uppercase">Système connecté</span>
            <span className="text-emerald-400 font-bold font-sans">100% Hors-ligne</span>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex overflow-x-auto pb-1 space-x-1 bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-800/60 scrollbar-none">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`px-4.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activeSubTab === "dashboard"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Tableau de Bord</span>
        </button>

        <button
          onClick={() => setActiveSubTab("horaires")}
          className={`px-4.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activeSubTab === "horaires"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Planificateur Horaires</span>
        </button>

        <button
          onClick={() => setActiveSubTab("calendar")}
          className={`px-4.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activeSubTab === "calendar"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Calendrier & Évaluations</span>
        </button>

        <button
          onClick={() => setActiveSubTab("teachers")}
          className={`px-4.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activeSubTab === "teachers"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Suivi Absences Profs</span>
        </button>

        <button
          onClick={() => setActiveSubTab("validation")}
          className={`px-4.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
            activeSubTab === "validation"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Validation des Bulletins</span>
        </button>

        {isMaternelle && (
          <button
            onClick={() => setActiveSubTab("maternelle")}
            className={`px-4.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 ${
              activeSubTab === "maternelle"
                ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Smile className="h-4 w-4" />
            <span>Activités Maternelle</span>
          </button>
        )}
      </div>

      {/* VIEW CONTENT */}

      {/* 1. TABLEAU DE BORD PEDAGOGIQUE */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center space-x-3.5 shadow-sm">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                <School className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Mes Classes</span>
                <span className="text-base font-black text-slate-800 dark:text-white font-mono">{totalMyClasses}</span>
                <span className="text-[10px] text-slate-400 block">Salles opérationnelles</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center space-x-3.5 shadow-sm">
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Mes Élèves</span>
                <span className="text-base font-black text-slate-800 dark:text-white font-mono">{totalMyStudents}</span>
                <span className="text-[10px] text-slate-400 block">Inscrits et encadrés</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center space-x-3.5 shadow-sm">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Calendrier</span>
                <span className="text-base font-black text-slate-800 dark:text-white font-mono">{totalMyEvents}</span>
                <span className="text-[10px] text-slate-400 block">Événements académiques</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center space-x-3.5 shadow-sm">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Réussite Estimée</span>
                <span className="text-base font-black text-slate-800 dark:text-white font-mono">84.2%</span>
                <span className="text-[10px] text-emerald-600 block font-bold">Moyenne générale</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Class distribution & validation status */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Répartition et Statut par Classe</h3>
                  <p className="text-[10px] text-slate-400">Aperçu rapide du cycle de {activeCycle}</p>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-bold">
                  Total : {filteredClasses.length} classes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {filteredClasses.map(c => {
                  const classStudentsCount = students.filter(s => s.className === `${c.level} ${c.roomLetter}`).length;
                  const isValidated = validatedClasses.includes(`${c.level} ${c.roomLetter}`);
                  return (
                    <div key={c.id} className="p-3.5 border border-slate-100 dark:border-slate-850/60 bg-slate-50/50 dark:bg-slate-950/10 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">{c.level} {c.roomLetter}</span>
                        <div className="flex items-center space-x-1.5 text-[9px] text-slate-400">
                          <span>{classStudentsCount} / {c.maxStudents} Élèves</span>
                          <span>•</span>
                          <span className="truncate max-w-[110px]">{c.classTeacherName}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isValidated ? (
                          <span className="inline-flex items-center space-x-1 text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                            <Check className="h-3 w-3" />
                            <span>Validée</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[9px] bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <span>En révision</span>
                          </span>
                        )}
                        <button
                          onClick={() => setActiveSubTab("validation")}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                          title="Gérer"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Announcements & Recent Events widget */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Calendrier & Activités Récentes</h3>
                <p className="text-[10px] text-slate-400">Agenda pédagogique du cycle</p>
              </div>

              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-[11px] italic">
                    Aucun événement programmé dans ce cycle.
                  </div>
                ) : (
                  filteredEvents.map(ev => (
                    <div key={ev.id} className="p-3 border border-indigo-100/30 dark:border-slate-850 bg-indigo-50/10 dark:bg-indigo-950/10 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          ev.type === "Examen" ? "bg-red-50 text-red-500" :
                          ev.type === "Interrogation" ? "bg-amber-50 text-amber-500" :
                          ev.type === "Conseil de classe" ? "bg-purple-50 text-purple-500" :
                          "bg-sky-50 text-sky-500"
                        }`}>
                          {ev.type}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono font-bold">{ev.date} à {ev.time}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">{ev.title}</h4>
                      <p className="text-[10px] text-slate-500">{ev.description || "Aucune description supplémentaire."}</p>
                      <div className="flex items-center space-x-2 text-[9px] text-slate-400 mt-1 font-semibold">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>Local: {ev.room}</span>
                        <span>•</span>
                        <span>Classe: {ev.className}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PLANIFICATEUR D'HORAIRES CONFLICT-FREE */}
      {activeSubTab === "horaires" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Planner Form */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Générer un Créneau Horaire</h3>
                <p className="text-[10px] text-slate-400">Affectation pédagogique sans conflit</p>
              </div>

              <form onSubmit={handleSaveSchedule} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Année Scolaire</label>
                  <select
                    value={schedYear}
                    onChange={e => setSchedYear(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="2026-2027">2026-2027 (Actuelle)</option>
                    <option value="2027-2028">2027-2028</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Jour</label>
                    <select
                      value={schedDay}
                      onChange={e => setSchedDay(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                    >
                      <option value="Lundi">Lundi</option>
                      <option value="Mardi">Mardi</option>
                      <option value="Mercredi">Mercredi</option>
                      <option value="Jeudi">Jeudi</option>
                      <option value="Vendredi">Vendredi</option>
                      <option value="Samedi">Samedi</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Période / Heure</label>
                    <select
                      value={schedPeriod}
                      onChange={e => setSchedPeriod(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                    >
                      <option value="1ère Heure (07h30-08h20)">1ère Heure</option>
                      <option value="2ème Heure (08h20-09h10)">2ème Heure</option>
                      <option value="3ème Heure (09h10-10h00)">3ème Heure</option>
                      <option value="4ème Heure (10h30-11h20)">4ème Heure</option>
                      <option value="5ème Heure (11h20-12h10)">5ème Heure</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Classe cible</label>
                  <select
                    value={schedClass}
                    onChange={e => setSchedClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    {filteredClasses.map(c => {
                      const label = `${c.level} ${c.roomLetter}`;
                      return (
                        <option key={c.id} value={label}>{label}</option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Matière / Cours</label>
                  <select
                    value={schedSubject}
                    onChange={e => setSchedSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.category})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Enseignant / Éducateur</label>
                  <select
                    value={schedTeacher}
                    onChange={e => setSchedTeacher(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={`${t.firstName} ${t.lastName}`}>
                        {t.firstName} {t.lastName} ({t.specialty || "Titulaire"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Local / Salle de classe</label>
                  <input
                    required
                    placeholder="Ex: Salle 101, Espace Éveil, Labo Physique"
                    value={schedRoom}
                    onChange={e => setSchedRoom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Real-time Validation Banners */}
                <div className="pt-2">
                  {conflicts.length > 0 ? (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl space-y-1 text-red-700 dark:text-red-400">
                      <div className="flex items-center space-x-1 font-bold">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Conflit(s) Détecté(s) !</span>
                      </div>
                      <ul className="list-disc pl-4 text-[10px] space-y-1">
                        {conflicts.map((c, i) => (
                          <li key={i}><strong>[{c.type}]</strong> {c.message}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Créneau disponible (Aucun conflit)</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={conflicts.length > 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold p-3 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Confirmer et Publier l'Horaire
                </button>
              </form>
            </div>

            {/* Grid Preview */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Aperçu Grille horaire : {schedClass || "Sélectionnez"}</h3>
                  <p className="text-[10px] text-slate-400">Mise à jour automatique pour les Élèves, Profs & Parents concernés</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950">
                      <th className="border border-slate-200 dark:border-slate-800 p-2 font-bold">Créneau / Heure</th>
                      {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map(d => (
                        <th key={d} className="border border-slate-200 dark:border-slate-800 p-2 font-bold">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "1ère Heure (07h30-08h20)",
                      "2ème Heure (08h20-09h10)",
                      "3ème Heure (09h10-10h00)",
                      "4ème Heure (10h30-11h20)",
                      "5ème Heure (11h20-12h10)"
                    ].map(period => (
                      <tr key={period}>
                        <td className="border border-slate-200 dark:border-slate-800 p-2 font-bold bg-slate-50 dark:bg-slate-950 text-[9px]">{period}</td>
                        {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map(day => {
                          const normalizedPeriod = period.split(" ")[0];
                          const entry = filteredTimetable.find(t => 
                            t.className === schedClass && 
                            t.day === day && 
                            t.period.startsWith(normalizedPeriod)
                          );
                          return (
                            <td key={day} className="border border-slate-200 dark:border-slate-800 p-2 text-center h-16">
                              {entry ? (
                                <div className="space-y-1 relative group">
                                  {onDeleteTimetableEntry && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteTimetableEntry(entry.id)}
                                      className="absolute -top-1.5 -right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 rounded p-0.5 cursor-pointer"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{entry.subjectName}</span>
                                  <span className="text-[9px] text-slate-400 block truncate">{entry.teacherName}</span>
                                  <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[8px] px-1 py-0.2 rounded font-black font-mono">{entry.room}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-700 italic">Libre</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CALENDRIER PEDAGOGIQUE */}
      {activeSubTab === "calendar" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Event Form */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Créer une Évaluation / Événement</h3>
                <p className="text-[10px] text-slate-400">Notification instantanée aux concernés</p>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Intitulé de l'Événement</label>
                  <input
                    required
                    placeholder="Ex: Interrogation de Chimie, Réunion des Profs"
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Type d'Événement</label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="Examen">Examen trimestriel</option>
                    <option value="Interrogation">Interrogation standard</option>
                    <option value="Devoir commun">Devoir commun (À faire)</option>
                    <option value="Réunion pédagogique">Réunion pédagogique</option>
                    <option value="Conseil de classe">Conseil de classe</option>
                    <option value="Journée pédagogique">Journée pédagogique</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Date</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Heure</label>
                    <input
                      type="time"
                      required
                      value={eventTime}
                      onChange={e => setEventTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Local / Salle</label>
                    <input
                      placeholder="Ex: Salle de fête, Labo"
                      value={eventRoom}
                      onChange={e => setEventRoom(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Classe Concernée</label>
                    <select
                      value={eventClass}
                      onChange={e => setEventClass(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                    >
                      <option value="Toutes">Toutes les classes</option>
                      {filteredClasses.map(c => (
                        <option key={c.id} value={`${c.level} ${c.roomLetter}`}>{c.level} {c.roomLetter}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Consignes / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Entrez les détails ou consignes particulières..."
                    value={eventDesc}
                    onChange={e => setEventDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Publier l'Événement & Notifier
                </button>
              </form>
            </div>

            {/* Event List Preview */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Calendrier de Planification Académique</h3>
                <p className="text-[10px] text-slate-400">Calendrier d'examen et d'activités homologuées pour les cycles {activeCycle}</p>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredEvents.map(ev => (
                  <div key={ev.id} className="p-4 border border-slate-150 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1.5 flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          ev.type === "Examen" ? "bg-red-50 text-red-500 border border-red-200" :
                          ev.type === "Interrogation" ? "bg-amber-50 text-amber-500 border border-amber-200" :
                          ev.type === "Conseil de classe" ? "bg-purple-50 text-purple-500 border border-purple-200" :
                          "bg-sky-50 text-sky-500 border border-sky-200"
                        }`}>
                          {ev.type}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 font-bold">{ev.date} à {ev.time}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{ev.title}</h4>
                      <p className="text-[10px] text-slate-500">{ev.description}</p>
                      <div className="flex items-center space-x-3 text-[9px] text-slate-400 font-bold">
                        <span className="flex items-center space-x-1">
                          <School className="h-3 w-3 shrink-0" />
                          <span>Classe : {ev.className}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>Localisation : {ev.room}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUIVI DES ENSEIGNANTS */}
      {activeSubTab === "teachers" && (
        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Suivi des Absences & Présences du Personnel Enseignant</h3>
              <p className="text-[10px] text-slate-400">Cahier de suivi administratif quotidien pour les classes de {activeCycle}</p>
            </div>
            <div className="flex items-center space-x-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
              <span>Date : {new Date().toLocaleDateString("fr-FR")}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 uppercase tracking-wider text-[9px] font-extrabold">
                  <th className="py-3 px-2">Enseignant / Éducateur</th>
                  <th className="py-3 px-2">Matricule</th>
                  <th className="py-3 px-2">Sujet de spécialité</th>
                  <th className="py-3 px-2">Statut Quotidien</th>
                  <th className="py-3 px-2 text-right">Actions rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {teachers.map(t => {
                  const status = teacherPresence[t.id] || "present";
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-100">
                        {t.firstName} {t.lastName}
                      </td>
                      <td className="py-3.5 px-2 font-mono text-slate-400 text-[10px] font-bold">
                        {t.id.toUpperCase().slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-slate-500">
                        {t.specialty || "Titulaire Général"}
                      </td>
                      <td className="py-3.5 px-2">
                        {status === "present" && (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">Present</span>
                        )}
                        {status === "absent" && (
                          <span className="bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">Absent</span>
                        )}
                        {status === "retard" && (
                          <span className="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">Retard</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right space-x-1.5">
                        <button
                          onClick={() => handleToggleTeacherPresence(t.id, "present")}
                          className={`px-2 py-1 rounded font-bold text-[9px] uppercase cursor-pointer ${
                            status === "present" ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          onClick={() => handleToggleTeacherPresence(t.id, "retard")}
                          className={`px-2 py-1 rounded font-bold text-[9px] uppercase cursor-pointer ${
                            status === "retard" ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          Retard
                        </button>
                        <button
                          onClick={() => handleToggleTeacherPresence(t.id, "absent")}
                          className={`px-2 py-1 rounded font-bold text-[9px] uppercase cursor-pointer ${
                            status === "absent" ? "bg-red-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          Absent
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VALIDATION DES NOTES BEFORE BULLETINS */}
      {activeSubTab === "validation" && (
        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Sceau Officiel & Validation des Bulletins</h3>
            <p className="text-[10px] text-slate-400">Verrouillage des registres de cotes et autorisation d'impression des bulletins par le chef d'établissement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.map(c => {
              const fullClsName = `${c.level} ${c.roomLetter}`;
              const classStudents = students.filter(s => s.className === fullClsName);
              const isValidated = validatedClasses.includes(fullClsName);
              const averagePointsInClass = 78.4; // simulated moyenne générale

              return (
                <div key={c.id} className="p-4 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-4 bg-slate-50/50 dark:bg-slate-950/20 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{fullClsName}</span>
                      <p className="text-[10px] text-slate-400">Moyenne trimestrielle de classe : <strong className="text-indigo-600">{averagePointsInClass}%</strong></p>
                    </div>
                    {isValidated ? (
                      <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center space-x-1">
                        <Check className="h-3 w-3" />
                        <span>Bulletins Validés</span>
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span>En révision</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    <div className="bg-white dark:bg-slate-900 p-2 border rounded-xl">
                      <span className="block text-slate-400 font-medium">Inscrits</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white font-mono">{classStudents.length}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 border rounded-xl">
                      <span className="block text-slate-400 font-medium">Cotes Saisies</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white font-mono">100%</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 border rounded-xl">
                      <span className="block text-slate-400 font-medium">Enseignants</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white font-mono">100% Ok</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 italic">Dernière modification : Aujourd'hui</span>
                    <button
                      onClick={() => toggleValidateClass(fullClsName)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center space-x-1.5 ${
                        isValidated 
                          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                      }`}
                    >
                      {isValidated ? (
                        <>
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>Déverrouiller les points</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>Valider & Sceller bulletins</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. MATERNELLE COMPLEMENTARY SPECIAL VIEW */}
      {isMaternelle && activeSubTab === "maternelle" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Observation Logs */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Cahier d'Observations Pédagogiques (Maternelle)</h3>
                <p className="text-[10px] text-slate-400">Suivi du développement sensoriel et cognitif des tout-petits</p>
              </div>

              <form onSubmit={handleAddObservation} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  required
                  placeholder="Nom de l'enfant..."
                  value={obsChild}
                  onChange={e => setObsChild(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold focus:ring-1 focus:ring-pink-500 focus:outline-none col-span-1"
                />
                <select
                  value={obsArea}
                  onChange={e => setObsArea(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold col-span-1"
                >
                  <option value="Motricité">Motricité Fine / Globale</option>
                  <option value="Langage">Langage & Chant</option>
                  <option value="Socialisation">Socialisation & Jeux</option>
                  <option value="Autonomie">Autonomie & Repos</option>
                </select>
                <input
                  required
                  placeholder="Remarques et observations..."
                  value={obsText}
                  onChange={e => setObsText(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold focus:ring-1 focus:ring-pink-500 focus:outline-none col-span-1"
                />
                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold p-2.5 rounded-xl transition-all cursor-pointer shadow-sm sm:col-span-3 text-[10px]"
                >
                  Enregistrer l'Observation
                </button>
              </form>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {nurseryObservations.map(obs => (
                  <div key={obs.id} className="p-3 bg-pink-50/10 dark:bg-pink-950/10 border border-pink-100/20 dark:border-pink-900/10 rounded-xl space-y-1">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-pink-600 dark:text-pink-400 font-black">{obs.child}</span>
                      <span className="text-slate-400 font-mono">{obs.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-700 dark:text-slate-300">
                      <strong className="text-indigo-600 mr-1">[{obs.area}] :</strong> {obs.obs}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nursery Activities */}
            <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-sans">Activités d'Éveil & Jeux</h3>
                <p className="text-[10px] text-slate-400">Programme ludique d'activités quotidiennes pour la maternelle</p>
              </div>

              <form onSubmit={handleAddActivity} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    placeholder="Titre de l'activité..."
                    value={actTitle}
                    onChange={e => setActTitle(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold focus:ring-1 focus:ring-pink-500 focus:outline-none text-xs"
                  />
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={e => setActDate(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold focus:ring-1 focus:ring-pink-500 focus:outline-none text-xs"
                  />
                </div>
                <input
                  required
                  placeholder="Objectif d'éveil ou description..."
                  value={actDesc}
                  onChange={e => setActDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold focus:ring-1 focus:ring-pink-500 focus:outline-none text-xs"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl transition-all cursor-pointer shadow-sm text-[10px]"
                >
                  Publier l'Activité Maternelle
                </button>
              </form>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {nurseryActivities.map(act => (
                  <div key={act.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border rounded-xl space-y-1">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-slate-800 dark:text-slate-200 font-extrabold">{act.title}</span>
                      <span className="text-slate-400 font-mono">{act.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{act.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
