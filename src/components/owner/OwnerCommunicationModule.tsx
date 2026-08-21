import React, { useState } from "react";
import {
  Send,
  Mail,
  Smartphone,
  Bell,
  CheckCircle2,
  Filter,
  Users,
  Building2,
  Calendar,
  Clock
} from "lucide-react";

interface OwnerCommunicationProps {
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function OwnerCommunicationModule({ userName = "Propriétaire SmartSchool RDC", onAuditLog }: OwnerCommunicationProps) {
  const [channel, setChannel] = useState<"ALL" | "SMS" | "EMAIL" | "IN_APP">("ALL");
  const [targetProvince, setTargetProvince] = useState("Toutes");
  const [targetPlan, setTargetPlan] = useState("Tous");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [broadcastHistory, setBroadcastHistory] = useState([
    {
      id: "b-1",
      title: "Mise à disposition du Nouveau Module de Sauvegarde Chiffrée",
      channel: "EMAIL & IN-APP",
      target: "Toutes les écoles",
      sentAt: "2026-08-09 16:00",
      deliveredCount: 24,
      readCount: 21
    },
    {
      id: "b-2",
      title: "Rappel Clôture de Saisie des Bulletins du 1er Semestre",
      channel: "SMS",
      target: "Province Kinshasa & Kongo-Central",
      sentAt: "2026-08-02 09:00",
      deliveredCount: 420,
      readCount: 390
    }
  ]);

  const handleSendBroadcast = () => {
    if (!subject.trim() || !messageText.trim()) return;

    const newBroadcast = {
      id: `b-${Date.now()}`,
      title: subject,
      channel,
      target: `${targetProvince} • Plan ${targetPlan}`,
      sentAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      deliveredCount: 24,
      readCount: 24
    };

    setBroadcastHistory([newBroadcast, ...broadcastHistory]);
    setSubject("");
    setMessageText("");

    if (onAuditLog) onAuditLog("Diffusion Communiqué", `Broadcast envoyé: '${subject}' aux écoles (${targetProvince})`);
    setToast("Votre communiqué officiel a été diffusé aux établissements ciblés.");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 font-black text-[10px] uppercase rounded-full border border-indigo-500/30 mb-2">
            <Send className="h-3.5 w-3.5 text-indigo-400" />
            <span>CENTRE DE BROADCAST &amp; COMMUNICATION NATIONALE</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Centre de Communication &amp; Communiqués</h2>
          <p className="text-xs text-slate-300 mt-1">
            Envoyez des messages d'information, SMS officiels et e-mails ciblés à l'ensemble des décideurs et administrateurs d'écoles.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl border border-emerald-500 flex items-center space-x-2 text-xs font-bold shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Composer */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-800 pb-3">
          Rédiger un Message / Communiqué Officiel
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Canal de Transmission</label>
            <select
              value={channel}
              onChange={e => setChannel(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold dark:text-white"
            >
              <option value="ALL">Tous les canaux (SMS + Email + In-App)</option>
              <option value="SMS">SMS Direct RDC</option>
              <option value="EMAIL">E-mail Officiel</option>
              <option value="IN_APP">Notification dans l'Application</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cible Province</label>
            <select
              value={targetProvince}
              onChange={e => setTargetProvince(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold dark:text-white"
            >
              <option value="Toutes">Toutes les Provinces de RDC</option>
              <option value="Kinshasa">Kinshasa</option>
              <option value="Kongo-Central">Kongo-Central</option>
              <option value="Haut-Katanga">Haut-Katanga</option>
              <option value="Nord-Kivu">Nord-Kivu</option>
              <option value="Tshopo">Tshopo</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cible Plan SaaS</label>
            <select
              value={targetPlan}
              onChange={e => setTargetPlan(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold dark:text-white"
            >
              <option value="Tous">Tous les Plans</option>
              <option value="Premium">Premium</option>
              <option value="Professionnel">Professionnel</option>
              <option value="Standard">Standard</option>
              <option value="Gratuit">Gratuit / Essai</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <input
            type="text"
            placeholder="Objet du message ou Titre du Communiqué..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
          />

          <textarea
            rows={4}
            placeholder="Rédigez ici le corps de votre message destiné aux autorités scolaires..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSendBroadcast}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Diffuser Immédiatement</span>
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-800 pb-3">
          Historique des Diffusion Officielles
        </h3>

        <div className="space-y-3">
          {broadcastHistory.map(b => (
            <div
              key={b.id}
              className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{b.title}</div>
                <div className="text-[11px] text-slate-500">
                  Canal: <strong className="text-indigo-600">{b.channel}</strong> • Cible: {b.target} • {b.sentAt}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-mono shrink-0">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg font-bold">
                  ✓ {b.deliveredCount} Transmis
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
