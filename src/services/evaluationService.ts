/**
 * SMART SCHOOL RDC — MOTEUR D'ÉVALUATIONS ET DE COTATION SCOLAIRE
 * Gère le cycle de vie complet :
 * Direction -> Affectation -> Classe -> Option -> Matière -> Épreuve (Création/Programmation)
 * -> Saisie des points (Validation stricte <= Max) -> Fiche de Cotation consolidée
 * -> Validation Direction -> Verrouillage -> Publication -> Bulletins & Portails Élève / Parent
 */

import { Evaluation, EvaluationScore, EvaluationAuditLog, Grade, Student } from "../types";
import { safeLocalStorage } from "../utils/safeStorage";
import { broadcastRealtimeUpdate } from "./dataPersistenceService";

export interface MarkSheetStudentRow {
  student: Student;
  scores: { [evaluationId: string]: EvaluationScore | undefined };
  totalObtained: number;
  totalMax: number;
  weightedAverage: number; // calculated on scale of 20
  percentage: number;
  rank?: number;
  rankFormatted?: string;
  mention: string;
  mentionColor: string;
  absencesCount: number;
}

export interface ClassMarkSheetData {
  className: string;
  optionName?: string;
  subjectName: string;
  period: string;
  evaluations: Evaluation[];
  rows: MarkSheetStudentRow[];
  classAverage: number;
  highestPercentage: number;
  lowestPercentage: number;
  successRate: number; // % of students >= 50%
}

// -----------------------------------------------------------------------------
// STORAGE KEYS & CACHE HELPERS
// -----------------------------------------------------------------------------
function getEvaluationsKey(schoolId: string): string {
  return `ssrdc_${schoolId || "global"}_evaluations`;
}

function getScoresKey(schoolId: string): string {
  return `ssrdc_${schoolId || "global"}_evaluation_scores`;
}

function getAuditsKey(schoolId: string): string {
  return `ssrdc_${schoolId || "global"}_evaluation_audits`;
}

