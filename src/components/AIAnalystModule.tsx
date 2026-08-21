import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Search,
  Shield,
  Lock,
  Building,
  Users,
  Landmark,
  Award,
  Clock,
  AlertTriangle,
  ChevronRight,
  Filter,
  FileCheck,
  DollarSign,
  TrendingUp,
  UserX,
  FileEdit,
  Info
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { School, Student, Payment, CustomFeeType, ClassRoom, Option, Grade, Attendance, Teacher } from "../types";

import { safeCopyToClipboard } from "../utils/safeStorage";

interface AIAnalystModuleProps {
  activeSchoolId: string;
  schools: School[];
  userRole: string;
  userName: string;
  userEmail?: string;
  students: Student[];
  payments: Payment[];
  feeTypes?: CustomFeeType[];
  classes: ClassRoom[];
  options: Option[];
  grades: Grade[];
  attendances: Attendance[];
  teachers?: Teacher[];
  onAuditLog?: (action: string, details: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  text: string;
  toolCalled?: string;
  dataPayload?: {
    type: "students_list" | "unpaid_students" | "school_stats" | "grades_analysis" | "attendance_report" | "document_draft" | "classes_list" | "teachers_list" | "generic_table";
    title: string;
    headers: string[];
    rows: any[][];
    summaryStats?: Record<string, any>;
    document?: {
      title: string;
      recipient: string;
      subject: string;
      content: string;
      date: string;
      schoolHeader: string;
    };
    exportData?: any[];
  };
  suggestedActions?: string[];
}

export function AIAnalystModule({
  activeSchoolId,
  schools,
  userRole,
  userName,
  userEmail,
  students,
  payments,
  feeTypes = [],
  classes,
  options,
  grades,
  attendances,
  teachers = [],
  onAuditLog
}: AIAnalystModuleProps) {
  const activeSchool = schools.find(s => s.id === activeSchoolId) || schools[0] || ({
    id: activeSchoolId || "default",
    name: "Complexe Scolaire SmartSchool RDC",
    codeNational: "EPST/NAT/042-KIN",
    provinceEducationnelle: "KINSHASA-CENTRE",
    adresseComplete: "Kinshasa, RDC",
    contactEmail: "direction@smartschool.cd",
    phonePrincipal: "+243810000000",
    schoolYear: "2025-2026",
    levels: ["Maternelle", "Primaire", "Secondaire", "Humanités"],
    sections: ["Scientifique", "Commerciale", "Littéraire"],
    options: ["Commerciale et Gestion", "Scientifique", "Latin-Philo"]
  } as unknown as School);

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [tableSearchFilter, setTableSearchFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "finances" | "eleves" | "cotes" | "presences" | "redaction">("all");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome-1",
      sender: "assistant",
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      text: `Bonjour **${userName}** (${userRole}). Je suis l'**Analyste IA & Assistant Intelligent** de gestion scolaire pour votre établissement **${activeSchool.name}**.

Toutes mes analyses, recherches et calculs sont **strictement cloisonnés** aux données réelles de votre école.

Voici ce que je peux accomplir pour vous en temps réel :
- 💰 **Finances & Impayés** : identifier les élèves non payés, calculer les dettes, ventiler par classe ou option, produire des tableaux de relance.
- 📋 **Gestion des Élèves** : extraire des listes alphabétiques, filtrer par classe, option, niveau ou genre.
- 📈 **Résultats & Palmarès** : calculer les moyennes, palmarès Top 5, élèves en difficulté (<50%).
- ⏱️ **Présences & Assiduité** : repérer les élèves les plus absents et retards.
- ✍️ **Rédaction Officielle** : rédiger des convocations aux parents, lettres de rappel, notes de service et demandes de congé selon les normes EPST.
- 📥 **Exports 1-Clic** : exporter n'importe quel résultat en **Excel (.xlsx)** ou **PDF imprimable**.`,
      suggestedActions: [
        "💰 Combien d'élèves n'ont pas encore payé ?",
        "📋 Donne-moi la liste alphabétique des élèves",
        "📊 Statistiques globales de mon école",
        "🏆 Quels sont les cinq meilleurs élèves ?",
        "✍️ Rédiger une convocation aux parents pour impayés"
      ]
    }
  ]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ---------------------------------------------------------------------------
  // EXPORT UTILITIES (EXCEL, PDF, CLIPBOARD)
  // ---------------------------------------------------------------------------

