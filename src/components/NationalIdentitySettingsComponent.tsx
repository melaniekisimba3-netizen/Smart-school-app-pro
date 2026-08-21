import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Upload, 
  Link as LinkIcon, 
  Grid, 
  RefreshCw, 
  Check, 
  X, 
  Eye, 
  FileText, 
  Award, 
  History, 
  Sparkles, 
  AlertTriangle, 
  Flag, 
  Landmark, 
  Image as ImageIcon, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  Info,
  CreditCard,
  FileCheck,
  Building,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NationalIdentitySettings, NationalIdentityAuditLog } from "../types";
import { safeLocalStorage } from "../utils/safeStorage";

// DEFAULT OFFICIAL RDC SYSTEM ASSETS & TEXTS
export const DEFAULT_NATIONAL_IDENTITY: NationalIdentitySettings = {
  platformLogoUrl: "/branding/smartschool-rdc-logo.png",
  faviconUrl: "/branding/smartschool-rdc-logo.png",
  drapeauUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/512px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png",
  armoiriesUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png",
  epstLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/320px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png",
  platformName: "SmartSchool RDC",
  platformSlogan: "Système National Intégré de Gestion Scolaire & Éducationnelle — FRED-TECH",
  lastUpdated: "2026-08-18 12:00",
  updatedBy: "Ir IT Fred Kalonda (Propriétaire)"
};

