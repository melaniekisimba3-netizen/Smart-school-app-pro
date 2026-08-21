import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Printer,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  IdCard,
  MessageCircle,
  ChevronRight,
  Sparkles,
  QrCode
} from "lucide-react";
import { Parent, Student, ClassRoom, UserAccount } from "../../types";
import { resolveParentChildren, filterBySchool } from "../../services/entityRelationshipService";

export interface ParentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
  parent?: Parent | null;
  parents: Parent[];
  students: Student[];
  classes?: ClassRoom[];
  schoolId?: string;
  schoolName?: string;
  schoolLogoUrl?: string;
  schoolMotto?: string;
  onOpenStudentFile?: (studentId: string) => void;
  onOpenLoginSheet?: (parent: Parent) => void;
  onOpenRelationshipManager?: (parent: Parent) => void;
  onUpdateParent?: (updatedParent: Parent) => void;
  userRole?: string;
}

export function ParentDetailModal({
  isOpen,
  onClose,
  parentId,
  parent: propParent,
  parents = [],
  students = [],
  classes = [],
  schoolId,
  schoolName = "Établissement Scolaire",
  schoolLogoUrl,
  schoolMotto,
  onOpenStudentFile,
  onOpenLoginSheet,
  onOpenRelationshipManager,
  onUpdateParent,
  userRole
}: ParentDetailModalProps) {
  if (!isOpen) return null;

  // Resolve target parent by ID or prop with multi-tenant filtering
  const targetParent = useMemo(() => {
    if (propParent) return propParent;
    if (!parentId) return null;
    return parents.find(p => p.id === parentId || p.parentAccountNumber === parentId);
  }, [propParent, parentId, parents]);

  // Multi-tenant check: ensure parent belongs to the same school
  const isAuthorizedSchool = useMemo(() => {
    if (!targetParent) return false;
    if (!schoolId || schoolId === "default" || schoolId === "sch-001") return true;
    if (userRole === "SuperAdmin" || userRole === "Inspecteur National") return true;
    return !targetParent.schoolId || targetParent.schoolId === schoolId;
  }, [targetParent, schoolId, userRole]);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editLastName, setEditLastName] = useState(targetParent?.lastName || "");
  const [editFirstName, setEditFirstName] = useState(targetParent?.firstName || "");
  const [editPhone, setEditPhone] = useState(targetParent?.phone || "");
  const [editEmail, setEditEmail] = useState(targetParent?.email || "");
  const [editAddress, setEditAddress] = useState(targetParent?.address || "");
  const [editRelationship, setEditRelationship] = useState(targetParent?.relationship || "Tuteur légal");
  const [editProfession, setEditProfession] = useState(targetParent?.profession || "");

  // Update form fields when target parent changes
  React.useEffect(() => {
    if (targetParent) {
      setEditLastName(targetParent.lastName || "");
      setEditFirstName(targetParent.firstName || "");
      setEditPhone(targetParent.phone || "");
      setEditEmail(targetParent.email || "");
      setEditAddress(targetParent.address || "");
      setEditRelationship(targetParent.relationship || "Tuteur légal");
      setEditProfession(targetParent.profession || "");
    }
  }, [targetParent]);

  // Save changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetParent || !onUpdateParent) return;

    const updated: Parent = {
      ...targetParent,
      lastName: editLastName.trim().toUpperCase(),
      firstName: editFirstName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      address: editAddress.trim(),
      relationship: editRelationship,
      profession: editProfession.trim()
    };

    onUpdateParent(updated);
    setIsEditing(false);
  };

  // If not found or unauthorized
  if (!targetParent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Dossier Parent Introuvable</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aucun compte parent correspondant à l'identifiant <span className="font-mono font-bold">"{parentId || "Inconnu"}"</span> n'a été trouvé.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-all"
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
            Ce dossier parent appartient à un autre établissement scolaire. La souveraineté des données et le cloisonnement multi-tenant interdisent cet accès.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // Live resolve children of this parent (multi-tenant safe)
  const schoolFilteredStudents = filterBySchool(students, schoolId);
  const resolvedChildren = resolveParentChildren(targetParent, schoolFilteredStudents);

  const fullName = `${targetParent.lastName || ""} ${targetParent.firstName || ""}`.trim();
  const initials = `${(targetParent.firstName || "P")[0]}${(targetParent.lastName || "T")[0]}`.toUpperCase();
  const parentIdDisplay = targetParent.parentAccountNumber || targetParent.id;
  const isAccountActive = targetParent.accountCreated || targetParent.portalAccess || targetParent.hasUserAccount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-left my-auto"
      >
        {/* MODAL TOP HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Fiche Détaillée du Parent / Tuteur
                </h2>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                  {parentIdDisplay}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {schoolName} · Dossier institutionnel et relations élèves
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isEditing
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
              title={isEditing ? "Annuler la modification" : "Modifier la fiche"}
            >
              <Edit3 className="h-4 w-4" />
              <span className="hidden sm:inline">{isEditing ? "Annuler" : "Modifier"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MODAL MAIN CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* PROFILE SUMMARY HERO CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {/* Photo or Initials Avatar */}
              <div className="relative shrink-0">
                {targetParent.photoUrl ? (
                  <img
                    src={targetParent.photoUrl}
                    alt={fullName}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white dark:border-slate-800">
                    {initials}
                  </div>
                )}
                <div
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                    isAccountActive ? "bg-emerald-500 text-white" : "bg-amber-400 text-slate-900"
                  }`}
                  title={isAccountActive ? "Compte portail actif" : "Compte en attente"}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              </div>

              {/* Identity & Status */}
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {fullName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {targetParent.relationship || "Tuteur légal"}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAccountActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {isAccountActive ? "Compte Portail Actif" : "Compte Non Activé"}
                  </span>

                  {targetParent.profession && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Briefcase className="h-3 w-3 text-slate-400" />
                      {targetParent.profession}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onOpenLoginSheet && (
                <button
                  type="button"
                  onClick={() => onOpenLoginSheet(targetParent)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
                  title="Fiche d'accès et QR code de connexion"
                >
                  <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Identifiants & Accès</span>
                </button>
              )}

              {onOpenRelationshipManager && (
                <button
                  type="button"
                  onClick={() => onOpenRelationshipManager(targetParent)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
                  title="Gérer les liaisons avec les élèves"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Gérer Liaisons ({resolvedChildren.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* EDIT FORM (TOGGLEABLE) */}
          <AnimatePresence>
            {isEditing && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveEdit}
                className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-4 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/60 pb-2">
                  <h4 className="font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <Edit3 className="h-4 w-4 text-amber-600" />
                    Modifier les Coordonnées & Informations
                  </h4>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                    Mise à jour en temps réel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nom de famille *
                    </label>
                    <input
                      required
                      value={editLastName}
                      onChange={e => setEditLastName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Prénom *
                    </label>
                    <input
                      required
                      value={editFirstName}
                      onChange={e => setEditFirstName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lien de parenté *
                    </label>
                    <select
                      value={editRelationship}
                      onChange={e => setEditRelationship(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                    >
                      <option value="Père">Père</option>
                      <option value="Mère">Mère</option>
                      <option value="Tuteur">Tuteur</option>
                      <option value="Tuteur légal">Tuteur légal</option>
                      <option value="Responsable légal">Responsable légal</option>
                      <option value="Autre responsable autorisé">Autre responsable autorisé</option>
                      <option value="Oncle / Tante">Oncle / Tante</option>
                      <option value="Grand-parent">Grand-parent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Téléphone mobile *
                    </label>
                    <input
                      required
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Adresse e-mail
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Profession
                    </label>
                    <input
                      value={editProfession}
                      onChange={e => setEditProfession(e.target.value)}
                      placeholder="ex: Médecin, Cadre, Commerçant"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Adresse résidentielle / Domicile
                  </label>
                  <input
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    placeholder="ex: Av. Colonel Mondjiba n°42, Commune de Ngaliema, Kinshasa"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Enregistrer les modifications</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* TWO-COLUMN DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* COLUMN 1: CONTACTS & COORDONNÉES */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                <Phone className="h-4 w-4 text-indigo-600" />
                Coordonnées & Communication
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Téléphone principal :
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${targetParent.phone}`}
                      className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {targetParent.phone || "Non renseigné"}
                    </a>
                    {targetParent.phone && (
                      <a
                        href={`https://wa.me/${targetParent.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 p-1 rounded-md transition-colors"
                        title="Envoyer un message WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Adresse e-mail :
                  </span>
                  {targetParent.email ? (
                    <a
                      href={`mailto:${targetParent.email}`}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {targetParent.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Non renseignée</span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Adresse physique :
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                    {targetParent.address || "Adresse non enregistrée"}
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: COMPTE & SÉCURITÉ */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Compte Portail & Sécurité
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <IdCard className="h-3.5 w-3.5 text-slate-400" />
                    Identifiant Compte :
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                    {parentIdDisplay}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Date d'enregistrement :
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {targetParent.createdAt || targetParent.activationDate || "Année scolaire en cours"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                    Statut Portail Parent :
                  </span>
                  <span
                    className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                      isAccountActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {isAccountActive ? "Actif & Opérationnel" : "En attente d'activation"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: ENFANTS LIÉS (PARENT -> STUDENTS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 rounded-lg text-brand-blue dark:text-blue-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm">
                  Élèves & Enfants Liés à ce Compte Parent
                </h4>
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  {resolvedChildren.length}
                </span>
              </div>

              {onOpenRelationshipManager && (
                <button
                  type="button"
                  onClick={() => onOpenRelationshipManager(targetParent)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Lier un autre élève</span>
                </button>
              )}
            </div>

            {resolvedChildren.length === 0 ? (
              /* REQUIRED EXACT EMPTY STATE */
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    Aucun élève n’est actuellement lié à ce compte parent.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Vous pouvez rattacher un élève inscrit dans l'établissement à ce tuteur à tout moment via le gestionnaire de relations.
                  </p>
                </div>
                {onOpenRelationshipManager && (
                  <button
                    type="button"
                    onClick={() => onOpenRelationshipManager(targetParent)}
                    className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all inline-flex items-center gap-1.5 mt-2"
                  >
                    <Link2 className="h-4 w-4" />
                    <span>Lier un élève maintenant</span>
                  </button>
                )}
              </div>
            ) : (
              /* LIST OF LINKED STUDENTS */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resolvedChildren.map(child => (
                  <div
                    key={child.studentId}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-xs flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400 font-black shrink-0">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="font-black text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {child.studentName}
                          </h5>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="font-mono text-[10px] font-bold text-brand-blue bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                              {child.registrationNumber}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              {child.className}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Option : {child.optionName || "Tronc Commun"}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                        {child.relationship || "Enfant"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          child.status === "Validé" || child.status === "Actif"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {child.status || "Inscrit"}
                      </span>

                      {onOpenStudentFile && (
                        <button
                          type="button"
                          onClick={() => onOpenStudentFile(child.studentId)}
                          className="text-xs font-bold text-brand-blue dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors bg-blue-50/50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-900/60"
                          title="Accéder directement à la fiche de cet élève"
                        >
                          <span>Voir fiche élève</span>
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

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Fiche certifiée SmartSchool RDC · Identification biométrique & traçabilité</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer transition-all shadow-sm"
            >
              Fermer la fiche
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
