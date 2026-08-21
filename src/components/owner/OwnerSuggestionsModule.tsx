import React, { useState } from "react";
import { safeLocalStorage } from "../../utils/safeStorage";
import {
  Lightbulb,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  X
} from "lucide-react";

export interface SchoolSuggestion {
  id: string;
  title: string;
  description: string;
  schoolName: string;
  submittedBy: string;
  category: "Pédagogie" | "Finances" | "Communication" | "RH" | "Impression" | "Autre";
  upvotesCount: number;
  hasOwnerVoted?: boolean;
  status: "En attente" | "Acceptée" | "En développement" | "Terminée" | "Rejetée";
  createdAt: string;
  ownerComment?: string;
}

interface OwnerSuggestionsProps {
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
  onPublishToChangelog?: (version: string, title: string, details: string) => void;
}

export function OwnerSuggestionsModule({
  userName = "Propriétaire SmartSchool RDC",
  onAuditLog,
  onPublishToChangelog
}: OwnerSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SchoolSuggestion[]>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_suggestions");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "sug-1",
        title: "Intégration du bulletin numérique bilingue (Français - Anglais)",
        description: "Permettre l'exportation automatique des bulletins de notes avec l'intitulé des cours en anglais pour les écoles appliquant le programme bilingue RDC.",
        schoolName: "Lycée Prins de Liège (Kinshasa)",
        submittedBy: "Mme Claire Vanderberg",
        category: "Pédagogie",
        upvotesCount: 42,
        status: "En développement",
        createdAt: "2026-08-01",
        ownerComment: "Retenu pour la version v4.9.0. Équipe de dev mobilisée."
      },
      {
        id: "sug-2",
        title: "Paiement direct du Minerval par carte Visa / Mastercard internationale",
        description: "Offrir l'option de paiement par carte bancaire internationale pour les parents de la diaspora qui financent les études de leurs enfants en RDC.",
        schoolName: "Complexe Scolaire La Sagesse (Lubumbashi)",
        submittedBy: "Promoteur M. Jean-Marc Ilunga",
        category: "Finances",
        upvotesCount: 38,
        status: "Acceptée",
        createdAt: "2026-08-03",
        ownerComment: "Partenariat Stripe & Rawbank en cours de finalisation."
      },
      {
        id: "sug-3",
        title: "Reconnaissance faciale pour la prise de présence aux portails des écoles",
        description: "Intégrer les caméras IP des écoles pour valider la présence des élèves à l'entrée sans scanner de badges.",
        schoolName: "Collège Alfajiri (Bukavu)",
        submittedBy: "Directeur P. Thomas",
        category: "Autre",
        upvotesCount: 12,
        status: "En attente",
        createdAt: "2026-08-07"
      }
    ];
  });

  const [filterStatus, setFilterStatus] = useState("Tous");
  const [toast, setToast] = useState<string | null>(null);

  const saveSuggestions = (updated: SchoolSuggestion[]) => {
    setSuggestions(updated);
    safeLocalStorage.setItem("ss_owner_suggestions", JSON.stringify(updated));
  };

  const handleUpdateStatus = (id: string, newStatus: SchoolSuggestion["status"], comment?: string) => {
    const updated = suggestions.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: newStatus,
          ownerComment: comment || s.ownerComment
        };
      }
      return s;
    });

    saveSuggestions(updated);

    const target = suggestions.find(s => s.id === id);
    if (onAuditLog) onAuditLog("Mise à jour Suggestion", `Suggestion '${target?.title}' passée à ${newStatus}`);

    if (newStatus === "Terminée" && onPublishToChangelog && target) {
      onPublishToChangelog("v4.9.0", target.title, target.description);
      showToast(`Suggestion '${target.title}' marquée comme Terminée et publiée dans les Notes de Version !`);
    } else {
      showToast(`Décision mise à jour : ${newStatus}`);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = suggestions.filter(s => filterStatus === "Tous" || s.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl border border-amber-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 text-amber-300 font-black text-[10px] uppercase rounded-full border border-amber-500/30 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span>BOÎTE À IDÉES & PROPOSITIONS DES ÉTABLISSEMENTS</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Centre des Suggestions & Feuille de Route</h2>
          <p className="text-xs text-slate-300 mt-1">
            Évaluez et classez par popularité les fonctionnalités proposées par les directeurs, préfets et promoteurs à travers la RDC.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl border border-emerald-500 flex items-center space-x-2 text-xs font-bold shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300">Statut de la suggestion :</span>
        <div className="flex items-center space-x-2">
          {["Tous", "En attente", "Acceptée", "En développement", "Terminée", "Rejetée"].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                filterStatus === st
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion list */}
      <div className="space-y-4">
        {filtered.map(s => (
          <div
            key={s.id}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl font-black text-xs flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{s.upvotesCount} Votes</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{s.title}</h3>
                  <div className="text-[11px] text-slate-500">{s.schoolName} • Proposé par {s.submittedBy} le {s.createdAt}</div>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
                  s.status === "Acceptée"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    : s.status === "En développement"
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    : s.status === "Terminée"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {s.status}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{s.description}</p>

            {s.ownerComment && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs border border-slate-200 dark:border-slate-800 font-mono text-indigo-600 dark:text-indigo-400">
                <strong>Commentaire Propriétaire :</strong> {s.ownerComment}
              </div>
            )}

            {/* Decision Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => handleUpdateStatus(s.id, "Acceptée", "Suggestion acceptée par la direction SaaS.")}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase rounded-xl cursor-pointer"
              >
                Accepter
              </button>
              <button
                onClick={() => handleUpdateStatus(s.id, "En développement", "Intégration en cours par les développeurs.")}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase rounded-xl cursor-pointer"
              >
                En Développement
              </button>
              <button
                onClick={() => handleUpdateStatus(s.id, "Terminée", "Déployé et opérationnel sur la plateforme.")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase rounded-xl cursor-pointer"
              >
                Terminer & Publier
              </button>
              <button
                onClick={() => handleUpdateStatus(s.id, "Rejetée", "Non retenu dans la feuille de route actuelle.")}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase rounded-xl cursor-pointer"
              >
                Rejeter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
