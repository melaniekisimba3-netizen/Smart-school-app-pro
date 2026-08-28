import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  CourseAssignment, 
  TimetableEntry, 
  SchoolScheduleConfig, 
  ClassJournalEntry, 
  PedagogicalForecast, 
  CourseReminder, 
  ResponsibilityScope,
  TimetablePeriodSlot,
  ClassRoom,
  Subject,
  Teacher,
  SchoolRoom,
  TeacherUnavailability,
  TimetablePublicationStatus,
  PedagogicalCurriculumModel
} from "../types";
import { safeLocalStorage } from "../utils/safeStorage";

import { DEFAULT_SCHOOL_ROOMS } from "../data/nationalCurriculumModels";
import { 
  generateAutomatedTimetable, 
  duplicateCurriculumAndScheduleToNewYear, 
  TimetableGenerationOptions, 
  TimetableGenerationReport 
} from "../services/timetableGeneratorService";
import { loadPersistentCollection, savePersistentCollection } from "../services/dataPersistenceService";

// ---------------------------------------------------------------------------
// DEFAULT INITIAL DATA FOR TIMETABLE & PEDAGOGY
// ---------------------------------------------------------------------------

export const DEFAULT_SCHEDULE_CONFIG: SchoolScheduleConfig = {
  id: "sch-config-default",
  schoolId: "sch-001",
  startTime: "07:30",
  endTime: "13:10",
  periodDurationMinutes: 50,
  periodsPerDay: 6,
  breakSlots: [
    {
      name: "Récréation Principale",
      startPeriodIndex: 3, // after 3rd period
      durationMinutes: 30,
      startTime: "10:00",
      endTime: "10:30"
    }
  ],
  activeDays: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
  rooms: DEFAULT_SCHOOL_ROOMS,
  teacherUnavailabilities: [],
  isPublished: true,
  publicationStatus: {
    schoolId: "sch-001",
    schoolYear: "2025-2026",
    isPublished: true,
    publishedAt: new Date().toLocaleDateString("fr-FR"),
    publishedBy: "Direction des Études",
    publishedByRole: "Directeur des Études"
  }
};

export const INITIAL_COURSE_ASSIGNMENTS: CourseAssignment[] = [];

export const INITIAL_TIMETABLE_ENTRIES: TimetableEntry[] = [];

export const INITIAL_CLASS_JOURNAL_ENTRIES: ClassJournalEntry[] = [];

export const INITIAL_PEDAGOGICAL_FORECASTS: PedagogicalForecast[] = [];

// ---------------------------------------------------------------------------
// CONTEXT INTERFACE
// ---------------------------------------------------------------------------

interface ConflictCheckResult {
  hasConflict: boolean;
  type?: "teacher_busy" | "class_busy" | "room_busy";
  message?: string;
  conflictingEntry?: TimetableEntry;
}

interface PedagogicalTimetableContextType {
  scheduleConfig: SchoolScheduleConfig;
  updateScheduleConfig: (newConfig: Partial<SchoolScheduleConfig>) => void;
  getCalculatedPeriodSlots: () => TimetablePeriodSlot[];
  
  // Course Assignments (Attribution Matières & Classes)
  courseAssignments: CourseAssignment[];
  assignCourse: (asg: Omit<CourseAssignment, "id" | "assignedDate">) => { success: boolean; message: string; assignment?: CourseAssignment };
  updateCourseAssignment: (asg: CourseAssignment) => void;
  deleteCourseAssignment: (id: string) => { success: boolean; message: string };
  getTeacherAssignments: (teacherNameOrId: string) => CourseAssignment[];
  getClassAssignments: (className: string) => CourseAssignment[];
  
  // Timetable (Emploi du temps)
  timetableEntries: TimetableEntry[];
  setTimetableEntries: React.Dispatch<React.SetStateAction<TimetableEntry[]>>;
  checkTimetableConflict: (candidate: Omit<TimetableEntry, "id">, ignoreId?: string) => ConflictCheckResult;
  addTimetableEntry: (entry: Omit<TimetableEntry, "id">) => { success: boolean; message: string; entry?: TimetableEntry };
  updateTimetableEntry: (entry: TimetableEntry) => { success: boolean; message: string };
  deleteTimetableEntry: (id: string) => void;
  substituteTeacherInTimetable: (entryId: string, substituteTeacherName: string, reason?: string) => { success: boolean; message: string };
  
