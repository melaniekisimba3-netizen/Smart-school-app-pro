/**
 * SmartSchool RDC - Entity Relationship & Linkage Service
 * 
 * Centralized service for managing relational linkages between:
 * - Classes <-> Titulaires (Teachers/Staff Accounts) & Responsible Personnel with Assignment History
 * - Students <-> User Accounts (IAM credentials & single identity)
 * - Parents/Guardians <-> Students (Multi-child, multi-guardian bidirectional relations)
 * 
 * Enforces:
 * 1. Multi-tenant school isolation (schoolId scoping, no cross-school linking)
 * 2. Zero-duplication: Identifiers (IDs) are stored, names and details are resolved live
 * 3. Non-destructive changes: Assignment history is preserved, accounts/assignments are never deleted
 */

import { 
  ClassRoom, 
  ClassTitularHistoryEntry, 
  Student, 
  Parent, 
  Teacher, 
  Employee, 
  UserAccount, 
  StudentGuardianLink, 
  ParentGuardianLink 
} from "../types";

export interface ResolvedTitulaire {
  id: string | null;
  userId?: string;
  name: string;
  isAssigned: boolean;
  phone?: string;
  email?: string;
  qualification?: string;
  roleTitle?: string;
  isTeacherRecord: boolean;
  isEmployeeRecord: boolean;
  isUserAccountRecord: boolean;
}

export interface ResolvedResponsibleStaff {
  id: string | null;
  userId?: string;
  name: string;
  isAssigned: boolean;
  phone?: string;
  email?: string;
  roleTitle?: string;
  function?: string;
}

export interface EligibleTitularOption {
  id: string;
  type: "teacher" | "employee" | "user_account";
  name: string;
  roleTitle: string;
  phone?: string;
  email?: string;
  schoolId?: string;
  userAccountId?: string;
}

/**
 * Filter items by school ID for multi-tenant isolation
 */
export function filterBySchool<T extends { schoolId?: string }>(
  items: T[], 
  activeSchoolId: string | undefined
): T[] {
  if (!items || !Array.isArray(items)) return [];
  if (!activeSchoolId || activeSchoolId === "default" || activeSchoolId === "sch-001") {
    return items.filter(i => !i.schoolId || i.schoolId === "default" || i.schoolId === "sch-001" || i.schoolId === activeSchoolId);
  }
  return items.filter(i => i.schoolId === activeSchoolId);
}

/**
 * Resolve the dynamic current name and profile of a class titulaire
 */
