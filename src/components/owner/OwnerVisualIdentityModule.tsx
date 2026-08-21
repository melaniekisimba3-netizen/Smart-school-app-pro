import React, { useState, useEffect, useRef } from "react";
import {
  Award,
  Upload,
  Image as ImageIcon,
  Flag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  RotateCcw,
  Eye,
  FileText,
  CreditCard,
  Lock,
  Sparkles,
  Layers,
  Sliders,
  Check,
  X,
  Info,
  Building,
  UserCheck,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  PlatformBranding,
  DEFAULT_PLATFORM_BRANDING,
  fetchPlatformBranding,
  savePlatformBranding,
  resetPlatformBrandingToDefaults
} from "../../services/platformBrandingService";

interface OwnerVisualIdentityModuleProps {
  userRole?: string;
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function OwnerVisualIdentityModule({
  userRole = "Propriétaire de la plateforme",
  userName = "Propriétaire SmartSchool RDC",
  onAuditLog
}: OwnerVisualIdentityModuleProps) {
  const [branding, setBranding] = useState<PlatformBranding>(DEFAULT_PLATFORM_BRANDING);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  
  // Preview simulator active tab: "login" | "document" | "carte_personnel" | "carte_eleve"
  const [simulatorTab, setSimulatorTab] = useState<"login" | "document" | "carte_personnel" | "carte_eleve">("login");

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const flagInputRef = useRef<HTMLInputElement>(null);
  const coatOfArmsInputRef = useRef<HTMLInputElement>(null);

  // Drag states
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingFlag, setIsDraggingFlag] = useState(false);
  const [isDraggingCoat, setIsDraggingCoat] = useState(false);

  // Check if owner
  const isOwner =
    userRole.toLowerCase().includes("propriétaire") ||
    userRole.toLowerCase().includes("proprietaire") ||
    userRole.toLowerCase().includes("superadmin") ||
    userRole.toLowerCase().includes("super administrateur") ||
    userRole.toLowerCase().includes("fondateur");

