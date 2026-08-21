import { MissingPhotoRecord, MissingPhotoSchoolSummary, School, Student, Employee, Teacher, UserAccount } from "../types";
import { safeLocalStorage } from "../utils/safeStorage";

export type { MissingPhotoRecord, MissingPhotoSchoolSummary };

const STORAGE_KEY_MISSING_PHOTOS_REMINDERS = "ss_missing_photos_reminders";

export interface MissingPhotoScanResult {
  totalScanned: number;
  totalMissing: number;
  schoolSummaries: MissingPhotoSchoolSummary[];
  allMissingRecords: MissingPhotoRecord[];
}

/**
 * Automatically inspects all schools, students, teachers, and employees across the platform
 * to detect any profile missing a photo without manual intervention from school directors.
 */
export function scanPlatformForMissingPhotos(
  schools: School[],
  students: Student[],
  employees: Employee[],
  teachers: (Teacher | any)[] = [],
  userAccounts: UserAccount[] = []
): MissingPhotoScanResult {
  const missingRecords: MissingPhotoRecord[] = [];
  const schoolSummaryMap: Record<string, MissingPhotoSchoolSummary> = {};

  const remindersHistory: Record<string, string> = (() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEY_MISSING_PHOTOS_REMINDERS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })();

  // Initialize summary for every school
  schools.forEach(school => {
    schoolSummaryMap[school.id] = {
      schoolId: school.id,
      schoolName: school.name,
      province: school.province || school.provinceEducationnelle || "",
      totalUsersCount: 0,
      missingCount: 0,
      studentsMissing: 0,
      teachersMissing: 0,
      staffMissing: 0,
      lastReminderSentAt: remindersHistory[school.id] || undefined,
      records: []
    };
  });

  // Default summary fallback for orphan records
  if (!schoolSummaryMap["default"]) {
    schoolSummaryMap["default"] = {
      schoolId: "default",
      schoolName: "Établissement Principal / Non assigné",
      province: "",
      totalUsersCount: 0,
      missingCount: 0,
      studentsMissing: 0,
      teachersMissing: 0,
      staffMissing: 0,
      records: []
    };
  }

  // 1. Scan Students
  students.forEach(student => {
    const schoolId = student.schoolId || "default";
    if (!schoolSummaryMap[schoolId]) {
      schoolSummaryMap[schoolId] = {
        schoolId,
        schoolName: (student as any).schoolName || `École (${schoolId})`,
        province: (student as any).province || "",
        totalUsersCount: 0,
        missingCount: 0,
        studentsMissing: 0,
        teachersMissing: 0,
        staffMissing: 0,
        records: []
      };
    }

    schoolSummaryMap[schoolId].totalUsersCount++;

    const hasPhoto = Boolean(
      student.photoUrl?.trim() ||
      (student as any).photo?.trim() ||
      (student as any).avatar?.trim()
    );

    if (!hasPhoto) {
      const record: MissingPhotoRecord = {
        id: `missing-std-${student.id}`,
        schoolId,
        schoolName: schoolSummaryMap[schoolId].schoolName,
        profileType: "Élève",
        fullName: `${student.lastName || ""} ${student.firstName || ""}`.trim() || "Élève sans nom",
        matriculeOrId: student.registrationNumber || student.id,
        classroomOrRole: student.className || (student as any).classroom || "Classe non spécifiée",
        contactPhone: student.parentPhone || (student as any).phone || "",
        contactEmail: student.parentEmail || (student as any).email,
        detectedAt: new Date().toLocaleDateString("fr-FR")
      };

      missingRecords.push(record);
      schoolSummaryMap[schoolId].missingCount++;
      schoolSummaryMap[schoolId].studentsMissing++;
      schoolSummaryMap[schoolId].records.push(record);
    }
  });

  // 2. Scan Teachers & Employees
  const allStaff = [...employees, ...teachers];
  const seenStaffIds = new Set<string>();

  allStaff.forEach(emp => {
    if (!emp || seenStaffIds.has(emp.id)) return;
    seenStaffIds.add(emp.id);

    const schoolId = emp.schoolId || "default";
    if (!schoolSummaryMap[schoolId]) {
      schoolSummaryMap[schoolId] = {
        schoolId,
        schoolName: (emp as any).schoolName || `École (${schoolId})`,
        province: (emp as any).province || "",
        totalUsersCount: 0,
        missingCount: 0,
        studentsMissing: 0,
        teachersMissing: 0,
        staffMissing: 0,
        records: []
      };
    }

    schoolSummaryMap[schoolId].totalUsersCount++;

    const hasPhoto = Boolean(
      emp.photoUrl?.trim() ||
      (emp as any).photo?.trim() ||
      (emp as any).avatar?.trim()
    );

    if (!hasPhoto) {
      const isTeacher = (emp.fonction || (emp as any).role || "").toLowerCase().includes("enseignant") ||
                        (emp.fonction || (emp as any).role || "").toLowerCase().includes("prof");
      const isDirector = (emp.fonction || (emp as any).role || "").toLowerCase().includes("direct") ||
                         (emp.fonction || (emp as any).role || "").toLowerCase().includes("préfet");

      const profileType: MissingPhotoRecord["profileType"] = isDirector
        ? "Directeur / Préfet"
        : isTeacher
        ? "Enseignant"
        : "Personnel Administratif";

      const record: MissingPhotoRecord = {
        id: `missing-emp-${emp.id}`,
        schoolId,
        schoolName: schoolSummaryMap[schoolId].schoolName,
        profileType,
        fullName: emp.fullName || `${(emp as any).nom || (emp as any).lastName || ""} ${(emp as any).prenom || (emp as any).firstName || ""}`.trim() || "Agent sans nom",
        matriculeOrId: (emp as any).matricule || emp.id,
        classroomOrRole: emp.fonction || (emp as any).role || "Fonction non définie",
        contactPhone: emp.phone || (emp as any).telephone,
        contactEmail: emp.email,
        detectedAt: new Date().toLocaleDateString("fr-FR")
      };

      missingRecords.push(record);
      schoolSummaryMap[schoolId].missingCount++;
      if (profileType === "Enseignant") {
        schoolSummaryMap[schoolId].teachersMissing++;
      } else {
        schoolSummaryMap[schoolId].staffMissing++;
      }
      schoolSummaryMap[schoolId].records.push(record);
    }
  });

  const schoolSummaries = Object.values(schoolSummaryMap)
    .filter(s => s.totalUsersCount > 0 || s.missingCount > 0)
    .sort((a, b) => b.missingCount - a.missingCount);

  return {
    totalScanned: students.length + seenStaffIds.size,
    totalMissing: missingRecords.length,
    schoolSummaries,
    allMissingRecords: missingRecords
  };
}

