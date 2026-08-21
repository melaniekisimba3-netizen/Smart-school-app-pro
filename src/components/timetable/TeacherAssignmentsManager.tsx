import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  School, 
  Edit3, 
  ArrowRight,
  Sparkles,
  X
} from "lucide-react";
import { CourseAssignment, ClassRoom, Subject, Teacher } from "../../types";

interface TeacherAssignmentsManagerProps {
  assignments: CourseAssignment[];
  classes: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  onAssignCourse: (asg: Omit<CourseAssignment, "id" | "assignedDate">) => { success: boolean; message: string };
  onDeleteAssignment: (id: string) => void;
  userRole?: string;
  userName?: string;
}

export const TeacherAssignmentsManager: React.FC<TeacherAssignmentsManagerProps> = ({
  assignments,
  classes,
  subjects,
  teachers,
  onAssignCourse,
  onDeleteAssignment,
  userRole = "Préfet des Études",
  userName = "Direction"
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("Tous");
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("Tous");
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] ? `${classes[0].level} ${classes[0].roomLetter}` : "");
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.name || "");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [weeklyHours, setWeeklyHours] = useState(4);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper for teacher name
  const getTeacherName = (t: Teacher) => {
    if (t.name) return t.name;
    const full = `${t.firstName || ""} ${t.lastName || ""}`.trim();
    return full || "Enseignant";
  };

  // Build matrix of all Class x Subject combinations
  const allRequiredCourses = useMemo(() => {
    const list: {
      key: string;
      className: string;
      classObj?: ClassRoom;
      subject: Subject;
      assignment?: CourseAssignment;
      isAssigned: boolean;
    }[] = [];

    classes.forEach(cls => {
      const clsName = `${cls.level} ${cls.roomLetter}`.trim() || cls.name || "Classe";
      const clsCat = cls.levelCategory || "Secondaire";
      const clsOption = cls.option || "Tronc Commun";

      // Filter relevant subjects for this class
      const relSubjects = subjects.filter(s => {
        if (s.className && s.className.toLowerCase() === clsName.toLowerCase()) return true;
        if (s.levelCategory && s.levelCategory !== clsCat) return false;
        if (s.optionName && s.optionName !== clsOption && s.optionName !== "Tronc Commun" && !s.isCommon) return false;
        return true;
      });

      const effectiveSubjects = relSubjects.length > 0 ? relSubjects : subjects.slice(0, 6);

      effectiveSubjects.forEach(sub => {
        const asg = assignments.find(a => 
          a.className.toLowerCase() === clsName.toLowerCase() &&
          a.subjectName.toLowerCase() === sub.name.toLowerCase()
        );

        list.push({
          key: `${clsName}_${sub.name}`,
          className: clsName,
          classObj: cls,
          subject: sub,
          assignment: asg,
          isAssigned: !!asg
        });
      });
    });

    return list;
  }, [classes, subjects, assignments]);

  // Statistics
  const totalCourses = allRequiredCourses.length;
  const assignedCourses = allRequiredCourses.filter(c => c.isAssigned).length;
  const unassignedCourses = totalCourses - assignedCourses;
  const coverageRate = totalCourses > 0 ? Math.round((assignedCourses / totalCourses) * 100) : 100;

  // Filtered list
  const filteredCourses = allRequiredCourses.filter(item => {
    if (showUnassignedOnly && item.isAssigned) return false;

    const matchesSearch = item.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.assignment?.teacherName && item.assignment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = selectedClassFilter === "Tous" || item.className === selectedClassFilter;
    const matchesTeacher = selectedTeacherFilter === "Tous" || item.assignment?.teacherName === selectedTeacherFilter;

    return matchesSearch && matchesClass && matchesTeacher;
  });

  const handleOpenAssignModal = (targetClass?: string, targetSubject?: string) => {
    setSelectedClass(targetClass || (classes[0] ? `${classes[0].level} ${classes[0].roomLetter}` : ""));
    setSelectedSubject(targetSubject || (subjects[0]?.name || ""));
    setSelectedTeacher(teachers[0] ? getTeacherName(teachers[0]) : "");
    const matchingSubject = subjects.find(s => s.name === targetSubject);
    setWeeklyHours(matchingSubject?.hoursPerWeek || 4);
    setErrorMessage(null);
    setShowAssignModal(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedClass || !selectedSubject || !selectedTeacher) {
      setErrorMessage("Veuillez sélectionner la classe, la matière et l'enseignant.");
      return;
    }

    const targetTeacherObj = teachers.find(t => getTeacherName(t) === selectedTeacher);
    const targetSubjectObj = subjects.find(s => s.name === selectedSubject);
    const targetClassObj = classes.find(c => `${c.level} ${c.roomLetter}` === selectedClass);

    const result = onAssignCourse({
      className: selectedClass,
      subjectName: selectedSubject,
      subjectId: targetSubjectObj?.id || `subj-${Date.now()}`,
      teacherName: selectedTeacher,
      teacherId: targetTeacherObj?.id || `teach-${Date.now()}`,
      levelCategory: targetClassObj?.levelCategory || "Secondaire",
      optionName: targetClassObj?.option || "Tronc Commun",
      weeklyHours: Number(weeklyHours),
      assignedBy: userName,
      assignedByRole: userRole,
      schoolYear: "2025-2026"
    });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setShowAssignModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Affectation des Enseignants (Classe → Matière → Enseignant)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Attribution des charges horaires par classe et suivi de la couverture pédagogique de l'établissement.
          </p>
        </div>

        <button
          onClick={() => handleOpenAssignModal()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Affectation</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Cours Requis</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalCourses}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cours Pourvus</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">{assignedCourses}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Postes Vacants (Sans Prof)</span>
          <span className="text-2xl font-black text-amber-600 font-mono">{unassignedCourses}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taux de Couverture</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-brand-blue font-mono">{coverageRate}%</span>
            <span className="text-[10px] text-slate-400">EPST</span>
          </div>
        </div>
      </div>

      {/* Filter Bar with Unassigned Toggle */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="min-w-[180px] relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer matière, prof, classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
            />
          </div>

          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
          >
            <option value="Tous">Toutes les Classes</option>
            {classes.map(c => {
              const name = `${c.level} ${c.roomLetter}`;
              return <option key={c.id} value={name}>{name}</option>;
            })}
          </select>

          <select
            value={selectedTeacherFilter}
            onChange={(e) => setSelectedTeacherFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
          >
            <option value="Tous">Tous les Enseignants</option>
            {teachers.map(t => {
              const name = getTeacherName(t);
              return <option key={t.id} value={name}>{name}</option>;
            })}
          </select>
        </div>

        {/* Toggle Unassigned Only */}
        <button
          onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            showUnassignedOnly 
              ? "bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20"
              : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${showUnassignedOnly ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>Matières sans enseignant ({unassignedCourses})</span>
        </button>
      </div>

      {/* Assignments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Classe & Section</th>
                <th className="py-3 px-4">Matière & Volume</th>
                <th className="py-3 px-4">Enseignant Titulaire</th>
                <th className="py-3 px-4">Statut d'Affectation</th>
                <th className="py-3 px-4">Affecté Par</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun cours correspondant aux critères.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((item) => (
                  <tr key={item.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div>{item.className}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {item.classObj?.option || "Tronc Commun"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.subject.name}</div>
                      <span className="text-[10px] text-brand-blue font-mono font-bold">
                        {item.subject.hoursPerWeek}h / semaine • Coeff {item.subject.coefficient || 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.isAssigned ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-brand-blue flex items-center justify-center font-bold text-[10px]">
                            {item.assignment?.teacherName?.charAt(0) || "P"}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.assignment?.teacherName}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          Non attribué - Poste vacant
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Attribué
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600">
                          À pourvoir
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[10px]">
                      {item.assignment ? (
                        <div>
                          <div>{item.assignment.assignedBy}</div>
                          <span className="text-slate-400">{item.assignment.assignedDate}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.isAssigned ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenAssignModal(item.className, item.subject.name)}
                            className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition"
                            title="Changer d'enseignant"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => item.assignment && onDeleteAssignment(item.assignment.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Retirer l'affectation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenAssignModal(item.className, item.subject.name)}
                          className="px-2.5 py-1 bg-brand-blue text-white rounded-lg font-bold text-[10px] hover:bg-blue-700 transition shadow-xs"
                        >
                          Affecter
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ASSIGN TEACHER */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Affectation d'un Enseignant
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Classe *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  {classes.map(c => {
                    const name = `${c.level} ${c.roomLetter}`;
                    return <option key={c.id} value={name}>{name}</option>;
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Matière *</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    const found = subjects.find(s => s.name === e.target.value);
                    if (found) setWeeklyHours(found.hoursPerWeek || 4);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.hoursPerWeek}h/sem)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Enseignant Titulaire *</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-brand-blue"
                >
                  {teachers.map(t => {
                    const name = getTeacherName(t);
                    return <option key={t.id} value={name}>{name} ({t.speciality || t.role})</option>;
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Volume Horaire Hebdomadaire (Heures)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-blue text-white font-bold rounded-xl shadow-sm hover:bg-blue-700"
                >
                  Confirmer l'Affectation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