// PRESET OFFICIAL SYSTEM LIBRARY ASSETS
export const OFFICIAL_ASSET_LIBRARY = {
  drapeau: [
    { title: "Drapeau Officiel RDC Standard (Vector SVG)", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/512px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png" },
    { title: "Drapeau RDC Haute Définition PNG", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/1024px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png" },
    { title: "Sceau Circulaire Drapeau RDC", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/240px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png" }
  ],
  armoiries: [
    { title: "Armoiries Officielles RDC (Blason Léopard & Tête de Lion)", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png" },
    { title: "Sceau de la République Démocratique du Congo", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/320px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png" },
    { title: "Emblème National Filigrane Transparent", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/240px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png" }
  ],
  epst: [
    { title: "Logo Officiel Ministère EPST / MINEPSP RDC", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/320px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png" },
    { title: "Badge Sceau de l'Inspection Générale EPST", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png" }
  ],
  logo: [
    { title: "Logo Officiel SmartSchool RDC — FRED-TECH (HD)", url: "/branding/smartschool-rdc-logo.png" },
    { title: "Insigne Circulaire SmartSchool RDC", url: "/smartschool-logo.png" }
  ],
  favicon: [
    { title: "Favicon Officiel SmartSchool RDC FRED-TECH", url: "/branding/smartschool-rdc-logo.png" },
    { title: "Favicon Drapeau RDC (32x32 Icon)", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/64px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png" }
  ]
};

interface NationalIdentitySettingsProps {
  currentUserRole?: string;
  currentUserName?: string;
  onUpdateNationalIdentity?: (settings: NationalIdentitySettings) => void;
}

export function NationalIdentitySettingsComponent({
  currentUserRole = "Propriétaire",
  currentUserName = "Propriétaire SmartSchool RDC",
  onUpdateNationalIdentity
}: NationalIdentitySettingsProps) {

  // Verify Owner Access
  const isOwner = currentUserRole.toLowerCase().includes("propriétaire") || 
                  currentUserRole.toLowerCase().includes("proprietaire") ||
                  currentUserRole.toLowerCase().includes("superadmin") ||
                  currentUserRole.toLowerCase().includes("super administrateur") ||
                  currentUserRole.toLowerCase().includes("fondateur");

  // Load Settings from LocalStorage or Defaults
  const [settings, setSettings] = useState<NationalIdentitySettings>(() => {
    const saved = safeLocalStorage.getItem("ss_national_identity_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_NATIONAL_IDENTITY;
  });

  // Active View Tab: "settings" or "previews" or "audit"
  const [activeSubTab, setActiveSubTab] = useState<"settings" | "previews" | "audit">("settings");

  // Input Modes per Asset: "file" | "url" | "library"
  const [inputModes, setInputModes] = useState<Record<string, "file" | "url" | "library">>({
    platformLogoUrl: "url",
    faviconUrl: "url",
    drapeauUrl: "url",
    armoiriesUrl: "url",
    epstLogoUrl: "url"
  });

  // Saved Feedback Banner State
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<NationalIdentityAuditLog[]>(() => {
    const saved = safeLocalStorage.getItem("ss_national_identity_audit_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "id-log-1",
        actorName: "M. le Propriétaire - Direction Générale",
        actorRole: "Propriétaire SmartSchool RDC",
        action: "Initialisation Identité Nationale",
        changedField: "Ensemble des ressources officielles",
        oldValue: "Ressources par défaut RDC",
        newValue: "Ressources officielles MINEPSP / EPST validées",
        timestamp: "2026-08-01 10:00",
        details: "Configuration initiale du drapeau, armoiries, logos et slogans sur toute la plateforme."
      }
    ];
  });

  // Sync Favicon to Browser Tab dynamically
  useEffect(() => {
    if (settings.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings.faviconUrl]);

  // Persist Audit Logs
  useEffect(() => {
    safeLocalStorage.setItem("ss_national_identity_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Log audit helper
  const addAuditEntry = (action: string, changedField: string, oldValue: string, newValue: string, details: string) => {
    const log: NationalIdentityAuditLog = {
      id: `id-log-${Date.now()}`,
      actorName: currentUserName,
      actorRole: currentUserRole,
      action,
      changedField,
      oldValue,
      newValue,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      details
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // Handle Field Value Change
  const handleFieldChange = (field: keyof NationalIdentitySettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Handle File Upload & Convert to Data URL
  const handleFileUpload = (field: keyof NationalIdentitySettings, file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("La taille du fichier ne doit pas dépasser 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        handleFieldChange(field, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save All Changes
  const handleSaveSettings = () => {
    const updatedSettings: NationalIdentitySettings = {
      ...settings,
      lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16),
      updatedBy: currentUserName
    };

    setSettings(updatedSettings);
    safeLocalStorage.setItem("ss_national_identity_settings", JSON.stringify(updatedSettings));

    // Also update individually cached legacy items for backwards compatibility
    safeLocalStorage.setItem("rdc_drapeau_url", updatedSettings.drapeauUrl);
    safeLocalStorage.setItem("rdc_watermark_url", updatedSettings.armoiriesUrl);
    safeLocalStorage.setItem("smartschool_platform_logo_url", updatedSettings.platformLogoUrl);

    // Notify Parent & Broadcast Window Event
    if (onUpdateNationalIdentity) {
      onUpdateNationalIdentity(updatedSettings);
    }
    window.dispatchEvent(new CustomEvent("ss_national_identity_changed", { detail: updatedSettings }));

    addAuditEntry(
      "Mise à jour Identité Nationale",
      "Paramètres globaux de la plateforme",
      "Version précédente",
      updatedSettings.platformName,
      `Mise à jour complète des logos, drapeaux, armoiries et slogans par le Propriétaire.`
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Restore Default Official Assets
  const handleRestoreDefaults = () => {
    if (window.confirm("Êtes-vous sûr de vouloir restaurer les ressources officielles par défaut de la République Démocratique du Congo et de SmartSchool RDC ?")) {
      const defaults = DEFAULT_NATIONAL_IDENTITY;
      setSettings(defaults);
      safeLocalStorage.setItem("ss_national_identity_settings", JSON.stringify(defaults));
      
      safeLocalStorage.setItem("rdc_drapeau_url", defaults.drapeauUrl);
      safeLocalStorage.setItem("rdc_watermark_url", defaults.armoiriesUrl);
      safeLocalStorage.setItem("smartschool_platform_logo_url", defaults.platformLogoUrl);

      if (onUpdateNationalIdentity) {
        onUpdateNationalIdentity(defaults);
      }
      window.dispatchEvent(new CustomEvent("ss_national_identity_changed", { detail: defaults }));

      addAuditEntry(
        "Restauration Ressources Officielle",
        "Ressources Nationales RDC",
        "Personnalisé",
        "Ressources Officielle Répertoire MINEPSP",
        "Réinitialisation complète des images et textes d'identité officielle du système."
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  // If Not Owner, render restricted access banner
  if (!isOwner) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-3xl p-8 text-center space-y-4 my-6 text-left">
        <div className="inline-flex p-4 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-2xl mb-2">
          <Lock className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-black text-red-900 dark:text-red-200 uppercase tracking-tight">
          Accès Restreint - Propriétaire de SmartSchool RDC
        </h3>
        <p className="text-xs text-red-700 dark:text-red-300 max-w-xl mx-auto leading-relaxed">
          Seul le <strong>Propriétaire de SmartSchool RDC</strong> dispose des privilèges de haute souveraineté requis pour modifier le Nom Officiel, le Drapeau, les Armoiries, les Logos Ministériels et le Slogan National de la plateforme.
        </p>
        <div className="pt-2">
          <span className="text-[10px] font-mono font-bold bg-red-200/60 dark:bg-red-900/80 text-red-800 dark:text-red-200 px-3 py-1.5 rounded-lg uppercase">
            Rôle Actuel : {currentUserRole} (Non Autorisé)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left" id="national-identity-settings-module">
      
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Espace Exclusif Propriétaire RDC
            </span>
            <span className="text-slate-400 text-xs font-mono">• Souveraineté & Identité Nationale</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            Identité Nationale & Ressources Officielles
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gérez la charte graphique officielle RDC, les logos ministériels EPST, le drapeau, les armoiries et le slogan. Les mises à jour s'appliquent immédiatement sur l'ensemble de la plateforme.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* RESTORE DEFAULTS BUTTON */}
          <button
            onClick={handleRestoreDefaults}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer"
            title="Réinitialiser avec les ressources officielles RDC"
          >
            <RefreshCw className="h-4 w-4 text-amber-500" />
            <span>Restaurer les ressources officielles</span>
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Enregistrer & Propager sur la Plateforme</span>
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION BANNER */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-between font-bold text-xs"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>
                Identité Nationale & Ressources Officielles enregistrées avec succès ! Toutes les pages, bulletins, portails et cartes ont été automatiquement mis à jour.
              </span>
            </div>
            <button onClick={() => setSaveSuccess(false)} className="text-white hover:text-emerald-100">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === "settings" 
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Éditeur des Paramètres (7 Éléments)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("previews")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === "previews" 
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Aperçu en Temps Réel sur les Modules</span>
          </button>

          <button
            onClick={() => setActiveSubTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === "audit" 
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <History className="h-4 w-4 text-indigo-500" />
            <span>Journal d'Audit ({auditLogs.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden md:block">
          Dernière mise à jour : <strong className="text-slate-700 dark:text-slate-200">{settings.lastUpdated || "2026-08-01"}</strong>
        </div>
      </div>

      {/* VIEW 1: SETTINGS EDITOR */}
      {activeSubTab === "settings" && (
        <div className="space-y-6">
          
          {/* TEXT PARAMETERS SECTION: NOM DE LA PLATEFORME & SLOGAN */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Landmark className="h-4 w-4 text-red-600" />
              <span>1. Appellation Officielle & Slogan National</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* NOM OFFICIEL DE LA PLATEFORME */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase text-slate-500">
                  Nom Officiel de la Plateforme *
                </label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => handleFieldChange("platformName", e.target.value)}
                  placeholder="Ex: SmartSchool RDC"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[10px] text-slate-400">
                  Affiché sur les portails de connexion, les en-têtes d'impression, les rapports et les courriels.
                </p>
              </div>

              {/* SLOGAN NATIONAL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase text-slate-500">
                  Slogan Officiel *
                </label>
                <input
                  type="text"
                  value={settings.platformSlogan}
                  onChange={(e) => handleFieldChange("platformSlogan", e.target.value)}
                  placeholder="Ex: Système National Intégré de Gestion Scolaire"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[10px] text-slate-400">
                  Apparaît sous le titre officiel sur les certificats, bulletins et portails.
                </p>
              </div>

            </div>
          </div>

          {/* ASSET EDITORS (5 IMAGE PARAMETERS) */}
          <div className="space-y-6">
            
            {/* ASSET ITEM 1: LOGO OFFICIEL SMARTSCHOOL RDC */}
            <AssetCardEditor
              title="2. Logo Officiel SmartSchool RDC"
              description="Logo principal de la plateforme utilisé sur la page d'accueil, les barres de navigation et l'en-tête des documents."
              fieldKey="platformLogoUrl"
              currentValue={settings.platformLogoUrl}
              inputMode={inputModes["platformLogoUrl"] || "url"}
              libraryOptions={OFFICIAL_ASSET_LIBRARY.logo}
              onModeChange={(m) => setInputModes(prev => ({ ...prev, platformLogoUrl: m }))}
              onValueChange={(val) => handleFieldChange("platformLogoUrl", val)}
              onFileUpload={(file) => handleFileUpload("platformLogoUrl", file)}
            />

            {/* ASSET ITEM 2: FAVICON */}
            <AssetCardEditor
              title="3. Favicon Officiel de la Plateforme"
              description="Icône du navigateur affichée dans l'onglet des navigateurs web (32x32px ou 64x64px)."
              fieldKey="faviconUrl"
              currentValue={settings.faviconUrl}
              inputMode={inputModes["faviconUrl"] || "url"}
              libraryOptions={OFFICIAL_ASSET_LIBRARY.favicon}
              onModeChange={(m) => setInputModes(prev => ({ ...prev, faviconUrl: m }))}
              onValueChange={(val) => handleFieldChange("faviconUrl", val)}
              onFileUpload={(file) => handleFileUpload("faviconUrl", file)}
              previewSize="favicon"
            />

            {/* ASSET ITEM 3: DRAPEAU OFFICIEL DE LA RDC */}
            <AssetCardEditor
              title="4. Drapeau Officiel de la République Démocratique du Congo"
              description="Drapeau tricolore officiel RDC (Bleu, Jaune, Rouge, Étoile d'Or) présent sur tous les bulletins, cartes et rapports réglementaires."
              fieldKey="drapeauUrl"
              currentValue={settings.drapeauUrl}
              inputMode={inputModes["drapeauUrl"] || "url"}
              libraryOptions={OFFICIAL_ASSET_LIBRARY.drapeau}
              onModeChange={(m) => setInputModes(prev => ({ ...prev, drapeauUrl: m }))}
              onValueChange={(val) => handleFieldChange("drapeauUrl", val)}
              onFileUpload={(file) => handleFileUpload("drapeauUrl", file)}
            />

            {/* ASSET ITEM 4: ARMOIRIES OFFICIELLES RDC */}
            <AssetCardEditor
              title="5. Armoiries Officielles de la RDC (Filigrane Sécurisé)"
              description="Blason national utilisé comme filigrane de sécurité et sceau officiel d'authentification sur les diplômes, cartes et bulletins EPST."
              fieldKey="armoiriesUrl"
              currentValue={settings.armoiriesUrl}
              inputMode={inputModes["armoiriesUrl"] || "url"}
              libraryOptions={OFFICIAL_ASSET_LIBRARY.armoiries}
              onModeChange={(m) => setInputModes(prev => ({ ...prev, armoiriesUrl: m }))}
              onValueChange={(val) => handleFieldChange("armoiriesUrl", val)}
              onFileUpload={(file) => handleFileUpload("armoiriesUrl", file)}
            />

            {/* ASSET ITEM 5: LOGO OFFICIEL MINEPSP / EPST */}
            <AssetCardEditor
              title="6. Logo Officiel du Ministère EPST / MINEPSP"
              description="Insigne du Ministère de l'Enseignement Primaire, Secondaire et Technique (EPST) apposé sur les documents de synthèse et contrôles d'inspection."
              fieldKey="epstLogoUrl"
              currentValue={settings.epstLogoUrl}
              inputMode={inputModes["epstLogoUrl"] || "url"}
              libraryOptions={OFFICIAL_ASSET_LIBRARY.epst}
              onModeChange={(m) => setInputModes(prev => ({ ...prev, epstLogoUrl: m }))}
              onValueChange={(val) => handleFieldChange("epstLogoUrl", val)}
              onFileUpload={(file) => handleFileUpload("epstLogoUrl", file)}
            />

          </div>

        </div>
      )}

      {/* VIEW 2: REAL-TIME PREVIEWS */}
      {activeSubTab === "previews" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-2">
            <h3 className="font-black text-base text-slate-900 dark:text-white uppercase flex items-center space-x-2">
              <Eye className="h-5 w-5 text-red-600" />
              <span>Aperçu Multi-Support en Temps Réel</span>
            </h3>
            <p className="text-xs text-slate-500">
              Visualisez le rendu automatique des paramètres d'identité sur les bulletins, cartes d'élèves, reçus financiers et portails web.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PREVIEW 1: EN-TÊTE BULLETIN EPST */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                1. Bulletin Scolaire Officiel EPST
              </span>

              {/* Simulated Bulletin Header */}
              <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden space-y-3 text-center">
                
                {/* Background Watermark Armoiries */}
                {settings.armoiriesUrl && (
                  <img 
                    src={settings.armoiriesUrl} 
                    alt="Armoiries Filigrane" 
                    className="absolute inset-0 m-auto h-32 w-32 opacity-10 pointer-events-none object-contain"
                  />
                )}

                <div className="flex items-center justify-between border-b pb-3">
                  {/* Flag RDC */}
                  <img src={settings.drapeauUrl} alt="Drapeau RDC" className="h-8 w-12 rounded object-cover shadow-sm border" />
                  
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-100">{settings.platformName}</p>
                    <p className="text-[8px] text-slate-500 font-bold">{settings.platformSlogan}</p>
                  </div>

                  {/* EPST Logo */}
                  <img src={settings.epstLogoUrl} alt="Logo EPST" className="h-8 w-8 object-contain" />
                </div>

                <div className="py-2">
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
                    BULLETIN DE NOTES - EPST RDC
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Année Scolaire 2026-2027 • République Démocratique du Congo</p>
                </div>
              </div>
            </div>

            {/* PREVIEW 2: CARTE D'ÉLÈVE BIOMÉTRIQUE CR-80 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                2. Carte d'Élève & Personnel
              </span>

              {/* Simulated ID Card */}
              <div className="border-2 border-indigo-900 rounded-2xl p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white relative overflow-hidden shadow-md">
                <div className="flex items-center justify-between border-b border-indigo-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <img src={settings.drapeauUrl} alt="Flag" className="h-5 w-7 rounded object-cover" />
                    <div>
                      <p className="text-[10px] font-black uppercase leading-none">{settings.platformName}</p>
                      <p className="text-[7px] text-indigo-300 uppercase">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</p>
                    </div>
                  </div>
                  <img src={settings.platformLogoUrl} alt="Logo" className="h-6 w-6 object-contain" />
                </div>

                <div className="flex items-center space-x-3 mt-3">
                  <div className="h-14 w-12 bg-slate-800 border-2 border-indigo-400 rounded-lg overflow-hidden flex items-center justify-center text-[8px] font-bold">
                    PHOTO
                  </div>
                  <div>
                    <p className="text-xs font-extrabold">KABAMBA MUKENDI JEAN</p>
                    <p className="text-[9px] text-indigo-300 font-mono">MAT : 2026-KIN-882</p>
                    <p className="text-[9px] text-slate-300">Option : Chimie-Biologie</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PREVIEW 3: REÇU FINANCIER & CERTIFICAT */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                3. Reçu de Caisse & Certificat
              </span>

              <div className="border border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-2xl bg-white dark:bg-slate-950 space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <img src={settings.epstLogoUrl} alt="EPST" className="h-6 w-6 object-contain" />
                  <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{settings.platformName}</span>
                  <img src={settings.drapeauUrl} alt="Flag" className="h-4 w-6 rounded object-cover" />
                </div>
                <div className="text-center py-2">
                  <p className="text-xs font-black uppercase text-slate-800 dark:text-slate-100">REÇU OFFICIEL DE PAIEMENT</p>
                  <p className="text-[9px] text-slate-400">Paiement des Frais Scolaires • Reçu N° REC-2026-092</p>
                </div>
              </div>
            </div>

            {/* PREVIEW 4: BARRE DE NAVIGATION WEB & ONGLET FAVICON */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                4. Onglet Navigateur & Barre Supérieure
              </span>

              {/* Simulated Browser Bar */}
              <div className="bg-slate-200 dark:bg-slate-800 rounded-t-xl p-2 flex items-center space-x-2 border-b">
                <div className="flex space-x-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                {/* Tab */}
                <div className="bg-white dark:bg-slate-900 px-3 py-1 rounded-t-lg flex items-center space-x-2 text-[10px] font-bold text-slate-800 dark:text-white shadow-sm">
                  <img src={settings.faviconUrl} alt="Favicon" className="h-3.5 w-3.5 rounded object-contain" />
                  <span>{settings.platformName} - Portail National</span>
                </div>
              </div>

              {/* Navbar Preview */}
              <div className="bg-slate-900 text-white p-3 rounded-b-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={settings.platformLogoUrl} alt="Logo" className="h-6 w-6 object-contain" />
                  <div>
                    <p className="text-xs font-black">{settings.platformName}</p>
                    <p className="text-[8px] text-slate-400">{settings.platformSlogan}</p>
                  </div>
                </div>
                <img src={settings.drapeauUrl} alt="Flag" className="h-4 w-6 rounded object-cover" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: AUDIT LOG */}
      {activeSubTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase flex items-center space-x-2">
                <History className="h-5 w-5 text-indigo-500" />
                <span>Journal d'Audit - Traçabilité de l'Identité Nationale</span>
              </h3>
              <p className="text-xs text-slate-500">
                Historique inaltérable de chaque modification apportée aux logos, drapeaux, armoiries et appellations.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider bg-slate-50 dark:bg-slate-950">
                  <th className="p-3">Horodatage</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Auteur & Rôle</th>
                  <th className="p-3">Champ Modifié</th>
                  <th className="p-3">Détails de l'Opération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="p-3 font-mono text-slate-500 text-[11px] font-bold">{log.timestamp}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] uppercase bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{log.actorName}</p>
                      <p className="text-[10px] text-slate-400">{log.actorRole}</p>
                    </td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{log.changedField}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 leading-relaxed">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// SUB-COMPONENT: ASSET CARD EDITOR (Supports Upload, URL, or Library Pick)
interface AssetCardEditorProps {
  title: string;
  description: string;
  fieldKey: string;
  currentValue: string;
  inputMode: "file" | "url" | "library";
  libraryOptions: { title: string; url: string }[];
  onModeChange: (mode: "file" | "url" | "library") => void;
  onValueChange: (val: string) => void;
  onFileUpload: (file: File) => void;
  previewSize?: "standard" | "favicon";
}

function AssetCardEditor({
  title,
  description,
  currentValue,
  inputMode,
  libraryOptions,
  onModeChange,
  onValueChange,
  onFileUpload,
  previewSize = "standard"
}: AssetCardEditorProps) {

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
      
      {/* Title & Desc */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        </div>

        {/* MODE TOGGLE BUTTONS */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => onModeChange("url")}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
              inputMode === "url" ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-500"
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Coller URL</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("file")}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
              inputMode === "file" ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-500"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Téléverser Fichier</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("library")}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
              inputMode === "library" ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-500"
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Bibliothèque</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center pt-2">
        
        {/* LEFT 3 COLS: INPUT CONTROLS BASED ON MODE */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* MODE 1: URL INPUT */}
          {inputMode === "url" && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-400">URL Sécurisée (HTTPS://...)</label>
              <input
                type="text"
                value={currentValue}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {/* MODE 2: FILE UPLOAD */}
          {inputMode === "file" && (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 text-center space-y-2">
              <Upload className="h-6 w-6 text-red-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Glissez-déposez une image ou cliquez pour parcourir
              </p>
              <p className="text-[10px] text-slate-400">Formats acceptés : PNG, SVG, JPG, WEBP (Max: 5 Mo)</p>
              <input
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(file);
                }}
                className="hidden"
                id={`file-upload-${title}`}
              />
              <label
                htmlFor={`file-upload-${title}`}
                className="inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Sélectionner un fichier
              </label>
            </div>
          )}

          {/* MODE 3: PRESET LIBRARY */}
          {inputMode === "library" && (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400">
                Choisir une ressource officielle de la bibliothèque système :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {libraryOptions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onValueChange(item.url)}
                    className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      currentValue === item.url 
                        ? "border-red-500 bg-red-50 dark:bg-red-950/40" 
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100"
                    }`}
                  >
                    <img src={item.url} alt={item.title} className="h-8 w-8 object-contain rounded shrink-0 border" />
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT 1 COL: LIVE PREVIEW BOX */}
        <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Aperçu direct</span>
          <div className="h-20 w-full flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl p-2 border shadow-inner">
            {currentValue ? (
              <img 
                src={currentValue} 
                alt="Aperçu" 
                className={`${previewSize === "favicon" ? "h-8 w-8" : "max-h-16 max-w-full"} object-contain`} 
                onError={(e) => {
                  (e.target as any).src = "https://placehold.co/100x100?text=Erreur+Image";
                }}
              />
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">Aucune image</span>
            )}
          </div>
          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            ✓ Prêt pour synchro
          </span>
        </div>

      </div>

    </div>
  );
}
