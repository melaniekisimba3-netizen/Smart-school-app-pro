import { Student, Teacher, Parent, ClassRoom, Option, Subject, Grade, Attendance, Payment, TimetableEntry, NotificationItem } from "./types";
import { getOfficialRDCSubjects } from "./data/nationalCurriculumModels";

export const initialOptions: Option[] = [
  { id: "opt-1", name: "Mathématiques-Physique", code: "MP", desc: "Option Sciences avec forte concentration en Mathématiques, Physique et Chimie (Scientifique).", isActivated: true },
  { id: "opt-2", name: "Pédagogie Générale", code: "PG", desc: "Formation des futurs enseignants de l'école primaire.", isActivated: true },
  { id: "opt-3", name: "Commerciale et Gestion", code: "CG", desc: "Techniques de secrétariat, comptabilité et informatique de gestion.", isActivated: true },
  { id: "opt-4", name: "Électricité", code: "EL", desc: "Techniques industrielles et installations électriques.", isActivated: true },
  { id: "opt-5", name: "Nutrition", code: "NU", desc: "Sciences de l'alimentation, hôtellerie et diététique.", isActivated: true },
  { id: "opt-6", name: "Latin-Philosophie", code: "LP", desc: "Lettres et philosophie ancienne.", isActivated: false },
  { id: "opt-7", name: "Commerciale Informatique", code: "CI", desc: "Informatique appliquée aux affaires.", isActivated: false },
  { id: "opt-8", name: "Chimie-Biologie", code: "CB", desc: "Sciences expérimentales de la vie et de la matière.", isActivated: false },
  { id: "opt-9", name: "Mécanique", code: "ME", desc: "Construction mécanique et moteurs.", isActivated: false },
  { id: "opt-10", name: "Construction", code: "CO", desc: "Bâtiment et travaux publics.", isActivated: false },
  { id: "opt-11", name: "Agriculture", code: "AG", desc: "Agronomie et techniques agricoles.", isActivated: false },
  { id: "opt-12", name: "Informatique", code: "INF", desc: "Génie logiciel et maintenance des réseaux.", isActivated: false },
  { id: "opt-13", name: "Hôtellerie", code: "HO", desc: "Gestion hôtelière et arts de la table.", isActivated: false },
  { id: "opt-14", name: "Coupe et Couture", code: "CC", desc: "Modélisme et design de mode.", isActivated: false }
];

export const initialClasses: ClassRoom[] = [];

export const initialSubjects: Subject[] = getOfficialRDCSubjects("sch-001");

export const initialStudents: Student[] = [];

export const initialTeachers: Teacher[] = [];

export const initialParents: Parent[] = [];

export const initialGrades: Grade[] = [];

export const initialAttendances: Attendance[] = [];

export const initialPayments: Payment[] = [];

export const initialTimetable: TimetableEntry[] = [];

export const initialNotifications: NotificationItem[] = [];

