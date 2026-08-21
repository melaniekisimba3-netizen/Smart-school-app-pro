import React, { useState } from "react";
import { 
  Shield, Users, Camera, DollarSign, Server, Key, FileText, 
  HelpCircle, MessageSquare, Building2, TrendingUp, Lock, CheckCircle2, 
  AlertTriangle, ArrowLeft, ExternalLink, Sliders, RefreshCw
} from "lucide-react";
import { PlatformStaffMember, PlatformStaffPermissions, School, Student, Employee, Teacher, UserAccount } from "../../types";
import { DEFAULT_PERMISSIONS_BY_FUNCTION } from "../../utils/platformStaffDefaults";
import { MissingPhotosAuditDashboard } from "./MissingPhotosAuditDashboard";
import { PERMISSION_LABELS } from "./OwnerStaffManagementModule";

interface PlatformStaffPortalViewProps {
  staffMember: PlatformStaffMember;
  schools: School[];
  students: Student[];
  employees: Employee[];
  teachers?: (Teacher | any)[];
  userAccounts?: UserAccount[];
  onBackToOwner?: () => void;
  onAuditLog?: (action: string, details: string) => void;
}

export function PlatformStaffPortalView({
  staffMember,
  schools,
  students,
  employees,
  teachers = [],
  userAccounts = [],
  onBackToOwner,
  onAuditLog
}: PlatformStaffPortalViewProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const permissions: PlatformStaffPermissions = staffMember.assignedPermissions || DEFAULT_PERMISSIONS_BY_FUNCTION[staffMember.fonction] || ({} as PlatformStaffPermissions);

  const grantedCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* PORTAL TOP BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBackToOwner && (
            <button
              onClick={onBackToOwner}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl cursor-pointer transition-colors"
              title="Retour à l'espace Propriétaire"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <img
            src={staffMember.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
            alt={staffMember.fullName}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md shrink-0"
          />

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase rounded-full tracking-wider">
                Portail Dédié : {staffMember.fonction}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Compte {staffMember.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              {staffMember.fullName}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {staffMember.email} • ID: {staffMember.id} • {grantedCount} permissions actives
            </p>
          </div>
        </div>

        {/* SECTION SWITCHER TABS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSection("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === "overview"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Vue d&apos;Ensemble
          </button>

          {permissions.canViewMissingPhotosAlerts && (
            <button
              onClick={() => setActiveSection("missing_photos")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === "missing_photos"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Photos Manquantes</span>
            </button>
          )}

          <button
            onClick={() => setActiveSection("permissions_audit")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === "permissions_audit"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Mes Habilitations</span>
          </button>
        </div>
      </div>

      {/* SECTION CONTENT: OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* FUNCTION SPECIFIC SUMMARY TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
                <span>Rôle Attribué</span>
                <Shield className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white">{staffMember.role}</p>
              <p className="text-[11px] text-slate-500">Poste : {staffMember.fonction}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
                <span>Établissements Clients</span>
                <Building2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white">{schools.length} Écoles</p>
              <p className="text-[11px] text-slate-500">Sous surveillance opérationnelle</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
                <span>Profils Scannés</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white">{students.length + employees.length}</p>
              <p className="text-[11px] text-slate-500">Élèves, profs et administratifs</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase">
                <span>Statut Sécurité</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">RBAC Actif</p>
              <p className="text-[11px] text-slate-500">Contrôle strict des accès</p>
            </div>
          </div>

          {/* ACTIVE WORKSPACES / MODULES GATED BY PERMISSIONS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-500" />
              <span>Outils & Modules Autorisés pour votre Fonction</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1: Missing Photos */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                permissions.canViewMissingPhotosAlerts 
                  ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
                  : "bg-slate-100/60 dark:bg-slate-900/40 border-transparent opacity-60"
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Camera className="h-5 w-5 text-amber-500" />
                    {permissions.canViewMissingPhotosAlerts ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase rounded">Autorisé</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded">Verrouillé</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Détection Photos Manquantes</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Surveillance automatique des profils scolaires sans photo et relance des directeurs.
                  </p>
                </div>

                {permissions.canViewMissingPhotosAlerts && (
                  <button
                    onClick={() => setActiveSection("missing_photos")}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Ouvrir l&apos;Outil de Détection</span>
                  </button>
                )}
              </div>

              {/* Card 2: Support Client */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                permissions.canManageSupportTickets 
                  ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
                  : "bg-slate-100/60 dark:bg-slate-900/40 border-transparent opacity-60"
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    {permissions.canManageSupportTickets ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase rounded">Autorisé</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded">Verrouillé</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Assistance & Support Client</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Traitement des demandes des écoles partenaires, aide technique et guidage.
                  </p>
                </div>
              </div>

              {/* Card 3: Finances */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                permissions.canViewPlatformFinances 
                  ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
                  : "bg-slate-100/60 dark:bg-slate-900/40 border-transparent opacity-60"
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    {permissions.canViewPlatformFinances ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase rounded">Autorisé</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded">Verrouillé</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Finances & Mobile Money</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Suivi des commissions, réconciliation bancaire et reversements aux écoles.
                  </p>
                </div>
              </div>

              {/* Card 4: Infrastructure & Serveurs */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                permissions.canManageServerMaintenance 
                  ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
                  : "bg-slate-100/60 dark:bg-slate-900/40 border-transparent opacity-60"
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Server className="h-5 w-5 text-purple-500" />
                    {permissions.canManageServerMaintenance ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase rounded">Autorisé</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded">Verrouillé</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Infrastructure & Serveurs Cloud</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Monitoring réseau, sauvegardes automatisées et métriques de latence.
                  </p>
                </div>
              </div>

              {/* Card 5: Gestion Écoles */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                permissions.canManageSchools 
                  ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
                  : "bg-slate-100/60 dark:bg-slate-900/40 border-transparent opacity-60"
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Building2 className="h-5 w-5 text-indigo-500" />
                    {permissions.canManageSchools ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase rounded">Autorisé</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded">Verrouillé</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Gestion des Établissements</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Configuration des nouvelles écoles partenaires et vérification de conformité.
                  </p>
                </div>
              </div>

              {/* Card 6: Audit & Journal */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                permissions.canAuditLogs 
                  ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
                  : "bg-slate-100/60 dark:bg-slate-900/40 border-transparent opacity-60"
              }`}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FileText className="h-5 w-5 text-rose-500" />
                    {permissions.canAuditLogs ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase rounded">Autorisé</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-black uppercase rounded">Verrouillé</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Journal d&apos;Audit & Sécurité</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Traçabilité des connexions et des modifications administratives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION CONTENT: MISSING PHOTOS */}
      {activeSection === "missing_photos" && permissions.canViewMissingPhotosAlerts && (
        <MissingPhotosAuditDashboard
          schools={schools}
          students={students}
          employees={employees}
          teachers={teachers}
          userAccounts={userAccounts}
          staffPermissions={permissions}
          currentStaffName={staffMember.fullName}
          onAuditLog={onAuditLog}
        />
      )}

      {/* SECTION CONTENT: PERMISSIONS MATRIX */}
      {activeSection === "permissions_audit" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 text-left">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-500" />
              <span>Matrice de vos Droits & Habilitations Système</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ces autorisations sont attribuées par le Propriétaire et contrôlées à chaque requête.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(Object.keys(PERMISSION_LABELS) as (keyof typeof PERMISSION_LABELS)[]).map(key => {
              const isGranted = Boolean(permissions[key]);
              const meta = PERMISSION_LABELS[key];

              return (
                <div
                  key={key}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                    isGranted
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800/40 opacity-60"
                  }`}
                >
                  <div className={`p-1 rounded-full shrink-0 ${isGranted ? "bg-emerald-500 text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-500"}`}>
                    {isGranted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {meta.label}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isGranted ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-200 text-slate-500"
                      }`}>
                        {isGranted ? "Accordé" : "Non Accordé"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {meta.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
