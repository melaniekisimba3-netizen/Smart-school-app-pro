import React, { useState } from "react";
import { 
  ArrowRight, Shield, AlertTriangle, CheckCircle2, UserCheck, 
  RotateCcw, Lock, X, RefreshCw, FileText, Send, UserX, Briefcase
} from "lucide-react";
import { motion } from "motion/react";
import { 
  PlatformStaffMember, 
  ResponsibilityTransferRecord, 
  InternalPortalConfig 
} from "../../types";
import { SYSTEM_RESPONSIBILITIES_CATALOG } from "../../utils/platformStaffDefaults";

interface StaffTransferResponsibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceStaff: PlatformStaffMember | null;
  allStaff: PlatformStaffMember[];
  portals: InternalPortalConfig[];
  currentOwnerName: string;
  onConfirmTransfer: (record: ResponsibilityTransferRecord, updatedSource: PlatformStaffMember, updatedTarget: PlatformStaffMember) => void;
}

export function StaffTransferResponsibilityModal({
  isOpen,
  onClose,
  sourceStaff,
  allStaff,
  portals,
  currentOwnerName,
  onConfirmTransfer
}: StaffTransferResponsibilityModalProps) {
  if (!isOpen || !sourceStaff) return null;

  // Potential targets: all staff except the source itself
  const eligibleTargets = allStaff.filter(s => s.id !== sourceStaff.id && s.status !== "Archivé");

  // Transfer Form State
  const [selectedTargetId, setSelectedTargetId] = useState<string>(eligibleTargets[0]?.id || "");
  const [transferReason, setTransferReason] = useState<string>("Réorganisation interne & passation de service");
  const [customReason, setCustomReason] = useState<string>("");
  const [deactivateSource, setDeactivateSource] = useState<boolean>(true);
  const [transferPortal, setTransferPortal] = useState<boolean>(true);
  const [handoverNotes, setHandoverNotes] = useState<string>("");

  // Responsibilities to transfer: default to source staff's current responsibilities or catalog defaults for their function
  const sourceResponsibilities = sourceStaff.responsibilities && sourceStaff.responsibilities.length > 0
    ? sourceStaff.responsibilities
    : (SYSTEM_RESPONSIBILITIES_CATALOG[sourceStaff.fonction] || ["Gestion et suivi opérationnel"]);

  const [selectedResponsibilities, setSelectedResponsibilities] = useState<string[]>(sourceResponsibilities);

  const toggleResponsibility = (resp: string) => {
    if (selectedResponsibilities.includes(resp)) {
      setSelectedResponsibilities(selectedResponsibilities.filter(r => r !== resp));
    } else {
      setSelectedResponsibilities([...selectedResponsibilities, resp]);
    }
  };

  const handleSelectAllResp = () => {
    setSelectedResponsibilities([...sourceResponsibilities]);
  };

  const handleDeselectAllResp = () => {
    setSelectedResponsibilities([]);
  };

  const targetStaff = allStaff.find(s => s.id === selectedTargetId);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStaff) {
      alert("Veuillez sélectionner un collaborateur successeur valide.");
      return;
    }

    if (selectedResponsibilities.length === 0) {
      if (!confirm("Aucune responsabilité spécifique n'est sélectionnée. Voulez-vous continuer la passation ?")) {
        return;
      }
    }

    const effectiveReason = transferReason === "Autre" && customReason.trim() ? customReason.trim() : transferReason;
    const nowIso = new Date().toISOString().replace("T", " ").slice(0, 16);
    const transferId = `transf-${Date.now().toString().slice(-6)}`;

    // Build transfer record
    const transferRecord: ResponsibilityTransferRecord = {
      id: transferId,
      sourceStaffId: sourceStaff.id,
      sourceStaffName: sourceStaff.fullName,
      sourceStaffEmail: sourceStaff.email,
      sourceStaffFonction: sourceStaff.fonction,
      targetStaffId: targetStaff.id,
      targetStaffName: targetStaff.fullName,
      targetStaffEmail: targetStaff.email,
      targetStaffFonction: targetStaff.fonction,
      transferredResponsibilities: selectedResponsibilities,
      transferredPermissions: Object.keys(sourceStaff.assignedPermissions).filter(k => (sourceStaff.assignedPermissions as any)[k]),
      transferredPortalId: transferPortal ? sourceStaff.assignedPortalId : targetStaff.assignedPortalId,
      transferredPortalName: transferPortal ? sourceStaff.assignedPortalName : targetStaff.assignedPortalName,
      reason: effectiveReason,
      deactivateSourceAccount: deactivateSource,
      transferredAt: nowIso,
      transferredBy: currentOwnerName,
      notes: handoverNotes
    };

    // Calculate updated source
    const remainingResponsibilities = (sourceStaff.responsibilities || []).filter(
      r => !selectedResponsibilities.includes(r)
    );

    const updatedSource: PlatformStaffMember = {
      ...sourceStaff,
      status: deactivateSource ? "Transféré" : sourceStaff.status,
      successorStaffId: targetStaff.id,
      responsibilities: remainingResponsibilities,
      transferHistory: [transferRecord, ...(sourceStaff.transferHistory || [])],
      notes: `${sourceStaff.notes ? sourceStaff.notes + "\n" : ""}[${nowIso}] Responsabilités transférées à ${targetStaff.fullName} (Motif: ${effectiveReason}).`
    };

    // Calculate updated target (merge responsibilities and permissions)
    const mergedResponsibilities = Array.from(new Set([
      ...(targetStaff.responsibilities || []),
      ...selectedResponsibilities
    ]));

    // Combine permissions: source permissions merged into target permissions
    const mergedPermissions = {
      ...targetStaff.assignedPermissions,
      ...(transferPortal ? sourceStaff.assignedPermissions : {})
    };

    const updatedTarget: PlatformStaffMember = {
      ...targetStaff,
      responsibilities: mergedResponsibilities,
      assignedPermissions: mergedPermissions,
      assignedPortalId: transferPortal ? (sourceStaff.assignedPortalId || targetStaff.assignedPortalId) : targetStaff.assignedPortalId,
      assignedPortalName: transferPortal ? (sourceStaff.assignedPortalName || targetStaff.assignedPortalName) : targetStaff.assignedPortalName,
      previousStaffId: sourceStaff.id,
      transferHistory: [transferRecord, ...(targetStaff.transferHistory || [])],
      notes: `${targetStaff.notes ? targetStaff.notes + "\n" : ""}[${nowIso}] A hérité des responsabilités de ${sourceStaff.fullName} (Par: ${currentOwnerName}).`
    };

    onConfirmTransfer(transferRecord, updatedSource, updatedTarget);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <RotateCcw className="h-6 w-6 text-amber-200 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                Passation & Transfert de Responsabilités
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                Délégation officielle, réallocation des portails et traçabilité IAM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Transfer Visualizer Diagram */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            {/* Source Card */}
            <div className="md:col-span-5 p-3.5 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/60 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 mb-1">
                <span>Collaborateur Cédant (Source)</span>
                <span className="bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-300">
                  {sourceStaff.status}
                </span>
              </div>
              <div className="font-black text-sm text-slate-900 dark:text-white truncate">
                {sourceStaff.fullName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {sourceStaff.fonction} • <span className="font-mono text-[11px]">{sourceStaff.email}</span>
              </div>
              <div className="mt-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900 truncate">
                🌐 Portail : {sourceStaff.assignedPortalName || "Portail Standard"}
              </div>
            </div>

            {/* Arrow & Transfer Icon */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Target Selection Card */}
            <div className="md:col-span-5 p-3.5 bg-white dark:bg-slate-900 border-2 border-indigo-400 dark:border-indigo-600 rounded-xl shadow-xs">
              <div className="text-[10px] font-extrabold uppercase text-indigo-700 dark:text-indigo-400 mb-1">
                Collaborateur Successeur (Bénéficiaire)
              </div>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                {eligibleTargets.map(target => (
                  <option key={target.id} value={target.id}>
                    {target.fullName} ({target.fonction} - {target.status})
                  </option>
                ))}
              </select>
              {targetStaff && (
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Email : <span className="font-mono text-slate-700 dark:text-slate-300">{targetStaff.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transfer Form Body */}
        <form onSubmit={handleExecuteTransfer} className="p-5 space-y-5">
          {/* Responsibilities Selection Matrix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-amber-600" />
                Responsabilités à transférer ({selectedResponsibilities.length} sélectionnées) :
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllResp}
                  className="text-amber-700 hover:text-amber-800 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Tout cocher
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleDeselectAllResp}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold hover:underline cursor-pointer"
                >
                  Tout décocher
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
              {sourceResponsibilities.map((resp, idx) => {
                const isChecked = selectedResponsibilities.includes(resp);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      isChecked 
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleResponsibility(resp)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                    />
                    <span className="leading-tight">{resp}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Transfer Reason & Governance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Motif Officiel de la Passation :
              </label>
              <select
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Réorganisation interne & passation de service">Réorganisation interne & passation de service</option>
                <option value="Mutation / Changement d'affectation">Mutation / Changement d'affectation</option>
                <option value="Fin de contrat / Départ de l'agent">Fin de contrat / Départ de l'agent</option>
                <option value="Congé prolongé / Intérim temporaire">Congé prolongé / Intérim temporaire</option>
                <option value="Promotion vers un autre poste">Promotion vers un autre poste</option>
                <option value="Autre">Autre motif personnalisé</option>
              </select>
              {transferReason === "Autre" && (
                <input
                  type="text"
                  placeholder="Préciser le motif..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Notes de Passation & Consignes Spécifiques :
              </label>
              <textarea
                rows={3}
                placeholder="Détails sur les dossiers en cours, codes d'accès physiques, dossiers prioritaires..."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white resize-none outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Security Toggles */}
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2.5">
            <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-amber-700" />
              Politique de Sécurité IAM & Coupe-Circuits :
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deactivateSource}
                  onChange={(e) => setDeactivateSource(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                />
                <span>Marquer le compte cédant comme <strong>« Transféré »</strong> (Désactivation immédiate)</span>
              </label>

              <label className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transferPortal}
                  onChange={(e) => setTransferPortal(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                />
                <span>Transférer également l'attribution du <strong>Portail Dédié</strong> au successeur</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              id="confirm-transfer-btn"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Valider le Transfert & Enregistrer l'Acte</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
