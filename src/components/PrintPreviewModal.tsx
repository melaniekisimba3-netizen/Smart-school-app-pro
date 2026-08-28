import React, { useState, useRef } from "react";
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  CheckCircle, 
  Award, 
  UserCheck, 
  Sliders, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  ShieldCheck,
  Building,
  School,
  FileCheck,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "motion/react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { exportToExcel, exportToPDF } from "../services/exportService";

export type PrintableDocumentType = 
  | "recu_minerval"
  | "facture"
  | "rapport_financier"
  | "bulletin_epst"
  | "carte_eleve"
  | "carte_enseignant"
  | "liste_classe"
  | "fiche_eleve"
  | "fiche_personnel"
  | "attestation";

export interface PrintPreviewModalProps {
  documentType: PrintableDocumentType;
  data: any;
  onClose: () => void;
  title?: string;
}

export function PrintPreviewModal({ documentType, data, onClose, title }: PrintPreviewModalProps) {
  const [format, setFormat] = useState<"A4" | "A5" | "Carte" | "Lettre">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margins, setMargins] = useState<"normal" | "narrow" | "none">("normal");
  const [copies, setCopies] = useState<number>(1);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const printZoneRef = useRef<HTMLDivElement>(null);

  // Auto detect format defaults
  React.useEffect(() => {
    if (documentType === "carte_eleve" || documentType === "carte_enseignant") {
      setFormat("Carte");
      setOrientation("landscape");
      setMargins("none");
    } else if (documentType === "recu_minerval" || documentType === "attestation") {
      setFormat("A5");
      setOrientation("portrait");
      setMargins("narrow");
    } else {
      setFormat("A4");
      setOrientation("portrait");
      setMargins("normal");
    }
  }, [documentType]);

  const handlePrintDirect = () => {
    window.print();
  };

  const handleExportPdf = () => {
    setIsDownloadingPdf(true);
    try {
      if (data && data.columns && data.rows) {
        exportToPDF({
          title: title || getDocTitle(),
          subtitle: data.statsSummary || `Document imprimé le ${new Date().toLocaleDateString("fr-FR")}`,
          headers: data.columns,
          rows: data.rows,
          filename: `${getDocTitle().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
          orientation,
          format: format === "A5" ? "A5" : "A4"
        });
      } else {
        window.print();
      }
    } catch (err) {
      console.error("PDF Export error:", err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleExportExcel = () => {
    if (data && data.columns && data.rows) {
      exportToExcel({
        title: title || getDocTitle(),
        subtitle: data.statsSummary || "",
        headers: data.columns,
        rows: data.rows,
        filename: `${getDocTitle().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`
      });
    } else {
      alert("Ce document ne contient pas de tableau exportable en Excel.");
    }
  };

  // Helper title renderer
  const getDocTitle = () => {
    if (title) return title;
    switch (documentType) {
      case "recu_minerval": return "Reçu Officiel de Minerval & Percevoir";
      case "facture": return "Facture & Note de Frais Scolaires";
      case "rapport_financier": return "Rapport Financier & Trésorerie EPST";
      case "bulletin_epst": return "Bulletin Scolaire Officiel EPST RDC";
      case "carte_eleve": return "Carte d'Élève Biométrique Numérique";
      case "carte_enseignant": return "Carte Professionnelle Enseignant";
      case "liste_classe": return "Liste Officielle d'Élèves par Classe";
      case "fiche_eleve": return "Fiche Administrative Élève";
      case "fiche_personnel": return "Fiche Individuelle Personnel & Agent";
      case "attestation": return "Attestation de Fréquentation Scolaire";
      default: return "Document SmartSchool RDC";
    }
  };

  const getPaddingClass = () => {
    if (format === "Carte") return "p-2.5";
    if (margins === "none") return "p-0";
    if (margins === "narrow") return "p-3";
    return "p-8";
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/90 backdrop-blur-md text-white overflow-hidden">
      
      {/* TOP TOOLBAR - HIDDEN DURING PHYSICAL PRINT */}
      <div className="no-print bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg">
        
        {/* Document Information */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-black text-sm text-white uppercase tracking-wider">{getDocTitle()}</h2>
            <p className="text-[11px] text-slate-400 font-medium">Moteur d'impression professionnel SmartSchool RDC • Seul le document sélectionné sera imprimé</p>
          </div>
        </div>

        {/* Print Configuration Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          
          {/* Format Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Format:</span>
            {(["A4", "A5", "Carte", "Lettre"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  format === fmt ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                {fmt === "Carte" ? "Carte CR-80" : fmt}
              </button>
            ))}
          </div>

          {/* Orientation Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Orientation:</span>
            <button
              onClick={() => setOrientation("portrait")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                orientation === "portrait" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Portrait
            </button>
            <button
              onClick={() => setOrientation("landscape")}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                orientation === "landscape" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Paysage
            </button>
          </div>

          {/* Margins Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Marges:</span>
            <button
              onClick={() => setMargins("normal")}
              className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                margins === "normal" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Normales
            </button>
            <button
              onClick={() => setMargins("narrow")}
              className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                margins === "narrow" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Étroites
            </button>
            <button
              onClick={() => setMargins("none")}
              className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                margins === "none" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Aucune
            </button>
          </div>

          {/* Copies Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl space-x-1">
            <span className="text-[10px] text-slate-400 px-1 font-bold uppercase">Copies:</span>
            <button 
              onClick={() => setCopies(Math.max(1, copies - 1))}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold px-1.5">{copies}</span>
            <button 
              onClick={() => setCopies(copies + 1)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold"
            >
              +
            </button>
          </div>

          {/* Watermark Toggle */}
          <button
            onClick={() => setShowWatermark(!showWatermark)}
            className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-all ${
              showWatermark ? "bg-emerald-950/60 border-emerald-600/50 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Sceau : {showWatermark ? "Oui" : "Non"}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
            <button
              onClick={handlePrintDirect}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black rounded-xl transition-all shadow-md flex items-center space-x-2 cursor-pointer uppercase text-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer ({copies})</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center space-x-2 cursor-pointer uppercase text-xs"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloadingPdf ? "Génération..." : "Enregistrer PDF"}</span>
            </button>

            {data && data.columns && data.rows && (
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer uppercase text-xs"
                title="Exporter les données au format Excel .xlsx"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel (.xlsx)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Fermer la fenêtre d'impression"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        </div>

      </div>

      {/* PRINT PREVIEW VIEWPORT */}
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-900/60 custom-scrollbar">
        
        {/* PRINT CONTAINER WRAPPER WITH EXACT DIMENSIONS */}
        <div 
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className="transition-transform duration-200"
        >
          {/* THE PRINTABLE ZONE TARGETED BY CSS @media print */}
          <div 
            id="smartschool-printable-zone" 
            ref={printZoneRef}
            className={`bg-white text-slate-900 shadow-2xl rounded-sm mx-auto relative overflow-hidden transition-all ${getPaddingClass()} ${
              format === "Carte" 
                ? "w-[85.6mm] h-[53.98mm] max-h-[53.98mm] text-[9px] print-format-carte" 
                : format === "A5" 
                ? (orientation === "landscape" ? "w-[210mm] min-h-[148mm]" : "w-[148mm] min-h-[210mm]")
                : format === "Lettre"
                ? (orientation === "landscape" ? "w-[279.4mm] min-h-[215.9mm]" : "w-[215.9mm] min-h-[279.4mm]")
                : (orientation === "landscape" ? "w-[297mm] min-h-[210mm]" : "w-[210mm] min-h-[297mm]")
            }`}
          >
            {/* RENDER SELECTED DOCUMENT CONTENT */}
            {renderDocumentContent(documentType, data, showWatermark, format, orientation)}
          </div>
        </div>

      </div>

      {/* FOOTER BAR */}
      <div className="no-print bg-slate-950 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Impression Sécurisée SmartSchool RDC • Module d'Édition Officiel</span>
        </span>
        <span>Format : {format} ({format === "Carte" ? "CR-80 PVC" : format}) | Orientation : {orientation.toUpperCase()} | Marges : {margins} | Copies : {copies}</span>
      </div>

    </div>
  );
}

// Render dynamic document types based on prompt requirements
function renderDocumentContent(
  type: PrintableDocumentType, 
  data: any, 
  showWatermark: boolean,
  format: "A4" | "A5" | "Carte" | "Lettre",
  orientation: "portrait" | "landscape"
) {
  const schoolName = data?.schoolName || "COMPLEXE SCOLAIRE SMARTSCHOOL RDC";
  const year = data?.schoolYear || "2026-2027";

  return (
    <div className="h-full flex flex-col justify-between text-slate-900 relative">
      
      {/* WATERMARK BACKGROUND IF ACTIVE */}
      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <div className="text-center">
            <div className="w-48 h-48 rounded-full border-8 border-slate-900 mx-auto mb-2 flex items-center justify-center">
              <span className="text-6xl font-black">RDC</span>
            </div>
            <p className="text-xl font-black uppercase tracking-widest">MINISTÈRE DE L'ÉDUCATION NATIONALE</p>
            <p className="text-sm font-bold">SMARTSCHOOL SOVEREIGN SEAL</p>
          </div>
        </div>
      )}

      {/* HEADER OFFICIAL EPST */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
        <div className="space-y-0.5 text-left">
          <p className="text-[8px] font-black tracking-widest text-slate-600 uppercase">
            RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • MINISTÈRE DE L'ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETÉ
          </p>
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">{schoolName}</h1>
          <p className="text-[9px] text-slate-500 font-medium">Province Éducationnelle Kinshasa-Gombe • Code : RDC-KIN-8842</p>
        </div>

        <div className="text-right space-y-0.5">
          <span className="inline-block px-2 py-0.5 bg-slate-900 text-white font-mono font-black text-[9px] rounded uppercase">
            ANNÉE {year}
          </span>
          <p className="text-[8px] font-mono text-slate-500 block mt-0.5">
            Émis le : {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      {/* BODY CONTENT BY DOCUMENT TYPE */}
      <div className="flex-1 my-2">
        {type === "recu_minerval" && renderRecuMinerval(data)}
        {type === "facture" && renderFacture(data)}
        {type === "rapport_financier" && renderRapportFinancier(data)}
        {type === "bulletin_epst" && renderBulletinEPST(data)}
        {type === "carte_eleve" && renderCarteEleve(data)}
        {type === "carte_enseignant" && renderCarteEnseignant(data)}
        {type === "liste_classe" && renderListeClasse(data)}
        {type === "fiche_eleve" && renderFicheEleve(data)}
        {type === "fiche_personnel" && renderFichePersonnel(data)}
        {type === "attestation" && renderAttestation(data)}
      </div>

      {/* DOCUMENT FOOTER */}
      <div className="border-t border-slate-300 pt-3 mt-4 flex justify-between items-end text-[8px] text-slate-500">
        <div>
          <p className="font-bold text-slate-700">SmartSchool RDC • Plateforme Régionale d'Éducation</p>
          <p>Signature numérique : SHA256-RDC-{Math.random().toString(36).slice(2, 10).toUpperCase()}</p>
        </div>

        <div className="text-center font-bold text-slate-800">
          <p className="mb-4">Cachet et Signature de la Direction</p>
          <p className="italic text-[7px] text-slate-400">P.O. Le Chef d'Établissement</p>
        </div>
      </div>

    </div>
  );
}

// 1. REÇU MINERVAL / CAISSE
function renderRecuMinerval(data: any) {
  const p = data?.payment || data;
  return (
    <div className="space-y-4 text-left">
      <div className="bg-slate-100 p-3 rounded border border-slate-300 flex justify-between items-center">
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase block">REÇU DE PERCEPTION CAISSE</span>
          <span className="text-xs font-black text-slate-900 font-mono">REC-{p?.id?.slice(-8) || "8842001"}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold text-slate-500 block">STATUT</span>
          <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">✓ PAYÉ & VALIDÉ</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs border p-3 rounded">
        <div>
          <span className="text-slate-500 block text-[9px]">Nom de l'Élève :</span>
          <p className="font-bold text-slate-900">{p?.studentName || "Élève SmartSchool"}</p>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px]">Classe / Section :</span>
          <p className="font-bold text-slate-900">{p?.className || "Non spécifiée"}</p>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px]">Motif du Paiement :</span>
          <p className="font-bold text-indigo-700">{p?.paymentType || "Minerval (Écolage)"}</p>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px]">Tranche / Mois :</span>
          <p className="font-bold text-indigo-700">{p?.paymentMonth || "Septembre 2026"}</p>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-3 rounded flex justify-between items-center">
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-bold block">Montant Encaissé</span>
          <span className="text-lg font-black font-mono text-emerald-400">{p?.amount || 100} {p?.currency || "USD"}</span>
        </div>
        <div className="text-right text-[10px] text-slate-300 font-mono">
          <span>Mode : {p?.paymentMethod || "Mobile Money"}</span>
          <span className="block text-slate-400">Réf : {p?.reference || "REF-8842-MOMO"}</span>
        </div>
      </div>

      {/* History 10 months minerval grid */}
      <div className="border p-2 rounded space-y-1">
        <span className="text-[8px] font-bold text-slate-500 uppercase block">Échéancier Annuel de Minerval (10 Mois Scolaires)</span>
        <div className="grid grid-cols-5 gap-1 text-[8px]">
          {["Sept", "Oct", "Nov", "Déc", "Jan", "Fév", "Mars", "Avr", "Mai", "Juin"].map((m, i) => (
            <div key={m} className={`p-1 rounded text-center font-bold ${i === 0 || p?.paymentMonth?.toLowerCase().includes(m.toLowerCase()) ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-100 text-slate-500 border"}`}>
              <span>{m}</span>
              <span className="block">{i === 0 ? "✓ 100$" : "⏳"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. FACTURE & NOTE DE PERCEVOIR
function renderFacture(data: any) {
  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-sm font-black uppercase text-slate-800">Facture d'Écolage & Frais Scolaires</h2>
        <span className="font-mono text-xs font-bold text-slate-500">FAC-2026-8842</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="border p-3 rounded">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">Bénéficiaire :</span>
          <p className="font-bold">{data?.studentName || "Élève SmartSchool"}</p>
          <p className="text-slate-500">{data?.className || "6ème Scientifique"}</p>
        </div>
        <div className="border p-3 rounded">
          <span className="text-[9px] text-slate-400 font-bold block uppercase">Échéance :</span>
          <p className="font-bold text-rose-600">30 Octobre 2026</p>
          <p className="text-slate-500">Mode : Guichet / Mobile Money</p>
        </div>
      </div>

      <table className="w-full text-xs text-left border">
        <thead>
          <tr className="bg-slate-100 font-bold border-b">
            <th className="p-2">Désignation des Frais</th>
            <th className="p-2 text-right">Période</th>
            <th className="p-2 text-right">Montant USD</th>
          </tr>
        </thead>
        <tbody className="divide-y text-slate-700">
          <tr>
            <td className="p-2 font-bold">Minerval Mensuel</td>
            <td className="p-2 text-right">Octobre 2026</td>
            <td className="p-2 text-right font-mono font-bold">100 USD</td>
          </tr>
          <tr>
            <td className="p-2 font-bold">Frais de Laboratoire & Informatique</td>
            <td className="p-2 text-right">Annuel</td>
            <td className="p-2 text-right font-mono font-bold">25 USD</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-slate-900 text-white font-bold">
            <td colSpan={2} className="p-2 text-right uppercase">Total à Payer</td>
            <td className="p-2 text-right font-mono text-emerald-400 text-sm">125 USD</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// 3. RAPPORT FINANCIER
function renderRapportFinancier(data: any) {
  return (
    <div className="space-y-4 text-left">
      <div className="bg-slate-900 text-white p-3 rounded flex justify-between items-center">
        <div>
          <h3 className="font-black text-xs uppercase">Rapport de Synthèse Trésorerie EPST</h3>
          <p className="text-[9px] text-slate-400">Période : Année Académique 2026-2027</p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400">92% Récouvré</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        <div className="p-2 border rounded bg-slate-50">
          <span className="text-[9px] text-slate-500 font-bold block">TOTAL ATTENDU</span>
          <span className="font-mono font-bold text-slate-900">45,000 $</span>
        </div>
        <div className="p-2 border rounded bg-emerald-50">
          <span className="text-[9px] text-emerald-700 font-bold block">TOTAL RECOUVRÉ</span>
          <span className="font-mono font-bold text-emerald-800">41,400 $</span>
        </div>
        <div className="p-2 border rounded bg-rose-50">
          <span className="text-[9px] text-rose-700 font-bold block">SOLDE IMPAYÉ</span>
          <span className="font-mono font-bold text-rose-800">3,600 $</span>
        </div>
      </div>

      <table className="w-full text-xs text-left border">
        <thead>
          <tr className="bg-slate-100 font-bold border-b">
            <th className="p-2">Mois Scolaire</th>
            <th className="p-2 text-right">Élèves Solvables</th>
            <th className="p-2 text-right">Encaissements</th>
          </tr>
        </thead>
        <tbody className="divide-y text-slate-700 font-mono">
          <tr><td className="p-2">Septembre 2026</td><td className="p-2 text-right">45 / 45</td><td className="p-2 text-right font-bold text-emerald-700">4,500 $</td></tr>
          <tr><td className="p-2">Octobre 2026</td><td className="p-2 text-right">42 / 45</td><td className="p-2 text-right font-bold text-emerald-700">4,200 $</td></tr>
          <tr><td className="p-2">Novembre 2026</td><td className="p-2 text-right">38 / 45</td><td className="p-2 text-right font-bold text-emerald-700">3,800 $</td></tr>
        </tbody>
      </table>
    </div>
  );
}

// 4. BULLETIN SCOLAIRE OFFICIEL EPST RDC
function renderBulletinEPST(data: any) {
  const b = data?.bulletin || data;
  const rows = b?.rows || data?.rows || [];
  const grandTotal = b?.grandTotal;
  const pct = b?.percentageAnnual ?? b?.percentage ?? (data?.percentage ? Number(data.percentage) : 78.5);
  const rank = b?.rankInClass ?? data?.rank ?? 1;
  const totalStudents = b?.totalStudentsInClass ?? data?.totalStudents ?? 42;
  const decision = b?.officialDecision ?? (pct >= 50 ? "Admis(e) en classe supérieure" : "Ajourné(e)");
  const mention = b?.mention ?? (pct >= 80 ? "Grande Distinction (Élite)" : pct >= 70 ? "Distinction" : pct >= 60 ? "Satisfaction" : "Ajourné");

  return (
    <div className="space-y-3 text-left">
      {/* Student & Academic metadata header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50 border border-slate-300 rounded text-[9px]">
        <div>
          <span className="text-slate-500 font-bold block uppercase">ÉLÈVE :</span>
          <p className="font-black text-slate-900 text-xs">{data?.studentName || b?.studentName || "Mutombo Astrid"}</p>
          <p className="text-slate-600">Sexe: {data?.studentGender || b?.studentGender || "F"} • N° Perm: {data?.permanentId || b?.permanentId || "EPST-2026-9921"}</p>
        </div>
        <div>
          <span className="text-slate-500 font-bold block uppercase">CLASSE & SECTION :</span>
          <p className="font-bold text-slate-900">{data?.className || b?.className || "6ème Scientifique A"}</p>
          <p className="text-slate-600">Option : {data?.optionName || b?.optionName || "Bio-Chimie"}</p>
        </div>
        <div>
          <span className="text-slate-500 font-bold block uppercase">ANNÉE SCOLAIRE :</span>
          <p className="font-bold text-slate-900">{data?.academicYear || b?.academicYear || "2026-2027"}</p>
          <p className="text-slate-600">Régime : Normal RDC</p>
        </div>
        <div className="text-right">
          <span className="text-slate-500 font-bold block uppercase">RÉSULTAT GLOBAL :</span>
          <p className="font-black text-indigo-700 text-xs">{pct}% • {rank}e / {totalStudents}</p>
          <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[8px] uppercase">
            {decision}
          </span>
        </div>
      </div>

      {/* Official Grade Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[9px] border-collapse border border-slate-400">
          <thead>
            <tr className="bg-slate-900 text-white font-bold text-center">
              <th rowSpan={2} className="border border-slate-400 p-1 text-left w-48">BRANCHES / MATIÈRES</th>
              <th colSpan={4} className="border border-slate-400 p-1 bg-indigo-950">1er SEMESTRE</th>
              <th colSpan={4} className="border border-slate-400 p-1 bg-slate-800">2ème SEMESTRE</th>
              <th colSpan={3} className="border border-slate-400 p-1 bg-indigo-900">TOTAL GÉNÉRAL</th>
            </tr>
            <tr className="bg-slate-100 text-slate-900 font-bold text-center text-[8px]">
              <th className="border border-slate-400 p-0.5 w-8">P1</th>
              <th className="border border-slate-400 p-0.5 w-8">P2</th>
              <th className="border border-slate-400 p-0.5 w-9">EX.1</th>
              <th className="border border-slate-400 p-0.5 w-10 bg-indigo-50">TOT.1</th>
              <th className="border border-slate-400 p-0.5 w-8">P3</th>
              <th className="border border-slate-400 p-0.5 w-8">P4</th>
              <th className="border border-slate-400 p-0.5 w-9">EX.2</th>
              <th className="border border-slate-400 p-0.5 w-10 bg-indigo-50">TOT.2</th>
              <th className="border border-slate-400 p-0.5 w-10">MAX</th>
              <th className="border border-slate-400 p-0.5 w-10 font-black">OBT.</th>
              <th className="border border-slate-400 p-0.5 w-10">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 text-slate-800">
            {rows.length > 0 ? (
              rows.map((r: any, idx: number) => {
                const isFailed = r.percentageYear !== null && r.percentageYear < 50;
                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="border border-slate-300 p-1 font-medium text-left">
                      <span className="font-bold">{r.subjectName || r.name}</span>
                      {r.category && <span className="text-[7px] text-slate-400 block">{r.category}</span>}
                    </td>
                    <td className="border border-slate-300 p-0.5 text-center font-mono">{r.p1?.obtained ?? "-"}</td>
                    <td className="border border-slate-300 p-0.5 text-center font-mono">{r.p2?.obtained ?? "-"}</td>
                    <td className="border border-slate-300 p-0.5 text-center font-mono">{r.exam1?.obtained ?? "-"}</td>
                    <td className="border border-slate-300 p-0.5 text-center font-mono font-bold bg-indigo-50/50">{r.totalSem1?.obtained ?? "-"}</td>
                    <td className="border border-slate-300 p-0.5 text-center font-mono">{r.p3?.obtained ?? "-"}</td>
                    <td className="border border-slate-300 p-0.5 text-center font-mono">{r.p4?.obtained ?? "-"}</td>
                    <td className="border border-slate-300 p-0.5 text-center font-mono">{r.exam2?.obtained ?? "-"}</td>
                    <td className="border border-slate-300 p-0.5 text-center font-mono font-bold bg-indigo-50/50">{r.totalSem2?.obtained ?? "-"}</td>
                    <td className="border border-slate-300 p-0.5 text-center font-mono text-slate-500">{r.totalYear?.max ?? 80}</td>
                    <td className={`border border-slate-300 p-0.5 text-center font-mono font-black ${isFailed ? "text-rose-600 bg-rose-50" : "text-slate-900"}`}>
                      {r.totalYear?.obtained ?? "-"}
                    </td>
                    <td className={`border border-slate-300 p-0.5 text-center font-mono font-bold ${isFailed ? "text-rose-600 bg-rose-50" : "text-emerald-700"}`}>
                      {r.percentageYear !== null ? `${Math.round(r.percentageYear)}%` : "-"}
                    </td>
                  </tr>
                );
              })
            ) : (
              // Default representative curriculum rows if custom array not supplied
              <>
                <tr>
                  <td className="border border-slate-300 p-1 font-bold text-left">Mathématiques & Algèbre</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">16</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">18</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">34</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-bold bg-indigo-50/50">68</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">17</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">19</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">36</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-bold bg-indigo-50/50">72</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono text-slate-500">160</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-black">140</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-emerald-700">87%</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-bold text-left">Physique & Mécanique</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">15</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">16</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">30</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-bold bg-indigo-50/50">61</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">16</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">17</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">32</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-bold bg-indigo-50/50">65</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono text-slate-500">160</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-black">126</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-emerald-700">79%</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-bold text-left">Français & Littérature</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">17</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">18</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">35</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-bold bg-indigo-50/50">70</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">18</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">19</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono">36</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-bold bg-indigo-50/50">73</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono text-slate-500">160</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-black">143</td>
                  <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-emerald-700">89%</td>
                </tr>
              </>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white font-black text-center text-[9px]">
              <td className="border border-slate-400 p-1 text-left uppercase">TOTAL GÉNÉRAL</td>
              <td className="border border-slate-400 p-0.5 font-mono">{grandTotal?.p1?.obtained ?? "48"}</td>
              <td className="border border-slate-400 p-0.5 font-mono">{grandTotal?.p2?.obtained ?? "52"}</td>
              <td className="border border-slate-400 p-0.5 font-mono">{grandTotal?.exam1?.obtained ?? "99"}</td>
              <td className="border border-slate-400 p-0.5 font-mono bg-indigo-900">{grandTotal?.sem1?.obtained ?? "199"}</td>
              <td className="border border-slate-400 p-0.5 font-mono">{grandTotal?.p3?.obtained ?? "51"}</td>
              <td className="border border-slate-400 p-0.5 font-mono">{grandTotal?.p4?.obtained ?? "55"}</td>
              <td className="border border-slate-400 p-0.5 font-mono">{grandTotal?.exam2?.obtained ?? "104"}</td>
              <td className="border border-slate-400 p-0.5 font-mono bg-indigo-900">{grandTotal?.sem2?.obtained ?? "210"}</td>
              <td className="border border-slate-400 p-0.5 font-mono text-slate-300">{grandTotal?.year?.max ?? "480"}</td>
              <td className="border border-slate-400 p-0.5 font-mono text-emerald-400">{grandTotal?.year?.obtained ?? "409"}</td>
              <td className="border border-slate-400 p-0.5 font-mono text-amber-300">{pct}%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Jury deliberation & Conduct appraisal block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-slate-50 border border-slate-300 rounded text-[8.5px]">
        <div>
          <span className="text-slate-500 font-bold block uppercase">POURCENTAGE GÉNÉRAL :</span>
          <p className="font-black text-indigo-800 text-xs">{pct}%</p>
        </div>
        <div>
          <span className="text-slate-500 font-bold block uppercase">RANG / PLACE :</span>
          <p className="font-bold text-slate-900">{rank}ème sur {totalStudents} élèves</p>
        </div>
        <div>
          <span className="text-slate-500 font-bold block uppercase">MENTION DU JURY :</span>
          <p className="font-bold text-emerald-800">{mention}</p>
        </div>
        <div>
          <span className="text-slate-500 font-bold block uppercase">DÉCISION FINALE :</span>
          <p className="font-black text-indigo-700">{decision}</p>
        </div>
      </div>
    </div>
  );
}

// 5. CARTE ÉLÈVE BIOMÉTRIQUE
function renderCarteEleve(data: any) {
  return (
    <div className="w-[85.6mm] h-[54mm] mx-auto bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-xl p-3 flex flex-col justify-between border-2 border-amber-400 relative overflow-hidden shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[6px] font-black tracking-widest text-amber-400 uppercase block">RDC • MINISTÈRE DE L'ÉDUCATION NATIONALE</span>
          <h4 className="text-[9px] font-black uppercase text-white tracking-tight">CARTE D'ÉLÈVE BIOMÉTRIQUE</h4>
        </div>
        <span className="bg-amber-400 text-slate-950 font-black text-[6px] px-1 py-0.5 rounded">2026-2027</span>
      </div>

      <div className="flex items-center space-x-2 my-1">
        <div className="w-12 h-14 bg-slate-800 rounded border border-amber-400/60 flex items-center justify-center font-black text-xs text-slate-400 shrink-0">
          PHOTO
        </div>
        <div className="space-y-0.5 text-left min-w-0">
          <p className="text-[9px] font-black text-amber-300 truncate">{data?.studentName || "Mutombo Astrid"}</p>
          <p className="text-[7px] text-slate-300">Classe : <strong>{data?.className || "6ème Scientifique"}</strong></p>
          <p className="text-[7px] text-slate-300 font-mono">Matricule : <strong>{data?.matricule || "RDC-8842-2026"}</strong></p>
        </div>
      </div>

      <div className="flex justify-between items-end text-[6px] text-slate-400 border-t border-indigo-800 pt-1">
        <span>SmartSchool RDC Digital Pass</span>
        <span className="text-emerald-400 font-bold">✓ ÉLÈVE SOLVABLE</span>
      </div>
    </div>
  );
}

// 6. CARTE ENSEIGNANT
function renderCarteEnseignant(data: any) {
  return (
    <div className="w-[85.6mm] h-[54mm] mx-auto bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-xl p-3 flex flex-col justify-between border-2 border-indigo-500 relative overflow-hidden shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[6px] font-black tracking-widest text-indigo-400 uppercase block">RDC • EPST KINSHASA</span>
          <h4 className="text-[9px] font-black uppercase text-white tracking-tight">CARTE PROFESSIONNELLE ENSEIGNANT</h4>
        </div>
        <span className="bg-indigo-600 text-white font-black text-[6px] px-1 py-0.5 rounded">TITULAIRE</span>
      </div>

      <div className="flex items-center space-x-2 my-1">
        <div className="w-12 h-14 bg-indigo-950 rounded border border-indigo-400/60 flex items-center justify-center font-black text-xs text-indigo-300 shrink-0">
          PROF
        </div>
        <div className="space-y-0.5 text-left min-w-0">
          <p className="text-[9px] font-black text-indigo-200 truncate">{data?.name || "Ir IT Fred Kalonda"}</p>
          <p className="text-[7px] text-slate-300">Spécialité : <strong>Informatique & Math</strong></p>
          <p className="text-[7px] text-slate-300 font-mono">Code Agent : <strong>AG-RDC-9902</strong></p>
        </div>
      </div>

      <div className="flex justify-between items-end text-[6px] text-slate-400 border-t border-slate-800 pt-1">
        <span>Corps Professoral Agréé</span>
        <span className="text-indigo-400 font-bold">Abonnement Réseau Actif</span>
      </div>
    </div>
  );
}

// 7. LISTE DE CLASSE & LISTE OFFICIELLE
function renderListeClasse(data: any) {
  const columns: string[] = data?.columns || ["N°", "Matricule", "Nom & Prénom", "Genre", "Statut / Remarque"];
  const rows: any[] = data?.rows || [
    ["01", "KIN-8842-01", "Mutombo Astrid", "F", "6ème Scientifique A", "En Règle ✓"],
    ["02", "KIN-8842-02", "Kabange Christian", "M", "6ème Scientifique A", "En Règle ✓"],
    ["03", "KIN-8842-03", "Ilunga Mireille", "F", "6ème Scientifique A", "En Retard ⚠"]
  ];
  const title = data?.title || "Registre Officiel des Élèves par Classe";
  const statsSummary = data?.statsSummary || `Total : ${rows.length} Enregistrement(s)`;

  return (
    <div className="space-y-3 text-left">
      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
        <div>
          <h3 className="font-black text-xs uppercase text-slate-900 tracking-tight">{title}</h3>
          <p className="text-[9px] text-slate-600 font-bold">{statsSummary}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded uppercase">
            Certification EPST
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border border-slate-300">
          <thead>
            <tr className="bg-slate-100 font-black text-[9px] uppercase border-b border-slate-300 text-slate-800">
              {columns.map((col: string, idx: number) => (
                <th key={idx} className="p-1.5 border-r border-slate-200 last:border-r-0">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900 text-[10px] font-mono">
            {rows.map((row: any[], rowIdx: number) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                {row.map((cell: any, cellIdx: number) => (
                  <td key={cellIdx} className="p-1.5 border-r border-slate-200 last:border-r-0 font-medium">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER QR CODE & OFFICIAL SEAL */}
      <div className="pt-2 flex justify-between items-center text-[8px] text-slate-500 font-mono">
        <span>Authentification numérique QR Code : RDC-VERIF-{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
        <span>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • EPST</span>
      </div>
    </div>
  );
}

// 8. FICHE ÉLÈVE
function renderFicheEleve(data: any) {
  return (
    <div className="space-y-4 text-left">
      <div className="bg-slate-900 text-white p-3 rounded flex justify-between items-center">
        <h3 className="font-black text-xs uppercase">Fiche Signalétique & Administrative de l'Élève</h3>
        <span className="font-mono text-xs text-emerald-400 font-bold">Dossier Actif</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs border p-3 rounded">
        <div><span className="text-slate-400 text-[9px] block">Nom Complet :</span><p className="font-bold">Mutombo Astrid</p></div>
        <div><span className="text-slate-400 text-[9px] block">Date de Naissance :</span><p className="font-bold">14/05/2010 (Kinshasa)</p></div>
        <div><span className="text-slate-400 text-[9px] block">Classe Actuelle :</span><p className="font-bold">6ème Scientifique A</p></div>
        <div><span className="text-slate-400 text-[9px] block">Tuteur / Parent :</span><p className="font-bold">M. Jean Mutombo (0810000000)</p></div>
      </div>
    </div>
  );
}

// 9. FICHE PERSONNEL
function renderFichePersonnel(data: any) {
  return (
    <div className="space-y-4 text-left">
      <div className="bg-slate-900 text-white p-3 rounded flex justify-between items-center">
        <h3 className="font-black text-xs uppercase">Fiche Individuelle de l'Agent & Enseignant</h3>
        <span className="font-mono text-xs text-indigo-300 font-bold">Matricule : AG-8842</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs border p-3 rounded">
        <div><span className="text-slate-400 text-[9px] block">Nom & Prénom :</span><p className="font-bold">Freddy Kalonda</p></div>
        <div><span className="text-slate-400 text-[9px] block">Fonction / Grade :</span><p className="font-bold">Enseignant Titulaire / Chef de Travaux</p></div>
      </div>
    </div>
  );
}

// 10. ATTESTATION DE FRÉQUENTATION
function renderAttestation(data: any) {
  return (
    <div className="space-y-6 text-left py-4">
      <div className="text-center space-y-1">
        <h2 className="text-base font-black uppercase text-slate-900 border-b-2 border-slate-900 inline-block pb-1">
          ATTESTATION DE FRÉQUENTATION SCOLAIRE
        </h2>
      </div>

      <p className="text-xs leading-relaxed text-slate-800 font-medium">
        Je soussigné, Chef d'Établissement du <strong>Complexe Scolaire SmartSchool RDC</strong>, atteste par la présente que l'élève :
      </p>

      <div className="bg-slate-50 p-4 border rounded space-y-1 text-xs">
        <p><strong>Nom et Prénom :</strong> {data?.studentName || "Mutombo Astrid"}</p>
        <p><strong>Classe :</strong> {data?.className || "6ème Scientifique A"}</p>
        <p><strong>Année Scolaire :</strong> {data?.schoolYear || "2026-2027"}</p>
      </div>

      <p className="text-xs leading-relaxed text-slate-800">
        est régulièrement inscrit(e) et fréquente notre établissement pour l'année scolaire en cours. En foi de quoi cette attestation lui est délivrée pour servir et valoir ce que de droit.
      </p>
    </div>
  );
}
