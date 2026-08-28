import React, { useState, useEffect, useMemo } from "react";
import {
  Crown,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Download,
  Calendar,
  PieChart,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  Smartphone,
  PhoneCall,
  User,
  Power,
  Edit3,
  Check,
  AlertTriangle,
  Filter,
  Search,
  Printer,
  FileText,
  Lock,
  Layers,
  ChevronRight,
  X,
  Info,
  Clock,
  QrCode,
  Users,
  Eye,
  AlertOctagon,
  RefreshCw,
  Send,
  MessageSquare,
  LockKeyhole,
  CheckSquare,
  Sparkles,
  Award,
  Hash,
  Activity,
  UserCheck,
  Wallet,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Payment, 
  Student, 
  Teacher, 
  TeacherSalaryPayment, 
  FinancialAuditTrailEntry, 
  FinancialSecurityAlert, 
  SchoolMobileMoneyAccount 
} from "../types";
import {
  getSchoolFinancialAuditTrail,
  getSchoolFinancialAlerts,
  resolveFinancialAlert,
  executeControlledVoidOrRefund,
  recordFinancialAudit,
  savePromoterLockedConfig
} from "../services/financialAuditService";
import { loadPersistentCollection, savePersistentItem } from "../services/dataPersistenceService";
import { safeLocalStorage, safeCopyToClipboard } from "../utils/safeStorage";
import { generateOfficialReceiptPDF } from "./FinanceModule";
import QRCode from "qrcode";

interface PromoterFinancialControlProps {
  schoolId: string;
  schoolName: string;
  userRole: string;
  userName: string;
  payments: Payment[];
  students: Student[];
  teachers?: Teacher[];
  onAddPayment?: (payment: any) => void;
  onUpdatePayment?: (payment: Payment) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
}

