import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Users, Shield, Sliders, Briefcase, Layers, UserCheck, 
  Sparkles, CheckCircle2, Lock, Eye, EyeOff, Globe 
} from "lucide-react";
import { motion } from "motion/react";
import { PhotoUploadField } from "../common/PhotoUploadField";
import { 
  PlatformStaffMember, 
  PlatformStaffFunction, 
  PlatformStaffPermissions, 
  InternalPortalConfig 
} from "../../types";
import { 
  DEFAULT_PERMISSIONS_BY_FUNCTION, 
  SYSTEM_RESPONSIBILITIES_CATALOG 
} from "../../utils/platformStaffDefaults";
import { PERMISSION_LABELS } from "./OwnerStaffManagementModule";

interface StaffAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStaff: PlatformStaffMember | null;
  portals: InternalPortalConfig[];
  availableFunctions: PlatformStaffFunction[];
  onSave: (staffData: Partial<PlatformStaffMember>, rawPassword?: string) => void;
}

export function StaffAddEditModal({
  isOpen,
  onClose,
  editingStaff,
  portals,
  availableFunctions,
  onSave
}: StaffAddEditModalProps) {
  if (!isOpen) return null;

  const [formNom, setFormNom] = useState(editingStaff?.nom || "");
  const [formPostnom, setFormPostnom] = useState(editingStaff?.postnom || "");
  const [formPrenom, setFormPrenom] = useState(editingStaff?.prenom || "");
  const [formPhone, setFormPhone] = useState(editingStaff?.phone || "+243 ");
  const [formEmail, setFormEmail] = useState(editingStaff?.email || "");
  const [formPhotoUrl, setFormPhotoUrl] = useState(editingStaff?.photoUrl || "");
  const [formFonction, setFormFonction] = useState<PlatformStaffFunction>(
    (editingStaff?.fonction as PlatformStaffFunction) || "Support utilisateurs"
  );
  const [formCustomFonction, setFormCustomFonction] = useState(editingStaff?.customFonctionTitle || "");
  const [formRole, setFormRole] = useState<"Personnel Interne" | "Super Administrateur" | "Propriétaire">(
    editingStaff?.role || "Personnel Interne"
  );
  const [formStatus, setFormStatus] = useState<"Actif" | "Inactif" | "Suspendu">(
    editingStaff?.status === "Suspendu" || editingStaff?.status === "Inactif" ? editingStaff.status : "Actif"
  );
  const [formPortalId, setFormPortalId] = useState<string>(
    editingStaff?.assignedPortalId || portals[0]?.id || ""
  );
  const [formPassword, setFormPassword] = useState(
    editingStaff ? "" : `SS-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [formNotes, setFormNotes] = useState(editingStaff?.notes || "");
  
  const [formPermissions, setFormPermissions] = useState<PlatformStaffPermissions>(
    editingStaff?.assignedPermissions || DEFAULT_PERMISSIONS_BY_FUNCTION["Support utilisateurs"]
  );

  // Responsibilities
  const defaultRespForFunc = SYSTEM_RESPONSIBILITIES_CATALOG[formFonction] || ["Gestion et suivi opérationnel"];
  const [formResponsibilities, setFormResponsibilities] = useState<string[]>(
    editingStaff?.responsibilities && editingStaff.responsibilities.length > 0
      ? editingStaff.responsibilities
      : defaultRespForFunc
  );
  const [newCustomResp, setNewCustomResp] = useState("");

  const handleFonctionChange = (func: PlatformStaffFunction) => {
    setFormFonction(func);
    if (!editingStaff) {
      if (DEFAULT_PERMISSIONS_BY_FUNCTION[func]) {
        setFormPermissions(DEFAULT_PERMISSIONS_BY_FUNCTION[func]);
      }
      if (SYSTEM_RESPONSIBILITIES_CATALOG[func]) {
        setFormResponsibilities(SYSTEM_RESPONSIBILITIES_CATALOG[func]);
      }
      // Match portal
      const matchedPortal = portals.find(p => p.name.toLowerCase().includes(func.toLowerCase().slice(0, 5)));
      if (matchedPortal) {
        setFormPortalId(matchedPortal.id);
      }
    }
  };

  const togglePermission = (key: keyof PlatformStaffPermissions) => {
    setFormPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleResp = (resp: string) => {
    if (formResponsibilities.includes(resp)) {
      setFormResponsibilities(formResponsibilities.filter(r => r !== resp));
    } else {
      setFormResponsibilities([...formResponsibilities, resp]);
    }
  };

  const addCustomResp = () => {
    if (newCustomResp.trim() && !formResponsibilities.includes(newCustomResp.trim())) {
      setFormResponsibilities([...formResponsibilities, newCustomResp.trim()]);
      setNewCustomResp("");
    }
  };

  // Group permissions
  const permissionCategories = useMemo(() => {
    const groups: Record<string, (keyof PlatformStaffPermissions)[]> = {};
    (Object.keys(PERMISSION_LABELS) as (keyof PlatformStaffPermissions)[]).forEach(k => {
      const cat = PERMISSION_LABELS[k].category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(k);
    });
    return groups;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${formNom.toUpperCase()} ${formPostnom.toUpperCase()} ${formPrenom}`.trim();
    if (!fullName || !formEmail.trim()) {
      alert("Veuillez renseigner le nom complet et l'adresse e-mail.");
      return;
    }

    const selectedPortal = portals.find(p => p.id === formPortalId);

    const staffData: Partial<PlatformStaffMember> = {
      nom: formNom.toUpperCase(),
      postnom: formPostnom.toUpperCase(),
      prenom: formPrenom,
      fullName,
      phone: formPhone,
      email: formEmail.trim().toLowerCase(),
      photoUrl: formPhotoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      fonction: formFonction === "Autre" && formCustomFonction ? formCustomFonction : formFonction,
      customFonctionTitle: formCustomFonction,
      role: formRole,
      status: formStatus,
      assignedPortalId: formPortalId,
      assignedPortalName: selectedPortal?.name || `Portail ${formFonction}`,
      responsibilities: formResponsibilities,
      assignedPermissions: formPermissions,
      notes: formNotes
    };

    onSave(staffData, formPassword);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left"
      >
        {/* HEADER */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/10 text-indigo-600 rounded-2xl">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {editingStaff ? `Modifier le Profil & Habilitations : ${editingStaff.fullName}` : "Créer un Collaborateur du Personnel Interne"}
              </h3>
              <p className="text-xs text-slate-500">
                Attribuez l'identité, le portail dédié, les responsabilités et les permissions réelles.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] text-xs">
          {/* 1. IDENTITY */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <span>1. Identité & Coordonnées Officielles</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Nom *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: MUKENDI"
                  value={formNom}
                  onChange={e => setFormNom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Postnom *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: TSHIMANGA"
                  value={formPostnom}
                  onChange={e => setFormPostnom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Prénom *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Alain"
                  value={formPrenom}
                  onChange={e => setFormPrenom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Adresse E-mail Officielle (Identifiant) *</label>
                <input
                  required
                  type="email"
                  placeholder="alain.mukendi@smartschool.cd"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Numéro de Téléphone (WhatsApp/SMS)</label>
                <input
                  type="text"
                  placeholder="+243 812 345 678"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold font-mono"
                />
              </div>
            </div>

            <PhotoUploadField
              label="Photo Officielle du Collaborateur"
              value={formPhotoUrl}
              onChange={(photo) => setFormPhotoUrl(photo)}
              helperText="Téléversez le portrait officiel depuis votre téléphone ou ordinateur (JPG, PNG)"
              previewSize="md"
              id="staff-photo-upload"
            />
          </div>

          {/* 2. FUNCTION, PORTAL & ROLE */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span>2. Fonction, Portail Dédié & Rôle Hiérarchique</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Fonction / Poste Occupé *</label>
                <select
                  value={formFonction}
                  onChange={e => handleFonctionChange(e.target.value as PlatformStaffFunction)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-indigo-600 dark:text-indigo-400"
                >
                  {availableFunctions.map(fn => (
                    <option key={fn} value={fn}>{fn}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Portail Dédié Attribué *</label>
                <select
                  value={formPortalId}
                  onChange={e => setFormPortalId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
                >
                  {portals.map(portal => (
                    <option key={portal.id} value={portal.id}>
                      {portal.name} ({portal.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Rôle Hiérarchique IAM</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  <option value="Personnel Interne">Personnel Interne</option>
                  <option value="Super Administrateur">Super Administrateur</option>
                  <option value="Propriétaire">Propriétaire</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Statut du Compte</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                  <option value="Suspendu">Suspendu</option>
                </select>
              </div>
            </div>

            {!editingStaff && (
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 block">Code d'Activation Initial / Mot de Passe</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-indigo-600"
                />
                <p className="text-[10px] text-slate-400">Ce code unique figurera sur la fiche officielle d'accès transmise au collaborateur.</p>
              </div>
            )}
          </div>

          {/* 3. ASSIGNED RESPONSIBILITIES */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Briefcase className="h-4 w-4 text-emerald-500" />
              <span>3. Responsabilités Opérationnelles Attribuées ({formResponsibilities.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              {(SYSTEM_RESPONSIBILITIES_CATALOG[formFonction] || []).map((resp, i) => {
                const isChecked = formResponsibilities.includes(resp);
                return (
                  <label key={i} className="flex items-start gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleResp(resp)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{resp}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom Responsibilities Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ajouter une responsabilité spécifique sur mesure..."
                value={newCustomResp}
                onChange={e => setNewCustomResp(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomResp(); } }}
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={addCustomResp}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* 4. GRANULAR PERMISSIONS MATRIX */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-500" />
                <span>4. Habilitations RBAC Granulaires</span>
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allTrue = Object.keys(PERMISSION_LABELS).reduce((acc, k) => {
                      acc[k as keyof PlatformStaffPermissions] = true;
                      return acc;
                    }, {} as PlatformStaffPermissions);
                    setFormPermissions(allTrue);
                  }}
                  className="text-[10px] font-black text-indigo-600 hover:underline cursor-pointer"
                >
                  Tout cocher
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    if (DEFAULT_PERMISSIONS_BY_FUNCTION[formFonction]) {
                      setFormPermissions(DEFAULT_PERMISSIONS_BY_FUNCTION[formFonction]);
                    }
                  }}
                  className="text-[10px] font-black text-slate-500 hover:underline cursor-pointer"
                >
                  Préréglage poste
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(permissionCategories).map(([category, keys]) => (
                <div key={category} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                    {category}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {keys.map(key => {
                      const isChecked = Boolean(formPermissions[key]);
                      const meta = PERMISSION_LABELS[key];

                      return (
                        <label
                          key={key}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            isChecked
                              ? "bg-white dark:bg-slate-900 border-indigo-500/50 shadow-xs"
                              : "bg-slate-100/50 dark:bg-slate-900/40 border-transparent text-slate-400"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(key)}
                            className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <div className={`font-bold text-[11px] ${isChecked ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                              {meta.label}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              {meta.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md cursor-pointer"
            >
              {editingStaff ? "Enregistrer les Modifications" : "Créer le Membre & Générer la Fiche"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