export function resolveClassTitulaire(
  classRoom: ClassRoom,
  teachers: Teacher[] = [],
  employees: Employee[] = [],
  userAccounts: UserAccount[] = []
): ResolvedTitulaire {
  const teacherId = classRoom.classTeacherId;
  const userId = classRoom.classTeacherUserId;

  // 1. Try matching Teacher entity by ID
  if (teacherId) {
    const matchedTeacher = teachers.find(t => t.id === teacherId);
    if (matchedTeacher) {
      const fullName = matchedTeacher.name || `${matchedTeacher.firstName || ""} ${matchedTeacher.lastName || ""}`.trim();
      return {
        id: matchedTeacher.id,
        userId: userId,
        name: fullName || "Enseignant",
        isAssigned: true,
        phone: matchedTeacher.phone,
        email: matchedTeacher.email,
        qualification: matchedTeacher.qualification || matchedTeacher.specialty,
        roleTitle: matchedTeacher.role || "Enseignant Titulaire",
        isTeacherRecord: true,
        isEmployeeRecord: false,
        isUserAccountRecord: false
      };
    }

    // 2. Try matching Employee entity by ID
    const matchedEmployee = employees.find(e => e.id === teacherId);
    if (matchedEmployee) {
      const fullName = `${matchedEmployee.lastName || ""} ${matchedEmployee.firstName || ""}`.trim();
      return {
        id: matchedEmployee.id,
        userId: matchedEmployee.userAccountId || userId,
        name: fullName || "Personnel",
        isAssigned: true,
        phone: matchedEmployee.phone,
        email: matchedEmployee.email,
        qualification: matchedEmployee.function,
        roleTitle: matchedEmployee.function || "Titulaire",
        isTeacherRecord: false,
        isEmployeeRecord: true,
        isUserAccountRecord: false
      };
    }
  }

  // 3. Try matching UserAccount entity
  if (userId || teacherId) {
    const matchedAccount = userAccounts.find(u => u.id === userId || u.id === teacherId || u.dossierId === teacherId);
    if (matchedAccount) {
      return {
        id: matchedAccount.id,
        userId: matchedAccount.id,
        name: matchedAccount.fullName || matchedAccount.username,
        isAssigned: true,
        phone: matchedAccount.phone,
        email: matchedAccount.email,
        roleTitle: matchedAccount.role || "Titulaire",
        isTeacherRecord: false,
        isEmployeeRecord: false,
        isUserAccountRecord: true
      };
    }
  }

  // 4. Fallback on string classTeacherName if preserved for backwards compatibility
  if (classRoom.classTeacherName && classRoom.classTeacherName.trim() && classRoom.classTeacherName !== "Non attribué" && classRoom.classTeacherName !== "À désigner") {
    // Check if classTeacherName matches a teacher name in the list
    const matchedByName = teachers.find(t => {
      const fName = `${t.firstName || ""} ${t.lastName || ""}`.trim().toLowerCase();
      const nName = (t.name || "").trim().toLowerCase();
      const target = classRoom.classTeacherName.trim().toLowerCase();
      return fName === target || nName === target;
    });

    if (matchedByName) {
      return {
        id: matchedByName.id,
        name: matchedByName.name || `${matchedByName.firstName || ""} ${matchedByName.lastName || ""}`.trim(),
        isAssigned: true,
        phone: matchedByName.phone,
        email: matchedByName.email,
        qualification: matchedByName.qualification || matchedByName.specialty,
        roleTitle: matchedByName.role || "Enseignant Titulaire",
        isTeacherRecord: true,
        isEmployeeRecord: false,
        isUserAccountRecord: false
      };
    }

    return {
      id: null,
      name: classRoom.classTeacherName,
      isAssigned: true,
      roleTitle: "Titulaire (Texte)",
      isTeacherRecord: false,
      isEmployeeRecord: false,
      isUserAccountRecord: false
    };
  }

  return {
    id: null,
    name: "Non attribué",
    isAssigned: false,
    roleTitle: "Non attribué",
    isTeacherRecord: false,
    isEmployeeRecord: false,
    isUserAccountRecord: false
  };
}

/**
 * Resolve responsible staff for a class (e.g. surveillant, directeur des études, éducateur)
 */
