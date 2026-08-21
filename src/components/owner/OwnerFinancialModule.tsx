import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Download,
  Calendar,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Smartphone,
  PhoneCall,
  User,
  Power,
  Edit3,
  Star,
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
  Info
} from "lucide-react";
import { useSmartSchoolCore } from "../../context/SmartSchoolCoreContext";
import { Payment, DeveloperMobileMoneyAccount } from "../../types";
import { generateOfficialReceiptPDF } from "../FinanceModule";

interface OwnerFinancialProps {
  schoolsCount?: number;
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
  payments?: Payment[];
}

// Sample fallback payments for platform demonstration if empty
const FALLBACK_PAYMENTS: Payment[] = [
  {
    id: "PAY-2026-9011",
    studentId: "STD-2026-0012",
    studentName: "Gaston Tshibanda",
    className: "3ème Humanités Scientifique A",
    amount: 100,
    currency: "USD",
    paymentType: "Minerval",
    paymentMonth: "Septembre 2026",
    schoolYear: "2026-2027",
    paymentMethod: "Mobile Money",
    mobileMoneyGateway: "M-Pesa",
    platformCommissionRate: 2.0,
    platformCommissionAmount: 2.0,
    netSchoolAmount: 98.0,
    splitSchoolAccount: "Airtel Money — 0991234567",
    splitPlatformAccount: "M-Pesa Vodacom — +243 812 345 678",
    transactionStatus: "Succès",
    schoolId: "sch-kin-01",
    schoolName: "Complexe Scolaire Saint-Joseph",
    province: "Kinshasa",
    reference: "TRX-MPESA-884931",
    isValidated: true,
    createdAt: "2026-09-02 14:32"
  },
  {
    id: "PAY-2026-9012",
    studentId: "STD-2026-0044",
    studentName: "Naomi Mwamba",
    className: "4ème Humanités Littéraire B",
    amount: 100,
    currency: "USD",
    paymentType: "Minerval",
    paymentMonth: "Octobre 2026",
    schoolYear: "2026-2027",
    paymentMethod: "Mobile Money",
    mobileMoneyGateway: "Airtel Money",
    platformCommissionRate: 2.0,
    platformCommissionAmount: 2.0,
    netSchoolAmount: 98.0,
    splitSchoolAccount: "Orange Money — 0890001111",
    splitPlatformAccount: "Airtel Money — 0994202940",
    transactionStatus: "Succès",
    schoolId: "sch-lum-02",
    schoolName: "Lycée Liziba",
    province: "Haut-Katanga",
    reference: "TRX-AIRTEL-992014",
    isValidated: true,
    createdAt: "2026-10-02 11:20"
  },
  {
    id: "PAY-2026-9013",
    studentId: "STD-2026-0102",
    studentName: "Rachelle Kapinga",
    className: "2ème Humanités Commerciale A",
    amount: 100,
    currency: "USD",
    paymentType: "Minerval",
    paymentMonth: "Septembre 2026",
    schoolYear: "2026-2027",
    paymentMethod: "Mobile Money",
    mobileMoneyGateway: "Orange Money",
    platformCommissionRate: 2.0,
    platformCommissionAmount: 2.0,
    netSchoolAmount: 98.0,
    splitSchoolAccount: "Vodacom M-Pesa — +243811223344",
    splitPlatformAccount: "M-Pesa Vodacom — +243 812 345 678",
    transactionStatus: "En attente",
    schoolId: "sch-goma-03",
    schoolName: "Institut Mwanga Goma",
    province: "Nord-Kivu",
    reference: "TRX-ORANGE-49292",
    isValidated: false,
    createdAt: "2026-09-15 16:45"
  },
  {
    id: "PAY-2026-9014",
    studentId: "STD-2026-0220",
    studentName: "Jean-Bosco Mutombo",
    className: "6ème Primaire A",
    amount: 80,
    currency: "USD",
    paymentType: "Frais de bulletin",
    paymentMonth: "Premier Trimestre",
    schoolYear: "2026-2027",
    paymentMethod: "Mobile Money",
    mobileMoneyGateway: "M-Pesa",
    platformCommissionRate: 2.0,
    platformCommissionAmount: 1.6,
    netSchoolAmount: 78.4,
    splitSchoolAccount: "Airtel Money — 0998877665",
    splitPlatformAccount: "M-Pesa Vodacom — +243 812 345 678",
    transactionStatus: "Succès",
    schoolId: "sch-kin-01",
    schoolName: "Complexe Scolaire Saint-Joseph",
    province: "Kinshasa",
    reference: "TRX-MPESA-102931",
    isValidated: true,
    createdAt: "2026-09-04 10:15"
  },
  {
    id: "PAY-2026-9015",
    studentId: "STD-2026-0310",
    studentName: "Grace Kabasele",
    className: "1ère Humanités Scientifique B",
    amount: 120,
    currency: "USD",
    paymentType: "Inscription",
    schoolYear: "2026-2027",
    paymentMethod: "Mobile Money",
    mobileMoneyGateway: "Afrimoney",
    platformCommissionRate: 2.0,
    platformCommissionAmount: 2.4,
    netSchoolAmount: 117.6,
    splitSchoolAccount: "Rawbank — 0001928374",
    splitPlatformAccount: "Airtel Money — 0994202940",
    transactionStatus: "Échoué",
    schoolId: "sch-mat-04",
    schoolName: "Collège Ntetembwa Matadi",
    province: "Kongo-Central",
    reference: "TRX-AFRI-301928",
    isValidated: false,
    createdAt: "2026-09-08 08:50"
  }
];

