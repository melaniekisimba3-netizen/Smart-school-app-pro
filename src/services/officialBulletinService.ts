/**
 * SMART SCHOOL RDC — SERVICE CENTRALISÉ DE CALCUL DES BULLETINS OFFICIELS EPST
 * 
 * Norme Officielle : Ministère de l'Éducation Nationale et Nouvelle Citoyenneté (RDC)
 * 
 * Ce service constitue la source de vérité unique (Single Source of Truth)
 * pour le calcul des moyennes, semestres, pourcentages, classements et mentions
 * pour tous les modules (Élève, Parent, Enseignant, Direction, Impression).
 */

import { Student, Subject, Grade, Evaluation, EvaluationScore } from "../types";

export interface PeriodScore {
  obtained: number | null;
  max: number;
}

export interface OfficialSubjectRow {
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  category: "Culture Générale" | "Scientifique" | "Professionnelle" | string;
  coefficient: number;
  hoursPerWeek: number;
  // Premier Semestre
  p1: PeriodScore;
  p2: PeriodScore;
  exam1: PeriodScore;
  totalSem1: PeriodScore;
  // Second Semestre
  p3: PeriodScore;
  p4: PeriodScore;
  exam2: PeriodScore;
  totalSem2: PeriodScore;
  // Annuel
  totalYear: PeriodScore;
  percentageYear: number | null;
  isPassing: boolean; // >= 50%
}

export interface OfficialCategorySummary {
  categoryName: string;
  subjectsCount: number;
  p1Total: PeriodScore;
  p2Total: PeriodScore;
  exam1Total: PeriodScore;
  totalSem1: PeriodScore;
  p3Total: PeriodScore;
  p4Total: PeriodScore;
  exam2Total: PeriodScore;
  totalSem2: PeriodScore;
  totalYear: PeriodScore;
  percentageYear: number | null;
}

export interface OfficialStudentBulletin {
  studentId: string;
  studentName: string;
  studentGender?: string;
  studentNumber?: string;
  permanentId?: string; // N° Permanent EPST
  className: string;
  optionName: string;
  academicYear: string;
  schoolName: string;
  // Grille détaillée des matières
  rows: OfficialSubjectRow[];
  // Regroupement par catégories officielles
  categories: {
    cultureGenerale: OfficialCategorySummary;
    scientifique: OfficialCategorySummary;
    professionnelle: OfficialCategorySummary;
    autres?: OfficialCategorySummary;
  };
  // Totaux Généraux
  grandTotal: {
    p1: PeriodScore;
    p2: PeriodScore;
    exam1: PeriodScore;
    sem1: PeriodScore;
    p3: PeriodScore;
    p4: PeriodScore;
    exam2: PeriodScore;
    sem2: PeriodScore;
    year: PeriodScore;
  };
  // Statistiques de Délibération & Rang
  percentageSem1: number;
  percentageSem2: number;
  percentageAnnual: number;
  rankInClass: number;
  totalStudentsInClass: number;
  mention: string;
  officialDecision: "Admis(e) en classe supérieure" | "Admis(e) au repêchage" | "Ajourné(e) / Doit doubler" | "En attente de délibération";
  failuresCount: number; // Nombre de cotes < 50%
  conductGrade: string; // Conduite (TB, B, P)
  applicationGrade: string; // Application (TB, B, P)
}

/**
 * Calcule le bulletin officiel complet d'un élève selon les normes de l'EPST RDC.
 */