  // Publication & Status
  isTimetablePublished: boolean;
  publishTimetable: (publishedBy: string, publishedByRole: string, notes?: string) => void;
  unpublishTimetable: () => void;

  // Rooms & Teacher Unavailabilities
  schoolRooms: SchoolRoom[];
  addSchoolRoom: (room: SchoolRoom) => void;
  deleteSchoolRoom: (id: string) => void;
  teacherUnavailabilities: TeacherUnavailability[];
  addTeacherUnavailability: (unav: TeacherUnavailability) => void;
  deleteTeacherUnavailability: (id: string) => void;

  // Automated Schedule Generation & Year Duplicate
  runAutoScheduleGeneration: (
    classes: ClassRoom[],
    subjects: Subject[],
    teachers: Teacher[],
    options?: Partial<TimetableGenerationOptions>
  ) => TimetableGenerationReport;
  duplicateYearConfig: (
    sourceYear: string,
    targetYear: string,
    schoolId: string,
    currentSubjects: Subject[]
  ) => { newSubjects: Subject[]; newAssignments: CourseAssignment[]; newTimetable: TimetableEntry[]; message: string };
  
  // Class Journal (Journal de Classe)
  classJournalEntries: ClassJournalEntry[];
  saveClassJournalEntry: (entry: Omit<ClassJournalEntry, "id" | "createdAt">) => { success: boolean; message: string; entry?: ClassJournalEntry };
  verifyClassJournalEntry: (id: string, directorNotes: string) => void;
  getJournalForClass: (className: string) => ClassJournalEntry[];
  getJournalForTeacher: (teacherName: string) => ClassJournalEntry[];
  getTodayPendingCoursesForTeacher: (teacherName: string) => TimetableEntry[];

  // Pedagogical Forecasts (Planificateur & Progression)
  pedagogicalForecasts: PedagogicalForecast[];
  addPedagogicalForecast: (forecast: Omit<PedagogicalForecast, "id">) => void;
  updatePedagogicalForecast: (forecast: PedagogicalForecast) => void;
  deletePedagogicalForecast: (id: string) => void;
  getSyllabusCoverageRate: (className: string, subjectName: string) => { plannedHours: number; completedHours: number; percent: number };

  // Reminders & Active Notifications
  courseReminders: CourseReminder[];
  dismissReminder: (id: string) => void;
  generateDailyRemindersForTeacher: (teacherName: string) => CourseReminder[];

  // RBAC & Responsibility Scopes
  getUserResponsibilityScope: (userRole: string, userName: string) => ResponsibilityScope;
}

const PedagogicalTimetableContext = createContext<PedagogicalTimetableContextType | undefined>(undefined);

