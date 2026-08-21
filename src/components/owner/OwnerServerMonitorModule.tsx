import React, { useState, useEffect } from "react";
import {
  Server,
  Activity,
  Cpu,
  Database,
  HardDrive,
  Wifi,
  ShieldAlert,
  Clock,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe
} from "lucide-react";

interface OwnerServerMonitorProps {
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function OwnerServerMonitorModule({ userName = "Propriétaire SmartSchool RDC", onAuditLog }: OwnerServerMonitorProps) {
  const [telemetry, setTelemetry] = useState({
    cpuLoad: 24,
    ramUsedGB: 6.8,
    ramTotalGB: 16.0,
    diskUsedGB: 142,
    diskTotalGB: 500,
    dbLatencyMs: 8,
    responseTimeMs: 42,
    connectedUsers: 1420,
    requestsPerSec: 184,
    uptimePercent: 99.98,
    lastBackupTime: "Aujourd'hui 04:00 (Succès)",
    syncState: "Opérationnelle (Zero lag)"
  });

  const [incidents, setIncidents] = useState([
    {
      id: "inc-1",
      title: "Tentative de Brute Force détectée & bloquée",
      type: "Piratage / Attaque",
      severity: "Élevée",
      timestamp: "Aujourd'hui 12:14",
      details: "IP 197.234.12.89 bloquée automatiquement après 10 échecs de mots de passe sur l'API.",
      status: "Contenu / Bloqué"
    },
    {
      id: "inc-2",
      title: "Latence temporaire réseau Airtel Sud-Kivu",
      type: "Connexion",
      severity: "Modérée",
      timestamp: "Aujourd'hui 09:30",
      details: "Délai de réponse SMS accru sur la passerelle Bukavu. Basculement auto vers réseau Orange.",
      status: "Résolu auto"
    }
  ]);

  const [toast, setToast] = useState<string | null>(null);

  // Live telemetry pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        cpuLoad: Math.min(95, Math.max(12, prev.cpuLoad + (Math.floor(Math.random() * 9) - 4))),
        responseTimeMs: Math.min(120, Math.max(20, prev.responseTimeMs + (Math.floor(Math.random() * 7) - 3))),
        requestsPerSec: Math.min(500, Math.max(80, prev.requestsPerSec + (Math.floor(Math.random() * 15) - 7)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerManualBackup = () => {
    if (onAuditLog) onAuditLog("Lancement Sauvegarde Serveur", "Déclenchement manuel d'un snapshot serveur en temps réel.");
    setToast("Snapshot de sauvegarde serveur déclenché avec succès sur le Cloud Souverain RDC.");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase rounded-full border border-emerald-500/30 mb-2">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>TÉLÉMESURE EN TEMPS RÉEL &amp; DETECTION DES INCIDENTS</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Centre de Surveillance des Serveurs &amp; Incidents</h2>
          <p className="text-xs text-slate-300 mt-1">
            Supervision du cluster Cloud Souverain RDC, charge processeur, mémoire RAM, base de données Firestore/SQL et alertes de sécurité automatiques.
          </p>
        </div>

        <button
          onClick={handleTriggerManualBackup}
          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase rounded-xl cursor-pointer shadow-lg flex items-center space-x-2 shrink-0 border border-emerald-400/30"
        >
          <HardDrive className="h-4 w-4" />
          <span>Déclencher un Snapshot</span>
        </button>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl border border-emerald-500 flex items-center space-x-2 text-xs font-bold shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Realtime Metrics Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase">
            <span>Charge CPU Cluster</span>
            <Cpu className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">{telemetry.cpuLoad}%</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                telemetry.cpuLoad > 80 ? "bg-red-500" : telemetry.cpuLoad > 50 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${telemetry.cpuLoad}%` }}
            />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase">
            <span>Mémoire RAM</span>
            <Server className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {telemetry.ramUsedGB} / {telemetry.ramTotalGB} GB
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${(telemetry.ramUsedGB / telemetry.ramTotalGB) * 100}%` }} />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase">
            <span>Latence Base de Données</span>
            <Database className="h-4 w-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {telemetry.dbLatencyMs} ms
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Temps de Réponse API: {telemetry.responseTimeMs}ms</div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase">
            <span>Disponibilité Serveurs</span>
            <Globe className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">{telemetry.uptimePercent}%</div>
          <div className="text-[10px] text-emerald-600 font-bold">{telemetry.connectedUsers} Utilisateurs Actifs</div>
        </div>
      </div>

      {/* Incidents Feed */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>Journal des Détections d'Incidents &amp; Sécurité</span>
          </h3>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-black text-[10px] rounded-full">
            AUTO-PROTECTION ACTIVE
          </span>
        </div>

        <div className="space-y-3">
          {incidents.map(inc => (
            <div
              key={inc.id}
              className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-600 font-mono text-[10px] font-black rounded uppercase">
                    {inc.type}
                  </span>
                  <span>{inc.title}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{inc.details}</p>
                <div className="text-[10px] text-slate-400">{inc.timestamp}</div>
              </div>

              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase rounded-full shrink-0">
                {inc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