export function resolveClassResponsible(
  classRoom: ClassRoom,
  employees: Employee[] = [],
  userAccounts: UserAccount[] = [],
  teachers: Teacher[] = []
): ResolvedResponsibleStaff {
  const staffId = classRoom.responsibleStaffId;
  const userId = classRoom.responsibleStaffUserId;

  if (staffId) {
    const matchedEmployee = employees.find(e => e.id === staffId);
    if (matchedEmployee) {
      return {
        id: matchedEmployee.id,
        userId: matchedEmployee.userAccountId || userId,
        name: `${matchedEmployee.lastName || ""} ${matchedEmployee.firstName || ""}`.trim(),
        isAssigned: true,
        phone: matchedEmployee.phone,
        email: matchedEmployee.email,
        roleTitle: matchedEmployee.function || "Personnel Responsable",
        function: matchedEmployee.function
      };
    }

    const matchedTeacher = teachers.find(t => t.id === staffId);
    if (matchedTeacher) {
      return {
        id: matchedTeacher.id,
        name: matchedTeacher.name || `${matchedTeacher.firstName || ""} ${matchedTeacher.lastName || ""}`.trim(),
        isAssigned: true,
        phone: matchedTeacher.phone,
        email: matchedTeacher.email,
        roleTitle: matchedTeacher.role || "Enseignant Responsable",
        function: matchedTeacher.function || matchedTeacher.role
      };
    }
  }

  if (userId) {
    const matchedAcc = userAccounts.find(u => u.id === userId);
    if (matchedAcc) {
      return {
        id: matchedAcc.id,
        userId: matchedAcc.id,
        name: matchedAcc.fullName || matchedAcc.username,
        isAssigned: true,
        phone: matchedAcc.phone,
        email: matchedAcc.email,
        roleTitle: matchedAcc.role || "Responsable"
      };
    }
  }

  if (classRoom.responsibleStaffName && classRoom.responsibleStaffName.trim() && classRoom.responsibleStaffName !== "Aucun") {
    return {
      id: null,
      name: classRoom.responsibleStaffName,
      isAssigned: true,
      roleTitle: "Responsable"
    };
  }

  return {
    id: null,
    name: "Aucun",
    isAssigned: false,
    roleTitle: "Non assigné"
  };
}

/**
 * Get all staff and teachers eligible to be class titulares in a specific school
 */
export function getEligibleTitularsForSchool(
  activeSchoolId: string | undefined,
  teachers: Teacher[] = [],
  employees: Employee[] = [],
  userAccounts: UserAccount[] = []
): EligibleTitularOption[] {
  const schoolTeachers = filterBySchool(teachers, activeSchoolId);
  const schoolEmployees = filterBySchool(employees, activeSchoolId);
  const schoolAccounts = filterBySchool(userAccounts, activeSchoolId);

  const list: EligibleTitularOption[] = [];
  const seenIds = new Set<string>();

  // 1. Add Teachers
  for (const t of schoolTeachers) {
    const name = t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim();
    if (name && !seenIds.has(`teacher-${t.id}`)) {
      seenIds.add(`teacher-${t.id}`);
      list.push({
        id: t.id,
        type: "teacher",
        name,
        roleTitle: t.specialty ? `Enseignant (${t.specialty})` : "Enseignant",
        phone: t.phone,
        email: t.email,
        schoolId: t.schoolId
      });
    }
  }

  // 2. Add Pedagogical / Educational Employees
  for (const e of schoolEmployees) {
    const isPedagogical = 
      e.department === "Enseignement" || 
      e.department === "Direction" || 
      e.function?.toLowerCase().includes("enseignant") || 
      e.function?.toLowerCase().includes("professeur") ||
      e.function?.toLowerCase().includes("éducateur") ||
      e.function?.toLowerCase().includes("directeur") ||
      e.function?.toLowerCase().includes("préfet") ||
      e.function?.toLowerCase().includes("surveillant");

    const name = `${e.lastName || ""} ${e.firstName || ""}`.trim();
    if (name && !seenIds.has(`emp-${e.id}`)) {
      seenIds.add(`emp-${e.id}`);
      list.push({
        id: e.id,
        type: "employee",
        name,
        roleTitle: e.function ? `${e.function} (${e.department})` : `Personnel (${e.department})`,
        phone: e.phone,
        email: e.email,
        schoolId: e.schoolId,
        userAccountId: e.userAccountId
      });
    }
  }

  // 3. Add eligible staff user accounts not already listed
  for (const u of schoolAccounts) {
    if (["Enseignant", "Directeur", "Préfet", "Directeur des Études", "Secrétaire"].includes(u.role || "")) {
      if (u.fullName && !seenIds.has(`acc-${u.id}`)) {
        seenIds.add(`acc-${u.id}`);
        list.push({
          id: u.id,
          type: "user_account",
          name: u.fullName,
          roleTitle: `Compte ${u.role}`,
          phone: u.phone,
          email: u.email,
          schoolId: u.schoolId,
          userAccountId: u.id
        });
      }
    }
  }

  return list.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
}

