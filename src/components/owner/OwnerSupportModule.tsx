import React, { useState } from "react";
import { safeLocalStorage } from "../../utils/safeStorage";
import {
  HelpCircle,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Send,
  Paperclip,
  Download,
  X,
  Plus,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  schoolName: string;
  senderName: string;
  senderRole: string;
  category: "Assistance" | "Problème technique" | "Bug" | "Difficulté de connexion" | "Problème de paiement" | "Suggestion";
  priority: "Basse" | "Moyenne" | "Haute" | "Urgente";
  status: "En attente" | "En cours" | "Résolu" | "Clôturé" | "Réouvert";
  subject: string;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  resolutionTime?: string;
  attachments?: string[];
  comments: {
    id: string;
    author: string;
    role: string;
    text: string;
    timestamp: string;
    isOwner: boolean;
  }[];
}

interface OwnerSupportModuleProps {
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function OwnerSupportModule({ userName = "Propriétaire SmartSchool RDC", onAuditLog }: OwnerSupportModuleProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = safeLocalStorage.getItem("ss_owner_support_tickets");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "t-101",
        ticketNumber: "#TICK-2026-0801",
        schoolName: "Collège Boboto (Kinshasa)",
        senderName: "P. François Banza",
        senderRole: "Préfet des Études",
        category: "Problème de paiement",
        priority: "Urgente",
        status: "En cours",
        subject: "Erreur de validation lors du virement Mobile Money M-Pesa",
        createdAt: "2026-08-09 10:15",
        updatedAt: "2026-08-10 08:30",
        assignedAgent: "Support SaaS Kinshasa - Agent Marc",
        resolutionTime: "En attente (1h 15m)",
        attachments: ["recu_mpesa_trans_8812.pdf"],
        comments: [
          {
            id: "c-1",
            author: "P. François Banza",
            role: "Préfet des Études",
            text: "Bonjour, nous avons effectué un paiement pour 450 licences d'élèves via Vodacom M-Pesa mais le statut de l'école indique toujours 'Abonnement en attente'. Merci de vérifier le reçu ci-joint.",
            timestamp: "2026-08-09 10:15",
            isOwner: false
          },
          {
            id: "c-2",
            author: "Support SaaS Kinshasa - Agent Marc",
            role: "Support Propriétaire",
            text: "Bonjour mon Père, le billet M-Pesa est en cours de vérification manuelle auprès de la passerelle M-Pesa RDC. Merci pour votre patience.",
            timestamp: "2026-08-10 08:30",
            isOwner: true
          }
        ]
      },
      {
        id: "t-102",
        ticketNumber: "#TICK-2026-0802",
        schoolName: "Lycée Wima (Bukavu / Sud-Kivu)",
        senderName: "Mme Bernadette Cikuru",
        senderRole: "Secrétaire Principale",
        category: "Difficulté de connexion",
        priority: "Haute",
        status: "En attente",
        subject: "Mots de passe réinitialisés non reçus par SMS par les enseignants",
        createdAt: "2026-08-10 07:00",
        updatedAt: "2026-08-10 07:00",
        assignedAgent: "Non attribué",
        resolutionTime: "--",
        attachments: [],
        comments: [
          {
            id: "c-3",
            author: "Mme Bernadette Cikuru",
            role: "Secrétaire",
            text: "Les SMS de réinitialisation envoyés sur les numéros Airtel Sud-Kivu ne parviennent pas aux enseignants depuis ce matin.",
            timestamp: "2026-08-10 07:00",
            isOwner: false
          }
        ]
      },
      {
        id: "t-103",
        ticketNumber: "#TICK-2026-0789",
        schoolName: "Institut Technique de Mbanza-Ngungu",
        senderName: "Ing. Dieudonné Lukeni",
        senderRole: "Promoteur",
        category: "Assistance",
        priority: "Moyenne",
        status: "Résolu",
        subject: "Demande de configuration d'un sous-domaine personnalisé",
        createdAt: "2026-08-05 14:00",
        updatedAt: "2026-08-06 11:20",
        assignedAgent: "Propriétaire SmartSchool RDC",
        resolutionTime: "21 heures",
        attachments: ["certificat_domaine.png"],
        comments: [
          {
            id: "c-4",
            author: "Ing. Dieudonné Lukeni",
            role: "Promoteur",
            text: "Nous souhaitons lier itmbanzangu.smartschool.cd à notre domaine privé.",
            timestamp: "2026-08-05 14:00",
            isOwner: false
          },
          {
            id: "c-5",
            author: userName,
            role: "Propriétaire SaaS",
            text: "Le sous-domaine a été généré et certifié avec le certificat SSL souverain RDC. Tout est opérationnel.",
            timestamp: "2026-08-06 11:20",
            isOwner: true
          }
        ]
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tous");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    safeLocalStorage.setItem("ss_owner_support_tickets", JSON.stringify(updated));
  };

