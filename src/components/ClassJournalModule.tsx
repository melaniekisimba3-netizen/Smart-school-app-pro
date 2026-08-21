import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  UserCheck, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  FileText, 
  Award, 
  Check, 
  UserX, 
  Send, 
  Printer, 
  Layers, 
  ChevronRight, 
  Sparkles,
  Info,
  Building
} from "lucide-react";
import { usePedagogicalTimetable } from "../context/PedagogicalTimetableContext";
import { ClassJournalEntry, ClassRoom, Student, Teacher, TimetableEntry } from "../types";

interface ClassJournalModuleProps {
  userRole?: string;
  userName?: string;
  students?: Student[];
  classes?: ClassRoom[];
  teachers?: Teacher[];
  onAddNotification?: (notif: any) => void;
}

export const ClassJournalModule: React.FC<ClassJournalModuleProps> = ({
  userRole = "Enseignant",
  userName = "Jean Mukendi",
  students = [],
  classes = [],
  teachers = [],
  onAddNotification
}) => {
  const {
    classJournalEntries,
    saveClassJournalEntry,
    verifyClassJournalEntry,
    timetableEntries,
    getTeacherAssignments,
    getUserResponsibilityScope
  } = usePedagogicalTimetable();

  const userScope = useMemo(() => getUserResponsibilityScope(userRole, userName), [userRole, userName]);

  // Is teacher view or administrative supervision view?
  const isTeacher = userRole.toUpperCase().includes("ENSEIGNANT") || userRole.toUpperCase().includes("PROFESSEUR");
  const isAdminOrDirector = userScope.canValidateJournal;

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [selectedTimetableSlot, setSelectedTimetableSlot] = useState<TimetableEntry | null>(null);

  // New Journal Entry Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formClass, setFormClass] = useState(classes[0] ? `${classes[0].level} ${classes[0].roomLetter}` : "6ème Primaire A");
  const [formSubject, setFormSubject] = useState("Mathématiques");
  const [formPeriod, setFormPeriod] = useState("1ère Heure (07h30-08h20)");
  const [formStatus, setFormStatus] = useState<"Dispensé" | "Partiellement dispensé" | "Non dispensé" | "Rattrapé">("Dispensé");
  const [formLessonTitle, setFormLessonTitle] = useState("");
  const [formLessonObjectives, setFormLessonObjectives] = useState("");
  const [formLessonSummary, setFormLessonSummary] = useState("");
  const [formHomework, setFormHomework] = useState("");
  const [formHomeworkDate, setFormHomeworkDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]);
  const [formObservations, setFormObservations] = useState("");
  const [absentStudentsList, setAbsentStudentsList] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Visa Modal State for Director
  const [showVisaModal, setShowVisaModal] = useState(false);
  const [targetVisaEntry, setTargetVisaEntry] = useState<ClassJournalEntry | null>(null);
  const [visaNotes, setVisaNotes] = useState("Conforme au programme national de l'EPST.");

  // Teacher today's scheduled timetable slots
  const todayTimetableForTeacher = useMemo(() => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const currentDayName = days[new Date().getDay()];

    if (isTeacher) {
      return timetableEntries.filter(
        t => (t.teacherName.toLowerCase() === userName.toLowerCase() ||
              (t.isSubstituted && t.substituteTeacherName?.toLowerCase() === userName.toLowerCase())) &&
             t.day.toLowerCase() === currentDayName.toLowerCase()
      );
    }
    return timetableEntries.filter(t => t.day.toLowerCase() === currentDayName.toLowerCase());
  }, [timetableEntries, isTeacher, userName]);

  // Students of the selected class in form
  const currentClassStudents = useMemo(() => {
    return students.filter(s => s.className.toLowerCase() === formClass.toLowerCase());
  }, [students, formClass]);

  // Filtered Journal Entries
  const filteredJournalEntries = useMemo(() => {
    return classJournalEntries.filter((entry) => {
      if (isTeacher && entry.teacherName.toLowerCase() !== userName.toLowerCase()) {
        return false;
      }
      if (selectedClassFilter !== "Tous" && entry.className !== selectedClassFilter) {
        return false;
      }
      if (userScope.levelCategoryScope !== "Tous" && entry.levelCategory !== userScope.levelCategoryScope) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          entry.lessonTitle.toLowerCase().includes(q) ||
          entry.subjectName.toLowerCase().includes(q) ||
          entry.teacherName.toLowerCase().includes(q) ||
          entry.className.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [classJournalEntries, isTeacher, userName, selectedClassFilter, userScope, searchQuery]);

  const handleOpenNewEntryModal = (slot?: TimetableEntry) => {
    if (slot) {
      setSelectedTimetableSlot(slot);
      setFormClass(slot.className);
      setFormSubject(slot.subjectName);
      setFormPeriod(slot.period);
    } else {
      setSelectedTimetableSlot(null);
    }
    setFormLessonTitle("");
    setFormLessonObjectives("");
    setFormLessonSummary("");
    setFormHomework("");
    setAbsentStudentsList([]);
    setFormError(null);
    setShowAddEntryModal(true);
  };

  const handleToggleStudentAbsent = (studentName: string) => {
    setAbsentStudentsList(prev => 
      prev.includes(studentName) 
        ? prev.filter(s => s !== studentName) 
        : [...prev, studentName]
    );
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formLessonTitle.trim() || !formLessonSummary.trim()) {
      setFormError("Veuillez renseigner l'intitulé de la leçon et le résumé du cours dispensé.");
      return;
    }

    const targetClassObj = classes.find(c => `${c.level} ${c.roomLetter}` === formClass);
    const levelCat = targetClassObj?.levelCategory || (formClass.toLowerCase().includes("primaire") ? "Primaire" : "Secondaire");
    const totalStudents = currentClassStudents.length || 35;
    const presentStudents = totalStudents - absentStudentsList.length;

    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const currentDayName = days[new Date(formDate).getDay()] || "Lundi";

    const result = saveClassJournalEntry({
      schoolId: "sch-001",
      schoolYear: "2025-2026",
      timetableEntryId: selectedTimetableSlot?.id,
      date: formDate,
      day: currentDayName,
      periodLabel: formPeriod,
      className: formClass,
      levelCategory: levelCat,
      subjectName: formSubject,
      teacherId: "emp-1",
      teacherName: isTeacher ? userName : (selectedTimetableSlot?.teacherName || userName),
      status: formStatus,
      lessonTitle: formLessonTitle.trim(),
      lessonObjectives: formLessonObjectives.trim(),
      lessonSummary: formLessonSummary.trim(),
      homeworkAssigned: formHomework.trim() || undefined,
      homeworkDueDate: formHomework.trim() ? formHomeworkDate : undefined,
      attendanceRecorded: true,
      absentStudentIds: [],
      absentStudentNames: absentStudentsList,
      presentCount: presentStudents,
      totalCount: totalStudents,
      observations: formObservations.trim() || undefined,
      verifiedByDirector: false
    });

    if (result.success) {
      if (onAddNotification) {
        onAddNotification({
          title: "Journal de Classe Enregistré",
          message: `Leçon "${formLessonTitle}" enregistrée pour la classe ${formClass} (${formSubject}).`,
          type: "success",
          targetRoles: ["Directeur du Primaire", "Préfet des Études", "Parent"]
        });
      }
      setShowAddEntryModal(false);
    }
  };

  const handleApplyVisa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVisaEntry) return;

    verifyClassJournalEntry(targetVisaEntry.id, visaNotes);

    if (onAddNotification) {
      onAddNotification({
        title: "Visa de Direction Apposé",
        message: `La fiche de cours du ${targetVisaEntry.date} (${targetVisaEntry.subjectName} - ${targetVisaEntry.className}) a été validée par la Direction.`,
        type: "info",
        targetRoles: ["Enseignant"]
      });
    }

    setShowVisaModal(false);
    setTargetVisaEntry(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Journal de Classe Officiel EPST
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Traçabilité Pédagogique
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Cahier de Textes & Journal de Classe Quotidien
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Liaison directe avec l'emploi du temps : matières enseignées, objectifs pédagogiques, devoirs et visas de direction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenNewEntryModal()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Renseigner une Séance</span>
          </button>
        </div>
      </div>

      {/* TODAY'S SCHEDULED SESSIONS (QUICK FILL ACTION FOR TEACHERS) */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              Séances du Jour Programmées à l'Emploi du Temps
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {todayTimetableForTeacher.length} cours prévu(s) aujourd'hui
          </span>
        </div>

        {todayTimetableForTeacher.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayTimetableForTeacher.map((slot) => {
              const alreadyFilled = classJournalEntries.some(
                j => j.date === new Date().toISOString().split("T")[0] &&
                     (j.timetableEntryId === slot.id || (j.className === slot.className && j.periodLabel === slot.period))
              );

              return (
                <div
                  key={slot.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {slot.period}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {slot.room || "Salle"}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                      {slot.subjectName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Classe : {slot.className}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    {alreadyFilled ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Journal Renseigné</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenNewEntryModal(slot)}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Remplir le Journal</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-500 bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl text-center">
            Aucun cours planifié pour aujourd'hui selon l'emploi du temps officiel.
          </div>
        )}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre de leçon, matière, enseignant ou classe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-9 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Classe :</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500"
          >
            <option value="Tous">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={`${c.level} ${c.roomLetter}`}>
                {c.level} {c.roomLetter}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* JOURNAL ENTRIES LIST */}
      <div className="space-y-4">
        {filteredJournalEntries.length > 0 ? (
          filteredJournalEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
            >
              {/* TOP HEADER OF THE CARD */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {entry.className}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {entry.subjectName}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {entry.day} {entry.date} ({entry.periodLabel})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    entry.status === "Dispensé"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : entry.status === "Partiellement dispensé"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  }`}>
                    {entry.status}
                  </span>

                  {entry.verifiedByDirector ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Visé par la Direction</span>
                    </span>
                  ) : isAdminOrDirector ? (
                    <button
                      onClick={() => {
                        setTargetVisaEntry(entry);
                        setShowVisaModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      <span>Viser ce cours</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">
                      En attente de visa
                    </span>
                  )}
                </div>
              </div>

              {/* MAIN CONTENT */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {entry.lessonTitle}
                </h4>

                {entry.lessonObjectives && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    <strong className="text-slate-800 dark:text-slate-200">Objectifs opérationnels :</strong> {entry.lessonObjectives}
                  </p>
                )}

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white block mb-1">Résumé / Matière enseignée :</strong>
                  {entry.lessonSummary}
                </div>
              </div>

              {/* HOMEWORK & ATTENDANCE STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                {entry.homeworkAssigned ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                    <span className="font-bold block mb-0.5">📚 Devoir / Travail à domicile :</span>
                    <p className="text-[11px]">{entry.homeworkAssigned}</p>
                    {entry.homeworkDueDate && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 block">
                        À rendre pour le : {entry.homeworkDueDate}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 text-[11px]">
                    Aucun devoir à domicile prescrit.
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Appel de présence :
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {entry.presentCount || 0} / {entry.totalCount || 0} présents
                    </span>
                  </div>

                  {entry.absentStudentNames && entry.absentStudentNames.length > 0 && (
                    <div className="text-[10px] text-red-600 dark:text-red-400 mt-1">
                      Absents : {entry.absentStudentNames.join(", ")}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 mt-1">
                    Enseignant titulaire : {entry.teacherName}
                  </div>
                </div>
              </div>

              {/* DIRECTOR VISA NOTES IF PRESENT */}
              {entry.verifiedByDirector && entry.directorNotes && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[11px]">Remarques de la Direction / Inspection :</strong>
                    <span className="text-[11px]">{entry.directorNotes}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-2">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              Aucune entrée dans le journal de classe pour cette sélection
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Utilisez le bouton "Renseigner une Séance" ou sélectionnez une séance du jour pour consigner le contenu des leçons.
            </p>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: AJOUT D'UNE ENTRÉE DE JOURNAL DE CLASSE                        */}
      {/* --------------------------------------------------------------------- */}
      <AnimatePresence>
        {showAddEntryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Renseigner le Journal de Classe & Cahier de Textes</span>
                </h4>
                <button
                  onClick={() => setShowAddEntryModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveJournal} className="space-y-4 text-xs">
                {/* METADATA GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Date de la séance
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Classe
                    </label>
                    <select
                      value={formClass}
                      onChange={(e) => setFormClass(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={`${c.level} ${c.roomLetter}`}>
                          {c.level} {c.roomLetter}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Matière / Cours
                    </label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="Ex: Mathématiques, Français"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Période / Tranche horaire
                    </label>
                    <input
                      type="text"
                      value={formPeriod}
                      onChange={(e) => setFormPeriod(e.target.value)}
                      placeholder="Ex: 1ère Heure (07h30-08h20)"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Statut de la séance
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Dispensé">Dispensé (Séance tenue normalement)</option>
                      <option value="Partiellement dispensé">Partiellement dispensé</option>
                      <option value="Non dispensé">Non dispensé / Reporté</option>
                      <option value="Rattrapé">Rattrapé</option>
                    </select>
                  </div>
                </div>

                {/* LESSON DETAILS */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Intitulé / Sujet de la leçon *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLessonTitle}
                    onChange={(e) => setFormLessonTitle(e.target.value)}
                    placeholder="Ex: Résolution d'équations du second degré"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Objectifs Pédagogiques Opérationnels
                  </label>
                  <input
                    type="text"
                    value={formLessonObjectives}
                    onChange={(e) => setFormLessonObjectives(e.target.value)}
                    placeholder="À l'issue de la séance, l'élève sera capable de..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Résumé de la leçon / Notions abordées *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formLessonSummary}
                    onChange={(e) => setFormLessonSummary(e.target.value)}
                    placeholder="Détail des notions théoriques, exercices traités au tableau, travail en groupe..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                {/* HOMEWORK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Devoir à Domicile (Optionnel)
                    </label>
                    <input
                      type="text"
                      value={formHomework}
                      onChange={(e) => setFormHomework(e.target.value)}
                      placeholder="Ex: Exercices 1 à 3 page 78"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                      Date Limite de Remise
                    </label>
                    <input
                      type="date"
                      value={formHomeworkDate}
                      onChange={(e) => setFormHomeworkDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* FAST ATTENDANCE CHECKLIST */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300">
                      Appel & Absences de la séance ({currentClassStudents.length} élèves)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Cliquez pour marquer un élève absent
                    </span>
                  </div>

                  {currentClassStudents.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {currentClassStudents.map((std) => {
                        const studentName = std.fullName || `${std.firstName} ${std.lastName}`.trim();
                        const isAbsent = absentStudentsList.includes(studentName);
                        return (
                          <button
                            key={std.id}
                            type="button"
                            onClick={() => handleToggleStudentAbsent(studentName)}
                            className={`p-1.5 rounded-lg text-left text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              isAbsent
                                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <span className="truncate">{studentName}</span>
                            {isAbsent ? (
                              <UserX className="h-3 w-3 text-red-500 shrink-0 ml-1" />
                            ) : (
                              <UserCheck className="h-3 w-3 text-emerald-500 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Effectif classe standardisé : 35 élèves (présences validées).
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEntryModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Enregistrer dans le Journal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: VISA DE DIRECTION                                              */}
      {/* --------------------------------------------------------------------- */}
      <AnimatePresence>
        {showVisaModal && targetVisaEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <span>Visa Pédagogique de la Direction</span>
                </h4>
                <button
                  onClick={() => setShowVisaModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1">
                <div><strong>Leçon :</strong> {targetVisaEntry.lessonTitle}</div>
                <div><strong>Matière & Classe :</strong> {targetVisaEntry.subjectName} ({targetVisaEntry.className})</div>
                <div><strong>Enseignant :</strong> {targetVisaEntry.teacherName}</div>
                <div><strong>Date :</strong> {targetVisaEntry.date}</div>
              </div>

              <form onSubmit={handleApplyVisa} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                    Observations & Remarques Pédagogiques
                  </label>
                  <textarea
                    rows={3}
                    value={visaNotes}
                    onChange={(e) => setVisaNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVisaModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Valider le Visa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
