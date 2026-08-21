import React, { useMemo } from "react";
import { motion } from "motion/react";
import {
  X,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Link2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Camera
} from "lucide-react";
import { Student, Parent, ClassRoom, UserAccount } from "../../types";
import { resolveStudentGuardians, filterBySchool } from "../../services/entityRelationshipService";

export interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string | null;
  student?: Student | null;
  students: Student[];
  parents: Parent[];
  classes?: ClassRoom[];
  schoolId?: string;
  schoolName?: string;
  onOpenParentFile?: (parentId: string) => void;
  onOpenLoginSheet?: (student: Student) => void;
  onOpenRelationshipManager?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  userRole?: string;
}

export function StudentDetailModal({
  isOpen,
  onClose,
  studentId,
  student: propStudent,
  students = [],
  parents = [],
  classes = [],
  schoolId,
  schoolName = "Établissement Scolaire",
  onOpenParentFile,
  onOpenLoginSheet,
  onOpenRelationshipManager,
  onEditStudent,
  userRole
}: StudentDetailModalProps) {
  if (!isOpen) return null;

  // Resolve target student by ID or prop
  const targetStudent = useMemo(() => {
    if (propStudent) return propStudent;
    if (!studentId) return null;
    return students.find(s => s.id === studentId || s.registrationNumber === studentId);
  }, [propStudent, studentId, students]);

  // Multi-tenant check
  const isAuthorizedSchool = useMemo(() => {
    if (!targetStudent) return false;
    if (!schoolId || schoolId === "default" || schoolId === "sch-001") return true;
    if (userRole === "SuperAdmin" || userRole === "Inspecteur National") return true;
    return !targetStudent.schoolId || targetStudent.schoolId === schoolId;
  }, [targetStudent, schoolId, userRole]);

  if (!targetStudent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Dossier Élève Introuvable</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aucun élève correspondant à l'identifiant "{studentId || "Inconnu"}" n'a été trouvé.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorizedSchool) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Accès Non Autorisé (Isolation École)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ce dossier élève appartient à un autre établissement scolaire.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // Live resolve guardians
  const schoolFilteredParents = filterBySchool(parents, schoolId);
  const { guardians } = resolveStudentGuardians(targetStudent, schoolFilteredParents);
  const fullName = `${targetStudent.lastName || ""} ${targetStudent.firstName || ""} ${targetStudent.postName || ""}`.trim();
  const initials = `${(targetStudent.firstName || "E")[0]}${(targetStudent.lastName || "L")[0]}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-left my-auto"
      >
        {/* TOP BAR */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-brand-blue dark:text-blue-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Fiche Scolaire & Identité de l'Élève
                </h2>
                <span className="text-[10px] font-mono font-bold text-brand-blue bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                  {targetStudent.registrationNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {schoolName} · Dossier académique et rattachement tutélaire
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onEditStudent && (
              <button
                type="button"
                onClick={() => onEditStudent(targetStudent)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Modifier</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* HERO CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-slate-50 to-white dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative shrink-0">
                {targetStudent.photoUrl ? (
                  <img
                    src={targetStudent.photoUrl}
                    alt={fullName}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white dark:border-slate-800">
                    {initials}
                  </div>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                    targetStudent.hasUserAccount ? "bg-emerald-500 text-white" : "bg-amber-400 text-slate-900"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {fullName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    {targetStudent.className}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Option : {targetStudent.optionName || "Tronc Commun"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      targetStudent.status === "Validé" || targetStudent.status === "Actif"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200"
                    }`}
                  >
                    {targetStudent.status || "Inscrit"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onOpenLoginSheet && (
                <button
                  type="button"
                  onClick={() => onOpenLoginSheet(targetStudent)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <KeyRound className="h-3.5 w-3.5 text-brand-blue" />
                  <span>Fiche d'accès élève</span>
                </button>
              )}

              {onOpenRelationshipManager && (
                <button
                  type="button"
                  onClick={() => onOpenRelationshipManager(targetStudent)}
                  className="px-3.5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Liaisons Parents ({guardians.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* STUDENT DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
              <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">
                Informations Personnelles
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-400">Date de naissance :</span>
                <span className="font-bold text-slate-900 dark:text-white">{targetStudent.birthDate || "Non renseignée"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Genre :</span>
                <span className="font-bold text-slate-900 dark:text-white">{targetStudent.gender === "M" ? "Masculin (M)" : "Féminin (F)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Adresse de résidence :</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{targetStudent.address || "Kinshasa, RDC"}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
              <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">
                Compte Utilisateur & Portail
              </h4>
              <div className="flex justify-between">
                <span className="text-slate-400">Matricule & Identifiant :</span>
                <span className="font-mono font-bold text-brand-blue">{targetStudent.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accès Portail Élève :</span>
                <span className="font-bold text-emerald-600">{targetStudent.hasUserAccount ? "Actif & Configuré" : "Non configuré"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Téléphone de contact urgence :</span>
                <span className="font-medium text-slate-900 dark:text-white">{targetStudent.parentPhone || "Non renseigné"}</span>
              </div>
            </div>
          </div>

          {/* PARENTS & GUARDIANS RATTACHÉS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Users className="h-4 w-4" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm">
                  Parents & Tuteurs Rattachés à cet Élève
                </h4>
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  {guardians.length}
                </span>
              </div>

              {onOpenRelationshipManager && (
                <button
                  type="button"
                  onClick={() => onOpenRelationshipManager(targetStudent)}
                  className="text-xs text-brand-blue hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Rattacher un parent</span>
                </button>
              )}
            </div>

            {guardians.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Aucun parent ou tuteur n’est actuellement lié à cet élève.
                </p>
                <p className="text-xs text-slate-400">
                  Vous pouvez rattacher un parent enregistré dans l'école pour le suivi des alertes SMS et frais.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guardians.map(g => (
                  <div
                    key={g.parentId}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black shrink-0">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-black text-slate-900 dark:text-white text-xs">
                              {g.parentName}
                            </h5>
                            {g.isPrimary && (
                              <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded-full">
                                Principal
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.2 rounded inline-block mt-1">
                            {g.relationship || "Tuteur"}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1">
                            📞 {g.parentPhone || "Téléphone non renseigné"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-mono text-slate-400">
                        {g.parentAccountNumber || "PAR-2026-X"}
                      </span>

                      {onOpenParentFile && (
                        <button
                          type="button"
                          onClick={() => onOpenParentFile(g.parentId)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors bg-indigo-50/50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-900/60"
                        >
                          <span>Voir fiche parent</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Traçabilité académique SmartSchool RDC
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
