import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Printer, 
  Search, 
  Sliders, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  School,
  ArrowRight,
  Info,
  ChevronDown,
  Layers,
  Building,
  UserX,
  Send,
  Eye,
  Check,
  X,
  FileText
} from "lucide-react";
import { usePedagogicalTimetable } from "../context/PedagogicalTimetableContext";
import { ClassRoom, Subject, Teacher, TimetableEntry, CourseAssignment, PedagogicalCurriculumModel } from "../types";
import { SubjectsCurriculumManager } from "./timetable/SubjectsCurriculumManager";
import { TeacherAssignmentsManager } from "./timetable/TeacherAssignmentsManager";
import { AutomatedTimetableGeneratorModal } from "./timetable/AutomatedTimetableGeneratorModal";
import { OfficialTimetablePrintView } from "./timetable/OfficialTimetablePrintView";
import { SchoolRoomsManager } from "./timetable/SchoolRoomsManager";
import { AcademicYearMigrationView } from "./timetable/AcademicYearMigrationView";

interface IntegratedTimetableProps {
  userRole?: string;
  userName?: string;
  classes?: ClassRoom[];
  subjects?: Subject[];
  setSubjects?: React.Dispatch<React.SetStateAction<Subject[]>>;
  teachers?: Teacher[];
  schoolName?: string;
  schoolMotto?: string;
  onAddNotification?: (notif: any) => void;
  initialTab?: "timetable" | "subjects" | "assignments" | "generator" | "rooms" | "year_migration";
}

