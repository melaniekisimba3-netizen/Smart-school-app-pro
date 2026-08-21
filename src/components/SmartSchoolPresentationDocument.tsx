import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Presentation, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Building, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Landmark, 
  UserCheck, 
  Award, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  QrCode, 
  Layers, 
  Eye, 
  X, 
  Smartphone, 
  Zap, 
  ShieldAlert, 
  Search, 
  Compass, 
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { 
  FEATURE_SECTIONS, 
  generatePresentationPdf, 
  generatePresentationPptx, 
  DEFAULT_PRESENTATION_DATA 
} from "../services/presentationExportService";
import { SmartSchoolLogo } from "./SmartSchoolLogo";

interface SmartSchoolPresentationDocumentProps {
  onClose?: () => void;
  isOpen?: boolean;
}

export const SmartSchoolPresentationDocument: React.FC<SmartSchoolPresentationDocumentProps> = ({
  onClose,
  isOpen = true
}) => {
  const [viewMode, setViewMode] = useState<"slides" | "document" | "matrix">("slides");
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isGeneratingPptx, setIsGeneratingPptx] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const currentSection = FEATURE_SECTIONS[activeSectionIndex] || FEATURE_SECTIONS[0];

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePresentationPdf(DEFAULT_PRESENTATION_DATA);
    } catch (e) {
      console.error("Error generating PDF:", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPptx = async () => {
    setIsGeneratingPptx(true);
    try {
      await generatePresentationPptx(DEFAULT_PRESENTATION_DATA);
    } catch (e) {
      console.error("Error generating PPTX:", e);
    } finally {
      setIsGeneratingPptx(false);
    }
  };

  const handleCopyPitch = () => {
    const text = `SMARTSCHOOL RDC — Présentation Officielle
Plateforme Intégrale de Gestion Scolaire Multi-Établissements
Éditée par FRED-TECH (Freddy Kalonda)

Fonctionnalités Clés :
- 8 Portails Dédiés (Direction, Enseignants, Parents, Élèves, Comptable, RH, EPST)
- Architecture Multi-Tenant avec isolation absolue des données scolaires
- Bulletins scolaires 100% conformes aux normes officielles de l'EPST avec QR Code
- Paiement des frais par Mobile Money (M-Pesa, Orange Money, Airtel Money)
- Suivi des présences et alertes SMS immédiates aux parents
- Assistant Pédagogique et Prédiction de Décrochage assistés par IA (Gemini)

Contact : contact@fred-technique.cd | +243 820 000 000 | Kinshasa, RDC`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const filteredSections = FEATURE_SECTIONS.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="w-full max-w-7xl h-[94vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* TOP BAR / HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3.5">
            <SmartSchoolLogo size="lg" withRing withShadow />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  SmartSchool <span className="text-amber-400">RDC</span>
                </h2>
                <span className="bg-blue-600/30 text-blue-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-blue-400/40">
                  Dossier Officiel 2026-2027
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Plaquette Commerciale & Document Technique de Présentation Intégrale
              </p>
            </div>
          </div>

          {/* VIEW SWITCHER & EXPORT BUTTONS */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* View Mode Toggle */}
            <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 flex items-center space-x-1">
              <button
                onClick={() => setViewMode("slides")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === "slides" 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Presentation className="h-3.5 w-3.5" />
                <span>Diaporama</span>
              </button>
              <button
                onClick={() => setViewMode("document")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === "document" 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Brochure Complète</span>
              </button>
              <button
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === "matrix" 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Matrice des Rôles</span>
              </button>
            </div>

            {/* PPTX DOWNLOAD BUTTON */}
            <button
              onClick={handleDownloadPptx}
              disabled={isGeneratingPptx}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-900/30 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Télécharger la présentation complète au format Microsoft PowerPoint (.pptx)"
            >
              <Download className={`h-4 w-4 ${isGeneratingPptx ? "animate-bounce" : ""}`} />
              <span>{isGeneratingPptx ? "Export PPTX..." : "PowerPoint (.pptx)"}</span>
            </button>

            {/* PDF DOWNLOAD BUTTON */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-900/30 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Télécharger la plaquette commerciale officielle au format PDF Vectoriel"
            >
              <FileText className={`h-4 w-4 ${isGeneratingPdf ? "animate-spin" : ""}`} />
              <span>{isGeneratingPdf ? "Génération PDF..." : "Plaquette PDF"}</span>
            </button>

            {/* COPY SUMMARY */}
            <button
              onClick={handleCopyPitch}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Copier la fiche synthétique"
            >
              {copiedSummary ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>

            {/* CLOSE BUTTON */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-slate-800/80 hover:bg-red-900/50 text-slate-400 hover:text-red-300 rounded-xl border border-slate-700 transition-colors cursor-pointer ml-1"
                title="Fermer le dossier"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* SIDEBAR NAVIGATION (FOR SLIDE OR DOCUMENT NAVIGATION) */}
          <div className="w-80 bg-slate-950/60 border-r border-slate-800 flex flex-col shrink-0 hidden lg:flex">
            
            {/* Search filter */}
            <div className="p-3.5 border-b border-slate-800/80">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher un module..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Module list */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Sommaire Exécutif ({FEATURE_SECTIONS.length} Modules)
              </div>
              {filteredSections.map((sec, idx) => {
                const isSelected = FEATURE_SECTIONS[activeSectionIndex]?.id === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      const realIndex = FEATURE_SECTIONS.findIndex(s => s.id === sec.id);
                      setActiveSectionIndex(realIndex);
                      if (viewMode === "document") {
                        const el = document.getElementById(`doc-sec-${sec.id}`);
                        el?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start space-x-2.5 border ${
                      isSelected
                        ? "bg-blue-900/30 border-blue-500/50 text-white shadow-sm"
                        : "bg-slate-900/40 border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      {sec.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs truncate ${isSelected ? "font-black text-white" : "font-bold text-slate-300"}`}>
                        {sec.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{sec.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sidebar bottom branding */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800/80 text-center">
              <p className="text-[11px] font-bold text-slate-300">Conçu & Développé par FRED-TECH</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Kinshasa, RDC • contact@fred-technique.cd</p>
            </div>
          </div>

          {/* VIEW CONTENT AREA */}
          <div className="flex-1 overflow-y-auto bg-slate-900/50 p-4 sm:p-6 md:p-8 custom-scrollbar">
            
            {/* 1. SLIDE-BY-SLIDE PRESENTATION VIEW */}
            {viewMode === "slides" && (
              <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Slide Card Container */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  
                  {/* Top Ambient Glow */}
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Slide Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800/80">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-lg text-white shadow-md">
                        {currentSection.number}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                            {currentSection.category}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-700">
                            {currentSection.badge}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                          {currentSection.title}
                        </h3>
                      </div>
                    </div>

                    {/* Slide controls */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => setActiveSectionIndex(prev => Math.max(0, prev - 1))}
                        disabled={activeSectionIndex === 0}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all cursor-pointer"
                        title="Diapositive précédente"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-400 px-2">
                        {activeSectionIndex + 1} / {FEATURE_SECTIONS.length}
                      </span>
                      <button
                        onClick={() => setActiveSectionIndex(prev => Math.min(FEATURE_SECTIONS.length - 1, prev + 1))}
                        disabled={activeSectionIndex === FEATURE_SECTIONS.length - 1}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all cursor-pointer"
                        title="Diapositive suivante"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base text-slate-300 font-medium mt-4 leading-relaxed">
                    {currentSection.subtitle}
                  </p>

                  {/* Main Grid: Description & Features */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                    
                    {/* Left details & Key Value Proposition */}
                    <div className="lg:col-span-7 space-y-4">
                      
                      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-2">
                          Présentation Stratégique
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {currentSection.description}
                        </p>
                      </div>

                      {/* Key bullet points */}
                      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Fonctionnalités & Capacités Clés</span>
                        </h4>
                        <div className="space-y-2.5">
                          {currentSection.keyPoints.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-start space-x-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                              <p className="text-xs text-slate-200 leading-relaxed">{pt}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Highlight Callout */}
                      <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 p-4 rounded-2xl border border-amber-500/40">
                        <p className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Bénéfice Majeur pour l'Établissement</span>
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-slate-100 mt-1">
                          {currentSection.highlight}
                        </p>
                      </div>
                    </div>

                    {/* Right: Architectural / Visual UI Mockup Simulation */}
                    <div className="lg:col-span-5 flex flex-col space-y-4">
                      
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <span className="text-xs font-extrabold text-slate-300">
                              Aperçu Module : {currentSection.number}
                            </span>
                            <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                              RDC • EPST
                            </span>
                          </div>

                          {/* Specific Visual Mockup Rendering based on Section */}
                          <div className="mt-4">
                            <RenderMockupForSection sectionId={currentSection.id} />
                          </div>
                        </div>

                        {/* Details Sub-Cards */}
                        <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                          {currentSection.details.map((d, dIdx) => (
                            <div key={dIdx} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                              <p className="text-[11px] font-extrabold text-blue-300">{d.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{d.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Slide Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>SmartSchool RDC • FRED-TECH par Freddy Kalonda</span>
                    <span>Document Commercial & Technique Officiel</span>
                  </div>

                </div>

                {/* Quick Navigator Carousel */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {FEATURE_SECTIONS.map((sec, idx) => (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSectionIndex(idx)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        activeSectionIndex === idx
                          ? "bg-blue-600 border-blue-400 text-white font-black shadow-lg"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="block text-xs font-mono">{sec.number}</span>
                      <span className="block text-[9px] truncate mt-0.5 opacity-80">{sec.category.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>

              </div>
            )}

            {/* 2. FULL CONTINUOUS DOCUMENT BROCHURE VIEW */}
            {viewMode === "document" && (
              <div className="max-w-4xl mx-auto space-y-12 pb-16">
                
                {/* Cover Page Header in Document */}
                <div className="bg-gradient-to-b from-blue-950 to-slate-950 border border-blue-900/60 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-blue-600 to-amber-500" />
                  
                  <div className="inline-block p-3 bg-blue-900/40 rounded-full border border-blue-500/40 mb-4">
                    <SmartSchoolLogo size="xl" withRing withShadow />
                  </div>

                  <p className="text-xs font-extrabold tracking-widest uppercase text-amber-400 mb-2">
                    RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • MINISTÈRE DE L'EPST
                  </p>

                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                    SMARTSCHOOL RDC
                  </h1>

                  <p className="text-base sm:text-lg font-bold text-blue-200 mt-2">
                    La Solution Intégrale de Gestion Scolaire, Pédagogique & Financière Multi-Établissements
                  </p>

                  <div className="max-w-xl mx-auto mt-4 text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                    Dossier technique & commercial officiel destiné aux promoteurs d'écoles, directeurs d'établissements, inspecteurs et corps enseignant de la RDC.
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Télécharger la Plaquette PDF (.pdf)</span>
                    </button>
                    <button
                      onClick={handleDownloadPptx}
                      disabled={isGeneratingPptx}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <Presentation className="h-4 w-4" />
                      <span>Télécharger le Diaporama (.pptx)</span>
                    </button>
                  </div>
                </div>

                {/* All Sections Sequenced */}
                {FEATURE_SECTIONS.map((sec) => (
                  <div
                    key={sec.id}
                    id={`doc-sec-${sec.id}`}
                    className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative"
                  >
                    <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                      <span className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                        {sec.number}
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                          {sec.category}
                        </span>
                        <h3 className="text-xl font-black text-white">{sec.title}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 font-medium leading-relaxed">
                      {sec.subtitle}
                    </p>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sec.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <h4 className="text-xs font-black uppercase text-emerald-400 mb-2">Points Clés</h4>
                        {sec.keyPoints.map((pt, pIdx) => (
                          <div key={pIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-black uppercase text-blue-400 mb-2">Aperçu Réel</h4>
                        <RenderMockupForSection sectionId={sec.id} />
                      </div>
                    </div>

                    <div className="bg-amber-950/30 p-3.5 rounded-xl border border-amber-500/30 text-xs font-bold text-amber-200">
                      ★ Valeur ajoutée : {sec.highlight}
                    </div>
                  </div>
                ))}

              </div>
            )}

            {/* 3. ROLES COMPARISON MATRIX VIEW */}
            {viewMode === "matrix" && (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-xl font-black text-white">Matrice des Accès et Permissions par Rôle</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Cartographie des droits d'accès sur l'ensemble des modules de SmartSchool RDC
                      </p>
                    </div>
                    <span className="bg-blue-900/40 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-700">
                      RBAC & Zero-Trust
                    </span>
                  </div>

                  <div className="overflow-x-auto mt-6">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                          <th className="p-3 font-bold">Module / Capacité</th>
                          <th className="p-3 font-bold text-center">Direction</th>
                          <th className="p-3 font-bold text-center">Enseignants</th>
                          <th className="p-3 font-bold text-center">Parents</th>
                          <th className="p-3 font-bold text-center">Élèves</th>
                          <th className="p-3 font-bold text-center">Comptable</th>
                          <th className="p-3 font-bold text-center">RH</th>
                          <th className="p-3 font-bold text-center">EPST</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {[
                          { mod: "Tableaux de bord analytiques", roles: [1, 1, 1, 1, 1, 1, 1] },
                          { mod: "Inscriptions, Fiches & Matricules", roles: [1, 0, 0, 0, 0, 0, 1] },
                          { mod: "Saisie des cotes & Délibérations", roles: [1, 1, 0, 0, 0, 0, 1] },
                          { mod: "Consultation bulletins & cotes", roles: [1, 1, 1, 1, 0, 0, 1] },
                          { mod: "Paiements Mobile Money & Caisse", roles: [1, 0, 1, 0, 1, 0, 0] },
                          { mod: "Impression reçus thermiques 80mm", roles: [1, 0, 0, 0, 1, 0, 0] },
                          { mod: "Appel présences & SMS aux parents", roles: [1, 1, 1, 0, 0, 1, 0] },
                          { mod: "Journal de classe & Devoirs en ligne", roles: [1, 1, 1, 1, 0, 0, 0] },
                          { mod: "Générateur d'emplois du temps", roles: [1, 1, 1, 1, 0, 0, 0] },
                          { mod: "Messagerie interne & Communications", roles: [1, 1, 1, 1, 1, 1, 0] },
                          { mod: "Smart AI Analyst (Gemini)", roles: [1, 1, 0, 0, 0, 0, 1] },
                          { mod: "Édition Cartes Élèves & Service QR", roles: [1, 0, 0, 1, 0, 1, 1] },
                          { mod: "Sauvegardes & Disaster Recovery", roles: [1, 0, 0, 0, 0, 0, 1] },
                          { mod: "Supervision EPST & Ratios Nationaux", roles: [0, 0, 0, 0, 0, 0, 1] }
                        ].map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/40">
                            <td className="p-3 font-bold text-white">{row.mod}</td>
                            {row.roles.map((val, vIdx) => (
                              <td key={vIdx} className="p-3 text-center">
                                {val ? (
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-950 text-emerald-400 font-black text-xs border border-emerald-800">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

/**
 * Composant d'illustration / Mockup interactif pour chaque section
 */
function RenderMockupForSection({ sectionId }: { sectionId: string }) {
  switch (sectionId) {
    case "vision-multi-tenant":
      return (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-blue-300">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> Isolation Multi-Tenant</span>
            <span className="text-emerald-400 font-mono text-[10px]">Cloud RDC Actif</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">École A (sch-001)</span>
              <span className="font-bold text-white">Base Indépendante</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">École B (sch-002)</span>
              <span className="font-bold text-white">Base Indépendante</span>
            </div>
          </div>
        </div>
      );

    case "roles-portails":
      return (
        <div className="bg-slate-950 p-3 rounded-xl border border-indigo-900/50 space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between text-indigo-300 font-bold">
            <span>Routage Automatique</span>
            <span className="bg-indigo-900/60 px-1.5 py-0.5 rounded text-[9px]">8 Portails</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <span className="bg-slate-900 p-1.5 rounded text-slate-200 border border-slate-800">👑 Promoteur</span>
            <span className="bg-slate-900 p-1.5 rounded text-slate-200 border border-slate-800">🎓 Direction</span>
            <span className="bg-slate-900 p-1.5 rounded text-slate-200 border border-slate-800">👨‍🏫 Enseignant</span>
            <span className="bg-slate-900 p-1.5 rounded text-slate-200 border border-slate-800">👨‍👩‍👦 Parent</span>
          </div>
        </div>
      );

    case "eleves-inscriptions":
      return (
        <div className="bg-slate-950 p-3 rounded-xl border border-amber-900/50 space-y-2 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300">Carte d'Élève Officielle</span>
            <span className="font-mono text-slate-400">MAT-2026-084</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-[10px]">
              ÉL
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">KABAMBA TSHIMANGA</p>
              <p className="text-[9px] text-slate-400">6ème Primaire • Option Sciences</p>
            </div>
            <QrCode className="h-5 w-5 text-amber-400 shrink-0" />
          </div>
        </div>
      );

    case "notes-bulletins-epst":
      return (
        <div className="bg-slate-950 p-3 rounded-xl border border-blue-900/50 space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between font-bold text-blue-300">
            <span>Bulletin Officiel EPST</span>
            <span className="text-emerald-400">Pourcentage : 84.5%</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Mathématiques (Max 50) :</span>
              <span className="font-bold text-white">46 / 50</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Français & Langues (Max 40) :</span>
              <span className="font-bold text-white">36 / 40</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
              <span>Mention :</span>
              <span>DISTINCTION ★</span>
            </div>
          </div>
        </div>
      );

    case "finances-mobile-money":
      return (
        <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/50 space-y-2 text-[10px]">
          <div className="flex items-center justify-between font-bold text-emerald-300">
            <span>Paiement Mobile Money</span>
            <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">Instantané</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center font-bold">
            <div className="bg-red-950/60 text-red-300 p-1.5 rounded border border-red-800/60">M-Pesa</div>
            <div className="bg-amber-950/60 text-amber-300 p-1.5 rounded border border-amber-800/60">Orange</div>
            <div className="bg-red-950/60 text-red-300 p-1.5 rounded border border-red-800/60">Airtel</div>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
            <span className="text-slate-300">Reçu Thermique :</span>
            <span className="font-mono text-emerald-400 font-bold">REC-8921-VALIDÉ</span>
          </div>
        </div>
      );

    case "intelligence-artificielle":
      return (
        <div className="bg-slate-950 p-3 rounded-xl border border-indigo-900/50 space-y-2 text-[10px]">
          <div className="flex items-center justify-between font-bold text-indigo-300">
            <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Gemini Smart AI Analyst</span>
            <span className="text-amber-400 font-mono">IA RDC</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-300 space-y-1">
            <p className="text-[10px] text-indigo-200 font-bold">Recommandation Pédagogique :</p>
            <p className="text-[9px] text-slate-400 leading-snug">
              “Renforcer les séances de soutien en Algèbre pour la 4ème Scientifique A afin de maximiser le taux de réussite à l'Examen d'État.”
            </p>
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 text-center py-4">
          <Layers className="h-6 w-6 text-blue-500 mx-auto mb-1 opacity-80" />
          <p className="font-bold text-slate-300">Module Officiel Actif & Homologué</p>
          <p className="text-[9px] text-slate-500">Conforme aux standards EPST 2026-2027</p>
        </div>
      );
  }
}