/**
 * Assign or change a class Titulaire, archiving the former one into titularHistory
 */
export function assignClassTitulaire(
  classRoom: ClassRoom,
  newTitular: { id: string | null; name: string; type?: string; userAccountId?: string } | null,
  actorName: string = "Direction",
  notes?: string
): ClassRoom {
  const nowStr = new Date().toLocaleDateString("fr-FR");
  const currentHistory: ClassTitularHistoryEntry[] = [...(classRoom.titularHistory || [])];

  // If there was a previous titulaire, close their tenure in history
  if (classRoom.classTeacherName && classRoom.classTeacherName !== "Non attribué" && classRoom.classTeacherName !== "À désigner") {
    // Check if already in history or add an entry for the outgoing titulaire
    const lastEntry = currentHistory.find(h => h.type === "titulaire" && !h.endDate);
    if (lastEntry) {
      lastEntry.endDate = nowStr;
    } else {
      currentHistory.unshift({
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: "titulaire",
        staffId: classRoom.classTeacherId,
        userId: classRoom.classTeacherUserId,
        staffName: classRoom.classTeacherName,
        roleTitle: "Titulaire précédent",
        startDate: "Antérieure",
        endDate: nowStr,
        assignedBy: actorName,
        notes: `Remplacement par ${newTitular?.name || "Non attribué"}`
      });
    }
  }

  if (!newTitular || !newTitular.id || newTitular.name === "Non attribué") {
    return {
      ...classRoom,
      classTeacherId: undefined,
      classTeacherUserId: undefined,
      classTeacherName: "Non attribué",
      titularHistory: currentHistory
    };
  }

  // Create new active history entry
  const newEntry: ClassTitularHistoryEntry = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: "titulaire",
    staffId: newTitular.id,
    userId: newTitular.userAccountId,
    staffName: newTitular.name,
    roleTitle: "Enseignant Titulaire",
    startDate: nowStr,
    assignedBy: actorName,
    notes: notes || "Affectation officielle"
  };

  return {
    ...classRoom,
    classTeacherId: newTitular.id,
    classTeacherUserId: newTitular.userAccountId,
    classTeacherName: newTitular.name,
    titularHistory: [newEntry, ...currentHistory]
  };
}

/**
 * Assign or change a class responsible staff member
 */
export function assignClassResponsible(
  classRoom: ClassRoom,
  newResponsible: { id: string | null; name: string; userAccountId?: string; roleTitle?: string } | null,
  actorName: string = "Direction",
  notes?: string
): ClassRoom {
  const nowStr = new Date().toLocaleDateString("fr-FR");
  const currentHistory: ClassTitularHistoryEntry[] = [...(classRoom.titularHistory || [])];

  if (classRoom.responsibleStaffName && classRoom.responsibleStaffName !== "Aucun") {
    const lastEntry = currentHistory.find(h => h.type === "responsable" && !h.endDate);
    if (lastEntry) {
      lastEntry.endDate = nowStr;
    } else {
      currentHistory.unshift({
        id: `hist-resp-${Date.now()}`,
        type: "responsable",
        staffId: classRoom.responsibleStaffId,
        userId: classRoom.responsibleStaffUserId,
        staffName: classRoom.responsibleStaffName,
        roleTitle: "Personnel Responsable précédent",
        startDate: "Antérieure",
        endDate: nowStr,
        assignedBy: actorName,
        notes: `Remplacement par ${newResponsible?.name || "Aucun"}`
      });
    }
  }

  if (!newResponsible || !newResponsible.id || newResponsible.name === "Aucun") {
    return {
      ...classRoom,
      responsibleStaffId: undefined,
      responsibleStaffUserId: undefined,
      responsibleStaffName: "Aucun",
      titularHistory: currentHistory
    };
  }

  const newEntry: ClassTitularHistoryEntry = {
    id: `hist-resp-${Date.now()}`,
    type: "responsable",
    staffId: newResponsible.id,
    userId: newResponsible.userAccountId,
    staffName: newResponsible.name,
    roleTitle: newResponsible.roleTitle || "Personnel Responsable",
    startDate: nowStr,
    assignedBy: actorName,
    notes: notes || "Attribution de la responsabilité de classe"
  };

  return {
    ...classRoom,
    responsibleStaffId: newResponsible.id,
    responsibleStaffUserId: newResponsible.userAccountId,
    responsibleStaffName: newResponsible.name,
    titularHistory: [newEntry, ...currentHistory]
  };
}