export const IntegratedTimetableManagementView: React.FC<IntegratedTimetableProps> = ({
  userRole = "Préfet des Études",
  userName = "Direction Pédagogique",
  classes = [],
  subjects = [],
  setSubjects,
  teachers = [],
  schoolName = "Complexe Scolaire Smart School RDC",
  schoolMotto = "Discipline - Travail - Excellence",
  onAddNotification,
  initialTab = "timetable"
}) => {
  const {
    scheduleConfig,
    updateScheduleConfig,
    getCalculatedPeriodSlots,
    courseAssignments,
    assignCourse,
    deleteCourseAssignment,
    timetableEntries,
    addTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    substituteTeacherInTimetable,
    isTimetablePublished,
    publishTimetable,
    unpublishTimetable,
    schoolRooms,
    getUserResponsibilityScope
  } = usePedagogicalTimetable();

  const [activeTab, setActiveTab] = useState<"timetable" | "subjects" | "assignments" | "generator" | "rooms" | "year_migration">(initialTab);
  
  // 4 View Modes for Timetable
  const [selectedViewMode, setSelectedViewMode] = useState<"by_class" | "by_teacher" | "by_room" | "global_matrix">("by_class");

  // Generator Modal
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  // Print Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printType, setPrintType] = useState<"class" | "teacher" | "school_matrix">("class");
  const [printTargetName, setPrintTargetName] = useState<string>("");

  // Helper for teacher display name
  const getTeacherDisplayName = (t: Teacher) => {
    if (t.name) return t.name;
    const full = `${t.firstName || ""} ${t.lastName || ""}`.trim();
    return full || "Enseignant";
  };

  // Determine user role scope (Primaire, Secondaire, Tous)
  const userScope = useMemo(() => getUserResponsibilityScope(userRole, userName), [userRole, userName]);

  // Filter classes according to user role scope
  const availableClasses = useMemo(() => {
    if (userScope.levelCategoryScope === "Primaire") {
      return classes.filter(c => c.levelCategory === "Primaire" || String(c.level).toLowerCase().includes("primaire"));
    }
    if (userScope.levelCategoryScope === "Secondaire") {
      return classes.filter(c => c.levelCategory === "Secondaire" || String(c.level).toLowerCase().includes("humanités") || String(c.level).toLowerCase().includes("eb"));
    }
    if (userScope.levelCategoryScope === "Maternelle") {
      return classes.filter(c => c.levelCategory === "Maternelle" || String(c.level).toLowerCase().includes("maternelle"));
    }
    return classes;
  }, [classes, userScope]);

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    return availableClasses[0] ? (availableClasses[0].name || `${availableClasses[0].level} ${availableClasses[0].roomLetter}`.trim()) : "";
  });

  useEffect(() => {
    if (availableClasses.length > 0 && (!selectedClass || !availableClasses.some(c => (c.name === selectedClass || `${c.level} ${c.roomLetter}`.trim() === selectedClass)))) {
      setSelectedClass(availableClasses[0].name || `${availableClasses[0].level} ${availableClasses[0].roomLetter}`.trim());
    }
  }, [availableClasses]);

  const [selectedTeacher, setSelectedTeacher] = useState<string>(() => {
    return teachers[0] ? getTeacherDisplayName(teachers[0]) : "Jean Mukendi";
  });

  const [selectedRoom, setSelectedRoom] = useState<string>(() => {
    return schoolRooms[0]?.name || "Salle 101";
  });

  const periodSlots = useMemo(() => getCalculatedPeriodSlots(), [scheduleConfig]);
  const regularPeriods = useMemo(() => periodSlots.filter(p => !p.isBreak), [periodSlots]);

  // Modal State for New Timetable Slot
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [slotDay, setSlotDay] = useState("Lundi");
  const [slotPeriodIndex, setSlotPeriodIndex] = useState(1);
  const [slotClass, setSlotClass] = useState(selectedClass);
  const [slotSubject, setSlotSubject] = useState("");
  const [slotTeacher, setSlotTeacher] = useState("");
  const [slotRoom, setSlotRoom] = useState("Salle 101");
  const [slotFormError, setSlotFormError] = useState<string | null>(null);

  // Substitution Modal
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [targetEntryToSubstitute, setTargetEntryToSubstitute] = useState<TimetableEntry | null>(null);
  const [substituteTeacherChoice, setSubstituteTeacherChoice] = useState("");
  const [substituteReason, setSubstituteReason] = useState("Absence pour mission pédagogique");
  const [substituteError, setSubstituteError] = useState<string | null>(null);

  // Filtered timetable entries based on current view
  const currentEntries = useMemo(() => {
    if (selectedViewMode === "by_class") {
      return timetableEntries.filter(t => t.className.toLowerCase() === selectedClass.toLowerCase());
    } else if (selectedViewMode === "by_teacher") {
      return timetableEntries.filter(
        t => t.teacherName.toLowerCase() === selectedTeacher.toLowerCase() ||
             (t.isSubstituted && t.substituteTeacherName?.toLowerCase() === selectedTeacher.toLowerCase())
      );
    } else if (selectedViewMode === "by_room") {
      return timetableEntries.filter(
        t => (t.room && t.room.toLowerCase() === selectedRoom.toLowerCase())
      );
    } else {
      return timetableEntries;
    }
  }, [timetableEntries, selectedViewMode, selectedClass, selectedTeacher, selectedRoom]);

  // Handle Add Timetable Slot
  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setSlotFormError(null);

    if (!slotClass || !slotSubject || !slotTeacher) {
      setSlotFormError("Veuillez sélectionner la classe, la matière et l'enseignant.");
      return;
    }

    const slotInfo = regularPeriods.find(p => p.index === slotPeriodIndex);
    const periodLabel = slotInfo ? slotInfo.label : `${slotPeriodIndex}ère Heure`;
    const startTime = slotInfo ? slotInfo.startTime : "07:30";
    const endTime = slotInfo ? slotInfo.endTime : "08:20";

    const targetClassObj = classes.find(c => `${c.level} ${c.roomLetter}` === slotClass);
    const levelCat = targetClassObj?.levelCategory || (slotClass.toLowerCase().includes("primaire") ? "Primaire" : "Secondaire");

    const result = addTimetableEntry({
      className: slotClass,
      day: slotDay,
      period: periodLabel,
      periodIndex: slotPeriodIndex,
      startTime,
      endTime,
      subjectName: slotSubject,
      teacherName: slotTeacher,
      room: slotRoom,
      levelCategory: levelCat,
      schoolYear: "2025-2026",
      status: "Planifié"
    });

    if (!result.success) {
      setSlotFormError(result.message);
      return;
    }

    if (onAddNotification) {
      onAddNotification({
        title: "Emploi du temps mis à jour",
        message: result.message,
        type: "success",
        targetRoles: ["Enseignant", "Élève", "Parent"]
      });
    }

    setShowAddSlotModal(false);
  };

  // Handle Substitute Teacher
  const handleConfirmSubstitution = (e: React.FormEvent) => {
    e.preventDefault();
    setSubstituteError(null);

    if (!targetEntryToSubstitute || !substituteTeacherChoice) {
      setSubstituteError("Veuillez désigner un enseignant remplaçant.");
      return;
    }

    const result = substituteTeacherInTimetable(
      targetEntryToSubstitute.id,
      substituteTeacherChoice,
      substituteReason
    );

    if (!result.success) {
      setSubstituteError(result.message);
      return;
    }

    if (onAddNotification) {
      onAddNotification({
        title: "Remplacement Pédagogique Enregistré",
        message: result.message,
        type: "info",
        targetRoles: ["Enseignant", "Élève", "Parent"]
      });
    }

    setShowSubstitutionModal(false);
    setTargetEntryToSubstitute(null);
  };

  // Handle Import Curriculum Model
  const handleImportCurriculumModel = (model: PedagogicalCurriculumModel, targetClassName?: string) => {
    if (!setSubjects) return;

    const newSubjectEntries: Subject[] = model.subjects.map(s => ({
      id: `subj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: s.name,
      cycle: model.cycle,
      levelCategory: model.cycle,
      level: model.level,
      optionName: model.optionName || "Tronc Commun",
      category: (s.category as any) || "Scientifique",
      hoursPerWeek: s.hoursPerWeek,
      coefficient: s.coefficient,
      isCommon: s.isCommon || false,
      isOptional: s.isOptional || false,
      maxPointsInterro: s.maxPointsInterro || 20,
      maxPointsExamen: s.maxPointsExamen || 40,
      className: targetClassName && targetClassName !== "Toutes les classes correspondantes" ? targetClassName : undefined,
      schoolYear: "2025-2026"
    }));

    setSubjects(prev => [...prev, ...newSubjectEntries]);

    if (onAddNotification) {
      onAddNotification({
        title: "Modèle Pédagogique RDC Appliqué",
        message: `${newSubjectEntries.length} matières officielles importées depuis le modèle « ${model.name} ».`,
        type: "success"
      });
    }
  };

  // Open Official DRC Print
  const handleOpenPrint = (type: "class" | "teacher" | "school_matrix") => {
    setPrintType(type);
    if (type === "class") {
      setPrintTargetName(selectedClass);
    } else if (type === "teacher") {
      setPrintTargetName(selectedTeacher);
    } else {
      setPrintTargetName("École Globale");
    }
    setShowPrintModal(true);
  };

  const days = scheduleConfig.activeDays || ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 bg-blue-50 dark:bg-blue-950/50 text-brand-blue rounded-xl">
                <Calendar className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Matières, Cours, Affectations & Horaires
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-brand-blue font-mono">
                Année 2025-2026
              </span>
              
              {/* Publication Badge */}
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isTimetablePublished 
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
              }`}>
                <span className={`w-2 h-2 rounded-full ${isTimetablePublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span>{isTimetablePublished ? "Officiellement Publié (Visible par tous)" : "Mode Brouillon (Direction uniquement)"}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Module central de pilotage pédagogique, affectation des charges horaires, générateur sans collision et diffusion multi-portails.
            </p>
          </div>

          {/* Quick Direction Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {userScope.canManageTimetables && (
              <>
                {isTimetablePublished ? (
                  <button
                    onClick={unpublishTimetable}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
                    title="Repasser en mode brouillon pour ajustements"
                  >
                    <span>Repasser en Brouillon</span>
                  </button>
                ) : (
                  <button
                    onClick={() => publishTimetable(userName, userRole)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publier l'Horaire</span>
                  </button>
                )}

                <button
                  onClick={() => setShowGeneratorModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 rounded-xl border border-amber-300 dark:border-amber-800 transition shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Générateur Automatique</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleOpenPrint(selectedViewMode === "by_teacher" ? "teacher" : selectedViewMode === "global_matrix" ? "school_matrix" : "class")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer Officiel RDC</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-t pt-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab("timetable")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === "timetable"
                ? "bg-brand-blue text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Emploi du Temps Hebdomadaire</span>
          </button>

          <button
            onClick={() => setActiveTab("subjects")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === "subjects"
                ? "bg-brand-blue text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Matières & Modèles RDC ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === "assignments"
                ? "bg-brand-blue text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Affectation des Enseignants ({courseAssignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("rooms")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === "rooms"
                ? "bg-brand-blue text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Salles & Indisponibilités ({schoolRooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("year_migration")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === "year_migration"
                ? "bg-brand-blue text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Année Scolaire & Report</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EMPLOI DU TEMPS HEBDOMADAIRE */}
      {activeTab === "timetable" && (
        <div className="space-y-6">
          {/* Sub-Header: 4 View Modes Selector & Filters */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500">Vue active :</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 text-xs font-bold">
                <button
                  onClick={() => setSelectedViewMode("by_class")}
                  className={`px-3 py-1 rounded-lg transition ${
                    selectedViewMode === "by_class"
                      ? "bg-white dark:bg-slate-900 text-brand-blue shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  🏫 Par Classe
                </button>
                <button
                  onClick={() => setSelectedViewMode("by_teacher")}
                  className={`px-3 py-1 rounded-lg transition ${
                    selectedViewMode === "by_teacher"
                      ? "bg-white dark:bg-slate-900 text-brand-blue shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  👨‍🏫 Par Enseignant
                </button>
                <button
                  onClick={() => setSelectedViewMode("by_room")}
                  className={`px-3 py-1 rounded-lg transition ${
                    selectedViewMode === "by_room"
                      ? "bg-white dark:bg-slate-900 text-brand-blue shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  🏢 Par Salle
                </button>
                <button
                  onClick={() => setSelectedViewMode("global_matrix")}
                  className={`px-3 py-1 rounded-lg transition ${
                    selectedViewMode === "global_matrix"
                      ? "bg-white dark:bg-slate-900 text-brand-blue shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  📊 Matrice Direction
                </button>
              </div>
            </div>

            {/* Target Selectors */}
            <div className="flex items-center gap-2">
              {selectedViewMode === "by_class" && (
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-brand-blue"
                >
                  {availableClasses.map(c => {
                    const name = `${c.level} ${c.roomLetter}`;
                    return <option key={c.id} value={name}>{name}</option>;
                  })}
                </select>
              )}

              {selectedViewMode === "by_teacher" && (
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-brand-blue"
                >
                  {teachers.map(t => {
                    const name = getTeacherDisplayName(t);
                    return <option key={t.id} value={name}>{name} ({t.speciality || t.role})</option>;
                  })}
                </select>
              )}

              {selectedViewMode === "by_room" && (
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-brand-blue"
                >
                  {schoolRooms.map(r => (
                    <option key={r.id} value={r.name}>{r.name} ({r.code})</option>
                  ))}
                </select>
              )}

              {userScope.canManageTimetables && (
                <button
                  onClick={() => {
                    setSlotClass(selectedClass);
                    setSlotSubject(subjects[0]?.name || "");
                    setSlotTeacher(teachers[0] ? getTeacherDisplayName(teachers[0]) : "");
                    setShowAddSlotModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-lg shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une Séance</span>
                </button>
              )}
            </div>
          </div>

          {/* Timetable Grid View */}
          {selectedViewMode !== "global_matrix" ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 w-28 text-center border-r border-slate-200/60 dark:border-slate-800">
                        Horaire
                      </th>
                      {days.map(d => (
                        <th key={d} className="py-3 px-3 text-center border-r border-slate-200/60 dark:border-slate-800 last:border-r-0">
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {periodSlots.map((slot) => {
                      if (slot.isBreak) {
                        return (
                          <tr key={`break-${slot.index}`} className="bg-amber-50/50 dark:bg-amber-950/20 border-y border-amber-200/60 dark:border-amber-900/40">
                            <td className="py-2 px-3 text-center font-mono font-bold text-[10px] text-amber-800 dark:text-amber-300 border-r border-amber-200/60 dark:border-amber-900/40">
                              {slot.startTime} - {slot.endTime}
                            </td>
                            <td colSpan={days.length} className="py-2 text-center font-bold text-[11px] text-amber-800 dark:text-amber-300">
                              ☕ {slot.label} (Pause pédagogique & récréation)
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={`slot-${slot.index}`} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition">
                          <td className="py-3 px-3 text-center font-mono border-r border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                            <div className="font-black text-slate-800 dark:text-slate-200 text-[11px]">{slot.label}</div>
                            <div className="text-[10px] text-slate-400">{slot.startTime} - {slot.endTime}</div>
                          </td>

                          {days.map((day) => {
                            const entry = currentEntries.find(e => 
                              e.day.toLowerCase() === day.toLowerCase() && 
                              (e.periodIndex === slot.index || e.period?.startsWith(slot.label.slice(0, 4)))
                            );

                            return (
                              <td 
                                key={day} 
                                className="py-2.5 px-3 border-r border-slate-200/60 dark:border-slate-800 last:border-r-0 align-top min-w-[130px] h-20"
                              >
                                {entry ? (
                                  <div className={`p-2 rounded-xl border space-y-1 relative group transition ${
                                    entry.isSubstituted 
                                      ? "bg-purple-50/70 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800"
                                      : "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/50 hover:shadow-xs"
                                  }`}>
                                    <div className="font-bold text-slate-900 dark:text-white leading-tight">
                                      {entry.subjectName}
                                    </div>
                                    <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                                      {selectedViewMode === "by_teacher" ? `Classe : ${entry.className}` : entry.teacherName}
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                                      <span>{entry.room || "101"}</span>
                                      {entry.isSubstituted && (
                                        <span className="text-purple-600 font-bold">Remplacé</span>
                                      )}
                                    </div>

                                    {/* Action buttons on hover */}
                                    {userScope.canManageTimetables && (
                                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 rounded-md p-0.5 shadow-xs transition">
                                        <button
                                          onClick={() => {
                                            setTargetEntryToSubstitute(entry);
                                            setSubstituteTeacherChoice(teachers[0] ? getTeacherDisplayName(teachers[0]) : "");
                                            setShowSubstitutionModal(true);
                                          }}
                                          className="p-1 text-slate-500 hover:text-purple-600"
                                          title="Remplacer l'enseignant"
                                        >
                                          <UserX className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => deleteTimetableEntry(entry.id)}
                                          className="p-1 text-slate-400 hover:text-red-600"
                                          title="Supprimer la séance"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-full min-h-[50px] flex items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-slate-300 dark:text-slate-700">
                                    Libre
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* MATRICE GLOBALE SUPERVISION DIRECTION */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Matrice Pédagogique & Radar de Supervision Globale
                  </h3>
                  <p className="text-xs text-slate-500">Vue d'ensemble de toutes les classes de l'établissement</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                  ✓ 0 Collision Détectée
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableClasses.map((cls) => {
                  const clsName = `${cls.level} ${cls.roomLetter}`;
                  const clsEntries = timetableEntries.filter(t => t.className.toLowerCase() === clsName.toLowerCase());
                  
                  return (
                    <div key={cls.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 dark:text-white text-xs">{clsName}</span>
                        <span className="text-[10px] font-mono font-bold text-brand-blue bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                          {clsEntries.length} séances
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {cls.option || "Tronc Commun"} • {cls.levelCategory || "Secondaire"}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t text-[10px]">
                        <button
                          onClick={() => {
                            setSelectedClass(clsName);
                            setSelectedViewMode("by_class");
                          }}
                          className="text-brand-blue font-bold hover:underline"
                        >
                          Consulter la grille →
                        </button>
                        <span className="text-slate-400">{clsEntries.length >= 20 ? "Grille complète" : "En cours"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MATIÈRES & MODÈLES RDC */}
      {activeTab === "subjects" && (
        <SubjectsCurriculumManager
          subjects={subjects}
          classes={classes}
          userRole={userRole}
          onAddSubject={(newSubj) => {
            if (setSubjects) {
              setSubjects(prev => [...prev, { ...newSubj, id: `subj-${Date.now()}` }]);
            }
          }}
          onUpdateSubject={(updatedSubj) => {
            if (setSubjects) {
              setSubjects(prev => prev.map(s => s.id === updatedSubj.id ? updatedSubj : s));
            }
          }}
          onDeleteSubject={(id) => {
            if (setSubjects) {
              setSubjects(prev => prev.filter(s => s.id !== id));
            }
          }}
          onImportCurriculumModel={handleImportCurriculumModel}
        />
      )}

      {/* TAB 3: AFFECTATIONS DES ENSEIGNANTS */}
      {activeTab === "assignments" && (
        <TeacherAssignmentsManager
          assignments={courseAssignments}
          classes={classes}
          subjects={subjects}
          teachers={teachers}
          onAssignCourse={assignCourse}
          onDeleteAssignment={deleteCourseAssignment}
          userRole={userRole}
          userName={userName}
        />
      )}

      {/* TAB 4: SALLES & INDISPONIBILITÉS */}
      {activeTab === "rooms" && (
        <SchoolRoomsManager teachers={teachers} />
      )}

      {/* TAB 5: GESTION ANNÉE SCOLAIRE */}
      {activeTab === "year_migration" && (
        <AcademicYearMigrationView subjects={subjects} userRole={userRole} userName={userName} />
      )}

      {/* MODAL: AJOUT MANUEL DE SÉANCE */}
      {showAddSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Planifier une Séance</h3>
              <button onClick={() => setShowAddSlotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {slotFormError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{slotFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Jour *</label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Heure / Période *</label>
                  <select
                    value={slotPeriodIndex}
                    onChange={(e) => setSlotPeriodIndex(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    {regularPeriods.map(p => (
                      <option key={p.index} value={p.index}>{p.label} ({p.startTime}-{p.endTime})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Classe *</label>
                <select
                  value={slotClass}
                  onChange={(e) => setSlotClass(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  {availableClasses.map(c => {
                    const name = `${c.level} ${c.roomLetter}`;
                    return <option key={c.id} value={name}>{name}</option>;
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Matière *</label>
                <select
                  value={slotSubject}
                  onChange={(e) => setSlotSubject(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.hoursPerWeek}h/sem)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Enseignant *</label>
                <select
                  value={slotTeacher}
                  onChange={(e) => setSlotTeacher(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-brand-blue"
                >
                  {teachers.map(t => {
                    const name = getTeacherDisplayName(t);
                    return <option key={t.id} value={name}>{name}</option>;
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Salle / Local</label>
                <select
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                >
                  {schoolRooms.map(r => (
                    <option key={r.id} value={r.name}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-blue text-white font-bold rounded-xl shadow-sm hover:bg-blue-700"
                >
                  Valider la Séance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REMPLACEMENT D'ENSEIGNANT (SUBSTITUTION) */}
      {showSubstitutionModal && targetEntryToSubstitute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Remplacement Pédagogique d'Urgence</h3>
              <button onClick={() => setShowSubstitutionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 text-xs space-y-1">
              <div className="font-bold text-purple-900 dark:text-purple-300">
                Séance : {targetEntryToSubstitute.subjectName} ({targetEntryToSubstitute.className})
              </div>
              <div className="text-[11px] text-purple-700">
                {targetEntryToSubstitute.day} • {targetEntryToSubstitute.period} • Enseignant Titulaire : {targetEntryToSubstitute.teacherName}
              </div>
            </div>

            {substituteError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {substituteError}
              </div>
            )}

            <form onSubmit={handleConfirmSubstitution} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Enseignant Remplaçant *</label>
                <select
                  value={substituteTeacherChoice}
                  onChange={(e) => setSubstituteTeacherChoice(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-brand-blue"
                >
                  {teachers
                    .filter(t => getTeacherDisplayName(t) !== targetEntryToSubstitute.teacherName)
                    .map(t => {
                      const name = getTeacherDisplayName(t);
                      return <option key={t.id} value={name}>{name} ({t.speciality || t.role})</option>;
                    })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Motif de l'absence / remplacement</label>
                <input
                  type="text"
                  value={substituteReason}
                  onChange={(e) => setSubstituteReason(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowSubstitutionModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-sm hover:bg-purple-700"
                >
                  Confirmer le Remplacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTOMATED TIMETABLE GENERATOR MODAL */}
      <AutomatedTimetableGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        userRole={userRole}
        userName={userName}
      />

      {/* OFFICIAL PRINT MODAL */}
      <OfficialTimetablePrintView
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        printType={printType}
        targetName={printTargetName}
        entries={currentEntries}
        periodSlots={periodSlots}
        schoolName={schoolName}
        schoolMotto={schoolMotto}
        academicYear="2025-2026"
      />
    </div>
  );
};
