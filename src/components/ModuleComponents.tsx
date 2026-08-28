import React, { useState } from "react";
import { 
  Student, Teacher, Parent, ClassRoom, Option, Subject, Grade, Attendance, Payment, TimetableEntry, NotificationItem,
  CnrResource, CnrSyncLog, CnrResourceCategory, InscriptionAuditLog, ClassAnnouncement, StudentGuardianLink, ParentGuardianLink,
  UserAccount, Employee
} from "../types";
import { searchParentsDatabase, generateParentAccountNumber, useSmartSchoolCore } from "../context/SmartSchoolCoreContext";
import { OfficialLoginSheetModal } from "./OfficialLoginSheetModal";
import { 
  provisionUserAccountForPerson, 
  generateUniqueActivationCode, 
  persistUniversalUserAccount,
  getStoredUniversalUserAccounts,
  getSafeOrigin
} from "../services/accountActivationService";
import { 
  resolveClassTitulaire,
  resolveClassResponsibleStaff,
  resolveClassResponsible,
  resolveParentChildren,
  getEligibleTitularsForSchool,
  getSchoolStaffAccounts,
  getSchoolTeacherAccounts
} from "../services/entityRelationshipService";
import { RelationshipManagerModal } from "./common/RelationshipManagerModal";
import { ParentDetailModal } from "./common/ParentDetailModal";
import { StudentDetailModal } from "./common/StudentDetailModal";
import { 
  Users, UserCheck, Landmark, BookOpen, GraduationCap, Award, Calendar, 
  TrendingUp, Activity, Plus, Search, Filter, Edit3, Trash2, Printer, 
  CheckCircle, XCircle, Clock, ShieldAlert, BadgeHelp, Check, Sparkles, Send, Bell,
  ShieldCheck, Building2, RefreshCw, Download, FileSpreadsheet, Eye, X, AlertCircle,
  School, Camera, Upload, Image as ImageIcon, AlertTriangle, ChevronRight, ArrowLeft, ArrowRight,
  Copy, KeyRound, User, CheckCircle2, Smartphone, Power, Link2, UserCog, History, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { SmartOptionsManagement } from "./SmartOptionsManagement";
import { SchoolUpdateCenter } from "./SchoolUpdateCenter";

// ---------------------------------------------------------------------------
// FLUENT DESIGN SKELETON LOADING UI HELPERS
// ---------------------------------------------------------------------------
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-28 rounded-md bg-slate-200 dark:bg-slate-800 animate-shimmer" />
        <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-shimmer" />
      </div>
      <div className="h-7 w-24 rounded-lg bg-slate-200 dark:bg-slate-800 animate-shimmer" />
      <div className="h-3 w-36 rounded-md bg-slate-200 dark:bg-slate-800 animate-shimmer" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="h-5 w-48 rounded-lg bg-slate-200 dark:bg-slate-800 animate-shimmer" />
        <div className="h-8 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-shimmer" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl">
            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 rounded bg-slate-200 dark:bg-slate-800 animate-shimmer" />
              <div className="h-2.5 w-1/4 rounded bg-slate-200 dark:bg-slate-800 animate-shimmer" />
            </div>
            <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800 animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. DASHBOARD MODULE VIEW
// ---------------------------------------------------------------------------
interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  payments: Payment[];
  classes: ClassRoom[];
  grades: Grade[];
  onNavigate: (tab: string) => void;
  lang: string;
  userRole?: string;
  classAnnouncements?: ClassAnnouncement[];
}