/**
 * Resolve guardians for a student live from the Parent records
 */
export function resolveStudentGuardians(
  student: Student,
  parents: Parent[] = []
): {
  guardians: Array<{
    parentId: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    parentAccountNumber?: string;
    relationship: string;
    isPrimary: boolean;
    hasUserAccount: boolean;
  }>;
  primaryGuardian?: {
    parentId: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    parentAccountNumber?: string;
    relationship: string;
    hasUserAccount: boolean;
  };
} {
  const result: Array<{
    parentId: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    parentAccountNumber?: string;
    relationship: string;
    isPrimary: boolean;
    hasUserAccount: boolean;
  }> = [];

  const seenParentIds = new Set<string>();

  // 1. Check parent records that have this student's ID in childrenIds or guardianLinks
  for (const p of parents) {
    const isChildOfParent = 
      (p.childrenIds && p.childrenIds.includes(student.id)) ||
      (p.guardianLinks && p.guardianLinks.some(g => g.studentId === student.id)) ||
      (student.primaryParentId && student.primaryParentId === p.id) ||
      (student.parentIds && student.parentIds.includes(p.id));

    if (isChildOfParent && !seenParentIds.has(p.id)) {
      seenParentIds.add(p.id);
      const isPrimary = student.primaryParentId === p.id || result.length === 0;
      const gLink = p.guardianLinks?.find(g => g.studentId === student.id);
      const sLink = student.guardians?.find(g => g.parentId === p.id);

      result.push({
        parentId: p.id,
        parentName: `${p.lastName || ""} ${p.firstName || ""}`.trim() || p.lastName || "Parent",
        parentPhone: p.phone,
        parentEmail: p.email,
        parentAccountNumber: p.parentAccountNumber,
        relationship: sLink?.relationship || sLink?.relationshipType || gLink?.relationship || p.relationship || "Tuteur légal",
        isPrimary,
        hasUserAccount: !!(p.accountCreated || p.hasUserAccount || p.userAccountId)
      });
    }
  }

  // 2. Check guardians array on student
  if (student.guardians && Array.isArray(student.guardians)) {
    for (const g of student.guardians) {
      if (g.parentId && !seenParentIds.has(g.parentId)) {
        const matchedP = parents.find(p => p.id === g.parentId);
        seenParentIds.add(g.parentId);
        result.push({
          parentId: g.parentId,
          parentName: matchedP ? `${matchedP.lastName} ${matchedP.firstName}` : g.parentName,
          parentPhone: matchedP?.phone || g.parentPhone || "",
          parentEmail: matchedP?.email || g.parentEmail,
          parentAccountNumber: matchedP?.parentAccountNumber || g.parentAccountNumber,
          relationship: g.relationship || g.relationshipType || matchedP?.relationship || "Tuteur",
          isPrimary: !!g.isPrimary || (student.primaryParentId === g.parentId),
          hasUserAccount: !!(matchedP?.accountCreated || matchedP?.hasUserAccount)
        });
      }
    }
  }

  // 3. Fallback to raw student fields if no relational link yet
  if (result.length === 0 && student.parentName && student.parentName.trim()) {
    result.push({
      parentId: student.primaryParentId || `par-raw-${student.id}`,
      parentName: student.parentName,
      parentPhone: student.parentPhone || "",
      parentEmail: student.parentEmail,
      parentAccountNumber: student.parentAccountNumber,
      relationship: "Tuteur légal",
      isPrimary: true,
      hasUserAccount: false
    });
  }

  const primaryGuardian = result.find(g => g.isPrimary) || result[0];

  return {
    guardians: result,
    primaryGuardian
  };
}

