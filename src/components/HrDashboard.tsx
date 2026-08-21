import React from "react";
import { Employee, EmployeeAttendance, EmployeeLeave, EmployeeSanction, EmployeeTraining, HrAuditLog } from "../types";
import { Users, Clock, Calendar, ShieldAlert, ShieldCheck, UserPlus, QrCode, Key, Activity } from "lucide-react";
import { motion } from "motion/react";

interface HrDashboardProps {
  employees: Employee[];
  attendances: EmployeeAttendance[];
  leaves: EmployeeLeave[];
  sanctions: EmployeeSanction[];
  trainings: EmployeeTraining[];
  auditLogs: HrAuditLog[];
  onNavigateToTab: (tab: string) => void;
  departments: string[];
}

export function HrDashboard({
  employees,
  attendances,
  leaves,
  sanctions,
  trainings,
  auditLogs,
  onNavigateToTab,
  departments
}: HrDashboardProps) {
  const todayStr = new Date().toLocaleDateString("fr-FR");
  const presentToday = attendances.filter(a => a.date === todayStr && a.status === "Présent").length;
  const activeLeaves = employees.filter(e => e.status === "En congé").length;
  const activeSanctions = sanctions.filter(s => s.status === "Active").length;

  return (
    <div className="space-y-6" id="hr-dashboard-container">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="hr-kpi-grid">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between h-32" 
          id="kpi-total-staff"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest block">Effectif Total</span>
              <span className="text-3xl font-black mt-1 block">{employees.length} Agents</span>
            </div>
            <Users className="h-6 w-6 text-white/40" />
          </div>
          <div className="text-[10px] text-white/90 font-medium">
            Dont {employees.filter(e => e.gender === "F").length} femmes ({Math.round((employees.filter(e => e.gender === "F").length / (employees.length || 1)) * 100)}%)
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32" 
          id="kpi-presence"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Taux Présence Jour</span>
              <span className="text-3xl font-black mt-1 block text-emerald-500">
                {Math.round((presentToday / (employees.length || 1)) * 100)}%
              </span>
            </div>
            <Clock className="h-6 w-6 text-emerald-500/40" />
          </div>
          <div className="text-[10px] text-slate-500">
            {presentToday} présents aujourd'hui ({todayStr})
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32" 
          id="kpi-leaves"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">En Congé Actif</span>
              <span className="text-3xl font-black mt-1 block text-amber-500">
                {activeLeaves} Agents
              </span>
            </div>
            <Calendar className="h-6 w-6 text-amber-500/40" />
          </div>
          <div className="text-[10px] text-slate-500">
            {leaves.filter(l => l.status === "Approuvé").length} congés validés au total
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32" 
          id="kpi-sanctions"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Sanctions Actives</span>
              <span className="text-3xl font-black mt-1 block text-rose-500">
                {activeSanctions} Sanctions
              </span>
            </div>
            <ShieldAlert className="h-6 w-6 text-rose-500/40" />
          </div>
          <div className="text-[10px] text-slate-500">
            {sanctions.filter(s => s.type === "Suspension").length} suspensions en cours
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Department Distribution & Logs */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4" 
            id="dept-distribution-card"
          >
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Aperçu par Département</h3>
            <div className="space-y-3.5">
              {departments.map((dept, idx) => {
                const deptCount = employees.filter(e => e.department === dept).length;
                const percentage = Math.round((deptCount / (employees.length || 1)) * 100);
                return (
                  <div key={dept} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                      <span>{dept}</span>
                      <span>{deptCount} agents ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + idx * 0.05 }}
                        className="bg-indigo-600 h-full rounded-full" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.25 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4" 
            id="recent-logs-card"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Mouvements & Activités RH Récentes</h3>
              <button 
                onClick={() => onNavigateToTab("audit")} 
                className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
              >
                Voir tout le registre
              </button>
            </div>
            <div className="space-y-3.5">
              {auditLogs.slice(-4).reverse().map((log, index) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="flex items-start space-x-3 text-xs"
                >
                  <div className="mt-1 bg-indigo-50 dark:bg-indigo-950 p-1 rounded-lg">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{log.action} : <strong className="text-indigo-600 dark:text-indigo-400">{log.targetName}</strong></p>
                    <p className="text-[10px] text-slate-400">Par {log.actorName} | {log.date} à {log.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Shortcuts & Upcoming events */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4" 
            id="quick-links-card"
          >
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Raccourcis Actions Rapides</h3>
            <div className="grid grid-cols-1 gap-2.5">
              <button 
                onClick={() => onNavigateToTab("ajouter")} 
                className="flex items-center space-x-3 p-3 text-left border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-2xl hover:bg-indigo-50/40 transition-colors text-xs font-bold text-indigo-700 dark:text-indigo-400 cursor-pointer"
              >
                <UserPlus className="h-4.5 w-4.5" />
                <span>Embaucher / Enregistrer un Agent</span>
              </button>
              <button 
                onClick={() => onNavigateToTab("scanner")} 
                className="flex items-center space-x-3 p-3 text-left border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/20 rounded-2xl hover:bg-emerald-50/40 transition-colors text-xs font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer"
              >
                <QrCode className="h-4.5 w-4.5" />
                <span>Pointage via Scanner de Cartes</span>
              </button>
              <button 
                onClick={() => onNavigateToTab("conges")} 
                className="flex items-center space-x-3 p-3 text-left border border-amber-100 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/20 rounded-2xl hover:bg-amber-50/40 transition-colors text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer"
              >
                <Calendar className="h-4.5 w-4.5" />
                <span>Enregistrer une Demande de Congé</span>
              </button>
              <button 
                onClick={() => onNavigateToTab("comptes")} 
                className="flex items-center space-x-3 p-3 text-left border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl hover:bg-slate-100/50 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <Key className="h-4.5 w-4.5" />
                <span>Comptes de Connexion Sécurisés</span>
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.35 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4" 
            id="trainings-summary-card"
          >
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Formations Planifiées</h3>
            {trainings.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">Aucune formation en cours ou planifiée.</p>
            ) : (
              <div className="space-y-3">
                {trainings.slice(0, 3).map((trn, idx) => (
                  <motion.div 
                    key={trn.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + idx * 0.05 }}
                    className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-xs"
                  >
                    <p className="font-bold text-slate-800 dark:text-white">{trn.trainingName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Formateur: {trn.provider}</p>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono">
                      <span>Du {trn.startDate}</span>
                      <span>Au {trn.endDate}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