export function OwnerFinancialModule({
  schoolsCount = 24,
  userName = "Propriétaire SmartSchool RDC",
  onAuditLog,
  payments: propsPayments
}: OwnerFinancialProps) {
  const {
    developerMomoAccounts,
    platformCommissionConfig,
    updateDeveloperMomoAccount,
    toggleDeveloperMomoStatus,
    setPrimaryDeveloperMomoAccount,
    updatePlatformCommissionRate,
    togglePlatformCommissionActive,
    getPrimaryDeveloperMomoAccount,
    exportTableExcel,
    exportTablePDF
  } = useSmartSchoolCore();

  const [currency, setCurrency] = useState<"USD" | "CDF">("USD");
  const [toast, setToast] = useState<string | null>(null);

  // Modals state
  const [editingAccount, setEditingAccount] = useState<DeveloperMobileMoneyAccount | null>(null);
  const [confirmToggleAccount, setConfirmToggleAccount] = useState<DeveloperMobileMoneyAccount | null>(null);
  const [confirmPrimaryAccount, setConfirmPrimaryAccount] = useState<DeveloperMobileMoneyAccount | null>(null);

  // Commission Edit Rate State
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState<number>(platformCommissionConfig.defaultRatePercent);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Toutes");
  const [selectedSchool, setSelectedSchool] = useState("Tous");
  const [selectedOperator, setSelectedOperator] = useState("Tous");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [selectedPeriod, setSelectedPeriod] = useState("Tous");

  // Currency rate
  const rateCDF = 2850;
  const formatMoney = (valUSD: number) => {
    if (currency === "CDF") {
      return `${(valUSD * rateCDF).toLocaleString("fr-FR")} FC`;
    }
    return `$${valUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Combine payments
  const allPayments = useMemo(() => {
    if (propsPayments && propsPayments.length > 0) {
      return propsPayments;
    }
    return FALLBACK_PAYMENTS;
  }, [propsPayments]);

  // Primary platform account
  const primaryAccount = getPrimaryDeveloperMomoAccount();

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return allPayments.filter(p => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStudent = p.studentName.toLowerCase().includes(q);
        const matchRef = p.reference.toLowerCase().includes(q);
        const matchSchool = (p.schoolName || "").toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        if (!matchStudent && !matchRef && !matchSchool && !matchId) return false;
      }

      // Province filter
      if (selectedProvince !== "Toutes" && p.province !== selectedProvince) {
        return false;
      }

      // School filter
      if (selectedSchool !== "Tous" && p.schoolName !== selectedSchool && p.schoolId !== selectedSchool) {
        return false;
      }

      // Operator filter
      if (selectedOperator !== "Tous") {
        const op = p.mobileMoneyGateway || p.paymentMethod;
        if (!op.toLowerCase().includes(selectedOperator.toLowerCase())) return false;
      }

      // Status filter
      if (selectedStatus !== "Tous" && p.transactionStatus !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [allPayments, searchQuery, selectedProvince, selectedSchool, selectedOperator, selectedStatus]);

  // Financial Metrics
  const stats = useMemo(() => {
    let totalProcessedUSD = 0;
    let totalSchoolNetUSD = 0;
    let totalCommissionUSD = 0;
    let todayCommissionUSD = 0;
    let monthCommissionUSD = 0;

    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    const opBreakdown: Record<string, { total: number; commission: number; count: number }> = {
      "M-Pesa Vodacom": { total: 0, commission: 0, count: 0 },
      "Orange Money": { total: 0, commission: 0, count: 0 },
      "Airtel Money": { total: 0, commission: 0, count: 0 },
      "Afrimoney": { total: 0, commission: 0, count: 0 }
    };

    const schoolBreakdown: Record<string, { name: string; total: number; commission: number; count: number }> = {};

    filteredPayments.forEach(p => {
      const amt = p.currency === "CDF" ? p.amount / rateCDF : p.amount;
      const comm = p.platformCommissionAmount ? (p.currency === "CDF" ? p.platformCommissionAmount / rateCDF : p.platformCommissionAmount) : (amt * (platformCommissionConfig.isCommissionActive ? (platformCommissionConfig.defaultRatePercent / 100) : 0));
      const net = amt - comm;

      if (p.transactionStatus === "Succès" || p.isValidated) {
        totalProcessedUSD += amt;
        totalSchoolNetUSD += net;
        totalCommissionUSD += comm;
        successCount++;

        // Today & Month heuristic
        if (p.createdAt.includes("2026-09") || p.createdAt.includes("2026-10")) {
          monthCommissionUSD += comm;
        }

        // Operator breakdown
        const opName = p.mobileMoneyGateway || p.paymentMethod;
        let matchedOpKey = "M-Pesa Vodacom";
        if (opName.toLowerCase().includes("orange")) matchedOpKey = "Orange Money";
        else if (opName.toLowerCase().includes("airtel")) matchedOpKey = "Airtel Money";
        else if (opName.toLowerCase().includes("afrimoney")) matchedOpKey = "Afrimoney";

        if (!opBreakdown[matchedOpKey]) {
          opBreakdown[matchedOpKey] = { total: 0, commission: 0, count: 0 };
        }
        opBreakdown[matchedOpKey].total += amt;
        opBreakdown[matchedOpKey].commission += comm;
        opBreakdown[matchedOpKey].count += 1;

        // School breakdown
        const schKey = p.schoolName || p.schoolId || "Établissement Principal";
        if (!schoolBreakdown[schKey]) {
          schoolBreakdown[schKey] = { name: schKey, total: 0, commission: 0, count: 0 };
        }
        schoolBreakdown[schKey].total += amt;
        schoolBreakdown[schKey].commission += comm;
        schoolBreakdown[schKey].count += 1;
      } else if (p.transactionStatus === "En attente") {
        pendingCount++;
      } else if (p.transactionStatus === "Échoué") {
        failedCount++;
      }
    });

    return {
      totalProcessedUSD,
      totalSchoolNetUSD,
      totalCommissionUSD,
      todayCommissionUSD,
      monthCommissionUSD,
      successCount,
      pendingCount,
      failedCount,
      opBreakdown,
      schoolBreakdown: Object.values(schoolBreakdown)
    };
  }, [filteredPayments, platformCommissionConfig, rateCDF]);

  // Handle Edit Account Submission
  const handleSaveAccountEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    updateDeveloperMomoAccount(editingAccount);
    if (onAuditLog) {
      onAuditLog(
        "Modification Compte Mobile Money Concepteur",
        `Compte ${editingAccount.provider} mis à jour (${editingAccount.phone} - ${editingAccount.holderName})`
      );
    }
    showToast(`Compte ${editingAccount.provider} mis à jour avec succès.`);
    setEditingAccount(null);
  };

  // Handle Toggle Status Confirmation
  const handleConfirmToggleStatus = () => {
    if (!confirmToggleAccount) return;
    const newStatus = confirmToggleAccount.status === "Actif" ? "Désactivé" : "Actif";
    toggleDeveloperMomoStatus(confirmToggleAccount.id);

    if (onAuditLog) {
      onAuditLog(
        "Changement Statut Compte Mobile Money Concepteur",
        `Compte ${confirmToggleAccount.provider} (${confirmToggleAccount.phone}) passé à ${newStatus}`
      );
    }
    showToast(`Le compte ${confirmToggleAccount.provider} est maintenant ${newStatus}.`);
    setConfirmToggleAccount(null);
  };

  // Handle Set Primary Account Confirmation
  const handleConfirmSetPrimary = () => {
    if (!confirmPrimaryAccount) return;
    setPrimaryDeveloperMomoAccount(confirmPrimaryAccount.id);

    if (onAuditLog) {
      onAuditLog(
        "Compte Principal Commission Modifié",
        `Nouveau compte principal de commission : ${confirmPrimaryAccount.provider} (${confirmPrimaryAccount.phone})`
      );
    }
    showToast(`Nouveau compte principal sélectionné : ${confirmPrimaryAccount.provider} (${confirmPrimaryAccount.phone}).`);
    setConfirmPrimaryAccount(null);
  };

  // Save Commission Rate Edit
  const handleSaveCommissionRate = () => {
    updatePlatformCommissionRate(tempRate);
    setIsEditingRate(false);
    if (onAuditLog) {
      onAuditLog("Taux de Commission Plateforme Modifié", `Nouveau taux par défaut : ${tempRate}%`);
    }
    showToast(`Taux de commission SmartSchool mis à jour : ${tempRate}%`);
  };

  // Toggle Commission Active
  const handleToggleCommissionActive = () => {
    const nextState = !platformCommissionConfig.isCommissionActive;
    togglePlatformCommissionActive(nextState);
    if (onAuditLog) {
      onAuditLog("Statut Commission Plateforme Modifié", `Commission globale passée à ${nextState ? "Activée" : "Désactivée"}`);
    }
    showToast(`La commission SmartSchool est désormais ${nextState ? "ACTIVÉE (2%)" : "DÉSACTIVÉE (0%)"}.`);
  };

  // Operator styling map
  const getOpBadge = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes("mpesa") || p.includes("vodacom")) {
      return {
        bg: "bg-red-500/10 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900",
        badgeBg: "bg-red-600 text-white",
        gradient: "from-red-600 to-rose-700",
        iconColor: "text-red-500"
      };
    }
    if (p.includes("orange")) {
      return {
        bg: "bg-orange-500/10 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900",
        badgeBg: "bg-orange-600 text-white",
        gradient: "from-orange-500 to-amber-600",
        iconColor: "text-orange-500"
      };
    }
    if (p.includes("airtel")) {
      return {
        bg: "bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900",
        badgeBg: "bg-amber-600 text-white",
        gradient: "from-red-600 via-amber-500 to-red-600",
        iconColor: "text-amber-500"
      };
    }
    return {
      bg: "bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
      badgeBg: "bg-emerald-600 text-white",
      gradient: "from-emerald-600 to-teal-700",
      iconColor: "text-emerald-500"
    };
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl border border-emerald-500 flex items-center justify-between text-xs font-bold shadow-xl animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 1. SECTION HEADER BANNER */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl border border-emerald-800/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase rounded-full border border-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>CENTRE FINANCIER &amp; COMMISSIONS PROPRIÉTAIRE</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Comptes Mobile Money &amp; Commissions SmartSchool</h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Gestion sécurisée et centralisée des comptes de réception des commissions de la plateforme SmartSchool RDC.
            Modèle de répartition 98% Établissement / 2% SmartSchool, traçabilité intégrale et séparation absolue des données.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setCurrency(currency === "USD" ? "CDF" : "USD")}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-bold text-xs rounded-xl border border-slate-700 cursor-pointer shadow-md transition-all"
          >
            Devise: {currency} (1$ = {rateCDF} FC)
          </button>
          <button
            onClick={() => {
              const headers = ["ID Trans", "Établissement", "Province", "Élève", "Motif", "Montant Total", "Part École (98%)", "Commission (2%)", "Opérateur", "Statut", "Date"];
              const rows = filteredPayments.map(p => [
                p.id,
                p.schoolName || p.schoolId || "-",
                p.province || "Kinshasa",
                p.studentName,
                p.paymentType,
                `${p.amount} ${p.currency}`,
                `${p.netSchoolAmount || (p.amount * 0.98)} ${p.currency}`,
                `${p.platformCommissionAmount || (p.amount * 0.02)} ${p.currency}`,
                p.mobileMoneyGateway || p.paymentMethod,
                p.transactionStatus || "Succès",
                p.createdAt
              ]);
              exportTableExcel("Rapport_Commissions_SmartSchool_RDC", headers, rows, "Commissions_SmartSchool.xlsx", userName);
              showToast("Rapport des commissions exporté en Excel avec succès.");
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl cursor-pointer shadow-lg flex items-center space-x-2 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Rapport Excel</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION: COMPTES MOBILE MONEY DU CONCEPTEUR */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase rounded-md mb-1">
              <Smartphone className="h-3 w-3" />
              <span>COMPTES MOBILE MONEY CONCEPTEUR</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Comptes de Réception des Commissions Platforme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestion des comptes utilisés pour recevoir les commissions SmartSchool RDC lors des transactions des écoles.
            </p>
          </div>

          {/* Primary Account Banner */}
          {primaryAccount && (
            <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-xs">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shrink-0">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-400">
                  Compte Principal de Réception
                </div>
                <div className="font-extrabold text-slate-900 dark:text-white">
                  {primaryAccount.provider} — <span className="font-mono">{primaryAccount.phone}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Titulaire: {primaryAccount.holderName}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informational Callout */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-300">
          <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 dark:text-white uppercase">Sûreté &amp; Traçabilité des Virements :</span>
            <p>
              Toute modification du compte principal ou des coordonnées n'affecte que les transactions futures. Les transactions passées conservent historiquement le compte vers lequel la commission a été acheminée.
            </p>
          </div>
        </div>

        {/* OPERATORS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {developerMomoAccounts.map((acc) => {
            const style = getOpBadge(acc.provider);
            const isActif = acc.status === "Actif";

            return (
              <div
                key={acc.id}
                className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
                  acc.isPrimary
                    ? "bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white border-emerald-500 shadow-xl"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center space-x-1 border ${style.bg}`}>
                    <Smartphone className="h-3 w-3" />
                    <span>{acc.provider}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {acc.isPrimary && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-[9px] uppercase rounded-full flex items-center space-x-1">
                        <Star className="h-2.5 w-2.5 fill-amber-400" />
                        <span>Principal</span>
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${
                        isActif
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                      }`}
                    >
                      {isActif ? "🟢 Actif" : "⚪ Désactivé"}
                    </span>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Titulaire du compte</div>
                  <div className="font-black text-sm leading-tight">{acc.holderName}</div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 pt-2">Numéro Mobile Money</div>
                  <div className="font-mono font-black text-lg text-emerald-500 tracking-wider flex items-center space-x-1">
                    <PhoneCall className="h-4 w-4 shrink-0" />
                    <span>{acc.phone}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfirmToggleAccount(acc)}
                      className={`px-2.5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center space-x-1 cursor-pointer transition-all border ${
                        isActif
                          ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-red-950/50 hover:text-red-400 hover:border-red-800"
                          : "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
                      }`}
                    >
                      <Power className="h-3 w-3" />
                      <span>{isActif ? "Désactiver" : "Activer"}</span>
                    </button>

                    <button
                      onClick={() => setEditingAccount(acc)}
                      className="px-2.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[10px] font-black uppercase flex items-center justify-center space-x-1 cursor-pointer transition-all"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Modifier</span>
                    </button>
                  </div>

                  {!acc.isPrimary && (
                    <button
                      onClick={() => setConfirmPrimaryAccount(acc)}
                      className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase flex items-center justify-center space-x-1 cursor-pointer transition-all"
                    >
                      <Star className="h-3 w-3 text-amber-400" />
                      <span>Définir Compte Principal</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION: CONFIGURATION DE LA COMMISSION SMARTSCHOOL */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase rounded-md mb-1">
              <Zap className="h-3 w-3" />
              <span>CONFIGIURATION DE LA COMMISSION SMARTSCHOOL RDC</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Pourcentage de Prélèvement Plateforme &amp; Interrupteur
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contrôlez le pourcentage prélevé sur les frais scolaires pour couvrir l'infrastructure cloud et l'assistance souveraine.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Active Toggle */}
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Commission Plateforme:
              </span>
              <button
                onClick={handleToggleCommissionActive}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors cursor-pointer ${
                  platformCommissionConfig.isCommissionActive ? "bg-emerald-600" : "bg-slate-400 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    platformCommissionConfig.isCommissionActive ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-xs font-black uppercase ${platformCommissionConfig.isCommissionActive ? "text-emerald-600" : "text-slate-400"}`}>
                {platformCommissionConfig.isCommissionActive ? "ACTIVÉE" : "DÉSACTIVÉE"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rate Card */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Taux de Commission Actuel</div>
              <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {platformCommissionConfig.isCommissionActive ? `${platformCommissionConfig.defaultRatePercent}%` : "0% (Désactivé)"}
              </div>
              <div className="text-[10px] text-slate-500">Du montant total payé par l'élève</div>
            </div>

            {isEditingRate ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={tempRate}
                  onChange={(e) => setTempRate(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-500 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleSaveCommissionRate}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempRate(platformCommissionConfig.defaultRatePercent);
                  setIsEditingRate(true);
                }}
                className="px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Modifier le taux
              </button>
            )}
          </div>

          {/* School Split */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500">Part Établissement Scolaire</div>
            <div className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {platformCommissionConfig.isCommissionActive ? `${100 - platformCommissionConfig.defaultRatePercent}%` : "100%"}
            </div>
            <div className="text-[10px] text-slate-500">Reversé directement sur le compte de l'école</div>
          </div>

          {/* Model Note */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500">Modèle Economique Souverain</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
              Exemple sur un minerval de $100 :<br />
              • Établissement : <span className="font-mono text-indigo-500">$98.00</span><br />
              • SmartSchool RDC : <span className="font-mono text-emerald-500">$2.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION: TABLEAU DE BORD DE COMMISSIONS SMARTSCHOOL */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Tableau de Bord des Commissions &amp; Transaction
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supervision en temps réel des transactions traitées, commissions générées et répartition par province et opérateur.
            </p>
          </div>
        </div>

        {/* KPI STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
              <span>Total Traité</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatMoney(stats.totalProcessedUSD)}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">{stats.successCount} paiements validés</div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
              <span>Reversé aux Écoles</span>
              <Building2 className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {formatMoney(stats.totalSchoolNetUSD)}
            </div>
            <div className="text-[10px] text-indigo-600 font-bold">98% aux établissements</div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
              <span>Commissions SmartSchool</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-500">
              {formatMoney(stats.totalCommissionUSD)}
            </div>
            <div className="text-[10px] text-amber-600 font-bold">Total commissions 2%</div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
              <span>Commissions du Mois</span>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
              {formatMoney(stats.monthCommissionUSD)}
            </div>
            <div className="text-[10px] text-blue-600 font-bold">Cumul mensuel en cours</div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
              <span>Statut Transactions</span>
              <PieChart className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-emerald-500">Succès:</span>
                <span className="font-mono">{stats.successCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-500">En attente:</span>
                <span className="font-mono">{stats.pendingCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-500">Échoué:</span>
                <span className="font-mono">{stats.failedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* REPARTITION PAR OPERATEUR & ECOLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operator Breakdown */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Smartphone className="h-4 w-4 text-indigo-500" />
              <span>Commissions par Opérateur Mobile Money</span>
            </h4>

            <div className="space-y-3">
              {Object.entries(stats.opBreakdown).map(([opName, data]) => (
                <div key={opName} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-900 dark:text-white">{opName}</span>
                    <div className="text-[10px] text-slate-500">{data.count} transactions • Volume: {formatMoney(data.total)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatMoney(data.commission)}
                    </div>
                    <div className="text-[9px] text-slate-400">Commission 2%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* School Breakdown */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Building2 className="h-4 w-4 text-emerald-500" />
              <span>Commissions par Établissement Scolaire</span>
            </h4>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {stats.schoolBreakdown.map((sch) => (
                <div key={sch.name} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-900 dark:text-white">{sch.name}</span>
                    <div className="text-[10px] text-slate-500">{sch.count} paiements • Total: {formatMoney(sch.total)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                      {formatMoney(sch.commission)}
                    </div>
                    <div className="text-[9px] text-slate-400">Part SmartSchool</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center space-x-2">
              <Filter className="h-4 w-4 text-emerald-500" />
              <span>Filtres de Recherche &amp; Traçabilité des Paiements</span>
            </h4>
            <span className="text-xs font-bold text-slate-500">
              {filteredPayments.length} résultat(s) trouvé(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher élève, référence, école..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            {/* Province Filter */}
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Toutes">Toutes les Provinces</option>
              <option value="Kinshasa">Kinshasa</option>
              <option value="Haut-Katanga">Haut-Katanga</option>
              <option value="Nord-Kivu">Nord-Kivu</option>
              <option value="Kongo-Central">Kongo-Central</option>
              <option value="Lualaba">Lualaba</option>
              <option value="Tshopo">Tshopo</option>
            </select>

            {/* Operator Filter */}
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Tous">Tous les Opérateurs</option>
              <option value="M-Pesa">Vodacom M-Pesa</option>
              <option value="Orange">Orange Money</option>
              <option value="Airtel">Airtel Money</option>
              <option value="Afrimoney">Afrimoney</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Tous">Tous les Statuts</option>
              <option value="Succès">Succès 🟢</option>
              <option value="En attente">En attente 🟡</option>
              <option value="Échoué">Échoué 🔴</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedProvince("Toutes");
                setSelectedSchool("Tous");
                setSelectedOperator("Tous");
                setSelectedStatus("Tous");
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              Réinitialiser Filtres
            </button>
          </div>
        </div>

        {/* TRANSACTIONS TRACEABILITY TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">ID Trans / Date</th>
                  <th className="p-4">Établissement &amp; Province</th>
                  <th className="p-4">Élève &amp; Classe</th>
                  <th className="p-4">Type Frais &amp; Mois</th>
                  <th className="p-4">Montant Total</th>
                  <th className="p-4">Part Établ. (98%)</th>
                  <th className="p-4">Commission (2%)</th>
                  <th className="p-4">Comptes Destination</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredPayments.map((p) => {
                  const comm = p.platformCommissionAmount || (p.amount * 0.02);
                  const net = p.netSchoolAmount || (p.amount * 0.98);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-black text-slate-900 dark:text-white">{p.id}</div>
                        <div className="text-[10px] text-slate-400">{p.createdAt}</div>
                        <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">{p.reference}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{p.schoolName || "CS Saint-Joseph"}</div>
                        <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold rounded-md mt-0.5">
                          {p.province || "Kinshasa"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{p.studentName}</div>
                        <div className="text-[10px] text-slate-400">{p.className}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{p.paymentType}</div>
                        <div className="text-[10px] text-indigo-500 font-bold">{p.paymentMonth || "Annee 2026-2027"}</div>
                      </td>

                      <td className="p-4 font-mono font-black text-sm text-slate-900 dark:text-white">
                        {p.amount} {p.currency}
                      </td>

                      <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {net.toFixed(2)} {p.currency}
                      </td>

                      <td className="p-4 font-mono font-black text-emerald-600 dark:text-emerald-400">
                        +{comm.toFixed(2)} {p.currency}
                      </td>

                      <td className="p-4 text-[10px] space-y-0.5">
                        <div className="text-slate-600 dark:text-slate-300">
                          <span className="font-bold">École:</span> {p.splitSchoolAccount || (p.mobileMoneyGateway ? `${p.mobileMoneyGateway}` : "Compte École")}
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>Plateforme:</span> {p.splitPlatformAccount || (primaryAccount ? `${primaryAccount.provider} (${primaryAccount.phone})` : "M-Pesa Vodacom")}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${
                            p.transactionStatus === "Succès" || p.isValidated
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : p.transactionStatus === "En attente"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"
                          }`}
                        >
                          {p.transactionStatus || (p.isValidated ? "Succès" : "En attente")}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => generateOfficialReceiptPDF(p, p.schoolName || "Complexe Scolaire SmartSchool RDC")}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer mx-auto shadow-sm"
                        >
                          <Printer className="h-3 w-3" />
                          <span>Reçu</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. MODAL: EDIT DEVELOPER MOBILE MONEY ACCOUNT */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase">
                <Smartphone className="h-5 w-5" />
                <span>Modifier Compte Mobile Money Concepteur</span>
              </div>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccountEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fournisseur Mobile Money</label>
                <select
                  value={editingAccount.provider}
                  onChange={(e) => setEditingAccount({ ...editingAccount, provider: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="M-Pesa Vodacom">M-Pesa Vodacom</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Afrimoney">Afrimoney</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Titulaire du Compte</label>
                <input
                  type="text"
                  required
                  value={editingAccount.holderName}
                  onChange={(e) => setEditingAccount({ ...editingAccount, holderName: e.target.value })}
                  placeholder="ex: Ir IT Fred Kalonda (FREDTECH RDC)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Numéro de Téléphone</label>
                <input
                  type="text"
                  required
                  value={editingAccount.phone}
                  onChange={(e) => setEditingAccount({ ...editingAccount, phone: e.target.value })}
                  placeholder="ex: +243 812 345 678 ou 0994202940"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Statut du Compte</label>
                <select
                  value={editingAccount.status}
                  onChange={(e) => setEditingAccount({ ...editingAccount, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Actif">Actif 🟢</option>
                  <option value="Désactivé">Désactivé ⚪</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: CONFIRM TOGGLE STATUS */}
      {confirmToggleAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-up text-center">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
              Confirmer le changement de statut ?
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Voulez-vous vraiment {confirmToggleAccount.status === "Actif" ? "désactiver" : "activer"} le compte{" "}
              <strong className="text-slate-900 dark:text-white">{confirmToggleAccount.provider}</strong> ({confirmToggleAccount.phone}) ?
            </p>

            <div className="pt-2 flex items-center justify-center space-x-2">
              <button
                onClick={() => setConfirmToggleAccount(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmToggleStatus}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl cursor-pointer shadow-md"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: CONFIRM SET PRIMARY ACCOUNT */}
      {confirmPrimaryAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-up text-center">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
              <Star className="h-6 w-6 fill-emerald-500" />
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
              Définir comme Compte Principal ?
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Toutes les commissions futures prélevées sur les paiements des écoles seront dirigées vers{" "}
              <strong className="text-emerald-500">{confirmPrimaryAccount.provider} ({confirmPrimaryAccount.phone})</strong>.
            </p>

            <div className="pt-2 flex items-center justify-center space-x-2">
              <button
                onClick={() => setConfirmPrimaryAccount(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSetPrimary}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl cursor-pointer shadow-md"
              >
                Confirmer Choix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
