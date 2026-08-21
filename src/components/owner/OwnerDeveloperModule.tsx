import React, { useState } from "react";
import {
  Code,
  Key,
  Globe,
  Terminal,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Lock
} from "lucide-react";
import { safeCopyToClipboard } from "../../utils/safeStorage";

interface OwnerDeveloperProps {
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function OwnerDeveloperModule({ userName = "Propriétaire SmartSchool RDC", onAuditLog }: OwnerDeveloperProps) {
  const [apiKeys, setApiKeys] = useState([
    {
      id: "key-1",
      name: "Clé Principale Production RDC",
      token: "sk_live_ssrdc_99a88712bc90011a",
      createdAt: "2026-01-01",
      status: "Active",
      lastUsed: "À l'instant"
    },
    {
      id: "key-2",
      name: "Webhook Gateway Mobile Money Vodacom",
      token: "sk_live_ssrdc_voda_772183912a",
      createdAt: "2026-03-12",
      status: "Active",
      lastUsed: "Il y a 5 min"
    }
  ]);

  const [webhooks, setWebhooks] = useState([
    {
      id: "wh-1",
      url: "https://api.voda-mpesa.cd/v1/smartschool/callback",
      events: ["payment.received", "subscription.renewed"],
      status: "Actif"
    }
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const handleCreateKey = () => {
    const newKey = {
      id: `key-${Date.now()}`,
      name: "Nouvelle Clé API Intégration",
      token: `sk_live_ssrdc_${Math.random().toString(36).substring(2, 12)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      status: "Active",
      lastUsed: "Jamais"
    };

    setApiKeys([...apiKeys, newKey]);
    if (onAuditLog) onAuditLog("Génération Clé API", `Création de la clé API ${newKey.name}`);
    setToast("Nouvelle clé API générée avec succès.");
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopyToken = async (token: string) => {
    await safeCopyToClipboard(token);
    setToast("Jeton API copié dans le presse-papiers !");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 font-black text-[10px] uppercase rounded-full border border-indigo-500/30 mb-2">
            <Code className="h-3.5 w-3.5 text-indigo-400" />
            <span>ESPACE DÉVELOPPEUR &amp; API SOUVERAINE RDC</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Centre Développeur &amp; Clés d'API REST</h2>
          <p className="text-xs text-slate-300 mt-1">
            Gérez les jetons d'accès API, webhooks d'intégration Mobile Money et journaux de requêtes de la plateforme.
          </p>
        </div>

        <button
          onClick={handleCreateKey}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase rounded-xl shadow-lg flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Générer une Clé API</span>
        </button>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl border border-emerald-500 flex items-center space-x-2 text-xs font-bold shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* API Keys Table */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center space-x-2">
          <Key className="h-4 w-4 text-indigo-500" />
          <span>Clés d'Accès API Active</span>
        </h3>

        <div className="space-y-3">
          {apiKeys.map(k => (
            <div
              key={k.id}
              className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{k.name}</div>
                <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{k.token}</div>
                <div className="text-[10px] text-slate-400">Créée le {k.createdAt} • Dernier usage: {k.lastUsed}</div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleCopyToken(k.token)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copier</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