export const PedagogicalTimetableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with persistence
  const [scheduleConfig, setScheduleConfig] = useState<SchoolScheduleConfig>(() => {
    const saved = safeLocalStorage.getItem("ss_school_schedule_config");
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE_CONFIG;
  });

  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>(() => {
    const saved = safeLocalStorage.getItem("ss_course_assignments");
    return saved ? JSON.parse(saved) : INITIAL_COURSE_ASSIGNMENTS;
  });

  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(() => {
    const saved = safeLocalStorage.getItem("ss_timetable_entries_v2");
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE_ENTRIES;
  });

  const [isTimetablePublished, setIsTimetablePublished] = useState<boolean>(() => {
    const saved = safeLocalStorage.getItem("ss_timetable_published_state");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [schoolRooms, setSchoolRooms] = useState<SchoolRoom[]>(() => {
    const saved = safeLocalStorage.getItem("ss_school_rooms_catalog");
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_ROOMS;
  });

  const [teacherUnavailabilities, setTeacherUnavailabilities] = useState<TeacherUnavailability[]>(() => {
    const saved = safeLocalStorage.getItem("ss_teacher_unavailabilities");
    return saved ? JSON.parse(saved) : [];
  });

  const [classJournalEntries, setClassJournalEntries] = useState<ClassJournalEntry[]>(() => {
    const saved = safeLocalStorage.getItem("ss_class_journal_entries");
    return saved ? JSON.parse(saved) : INITIAL_CLASS_JOURNAL_ENTRIES;
  });

  const [pedagogicalForecasts, setPedagogicalForecasts] = useState<PedagogicalForecast[]>(() => {
    const saved = safeLocalStorage.getItem("ss_pedagogical_forecasts");
    return saved ? JSON.parse(saved) : INITIAL_PEDAGOGICAL_FORECASTS;
  });

  const [courseReminders, setCourseReminders] = useState<CourseReminder[]>([]);

  // Sync to safe local storage
  useEffect(() => {
    safeLocalStorage.setItem("ss_school_schedule_config", JSON.stringify(scheduleConfig));
  }, [scheduleConfig]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_timetable_published_state", JSON.stringify(isTimetablePublished));
  }, [isTimetablePublished]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_school_rooms_catalog", JSON.stringify(schoolRooms));
  }, [schoolRooms]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_teacher_unavailabilities", JSON.stringify(teacherUnavailabilities));
  }, [teacherUnavailabilities]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_course_assignments", JSON.stringify(courseAssignments));
    const schoolId = scheduleConfig.schoolId || "sch-001";
    if (courseAssignments.length > 0) {
      savePersistentCollection(schoolId, "course_assignments", courseAssignments).catch(() => {});
      savePersistentCollection(schoolId, "teacherAssignments", courseAssignments).catch(() => {});
    }
  }, [courseAssignments, scheduleConfig.schoolId]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_timetable_entries_v2", JSON.stringify(timetableEntries));
    const schoolId = scheduleConfig.schoolId || "sch-001";
    if (timetableEntries.length > 0) {
      savePersistentCollection(schoolId, "timetable_entries", timetableEntries).catch(() => {});
    }
  }, [timetableEntries, scheduleConfig.schoolId]);

  // Load persistent course assignments from database on init
  useEffect(() => {
    const schoolId = scheduleConfig.schoolId || "sch-001";
    loadPersistentCollection<CourseAssignment>(schoolId, "course_assignments", []).then(loaded => {
      if (Array.isArray(loaded) && loaded.length > 0) {
        setCourseAssignments(loaded);
      } else {
        loadPersistentCollection<CourseAssignment>(schoolId, "teacherAssignments", []).then(loadedTeachers => {
          if (Array.isArray(loadedTeachers) && loadedTeachers.length > 0) {
            setCourseAssignments(loadedTeachers);
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [scheduleConfig.schoolId]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_class_journal_entries", JSON.stringify(classJournalEntries));
  }, [classJournalEntries]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_pedagogical_forecasts", JSON.stringify(pedagogicalForecasts));
  }, [pedagogicalForecasts]);

  // Generate Calculated Period Slots from scheduleConfig
  const getCalculatedPeriodSlots = (): TimetablePeriodSlot[] => {
    const slots: TimetablePeriodSlot[] = [];
    const [startH, startM] = scheduleConfig.startTime.split(":").map(Number);
    let currentMinutes = startH * 60 + startM;

    for (let i = 1; i <= scheduleConfig.periodsPerDay; i++) {
      const slotStartH = Math.floor(currentMinutes / 60);
      const slotStartM = currentMinutes % 60;
      const startStr = `${String(slotStartH).padStart(2, "0")}h${String(slotStartM).padStart(2, "0")}`;

      const endMinutes = currentMinutes + scheduleConfig.periodDurationMinutes;
      const slotEndH = Math.floor(endMinutes / 60);
      const slotEndM = endMinutes % 60;
      const endStr = `${String(slotEndH).padStart(2, "0")}h${String(slotEndM).padStart(2, "0")}`;

      slots.push({
        index: i,
        label: `${i}ère Heure (${startStr}-${endStr})`.replace("1ère", "1ère").replace("2ère", "2ème").replace("3ère", "3ème").replace("4ère", "4ème").replace("5ère", "5ème").replace("6ère", "6ème").replace("7ère", "7ème"),
        startTime: `${String(slotStartH).padStart(2, "0")}:${String(slotStartM).padStart(2, "0")}`,
        endTime: `${String(slotEndH).padStart(2, "0")}:${String(slotEndM).padStart(2, "0")}`,
        isBreak: false
      });

      currentMinutes = endMinutes;

      // Check if a break slot is placed after period `i`
      const breakFound = scheduleConfig.breakSlots.find(b => b.startPeriodIndex === i);
      if (breakFound) {
        const breakStartH = Math.floor(currentMinutes / 60);
        const breakStartM = currentMinutes % 60;
        const breakEndMinutes = currentMinutes + breakFound.durationMinutes;
        const breakEndH = Math.floor(breakEndMinutes / 60);
        const breakEndM = breakEndMinutes % 60;

        slots.push({
          index: -i, // negative index for breaks
          label: `${breakFound.name} (${String(breakStartH).padStart(2, "0")}h${String(breakStartM).padStart(2, "0")}-${String(breakEndH).padStart(2, "0")}h${String(breakEndM).padStart(2, "0")})`,
          startTime: `${String(breakStartH).padStart(2, "0")}:${String(breakStartM).padStart(2, "0")}`,
          endTime: `${String(breakEndH).padStart(2, "0")}:${String(breakEndM).padStart(2, "0")}`,
          isBreak: true,
          breakName: breakFound.name
        });

        currentMinutes = breakEndMinutes;
      }
    }

    return slots;
  };

  const updateScheduleConfig = (newConfig: Partial<SchoolScheduleConfig>) => {
    setScheduleConfig(prev => ({ ...prev, ...newConfig }));
  };

  // ---------------------------------------------------------------------------
  // COURSE ASSIGNMENT CRUD & QUERIES
  // ---------------------------------------------------------------------------
  const assignCourse = (asg: Omit<CourseAssignment, "id" | "assignedDate">) => {
    // Check if already assigned
    const exists = courseAssignments.some(
      a => a.teacherName.toLowerCase() === asg.teacherName.toLowerCase() &&
           a.className.toLowerCase() === asg.className.toLowerCase() &&
           a.subjectName.toLowerCase() === asg.subjectName.toLowerCase() &&
           a.schoolYear === asg.schoolYear
    );

    if (exists) {
      return {
        success: false,
        message: `L'enseignant(e) ${asg.teacherName} est déjà affecté(e) au cours de ${asg.subjectName} pour la classe ${asg.className}.`
      };
    }

    const newAsg: CourseAssignment = {
      ...asg,
      id: `asg-${Date.now()}`,
      assignedDate: new Date().toLocaleDateString("fr-FR")
    };

    setCourseAssignments(prev => [newAsg, ...prev]);
    return {
      success: true,
      message: `Affectation de ${asg.teacherName} au cours de ${asg.subjectName} (${asg.className}) enregistrée avec succès.`,
      assignment: newAsg
    };
  };

  const updateCourseAssignment = (asg: CourseAssignment) => {
    setCourseAssignments(prev => prev.map(a => a.id === asg.id ? asg : a));
  };

  const deleteCourseAssignment = (id: string) => {
    setCourseAssignments(prev => prev.filter(a => a.id !== id));
    return { success: true, message: "Affectation supprimée." };
  };

  const getTeacherAssignments = (teacherNameOrId: string): CourseAssignment[] => {
    const target = teacherNameOrId.trim().toLowerCase();
    return courseAssignments.filter(
      a => a.teacherId.toLowerCase() === target || a.teacherName.toLowerCase() === target
    );
  };

  const getClassAssignments = (className: string): CourseAssignment[] => {
    const target = className.trim().toLowerCase();
    return courseAssignments.filter(a => a.className.toLowerCase() === target);
  };

  // ---------------------------------------------------------------------------
  // TIMETABLE CONFLICT DETECTION ENGINE
  // ---------------------------------------------------------------------------
  const checkTimetableConflict = (
    candidate: Omit<TimetableEntry, "id">, 
    ignoreId?: string
  ): ConflictCheckResult => {
    const activeEntries = timetableEntries.filter(e => e.id !== ignoreId);

    // Rule 1: Teacher Conflict - An instructor cannot be in 2 classes at the same time
    const teacherConflict = activeEntries.find(
      e => e.day === candidate.day &&
           (e.period === candidate.period || e.periodIndex === candidate.periodIndex) &&
           e.teacherName.trim().toLowerCase() === candidate.teacherName.trim().toLowerCase() &&
           e.className.trim().toLowerCase() !== candidate.className.trim().toLowerCase()
    );

    if (teacherConflict) {
      return {
        hasConflict: true,
        type: "teacher_busy",
        message: `Conflit Enseignant : ${candidate.teacherName} a déjà un cours de ${teacherConflict.subjectName} en ${teacherConflict.className} le ${candidate.day} à cette même période (${candidate.period}).`,
        conflictingEntry: teacherConflict
      };
    }

    // Rule 2: Class Conflict - A class cannot have two simultaneous subjects
    const classConflict = activeEntries.find(
      e => e.day === candidate.day &&
           (e.period === candidate.period || e.periodIndex === candidate.periodIndex) &&
           e.className.trim().toLowerCase() === candidate.className.trim().toLowerCase()
    );

    if (classConflict) {
      return {
        hasConflict: true,
        type: "class_busy",
        message: `Conflit Classe : La classe ${candidate.className} a déjà le cours de ${classConflict.subjectName} (Prof. ${classConflict.teacherName}) programmé le ${candidate.day} à cette période.`,
        conflictingEntry: classConflict
      };
    }

    // Rule 3: Room Conflict - A specific classroom/lab cannot host 2 different classes simultaneously
    if (candidate.room && candidate.room.trim() !== "") {
      const roomConflict = activeEntries.find(
        e => e.day === candidate.day &&
             (e.period === candidate.period || e.periodIndex === candidate.periodIndex) &&
             e.room && e.room.trim().toLowerCase() === candidate.room.trim().toLowerCase() &&
             e.className.trim().toLowerCase() !== candidate.className.trim().toLowerCase()
      );

      if (roomConflict) {
        return {
          hasConflict: true,
          type: "room_busy",
          message: `Conflit Local/Salle : La salle "${candidate.room}" est déjà occupée par la classe ${roomConflict.className} (${roomConflict.subjectName}) le ${candidate.day} à cette période.`,
          conflictingEntry: roomConflict
        };
      }
    }

    return { hasConflict: false };
  };

  const addTimetableEntry = (entry: Omit<TimetableEntry, "id">) => {
    const conflict = checkTimetableConflict(entry);
    if (conflict.hasConflict) {
      return {
        success: false,
        message: conflict.message || "Conflit d'emploi du temps détecté."
      };
    }

    const newEntry: TimetableEntry = {
      ...entry,
      id: `tt-${Date.now()}`,
      status: entry.status || "Planifié"
    };

    setTimetableEntries(prev => [...prev, newEntry]);
    return {
      success: true,
      message: `Cours de ${entry.subjectName} planifié le ${entry.day} pour la classe ${entry.className}.`,
      entry: newEntry
    };
  };

  const updateTimetableEntry = (entry: TimetableEntry) => {
    const conflict = checkTimetableConflict(entry, entry.id);
    if (conflict.hasConflict) {
      return {
        success: false,
        message: conflict.message || "Conflit d'emploi du temps détecté."
      };
    }

    setTimetableEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    return { success: true, message: "Emploi du temps mis à jour avec succès." };
  };

  const deleteTimetableEntry = (id: string) => {
    setTimetableEntries(prev => prev.filter(e => e.id !== id));
  };

  const substituteTeacherInTimetable = (entryId: string, substituteTeacherName: string, reason = "Absence de l'enseignant titulaire") => {
    const target = timetableEntries.find(e => e.id === entryId);
    if (!target) return { success: false, message: "Séance introuvable." };

    // Check conflict for substitute
    const testCandidate: TimetableEntry = {
      ...target,
      teacherName: substituteTeacherName
    };
    const conflict = checkTimetableConflict(testCandidate, entryId);
    if (conflict.hasConflict) {
      return {
        success: false,
        message: `Remplacement impossible : ${conflict.message}`
      };
    }

    setTimetableEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          isSubstituted: true,
          substituteTeacherName: substituteTeacherName,
          status: "En cours"
        };
      }
      return e;
    }));

    return {
      success: true,
      message: `Remplacement validé : ${substituteTeacherName} assurera la séance de ${target.subjectName} (${target.className}). Notification automatique transmise aux élèves et parents.`
    };
  };

  // ---------------------------------------------------------------------------
  // TIMETABLE PUBLICATION & ROOMS MANAGEMENT
  // ---------------------------------------------------------------------------
  const publishTimetable = (publishedBy: string, publishedByRole: string, notes?: string) => {
    setIsTimetablePublished(true);
    setTimetableEntries(prev => prev.map(e => ({ ...e, isPublished: true })));
    setScheduleConfig(prev => ({
      ...prev,
      isPublished: true,
      publicationStatus: {
        schoolId: prev.schoolId || "sch-001",
        schoolYear: "2025-2026",
        isPublished: true,
        publishedAt: new Date().toLocaleDateString("fr-FR"),
        publishedBy,
        publishedByRole,
        notes: notes || "Emploi du temps officiel validé et publié pour l'établissement."
      }
    }));
  };

  const unpublishTimetable = () => {
    setIsTimetablePublished(false);
    setTimetableEntries(prev => prev.map(e => ({ ...e, isPublished: false })));
    setScheduleConfig(prev => ({
      ...prev,
      isPublished: false,
      publicationStatus: prev.publicationStatus ? { ...prev.publicationStatus, isPublished: false } : undefined
    }));
  };

  const addSchoolRoom = (room: SchoolRoom) => {
    setSchoolRooms(prev => {
      if (prev.some(r => r.id === room.id || r.name.toLowerCase() === room.name.toLowerCase())) {
        return prev.map(r => (r.id === room.id ? room : r));
      }
      return [...prev, room];
    });
  };

  const deleteSchoolRoom = (id: string) => {
    setSchoolRooms(prev => prev.filter(r => r.id !== id));
  };

  const addTeacherUnavailability = (unav: TeacherUnavailability) => {
    setTeacherUnavailabilities(prev => [...prev, { ...unav, id: unav.id || `unav-${Date.now()}` }]);
  };

  const deleteTeacherUnavailability = (id: string) => {
    setTeacherUnavailabilities(prev => prev.filter(u => u.id !== id));
  };

  // ---------------------------------------------------------------------------
  // AUTOMATED GENERATION & MULTI-YEAR DUPLICATION
  // ---------------------------------------------------------------------------
  const runAutoScheduleGeneration = (
    classes: ClassRoom[],
    subjects: Subject[],
    teachers: Teacher[],
    options?: Partial<TimetableGenerationOptions>
  ): TimetableGenerationReport => {
    const fullConfig: SchoolScheduleConfig = {
      ...scheduleConfig,
      rooms: schoolRooms,
      teacherUnavailabilities
    };

    const report = generateAutomatedTimetable(
      classes,
      subjects,
      teachers,
      courseAssignments,
      fullConfig,
      timetableEntries,
      {
        schoolId: scheduleConfig.schoolId || "sch-001",
        schoolYear: "2025-2026",
        respectTeacherAvailabilities: true,
        distributeAcrossDays: true,
        assignRoomsAutomatically: true,
        clearExistingDrafts: true,
        ...options
      }
    );

    if (report.generatedEntries && report.generatedEntries.length > 0) {
      setTimetableEntries(report.generatedEntries);
    }

    return report;
  };

  const duplicateYearConfig = (
    sourceYear: string,
    targetYear: string,
    schoolId: string,
    currentSubjects: Subject[]
  ) => {
    const result = duplicateCurriculumAndScheduleToNewYear(
      sourceYear,
      targetYear,
      schoolId,
      currentSubjects,
      courseAssignments,
      timetableEntries
    );

    if (result.newAssignments.length > 0) {
      setCourseAssignments(prev => [...prev, ...result.newAssignments]);
    }
    if (result.newTimetable.length > 0) {
      setTimetableEntries(prev => [...prev, ...result.newTimetable]);
    }

    return result;
  };

  // ---------------------------------------------------------------------------
  // CLASS JOURNAL (JOURNAL DE CLASSE & SUIVI DES SEANCES)
  // ---------------------------------------------------------------------------
  const saveClassJournalEntry = (entry: Omit<ClassJournalEntry, "id" | "createdAt">) => {
    const newJournal: ClassJournalEntry = {
      ...entry,
      id: `cjr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setClassJournalEntries(prev => [newJournal, ...prev]);

    // Update Pedagogical Forecast progression automatically
    setPedagogicalForecasts(prev => prev.map(pf => {
      if (pf.className.toLowerCase() === entry.className.toLowerCase() &&
          pf.subjectName.toLowerCase() === entry.subjectName.toLowerCase()) {
        const addedHours = entry.status === "Dispensé" ? 1 : entry.status === "Partiellement dispensé" ? 0.5 : 0;
        const newCompleted = Math.min(pf.plannedHours, pf.completedHours + addedHours);
        return {
          ...pf,
          completedHours: newCompleted,
          progressionPercent: Number(((newCompleted / pf.plannedHours) * 100).toFixed(1)),
          status: newCompleted >= pf.plannedHours ? "Achevé" : "En cours"
        };
      }
      return pf;
    }));

    return {
      success: true,
      message: "Journal de classe renseigné avec succès. Les parents et la direction peuvent consulter le résumé de la leçon.",
      entry: newJournal
    };
  };

  const verifyClassJournalEntry = (id: string, directorNotes: string) => {
    setClassJournalEntries(prev => prev.map(j => {
      if (j.id === id) {
        return {
          ...j,
          verifiedByDirector: true,
          directorNotes,
          updatedAt: new Date().toISOString()
        };
      }
      return j;
    }));
  };

  const getJournalForClass = (className: string): ClassJournalEntry[] => {
    const target = className.trim().toLowerCase();
    return classJournalEntries.filter(j => j.className.toLowerCase() === target);
  };

  const getJournalForTeacher = (teacherName: string): ClassJournalEntry[] => {
    const target = teacherName.trim().toLowerCase();
    return classJournalEntries.filter(j => j.teacherName.toLowerCase() === target);
  };

  const getTodayPendingCoursesForTeacher = (teacherName: string): TimetableEntry[] => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const currentDayName = days[new Date().getDay()];
    const todayISO = new Date().toISOString().split("T")[0];

    const teacherTodayTimetable = timetableEntries.filter(
      t => (t.teacherName.toLowerCase() === teacherName.toLowerCase() || 
            (t.isSubstituted && t.substituteTeacherName?.toLowerCase() === teacherName.toLowerCase())) &&
           t.day.toLowerCase() === currentDayName.toLowerCase()
    );

    // Filter out courses already filled in the journal for today
    const filledTimetableIds = classJournalEntries
      .filter(j => j.date === todayISO && j.teacherName.toLowerCase() === teacherName.toLowerCase())
      .map(j => j.timetableEntryId)
      .filter(Boolean);

    return teacherTodayTimetable.filter(t => !filledTimetableIds.includes(t.id));
  };

  // ---------------------------------------------------------------------------
  // PEDAGOGICAL FORECASTS & CURRICULUM PROGRESSION
  // ---------------------------------------------------------------------------
  const addPedagogicalForecast = (forecast: Omit<PedagogicalForecast, "id">) => {
    const newPf: PedagogicalForecast = {
      ...forecast,
      id: `pf-${Date.now()}`
    };
    setPedagogicalForecasts(prev => [newPf, ...prev]);
  };

  const updatePedagogicalForecast = (forecast: PedagogicalForecast) => {
    setPedagogicalForecasts(prev => prev.map(p => p.id === forecast.id ? forecast : p));
  };

  const deletePedagogicalForecast = (id: string) => {
    setPedagogicalForecasts(prev => prev.filter(p => p.id !== id));
  };

  const getSyllabusCoverageRate = (className: string, subjectName: string) => {
    const matches = pedagogicalForecasts.filter(
      p => p.className.toLowerCase() === className.toLowerCase() &&
           p.subjectName.toLowerCase() === subjectName.toLowerCase()
    );

    if (matches.length === 0) return { plannedHours: 0, completedHours: 0, percent: 0 };

    const totalPlanned = matches.reduce((acc, curr) => acc + curr.plannedHours, 0);
    const totalCompleted = matches.reduce((acc, curr) => acc + curr.completedHours, 0);
    const percent = totalPlanned > 0 ? Number(((totalCompleted / totalPlanned) * 100).toFixed(1)) : 0;

    return { plannedHours: totalPlanned, completedHours: totalCompleted, percent };
  };

  // ---------------------------------------------------------------------------
  // LIVE REMINDERS GENERATOR
  // ---------------------------------------------------------------------------
  const generateDailyRemindersForTeacher = (teacherName: string): CourseReminder[] => {
    const pendingCourses = getTodayPendingCoursesForTeacher(teacherName);
    const reminders: CourseReminder[] = [];

    pendingCourses.forEach((c) => {
      reminders.push({
        id: `rem-course-${c.id}-${Date.now()}`,
        teacherId: c.teacherId || "emp-1",
        teacherName: c.teacherName,
        timetableEntryId: c.id,
        type: "before_course",
        title: `Rappel de Cours : ${c.subjectName}`,
        message: `Vous avez cours de ${c.subjectName} en ${c.className} (${c.period}) dans la ${c.room}.`,
        courseTime: c.period,
        className: c.className,
        subjectName: c.subjectName,
        status: "pending",
        createdAt: new Date().toISOString()
      });
    });

    return reminders;
  };

  const dismissReminder = (id: string) => {
    setCourseReminders(prev => prev.filter(r => r.id !== id));
  };

  // ---------------------------------------------------------------------------
  // RESPONSIBILITY SCOPE & RBAC CALCULATION
  // ---------------------------------------------------------------------------
  const getUserResponsibilityScope = (userRole: string, userName: string): ResponsibilityScope => {
    const roleUpper = userRole.toUpperCase();

    if (roleUpper.includes("DIRECTEUR DU PRIMAIRE") || roleUpper.includes("DIRECTRICE DU PRIMAIRE")) {
      return {
        levelCategoryScope: "Primaire",
        canManageTimetables: true,
        canManageAssignments: true,
        canManageJournal: true,
        canValidateJournal: true,
        canInputGrades: true,
        canViewReports: true
      };
    }

    if (roleUpper.includes("PRÉFET") || roleUpper.includes("DIRECTEUR DES ÉTUDES") || roleUpper.includes("DIRECTEUR DU SECONDAIRE")) {
      return {
        levelCategoryScope: "Secondaire",
        canManageTimetables: true,
        canManageAssignments: true,
        canManageJournal: true,
        canValidateJournal: true,
        canInputGrades: true,
        canViewReports: true
      };
    }

    if (roleUpper.includes("MATERNELLE")) {
      return {
        levelCategoryScope: "Maternelle",
        canManageTimetables: true,
        canManageAssignments: true,
        canManageJournal: true,
        canValidateJournal: true,
        canInputGrades: true,
        canViewReports: true
      };
    }

    if (roleUpper.includes("ENSEIGNANT") || roleUpper.includes("PROFESSEUR")) {
      const teacherAsgs = getTeacherAssignments(userName);
      const classes = Array.from(new Set(teacherAsgs.map(a => a.className)));
      const subjects = Array.from(new Set(teacherAsgs.map(a => a.subjectName)));

      return {
        levelCategoryScope: "Tous",
        assignedClassesScope: classes,
        assignedSubjectsScope: subjects,
        canManageTimetables: false,
        canManageAssignments: false,
        canManageJournal: true,
        canValidateJournal: false,
        canInputGrades: true,
        canViewReports: false
      };
    }

    // Global administrative supervision (Promoteur, Chef d'Établissement, Super Admin)
    return {
      levelCategoryScope: "Tous",
      canManageTimetables: true,
      canManageAssignments: true,
      canManageJournal: true,
      canValidateJournal: true,
      canInputGrades: true,
      canViewReports: true
    };
  };

  return (
    <PedagogicalTimetableContext.Provider
      value={{
        scheduleConfig,
        updateScheduleConfig,
        getCalculatedPeriodSlots,
        courseAssignments,
        assignCourse,
        updateCourseAssignment,
        deleteCourseAssignment,
        getTeacherAssignments,
        getClassAssignments,
        timetableEntries,
        setTimetableEntries,
        checkTimetableConflict,
        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        substituteTeacherInTimetable,
        isTimetablePublished,
        publishTimetable,
        unpublishTimetable,
        schoolRooms,
        addSchoolRoom,
        deleteSchoolRoom,
        teacherUnavailabilities,
        addTeacherUnavailability,
        deleteTeacherUnavailability,
        runAutoScheduleGeneration,
        duplicateYearConfig,
        classJournalEntries,
        saveClassJournalEntry,
        verifyClassJournalEntry,
        getJournalForClass,
        getJournalForTeacher,
        getTodayPendingCoursesForTeacher,
        pedagogicalForecasts,
        addPedagogicalForecast,
        updatePedagogicalForecast,
        deletePedagogicalForecast,
        getSyllabusCoverageRate,
        courseReminders,
        dismissReminder,
        generateDailyRemindersForTeacher,
        getUserResponsibilityScope
      }}
    >
      {children}
    </PedagogicalTimetableContext.Provider>
  );
};

export const usePedagogicalTimetable = () => {
  const context = useContext(PedagogicalTimetableContext);
  if (!context) {
    throw new Error("usePedagogicalTimetable must be used within a PedagogicalTimetableProvider");
  }
  return context;
};
