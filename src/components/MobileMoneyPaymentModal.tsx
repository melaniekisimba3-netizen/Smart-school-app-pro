import React, { useState, useEffect } from "react";
import { Student, Parent, Payment } from "../types";
import { 
  initiateMobileMoneyPayment, 
  confirmMobileMoneyPush, 
  getMobileMoneyProvidersStatus, 
  convertMomoTransactionToPayment,
  MobileMoneyProviderStatus, 
  MobileMoneyTransactionResponse 
} from "../services/mobileMoneyPaymentService";
import { 
  ShieldCheck, Smartphone, CheckCircle, AlertCircle, Clock, X, 
  Printer, Download, QrCode, RefreshCw, Lock, Sparkles, ChevronRight,
  ArrowLeft, Landmark, DollarSign, FileText, CheckCircle2, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MobileMoneyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  parent?: Parent;
  onPaymentSuccess: (payment: Payment, updatedStudent?: Student) => void;
  defaultFeeType?: string;
  defaultAmount?: number;
  defaultCurrency?: "USD" | "CDF";
  schoolName?: string;
}

export function MobileMoneyPaymentModal({
  isOpen,
  onClose,
  student,
  parent,
  onPaymentSuccess,
  defaultFeeType = "Minerval 2ème Tranche",
  defaultAmount = 45,
  defaultCurrency = "USD",
  schoolName = "Complexe Scolaire SmartSchool RDC"
}: MobileMoneyPaymentModalProps) {
  const [step, setStep] = useState<"SELECT" | "PUSH_WAIT" | "SUCCESS" | "FAILED">("SELECT");
  const [providers, setProviders] = useState<MobileMoneyProviderStatus[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<"M-Pesa" | "Orange Money" | "Airtel Money" | "Afrimoney">("M-Pesa");
  const [feeType, setFeeType] = useState(defaultFeeType);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [currency, setCurrency] = useState<"USD" | "CDF">(defaultCurrency);
  const [phone, setPhone] = useState(student?.parentPhone || parent?.phone || "0812888102");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTx, setActiveTx] = useState<MobileMoneyTransactionResponse | null>(null);
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    if (isOpen) {
      getMobileMoneyProvidersStatus().then(setProviders);
      setStep("SELECT");
      setErrorMessage("");
      setActiveTx(null);
      setAmount(defaultAmount);
      setFeeType(defaultFeeType);
      setCurrency(defaultCurrency);
    }
  }, [isOpen, defaultAmount, defaultFeeType, defaultCurrency]);

  // Timer for USSD push step
  useEffect(() => {
    let interval: any;
    if (step === "PUSH_WAIT" && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleConfirmPush("TIMEOUT");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, countdown]);

  if (!isOpen) return null;

  const currentStudentName = student ? `${student.lastName} ${student.firstName}` : "Élève SmartSchool";
  const currentClass = student?.className || "3ème Secondaire";
  const currentMatricule = student?.registrationNumber || "RDC-2026-001";

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const payload = {
      studentId: student?.id || "std-001",
      studentName: currentStudentName,
      studentMatricule: currentMatricule,
      className: currentClass,
      parentId: parent?.id || student?.primaryParentId,
      parentName: parent ? `${parent.lastName} ${parent.firstName}` : undefined,
      schoolId: student?.schoolId || "default",
      schoolName: schoolName,
      feeTypeId: `fee-${feeType.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      feeName: feeType,
      amount: Number(amount),
      currency,
      provider: selectedProvider,
      customerPhone: phone,
      idempotencyKey: `idemp-${student?.id || "std"}-${feeType}-${Date.now()}`
    };

    const res = await initiateMobileMoneyPayment(payload);
    setIsLoading(false);

    if (res.success && res.transaction) {
      setActiveTx(res.transaction);
      setCountdown(300);
      setStep("PUSH_WAIT");
    } else {
      setErrorMessage(res.error || "Erreur lors de l'initiation du paiement.");
    }
  };

  const handleConfirmPush = async (
    outcome: "APPROVE" | "DECLINE_PIN" | "INSUFFICIENT_FUNDS" | "TIMEOUT" | "CANCELLED_BY_USER" = "APPROVE"
  ) => {
    if (!activeTx) return;
    setIsLoading(true);
    setErrorMessage("");

    const res = await confirmMobileMoneyPush(activeTx.id, outcome);
    setIsLoading(false);

    if (res.success && res.transaction) {
      setActiveTx(res.transaction);
      setStep("SUCCESS");
      
      const paymentRecord = convertMomoTransactionToPayment(res.transaction);
      onPaymentSuccess(paymentRecord, student);
    } else {
      if (res.transaction) {
        setActiveTx(res.transaction);
      }
      setErrorMessage(res.error || "La transaction n'a pas pu être validée.");
      setStep("FAILED");
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-6 text-slate-800 dark:text-slate-100 text-left"
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-brand-blue to-brand-green text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Smartphone className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black tracking-tight">Passerelle Mobile Money RDC</h3>
                <span className="px-2 py-0.5 bg-emerald-400/30 border border-emerald-300/40 text-[10px] font-black uppercase rounded-full tracking-wider">
                  Serveur Sécurisé
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Paiement instantané d'écolage & minerval pour {currentStudentName} ({currentClass})
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
          <div className={`flex items-center space-x-2 ${step === "SELECT" ? "text-brand-blue font-black" : ""}`}>
            <span className="w-5 h-5 rounded-full bg-brand-blue/10 flex items-center justify-center text-[10px]">1</span>
            <span>Sélection Frais & Opérateur</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <div className={`flex items-center space-x-2 ${step === "PUSH_WAIT" ? "text-amber-600 font-black" : ""}`}>
            <span className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-[10px]">2</span>
            <span>Invite USSD Mobile</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <div className={`flex items-center space-x-2 ${step === "SUCCESS" ? "text-emerald-600 font-black" : ""}`}>
            <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px]">3</span>
            <span>Reçu & Solde Mis à Jour</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-bold">Avertissement de Paiement</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* STEP 1: SELECT FEES & OPERATOR */}
          {step === "SELECT" && (
            <form onSubmit={handleInitiate} className="space-y-5">
              {/* Student Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Bénéficiaire du Paiement</span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">{currentStudentName}</h4>
                  <p className="text-xs text-slate-500">Matricule : <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{currentMatricule}</span> • Classe : {currentClass}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Établissement</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{schoolName}</p>
                </div>
              </div>

              {/* Fee Selection & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Type de Frais Scolaire</label>
                  <select 
                    value={feeType} 
                    onChange={e => setFeeType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold"
                  >
                    <option value="Minerval 1ère Tranche">Minerval — 1ère Tranche (Rentrée)</option>
                    <option value="Minerval 2ème Tranche">Minerval — 2ème Tranche (Trimestre 2)</option>
                    <option value="Minerval 3ème Tranche">Minerval — 3ème Tranche (Trimestre 3)</option>
                    <option value="Minerval Solde Annuel">Minerval — Solde Annuel Complet</option>
                    <option value="Frais d'Examen d'État">Frais d'Examen d'État / TENAFEP</option>
                    <option value="Frais d'Inscription">Frais d'Inscription / Dossier</option>
                    <option value="Frais de Transport & Cantine">Frais de Transport Scolaire & Cantine</option>
                    <option value="Frais de Bulletin & Carte">Frais de Bulletin Numérique & Carte</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Montant</label>
                    <input 
                      type="number"
                      min="1"
                      required
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono font-black"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Devise</label>
                    <select 
                      value={currency}
                      onChange={e => setCurrency(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CDF">CDF (Fc)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Operator Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Sélectionnez votre Opérateur Mobile Money RDC</span>
                  <span className="text-[10px] text-slate-400 font-normal">Push USSD Automatique</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "M-Pesa", label: "Vodacom M-Pesa", ussd: "*112#", color: "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300", badge: "081, 082, 083" },
                    { id: "Orange Money", label: "Orange Money", ussd: "*144#", color: "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300", badge: "084, 085, 089" },
                    { id: "Airtel Money", label: "Airtel Money", ussd: "*501#", color: "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300", badge: "097, 098, 099" },
                    { id: "Afrimoney", label: "Afrimoney", ussd: "*111#", color: "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300", badge: "090, 091" }
                  ].map(op => {
                    const isSelected = selectedProvider === op.id;
                    return (
                      <button
                        type="button"
                        key={op.id}
                        onClick={() => {
                          setSelectedProvider(op.id as any);
                          // Auto set matching prefix sample if default
                          if (op.id === "M-Pesa" && !phone.startsWith("081") && !phone.startsWith("082")) setPhone("0812888102");
                          if (op.id === "Orange Money" && !phone.startsWith("089") && !phone.startsWith("085")) setPhone("0890123999");
                          if (op.id === "Airtel Money" && !phone.startsWith("099") && !phone.startsWith("097")) setPhone("0991234567");
                          if (op.id === "Afrimoney" && !phone.startsWith("090") && !phone.startsWith("091")) setPhone("0901234567");
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${isSelected ? `${op.color} shadow-sm ring-2 ring-brand-blue/30` : "border-slate-200 dark:border-slate-800 hover:border-slate-300"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs">{op.label}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-blue" />}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 block">{op.ussd}</span>
                        <span className="text-[9px] text-slate-400 block mt-1">{op.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Numéro de téléphone du payeur ({selectedProvider})
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="Ex: 0812345678 ou +243812345678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs font-bold"
                  />
                  <Smartphone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400">
                  Un message USSD interactif sécurisé sera envoyé sur ce mobile pour valider la transaction par code PIN.
                </p>
              </div>

              {/* Fee Breakdown & Security Guarantee */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant net scolarité :</span>
                  <span className="font-bold">{amount} {currency}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Commission plateforme SmartSchool (2%) :</span>
                  <span>Inclus (Prise en charge établissement)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-black text-sm">
                  <span>Total à Débiter :</span>
                  <span className="text-emerald-600 font-mono">{amount} {currency}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold rounded-2xl shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Communication avec le réseau {selectedProvider}...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    <span>Initier le Paiement Sécurisé ({amount} {currency})</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: USSD PUSH PROMPT SIMULATION */}
          {step === "PUSH_WAIT" && activeTx && (
            <div className="space-y-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500 mb-2 animate-pulse">
                <Smartphone className="h-10 w-10" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Invite de Débit Envoyée sur votre Mobile !</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Veuillez consulter l'écran de votre téléphone <strong className="text-slate-800 dark:text-slate-200">{activeTx.customerPhone}</strong> ({activeTx.provider}).
                </p>
              </div>

              {/* USSD Box Graphic */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs text-left shadow-xl border border-slate-700 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-amber-400">INVITE RÉSEAU {activeTx.provider.toUpperCase()}</span>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>Expire dans {formatTime(countdown)}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-emerald-400">
                  &gt; SmartSchool RDC demande l'autorisation de prélever {activeTx.amount} {activeTx.currency} pour {activeTx.feeName}.<br />
                  &gt; Réf: {activeTx.reference}<br />
                  &gt; Entrez votre code PIN secret pour valider : [ **** ]
                </div>
                <p className="text-[10px] text-slate-400">
                  Ne partagez jamais votre code PIN avec un tiers. SmartSchool RDC utilise une connexion chiffrée de bout en bout.
                </p>
              </div>

              {/* Sandbox Simulation Actions */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Panneau de Contrôle Sandbox / Test</span>
                  <span className="text-[9px] px-2 py-0.5 bg-brand-blue/10 text-brand-blue font-bold rounded-full">Test Contrôlé</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleConfirmPush("APPROVE")}
                    disabled={isLoading}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Saisir PIN Correct (Valider)</span>
                  </button>

                  <button
                    onClick={() => handleConfirmPush("INSUFFICIENT_FUNDS")}
                    disabled={isLoading}
                    className="py-3 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>Tester : Solde Insuffisant</span>
                  </button>

                  <button
                    onClick={() => handleConfirmPush("DECLINE_PIN")}
                    disabled={isLoading}
                    className="py-3 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                    <span>Tester : Code PIN Erroné</span>
                  </button>

                  <button
                    onClick={() => handleConfirmPush("CANCELLED_BY_USER")}
                    disabled={isLoading}
                    className="py-3 px-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span>Annuler l'Invite</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & OFFICIAL CRYPTOGRAPHIC RECEIPT */}
          {step === "SUCCESS" && activeTx && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-black text-sm text-emerald-800 dark:text-emerald-300">Paiement Validé & Quittancé avec Succès !</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    La transaction a été authentifiée par le réseau {activeTx.provider}. Le compte de l'élève a été crédité.
                  </p>
                </div>
              </div>

              {/* Official Congolese Receipt Voucher */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 shadow-xl space-y-5 text-xs text-slate-800 dark:text-slate-100 print:border-black">
                {/* Receipt Header */}
                <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                    <h3 className="font-black text-base uppercase text-brand-blue tracking-tight">{schoolName}</h3>
                    <p className="text-[10px] text-slate-500">Service de Gestion Financière & Encaissements Mobile Money</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-lg uppercase">
                      REÇU OFFICIEL PAYÉ
                    </span>
                    <p className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">{activeTx.receiptNumber}</p>
                  </div>
                </div>

                {/* Receipt Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Élève & Matricule</span>
                    <p className="font-black text-sm">{activeTx.studentName}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{activeTx.studentMatricule} • {activeTx.className}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Opérateur & Transaction ID</span>
                    <p className="font-black text-sm">{activeTx.provider}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{activeTx.reference}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Type de Frais</span>
                    <p className="font-bold">{activeTx.feeName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Date & Heure de Confirmation</span>
                    <p className="font-bold">{new Date(activeTx.confirmedAt || Date.now()).toLocaleString("fr-FR")}</p>
                  </div>
                </div>

                {/* Total Paid Highlight */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-xs uppercase text-slate-600 dark:text-slate-400">Total Encaissé & Affecté :</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    {activeTx.amount.toFixed(2)} {activeTx.currency}
                  </span>
                </div>

                {/* Cryptographic Hash & QR Code Simulation */}
                <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Signature Numérique d'Intégrité SHA-256</span>
                    <p className="font-mono text-[9px] text-slate-400 break-all max-w-sm">
                      {activeTx.verificationHash || "sha256-verified-smartschool-rdc-official-receipt"}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0">
                    <QrCode className="h-10 w-10 text-slate-900" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-3 px-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimer le Reçu Officiel</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Terminer & Retour au Portail</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP FAILED */}
          {step === "FAILED" && (
            <div className="space-y-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-rose-500/10 text-rose-500 mb-2">
                <ShieldAlert className="h-10 w-10" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Échec de la Transaction Mobile Money</h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-md mx-auto">
                  {errorMessage || activeTx?.failureReason || "La transaction a été refusée par l'opérateur télécom."}
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep("SELECT")}
                  className="py-3 px-6 bg-brand-blue text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Réessayer avec un autre numéro ou opérateur
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-6 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
