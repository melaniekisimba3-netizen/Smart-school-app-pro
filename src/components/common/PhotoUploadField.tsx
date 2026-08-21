import React, { useRef, useState } from "react";
import { Camera, Upload, Trash2, RefreshCw, User, Image as ImageIcon, Check, X, Eye, ZoomIn, Sparkles } from "lucide-react";

interface PhotoUploadFieldProps {
  label?: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  aspectRatio?: "square" | "landscape" | "circle";
  previewSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
  helperText?: string;
  allowDelete?: boolean;
  required?: boolean;
  id?: string;
  fallbackIcon?: "user" | "school" | "image";
  title?: string;
  subtitle?: string;
}

/**
 * Compresse une image côté client avec un canvas HTML5 pour produire une URL Base64 optimisée.
 * Réduit les dimensions si nécessaire (max 800x800 px) tout en conservant une grande netteté (~40-90 Ko).
 */
export async function processAndCompressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // Vérification de la taille initiale du fichier (max 12 Mo avant compression)
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error("Le fichier sélectionné dépasse la limite autorisée de 12 Mo."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire le fichier sélectionné."));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format d'image non valide ou fichier corrompu."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Lissage et haute qualité de rendu
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch {
          resolve(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoUploadField({
  label = "Photo officielle",
  value = "",
  onChange,
  aspectRatio = "square",
  previewSize = "md",
  className = "",
  helperText = "Sélectionnez une photo depuis votre galerie ou vos fichiers (JPG, PNG, WEBP)",
  allowDelete = true,
  required = false,
  id = "photo-upload-field",
  fallbackIcon = "user"
}: PhotoUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [tempPreview, setTempPreview] = useState<string | null>(null);

  const handleFileSelection = async (file: File) => {
    if (!file) return;
    
    // Vérification du type MIME ou de l'extension
    const validExtensions = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isImageMime = file.type.startsWith("image/");
    const isValidExt = validExtensions.includes(ext);

    if (!isImageMime && !isValidExt) {
      setErrorMsg("Format non pris en charge. Veuillez choisir une photo JPG, PNG, WEBP ou HEIC.");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const dataUrl = await processAndCompressImage(file);
      // Mettre à jour la valeur
      onChange(dataUrl);
      setTempPreview(dataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors du traitement de la photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDelete = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange("");
    setTempPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sizeClasses = {
    sm: "h-16 w-16 text-xs",
    md: "h-24 w-24 text-sm",
    lg: "h-32 w-32 text-base",
    xl: "h-40 w-40 text-lg"
  }[previewSize];

  const roundedClasses = aspectRatio === "circle" 
    ? "rounded-full" 
    : aspectRatio === "landscape" 
    ? "rounded-2xl aspect-[4/3]" 
    : "rounded-2xl";

  const displayPhoto = value || tempPreview;

  return (
    <div className={`space-y-2 ${className}`} id={id}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {displayPhoto && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/60">
              <Check className="h-3 w-3" /> Photo sélectionnée
            </span>
          )}
        </div>
      )}

      {/* SÉLECTEUR DE FICHIER SANS capture="user" POUR OUVRIR LA GALERIE */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/heic,.png,.jpg,.jpeg,.webp,.gif,.heic"
        onChange={onInputChange}
        className="hidden"
        id={`${id}-input`}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`p-3.5 bg-slate-50 dark:bg-slate-950 border-2 ${
          dragOver ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30" : "border-dashed border-slate-200 dark:border-slate-800"
        } rounded-2xl transition-all flex flex-col sm:flex-row items-center gap-4`}
      >
        {/* Photo Preview / Fallback Box */}
        <div className="relative group shrink-0">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative ${sizeClasses} ${roundedClasses} bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden flex items-center justify-center cursor-pointer transition-transform active:scale-95`}
            title="Cliquer pour choisir une photo depuis la galerie ou vos fichiers"
          >
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Aperçu photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center p-2 text-center">
                {fallbackIcon === "school" ? (
                  <ImageIcon className="h-7 w-7 stroke-[1.5]" />
                ) : (
                  <User className="h-7 w-7 stroke-[1.5]" />
                )}
                <span className="text-[9px] font-bold mt-1 text-slate-400">Aucune photo</span>
              </div>
            )}

            {/* Hover overlay with visual indicator */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-1">
              <Upload className="h-4 w-4" />
              <span className="text-[9px] font-bold">Changer</span>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center text-white">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
              </div>
            )}
          </div>

          {/* Quick zoom preview button */}
          {displayPhoto && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPreviewModalOpen(true);
              }}
              className="absolute -bottom-1.5 -right-1.5 p-1 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
              title="Agrandir l'aperçu"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Action Controls & Description */}
        <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              id={`${id}-upload-btn`}
            >
              {displayPhoto ? <RefreshCw className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
              <span>{displayPhoto ? "Remplacer la photo" : "Ajouter une photo (Galerie / Fichiers)"}</span>
            </button>

            {displayPhoto && allowDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5"
                title="Supprimer la photo actuelle"
                id={`${id}-delete-btn`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Supprimer</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <p>{helperText}</p>
            {displayPhoto && (
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="h-3 w-3" />
                Format optimisé haute résolution (~40-80 Ko). Prêt à l'enregistrement.
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* MODAL D'APERÇU AGRANDI */}
      {isPreviewModalOpen && displayPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Aperçu officiel de la photo</h4>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-square w-full max-w-[260px] mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md">
              <img
                src={displayPhoto}
                alt="Aperçu grand format"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Remplacer</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
