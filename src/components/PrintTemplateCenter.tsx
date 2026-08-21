import React, { useState } from "react";
import { 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  Building2, 
  Sliders, 
  CheckCircle2, 
  Layout, 
  Eye, 
  FileSignature, 
  Award, 
  Sparkles,
  Download,
  Check,
  RotateCcw
} from "lucide-react";
import { useSmartSchoolCore } from "../context/SmartSchoolCoreContext";
import { PrintTemplateConfig, DEFAULT_PRINT_TEMPLATE } from "../services/exportService";

export function PrintTemplateCenter() {
  const { 
    printConfig, 
    updatePrintConfig, 
    exportTableExcel, 
    exportTablePDF, 
    printDedicatedTable 
  } = useSmartSchoolCore();

  const [formState, setFormState] = useState<PrintTemplateConfig>(printConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrintConfig(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Voulez-vous réinitialiser tous les paramètres d'impression aux normes officielles MINEPSP RDC ?")) {
      setFormState(DEFAULT_PRINT_TEMPLATE);
      updatePrintConfig(DEFAULT_PRINT_TEMPLATE);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Sample data for live preview
  const previewHeaders = ["N°", "Matricule", "Nom & Prénom", "Sexe", "Classe", "Téléphone", "Statut"];
  const previewRows = [
    ["1", "2026-KIN-001", "KABAMBA MUKENDI Jean", "M", "6ème Scientifique A", "+243 81 223 3445", "Actif"],
    ["2", "2026-KIN-002", "TSHILOMBA MWAMBA Grace", "F", "6ème Scientifique A", "+243 82 990 1122", "Actif"],
    ["3", "2026-KIN-003", "NSIMBA LUZOLO Divine", "F", "3ème Primaire A", "+243 85 443 2211", "Actif"]
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Printer className="h-64 w-64 text-indigo-400" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600/30 border border-indigo-400/40 rounded-2xl text-indigo-300">
              <Printer className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black uppercase tracking-wider">Centre de Modèles d'Impression & Exports</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold rounded-full uppercase">
                  Conforme MINEPSP RDC
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Personnalisez les en-têtes, logos, sceaux, signatures et colonnes pour toutes les impressions et exportations (PDF & Excel) de votre établissement.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetToDefaults}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Réinitialiser MINEPSP</span>
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer uppercase tracking-wider"
            >
              <Save className="h-4 w-4" />
              <span>{saveSuccess ? "Enregistré !" : "Enregistrer les Paramètres"}</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center space-x-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>Configuration d'impression enregistrée avec succès ! Tous les rapports, bulletins, listes et fichiers exportés utiliseront désormais ces paramètres.</span>
        </div>
      )}

      {/* GRID CONFIG & PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FORM SETTINGS (7 COLS) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: ÉTABLISSEMENT & EN-TÊTE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                1. Identité Officielle de l'Établissement (En-tête)
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nom Officiel de l'Établissement Scolaire
                </label>
                <input
                  type="text"
                  required
                  value={formState.schoolName}
                  onChange={(e) => setFormState({ ...formState, schoolName: e.target.value })}
                  placeholder="EX: COMPLEXE SCOLAIRE SMARTSCHOOL RDC"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Devise de l'Établissement
                  </label>
                  <input
                    type="text"
                    value={formState.schoolMotto}
                    onChange={(e) => setFormState({ ...formState, schoolMotto: e.target.value })}
                    placeholder="Paix - Discipline - Travail"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Province & District EPST
                  </label>
                  <input
                    type="text"
                    value={formState.province}
                    onChange={(e) => setFormState({ ...formState, province: e.target.value })}
                    placeholder="Kinshasa / Lukunga"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Adresse Physique
                  </label>
                  <input
                    type="text"
                    value={formState.address}
                    onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                    placeholder="Av. Enseignement N° 45, Gombe"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone de Contact
                  </label>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="+243 81 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Année Scolaire en Cours
                  </label>
                  <input
                    type="text"
                    value={formState.schoolYear}
                    onChange={(e) => setFormState({ ...formState, schoolYear: e.target.value })}
                    placeholder="2025-2026"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Code de Conformité MINEPSP
                  </label>
                  <input
                    type="text"
                    value={formState.minepspConformityCode}
                    onChange={(e) => setFormState({ ...formState, minepspConformityCode: e.target.value })}
                    placeholder="MINEPSP/SG/80/2026-RDC"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DISPOSITION, PAGES & COULEURS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layout className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                2. Format, Orientation & Colonnes Visibles
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Format de Papier Défaut
                </label>
                <select
                  value={formState.defaultFormat}
                  onChange={(e) => setFormState({ ...formState, defaultFormat: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                >
                  <option value="A4">A4 Standard (210 x 297 mm)</option>
                  <option value="A5">A5 Étroit (148 x 210 mm)</option>
                  <option value="Carte">Carte d'Élève (85.6 x 53.98 mm)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Orientation par Défaut
                </label>
                <select
                  value={formState.defaultOrientation}
                  onChange={(e) => setFormState({ ...formState, defaultOrientation: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                >
                  <option value="portrait">Portrait (Vertical)</option>
                  <option value="landscape">Paysage (Horizontal - Recommandé pour grands tableaux)</option>
                </select>
              </div>
            </div>

            {/* CHECKBOXES COLUMNS */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2 text-xs uppercase tracking-wider">
                Champs / Colonnes à afficher sur les tableaux :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { key: "showMatricule", label: "Matricule" },
                  { key: "showPhoto", label: "Photo d'identité" },
                  { key: "showPhone", label: "Téléphone Contact" },
                  { key: "showAddress", label: "Adresse physique" },
                  { key: "showStatus", label: "Statut d'inscription/embauche" },
                  { key: "showRegistrationDate", label: "Date d'enregistrement" }
                ].map((col) => (
                  <label key={col.key} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formState as any)[col.key]}
                      onChange={(e) => setFormState({ ...formState, [col.key]: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: SIGNATURES & SCEAU */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileSignature className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                3. Pied de Page, Signatures & Sceau Officiel
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Signataire 1 (Titulaire)
                </label>
                <input
                  type="text"
                  value={formState.signatory1Title}
                  onChange={(e) => setFormState({ ...formState, signatory1Title: e.target.value })}
                  placeholder="Titres ex: Le Chef d'Établissement / Préfet"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none font-medium"
                />
                <input
                  type="text"
                  value={formState.signatory1Name}
                  onChange={(e) => setFormState({ ...formState, signatory1Name: e.target.value })}
                  placeholder="Nom ex: Prof. Ir. Mbemba Dieudonné"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Signataire 2 (Ajustable)
                </label>
                <input
                  type="text"
                  value={formState.signatory2Title}
                  onChange={(e) => setFormState({ ...formState, signatory2Title: e.target.value })}
                  placeholder="Titres ex: Le Secrétaire de Direction"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none font-medium"
                />
                <input
                  type="text"
                  value={formState.signatory2Name}
                  onChange={(e) => setFormState({ ...formState, signatory2Name: e.target.value })}
                  placeholder="Nom ex: Mme Kanku Marie-Louise"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.showStamp}
                  onChange={(e) => setFormState({ ...formState, showStamp: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Afficher le Filigrane & Sceau d'Établissement</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Ajoute un rectangle officiel estampillé "SCEAU DE L'ÉTABLISSEMENT - VALIDE POUR TOUS DROITS".</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider text-sm"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer Tous les Paramètres d'Impression</span>
          </button>
        </form>

        {/* RIGHT COLUMN: LIVE SPECIMEN PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Aperçu Spécimen en Temps Réel
                </h3>
              </div>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase">
                {formState.defaultFormat} • {formState.defaultOrientation}
              </span>
            </div>

            {/* LIVE DOCUMENT CANVAS */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] space-y-3 font-sans">
              
              {/* SPECIMEN HEADER */}
              <div className="border-b-2 border-indigo-600 pb-2">
                <div className="text-[8px] font-bold text-slate-500 uppercase">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</div>
                <div className="font-black text-indigo-700 dark:text-indigo-400 text-xs uppercase leading-tight mt-0.5">
                  {formState.schoolName || "SMARTSCHOOL RDC"}
                </div>
                <div className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Province : {formState.province} • Devise : "{formState.schoolMotto}"
                </div>
                <div className="text-[8.5px] text-slate-500 mt-0.5">
                  Année Scolaire : {formState.schoolYear} • Tél : {formState.phone}
                </div>
              </div>

              {/* SPECIMEN TITLE */}
              <div className="bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded border border-indigo-200 dark:border-indigo-900 font-bold text-slate-900 dark:text-white text-center uppercase tracking-wider text-[11px]">
                SPÉCIMEN LISTE OFFICIELLE DES ÉLÈVES
              </div>

              {/* SPECIMEN TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left border border-slate-300 dark:border-slate-700">
                  <thead>
                    <tr className="bg-indigo-600 text-white font-bold text-[9px]">
                      {previewHeaders.map((h, i) => (
                        <th key={i} className="p-1 border border-indigo-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="even:bg-slate-100 dark:even:bg-slate-900/50">
                        {r.map((c, j) => (
                          <td key={j} className="p-1 border border-slate-200 dark:border-slate-800">{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SPECIMEN STAMP & SIGNATURES */}
              <div className="flex justify-between items-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <div className="font-bold text-[8.5px] text-slate-600 dark:text-slate-400">{formState.signatory2Title}</div>
                  <div className="text-slate-400 mt-3 font-semibold">{formState.signatory2Name}</div>
                </div>

                {formState.showStamp && (
                  <div className="border border-dashed border-indigo-500 text-indigo-600 dark:text-indigo-400 px-2 py-1 text-center font-bold text-[8px] rounded">
                    SCEAU ÉTABLISSEMENT
                  </div>
                )}

                <div className="text-right">
                  <div className="font-bold text-[8.5px] text-slate-600 dark:text-slate-400">{formState.signatory1Title}</div>
                  <div className="text-slate-400 mt-3 font-semibold">{formState.signatory1Name}</div>
                </div>
              </div>

            </div>

            {/* TEST ACTION BUTTONS */}
            <div className="pt-4 space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tester les générateurs d'impression :
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => printDedicatedTable("LISTE SPÉCIMEN DES ÉLÈVES", previewHeaders, previewRows, "Test Moteur d'Impression SmartSchool RDC")}
                  className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimer</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportTablePDF("LISTE SPÉCIMEN DES ÉLÈVES", previewHeaders, previewRows, "Specimen_Impression_SmartSchool", "Directeur", formState.defaultOrientation)}
                  className="py-2 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Test PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportTableExcel("LISTE SPÉCIMEN DES ÉLÈVES", previewHeaders, previewRows, "Specimen_Impression_SmartSchool", "Directeur")}
                  className="py-2 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Test Excel</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