export function calculateOfficialStudentBulletin(params: {
  student: Student;
  allClassStudents: Student[];
  subjects: Subject[];
  grades: Grade[];
  evaluations?: Evaluation[];
  evaluationScores?: EvaluationScore[];
  academicYear?: string;
  schoolName?: string;
  conductGrade?: string;
  applicationGrade?: string;
}): OfficialStudentBulletin {
  const {
    student,
    allClassStudents = [],
    subjects = [],
    grades = [],
    evaluations = [],
    evaluationScores = [],
    academicYear = "2026-2027",
    schoolName = "Complexe Scolaire SmartSchool RDC",
    conductGrade = "Très Bonne (TB)",
    applicationGrade = "Excellente (E)"
  } = params;

  const studentClass = student.className || (student as any).classRoom || "";

  // Filtrer les matières applicables à la classe / option
  const applicableSubjects = subjects.filter((s) => {
    if (!s) return false;
    // Si la matière a un niveau spécifique, vérifier la correspondance
    if (s.className && s.className !== studentClass && !studentClass.includes(s.className)) {
      return false;
    }
    return true;
  });

  // Si aucune matière spécifique, utiliser toutes les matières fournies
  const activeSubjects = applicableSubjects.length > 0 ? applicableSubjects : subjects;

  // Construire la liste des lignes de notes par matière
  const rows: OfficialSubjectRow[] = activeSubjects.map((sub) => {
    const maxTJ = sub.maxPointsInterro || 20;
    const maxEx = sub.maxPointsExamen || 40;
    const coeff = sub.coefficient || 1;

    // Récupérer les notes de la table `grades`
    const studentGrades = grades.filter(
      (g) => g.studentId === student.id && (g.subjectId === sub.id || g.subjectName?.toLowerCase() === sub.name.toLowerCase())
    );

    // Récupérer les notes saisies dans les évaluations modernes si existantes
    const evalScoresMap: Record<string, number> = {};
    if (evaluations.length > 0 && evaluationScores.length > 0) {
      evaluations.forEach((ev) => {
        if (ev.subjectName?.toLowerCase() === sub.name.toLowerCase() || ev.subjectId === sub.id) {
          const sc = evaluationScores.find(s => s.evaluationId === ev.id && s.studentId === student.id);
          const val = sc ? (sc.scoreObtained ?? (sc as any).score) : undefined;
          if (val !== undefined && val !== null && !sc?.isAbsent) {
            evalScoresMap[ev.period] = val;
          }
        }
      });
    }

    // Helper pour extraire la note d'une période
    const getScore = (period: string, maxScore: number): number | null => {
      if (evalScoresMap[period] !== undefined) return evalScoresMap[period];
      const g = studentGrades.find(
        (grade) => grade.period === period || (grade as any).term === period
      );
      if (g) {
        const val = g.scoreObtained ?? (g as any).grade;
        if (typeof val === "number") return val;
      }
      return null;
    };

    const p1Val = getScore("P1", maxTJ);
    const p2Val = getScore("P2", maxTJ);
    const ex1Val = getScore("EXAM1", maxEx) ?? getScore("Examen 1er Semestre", maxEx) ?? getScore("Semestre 1", maxEx);

    const sem1Obtained = (p1Val ?? 0) + (p2Val ?? 0) + (ex1Val ?? 0);
    const sem1Max = maxTJ * 2 + maxEx;

    const p3Val = getScore("P3", maxTJ);
    const p4Val = getScore("P4", maxTJ);
    const ex2Val = getScore("EXAM2", maxEx) ?? getScore("Examen 2ème Semestre", maxEx) ?? getScore("Semestre 2", maxEx);

    const sem2Obtained = (p3Val ?? 0) + (p4Val ?? 0) + (ex2Val ?? 0);
    const sem2Max = maxTJ * 2 + maxEx;

    const totalYearObtained = sem1Obtained + sem2Obtained;
    const totalYearMax = sem1Max + sem2Max;
    const percentageYear = totalYearMax > 0 ? (totalYearObtained / totalYearMax) * 100 : null;

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      category: sub.category || "Culture Générale",
      coefficient: coeff,
      hoursPerWeek: sub.hoursPerWeek || 2,
      p1: { obtained: p1Val, max: maxTJ },
      p2: { obtained: p2Val, max: maxTJ },
      exam1: { obtained: ex1Val, max: maxEx },
      totalSem1: { obtained: sem1Obtained, max: sem1Max },
      p3: { obtained: p3Val, max: maxTJ },
      p4: { obtained: p4Val, max: maxTJ },
      exam2: { obtained: ex2Val, max: maxEx },
      totalSem2: { obtained: sem2Obtained, max: sem2Max },
      totalYear: { obtained: totalYearObtained, max: totalYearMax },
      percentageYear,
      isPassing: percentageYear !== null ? percentageYear >= 50 : true
    };
  });

  // Helper pour sommer les totaux d'une liste de lignes
  const sumCategory = (catRows: OfficialSubjectRow[], catName: string): OfficialCategorySummary => {
    let p1Obt = 0, p1Max = 0;
    let p2Obt = 0, p2Max = 0;
    let ex1Obt = 0, ex1Max = 0;
    let s1Obt = 0, s1Max = 0;
    let p3Obt = 0, p3Max = 0;
    let p4Obt = 0, p4Max = 0;
    let ex2Obt = 0, ex2Max = 0;
    let s2Obt = 0, s2Max = 0;
    let yrObt = 0, yrMax = 0;

    catRows.forEach((r) => {
      p1Obt += r.p1.obtained ?? 0;
      p1Max += r.p1.max;
      p2Obt += r.p2.obtained ?? 0;
      p2Max += r.p2.max;
      ex1Obt += r.exam1.obtained ?? 0;
      ex1Max += r.exam1.max;
      s1Obt += r.totalSem1.obtained ?? 0;
      s1Max += r.totalSem1.max;

      p3Obt += r.p3.obtained ?? 0;
      p3Max += r.p3.max;
      p4Obt += r.p4.obtained ?? 0;
      p4Max += r.p4.max;
      ex2Obt += r.exam2.obtained ?? 0;
      ex2Max += r.exam2.max;
      s2Obt += r.totalSem2.obtained ?? 0;
      s2Max += r.totalSem2.max;

      yrObt += r.totalYear.obtained ?? 0;
      yrMax += r.totalYear.max;
    });

    return {
      categoryName: catName,
      subjectsCount: catRows.length,
      p1Total: { obtained: p1Obt, max: p1Max },
      p2Total: { obtained: p2Obt, max: p2Max },
      exam1Total: { obtained: ex1Obt, max: ex1Max },
      totalSem1: { obtained: s1Obt, max: s1Max },
      p3Total: { obtained: p3Obt, max: p3Max },
      p4Total: { obtained: p4Obt, max: p4Max },
      exam2Total: { obtained: ex2Obt, max: ex2Max },
      totalSem2: { obtained: s2Obt, max: s2Max },
      totalYear: { obtained: yrObt, max: yrMax },
      percentageYear: yrMax > 0 ? (yrObt / yrMax) * 100 : null
    };
  };

  const cultureRows = rows.filter((r) => r.category.toLowerCase().includes("culture") || r.category.toLowerCase().includes("générale"));
  const scienceRows = rows.filter((r) => r.category.toLowerCase().includes("scientifique") || r.category.toLowerCase().includes("science"));
  const proRows = rows.filter((r) => r.category.toLowerCase().includes("professionnelle") || r.category.toLowerCase().includes("technique") || r.category.toLowerCase().includes("option"));
  const otherRows = rows.filter((r) => !cultureRows.includes(r) && !scienceRows.includes(r) && !proRows.includes(r));

  const cultureSummary = sumCategory(cultureRows, "Culture Générale");
  const scienceSummary = sumCategory(scienceRows, "Cours Scientifiques");
  const proSummary = sumCategory(proRows, "Cours Professionnels & d'Option");
  const otherSummary = sumCategory(otherRows, "Autres Branches");

  // Grand Total
  const grandTotalYearObt = cultureSummary.totalYear.obtained! + scienceSummary.totalYear.obtained! + proSummary.totalYear.obtained! + (otherSummary.totalYear.obtained || 0);
  const grandTotalYearMax = cultureSummary.totalYear.max + scienceSummary.totalYear.max + proSummary.totalYear.max + (otherSummary.totalYear.max || 0);

  const grandTotalSem1Obt = cultureSummary.totalSem1.obtained! + scienceSummary.totalSem1.obtained! + proSummary.totalSem1.obtained! + (otherSummary.totalSem1.obtained || 0);
  const grandTotalSem1Max = cultureSummary.totalSem1.max + scienceSummary.totalSem1.max + proSummary.totalSem1.max + (otherSummary.totalSem1.max || 0);

  const grandTotalSem2Obt = cultureSummary.totalSem2.obtained! + scienceSummary.totalSem2.obtained! + proSummary.totalSem2.obtained! + (otherSummary.totalSem2.obtained || 0);
  const grandTotalSem2Max = cultureSummary.totalSem2.max + scienceSummary.totalSem2.max + proSummary.totalSem2.max + (otherSummary.totalSem2.max || 0);

  const percentageAnnual = grandTotalYearMax > 0 ? Number(((grandTotalYearObt / grandTotalYearMax) * 100).toFixed(1)) : 0;
  const percentageSem1 = grandTotalSem1Max > 0 ? Number(((grandTotalSem1Obt / grandTotalSem1Max) * 100).toFixed(1)) : 0;
  const percentageSem2 = grandTotalSem2Max > 0 ? Number(((grandTotalSem2Obt / grandTotalSem2Max) * 100).toFixed(1)) : 0;

  // Calcul du Rang dans la classe
  const classScores = allClassStudents.map((st) => {
    if (st.id === student.id) return { id: st.id, pct: percentageAnnual };
    const stGrades = grades.filter((g) => g.studentId === st.id);
    let totalObt = 0;
    let totalMax = 0;
    stGrades.forEach((g) => {
      const val = g.scoreObtained ?? (g as any).grade;
      if (typeof val === "number") {
        totalObt += val;
        totalMax += g.maxScore || (g as any).maxGrade || 20;
      }
    });
    const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : ((st as any).progress || 50);
    return { id: st.id, pct };
  });

  classScores.sort((a, b) => b.pct - a.pct);
  const rankIdx = classScores.findIndex((s) => s.id === student.id);
  const rankInClass = rankIdx >= 0 ? rankIdx + 1 : 1;
  const totalStudentsInClass = Math.max(allClassStudents.length, 1);

  // Mention officielle
  let mention = "Ajourné";
  if (percentageAnnual >= 80) mention = "Élite / Grande Distinction (GD)";
  else if (percentageAnnual >= 70) mention = "Très Bien / Distinction (D)";
  else if (percentageAnnual >= 60) mention = "Bien / Satisfaction (S)";
  else if (percentageAnnual >= 50) mention = "Passable / Satisfaction (S)";
  else if (percentageAnnual >= 45) mention = "Insuffisant (Repêchage)";
  else mention = "Médiocre / Ajourné";

  // Nombre d'échecs
  const failuresCount = rows.filter((r) => r.percentageYear !== null && r.percentageYear < 50).length;

  // Décision officielle
  let officialDecision: OfficialStudentBulletin["officialDecision"] = "Admis(e) en classe supérieure";
  if (percentageAnnual >= 50 && failuresCount <= 2) {
    officialDecision = "Admis(e) en classe supérieure";
  } else if (percentageAnnual >= 45 || (percentageAnnual >= 50 && failuresCount === 3)) {
    officialDecision = "Admis(e) au repêchage";
  } else if (percentageAnnual < 45 || failuresCount > 3) {
    officialDecision = "Ajourné(e) / Doit doubler";
  } else {
    officialDecision = "En attente de délibération";
  }

  const sName = `${student.lastName || ""} ${student.firstName || ""}`.trim() || (student as any).name || "Élève SmartSchool";

  return {
    studentId: student.id,
    studentName: sName,
    studentGender: student.gender || "M",
    studentNumber: student.registrationNumber || (student as any).studentNumber || `MAT-${student.id.slice(-6)}`,
    permanentId: (student as any).permanentId || `RDC-EPST-${student.id.slice(-8).toUpperCase()}`,
    className: studentClass || "Classe Non Assignée",
    optionName: student.optionName || (student as any).optionName || "Enseignement Général",
    academicYear,
    schoolName,
    rows,
    categories: {
      cultureGenerale: cultureSummary,
      scientifique: scienceSummary,
      professionnelle: proSummary,
      autres: otherSummary
    },
    grandTotal: {
      p1: { obtained: cultureSummary.p1Total.obtained! + scienceSummary.p1Total.obtained! + proSummary.p1Total.obtained!, max: cultureSummary.p1Total.max + scienceSummary.p1Total.max + proSummary.p1Total.max },
      p2: { obtained: cultureSummary.p2Total.obtained! + scienceSummary.p2Total.obtained! + proSummary.p2Total.obtained!, max: cultureSummary.p2Total.max + scienceSummary.p2Total.max + proSummary.p2Total.max },
      exam1: { obtained: cultureSummary.exam1Total.obtained! + scienceSummary.exam1Total.obtained! + proSummary.exam1Total.obtained!, max: cultureSummary.exam1Total.max + scienceSummary.exam1Total.max + proSummary.exam1Total.max },
      sem1: { obtained: grandTotalSem1Obt, max: grandTotalSem1Max },
      p3: { obtained: cultureSummary.p3Total.obtained! + scienceSummary.p3Total.obtained! + proSummary.p3Total.obtained!, max: cultureSummary.p3Total.max + scienceSummary.p3Total.max + proSummary.p3Total.max },
      p4: { obtained: cultureSummary.p4Total.obtained! + scienceSummary.p4Total.obtained! + proSummary.p4Total.obtained!, max: cultureSummary.p4Total.max + scienceSummary.p4Total.max + proSummary.p4Total.max },
      exam2: { obtained: cultureSummary.exam2Total.obtained! + scienceSummary.exam2Total.obtained! + proSummary.exam2Total.obtained!, max: cultureSummary.exam2Total.max + scienceSummary.exam2Total.max + proSummary.exam2Total.max },
      sem2: { obtained: grandTotalSem2Obt, max: grandTotalSem2Max },
      year: { obtained: grandTotalYearObt, max: grandTotalYearMax }
    },
    percentageSem1,
    percentageSem2,
    percentageAnnual,
    rankInClass,
    totalStudentsInClass,
    mention,
    officialDecision,
    failuresCount,
    conductGrade,
    applicationGrade
  };
}