  const handleAddComment = (ticketId: string) => {
    if (!replyText.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      author: userName,
      role: "Propriétaire SaaS",
      text: replyText.trim(),
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      isOwner: true
    };

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: t.status === "En attente" ? ("En cours" as const) : t.status,
          updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          assignedAgent: t.assignedAgent === "Non attribué" ? userName : t.assignedAgent,
          comments: [...t.comments, newComment]
        };
      }
      return t;
    });

    saveTickets(updated);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updated.find(t => t.id === ticketId) || null);
    }
    setReplyText("");
    if (onAuditLog) onAuditLog("Réponse Ticket Support", `Réponse ajoutée au ticket #${selectedTicket?.ticketNumber}`);
    showToast("Votre réponse officielle a été transmise à l'établissement.");
  };

  const handleStatusChange = (ticketId: string, newStatus: SupportTicket["status"]) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          resolutionTime: newStatus === "Résolu" ? "Traitement achevé" : t.resolutionTime
        };
      }
      return t;
    });

    saveTickets(updated);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updated.find(t => t.id === ticketId) || null);
    }
    if (onAuditLog) onAuditLog("Changement Statut Ticket", `Ticket #${selectedTicket?.ticketNumber} passe à ${newStatus}`);
    showToast(`Statut du ticket mis à jour : ${newStatus}`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.senderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "Tous" || t.category === filterCategory;
    const matchStat = filterStatus === "Tous" || t.status === filterStatus;
    return matchSearch && matchCat && matchStat;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 font-black text-[10px] uppercase rounded-full border border-indigo-500/30 mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>GUICHET DE SUPPORT TECHNIQUE & FINANCIER EPST</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center space-x-2">
            <span>Centre de Support National National (Help Desk)</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Gestion centralisée des tickets d'assistance, bugs, difficultés de connexion et incidents transmis par tous les établissements scolaires de la RDC.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-4 py-2 bg-indigo-900/40 rounded-2xl border border-indigo-700/50 text-center">
            <div className="text-[10px] uppercase font-bold text-indigo-300">Tickets Ouverts</div>
            <div className="text-lg font-black text-amber-400">
              {tickets.filter(t => t.status === "En attente" || t.status === "En cours").length}
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-900/40 rounded-2xl border border-emerald-700/50 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-300">Résolus</div>
            <div className="text-lg font-black text-emerald-400">
              {tickets.filter(t => t.status === "Résolu" || t.status === "Clôturé").length}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl border border-emerald-500 flex items-center space-x-2 text-xs font-bold shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par #Ticket, École, Sujet, Expediteur..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="Tous">Toutes Catégories</option>
            <option value="Assistance">Assistance</option>
            <option value="Problème technique">Problème technique</option>
            <option value="Bug">Bug</option>
            <option value="Difficulté de connexion">Difficulté de connexion</option>
            <option value="Problème de paiement">Problème de paiement</option>
            <option value="Suggestion">Suggestion</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="Tous">Tous Statuts</option>
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Résolu">Résolu</option>
            <option value="Clôturé">Clôturé</option>
          </select>
        </div>
      </div>

      {/* Ticket List & Detail Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-medium">
              Aucun ticket ne correspond aux critères de recherche.
            </div>
          ) : (
            filteredTickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedTicket?.id === t.id
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{t.ticketNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                      t.priority === "Urgente"
                        ? "bg-red-500/20 text-red-600 dark:text-red-400"
                        : t.priority === "Haute"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>

                <div className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">{t.subject}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{t.schoolName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === "En attente"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : t.status === "En cours"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Ticket Details */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {selectedTicket.ticketNumber}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, "Résolu")}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer"
                    >
                      Marquer Résolu
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, "Clôturé")}
                      className="px-3 py-1 bg-slate-800 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer"
                    >
                      Clôturer
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedTicket.subject}</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div><strong className="text-slate-700 dark:text-slate-300">Établissement :</strong> {selectedTicket.schoolName}</div>
                  <div><strong className="text-slate-700 dark:text-slate-300">Expéditeur :</strong> {selectedTicket.senderName} ({selectedTicket.senderRole})</div>
                  <div><strong className="text-slate-700 dark:text-slate-300">Catégorie :</strong> {selectedTicket.category}</div>
                  <div><strong className="text-slate-700 dark:text-slate-300">Créé le :</strong> {selectedTicket.createdAt}</div>
                  <div><strong className="text-slate-700 dark:text-slate-300">Responsable :</strong> {selectedTicket.assignedAgent}</div>
                  <div><strong className="text-slate-700 dark:text-slate-300">Durée :</strong> {selectedTicket.resolutionTime}</div>
                </div>
              </div>

              {/* Thread */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {selectedTicket.comments.map(c => (
                  <div
                    key={c.id}
                    className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                      c.isOwner
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 ml-6"
                        : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mr-6"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{c.author} <span className="text-[10px] text-indigo-600 font-mono">({c.role})</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">{c.timestamp}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Rédiger une réponse officielle du Propriétaire SaaS..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleAddComment(selectedTicket.id)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl flex items-center space-x-2 cursor-pointer transition-all shadow-md"
                  >
                    <Send className="h-4 w-4" />
                    <span>Envoyer la Réponse Officielle</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
              <MessageSquare className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Sélectionnez un ticket dans la liste pour afficher le dossier complet et répondre.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
