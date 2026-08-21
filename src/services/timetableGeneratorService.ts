import { 
  ClassRoom, 
  Subject, 
  Teacher, 
  CourseAssignment, 
  SchoolScheduleConfig, 
  TimetableEntry, 
  SchoolRoom,
  TeacherUnavailability
} from "../types";

export interface TimetableGenerationOptions {
  schoolId: string;
  schoolYear: string;
  targetClassNames?: string[]; // If specified, only generate for these classes
  respectTeacherAvailabilities?: boolean;
  distributeAcrossDays?: boolean;
  assignRoomsAutomatically?: boolean;
  clearExistingDrafts?: boolean;
}

export interface TimetableGenerationReport {
  success: boolean;
  totalSessionsPlanned: number;
  totalHoursPlanned: number;
  classesCovered: number;
  unassignedCoursesCount: number;
  unassignedCoursesList: { className: string; subjectName: string; missingHours: number }[];
  conflictsDetected: number;
  conflictDetails: string[];
  generatedEntries: TimetableEntry[];
  message: string;
}

/**
 * SMART TIMETABLE GENERATOR & SCHEDULING SOLVER FOR SMARTSCHOOL RDC
 * Constraint-Satisfaction Engine without collisions (Teacher, Class, Room)
 */
export function generateAutomatedTimetable(
  classes: ClassRoom[],
  subjects: Subject[],
  teachers: Teacher[],
  assignments: CourseAssignment[],
  scheduleConfig: SchoolScheduleConfig,
  existingEntries: TimetableEntry[] = [],
  options: TimetableGenerationOptions
): TimetableGenerationReport {
  const {
    schoolId,
    schoolYear,
    targetClassNames,
    respectTeacherAvailabilities = true,
    distributeAcrossDays = true,
    assignRoomsAutomatically = true,
    clearExistingDrafts = true
  } = options;

  const activeDays = scheduleConfig.activeDays && scheduleConfig.activeDays.length > 0
    ? scheduleConfig.activeDays
    : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  const periodsPerDay = scheduleConfig.periodsPerDay || 6;
  const breakSlotIndices = new Set((scheduleConfig.breakSlots || []).map(b => b.startPeriodIndex));

  // Determine classes to process
  const targetClasses = targetClassNames && targetClassNames.length > 0
    ? classes.filter(c => targetClassNames.includes(`${c.level} ${c.roomLetter}`) || targetClassNames.includes(c.name || ""))
    : classes;

  const rooms: SchoolRoom[] = scheduleConfig.rooms && scheduleConfig.rooms.length > 0
    ? scheduleConfig.rooms
    : [
        { id: "room-101", name: "Salle 101", type: "Classe ordinaire" },
        { id: "room-102", name: "Salle 102", type: "Classe ordinaire" },
        { id: "room-103", name: "Salle 103", type: "Classe ordinaire" },
        { id: "room-lab-info", name: "Labo Informatique", type: "Informatique" },
        { id: "room-lab-sc", name: "Labo Sciences", type: "Laboratoire" }
      ];

  const unavailabilities = scheduleConfig.teacherUnavailabilities || [];

  // Start with existing entries if not clearing
  let generatedEntries: TimetableEntry[] = clearExistingDrafts 
    ? existingEntries.filter(e => e.schoolId !== schoolId || e.schoolYear !== schoolYear) 
    : [...existingEntries];

  // Helper tracking occupied slots
  // Key format: `${day}_${periodIndex}`
  const teacherOccupancy = new Map<string, Set<string>>(); // key -> Set of teacherIds/Names
  const classOccupancy = new Map<string, Set<string>>();   // key -> Set of classNames
  const roomOccupancy = new Map<string, Set<string>>();    // key -> Set of roomNames

  const markOccupied = (day: string, periodIndex: number, teacherName: string, className: string, roomName: string) => {
    const key = `${day}_${periodIndex}`;
    if (!teacherOccupancy.has(key)) teacherOccupancy.set(key, new Set());
    if (!classOccupancy.has(key)) classOccupancy.set(key, new Set());
    if (!roomOccupancy.has(key)) roomOccupancy.set(key, new Set());

    if (teacherName) teacherOccupancy.get(key)!.add(teacherName.trim().toLowerCase());
    if (className) classOccupancy.get(key)!.add(className.trim().toLowerCase());
    if (roomName) roomOccupancy.get(key)!.add(roomName.trim().toLowerCase());
  };

  const isSlotFree = (day: string, periodIndex: number, teacherName: string, className: string, roomName: string): boolean => {
    const key = `${day}_${periodIndex}`;

    // Check teacher unavailabilities
    if (respectTeacherAvailabilities && teacherName) {
      const isUnavailable = unavailabilities.some(u => 
        u.teacherName.trim().toLowerCase() === teacherName.trim().toLowerCase() &&
        u.day === day &&
        (u.periodIndex === undefined || u.periodIndex === periodIndex)
      );
      if (isUnavailable) return false;
    }

    // Check Teacher Collision
    if (teacherName && teacherOccupancy.get(key)?.has(teacherName.trim().toLowerCase())) {
      return false;
    }

    // Check Class Collision
    if (className && classOccupancy.get(key)?.has(className.trim().toLowerCase())) {
      return false;
    }

    // Check Room Collision
    if (roomName && roomOccupancy.get(key)?.has(roomName.trim().toLowerCase())) {
      return false;
    }

    return true;
  };

  // Populate initial occupancy with kept entries
  generatedEntries.forEach(e => {
    const periodIdx = e.periodIndex || parsePeriodIndex(e.period);
    markOccupied(e.day, periodIdx, e.teacherName, e.className, e.room);
  });

  const unassignedCoursesList: { className: string; subjectName: string; missingHours: number }[] = [];
  const conflictDetails: string[] = [];
  let totalSessionsPlanned = 0;
  let totalHoursPlanned = 0;

  // Process each class
  targetClasses.forEach(cls => {
    const className = `${cls.level} ${cls.roomLetter}`.trim() || cls.name || "Classe";
    const classOption = cls.option || "Tronc Commun";
    const classLevelCat = cls.levelCategory || "Secondaire";

    // Find subjects for this class
    // Priority: subjects assigned specifically to this class or matching cycle/level
    const classSubjects = subjects.filter(s => {
      if (s.className && s.className.toLowerCase() === className.toLowerCase()) return true;
      if (s.levelCategory && s.levelCategory !== classLevelCat) return false;
      if (s.optionName && s.optionName !== classOption && s.optionName !== "Tronc Commun" && !s.isCommon) return false;
      return true;
    });

    // If no subjects found in state, fallback to all subjects
    const relevantSubjects = classSubjects.length > 0 ? classSubjects : subjects.slice(0, 8);

    // Track how many hours are needed per subject
    relevantSubjects.forEach(subj => {
      const weeklyHours = subj.hoursPerWeek || 3;
      
      // Find assignment for this class & subject
      const asg = assignments.find(a => 
        a.className.toLowerCase() === className.toLowerCase() &&
        a.subjectName.toLowerCase() === subj.name.toLowerCase() &&
        (a.schoolYear === schoolYear || !a.schoolYear)
      );

      const teacherName = asg?.teacherName || (teachers[0] ? `${teachers[0].firstName || ''} ${teachers[0].lastName || ''}`.trim() || teachers[0].name || "Enseignant Non Affecté" : "Enseignant Non Affecté");
      const teacherId = asg?.teacherId || (teachers[0]?.id || "teacher-auto");

      if (!asg) {
        unassignedCoursesList.push({
          className,
          subjectName: subj.name,
          missingHours: weeklyHours
        });
      }

      // Pick suitable room
      let suitableRoom = `${cls.roomLetter ? 'Salle ' + cls.roomLetter : 'Salle 101'}`;
      if (assignRoomsAutomatically) {
        if (subj.category === "Scientifique" && (subj.name.includes("Chimie") || subj.name.includes("Physique") || subj.name.includes("Biologie"))) {
          const scienceLab = rooms.find(r => r.type === "Laboratoire");
          if (scienceLab) suitableRoom = scienceLab.name;
        } else if (subj.name.toLowerCase().includes("informatique") || subj.name.toLowerCase().includes("tic")) {
          const infoLab = rooms.find(r => r.type === "Informatique");
          if (infoLab) suitableRoom = infoLab.name;
        } else if (subj.name.toLowerCase().includes("sport") || subj.name.toLowerCase().includes("eps")) {
          const sportField = rooms.find(r => r.type === "Terrain de sport");
          if (sportField) suitableRoom = sportField.name;
        } else if (subj.category === "Professionnelle" && (subj.name.includes("Atelier") || subj.name.includes("Pratique"))) {
          const atelier = rooms.find(r => r.type === "Atelier");
          if (atelier) suitableRoom = atelier.name;
        } else {
          // Standard room
          const stdRoom = rooms.find(r => r.type === "Classe ordinaire");
          if (stdRoom) suitableRoom = stdRoom.name;
        }
      }

      // Schedule sessions for weeklyHours
      let hoursRemaining = weeklyHours;
      const daysUsedForSubject = new Set<string>();

      // Loop over active days and periods to place sessions
      for (let pass = 0; pass < 3 && hoursRemaining > 0; pass++) {
        for (const day of activeDays) {
          if (hoursRemaining <= 0) break;
          if (distributeAcrossDays && pass === 0 && daysUsedForSubject.has(day)) continue;

          for (let periodIdx = 1; periodIdx <= periodsPerDay; periodIdx++) {
            if (hoursRemaining <= 0) break;

            if (isSlotFree(day, periodIdx, teacherName, className, suitableRoom)) {
              // Create timetable entry
              const periodLabel = formatPeriodLabel(periodIdx);
              const newEntry: TimetableEntry = {
                id: `tt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                className,
                day,
                period: periodLabel,
                periodIndex: periodIdx,
                subjectName: subj.name,
                subjectId: subj.id,
                teacherName,
                teacherId,
                room: suitableRoom,
                schoolId,
                schoolYear,
                levelCategory: classLevelCat,
                optionName: classOption,
                status: "Planifié",
                isPublished: false
              };

              markOccupied(day, periodIdx, teacherName, className, suitableRoom);
              generatedEntries.push(newEntry);
              daysUsedForSubject.add(day);
              hoursRemaining--;
              totalSessionsPlanned++;
              totalHoursPlanned++;
            }
          }
        }
      }

      if (hoursRemaining > 0) {
        conflictDetails.push(`Classe ${className} : Impossible de placer ${hoursRemaining}h pour le cours ${subj.name} (${teacherName}) - créneaux saturés.`);
      }
    });
  });

  return {
    success: conflictDetails.length === 0,
    totalSessionsPlanned,
    totalHoursPlanned,
    classesCovered: targetClasses.length,
    unassignedCoursesCount: unassignedCoursesList.length,
    unassignedCoursesList,
    conflictsDetected: conflictDetails.length,
    conflictDetails,
    generatedEntries,
    message: conflictDetails.length === 0 
      ? `Génération réussie : ${totalSessionsPlanned} séances créées pour ${targetClasses.length} classe(s) avec 0 conflit.`
      : `Génération partielle : ${totalSessionsPlanned} séances créées. ${conflictDetails.length} contrainte(s) à ajuster.`
  };
}

/**
 * Format Period label e.g. "1ère Heure (07h30-08h20)"
 */
export function formatPeriodLabel(index: number, startHour = 7, startMin = 30, durationMin = 50): string {
  const totalStartMinutes = (startHour * 60 + startMin) + (index - 1) * durationMin;
  const totalEndMinutes = totalStartMinutes + durationMin;

  const sH = String(Math.floor(totalStartMinutes / 60)).padStart(2, "0");
  const sM = String(totalStartMinutes % 60).padStart(2, "0");
  const eH = String(Math.floor(totalEndMinutes / 60)).padStart(2, "0");
  const eM = String(totalEndMinutes % 60).padStart(2, "0");

  const suffix = index === 1 ? "1ère Heure" : `${index}ème Heure`;
  return `${suffix} (${sH}h${sM}-${eH}h${eM})`;
}

export function parsePeriodIndex(label: string): number {
  if (!label) return 1;
  const match = label.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Copie la configuration d'une année scolaire vers la suivante
 */
export function duplicateCurriculumAndScheduleToNewYear(
  sourceYear: string,
  targetYear: string,
  schoolId: string,
  subjects: Subject[],
  assignments: CourseAssignment[],
  timetable: TimetableEntry[]
): {
  newSubjects: Subject[];
  newAssignments: CourseAssignment[];
  newTimetable: TimetableEntry[];
  message: string;
} {
  const newSubjects = subjects
    .filter(s => s.schoolId === schoolId && (s.schoolYear === sourceYear || !s.schoolYear))
    .map(s => ({
      ...s,
      id: `sub-mig-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      schoolYear: targetYear
    }));

  const newAssignments = assignments
    .filter(a => a.schoolId === schoolId && (a.schoolYear === sourceYear || !a.schoolYear))
    .map(a => ({
      ...a,
      id: `asg-mig-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      schoolYear: targetYear,
      assignedDate: new Date().toLocaleDateString("fr-FR")
    }));

  const newTimetable = timetable
    .filter(t => t.schoolId === schoolId && (t.schoolYear === sourceYear || !t.schoolYear))
    .map(t => ({
      ...t,
      id: `tt-mig-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      schoolYear: targetYear,
      isPublished: false // Reset to draft for new year
    }));

  return { 
    newSubjects, 
    newAssignments, 
    newTimetable,
    message: `Configuration reportée avec succès pour l'année ${targetYear} (${newSubjects.length} matières, ${newAssignments.length} affectations et ${newTimetable.length} créneaux créés en brouillon).`
  };
}