  // Load branding on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchPlatformBranding();
        if (isMounted) {
          setBranding(data);
        }
      } catch (err) {
        console.error("Erreur chargement branding:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Convert File to Base64 data URL
  const processImageFile = (file: File, callback: (base64Url: string) => void) => {
    if (!file.type.startsWith("image/")) {
      showToast("Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("La taille du fichier ne doit pas dépasser 10 Mo.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
        showToast(`Image "${file.name}" chargée avec succès. Cliquez sur "Enregistrer" pour persister les modifications.`, "info");
      }
    };
    reader.onerror = () => {
      showToast("Erreur lors de la lecture du fichier image.", "error");
    };
    reader.readAsDataURL(file);
  };

  // File change handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (base64Url) => {
        setBranding((prev) => ({ ...prev, logoUrl: base64Url }));
      });
    }
  };

  const handleFlagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (base64Url) => {
        setBranding((prev) => ({ ...prev, flagUrl: base64Url }));
      });
    }
  };

  const handleCoatOfArmsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (base64Url) => {
        setBranding((prev) => ({ ...prev, coatOfArmsUrl: base64Url }));
      });
    }
  };

  // Save changes to persistent server & database
  const handleSaveChanges = async () => {
    if (!isOwner) {
      showToast("Accès Refusé: Seul le Propriétaire peut modifier l'identité visuelle.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const result = await savePlatformBranding(branding, userRole, userName);
      if (result.success) {
        setBranding(result.branding);
        showToast("Identité visuelle enregistrée avec succès dans la base de données et le stockage persistant serveur !", "success");
        if (onAuditLog) {
          onAuditLog(
            "Mise à jour Identité Visuelle Plateforme",
            `Mise à jour des emblèmes officiels (Logo, Drapeau RDC, Armoiries RDC) par le propriétaire ${userName}.`
          );
        }
      } else {
        showToast(result.error || "Erreur lors de l'enregistrement.", "error");
      }
    } catch (err) {
      console.error("Erreur sauvegarde branding:", err);
      showToast("Erreur de communication avec le serveur.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default factory assets
  const handleReset = async () => {
    if (!window.confirm("Voulez-vous réinitialiser tous les emblèmes visuels officiels (Logo, Drapeau RDC, Armoiries) aux valeurs officielles d'origine ?")) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await resetPlatformBrandingToDefaults(userRole, userName);
      if (result.success) {
        setBranding(result.branding);
        showToast("Identité visuelle réinitialisée aux normes officielles d'usine.", "success");
        if (onAuditLog) {
          onAuditLog("Réinitialisation Identité Visuelle", "Restauration des emblèmes officiels initiaux de la plateforme.");
        }
      }
    } catch (err) {
      console.error("Erreur reset branding:", err);
      showToast("Erreur lors de la réinitialisation.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          Chargement de l'identité visuelle persistante...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="owner-visual-identity-module">
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold ${
              toastMessage.type === "success"
                ? "bg-emerald-600 text-white shadow-emerald-900/20"
                : toastMessage.type === "error"
                ? "bg-red-600 text-white shadow-red-900/20"
                : "bg-blue-600 text-white shadow-blue-900/20"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : toastMessage.type === "error" ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <Info className="h-4 w-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <Award className="h-64 w-64 text-amber-400" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-gradient-to-tr from-amber-500 via-blue-600 to-amber-400 rounded-2xl text-white shadow-md ring-2 ring-white/20">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black uppercase tracking-wider text-white">
                  Identité Visuelle & Emblèmes Souverains
                </h1>
                <span className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black rounded-full uppercase tracking-wider">
                  Accès Exclusif Propriétaire
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="h-3 w-3 inline mr-1" />
                  Stockage Persistant Serveur & DB
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Module central de gestion des éléments visuels officiels de <strong>SmartSchool RDC</strong>. Téléversez directement le Logo Officiel, le Drapeau de la RDC et l'Armoirie Nationale. Ces éléments sont stockés de façon persistante et s'appliquent automatiquement sur la page de connexion, les interfaces, les documents générés et les cartes officielles.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <span>Réinitialiser aux Normes</span>
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center space-x-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Enregistrer et Propager</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* METADATA & PERSISTENCE BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-bold">Dernière modification :</span>
            <span className="font-mono font-extrabold text-slate-900 dark:text-white">
              {branding.updatedAt ? new Date(branding.updatedAt).toLocaleString("fr-FR") : "20/08/2026 12:00"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-bold">Modifié par :</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {branding.updatedBy || userName} ({branding.updatedByRole || userRole})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] font-bold">
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span>Synchronisation Globale Multi-Tenant & Fichiers Actifs</span>
        </div>
      </div>

      {/* 3 UPLOAD CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: LOGO OFFICIEL DE SMARTSCHOOL RDC */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                  1. Logo Officiel SmartSchool RDC
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black rounded-md uppercase">
                Plateforme
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Téléversez le logo officiel de l'application. Utilisé automatiquement sur la page de connexion, les interfaces principales et les entêtes.
            </p>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[140px]">
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-400 via-blue-600 to-amber-500 shadow-md ring-2 ring-white dark:ring-slate-900">
              <img
                src={branding.logoUrl}
                alt="Logo Officiel SmartSchool RDC"
                className="h-20 w-20 object-contain rounded-full bg-white dark:bg-slate-900"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/branding/smartschool-rdc-logo.png";
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-2 font-mono">Format Carré 1:1 Recommandé</span>
          </div>

          {/* DRAG AND DROP UPLOAD BOX */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingLogo(true);
            }}
            onDragLeave={() => setIsDraggingLogo(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingLogo(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                processImageFile(file, (base64Url) => {
                  setBranding((prev) => ({ ...prev, logoUrl: base64Url }));
                });
              }
            }}
            onClick={() => logoInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              isDraggingLogo
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
              Téléverser un nouveau logo
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Glissez-déposez ou cliquez (PNG, JPG, SVG, WebP max 10 Mo)
            </span>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center space-x-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Remplace instantanément l'ancien logo sur toute l'application.</span>
          </div>
        </div>

        {/* CARD 2: DRAPEAU DE LA RÉPUBLIQUE DÉMOCRATIQUE DU CONGO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-sky-50 dark:bg-sky-950/60 rounded-xl text-sky-600 dark:text-sky-400">
                  <Flag className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                  2. Drapeau Officiel de la RDC
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-black rounded-md uppercase">
                En-Têtes
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Téléversez le drapeau national officiel de la RDC. Affiché en en-tête de tous les documents générés et sur toutes les cartes de service et cartes d'élèves.
            </p>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[140px]">
            <div className="rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-md">
              <img
                src={branding.flagUrl}
                alt="Drapeau de la RDC"
                className="h-16 w-24 object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/512px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png";
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-2 font-mono">Ratio National 4:3 ou 3:2</span>
          </div>

          {/* DRAG AND DROP UPLOAD BOX */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFlag(true);
            }}
            onDragLeave={() => setIsDraggingFlag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingFlag(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                processImageFile(file, (base64Url) => {
                  setBranding((prev) => ({ ...prev, flagUrl: base64Url }));
                });
              }
            }}
            onClick={() => flagInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              isDraggingFlag
                ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20"
                : "border-slate-200 dark:border-slate-700 hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <input
              ref={flagInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleFlagUpload}
              className="hidden"
            />
            <Upload className="h-6 w-6 text-sky-600 dark:text-sky-400 mx-auto mb-1.5" />
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
              Téléverser un nouveau drapeau
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Glissez-déposez ou cliquez (PNG, JPG, SVG max 10 Mo)
            </span>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center space-x-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Positionné en en-tête officiel dans tous les formulaires & impressions.</span>
          </div>
        </div>

        {/* CARD 3: ARMOIRIE OFFICIELLE DE LA RDC */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                  3. Armoirie Officielle de la RDC
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black rounded-md uppercase">
                Filigrane
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Téléversez l'armoirie officielle (Blason Léopard). Affichée en filigrane subtil sur tous les documents imprimés et les cartes sans altérer la lisibilité.
            </p>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[140px] relative overflow-hidden">
            <img
              src={branding.coatOfArmsUrl}
              alt="Armoiries de la RDC"
              className="h-20 w-20 object-contain drop-shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png";
              }}
            />
            <span className="text-[10px] font-bold text-slate-400 mt-2 font-mono">PNG Transparent ou SVG Recommandé</span>
          </div>

          {/* DRAG AND DROP UPLOAD BOX */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingCoat(true);
            }}
            onDragLeave={() => setIsDraggingCoat(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingCoat(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                processImageFile(file, (base64Url) => {
                  setBranding((prev) => ({ ...prev, coatOfArmsUrl: base64Url }));
                });
              }
            }}
            onClick={() => coatOfArmsInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              isDraggingCoat
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                : "border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <input
              ref={coatOfArmsInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleCoatOfArmsUpload}
              className="hidden"
            />
            <Upload className="h-6 w-6 text-amber-600 dark:text-amber-400 mx-auto mb-1.5" />
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
              Téléverser une nouvelle armoirie
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Glissez-déposez ou cliquez (PNG, JPG, SVG max 10 Mo)
            </span>
          </div>

          {/* OPACITY SLIDER FOR WATERMARK */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-600 dark:text-slate-300">Opacité Filigrane Documents :</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">
                {Math.round((branding.watermarkOpacity || 0.06) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.15"
              step="0.01"
              value={branding.watermarkOpacity || 0.06}
              onChange={(e) =>
                setBranding((prev) => ({ ...prev, watermarkOpacity: parseFloat(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[9px] text-slate-400 block text-center">
              Ajusté pour une lisibilité parfaite du texte lors de l'impression
            </span>
          </div>
        </div>

      </div>

      {/* LIVE SIMULATOR & PREVIEW ACROSS ALL REQUIRED SCENARIOS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-slate-900 dark:text-white tracking-wider">
                Simulateur en Temps Réel d'Application des Éléments Téléversés
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vérifiez immédiatement le rendu visuel sur tous les supports officiels de la plateforme.
              </p>
            </div>
          </div>

          {/* SIMULATOR TAB BUTTONS */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
            <button
              onClick={() => setSimulatorTab("login")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                simulatorTab === "login"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5 text-blue-500" />
              <span>1. Page de Connexion</span>
            </button>

            <button
              onClick={() => setSimulatorTab("document")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                simulatorTab === "document"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-emerald-500" />
              <span>2. Documents Officiels</span>
            </button>

            <button
              onClick={() => setSimulatorTab("carte_personnel")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                simulatorTab === "carte_personnel"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
              <span>3. Carte Personnel</span>
            </button>

            <button
              onClick={() => setSimulatorTab("carte_eleve")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                simulatorTab === "carte_eleve"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>4. Carte Élève</span>
            </button>
          </div>
        </div>

        {/* SIMULATOR VIEWS */}
        <div className="bg-slate-100/70 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex justify-center items-center min-h-[380px]">
          
          {/* VIEW 1: LOGIN PAGE PREVIEW */}
          {simulatorTab === "login" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4"
            >
              {/* Official Logo Header Container */}
              <div className="flex flex-col items-center">
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-400 via-blue-600 to-amber-500 shadow-md ring-2 ring-white dark:ring-slate-900 mb-2">
                  <img
                    src={branding.logoUrl}
                    alt="Logo Officiel"
                    className="h-16 w-16 object-contain rounded-full bg-white dark:bg-slate-900"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/branding/smartschool-rdc-logo.png";
                    }}
                  />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {branding.platformName || "SMARTSCHOOL RDC"}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/50 uppercase tracking-wider">
                    FRED-TECH
                  </span>
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/50 uppercase tracking-wider">
                    Gérer • Enseigner • Apprendre
                  </span>
                </div>
              </div>

              {/* Simulated Form Fields */}
              <div className="space-y-2 text-left">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Identifiant / Matricule</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300">
                    directeur@lasagesse.cd
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mot de passe</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border rounded-xl text-xs font-medium text-slate-400">
                    ••••••••••••••••
                  </div>
                </div>
                <div className="pt-1">
                  <div className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl text-center shadow-md">
                    Se Connecter en Toute Sécurité
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: OFFICIAL DOCUMENT PREVIEW (WITH FLAG IN HEADER & WATERMARK COAT OF ARMS) */}
          {simulatorTab === "document" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl bg-white text-slate-900 rounded-xl p-6 shadow-2xl border border-slate-300 relative overflow-hidden text-left"
            >
              {/* SUBTLE WATERMARK WITH UPLOADED COAT OF ARMS */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{ opacity: branding.watermarkOpacity || 0.06 }}
              >
                <img
                  src={branding.coatOfArmsUrl}
                  alt="Armoirie Filigrane"
                  className="max-w-[240px] max-h-[240px] object-contain drop-shadow-none"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png";
                  }}
                />
              </div>

              {/* OFFICIAL NATIONAL HEADER */}
              <div className="border-b-2 border-slate-900 pb-3 mb-3 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  {/* UPLOADED DRC FLAG IN HEADER */}
                  <img
                    src={branding.flagUrl}
                    alt="Drapeau RDC"
                    className="h-10 w-14 object-cover rounded border border-slate-300 shadow-xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/512px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png";
                    }}
                  />
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-700 tracking-wider block">
                      RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                    </span>
                    <span className="text-[7px] font-bold text-slate-500 uppercase block leading-tight">
                      MINISTÈRE DE L'ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETÉ
                    </span>
                    <h4 className="text-xs font-black text-slate-900 uppercase mt-0.5">
                      COMPLEXE SCOLAIRE LA SAGESSE • KINSHASA-GOMBE
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[8px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                    ANNÉE 2026-2027
                  </span>
                  <p className="text-[7px] text-slate-500 font-mono mt-0.5">Réf: RDC-DOC-88421</p>
                </div>
              </div>

              {/* DOCUMENT CONTENT (REÇU DE MINERVAL EXEMPLE) */}
              <div className="space-y-3 relative z-10">
                <div className="bg-slate-100 p-2 rounded flex justify-between items-center text-xs font-bold">
                  <span className="uppercase text-indigo-900">REÇU OFFICIEL DE FRAIS SCOLAIRES</span>
                  <span className="text-emerald-700 font-mono">100.00 USD (PAYÉ ✓)</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="border p-2 rounded bg-white/70">
                    <span className="text-[8px] text-slate-400 font-bold block uppercase">Élève :</span>
                    <p className="font-extrabold text-slate-900">MUKENDI TSHILOMBA Jean-Paul</p>
                    <p className="text-slate-600">Classe : 6ème Scientifique A</p>
                    <p className="text-slate-500 font-mono">Matricule : KIN-2026-0042</p>
                  </div>
                  <div className="border p-2 rounded bg-white/70">
                    <span className="text-[8px] text-slate-400 font-bold block uppercase">Détails Paiement :</span>
                    <p className="font-bold text-slate-900">Minerval Trimestre 1</p>
                    <p className="text-slate-600">Mode : Mobile Money (M-Pesa)</p>
                    <p className="text-slate-500 font-mono">Date : {new Date().toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>

                {/* SIGNATURES & STAMP */}
                <div className="flex justify-between items-end pt-3 border-t border-slate-300 text-[8px]">
                  <div className="text-center">
                    <span className="font-bold text-slate-600 block">Le Comptable / Caissier</span>
                    <span className="text-slate-400 italic block mt-2">Signature & Date</span>
                  </div>
                  <div className="border border-dashed border-indigo-500 text-indigo-700 px-3 py-1 rounded text-center font-bold text-[7px]">
                    SCEAU OFFICIEL DE L'ÉTABLISSEMENT
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-slate-600 block">Le Chef d'Établissement</span>
                    <span className="text-slate-400 italic block mt-2">Visé & Scellé</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 3: CARTE DE SERVICE PROFESSIONNELLE DU PERSONNEL */}
          {simulatorTab === "carte_personnel" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-80 h-112 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-200 rounded-2xl shadow-2xl border border-sky-500/40 p-4 flex flex-col justify-between text-slate-900 relative overflow-hidden text-left"
            >
              {/* WATERMARK WITH UPLOADED COAT OF ARMS */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{ opacity: branding.watermarkOpacity || 0.08 }}
              >
                <img
                  src={branding.coatOfArmsUrl}
                  alt="Armoirie Filigrane"
                  className="max-w-[140px] max-h-[140px] object-contain"
                />
              </div>

              {/* CARD NATIONAL HEADER WITH UPLOADED FLAG */}
              <div className="space-y-0.5 text-center relative z-10">
                <div className="flex justify-between items-center px-1">
                  {/* Uploaded Flag */}
                  <img
                    src={branding.flagUrl}
                    alt="Drapeau RDC"
                    className="h-4 w-6 object-cover rounded-xs border border-white shadow-xs"
                  />
                  {/* Uploaded Coat of arms icon */}
                  <img
                    src={branding.coatOfArmsUrl}
                    alt="Armoiries RDC"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <span className="text-[7px] font-black uppercase tracking-wider block text-sky-950">
                  RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                </span>
                <span className="text-[6px] font-bold text-slate-800 block -mt-0.5">
                  MINISTÈRE DE L'ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE
                </span>
              </div>

              {/* School Name */}
              <div className="text-center z-10 bg-white/50 backdrop-blur-[1px] p-1.5 rounded-lg border border-white/50">
                <span className="text-[9px] font-black text-indigo-950 uppercase leading-none block">
                  COMPLEXE SCOLAIRE LA SAGESSE
                </span>
                <span className="text-[6px] italic text-slate-800 leading-none block mt-0.5">
                  "Travail - Justice - Excellence"
                </span>
              </div>

              {/* Staff Photo & Info */}
              <div className="flex flex-col items-center space-y-1.5 z-10">
                <div className="h-20 w-20 rounded-xl bg-slate-800 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                    alt="Photo Agent"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="text-center">
                  <h4 className="text-xs font-black text-slate-950 tracking-tight leading-none uppercase">
                    KABAMBA MUKENDI ALPHONSE
                  </h4>
                  <span className="text-[7.5px] font-bold text-indigo-900 uppercase tracking-wider bg-indigo-100/80 px-2 py-0.5 rounded-full block mx-auto mt-1 w-max">
                    DIRECTEUR DES ÉTUDES
                  </span>
                </div>
              </div>

              {/* Identification details */}
              <div className="bg-white/90 rounded-xl p-2 text-[8px] font-mono leading-tight space-y-0.5 border border-indigo-100 shadow-inner z-10">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID SSRDC :</span>
                  <span className="font-black text-indigo-700">SSRDC-DIR-88401</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MATRICULE :</span>
                  <span className="font-bold text-slate-800">EPST-KIN-2026-991</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="text-center text-[5.5px] text-slate-700 border-t border-slate-900/10 pt-1 z-10">
                Carte de Service Officielle Biométrique • SmartSchool RDC
              </div>
            </motion.div>
          )}

          {/* VIEW 4: CARTE D'ÉLÈVE BIOMÉTRIQUE */}
          {simulatorTab === "carte_eleve" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-[85.6mm] h-[54mm] bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-3 flex flex-col justify-between border-2 border-amber-400 relative overflow-hidden shadow-2xl text-left"
            >
              {/* SUBTLE WATERMARK WITH UPLOADED COAT OF ARMS */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{ opacity: branding.watermarkOpacity || 0.08 }}
              >
                <img
                  src={branding.coatOfArmsUrl}
                  alt="Armoirie Filigrane"
                  className="max-w-[80px] max-h-[80px] object-contain"
                />
              </div>

              {/* CARD HEADER WITH UPLOADED FLAG */}
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center space-x-1.5">
                  <img
                    src={branding.flagUrl}
                    alt="Drapeau RDC"
                    className="h-3 w-4.5 object-cover rounded-xs border border-white/60"
                  />
                  <div>
                    <span className="text-[5px] font-black tracking-widest text-amber-400 uppercase block">
                      RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • EPST
                    </span>
                    <h4 className="text-[8px] font-black uppercase text-white tracking-tight leading-none">
                      CARTE D'ÉLÈVE BIOMÉTRIQUE
                    </h4>
                  </div>
                </div>
                <span className="bg-amber-400 text-slate-950 font-black text-[5px] px-1 py-0.5 rounded">
                  2026-2027
                </span>
              </div>

              {/* STUDENT INFO & PHOTO */}
              <div className="flex items-center space-x-2 my-1 z-10">
                <div className="w-10 h-12 rounded border border-amber-400/80 overflow-hidden shrink-0 bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150"
                    alt="Élève"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[8px] font-black text-amber-300 truncate">
                    MUTOMBO ASTRID KABANGE
                  </p>
                  <p className="text-[6.5px] text-slate-300">
                    Classe : <strong>6ème Scientifique A</strong>
                  </p>
                  <p className="text-[6.5px] text-slate-300 font-mono">
                    Matricule : <strong>RDC-KIN-8842-01</strong>
                  </p>
                  <p className="text-[6.5px] text-slate-300">
                    École : <strong>CS LA SAGESSE</strong>
                  </p>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="flex justify-between items-end text-[5px] text-slate-400 border-t border-indigo-800 pt-1 z-10">
                <span>SmartSchool RDC Digital Sovereign Pass</span>
                <span className="text-emerald-400 font-bold">✓ ÉLÈVE SOLVABLE & ENRÔLÉ</span>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* AUDIT LOG OF VISUAL IDENTITY CHANGES */}
      {branding.history && branding.history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs uppercase text-slate-900 dark:text-white tracking-wider flex items-center space-x-2">
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Historique d'Audit des Modifications Visuelles ({branding.history.length})</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Traçabilité Souveraine</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
            {branding.history.map((hist) => (
              <div key={hist.id} className="py-2 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{hist.actor}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                      {hist.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{hist.details}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(hist.timestamp).toLocaleString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