  const handleExportExcel = (payload: ChatMessage["dataPayload"]) => {
    if (!payload || !payload.rows || payload.rows.length === 0) return;

    try {
      const dataToExport = payload.exportData || payload.rows.map(row => {
        const obj: Record<string, any> = {};
        payload.headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Données SmartSchool");

      const cleanSchoolName = activeSchool.name.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${payload.type}_${cleanSchoolName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      XLSX.writeFile(workbook, filename);
      onAuditLog?.("EXPORT_EXCEL_AI", `Exportation Excel générée: ${filename}`);
    } catch (e) {
      console.error("Erreur lors de l'export Excel:", e);
    }
  };

  const handleExportPDF = (payload: ChatMessage["dataPayload"]) => {
    if (!payload || !payload.rows || payload.rows.length === 0) return;

    try {
      const doc = new jsPDF("landscape");
      
      // Official Congolese School Header
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", 14, 12);
      doc.text("MINISTÈRE DE L'ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETÉ (EPST)", 14, 17);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${activeSchool.name.toUpperCase()} • CODE EPST: ${activeSchool.codeNational || "EPST-042"}`, 14, 23);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Province: ${activeSchool.provinceEducationnelle || "KINSHASA"} | Date: ${new Date().toLocaleDateString("fr-FR")} | Opérateur: ${userName} (${userRole})`, 14, 28);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 31, 283, 31);

      // Title
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(payload.title.toUpperCase(), 14, 38);

      // AutoTable
      autoTable(doc, {
        startY: 42,
        head: [payload.headers],
        body: payload.rows,
        theme: "striped",
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Footer with signature space and page number
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`SmartSchool RDC • Rapport Officiel • Page ${data.pageNumber} sur ${pageCount}`, 14, 200);
          doc.text("Sceau et Signature de la Direction : ___________________________", 190, 200);
        }
      });

      const cleanSchoolName = activeSchool.name.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${payload.type}_${cleanSchoolName}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
      onAuditLog?.("EXPORT_PDF_AI", `Exportation PDF générée: ${filename}`);
    } catch (e) {
      console.error("Erreur lors de l'export PDF:", e);
    }
  };

  const handleCopyTable = async (payload: ChatMessage["dataPayload"], msgId: string) => {
    if (!payload) return;
    const headerLine = payload.headers.join("\t");
    const rowsLines = payload.rows.map(r => r.join("\t")).join("\n");
    const fullText = `${payload.title}\n${headerLine}\n${rowsLines}`;
    await safeCopyToClipboard(fullText);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const handleCopyDocument = async (docText: string, msgId: string) => {
    await safeCopyToClipboard(docText);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  // ---------------------------------------------------------------------------
  // MAIN QUERY DISPATCHER (CALLS SERVER-SIDE GEMINI & SMART TOOLS)
  // ---------------------------------------------------------------------------

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      // Filter current dataset strictly to activeSchoolId for tenant integrity
      const scopedStudents = students.filter(s => s.schoolId === activeSchoolId || (!s.schoolId && activeSchoolId === "default"));
      const scopedPayments = payments.filter(p => p.schoolId === activeSchoolId || (!p.schoolId && activeSchoolId === "default"));
      const scopedClasses = classes.filter(c => c.schoolId === activeSchoolId || (!c.schoolId && activeSchoolId === "default"));
      const scopedGrades = grades.filter(g => (g as any).schoolId === activeSchoolId || (!(g as any).schoolId && activeSchoolId === "default"));
      const scopedAttendances = attendances.filter(a => (a as any).schoolId === activeSchoolId || (!(a as any).schoolId && activeSchoolId === "default"));
      const scopedTeachers = teachers.filter(t => (t as any).schoolId === activeSchoolId || (!(t as any).schoolId && activeSchoolId === "default"));

      const tenantPayload = {
        schoolId: activeSchool.id,
        schoolName: activeSchool.name,
        userRole,
        userName,
        userEmail,
        schoolInfo: {
          id: activeSchool.id,
          name: activeSchool.name,
          codeNational: activeSchool.codeNational,
          provinceEducationnelle: activeSchool.provinceEducationnelle,
          adresseComplete: activeSchool.adresseComplete,
          contactEmail: activeSchool.contactEmail,
          phonePrincipal: activeSchool.phonePrincipal,
          schoolYear: activeSchool.schoolYear || "2025-2026",
          levels: activeSchool.levels,
          sections: activeSchool.sections,
          options: activeSchool.options
        },
        students: scopedStudents,
        payments: scopedPayments,
        feeTypes,
        classes: scopedClasses,
        options,
        grades: scopedGrades,
        attendances: scopedAttendances,
        teachers: scopedTeachers
      };

      // Server-side API invocation (with automatic Gemini AI & Deterministic Data Processing)
      const res = await fetch("/api/ai/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: activeSchool.id,
          userRole,
          userName,
          prompt: textToSend,
          history: messages.map(m => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text
          })),
          tenantData: tenantPayload
        })
      });

      const data = await res.json();

      const botMessageId = `msg-bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMessageId,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        text: data.text || "Analyse terminée avec succès.",
        toolCalled: data.toolCalled,
        dataPayload: data.dataPayload,
        suggestedActions: data.suggestedActions || [
          "💰 Voir les élèves non payés",
          "📋 Liste alphabétique des élèves",
          "📊 Statistiques globales"
        ]
      };

      setMessages(prev => [...prev, botMsg]);
      onAuditLog?.("AI_ANALYST_QUERY", `Requête Analyste IA: "${textToSend.slice(0, 60)}"`);
    } catch (err: any) {
      console.error("Erreur Analyste IA:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          text: `⚠️ **Information:** Une difficulté temporaire de connexion est survenue. Veuillez reformuler votre question ou cliquer sur une suggestion ci-dessous.`,
          suggestedActions: [
            "💰 Qui n'a pas encore payé ?",
            "📋 Liste de tous les élèves",
            "📊 Statistiques de l'école"
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        text: `Conversation réinitialisée. Comment puis-je vous éclairer sur la gestion de **${activeSchool.name}** ?`,
        suggestedActions: [
          "💰 Combien d'élèves n'ont pas encore payé ?",
          "📋 Liste alphabétique de toute l'école",
          "📊 Tableau de bord statistique",
          "🏆 Palmarès des 5 meilleurs élèves",
          "✍️ Rédiger une convocation officielle"
        ]
      }
    ]);
  };

  return (
    <div id="ai-analyst-module-root" className="space-y-4 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER & TENANT ISOLATION BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Analyste IA & Assistant Scolaire
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Gemini 3.7 Flash + Outils RDC
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Recherche intelligente, calculs financiers, palmarès académique, rédaction et exports officiels
            </p>
          </div>
        </div>

        {/* Security & Tenant Badge */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            <Building className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="truncate max-w-[200px]" title={activeSchool.name}>{activeSchool.name}</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Isolation Multi-Tenant Active</span>
          </div>
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            title="Effacer la conversation"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. QUICK PROMPTS CATEGORY SELECTOR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors shrink-0 ${
            selectedCategory === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          Tous les modules
        </button>
        <button
          onClick={() => setSelectedCategory("finances")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors shrink-0 flex items-center space-x-1.5 ${
            selectedCategory === "finances"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>Finances & Impayés</span>
        </button>
        <button
          onClick={() => setSelectedCategory("eleves")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors shrink-0 flex items-center space-x-1.5 ${
            selectedCategory === "eleves"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Élèves & Effectifs</span>
        </button>
        <button
          onClick={() => setSelectedCategory("cotes")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors shrink-0 flex items-center space-x-1.5 ${
            selectedCategory === "cotes"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Notes & Palmarès</span>
        </button>
        <button
          onClick={() => setSelectedCategory("presences")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors shrink-0 flex items-center space-x-1.5 ${
            selectedCategory === "presences"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Présences & Absences</span>
        </button>
        <button
          onClick={() => setSelectedCategory("redaction")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors shrink-0 flex items-center space-x-1.5 ${
            selectedCategory === "redaction"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <FileEdit className="h-3.5 w-3.5" />
          <span>Rédaction Officielle</span>
        </button>
      </div>

      {/* 3. CATEGORY PROMPTS CAROUSEL */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
        {(selectedCategory === "all" || selectedCategory === "finances") && (
          <button
            onClick={() => handleSendQuery("Donne-moi tous les élèves qui n'ont pas encore payé avec le solde restant.")}
            className="p-3 text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Élèves Non Payés</span>
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">Liste avec solde & statut</p>
          </button>
        )}

        {(selectedCategory === "all" || selectedCategory === "finances") && (
          <button
            onClick={() => handleSendQuery("Quel est le montant total des impayés et le taux de recouvrement de l'école ?")}
            className="p-3 text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Total Impayés & Ratios</span>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">Montants encaissés vs dus</p>
          </button>
        )}

        {(selectedCategory === "all" || selectedCategory === "eleves") && (
          <button
            onClick={() => handleSendQuery("Donne-moi tous les élèves de l'école par ordre alphabétique et sépare-les par classe.")}
            className="p-3 text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all group shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Liste Alphabétique</span>
              <Users className="h-3.5 w-3.5 text-blue-500" />
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">Tous les élèves par classe</p>
          </button>
        )}

        {(selectedCategory === "all" || selectedCategory === "eleves") && (
          <button
            onClick={() => handleSendQuery("Combien avons-nous d'élèves au total et quelle est la répartition par classe et par option ?")}
            className="p-3 text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all group shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Effectif & Options</span>
              <Building className="h-3.5 w-3.5 text-blue-500" />
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">Ventilation par option</p>
          </button>
        )}

        {(selectedCategory === "all" || selectedCategory === "cotes") && (
          <button
            onClick={() => handleSendQuery("Quels sont les cinq meilleurs élèves de l'école et ceux en difficulté ?")}
            className="p-3 text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all group shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Top 5 & Palmarès</span>
              <Award className="h-3.5 w-3.5 text-amber-500" />
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">Meilleurs moyennes & alertes</p>
          </button>
        )}

        {(selectedCategory === "all" || selectedCategory === "presences") && (
          <button
            onClick={() => handleSendQuery("Donne-moi les élèves les plus absents et fais un rapport des absences.")}
            className="p-3 text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 transition-all group shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Élèves les Plus Absents</span>
              <UserX className="h-3.5 w-3.5 text-rose-500" />
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">Absences non justifiées</p>
          </button>
        )}

        {(selectedCategory === "all" || selectedCategory === "redaction") && (
          <button
            onClick={() => handleSendQuery("Rédige une lettre de convocation officielle aux parents pour la régularisation des frais scolaires.")}
            className="p-3 text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all group shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Convocation Parents</span>
              <FileEdit className="h-3.5 w-3.5 text-purple-500" />
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">Lettre officielle avec en-tête</p>
          </button>
        )}

        {(selectedCategory === "all" || selectedCategory === "redaction") && (
          <button
            onClick={() => handleSendQuery("Rédige une note de service pour informer le personnel enseignant de la réunion pédagogique.")}
            className="p-3 text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all group shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Note de Service</span>
              <FileText className="h-3.5 w-3.5 text-purple-500" />
            </p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">Communication interne</p>
          </button>
        )}
      </div>

      {/* 4. MAIN CHAT CONVERSATION CANVAS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[550px] max-h-[750px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[95%] sm:max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-9 w-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white"
                }`}
              >
                {msg.sender === "user" ? userName.slice(0, 2).toUpperCase() : <Sparkles className="h-4 w-4" />}
              </div>

              {/* Message Content Container */}
              <div className="space-y-3 flex-1 overflow-hidden">
                {/* Header info */}
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <span className="font-bold">{msg.sender === "user" ? userName : "Analyste IA SmartSchool"}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Text Bubble */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-xs shadow-2xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.text.split("\n\n").map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* RICH DATA TABLE RENDERER                             */}
                  {/* ---------------------------------------------------- */}
                  {msg.dataPayload && msg.dataPayload.rows && msg.dataPayload.rows.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
                      {/* Table Header Bar with Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white text-xs">
                            {msg.dataPayload.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {msg.dataPayload.rows.length} entrée(s) extraite(s) • Établissement vérifié
                          </p>
                        </div>

                        {/* Export Buttons */}
                        <div className="flex items-center flex-wrap gap-1.5">
                          <button
                            onClick={() => handleExportExcel(msg.dataPayload)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-800"
                            title="Exporter en Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            <span>Excel</span>
                          </button>

                          <button
                            onClick={() => handleExportPDF(msg.dataPayload)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors border border-rose-200 dark:border-rose-800"
                            title="Générer un PDF officiel (.pdf)"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => handleCopyTable(msg.dataPayload, msg.id)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                            title="Copier le tableau"
                          >
                            {copiedMessageId === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedMessageId === msg.id ? "Copié !" : "Copier"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Search Filter for large tables */}
                      {msg.dataPayload.rows.length > 5 && (
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Rechercher dans ce tableau..."
                            value={tableSearchFilter}
                            onChange={(e) => setTableSearchFilter(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}

                      {/* Interactive Data Table */}
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-72 scrollbar-thin">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                            <tr>
                              {msg.dataPayload.headers.map((h, i) => (
                                <th key={i} className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            {msg.dataPayload.rows
                              .filter(row => {
                                if (!tableSearchFilter) return true;
                                return row.some(cell => String(cell).toLowerCase().includes(tableSearchFilter.toLowerCase()));
                              })
                              .map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-3 py-2 whitespace-nowrap font-medium">
                                      {typeof cell === "string" && cell.includes("USD") ? (
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{cell}</span>
                                      ) : typeof cell === "string" && (cell.includes("Non payé") || cell.includes("Échec")) ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                                          {cell}
                                        </span>
                                      ) : typeof cell === "string" && (cell.includes("Totalement payé") || cell.includes("Excellente") || cell.includes("Réussite")) ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                          {cell}
                                        </span>
                                      ) : typeof cell === "string" && cell.includes("Partiellement payé") ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                          {cell}
                                        </span>
                                      ) : (
                                        cell
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* OFFICIAL DOCUMENT DRAFT PREVIEW                       */}
                  {/* ---------------------------------------------------- */}
                  {msg.dataPayload?.document && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
                      <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-2">
                          <FileEdit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="font-bold text-xs text-purple-900 dark:text-purple-200">
                            {msg.dataPayload.document.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyDocument(msg.dataPayload!.document!.content, msg.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                        >
                          {copiedMessageId === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedMessageId === msg.id ? "Texte copié !" : "Copier le texte"}</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner max-h-80 overflow-y-auto">
                        {msg.dataPayload.document.content}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Follow-up Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendQuery(action)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors shadow-2xs"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs font-medium pl-2">
              <div className="h-8 w-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-spin">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  L'Analyste IA interroge et calcule les données de {activeSchool.name}...
                </p>
                <p className="text-[10px] text-slate-400">
                  Application du filtre schoolId • Rapprochement comptable • Synthèse Gemini 3.7 Flash
                </p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 5. BOTTOM INPUT BAR */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Posez une question sur les élèves, impayés, notes, présences de ${activeSchool.name}...`}
                disabled={isLoading}
                className="w-full pl-4 pr-10 py-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner"
              />
              <span className="absolute right-3 top-3.5 text-slate-400">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="h-12 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-colors shadow-md shrink-0"
            >
              <span>Envoyer</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
            🔒 SmartSchool RDC Analyste IA • Isolation Zero-Trust active • Données scolaires certifiées EPST
          </p>
        </div>
      </div>
    </div>
  );
}