/**
 * Resolve children linked to a parent live from the Student records
 */
export function resolveParentChildren(
  parent: Parent,
  students: Student[] = []
): Array<{
  studentId: string;
  studentName: string;
  registrationNumber: string;
  className: string;
  optionName: string;
  relationship: string;
  isPrimary: boolean;
  status: string;
  hasUserAccount: boolean;
}> {
  const result: Array<{
    studentId: string;
    studentName: string;
    registrationNumber: string;
    className: string;
    optionName: string;
    relationship: string;
    isPrimary: boolean;
    status: string;
    hasUserAccount: boolean;
  }> = [];

  const seenStudentIds = new Set<string>();

  // 1. Direct IDs in parent.childrenIds or parent.guardianLinks
  const targetIds = new Set<string>([
    ...(parent.childrenIds || []),
    ...(parent.guardianLinks?.map(g => g.studentId) || [])
  ]);

  for (const s of students) {
    const isDirectlyLinked = targetIds.has(s.id);
    const isLinkedFromStudent = 
      s.primaryParentId === parent.id || 
      (s.parentIds && s.parentIds.includes(parent.id)) ||
      (s.guardians && s.guardians.some(g => g.parentId === parent.id));

    if ((isDirectlyLinked || isLinkedFromStudent) && !seenStudentIds.has(s.id)) {
      seenStudentIds.add(s.id);
      const gLink = parent.guardianLinks?.find(g => g.studentId === s.id);
      const sLink = s.guardians?.find(g => g.parentId === parent.id);

      result.push({
        studentId: s.id,
        studentName: `${s.lastName || ""} ${s.firstName || ""} ${s.postName || ""}`.trim(),
        registrationNumber: s.registrationNumber,
        className: s.className,
        optionName: s.optionName,
        relationship: gLink?.relationship || sLink?.relationship || parent.relationship || "Enfant à charge",
        isPrimary: gLink?.isPrimary ?? (s.primaryParentId === parent.id),
        status: s.status,
        hasUserAccount: !!s.hasUserAccount
      });
    }
  }

  return result;
}

/**
 * Bi-directionally link a parent to a student
 */
export function linkParentAndStudent(
  parent: Parent,
  student: Student,
  relationship: string = "Tuteur légal",
  isPrimary: boolean = false
): { updatedParent: Parent; updatedStudent: Student } {
  const parentFullName = `${parent.lastName || ""} ${parent.firstName || ""}`.trim();
  const studentFullName = `${student.lastName || ""} ${student.firstName || ""} ${student.postName || ""}`.trim();

  // 1. Update Parent
  const newChildrenIds = Array.from(new Set([...(parent.childrenIds || []), student.id]));
  const existingGLinks = (parent.guardianLinks || []).filter(g => g.studentId !== student.id);
  const newParentGLink: ParentGuardianLink = {
    studentId: student.id,
    studentName: studentFullName,
    className: student.className,
    optionName: student.optionName,
    registrationNumber: student.registrationNumber,
    relationship,
    relationshipType: relationship,
    isPrimary
  };

  const updatedParent: Parent = {
    ...parent,
    childrenIds: newChildrenIds,
    childrenNames: Array.from(new Set([...(parent.childrenNames || []).filter(n => n !== "Enfant à rattacher"), studentFullName])),
    guardianLinks: [...existingGLinks, newParentGLink]
  };

  // 2. Update Student
  const newParentIds = Array.from(new Set([...(student.parentIds || []), parent.id]));
  const existingSGuardians = (student.guardians || []).filter(g => g.parentId !== parent.id);
  const newStudentGLink: StudentGuardianLink = {
    parentId: parent.id,
    parentName: parentFullName,
    parentPhone: parent.phone,
    parentEmail: parent.email,
    parentAccountNumber: parent.parentAccountNumber,
    relationship,
    relationshipType: relationship,
    isPrimary,
    receiveSMS: true,
    canPickUp: true
  };

  const updatedStudent: Student = {
    ...student,
    primaryParentId: isPrimary || !student.primaryParentId ? parent.id : student.primaryParentId,
    parentIds: newParentIds,
    guardians: [...existingSGuardians, newStudentGLink],
    parentName: isPrimary || !student.parentName ? parentFullName : student.parentName,
    parentPhone: isPrimary || !student.parentPhone ? parent.phone : student.parentPhone,
    parentEmail: isPrimary || !student.parentEmail ? parent.email : student.parentEmail,
    parentAccountNumber: isPrimary || !student.parentAccountNumber ? parent.parentAccountNumber : student.parentAccountNumber
  };

  return { updatedParent, updatedStudent };
}

