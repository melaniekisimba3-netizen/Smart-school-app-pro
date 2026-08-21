import React, { useState } from "react";
import { 
  Layers, Plus, Edit2, Trash2, CheckCircle2, Shield, 
  ExternalLink, Users, Sparkles, Layout, Palette, ArrowRight 
} from "lucide-react";
import { InternalPortalConfig, PlatformStaffMember, PlatformStaffPermissions } from "../../types";
import { OWNER_FULL_PERMISSIONS } from "../../utils/platformStaffDefaults";

interface InternalPortalsManagerTabProps {
  portals: InternalPortalConfig[];
  staffList: PlatformStaffMember[];
  currentOwnerName: string;
  onSavePortal: (portal: InternalPortalConfig) => void;
  onDeletePortal: (portalId: string) => void;
  onOpenPortalPreview?: (portal: InternalPortalConfig) => void;
}

export function InternalPortalsManagerTab({
  portals,
  staffList,
  currentOwnerName,
  onSavePortal,
  onDeletePortal,
  onOpenPortalPreview
}: InternalPortalsManagerTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingPortal, setEditingPortal] = useState<InternalPortalConfig | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAccentColor, setFormAccentColor] = useState("emerald");
  const [formDefaultRole, setFormDefaultRole] = useState("Personnel Interne");
  const [formAllowedTabs, setFormAllowedTabs] = useState<string[]>([
    "dashboard", "schools", "support", "analytics"
  ]);

  const availableAppTabs = [
    { id: "dashboard", label: "Tableau de bord principal" },
    { id: "schools", label: "Gestion des Établissements & Réseau" },
    { id: "finances", label: "Finances & Commissions Mobile Money" },
    { id: "support", label: "Support Écoles, Tickets & Dépannage" },
    { id: "missing_photos", label: "Audit & Relances Photos Manquantes" },
    { id: "communications", label: "Diffusion & Communications Nationales" },
    { id: "analytics", label: "Cartographie & Statistiques Nationales" },
    { id: "server_monitor", label: "Monitoring Serveurs & Infrastructure" },
    { id: "security_alerts", label: "Sécurité IAM & Intrusions" },
    { id: "commercial_leads", label: "Prospection & Déploiements Écoles" }
  ];

  const handleOpenCreate = () => {
    setEditingPortal(null);
    setFormName("");
    setFormCode(`PORTAL_CUSTOM_${Math.floor(100 + Math.random() * 900)}`);
    setFormDescription("");
    setFormAccentColor("indigo");
    setFormDefaultRole("Personnel Interne");
    setFormAllowedTabs(["dashboard", "schools", "support"]);
    setShowModal(true);
  };

  const handleOpenEdit = (portal: InternalPortalConfig) => {
    setEditingPortal(portal);
    setFormName(portal.name);
    setFormCode(portal.code);
    setFormDescription(portal.description);
    setFormAccentColor(portal.accentColor || "blue");
    setFormDefaultRole(portal.defaultRole || "Personnel Interne");
    setFormAllowedTabs(portal.allowedTabs || ["dashboard"]);
    setShowModal(true);
  };

  const toggleTab = (tabId: string) => {
    if (formAllowedTabs.includes(tabId)) {
      setFormAllowedTabs(formAllowedTabs.filter(t => t !== tabId));
    } else {
      setFormAllowedTabs([...formAllowedTabs, tabId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Veuillez renseigner le nom du portail.");
      return;
    }

    const portalToSave: InternalPortalConfig = {
      id: editingPortal ? editingPortal.id : `portal-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      description: formDescription.trim(),
      iconName: "Layout",
      accentColor: formAccentColor,
      allowedTabs: formAllowedTabs,
      defaultRole: formDefaultRole,
      defaultPermissions: editingPortal ? editingPortal.defaultPermissions : ({} as PlatformStaffPermissions),
      isSystemDefault: editingPortal ? editingPortal.isSystemDefault : false,
      createdAt: editingPortal ? editingPortal.createdAt : new Date().toISOString().replace("T", " ").slice(0, 16),
      createdBy: currentOwnerName
    };

    onSavePortal(portalToSave);
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Catalogue des Portails Dédiés ({portals.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Espaces de travail cloisonnés et profils d'accès attribuables au personnel interne
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Créer un Nouveau Portail</span>
        </button>
      </div>

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portals.map((portal) => {
          const assignedStaff = staffList.filter(s => s.assignedPortalId === portal.id || s.assignedPortalName === portal.name);

          return (
            <div
              key={portal.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono tracking-wider border ${
                    portal.accentColor === "emerald" 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                      : portal.accentColor === "amber"
                      ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                      : portal.accentColor === "rose"
                      ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300"
                  }`}>
                    {portal.code}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(portal)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                      title="Modifier le portail"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {!portal.isSystemDefault && (
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer définitivement le portail "${portal.name}" ?`)) {
                            onDeletePortal(portal.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {portal.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                {/* Allowed Modules count */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-bold">Modules autorisés :</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{portal.allowedTabs.length} onglets</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {portal.allowedTabs.slice(0, 3).map((tab, i) => (
                      <span key={i} className="text-[9px] font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {tab}
                      </span>
                    ))}
                    {portal.allowedTabs.length > 3 && (
                      <span className="text-[9px] font-bold text-slate-400">
                        +{portal.allowedTabs.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer: Assigned Staff */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>{assignedStaff.length} agent(s) assigné(s)</span>
                </div>

                {assignedStaff.length > 0 && (
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    {assignedStaff[0].fullName.split(" ")[0]} {assignedStaff.length > 1 ? `+${assignedStaff.length - 1}` : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Portal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
                {editingPortal ? "Modifier le Portail" : "Créer un Nouveau Portail Dédié"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nom Officiel du Portail :</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Portail Déploiement & Écoles"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Code Système Unique :</label>
                  <input
                    type="text"
                    required
                    placeholder="PORTAL_CODE"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full p-2 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description & Mission du Portail :</label>
                <textarea
                  rows={2}
                  placeholder="Décrivez les prérogatives de cet espace..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Allowed Modules Multi-selection */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block uppercase text-[10px]">
                  Modules & Onglets Accessibles dans ce Portail ({formAllowedTabs.length}) :
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  {availableAppTabs.map(tab => (
                    <label key={tab.id} className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAllowedTabs.includes(tab.id)}
                        onChange={() => toggleTab(tab.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tab.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Enregistrer le Portail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
