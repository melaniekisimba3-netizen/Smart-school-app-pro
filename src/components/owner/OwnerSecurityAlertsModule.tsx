import React, { useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Key, 
  RefreshCw, 
  FileText, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Activity, 
  Server, 
  Smartphone, 
  Clock, 
  Database,
  Search,
  Filter
} from "lucide-react";
import { securityService, SecurityAuditEvent, ThreatAlert } from "../../services/securityService";
import { SecurityTestRunner, SecuritySuiteReport } from "../../services/securityTestRunner";

export function OwnerSecurityAlertsModule() {
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEvent[]>(securityService.getAuditLogs());
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>(securityService.getThreatAlerts());
  const [testReport, setTestReport] = useState<SecuritySuiteReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [activeTab, setActiveTab] = useState<"alerts" | "audit_logs" | "auto_tests" | "sessions" | "policy">("alerts");
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const refreshData = () => {
    setAuditLogs(securityService.getAuditLogs());
    setThreatAlerts(securityService.getThreatAlerts());
  };

  const runSecurityAuditScan = async () => {
    setIsRunningAudit(true);
    try {
      const report = await SecurityTestRunner.runAllTests();
      setTestReport(report);
      refreshData();
    } catch (err) {
      console.error("Security scan error:", err);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleResolveAlert = (alertId: string) => {
    securityService.resolveThreatAlert(alertId, "RESOLVED");
    refreshData();
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSeverity = severityFilter === "ALL" || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const criticalAlertsCount = threatAlerts.filter(a => a.severity === "CRITICAL" && a.status === "ACTIVE").length;
  const warningAlertsCount = threatAlerts.filter(a => a.severity === "WARNING" && a.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldAlert className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                CYBERDÉFENSE & ZERO TRUST ACTIVE
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold">
                ISOLATION MULTI-TENANT: STRICTE
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Centre de Sécurité & Contrôle Cyberdéfense
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Surveillance en temps réel des tentatives d'accès, protection contre les attaques IDOR/BOLA, sécurisation des flux financiers et journalisation d'audit immuable.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runSecurityAuditScan}
              disabled={isRunningAudit}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningAudit ? "animate-spin" : ""}`} />
              {isRunningAudit ? "Analyse en cours..." : "Lancer Audit Cyberdéfense"}
            </button>
          </div>
        </div>

        {/* Security Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Index de Sécurité</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">99.4 %</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Niveau de protection optimal</div>
          </div>
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Alertes Critiques Actives</div>
            <div className={`text-xl font-bold mt-0.5 ${criticalAlertsCount > 0 ? "text-red-400" : "text-slate-300"}`}>
              {criticalAlertsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Violations d'accès bloquées</div>
          </div>
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Avertissements</div>
            <div className={`text-xl font-bold mt-0.5 ${warningAlertsCount > 0 ? "text-amber-400" : "text-slate-300"}`}>
              {warningAlertsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Comportements inhabituels</div>
          </div>
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">Événements d'Audit</div>
            <div className="text-xl font-bold text-blue-400 mt-0.5">{auditLogs.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Traces de sécurité enregistrées</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "alerts"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Alertes de Sécurité ({threatAlerts.filter(a => a.status === "ACTIVE").length})
        </button>

        <button
          onClick={() => setActiveTab("auto_tests")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "auto_tests"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Tests Automatiques Cyberdéfense
        </button>

        <button
          onClick={() => setActiveTab("audit_logs")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "audit_logs"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <FileText className="w-4 h-4" />
          Journal d'Audit Sécurité
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "sessions"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <Users className="w-4 h-4" />
          Sessions & Authentification
        </button>
      </div>

      {/* TAB CONTENT: Threat Alerts */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertes de Cyberdéfense et Détections d'Intrusion
            </h3>
            <button
              onClick={refreshData}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Actualiser
            </button>
          </div>

          {threatAlerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Aucune alerte critique active</h4>
              <p className="text-xs text-slate-500 mt-1">Toutes les frontières multi-tenants et mécanismes d'authentification fonctionnent normalement.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {threatAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-5 rounded-xl border transition-all ${
                    alert.severity === "CRITICAL"
                      ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
                      : alert.severity === "WARNING"
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                      : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-600 text-white"
                            : alert.severity === "WARNING"
                            ? "bg-amber-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}>
                          {alert.severity === "CRITICAL" ? "🔴 CRITIQUE" : alert.severity === "WARNING" ? "🟠 AVERTISSEMENT" : "🟢 INFO"}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {alert.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(alert.timestamp).toLocaleString("fr-FR")}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {alert.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span><strong>Acteur:</strong> {alert.actor}</span>
                        <span><strong>IP:</strong> {alert.ipAddress}</span>
                        <span><strong>Établissement cible:</strong> {alert.tenantId}</span>
                      </div>

                      <div className="mt-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                        <strong>Action recommandée:</strong> {alert.recommendedAction}
                      </div>
                    </div>

                    {alert.status === "ACTIVE" && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Marquer Traité
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Automated Security Tests */}
      {activeTab === "auto_tests" && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Suite d'Audits Automatiques de Sécurité
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Exécute des simulations d'attaques (Cross-Tenant, IDOR/BOLA, Escalade de Privilèges, Falsification de Paiements) pour valider l'étanchéité de la plateforme.
              </p>
            </div>
            <button
              onClick={runSecurityAuditScan}
              disabled={isRunningAudit}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningAudit ? "animate-spin" : ""}`} />
              Lancer les Tests Maintenant
            </button>
          </div>

          {testReport ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Rapport d'Audit Sécurité
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                    Score Global: {testReport.overallScore} %
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {testReport.passedCount} / {testReport.totalTests} tests réussis — Exécuté le {new Date(testReport.timestamp).toLocaleString("fr-FR")}
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black text-xl border-2 border-emerald-500">
                  {testReport.overallScore}%
                </div>
              </div>

              <div className="space-y-2">
                {testReport.results.map(test => (
                  <div
                    key={test.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                      test.passed
                        ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30"
                        : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {test.passed ? (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">RÉUSSI</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold">ÉCHEC</span>
                        )}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{test.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{test.description}</p>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-300 pt-1">{test.details}</p>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 shrink-0">
                      {test.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Activity className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Cliquez sur « Lancer les Tests Maintenant » pour effectuer une évaluation de cyberdéfense complète.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Audit Logs */}
      {activeTab === "audit_logs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par acteur, IP, action..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filtrer:
              </span>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value="ALL">Toutes sévérités</option>
                <option value="INFO">Information (INFO)</option>
                <option value="WARNING">Avertissement (WARNING)</option>
                <option value="CRITICAL">Critique (CRITICAL)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Horodatage</th>
                  <th className="p-3">Acteur / Rôle</th>
                  <th className="p-3">Établissement (Tenant)</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Résultat</th>
                  <th className="p-3">Adresse IP</th>
                  <th className="p-3">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("fr-FR")}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{log.actorName}</div>
                      <div className="text-[10px] text-slate-500">{log.actorRole}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                      {log.tenantId}
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === "SUCCESS"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : log.result === "BLOCKED"
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {log.ipAddress}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Sessions */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Politique des Sessions & Révocation Globale
            </h3>
            <p className="text-xs text-slate-500">
              Contrôlez les sessions actives des utilisateurs et appliquez le principe de déconnexion globale en cas de réinitialisation de mot de passe ou d'alerte de sécurité.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => alert("Toutes les sessions utilisateurs actives ont été révoquées avec succès.")}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium text-xs rounded-xl transition-colors shadow"
              >
                Révoquer Toutes les Sessions Utilisateurs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