/**
 * Bi-directionally unlink a parent from a student
 */
export function unlinkParentAndStudent(
  parent: Parent,
  student: Student
): { updatedParent: Parent; updatedStudent: Student } {
  const studentFullName = `${student.lastName || ""} ${student.firstName || ""}`.trim();

  // 1. Update Parent
  const newChildrenIds = (parent.childrenIds || []).filter(id => id !== student.id);
  const newGLinks = (parent.guardianLinks || []).filter(g => g.studentId !== student.id);
  const newChildrenNames = (parent.childrenNames || []).filter(n => !n.includes(student.lastName) && !n.includes(student.firstName));

  const updatedParent: Parent = {
    ...parent,
    childrenIds: newChildrenIds,
    childrenNames: newChildrenNames.length > 0 ? newChildrenNames : ["Aucun élève lié"],
    guardianLinks: newGLinks
  };

  // 2. Update Student
  const newParentIds = (student.parentIds || []).filter(id => id !== parent.id);
  const newGuardians = (student.guardians || []).filter(g => g.parentId !== parent.id);
  const nextPrimary = newGuardians.find(g => g.isPrimary) || newGuardians[0];

  const updatedStudent: Student = {
    ...student,
    primaryParentId: nextPrimary?.parentId,
    parentIds: newParentIds,
    guardians: newGuardians,
    parentName: nextPrimary ? nextPrimary.parentName : "Non renseigné",
    parentPhone: nextPrimary ? (nextPrimary.parentPhone || "") : "",
    parentEmail: nextPrimary?.parentEmail,
    parentAccountNumber: nextPrimary?.parentAccountNumber
  };

  return { updatedParent, updatedStudent };
}

export const resolveClassResponsibleStaff = resolveClassResponsible;

/**
 * Get all staff user accounts for a school
 */
export function getSchoolStaffAccounts(
  userAccounts: UserAccount[] = [],
  schoolId?: string
): UserAccount[] {
  const filtered = filterBySchool(userAccounts, schoolId);
  return filtered.filter(u => 
    u.role !== "Élève" && 
    u.role !== "Parent" && 
    u.role !== "Tuteur" &&
    u.dossierType !== "eleve" &&
    u.dossierType !== "parent"
  );
}

/**
 * Get teacher user accounts for a school
 */
export function getSchoolTeacherAccounts(
  userAccounts: UserAccount[] = [],
  teachers: Teacher[] = [],
  schoolId?: string
): UserAccount[] {
  const filtered = filterBySchool(userAccounts, schoolId);
  return filtered.filter(u => 
    u.role === "Enseignant" || 
    u.role === "Professeur" || 
    u.role === "Directeur des Études" ||
    u.role === "Préfet" ||
    teachers.some(t => t.id === u.dossierId || t.name === u.fullName)
  );
}
