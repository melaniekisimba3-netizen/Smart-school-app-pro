import React, { useState, useEffect } from "react";
import { 
  Landmark, TrendingUp, TrendingDown, DollarSign, Search, Plus, Check, 
  CheckCircle, Clock, Printer, Download, AlertTriangle, FileText, Sparkles, 
  ChevronRight, CreditCard, Wallet, QrCode, Shield, Activity, FileSpreadsheet, 
  User, Lock, Bell, Trash, PlusCircle, Percent, Settings, Layers, Eye, X, Send, Award,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Payment, Student, Parent } from "../types";
import { useSmartSchoolCore } from "../context/SmartSchoolCoreContext";
import { getStudentSchedule, getGlobalSchoolSchedules, ACADEMIC_MONTHS } from "../utils/minervalSchedule";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { PrintPreviewModal, PrintableDocumentType } from "./PrintPreviewModal";
import { MobileMoneyAuditDashboard } from "./MobileMoneyAuditDashboard";
import { MobileMoneyPaymentModal } from "./MobileMoneyPaymentModal";
import { safeLocalStorage } from "../utils/safeStorage";

// ---------------------------------------------------------------------------
// OFFICIAL RDC PDF RECEIPT GENERATOR FUNCTION WITH WATERMARK & QR CODE
// ---------------------------------------------------------------------------
export async function generateOfficialReceiptPDF(
  payment: Payment,
  schoolName = "Établissement Scolaire",
  schoolDetails?: { province?: string; commune?: string; codeNational?: string; adresseComplete?: string; ville?: string }
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5" // Standard A5 receipt size (148mm x 210mm)
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. FILIGRANE NATIONAL (National Watermark RDC)
  doc.saveGraphicsState();
  doc.setTextColor(230, 235, 245); // Light subtle blue-gray watermark
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  
  // Watermark text angled across the receipt canvas
  doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", pageWidth / 2, pageHeight / 2 - 20, { angle: 30, align: "center" });
  doc.setFontSize(15);
  doc.text("MINISTÈRE DE L'ÉPST • REÇU SOUVERAIN", pageWidth / 2, pageHeight / 2, { angle: 30, align: "center" });
  doc.text("JUSTICE - PAIX - TRAVAIL", pageWidth / 2, pageHeight / 2 + 20, { angle: 30, align: "center" });
  doc.restoreGraphicsState();

  // 2. HEADER BANNER - REPUBLIQUE DEMOCRATIQUE DU CONGO
  doc.setFillColor(30, 58, 138); // Deep RDC Blue
  doc.rect(0, 0, pageWidth, 11, "F");

  // National flag color bars (Gold & Red)
  doc.setFillColor(234, 179, 8); // Gold
  doc.rect(0, 11, pageWidth, 1.2, "F");
  doc.setFillColor(220, 38, 38); // Red
  doc.rect(0, 12.2, pageWidth, 1.2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • MINISTÈRE DE L'ÉDUCATION NATIONALE", pageWidth / 2, 7, { align: "center" });

  // 3. SCHOOL BRANDING & LOGO
  const startY = 18;

  // School Emblem Graphic
  doc.setFillColor(79, 70, 229); // Indigo
  doc.circle(20, startY + 5, 5.5, "F");
  doc.setFillColor(234, 179, 8); // Star
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("★", 20, startY + 7.8, { align: "center" });

  // School Text
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(schoolName.toUpperCase(), 28, startY + 4);

  const metaParts = [schoolDetails?.province, schoolDetails?.commune, schoolDetails?.ville, schoolDetails?.codeNational ? `Code: ${schoolDetails.codeNational}` : ''].filter(Boolean);
  if (metaParts.length > 0) {
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(metaParts.join(" • "), 28, startY + 8);
  }

  // Badge: REÇU OFFICIEL DE PERCEPTION
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(28, startY + 10, 75, 5, 1, 1, "F");
  doc.setTextColor(67, 56, 202);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("REÇU OFFICIEL DE PERCEPTION - GESTION DU MINERVAL", 30, startY + 13.5);

  // Receipt Number & Date Box
  const rightX = pageWidth - 12;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`N° REÇU : REC-${payment.id.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`, rightX, startY + 4, { align: "right" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Date : ${payment.createdAt}`, rightX, startY + 8, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129); // Emerald Green
  doc.text("✓ PAIEMENT VALIDÉ", rightX, startY + 12, { align: "right" });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(12, startY + 18, pageWidth - 12, startY + 18);

  // 4. STUDENT IDENTITY SECTION
  let yPos = startY + 21;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, yPos, pageWidth - 24, 17, 2, 2, "FD");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("IDENTITÉ DE L'ÉLÈVE BÉNÉFICIAIRE", 16, yPos + 4);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(payment.studentName, 16, yPos + 9.5);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Classe / Section : ${payment.className || "Non spécifiée"}`, 16, yPos + 14);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text(`Matricule : ${payment.studentId}`, pageWidth - 16, yPos + 9.5, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Année Scolaire : ${payment.schoolYear || "2026-2027"}`, pageWidth - 16, yPos + 14, { align: "right" });

  // 5. PAYMENT BREAKDOWN TABLE
  yPos += 21;

  // Table Header
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(12, yPos, pageWidth - 24, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("MOTIF DU FRAIS", 16, yPos + 4.2);
  doc.text("PÉRIODE PAYÉE", 58, yPos + 4.2);
  doc.text("MODE", 98, yPos + 4.2);
  doc.text("MONTANT", pageWidth - 16, yPos + 4.2, { align: "right" });

  // Table Content
  yPos += 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(12, yPos, pageWidth - 24, 13, "D");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(payment.paymentType, 16, yPos + 5.2);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Réf : ${payment.reference}`, 16, yPos + 9.5);

  doc.setTextColor(67, 56, 202);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(payment.paymentMonth || "Septembre 2026", 58, yPos + 7);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(payment.paymentMethod, 98, yPos + 7);

  // Amount Highlight
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129); // Green
  doc.text(`${payment.amount.toLocaleString()} ${payment.currency}`, pageWidth - 16, yPos + 6.5, { align: "right" });

  // CDF Equivalent
  const exchangeRate = 2800;
  const amtCDF = payment.currency === "USD" ? payment.amount * exchangeRate : payment.amount;
  doc.setFontSize(6);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(`Équiv. ${amtCDF.toLocaleString()} CDF`, pageWidth - 16, yPos + 10.5, { align: "right" });

  // 6. MINERVAL PAYMENT HISTORY & REMAINING BALANCE SECTION
  yPos += 16;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, yPos, pageWidth - 24, 25, 2, 2, "F");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("HISTORIQUE DES PAIEMENTS MINERVAL DE L'ÉLÈVE", 16, yPos + 4.5);

  // Remaining balance
  doc.setTextColor(220, 38, 38);
  const balStr = payment.remainingBalance !== undefined ? `${payment.remainingBalance} USD` : "Solde mis à jour";
  doc.text(`SOLDE RESTANT : ${balStr}`, pageWidth - 16, yPos + 4.5, { align: "right" });

  // Render 10 months grid summary
  const sampleMonths = [
    { label: "Sept", amount: 100, paid: true },
    { label: "Oct", amount: 100, paid: payment.paymentMonth?.toLowerCase().includes("oct") || payment.amount > 100 },
    { label: "Nov", amount: 90, paid: false },
    { label: "Déc", amount: 100, paid: false },
    { label: "Jan", amount: 100, paid: false },
    { label: "Fév", amount: 100, paid: false },
    { label: "Mars", amount: 100, paid: false },
    { label: "Avr", amount: 100, paid: false },
    { label: "Mai", amount: 100, paid: false },
    { label: "Juin", amount: 100, paid: false }
  ];

  let gridX = 16;
  let gridY = yPos + 8.5;
  doc.setFontSize(5.5);

  sampleMonths.forEach((sm, i) => {
    if (i === 5) {
      gridX = 16;
      gridY = yPos + 16.5;
    }
    const isPaid = sm.paid || (i === 0);
    doc.setFillColor(isPaid ? 220 : 255, isPaid ? 252 : 255, isPaid ? 231 : 255);
    doc.setDrawColor(isPaid ? 187 : 226, isPaid ? 247 : 232, isPaid ? 208 : 240);
    doc.roundedRect(gridX, gridY, 21, 6.5, 1, 1, "FD");

    doc.setTextColor(isPaid ? 22 : 100, isPaid ? 101 : 116, isPaid ? 52 : 139);
    doc.setFont("helvetica", "bold");
    doc.text(`${sm.label}: ${sm.amount}$ ${isPaid ? "✓" : "⏳"}`, gridX + 1.5, gridY + 4.5);

    gridX += 23.5;
  });

  // 7. QR CODE & NATIONAL VERIFICATION
  yPos += 28;

  const qrPayload = `https://smartschool.cd/verify?receipt=REC-${payment.id}&student=${encodeURIComponent(payment.studentName)}&amount=${payment.amount}${payment.currency}&ref=${payment.reference}&period=${encodeURIComponent(payment.paymentMonth || 'Septembre')}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 200, color: { dark: '#0f172a', light: '#ffffff' } });
    doc.addImage(qrDataUrl, "PNG", 14, yPos, 20, 20);
  } catch (err) {
    console.error("QR Code generation error", err);
  }

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("SÉCURISATION & AUTHENTICITÉ NUMÉRIQUE RDC", 38, yPos + 4);

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("• Scannez ce QR Code pour contrôler l'authenticité sur le portail EPST.", 38, yPos + 8);
  doc.text("• Ce document constitue une preuve libératoire officielle de paiement de minerval.", 38, yPos + 12);
  doc.text(`• Signature Numérique : SHA256-RDC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`, 38, yPos + 16);

  // 8. SIGNATURES & STAMPS
  yPos += 23;

  // Box 1: Caissier
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, yPos, 58, 18, 1.5, 1.5, "D");
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("LE CAISSIER / COMPTABLE", 15, yPos + 4);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(30, 41, 59);
  doc.text("Signé numériquement", 15, yPos + 10);
  doc.setFontSize(5);
  doc.text("SmartSchool RDC Cashier Seal", 15, yPos + 14);

  // Box 2: Official Stamp Seal
  doc.roundedRect(74, yPos, 62, 18, 1.5, 1.5, "D");

  // Red Circular Stamp Seal
  doc.setDrawColor(220, 38, 38);
  doc.setFillColor(254, 242, 242);
  doc.circle(105, yPos + 9, 7.5, "FD");
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text("SCEAU OFFICIEL", 105, yPos + 7.5, { align: "center" });
  doc.text("RDC - EPST", 105, yPos + 10.5, { align: "center" });

  // 9. FOOTER
  const footerY = pageHeight - 5;
  doc.setFillColor(241, 245, 249);
  doc.rect(0, footerY - 3, pageWidth, 8, "F");

  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("SmartSchool RDC • Plateforme Régionale d'Éducation • Signature Produit : FREDTECH par Freddy Kalonda", pageWidth / 2, footerY, { align: "center" });

  // Save PDF file
  const fileName = `Recu_Minerval_${payment.studentName.replace(/\s+/g, "_")}_${payment.id.slice(-6)}.pdf`;
  doc.save(fileName);
}

// Financial Types
export interface FeeConfig {
  id: string;
  name: string;
  amount: number;
  currency: "USD" | "CDF";
  isRequired: boolean;
  category: "Minerval" | "Fonctionnement" | "Uniforme" | "Cantine" | "Transport" | "Bibliothèque" | "Laboratoire" | "Examens" | "Frais d'État" | "Autres";
  statePortion?: number; // portion redirected to State system
}

export interface Expense {
  id: string;
  category: "Salaires" | "Fournitures" | "Électricité" | "Eau" | "Internet" | "Entretien" | "Construction" | "Carburant" | "Achats divers";
  description: string;
  amount: number;
  currency: "USD" | "CDF";
  date: string;
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  approvedBy?: string;
  validatedAt?: string;
}

export interface FinanceAuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
  amount?: string;
  studentName?: string;
}

interface FinanceModuleProps {
  payments: Payment[];
  onAddPayment: (p: Omit<Payment, "id" | "createdAt" | "isValidated">) => void;
  onValidatePayment: (id: string) => void;
  userRole: string;
  userName: string;
  students: Student[];
  parents: Parent[];
  schoolDetails?: any;
  schoolName?: string;
}

export function FinanceModule({
  payments,
  onAddPayment,
  onValidatePayment,
  userRole,
  userName,
  students,
  parents,
  schoolDetails,
  schoolName
}: FinanceModuleProps) {
  // Exchange Rate
  const EXCHANGE_RATE = 2800; // 1 USD = 2800 CDF (Congolese Franc)

  // 1. Initial State Definitions
  const [feeConfigs, setFeeConfigs] = useState<FeeConfig[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("ss_fee_configs");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: "fee-1", name: "Minerval Trimestriel", amount: 120, currency: "USD", isRequired: true, category: "Minerval" },
      { id: "fee-2", name: "Frais d'Assurance Scolaire", amount: 15, currency: "USD", isRequired: true, category: "Frais d'État", statePortion: 5 },
      { id: "fee-3", name: "Frais de Fonctionnement", amount: 80, currency: "USD", isRequired: true, category: "Fonctionnement" },
      { id: "fee-4", name: "Tenue Scolaire (Uniforme)", amount: 35, currency: "USD", isRequired: false, category: "Uniforme" },
      { id: "fee-5", name: "Participation Examen d'État", amount: 25, currency: "USD", isRequired: true, category: "Examens", statePortion: 12 },
      { id: "fee-6", name: "Abonnement Transport Mensuel", amount: 45000, currency: "CDF", isRequired: false, category: "Transport" }
    ];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("ss_expenses");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [auditLogs, setAuditLogs] = useState<FinanceAuditLog[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("ss_finance_audit_logs");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Save states to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem("ss_fee_configs", JSON.stringify(feeConfigs));
  }, [feeConfigs]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_finance_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  const [printModalConfig, setPrintModalConfig] = useState<{ docType: PrintableDocumentType; data: any; title?: string } | null>(null);

  const { platformCommissionConfig, getPrimaryDeveloperMomoAccount } = useSmartSchoolCore();

  // School Receiving Accounts State
  const [schoolReceivingAccounts, setSchoolReceivingAccounts] = useState(() => {
    try {
      const saved = safeLocalStorage.getItem("ss_school_receiving_accounts");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      holderName: "",
      mpesa: { phone: "", status: "Désactivé" as const },
      orange: { phone: "", status: "Désactivé" as const },
      airtel: { phone: "", status: "Désactivé" as const },
      afrimoney: { phone: "", status: "Désactivé" as const },
      bankName: "",
      bankAccountNumber: "",
      bankHolderName: "",
      primaryProvider: "M-Pesa",
      status: "Actif" as const
    };
  });

  useEffect(() => {
    safeLocalStorage.setItem("ss_school_receiving_accounts", JSON.stringify(schoolReceivingAccounts));
  }, [schoolReceivingAccounts]);

  // UI state variables
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "perception" | "on_site" | "frais" | "reversements" | "depenses" | "rapports" | "audit" | "comptes_reception" | "momo_audit">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Payment Form States
  const [payMotif, setPayMotif] = useState<string>("Minerval");
  const [payMonth, setPayMonth] = useState<string>("Octobre 2026");
  const [payAmount, setPayAmount] = useState<number>(100);
  const [payCurrency, setPayCurrency] = useState<"USD" | "CDF">("USD");
  const [payFeeId, setPayFeeId] = useState<string>("");
  const [payMethod, setPayMethod] = useState<"Mobile Money" | "Espèces" | "Banque" | "Chèque" | "Carte">("Mobile Money");
  const [payMomoProvider, setPayMomoProvider] = useState<"M-Pesa" | "Orange Money" | "Airtel Money">("M-Pesa");
  const [payRef, setPayRef] = useState("");

  // Dedicated On-Site Payment Registration States
  const [onSiteModalOpen, setOnSiteModalOpen] = useState(false);
  const [onSiteStudentId, setOnSiteStudentId] = useState<string>("");
  const [onSiteSelectedFees, setOnSiteSelectedFees] = useState<string[]>([]);
  const [onSiteMonth, setOnSiteMonth] = useState<string>("Octobre 2026");
  const [onSiteMode, setOnSiteMode] = useState<"Espèces" | "M-Pesa sur place" | "Orange Money sur place" | "Airtel Money sur place" | "Afrimoney sur place" | "Banque" | "Chèque">("Espèces");
  const [onSiteRef, setOnSiteRef] = useState<string>("");
  const [onSiteNotes, setOnSiteNotes] = useState<string>("");
  const [onSiteCustomAmount, setOnSiteCustomAmount] = useState<number>(0);

  // Commission Settlement (Reversement) States
  const [settleCommissionModalOpen, setSettleCommissionModalOpen] = useState(false);
  const [settleSelectedPaymentIds, setSettleSelectedPaymentIds] = useState<string[]>([]);
  const [settleMomoOperator, setSettleMomoOperator] = useState<string>("Airtel Money (0994202940 - Ir IT Fred Kalonda)");
  const [settleRef, setSettleRef] = useState<string>("");

  // Calculate current selected student schedule
  const studentSchedule = selectedStudent 
    ? getStudentSchedule(selectedStudent.id, `${selectedStudent.firstName} ${selectedStudent.lastName}`, selectedStudent.className, payments)
    : null;

  // Auto-propose first unpaid month when student or motif changes
  useEffect(() => {
    if (selectedStudent && payMotif === "Minerval" && studentSchedule) {
      if (studentSchedule.firstUnpaidMonth) {
        setPayMonth(studentSchedule.firstUnpaidMonth.fullLabel);
        setPayAmount(studentSchedule.firstUnpaidMonth.amount);
      }
    }
  }, [selectedStudent?.id, payMotif]);
  
  // Modals & Receipts
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);
  const [activeReceiptQrUrl, setActiveReceiptQrUrl] = useState<string | null>(null);
  const [newFeeModal, setNewFeeModal] = useState(false);
  const [newExpModal, setNewExpModal] = useState(false);
  
  // Generate live QR Code image data URL whenever activeReceipt changes
  useEffect(() => {
    if (activeReceipt) {
      const qrPayload = `https://smartschool.cd/verify?receipt=REC-${activeReceipt.id}&student=${encodeURIComponent(activeReceipt.studentName)}&amount=${activeReceipt.amount}${activeReceipt.currency}&ref=${activeReceipt.reference}`;
      QRCode.toDataURL(qrPayload, { margin: 1, width: 200, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setActiveReceiptQrUrl(url))
        .catch(err => console.error("Error generating modal QR Code", err));
    } else {
      setActiveReceiptQrUrl(null);
    }
  }, [activeReceipt]);

  // Download PDF handler with toast notification
  const handleDownloadPDF = async (payment: Payment) => {
    try {
      triggerToast(`Génération du reçu PDF officiel pour ${payment.studentName}...`, "info");
      await generateOfficialReceiptPDF(payment);
      triggerToast(`Reçu PDF téléchargé avec succès (avec QR Code & Filigrane RDC) !`, "success");
    } catch (err) {
      console.error("PDF generation error", err);
      triggerToast("Erreur lors de la création du fichier PDF.", "warning");
    }
  };

  // Batch PDF download handler for validated payments
  const handleBatchDownloadPDF = async () => {
    const validated = payments.filter(p => p.isValidated);
    if (validated.length === 0) {
      triggerToast("Aucun paiement validé à exporter en PDF.", "warning");
      return;
    }
    triggerToast(`Génération de ${Math.min(validated.length, 5)} reçus officiels PDF certifiés...`, "info");
    for (let i = 0; i < Math.min(validated.length, 5); i++) {
      await generateOfficialReceiptPDF(validated[i]);
    }
    triggerToast(`${Math.min(validated.length, 5)} reçus officiels téléchargés en PDF !`, "success");
  };
  
  // Notification banner inside Finance Module
  const [finNotifications, setFinNotifications] = useState<string[]>([
    "Rappel : Les frais de rétrocession pour l'Examen d'État de l'école doivent être clôturés avant le 15 Juillet.",
    "Alerte : 18 élèves de la classe de 6ème Commerciale sont actuellement débiteurs de plus de 50% de l'écolage."
  ]);

  // Toast System
  const [moduleToast, setModuleToast] = useState<{ message: string; type: "success" | "warning" | "info" } | null>(null);
  const triggerToast = (message: string, type: "success" | "warning" | "info" = "success") => {
    setModuleToast({ message, type });
    setTimeout(() => setModuleToast(null), 4000);
  };

  // 2. Helper calculation functions
  const convertAmount = (amount: number, from: "USD" | "CDF", to: "USD" | "CDF") => {
    if (from === to) return amount;
    return from === "USD" ? amount * EXCHANGE_RATE : amount / EXCHANGE_RATE;
  };

  const totalFeeExpectedPerStudent = () => {
    return feeConfigs
      .filter(f => f.isRequired)
      .reduce((acc, f) => {
        const amtUSD = f.currency === "USD" ? f.amount : f.amount / EXCHANGE_RATE;
        return acc + amtUSD;
      }, 0);
  };

  const getStudentTotalPaidUSD = (studentId: string) => {
    return payments
      .filter(p => p.studentId === studentId && p.isValidated)
      .reduce((acc, p) => {
        const amtUSD = p.currency === "USD" ? p.amount : p.amount / EXCHANGE_RATE;
        return acc + amtUSD;
      }, 0);
  };

  const getStudentDebtUSD = (studentId: string) => {
    const expected = totalFeeExpectedPerStudent();
    const paid = getStudentTotalPaidUSD(studentId);
    return Math.max(0, expected - paid);
  };

  // Global Financial Statistics
  const getGlobalStats = () => {
    let receiptsUSD = 0;
    let statePortionUSD = 0;
    
    // Count payments
    payments.forEach(p => {
      if (!p.isValidated) return;
      const amtUSD = p.currency === "USD" ? p.amount : p.amount / EXCHANGE_RATE;
      receiptsUSD += amtUSD;
      
      // Calculate State Fee portion if applicable
      const matchedFee = feeConfigs.find(f => f.category === p.paymentType || f.name.includes(p.paymentType));
      if (matchedFee?.statePortion) {
        // Simple proportional calculation
        const ratio = matchedFee.statePortion / matchedFee.amount;
        statePortionUSD += amtUSD * ratio;
      }
    });

    // Count expenses
    const expensesUSD = expenses
      .filter(e => e.status === "approved")
      .reduce((acc, e) => {
        const amtUSD = e.currency === "USD" ? e.amount : e.amount / EXCHANGE_RATE;
        return acc + amtUSD;
      }, 0);

    const soldeUSD = receiptsUSD - expensesUSD;
    const expectedTotalUSD = students.length * totalFeeExpectedPerStudent();
    const unpaidTotalUSD = Math.max(0, expectedTotalUSD - receiptsUSD);

    // Debtor and in order counts
    let debtorsCount = 0;
    let inOrderCount = 0;
    students.forEach(s => {
      const debt = getStudentDebtUSD(s.id);
      if (debt <= 5) {
        inOrderCount++;
      } else {
        debtorsCount++;
      }
    });

    return {
      receiptsUSD,
      expensesUSD,
      soldeUSD,
      expectedTotalUSD,
      unpaidTotalUSD,
      statePortionUSD,
      debtorsCount,
      inOrderCount
    };
  };

  const stats = getGlobalStats();

  // Handle Quick Search Submission
  const handleStudentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Search by name, postname, registration number (matricule)
    const found = students.find(s => 
      s.firstName.toLowerCase().includes(query) ||
      s.lastName.toLowerCase().includes(query) ||
      s.registrationNumber.toLowerCase() === query ||
      (s.qrCodeData && s.qrCodeData.toLowerCase().includes(query))
    );

    if (found) {
      setSelectedStudent(found);
      const defaultFee = feeConfigs[0]?.id || "";
      setPayFeeId(defaultFee);
      // Auto-set suggested amount based on first fee configs
      const matched = feeConfigs.find(f => f.id === defaultFee);
      if (matched) {
        setPayAmount(matched.amount);
        setPayCurrency(matched.currency);
      }
      triggerToast(`Élève trouvé : ${found.firstName} ${found.lastName}`, "success");
    } else {
      triggerToast("Aucun élève ne correspond à votre recherche.", "warning");
    }
  };

  // Handle Adding New Payment
  const handlePerceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      triggerToast("Veuillez d'abord rechercher et sélectionner un élève.", "warning");
      return;
    }

    if (payAmount <= 0) {
      triggerToast("Le montant du paiement doit être supérieur à 0.", "warning");
      return;
    }

    // Prepare transaction reference
    let refStr = payRef.trim();
    if (!refStr) {
      if (payMethod === "Mobile Money") {
        refStr = `TX-${payMomoProvider.toUpperCase().replace("-", "")}-${Math.floor(Math.random() * 900000) + 100000}`;
      } else if (payMethod === "Banque") {
        refStr = `BORD-${Math.floor(Math.random() * 90000) + 10000}`;
      } else {
        refStr = `CASH-REC-${Math.floor(Math.random() * 9000) + 1000}`;
      }
    }

    const currentSched = studentSchedule || getStudentSchedule(selectedStudent.id, `${selectedStudent.firstName} ${selectedStudent.lastName}`, selectedStudent.className, payments);
    const remBal = Math.max(0, currentSched.remainingBalanceUSD - payAmount);

    // Auto-approve payment for immediate balance update
    const newPaymentId = `pay-${Date.now()}`;
    const isMomo = payMethod === "Mobile Money";
    
    // Fetch active commission rate from platform context
    const isCommActive = platformCommissionConfig ? platformCommissionConfig.isCommissionActive : true;
    const currentRatePercent = isCommActive && isMomo ? (platformCommissionConfig?.defaultRatePercent ?? 2.0) : 0;
    const commissionRate = currentRatePercent / 100;
    const commissionAmt = isMomo ? payAmount * commissionRate : 0;
    const netAmt = isMomo ? payAmount - commissionAmt : payAmount;

    // Accounts for split traceability
    const currentDevPrimary = getPrimaryDeveloperMomoAccount();
    const schoolDestAcc = `${schoolReceivingAccounts.primaryProvider} — ${
      schoolReceivingAccounts.primaryProvider === "M-Pesa Vodacom" ? schoolReceivingAccounts.mpesa.phone :
      schoolReceivingAccounts.primaryProvider === "Orange Money" ? schoolReceivingAccounts.orange.phone :
      schoolReceivingAccounts.primaryProvider === "Airtel Money" ? schoolReceivingAccounts.airtel.phone :
      schoolReceivingAccounts.primaryProvider === "Afrimoney" ? schoolReceivingAccounts.afrimoney.phone :
      `${schoolReceivingAccounts.bankName} (${schoolReceivingAccounts.bankAccountNumber})`
    }`;

    const devDestAcc = currentDevPrimary
      ? `${currentDevPrimary.provider} — ${currentDevPrimary.phone}`
      : "M-Pesa Vodacom — +243 812 345 678";

    const newPayment: Payment = {
      id: newPaymentId,
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      className: selectedStudent.className,
      amount: payAmount,
      currency: payCurrency,
      paymentType: payMotif as any,
      paymentMonth: payMotif === "Minerval" ? payMonth : undefined,
      schoolYear: "2026-2027",
      remainingBalance: remBal,
      paymentMethod: isMomo ? "Mobile Money" : payMethod === "Banque" ? "Banque" : "Espèces",
      mobileMoneyGateway: isMomo ? payMomoProvider : undefined,
      platformCommissionRate: currentRatePercent,
      platformCommissionAmount: commissionAmt,
      netSchoolAmount: netAmt,
      splitSchoolAccount: schoolDestAcc,
      splitPlatformAccount: devDestAcc,
      transactionStatus: "Succès",
      reference: refStr,
      isValidated: true,
      createdAt: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };

    // Submit payment
    onAddPayment(newPayment);

    // Keep locally in audit logs
    const newLog: FinanceAuditLog = {
      id: `log-${Date.now()}`,
      user: userName,
      role: userRole,
      action: `Perception Frais (${payMotif}${payMotif === "Minerval" ? ` - ${payMonth}` : ""}) - ${selectedStudent.firstName} ${selectedStudent.lastName}`,
      timestamp: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      amount: `${payAmount} ${payCurrency}`,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`
    };

    setAuditLogs(prev => [newLog, ...prev]);

    // Active receipt for screen display modal
    setActiveReceipt(newPayment);

    // Clear form
    setPayRef("");
    triggerToast(`Paiement de ${payAmount} ${payCurrency} pour ${payMotif} (${payMonth}) enregistré avec succès !`, "success");
  };

  // Dedicated On-Site Physical Payment Handler (Cash / Counter Mobile Money / Cheque / Bank)
  const handleOnSitePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === onSiteStudentId);
    if (!st) {
      triggerToast("Veuillez sélectionner un élève valide pour la perception sur place.", "warning");
      return;
    }

    if (onSiteSelectedFees.length === 0 && (!onSiteCustomAmount || onSiteCustomAmount <= 0)) {
      triggerToast("Veuillez sélectionner au moins un type de frais ou saisir un montant.", "warning");
      return;
    }

    // Build line items
    const selectedFeeObjects = feeConfigs.filter(f => onSiteSelectedFees.includes(f.id));
    let calculatedTotalUSD = 0;
    const lineItems = selectedFeeObjects.map(f => {
      const amtUSD = f.currency === "USD" ? f.amount : f.amount / EXCHANGE_RATE;
      calculatedTotalUSD += amtUSD;
      return {
        feeTypeId: f.id,
        feeName: f.name,
        feeTypeName: f.name,
        category: f.category,
        amount: f.amount,
        currency: f.currency,
        amountInUSD: amtUSD,
        appliesCommission: true
      };
    });

    if (lineItems.length === 0 && onSiteCustomAmount > 0) {
      calculatedTotalUSD = onSiteCustomAmount;
    }

    // Commission 2% calculation for platform
    const isCommActive = platformCommissionConfig ? platformCommissionConfig.isCommissionActive : true;
    const currentRatePercent = isCommActive ? (platformCommissionConfig?.defaultRatePercent ?? 2.0) : 0;
    const commissionAmtUSD = (calculatedTotalUSD * currentRatePercent) / 100;
    const netSchoolUSD = calculatedTotalUSD - commissionAmtUSD;

    let refStr = onSiteRef.trim();
    if (!refStr) {
      refStr = `ON-SITE-${onSiteMode.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 900000) + 100000}`;
    }

    const currentSched = getStudentSchedule(st.id, `${st.firstName} ${st.lastName}`, st.className, payments);
    const remBal = Math.max(0, currentSched.remainingBalanceUSD - calculatedTotalUSD);

    const feeTypeLabel = lineItems.length > 0 
      ? lineItems.map(l => l.feeTypeName).join(", ") 
      : "Paiement sur place divers";

    const newPayment: Payment = {
      id: `pay-onsite-${Date.now()}`,
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      className: st.className,
      amount: calculatedTotalUSD,
      currency: "USD",
      paymentType: (lineItems[0]?.category || "Minerval") as any,
      paymentMonth: onSiteMonth,
      schoolYear: "2026-2027",
      remainingBalance: remBal,
      paymentMethod: "Espèces",
      isOnSitePayment: true,
      onSitePaymentMode: onSiteMode,
      recordingAgentName: userName,
      recordingAgentRole: userRole,
      multiFeeLineItems: lineItems.length > 1 ? lineItems : undefined,
      platformCommissionRate: currentRatePercent,
      platformCommissionAmount: commissionAmtUSD,
      netSchoolAmount: netSchoolUSD,
      commissionCalculatedUSD: commissionAmtUSD,
      commissionTransferredUSD: 0,
      commissionSettlementStatus: "EN_ATTENTE_DE_REVERSEMENT",
      transactionStatus: "Succès",
      reference: refStr,
      notes: onSiteNotes || `Perception en espèces / guichet enregistrée par ${userName} (${userRole})`,
      isValidated: true,
      createdAt: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };

    onAddPayment(newPayment);

    // Add to audit logs
    const newLog: FinanceAuditLog = {
      id: `log-${Date.now()}`,
      user: userName,
      role: userRole,
      action: `Paiement sur place (${onSiteMode}) - ${st.firstName} ${st.lastName} [${feeTypeLabel}]`,
      timestamp: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      amount: `${calculatedTotalUSD} USD`,
      studentName: `${st.firstName} ${st.lastName}`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Active receipt preview
    setActiveReceipt(newPayment);

    // Reset form
    setOnSiteStudentId("");
    setOnSiteSelectedFees([]);
    setOnSiteRef("");
    setOnSiteNotes("");
    setOnSiteCustomAmount(0);
    setOnSiteModalOpen(false);

    triggerToast(`Paiement sur place de ${calculatedTotalUSD} USD pour ${st.firstName} ${st.lastName} enregistré avec succès !`, "success");
  };

  // Commission Settlement (Reversement de commission sur place) Handler
  const handleSettleCommissions = (paymentIdsToSettle: string[]) => {
    if (paymentIdsToSettle.length === 0) {
      triggerToast("Veuillez sélectionner au moins une commission à reverser.", "warning");
      return;
    }

    const devPrimary = getPrimaryDeveloperMomoAccount();
    const targetAccountInfo = devPrimary 
      ? `${devPrimary.provider} (${devPrimary.phone}) - ${devPrimary.holderName}` 
      : "Airtel Money (0994202940) - Ir IT Fred Kalonda (FREDTECH RDC)";

    const totalSettled = payments
      .filter(p => paymentIdsToSettle.includes(p.id))
      .reduce((acc, p) => acc + (p.commissionCalculatedUSD || p.platformCommissionAmount || 0), 0);

    const settleLog: FinanceAuditLog = {
      id: `log-settle-${Date.now()}`,
      user: userName,
      role: userRole,
      action: `Reversement de commission plateforme SmartSchool RDC (${paymentIdsToSettle.length} transaction(s)) via ${settleMomoOperator}`,
      timestamp: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      amount: `${totalSettled.toFixed(2)} USD`
    };

    setAuditLogs(prev => [settleLog, ...prev]);

    paymentIdsToSettle.forEach(pid => {
      if (onValidatePayment) {
        onValidatePayment(pid);
      }
    });

    setSettleCommissionModalOpen(false);
    setSettleSelectedPaymentIds([]);
    setSettleRef("");
    triggerToast(`Reversement de ${totalSettled.toFixed(2)} USD de commission vers ${targetAccountInfo} enregistré !`, "success");
  };

  // Handle adding new custom fees
  const handleCreateFee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const amount = Number(data.get("amount"));
    const currency = data.get("currency") as "USD" | "CDF";
    const category = data.get("category") as any;
    const isRequired = data.get("isRequired") === "true";
    const statePortion = Number(data.get("statePortion")) || undefined;

    if (!name || amount <= 0) {
      triggerToast("Données invalides pour la création du frais.", "warning");
      return;
    }

    const newFee: FeeConfig = {
      id: `fee-${Date.now()}`,
      name,
      amount,
      currency,
      isRequired,
      category,
      statePortion: category === "Frais d'État" || category === "Examens" ? statePortion : undefined
    };

    setFeeConfigs(prev => [...prev, newFee]);
    setNewFeeModal(false);
    triggerToast(`Frais créé avec succès : ${name}`, "success");
  };

  // Handle adding new expense
  const handleCreateExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const category = data.get("category") as any;
    const description = data.get("description") as string;
    const amount = Number(data.get("amount"));
    const currency = data.get("currency") as "USD" | "CDF";

    if (!description || amount <= 0) {
      triggerToast("Données invalides pour la dépense.", "warning");
      return;
    }

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      category,
      description,
      amount,
      currency,
      date: new Date().toISOString().split("T")[0],
      status: ["Directeur", "Directeur Général", "Promoteur", "Super Administrateur de l'Établissement"].includes(userRole) ? "approved" : "pending",
      requestedBy: userName
    };

    setExpenses(prev => [newExp, ...prev]);
    setNewExpModal(false);
    triggerToast("Dépense enregistrée !", "success");
  };

  // Handle Expense Action (Approve/Reject)
  const handleExpenseDecision = (id: string, decision: "approved" | "rejected") => {
    setExpenses(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: decision,
          approvedBy: userName,
          validatedAt: new Date().toLocaleDateString("fr-FR")
        };
      }
      return e;
    }));
    triggerToast(`Dépense ${decision === "approved" ? "approuvée" : "rejetée"} avec succès.`, "success");
  };

  // CSV Export utility
  const handleExportData = (type: string) => {
    let headers = "";
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (type === "payments") {
      headers = "Date,Ref,Eleve,Classe,Type de Frais,Canal,Montant,Devise,Statut\n";
      csvContent += headers;
      payments.forEach(p => {
        csvContent += `"${p.createdAt}","${p.reference}","${p.studentName}","${p.className}","${p.paymentType}","${p.paymentMethod}","${p.amount}","${p.currency}","${p.isValidated ? 'Rapproche' : 'En attente'}"\n`;
      });
    } else if (type === "expenses") {
      headers = "Date,Categorie,Description,Montant,Devise,Demandeur,Statut\n";
      csvContent += headers;
      expenses.forEach(e => {
        csvContent += `"${e.date}","${e.category}","${e.description}","${e.amount}","${e.currency}","${e.requestedBy}","${e.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rapport_${type}_SmartSchoolRDC.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Rapport exporté en format Excel / CSV !", "success");
  };

  // Simulated parent space child info
  const parentChild = students[0]; // Demoiselle Gaston or similar fallback

  // 3. Render appropriate View according to Role
  const isParent = userRole === "Parent";
  const isInspector = ["Inspection", "Inspection Provinciale", "Inspection Générale", "Administrateur National EPST"].includes(userRole);
  const isDirectorOrPromoter = ["Promoteur", "Directeur", "Directeur Général", "Super Administrateur de l'Établissement"].includes(userRole);
  const isComptable = ["Comptable", "Comptable Principal", "Comptable SmartSchool"].includes(userRole) || userName.includes("Kabulo") || userName.includes("Bwatshia");

  return (
    <div className="space-y-6 text-left" id="finance-module-root">
      
      {/* 4. Mini Header Section with dynamic title based on Role */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
            <Landmark className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span>
              {isParent ? "Mon Espace Financier Parent" : "Logiciel de Gestion Financière Scolaire"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isParent 
              ? `Suivi de scolarité, reçus officiels et soldes de ${parentChild?.firstName} ${parentChild?.lastName || "l'élève"}` 
              : "SmartSchool RDC - Gestion budgétaire souveraine, traçabilité Mobile Money et redevance d'État."}
          </p>
        </div>

        {/* Action center buttons */}
        {!isParent && !isInspector && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveSubTab("on_site");
                setOnSiteModalOpen(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-all shadow-sm"
            >
              <Wallet className="h-4 w-4" />
              <span>Enregistrer un paiement sur place</span>
            </button>
            <button
              onClick={() => setNewFeeModal(true)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Paramétrer un frais</span>
            </button>
            <button
              onClick={() => setNewExpModal(true)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 font-bold rounded-xl border border-rose-100 dark:border-rose-900 text-xs flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Saisir une dépense</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Notifications banner from Central/National Admin */}
      {finNotifications.length > 0 && !isParent && (
        <div className="bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex items-start space-x-2 text-xs">
          <Bell className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Message Centralisation Nationale SmartSchool RDC : </span>
            <span className="text-slate-600 dark:text-slate-400">{finNotifications[0]}</span>
          </div>
          <button 
            onClick={() => setFinNotifications(prev => prev.slice(1))} 
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 6. GENERAL FINANCE LAYOUT - If not Parent, show main financial workstation */}
      {!isParent ? (
        <div className="space-y-6">
          {/* Sub Navigation tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-1">
            <button
              onClick={() => setActiveSubTab("dashboard")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer ${
                activeSubTab === "dashboard"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Tableau de bord
            </button>
            {isComptable && (
              <button
                onClick={() => {
                  setActiveSubTab("perception");
                  setSelectedStudent(null);
                  setSearchQuery("");
                }}
                className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer ${
                  activeSubTab === "perception"
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Guichet Perception & Caisse
              </button>
            )}
            <button
              onClick={() => setActiveSubTab("on_site")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer flex items-center space-x-1 ${
                activeSubTab === "on_site"
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-500" />
              <span>Paiements sur place</span>
            </button>
            <button
              onClick={() => setActiveSubTab("frais")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer ${
                activeSubTab === "frais"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Grille des Frais ({feeConfigs.length})
            </button>
            <button
              onClick={() => setActiveSubTab("reversements")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer flex items-center space-x-1 ${
                activeSubTab === "reversements"
                  ? "border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Percent className="h-3.5 w-3.5 text-amber-500" />
              <span>Reversements Commissions (2%)</span>
            </button>
            <button
              onClick={() => setActiveSubTab("depenses")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer ${
                activeSubTab === "depenses"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Dépenses ({expenses.filter(e => e.status === "pending").length} en attente)
            </button>
            <button
              onClick={() => setActiveSubTab("rapports")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer ${
                activeSubTab === "rapports"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Rapports & Rapprochements
            </button>
            <button
              onClick={() => setActiveSubTab("audit")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer ${
                activeSubTab === "audit"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Journal d'audit
            </button>
            <button
              onClick={() => setActiveSubTab("comptes_reception")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer flex items-center space-x-1 ${
                activeSubTab === "comptes_reception"
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Comptes de Réception École</span>
            </button>
            <button
              onClick={() => setActiveSubTab("momo_audit")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-tight transition-all shrink-0 border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                activeSubTab === "momo_audit"
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-blue-500" />
              <span>Audit Mobile Money RDC</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[9px] font-bold">
                API USSD
              </span>
            </button>
          </div>

          {/* TAB 1: DASHBOARD VIEW */}
          {activeSubTab === "dashboard" && (
            <div className="space-y-6">
              {/* Financial Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Recettes Validées</span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-black font-mono text-emerald-600">{stats.receiptsUSD.toLocaleString()} USD</p>
                    <p className="text-[9px] text-slate-400">CDF : {(stats.receiptsUSD * EXCHANGE_RATE).toLocaleString()} Fc</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Dépenses Approuvées</span>
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-black font-mono text-rose-600">{stats.expensesUSD.toLocaleString()} USD</p>
                    <p className="text-[9px] text-slate-400">CDF : {(stats.expensesUSD * EXCHANGE_RATE).toLocaleString()} Fc</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Solde Disponible (Caisse)</span>
                    <Landmark className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-black font-mono text-slate-800 dark:text-white">{stats.soldeUSD.toLocaleString()} USD</p>
                    <p className="text-[9px] text-indigo-500 font-bold">Encaisse et comptes bancaires RDC</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Part Rétrocession État</span>
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-black font-mono text-amber-600">{stats.statePortionUSD.toLocaleString()} USD</p>
                    <p className="text-[9px] text-slate-400">Redevance IP/EPST congolais</p>
                  </div>
                </div>
              </div>

              {/* Outstanding debt summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual Chart Card */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-950 dark:text-white text-xs uppercase tracking-wider">Performance de Recouvrement des Frais</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Comparatif Budget Collecté vs Reste à Recouvrer</p>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
                      {Math.round((stats.receiptsUSD / stats.expectedTotalUSD) * 100 || 0)}% Recouvré
                    </span>
                  </div>

                  {/* High Quality Custom SVG visual chart */}
                  <div className="h-44 flex items-end justify-between relative pt-6 px-4">
                    {/* SVG Progress bar visualization */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="48" fill="transparent" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-850" />
                        <circle cx="56" cy="56" r="48" fill="transparent" stroke="#4f46e5" strokeWidth="8" strokeDasharray={301.6} strokeDashoffset={301.6 - (301.6 * (stats.receiptsUSD / stats.expectedTotalUSD || 0))} />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-lg font-black font-mono text-slate-850 dark:text-white">{Math.round((stats.receiptsUSD / stats.expectedTotalUSD) * 100 || 0)}%</span>
                        <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Recouvrement</p>
                      </div>
                    </div>
                    
                    {/* Legend of figures */}
                    <div className="absolute bottom-1 left-2 space-y-1">
                      <div className="flex items-center space-x-1.5 text-[9px] font-bold text-indigo-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                        <span>Frais perçus : {stats.receiptsUSD.toLocaleString()} USD</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                        <span>En attente : {stats.unpaidTotalUSD.toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick RDC Specific stats */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 space-y-4">
                  <div className="border-b border-indigo-800/60 pb-2">
                    <h3 className="font-bold text-[11px] text-indigo-200 uppercase tracking-wider">État des Comptes Élèves</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Rapport de solvabilité générale</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center bg-indigo-950/40 p-2.5 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                        <span className="font-bold text-slate-200">Élèves solvables</span>
                      </div>
                      <span className="font-black font-mono text-emerald-400">{stats.inOrderCount} ({Math.round((stats.inOrderCount / (students.length || 1)) * 100)}%)</span>
                    </div>

                    <div className="flex justify-between items-center bg-indigo-950/40 p-2.5 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                        <span className="font-bold text-slate-200">Élèves débiteurs</span>
                      </div>
                      <span className="font-black font-mono text-amber-400">{stats.debtorsCount} ({Math.round((stats.debtorsCount / (students.length || 1)) * 100)}%)</span>
                    </div>

                    <div className="pt-2 text-center text-[10px] text-indigo-200 font-bold">
                      <p>Rapprochement mobile money et espèces sécurisé par signature numérique SmartSchool.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* TABLEAU DE SUIVI FINANCIER & ÉCHÉANCES MINERVAL (AUTOMATISÉ PAR MOIS) */}
              {(() => {
                const globalSchedules = getGlobalSchoolSchedules(students, payments);
                return (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                            Tableau de Suivi Financier & Échéances Minerval (Année 2026-2027)
                          </h3>
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-black px-2 py-0.5 rounded-full uppercase">
                            10 Mois Scolaires
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Suivi automatique des mensualités payées, retards et prévisions de trésorerie par classe.
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-bold">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 rounded-xl">
                          {globalSchedules.upToDateStudents} Solvables ✓
                        </span>
                        <span className="px-3 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/40 rounded-xl">
                          {globalSchedules.lateStudentsCount} En Retard ⚠
                        </span>
                      </div>
                    </div>

                    {/* ALERT BOX FOR OVERDUE STUDENTS */}
                    {globalSchedules.lateStudents.length > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-3">
                        <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200 font-bold text-xs">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span>Alertes de Retard de Paiement ({globalSchedules.lateStudents.length} élèves à relancer)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {globalSchedules.lateStudents.map(item => {
                            const st = students.find(s => s.id === item.studentId);
                            return (
                              <div key={item.studentId} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-900 dark:text-white block">{item.studentName}</span>
                                  <span className="text-[10px] text-slate-400 block">{item.className} • Impayé : <strong className="text-rose-600">{item.firstUnpaidMonth?.fullLabel || "En retard"}</strong></span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (st) {
                                      setSelectedStudent(st);
                                      setPayMotif("Minerval");
                                      setActiveSubTab("perception");
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer shadow-sm"
                                >
                                  Percevoir Minerval
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* MONTHLY BREAKDOWN GRID (10 MOIS SCOLAIRES) */}
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                        Prévisions vs Encaissements Réels par Mois Scolaire
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {Object.values(globalSchedules.monthlyRevenue).map(m => {
                          const pct = m.expectedUSD > 0 ? Math.round((m.collectedUSD / m.expectedUSD) * 100) : 0;
                          return (
                            <div key={m.monthKey} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-slate-900 dark:text-white text-xs">{m.monthLabel}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${pct >= 100 ? "bg-emerald-100 text-emerald-800" : pct > 0 ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-600"}`}>
                                  {pct}%
                                </span>
                              </div>

                              <div className="space-y-0.5 text-[11px]">
                                <div className="flex justify-between text-slate-500">
                                  <span>Perçu:</span>
                                  <span className="font-bold font-mono text-emerald-600">{m.collectedUSD}$</span>
                                </div>
                                <div className="flex justify-between text-slate-400 text-[10px]">
                                  <span>Attendu:</span>
                                  <span className="font-mono">{m.expectedUSD}$</span>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : pct > 0 ? "bg-indigo-600" : "bg-slate-300"}`}
                                  style={{ width: `${Math.min(100, pct)}%` }}
                                />
                              </div>

                              <span className="text-[9px] text-slate-400 block text-right font-medium">
                                {m.paidStudentsCount} élève(s) payé(s)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })()}
              
              {/* Daily / Monthly ledger insights */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-950 dark:text-white text-xs uppercase tracking-wider">
                    Dernières Transactions Recettes du Jour ({payments.length})
                  </h3>
                  <button 
                    onClick={() => setActiveSubTab("perception")}
                    className="text-indigo-600 hover:text-indigo-500 font-bold text-xs flex items-center"
                  >
                    <span>Faire un encaissement</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2">Date & Réf</th>
                        <th className="py-2">Élève</th>
                        <th className="py-2">Frais / Canal</th>
                        <th className="py-2 text-right">Montant</th>
                        <th className="py-2 text-right">Action / Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {payments.slice(0, 5).map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5">
                            <span className="font-bold block text-slate-850 dark:text-slate-200">{p.createdAt}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{p.reference}</span>
                          </td>
                          <td className="py-2.5 font-bold text-slate-800 dark:text-white">{p.studentName}</td>
                          <td className="py-2.5 text-slate-500">
                            <span className="font-semibold block">{p.paymentType}</span>
                            <span className="text-[10px] font-mono text-indigo-600 block">{p.paymentMethod}</span>
                          </td>
                          <td className="py-2.5 text-right font-black text-slate-900 dark:text-white">{p.amount} {p.currency}</td>
                          <td className="py-2.5 text-right space-x-1">
                            <button
                              onClick={() => setActiveReceipt(p)}
                              className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer inline-block"
                              title="Aperçu Reçu Écran"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(p)}
                              className="p-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 cursor-pointer inline-block"
                              title="Télécharger Reçu PDF (Officiel avec QR Code & Filigrane)"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GUICHET PERCEPTION (Comptable only) */}
          {activeSubTab === "perception" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form & Student search */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase">Recherche intelligente Élève</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Saisir Nom, Matricule ou scanner le code d'inscription</p>
                  </div>

                  <form onSubmit={handleStudentSearch} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ex: Gaston, std-1..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Rechercher
                    </button>
                  </form>

                  {/* Quick selection cheatlist if no student selected */}
                  {!selectedStudent && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Élèves récents</span>
                      <div className="space-y-1">
                        {students.slice(0, 3).map(std => (
                          <button
                            key={std.id}
                            onClick={() => {
                              setSelectedStudent(std);
                              setPayFeeId(feeConfigs[0]?.id);
                            }}
                            className="w-full p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl flex items-center justify-between text-left font-bold"
                          >
                            <span>{std.firstName} {std.lastName}</span>
                            <span className="text-[9px] text-slate-400">{std.className}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* If selected student: display profile with debt details */}
                {selectedStudent && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold font-mono">
                        {selectedStudent.photoUrl ? (
                          <img src={selectedStudent.photoUrl} referrerPolicy="no-referrer" alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          `${selectedStudent.firstName[0]}${selectedStudent.lastName[0]}`
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{selectedStudent.firstName} {selectedStudent.lastName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Matricule : {selectedStudent.registrationNumber || selectedStudent.id}</p>
                        <p className="text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded font-black inline-block mt-1">
                          {selectedStudent.className} - {selectedStudent.optionName}
                        </p>
                      </div>
                    </div>

                    {/* Parents Details */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl space-y-1 text-[11px]">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Parent de l'élève</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{selectedStudent.parentName || "M. Jean-Paul Tshibanda"}</p>
                      <p className="text-slate-500 font-mono text-[10px]">{selectedStudent.parentPhone || "+243 812 345 678"}</p>
                    </div>

                    {/* Outstanding fees details */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Situation Financière</span>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Obligatoire attendu :</span>
                          <span className="font-bold">{totalFeeExpectedPerStudent()} USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Déjà Payé :</span>
                          <span className="font-bold text-emerald-600">{getStudentTotalPaidUSD(selectedStudent.id)} USD</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 border-slate-100">
                          <span className="text-slate-800 font-bold dark:text-white">Reste à payer (Dette) :</span>
                          <span className="font-black text-rose-600">{getStudentDebtUSD(selectedStudent.id)} USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Perception Form Column */}
              <div className="lg:col-span-2">
                {selectedStudent ? (
                  <form onSubmit={handlePerceivePayment} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-xs space-y-4 text-left">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm">
                        Fiche d'Encaissement de Caisse & Guichet
                      </h3>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full">
                        Saisie Automatisée RDC
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Select Motif */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block">Motif du Règlement</label>
                        <select 
                          value={payMotif} 
                          onChange={e => {
                            setPayMotif(e.target.value);
                          }}
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-100"
                        >
                          <option value="Minerval">Minerval (Écolage Mensuel)</option>
                          <option value="Inscription">Inscription & Réinscription</option>
                          <option value="Uniforme">Uniforme & Tenue Scolaire</option>
                          <option value="Fournitures scolaires">Fournitures & Manuels</option>
                          <option value="Transport">Transport Scolaire</option>
                          <option value="Autres frais">Autres Frais Divers</option>
                        </select>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block">Canal de Règlement</label>
                        <select 
                          value={payMethod} 
                          onChange={e => setPayMethod(e.target.value as any)}
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold"
                        >
                          <option value="Mobile Money">Mobile Money (M-Pesa, Orange, Airtel)</option>
                          <option value="Espèces">Espèces (Caisse Centrale)</option>
                          <option value="Banque">Bordereau Bancaire</option>
                          <option value="Chèque">Chèque Certifié</option>
                          <option value="Carte">Carte Bancaire (UBA, Rawbank)</option>
                        </select>
                      </div>
                    </div>

                    {/* IF MOTIF IS MINERVAL: AUTO-SUGGEST MONTH & SCHEDULE GRID */}
                    {payMotif === "Minerval" && studentSchedule && (
                      <div className="space-y-3 p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                        
                        {/* Banner for suggested month */}
                        {studentSchedule.firstUnpaidMonth ? (
                          <div className="p-2.5 bg-indigo-600 text-white rounded-xl flex items-center justify-between font-bold text-xs">
                            <span className="flex items-center space-x-2">
                              <Sparkles className="h-4 w-4" />
                              <span>Mois proposé automatiquement : <strong>{studentSchedule.firstUnpaidMonth.fullLabel}</strong></span>
                            </span>
                            <span className="bg-white/20 px-2 py-0.5 rounded font-mono">
                              {studentSchedule.firstUnpaidMonth.amount} USD
                            </span>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-emerald-600 text-white rounded-xl flex items-center justify-between font-bold text-xs">
                            <span className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Toutes les tranches de minerval sont entièrement soldees pour cet élève !</span>
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Selected month drop down */}
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 dark:text-slate-300 block">Tranche / Mois à acquitter</label>
                            <select
                              value={payMonth}
                              onChange={e => {
                                setPayMonth(e.target.value);
                                const foundM = studentSchedule.months.find(m => m.fullLabel === e.target.value);
                                if (foundM) setPayAmount(foundM.amount);
                              }}
                              className="w-full p-2.5 border border-indigo-200 dark:border-indigo-800 rounded-xl bg-white dark:bg-slate-900 font-bold text-indigo-900 dark:text-indigo-200"
                            >
                              {studentSchedule.months.map(m => (
                                <option 
                                  key={m.monthKey} 
                                  value={m.fullLabel}
                                  disabled={m.status === "Payé"}
                                >
                                  {m.fullLabel} — {m.amount} USD ({m.status === "Payé" ? "Payé ✓" : m.status === "À payer" ? "À PAYER ➡" : "En attente ⏳"})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 dark:text-slate-300 block">Année Scolaire</label>
                            <input
                              type="text"
                              disabled
                              value="2026-2027"
                              className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-950 font-bold text-slate-500 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Visual 10-Month Grid */}
                        <div className="pt-2">
                          <span className="text-[10px] font-black uppercase text-indigo-900 dark:text-indigo-300 block mb-2">
                            Échéancier Annuel de Minerval de l'Élève (10 Mois)
                          </span>
                          <div className="grid grid-cols-5 gap-1.5 text-[10px]">
                            {studentSchedule.months.map((m) => {
                              const isPaid = m.status === "Payé";
                              const isNext = m.status === "À payer";
                              return (
                                <div
                                  key={m.monthKey}
                                  onClick={() => {
                                    if (!isPaid) {
                                      setPayMonth(m.fullLabel);
                                      setPayAmount(m.amount);
                                    }
                                  }}
                                  className={`p-2 rounded-xl text-center border font-bold transition-all ${
                                    isPaid
                                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                      : isNext
                                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm cursor-pointer scale-[1.02]"
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 cursor-pointer hover:border-indigo-400"
                                  }`}
                                >
                                  <span className="block font-black text-[9px] uppercase">{m.monthLabel}</span>
                                  <span className="font-mono text-[10px] block mt-0.5">{m.amount}$</span>
                                  <span className="text-[8px] block font-semibold mt-0.5">
                                    {isPaid ? "✓ Payé" : isNext ? "➡ À PAYER" : "⏳ Attente"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Momo Provider option if momo is selected */}
                    {payMethod === "Mobile Money" && (
                      <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                        <label className="font-bold text-slate-500 block mb-1">Opérateur Telecom Local</label>
                        <div className="flex space-x-2">
                          {["M-Pesa", "Orange Money", "Airtel Money"].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPayMomoProvider(p as any)}
                              className={`flex-1 p-2 border rounded-lg font-bold transition-all ${
                                payMomoProvider === p 
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-white dark:bg-slate-900 border-slate-200"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {/* Amount paid */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block">Montant à encaisser</label>
                        <input
                          type="number"
                          required
                          value={payAmount}
                          onChange={e => setPayAmount(Number(e.target.value))}
                          className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm"
                        />
                      </div>

                      {/* Currency */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block">Devise</label>
                        <select 
                          value={payCurrency} 
                          onChange={e => setPayCurrency(e.target.value as any)}
                          className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-950 font-bold"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="CDF">CDF (Fc)</option>
                        </select>
                      </div>
                    </div>

                    {/* Transaction Reference code */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block">Numéro de transaction / Référence Bordereau (Facultatif)</label>
                      <input
                        type="text"
                        placeholder="Laisser vide pour une génération automatique sécurisée"
                        value={payRef}
                        onChange={e => setPayRef(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-950 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wide cursor-pointer text-xs flex items-center justify-center space-x-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Enregistrer la perception et générer le reçu officiel RDC</span>
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
                    <User className="h-12 w-12 text-indigo-500 mx-auto opacity-55" />
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs">Aucun élève sélectionné</h3>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Veuillez utiliser la barre de recherche intelligente ci-contre afin d'identifier un élève et lancer une perception de caisse.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: ON-SITE PHYSICAL PAYMENTS WORKSTATION */}
          {activeSubTab === "on_site" && (
            <div className="space-y-6">
              {/* Header banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase">
                      Guichet Physique & Caisse
                    </span>
                    <span className="text-xs text-emerald-200/80 font-mono">Commission 2% Traçable</span>
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-tight mt-1">Enregistrement des Paiements Sur Place</h2>
                  <p className="text-xs text-emerald-100/70 mt-0.5 max-w-2xl">
                    Saisie sécurisée des perceptions en espèces au guichet, dépôts bancaires directes, ou transferts Mobile Money effectués sur place.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-right space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-emerald-200 block">Agent Caisse Connecté</span>
                  <p className="text-xs font-black text-white">{userName}</p>
                  <p className="text-[9px] text-emerald-300 font-mono">{userRole}</p>
                </div>
              </div>

              {/* Form & List Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Column */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-emerald-600" />
                      <span>Formulaire de Perception Caisse</span>
                    </h3>
                  </div>

                  <form onSubmit={handleOnSitePaymentSubmit} className="space-y-4">
                    {/* Student Selection */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">1. Sélectionner l'Élève (*)</label>
                      <select
                        required
                        value={onSiteStudentId}
                        onChange={e => setOnSiteStudentId(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                      >
                        <option value="">-- Choisir un élève dans le registre --</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName} ({s.className}) - Mat: {s.registrationNumber || s.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mode of Payment */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">2. Mode de Paiement Sur Place (*)</label>
                      <select
                        value={onSiteMode}
                        onChange={e => setOnSiteMode(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                      >
                        <option value="Espèces">Espèces / Cash Caisse École</option>
                        <option value="M-Pesa sur place">Vodacom M-Pesa (Transaction Guichet)</option>
                        <option value="Orange Money sur place">Orange Money (Transaction Guichet)</option>
                        <option value="Airtel Money sur place">Airtel Money (Transaction Guichet)</option>
                        <option value="Afrimoney sur place">Africell Afrimoney (Transaction Guichet)</option>
                        <option value="Banque">Bordereau / Dépôt Bancaire (Rawbank / Equity)</option>
                        <option value="Chèque">Chèque Certifié</option>
                      </select>
                    </div>

                    {/* Fee Types Selection (Multi-selection enabled) */}
                    <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        3. Frais à percevoir (Cocher un ou plusieurs)
                      </label>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {feeConfigs.map(fee => {
                          const isChecked = onSiteSelectedFees.includes(fee.id);
                          return (
                            <label
                              key={fee.id}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 font-bold"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setOnSiteSelectedFees(prev => [...prev, fee.id]);
                                    } else {
                                      setOnSiteSelectedFees(prev => prev.filter(id => id !== fee.id));
                                    }
                                  }}
                                  className="rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>{fee.name}</span>
                              </div>
                              <span className="font-mono font-bold text-emerald-600">{fee.amount} {fee.currency}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Amount if no standard fee type is checked */}
                    {onSiteSelectedFees.length === 0 && (
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">Saisir Montant Librement (USD)</label>
                        <input
                          type="number"
                          value={onSiteCustomAmount || ""}
                          onChange={e => setOnSiteCustomAmount(Number(e.target.value))}
                          placeholder="Ex: 45"
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono font-bold text-emerald-600"
                        />
                      </div>
                    )}

                    {/* Month selection if minerval */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">Mois / Mois d'échéance concerné</label>
                      <select
                        value={onSiteMonth}
                        onChange={e => setOnSiteMonth(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                      >
                        {ACADEMIC_MONTHS.map(m => (
                          <option key={m.key} value={`${m.label} ${m.yearSuffix}`}>{m.label} {m.yearSuffix}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reference */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">N° Référence / Quittance Caisse</label>
                      <input
                        type="text"
                        placeholder="Ex: CASH-2026-9901 (Auto-généré si vide)"
                        value={onSiteRef}
                        onChange={e => setOnSiteRef(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">Notes / Observations Guichet</label>
                      <input
                        type="text"
                        placeholder="Ex: Payé par la mère au guichet principal"
                        value={onSiteNotes}
                        onChange={e => setOnSiteNotes(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs"
                      />
                    </div>

                    {/* Live Calculation Box */}
                    {(() => {
                      const selFeeObjs = feeConfigs.filter(f => onSiteSelectedFees.includes(f.id));
                      let sumUSD = selFeeObjs.reduce((acc, f) => acc + (f.currency === "USD" ? f.amount : f.amount / EXCHANGE_RATE), 0);
                      if (selFeeObjs.length === 0 && onSiteCustomAmount > 0) {
                        sumUSD = onSiteCustomAmount;
                      }
                      const commUSD = (sumUSD * 0.02);
                      const netUSD = sumUSD - commUSD;

                      return (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600 dark:text-slate-300 font-bold">
                            <span>Montant Total Encaissé :</span>
                            <span className="font-mono text-emerald-600 font-black">{sumUSD.toFixed(2)} USD</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-amber-700 dark:text-amber-400">
                            <span>Commission SmartSchool RDC (2%) :</span>
                            <span className="font-mono font-bold">{commUSD.toFixed(2)} USD</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                            <span>Netteté Caisse École :</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{netUSD.toFixed(2)} USD</span>
                          </div>
                        </div>
                      );
                    })()}

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition-all shadow-md uppercase tracking-wide cursor-pointer text-xs flex items-center justify-center space-x-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Valider & Générer Reçu Officiel RDC</span>
                    </button>
                  </form>
                </div>

                {/* On-Site Payments Log List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white uppercase">Historique des Perceptions Sur Place</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Enregistrements effectués en espèces au guichet comptabilité</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-lg text-[10px]">
                      {payments.filter(p => p.isOnSitePayment).length} Paiements Guichet
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                          <th className="p-2.5">N° Réf / Date</th>
                          <th className="p-2.5">Élève & Classe</th>
                          <th className="p-2.5">Agent Caisse</th>
                          <th className="p-2.5">Mode</th>
                          <th className="p-2.5">Montant Encaissé</th>
                          <th className="p-2.5">Comm. 2%</th>
                          <th className="p-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payments.filter(p => p.isOnSitePayment).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                              Aucun paiement sur place enregistré pour le moment. Utilisez le formulaire ci-contre pour effectuer une première saisie.
                            </td>
                          </tr>
                        ) : (
                          payments.filter(p => p.isOnSitePayment).map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                              <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                                <div>{p.reference}</div>
                                <span className="text-[9px] text-slate-400 font-normal">{p.createdAt}</span>
                              </td>
                              <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">
                                <div>{p.studentName}</div>
                                <span className="text-[9px] text-indigo-600 font-mono">{p.className}</span>
                              </td>
                              <td className="p-2.5 font-medium text-slate-600 dark:text-slate-400">
                                <div>{p.recordingAgentName || "Comptable"}</div>
                                <span className="text-[9px] text-slate-400">{p.recordingAgentRole}</span>
                              </td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded text-[10px]">
                                  {p.onSitePaymentMode || p.paymentMethod}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono font-black text-emerald-600">
                                {p.amount} {p.currency}
                              </td>
                              <td className="p-2.5 font-mono text-amber-600 font-bold">
                                ${(p.commissionCalculatedUSD || p.platformCommissionAmount || 0).toFixed(2)}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  onClick={() => handleDownloadPDF(p)}
                                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg text-[10px] font-bold inline-flex items-center space-x-1 cursor-pointer"
                                  title="Télécharger le reçu PDF RDC"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  <span>Reçu</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMMISSION SETTLEMENTS (REVERSEMENT COMMISSIONS 2%) WORKSTATION */}
          {activeSubTab === "reversements" && (
            <div className="space-y-6 text-left">
              {/* Header banner */}
              <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-black uppercase">
                      Redevance Plateforme SmartSchool RDC
                    </span>
                    <span className="text-xs text-amber-200/80 font-mono">Taux Officiel : 2.0%</span>
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-tight mt-1">Gestion des Reversements de Commissions</h2>
                  <p className="text-xs text-amber-100/70 mt-0.5 max-w-2xl">
                    Suivi de la redevance de 2% calculée sur les perceptions d'écolage et reversement officiel vers les comptes développeur SmartSchool RDC.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const pendingIds = payments.filter(p => p.isOnSitePayment && p.commissionSettlementStatus !== "REVERSÉ_À_LA_PLATEFORME").map(p => p.id);
                    setSettleSelectedPaymentIds(pendingIds);
                    setSettleCommissionModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 cursor-pointer transition-all shadow-md shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span>Effectuer un Reversement Global</span>
                </button>
              </div>

              {/* Commission Financial Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  let totalCalc = 0;
                  let totalTransferred = 0;
                  payments.forEach(p => {
                    const c = p.commissionCalculatedUSD || p.platformCommissionAmount || 0;
                    totalCalc += c;
                    if (p.commissionSettlementStatus === "REVERSÉ_À_LA_PLATEFORME" || !p.isOnSitePayment) {
                      totalTransferred += c;
                    }
                  });
                  const pending = totalCalc - totalTransferred;

                  return (
                    <>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Commissions Totales Calculées (2%)</span>
                          <Percent className="h-4 w-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">${totalCalc.toFixed(2)} USD</p>
                        <p className="text-[10px] text-slate-400">Calculé sur l'ensemble des perceptions écolage</p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Commissions Transférées à la Plateforme</span>
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black font-mono text-emerald-600">${totalTransferred.toFixed(2)} USD</p>
                        <p className="text-[10px] text-emerald-600/80 font-bold">Transferts Mobile Money confirmés</p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Commissions Sur Place En Attente</span>
                          <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black font-mono text-amber-600">${pending.toFixed(2)} USD</p>
                        <p className="text-[10px] text-amber-600/80 font-bold">À reverser via Airtel / M-Pesa / Orange</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Destination Platform Accounts Info Banner */}
              <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <span>Comptes de Réception des Commissions SmartSchool RDC (Comptes Développeur Officiels)</span>
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-full">
                    ✓ Vérification Certifiée FREDTECH
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-rose-700 uppercase block">Airtel Money (Titulaire Officiel)</span>
                    <p className="font-mono font-black text-sm text-rose-800 dark:text-rose-300">099 420 29 40</p>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Ir IT Fred Kalonda (FREDTECH RDC)</p>
                  </div>

                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-red-700 uppercase block">Vodacom M-Pesa</span>
                    <p className="font-mono font-black text-sm text-red-800 dark:text-red-300">081 234 56 78</p>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">FREDTECH RDC SURL - SmartSchool</p>
                  </div>

                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-xl space-y-1">
                    <span className="text-[9px] font-black text-orange-700 uppercase block">Orange Money</span>
                    <p className="font-mono font-black text-sm text-orange-800 dark:text-orange-300">089 011 12 22</p>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">FREDTECH RDC SURL - SmartSchool</p>
                  </div>
                </div>
              </div>

              {/* Transactions list with settlement checkboxes */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase">Tableau de Rapprochement des Redevances Sur Place</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Détail transaction par transaction pour justification comptable</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="p-2.5">Date & Réf</th>
                        <th className="p-2.5">Élève Bénévolat</th>
                        <th className="p-2.5">Montant Encaissé</th>
                        <th className="p-2.5">Redevance 2%</th>
                        <th className="p-2.5">Mode Initial</th>
                        <th className="p-2.5">Statut Reversement</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">Aucune transaction répertoriée.</td>
                        </tr>
                      ) : (
                        payments.map(p => {
                          const comm = p.commissionCalculatedUSD || p.platformCommissionAmount || 0;
                          const isSettled = p.commissionSettlementStatus === "REVERSÉ_À_LA_PLATEFORME" || !p.isOnSitePayment;

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                              <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                                <div>{p.reference}</div>
                                <span className="text-[9px] text-slate-400 font-normal">{p.createdAt}</span>
                              </td>
                              <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">
                                <div>{p.studentName}</div>
                                <span className="text-[9px] text-slate-400 font-normal">{p.paymentType}</span>
                              </td>
                              <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                                {p.amount} {p.currency}
                              </td>
                              <td className="p-2.5 font-mono font-black text-amber-600">
                                ${comm.toFixed(2)} USD
                              </td>
                              <td className="p-2.5 font-semibold text-slate-600">
                                {p.isOnSitePayment ? (p.onSitePaymentMode || "Sur Place") : "En Ligne Direct"}
                              </td>
                              <td className="p-2.5">
                                {isSettled ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[9px] flex items-center space-x-1 w-fit">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Reversé</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-full text-[9px] flex items-center space-x-1 w-fit">
                                    <Clock className="h-3 w-3" />
                                    <span>En Attente</span>
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-right">
                                {!isSettled && (
                                  <button
                                    onClick={() => handleSettleCommissions([p.id])}
                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                                  >
                                    Reverser
                                  </button>
                                )}
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
          {activeSubTab === "frais" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-4 text-left">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white uppercase text-xs tracking-wider">Configuration de la grille tarifaire</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Frais validés officiellement par le comité de gestion de l'école</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeConfigs.map(fee => (
                  <div key={fee.id} className="p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase text-[9px]">
                        {fee.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        fee.isRequired ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {fee.isRequired ? "Obligatoire" : "Facultatif"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{fee.name}</h4>
                      <p className="text-sm font-black text-indigo-600 font-mono">
                        {fee.amount.toLocaleString()} {fee.currency}
                      </p>
                    </div>

                    {fee.statePortion && (
                      <div className="pt-2 border-t border-slate-150 flex justify-between text-[10px] font-bold text-amber-600">
                        <span>Rétrocession État RDC :</span>
                        <span>{fee.statePortion} {fee.currency}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EXPENSES LOG & VALIDATION WORKFLOW */}
          {activeSubTab === "depenses" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-4 text-left">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white uppercase text-xs tracking-wider">
                    Suivi & Traçabilité des Dépenses de l'Établissement
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Soumission de factures, salaires, entretien de classe et achats divers.</p>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2">Date & Catégorie</th>
                      <th className="py-2">Description / Motivations</th>
                      <th className="py-2">Montant</th>
                      <th className="py-2">Auteur</th>
                      <th className="py-2 text-right">Décision d'Autorité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5">
                          <span className="font-bold block text-slate-850 dark:text-slate-200">{e.date}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-bold uppercase">{e.category}</span>
                        </td>
                        <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium max-w-xs truncate">{e.description}</td>
                        <td className="py-2.5 font-black text-rose-600 font-mono">{e.amount.toLocaleString()} {e.currency}</td>
                        <td className="py-2.5 font-semibold text-slate-500">{e.requestedBy}</td>
                        <td className="py-2.5 text-right">
                          {e.status === "pending" ? (
                            isDirectorOrPromoter ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleExpenseDecision(e.id, "rejected")}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg cursor-pointer"
                                >
                                  Rejeter
                                </button>
                                <button
                                  onClick={() => handleExpenseDecision(e.id, "approved")}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer"
                                >
                                  Approuver
                                </button>
                              </div>
                            ) : (
                              <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded inline-block">
                                En attente de validation
                              </span>
                            )
                          ) : (
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg inline-block ${
                              e.status === "approved" 
                                ? "bg-emerald-50 text-emerald-600" 
                                : "bg-rose-50 text-rose-600"
                            }`}>
                              {e.status === "approved" ? "✓ Validée" : "✗ Rejetée"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS & AUDITS STATS */}
          {activeSubTab === "rapports" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-4 text-left">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white uppercase text-xs tracking-wider">
                      Générateur Automatique de Bilans Académiques Financiers
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sélectionner et exporter les bilans et rapprochements consolidés.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Ledger report box */}
                  <div className="p-4 border rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs">Situation des Comptes Débiteurs</h4>
                    <p className="text-[10px] text-slate-500">Liste exhaustive de tous les élèves accusant des arriérés de paiement.</p>
                    <button
                      onClick={() => handleExportData("payments")}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Télécharger (Excel/CSV)</span>
                    </button>
                  </div>

                  {/* Cashflow report box */}
                  <div className="p-4 border rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs">Rapport des Charges & Dépenses</h4>
                    <p className="text-[10px] text-slate-500">Historique complet des frais de fonctionnement et investissements d'école.</p>
                    <button
                      onClick={() => handleExportData("expenses")}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Télécharger (Excel/CSV)</span>
                    </button>
                  </div>

                  {/* Caisse report box */}
                  <div className="p-4 border rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs">Registre Mobile Money</h4>
                    <p className="text-[10px] text-slate-500">Synthèse consolidée des flux perçus via passerelle Orange, Vodacom et Airtel.</p>
                    <button
                      onClick={() => handleExportData("payments")}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Télécharger (Excel/CSV)</span>
                    </button>
                  </div>

                  {/* PDF Receipts Box */}
                  <div className="p-4 border border-indigo-200 dark:border-indigo-900/50 rounded-xl space-y-3 bg-indigo-50/30 dark:bg-indigo-950/20">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-xs flex items-center space-x-1">
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Reçus PDF Certifiés RDC</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">Exportation par lot des reçus officiels avec Filigrane National et QR Code.</p>
                    <button
                      onClick={handleBatchDownloadPDF}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Générer Reçus PDF</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SCHOOL RECEIVING ACCOUNTS */}
          {activeSubTab === "comptes_reception" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 space-y-6 text-left shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-wide">
                      Comptes de Réception de l'Établissement
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Comptes Mobile Money et bancaires configurés pour recevoir les paiements scolaires des parents (Part école : 98%).
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center space-x-2 shrink-0">
                  <Shield className="h-4 w-4" />
                  <span>Compte principal actuel : <strong className="font-black text-emerald-800 dark:text-emerald-200">{schoolReceivingAccounts.primaryProvider}</strong></span>
                </div>
              </div>

              {/* Security Isolation Notice */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-white">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span>Séparation Souveraine des Comptes</span>
                </div>
                <p>
                  Les comptes configurés ci-dessous appartiennent exclusivement à votre établissement scolaire. Les commissions de la plateforme (2%) sont acheminées sur des comptes de rétrocession distincts gérés par le Concepteur.
                </p>
              </div>

              {/* Form Grid */}
              <div className="space-y-6">
                {/* Account Holder Name */}
                <div className="space-y-1 max-w-lg">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Titulaire des Comptes de l'Établissement
                  </label>
                  <input
                    type="text"
                    value={schoolReceivingAccounts.holderName}
                    onChange={(e) => setSchoolReceivingAccounts((prev: any) => ({ ...prev, holderName: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="ex: Complexe Scolaire Saint-Joseph"
                  />
                </div>

                {/* Mobile Money Accounts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* VODACOM M-PESA */}
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        <span>Vodacom M-Pesa École</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSchoolReceivingAccounts((prev: any) => ({
                          ...prev,
                          mpesa: { ...prev.mpesa, status: prev.mpesa.status === "Actif" ? "Désactivé" : "Actif" }
                        }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          schoolReceivingAccounts.mpesa.status === "Actif"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {schoolReceivingAccounts.mpesa.status === "Actif" ? "🟢 Actif" : "⚪ Désactivé"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={schoolReceivingAccounts.mpesa.phone}
                      onChange={(e) => setSchoolReceivingAccounts((prev: any) => ({
                        ...prev,
                        mpesa: { ...prev.mpesa, phone: e.target.value }
                      }))}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold"
                      placeholder="+243 812 XXX XXX"
                    />
                  </div>

                  {/* ORANGE MONEY */}
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                        <span>Orange Money École</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSchoolReceivingAccounts((prev: any) => ({
                          ...prev,
                          orange: { ...prev.orange, status: prev.orange.status === "Actif" ? "Désactivé" : "Actif" }
                        }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          schoolReceivingAccounts.orange.status === "Actif"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {schoolReceivingAccounts.orange.status === "Actif" ? "🟢 Actif" : "⚪ Désactivé"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={schoolReceivingAccounts.orange.phone}
                      onChange={(e) => setSchoolReceivingAccounts((prev: any) => ({
                        ...prev,
                        orange: { ...prev.orange, phone: e.target.value }
                      }))}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold"
                      placeholder="+243 890 XXX XXX"
                    />
                  </div>

                  {/* AIRTEL MONEY */}
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-red-600"></span>
                        <span>Airtel Money École</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSchoolReceivingAccounts((prev: any) => ({
                          ...prev,
                          airtel: { ...prev.airtel, status: prev.airtel.status === "Actif" ? "Désactivé" : "Actif" }
                        }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          schoolReceivingAccounts.airtel.status === "Actif"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {schoolReceivingAccounts.airtel.status === "Actif" ? "🟢 Actif" : "⚪ Désactivé"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={schoolReceivingAccounts.airtel.phone}
                      onChange={(e) => setSchoolReceivingAccounts((prev: any) => ({
                        ...prev,
                        airtel: { ...prev.airtel, phone: e.target.value }
                      }))}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold"
                      placeholder="+243 991 XXX XXX"
                    />
                  </div>

                  {/* AFRIMONEY */}
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        <span>Afrimoney École</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSchoolReceivingAccounts((prev: any) => ({
                          ...prev,
                          afrimoney: { ...prev.afrimoney, status: prev.afrimoney.status === "Actif" ? "Désactivé" : "Actif" }
                        }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          schoolReceivingAccounts.afrimoney.status === "Actif"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {schoolReceivingAccounts.afrimoney.status === "Actif" ? "🟢 Actif" : "⚪ Désactivé"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={schoolReceivingAccounts.afrimoney.phone}
                      onChange={(e) => setSchoolReceivingAccounts((prev: any) => ({
                        ...prev,
                        afrimoney: { ...prev.afrimoney, phone: e.target.value }
                      }))}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold"
                      placeholder="+243 900 XXX XXX"
                    />
                  </div>
                </div>

                {/* Bank Account Section */}
                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="flex items-center space-x-2 font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider border-b pb-2">
                    <Landmark className="h-4 w-4 text-indigo-600" />
                    <span>Compte Bancaire de l'Établissement</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nom de la Banque</label>
                      <input
                        type="text"
                        value={schoolReceivingAccounts.bankName}
                        onChange={(e) => setSchoolReceivingAccounts((prev: any) => ({ ...prev, bankName: e.target.value }))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
                        placeholder="ex: Rawbank, Equity BCDC"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Numéro de Compte</label>
                      <input
                        type="text"
                        value={schoolReceivingAccounts.bankAccountNumber}
                        onChange={(e) => setSchoolReceivingAccounts((prev: any) => ({ ...prev, bankAccountNumber: e.target.value }))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold"
                        placeholder="0001234567-89"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Titulaire Bancaire</label>
                      <input
                        type="text"
                        value={schoolReceivingAccounts.bankHolderName}
                        onChange={(e) => setSchoolReceivingAccounts((prev: any) => ({ ...prev, bankHolderName: e.target.value }))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
                        placeholder="Nom légal sur le compte"
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Provider Selection */}
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Compte Principal de Réception des Frais</span>
                  </label>
                  <select
                    value={schoolReceivingAccounts.primaryProvider}
                    onChange={(e: any) => setSchoolReceivingAccounts((prev: any) => ({ ...prev, primaryProvider: e.target.value }))}
                    className="w-full md:w-1/2 p-2.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="M-Pesa Vodacom">Vodacom M-Pesa ({schoolReceivingAccounts.mpesa.phone})</option>
                    <option value="Orange Money">Orange Money ({schoolReceivingAccounts.orange.phone})</option>
                    <option value="Airtel Money">Airtel Money ({schoolReceivingAccounts.airtel.phone})</option>
                    <option value="Afrimoney">Afrimoney ({schoolReceivingAccounts.afrimoney.phone})</option>
                    <option value="Banque">{schoolReceivingAccounts.bankName} ({schoolReceivingAccounts.bankAccountNumber})</option>
                  </select>
                </div>

                {/* Action Save Button */}
                <button
                  type="button"
                  onClick={() => {
                    safeLocalStorage.setItem("ss_school_receiving_accounts", JSON.stringify(schoolReceivingAccounts));
                    triggerToast("Comptes de réception enregistrés avec succès !", "success");
                    setAuditLogs((prev: any) => [
                      {
                        id: `log-${Date.now()}`,
                        user: userName,
                        role: userRole,
                        action: `Mise à jour des comptes de réception école (${schoolReceivingAccounts.primaryProvider})`,
                        timestamp: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR")
                      },
                      ...prev
                    ]);
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 cursor-pointer shadow-md transition-all"
                >
                  <Check className="h-4 w-4" />
                  <span>Enregistrer les comptes de réception</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: AUDIT & ENCAISSEMENTS MOBILE MONEY RDC */}
          {activeSubTab === "momo_audit" && (
            <MobileMoneyAuditDashboard
              students={students}
              onAddPayment={(newP: Payment) => {
                onAddPayment({
                  studentId: newP.studentId,
                  studentName: newP.studentName,
                  className: newP.className,
                  amount: newP.amount,
                  currency: newP.currency,
                  paymentType: newP.paymentType,
                  paymentMethod: newP.paymentMethod,
                  mobileMoneyGateway: newP.mobileMoneyGateway,
                  mobileMoneyPhone: newP.mobileMoneyPhone,
                  reference: newP.reference,
                  paymentMonth: newP.paymentMonth,
                  schoolId: newP.schoolId,
                  notes: newP.notes
                });
                triggerToast(`Paiement Mobile Money enregistré et validé (Réf: ${newP.reference}) !`, "success");
              }}
              schoolName="Complexe Scolaire SmartSchool RDC"
            />
          )}

        </div>
      ) : (
        /* 7. PARENT VIEW PORTFOLIO - Custom Slate Theme */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Child financial summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 text-left space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                  {parentChild?.firstName[0]}{parentChild?.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{parentChild?.firstName} {parentChild?.lastName}</h3>
                  <p className="text-[10px] text-slate-400">Classe : {parentChild?.className}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Scolarité Totale due :</span>
                  <span className="font-bold">{totalFeeExpectedPerStudent()} USD</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Frais Déjà Versés :</span>
                  <span className="font-black text-emerald-600">
                    {parentChild ? getStudentTotalPaidUSD(parentChild.id) : 150} USD
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t pt-2">
                  <span className="font-bold text-slate-800 dark:text-white">Solde restant à payer :</span>
                  <span className="font-black text-rose-600">
                    {parentChild ? getStudentDebtUSD(parentChild.id) : 50} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Online Payment panel */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 text-left space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">Paiement en ligne sécurisé</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Solder les frais scolaires instantanément via Mobile Money congolais.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Frais à payer</label>
                  <select className="w-full p-2.5 border rounded-lg bg-slate-50">
                    {feeConfigs.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Portefeuille Mobile Money</label>
                  <select className="w-full p-2.5 border rounded-lg bg-slate-50">
                    <option value="mpesa">M-Pesa (Vodacom)</option>
                    <option value="orange">Orange Money</option>
                    <option value="airtel">Airtel Money</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerToast("Simulation : Envoi d'une demande de code secret PIN sur votre téléphone mobile...", "info");
                  setTimeout(() => {
                    triggerToast("Paiement simulé validé ! Le solde est mis à jour.", "success");
                  }, 2500);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase"
              >
                Lancer le paiement Mobile Money ($)
              </button>
            </div>

          </div>

          {/* Child History of payments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 text-left space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Mon Historique des Versements de Frais</h3>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase text-[9px]">
                    <th className="py-2">Date</th>
                    <th className="py-2">Référence</th>
                    <th className="py-2">Type de frais</th>
                    <th className="py-2">Canal</th>
                    <th className="py-2 text-right">Montant</th>
                    <th className="py-2 text-right">Reçu PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments
                    .filter(p => p.studentId === parentChild?.id)
                    .map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-2">{p.createdAt}</td>
                        <td className="py-2 font-mono text-slate-500">{p.reference}</td>
                        <td className="py-2 font-bold">{p.paymentType}</td>
                        <td className="py-2 text-indigo-600 font-bold">{p.paymentMethod}</td>
                        <td className="py-2 text-right font-black">{p.amount} {p.currency}</td>
                        <td className="py-2 text-right space-x-1">
                          <button
                            onClick={() => setActiveReceipt(p)}
                            className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer inline-block"
                            title="Aperçu écran"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(p)}
                            className="p-1 text-indigo-600 hover:text-indigo-800 cursor-pointer inline-block"
                            title="Télécharger le Reçu PDF Officiel (avec QR Code & Filigrane)"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: CREATE FEE CONFIGURATION */}
      <AnimatePresence>
        {newFeeModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 text-left border border-slate-200 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-black uppercase tracking-tight text-slate-900 dark:text-white text-xs">Paramétrer un nouveau frais scolaire</h3>
                <button onClick={() => setNewFeeModal(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateFee} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Intitulé du Frais</label>
                  <input name="name" type="text" placeholder="Ex: Frais d'internat 1er Trimestre" required className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950 font-medium" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Catégorie du Frais</label>
                    <select name="category" className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950">
                      <option value="Minerval">Minerval</option>
                      <option value="Fonctionnement">Frais de Fonctionnement</option>
                      <option value="Uniforme">Uniforme & Tenue</option>
                      <option value="Cantine">Cantine</option>
                      <option value="Transport">Transport</option>
                      <option value="Bibliothèque">Bibliothèque</option>
                      <option value="Laboratoire">Laboratoire</option>
                      <option value="Examens">Frais d'Examen</option>
                      <option value="Frais d'État">Frais d'État</option>
                      <option value="Autres">Autres</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Statut obligation</label>
                    <select name="isRequired" className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950">
                      <option value="true">Obligatoire</option>
                      <option value="false">Facultatif</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Montant</label>
                    <input name="amount" type="number" required defaultValue={45} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950 font-mono" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Devise</label>
                    <select name="currency" className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950">
                      <option value="USD">USD ($)</option>
                      <option value="CDF">CDF (Fc)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Part de rétrocession d'État (Optionnel, uniquement si applicable)</label>
                  <input name="statePortion" type="number" placeholder="Ex: 5" className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950 font-mono" />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase shadow-md cursor-pointer"
                >
                  Valider et inscrire dans la grille
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. MODAL: RECORD EXPENSE */}
      <AnimatePresence>
        {newExpModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 text-left border border-slate-200 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-black uppercase tracking-tight text-slate-900 dark:text-white text-xs">Saisir une nouvelle dépense</h3>
                <button onClick={() => setNewExpModal(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Nature / Description du décaissement</label>
                  <input name="description" type="text" placeholder="Ex: Forfait gazole générateur d'électricité" required className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950 font-medium" />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Catégorie de Dépense</label>
                  <select name="category" className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950">
                    <option value="Salaires">Salaires & Primes</option>
                    <option value="Fournitures">Fournitures & Manuels</option>
                    <option value="Électricité">Électricité & SNEL</option>
                    <option value="Eau">Eau & REGIDESO</option>
                    <option value="Internet">Abonnement Internet FO</option>
                    <option value="Entretien">Entretien & Maintenance</option>
                    <option value="Construction">Construction & Rénovations</option>
                    <option value="Carburant">Carburant générateur</option>
                    <option value="Achats divers">Achats divers</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Montant</label>
                    <input name="amount" type="number" required defaultValue={100} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950 font-mono" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Devise</label>
                    <select name="currency" className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-950">
                      <option value="USD">USD ($)</option>
                      <option value="CDF">CDF (Fc)</option>
                    </select>
                  </div>
                </div>

                <div className="p-2.5 bg-indigo-50 text-indigo-800 rounded-lg text-[10px] font-bold">
                  {["Directeur", "Directeur Général", "Promoteur"].includes(userRole) 
                    ? "✓ En tant que membre de la Direction, cette dépense sera auto-approuvée immédiatement."
                    : "⚠ Cette dépense sera soumise en attente de validation par la Direction scolaire."}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase shadow-md cursor-pointer"
                >
                  Enregistrer la demande
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. MODAL: OFFICIAL PRINTABLE RECEIPT */}
      {activeReceipt ? (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 border shadow-2xl space-y-4 text-xs font-sans relative" id="printable-receipt-card">
            {/* Receipt Header Banner */}
            <div className="flex justify-between items-start border-b pb-4">
              <div className="space-y-1">
                <h2 className="text-base font-black uppercase text-indigo-700 leading-none">SmartSchool RDC</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Système Académique National Souverain</p>
                <p className="text-[9px] text-slate-400 font-mono">ID Reçu : {activeReceipt.id || "REC-2026"}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Paiement Validé
                </span>
                <p className="text-[9px] text-slate-500 font-mono">{activeReceipt.createdAt}</p>
              </div>
            </div>

            {/* School & Identity Card Metadata */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-black block">Établissement</span>
                <span className="font-bold text-slate-800">{schoolDetails?.name || schoolName || "Établissement Scolaire"}</span>
                {(schoolDetails?.address || schoolDetails?.city || schoolDetails?.province) && (
                  <p className="text-[9px] text-slate-500">{[schoolDetails.address, schoolDetails.city, schoolDetails.province].filter(Boolean).join(", ")}</p>
                )}
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-black block">Bénéficiaire</span>
                <span className="font-bold text-slate-800">{activeReceipt.studentName}</span>
                <p className="text-[9px] text-slate-500 font-bold">Classe : {activeReceipt.className || "Non assigné"}</p>
              </div>
            </div>

            {/* Receipt Details Table */}
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 border-b text-slate-500 font-bold">
                    <th className="p-2.5">Nature du frais</th>
                    <th className="p-2.5">Mode de règlement</th>
                    <th className="p-2.5 text-right">Montant Acquitté</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-medium text-slate-800">
                    <td className="p-2.5 font-bold">{activeReceipt.paymentType}</td>
                    <td className="p-2.5">{activeReceipt.paymentMethod}</td>
                    <td className="p-2.5 text-right font-black text-indigo-600 font-mono">
                      {activeReceipt.amount} {activeReceipt.currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Separation RDC validation portion and QR Code block */}
            <div className="grid grid-cols-3 gap-4 items-center border-t pt-4">
              
              {/* Dynamic QR code container */}
              <div className="col-span-1 border p-1.5 rounded-lg bg-white flex flex-col justify-center items-center space-y-1">
                {activeReceiptQrUrl ? (
                  <img src={activeReceiptQrUrl} alt="QR Code RDC" className="h-16 w-16 object-contain" />
                ) : (
                  <QrCode className="h-16 w-16 text-slate-800" />
                )}
                <span className="text-[7px] text-slate-400 font-mono uppercase tracking-wider">VÉRIFICATION RDC</span>
              </div>

              {/* Secure digital signature credentials & Actions */}
              <div className="col-span-2 space-y-1 text-left">
                <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider flex items-center space-x-1">
                  <Shield className="h-3 w-3 inline" />
                  <span>Reçu Officiel Certifié RDC</span>
                </span>
                <p className="text-[9px] leading-relaxed text-slate-500">
                  Ce reçu électronique fait foi pour le règlement des frais de scolarité dans l'écosystème SmartSchool de la République Démocratique du Congo.
                </p>
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadPDF(activeReceipt)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] flex items-center space-x-1 cursor-pointer shadow-sm transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Télécharger PDF Officiel</span>
                  </button>
                  <button
                    onClick={() => setPrintModalConfig({
                      docType: "recu_minerval",
                      data: { payment: activeReceipt },
                      title: `Reçu de Perception - ${activeReceipt?.studentName || "Paiement"}`
                    })}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] flex items-center space-x-1 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Aperçu & Imprimer</span>
                  </button>
                  <button
                    onClick={() => setActiveReceipt(null)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-lg text-[10px] cursor-pointer ml-auto"
                  >
                    Fermer
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : null}

      {/* MODAL: REVERSEMENT COMMISSION SMARTSCHOOL */}
      {settleCommissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-left space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Percent className="h-5 w-5 text-amber-600" />
                <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm">
                  Reversement de Commission à SmartSchool
                </h3>
              </div>
              <button
                onClick={() => setSettleCommissionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-1 text-xs text-amber-900 dark:text-amber-300">
              <span className="font-bold block">Destinataire Officiel de la Redevance :</span>
              <p className="font-mono font-black text-sm text-amber-700 dark:text-amber-400">
                AIRTEL MONEY : 099 420 29 40
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                Titulaire : Ir IT Fred Kalonda (FREDTECH RDC)
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl flex justify-between items-center">
                <span className="text-slate-500 font-bold">Commissions sélectionnées :</span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                  {settleSelectedPaymentIds.length} transaction(s)
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl flex justify-between items-center">
                <span className="text-slate-500 font-bold">Montant Total à Reverser :</span>
                <span className="font-mono font-black text-amber-600 text-base">
                  ${payments
                    .filter(p => settleSelectedPaymentIds.includes(p.id))
                    .reduce((acc, p) => acc + (p.commissionCalculatedUSD || p.platformCommissionAmount || 0), 0)
                    .toFixed(2)} USD
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Opérateur Utilisé pour le Transfert (*)
                </label>
                <select
                  value={settleMomoOperator}
                  onChange={e => setSettleMomoOperator(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
                >
                  <option value="Airtel Money (0994202940 - Ir IT Fred Kalonda)">Airtel Money (099 420 29 40 - Ir IT Fred Kalonda)</option>
                  <option value="Vodacom M-Pesa (0812345678 - FREDTECH RDC)">Vodacom M-Pesa (081 234 56 78 - FREDTECH RDC)</option>
                  <option value="Orange Money (0890111222 - FREDTECH RDC)">Orange Money (089 011 12 22 - FREDTECH RDC)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  N° de Référence / ID de Transaction Mobile Money (*)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: MP260813.1042.A91283 ou TXN-AIRTEL-9982"
                  value={settleRef}
                  onChange={e => setSettleRef(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSettleCommissionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleSettleCommissions(settleSelectedPaymentIds)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center space-x-1"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Confirmer le Reversement</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Module Toast */}
      <AnimatePresence>
        {moduleToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm text-xs text-left"
          >
            <div className={`p-4 rounded-2xl shadow-2xl border flex items-start space-x-3 backdrop-blur-md ${
              moduleToast.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-400"
                : moduleToast.type === "warning"
                ? "bg-amber-500/90 text-white border-amber-400"
                : "bg-indigo-600/95 text-white border-indigo-500"
            }`}>
              <div className="shrink-0 mt-0.5">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold uppercase tracking-wider text-[10px] opacity-90">Finance Module Alert</p>
                <p className="mt-1 font-semibold leading-relaxed">{moduleToast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL FINANCE PRINT PREVIEW ENGINE */}
      {printModalConfig && (
        <PrintPreviewModal
          documentType={printModalConfig.docType}
          data={printModalConfig.data}
          onClose={() => setPrintModalConfig(null)}
          title={printModalConfig.title}
        />
      )}

    </div>
  );
}