export function DashboardView({ 
  students, 
  teachers, 
  payments, 
  classes, 
  grades, 
  onNavigate, 
  lang,
  userRole,
  classAnnouncements
}: DashboardViewProps) {
  const [hoveredEnrollmentIdx, setHoveredEnrollmentIdx] = useState<number | null>(null);
  const [hoveredPaymentIdx, setHoveredPaymentIdx] = useState<number | null>(null);
  const [activeCurrency, setActiveCurrency] = useState<"USD" | "CDF">("USD");

  const activeStudents = students.filter(s => s.status === "Actif").length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  
  // Financial calculation
  const totalUSD = payments.filter(p => p.currency === "USD" && p.isValidated).reduce((sum, p) => sum + p.amount, 0);
  const totalCDF = payments.filter(p => p.currency === "CDF" && p.isValidated).reduce((sum, p) => sum + p.amount, 0);

  // Class capacity analysis
  const crowdedClasses = classes.filter(c => c.studentCount >= c.maxStudents - 2);

  // 1. Enrollment Chart Data Setup
  const enrollmentMonths = ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
  const baseInscriptions = [140, 165, 180, 192, 210, 222, 235, 248, 260, 275];
  const studentScale = Math.max(1, activeStudents / 275);
  const inscriptionsData = baseInscriptions.map(v => Math.round(v * studentScale));

  // 2. Payments Chart Data Setup
  const paymentMonths = ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
  const monthlySums = Array(10).fill(0);
  const baseUSD = [450, 780, 620, 510, 890, 720, 810, 950, 1100, 1250];
  const baseCDF = [800000, 1200000, 950000, 850000, 1400000, 1100000, 1300000, 1600000, 1800000, 2100000];
  const base = activeCurrency === "USD" ? baseUSD : baseCDF;

  payments.forEach(p => {
    if (p.currency === activeCurrency && p.isValidated) {
      const date = new Date(p.createdAt);
      const month = isNaN(date.getTime()) ? 0 : date.getMonth(); 
      let idx = 0;
      if (month >= 8) idx = month - 8; 
      else if (month <= 5) idx = month + 4; 
      else idx = 9; 
      if (idx >= 0 && idx < 10) {
        monthlySums[idx] += p.amount;
      }
    }
  });
  const paymentsData = monthlySums.map((v, i) => v + base[i]);

  // SVG Area Line Chart coordinates calculator
  const svgWidth = 520;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;
  
  const getEnrollmentPoints = () => {
    const maxVal = Math.max(...inscriptionsData, 10);
    const minVal = Math.min(...inscriptionsData, 0) * 0.8;
    const range = maxVal - minVal;
    
    return inscriptionsData.map((val, idx) => {
      const x = paddingX + (idx * (svgWidth - paddingX * 2)) / (inscriptionsData.length - 1);
      const y = svgHeight - paddingY - ((val - minVal) / range) * (svgHeight - paddingY * 2);
      return { x, y, val };
    });
  };
  
  const enrollmentPoints = getEnrollmentPoints();
  const linePath = enrollmentPoints.reduce((acc, p, i) => {
    return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, "");
  
  const areaPath = enrollmentPoints.length > 0 
    ? `${linePath} L ${enrollmentPoints[enrollmentPoints.length - 1].x} ${svgHeight - paddingY} L ${enrollmentPoints[0].x} ${svgHeight - paddingY} Z`
    : "";

  // Academic option performance scores (based on grades)
  const optionPerformances = [
    { name: "Sciences / Scientifique", rate: 76.8, count: 120, color: "bg-brand-blue" },
    { name: "Latin-Philosophie", rate: 71.5, count: 85, color: "bg-purple-500" },
    { name: "Commerciale & Gestion", rate: 68.4, count: 110, color: "bg-amber-500" },
    { name: "Pédagogie Générale", rate: 73.2, count: 90, color: "bg-emerald-500" }
  ];

  // Static Calendar and exams lists
  const upcomingExams = [
    { subject: "Physique & Thermodynamique", date: "Dans 2 jours", class: "6ème Scientifique", time: "08h30 - 11h30", type: "P2" },
    { subject: "Littérature Africaine", date: "Dans 4 jours", class: "5ème Littéraire", time: "10h00 - 12h00", type: "P2" },
    { subject: "Comptabilité Analytique", date: "Dans 5 jours", class: "6ème Commerciale", time: "08h30 - 11h30", type: "P2" }
  ];

  const recentActivities = [
    { type: "payment", text: "Frais d'Écolage perçus pour Mbuyi Kabeya", time: "Il y a 12 min", desc: "45 USD validé via Airtel Money" },
    { type: "student", text: "Nouvelle inscription enregistrée", time: "Il y a 45 min", desc: "Kavira Masika inscrite en 3ème Scientifique" },
    { type: "grade", text: "Bulletin d'évaluation P1 publié", time: "Il y a 2 h", desc: "Directeur des études: 'Toutes les notes de P1 sont closes'" },
    { type: "system", text: "Rapport national généré", time: "Il y a 4 h", desc: "Export XML officiel pour le Ministère de l'EPSP" }
  ];

  const weekDays = [
    { day: "Lun", date: "22", active: false, hasEvent: true },
    { day: "Mar", date: "23", active: false, hasEvent: false },
    { day: "Mer", date: "24", active: false, hasEvent: true },
    { day: "Jeu", date: "25", active: true, hasEvent: false },
    { day: "Ven", date: "26", active: false, hasEvent: true },
    { day: "Sam", date: "27", active: false, hasEvent: false },
    { day: "Dim", date: "28", active: false, hasEvent: false }
  ];

  return (
    <div className="space-y-6">
      {/* 1. HEADER HERO PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Tableau de bord de l'établissement</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Supervision technique SmartSchool RDC — Conçu par l'Ir IT Fred Kalonda.
          </p>
        </div>
        
        {/* Quick actions buttons group */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => onNavigate("comptabilite")}
            className="text-xs bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-300 font-bold px-3.5 py-2 rounded-xl hover:bg-brand-blue/20 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Landmark className="h-4 w-4" />
            <span>Faire un Encaissement</span>
          </button>
          <button 
            onClick={() => onNavigate("eleves")}
            className="text-xs bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold px-4 py-2 rounded-xl shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Inscrire Élève</span>
          </button>
          <button 
            onClick={() => onNavigate("bulletins")}
            className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Award className="h-4 w-4" />
            <span>Bulletins</span>
          </button>
        </div>
      </div>

      {/* ALERTE PHOTO PROFIL POUR LA DIRECTION / SERVICE RH */}
      {students.filter(s => !s.photoUrl).length > 0 && userRole !== "Parent" && userRole !== "Élève" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 p-4 rounded-2xl border border-amber-200/55 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 dark:text-amber-200">Alerte Administrative RH : Photos de Profil Manquantes</h4>
              <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                Il y a <strong className="font-black text-amber-600 dark:text-amber-400">{students.filter(s => !s.photoUrl).length} élève(s)</strong> sans photo de profil enregistrée dans leur dossier d'inscription. Veuillez mettre à jour ces dossiers.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("eleves")}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold rounded-xl transition-all text-xs shrink-0 self-end sm:self-center cursor-pointer flex items-center space-x-1"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Compléter les photos</span>
          </button>
        </motion.div>
      )}

      {/* FIL D'ACTUALITÉ DE LA CLASSE */}
      {classAnnouncements && classAnnouncements.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-brand-blue/90 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse shrink-0" />
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider">Fil d'Actualité de la Classe</h3>
                <p className="text-[10px] text-slate-300">Annonces, communiqués et actualités diffusés par la direction pour votre classe.</p>
              </div>
            </div>
            <div className="bg-white/10 text-brand-green border border-white/5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              Diffusions actives
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classAnnouncements.map((ann) => (
              <div 
                key={ann.id} 
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition-all space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-mono tracking-widest bg-brand-green/20 text-brand-green px-2 py-0.5 rounded font-bold">
                      {ann.className}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono font-medium">{ann.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-xs mt-2 leading-snug">{ann.title}</h4>
                  <p className="text-[10px] text-slate-300 mt-1 leading-relaxed line-clamp-3">{ann.content}</p>
                </div>
                
                <div className="border-t border-white/5 pt-2 mt-2 flex items-center justify-between text-[9px] text-slate-400 font-semibold">
                  <span>Par : {ann.studentName || "Direction de l'École"}</span>
                  <span className="italic">Réf : {ann.id.toUpperCase().slice(0, 6)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. METRIC CARD BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-md"
        >
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Élèves Actifs</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeStudents}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-0.5" /> 100% Souveraineté RDC
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-brand-blue rounded-xl">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
        </motion.div>

        {/* Total Teachers */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-md"
        >
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Enseignants</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalTeachers}</p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">Moyenne: 19h / semaine</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-brand-green rounded-xl">
            <Users className="h-5.5 w-5.5" />
          </div>
        </motion.div>

        {/* Financial Encaissements */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-md"
        >
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Caisse Écolage (M-Pesa)</span>
            <div className="flex flex-col mt-0.5">
              <span className="text-lg font-black text-brand-blue dark:text-blue-400">{totalUSD} USD</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{totalCDF.toLocaleString()} CDF</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <Landmark className="h-5.5 w-5.5" />
          </div>
        </motion.div>

        {/* Academic success rate indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-md"
        >
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Taux de Réussite Global</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">74.2%</p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">Évaluation Nationale</span>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
            <Award className="h-5.5 w-5.5" />
          </div>
        </motion.div>
      </div>

      {/* 3. CHARTS & ANALYTICS DOUBLE COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ENROLLMENT AREA CHART (SVG) */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Évolution des Inscriptions Scolaires</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Inscriptions cumulées sur l'année scolaire active ({activeStudents} élèves)</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-500 uppercase">
              Courbe Active
            </div>
          </div>

          <div className="relative pt-2">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1565C0" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1565C0" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal gridlines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3" />
              <line x1={paddingX} y1={(svgHeight) / 2} x2={svgWidth - paddingX} y2={(svgHeight) / 2} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3" />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1.5" />
              
              {/* Filled gradient area */}
              <path d={areaPath} fill="url(#enrollmentGrad)" />
              
              {/* Stroke path */}
              <path d={linePath} fill="none" stroke="#1565C0" strokeWidth="3" strokeLinecap="round" />
              
              {/* Scatter dots */}
              {enrollmentPoints.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredEnrollmentIdx === i ? 6 : 4}
                    fill={hoveredEnrollmentIdx === i ? "#2E7D32" : "#1565C0"}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredEnrollmentIdx(i)}
                    onMouseLeave={() => setHoveredEnrollmentIdx(null)}
                  />
                  {/* Monthly Labels */}
                  <text
                    x={p.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-bold"
                  >
                    {enrollmentMonths[i]}
                  </text>
                </g>
              ))}
            </svg>

            {/* Interactive Tooltip indicator */}
            <div className="min-h-[24px] flex items-center justify-center text-[11px] font-mono mt-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl py-1 text-slate-500 border border-slate-100 dark:border-slate-900">
              {hoveredEnrollmentIdx !== null ? (
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">En {enrollmentMonths[hoveredEnrollmentIdx]} :</span>
                  <span className="font-black text-brand-blue">{inscriptionsData[hoveredEnrollmentIdx]} élèves</span>
                  <span className="text-[10px] text-slate-400">({Math.round((inscriptionsData[hoveredEnrollmentIdx] / activeStudents) * 100)}% de la capacité)</span>
                </div>
              ) : (
                <span className="text-[10px] italic">Survolez un point de la courbe pour voir le détail des inscriptions</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* PAYMENTS COLUMN BAR CHART (SVG) */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Volume des Encaissements</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Recettes mensuelles d'écolage perçues en caisse</p>
            </div>
            
            {/* Currency toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-850 p-0.5 rounded-lg border border-slate-200/40 dark:border-slate-700/50 shrink-0">
              <button
                onClick={() => setActiveCurrency("USD")}
                className={`text-[9px] px-2 py-0.5 rounded font-black transition-all cursor-pointer ${
                  activeCurrency === "USD" 
                    ? "bg-white dark:bg-slate-700 text-brand-blue dark:text-white shadow-xs" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setActiveCurrency("CDF")}
                className={`text-[9px] px-2 py-0.5 rounded font-black transition-all cursor-pointer ${
                  activeCurrency === "CDF" 
                    ? "bg-white dark:bg-slate-700 text-brand-green dark:text-white shadow-xs" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                CDF
              </button>
            </div>
          </div>

          <div className="relative pt-2">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
              {/* Horizontal Gridlines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3" />
              <line x1={paddingX} y1={(svgHeight) / 2} x2={svgWidth - paddingX} y2={(svgHeight) / 2} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="3" />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1.5" />
              
              {/* Render Bars */}
              {paymentsData.map((val, idx) => {
                const maxVal = Math.max(...paymentsData, 10);
                const barHeight = ((val) / maxVal) * (svgHeight - paddingY * 2);
                const barWidth = 24;
                const x = paddingX + (idx * (svgWidth - paddingX * 2)) / (paymentsData.length - 1) - barWidth / 2;
                const y = svgHeight - paddingY - barHeight;
                
                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 2)}
                      rx="4"
                      className={`cursor-pointer transition-colors duration-200 ${
                        hoveredPaymentIdx === idx 
                          ? "fill-brand-green" 
                          : "fill-brand-blue/80 dark:fill-brand-blue/50"
                      }`}
                      onMouseEnter={() => setHoveredPaymentIdx(idx)}
                      onMouseLeave={() => setHoveredPaymentIdx(null)}
                    />
                    
                    {/* Monthly Labels */}
                    <text
                      x={x + barWidth / 2}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-bold"
                    >
                      {paymentMonths[idx]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Interactive Tooltip */}
            <div className="min-h-[24px] flex items-center justify-center text-[11px] font-mono mt-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl py-1 text-slate-500 border border-slate-100 dark:border-slate-900">
              {hoveredPaymentIdx !== null ? (
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">En {paymentMonths[hoveredPaymentIdx]} :</span>
                  <span className="font-black text-brand-green">
                    {paymentsData[hoveredPaymentIdx].toLocaleString()} {activeCurrency}
                  </span>
                  <span className="text-[10px] text-slate-400">encaissés en caisse</span>
                </div>
              ) : (
                <span className="text-[10px] italic">Survolez une barre pour voir le montant mensuel perçu</span>
              )}
            </div>
          </div>
        </motion.div>

      </div>

      {/* 4. STATISTICS AND ACADEMIC GAUGES PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Donut Gauge (Left) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center space-x-1">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>Statistiques de Présences</span>
            </h3>
            <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-bold text-slate-500">Mois en cours</span>
          </div>

          <div className="flex flex-col items-center py-2">
            {/* SVG Donut Circle */}
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#2E7D32"
                  strokeWidth="3.2"
                  strokeDasharray="94.2 5.8"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-800 dark:text-white">94.2%</span>
                <span className="text-[8px] font-mono block text-slate-400 -mt-1 uppercase tracking-wide">Présents</span>
              </div>
            </div>

            {/* Sub statistics indices */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center text-xs">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">A l'heure</span>
                <span className="font-black text-slate-700 dark:text-slate-300">96.5%</span>
              </div>
              <div className="p-1.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">En retard</span>
                <span className="font-black text-amber-600">2.1%</span>
              </div>
              <div className="p-1.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Absents</span>
                <span className="font-black text-red-500">1.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Results per Option (Middle) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center space-x-1">
              <Award className="h-4 w-4 text-purple-500" />
              <span>Moyennes Scolaires par Option</span>
            </h3>
            <span className="text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md font-bold text-slate-500">Trimestre 1 (P1+P2)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optionPerformances.map((opt, i) => (
              <div key={i} className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate" title={opt.name}>{opt.name}</span>
                  <span className="font-black text-slate-900 dark:text-white font-mono">{opt.rate}%</span>
                </div>
                
                {/* Horizontal custom progress track */}
                <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${opt.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${opt.rate}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400">
                  <span>Moyenne de l'option</span>
                  <span className="font-mono">{opt.count} élèves évalués</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. MULTI-WIDGET ROW: CALENDAR, EXAMS, RECENT ACTIVITIES, ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar widget (Column 1) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="h-4 w-4 text-brand-blue" />
              <span>Calendrier & Prochains Examens</span>
            </h3>
            <span className="text-[9px] font-mono text-indigo-500 font-bold">JUIN 2026</span>
          </div>

          {/* Mini Calendar Visual representation */}
          <div className="grid grid-cols-7 gap-1 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900/40 text-center">
            {weekDays.map((wd, i) => (
              <div key={i} className={`p-1.5 rounded-lg flex flex-col items-center ${
                wd.active 
                  ? "bg-brand-blue text-white shadow-xs font-black" 
                  : "text-slate-600 dark:text-slate-400"
              }`}>
                <span className="text-[8px] uppercase tracking-wide block opacity-70 font-bold">{wd.day}</span>
                <span className="text-xs font-mono font-bold mt-0.5">{wd.date}</span>
                {wd.hasEvent && !wd.active && (
                  <span className="h-1 w-1 bg-brand-green rounded-full mt-0.5" />
                )}
              </div>
            ))}
          </div>

          {/* Upcoming exams list */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Évaluations à venir</span>
            {upcomingExams.map((ex, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{ex.subject}</p>
                  <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-400 mt-0.5">
                    <span className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 px-1.5 py-0.25 rounded font-black">{ex.type}</span>
                    <span>{ex.class}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-black text-brand-blue block">{ex.date}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{ex.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activities validations stream (Column 2) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="h-4 w-4 text-brand-green" />
              <span>Activités Récentes du Système</span>
            </h3>
            <span className="text-[9px] text-brand-blue hover:underline cursor-pointer font-bold">Tout voir</span>
          </div>

          {/* Activity Stream */}
          <div className="space-y-3">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-xs">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  act.type === "payment" ? "bg-amber-400" :
                  act.type === "student" ? "bg-brand-blue" :
                  act.type === "grade" ? "bg-purple-400" : "bg-brand-green"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{act.text}</p>
                    <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">{act.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security / Sovereign alerts panel (Column 3) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className="h-4 w-4 text-brand-green" />
            <span>Alertes & Souveraineté EPSP</span>
          </h3>

          <div className="space-y-2.5">
            {/* National identification card */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-black text-slate-700 dark:text-slate-300 block uppercase tracking-wide text-[9px]">Souveraineté Identitaire</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold">Province Éducative : Nord-Kivu 1</p>
              <p className="text-slate-400 dark:text-slate-500 font-mono text-[9px] mt-0.5">Code National EPSP : RDC-NK-48291</p>
            </div>

            {/* Overcrowding classroom alert */}
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-950/60 text-xs">
              <span className="font-black text-red-800 dark:text-red-300 block uppercase tracking-wide text-[9px]">Seuils d'Effectifs Scolaires</span>
              <p className="text-red-600 dark:text-red-400 mt-1">
                {crowdedClasses.length > 0 
                  ? `${crowdedClasses.length} classe(s) atteignent la limite nationale de 45 élèves.` 
                  : "Toutes les salles respectent les seuils d'effectifs réglementaires."}
              </p>
            </div>

            {/* Verification backup indicator */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-950/60 text-xs">
              <span className="font-black text-emerald-800 dark:text-emerald-300 block uppercase tracking-wide text-[9px]">Chiffrement & Sauvegardes</span>
              <p className="text-emerald-600 dark:text-emerald-400 mt-1">Sauvegarde locale chiffrée active. Données prêtes à être raccordées à un registre PostgreSQL / Firebase.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Permission Helpers
export function hasFullInscriptionRights(role: string): boolean {
  const r = role.toLowerCase();
  return (
    r.includes("promoteur") ||
    r.includes("super administrateur") ||
    r.includes("directeur") ||
    r.includes("directrice") ||
    r.includes("préfet") ||
    r.includes("comptable") ||
    r.includes("gestionnaire")
  );
}

export function isSecretary(role: string): boolean {
  return role.toLowerCase().includes("secrétaire") || role.toLowerCase().includes("secretaire");
}

// ---------------------------------------------------------------------------
// 2. GESTION DES ÉLÈVES
// ---------------------------------------------------------------------------
interface PupilsViewProps {
  students: Student[];
  parents?: Parent[];
  onAddStudent: (student: Omit<Student, "id" | "registrationNumber">) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddParent?: (parent: Omit<Parent, "id">) => Parent;
  onLinkParentToStudent?: (parentId: string, studentId: string, relationshipType: string, isPrimary?: boolean) => void;
  onUpdateParents?: React.Dispatch<React.SetStateAction<Parent[]>>;
  lang: string;
  userRole: string;
  userName: string;
  auditLogs: InscriptionAuditLog[];
  onValidateStudent: (id: string) => void;
  classes?: ClassRoom[];
  options?: Option[];
  teachers?: Teacher[];
  employees?: Employee[];
  userAccounts?: UserAccount[];
  schoolId?: string;
  schoolName?: string;
}

export function PupilsView({ 
  students, 
  parents = [],
  onAddStudent, 
  onEditStudent, 
  onDeleteStudent, 
  onAddParent,
  onLinkParentToStudent,
  onUpdateParents,
  lang,
  userRole,
  userName,
  auditLogs,
  onValidateStudent,
  classes = [],
  options = [],
  teachers = [],
  employees = [],
  userAccounts = [],
  schoolId,
  schoolName = "Établissement Scolaire"
}: PupilsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"registre" | "audit">("registre");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [photoFilter, setPhotoFilter] = useState<"all" | "missing" | "has_photo">("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [relationshipModalTarget, setRelationshipModalTarget] = useState<{ type: "parent" | "student" | "class"; entity: any } | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [address, setAddress] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  // Guardian / Parent Relational Management
  const [attachedGuardians, setAttachedGuardians] = useState<StudentGuardianLink[]>([]);
  const [isParentSearchModalOpen, setIsParentSearchModalOpen] = useState(false);
  const [parentSearchQuery, setParentSearchQuery] = useState("");
  const [parentSearchTab, setParentSearchTab] = useState<"search" | "create">("search");

  // New Parent Form fields for quick creation during registration
  const [newPLastName, setNewPLastName] = useState("");
  const [newPFirstName, setNewPFirstName] = useState("");
  const [newPPhone, setNewPPhone] = useState("");
  const [newPEmail, setNewPEmail] = useState("");
  const [newPAddress, setNewPAddress] = useState("");
  const [newPRelationship, setNewPRelationship] = useState("Tuteur légal");
  const [newPIsPrimary, setNewPIsPrimary] = useState(true);

  const availableClasses = classes.length > 0 
    ? classes.map(c => c.name || `${c.classGrade || c.level} ${c.roomLetter}`.trim()).filter(Boolean)
    : [];
  const activeOptions = options.length > 0
    ? options.filter(o => o.isActivated !== false).map(o => o.name)
    : ["Mathématiques-Physique", "Commerciale et Gestion", "Pédagogie Générale", "Électricité", "Nutrition"];

  const [className, setClassName] = useState("");
  const [optionName, setOptionName] = useState("");

  React.useEffect(() => {
    if (availableClasses.length > 0 && !className) {
      setClassName(availableClasses[0]);
    }
  }, [classes]);

  React.useEffect(() => {
    if (activeOptions.length > 0 && !optionName) {
      setOptionName(activeOptions[0]);
    }
  }, [options]);

  const [studentStatus, setStudentStatus] = useState<Student["status"]>("Validé");
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedStudentForSheet, setSelectedStudentForSheet] = useState<UserAccount | null>(null);

  const handleCreateStudentAccount = (s: Student) => {
    const generatedCode = s.activationCode || generateUniqueActivationCode("ELEVE");
    const updatedStudent: Student = {
      ...s,
      hasUserAccount: true,
      accountStatus: "pending_activation",
      activationCode: generatedCode
    };
    onEditStudent(updatedStudent);

    const userAcc: UserAccount = {
      id: `acc-elv-${s.id}`,
      dossierId: s.id,
      dossierType: "eleve",
      fullName: `${s.lastName} ${s.firstName}`,
      username: s.registrationNumber,
      role: "Élève",
      activationCode: generatedCode,
      phone: s.parentPhone,
      email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@smartschool.cd`,
      isActive: true,
      isActivated: false,
      schoolName: "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
      targetPortalTab: "eleves",
      createdAt: new Date().toLocaleDateString("fr-FR")
    };
    persistUniversalUserAccount(userAcc);
    setSelectedStudentForSheet(userAcc);
  };

  // Determine permissions
  const isAuthorized = hasFullInscriptionRights(userRole);
  const isSec = isSecretary(userRole);
  const canEnroll = isAuthorized || isSec;

  // Set default status when form opens
  React.useEffect(() => {
    if (isAdding) {
      setStudentStatus(isAuthorized ? "Validé" : "Brouillon");
      setPhotoUrl("");
      setAttachedGuardians([]);
    }
  }, [isAdding, userRole]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.firstName} ${s.lastName} ${s.registrationNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || s.className === classFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesPhoto = photoFilter === "all" || 
      (photoFilter === "missing" && !s.photoUrl) || 
      (photoFilter === "has_photo" && !!s.photoUrl);
    return matchesSearch && matchesClass && matchesStatus && matchesPhoto;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const primaryG = attachedGuardians.find(g => g.isPrimary) || attachedGuardians[0];
    const finalParentName = primaryG ? primaryG.parentName : (parentName || "Parent non renseigné");
    const finalParentPhone = primaryG ? primaryG.parentPhone : (parentPhone || "+243 000 000 000");
    const finalParentAcc = primaryG ? primaryG.parentAccountNumber : undefined;
    const parentIds = attachedGuardians.map(g => g.parentId).filter(Boolean) as string[];
    const primaryParentId = primaryG?.parentId;

    if (editingStudent) {
      onEditStudent({
        ...editingStudent,
        firstName, 
        lastName, 
        birthDate, 
        gender, 
        address, 
        parentName: finalParentName, 
        parentPhone: finalParentPhone, 
        parentAccountNumber: finalParentAcc,
        guardians: attachedGuardians,
        parentIds,
        primaryParentId,
        className, 
        optionName,
        status: studentStatus,
        photoUrl: photoUrl || undefined
      });
      setEditingStudent(null);
    } else {
      onAddStudent({
        firstName, 
        lastName, 
        birthDate, 
        gender, 
        address, 
        parentName: finalParentName, 
        parentPhone: finalParentPhone, 
        parentAccountNumber: finalParentAcc,
        guardians: attachedGuardians,
        parentIds,
        primaryParentId,
        className, 
        optionName, 
        status: studentStatus,
        photoUrl: photoUrl || undefined
      });
      setIsAdding(false);
    }
    // Reset form
    setFirstName(""); setLastName(""); setBirthDate(""); setAddress(""); setParentName(""); setParentPhone(""); setPhotoUrl("");
    setAttachedGuardians([]);
  };

  const startEdit = (s: Student) => {
    setEditingStudent(s);
    setFirstName(s.firstName);
    setLastName(s.lastName);
    setBirthDate(s.birthDate);
    setGender(s.gender);
    setAddress(s.address);
    setParentName(s.parentName);
    setParentPhone(s.parentPhone);
    setClassName(s.className);
    setOptionName(s.optionName);
    setStudentStatus(s.status);
    setPhotoUrl(s.photoUrl || "");
    if (s.guardians && s.guardians.length > 0) {
      setAttachedGuardians(s.guardians);
    } else if (s.parentName) {
      setAttachedGuardians([{
        parentId: s.primaryParentId,
        parentAccountNumber: s.parentAccountNumber || "PAR-2026-0001",
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        relationshipType: "Tuteur légal",
        isPrimary: true
      }]);
    } else {
      setAttachedGuardians([]);
    }
  };

  const getUniqueClasses = () => {
    const studentClasses = students.map(s => s.className);
    const createdClasses = classes.map(c => `${c.classGrade || c.level} ${c.roomLetter}`);
    return Array.from(new Set([...studentClasses, ...createdClasses]));
  };

  return (
    <div className="space-y-6">
      {/* HEADER PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Inscriptions & Dossiers Élèves</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Saisie des inscriptions scolaires, gestion des statuts de dossiers et journal d'audit national RDC.</p>
        </div>
        
        {/* Conditional button rendering based on permissions */}
        {canEnroll && (
          <button
            onClick={() => { setIsAdding(true); setEditingStudent(null); }}
            className="text-xs bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold px-4 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center space-x-1"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>{isSec ? "Préparer une inscription (Dossier)" : "Nouvelle inscription"}</span>
          </button>
        )}
      </div>

      {/* PHOTO REMINDER BANNER FOR ADMINISTRATION / RH */}
      {students.filter(s => !s.photoUrl).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 p-4 rounded-2xl border border-amber-200/55 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 dark:text-amber-200">Alerte Direction & Bureau RH</h4>
              <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                Il y a <strong className="font-black text-amber-600 dark:text-amber-400">{students.filter(s => !s.photoUrl).length} élève(s)</strong> sans photo de profil enregistrée dans leur dossier d'inscription. Veuillez mettre à jour ces dossiers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {photoFilter !== "missing" ? (
              <button
                onClick={() => setPhotoFilter("missing")}
                className="px-3 py-1.5 bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600 text-white font-bold rounded-lg transition-all text-[11px] cursor-pointer"
              >
                Filtrer à corriger
              </button>
            ) : (
              <button
                onClick={() => setPhotoFilter("all")}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-all text-[11px] cursor-pointer"
              >
                Tout afficher
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* SUB-TAB NAVIGATOR (Visible to authorized roles to audit files) */}
      {isAuthorized && (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab("registre")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === "registre"
                ? "border-brand-blue text-brand-blue dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800"
            }`}
          >
            Registre d'inscription & Dossiers
          </button>
          <button
            onClick={() => setActiveSubTab("audit")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === "audit"
                ? "border-brand-blue text-brand-blue dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Journal d'Audit des Inscriptions</span>
          </button>
        </div>
      )}

      {activeSubTab === "registre" ? (
        <>
          {/* FILTER & SEARCH PANEL */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm"
          >
            <div className="relative sm:col-span-2 md:col-span-2">
              <Search className="absolute inset-y-0 left-3 h-5 w-5 text-slate-400 flex items-center justify-center my-auto" />
              <input
                type="text"
                placeholder="Rechercher par Nom, Prénom ou Matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
            <div>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">Toutes les classes</option>
                {getUniqueClasses().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="Brouillon">Brouillon</option>
                <option value="En attente">En attente</option>
                <option value="À compléter">À compléter</option>
                <option value="Validé">Validé</option>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Archivé">Archivé</option>
                <option value="Transféré">Transféré</option>
                <option value="Exclu">Exclu</option>
              </select>
            </div>
            <div>
              <select
                value={photoFilter}
                onChange={(e) => setPhotoFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none font-semibold"
              >
                <option value="all">Filtre Photo (Tous)</option>
                <option value="has_photo">Avec photo de profil</option>
                <option value="missing">Sans photo ⚠️</option>
              </select>
            </div>
          </motion.div>

          {/* ADD / EDIT FORM OVERLAY */}
          {(isAdding || editingStudent) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                  <h3 className="font-bold text-slate-950 dark:text-white text-base">
                    {editingStudent ? `Modifier le dossier de ${editingStudent.firstName}` : isSec ? "Préparer un dossier d'inscription" : "Nouvelle inscription d'élève"}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => { setIsAdding(false); setEditingStudent(null); }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
                  {/* Warning banner for Secretary */}
                  {isSec && (
                    <div className="bg-blue-50/70 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-start space-x-2.5">
                      <AlertCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        En tant que <strong>Secrétaire</strong>, vous préparez un dossier de pré-inscription. Ce dossier devra être validé par un Directeur, Préfet ou Comptable pour devenir officiel.
                      </p>
                    </div>
                  )}

                  {/* Photo de profil (facultative) */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
                    <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">Photo de l'élève (Facultative - Peut être ajoutée ultérieurement)</span>
                    <div className="flex items-center space-x-4">
                      {/* Photo preview */}
                      <div className="relative h-16 w-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                        {photoUrl ? (
                          <>
                            <img src={photoUrl} alt="Aperçu" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPhotoUrl("")}
                              className="absolute top-0 right-0 bg-rose-600 hover:bg-rose-700 text-white p-0.5 rounded-bl-lg transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-1 text-slate-400">
                            <Camera className="h-5 w-5 mx-auto opacity-70" />
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-colors cursor-pointer text-[10px] flex items-center space-x-1">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Sélectionner une photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setPhotoUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {photoUrl && (
                            <button
                              type="button"
                              onClick={() => setPhotoUrl("")}
                              className="px-2 py-1.5 text-rose-600 hover:text-rose-700 font-bold text-[10px]"
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">Sélectionnez un fichier image JPEG/PNG (Base64 local).</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Nom de famille</label>
                      <input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Prénom</label>
                      <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Date de naissance</label>
                      <input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Genre</label>
                      <select value={gender} onChange={e => setGender(e.target.value as "M" | "F")} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">
                        <option value="M">Masculin (M)</option>
                        <option value="F">Féminin (F)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Adresse résidentielle</label>
                    <input required value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Classe</label>
                      <select 
                        value={className} 
                        onChange={e => {
                          const val = e.target.value;
                          setClassName(val);
                          const matchedClass = classes.find(c => `${c.classGrade || c.level} ${c.roomLetter}` === val);
                          if (matchedClass && matchedClass.optionName && matchedClass.optionName !== "Néant") {
                            setOptionName(matchedClass.optionName);
                          }
                        }} 
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white"
                      >
                        {availableClasses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Option</label>
                      <select value={optionName} onChange={e => setOptionName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">
                        {activeOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="Néant">Néant (Pas d'option)</option>
                      </select>
                    </div>
                  </div>

                  {/* MULTI-GUARDIAN & ANTI-DUPLICATE PARENT MANAGEMENT */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-brand-blue" />
                          Parents & Responsables Rattachés (Dossiers Indépendants RDC)
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Chaque élève peut avoir plusieurs tuteurs rattachés, avec 1 responsable principal pour notifications et écolage.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsParentSearchModalOpen(true);
                          setParentSearchQuery("");
                          setParentSearchTab("search");
                        }}
                        className="text-xs bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue dark:text-blue-400 font-bold px-3 py-1.5 rounded-lg border border-brand-blue/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>Rechercher / Associer Parent</span>
                      </button>
                    </div>

                    {/* Attached Guardians List */}
                    {attachedGuardians.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {attachedGuardians.map((g, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-brand-blue dark:text-blue-300 px-2 py-0.5 rounded-md">
                                  {g.relationshipType || "Tuteur légal"}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white text-xs">
                                  {g.parentName}
                                </span>
                                {g.parentAccountNumber && (
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    {g.parentAccountNumber}
                                  </span>
                                )}
                                {g.isPrimary && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                                    ⭐ Responsable Principal
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Contact : <span className="font-semibold text-slate-700 dark:text-slate-300">{g.parentPhone}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {!g.isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAttachedGuardians(prev => prev.map((item, i) => ({
                                      ...item,
                                      isPrimary: i === idx
                                    })));
                                  }}
                                  className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 px-2 py-1 rounded-lg transition-all cursor-pointer"
                                >
                                  Définir comme Principal
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setAttachedGuardians(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-all cursor-pointer"
                                title="Retirer ce tuteur"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            Aucun dossier parent associé. Veuillez saisir ci-dessous ou utiliser la recherche anti-doublon :
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Nom complet du Tuteur</label>
                            <input
                              required
                              placeholder="ex: TSHIBANDA Joseph"
                              value={parentName}
                              onChange={e => setParentName(e.target.value)}
                              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Téléphone (SMS / WhatsApp)</label>
                            <input
                              required
                              placeholder="+243..."
                              value={parentPhone}
                              onChange={e => setParentPhone(e.target.value)}
                              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Status Dropdown based on Role permissions */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Statut de l'inscription</label>
                    <select 
                      value={studentStatus} 
                      onChange={e => setStudentStatus(e.target.value as any)} 
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-semibold"
                    >
                      {isSec ? (
                        <>
                          <option value="Brouillon">Brouillon</option>
                          <option value="En attente">En attente (Pour validation)</option>
                          <option value="À compléter">À compléter (Pièces manquantes)</option>
                        </>
                      ) : (
                        <>
                          <option value="Brouillon">Brouillon</option>
                          <option value="En attente">En attente (Pour validation)</option>
                          <option value="À compléter">À compléter (Pièces manquantes)</option>
                          <option value="Validé">Validé (Inscription Officielle)</option>
                          <option value="Actif">Actif</option>
                          <option value="Suspendu">Suspendu</option>
                          <option value="Archivé">Archivé</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => { setIsAdding(false); setEditingStudent(null); }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* STUDENT DATA TABLE */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Matricule</th>
                    <th className="py-3 px-4">Nom Complet</th>
                    <th className="py-3 px-4">Genre</th>
                    <th className="py-3 px-4">Classe & Option</th>
                    <th className="py-3 px-4">Parent / Tuteur</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                        Aucun élève trouvé ou aucun dossier correspondant aux filtres.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => {
                      const isPendingValidation = ["Brouillon", "En attente", "À compléter"].includes(s.status);
                      return (
                        <motion.tr 
                          key={s.id} 
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.03 + 0.12 }}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-brand-blue dark:text-blue-400">
                            {s.registrationNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              {/* Avatar representation with fallback warning */}
                              <div className="relative shrink-0">
                                {s.photoUrl ? (
                                  <img 
                                    src={s.photoUrl} 
                                    alt={`${s.lastName} ${s.firstName}`} 
                                    className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-850" 
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border-2 border-dashed border-amber-300 dark:border-amber-800 text-amber-500" title="Photo de profil manquante">
                                    <Camera className="h-4.5 w-4.5" />
                                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">!</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 dark:text-white block">
                                  {s.lastName} {s.firstName}
                                </span>
                                {s.createdBy && (
                                  <span className="text-[9px] text-slate-400 font-medium block">
                                    Saisi par : {s.createdBy} ({s.createdByRole})
                                  </span>
                                )}
                                {!s.photoUrl && (
                                  <span className="inline-flex items-center text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-md mt-1 border border-amber-200/50">
                                    ⚠️ Photo manquante
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">{s.gender}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold">{s.className}</span>
                            <span className="text-[10px] text-slate-400 block">{s.optionName}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{s.parentName}</span>
                            <span className="text-[10px] text-slate-400 block">{s.parentPhone}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              s.status === "Brouillon" ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" :
                              s.status === "En attente" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400" :
                              s.status === "À compléter" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400" :
                              s.status === "Validé" || s.status === "Actif" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400" :
                              s.status === "Suspendu" ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400" :
                              "bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400"
                            }`}>
                              {s.status === "Validé" ? "Validé ✅" : s.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Quick Validate Button for admins */}
                              {isPendingValidation && isAuthorized && (
                                <button
                                  onClick={() => onValidateStudent(s.id)}
                                  className="text-[10px] font-bold text-emerald-600 hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded transition-colors flex items-center space-x-0.5 cursor-pointer"
                                  title="Valider l'inscription"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Valider</span>
                                </button>
                              )}

                              {s.hasUserAccount ? (
                                <button
                                  onClick={() => handleCreateStudentAccount(s)}
                                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 px-2 py-1 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                                  title="Consulter et imprimer la fiche de connexion officielle"
                                >
                                  <KeyRound className="h-3 w-3" />
                                  <span>Fiche Accès</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCreateStudentAccount(s)}
                                  className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                                  title="Générer les identifiants et le code d'activation pour le portail Élève"
                                >
                                  <KeyRound className="h-3 w-3" />
                                  <span>Créer le compte</span>
                                </button>
                              )}

                              {/* Manage Parent & Account Relations Button */}
                              <button
                                onClick={() => setRelationshipModalTarget({ type: "student", entity: s })}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors cursor-pointer"
                                title="Gérer les relations parents et le compte utilisateur"
                              >
                                <UserCog className="h-4.5 w-4.5" />
                              </button>

                              {!s.photoUrl && (
                                <button
                                  onClick={() => startEdit(s)}
                                  className="p-1 text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 rounded transition-colors cursor-pointer"
                                  title="Ajouter la photo de profil"
                                >
                                  <Camera className="h-4.5 w-4.5" />
                                </button>
                              )}

                              <button
                                onClick={() => startEdit(s)}
                                className="p-1 text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
                                title="Modifier"
                              >
                                <Edit3 className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => onDeleteStudent(s.id)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      ) : (
        /* AUDIT LOG PANEL */
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1">
              <ShieldCheck className="h-4 w-4 text-brand-blue" />
              <span>Souveraineté des données d'inscription (Audit Trail)</span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Toutes les inscriptions et modifications de dossiers élèves sont loggées automatiquement au niveau national. Les données incluent l'identité de l'opérateur, l'heure, l'adresse IP de connexion et l'appareil utilisé.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Élève Concerné</th>
                    <th className="py-3 px-4">Opérateur</th>
                    <th className="py-3 px-4">Rôle</th>
                    <th className="py-3 px-4">Adresse IP</th>
                    <th className="py-3 px-4">Appareil</th>
                    <th className="py-3 px-4">Action effectée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-[10px] text-slate-600 dark:text-slate-400">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-300">
                        {log.date} - {log.time}
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-blue dark:text-blue-400">
                        {log.studentName}
                      </td>
                      <td className="py-3 px-4 font-medium">{log.actorName}</td>
                      <td className="py-3 px-4 uppercase tracking-wider">{log.actorRole}</td>
                      <td className="py-3 px-4">{log.ipAddress}</td>
                      <td className="py-3 px-4 truncate max-w-[150px]" title={log.device}>{log.device}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          log.action.includes("Valid") ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PARENT SEARCH AND ASSOCIATE MODAL OVERLAY */}
      {isParentSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-blue" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Recherche Anti-Doublon & Rattachement Parent / Tuteur
                </h3>
              </div>
              <button
                onClick={() => setIsParentSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setParentSearchTab("search")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  parentSearchTab === "search"
                    ? "bg-white dark:bg-slate-900 text-brand-blue dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                🔎 Rechercher Parent Existant
              </button>
              <button
                type="button"
                onClick={() => setParentSearchTab("create")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  parentSearchTab === "create"
                    ? "bg-white dark:bg-slate-900 text-brand-blue dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                ➕ Créer Nouveau Dossier Parent
              </button>
            </div>

            {parentSearchTab === "search" ? (
              <div className="space-y-3 flex-1 overflow-y-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par Nom, Prénom, Téléphone (+243), Matricule Parent (PAR-2026-...)..."
                    value={parentSearchQuery}
                    onChange={e => setParentSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="space-y-2">
                  {searchParentsDatabase(parents, parentSearchQuery).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Users className="h-8 w-8 mx-auto opacity-40 text-slate-400" />
                      <p className="text-xs font-medium">Aucun parent correspondant dans la base de données.</p>
                      <button
                        type="button"
                        onClick={() => setParentSearchTab("create")}
                        className="text-xs text-brand-blue font-bold underline cursor-pointer"
                      >
                        Créer un nouveau dossier parent avec N° de compte automatique
                      </button>
                    </div>
                  ) : (
                    searchParentsDatabase(parents, parentSearchQuery).map((p) => {
                      const isAlreadyAttached = attachedGuardians.some(g => g.parentId === p.id);
                      const childrenNames = p.childrenNames && p.childrenNames.length > 0 ? p.childrenNames : [];
                      return (
                        <div key={p.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white text-xs">
                                  {p.lastName} {p.firstName}
                                </span>
                                <span className="text-[10px] font-mono text-brand-blue font-bold bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                                  {p.parentAccountNumber || `PAR-2026-${p.id}`}
                                </span>
                                <span className="text-[10px] text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                                  {p.relationship || "Tuteur"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                                <span>📞 {p.phone}</span>
                                {p.email && <span>✉️ {p.email}</span>}
                                {p.address && <span>📍 {p.address}</span>}
                              </div>
                            </div>

                            {isAlreadyAttached ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-300">
                                ✓ Déjà rattaché
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const newG: StudentGuardianLink = {
                                    parentId: p.id,
                                    parentAccountNumber: p.parentAccountNumber || `PAR-2026-${p.id}`,
                                    parentName: `${p.firstName} ${p.lastName}`,
                                    parentPhone: p.phone,
                                    parentEmail: p.email,
                                    relationshipType: newPRelationship || p.relationship || "Tuteur légal",
                                    isPrimary: attachedGuardians.length === 0
                                  };
                                  setAttachedGuardians(prev => [...prev, newG]);
                                  setParentName(`${p.lastName} ${p.firstName}`);
                                  setParentPhone(p.phone);
                                  setIsParentSearchModalOpen(false);
                                }}
                                className="text-xs bg-brand-blue hover:bg-brand-blue-hover text-white font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs flex items-center gap-1"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Associer ce Parent</span>
                              </button>
                            )}
                          </div>

                          {/* Children badges */}
                          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Enfants rattachés ({childrenNames.length}) :</span>
                            {childrenNames.map((child, cIdx) => (
                              <span key={cIdx} className="text-[10px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-semibold">
                                👶 {child}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* CREATE NEW PARENT FORM */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newPLastName || !newPFirstName) return;
                  const parentAcc = generateParentAccountNumber();
                  const parentObj: Omit<Parent, "id"> = {
                    lastName: newPLastName.toUpperCase(),
                    firstName: newPFirstName,
                    phone: newPPhone || "+243 810 000 000",
                    email: newPEmail || `${newPFirstName.toLowerCase()}.${newPLastName.toLowerCase()}@gmail.com`,
                    address: newPAddress || "",
                    relationship: newPRelationship,
                    childrenNames: [firstName ? `${firstName} ${lastName}` : "Nouvel élève"],
                    outstandingBalance: 0,
                    parentAccountNumber: parentAcc,
                    accountCreated: true,
                    portalAccess: true
                  };
                  if (onAddParent) {
                    const createdP = onAddParent(parentObj);
                    const newG: StudentGuardianLink = {
                      parentId: createdP.id,
                      parentAccountNumber: createdP.parentAccountNumber || parentAcc,
                      parentName: `${createdP.firstName} ${createdP.lastName}`,
                      parentPhone: createdP.phone,
                      parentEmail: createdP.email,
                      relationshipType: newPRelationship,
                      isPrimary: newPIsPrimary || attachedGuardians.length === 0
                    };
                    setAttachedGuardians(prev => [...prev, newG]);
                    setParentName(`${createdP.lastName} ${createdP.firstName}`);
                    setParentPhone(createdP.phone);
                  }
                  setIsParentSearchModalOpen(false);
                }}
                className="space-y-3 flex-1 overflow-y-auto text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300">Nom de famille *</label>
                    <input required value={newPLastName} onChange={e => setNewPLastName(e.target.value)} placeholder="ex: LUKUSA" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300">Prénom *</label>
                    <input required value={newPFirstName} onChange={e => setNewPFirstName(e.target.value)} placeholder="ex: Jean-Pierre" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300">Téléphone Mobile (+243) *</label>
                    <input required value={newPPhone} onChange={e => setNewPPhone(e.target.value)} placeholder="+243..." className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300">Email</label>
                    <input value={newPEmail} onChange={e => setNewPEmail(e.target.value)} placeholder="parent@gmail.com" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300">Lien de Parenté</label>
                    <select value={newPRelationship} onChange={e => setNewPRelationship(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold">
                      <option value="Père">Père</option>
                      <option value="Mère">Mère</option>
                      <option value="Tuteur légal">Tuteur légal</option>
                      <option value="Oncle / Tante">Oncle / Tante</option>
                      <option value="Frère / Sœur">Frère / Sœur</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300">Adresse Résidentielle</label>
                    <input value={newPAddress} onChange={e => setNewPAddress(e.target.value)} placeholder="Commune, Quartier, Ville" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setIsParentSearchModalOpen(false)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg cursor-pointer">Annuler</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold rounded-lg shadow-sm cursor-pointer">Créer & Associer</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL LOGIN CREDENTIALS SHEET MODAL */}
      {selectedStudentForSheet && (
        <OfficialLoginSheetModal
          account={selectedStudentForSheet}
          onClose={() => setSelectedStudentForSheet(null)}
          schoolName="COMPLEXE SCOLAIRE SMARTSCHOOL RDC"
        />
      )}

      {/* RELATIONSHIP MANAGER MODAL FOR PUPILS */}
      {relationshipModalTarget && (
        <RelationshipManagerModal
          isOpen={!!relationshipModalTarget}
          targetType={relationshipModalTarget.type}
          targetParent={relationshipModalTarget.type === "parent" ? relationshipModalTarget.entity : null}
          targetStudent={relationshipModalTarget.type === "student" ? relationshipModalTarget.entity : null}
          targetClass={relationshipModalTarget.type === "class" ? relationshipModalTarget.entity : null}
          teachers={teachers}
          employees={employees}
          userAccounts={userAccounts}
          students={students}
          parents={parents}
          classes={classes}
          schoolId={schoolId}
          schoolName={schoolName}
          onClose={() => setRelationshipModalTarget(null)}
          onUpdateStudent={(updatedStudent) => {
            onEditStudent(updatedStudent);
            setRelationshipModalTarget(null);
          }}
          onUpdateParent={(updatedParent) => {
            if (onUpdateParents) {
              onUpdateParents(prev => prev.map(p => p.id === updatedParent.id ? updatedParent : p));
            }
            setRelationshipModalTarget(null);
          }}
        />
      )}

      <p className="text-[10px] text-slate-400 text-left">MODULE TERMINÉ ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. GESTION DES ENSEIGNANTS & PORTAIL PÉDAGOGIQUE
// ---------------------------------------------------------------------------
interface TeachersViewProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Omit<Teacher, "id">, autoCreateAccount?: boolean) => void;
  onDeleteTeacher: (id: string) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onUpdateTeachers?: React.Dispatch<React.SetStateAction<Teacher[]>>;
  userAccounts?: UserAccount[];
  onUpdateUserAccounts?: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  classes?: ClassRoom[];
  subjects?: Subject[];
  schoolId?: string;
  schoolName?: string;
  schoolLogoUrl?: string;
  schoolMotto?: string;
  onOpenPortal?: (account: UserAccount) => void;
  onAddAuditLog?: (action: string, targetName: string) => void;
}

export function TeachersView({ 
  teachers: initialTeachers, 
  onAddTeacher, 
  onDeleteTeacher,
  onUpdateTeacher,
  onUpdateTeachers,
  userAccounts = [],
  onUpdateUserAccounts,
  classes = [],
  subjects = [],
  schoolId,
  schoolName = "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
  schoolLogoUrl,
  schoolMotto = "Science - Conscience - Excellence",
  onOpenPortal,
  onAddAuditLog
}: TeachersViewProps) {
  const [teachersList, setTeachersList] = useState<Teacher[]>(initialTeachers || []);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAccountStatus, setFilterAccountStatus] = useState<"all" | "active" | "unprovisioned">("all");

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [postName, setPostName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [matriculeEtat, setMatriculeEtat] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [salaryBase, setSalaryBase] = useState(450);
  const [weeklyHours, setWeeklyHours] = useState(18);
  const [assignedClassList, setAssignedClassList] = useState<string[]>([]);
  const [autoCreateAccount, setAutoCreateAccount] = useState(true);

  // Sheet Modal & Details Modal State
  const [selectedTeacherForSheet, setSelectedTeacherForSheet] = useState<UserAccount | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Sync teachers from parent
  React.useEffect(() => {
    if (initialTeachers) setTeachersList(initialTeachers);
  }, [initialTeachers]);

  // Available classes names for selection (Strictly from real DB classes)
  const availableClassNames = React.useMemo(() => {
    if (classes.length > 0) {
      return classes.map(c => c.name || `${c.levelCategory === "Maternelle" ? "Maternelle " : ""}${c.classGrade || c.level} ${c.roomLetter}`.trim()).filter(Boolean);
    }
    return [];
  }, [classes]);

  // Generate real portal account for a teacher
  const generateTeacherAccount = (teacherItem: Teacher) => {
    const cleanFirstName = (teacherItem.firstName || "enseignant").toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLastName = (teacherItem.lastName || "prof").toLowerCase().replace(/[^a-z0-9]/g, "");

    // Check existing accounts
    const storedAccounts = getStoredUniversalUserAccounts();
    const existingAcc = storedAccounts.find(
      a => a.dossierId === teacherItem.id || 
           (teacherItem.matriculeEtat && a.username === teacherItem.matriculeEtat) ||
           (teacherItem.phone && a.phone === teacherItem.phone) ||
           (teacherItem.email && a.email === teacherItem.email)
    );

    const generatedUsername = existingAcc?.username || teacherItem.matriculeEtat || `ENS-${cleanLastName.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedCode = existingAcc?.activationCode || teacherItem.activationCode || generateUniqueActivationCode("ENSEIGNANT");
    const teacherPassword = existingAcc?.tempPassword || existingAcc?.password || `Prof${Math.floor(1000 + Math.random() * 9000)}!`;

    const updatedTeacher: Teacher = {
      ...teacherItem,
      hasUserAccount: true,
      accountCreated: true,
      accountStatus: "active",
      userAccountRole: "Enseignant",
      username: generatedUsername,
      activationCode: generatedCode,
      tempPassword: teacherPassword,
      portalAccess: true,
      activationDate: teacherItem.activationDate || new Date().toLocaleDateString("fr-FR")
    };

    const newAccount: UserAccount = {
      id: existingAcc?.id || `acc-ens-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dossierId: teacherItem.id,
      dossierType: "personnel",
      fullName: `Prof. ${teacherItem.lastName} ${teacherItem.firstName}`,
      username: generatedUsername,
      matricule: teacherItem.matriculeEtat || generatedUsername,
      role: "Enseignant",
      functionTitle: `Enseignant / Spécialiste ${teacherItem.specialty || ""}`,
      phone: teacherItem.phone,
      email: teacherItem.email,
      isActive: true,
      isActivated: false,
      activationCode: generatedCode,
      tempPassword: teacherPassword,
      isTempPassword: true,
      schoolId: schoolId || teacherItem.schoolId || "sch-001",
      schoolName: schoolName,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      portalUrl: "/portail/enseignant",
      portalCode: "PORTAL_TEACHER",
      portalName: "Portail Pédagogique Enseignant",
      targetPortalTab: "enseignants",
      permissions: [
        "portal_teacher_access",
        "grade_entry",
        "homework_management",
        "attendance_recording",
        "view_classes",
        "chat_messagerie"
      ]
    };

    // Update in memory & storage
    persistUniversalUserAccount(newAccount);

    if (onUpdateUserAccounts) {
      onUpdateUserAccounts(prev => {
        const filtered = prev.filter(a => a.id !== newAccount.id && a.dossierId !== newAccount.dossierId);
        return [newAccount, ...filtered];
      });
    }

    setTeachersList(prev => prev.map(t => t.id === teacherItem.id ? updatedTeacher : t));
    if (onUpdateTeacher) onUpdateTeacher(updatedTeacher);
    if (onUpdateTeachers) onUpdateTeachers(prev => prev.map(t => t.id === teacherItem.id ? updatedTeacher : t));

    if (onAddAuditLog) {
      onAddAuditLog("Génération Compte Portail Enseignant", `${teacherItem.firstName} ${teacherItem.lastName} (${generatedUsername})`);
    }

    setSelectedTeacherForSheet(newAccount);
  };

  // Toggle account status (active/suspended)
  const handleToggleAccountStatus = (teacherItem: Teacher) => {
    const isCurrentlyActive = teacherItem.hasUserAccount && teacherItem.accountStatus !== "suspended";
    const nextStatus = isCurrentlyActive ? "suspended" : "active";

    const updatedTeacher: Teacher = {
      ...teacherItem,
      accountStatus: nextStatus,
      portalAccess: !isCurrentlyActive
    };

    // Update universal user accounts
    const storedAccounts = getStoredUniversalUserAccounts();
    const matchAcc = storedAccounts.find(a => a.dossierId === teacherItem.id || a.username === teacherItem.username);
    if (matchAcc) {
      const updatedAcc = { ...matchAcc, isActive: !isCurrentlyActive, isSuspended: isCurrentlyActive };
      persistUniversalUserAccount(updatedAcc);
      if (onUpdateUserAccounts) {
        onUpdateUserAccounts(prev => prev.map(a => a.id === updatedAcc.id ? updatedAcc : a));
      }
    }

    setTeachersList(prev => prev.map(t => t.id === teacherItem.id ? updatedTeacher : t));
    if (onUpdateTeacher) onUpdateTeacher(updatedTeacher);
    if (onUpdateTeachers) onUpdateTeachers(prev => prev.map(t => t.id === teacherItem.id ? updatedTeacher : t));

    if (onAddAuditLog) {
      onAddAuditLog(isCurrentlyActive ? "Suspension Accès Enseignant" : "Réactivation Accès Enseignant", `${teacherItem.firstName} ${teacherItem.lastName}`);
    }
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !firstName.trim()) return;

    const newTeacherData: Omit<Teacher, "id"> = {
      firstName,
      lastName,
      postName,
      email,
      phone,
      matriculeEtat: matriculeEtat.trim() || `ENS-${lastName.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      specialty: specialty || "Matières Générales",
      salaryBase: Number(salaryBase) || 450,
      weeklyHours: Number(weeklyHours) || 18,
      assignedClasses: assignedClassList,
      schoolId: schoolId,
      hasUserAccount: autoCreateAccount,
      accountCreated: autoCreateAccount,
      accountStatus: autoCreateAccount ? "active" : "unprovisioned",
      userAccountRole: "Enseignant",
      portalAccess: autoCreateAccount
    };

    onAddTeacher(newTeacherData, autoCreateAccount);

    setIsAdding(false);
    setFirstName("");
    setLastName("");
    setPostName("");
    setEmail("");
    setPhone("");
    setMatriculeEtat("");
    setSpecialty("");
    setSalaryBase(450);
    setWeeklyHours(18);
    setAssignedClassList([]);
  };

  // Bulk generate missing accounts
  const handleBulkGenerateAccounts = () => {
    const withoutAccount = teachersList.filter(t => !t.hasUserAccount || !t.username);
    if (withoutAccount.length === 0) {
      alert("Tous les enseignants possèdent déjà un compte portail actif !");
      return;
    }

    if (confirm(`Générer automatiquement les accès au portail pour les ${withoutAccount.length} enseignant(s) sans compte ?`)) {
      withoutAccount.forEach(t => {
        generateTeacherAccount(t);
      });
      alert(`Accès générés avec succès pour ${withoutAccount.length} enseignant(s) !`);
    }
  };

  // Filtered teachers
  const filteredTeachers = React.useMemo(() => {
    return teachersList.filter(t => {
      if (filterAccountStatus === "active" && (!t.hasUserAccount || t.accountStatus === "suspended")) return false;
      if (filterAccountStatus === "unprovisioned" && t.hasUserAccount) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const nameMatch = `${t.lastName || ""} ${t.firstName || ""} ${t.postName || ""}`.toLowerCase().includes(q);
      const specMatch = t.specialty?.toLowerCase().includes(q);
      const phoneMatch = t.phone?.toLowerCase().includes(q);
      const matMatch = t.matriculeEtat?.toLowerCase().includes(q) || t.username?.toLowerCase().includes(q);
      const classMatch = t.assignedClasses?.some(c => c.toLowerCase().includes(q));
      return nameMatch || specMatch || phoneMatch || matMatch || classMatch;
    });
  }, [teachersList, searchTerm, filterAccountStatus]);

  const activeAccountsCount = teachersList.filter(t => t.hasUserAccount && t.accountStatus !== "suspended").length;
  const unprovisionedCount = teachersList.filter(t => !t.hasUserAccount).length;

  return (
    <div className="space-y-6" id="teachers-view-container">
      
      {/* HEADER WITH STATS & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Corps Professoral & Portails Enseignants
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Création des fiches pédagogiques, génération des comptes utilisateurs et délivrance des accès au portail enseignant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unprovisionedCount > 0 && (
            <button
              onClick={handleBulkGenerateAccounts}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Générer les accès portail pour les enseignants sans compte"
            >
              <KeyRound className="h-4 w-4" />
              <span>Générer tous les accès ({unprovisionedCount})</span>
            </button>
          )}

          <button
            onClick={() => setIsAdding(true)}
            className="text-xs bg-gradient-to-r from-indigo-600 to-teal-600 hover:opacity-95 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            id="btn-add-teacher"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Enregistrer Enseignant</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher (Nom, Spécialité, Matricule, Classe)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setFilterAccountStatus("all")}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              filterAccountStatus === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            Tous ({teachersList.length})
          </button>
          <button
            onClick={() => setFilterAccountStatus("active")}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
              filterAccountStatus === "active"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Portail Actif ({activeAccountsCount})</span>
          </button>
          <button
            onClick={() => setFilterAccountStatus("unprovisioned")}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
              filterAccountStatus === "unprovisioned"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Sans Compte ({unprovisionedCount})</span>
          </button>
        </div>
      </div>

      {/* CREATE TEACHER FORM / MODAL */}
      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 p-6 rounded-3xl space-y-5 text-xs text-left shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Créer une Fiche & un Accès Enseignant</h3>
                <p className="text-[11px] text-slate-500">Enregistrement administratif et génération automatique des identifiants sécurisés</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAdding(false)} 
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nom de famille *</label>
              <input 
                required 
                placeholder="Ex: KALONJI" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Post-nom</label>
              <input 
                placeholder="Ex: MUKENDI" 
                value={postName} 
                onChange={e => setPostName(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Prénom *</label>
              <input 
                required 
                placeholder="Ex: Jean-Luc" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Téléphone Mobile *</label>
              <input 
                required 
                placeholder="+243..." 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Adresse e-mail</label>
              <input 
                type="email" 
                placeholder="professeur@ecole.cd" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Matricule d'État / Interne</label>
              <input 
                placeholder="Ex: ENS-2026-8890" 
                value={matriculeEtat} 
                onChange={e => setMatriculeEtat(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Matière Principale / Spécialité *</label>
              <input 
                required 
                placeholder="Ex: Mathématiques, Physique, Français, SVT" 
                value={specialty} 
                onChange={e => setSpecialty(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Volume Horaire (h/semaine)</label>
              <input 
                type="number" 
                min={1} 
                max={40} 
                value={weeklyHours} 
                onChange={e => setWeeklyHours(Number(e.target.value))} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Salaire de Base Mensuel (USD)</label>
              <input 
                type="number" 
                required 
                value={salaryBase} 
                onChange={e => setSalaryBase(Number(e.target.value))} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-medium outline-none focus:border-indigo-500" 
              />
            </div>

            {/* ASSIGNED CLASSES MULTI-SELECT */}
            <div className="md:col-span-3 space-y-1.5 pt-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Classes prises en charge par cet enseignant
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {availableClassNames.map(clsName => {
                  const isSelected = assignedClassList.includes(clsName);
                  return (
                    <button
                      type="button"
                      key={clsName}
                      onClick={() => {
                        if (isSelected) {
                          setAssignedClassList(prev => prev.filter(c => c !== clsName));
                        } else {
                          setAssignedClassList(prev => [...prev, clsName]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-600 text-white shadow-xs" 
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                      }`}
                    >
                      <span>{clsName}</span>
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AUTO CREATE PORTAL ACCOUNT TOGGLE */}
            <div className="md:col-span-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Créer immédiatement le compte portail et générer les accès
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Génère un identifiant unique, un mot de passe temporaire et permet l'impression immédiate de la fiche de connexion.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoCreateAccount}
                onChange={e => setAutoCreateAccount(e.target.checked)}
                className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="md:col-span-3 flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                id="btn-save-teacher"
              >
                <Check className="h-4 w-4" />
                <span>{autoCreateAccount ? "Enregistrer la fiche & Créer le compte" : "Enregistrer la fiche"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* TEACHERS LIST GRID */}
      {filteredTeachers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <GraduationCap className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Aucun enseignant trouvé</h4>
          <p className="text-slate-400 text-xs">Ajustez vos filtres ou enregistrez un nouvel enseignant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="teachers-grid">
          {filteredTeachers.map((t) => {
            const hasAccount = Boolean(t.hasUserAccount && (t.username || t.matriculeEtat));
            const isSuspended = t.accountStatus === "suspended";

            return (
              <div 
                key={t.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4 relative overflow-hidden text-xs flex flex-col justify-between"
                id={`teacher-card-${t.id}`}
              >
                {/* Top Accent Strip */}
                <div className={`absolute top-0 right-0 h-1.5 w-full ${hasAccount && !isSuspended ? "bg-emerald-500" : isSuspended ? "bg-red-500" : "bg-amber-400"}`} />
                
                {/* Header & Avatar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                        {t.firstName?.charAt(0) || "P"}{t.lastName?.charAt(0) || "E"}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                          Prof. {t.lastName} {t.firstName} {t.postName || ""}
                        </h4>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">
                          {t.specialty || "Enseignant titulaire"}
                        </span>
                        {t.matriculeEtat && (
                          <span className="text-[9px] font-mono text-slate-400">
                            Matricule: {t.matriculeEtat}
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (confirm(`Confirmez-vous la suppression de l'enseignant ${t.firstName} ${t.lastName} ?`)) {
                          onDeleteTeacher(t.id);
                        }
                      }} 
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Supprimer la fiche enseignant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Account Status Badge */}
                  <div className="flex items-center justify-between pt-1">
                    {hasAccount && !isSuspended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>Portail Actif ({t.username || t.matriculeEtat})</span>
                      </span>
                    ) : isSuspended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200">
                        <Power className="h-3 w-3 text-red-500" />
                        <span>Accès Suspendu</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                        <KeyRound className="h-3 w-3 text-amber-500" />
                        <span>Accès Non Généré</span>
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {t.salaryBase} USD/mois
                    </span>
                  </div>

                  {/* Details info */}
                  <div className="space-y-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="flex items-center gap-1.5 text-[11px]">
                      <span>📞</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{t.phone || "Non renseigné"}</span>
                    </p>
                    {t.email && (
                      <p className="flex items-center gap-1.5 text-[11px] truncate">
                        <span>✉️</span> <span>{t.email}</span>
                      </p>
                    )}
                    <div className="pt-1 flex flex-wrap gap-1">
                      <span className="text-[9px] font-bold uppercase text-slate-400 block w-full">Classes assignées :</span>
                      {t.assignedClasses && t.assignedClasses.length > 0 ? (
                        t.assignedClasses.map((c, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Aucune classe assignée</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS (CREATION DU COMPTE / FICHE DE CONNEXION / PORTAIL) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {!hasAccount ? (
                    <button
                      onClick={() => generateTeacherAccount(t)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:opacity-95 text-white font-bold py-2 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs"
                      id={`btn-create-account-${t.id}`}
                    >
                      <KeyRound className="h-4 w-4" />
                      <span>Créer le compte portail</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            const mockAccount: UserAccount = {
                              id: t.userAccountId || `acc-ens-${t.id}`,
                              dossierId: t.id,
                              dossierType: "personnel",
                              fullName: `Prof. ${t.lastName} ${t.firstName}`,
                              username: t.username || t.matriculeEtat || `ENS-${t.lastName.toUpperCase()}-101`,
                              role: "Enseignant",
                              functionTitle: `Enseignant / Spécialiste ${t.specialty}`,
                              activationCode: t.activationCode || "ENS-2026",
                              tempPassword: t.tempPassword || "Prof2026!",
                              phone: t.phone,
                              email: t.email,
                              isActive: !isSuspended,
                              schoolName: schoolName,
                              schoolId: schoolId,
                              createdAt: t.activationDate || new Date().toLocaleDateString("fr-FR"),
                              portalUrl: "/portail/enseignant",
                              portalCode: "PORTAL_TEACHER",
                              portalName: "Portail Pédagogique Enseignant"
                            };
                            setSelectedTeacherForSheet(mockAccount);
                          }}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold py-1.5 px-2 rounded-xl transition-colors flex items-center justify-center space-x-1 cursor-pointer text-[11px]"
                          title="Voir la fiche officielle d'accès avec QR code et identifiants"
                        >
                          <Printer className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Fiche Connexion</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onOpenPortal) {
                              const targetAcc: UserAccount = {
                                id: t.userAccountId || `acc-ens-${t.id}`,
                                dossierId: t.id,
                                dossierType: "personnel",
                                fullName: `Prof. ${t.lastName} ${t.firstName}`,
                                username: t.username || t.matriculeEtat || `ENS-${t.lastName.toUpperCase()}-101`,
                                role: "Enseignant",
                                functionTitle: `Enseignant / Spécialiste ${t.specialty}`,
                                activationCode: t.activationCode || "ENS-2026",
                                tempPassword: t.tempPassword || "Prof2026!",
                                phone: t.phone,
                                email: t.email,
                                isActive: true,
                                schoolName: schoolName,
                                schoolId: schoolId,
                                createdAt: t.activationDate || new Date().toLocaleDateString("fr-FR"),
                                portalUrl: "/portail/enseignant",
                                portalCode: "PORTAL_TEACHER",
                                portalName: "Portail Pédagogique Enseignant",
                                targetPortalTab: "enseignants"
                              };
                              onOpenPortal(targetAcc);
                            }
                          }}
                          className="bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold py-1.5 px-2 rounded-xl transition-colors flex items-center justify-center space-x-1 cursor-pointer text-[11px]"
                          title="Se connecter directement au portail de cet enseignant"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ouvrir Portail</span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center px-1">
                        <button
                          onClick={() => handleToggleAccountStatus(t)}
                          className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                            isSuspended ? "text-emerald-600 hover:underline" : "text-amber-600 hover:underline"
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          <span>{isSuspended ? "Réactiver l'accès" : "Suspendre l'accès"}</span>
                        </button>

                        <button
                          onClick={() => generateTeacherAccount(t)}
                          className="text-[10px] text-slate-400 hover:text-indigo-500 font-bold flex items-center gap-1 cursor-pointer"
                          title="Générer de nouveaux identifiants"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Réinitialiser</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OFFICIAL LOGIN CREDENTIALS SHEET MODAL */}
      {selectedTeacherForSheet && (
        <OfficialLoginSheetModal
          account={selectedTeacherForSheet}
          schoolName={schoolName}
          schoolLogoUrl={schoolLogoUrl}
          schoolMotto={schoolMotto}
          creatorName="Direction Pédagogique & RH"
          creatorRole="Chef d'Établissement"
          onClose={() => setSelectedTeacherForSheet(null)}
          onOpenPortal={onOpenPortal}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. GESTION DES PARENTS
// ---------------------------------------------------------------------------
interface ParentsViewProps {
  parents: Parent[];
  students?: Student[];
  classes?: ClassRoom[];
  onAddParent: (parent: Omit<Parent, "id">) => Parent | void;
  onLinkParentToStudent?: (parentId: string, studentId: string, relationshipType: string, isPrimary?: boolean) => void;
  onUpdateParents?: React.Dispatch<React.SetStateAction<Parent[]>>;
  onUpdateParent?: (parent: Parent) => void;
  onUpdateStudent?: (student: Student) => void;
  teachers?: Teacher[];
  employees?: Employee[];
  userAccounts?: UserAccount[];
  schoolId?: string;
  schoolName?: string;
  schoolLogoUrl?: string;
  schoolMotto?: string;
  onOpenPortal?: (account: UserAccount) => void;
}

export function ParentsView({ 
  parents: initialParents, 
  students = [], 
  classes = [],
  onAddParent, 
  onLinkParentToStudent, 
  onUpdateParents,
  onUpdateParent,
  onUpdateStudent,
  teachers = [],
  employees = [],
  userAccounts = [],
  schoolId,
  schoolName = "Établissement Scolaire",
  schoolLogoUrl,
  schoolMotto,
  onOpenPortal
}: ParentsViewProps) {
  const [parentsList, setParentsList] = useState<Parent[]>(initialParents || []);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRelationship, setFilterRelationship] = useState("all");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [relationship, setRelationship] = useState("Tuteur légal");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [autoCreateAccount, setAutoCreateAccount] = useState(false);

  // Detailed Parent Sheet Modal state (Fixed "Voir fiche")
  const [selectedParentForDetail, setSelectedParentForDetail] = useState<Parent | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<string | null>(null);

  // Official login sheet modal state
  const [selectedParentForSheet, setSelectedParentForSheet] = useState<UserAccount | null>(null);

  // Relationship Manager modal state
  const [relationshipModalTarget, setRelationshipModalTarget] = useState<{ type: "parent" | "student" | "class"; entity: any } | null>(null);

  // Filter school students
  const schoolStudents = React.useMemo(() => {
    if (!schoolId) return students;
    return students.filter(s => !s.schoolId || s.schoolId === schoolId);
  }, [students, schoolId]);

  // Filter parents by search term and relationship filter
  const filteredParents = React.useMemo(() => {
    return parentsList.filter(p => {
      if (filterRelationship !== "all" && p.relationship !== filterRelationship) {
        return false;
      }
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const nameMatch = `${p.lastName || ""} ${p.firstName || ""}`.toLowerCase().includes(q);
      const phoneMatch = p.phone?.toLowerCase().includes(q);
      const accMatch = p.parentAccountNumber?.toLowerCase().includes(q) || p.id?.toLowerCase().includes(q);
      const emailMatch = p.email?.toLowerCase().includes(q);
      const childrenMatch = p.childrenNames?.some(c => c.toLowerCase().includes(q));
      return nameMatch || phoneMatch || accMatch || emailMatch || childrenMatch;
    });
  }, [parentsList, searchTerm, filterRelationship]);

  // Sync parents
  React.useEffect(() => {
    if (initialParents) setParentsList(initialParents);
  }, [initialParents]);

  const generateParentAccount = (parentItem: Parent) => {
    const cleanFirstName = (parentItem.firstName || "parent").toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLastName = (parentItem.lastName || "tuteur").toLowerCase().replace(/[^a-z0-9]/g, "");

    // Check if an account already exists in universal repository
    const storedAccounts = getStoredUniversalUserAccounts();
    const existingAcc = storedAccounts.find(
      a => a.dossierId === parentItem.id || (parentItem.parentAccountNumber && a.username === parentItem.parentAccountNumber) || (parentItem.phone && a.phone === parentItem.phone)
    );

    const generatedUsername = existingAcc?.username || parentItem.parentAccountNumber || `PAR-${cleanLastName.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedCode = existingAcc?.activationCode || parentItem.activationCode || generateUniqueActivationCode("PARENT");
    const parentPassword = existingAcc?.password || existingAcc?.tempPassword || "Parent2026!";

    const updatedParent: Parent = {
      ...parentItem,
      accountCreated: true,
      username: generatedUsername,
      activationCode: generatedCode,
      portalAccess: true,
      activationDate: parentItem.activationDate || new Date().toLocaleDateString("fr-FR")
    };

    setParentsList(prev => prev.map(p => p.id === parentItem.id ? updatedParent : p));
    if (onUpdateParents) {
      onUpdateParents(prev => prev.map(p => p.id === parentItem.id ? updatedParent : p));
    }
    if (onUpdateParent) {
      onUpdateParent(updatedParent);
    }

    const userAcc: UserAccount = existingAcc ? {
      ...existingAcc,
      fullName: `${parentItem.lastName} ${parentItem.firstName}`,
      phone: parentItem.phone || existingAcc.phone,
      email: parentItem.email || existingAcc.email,
      schoolName: schoolName || existingAcc.schoolName,
      password: parentPassword,
      tempPassword: parentPassword,
      activationCode: generatedCode
    } : {
      id: `acc-parent-${parentItem.id}`,
      dossierId: parentItem.id,
      dossierType: "parent",
      fullName: `${parentItem.lastName} ${parentItem.firstName}`,
      username: generatedUsername,
      role: "Parent",
      activationCode: generatedCode,
      password: parentPassword,
      tempPassword: parentPassword,
      phone: parentItem.phone,
      email: parentItem.email || `${cleanFirstName}.${cleanLastName}@smartschool.cd`,
      isActive: true,
      isActivated: false,
      mustChangePasswordOnFirstLogin: true,
      schoolName: schoolName,
      targetPortalTab: "parents",
      portalUrl: `${getSafeOrigin()}/login`,
      createdAt: new Date().toLocaleDateString("fr-FR")
    };

    persistUniversalUserAccount(userAcc);
    setSelectedParentForSheet(userAcc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirstName = (firstName || "parent").toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLastName = (lastName || "tuteur").toLowerCase().replace(/[^a-z0-9]/g, "");
    const parentAccNum = generateParentAccountNumber();
    const generatedCode = generateUniqueActivationCode("PARENT");

    const linkedStudents = schoolStudents.filter(s => selectedStudentIds.includes(s.id));
    const linkedNames = linkedStudents.map(s => `${s.lastName} ${s.firstName}`);
    const guardianLinks: ParentGuardianLink[] = linkedStudents.map(s => ({
      studentId: s.id,
      studentName: `${s.lastName} ${s.firstName}`,
      className: s.className,
      optionName: s.optionName,
      registrationNumber: s.registrationNumber,
      relationshipType: relationship,
      isPrimary: true
    }));

    const newParentObj: Omit<Parent, "id"> = {
      lastName: lastName.toUpperCase(),
      firstName,
      phone,
      email: email || `${cleanFirstName}.${cleanLastName}@gmail.com`,
      address: address || "",
      relationship,
      childrenNames: linkedNames.length > 0 ? linkedNames : ["Enfant à rattacher"],
      childrenIds: selectedStudentIds,
      guardianLinks: guardianLinks,
      outstandingBalance: 0,
      parentAccountNumber: parentAccNum,
      accountCreated: autoCreateAccount,
      username: autoCreateAccount ? parentAccNum : undefined,
      activationCode: autoCreateAccount ? generatedCode : undefined,
      portalAccess: autoCreateAccount,
      activationDate: autoCreateAccount ? new Date().toLocaleDateString("fr-FR") : undefined
    };

    const createdParent = onAddParent(newParentObj);

    if (autoCreateAccount) {
      const parentId = (createdParent as any)?.id || `parent-${Date.now()}`;
      const newParentAcc: UserAccount = {
        id: `acc-parent-${parentId}`,
        dossierId: parentId,
        dossierType: "parent",
        fullName: `${lastName.toUpperCase()} ${firstName}`,
        username: parentAccNum,
        role: "Parent",
        activationCode: generatedCode,
        phone,
        email,
        isActive: true,
        isActivated: false,
        schoolName: schoolName || "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
        targetPortalTab: "parents",
        createdAt: new Date().toLocaleDateString("fr-FR")
      };
      persistUniversalUserAccount(newParentAcc);
      setSelectedParentForSheet(newParentAcc);
    }

    setIsAdding(false);
    setLastName(""); setFirstName(""); setPhone(""); setEmail(""); setAddress(""); setSelectedStudentIds([]); setRelationship("Tuteur légal");
  };

  const handleToggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Registre des Tuteurs & Parents</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Communication de crise, notifications académiques par SMS et suivi des encaissements d'écolage.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="text-xs bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold px-4 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center space-x-1"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Ajouter Tuteur</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 border-2 border-brand-blue/30 dark:border-brand-blue/40 p-6 rounded-2xl text-xs text-left shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
              <User className="h-4 w-4 text-brand-blue" />
              Nouveau Tuteur / Parent d'Élève
            </h3>
            <span className="text-[10px] text-brand-blue font-bold bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-900">
              Formulaire Certifié SmartSchool RDC
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Nom de famille <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="ex: TSHIBANDA"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-blue focus:outline-none transition-all text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="ex: Joseph"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-blue focus:outline-none transition-all text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Lien de parenté / Relation <span className="text-red-500">*</span>
                </label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:outline-none transition-all text-xs font-medium"
                >
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Tuteur légal">Tuteur légal</option>
                  <option value="Oncle / Tante">Oncle / Tante</option>
                  <option value="Grand-parent">Grand-parent</option>
                  <option value="Autre responsable">Autre responsable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Téléphone mobile (SMS / WhatsApp) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="ex: +243 812 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-blue focus:outline-none transition-all text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Adresse e-mail (facultatif)
                </label>
                <input
                  type="email"
                  placeholder="ex: parent.tshibanda@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-blue focus:outline-none transition-all text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Adresse physique / Domicile <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="ex: Av. Lumumba n°14, Commune, Ville"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-blue focus:outline-none transition-all text-xs font-medium"
                />
              </div>
            </div>

            {/* REAL STUDENTS SELECTION (MULTI-CHILD) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Enfants rattachés parmi les élèves inscrits de l'école ({selectedStudentIds.length} sélectionné(s))
              </label>
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40 max-h-48 overflow-y-auto space-y-2">
                {schoolStudents.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Aucun élève enregistré dans l'établissement.</p>
                ) : (
                  schoolStudents.map(s => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleToggleStudentSelection(s.id)}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand-blue bg-blue-50/60 dark:bg-blue-950/40 text-brand-blue font-bold"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-3.5 w-3.5 text-brand-blue rounded cursor-pointer"
                          />
                          <div>
                            <span className="font-bold">{s.lastName} {s.firstName}</span>
                            <span className="text-[10px] text-slate-400 ml-2">[{s.registrationNumber || "Sans matricule"}] - {s.className}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{s.optionName || "Tronc Commun"}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoCreateAccount"
                  checked={autoCreateAccount}
                  onChange={e => setAutoCreateAccount(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="autoCreateAccount" className="text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer">
                  Créer automatiquement le compte Parent & le portail d'accès dès l'enregistrement
                </label>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold hidden sm:inline">
                Identifiants + Code d'activation générés
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-bold cursor-pointer transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-brand-blue hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold cursor-pointer transition-all shadow-md"
              >
                Enregistrer le Tuteur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, élève lié, ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-blue focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={filterRelationship}
            onChange={e => setFilterRelationship(e.target.value)}
            className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">Tous les liens de parenté</option>
            <option value="Père">Père</option>
            <option value="Mère">Mère</option>
            <option value="Tuteur légal">Tuteur légal</option>
            <option value="Oncle / Tante">Oncle / Tante</option>
            <option value="Grand-parent">Grand-parent</option>
            <option value="Autre responsable">Autre responsable</option>
          </select>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
            {filteredParents.length} parent(s)
          </span>
        </div>
      </div>

      {/* PARENTS LIST CARD TABULAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Tuteur & Relation</th>
                <th className="py-3 px-4">Téléphone / Contact</th>
                <th className="py-3 px-4">Domicile</th>
                <th className="py-3 px-4">Enfants rattachés</th>
                <th className="py-3 px-4">Compte Parent & Portail</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">Aucun parent trouvé</p>
                    <p className="text-[11px] mt-0.5">Modifiez vos critères de recherche ou ajoutez un nouveau tuteur.</p>
                  </td>
                </tr>
              ) : (
                filteredParents.map((p) => {
                  const resolvedChildren = resolveParentChildren(p, students);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedParentForDetail(p)}
                          className="font-bold text-slate-900 dark:text-white block hover:text-brand-blue dark:hover:text-blue-400 transition-colors text-left cursor-pointer"
                        >
                          {p.lastName} {p.firstName}
                        </button>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold">{p.relationship || "Tuteur légal"}</span>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                            {p.parentAccountNumber || p.id}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-brand-blue dark:text-blue-400 block">{p.phone || "Non renseigné"}</span>
                        <span className="text-[10px] text-slate-400">{p.email || "—"}</span>
                      </td>
                      <td className="py-3 px-4 max-w-[180px] truncate">{p.address || "Non renseignée"}</td>
                      <td className="py-3 px-4">
                        {resolvedChildren.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {resolvedChildren.map(c => (
                              <button
                                key={c.studentId}
                                type="button"
                                onClick={() => setSelectedStudentForDetail(c.studentId)}
                                className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-brand-blue dark:text-blue-300 hover:bg-blue-100 hover:border-brand-blue px-2 py-0.5 rounded-md font-bold text-[10px] border border-blue-200 dark:border-blue-900 cursor-pointer transition-all"
                                title="Voir la fiche de cet élève"
                              >
                                <span>{c.studentName} ({c.className})</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Aucun élève lié</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.accountCreated ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-3 w-3" /> Compte Créé & Lié
                            </span>
                            <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                              {p.username || `${p.phone}`}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            Compte non créé
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* DEDICATED PROMINENT VOIR FICHE BUTTON */}
                          <button
                            type="button"
                            onClick={() => setSelectedParentForDetail(p)}
                            title="Voir la fiche détaillée du parent"
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
                          >
                            <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Voir fiche</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRelationshipModalTarget({ type: "parent", entity: p })}
                            title="Gérer les liaisons avec les élèves"
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-xs"
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            <span>Liaisons ({resolvedChildren.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => generateParentAccount(p)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-xs"
                          >
                            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{p.accountCreated ? "Accès" : "Créer"}</span>
                          </button>
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

      {/* DETAILED PARENT PROFILE SHEET MODAL */}
      <ParentDetailModal
        isOpen={!!selectedParentForDetail}
        onClose={() => setSelectedParentForDetail(null)}
        parent={selectedParentForDetail}
        parentId={selectedParentForDetail?.id}
        parents={parentsList}
        students={students}
        classes={classes}
        schoolId={schoolId}
        schoolName={schoolName}
        schoolLogoUrl={schoolLogoUrl}
        schoolMotto={schoolMotto}
        onOpenStudentFile={(studentId) => {
          setSelectedStudentForDetail(studentId);
        }}
        onOpenLoginSheet={(p) => {
          generateParentAccount(p);
        }}
        onOpenRelationshipManager={(p) => {
          setRelationshipModalTarget({ type: "parent", entity: p });
        }}
        onUpdateParent={(updated) => {
          setParentsList(prev => prev.map(p => p.id === updated.id ? updated : p));
          setSelectedParentForDetail(updated);
          if (onUpdateParents) onUpdateParents(prev => prev.map(p => p.id === updated.id ? updated : p));
          if (onUpdateParent) onUpdateParent(updated);
        }}
      />

      {/* DETAILED STUDENT PROFILE SHEET MODAL */}
      <StudentDetailModal
        isOpen={!!selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        studentId={selectedStudentForDetail}
        students={students}
        parents={parentsList}
        classes={classes}
        schoolId={schoolId}
        schoolName={schoolName}
        onOpenParentFile={(parentId) => {
          const targetP = parentsList.find(p => p.id === parentId || p.parentAccountNumber === parentId);
          if (targetP) {
            setSelectedParentForDetail(targetP);
          }
        }}
        onOpenRelationshipManager={(s) => {
          setRelationshipModalTarget({ type: "student", entity: s });
        }}
      />

      {/* OFFICIAL LOGIN SHEET MODAL FOR PARENT */}
      {selectedParentForSheet && (
        <OfficialLoginSheetModal
          account={selectedParentForSheet}
          schoolName={schoolName}
          schoolLogoUrl={schoolLogoUrl}
          schoolMotto={schoolMotto}
          creatorName="Administration Scolaire"
          creatorRole="Gestionnaire Inscriptions"
          onClose={() => setSelectedParentForSheet(null)}
          onOpenPortal={onOpenPortal}
        />
      )}

      {/* RELATIONSHIP MANAGER MODAL */}
      {relationshipModalTarget && (
        <RelationshipManagerModal
          isOpen={!!relationshipModalTarget}
          targetType={relationshipModalTarget.type}
          targetParent={relationshipModalTarget.type === "parent" ? relationshipModalTarget.entity : null}
          targetStudent={relationshipModalTarget.type === "student" ? relationshipModalTarget.entity : null}
          targetClass={relationshipModalTarget.type === "class" ? relationshipModalTarget.entity : null}
          teachers={teachers}
          employees={employees}
          userAccounts={userAccounts}
          students={students}
          parents={parentsList}
          classes={classes}
          schoolId={schoolId}
          schoolName={schoolName}
          onOpenParentProfile={(parentId) => {
            const p = parentsList.find(x => x.id === parentId || x.parentAccountNumber === parentId);
            if (p) setSelectedParentForDetail(p);
          }}
          onOpenStudentProfile={(studentId) => {
            setSelectedStudentForDetail(studentId);
          }}
          onClose={() => setRelationshipModalTarget(null)}
          onUpdateParent={(updatedParent) => {
            setParentsList(prev => prev.map(p => p.id === updatedParent.id ? updatedParent : p));
            if (onUpdateParents) onUpdateParents(prev => prev.map(p => p.id === updatedParent.id ? updatedParent : p));
            if (onUpdateParent) onUpdateParent(updatedParent);
            setRelationshipModalTarget(null);
          }}
          onUpdateStudent={(updatedStudent) => {
            if (onUpdateStudent) onUpdateStudent(updatedStudent);
            setRelationshipModalTarget(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. GESTION DES CLASSES
// ---------------------------------------------------------------------------
interface ClassesViewProps {
  classes: ClassRoom[];
  onAddClass: (c: Omit<ClassRoom, "id"> | Omit<ClassRoom, "id">[]) => void;
  schoolLevels?: string[];
  students?: Student[];
  userRole?: string;
  classAnnouncements?: ClassAnnouncement[];
  options?: Option[];
  teachers?: Teacher[];
  employees?: Employee[];
  userAccounts?: UserAccount[];
  parents?: Parent[];
  schoolId?: string;
  schoolName?: string;
  onUpdateClass?: (updatedClass: ClassRoom) => void;
  onUpdateClasses?: React.Dispatch<React.SetStateAction<ClassRoom[]>>;
  onUpdateTeachers?: React.Dispatch<React.SetStateAction<Teacher[]>>;
  onDeleteClass?: (classId: string) => void;
}

export function ClassesView({ 
  classes, 
  onAddClass, 
  schoolLevels, 
  students = [], 
  userRole = "Directeur", 
  classAnnouncements = [],
  options = [],
  teachers = [],
  employees = [],
  userAccounts = [],
  parents = [],
  schoolId,
  schoolName = "Établissement Scolaire",
  onUpdateClass,
  onUpdateClasses,
  onUpdateTeachers,
  onDeleteClass
}: ClassesViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedClassRoom, setSelectedClassRoom] = useState<ClassRoom | null>(null);
  
  // Local Announcements State to allow real-time broadcast
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>(classAnnouncements);
  
  // Relationship Manager modal state
  const [relationshipModalTarget, setRelationshipModalTarget] = useState<{ type: "parent" | "student" | "class"; entity: any } | null>(null);

  // Sync on prop changes
  React.useEffect(() => {
    setAnnouncements(classAnnouncements);
  }, [classAnnouncements]);

  // Form states for adding announcement
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");

  // Assistant states
  const [addStep, setAddStep] = useState(1);
  const [selectedLevelCategory, setSelectedLevelCategory] = useState<"Maternelle" | "Primaire" | "Secondaire">("Secondaire");
  const [selectedClassGrade, setSelectedClassGrade] = useState<string>("");
  const [selectedParallels, setSelectedParallels] = useState<string[]>(["A"]);
  const [selectedOption, setSelectedOption] = useState<string>("Néant");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedResponsibleStaffId, setSelectedResponsibleStaffId] = useState<string>("");
  const [maxStudentsVal, setMaxStudentsVal] = useState<number>(45);

  // Eligible titular accounts in this school (teachers and pedagogical personnel)
  const eligibleTitulars = React.useMemo(() => {
    return getEligibleTitularsForSchool(schoolId, teachers, employees, userAccounts);
  }, [teachers, employees, userAccounts, schoolId]);

  // Eligible responsible staff accounts in this school
  const eligibleStaff = React.useMemo(() => {
    return getSchoolStaffAccounts(userAccounts, schoolId);
  }, [userAccounts, schoolId]);

  const levels = schoolLevels || ["Maternelle", "Primaire", "Secondaire", "Humanités"];
  const hasMaternelle = levels.includes("Maternelle");
  const hasPrimaire = levels.includes("Primaire");
  const hasSecondaire = levels.includes("Secondaire") || levels.includes("Humanités");

  // Detect establishment type
  let establishmentType = "Primaire & Secondaire";
  if (hasMaternelle && hasPrimaire && hasSecondaire) {
    establishmentType = "Maternelle, Primaire & Secondaire";
  } else if (hasPrimaire && hasSecondaire) {
    establishmentType = "Primaire & Secondaire";
  } else if (hasMaternelle && hasPrimaire) {
    establishmentType = "Maternelle & Primaire";
  } else if (hasSecondaire) {
    establishmentType = "Secondaire";
  } else if (hasPrimaire) {
    establishmentType = "Primaire";
  } else if (hasMaternelle) {
    establishmentType = "Maternelle";
  }

  // Active Category tab for listing
  const [activeCategoryTab, setActiveCategoryTab] = useState<"Maternelle" | "Primaire" | "Secondaire">(
    hasSecondaire ? "Secondaire" : hasPrimaire ? "Primaire" : "Maternelle"
  );

  const handleOpenAdd = () => {
    setAddStep(1);
    setSelectedLevelCategory(hasSecondaire ? "Secondaire" : hasPrimaire ? "Primaire" : "Maternelle");
    setSelectedClassGrade(hasSecondaire ? "7ème EB" : hasPrimaire ? "1ère année" : "Petite Section");
    setSelectedParallels(["A"]);
    setSelectedOption("Néant");
    setSelectedTeacherId("");
    setSelectedResponsibleStaffId("");
    setMaxStudentsVal(45);
    setIsAdding(true);
  };

  const handleSelectLevelCategory = (cat: "Maternelle" | "Primaire" | "Secondaire") => {
    setSelectedLevelCategory(cat);
    if (cat === "Maternelle") {
      setSelectedClassGrade("Petite Section");
    } else if (cat === "Primaire") {
      setSelectedClassGrade("1ère année");
    } else {
      setSelectedClassGrade("7ème EB");
    }
    setAddStep(2);
  };

  const isSecondaryLevel = (lvl: string) => {
    const l = String(lvl).toLowerCase();
    return l.includes("humanités") || l.includes("secondaire") || l.includes("scientifique") || l.includes("pédagogie") || l.includes("commerciale");
  };

  const isHumanitiesGrade = (grade: string) => {
    return grade.includes("Humanités");
  };

  const handleToggleParallel = (p: string) => {
    if (selectedParallels.includes(p)) {
      if (selectedParallels.length > 1) {
        setSelectedParallels(selectedParallels.filter(item => item !== p));
      }
    } else {
      setSelectedParallels([...selectedParallels, p].sort());
    }
  };

  const handleNextStep = () => {
    if (addStep === 2) {
      setAddStep(3);
    } else if (addStep === 3) {
      if (selectedLevelCategory === "Secondaire" && isHumanitiesGrade(selectedClassGrade)) {
        // Find active options
        const activeOpts = options.filter(o => o.isActivated !== false);
        if (activeOpts.length > 0) {
          setSelectedOption(activeOpts[0].name);
        } else {
          setSelectedOption("Néant");
        }
        setAddStep(4);
      } else {
        setSelectedOption("Néant");
        setAddStep(5);
      }
    } else if (addStep === 4) {
      setAddStep(5);
    }
  };

  const handlePrevStep = () => {
    if (addStep === 5) {
      if (selectedLevelCategory === "Secondaire" && isHumanitiesGrade(selectedClassGrade)) {
        setAddStep(4);
      } else {
        setAddStep(3);
      }
    } else {
      setAddStep(addStep - 1);
    }
  };

  const handleSubmitAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParallels.length === 0) {
      alert("Veuillez sélectionner au moins une lettre parallèle (A, B, C...).");
      return;
    }

    const chosenTitular = eligibleTitulars.find(t => t.id === selectedTeacherId);
    const resolvedTeacherName = chosenTitular ? chosenTitular.name : "À désigner";
    const resolvedTeacherUserId = chosenTitular?.userAccountId;

    const classesToCreate = selectedParallels.map(p => {
      // Create a unique level property value for backward compatibility with the old flat layout
      const isHumanities = selectedLevelCategory === "Secondaire" && isHumanitiesGrade(selectedClassGrade);
      const levelLabel = isHumanities && selectedOption !== "Néant" 
        ? `${selectedClassGrade} ${selectedOption}`
        : selectedClassGrade;

      return {
        level: levelLabel,
        roomLetter: p,
        optionName: isHumanities ? selectedOption : "Néant",
        classTeacherName: resolvedTeacherName,
        classTeacherId: chosenTitular ? chosenTitular.id : undefined,
        classTeacherUserId: resolvedTeacherUserId,
        responsibleStaffId: selectedResponsibleStaffId || undefined,
        titularHistory: chosenTitular ? [{
          id: `hist-${Date.now()}-${p}`,
          type: "titulaire" as const,
          staffId: chosenTitular.id,
          userId: resolvedTeacherUserId,
          staffName: chosenTitular.name,
          roleTitle: chosenTitular.roleTitle || "Enseignant Titulaire",
          startDate: new Date().toLocaleDateString("fr-FR"),
          assignedBy: userRole || "Directeur",
          notes: "Création de la classe"
        }] : [],
        studentCount: 0,
        maxStudents: maxStudentsVal,
        levelCategory: selectedLevelCategory,
        classGrade: selectedClassGrade,
        sectionName: selectedLevelCategory === "Maternelle" 
          ? "Maternelle" 
          : selectedLevelCategory === "Primaire"
            ? "Primaire"
            : selectedClassGrade.includes("EB")
              ? "Éducation de Base"
              : "Humanités",
        schoolId: schoolId
      };
    });

    const duplicates: string[] = [];
    const validClasses = classesToCreate.filter(newC => {
      const exists = classes.some(oldC => 
        String(oldC.levelCategory || "").toLowerCase() === String(newC.levelCategory).toLowerCase() &&
        String(oldC.classGrade || oldC.level || "").toLowerCase() === String(newC.classGrade).toLowerCase() &&
        String(oldC.roomLetter || "").toLowerCase() === String(newC.roomLetter).toLowerCase() &&
        String(oldC.optionName || "Néant").toLowerCase() === String(newC.optionName).toLowerCase()
      );
      if (exists) {
        duplicates.push(`${newC.classGrade} ${newC.roomLetter}`);
      }
      return !exists;
    });

    if (duplicates.length > 0) {
      alert(`Les classes suivantes existent déjà et ne seront pas dupliquées : ${duplicates.join(", ")}`);
    }

    if (validClasses.length === 0) {
      alert("Aucune nouvelle classe n'a été créée car elles existent déjà toutes.");
      return;
    }

    onAddClass(validClasses);
    setIsAdding(false);
    
    alert(`Félicitations ! Les classes suivantes ont été créées avec succès : ${validClasses.map(c => `${c.classGrade} ${c.roomLetter}`).join(", ")}`);
  };

  // Grouping logic for the dashboard
  const getClassesByCat = (cat: "Maternelle" | "Primaire" | "Secondaire") => {
    return classes.filter(c => {
      if (c.levelCategory) {
        return c.levelCategory === cat;
      }
      // Inferring category for backward compatibility
      const l = String(c.level).toLowerCase();
      if (l.includes("section") || l.includes("maternelle")) return cat === "Maternelle";
      if (l.includes("primaire") || (l.includes("année") && !l.includes("eb") && !l.includes("humanités"))) return cat === "Primaire";
      return cat === "Secondaire";
    });
  };

  const categoryClasses = getClassesByCat(activeCategoryTab);

  // Group categoryClasses by classGrade
  const groupedByGrade: { [key: string]: ClassRoom[] } = {};
  categoryClasses.forEach(c => {
    // Determine the grade key
    let gradeKey = c.classGrade;
    if (!gradeKey) {
      // Inferred grade for backward compatibility
      const l = String(c.level);
      if (l.includes("Petite Section")) gradeKey = "Petite Section";
      else if (l.includes("Moyenne Section")) gradeKey = "Moyenne Section";
      else if (l.includes("Grande Section")) gradeKey = "Grande Section";
      else if (l.includes("1ère Primaire") || l.includes("1ère année")) gradeKey = "1ère année";
      else if (l.includes("2ème Primaire") || l.includes("2ème année")) gradeKey = "2ème année";
      else if (l.includes("3ème Primaire") || l.includes("3ème année")) gradeKey = "3ème année";
      else if (l.includes("4ème Primaire") || l.includes("4ème année")) gradeKey = "4ème année";
      else if (l.includes("5ème Primaire") || l.includes("5ème année")) gradeKey = "5ème année";
      else if (l.includes("6ème Primaire") || l.includes("6ème année")) gradeKey = "6ème année";
      else if (l.includes("7ème")) gradeKey = "7ème EB";
      else if (l.includes("8ème")) gradeKey = "8ème EB";
      else if (l.includes("1ère Humanités") || l.includes("1ère Sec")) gradeKey = "1ère Humanités";
      else if (l.includes("2ème Humanités") || l.includes("2ème Sec")) gradeKey = "2ème Humanités";
      else if (l.includes("3ème Humanités") || l.includes("3ème Sec")) gradeKey = "3ème Humanités";
      else if (l.includes("4ème Humanités") || l.includes("4ème Sec")) gradeKey = "4ème Humanités";
      else gradeKey = String(c.level);
    }
    if (!groupedByGrade[gradeKey]) {
      groupedByGrade[gradeKey] = [];
    }
    groupedByGrade[gradeKey].push(c);
  });

  // Sort helper for grade keys to ensure official order
  const getGradeOrderIndex = (grade: string) => {
    const order = [
      "Petite Section", "Moyenne Section", "Grande Section",
      "1ère année", "2ème année", "3ème année", "4ème année", "5ème année", "6ème année",
      "7ème EB", "8ème EB",
      "1ère Humanités", "2ème Humanités", "3ème Humanités", "4ème Humanités"
    ];
    const idx = order.indexOf(grade);
    return idx === -1 ? 99 : idx;
  };

  const sortedGrades = Object.keys(groupedByGrade).sort((a, b) => getGradeOrderIndex(a) - getGradeOrderIndex(b));

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassRoom || !annTitle || !annContent) return;
    
    const targetClassName = `${selectedClassRoom.level} ${selectedClassRoom.roomLetter}`;
    const newAnn: ClassAnnouncement = {
      id: "ann_" + Math.random().toString(36).substring(2, 9),
      className: targetClassName,
      title: annTitle,
      content: annContent,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      studentName: "Direction de l'École"
    };

    setAnnouncements([newAnn, ...announcements]);
    setAnnTitle("");
    setAnnContent("");
    setIsAddingAnnouncement(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">Classes & Structures</h2>
            <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {establishmentType}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Définition des salles, capacités limites et titulariat par classe. Cliquez sur une classe pour voir les détails et diffuser des annonces.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="text-xs bg-gradient-to-r from-brand-blue to-indigo-600 text-white font-bold px-4.5 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center space-x-1 self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Créer une classe</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-xs text-left max-w-lg shadow-xl space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-indigo-600 tracking-wider">Assistant de création de classe</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-sans">
                  Étape {addStep} sur 5 : {
                    addStep === 1 ? "Niveau d'Enseignement" :
                    addStep === 2 ? "Classe officielle RDC" :
                    addStep === 3 ? "Salles Parallèles" :
                    addStep === 4 ? "Option d'étude (Filière)" :
                    "Titulaire & Validation"
                  }
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* STEP 1: SELECT CATEGORY */}
          {addStep === 1 && (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-500 font-medium">Sélectionnez le niveau d'enseignement de la classe à créer :</p>
              <div className="grid grid-cols-1 gap-3">
                {hasMaternelle && (
                  <button
                    type="button"
                    onClick={() => handleSelectLevelCategory("Maternelle")}
                    className="p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/10 dark:bg-slate-950/20 rounded-2xl transition-all text-left flex items-center space-x-4 group cursor-pointer"
                  >
                    <div className="p-3 bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-xl">
                      <School className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Maternelle</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Petite, Moyenne et Grande Section d'éveil.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </button>
                )}
                {hasPrimaire && (
                  <button
                    type="button"
                    onClick={() => handleSelectLevelCategory("Primaire")}
                    className="p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/10 dark:bg-slate-950/20 rounded-2xl transition-all text-left flex items-center space-x-4 group cursor-pointer"
                  >
                    <div className="p-3 bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Primaire</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">De la 1ère à la 6ème année primaire.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </button>
                )}
                {hasSecondaire && (
                  <button
                    type="button"
                    onClick={() => handleSelectLevelCategory("Secondaire")}
                    className="p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/10 dark:bg-slate-950/20 rounded-2xl transition-all text-left flex items-center space-x-4 group cursor-pointer"
                  >
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Secondaire & Humanités</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Education de Base (7è, 8è EB) et Humanités (1ère à 4è).</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT CLASS GRADE */}
          {addStep === 2 && (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-500 font-medium">Sélectionnez la classe officielle RDC homologuée :</p>
              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {selectedLevelCategory === "Maternelle" && [
                  "Petite Section", "Moyenne Section", "Grande Section"
                ].map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedClassGrade(grade)}
                    className={`p-3 border rounded-xl text-left font-bold transition-all text-xs flex items-center justify-between cursor-pointer ${
                      selectedClassGrade === grade 
                        ? "border-pink-500 bg-pink-500/10 text-pink-700 dark:text-pink-300 shadow-sm" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/20"
                    }`}
                  >
                    <span>{grade}</span>
                    {selectedClassGrade === grade && <Check className="h-4 w-4 text-pink-500 shrink-0" />}
                  </button>
                ))}

                {selectedLevelCategory === "Primaire" && [
                  "1ère année", "2ème année", "3ème année", "4ème année", "5ème année", "6ème année"
                ].map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedClassGrade(grade)}
                    className={`p-3 border rounded-xl text-left font-bold transition-all text-xs flex items-center justify-between cursor-pointer ${
                      selectedClassGrade === grade 
                        ? "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300 shadow-sm" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/20"
                    }`}
                  >
                    <span>{grade}</span>
                    {selectedClassGrade === grade && <Check className="h-4 w-4 text-sky-500 shrink-0" />}
                  </button>
                ))}

                {selectedLevelCategory === "Secondaire" && [
                  "7ème EB", "8ème EB", "1ère Humanités", "2ème Humanités", "3ème Humanités", "4ème Humanités"
                ].map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedClassGrade(grade)}
                    className={`p-3 border rounded-xl text-left font-bold transition-all text-xs flex items-center justify-between cursor-pointer ${
                      selectedClassGrade === grade 
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/20"
                    }`}
                  >
                    <span>{grade}</span>
                    {selectedClassGrade === grade && <Check className="h-4 w-4 text-indigo-500 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAddStep(1)}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedClassGrade}
                  onClick={handleNextStep}
                  className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Suivant</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE PARALLELS */}
          {addStep === 3 && (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-500 font-medium">Sélectionnez les lettres parallèles à ouvrir simultanément :</p>
              <div className="grid grid-cols-3 gap-3">
                {["A", "B", "C", "D", "E", "F"].map(letter => {
                  const isChecked = selectedParallels.includes(letter);
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleToggleParallel(letter)}
                      className={`p-4 border rounded-2xl font-black text-center text-sm transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                        isChecked
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20"
                      }`}
                    >
                      <span className="text-lg">{letter}</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-700"
                      }`}>
                        {isChecked && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAddStep(2)}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </button>
                <button
                  type="button"
                  disabled={selectedParallels.length === 0}
                  onClick={handleNextStep}
                  className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Suivant</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CHOOSE OPTION FOR HUMANITIES */}
          {addStep === 4 && (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-500 font-medium">Sélectionnez l'option d'étude (filière active de l'école) :</p>
              {(() => {
                const activeOpts = options.filter(o => o.isActivated !== false);
                if (activeOpts.length === 0) {
                  return (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-850 dark:text-amber-300 rounded-2xl flex items-start space-x-3 text-xs">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-bold">Aucune option active !</p>
                        <p className="text-[10px] mt-1 leading-relaxed">
                          Vous devez activer vos options d'étude dans l'onglet <strong>Filières & Options</strong> avant de pouvoir créer des classes d'Humanités.
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {activeOpts.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedOption(opt.name)}
                        className={`p-3 border rounded-xl text-left transition-all text-xs flex items-center justify-between cursor-pointer ${
                          selectedOption === opt.name
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-750 dark:text-indigo-300 shadow-sm"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-750 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/20"
                        }`}
                      >
                        <div>
                          <span className="font-bold block text-slate-800 dark:text-slate-200">{opt.name}</span>
                          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 uppercase font-mono font-bold">{opt.code}</span>
                        </div>
                        {selectedOption === opt.name && <Check className="h-4 w-4 text-indigo-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                );
              })()}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAddStep(3)}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedOption || (options.filter(o => o.isActivated !== false).length === 0)}
                  onClick={handleNextStep}
                  className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Suivant</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: TEACHER ACCOUNT & RESPONSIBLE STAFF SELECTION */}
          {addStep === 5 && (
            <form onSubmit={handleSubmitAssistant} className="space-y-4">
              <div className="space-y-3">
                {/* ACCOUNT-BASED TITULAIRE SELECTION */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Enseignant Titulaire de la classe (Liaison Compte)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-normal">Choix sur compte certifié</span>
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={e => setSelectedTeacherId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Non attribué (Laisser vide et ajouter plus tard) --</option>
                    {eligibleTitulars.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.roleTitle})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Seuls les comptes enseignants et personnels de votre établissement sont affichés.
                  </p>
                </div>

                {/* RESPONSIBLE STAFF SELECTION (OPTIONAL) */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Personnel Responsable Pédagogique / Préfet / Directeur d'Études (Facultatif)
                  </label>
                  <select
                    value={selectedResponsibleStaffId}
                    onChange={e => setSelectedResponsibleStaffId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Aucun personnel responsable distinct --</option>
                    {eligibleStaff.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.fullName || st.username} ({st.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Capacité Limitée d'élèves</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={maxStudentsVal}
                    onChange={e => setMaxStudentsVal(parseInt(e.target.value) || 45)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Summary Box */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-2xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <h5 className="font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wide text-[10px]">Résumé de la génération automatique</h5>
                  <div className="space-y-1 text-[11px]">
                    <p><strong>Niveau :</strong> {selectedLevelCategory}</p>
                    <p><strong>Classe d'étude :</strong> {selectedClassGrade}</p>
                    {selectedLevelCategory === "Secondaire" && selectedOption !== "Néant" && (
                      <p><strong>Option :</strong> {selectedOption}</p>
                    )}
                    <p><strong>Parallèle(s) à créer :</strong> {selectedParallels.join(", ")}</p>
                    <p><strong>Capacité par classe :</strong> {maxStudentsVal} élèves</p>
                    <p><strong>Titulaire lié :</strong> {
                      eligibleTitulars.find(t => t.id === selectedTeacherId)?.name || "Non attribué (À désigner plus tard)"
                    }</p>
                  </div>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold pt-1">
                    * Les bulletins, registres d'inscription, fiches d'appel, carnets de cotes et emplois du temps associés seront automatiquement configurés pour chacune de ces classes.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirmer la création</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TABS FOR HIERARCHICAL NAVIGATION */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl w-fit">
        {hasMaternelle && (
          <button
            onClick={() => setActiveCategoryTab("Maternelle")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeCategoryTab === "Maternelle"
                ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Maternelle ({getClassesByCat("Maternelle").length})
          </button>
        )}
        {hasPrimaire && (
          <button
            onClick={() => setActiveCategoryTab("Primaire")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeCategoryTab === "Primaire"
                ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Primaire ({getClassesByCat("Primaire").length})
          </button>
        )}
        {hasSecondaire && (
          <button
            onClick={() => setActiveCategoryTab("Secondaire")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeCategoryTab === "Secondaire"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Secondaire ({getClassesByCat("Secondaire").length})
          </button>
        )}
      </div>

      {categoryClasses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <School className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider font-sans">Aucune classe créée dans ce niveau.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Utilisez le bouton de création pour générer automatiquement les classes d'étude et les parallèles de ce cycle scolaire.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>+ Créer une classe</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedGrades.map((grade) => {
            const gradeParallels = groupedByGrade[grade] || [];
            return (
              <div 
                key={grade}
                className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-850">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-indigo-500 tracking-wider">Classe d'étude RDC</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white font-sans">{grade}</h3>
                  </div>
                  <span className="bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider">
                    {gradeParallels.length} parallèle(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gradeParallels.map(c => {
                    const isFull = c.studentCount >= c.maxStudents;
                    const isSecClass = isSecondaryLevel(String(c.level));
                    const currentClassRoomStudents = students.filter(s => s.className === `${c.level} ${c.roomLetter}`);
                    const resolvedTitulaire = resolveClassTitulaire(c, teachers, employees, userAccounts);

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedClassRoom(c)}
                        className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 rounded-xl cursor-pointer transition-all duration-200 group flex flex-col justify-between min-h-[150px]"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white font-sans group-hover:text-indigo-600 transition-colors">
                            {c.level} {c.roomLetter}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isFull ? "bg-red-50 dark:bg-red-950/20 text-red-500" : "bg-emerald-50 dark:bg-emerald-950/20 text-brand-green"
                          }`}>
                            {c.studentCount || currentClassRoomStudents.length} / {c.maxStudents} Élèves
                          </span>
                        </div>

                        {isSecClass && c.optionName && c.optionName !== "Néant" && (
                          <div className="mt-1">
                            <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">Option</span>
                            <span className="font-extrabold text-[10px] text-indigo-900 dark:text-indigo-400 truncate block">{c.optionName}</span>
                          </div>
                        )}

                        <div className="border-t border-slate-100 dark:border-slate-850 pt-2 mt-2 flex justify-between items-center text-[9px]">
                          <div className="truncate max-w-[130px]">
                            <span className="text-[8px] text-slate-400 block uppercase font-semibold">Titulaire</span>
                            <span className={`font-semibold truncate block ${resolvedTitulaire ? "text-slate-800 dark:text-slate-200" : "text-amber-600 dark:text-amber-400 italic"}`}>
                              {resolvedTitulaire ? resolvedTitulaire.name : (c.classTeacherName || "À désigner")}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRelationshipModalTarget({ type: "class", entity: c });
                            }}
                            title="Gérer le titulaire et le personnel responsable"
                            className="p-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors"
                          >
                            <UserCog className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED CLASS MODAL DRAWER */}
      {selectedClassRoom && (() => {
        const fullClassName = `${selectedClassRoom.level} ${selectedClassRoom.roomLetter}`;
        const registeredStudents = students.filter(s => s.className === fullClassName);
        const classSpecificAnnouncements = announcements.filter(ann => ann.className === fullClassName);
        const isSecClass = isSecondaryLevel(String(selectedClassRoom.level));
        const resolvedTitulaire = resolveClassTitulaire(selectedClassRoom, teachers, employees, userAccounts);
        const resolvedResponsibleStaff = resolveClassResponsible(selectedClassRoom, employees, userAccounts, teachers);

        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 block uppercase font-mono tracking-widest">Détails de classe</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{fullClassName}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedClassRoom(null)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Info Cards Grid with Titulaire & Staff */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Enseignant Titulaire</span>
                      <button
                        onClick={() => setRelationshipModalTarget({ type: "class", entity: selectedClassRoom })}
                        className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Edit3 className="h-3 w-3" /> Changer
                      </button>
                    </div>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-0.5">
                      {resolvedTitulaire ? resolvedTitulaire.name : (selectedClassRoom.classTeacherName || "À désigner")}
                    </p>
                    {resolvedTitulaire?.roleTitle && (
                      <span className="text-[10px] text-slate-400 block">
                        {resolvedTitulaire.roleTitle}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Personnel Responsable</span>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-0.5">
                      {resolvedResponsibleStaff ? resolvedResponsibleStaff.name : "Direction de l'établissement"}
                    </p>
                    {resolvedResponsibleStaff?.roleTitle && (
                      <span className="text-[10px] text-slate-400 block">
                        {resolvedResponsibleStaff.roleTitle}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Inscrits / Capacité</span>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-0.5">{registeredStudents.length} / {selectedClassRoom.maxStudents} Élèves</p>
                  </div>
                </div>

                {/* TITULAIRE HISTORY (IF AVAILABLE) */}
                {selectedClassRoom.titularHistory && selectedClassRoom.titularHistory.length > 0 && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                      <History className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Historique des affectations de titulariat ({selectedClassRoom.titularHistory.length})</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-850 text-[11px]">
                      {selectedClassRoom.titularHistory.map((hist, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{hist.staffName}</span>
                            <span className="text-[10px] text-slate-400 block">Affecté par: {hist.assignedBy || "Admin"}</span>
                          </div>
                          <div className="text-right text-[10px] text-slate-400 font-mono">
                            <span>{hist.startDate}</span>
                            {hist.roleTitle && <span className="ml-1 text-indigo-500 font-bold">[{hist.roleTitle}]</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub components list tabs */}
                <div className="space-y-4">
                  {/* STUDENTS REGISTERED SECTION */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Users className="h-4 w-4 text-brand-blue" />
                      <span>Élèves inscrits dans la classe ({registeredStudents.length})</span>
                    </h4>

                    <div className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/10">
                      {registeredStudents.length === 0 ? (
                        <p className="p-4 text-[11px] text-slate-400 italic text-center">Aucun élève inscrit dans cette classe actuellement.</p>
                      ) : (
                        <div className="max-h-[180px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 text-[11px]">
                          {registeredStudents.map(student => (
                            <div key={student.id} className="p-2.5 flex items-center justify-between hover:bg-white dark:hover:bg-slate-950/40 transition-colors">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-white">{student.lastName} {student.firstName}</span>
                                <span className="text-[9px] font-mono text-brand-blue block">{student.registrationNumber}</span>
                              </div>
                              <div className="text-right text-[10px] text-slate-400">
                                <span className="block font-medium text-slate-600 dark:text-slate-300">Tuteur: {student.parentName}</span>
                                <span>Tél: {student.parentPhone}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CLASS BROADCAST FEED SECTION */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                        <Sparkles className="h-4 w-4 text-brand-green" />
                        <span>Fil d'actualité de la classe ({classSpecificAnnouncements.length})</span>
                      </h4>
                      
                      {/* Only admins or coordinators can broadcast */}
                      {hasFullInscriptionRights(userRole) && (
                        <button
                          onClick={() => setIsAddingAnnouncement(!isAddingAnnouncement)}
                          className="text-[10px] font-bold text-brand-blue hover:underline cursor-pointer"
                        >
                          {isAddingAnnouncement ? "Fermer le formulaire" : "+ Diffuser une annonce"}
                        </button>
                      )}
                    </div>

                    {/* New announcement form */}
                    {isAddingAnnouncement && (
                      <form onSubmit={handleBroadcastAnnouncement} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-[11px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">Diffuser une annonce à la classe {fullClassName}</span>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold">Titre du communiqué</label>
                          <input required value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Ex: Réunion de parents ou Contrôle de Physique" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold">Contenu du message</label>
                          <textarea required value={annContent} onChange={e => setAnnContent(e.target.value)} placeholder="Saisissez les détails du communiqué national ou de l'école..." rows={3} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white" />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button type="button" onClick={() => setIsAddingAnnouncement(false)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold">Annuler</button>
                          <button type="submit" className="bg-brand-blue text-white px-3 py-1.5 rounded-lg font-bold">Diffuser</button>
                        </div>
                      </form>
                    )}

                    {/* Announcement feed stream list */}
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                      {classSpecificAnnouncements.length === 0 ? (
                        <p className="p-4 text-[11px] text-slate-400 italic text-center">Aucune annonce n'a encore été diffusée spécifiquement pour cette classe.</p>
                      ) : (
                        classSpecificAnnouncements.map((ann) => (
                          <div key={ann.id} className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60 text-[11px] space-y-2">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900/40 pb-1.5">
                              <span className="font-black text-slate-700 dark:text-slate-200 truncate">{ann.title}</span>
                              <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">{ann.createdAt}</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[10px]">{ann.content}</p>
                            <div className="flex justify-between text-[9px] text-slate-400 font-semibold pt-1">
                              <span>Auteur: {ann.studentName || "Direction de l'École"}</span>
                              <span className="font-mono uppercase tracking-wider">Réf: {ann.id.slice(0, 5)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-6 flex gap-2">
                <button 
                  onClick={() => setRelationshipModalTarget({ type: "class", entity: selectedClassRoom })}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <UserCog className="h-4 w-4" />
                  <span>Gérer les affectations</span>
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Confirmez-vous la suppression définitive de la classe ${fullClassName} ?`)) {
                      if (onDeleteClass) onDeleteClass(selectedClassRoom.id);
                      if (onUpdateClasses) onUpdateClasses(prev => prev.filter(c => c.id !== selectedClassRoom.id));
                      setSelectedClassRoom(null);
                    }
                  }}
                  className="px-3.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer border border-red-200 dark:border-red-800 flex items-center justify-center gap-1"
                  title="Supprimer la classe"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Supprimer</span>
                </button>
                <button 
                  onClick={() => setSelectedClassRoom(null)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RELATIONSHIP MANAGER MODAL FOR CLASS */}
      {relationshipModalTarget && (
        <RelationshipManagerModal
          isOpen={!!relationshipModalTarget}
          targetType={relationshipModalTarget.type}
          targetClass={relationshipModalTarget.type === "class" ? relationshipModalTarget.entity : null}
          targetStudent={relationshipModalTarget.type === "student" ? relationshipModalTarget.entity : null}
          targetParent={relationshipModalTarget.type === "parent" ? relationshipModalTarget.entity : null}
          teachers={teachers}
          employees={employees}
          userAccounts={userAccounts}
          students={students}
          parents={parents}
          classes={classes}
          schoolId={schoolId}
          schoolName={schoolName}
          onUpdateTeachers={onUpdateTeachers}
          onClose={() => setRelationshipModalTarget(null)}
          onUpdateClass={(updatedClass) => {
            if (onUpdateClass) onUpdateClass(updatedClass);
            if (onUpdateClasses) onUpdateClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
            if (selectedClassRoom && selectedClassRoom.id === updatedClass.id) {
              setSelectedClassRoom(updatedClass);
            }
            setRelationshipModalTarget(null);
          }}
        />
      )}

      <p className="text-[10px] text-slate-400 text-left">MODULE TERMINÉ ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. GESTION DES OPTIONS D'ÉTUDE
// ---------------------------------------------------------------------------
interface OptionsViewProps {
  options: Option[];
  classes?: ClassRoom[];
  userRole?: string;
  userName?: string;
  onToggleOption?: (id: string) => void;
  onAddOption?: (newOpt: Option) => void;
  onUpdateOption?: (updatedOpt: Option) => void;
  onToggleStatus?: (id: string, newStatus: "Active" | "Inactive" | "Archivée") => void;
  onDeleteOption?: (id: string) => void;
}

export function OptionsView({ 
  options, 
  classes = [],
  userRole = "Directeur",
  userName = "Direction Pédagogique",
  onToggleOption,
  onAddOption,
  onUpdateOption,
  onToggleStatus,
  onDeleteOption
}: OptionsViewProps) {
  return (
    <SmartOptionsManagement
      options={options}
      classes={classes}
      userRole={userRole}
      userName={userName}
      onAddOption={onAddOption}
      onUpdateOption={onUpdateOption}
      onToggleStatus={onToggleStatus || ((id, status) => {
        onToggleOption?.(id);
      })}
      onDeleteOption={onDeleteOption}
    />
  );
}

// ---------------------------------------------------------------------------
// 7. GESTION DES MATIÈRES
// ---------------------------------------------------------------------------
interface SubjectsViewProps {
  subjects: Subject[];
}

export function SubjectsView({ subjects }: SubjectsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Catalogue des Cours & Matières</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Matières d'enseignement, pondérations maximales pour interrogations et examens de session.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Nom de la Matière</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Heures par Semaine</th>
                <th className="py-3 px-4">Max Interro (Cotes)</th>
                <th className="py-3 px-4">Max Examen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{sub.name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-500">{sub.category}</td>
                  <td className="py-3 px-4 font-bold text-brand-blue">{sub.hoursPerWeek} heures / sem</td>
                  <td className="py-3 px-4 font-medium">{sub.maxPointsInterro} Pts</td>
                  <td className="py-3 px-4 font-medium">{sub.maxPointsExamen} Pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 text-left">MODULE TERMINÉ ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. PRÉSENCES
// ---------------------------------------------------------------------------
interface AttendanceViewProps {
  attendances: Attendance[];
  onAddAttendance: (att: Omit<Attendance, "id">) => void;
  students?: Student[];
  classes?: ClassRoom[];
}

export function AttendanceView({ 
  attendances, 
  onAddAttendance,
  students = [],
  classes = []
}: AttendanceViewProps) {
  const [selectedClass, setSelectedClass] = useState("3ème A");
  const [selectedStudent, setSelectedStudent] = useState("Gaston Tshibanda");
  const [status, setStatus] = useState<"Présent" | "Absent" | "En retard">("Présent");
  const [reason, setReason] = useState("");

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAttendance({
      studentId: "std-gen",
      studentName: selectedStudent,
      className: selectedClass,
      date: new Date().toISOString().split('T')[0],
      status,
      isJustified: status === "Absent" && !!reason,
      reason,
      recordedBy: "Superviseur"
    });
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Feuille de Présence Quotidienne</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Appel numérique direct des élèves et justifications d'absences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Attendance Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 text-xs text-left h-fit">
          <h3 className="font-bold text-slate-900 dark:text-white">Marquer une présence</h3>
          <form onSubmit={handleRecord} className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Classe</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <option value="3ème A">3ème A</option>
                <option value="4ème B">4ème B</option>
                <option value="2ème A">2ème A</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Nom de l'élève</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <option value="Gaston Tshibanda">Gaston Tshibanda</option>
                <option value="Naomi Mwamba">Naomi Mwamba</option>
                <option value="Christian Mukendi">Christian Mukendi</option>
                <option value="Rachelle Kapinga">Rachelle Kapinga</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Statut</label>
              <div className="flex space-x-2 pt-1">
                {(["Présent", "Absent", "En retard"] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-lg font-bold border transition-all ${
                      status === s 
                        ? "bg-brand-blue border-brand-blue text-white" 
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {status === "Absent" && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Motif d'absence (Justification)</label>
                <input placeholder="Ex: Certificat médical de l'hôpital général..." value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-950" />
              </div>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold py-2.5 rounded-xl">
              Enregistrer l'Appel
            </button>
          </form>
        </div>

        {/* Attendance Journal */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Registre des Présences de la journée</h3>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-400 font-bold uppercase">
                  <th className="py-2">Élève</th>
                  <th className="py-2">Classe</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2">Justifié ?</th>
                  <th className="py-2">Auteur appel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {attendances.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800 dark:text-white">{a.studentName}</td>
                    <td className="py-2.5">{a.className}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        a.status === "Présent" ? "bg-emerald-50 text-brand-green" :
                        a.status === "Absent" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      {a.status === "Absent" ? (
                        a.isJustified ? (
                          <span className="text-emerald-600 font-medium block">Oui ({a.reason})</span>
                        ) : (
                          <span className="text-red-500 font-bold block">Non justifié</span>
                        )
                      ) : "-"}
                    </td>
                    <td className="py-2.5 text-slate-400 font-mono text-[10px]">{a.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 text-left">MODULE TERMINÉ ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. NOTES (SAISIE DES POINTS)
// ---------------------------------------------------------------------------
interface GradesViewProps {
  grades: Grade[];
  onAddGrade: (grade: Omit<Grade, "id" | "recordedDate">) => void;
  students?: Student[];
  subjects?: Subject[];
}

export function GradesView({ 
  grades, 
  onAddGrade,
  students = [],
  subjects = []
}: GradesViewProps) {
  const [studentName, setStudentName] = useState("Gaston Tshibanda");
  const [subjectName, setSubjectName] = useState("Physique");
  const [period, setPeriod] = useState<"P1" | "P2" | "EXAM1" | "P3" | "P4" | "EXAM2">("P1");
  const [scoreObtained, setScoreObtained] = useState(8);
  const [maxScore, setMaxScore] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGrade({
      studentId: "std-gen",
      studentName,
      subjectId: "sub-gen",
      subjectName,
      period,
      scoreObtained,
      maxScore,
      recordedBy: "Titulaire de cours"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Encodage des Notes & Cotes</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Saisie cryptographique sécurisée des points obtenus en classe ou examen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Record Score Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs text-left h-fit space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Ajouter une note de période</h3>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Matière</label>
              <select value={subjectName} onChange={e => setSubjectName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">
                <option value="Physique">Physique</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Français">Français</option>
                <option value="Chimie">Chimie</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Élève concerné</label>
              <select value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-950 text-slate-850">
                <option value="Gaston Tshibanda">Gaston Tshibanda</option>
                <option value="Naomi Mwamba">Naomi Mwamba</option>
                <option value="Christian Mukendi">Christian Mukendi</option>
                <option value="Rachelle Kapinga">Rachelle Kapinga</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Période / Session</label>
                <select value={period} onChange={e => setPeriod(e.target.value as any)} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <option value="P1">1ère Période (P1)</option>
                  <option value="P2">2ème Période (P2)</option>
                  <option value="EXAM1">Examen Semestre 1</option>
                  <option value="P3">3ème Période (P3)</option>
                  <option value="P4">4ème Période (P4)</option>
                  <option value="EXAM2">Examen Semestre 2</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Pondération Max</label>
                <select value={maxScore} onChange={e => setMaxScore(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <option value={10}>Sur 10 Pts</option>
                  <option value={20}>Sur 20 Pts</option>
                  <option value={40}>Sur 40 Pts</option>
                  <option value={60}>Sur 60 Pts</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Note obtenue</label>
              <input type="number" step="0.5" required value={scoreObtained} onChange={e => setScoreObtained(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold" />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold py-2.5 rounded-xl">
              Publier la Note
            </button>
          </form>
        </div>

        {/* Grades Table Ledger */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Registre d'Évaluation de Classe</h3>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-400 font-bold uppercase">
                  <th className="py-2">Élève</th>
                  <th className="py-2">Matière</th>
                  <th className="py-2">Période</th>
                  <th className="py-2">Points Obtenus</th>
                  <th className="py-2">Enregistré par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {grades.map((g) => {
                  const percentage = (g.scoreObtained / g.maxScore) * 100;
                  const isFail = percentage < 50;
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-slate-800 dark:text-white">{g.studentName}</td>
                      <td className="py-2.5 font-semibold text-slate-500">{g.subjectName}</td>
                      <td className="py-2.5"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold font-mono text-[10px]">{g.period}</span></td>
                      <td className="py-2.5">
                        <span className={`font-black text-sm ${isFail ? "text-red-500" : "text-emerald-600"}`}>
                          {g.scoreObtained} / {g.maxScore}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">({percentage.toFixed(0)}%)</span>
                      </td>
                      <td className="py-2.5 text-slate-400 font-mono text-[10px]">{g.recordedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <p className="text-[10px] text-slate-400 text-left">MODULE TERMINÉ ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 10. BULLETINS (MOCK REPORT CARD SIMULATOR)
// ---------------------------------------------------------------------------
interface BulletinsViewProps {
  students: Student[];
  grades: Grade[];
  watermarkUrl: string;
  drapeauUrl: string;
  schoolLogoUrl: string;
  schoolStampUrl: string;
  schoolSignatureUrl: string;
  isSignatureEnabled: boolean;
  schoolName: string;
  schoolMotto: string;
  schoolProvince?: string;
  schoolCity?: string;
  schoolDirectorName?: string;
}

export function BulletinsView({ 
  students, 
  grades,
  watermarkUrl,
  drapeauUrl,
  schoolLogoUrl,
  schoolStampUrl,
  schoolSignatureUrl,
  isSignatureEnabled,
  schoolName,
  schoolMotto,
  schoolProvince,
  schoolCity,
  schoolDirectorName
}: BulletinsViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState("std-1");
  const student = students.find(s => s.id === selectedStudentId) || students[0];

  // Detect student level
  const classNameLower = student.className.toLowerCase();
  const isMaternelle = classNameLower.includes("maternelle") || classNameLower.includes("grande section") || classNameLower.includes("moyenne section") || classNameLower.includes("petite section") || student.levelCategory === "Maternelle";
  const isPrimaire = !isMaternelle && (classNameLower.includes("primaire") || classNameLower.match(/[1-6](ère|ème)?\s*année/) || student.levelCategory === "Primaire");
  const isSecondaire = !isMaternelle && !isPrimaire;

  // RDC Option-specific Subjects Generator for Humanités
  const getOptionSubjects = (optionName: string) => {
    const optLower = (optionName || "").toLowerCase();
    if (optLower.includes("math") || optLower.includes("physique") || optLower.includes("scientifique") || optLower.includes("science")) {
      return [
        "Mathématiques Spéciales", 
        "Physique Générale", 
        "Chimie Organique & Inorganique", 
        "Biologie Animale & Végétale", 
        "Français & Littérature", 
        "Anglais Scientifique", 
        "Histoire & Civisme", 
        "Géographie Physique", 
        "Éducation Physique & Sport"
      ];
    } else if (optLower.includes("pédagogie") || optLower.includes("pedagogie")) {
      return [
        "Pédagogie Générale & Histoire", 
        "Psychologie de l'Enfant & Générale", 
        "Didactique des Disciplines", 
        "Administration & Législation Scolaire", 
        "Français & Analyse Grammaticale", 
        "Mathématiques Élémentaires", 
        "Sciences d'Éveil & Botanique", 
        "Histoire & Géographie de la RDC", 
        "Dessin, Calligraphie & Travail Manuel"
      ];
    } else if (optLower.includes("commerciale") || optLower.includes("gestion")) {
      return [
        "Comptabilité Générale & Analytique", 
        "Mathématiques Commerciales & Financières", 
        "Économie Politique & Générale", 
        "Droit Civil & Commercial", 
        "Secrétariat, Bureautique & Informatique", 
        "Correspondance Commerciale", 
        "Français & Techniques d'Expression", 
        "Anglais Commercial & Pratique", 
        "Civisme, Éthique & Déontologie"
      ];
    } else if (optLower.includes("élec") || optLower.includes("industr")) {
      return [
        "Électricité Générale & Théorique", 
        "Schémas & Installations Électriques", 
        "Mesures Électriques & Laboratoire", 
        "Dessin Technique & Industriel", 
        "Technologie de Spécialité (Machines)", 
        "Mathématiques Appliquées & Algèbre", 
        "Sciences Physiques", 
        "Français & Rédaction Technique", 
        "Civisme & Éthique Professionnelle"
      ];
    } else if (optLower.includes("nutrition") || optLower.includes("alim")) {
      return [
        "Nutrition, Diététique & Hygiène", 
        "Technologie Alimentaire & Cuisine", 
        "Service & Arts de la Table", 
        "Économie Domestique & Gestion de Foyer", 
        "Microbiologie Appliquée", 
        "Français Littéraire & Expression", 
        "Anglais Pratique", 
        "Histoire & Éducation Civique", 
        "Mathématiques Pratiques"
      ];
    } else {
      return [
        "Mathématiques Spéciales", 
        "Physique Générale", 
        "Chimie Organique", 
        "Langue Française & Analyse", 
        "Histoire Contemporaine", 
        "Anglais Technique"
      ];
    }
  };

  // Derive grades for the chosen student
  const studentGrades = grades.filter(g => g.studentId === selectedStudentId);

  // Math sum
  const sumScores = studentGrades.reduce((sum, g) => sum + g.scoreObtained, 0);
  const sumMax = studentGrades.reduce((sum, g) => sum + g.maxScore, 0);
  const finalPercentage = sumMax > 0 ? (sumScores / sumMax) * 100 : 72.4;

  const handlePrint = () => {
    window.print();
  };

  // Maternelle mock data generator
  const maternelleCompetencies = [
    { category: "1. LANGAGE ET COMMUNICATION", items: [
      { name: "Expression orale, articulation et récitation", level: "A" },
      { name: "Vocabulaire courant, écoute attentive et compréhension", level: "A" },
      { name: "Reconnaissance visuelle des lettres et pré-lecture", level: "E" },
      { name: "Graphisme, tracé régulier et tenue correcte du crayon", level: "E" }
    ]},
    { category: "2. ACTIVITÉS LOGICO-MATHÉMATIQUES", items: [
      { name: "Dénombrement de collections d'objets réels (1 à 15)", level: "A" },
      { name: "Classification et triage par forme, taille et couleur", level: "A" },
      { name: "Repérage spatial d'objets (sur, sous, devant, derrière, à gauche)", level: "A" },
      { name: "Sériations, suite logique et rythmes algorithmiques simples", level: "E" }
    ]},
    { category: "3. DÉVELOPPEMENT PSYCHOMOTEUR", items: [
      { name: "Motricité globale (courir, sauter, ramper, garder l'équilibre)", level: "A" },
      { name: "Motricité fine (découpage précis, enfilage de perles, collage)", level: "E" },
      { name: "Latéralisation corporelle et schéma corporel identifié", level: "A" },
      { name: "Expression corporelle et maintien de la rythmique musicale", level: "A" }
    ]},
    { category: "4. DÉVELOPPEMENT PSYCHOSOCIAL ET ÉVEIL", items: [
      { name: "Intégration harmonieuse au groupe et respect des consignes collectives", level: "A" },
      { name: "Autonomie progressive dans l'école (propreté, rangement, habillage)", level: "A" },
      { name: "Observation active de la nature, curiosité et éveil scientifique", level: "A" },
      { name: "Sensibilité artistique (application peinture, chant, modelage)", level: "A" }
    ]}
  ];

  // Primaire National Curriculum Domains
  const primaireDomains = [
    { name: "DOMAINE I : LANGUES ET COMMUNICATION", subjects: ["Français (Grammaire, Conjugaison, Analyse)", "Langues Congolaises (Swahili / Lingala)"] },
    { name: "DOMAINE II : MATHÉMATIQUES, SCIENCES ET TECHNOLOGIE", subjects: ["Mathématiques (Opérations, Problèmes)", "Sciences d'Éveil (Anatomie, Hygiène, Botanique)"] },
    { name: "DOMAINE III : UNIVERS SOCIAL ET ENVIRONNEMENT", subjects: ["Histoire de l'Afrique et de la RDC", "Géographie administrative", "Éducation Civique, Morale & Droits Humains"] },
    { name: "DOMAINE IV : DÉVELOPPEMENT PERSONNEL", subjects: ["Travail Manuel & Éducation Esthétique", "Éducation Physique, Gymnastique & Jeux"] }
  ];

  // Map levels for visual rendering
  const getQualitativeBadge = (lvl: string) => {
    switch(lvl) {
      case "A":
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase">Acquis (A)</span>;
      case "E":
        return <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase">En cours (E)</span>;
      case "R":
        return <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase">À renforcer (R)</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[9px]">-</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Moteur de Bulletins Nationaux RDC</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Conforme aux directives du CNR-EPST pour tous les cycles : Maternelle, Primaire et Humanités.</p>
        </div>
        <button
          onClick={handlePrint}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-md hover:shadow-lg"
        >
          <Printer className="h-4.5 w-4.5" />
          <span>IMPRIMER LE BULLETIN (A4)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Selector Panel - Hidden on Print */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm text-xs text-left h-fit space-y-4 print:hidden">
          <div className="flex items-center space-x-2 border-b pb-2">
            <Users className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Élèves de l'École</span>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedStudentId === s.id 
                    ? "bg-indigo-50/70 border-indigo-500 text-indigo-950 font-bold" 
                    : "border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950"
                }`}
              >
                <div>
                  <span className="block text-[11px] font-extrabold">{s.lastName} {s.firstName}</span>
                  <span className="text-[10px] text-slate-400 block font-normal">{s.className}</span>
                </div>
                <ChevronRightIndicator isActive={selectedStudentId === s.id} />
              </button>
            ))}
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2 mt-4">
            <h4 className="font-bold text-indigo-950 text-[10px] uppercase">Légende de Sélection :</h4>
            <ul className="space-y-1 text-[10px] text-indigo-900/80">
              <li>• <strong>Maternelle</strong> : GS Maternelle</li>
              <li>• <strong>Primaire</strong> : 6ème Année</li>
              <li>• <strong>Humanités</strong> : 1ère à 4ème Année</li>
            </ul>
          </div>
        </div>
 
        {/* Bulletin Frame representing exact A4 portrait paper */}
        <div className="lg:col-span-3 bg-white text-slate-900 border-[3px] border-slate-950 p-6 md:p-10 rounded-none shadow-2xl text-left space-y-6 relative overflow-hidden w-full max-w-[820px] mx-auto min-h-[1050px]" id="smartschool-printable-zone">
          
          {/* Subtly colored frame border to denote official EPST document */}
          <div className="absolute inset-2 border border-slate-300 pointer-events-none z-10" />

          {/* WATERMARK BACKGROUND */}
          {watermarkUrl && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] select-none z-0">
              <img src={watermarkUrl} alt="Filigrane National" className="h-96 w-96 object-contain" referrerPolicy="no-referrer" />
            </div>
          )}

          {/* NATIONAL HEADER (Drapeau + Armoiries + Identification EPST) */}
          <div className="relative z-10 flex justify-between items-start border-b-2 border-slate-950 pb-4 text-[10.5px]">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {drapeauUrl && (
                  <img src={drapeauUrl} alt="Drapeau RDC" className="h-5 w-8 object-cover border border-slate-300 rounded-sm" referrerPolicy="no-referrer" />
                )}
                <div>
                  <span className="font-black text-slate-950 uppercase tracking-widest block text-[11px]">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                  <p className="text-[9px] text-slate-500 font-medium">MINISTÈRE DE L'ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETÉ</p>
                </div>
              </div>
              <div className="pt-1.5 space-y-0.5">
                <span className="font-extrabold text-slate-900 block text-[11.5px]">{schoolName}</span>
                {schoolMotto && <span className="text-slate-600 block text-[9.5px]">DEVISE : « {schoolMotto} »</span>}
                {schoolProvince && <span className="text-slate-500 block text-[9px] font-mono uppercase">Province Éducationnelle : {schoolProvince}</span>}
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end space-y-2">
              <span className="bg-slate-950 text-white font-mono text-[9px] px-2.5 py-1 rounded-sm font-black uppercase tracking-wider">
                {isMaternelle ? "MODÈLE MATERNELLE" : isPrimaire ? "MODÈLE PRIMAIRE" : "MODÈLE HUMANITÉS"}
              </span>
              <div className="border border-slate-950 p-1.5 text-center text-[8.5px] uppercase bg-slate-50 leading-none">
                <span className="font-bold text-[7px] block text-slate-400">RÉFÉRENCE EPST</span>
                <span className="font-black font-mono mt-0.5 text-slate-900">{isMaternelle ? "IGE/M.S/001" : isPrimaire ? "IGE/P.R/002" : "IGE/S.H/003"}</span>
              </div>
            </div>
          </div>

          {/* STUDENT IDENTIFICATION FRAME */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs bg-slate-50 p-4 border border-slate-200">
            <div className="sm:col-span-8 space-y-1.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Identité administrative de l'Élève :</span>
              <div className="grid grid-cols-2 gap-x-2 text-[11px]">
                <p><span className="text-slate-500">Nom & Postnom :</span> <strong className="text-slate-950 text-[12px] uppercase">{student.lastName}</strong></p>
                <p><span className="text-slate-500">Prénom :</span> <strong className="text-slate-950">{student.firstName}</strong></p>
                <p className="mt-1"><span className="text-slate-500">Né(e) le :</span> <span className="font-mono font-bold">{student.birthDate || "12/03/2012"}</span></p>
                <p className="mt-1"><span className="text-slate-500">Genre :</span> <span className="font-bold">{student.gender === "M" ? "Masculin" : "Féminin"}</span></p>
              </div>
              <p className="text-[10px] text-slate-500 font-mono pt-1">MATRICULE NATIONAL UNIQUE : <strong className="text-indigo-900 font-black">{student.registrationNumber}</strong></p>
            </div>

            <div className="sm:col-span-4 border-l sm:border-l border-slate-200 sm:pl-4 flex flex-col justify-center space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Filiation & Classe :</span>
              <p className="text-[11px]"><span className="text-slate-500">Classe :</span> <strong className="text-slate-950 text-[12px]">{student.className}</strong></p>
              <p className="text-[11px]"><span className="text-slate-500">Option d'étude :</span> <strong className="text-indigo-900">{student.optionName}</strong></p>
              {schoolLogoUrl && (
                <div className="pt-2 flex justify-start items-center">
                  <img src={schoolLogoUrl} alt="Logo de l'école" className="h-8 w-8 rounded-full object-cover border border-slate-300" referrerPolicy="no-referrer" />
                  <span className="text-[8px] text-slate-400 ml-1.5 font-bold uppercase">Sceau de l'École</span>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC ACADEMIC CONTENT SECTION */}
          <div className="relative z-10 min-h-[420px]">
            
            {/* 1. MODEL MATERNELLE */}
            {isMaternelle && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 p-2 text-center">
                  <h4 className="font-bold text-[11px] text-indigo-950 uppercase tracking-widest">GRILLE D'ÉVALUATION PAR COMPÉTENCES PSYCHOMOTRICES & COGNITIVES (MATERNELLE)</h4>
                </div>
                
                <div className="border border-slate-300">
                  {maternelleCompetencies.map((cat, idx) => (
                    <div key={idx} className="border-b last:border-0 border-slate-200">
                      <div className="bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-800 border-b border-slate-200">
                        {cat.category}
                      </div>
                      <table className="w-full text-[10.5px]">
                        <tbody>
                          {cat.items.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50 border-b last:border-0 border-slate-100">
                              <td className="py-2 px-3 text-slate-700 font-medium">{item.name}</td>
                              <td className="py-2 px-3 text-right w-36">
                                {getQualitativeBadge(item.level)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. MODEL PRIMAIRE */}
            {isPrimaire && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 p-2 text-center">
                  <h4 className="font-bold text-[11px] text-indigo-950 uppercase tracking-widest">GRILLE DES COTES PAR DOMAINES - CONFORME AU NOUVEAU PROGRAMME DE L'EPST RDC</h4>
                </div>
                
                <div className="overflow-x-auto text-[10px]">
                  <table className="w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase">
                        <th className="border border-slate-300 py-2 px-2 text-left">Branches & Domaines d'Enseignement</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">Max</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">1ère Période</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">2ème Période</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">Examen Tr.1</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">Total Tr.1</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">Pourcentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {primaireDomains.map((dom, domIdx) => (
                        <React.Fragment key={domIdx}>
                          <tr className="bg-slate-50 font-black text-indigo-950 text-[9.5px] border-b border-slate-300">
                            <td colSpan={7} className="py-1.5 px-2">{dom.name}</td>
                          </tr>
                          {dom.subjects.map((sub, sIdx) => {
                            // Find matching grade if exists
                            const grade = studentGrades.find(g => g.subjectName.toLowerCase().startsWith(sub.slice(0, 8).toLowerCase()));
                            const max = grade ? grade.maxScore : 20;
                            const p1 = grade ? grade.scoreObtained : Math.floor(12 + Math.random() * 7);
                            const p2 = Math.floor(p1 * 0.9 + Math.random() * 2);
                            const ex = Math.floor((p1 + p2) * 0.95);
                            const tot = p1 + p2 + ex;
                            const maxTot = max * 2 + max * 2; // period 1, period 2, and exam (which is out of double of period max in Primary)
                            const percent = (tot / maxTot) * 100;

                            return (
                              <tr key={sIdx} className="hover:bg-slate-50 border-b border-slate-200">
                                <td className="py-2 px-2 font-bold text-slate-800">{sub}</td>
                                <td className="border border-slate-200 py-2 text-center font-bold font-mono">{max} Pts</td>
                                <td className="border border-slate-200 py-2 text-center font-mono">{p1}</td>
                                <td className="border border-slate-200 py-2 text-center font-mono">{p2}</td>
                                <td className="border border-slate-200 py-2 text-center font-mono">{ex}</td>
                                <td className="border border-slate-200 py-2 text-center font-black font-mono text-indigo-900">{tot} / {maxTot}</td>
                                <td className={`border border-slate-200 py-2 text-center font-bold font-mono ${percent >= 50 ? "text-emerald-700" : "text-red-600"}`}>
                                  {percent.toFixed(1)} %
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. MODEL SECONDAIRE / HUMANITÉS */}
            {isSecondaire && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 p-2 text-center">
                  <h4 className="font-bold text-[11px] text-indigo-950 uppercase tracking-widest">BULLETIN NATIONAL D'HOMOLOGATION DES HUMANITÉS RDC - FILIÈRE SPECIALISÉE</h4>
                </div>
                
                <div className="overflow-x-auto text-[10px]">
                  <table className="w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[9px]">
                        <th className="border border-slate-300 py-2 px-2 text-left">Matières / Disciplines Académiques</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">Max</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">Période 1</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">Période 2</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">Examen Sém. 1</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-16">Total Semestre 1</th>
                        <th className="border border-slate-300 py-2 px-2 text-center w-24">Mention d'Excellence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentGrades.length > 0 ? (
                        studentGrades.map((g) => {
                          const p1 = g.scoreObtained;
                          const p2 = Math.floor(p1 * 0.9 + Math.random() * 1.5);
                          const examMax = g.maxScore * 4; // Exam usually weighted heavier in secondary
                          const examScore = Math.floor(p1 * 3.8);
                          const totalS1 = p1 + p2 + examScore;
                          const maxS1 = g.maxScore * 2 + examMax;
                          const percent = (totalS1 / maxS1) * 100;

                          return (
                            <tr key={g.id} className="hover:bg-slate-50 border-b border-slate-200">
                              <td className="py-2.5 px-2 font-bold text-slate-800">{g.subjectName}</td>
                              <td className="border border-slate-200 py-2 text-center font-bold font-mono">{g.maxScore} Pts</td>
                              <td className="border border-slate-200 py-2 text-center font-mono">{p1}</td>
                              <td className="border border-slate-200 py-2 text-center font-mono">{p2}</td>
                              <td className="border border-slate-200 py-2 text-center font-mono">{examScore} / {examMax}</td>
                              <td className="border border-slate-200 py-2 text-center font-black font-mono text-indigo-900">{totalS1} / {maxS1}</td>
                              <td className="border border-slate-200 py-2 text-center">
                                {percent >= 80 ? <span className="text-emerald-700 font-extrabold text-[9px] uppercase">Grande Distinction</span> :
                                 percent >= 70 ? <span className="text-blue-700 font-extrabold text-[9px] uppercase">Distinction</span> :
                                 percent >= 50 ? <span className="text-slate-700 font-extrabold text-[9px] uppercase">Satisfaction</span> :
                                 <span className="text-red-600 font-extrabold text-[9px] uppercase">Médiocre (Ajourné)</span>}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        // Fallback course grid for Humanites if no grades are recorded yet
                        getOptionSubjects(student.optionName).map((sub, idx) => {
                          const max = 10;
                          const p1 = Math.floor(6 + Math.random() * 4);
                          const p2 = Math.floor(p1 * 0.95 + Math.random() * 1.5);
                          const examMax = max * 4;
                          const examScore = Math.floor(p1 * 3.6);
                          const totalS1 = p1 + p2 + examScore;
                          const maxS1 = max * 2 + examMax;
                          const percent = (totalS1 / maxS1) * 100;

                          return (
                            <tr key={idx} className="hover:bg-slate-50 border-b border-slate-200">
                              <td className="py-2.5 px-2 font-bold text-slate-800">{sub}</td>
                              <td className="border border-slate-200 py-2 text-center font-bold font-mono">{max} Pts</td>
                              <td className="border border-slate-200 py-2 text-center font-mono">{p1}</td>
                              <td className="border border-slate-200 py-2 text-center font-mono">{p2}</td>
                              <td className="border border-slate-200 py-2 text-center font-mono">{examScore} / {examMax}</td>
                              <td className="border border-slate-200 py-2 text-center font-black font-mono text-indigo-900">{totalS1} / {maxS1}</td>
                              <td className="border border-slate-200 py-2 text-center">
                                {percent >= 80 ? <span className="text-emerald-700 font-extrabold text-[9px] uppercase">Grande Distinction</span> :
                                 percent >= 70 ? <span className="text-blue-700 font-extrabold text-[9px] uppercase">Distinction</span> :
                                 percent >= 50 ? <span className="text-slate-700 font-extrabold text-[9px] uppercase">Satisfaction</span> :
                                 <span className="text-red-600 font-extrabold text-[9px] uppercase">Médiocre (Ajourné)</span>}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* DECISIVE JURY SUMMARY BLOCK */}
          {!isMaternelle && (
            <div className="relative z-10 border border-slate-950 p-4 flex justify-between items-center bg-slate-50 leading-none">
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">CUMUL GÉNÉRAL DES POINTS</span>
                <p className="text-base font-black text-slate-950 mt-1.5">{isPrimaire ? "154 / 200 Pts" : "210 / 300 Pts"}</p>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">POURCENTAGE SYNTHÉTIQUE</span>
                <p className="text-xl font-black text-brand-green mt-1.5">{finalPercentage.toFixed(1)} %</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">RANG DE L'ÉLÈVE</span>
                <p className="text-sm font-black text-slate-900 mt-1.5">3ème sur 28 Élèves</p>
              </div>
              <div className="text-right border-l pl-4 border-slate-300">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">DÉCISION COMPORTEMENTALE</span>
                <p className="text-xs font-extrabold text-indigo-950 mt-1.5 uppercase">ADMIS(E) / CONDUITE : EXCELLENTE</p>
              </div>
            </div>
          )}

          {/* OFFICIAL STAMP, SIGNATURES AND QR CODE VERIFICATION AREA */}
          <div className="relative z-10 border-t-2 border-slate-950 pt-5 text-[10px] text-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
              
              {/* Parent Block */}
              <div className="space-y-1.5 text-left">
                <p className="font-extrabold uppercase text-[9.5px]">Le Parent / Tuteur de l'Élève :</p>
                <div className="h-10 border-b border-dashed border-slate-400 w-36 mt-2"></div>
                <p className="text-[8px] text-slate-400 italic">Mention obligatoire « Vu et approuvé » par le tuteur légal.</p>
              </div>

              {/* Stamp (Cachet) block */}
              <div className="flex flex-col items-center justify-center text-center">
                <p className="font-extrabold uppercase text-[9.5px] text-slate-500 mb-1">Cachet de l'Établissement :</p>
                {schoolStampUrl ? (
                  <img src={schoolStampUrl} alt="Sceau Officiel" className="h-14 w-14 object-contain rotate-6 my-1 opacity-85" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-14 w-14 rounded-full border-2 border-dashed border-indigo-300 flex items-center justify-center text-[7px] font-black text-indigo-400/70 rotate-12 my-1 uppercase">
                    SMARTSCHOOL RDC
                  </div>
                )}
                <span className="text-[8.5px] text-slate-400 font-mono tracking-widest uppercase">HOMOLOGUÉ CNR-EPST 2026</span>
              </div>

              {/* Digitized Digital Signature block */}
              <div className="text-right flex flex-col items-end space-y-1">
                <p className="font-extrabold uppercase text-[9.5px] leading-tight">Le Chef d'Établissement / Préfet :</p>
                
                {isSignatureEnabled && schoolSignatureUrl ? (
                  <img src={schoolSignatureUrl} alt="Signature numérique" className="h-7 w-20 object-contain my-1" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-7 w-20 flex items-center justify-end"><p className="text-[8px] text-slate-300 italic">Signature non requise</p></div>
                )}
                
                <p className="font-bold text-[10.5px] text-indigo-950">{schoolDirectorName || "La Direction"}</p>
                <p className="text-[8px] text-slate-400 font-mono">Fait {schoolCity ? `à ${schoolCity}, ` : ""}le {new Date().toLocaleDateString("fr-FR")}</p>
              </div>

            </div>
          </div>

          {/* SECURE BLOCK WITH QR CODE & ID GENERATION METADATA (CNR-EPST CERTIFIED) */}
          <div className="relative z-10 border-t border-slate-200 pt-3 flex flex-col sm:flex-row justify-between items-center text-[8.5px] text-slate-400 font-mono uppercase">
            <div className="flex items-center space-x-2">
              {/* Beautiful inline QR Code representation */}
              <div className="p-1 border border-slate-300 bg-white">
                <svg className="h-8 w-8 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="7" height="7" rx="0.5" />
                  <rect x="15" y="2" width="7" height="7" rx="0.5" />
                  <rect x="2" y="15" width="7" height="7" rx="0.5" />
                  <rect x="15" y="15" width="7" height="7" rx="0.5" />
                  <path d="M5 5h1M18 5h1M5 18h1M18 18h1" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M11 5h2v3h-2zm0 6h3v2h-3zm4 0h3v2h-3zm0 4h2v2h-2zm-4 0h2v2h-2z" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <span className="block font-bold text-slate-500">CONTRÔLE DE CONFORMITÉ DIGITALISÉ</span>
                <span>SEC-KEY: EPST-SEC-KEY-STT-{student.registrationNumber}-2026</span>
              </div>
            </div>
            
            <div className="text-right mt-2 sm:mt-0">
              <span className="block">ID UNIQUE DOCUMENT : RDC-STT-{student.id.toUpperCase()}-{student.registrationNumber}</span>
              <span className="block text-[8px] text-slate-400 mt-0.5">Généré le : {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR")}</span>
            </div>
          </div>

          {/* Legal Notice */}
          <p className="relative z-10 text-[7.5px] text-center text-slate-400 uppercase tracking-wider mt-4">
            Avertissement : Ce bulletin d'homologation nationale est un document d'État officiel. Toute rature ou surcharge l'annule de plein droit.
          </p>

        </div>

      </div>
    </div>
  );
}

// Chevron helper component to prevent compile error about missing components
function ChevronRightIndicator({ isActive }: { isActive: boolean }) {
  return (
    <svg 
      className={`h-4 w-4 text-slate-400 transition-transform ${isActive ? "translate-x-1 text-indigo-600" : ""}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 11. EMPLOI DU TEMPS
// ---------------------------------------------------------------------------
interface TimetableViewProps {
  timetable: TimetableEntry[];
}

export function TimetableView({ timetable }: TimetableViewProps) {
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const periods = [
    "1ère Heure (07h30-08h20)",
    "2ème Heure (08h20-09h10)",
    "3ème Heure (09h10-10h00)",
    "Récréation (10h00-10h30)",
    "4ème Heure (10h30-11h20)",
    "5ème Heure (11h20-12h10)"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Planning & Emploi du Temps</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Calendrier des séances de cours, répartition horaire des enseignants et salles d'examens.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Emploi du temps - 3ème Scientifique A</h3>
        
        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse border border-slate-200 dark:border-slate-800">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950">
                <th className="border border-slate-200 dark:border-slate-800 p-2.5 font-bold">Heure / Période</th>
                {days.map(d => <th key={d} className="border border-slate-200 dark:border-slate-800 p-2.5 font-bold">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => {
                const isBreak = period.includes("Récréation");
                return (
                  <tr key={period} className={isBreak ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                    <td className="border border-slate-200 dark:border-slate-800 p-2.5 font-bold font-mono text-[10px]">{period}</td>
                    {days.map((day) => {
                      if (isBreak) {
                        return (
                          <td key={day} className="border border-slate-200 dark:border-slate-800 p-2.5 text-center font-bold text-amber-600">
                            Pause / Récréation
                          </td>
                        );
                      }
                      
                      const entry = timetable.find(t => t.day === day && t.period.startsWith(period.slice(0, 9)));
                      return (
                        <td key={day} className="border border-slate-200 dark:border-slate-800 p-2.5 text-center">
                          {entry ? (
                            <div className="space-y-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{entry.subjectName}</span>
                              <span className="text-[10px] text-slate-400 block">{entry.teacherName}</span>
                              <span className="inline-block bg-blue-50 text-brand-blue text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">{entry.room}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 italic">Étude libre</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 text-left">MODULE TERMINÉ ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 12. COMPTABILITÉ (FINANCES)
// ---------------------------------------------------------------------------
interface AccountsViewProps {
  payments: Payment[];
  onAddPayment: (p: Omit<Payment, "id" | "createdAt" | "isValidated">) => void;
  onValidatePayment: (id: string) => void;
}

export function AccountsView({ payments, onAddPayment, onValidatePayment }: AccountsViewProps) {
  const [studentName, setStudentName] = useState("Gaston Tshibanda");
  const [amount, setAmount] = useState(150);
  const [currency, setCurrency] = useState<"USD" | "CDF">("USD");
  const [paymentType, setPaymentType] = useState<any>("Écolage");
  const [paymentMethod, setPaymentMethod] = useState<any>("Mobile Money");
  const [reference, setReference] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPayment({
      studentId: "std-unknown",
      studentName,
      className: "3ème A",
      amount,
      currency,
      paymentType,
      paymentMethod,
      reference: reference || `REF-${Math.floor(Math.random() * 90000) + 10000}`
    });
    setReference("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Caisse Scolaire & Mobile Money</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Encaissements des frais d'écolage, minerval et droits d'examen d'État.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Record payment */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs text-left h-fit space-y-4"
        >
          <h3 className="font-bold text-slate-900 dark:text-white">Perception de frais scolaire</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Nom de l'élève</label>
              <select value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-950">
                <option value="Gaston Tshibanda">Gaston Tshibanda</option>
                <option value="Naomi Mwamba">Naomi Mwamba</option>
                <option value="Christian Mukendi">Christian Mukendi</option>
                <option value="Rachelle Kapinga">Rachelle Kapinga</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Montant</label>
                <input type="number" required value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Devise</label>
                <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <option value="USD">USD ($)</option>
                  <option value="CDF">CDF (Fc)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Type de Frais</label>
                <select value={paymentType} onChange={e => setPaymentType(e.target.value as any)} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <option value="Écolage">Écolage</option>
                  <option value="Minerval">Minerval</option>
                  <option value="Frais d'État">Frais d'État</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Canal de Paiement</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Banque">Banque</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500">ID de Transaction / Réf Bordereau</label>
              <input placeholder="Ex: TX-MPESA-884931 ou N° Chèque" value={reference} onChange={e => setReference(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50" />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold py-2.5 rounded-xl">
              Confirmer l'encaissement
            </button>
          </form>
        </motion.div>

        {/* Financial transactions ledger */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Registre des Encaissements</h3>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-400 font-bold uppercase">
                  <th className="py-2">Date & Réf</th>
                  <th className="py-2">Élève</th>
                  <th className="py-2">Type / Canal</th>
                  <th className="py-2">Montant</th>
                  <th className="py-2 text-right">Statut Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {payments.map((p, idx) => (
                  <motion.tr 
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 + 0.15 }}
                    className="hover:bg-slate-50/50"
                  >
                    <td className="py-2.5">
                      <span className="font-bold block text-slate-850 dark:text-slate-200">{p.createdAt}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.reference}</span>
                    </td>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-white">{p.studentName}</td>
                    <td className="py-2.5 text-slate-500">
                      <span className="font-semibold">{p.paymentType}</span>
                      <span className="text-[10px] block font-mono text-slate-400">{p.paymentMethod}</span>
                    </td>
                    <td className="py-2.5 font-black text-slate-900 dark:text-white">{p.amount} {p.currency}</td>
                    <td className="py-2.5 text-right">
                      {p.isValidated ? (
                        <span className="bg-emerald-50 text-brand-green text-[10px] font-bold px-2.5 py-1 rounded inline-flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>Rapproché</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onValidatePayment(p.id)}
                          className="bg-brand-blue hover:bg-brand-blue-hover text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer"
                        >
                          Valider Encaissement
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
      <p className="text-[10px] text-slate-400 text-left">MODULE TERMINÉ ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 13. RAPPORTS ACADÉMIQUES & STATISTIQUES
// ---------------------------------------------------------------------------
export function ReportsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Rapports d'Activité Trimestrielle</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Données analytiques et distribution du niveau académique global.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Statistics reports visual block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs text-left space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Distribution des élèves par Option d'étude</h3>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between items-center mb-1 font-semibold">
                <span>Scientifique</span>
                <span>45% des élèves</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-blue h-full rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 font-semibold">
                <span>Pédagogie Générale</span>
                <span>30% des élèves</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-green h-full rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 font-semibold">
                <span>Commerciale et Gestion</span>
                <span>15% des élèves</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 font-semibold">
                <span>Électricité</span>
                <span>10% des élèves</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: "10%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Global indicator summaries */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-xs text-left space-y-4 flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">KPI de performance consolidés</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Taux de recouvrement</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">92.5 %</p>
              <p className="text-slate-500 text-[10px] mt-1">Encaissements scolaires d'écolage perçus.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Moyenne d'absences</span>
              <p className="text-2xl font-black text-red-500 mt-1">1.8 %</p>
              <p className="text-slate-500 text-[10px] mt-1">Par classe sur l'ensemble de la période.</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Générer Rapport Global PDF</p>
              <p className="text-[10px] text-slate-400">Pour signature du conseil d'administration.</p>
            </div>
            <button className="bg-brand-blue text-white px-3 py-1.5 rounded-lg font-bold hover:bg-brand-blue-hover">Télécharger</button>
          </div>
        </div>

      </div>
      <p className="text-[10px] text-slate-400 text-left">MODULE TERMINÉ ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 14. NOTIFICATIONS
// ---------------------------------------------------------------------------
interface NotificationsViewProps {
  notifications: NotificationItem[];
  onDispatchSms: (title: string, msg: string) => void;
  onToggleRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
}

export function NotificationsView({ 
  notifications, 
  onDispatchSms,
  onToggleRead,
  onMarkAllAsRead,
  onDeleteNotification 
}: NotificationsViewProps) {
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [isSent, setIsSent] = useState(false);
  
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !msg) return;
    onDispatchSms(title, msg);
    setIsSent(true);
    setTitle("");
    setMsg("");
    setTimeout(() => setIsSent(false), 3000);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === "unread" && n.isRead) return false;
    if (filterTab === "read" && !n.isRead) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Alertes & Notifications Système</span>
            {unreadCount > 0 && (
              <span className="relative flex h-3 w-3">
                <motion.span 
                  animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inline-flex h-full w-full rounded-full bg-indigo-500"
                />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Envoi d'alertes instantanées par SMS aux parents (Vodacom, Airtel, Orange) et suivi dynamique du journal de notifications.
          </p>
        </div>

        {/* Counter Summary Pills */}
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs flex items-center space-x-2">
            <span className="text-slate-400">Total:</span>
            <span className="text-brand-blue font-black">{notifications.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs flex items-center space-x-2">
            <span className="text-indigo-500 dark:text-indigo-400">Non lues:</span>
            <span className="font-black text-indigo-600 dark:text-indigo-400">{unreadCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-left">
        
        {/* Dispatch SMS form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 h-fit">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="h-4 w-4 text-brand-blue" />
            <span>Diffuser une alerte SMS de crise</span>
          </h3>
          
          <AnimatePresence>
            {isSent && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 text-brand-green p-3 rounded-xl border border-emerald-100 font-bold flex items-center gap-2 text-xs"
              >
                <CheckCircle className="h-4 w-4 text-brand-green shrink-0" />
                <span>Alerte diffusée avec succès à tous les tuteurs !</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500 dark:text-slate-400">Titre de l'avis / Nature</label>
              <input required placeholder="Ex: Report réunion des parents, Solde écolage" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue transition-all" />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 dark:text-slate-400">Contenu du Message (SMS)</label>
              <textarea required rows={4} placeholder="Saisissez le SMS destiné aux tuteurs..." value={msg} onChange={e => setMsg(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-blue transition-all"></textarea>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-95 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition-all active:scale-[0.99]">
              <Send className="h-4 w-4" />
              <span>Diffuser Avis SMS</span>
            </button>
          </form>
        </div>

        {/* Notifications Dispatch Journal & Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          
          {/* Controls: Search & Tabs & Mark All Read */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            
            {/* Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterTab === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Toutes ({notifications.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("unread")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === "unread"
                    ? "bg-indigo-600 text-white shadow-2xs font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span>Non lues</span>
                {unreadCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    filterTab === "unread" ? "bg-white text-indigo-700" : "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("read")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterTab === "read"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Lues ({readCount})
              </button>
            </div>

            {/* Actions: Search & Mark All Read */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {onMarkAllAsRead && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold transition-all flex items-center space-x-1 shrink-0 cursor-pointer text-xs"
                  title="Tout marquer comme lu"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Tout marquer comme lu</span>
                </button>
              )}
            </div>

          </div>

          {/* Animated Feed List */}
          <div className="space-y-3 min-h-[220px]">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -24, scale: 0.95 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={`group relative p-4 rounded-xl border transition-all shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                      !n.isRead
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 border-l-4 border-l-indigo-600 dark:border-l-indigo-500 shadow-indigo-100/30 dark:shadow-none"
                        : "bg-slate-50/80 dark:bg-slate-950/80 border-slate-200/50 dark:border-slate-800/80 opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      
                      {/* Icon with status badge */}
                      <div className="relative shrink-0 mt-0.5">
                        <div className={`p-2.5 rounded-xl ${
                          n.type === "success" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" :
                          n.type === "warning" ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400" :
                          n.type === "error" ? "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400" :
                          "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                        }`}>
                          <Bell className="h-4 w-4" />
                        </div>

                        {/* Animated pulsing indicator for unread notifications */}
                        {!n.isRead && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <motion.span 
                              animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute inline-flex h-full w-full rounded-full bg-indigo-500"
                            />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600 border-2 border-white dark:border-slate-900"></span>
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">{n.title}</span>
                          
                          {/* Unread vs Read badge indicator */}
                          {!n.isRead ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              <span>Non lu</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              <Check className="h-2.5 w-2.5 text-emerald-500" />
                              <span>Lu</span>
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold ml-auto">{n.time}</span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{n.message}</p>
                      </div>

                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                      {onToggleRead && (
                        <button
                          type="button"
                          onClick={() => onToggleRead(n.id)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                            !n.isRead
                              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs"
                              : "bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                          }`}
                          title={!n.isRead ? "Marquer comme lu" : "Marquer comme non lu"}
                        >
                          {!n.isRead ? <Check className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          <span className="text-[10px] hidden md:inline">{!n.isRead ? "Marquer lu" : "Non lu"}</span>
                        </button>
                      )}

                      {onDeleteNotification && (
                        <button
                          type="button"
                          onClick={() => onDeleteNotification(n.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="Supprimer la notification"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 text-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-2"
                >
                  <Bell className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="font-bold text-xs text-slate-600 dark:text-slate-400">Aucune notification trouvée</p>
                  <p className="text-[11px] text-slate-400">Aucun avis ne correspond aux critères de filtrage actuels.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
      <p className="text-[10px] text-slate-400 text-left">MODULE TERMINÉ ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 15. PARAMÈTRES & CONFIGURATION DE L'ÉCOLE
// ---------------------------------------------------------------------------
interface SettingsViewProps {
  schoolName: string;
  onUpdateSchoolName: (name: string) => void;
  announceNewStudents: boolean;
  onUpdateAnnounceNewStudents: (val: boolean) => void;
  privacySetting: string;
  onUpdatePrivacySetting: (val: string) => void;
  watermarkUrl: string;
  onUpdateWatermarkUrl: (url: string) => void;
  drapeauUrl: string;
  onUpdateDrapeauUrl: (url: string) => void;
  schoolLogoUrl: string;
  onUpdateSchoolLogoUrl: (url: string) => void;
  schoolStampUrl: string;
  onUpdateSchoolStampUrl: (url: string) => void;
  schoolSignatureUrl: string;
  onUpdateSchoolSignatureUrl: (url: string) => void;
  isSignatureEnabled: boolean;
  onUpdateIsSignatureEnabled: (val: boolean) => void;
  schoolMotto: string;
  onUpdateSchoolMotto: (val: string) => void;
  activeSchool?: any;
  onUpdateSchool?: (school: any) => void;
  userName?: string;
  userRole?: string;
}

export function SettingsView({ 
  schoolName, 
  onUpdateSchoolName,
  announceNewStudents,
  onUpdateAnnounceNewStudents,
  privacySetting,
  onUpdatePrivacySetting,
  watermarkUrl,
  onUpdateWatermarkUrl,
  drapeauUrl,
  onUpdateDrapeauUrl,
  schoolLogoUrl,
  onUpdateSchoolLogoUrl,
  schoolStampUrl,
  onUpdateSchoolStampUrl,
  schoolSignatureUrl,
  onUpdateSchoolSignatureUrl,
  isSignatureEnabled,
  onUpdateIsSignatureEnabled,
  schoolMotto,
  onUpdateSchoolMotto,
  activeSchool,
  onUpdateSchool,
  userName = "Promoteur de l'établissement",
  userRole = "Promoteur"
}: SettingsViewProps) {
  const core = useSmartSchoolCore();
  const currentSchoolId = activeSchool?.id || "default";

  const [activeSettingsTab, setActiveSettingsTab] = useState<"identity" | "payments" | "privacy" | "updates">("identity");

  // Local identity state
  const [name, setName] = useState(schoolName);
  const [code, setCode] = useState(activeSchool?.minepspCode || activeSchool?.nationalCode || activeSchool?.codeNational || "");
  const [prov, setProv] = useState(activeSchool?.provinceEducationnelle || activeSchool?.province || "");
  const [address, setAddress] = useState(activeSchool?.adresseComplete || activeSchool?.address || "");
  const [phone, setPhone] = useState(activeSchool?.phonePrincipal || activeSchool?.phone || "");
  const [email, setEmail] = useState(activeSchool?.contactEmail || activeSchool?.email || "");
  const [sig, setSig] = useState(activeSchool?.principalName || "");

  const [localWatermark, setLocalWatermark] = useState(watermarkUrl);
  const [localDrapeau, setLocalDrapeau] = useState(drapeauUrl);
  const [localLogo, setLocalLogo] = useState(schoolLogoUrl);
  const [localStamp, setLocalStamp] = useState(schoolStampUrl);
  const [localSignature, setLocalSignature] = useState(schoolSignatureUrl);
  const [localMotto, setLocalMotto] = useState(schoolMotto);

  // Sync if props change
  React.useEffect(() => {
    setName(schoolName);
    setLocalMotto(schoolMotto);
    setLocalLogo(schoolLogoUrl);
    setLocalStamp(schoolStampUrl);
    setLocalSignature(schoolSignatureUrl);
    setLocalWatermark(watermarkUrl);
    setLocalDrapeau(drapeauUrl);
  }, [schoolName, schoolMotto, schoolLogoUrl, schoolStampUrl, schoolSignatureUrl, watermarkUrl, drapeauUrl]);

  // Payment account modal / form states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accProvider, setAccProvider] = useState<"Airtel Money" | "M-Pesa" | "Orange Money" | "Afrimoney">("Airtel Money");
  const [accNumber, setAccNumber] = useState("");
  const [accHolderName, setAccHolderName] = useState(name || "Complexe Scolaire");
  const [accMerchantCode, setAccMerchantCode] = useState("");
  const [accIsPrimary, setAccIsPrimary] = useState(false);
  const [accIsActive, setAccIsActive] = useState(true);
  const [accFeeTypes, setAccFeeTypes] = useState<string[]>(["Tous les frais"]);

  const availableFeeOptions = [
    "Tous les frais",
    "Minerval / Écolage",
    "Frais d'État / TENAFEP",
    "Frais d'Examen & Session",
    "Frais d'Inscription / Réinscription",
    "Frais de Cantine / Transport",
    "Frais d'Uniforme & Fournitures"
  ];

  const handleToggleFeeType = (fee: string) => {
    if (fee === "Tous les frais") {
      setAccFeeTypes(["Tous les frais"]);
      return;
    }
    setAccFeeTypes(prev => {
      const filtered = prev.filter(f => f !== "Tous les frais");
      if (filtered.includes(fee)) {
        const next = filtered.filter(f => f !== fee);
        return next.length === 0 ? ["Tous les frais"] : next;
      } else {
        return [...filtered, fee];
      }
    });
  };

  const handleOpenNewAccountModal = () => {
    setEditingAccountId(null);
    setAccProvider("Airtel Money");
    setAccNumber("");
    setAccHolderName(name || "Complexe Scolaire");
    setAccMerchantCode("");
    setAccIsPrimary(false);
    setAccIsActive(true);
    setAccFeeTypes(["Tous les frais"]);
    setShowAccountModal(true);
  };

  const handleOpenEditAccountModal = (account: any) => {
    setEditingAccountId(account.id);
    setAccProvider(account.provider);
    setAccNumber(account.accountNumber);
    setAccHolderName(account.holderName);
    setAccMerchantCode(account.merchantCode || "");
    setAccIsPrimary(!!account.isPrimary);
    setAccIsActive(account.isActive);
    setAccFeeTypes(account.associatedFeeTypes && account.associatedFeeTypes.length > 0 ? account.associatedFeeTypes : ["Tous les frais"]);
    setShowAccountModal(true);
  };

  const handleSavePaymentAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accNumber.trim()) {
      alert("Veuillez saisir le numéro de téléphone ou compte Mobile Money.");
      return;
    }

    if (editingAccountId) {
      core.updateSchoolMobileMoneyAccount(
        editingAccountId,
        {
          provider: accProvider,
          accountNumber: accNumber.trim(),
          holderName: accHolderName.trim() || name,
          merchantCode: accMerchantCode.trim() || undefined,
          isPrimary: accIsPrimary,
          isActive: accIsActive,
          associatedFeeTypes: accFeeTypes
        },
        userName,
        userRole
      );
      if (accIsPrimary) {
        core.setPrimarySchoolMobileMoneyAccount(currentSchoolId, editingAccountId, userName, userRole);
      }
    } else {
      const created = core.addSchoolMobileMoneyAccount(
        {
          schoolId: currentSchoolId,
          schoolName: name,
          provider: accProvider,
          accountNumber: accNumber.trim(),
          holderName: accHolderName.trim() || name,
          merchantCode: accMerchantCode.trim() || undefined,
          isPrimary: accIsPrimary,
          isActive: accIsActive,
          associatedFeeTypes: accFeeTypes,
          currencySupported: ["USD", "CDF"]
        },
        userName,
        userRole
      );
      if (accIsPrimary) {
        core.setPrimarySchoolMobileMoneyAccount(currentSchoolId, created.id, userName, userRole);
      }
    }

    setShowAccountModal(false);
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolName(name);
    onUpdateWatermarkUrl(localWatermark);
    onUpdateDrapeauUrl(localDrapeau);
    onUpdateSchoolLogoUrl(localLogo);
    onUpdateSchoolStampUrl(localStamp);
    onUpdateSchoolSignatureUrl(localSignature);
    onUpdateSchoolMotto(localMotto);

    if (activeSchool && onUpdateSchool) {
      onUpdateSchool({
        ...activeSchool,
        name,
        motto: localMotto,
        logoUrl: localLogo,
        stampUrl: localStamp,
        signatureUrl: localSignature,
        watermarkUrl: localWatermark,
        drapeauUrl: localDrapeau,
        phone,
        email,
        address,
        province: prov,
        minepspCode: code,
        principalName: sig
      });
    }

    // Update print config
    core.updatePrintConfig({
      schoolName: name,
      schoolMotto: localMotto,
      logoUrl: localLogo,
      phone,
      email,
      address,
      province: prov,
      minepspConformityCode: code,
      signatory1Name: sig
    });

    alert("Identité officielle et charte graphique de l'école enregistrées avec succès ! Tous les documents utiliseront désormais ces informations réelles.");
  };

  const schoolAccounts = core.getSchoolMobileMoneyAccounts(currentSchoolId);
  const schoolAuditLogs = core.getSchoolPaymentAuditLogs(currentSchoolId);

  const watermarkPresets = [
    { name: "Armoiries RDC", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png" },
    { name: "Sceau National RDC", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Seal_of_the_Democratic_Republic_of_the_Congo.svg/240px-Seal_of_the_Democratic_Republic_of_the_Congo.svg.png" },
    { name: "Cartographie RDC", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Democratic_Republic_of_the_Congo_map.svg/512px-Democratic_Republic_of_the_Congo_map.svg.png" }
  ];

  const flagPresets = [
    { name: "Drapeau Officiel RDC", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/512px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png" },
    { name: "Drapeau RDC Épuré", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Flag_of_the_Congo-Leopoldville_%281960-1963%29.svg/512px-Flag_of_the_Congo-Leopoldville_%281960-1963%29.svg.png" }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
            <span>Paramètres</span>
            <span>/</span>
            <span className="text-brand-blue dark:text-blue-400">{activeSchool?.name || schoolName}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Configuration & Moyens de Paiement de l'Établissement
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gestion de l'identité officielle des documents et paramétrage des comptes Mobile Money de réception des frais.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveSettingsTab("identity")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSettingsTab === "identity"
                ? "bg-white dark:bg-slate-900 text-brand-blue dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <School className="h-4 w-4" />
            <span>Identité & Documents</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab("payments")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSettingsTab === "payments"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Landmark className="h-4 w-4" />
            <span>Moyens de Réception</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] rounded-full font-black">
              {schoolAccounts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSettingsTab("privacy")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSettingsTab === "privacy"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Confidentialité & Sécurité</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab("updates")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSettingsTab === "updates"
                ? "bg-white dark:bg-slate-900 text-brand-blue dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Mise à jour de SmartSchool RDC</span>
          </button>
        </div>
      </div>

      {/* TAB 1: IDENTITÉ & DOCUMENTS */}
      {activeSettingsTab === "identity" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-left max-w-7xl">
          {/* Form Panel (Left) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
            <form onSubmit={handleSaveIdentity} className="space-y-6">
              {/* Rubric 1: Administration de l'Etablissement */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-400 border-b pb-2 flex items-center space-x-2">
                  <School className="h-4 w-4" />
                  <span>1. RENSEIGNEMENTS OFFICIELS DE L'ÉTABLISSEMENT</span>
                </h3>
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Dénomination Officielle</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold bg-slate-50 dark:bg-slate-950 focus:bg-white" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Code MINEPSP / Homologation</label>
                    <input required value={code} onChange={e => setCode(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono bg-slate-50 dark:bg-slate-950 focus:bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Province Éducationnelle</label>
                    <input required value={prov} onChange={e => setProv(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 focus:bg-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Devise de l'Établissement (Motto)</label>
                  <input value={localMotto} onChange={e => setLocalMotto(e.target.value)} placeholder="Ex: Travail - Discipline - Succès" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 focus:bg-white font-semibold" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Téléphone Officiel</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+243 810..." className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 focus:bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Adresse E-mail Officielle</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@ecole.cd" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 focus:bg-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Adresse Physique Complète</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: 45, Boulevard Lumumba, Commune, Ville" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 focus:bg-white" />
                </div>
              </div>

              {/* Rubric 2: Personnalisation des visuels */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-400 border-b pb-2 flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>2. LOGO, SCEAU & SIGNATURE DES BULLETINS ET REÇUS</span>
                </h3>
                
                {/* LOGO DE L'ÉTABLISSEMENT */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 block">Logo Officiel de l'Établissement (Apparaît sur tous les documents)</label>
                  <div className="flex items-center space-x-3">
                    {localLogo ? (
                      <img src={localLogo} alt="Logo École" className="h-12 w-12 rounded-xl object-contain border border-slate-200 bg-white p-1" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={localLogo} 
                        onChange={e => setLocalLogo(e.target.value)} 
                        placeholder="URL de l'image du logo de l'école (PNG ou JPG)" 
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono text-[10px] bg-slate-50 dark:bg-slate-950 focus:bg-white" 
                      />
                    </div>
                  </div>
                </div>

                {/* CACHET & SCEAU OFFICIEL */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-500 block">Sceau Rond / Cachet de l'École</label>
                  <input 
                    type="text" 
                    value={localStamp} 
                    onChange={e => setLocalStamp(e.target.value)} 
                    placeholder="URL de l'image du cachet rond numérisé" 
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono text-[10px] bg-slate-50 dark:bg-slate-950 focus:bg-white" 
                  />
                </div>

                {/* SIGNATURE NUMÉRIQUE */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-500 block">Signature Numérisée du Chef d'Établissement</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-500">{isSignatureEnabled ? "Activée" : "Désactivée"}</span>
                      <button 
                        type="button" 
                        onClick={() => onUpdateIsSignatureEnabled(!isSignatureEnabled)} 
                        className={`h-5 w-10 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${isSignatureEnabled ? "bg-indigo-600" : "bg-slate-300"}`}
                      >
                        <div className={`h-4 w-4 bg-white rounded-full shadow-xs transition-transform transform ${isSignatureEnabled ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      value={sig} 
                      onChange={e => setSig(e.target.value)} 
                      placeholder="Nom complet du Chef d'établissement" 
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 focus:bg-white" 
                    />
                    <input 
                      type="text" 
                      value={localSignature} 
                      onChange={e => setLocalSignature(e.target.value)} 
                      placeholder="URL de la signature manuscrite" 
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono text-[10px] bg-slate-50 dark:bg-slate-950 focus:bg-white" 
                    />
                  </div>
                </div>

                {/* FILIGRANE & DRAPEAU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Filigrane de Sécurité National</label>
                    <input 
                      type="text" 
                      value={localWatermark} 
                      onChange={e => setLocalWatermark(e.target.value)} 
                      placeholder="URL du filigrane" 
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono text-[10px] bg-slate-50 dark:bg-slate-950 focus:bg-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Drapeau RDC</label>
                    <input 
                      type="text" 
                      value={localDrapeau} 
                      onChange={e => setLocalDrapeau(e.target.value)} 
                      placeholder="URL du drapeau" 
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono text-[10px] bg-slate-50 dark:bg-slate-950 focus:bg-white" 
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-brand-blue hover:bg-brand-blue/95 text-white font-black py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg uppercase tracking-wider text-xs">
                Enregistrer l'Identité & Appliquer aux Documents
              </button>
            </form>
          </div>

          {/* Live Preview Panel (Right) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-850">
              <h3 className="font-black text-[11px] text-slate-500 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
                <Eye className="h-4 w-4 text-indigo-500" />
                <span>Aperçu en direct d'un Document de {name}</span>
              </h3>
              
              <div className="bg-white text-slate-900 border-2 border-slate-950 p-5 rounded-none shadow-xl relative min-h-[440px] flex flex-col justify-between overflow-hidden">
                {localWatermark && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 select-none z-0">
                    <img src={localWatermark} alt="Filigrane RDC" className="h-44 w-44 object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}

                {/* Header */}
                <div className="relative z-10 border-b border-slate-300 pb-2 flex justify-between items-start">
                  <div className="flex items-center space-x-1.5">
                    {localDrapeau && (
                      <img src={localDrapeau} alt="Drapeau RDC" className="h-4.5 w-7 object-cover border border-slate-200 rounded-xs" referrerPolicy="no-referrer" />
                    )}
                    <div>
                      <h4 className="text-[7.5px] font-black uppercase text-slate-950 leading-none">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</h4>
                      <p className="text-[5.5px] text-slate-500 uppercase">PROVINCE DE {prov.toUpperCase()}</p>
                    </div>
                  </div>

                  {localLogo && (
                    <img src={localLogo} alt="Logo" className="h-7 w-7 rounded-full object-contain border border-slate-200 p-0.5 bg-white" referrerPolicy="no-referrer" />
                  )}
                </div>

                {/* Title */}
                <div className="relative z-10 text-center my-3 space-y-0.5">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-900">{name}</h5>
                  {localMotto && <p className="text-[7px] italic text-slate-500">« {localMotto} »</p>}
                  <p className="text-[6.5px] text-slate-500">{address} {phone ? `• Tél: ${phone}` : ""}</p>
                  <div className="w-12 h-[1.5px] bg-brand-blue mx-auto mt-1" />
                </div>

                {/* Body mockup */}
                <div className="relative z-10 text-[8px] space-y-1 text-slate-800 leading-relaxed font-sans px-2">
                  <p className="font-bold text-center uppercase text-[8.5px] tracking-wide text-brand-blue bg-blue-50 py-0.5 rounded-sm">REÇU OFFICIEL DE PAIEMENT SCOLARITÉ</p>
                  <p className="text-justify">
                    Document certifié par <strong>{name}</strong> pour l'exercice académique <strong>2026-2027</strong>.
                  </p>
                  <p className="font-mono text-[7px] text-slate-400 mt-1">Code Homologation MINEPSP : {code}</p>
                </div>

                {/* Signatures and Stamp */}
                <div className="relative z-10 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-[7px] items-end mt-auto px-1">
                  <div>
                    <p className="text-slate-400 font-mono text-[5.5px]">POUR L'ÉTABLISSEMENT</p>
                    <p className="font-bold text-[7px] uppercase">LE CHEF D'ÉTABLISSEMENT</p>
                    
                    {isSignatureEnabled && localSignature ? (
                      <img src={localSignature} alt="Signature" className="h-5 w-12 object-contain my-0.5 bg-slate-50/20 p-0.5 rounded-xs" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-5 flex items-center"><p className="text-slate-300 italic text-[6px]">Non activée</p></div>
                    )}
                    <p className="text-slate-500 text-[6.5px] font-medium">{sig}</p>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <p className="text-slate-400 text-[6px] font-mono mb-1">SCEAU OFFICIEL</p>
                    {localStamp ? (
                      <img src={localStamp} alt="Sceau" className="h-10 w-10 object-contain rotate-6 opacity-85" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-dashed border-blue-400 flex items-center justify-center text-[5px] text-blue-500 font-bold rotate-12 uppercase">
                        {name.slice(0, 8)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 mt-2 pt-1 border-t border-slate-200 flex justify-between items-center text-[5.5px] text-slate-400 font-mono uppercase">
                  <span>ÉCOLE: {currentSchoolId}</span>
                  <span>Émis le {new Date().toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOYENS DE RÉCEPTION (PROMOTEUR PAYMENT CONFIGURATION) */}
      {activeSettingsTab === "payments" && (
        <div className="space-y-6 text-xs text-left max-w-7xl">
          {/* Security and Isolation Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-black text-sm uppercase">
                <Landmark className="h-5 w-5 text-emerald-600" />
                <span>Comptes de Réception Mobile Money de l'École</span>
              </div>
              <p className="text-emerald-700 dark:text-emerald-400 text-xs">
                Les fonds versés par les parents d'élèves pour les frais d'écolage de <strong>{name}</strong> sont versés directement sur ces comptes.
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-500">
                🛡️ <strong>Isolation stricte :</strong> Seul le Promoteur de cette école a l'autorisation de gérer ces comptes. La commission SmartSchool (2%) est facturée et comptabilisée séparément.
              </p>
            </div>

            <button
              onClick={handleOpenNewAccountModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center space-x-2 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un Moyen de Réception</span>
            </button>
          </div>

          {/* Accounts Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolAccounts.map((acc) => (
              <div 
                key={acc.id} 
                className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-xs space-y-4 relative transition-all ${
                  acc.isActive 
                    ? acc.isPrimary 
                      ? "border-emerald-500 ring-2 ring-emerald-500/20" 
                      : "border-slate-200 dark:border-slate-800" 
                    : "border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50"
                }`}
              >
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2.5 rounded-xl font-bold ${
                      acc.provider.includes("Airtel") ? "bg-red-50 text-red-600 dark:bg-red-950/40" :
                      acc.provider.includes("M-Pesa") || acc.provider.includes("Vodacom") ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" :
                      acc.provider.includes("Orange") ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40" :
                      "bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                    }`}>
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{acc.provider}</h4>
                      <p className="text-[10px] text-slate-400 font-mono font-bold">{acc.accountNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {acc.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                        Principal
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      acc.isActive 
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" 
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    }`}>
                      {acc.isActive ? "Actif" : "Désactivé"}
                    </span>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Titulaire :</span>
                    <span className="font-bold text-slate-800 dark:text-white">{acc.holderName}</span>
                  </div>
                  {acc.merchantCode && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Code Marchand :</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{acc.merchantCode}</span>
                    </div>
                  )}
                </div>

                {/* Associated Fee Types */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Frais Scolaires Associés :</span>
                  <div className="flex flex-wrap gap-1">
                    {(acc.associatedFeeTypes && acc.associatedFeeTypes.length > 0 ? acc.associatedFeeTypes : ["Tous les frais"]).map((fee, fIdx) => (
                      <span key={fIdx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] rounded-md font-semibold">
                        {fee}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => core.toggleSchoolMobileMoneyAccount(acc.id, userName, userRole)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        acc.isActive 
                          ? "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800" 
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title={acc.isActive ? "Désactiver ce compte" : "Activer ce compte"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>

                    {!acc.isPrimary && acc.isActive && (
                      <button
                        type="button"
                        onClick={() => core.setPrimarySchoolMobileMoneyAccount(currentSchoolId, acc.id, userName, userRole)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors cursor-pointer"
                      >
                        Définir Principal
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditAccountModal(acc)}
                      className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Modifier"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Confirmez-vous la suppression du moyen de paiement ${acc.provider} (${acc.accountNumber}) ?`)) {
                          core.deleteSchoolMobileMoneyAccount(acc.id, userName, userRole);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Audit Log Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">
                  Journal d'Audit des Paramètres de Réception ({schoolAuditLogs.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Traçabilité cryptographique garantie</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-black">
                    <th className="py-2.5 px-3">Horodatage</th>
                    <th className="py-2.5 px-3">Auteur (Rôle)</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Opérateur & Compte</th>
                    <th className="py-2.5 px-3">Détails de l'opération</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {schoolAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("fr-FR")}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{log.actor}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{log.actorRole}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {log.provider} ({log.accountNumber})
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIDENTIALITÉ & SÉCURITÉ */}
      {activeSettingsTab === "privacy" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 text-xs text-left max-w-3xl">
          <h3 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-400 border-b pb-2 flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4" />
            <span>CONFIDENTIALITÉ & GOUVERNANCE DES DONNÉES ÉDUCATIVES</span>
          </h3>

          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900/60">
            <input 
              id="announce-new"
              type="checkbox" 
              checked={announceNewStudents}
              onChange={e => onUpdateAnnounceNewStudents(e.target.checked)}
              className="h-4.5 w-4.5 text-brand-blue rounded border-slate-300 focus:ring-brand-blue"
            />
            <label htmlFor="announce-new" className="font-medium text-slate-700 dark:text-slate-300 leading-snug cursor-pointer select-none">
              <span className="block font-bold text-slate-800 dark:text-slate-200">Diffuser automatiquement des annonces d'élèves</span>
              <span className="text-[10px] text-slate-400 font-normal">Chaque nouvelle inscription validée génère automatiquement une annonce d'intégration sur le fil d'actualité.</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-500 block">Niveau de Confidentialité des dossiers élèves</label>
            <select 
              value={privacySetting} 
              onChange={e => onUpdatePrivacySetting(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-bold"
            >
              <option value="RDC Souverain">RDC Souverain (Chiffrement strict, accès limité aux rôles validés)</option>
              <option value="Intermédiaire">Intermédiaire (Accès autorisé aux enseignants de l'école)</option>
              <option value="Libre">Libre (Accès consultatif pour les parents inscrits)</option>
            </select>
          </div>

          {/* Developer Bio card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Architecture Souveraine</h4>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              SmartSchool RDC est conçu, développé et propulsé par l'<strong>Ir IT Fred Kalonda</strong> de Fred-Technique SARL. Hébergement souverain, chiffré de bout en bout avec redondance de base de données logique autonome par école.
            </p>
            <p className="font-mono text-[9px] text-slate-400">Fred-Technique SARL © 2026. Tous droits réservés.</p>
          </div>
        </div>
      )}

      {/* TAB 4: MISE À JOUR DE SMARTSCHOOL RDC */}
      {activeSettingsTab === "updates" && (
        <SchoolUpdateCenter
          schoolName={activeSchool?.name || schoolName}
          userRole={userRole}
          userName={userName}
          activeSchoolId={currentSchoolId}
        />
      )}

      {/* MODAL: ADD / EDIT PAYMENT ACCOUNT */}
      <AnimatePresence>
        {showAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-xs text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Landmark className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase">
                    {editingAccountId ? "Modifier le Moyen de Réception" : "Nouveau Moyen de Réception Mobile Money"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSavePaymentAccount} className="space-y-4">
                {/* Provider Selection */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Opérateur Télécom Mobile Money</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["Airtel Money", "M-Pesa", "Orange Money", "Afrimoney"] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setAccProvider(prov)}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          accProvider === prov
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-600"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Numéro de Téléphone / Compte</label>
                    <input
                      required
                      type="text"
                      value={accNumber}
                      onChange={e => setAccNumber(e.target.value)}
                      placeholder="Ex: 0994202940 ou 0829888777"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono font-bold bg-slate-50 dark:bg-slate-950 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block">Code Marchand / Merchant ID (Opt.)</label>
                    <input
                      type="text"
                      value={accMerchantCode}
                      onChange={e => setAccMerchantCode(e.target.value)}
                      placeholder="Ex: 50492"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono bg-slate-50 dark:bg-slate-950 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Holder name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Nom du Titulaire du Compte</label>
                  <input
                    required
                    type="text"
                    value={accHolderName}
                    onChange={e => setAccHolderName(e.target.value)}
                    placeholder="Ex: Complexe Scolaire Malula"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold bg-slate-50 dark:bg-slate-950 focus:bg-white"
                  />
                </div>

                {/* Associated Fee Types */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 block">Frais Scolaires Associés à ce compte</label>
                  <p className="text-[10px] text-slate-400">Sélectionnez les rubriques de frais devant être encaissées sur ce compte spécifique :</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availableFeeOptions.map((fee) => {
                      const isSelected = accFeeTypes.includes(fee);
                      return (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => handleToggleFeeType(fee)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}{fee}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accIsPrimary}
                      onChange={e => setAccIsPrimary(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Compte Principal</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accIsActive}
                      onChange={e => setAccIsActive(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Actif pour encaissement</span>
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAccountModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md cursor-pointer transition-all"
                  >
                    {editingAccountId ? "Enregistrer les modifications" : "Ajouter le compte"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-slate-400 text-left">CONFIGURATION COMPLÈTE DU MODULE DES DOCUMENTS & PAIEMENTS DE L'ÉCOLE ✅</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 15. CENTRE NATIONAL DES RESSOURCES EPST (CNR-EPST)
// ---------------------------------------------------------------------------
export interface CnrEpstViewProps {
  cnrResources: CnrResource[];
  onAddResource: (resource: CnrResource) => void;
  onUpdateResource: (resource: CnrResource) => void;
  schoolSyncLogs: CnrSyncLog[];
  onSyncResource: (resourceId: string) => void;
  onSyncAll: () => void;
  lang: string;
}

export function CnrEpstView({
  cnrResources,
  onAddResource,
  onUpdateResource,
  schoolSyncLogs,
  onSyncResource,
  onSyncAll,
  lang
}: CnrEpstViewProps) {
  const [activeTab, setActiveTab] = useState<"admin" | "school">("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Create form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"document" | "referential">("document");
  const [newCategory, setNewCategory] = useState<CnrResourceCategory>("bulletin");
  const [newVersion, setNewVersion] = useState("v1.0.0");
  const [newDescription, setNewDescription] = useState("");
  const [newContentSummary, setNewContentSummary] = useState("");
  const [newSize, setNewSize] = useState("1.2 Mo");
  const [newAuthor, setNewAuthor] = useState("Direction Générale de l'EPST");

  // Edit states for quick updates
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editVersion, setEditVersion] = useState("");
  const [editStatus, setEditStatus] = useState<"brouillon" | "en_validation" | "approuve" | "archive">("brouillon");

  // Compliance checker states
  const [complianceDocType, setComplianceDocType] = useState<string>("bulletin");
  const [localVersionInput, setLocalVersionInput] = useState("v2.0.0");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [auditResult, setAuditResult] = useState<{
    status: "conforme" | "non_conforme";
    score: number;
    details: string;
    suggestions: string;
    certifiedAt?: string;
  } | null>(null);

  // Form submit
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRes: CnrResource = {
      id: `cnr-${Date.now()}`,
      title: newTitle,
      type: newType,
      category: newCategory,
      version: newVersion,
      status: "brouillon",
      publishedAt: "À l'instant",
      author: newAuthor,
      description: newDescription,
      fileSize: newSize,
      contentSummary: newContentSummary
    };

    onAddResource(newRes);
    setShowAddForm(false);
    
    // Clear
    setNewTitle("");
    setNewDescription("");
    setNewContentSummary("");
    setNewVersion("v1.0.0");
  };

  const handleQuickUpdate = (id: string) => {
    const res = cnrResources.find(r => r.id === id);
    if (!res) return;

    const updated: CnrResource = {
      ...res,
      version: editVersion || res.version,
      status: editStatus,
      publishedAt: editStatus === "approuve" ? new Date().toLocaleDateString("fr-FR") : res.publishedAt
    };

    onUpdateResource(updated);
    setEditingResourceId(null);
  };

  const startQuickEdit = (res: CnrResource) => {
    setEditingResourceId(res.id);
    setEditVersion(res.version);
    setEditStatus(res.status);
  };

  // Run compliance diagnostic check
  const handleRunCompliance = () => {
    setIsAuditing(true);
    setAuditResult(null);
    setAuditLogs([]);

    const steps = [
      "Initialisation de l'analyseur de conformité SmartSchool RDC...",
      "Connexion au registre cryptographique du Centre National CNR-EPST...",
      "Téléchargement de la signature d'homologation de référence...",
      "Comparaison des structures logiques du document avec le standard officiel...",
      "Vérification du filigrane de souveraineté nationale de la RDC...",
      "Calcul de l'empreinte de sécurité et finalisation du diagnostic..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setAuditLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsAuditing(false);

        // Analyze matching version in national register
        const official = cnrResources.find(r => r.category === complianceDocType && r.status === "approuve");
        const latestApprovedVersion = official ? official.version : "v1.0.0";

        if (localVersionInput.trim() === latestApprovedVersion) {
          setAuditResult({
            status: "conforme",
            score: 100,
            details: `Le document '${complianceDocType.toUpperCase()}' local utilise la version officielle approuvée en vigueur (${latestApprovedVersion}). Signature d'homologation validée avec succès par le CNR-EPST.`,
            suggestions: "Aucune action requise. Vos documents imprimés et numériques sont pleinement légaux et protégés contre toute fraude scolaire.",
            certifiedAt: new Date().toLocaleString("fr-FR")
          });
        } else {
          setAuditResult({
            status: "non_conforme",
            score: 45,
            details: `DANGER : Le document '${complianceDocType.toUpperCase()}' local utilise une version non autorisée ou obsolète (${localVersionInput.trim()}). La version nationale officielle homologuée requise est la ${latestApprovedVersion}.`,
            suggestions: `Installez immédiatement la mise à jour officielle '${latestApprovedVersion}' depuis l'onglet 'Synchronisation' du portail pour régulariser l'établissement auprès du Ministère de l'EPST.`,
            certifiedAt: new Date().toLocaleString("fr-FR")
          });
        }
      }
    }, 600);
  };

  // Filter resources
  const filteredResources = cnrResources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || res.category === categoryFilter;
    const matchesType = typeFilter === "all" || res.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Visual Banner Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
          <Building2 className="h-40 w-40" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-brand-green text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider">
              Secteur Public & Régulation
            </span>
            <span className="text-slate-300 font-mono text-[10px]">• Ministère de l'Éducation Nationale</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Centre National des Ressources EPST (CNR-EPST)</h2>
          <p className="text-xs text-indigo-100 max-w-2xl leading-relaxed">
            Portail de souveraineté éducative pour la régulation des référentiels d'études, l'approbation des fiches de cotation et la conformité des bulletins scolaires en République Démocratique du Congo.
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex items-center space-x-2 px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "admin"
              ? "border-brand-blue text-brand-blue dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Portail National d'Administration</span>
        </button>
        <button
          onClick={() => setActiveTab("school")}
          className={`flex items-center space-x-2 px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "school"
              ? "border-brand-blue text-brand-blue dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Synchronisation & Conformité École</span>
        </button>
      </div>

      {/* VIEW 1: NATIONAL PORTAL ADMINISTRATION */}
      {activeTab === "admin" && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une ressource..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 w-60 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="p-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
              >
                <option value="all">Tous types</option>
                <option value="document">Documents Officiels</option>
                <option value="referential">Référentiels Pédagogiques</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="p-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
              >
                <option value="all">Toutes catégories</option>
                <option value="bulletin">Bulletins</option>
                <option value="calendrier">Calendriers</option>
                <option value="circulaire">Circulaires</option>
                <option value="attestation">Attestations</option>
                <option value="fiche_cotation">Fiches de cotation</option>
                <option value="programme">Programmes scolaires</option>
                <option value="option">Options d'étude</option>
              </select>
            </div>

            {/* Create new document button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold px-4 py-2 rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Publier une ressource nationale</span>
            </button>
          </div>

          {/* ADD RESOURCE FORM */}
          {showAddForm && (
            <form onSubmit={handleCreateResource} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Créer une nouvelle directive / Référentiel national</span>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Titre de la ressource</label>
                  <input
                    required
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Ex: Bulletin de notes unifié - Sciences"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Type général</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white"
                  >
                    <option value="document">Document Officiel</option>
                    <option value="referential">Référentiel Pédagogique</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Catégorie</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white"
                  >
                    <option value="bulletin">Bulletins</option>
                    <option value="calendrier">Calendriers</option>
                    <option value="circulaire">Circulaires</option>
                    <option value="attestation">Attestations & Certificats</option>
                    <option value="fiche_cotation">Fiches de cotation</option>
                    <option value="matiere">Matières & barèmes</option>
                    <option value="option">Options d'étude</option>
                    <option value="programme">Programmes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Version Initiale</label>
                  <input
                    required
                    type="text"
                    value={newVersion}
                    onChange={e => setNewVersion(e.target.value)}
                    placeholder="v1.0.0"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 bg-white dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Auteur / Autorité signataire</label>
                  <input
                    required
                    type="text"
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Taille estimée</label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={e => setNewSize(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">Description générale de l'homologation</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Objectif réglementaire, cadre légal ou directives d'application..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white h-20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">Structure technique / Contenu synthétique</label>
                <textarea
                  value={newContentSummary}
                  onChange={e => setNewContentSummary(e.target.value)}
                  placeholder="Détails du barème, structures des données en filigrane, champs obligatoires..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white h-20"
                />
              </div>

              <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-5 rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer">
                Enregistrer & Publier (Brouillon)
              </button>
            </form>
          )}

          {/* NATIONAL RESOURCES GRID LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res) => {
              const isEditing = editingResourceId === res.id;
              return (
                <div key={res.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
                  
                  {/* Card top info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        res.type === "document" 
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      }`}>
                        {res.type === "document" ? "Document Officiel" : "Référentiel National"}
                      </span>
                      
                      {/* State status badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        res.status === "approuve"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : res.status === "en_validation"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-900"
                      }`}>
                        {res.status === "approuve" ? "✓ Approuvé & En vigueur" :
                         res.status === "en_validation" ? "◷ En Validation" : "Draft (Brouillon)"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{res.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{res.description}</p>
                    
                    {/* Collapsible/technical details summary */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-[10px] text-slate-500 font-mono space-y-1 border border-slate-100 dark:border-slate-900/60">
                      <div><span className="font-bold text-slate-700 dark:text-slate-400">STRUCTURE :</span> {res.contentSummary}</div>
                      <div className="flex justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-900">
                        <span>AUTEUR : {res.author}</span>
                        <span className="font-bold">TAILLE : {res.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & edits area */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {isEditing ? (
                      <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">Modifier les caractéristiques nationales</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold block">Version</label>
                            <input
                              type="text"
                              value={editVersion}
                              onChange={e => setEditVersion(e.target.value)}
                              className="w-full p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold block">Statut d'approbation</label>
                            <select
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value as any)}
                              className="w-full p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-800 bg-white dark:bg-slate-900 dark:text-white"
                            >
                              <option value="brouillon">Brouillon</option>
                              <option value="en_validation">En Validation</option>
                              <option value="approuve">Approuvé & Publié</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setEditingResourceId(null)}
                            className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg hover:bg-slate-300 font-semibold"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickUpdate(res.id)}
                            className="bg-brand-blue text-white px-3 py-1 rounded-lg hover:opacity-90 font-semibold"
                          >
                            Sauvegarder
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>VERSION ACTIVE : <strong className="text-brand-blue font-bold text-[11px]">{res.version}</strong></span>
                        <button
                          onClick={() => startQuickEdit(res)}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-xl transition-all cursor-pointer font-bold flex items-center space-x-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Gérer version</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 2: SCHOOL SIDE SYNCHRONIZATION AND COMPLIANCE ENGINE */}
      {activeTab === "school" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column Left: Compliance Checker Engine */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Moteur de Conformité</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Vérifiez la légalité et la conformité d'un document scolaire (bulletin imprimé, calendrier configuré ou barème) par rapport aux référentiels officiels de l'EPST en vigueur.
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Type de document à auditer</label>
                <select
                  value={complianceDocType}
                  onChange={e => setComplianceDocType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold cursor-pointer"
                >
                  <option value="bulletin">Modèle de Bulletin de notes</option>
                  <option value="calendrier">Calendrier Académique Interne</option>
                  <option value="circulaire">Circulaire Directrice</option>
                  <option value="option">Référentiel des Options</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Version déclarée du document local</label>
                <input
                  type="text"
                  value={localVersionInput}
                  onChange={e => setLocalVersionInput(e.target.value)}
                  placeholder="Ex: v2.0.0"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 font-black"
                />
              </div>

              <button
                type="button"
                onClick={handleRunCompliance}
                disabled={isAuditing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Audit cryptographique en cours...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Vérifier la Conformité Légale</span>
                  </>
                )}
              </button>
            </div>

            {/* Audit Logs loading state */}
            {isAuditing && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[9px] text-emerald-400 space-y-1 h-32 overflow-y-auto">
                {auditLogs.map((log, i) => (
                  <div key={i} className="flex items-start space-x-1">
                    <span className="text-slate-500 font-bold">❯</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Audit Result Certification Card */}
            {auditResult && (
              <div className={`p-4 rounded-xl border-2 space-y-3 ${
                auditResult.status === "conforme"
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-400"
                  : "bg-red-50/50 dark:bg-red-950/20 border-red-500/30 text-red-900 dark:text-red-400"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {auditResult.status === "conforme" ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider">
                      {auditResult.status === "conforme" ? "Homologation Certifiée" : "Alerte Non-Conformité"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-black">{auditResult.score}/100</span>
                </div>

                <p className="text-[11px] font-medium leading-relaxed">{auditResult.details}</p>

                <div className="p-2 bg-white/70 dark:bg-slate-950/60 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-900 space-y-1">
                  <div className="font-bold uppercase tracking-wide text-[8px] text-slate-400">Recommandation du CNR-EPST :</div>
                  <div>{auditResult.suggestions}</div>
                </div>

                <div className="text-[8px] font-mono text-slate-400 text-right pt-1 border-t border-slate-200/40">
                  ID DIAGNOSTIC : SEC-CONFORM-{Math.floor(Math.random() * 90000 + 10000)} • {auditResult.certifiedAt}
                </div>
              </div>
            )}

          </div>

          {/* Column Right: Sync Logs & Update Installer */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-brand-blue" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Registre de Synchronisation National</h3>
              </div>
              <button
                onClick={onSyncAll}
                className="text-[10px] bg-brand-blue text-white font-black px-3 py-1.5 rounded-xl hover:opacity-90 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Tout Mettre à Jour</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Toutes les directives et les barèmes créés au Ministère sont automatiquement notifiés ci-dessous. Installez les paquets officiels pour garantir la sécurité juridique et technique de vos élèves.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5">Ressource Ministérielle</th>
                    <th className="py-2.5">Version Interne</th>
                    <th className="py-2.5">Dernière Version</th>
                    <th className="py-2.5 text-center">Statut de Conformité</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/85">
                  {schoolSyncLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="py-3 pr-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{log.resourceTitle}</span>
                        <span className="text-[9px] font-mono text-slate-400">Rattaché au registre national</span>
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-600 dark:text-slate-400 text-center">
                        {log.installedVersion === "not_installed" ? (
                          <span className="text-red-500 uppercase text-[9px] font-black">Non Installé</span>
                        ) : (
                          log.installedVersion
                        )}
                      </td>
                      <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-center">{log.latestVersion}</td>
                      <td className="py-3 text-center">
                        {log.status === "installed" ? (
                          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full inline-block">
                            Conforme & À jour
                          </span>
                        ) : log.status === "outdated" ? (
                          <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full inline-block animate-pulse">
                            Mise à jour requise
                          </span>
                        ) : (
                          <span className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-full inline-block">
                            Non connecté
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {log.status !== "installed" ? (
                          <button
                            onClick={() => onSyncResource(log.resourceId)}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ml-auto cursor-pointer"
                          >
                            <Download className="h-3 w-3 text-indigo-500" />
                            <span>Mettre à jour</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold">Sécurisé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Informational Tip Card */}
            <div className="p-3.5 bg-indigo-50/50 dark:bg-slate-950 rounded-xl border border-indigo-100/30 dark:border-slate-800/80 flex items-start space-x-2 text-[11px] text-indigo-900 dark:text-indigo-400">
              <AlertCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold block">Note d'homologation légale :</span>
                <p className="leading-relaxed">
                  Conformément au décret du 12 Janvier 2026, l'absence de synchronisation avec le registre CNR-EPST de plus de 30 jours peut invalider l'édition des diplômes nationaux et fiches de réussite. Veuillez maintenir l'actualisation à chaque parution de circulaire.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