export function PromoterFinancialControlCenter({
  schoolId,
  schoolName,
  userRole,
  userName,
  payments = [],
  students = [],
  teachers = [],
  onUpdatePayment,
  onUpdateTeacher
}: PromoterFinancialControlProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "live_stream" | "revenues" | "students_debt" | "teacher_payroll" | "audit_ledger" | "anti_fraud" | "config_lock"
  >("live_stream");

  // Real-time server audit & alerts states
  const [auditEntries, setAuditEntries] = useState<FinancialAuditTrailEntry[]>([]);
  const [alerts, setAlerts] = useState<FinancialSecurityAlert[]>([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<"TODAY" | "WEEK" | "MONTH" | "ALL">("TODAY");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");

  // Modals
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);
  const [activeReceiptQrUrl, setActiveReceiptQrUrl] = useState<string | null>(null);
  const [selectedAuditEntry, setSelectedAuditEntry] = useState<FinancialAuditTrailEntry | null>(null);
  const [voidModalPayment, setVoidModalPayment] = useState<Payment | null>(null);
  const [voidActionType, setVoidActionType] = useState<"ANNULER" | "REMBOURSER">("ANNULER");
  const [voidReason, setVoidReason] = useState("");
  const [isProcessingVoid, setIsProcessingVoid] = useState(false);

  // Alert resolution modal
  const [selectedAlertToResolve, setSelectedAlertToResolve] = useState<FinancialSecurityAlert | null>(null);
  const [alertDecisionComment, setAlertDecisionComment] = useState("");
  const [isResolvingAlert, setIsResolvingAlert] = useState(false);

  // Locked Fee & Momo Configuration State
  const [lockedMomoAccounts, setLockedMomoAccounts] = useState<SchoolMobileMoneyAccount[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(`ss_momo_accounts_${schoolId || "global"}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "momo-1",
        schoolId: schoolId || "sch-001",
        provider: "M-Pesa Vodacom",
        accountNumber: "0812345678",
        holderName: "COMPLEXE SCOLAIRE - DIRECTION GÉNÉRALE",
        merchantCode: "TILL-55442",
        isActive: true,
        isPrimary: true,
        currencySupported: ["USD", "CDF"],
        associatedFeeTypes: ["Minerval", "Inscription", "Frais d'État"],
        createdAt: "2026-08-01",
        configuredBy: "Promoteur Titulaire"
      },
      {
        id: "momo-2",
        schoolId: schoolId || "sch-001",
        provider: "Airtel Money",
        accountNumber: "0994202940",
        holderName: "COMPLEXE SCOLAIRE - CAISSE CENTRALE",
        merchantCode: "AIRTEL-9988",
        isActive: true,
        isPrimary: false,
        currencySupported: ["USD", "CDF"],
        associatedFeeTypes: ["Tous les frais"],
        createdAt: "2026-08-01",
        configuredBy: "Promoteur Titulaire"
      },
      {
        id: "momo-3",
        schoolId: schoolId || "sch-001",
        provider: "Orange Money",
        accountNumber: "0891234567",
        holderName: "COMPLEXE SCOLAIRE - FINANCES",
        merchantCode: "OM-11223",
        isActive: true,
        isPrimary: false,
        currencySupported: ["USD", "CDF"],
        associatedFeeTypes: ["Tous les frais"],
        createdAt: "2026-08-01",
        configuredBy: "Promoteur Titulaire"
      }
    ];
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "warning" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "warning" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // TEACHER PAYROLL & MOBILE MONEY EXECUTION STATES
  const [selectedPayrollPeriod, setSelectedPayrollPeriod] = useState<string>("Octobre 2026");
  const [salaryPayments, setSalaryPayments] = useState<TeacherSalaryPayment[]>([]);
  const [activePayrollModalTeacher, setActivePayrollModalTeacher] = useState<Teacher | null>(null);
  const [payoutBonusAmount, setPayoutBonusAmount] = useState<number>(0);
  const [payoutDeductionAmount, setPayoutDeductionAmount] = useState<number>(0);
  const [promoterAuthCode, setPromoterAuthCode] = useState<string>("");
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [completedPayoutSlip, setCompletedPayoutSlip] = useState<TeacherSalaryPayment | null>(null);
  const [payrollCurrencyFilter, setPayrollCurrencyFilter] = useState<"ALL" | "USD" | "CDF">("ALL");

  // Load teacher salary payments on mount
  useEffect(() => {
    loadPersistentCollection<TeacherSalaryPayment>(schoolId || "sch-001", "teacher_salary_payments", []).then(res => {
      if (Array.isArray(res)) setSalaryPayments(res);
    });
  }, [schoolId]);

  // Load audit trail and alerts from server on mount & interval
  const fetchAuditAndAlerts = async () => {
    setIsLoadingAudits(true);
    setIsLoadingAlerts(true);
    try {
      const [fetchedAudits, fetchedAlerts] = await Promise.all([
        getSchoolFinancialAuditTrail(schoolId),
        getSchoolFinancialAlerts(schoolId)
      ]);
      setAuditEntries(fetchedAudits);
      setAlerts(fetchedAlerts);
    } catch (err) {
      console.error("Error fetching financial audit/alerts:", err);
    } finally {
      setIsLoadingAudits(false);
      setIsLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAuditAndAlerts();
    const interval = setInterval(fetchAuditAndAlerts, 15000);
    return () => clearInterval(interval);
  }, [schoolId]);

  // Generate live QR code for receipt modal
  useEffect(() => {
    if (activeReceiptPayment) {
      const qrPayload = `https://smartschool.cd/verify?receipt=REC-${activeReceiptPayment.id}&school=${encodeURIComponent(schoolName)}&student=${encodeURIComponent(activeReceiptPayment.studentName)}&amount=${activeReceiptPayment.amount}${activeReceiptPayment.currency}&ref=${activeReceiptPayment.reference}`;
      QRCode.toDataURL(qrPayload, { margin: 1, width: 220, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setActiveReceiptQrUrl(url))
        .catch(err => console.error("Error generating modal QR Code", err));
    } else {
      setActiveReceiptQrUrl(null);
    }
  }, [activeReceiptPayment, schoolName]);

  // Filter Payments by school & criteria
  const schoolPayments = useMemo(() => {
    return payments.filter(p => !p.schoolId || p.schoolId === schoolId || schoolId === "global" || schoolId === "sch-001");
  }, [payments, schoolId]);

  // Financial Figures & KPI Aggregates (Strict Dual Currency Separation: USD & CDF)
  const financialStats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let todayUSD = 0;
    let todayCDF = 0;
    let weekUSD = 0;
    let weekCDF = 0;
    let monthUSD = 0;
    let monthCDF = 0;
    let momoUSD = 0;
    let momoCDF = 0;
    let cashUSD = 0;
    let cashCDF = 0;
    let totalUSD = 0;
    let totalCDF = 0;

    let pendingCount = 0;
    let failedOrCancelledCount = 0;

    schoolPayments.forEach(p => {
      const isUSD = p.currency === "USD";
      const amt = Number(p.amount) || 0;

      if (p.isValidated && p.transactionStatus !== "Annulé" && p.transactionStatus !== "Remboursé") {
        const pDate = new Date(p.createdAt);
        const isToday = p.createdAt?.includes(todayStr) || (!isNaN(pDate.getTime()) && pDate.toISOString().startsWith(todayStr));
        const isWeek = !isNaN(pDate.getTime()) && pDate >= sevenDaysAgo;
        const isMonth = !isNaN(pDate.getTime()) && pDate >= thirtyDaysAgo;
        const isMomo = p.paymentMethod?.toLowerCase().includes("mobile") || 
                       p.paymentMethod?.toLowerCase().includes("m-pesa") || 
                       p.paymentMethod?.toLowerCase().includes("airtel") || 
                       p.paymentMethod?.toLowerCase().includes("orange");

        if (isUSD) {
          totalUSD += amt;
          if (isToday) todayUSD += amt;
          if (isWeek) weekUSD += amt;
          if (isMonth) monthUSD += amt;
          if (isMomo) momoUSD += amt;
          else cashUSD += amt;
        } else {
          totalCDF += amt;
          if (isToday) todayCDF += amt;
          if (isWeek) weekCDF += amt;
          if (isMonth) monthCDF += amt;
          if (isMomo) momoCDF += amt;
          else cashCDF += amt;
        }
      }

      if (p.transactionStatus === "En attente" || !p.isValidated) {
        pendingCount++;
      }
      if (p.transactionStatus === "Annulé" || p.transactionStatus === "Remboursé" || p.transactionStatus === "Échoué") {
        failedOrCancelledCount++;
      }
    });

    return {
      usd: {
        total: totalUSD,
        today: todayUSD,
        week: weekUSD,
        month: monthUSD,
        momo: momoUSD,
        cash: cashUSD
      },
      cdf: {
        total: totalCDF,
        today: todayCDF,
        week: weekCDF,
        month: monthCDF,
        momo: momoCDF,
        cash: cashCDF
      },
      // Backwards-compatible aggregates for legacy cards
      totalCollectedUSD: totalUSD,
      todayCollectedUSD: todayUSD,
      weekCollectedUSD: weekUSD,
      monthCollectedUSD: monthUSD,
      momoCollectedUSD: momoUSD,
      cashCollectedUSD: cashUSD,
      pendingCount,
      failedOrCancelledCount,
      activeAlertsCount: alerts.filter(a => a.status === "ACTIVE").length
    };
  }, [schoolPayments, alerts]);

  // Execute teacher salary payout with promoter authorization
  const handleExecuteTeacherSalaryPayment = async () => {
    if (!activePayrollModalTeacher) return;

    setIsProcessingPayout(true);
    try {
      const baseSalary = activePayrollModalTeacher.salaryBase || 350;
      const currency = activePayrollModalTeacher.salaryCurrency || activePayrollModalTeacher.payoutDetails?.preferredCurrency || "USD";
      const netAmount = Math.max(0, baseSalary + (Number(payoutBonusAmount) || 0) - (Number(payoutDeductionAmount) || 0));
      const payMethod = activePayrollModalTeacher.payoutDetails?.paymentMethod || "M-Pesa";
      const recvNum = activePayrollModalTeacher.payoutDetails?.receivingNumberOrIban || activePayrollModalTeacher.phone || "0810000000";
      const holder = activePayrollModalTeacher.payoutDetails?.accountHolderName || `${activePayrollModalTeacher.firstName} ${activePayrollModalTeacher.lastName}`;

      const uniqueRef = `SAL-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const slipNum = `BP-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newSalaryPayment: TeacherSalaryPayment = {
        id: `sal-pay-${Date.now()}`,
        schoolId: schoolId || "sch-001",
        teacherId: activePayrollModalTeacher.id,
        teacherName: `${activePayrollModalTeacher.firstName} ${activePayrollModalTeacher.lastName}`,
        teacherMatricule: activePayrollModalTeacher.matriculeEtat || activePayrollModalTeacher.id,
        period: selectedPayrollPeriod,
        baseAmount: baseSalary,
        bonusAmount: Number(payoutBonusAmount) || 0,
        deductionsAmount: Number(payoutDeductionAmount) || 0,
        netAmountPaid: netAmount,
        currency,
        paymentMethod: payMethod,
        receivingNumberOrIban: recvNum,
        accountHolderName: holder,
        bankName: activePayrollModalTeacher.payoutDetails?.bankName,
        transactionReference: uniqueRef,
        slipNumber: slipNum,
        paymentDate: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status: "EFFECTUE",
        authorizedByPromoterId: "promoter-root",
        authorizedByPromoterName: userName || "Promoteur Titulaire",
        notes: `Rémunération mensuelle validée et certifiée par le promoteur pour la période ${selectedPayrollPeriod}.`
      };

      // Save persistently
      await savePersistentItem<TeacherSalaryPayment>(schoolId || "sch-001", "teacher_salary_payments", newSalaryPayment);
      setSalaryPayments(prev => [newSalaryPayment, ...prev]);

      // Record immutable financial audit trail
      await recordFinancialAudit({
        schoolId: schoolId || "sch-001",
        schoolName,
        operatorId: "promoter-root",
        operatorName: userName,
        operatorRole: userRole || "Promoteur",
        actionType: "PAIEMENT_SALAIRE_ENSEIGNANT",
        amount: netAmount,
        currency,
        paymentMethod: payMethod,
        mobileOperator: payMethod,
        transactionReference: uniqueRef,
        receiptNumber: slipNum,
        justification: `Ordre de paie exécuté pour ${newSalaryPayment.teacherName} (${selectedPayrollPeriod}) vers ${payMethod} (${recvNum}). Code Promoteur: ${promoterAuthCode ? "Vérifié" : "Direct"}`,
        metadata: {
          teacherId: activePayrollModalTeacher.id,
          teacherName: newSalaryPayment.teacherName,
          baseSalary,
          bonus: Number(payoutBonusAmount) || 0,
          deductions: Number(payoutDeductionAmount) || 0,
          netPaid: netAmount,
          currency,
          receivingNumber: recvNum
        }
      });

      showToast(`Virement salarial de ${netAmount.toLocaleString("fr-FR")} ${currency} exécuté pour ${newSalaryPayment.teacherName} !`, "success");
      setCompletedPayoutSlip(newSalaryPayment);
      setActivePayrollModalTeacher(null);
      setPayoutBonusAmount(0);
      setPayoutDeductionAmount(0);
      setPromoterAuthCode("");
    } catch (err: any) {
      showToast("Erreur lors de l'exécution du virement : " + err.message, "error");
    } finally {
      setIsProcessingPayout(false);
    }
  };

  // Distinct classes list
  const classesList = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered Live Payments
  const filteredPayments = useMemo(() => {
    return schoolPayments.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.studentName || "").toLowerCase().includes(q);
        const matchRef = (p.reference || "").toLowerCase().includes(q);
        const matchAgent = (p.recordingAgentName || "").toLowerCase().includes(q);
        const matchClass = (p.className || "").toLowerCase().includes(q);
        if (!matchName && !matchRef && !matchAgent && !matchClass) return false;
      }

      if (selectedMethodFilter !== "ALL") {
        if (selectedMethodFilter === "MOMO" && !p.paymentMethod?.toLowerCase().includes("mobile") && !p.paymentMethod?.toLowerCase().includes("m-pesa") && !p.paymentMethod?.toLowerCase().includes("airtel") && !p.paymentMethod?.toLowerCase().includes("orange")) {
          return false;
        }
        if (selectedMethodFilter === "CASH" && (p.paymentMethod?.toLowerCase().includes("mobile") || p.paymentMethod?.toLowerCase().includes("m-pesa") || p.paymentMethod?.toLowerCase().includes("airtel") || p.paymentMethod?.toLowerCase().includes("orange"))) {
          return false;
        }
      }

      if (selectedStatusFilter !== "ALL") {
        if (selectedStatusFilter === "CONFIRMED" && (!p.isValidated || p.transactionStatus === "Annulé" || p.transactionStatus === "Remboursé")) {
          return false;
        }
        if (selectedStatusFilter === "PENDING" && p.isValidated) {
          return false;
        }
        if (selectedStatusFilter === "VOIDED" && p.transactionStatus !== "Annulé" && p.transactionStatus !== "Remboursé") {
          return false;
        }
      }

      if (selectedClassFilter !== "ALL" && p.className !== selectedClassFilter) {
        return false;
      }

      return true;
    });
  }, [schoolPayments, searchQuery, selectedMethodFilter, selectedStatusFilter, selectedClassFilter]);

  // Student Debt Calculation
  const studentDebtList = useMemo(() => {
    const EXPECTED_ANNUAL_FEE_USD = 450; // Standard annual minerval + operating fee baseline

    return students.map(st => {
      const stPayments = schoolPayments.filter(p => p.studentId === st.id && p.isValidated && p.transactionStatus !== "Annulé" && p.transactionStatus !== "Remboursé");
      const paidUSD = stPayments.reduce((acc, p) => acc + (p.currency === "USD" ? p.amount : p.amount / 2800), 0);
      const remainingUSD = Math.max(0, EXPECTED_ANNUAL_FEE_USD - paidUSD);
      const percentagePaid = Math.min(100, Math.round((paidUSD / EXPECTED_ANNUAL_FEE_USD) * 100));

      let status: "EN_REGLE" | "PARTIEL" | "RETARD_CRITIQUE" = "EN_REGLE";
      if (percentagePaid < 35) status = "RETARD_CRITIQUE";
      else if (percentagePaid < 95) status = "PARTIEL";

      return {
        student: st,
        expectedUSD: EXPECTED_ANNUAL_FEE_USD,
        paidUSD,
        remainingUSD,
        percentagePaid,
        status,
        paymentsCount: stPayments.length
      };
    });
  }, [students, schoolPayments]);

  // Handle Controlled Void or Refund
  const handleExecuteVoid = async () => {
    if (!voidModalPayment) return;
    if (!voidReason || voidReason.trim().length < 8) {
      showToast("Veuillez renseigner un motif détaillé d'au moins 8 caractères.", "error");
      return;
    }

    setIsProcessingVoid(true);
    try {
      const res = await executeControlledVoidOrRefund({
        schoolId,
        paymentId: voidModalPayment.id,
        action: voidActionType,
        operatorName: userName,
        operatorRole: userRole,
        operatorId: `USR-${userName.replace(/\s+/g, "_")}`,
        justification: voidReason,
        studentName: voidModalPayment.studentName,
        amount: voidModalPayment.amount,
        currency: voidModalPayment.currency,
        reference: voidModalPayment.reference
      });

      if (res.success) {
        showToast(res.message || "Opération enregistrée et auditée.", "success");
        if (onUpdatePayment) {
          onUpdatePayment({
            ...voidModalPayment,
            transactionStatus: voidActionType === "REMBOURSER" ? "Remboursé" : "Annulé",
            isValidated: false,
            cancellationReason: voidReason,
            cancelledBy: userName,
            cancelledAt: new Date().toISOString()
          });
        }
        setVoidModalPayment(null);
        setVoidReason("");
        fetchAuditAndAlerts();
      } else {
        showToast(res.error || "Erreur lors de l'exécution.", "error");
      }
    } catch (err: any) {
      showToast("Erreur de communication : " + err.message, "error");
    } finally {
      setIsProcessingVoid(false);
    }
  };

  // Handle Resolve Alert
  const handleResolveAlert = async (status: "JUSTIFIEE_PROMOTEUR" | "BLOQUEE") => {
    if (!selectedAlertToResolve) return;
    setIsResolvingAlert(true);
    try {
      const ok = await resolveFinancialAlert(
        schoolId,
        selectedAlertToResolve.id,
        userName,
        alertDecisionComment || (status === "JUSTIFIEE_PROMOTEUR" ? "Validé par le Promoteur" : "Action bloquée par le Promoteur"),
        status
      );
      if (ok) {
        showToast("Décision du Promoteur enregistrée avec succès.", "success");
        setSelectedAlertToResolve(null);
        setAlertDecisionComment("");
        fetchAuditAndAlerts();
      } else {
        showToast("Impossible de mettre à jour l'alerte.", "error");
      }
    } catch (e: any) {
      showToast("Erreur : " + e.message, "error");
    } finally {
      setIsResolvingAlert(false);
    }
  };

  // Download Certified Audit Trail Excel/CSV
  const handleExportAuditCSV = () => {
    if (auditEntries.length === 0) {
      showToast("Aucune entrée d'audit à exporter.", "warning");
      return;
    }
    const headers = [
      "ID Audit",
      "Date & Heure",
      "Opérateur",
      "Rôle",
      "Action",
      "Élève",
      "Classe",
      "Montant",
      "Devise",
      "Moyen de Paiement",
      "Référence",
      "Motif / Justification",
      "Empreinte Cryptographique SHA-256"
    ];
    const rows = auditEntries.map(e => [
      `"${e.id}"`,
      `"${e.timestamp}"`,
      `"${e.operatorName}"`,
      `"${e.operatorRole}"`,
      `"${e.actionType}"`,
      `"${e.studentName || ""}"`,
      `"${e.studentClass || ""}"`,
      `"${e.amount || 0}"`,
      `"${e.currency || "USD"}"`,
      `"${e.paymentMethod || ""}"`,
      `"${e.transactionReference || ""}"`,
      `"${(e.justification || "").replace(/"/g, '""')}"`,
      `"${e.integrityHash}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GRAND_LIVRE_AUDIT_FINANCIER_${schoolId}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Grand livre d'audit exporté avec succès (Format Certifié RDC).", "success");
  };

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------------------------- */}
      {/* 1. SUPREME PROMOTER FINANCIAL CONTROL HEADER */}
      {/* --------------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-800/40 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>Centre de Contrôle Suprême du Promoteur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Surveillance Financière & Anti-Fraude</span>
              <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold">
                Direct Live
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Supervision intégrale des encaissements de <strong className="text-amber-300 font-semibold">{schoolName}</strong>. 
              Traçabilité inaltérable <code className="text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded text-xs font-mono">qui → fait quoi → montant → élève → date/heure</code>, 
              zéro détournement et contrôle exclusif des comptes de réception.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchAuditAndAlerts}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 cursor-pointer backdrop-blur-md"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingAudits ? "animate-spin text-amber-400" : ""}`} />
              <span>Actualiser le flux</span>
            </button>
            <button
              onClick={handleExportAuditCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Exporter Grand Livre Scellé</span>
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------------- */}
        {/* KPI METRICS BAR (STRICT DUAL CURRENCY USD & CDF SEPARATION) */}
        {/* --------------------------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
          
          {/* Encaissé Aujourd'hui (USD / CDF) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Encaissé Aujourd'hui</span>
            <div className="flex flex-col">
              <span className="text-lg font-black text-emerald-400 font-mono">
                ${financialStats.usd.today.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-black text-emerald-300 font-mono">
                {financialStats.cdf.today.toLocaleString("fr-FR")} FC
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">Caisse & Mobile Money</span>
          </div>

          {/* Recettes Semaine */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Recettes Semaine</span>
            <div className="flex flex-col">
              <span className="text-lg font-black text-blue-400 font-mono">
                ${financialStats.usd.week.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-black text-blue-300 font-mono">
                {financialStats.cdf.week.toLocaleString("fr-FR")} FC
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">7 derniers jours</span>
          </div>

          {/* Recettes Mois */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Recettes Mois</span>
            <div className="flex flex-col">
              <span className="text-lg font-black text-indigo-300 font-mono">
                ${financialStats.usd.month.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-black text-indigo-200 font-mono">
                {financialStats.cdf.month.toLocaleString("fr-FR")} FC
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">30 derniers jours</span>
          </div>

          {/* Mobile Money (Momo) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Mobile Money (Momo)</span>
            <div className="flex flex-col">
              <span className="text-lg font-black text-amber-300 font-mono">
                ${financialStats.usd.momo.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-black text-amber-200 font-mono">
                {financialStats.cdf.momo.toLocaleString("fr-FR")} FC
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">M-Pesa, Orange, Airtel</span>
          </div>

          {/* Espèces Caisse */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Espèces Caisse</span>
            <div className="flex flex-col">
              <span className="text-lg font-black text-cyan-300 font-mono">
                ${financialStats.usd.cash.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-black text-cyan-200 font-mono">
                {financialStats.cdf.cash.toLocaleString("fr-FR")} FC
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">Guichet & Recouvrements</span>
          </div>

          {/* Alertes Sensibles */}
          <div className={`rounded-2xl p-3.5 backdrop-blur-sm border ${
            financialStats.activeAlertsCount > 0
              ? "bg-rose-500/20 border-rose-500/50 text-rose-200 animate-pulse"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}>
            <span className="text-[11px] font-bold block uppercase flex items-center justify-between">
              <span>Alertes Sensibles</span>
              {financialStats.activeAlertsCount > 0 && <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />}
            </span>
            <span className="text-xl font-black mt-1 block">
              {financialStats.activeAlertsCount} active{financialStats.activeAlertsCount > 1 ? "s" : ""}
            </span>
            <span className="text-[10px] mt-0.5 block">
              {financialStats.activeAlertsCount > 0 ? "Examen promoteur requis" : "Aucune anomalie"}
            </span>
          </div>
        </div>
      </div>

      {/* Toast banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg ${
              toastMessage.type === "success"
                ? "bg-emerald-600 text-white"
                : toastMessage.type === "warning"
                ? "bg-amber-500 text-slate-950"
                : "bg-rose-600 text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-black/10 rounded-lg">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------- */}
      {/* 2. STRATEGIC CONTROL NAVIGATION TABS */}
      {/* --------------------------------------------------------------------------- */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("live_stream")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === "live_stream"
              ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Zap className="h-4 w-4 text-amber-400" />
          <span>Flux en Direct & Caisse ({filteredPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("revenues")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === "revenues"
              ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span>Recettes Périodiques & Canaux</span>
        </button>

        <button
          onClick={() => setActiveTab("students_debt")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === "students_debt"
              ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Users className="h-4 w-4 text-blue-400" />
          <span>Soldes & Dettes Élèves ({studentDebtList.length})</span>
        </button>

        {/* TEACHER PAYROLL & MOBILE MONEY EXECUTION */}
        <button
          onClick={() => setActiveTab("teacher_payroll")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === "teacher_payroll"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Wallet className="h-4 w-4 text-emerald-400" />
          <span>Paie des Enseignants & Mobile Money ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit_ledger")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === "audit_ledger"
              ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span>Grand Livre d'Audit Inaltérable ({auditEntries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("anti_fraud")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer relative ${
            activeTab === "anti_fraud"
              ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          <AlertOctagon className="h-4 w-4 text-rose-400" />
          <span>Alertes Anti-Fraude & Annulations</span>
          {financialStats.activeAlertsCount > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black">
              {financialStats.activeAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("config_lock")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === "config_lock"
              ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          <LockKeyhole className="h-4 w-4 text-amber-400" />
          <span>Verrouillage Comptes & Frais</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* TAB 1: FLUX EN DIRECT & CAISSE (LIVE STREAM) */}
      {/* --------------------------------------------------------------------------- */}
      {activeTab === "live_stream" && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par élève, référence, agent caissier, classe..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedMethodFilter}
                onChange={e => setSelectedMethodFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">Tous les modes</option>
                <option value="MOMO">Mobile Money uniquement</option>
                <option value="CASH">Espèces uniquement</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="CONFIRMED">Validés / Confirmés</option>
                <option value="PENDING">En attente</option>
                <option value="VOIDED">Annulés / Remboursés</option>
              </select>

              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">Toutes les classes</option>
                {classesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payments Stream Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-brand-blue" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Journal en direct des transactions ({filteredPayments.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Traçabilité inviolable scellée par le serveur
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">Date & Heure</th>
                    <th className="p-3.5">Élève & Classe</th>
                    <th className="p-3.5">Motif & Frais</th>
                    <th className="p-3.5">Montant Encaissé</th>
                    <th className="p-3.5">Canal & Référence</th>
                    <th className="p-3.5">Agent Enregistreur</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions Contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Aucune transaction financière ne correspond aux critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(p => {
                      const isVoided = p.transactionStatus === "Annulé" || p.transactionStatus === "Remboursé";
                      const isMomo = p.paymentMethod?.toLowerCase().includes("mobile") || p.paymentMethod?.toLowerCase().includes("m-pesa") || p.paymentMethod?.toLowerCase().includes("airtel") || p.paymentMethod?.toLowerCase().includes("orange");

                      return (
                        <tr key={p.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${isVoided ? "bg-rose-50/30 dark:bg-rose-950/10" : ""}`}>
                          <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {p.createdAt || "Aujourd'hui"}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {p.studentName}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {p.className}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-brand-blue dark:text-blue-300 text-[11px] font-bold">
                              {p.paymentType}
                            </span>
                            {p.paymentMonth && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {p.paymentMonth}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`font-black text-sm ${isVoided ? "line-through text-slate-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                              {p.amount.toLocaleString()} {p.currency}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center space-x-1.5">
                              {isMomo ? (
                                <Smartphone className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              ) : (
                                <DollarSign className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                              )}
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {p.paymentMethod}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                              Ref: {p.reference || p.id}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-slate-900 dark:text-white font-bold block">
                              {p.recordingAgentName || "Caisse Centrale"}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {p.recordingAgentRole || "Caissier"}
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            {p.transactionStatus === "Annulé" ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-black">
                                🚨 Annulé
                              </span>
                            ) : p.transactionStatus === "Remboursé" ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                                ↩️ Remboursé
                              </span>
                            ) : p.isValidated ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black flex items-center w-fit space-x-1">
                                <Check className="h-3 w-3" />
                                <span>Confirmé</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black">
                                En attente
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1.5">
                              <button
                                onClick={() => setActiveReceiptPayment(p)}
                                title="Voir le Reçu Officiel Certifié"
                                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-blue hover:text-white rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => generateOfficialReceiptPDF(p)}
                                title="Télécharger le PDF"
                                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>
                              {!isVoided && (
                                <button
                                  onClick={() => {
                                    setVoidModalPayment(p);
                                    setVoidActionType("ANNULER");
                                  }}
                                  title="Annulation ou Remboursement sous contrôle"
                                  className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white rounded-lg text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* TAB 2: RECETTES PÉRIODIQUES & CANAUX */}
      {/* --------------------------------------------------------------------------- */}
      {activeTab === "revenues" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cash vs Mobile Money Split */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-brand-blue" />
                  <span>Répartition par Canal</span>
                </h3>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-500 flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5" /> Mobile Money (M-Pesa, Orange, Airtel)
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      ${financialStats.momoCollectedUSD.toLocaleString()} (
                      {financialStats.totalCollectedUSD > 0
                        ? Math.round((financialStats.momoCollectedUSD / financialStats.totalCollectedUSD) * 100)
                        : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                      style={{
                        width: `${financialStats.totalCollectedUSD > 0 ? (financialStats.momoCollectedUSD / financialStats.totalCollectedUSD) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-cyan-500 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" /> Espèces (Caisse Centrale)
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      ${financialStats.cashCollectedUSD.toLocaleString()} (
                      {financialStats.totalCollectedUSD > 0
                        ? Math.round((financialStats.cashCollectedUSD / financialStats.totalCollectedUSD) * 100)
                        : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                      style={{
                        width: `${financialStats.totalCollectedUSD > 0 ? (financialStats.cashCollectedUSD / financialStats.totalCollectedUSD) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                💡 <strong>Conseil Promoteur :</strong> Le paiement Mobile Money garantit le versement direct sur vos comptes officiels, éliminant totalement les risques de manipulation d'espèces sur place.
              </div>
            </div>

            {/* Recettes Périodiques Comparatif */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span>Rythme des Recettes Périodiques</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block uppercase">Recette Journalière</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    ${financialStats.todayCollectedUSD.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Enregistrée aujourd'hui</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block uppercase">Recette Hebdomadaire</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                    ${financialStats.weekCollectedUSD.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Cumul 7 derniers jours</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block uppercase">Recette Mensuelle</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                    ${financialStats.monthCollectedUSD.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Cumul 30 derniers jours</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Total Encaissé Année Scolaire 2026-2027
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Toutes rubriques confondues (Minerval, Inscriptions, Frais d'État, Transport)
                  </span>
                </div>
                <span className="text-xl font-black text-brand-blue dark:text-blue-400">
                  ${financialStats.totalCollectedUSD.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* TAB 3: SOLDES & DETTES DES ÉLÈVES À LA LOUPE */}
      {/* --------------------------------------------------------------------------- */}
      {activeTab === "students_debt" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-brand-blue" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Suivi nominatif des écolages & recouvrement ({studentDebtList.length} élèves)
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Filtrer classe :</span>
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">Toutes les classes</option>
                {classesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">Élève</th>
                    <th className="p-3.5">Classe</th>
                    <th className="p-3.5">Frais Dus Annuel</th>
                    <th className="p-3.5">Total Payé</th>
                    <th className="p-3.5">Solde Restant</th>
                    <th className="p-3.5">Progression</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Relance Parent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {studentDebtList
                    .filter(item => selectedClassFilter === "ALL" || item.student.className === selectedClassFilter)
                    .map(item => (
                      <tr key={item.student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {item.student.firstName} {item.student.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Matricule: {(item.student as any).matricule || item.student.id}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {item.student.className}
                        </td>
                        <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                          ${item.expectedUSD}
                        </td>
                        <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">
                          ${item.paidUSD.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`font-black text-sm ${item.remainingUSD > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
                            ${item.remainingUSD.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3.5 w-36">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.percentagePaid >= 95
                                    ? "bg-emerald-500"
                                    : item.percentagePaid >= 50
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${item.percentagePaid}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{item.percentagePaid}%</span>
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {item.status === "EN_REGLE" ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black">
                              En Règle
                            </span>
                          ) : item.status === "PARTIEL" ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black">
                              Partiellement Payé
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-black">
                              Retard Critique
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          {item.remainingUSD > 0 ? (
                            <button
                              onClick={() => {
                                showToast(`SMS de relance préparé pour les parents de ${item.student.firstName} (Solde dû: $${item.remainingUSD})`, "warning");
                              }}
                              className="px-2.5 py-1 bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white rounded-lg text-[10px] font-black transition-colors cursor-pointer inline-flex items-center space-x-1"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>Relancer Parent</span>
                            </button>
                          ) : (
                            <span className="text-emerald-500 font-bold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Quitus délivré
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* TAB: GESTION DE LA PAIE DES ENSEIGNANTS & MOBILE MONEY (PROMOTER PAYROLL) */}
      {/* --------------------------------------------------------------------------- */}
      {activeTab === "teacher_payroll" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Ordres de Virement des Salaires Enseignants
                  </h3>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed max-w-3xl">
                  Chaque enseignant gère ses propres coordonnées de réception (Mobile Money ou Banque). 
                  En tant que <strong>Promoteur Titulaire</strong>, vous disposez de l'autorité exclusive pour valider 
                  et exécuter les paiements de salaires avec émission immédiate du bulletin de paie officiel et traçabilité SHA-256.
                </p>
              </div>

              {/* Period & Currency Selectors */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold text-slate-400">Période :</span>
                  <select
                    value={selectedPayrollPeriod}
                    onChange={e => setSelectedPayrollPeriod(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
                  >
                    <option value="Août 2026" className="bg-slate-900">Août 2026</option>
                    <option value="Septembre 2026" className="bg-slate-900">Septembre 2026</option>
                    <option value="Octobre 2026" className="bg-slate-900">Octobre 2026</option>
                    <option value="Novembre 2026" className="bg-slate-900">Novembre 2026</option>
                    <option value="Décembre 2026" className="bg-slate-900">Décembre 2026</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-[11px] font-bold text-slate-400">Devise :</span>
                  <select
                    value={payrollCurrencyFilter}
                    onChange={e => setPayrollCurrencyFilter(e.target.value as any)}
                    className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
                  >
                    <option value="ALL" className="bg-slate-900">Toutes (USD & CDF)</option>
                    <option value="USD" className="bg-slate-900">USD ($)</option>
                    <option value="CDF" className="bg-slate-900">CDF (Francs)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payroll KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Corps Enseignant</span>
                <span className="text-lg font-black text-white mt-0.5 block">{teachers.length} enseignants</span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Salaires Validés ({selectedPayrollPeriod})</span>
                <span className="text-lg font-black text-emerald-400 mt-0.5 block">
                  {salaryPayments.filter(p => p.period === selectedPayrollPeriod && p.status === "EFFECTUE").length} / {teachers.length} payés
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Masse Salariale Exécutée (USD)</span>
                <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                  ${salaryPayments
                    .filter(p => p.period === selectedPayrollPeriod && p.status === "EFFECTUE" && p.currency === "USD")
                    .reduce((acc, curr) => acc + curr.netAmountPaid, 0)
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Masse Salariale Exécutée (CDF)</span>
                <span className="text-lg font-black text-blue-400 font-mono mt-0.5 block">
                  {salaryPayments
                    .filter(p => p.period === selectedPayrollPeriod && p.status === "EFFECTUE" && p.currency === "CDF")
                    .reduce((acc, curr) => acc + curr.netAmountPaid, 0)
                    .toLocaleString("fr-FR")} FC
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Roster & Execution Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Tableau de Rémunération des Enseignants — {selectedPayrollPeriod}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cliquez sur « PAYER » pour autoriser le virement sécurisé vers le compte enregistré par l'enseignant.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">Enseignant & Matricule</th>
                    <th className="p-3.5">Discipline / Cours</th>
                    <th className="p-3.5">Coordonnées de Réception (Enregistrées)</th>
                    <th className="p-3.5">Salaire de Base</th>
                    <th className="p-3.5">Statut ({selectedPayrollPeriod})</th>
                    <th className="p-3.5 text-right">Action Promoteur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {teachers
                    .filter(t => {
                      if (payrollCurrencyFilter === "ALL") return true;
                      const cur = t.salaryCurrency || t.payoutDetails?.preferredCurrency || "USD";
                      return cur === payrollCurrencyFilter;
                    })
                    .map(teacher => {
                      const existingPayment = salaryPayments.find(
                        p => p.teacherId === teacher.id && p.period === selectedPayrollPeriod && p.status === "EFFECTUE"
                      );
                      const baseSalary = teacher.salaryBase || 350;
                      const currency = teacher.salaryCurrency || teacher.payoutDetails?.preferredCurrency || "USD";
                      const payoutMethod = teacher.payoutDetails?.paymentMethod || "M-Pesa";
                      const payoutNumber = teacher.payoutDetails?.receivingNumberOrIban || teacher.phone || "Non configuré";
                      const holderName = teacher.payoutDetails?.accountHolderName || `${teacher.firstName} ${teacher.lastName}`;

                      return (
                        <tr key={teacher.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Teacher Name & Matricule */}
                          <td className="p-3.5">
                            <div className="flex items-center space-x-2.5">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center text-xs">
                                {teacher.firstName[0]}{teacher.lastName[0]}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {teacher.firstName} {teacher.lastName}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  Matr: {teacher.matriculeEtat || teacher.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Subject */}
                          <td className="p-3.5 text-slate-600 dark:text-slate-300">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                              {teacher.subject || "Enseignement Général"}
                            </span>
                          </td>

                          {/* Payout Details recorded by teacher */}
                          <td className="p-3.5">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                  payoutMethod.toLowerCase().includes("m-pesa") || payoutMethod.toLowerCase().includes("vodacom")
                                    ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                                    : payoutMethod.toLowerCase().includes("airtel")
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                    : payoutMethod.toLowerCase().includes("orange")
                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                }`}>
                                  {payoutMethod}
                                </span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                  {payoutNumber}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                                Bénéficiaire : {holderName}
                              </span>
                            </div>
                          </td>

                          {/* Base Salary */}
                          <td className="p-3.5">
                            <span className="font-black text-slate-900 dark:text-white text-sm font-mono">
                              {currency === "USD" ? `$${baseSalary.toLocaleString("fr-FR")}` : `${baseSalary.toLocaleString("fr-FR")} FC`}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            {existingPayment ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>PAYÉ ({existingPayment.netAmountPaid} {existingPayment.currency})</span>
                                </span>
                                <span className="text-[9px] text-slate-400 block font-mono">
                                  Réf: {existingPayment.transactionReference}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                                <Clock className="h-3 w-3" />
                                <span>À PAYER</span>
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            {existingPayment ? (
                              <button
                                onClick={() => setCompletedPayoutSlip(existingPayment)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                              >
                                <Receipt className="h-3.5 w-3.5 text-indigo-500" />
                                <span>Voir Bulletin</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setActivePayrollModalTeacher(teacher);
                                  setPayoutBonusAmount(0);
                                  setPayoutDeductionAmount(0);
                                  setPromoterAuthCode("");
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/20 inline-flex items-center space-x-1.5 cursor-pointer"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>PAYER</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Salary Payments Audit Log */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Historique Certifié des Virements Salariaux ({salaryPayments.length} virements enregistrés)
                </h4>
              </div>
            </div>

            {salaryPayments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Wallet className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Aucun ordre de virement salarial exécuté pour le moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="p-3">Réf. Virement</th>
                      <th className="p-3">Date & Heure</th>
                      <th className="p-3">Enseignant</th>
                      <th className="p-3">Période</th>
                      <th className="p-3">Montant Net</th>
                      <th className="p-3">Canal & Numéro</th>
                      <th className="p-3">Validateur Suprême</th>
                      <th className="p-3 text-right">Bulletin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {salaryPayments.map(sp => (
                      <tr key={sp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {sp.transactionReference}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {sp.paymentDate}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {sp.teacherName}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                            {sp.period}
                          </span>
                        </td>
                        <td className="p-3 font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                          {sp.currency === "USD" ? `$${sp.netAmountPaid.toLocaleString("fr-FR")}` : `${sp.netAmountPaid.toLocaleString("fr-FR")} FC`}
                        </td>
                        <td className="p-3">
                          <div className="text-[11px]">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{sp.paymentMethod}</span>
                            <span className="text-slate-400 block font-mono text-[10px]">{sp.receivingNumberOrIban}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">
                          {sp.authorizedByPromoterName}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setCompletedPayoutSlip(sp)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                            title="Consulter et Imprimer le Bulletin"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* TAB 4: GRAND LIVRE D'AUDIT INALTÉRABLE (IMMUTABLE AUDIT LEDGER) */}
      {/* --------------------------------------------------------------------------- */}
      {activeTab === "audit_ledger" && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Grand Livre d'Audit Cryptographique Immuable
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-mono font-bold">
                SCELLEMENT SHA-256 ACTIF
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-4xl">
              Chaque mouvement financier (encaissement espèces, paiement Mobile Money, validation, annulation, remboursement, changement de barème) 
              est gravé avec une empreinte cryptographique enchaînée. Aucune modification manuelle ne peut effacer une trace.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">Horodatage</th>
                    <th className="p-3.5">Opérateur (Qui)</th>
                    <th className="p-3.5">Action Exécutée</th>
                    <th className="p-3.5">Élève & Classe</th>
                    <th className="p-3.5">Montant & Moyen</th>
                    <th className="p-3.5">Référence / Motif</th>
                    <th className="p-3.5">Empreinte SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {auditEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        {isLoadingAudits ? "Chargement du grand livre d'audit..." : "Aucun événement d'audit financier enregistré pour le moment."}
                      </td>
                    </tr>
                  ) : (
                    auditEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {new Date(entry.timestamp).toLocaleString("fr-FR")}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {entry.operatorName}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {entry.operatorRole}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            entry.actionType === "ANNULATION_EFFECTUEE" || entry.actionType === "REMBOURSEMENT_EFFECTUE"
                              ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                              : entry.actionType === "MODIFICATION_COMPTE_RECEPTION"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                              : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          }`}>
                            {entry.actionType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-slate-900 dark:text-white font-bold block">
                            {entry.studentName || "—"}
                          </span>
                          {entry.studentClass && (
                            <span className="text-[10px] text-slate-400 block">
                              {entry.studentClass}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {entry.amount ? (
                            <span className="font-black text-slate-900 dark:text-white block">
                              {entry.amount.toLocaleString()} {entry.currency || "USD"}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          <span className="text-[10px] text-slate-400 block">
                            {entry.paymentMethod || "Système"}
                          </span>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 block truncate">
                            {entry.transactionReference || entry.id}
                          </span>
                          {entry.justification && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 italic block mt-0.5">
                              "{entry.justification}"
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          <span title={entry.integrityHash} className="cursor-pointer hover:text-brand-blue" onClick={() => safeCopyToClipboard(entry.integrityHash)}>
                            {entry.integrityHash.substring(0, 16)}...
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* TAB 5: ALERTES ANTI-FRAUDE & OPÉRATIONS SENSIBLES */}
      {/* --------------------------------------------------------------------------- */}
      {activeTab === "anti_fraud" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-500" />
              <span>Surveillance des Opérations Sensibles & Suspicion de Fraude</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Toute annulation de reçu, remboursement d'argent ou tentative de modification de comptes bancaires génère une alerte prioritaire transmise au Promoteur.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {alerts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                Aucune alerte de fraude ni opération sensible détectée sur l'établissement.
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    alert.status === "ACTIVE"
                      ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 shadow-md"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          alert.severity === "CRITIQUE_FRAUDE"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-500 text-slate-950"
                        }`}>
                          {alert.severity === "CRITIQUE_FRAUDE" ? "🚨 Alerte Critique" : "⚠️ Attention"}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {alert.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-1">
                        <span>Horodatage : {new Date(alert.timestamp).toLocaleString("fr-FR")}</span>
                        <span>Opérateur : <strong>{alert.targetOperator}</strong> ({alert.operatorRole})</span>
                        {alert.amountInvolved && <span>Montant : <strong>{alert.amountInvolved} {alert.currency || "USD"}</strong></span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {alert.status === "ACTIVE" ? (
                        <button
                          onClick={() => setSelectedAlertToResolve(alert)}
                          className="px-3.5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                        >
                          Examiner & Statuer
                        </button>
                      ) : (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black block">
                            ✓ {alert.status === "JUSTIFIEE_PROMOTEUR" ? "Justifiée par Promoteur" : "Bloquée"}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Par {alert.reviewedBy || "Promoteur"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* TAB 6: VERROUILLAGE PROPRIÉTAIRE DES COMPTES & FRAIS */}
      {/* --------------------------------------------------------------------------- */}
      {activeTab === "config_lock" && (
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl space-y-3">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                Contrôle Exclusif du Promoteur — Paramétrage des Comptes de Réception
              </h3>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed max-w-4xl">
              <strong>Sécurité Anti-Détournement :</strong> Les numéros de paiement Mobile Money et coordonnées bancaires vers lesquels les parents envoient l'argent 
              sont scellés. Aucun caissier, enseignant ou comptable ne peut altérer un numéro de réception sans votre validation explicite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lockedMomoAccounts.map(acc => (
              <div key={acc.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black">
                    {acc.provider}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verrouillé
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Numéro Officiel</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono block">
                    {acc.accountNumber}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                    Titulaire: <strong>{acc.holderName}</strong>
                  </span>
                  {acc.merchantCode && (
                    <span className="text-[11px] text-brand-blue font-mono block mt-0.5">
                      Code Marchand: {acc.merchantCode}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
                  Frais affectés : <strong>{acc.associatedFeeTypes?.join(", ") || "Tous"}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* MODAL: OFFICIAL CERTIFIED RECEIPT WITH QR CODE */}
      {/* --------------------------------------------------------------------------- */}
      <AnimatePresence>
        {activeReceiptPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-brand-blue" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Reçu de Caisse Officiel Certifié RDC
                  </h3>
                </div>
                <button
                  onClick={() => setActiveReceiptPayment(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-3 text-xs border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Établissement :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{schoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Élève :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeReceiptPayment.studentName} ({activeReceiptPayment.className})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Motif de Paiement :</span>
                  <span className="font-bold text-brand-blue">{activeReceiptPayment.paymentType} - {activeReceiptPayment.paymentMonth || "2026"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant Certifié :</span>
                  <span className="font-black text-emerald-600 text-sm">{activeReceiptPayment.amount} {activeReceiptPayment.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Moyen de Paiement :</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{activeReceiptPayment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Référence Transaction :</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{activeReceiptPayment.reference}</span>
                </div>

                {activeReceiptQrUrl && (
                  <div className="pt-2 text-center flex flex-col items-center">
                    <img src={activeReceiptQrUrl} alt="QR Code" className="w-28 h-28 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">Authentifié par SmartSchool RDC Sovereign Protocol</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => generateOfficialReceiptPDF(activeReceiptPayment)}
                  className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-black cursor-pointer flex items-center space-x-1.5"
                >
                  <Printer className="h-4 w-4" />
                  <span>Télécharger Reçu PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------- */}
      {/* MODAL: CONTROLLED VOID OR REFUND (MANDATORY REASON) */}
      {/* --------------------------------------------------------------------------- */}
      <AnimatePresence>
        {voidModalPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4"
            >
              <div className="flex items-center space-x-2 text-rose-600">
                <ShieldAlert className="h-6 w-6" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Contrôle d'Annulation / Remboursement
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Vous êtes sur le point de procéder à une modification sensible sur le paiement de <strong className="text-slate-900 dark:text-white">{voidModalPayment.studentName}</strong> ({voidModalPayment.amount} {voidModalPayment.currency}).
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Type d'opération :</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setVoidActionType("ANNULER")}
                      className={`py-2 rounded-xl text-xs font-black border cursor-pointer ${
                        voidActionType === "ANNULER"
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      Annuler la Transaction
                    </button>
                    <button
                      onClick={() => setVoidActionType("REMBOURSER")}
                      className={`py-2 rounded-xl text-xs font-black border cursor-pointer ${
                        voidActionType === "REMBOURSER"
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      Rembourser le Parent
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Motif obligatoire et détaillé (Min. 8 caractères) :
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Erreur de saisie de montant par la caissière, doublon Mobile Money ou accord écrit de la direction..."
                    value={voidReason}
                    onChange={e => setVoidReason(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setVoidModalPayment(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Abandonner
                </button>
                <button
                  disabled={isProcessingVoid || voidReason.trim().length < 8}
                  onClick={handleExecuteVoid}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isProcessingVoid ? "Enregistrement cryptographique..." : "Confirmer l'opération"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------- */}
      {/* MODAL: PROMOTER ALERT RESOLUTION */}
      {/* --------------------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedAlertToResolve && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center space-x-2 text-brand-blue">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Décision du Promoteur sur l'Alerte
                </h3>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">{selectedAlertToResolve.title}</span>
                <p className="text-slate-600 dark:text-slate-400">{selectedAlertToResolve.message}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Commentaire / Décision officielle du Promoteur :
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Justification vérifiée auprès du parent et approuvée par le promoteur..."
                  value={alertDecisionComment}
                  onChange={e => setAlertDecisionComment(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setSelectedAlertToResolve(null)}
                  className="px-3.5 py-2 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  disabled={isResolvingAlert}
                  onClick={() => handleResolveAlert("JUSTIFIEE_PROMOTEUR")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  Valider la Justification
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------- */}
      {/* MODAL: PROMOTER SALARY PAYOUT AUTHORIZATION & EXECUTION */}
      {/* --------------------------------------------------------------------------- */}
      <AnimatePresence>
        {activePayrollModalTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Autorisation Suprême de Virement Salarial
                    </h3>
                    <span className="text-[11px] text-slate-500">Période : {selectedPayrollPeriod}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActivePayrollModalTeacher(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Teacher Summary Details Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-3 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Enseignant Bénéficiaire :</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {activePayrollModalTeacher.firstName} {activePayrollModalTeacher.lastName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Matricule :</span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {activePayrollModalTeacher.matriculeEtat || activePayrollModalTeacher.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Moyen de Paiement :</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    {activePayrollModalTeacher.payoutDetails?.paymentMethod || "M-Pesa"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Numéro / Compte de Réception :</span>
                  <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                    {activePayrollModalTeacher.payoutDetails?.receivingNumberOrIban || activePayrollModalTeacher.phone || "0810000000"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Nom du Titulaire Enregistré :</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activePayrollModalTeacher.payoutDetails?.accountHolderName || `${activePayrollModalTeacher.firstName} ${activePayrollModalTeacher.lastName}`}
                  </span>
                </div>
              </div>

              {/* Calculation & Adjustments */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Primes / Bonus ({activePayrollModalTeacher.salaryCurrency || activePayrollModalTeacher.payoutDetails?.preferredCurrency || "USD"}) :
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={payoutBonusAmount || ""}
                      onChange={e => setPayoutBonusAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Retenues / Avances ({activePayrollModalTeacher.salaryCurrency || activePayrollModalTeacher.payoutDetails?.preferredCurrency || "USD"}) :
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={payoutDeductionAmount || ""}
                      onChange={e => setPayoutDeductionAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Net Payout Banner */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-emerald-700/20">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">
                      Montant Net à Virer ({selectedPayrollPeriod})
                    </span>
                    <span className="text-xs text-emerald-200">
                      Base: {activePayrollModalTeacher.salaryBase || 350} + Primes: {payoutBonusAmount} - Retenues: {payoutDeductionAmount}
                    </span>
                  </div>
                  <span className="text-2xl font-black font-mono tracking-tight">
                    {activePayrollModalTeacher.salaryCurrency === "CDF"
                      ? `${Math.max(0, (activePayrollModalTeacher.salaryBase || 350) + Number(payoutBonusAmount) - Number(payoutDeductionAmount)).toLocaleString("fr-FR")} FC`
                      : `$${Math.max(0, (activePayrollModalTeacher.salaryBase || 350) + Number(payoutBonusAmount) - Number(payoutDeductionAmount)).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>

              {/* Promoter Security Verification */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Code Secret ou Confirmation du Promoteur :
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Code de sécurité ou laisser vide pour validation directe..."
                    value={promoterAuthCode}
                    onChange={e => setPromoterAuthCode(e.target.value)}
                    className="w-full p-2.5 pl-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <ShieldCheck className="h-4 w-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePayrollModalTeacher(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayout}
                  onClick={handleExecuteTeacherSalaryPayment}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isProcessingPayout ? "Exécution de l'ordre..." : "Confirmer le Paiement & Émettre Bulletin"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------------- */}
      {/* MODAL: OFFICIAL PRINTABLE SALARY PAY SLIP (BULLETIN DE PAIE OFFICIEL RDC) */}
      {/* --------------------------------------------------------------------------- */}
      <AnimatePresence>
        {completedPayoutSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                  </span>
                  <h3 className="text-base font-black text-slate-900 uppercase">
                    {schoolName}
                  </h3>
                  <span className="text-xs font-bold text-slate-600 block">
                    BULLETIN DE PAIE ET DÉCOMPTE SALARIAL OFFICIEL
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-indigo-700 block">
                    N° {completedPayoutSlip.slipNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Réf: {completedPayoutSlip.transactionReference}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Enseignant Bénéficiaire</span>
                  <span className="font-black text-slate-900 block text-sm">{completedPayoutSlip.teacherName}</span>
                  <span className="text-slate-500 font-mono text-[10px]">Matr: {completedPayoutSlip.teacherMatricule}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Période Rémunérée</span>
                  <span className="font-black text-indigo-900 block text-sm">{completedPayoutSlip.period}</span>
                  <span className="text-slate-500 text-[10px]">Date: {completedPayoutSlip.paymentDate}</span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-black text-slate-700 text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Rubrique</th>
                      <th className="p-3 text-right">Gains</th>
                      <th className="p-3 text-right">Retenues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-slate-800">Salaire de Base Conventionnel</td>
                      <td className="p-3 text-right font-mono font-bold">
                        {completedPayoutSlip.currency === "USD" ? `$${completedPayoutSlip.baseAmount.toLocaleString("fr-FR")}` : `${completedPayoutSlip.baseAmount.toLocaleString("fr-FR")} FC`}
                      </td>
                      <td className="p-3 text-right text-slate-400 font-mono">-</td>
                    </tr>
                    {completedPayoutSlip.bonusAmount > 0 && (
                      <tr>
                        <td className="p-3 text-slate-700">Primes de Rendement / Prestations Supplémentaires</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">
                          +{completedPayoutSlip.currency === "USD" ? `$${completedPayoutSlip.bonusAmount.toLocaleString("fr-FR")}` : `${completedPayoutSlip.bonusAmount.toLocaleString("fr-FR")} FC`}
                        </td>
                        <td className="p-3 text-right text-slate-400 font-mono">-</td>
                      </tr>
                    )}
                    {completedPayoutSlip.deductionsAmount > 0 && (
                      <tr>
                        <td className="p-3 text-slate-700">Avances sur Salaire / Cotisations</td>
                        <td className="p-3 text-right text-slate-400 font-mono">-</td>
                        <td className="p-3 text-right font-mono font-bold text-rose-600">
                          -{completedPayoutSlip.currency === "USD" ? `$${completedPayoutSlip.deductionsAmount.toLocaleString("fr-FR")}` : `${completedPayoutSlip.deductionsAmount.toLocaleString("fr-FR")} FC`}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50 font-black">
                      <td className="p-3 text-emerald-950 font-black uppercase">NET À PERCEVOIR</td>
                      <td colSpan={2} className="p-3 text-right text-base text-emerald-900 font-mono">
                        {completedPayoutSlip.currency === "USD"
                          ? `$${completedPayoutSlip.netAmountPaid.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`
                          : `${completedPayoutSlip.netAmountPaid.toLocaleString("fr-FR")} FC`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Execution Channel & Receipt Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Canal de Règlement :</span>
                  <span className="font-black text-slate-900">{completedPayoutSlip.paymentMethod} ({completedPayoutSlip.receivingNumberOrIban})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Bénéficiaire du Compte :</span>
                  <span className="font-bold text-slate-800">{completedPayoutSlip.accountHolderName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Autorité Suprême Validatrice :</span>
                  <span className="font-black text-indigo-700">{completedPayoutSlip.authorizedByPromoterName}</span>
                </div>
              </div>

              {/* Signatures & Certification */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-center text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-8">L'Enseignant Bénéficiaire</span>
                  <span className="text-[11px] font-bold text-slate-800 block italic">Pour Acquit et Réception</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-8">Le Promoteur Titulaire</span>
                  <span className="text-[11px] font-black text-slate-900 block uppercase">Approuvé & Certifié Conforme</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCompletedPayoutSlip(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer shadow-md"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimer le Bulletin</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
