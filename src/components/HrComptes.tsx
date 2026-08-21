import React, { useState } from "react";
import { Employee, UserAccount } from "../types";
import { useSmartSchoolCore } from "../context/SmartSchoolCoreContext";
import { 
  Key, Eye, EyeOff, CheckCircle, ShieldAlert, Sparkles, UserPlus, 
  Trash2, ShieldCheck, Briefcase, Printer, RefreshCw, QrCode, Power, CheckCircle2,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";
import { OfficialLoginSheetModal } from "./OfficialLoginSheetModal";
import { 
  provisionUserAccountForPerson, 
  generateUniqueActivationCode,
  ROLE_PORTAL_MAPPING 
} from "../services/accountActivationService";

interface HrComptesProps {
  employees: Employee[];
  onCreateUserAccount: (empId: string, role: string) => void;
  onDeleteUserAccount: (empId: string) => void;
  onAddAuditLog: (action: string, targetName: string) => void;
  onUpdateUserAccount?: (empId: string, newRole: string, newPassword?: string) => void;
  onOpenPortal?: (account: UserAccount) => void;
  schoolName?: string;
  schoolLogo?: string;
  schoolMotto?: string;
}

export function HrComptes({
  employees,
  onCreateUserAccount,
  onDeleteUserAccount,
  onAddAuditLog,
  onUpdateUserAccount,
  onOpenPortal,
  schoolName = "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
  schoolLogo = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120",
  schoolMotto = "Science - Conscience - Excellence"
}: HrComptesProps) {
  const { customFunctions } = useSmartSchoolCore();

  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [accountRole, setAccountRole] = useState("Enseignant");
  
  // Sheet modal state
  const [selectedAccountForSheet, setSelectedAccountForSheet] = useState<UserAccount | null>(null);

  // Modal for Editing Account Role
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [editRole, setEditRole] = useState("");

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);
  const matchedCustomFunction = selectedEmployee 
    ? customFunctions.find(f => f.name.trim().toLowerCase() === selectedEmployee.function.trim().toLowerCase()) 
    : null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    onCreateUserAccount(selectedEmpId, accountRole);
    onAddAuditLog("Création de compte", `${emp.firstName} ${emp.lastName}`);
    
    // Create provisional user account object for immediate official sheet display
    const { userAccount } = provisionUserAccountForPerson(
      {
        dossierId: emp.id,
        dossierType: "personnel",
        fullName: `${emp.lastName} ${emp.firstName}`,
        identifierOrMatricule: emp.matricule,
        targetRole: accountRole,
        phone: emp.phone,
        email: emp.email,
        functionOrClass: emp.function,
        schoolName: schoolName
      },
      {
        operatorName: "Administration RH",
        operatorRole: "Administrateur RH"
      }
    );

    setSelectedAccountForSheet(userAccount);
    setSelectedEmpId("");
  };

  const handleDelete = (emp: Employee) => {
    if (confirm(`⚠️ Confirmez-vous la désactivation de l'accès de connexion pour ${emp.firstName} ${emp.lastName} ?`)) {
      onDeleteUserAccount(emp.id);
      onAddAuditLog("Désactivation de compte", `${emp.firstName} ${emp.lastName}`);
    }
  };

  const handleViewSheetForEmployee = (emp: Employee) => {
    const activationCode = emp.activationCode || generateUniqueActivationCode(emp.userAccountRole || emp.function || "STAFF");
    const mockAccount: UserAccount = {
      id: emp.userAccountId || `acc-${emp.id}`,
      dossierId: emp.id,
      dossierType: "personnel",
      fullName: `${emp.lastName} ${emp.firstName}`,
      username: emp.matricule,
      role: emp.userAccountRole || emp.function || "Enseignant",
      activationCode,
      phone: emp.phone,
      email: emp.email,
      isActive: true,
      isActivated: false,
      schoolName: schoolName,
      createdAt: emp.hireDate || new Date().toLocaleDateString("fr-FR")
    };

    setSelectedAccountForSheet(mockAccount);
  };

  const eligibleEmployees = employees.filter(e => !e.hasUserAccount);
  const activeAccounts = employees.filter(e => e.hasUserAccount);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    if (onUpdateUserAccount) {
      onUpdateUserAccount(editingEmp.id, editRole);
    }
    onAddAuditLog("Modification rôle compte", `${editingEmp.firstName} ${editingEmp.lastName} (Nouveau rôle: ${editRole})`);
    setEditingEmp(null);
  };

  return (
    <div className="space-y-6" id="comptes-view-root">
      
      {/* EDIT MODAL */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 text-left"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-500" />
                <span>Modifier Rôle d'Accès : {editingEmp.firstName} {editingEmp.lastName}</span>
              </h3>
              <button onClick={() => setEditingEmp(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Rôle Système & Portail</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  <option value="Directeur">Directeur (Portail Direction)</option>
                  <option value="Préfet des Études">Préfet des Études (Portail Pédagogique)</option>
                  <option value="Comptable">Comptable (Portail Finance & Caisse)</option>
                  <option value="Caissier">Caissier (Portail Caisse)</option>
                  <option value="Secrétaire">Secrétaire (Portail Inscriptions)</option>
                  <option value="Enseignant">Enseignant (Portail Enseignant)</option>
                  <option value="Responsable informatique">Responsable informatique</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Create Account Form */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
        >
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              <span>Créer un Accès Personnel RH</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Génération automatique de l'identifiant et du code d'activation unique (sans mot de passe temporaire).
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Sélectionner l'agent</label>
              <select
                required
                value={selectedEmpId}
                onChange={e => {
                  const id = e.target.value;
                  setSelectedEmpId(id);
                  const emp = employees.find(x => x.id === id);
                  if (emp) {
                    const matchedFn = customFunctions.find(f => f.name.trim().toLowerCase() === emp.function.trim().toLowerCase());
                    if (matchedFn) {
                      if (matchedFn.category === "Comptabilité") setAccountRole("Comptable");
                      else if (matchedFn.category === "Enseignement") setAccountRole("Enseignant");
                      else if (matchedFn.category === "Administration") setAccountRole("Directeur");
                      else if (matchedFn.category === "Technique") setAccountRole("Responsable informatique");
                      else setAccountRole("Secrétaire");
                    }
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
              >
                <option value="">-- Choisir un agent éligible ({eligibleEmployees.length}) --</option>
                {eligibleEmployees.map(e => (
                  <option key={e.id} value={e.id}>{e.lastName} {e.firstName} ({e.function}) - Matricule: {e.matricule}</option>
                ))}
              </select>
            </div>

            {/* Display matched custom function badge */}
            {selectedEmployee && (
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900 rounded-2xl space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> Poste : {selectedEmployee.function}
                  </span>
                  {matchedCustomFunction && (
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: matchedCustomFunction.color || "#4f46e5" }}>
                      {matchedCustomFunction.code}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  Matricule : <strong className="font-mono">{selectedEmployee.matricule}</strong> • Service : <strong>{selectedEmployee.service || matchedCustomFunction?.serviceName || "Général"}</strong>
                </p>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Rôle système & portail assigné</label>
              <select
                required
                value={accountRole}
                onChange={e => setAccountRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold text-indigo-600 dark:text-indigo-400"
              >
                <option value="Enseignant">Enseignant (Portail Enseignant)</option>
                <option value="Comptable">Comptable (Portail Finance & Caisse)</option>
                <option value="Secrétaire">Secrétaire (Portail Inscriptions & Documents)</option>
                <option value="Directeur">Directeur (Portail Direction)</option>
                <option value="Préfet des Études">Préfet des Études (Portail Pédagogique)</option>
                <option value="Responsable informatique">Responsable informatique</option>
              </select>
            </div>

            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-[11px] text-emerald-900 dark:text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Zero-Trust SmartSchool RDC :</span>
              </div>
              <p className="text-[10px] opacity-90 leading-relaxed">
                Le système génère un <strong>Code d'Activation unique</strong>. L'agent créera lui-même son mot de passe et répondra à 3 questions de sécurité lors de sa 1ère connexion.
              </p>
            </div>

            <button
              type="submit"
              disabled={!selectedEmpId}
              className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedEmpId
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Créer le compte & Imprimer Fiche</span>
            </button>
          </form>
        </motion.div>

        {/* Right Column: Active User Accounts List */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-blue" />
                <span>Comptes Agents Actifs ({activeAccounts.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500">Gestion des codes d'accès et réimpression des fiches officielles.</p>
            </div>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 px-2.5 py-1 rounded-full">
              {activeAccounts.length} / {employees.length} agents connectés
            </span>
          </div>

          {activeAccounts.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <Key className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-500">Aucun compte utilisateur créé pour le personnel.</p>
              <p className="text-[10px] text-slate-400">Utilisez le formulaire pour activer le compte d'un agent.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[480px] overflow-y-auto">
              {activeAccounts.map(emp => (
                <div key={emp.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors rounded-xl px-2">
                  <div className="flex items-center space-x-3">
                    <img src={emp.photoUrl} className="h-10 w-10 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {emp.lastName} {emp.firstName}
                        </span>
                        <span className="text-[9px] font-bold bg-blue-50 dark:bg-blue-950 text-brand-blue dark:text-blue-300 px-1.5 py-0.5 rounded">
                          {emp.userAccountRole || emp.function}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-3 mt-0.5">
                        <span>Matricule : <strong className="font-mono text-slate-700 dark:text-slate-300">{emp.matricule}</strong></span>
                        <span>Code : <strong className="font-mono text-emerald-600">{emp.activationCode || "ACT-RH-ACTIF"}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Open Portal Direct Button */}
                    {onOpenPortal && (
                      <button
                        onClick={() => {
                          const userAcc: UserAccount = {
                            id: `acc-emp-${emp.id}`,
                            dossierId: emp.id,
                            dossierType: "personnel",
                            fullName: `${emp.lastName} ${emp.firstName}`,
                            username: emp.matricule,
                            role: emp.userAccountRole || emp.function || "Enseignant",
                            activationCode: emp.activationCode || "ACT-RH-ACTIF",
                            phone: emp.phone,
                            email: emp.email,
                            isActive: true,
                            isActivated: true,
                            schoolName: schoolName,
                            createdAt: emp.hireDate || new Date().toLocaleDateString("fr-FR")
                          };
                          onOpenPortal(userAcc);
                        }}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        title={`Ouvrir directement le portail ${emp.userAccountRole || emp.function}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Portail</span>
                      </button>
                    )}

                    {/* View Official Sheet */}
                    <button
                      onClick={() => handleViewSheetForEmployee(emp)}
                      className="px-2.5 py-1.5 bg-brand-blue hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="Imprimer ou Partager la Fiche Officielle"
                    >
                      <Printer className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Fiche</span>
                    </button>

                    {/* Edit Role */}
                    <button
                      onClick={() => {
                        setEditingEmp(emp);
                        setEditRole(emp.userAccountRole || emp.function || "Enseignant");
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors cursor-pointer"
                      title="Changer le rôle"
                    >
                      <Key className="h-4 w-4" />
                    </button>

                    {/* Delete Account */}
                    <button
                      onClick={() => handleDelete(emp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors cursor-pointer"
                      title="Désactiver l'accès"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>

      {/* OFFICIAL LOGIN SHEET MODAL */}
      {selectedAccountForSheet && (
        <OfficialLoginSheetModal
          account={selectedAccountForSheet}
          schoolName={schoolName}
          schoolLogoUrl={schoolLogo}
          schoolMotto={schoolMotto}
          creatorName="Administration RH"
          creatorRole="Gestionnaire RH"
          onOpenPortal={onOpenPortal}
          onClose={() => setSelectedAccountForSheet(null)}
        />
      )}

    </div>
  );
}
