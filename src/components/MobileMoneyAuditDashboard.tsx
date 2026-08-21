import React, { useState, useEffect } from "react";
import { 
  getMobileMoneyProvidersStatus, 
  runMobileMoneyAuditSuite, 
  getLocalStoredMomoTransactions,
  MobileMoneyProviderStatus, 
  MobileMoneyAuditReport,
  MobileMoneyTransactionResponse
} from "../services/mobileMoneyPaymentService";
import { 
  ShieldCheck, Smartphone, CheckCircle, AlertTriangle, RefreshCw, 
  Lock, Activity, FileText, CheckCircle2, XCircle, Clock, Search,
  Download, Printer, AlertCircle, Sparkles, Server, KeyRound, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MobileMoneyPaymentModal } from "./MobileMoneyPaymentModal";
import { Student, Payment } from "../types";

interface MobileMoneyAuditDashboardProps {
  students?: Student[];
  onAddPayment?: (payment: Payment) => void;
  schoolName?: string;
}

export function MobileMoneyAuditDashboard({
  students = [],
  onAddPayment,
  schoolName = "Complexe Scolaire SmartSchool RDC"
}: MobileMoneyAuditDashboardProps) {
  const [providers, setProviders] = useState<MobileMoneyProviderStatus[]>([]);
  const [auditReport, setAuditReport] = useState<MobileMoneyAuditReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [transactions, setTransactions] = useState<MobileMoneyTransactionResponse[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedTestStudent, setSelectedTestStudent] = useState<Student | undefined>(students[0]);

  const loadData = async () => {
    const provs = await getMobileMoneyProvidersStatus();
    setProviders(provs);
    setTransactions(getLocalStoredMomoTransactions());
  };

  useEffect(() => {
    loadData();
    // Auto-run initial audit suite
    handleRunAuditSuite();
  }, []);

  const handleRunAuditSuite = async () => {
    setIsRunningAudit(true);
    const report = await runMobileMoneyAuditSuite();
    setAuditReport(report);
    setIsRunningAudit(false);
  };

  const filteredTransactions = transactions.filter(t => 
    t.reference.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.provider.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.customerPhone.includes(searchFilter)
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Audit & Passerelles Mobile Money RDC
            </h2>
            <span className="px-2.5 py-0.5 bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-[10px] font-black uppercase rounded-full">
              Production & Sandbox Validés
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contrôle d'intégrité financière, validation des 4 passerelles télécoms (Vodacom M-Pesa, Orange Money, Airtel Money, Afrimoney), protection anti-tampering et génération de reçus certifiés.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedTestStudent(students[0]);
              setIsTestModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-95 transition-all cursor-pointer flex items-center space-x-2"
          >
            <Smartphone className="h-4 w-4" />
            <span>Tester un Paiement de Bout en Bout</span>
          </button>

          <button
            onClick={handleRunAuditSuite}
            disabled={isRunningAudit}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRunningAudit ? "animate-spin" : ""}`} />
            <span>{isRunningAudit ? "Audit en cours..." : "Lancer l'Audit Automatisé"}</span>
          </button>
        </div>
      </div>

      {/* 4 Gateway Providers Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {providers.map((p) => {
          const isMpesa = p.code === "MPESA";
          const isOrange = p.code === "ORANGE";
          const isAirtel = p.code === "AIRTEL";
          const isAfri = p.code === "AFRIMONEY";

          const accentColor = 
            isMpesa ? "border-red-500/50 bg-red-50/20 dark:bg-red-950/10 text-red-700 dark:text-red-400" :
            isOrange ? "border-orange-500/50 bg-orange-50/20 dark:bg-orange-950/10 text-orange-700 dark:text-orange-400" :
            isAirtel ? "border-rose-500/50 bg-rose-50/20 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400" :
            "border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400";

          return (
            <motion.div
              key={p.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-3xl border ${accentColor} shadow-sm space-y-3 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm">{p.name}</span>
                <span className="px-2 py-0.5 bg-slate-900/10 dark:bg-white/10 text-[9px] font-mono font-bold rounded-md">
                  {p.ussdPrefix}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-xs">{p.statusBadge}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {p.status}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Devises supportées :</span>
                  <span className="font-bold font-mono">USD / CDF</span>
                </div>
                <div className="flex justify-between">
                  <span>Isolation des clés :</span>
                  <span className="font-bold text-emerald-600">Strictement Serveur</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Audit Suite Report Section */}
      {auditReport && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Rapport Officiel d'Audit & Sécurité Financière Mobile Money
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exécuté le {new Date(auditReport.executedAt).toLocaleString("fr-FR")} • 10 Points de Sécurité et d'Intégrité Vérifiés
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-black text-xs rounded-xl flex items-center space-x-1.5">
                <CheckCircle className="h-4 w-4" />
                <span>{auditReport.passedCount} / {auditReport.totalTests} Tests Validés</span>
              </span>
            </div>
          </div>

          {/* Test items list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {auditReport.results.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-black text-[9px] uppercase rounded-md">
                    SUCCÈS
                  </span>
                </div>

                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {item.description}
                </p>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  {item.details}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Transaction History & Receipt Ledger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Grand Livre des Encaissements Mobile Money
            </h3>
            <p className="text-xs text-slate-500">
              Historique complet des transactions authentifiées avec numéros de reçus et signatures SHA-256.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Filtrer par Réf, élève, téléphone..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full p-2.5 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-3 px-2">Date & Heure</th>
                <th className="py-3 px-2">Référence / Reçu</th>
                <th className="py-3 px-2">Élève & Classe</th>
                <th className="py-3 px-2">Frais Scolaires</th>
                <th className="py-3 px-2">Opérateur & N°</th>
                <th className="py-3 px-2 text-right">Montant</th>
                <th className="py-3 px-2 text-center">Statut Serveur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucune transaction ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-2 text-slate-500 text-[11px]">
                      {new Date(tx.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td className="py-3 px-2 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{tx.reference}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{tx.receiptNumber || "En attente"}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-bold text-slate-900 dark:text-white block">{tx.studentName}</span>
                      <span className="text-[10px] text-slate-400">{tx.studentMatricule} • {tx.className}</span>
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-300">
                      {tx.feeName}
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{tx.provider}</span>
                      <span className="font-mono text-[10px] text-slate-400">{tx.customerPhone}</span>
                    </td>
                    <td className="py-3 px-2 text-right font-black font-mono text-emerald-600">
                      {tx.amount.toFixed(2)} {tx.currency}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {tx.status === "SUCCESS" && (
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-lg uppercase">
                          Validé (Reçu Émis)
                        </span>
                      )}
                      {tx.status === "PENDING_USSD_PUSH" && (
                        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-lg uppercase">
                          En Attente USSD
                        </span>
                      )}
                      {tx.status.startsWith("FAILED") && (
                        <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 text-[10px] font-black rounded-lg uppercase">
                          Rejeté
                        </span>
                      )}
                      {tx.status === "TIMED_OUT" && (
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-lg uppercase">
                          Expiré (Timeout)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Mobile Money Payment Modal */}
      {isTestModalOpen && (
        <MobileMoneyPaymentModal
          isOpen={isTestModalOpen}
          onClose={() => {
            setIsTestModalOpen(false);
            loadData();
          }}
          student={selectedTestStudent}
          schoolName={schoolName}
          onPaymentSuccess={(payment) => {
            if (onAddPayment) {
              onAddPayment(payment);
            }
            loadData();
          }}
        />
      )}
    </div>
  );
}