// -----------------------------------------------------------------------------
// EVALUATIONS CRUD
// -----------------------------------------------------------------------------
export function getStoredEvaluations(schoolId: string): Evaluation[] {
  try {
    const raw = safeLocalStorage.getItem(getEvaluationsKey(schoolId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load evaluations:", e);
    return [];
  }
}

export function saveEvaluation(schoolId: string, evaluation: Evaluation): Evaluation {
  const all = getStoredEvaluations(schoolId);
  const existingIdx = all.findIndex(e => e.id === evaluation.id);
  
  const now = new Date().toISOString();
  const cleanEvaluation: Evaluation = {
    ...evaluation,
    updatedAt: now,
    createdAt: evaluation.createdAt || now
  };

  let updated: Evaluation[];
  if (existingIdx >= 0) {
    updated = [...all];
    updated[existingIdx] = cleanEvaluation;
  } else {
    updated = [cleanEvaluation, ...all];
  }

  safeLocalStorage.setItem(getEvaluationsKey(schoolId), JSON.stringify(updated));
  broadcastRealtimeUpdate(schoolId, "evaluations", "upsert", cleanEvaluation);
  return cleanEvaluation;
}

export function deleteEvaluation(schoolId: string, evaluationId: string): void {
  const all = getStoredEvaluations(schoolId);
  const filtered = all.filter(e => e.id !== evaluationId);
  safeLocalStorage.setItem(getEvaluationsKey(schoolId), JSON.stringify(filtered));

  // Also remove scores for this evaluation
  const allScores = getStoredEvaluationScores(schoolId);
  const remainingScores = allScores.filter(s => s.evaluationId !== evaluationId);
  safeLocalStorage.setItem(getScoresKey(schoolId), JSON.stringify(remainingScores));

  broadcastRealtimeUpdate(schoolId, "evaluations", "delete", { id: evaluationId });
}

// -----------------------------------------------------------------------------
// SCORES MANAGEMENT
// -----------------------------------------------------------------------------
export function getStoredEvaluationScores(schoolId: string, evaluationId?: string): EvaluationScore[] {
  try {
    const raw = safeLocalStorage.getItem(getScoresKey(schoolId));
    if (!raw) return [];
    const all: EvaluationScore[] = JSON.parse(raw);
    if (evaluationId) {
      return all.filter(s => s.evaluationId === evaluationId);
    }
    return all;
  } catch (e) {
    console.error("Failed to load scores:", e);
    return [];
  }
}

export function saveEvaluationScores(
  schoolId: string,
  evaluation: Evaluation,
  newScores: EvaluationScore[],
  actorInfo: { id: string; name: string; role: string },
  auditReason?: string
): { success: boolean; savedCount: number; errors: string[] } {
  const errors: string[] = [];

  // Validation: no score > maxScore or < 0
  for (const s of newScores) {
    if (s.scoreObtained !== null && !s.isAbsent && !s.isDispensed) {
      if (s.scoreObtained < 0) {
        errors.push(`Note négative non autorisée pour ${s.studentName}.`);
      }
      if (s.scoreObtained > evaluation.maxScore) {
        errors.push(`La note (${s.scoreObtained}) pour ${s.studentName} dépasse le barème maximal (${evaluation.maxScore}).`);
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, savedCount: 0, errors };
  }

  const allScores = getStoredEvaluationScores(schoolId);
  const existingScoresMap = new Map<string, EvaluationScore>();
  allScores.forEach(s => existingScoresMap.set(`${s.evaluationId}_${s.studentId}`, s));

  const auditLogs: EvaluationAuditLog[] = [];
  const nowIso = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString("fr-FR");
  const timeStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const updatedScoresList = [...allScores];

  for (const newS of newScores) {
    const key = `${evaluation.id}_${newS.studentId}`;
    const old = existingScoresMap.get(key);

    if (old) {
      // Check if score changed to log audit
      const oldVal = old.isAbsent ? "Absent" : old.isDispensed ? "Dispensé" : old.scoreObtained;
      const newVal = newS.isAbsent ? "Absent" : newS.isDispensed ? "Dispensé" : newS.scoreObtained;

      if (oldVal !== newVal) {
        auditLogs.push({
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          evaluationId: evaluation.id,
          evaluationTitle: evaluation.title,
          studentId: newS.studentId,
          studentName: newS.studentName,
          className: evaluation.className,
          subjectName: evaluation.subjectName,
          actorId: actorInfo.id,
          actorName: actorInfo.name,
          actorRole: actorInfo.role,
          oldScore: oldVal,
          newScore: newVal,
          reason: auditReason || "Modification de note",
          timestamp: nowIso,
          date: dateStr,
          time: timeStr
        });
      }

      // Replace in array
      const idx = updatedScoresList.findIndex(item => item.id === old.id || (item.evaluationId === evaluation.id && item.studentId === newS.studentId));
      if (idx >= 0) {
        updatedScoresList[idx] = { ...newS, recordedAt: nowIso };
      }
    } else {
      // New score entry
      const cleanNew: EvaluationScore = {
        ...newS,
        id: newS.id || `sc-${evaluation.id}-${newS.studentId}-${Date.now()}`,
        recordedAt: nowIso
      };
      updatedScoresList.push(cleanNew);
    }
  }

  // Save scores
  safeLocalStorage.setItem(getScoresKey(schoolId), JSON.stringify(updatedScoresList));

  // Save audit logs if any
  if (auditLogs.length > 0) {
    const allAudits = getEvaluationAudits(schoolId);
    safeLocalStorage.setItem(getAuditsKey(schoolId), JSON.stringify([...auditLogs, ...allAudits]));
  }

  // Auto-sync into conventional Grade[] for bulletins compatibility
  syncEvaluationsToGrades(schoolId, evaluation, updatedScoresList);

  broadcastRealtimeUpdate(schoolId, "evaluation_scores", "upsert", { evaluationId: evaluation.id });
  return { success: true, savedCount: newScores.length, errors: [] };
}

// -----------------------------------------------------------------------------
// AUDIT LOGS
// -----------------------------------------------------------------------------
export function getEvaluationAudits(schoolId: string, evaluationId?: string): EvaluationAuditLog[] {
  try {
    const raw = safeLocalStorage.getItem(getAuditsKey(schoolId));
    if (!raw) return [];
    const list: EvaluationAuditLog[] = JSON.parse(raw);
    if (evaluationId) {
      return list.filter(a => a.evaluationId === evaluationId);
    }
    return list;
  } catch (e) {
    return [];
  }
}

// -----------------------------------------------------------------------------
// DIRECTION STATUS WORKFLOW (DRAFT -> SUBMITTED -> VALIDATED -> PUBLISHED)
// -----------------------------------------------------------------------------
export function updateEvaluationStatus(
  schoolId: string,
  evaluationId: string,
  targetStatus: "draft" | "submitted" | "validated" | "published",
  actorInfo: { name: string; role: string }
): Evaluation | null {
  const all = getStoredEvaluations(schoolId);
  const target = all.find(e => e.id === evaluationId);
  if (!target) return null;

  const now = new Date().toISOString();
  const updated: Evaluation = {
    ...target,
    status: targetStatus,
    updatedAt: now,
    ...(targetStatus === "validated" ? { validatedAt: now, validatedBy: actorInfo.name } : {}),
    ...(targetStatus === "published" ? { publishedAt: now } : {})
  };

  const saved = saveEvaluation(schoolId, updated);

  // Update status on all associated scores
  const allScores = getStoredEvaluationScores(schoolId);
  let changedScores = false;
  const updatedScores = allScores.map(s => {
    if (s.evaluationId === evaluationId) {
      changedScores = true;
      return { ...s, status: targetStatus };
    }
    return s;
  });

  if (changedScores) {
    safeLocalStorage.setItem(getScoresKey(schoolId), JSON.stringify(updatedScores));
    syncEvaluationsToGrades(schoolId, updated, updatedScores);
  }

  return saved;
}

// -----------------------------------------------------------------------------
// SYNC EVALUATIONS TO GRADES (BULLETINS INTEGRATION)
// -----------------------------------------------------------------------------
export function syncEvaluationsToGrades(
  schoolId: string,
  evaluation: Evaluation,
  allScores?: EvaluationScore[]
): void {
  try {
    const scores = allScores || getStoredEvaluationScores(schoolId);
    const evalScores = scores.filter(s => s.evaluationId === evaluation.id);
    if (evalScores.length === 0) return;

    const gradesKey = `ssrdc_${schoolId || "global"}_grades`;
    const existingGrades: Grade[] = JSON.parse(safeLocalStorage.getItem(gradesKey) || "[]");

    const newGrades: Grade[] = evalScores
      .filter(s => s.scoreObtained !== null && !s.isAbsent)
      .map(s => ({
        id: `grd-eval-${evaluation.id}-${s.studentId}`,
        studentId: s.studentId,
        studentName: s.studentName,
        subjectId: evaluation.subjectId,
        subjectName: evaluation.subjectName,
        period: evaluation.period as any,
        scoreObtained: s.scoreObtained || 0,
        maxScore: evaluation.maxScore,
        recordedBy: s.recordedBy || evaluation.teacherName,
        recordedDate: evaluation.date,
        schoolId: schoolId,
        classId: evaluation.classId,
        className: evaluation.className,
        academicYear: evaluation.academicYear,
        teacherId: evaluation.teacherId,
        teacherName: evaluation.teacherName,
        status: evaluation.status as any,
        validationDate: evaluation.validatedAt,
        validatedBy: evaluation.validatedBy,
        comments: s.comments || evaluation.title,
        evaluationType: evaluation.type,
        evaluationId: evaluation.id,
        term: evaluation.period
      }));

    // Merge: remove any older grades that came from this evaluationId
    const otherGrades = existingGrades.filter(g => (g as any).evaluationId !== evaluation.id);
    const merged = [...newGrades, ...otherGrades];

    safeLocalStorage.setItem(gradesKey, JSON.stringify(merged));
    broadcastRealtimeUpdate(schoolId, "grades", "upsert", newGrades);
  } catch (e) {
    console.error("Failed to sync evaluation to grades:", e);
  }
}

// -----------------------------------------------------------------------------
// FICHE DE COTATION & CALCULATIONS ENGINE
// -----------------------------------------------------------------------------
export function calculateClassMarkSheet(
  students: Student[],
  evaluations: Evaluation[],
  allScores: EvaluationScore[]
): ClassMarkSheetData {
  const scoresByEvalAndStudent = new Map<string, EvaluationScore>();
  allScores.forEach(s => scoresByEvalAndStudent.set(`${s.evaluationId}_${s.studentId}`, s));

  // Sort evaluations by date
  const sortedEvals = [...evaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const rows: MarkSheetStudentRow[] = students.map(std => {
    const studentScores: { [evaluationId: string]: EvaluationScore | undefined } = {};
    let totalObtained = 0;
    let totalMax = 0;
    let weightedObtained = 0;
    let weightedMax = 0;
    let absencesCount = 0;

    sortedEvals.forEach(ev => {
      const score = scoresByEvalAndStudent.get(`${ev.id}_${std.id}`);
      studentScores[ev.id] = score;

      const coef = ev.coefficient || 1;

      if (score && score.isAbsent) {
        absencesCount++;
      } else if (score && score.scoreObtained !== null && !score.isDispensed) {
        totalObtained += score.scoreObtained;
        totalMax += ev.maxScore;
        weightedObtained += score.scoreObtained * coef;
        weightedMax += ev.maxScore * coef;
      }
    });

    const percentage = weightedMax > 0 ? (weightedObtained / weightedMax) * 100 : 0;
    const weightedAverage = weightedMax > 0 ? (weightedObtained / weightedMax) * 20 : 0; // scaled on 20

    let mention = "Sans note";
    let mentionColor = "text-slate-400";

    if (weightedMax > 0) {
      if (percentage >= 90) {
        mention = "Élite / Grande Distinction";
        mentionColor = "text-indigo-600 dark:text-indigo-400 font-black";
      } else if (percentage >= 80) {
        mention = "Très Bien / Distinction";
        mentionColor = "text-emerald-600 dark:text-emerald-400 font-bold";
      } else if (percentage >= 70) {
        mention = "Bien / Satisfaction Majeure";
        mentionColor = "text-teal-600 dark:text-teal-400 font-bold";
      } else if (percentage >= 60) {
        mention = "Assez Bien / Satisfaction";
        mentionColor = "text-blue-600 dark:text-blue-400 font-semibold";
      } else if (percentage >= 50) {
        mention = "Passable / Juste la moyenne";
        mentionColor = "text-amber-600 dark:text-amber-400";
      } else if (percentage >= 40) {
        mention = "Insuffisant / Médiocre";
        mentionColor = "text-rose-500 font-medium";
      } else {
        mention = "Faible / Très Insuffisant";
        mentionColor = "text-red-700 dark:text-red-400 font-black";
      }
    }

    return {
      student: std,
      scores: studentScores,
      totalObtained: Math.round(totalObtained * 10) / 10,
      totalMax,
      weightedAverage: Math.round(weightedAverage * 10) / 10,
      percentage: Math.round(percentage * 10) / 10,
      mention,
      mentionColor,
      absencesCount
    };
  });

  // Calculate Ranks
  const sortedByScore = [...rows].sort((a, b) => b.percentage - a.percentage);
  sortedByScore.forEach((row, idx) => {
    if (row.totalMax > 0) {
      row.rank = idx + 1;
      row.rankFormatted = idx === 0 ? "1er" : `${idx + 1}ème`;
    } else {
      row.rank = undefined;
      row.rankFormatted = "-";
    }
  });

  // Summary stats
  const scoredRows = rows.filter(r => r.totalMax > 0);
  const avg = scoredRows.length > 0 ? scoredRows.reduce((sum, r) => sum + r.percentage, 0) / scoredRows.length : 0;
  const highest = scoredRows.length > 0 ? Math.max(...scoredRows.map(r => r.percentage)) : 0;
  const lowest = scoredRows.length > 0 ? Math.min(...scoredRows.map(r => r.percentage)) : 0;
  const passingCount = scoredRows.filter(r => r.percentage >= 50).length;
  const successRate = scoredRows.length > 0 ? (passingCount / scoredRows.length) * 100 : 0;

  return {
    className: evaluations[0]?.className || "",
    optionName: evaluations[0]?.optionName,
    subjectName: evaluations[0]?.subjectName || "",
    period: evaluations[0]?.period || "",
    evaluations: sortedEvals,
    rows,
    classAverage: Math.round(avg * 10) / 10,
    highestPercentage: Math.round(highest * 10) / 10,
    lowestPercentage: Math.round(lowest * 10) / 10,
    successRate: Math.round(successRate * 10) / 10
  };
}