/**
 * Record a reminder notification sent to a school
 */
export function recordMissingPhotoReminderSent(schoolId: string): void {
  try {
    const saved = safeLocalStorage.getItem(STORAGE_KEY_MISSING_PHOTOS_REMINDERS);
    const history = saved ? JSON.parse(saved) : {};
    const now = new Date();
    history[schoolId] = `${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    safeLocalStorage.setItem(STORAGE_KEY_MISSING_PHOTOS_REMINDERS, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to record missing photo reminder:", e);
  }
}

/**
 * Generate standard reminder message text for WhatsApp or SMS
 */
export function buildSchoolMissingPhotoReminderText(
  schoolSummary: MissingPhotoSchoolSummary,
  staffSenderName: string
): string {
  return `📢 *SMARTSCHOOL RDC — RAPPEL DE CONFORMITÉ DES PROFILS SANS PHOTO*
Établissement : *${schoolSummary.schoolName}*
Province : ${schoolSummary.province}

Madame, Monsieur le Chef d'Établissement,

Le système automatique SmartSchool RDC a identifié *${schoolSummary.missingCount} profils sans photo officielle* dans votre base de données :
• Élèves sans photo : ${schoolSummary.studentsMissing}
• Enseignants sans photo : ${schoolSummary.teachersMissing}
• Personnel administratif : ${schoolSummary.staffMissing}

⚠️ *Impact :* Les cartes d'élèves, badges professionnels et bulletins officiels nécessitent impérativement une photo d'identité conforme aux directives nationales.

Veuillez inviter vos secrétaires ou enseignants à importer les photos d'identité depuis l'onglet "Élèves" / "Personnel".

Pour toute assistance, notre équipe support SmartSchool RDC reste à votre disposition.
Agent responsable : ${staffSenderName}
Support SmartSchool RDC : support@smartschool.cd | +243 994 202 940`;
}
