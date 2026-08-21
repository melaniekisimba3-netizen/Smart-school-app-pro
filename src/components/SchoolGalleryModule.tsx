import React, { useState, useEffect } from "react";
import { 
  Camera, 
  Video, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Image as ImageIcon, 
  Plus, 
  Check, 
  Sparkles, 
  Award, 
  Building, 
  FlaskConical, 
  Trophy, 
  BookOpen, 
  School, 
  Sliders, 
  Share2, 
  History, 
  Info,
  CheckCircle2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { safeLocalStorage } from "../utils/safeStorage";

export interface GalleryMediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  title: string;
  category: "Infrastructures" | "Laboratoires" | "Terrains de Sport" | "Salles de Classe" | "Bibliothèque" | "Cérémonies" | "Distinctions" | "Général";
  description?: string;
  isCover?: boolean;
  uploadedAt: string;
  optimizedSize?: string;
}

export interface SchoolPrivacySettings {
  isProfilePublic: boolean;
  showPhotosPublicly: boolean;
  showContactInfoPublicly: boolean;
  allowCollaborationRequests: boolean;
  allowInterSchoolMessages: boolean;
  allowProfileVisits: boolean;
}

interface SchoolGalleryModuleProps {
  schoolName?: string;
  schoolLogoUrl?: string;
  schoolYear?: string;
  schoolProvince?: string;
  schoolCity?: string;
  userRole?: string;
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function SchoolGalleryModule({
  schoolName = "Établissement Scolaire",
  schoolLogoUrl = "",
  schoolYear = "2026-2027",
  schoolProvince = "",
  schoolCity = "",
  userRole = "Directeur",
  userName = "Directeur Général",
  onAuditLog
}: SchoolGalleryModuleProps) {

  // Active Tab: "gallery" | "presentation" | "privacy" | "preview"
  const [activeTab, setActiveTab] = useState<"gallery" | "presentation" | "privacy" | "preview">("gallery");

  // Selected Media Category Filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("Tous");

  // School Presentation Fields State
  const [presentationText, setPresentationText] = useState<string>(() => {
    return safeLocalStorage.getItem("ss_school_presentation") || "";
  });

  const [historyText, setHistoryText] = useState<string>(() => {
    return safeLocalStorage.getItem("ss_school_history") || "";
  });

  const [mottoText, setMottoText] = useState<string>(() => {
    return safeLocalStorage.getItem("ss_school_motto") || "";
  });

  const [visionText, setVisionText] = useState<string>(() => {
    return safeLocalStorage.getItem("ss_school_vision") || "Former les leaders de demain maîtrisant les compétences du 21ème siècle et la technologie numérique.";
  });

  const [missionText, setMissionText] = useState<string>(() => {
    return safeLocalStorage.getItem("ss_school_mission") || "Garantir un enseignement de qualité conforme au programme officiel du Ministère de l'EPST RDC.";
  });

  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string>(() => {
    return safeLocalStorage.getItem("ss_school_cover_photo") || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200";
  });

  // Privacy Settings State
  const [privacy, setPrivacy] = useState<SchoolPrivacySettings>(() => {
    const saved = safeLocalStorage.getItem("ss_school_privacy_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      isProfilePublic: true,
      showPhotosPublicly: true,
      showContactInfoPublicly: true,
      allowCollaborationRequests: true,
      allowInterSchoolMessages: true,
      allowProfileVisits: true
    };
  });

  // Media Items State
  const [mediaList, setMediaList] = useState<GalleryMediaItem[]>(() => {
    const saved = safeLocalStorage.getItem("ss_school_gallery_media");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "media-1",
        type: "photo",
        url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800",
        title: "Bâtiment Principal & Cour d'Honneur",
        category: "Infrastructures",
        description: "Infrastructures modernes de 34 salles de classe climatisées et sécurisées.",
        isCover: true,
        uploadedAt: "2026-08-01",
        optimizedSize: "420 KB (Optimisé WebP)"
      },
      {
        id: "media-2",
        type: "photo",
        url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
        title: "Laboratoire d'Informatique & Robotique",
        category: "Laboratoires",
        description: "40 postes informatiques haut débit connectés à la plateforme SmartSchool RDC.",
        uploadedAt: "2026-08-02",
        optimizedSize: "380 KB (Optimisé WebP)"
      },
      {
        id: "media-3",
        type: "photo",
        url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800",
        title: "Salle de Lecture & Bibliothèque Centrale",
        category: "Bibliothèque",
        description: "Plus de 10 000 ouvrages homologués par l'EPST et poste de consultation numérique.",
        uploadedAt: "2026-08-03",
        optimizedSize: "510 KB (Optimisé WebP)"
      },
      {
        id: "media-4",
        type: "photo",
        url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=800",
        title: "Complexe Sportif & Terrain Multisports",
        category: "Terrains de Sport",
        description: "Terrain de Football, Basket-ball, Volley-ball pour les compétitions interscolaires.",
        uploadedAt: "2026-08-04",
        optimizedSize: "620 KB (Optimisé WebP)"
      },
      {
        id: "media-5",
        type: "photo",
        url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
        title: "Remise des Diplômes & Palmes Académiques",
        category: "Cérémonies",
        description: "Cérémonie de proclamation des lauréats des Examens d'État 2025.",
        uploadedAt: "2026-08-05",
        optimizedSize: "490 KB (Optimisé WebP)"
      }
    ];
  });

  // Modal State for Adding New Media
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [newMediaForm, setNewMediaForm] = useState({
    title: "",
    category: "Infrastructures" as GalleryMediaItem["category"],
    type: "photo" as "photo" | "video",
    url: "",
    description: ""
  });

  // Lightbox Modal Image Preview
  const [previewItem, setPreviewItem] = useState<GalleryMediaItem | null>(null);

  // Success Feedback Banner
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Save Media to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem("ss_school_gallery_media", JSON.stringify(mediaList));
  }, [mediaList]);

  // Save Privacy to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem("ss_school_privacy_settings", JSON.stringify(privacy));
  }, [privacy]);

  // Handle Adding Media with Auto-Optimization Simulation
  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaForm.title.trim() || !newMediaForm.url.trim()) {
      alert("Veuillez remplir le titre et fournir l'URL du média.");
      return;
    }

    const newItem: GalleryMediaItem = {
      id: `media-${Date.now()}`,
      type: newMediaForm.type,
      url: newMediaForm.url.trim(),
      title: newMediaForm.title.trim(),
      category: newMediaForm.category,
      description: newMediaForm.description.trim(),
      uploadedAt: new Date().toISOString().substring(0, 10),
      optimizedSize: "320 KB (Optimisation WebP Automatique)"
    };

    setMediaList(prev => [newItem, ...prev]);
    setAddModalOpen(false);
    setNewMediaForm({ title: "", category: "Infrastructures", type: "photo", url: "", description: "" });

    if (onAuditLog) {
      onAuditLog("Ajout Média Galerie", `Ajout du média '${newItem.title}' dans la catégorie ${newItem.category}.`);
    }

    setSuccessMsg("Nouveau média ajouté et optimisé automatiquement avec succès !");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Handle Delete Media
  const handleDeleteMedia = (id: string, title: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le média '${title}' de la galerie officielle ?`)) {
      setMediaList(prev => prev.filter(item => item.id !== id));
      if (onAuditLog) {
        onAuditLog("Suppression Média Galerie", `Suppression du média '${title}' (ID: ${id}).`);
      }
    }
  };

  // Save Presentation Details
  const handleSavePresentation = () => {
    safeLocalStorage.setItem("ss_school_presentation", presentationText);
    safeLocalStorage.setItem("ss_school_history", historyText);
    safeLocalStorage.setItem("ss_school_motto", mottoText);
    safeLocalStorage.setItem("ss_school_vision", visionText);
    safeLocalStorage.setItem("ss_school_mission", missionText);
    safeLocalStorage.setItem("ss_school_cover_photo", coverPhotoUrl);

    if (onAuditLog) {
      onAuditLog("Mise à jour Présentation École", "Modification de l'historique, de la devise, de la vision et de la photo de couverture.");
    }

    setSuccessMsg("Présentation & Histoire de l'école mises à jour avec succès !");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Filtered Media List
  const filteredMedia = mediaList.filter((item) => {
    if (selectedCategoryFilter === "Tous") return true;
    return item.category === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6 text-left" id="school-gallery-official-module">
      
      {/* HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" /> Galerie & Vitrine Officielle
            </span>
            <span className="text-slate-400 text-xs font-mono">• SmartSchool RDC Network</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            Galerie Officielle & Profil de l'Établissement
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mettez en valeur les infrastructures, laboratoires, terrains de sport et réussites académiques de votre école. Gérez la visibilité publique et les paramètres de confidentialité.
          </p>
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter Photo / Vidéo</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK SUCCESS BANNER */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-between font-bold text-xs"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-white hover:text-emerald-100">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN MODULE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "gallery"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Galerie Média ({mediaList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("presentation")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "presentation"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Présentation, Historique & Devise</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "privacy"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Paramètres de Confidentialité</span>
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "preview"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Eye className="h-4 w-4 text-indigo-500" />
            <span>Aperçu du Profil Public</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-mono">
          <Globe className="h-3.5 w-3.5 text-emerald-500" />
          <span>Statut Public : <strong className={privacy.isProfilePublic ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>{privacy.isProfilePublic ? "ACTIVÉ (Visible)" : "MASQUÉ (Privé)"}</strong></span>
        </div>
      </div>

      {/* VIEW 1: MEDIA GALLERY GRID */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          
          {/* CATEGORY FILTER TABS */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-bold">
            <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Catégories :</span>
            {[
              "Tous",
              "Infrastructures",
              "Laboratoires",
              "Terrains de Sport",
              "Salles de Classe",
              "Bibliothèque",
              "Cérémonies",
              "Distinctions"
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategoryFilter === cat
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* GALLERY MASONRY / GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />

                  {/* Badge Category */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold rounded-lg uppercase">
                    {item.category}
                  </span>

                  {/* Video Overlay Icon */}
                  {item.type === "video" && (
                    <div className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-purple-600/80 text-white flex items-center justify-center shadow-lg">
                      <Video className="h-6 w-6" />
                    </div>
                  )}

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer shadow-lg"
                      title="Agrandir en Haute Définition"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(item.id, item.title)}
                      className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-500 cursor-pointer shadow-lg"
                      title="Supprimer ce média"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content Footer */}
                <div className="p-4 space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                    <span>{item.uploadedAt}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.optimizedSize || "Optimisé WebP"}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredMedia.length === 0 && (
              <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                <Camera className="h-10 w-10 mx-auto text-slate-300" />
                <p className="font-bold text-sm">Aucun média dans la catégorie '{selectedCategoryFilter}'.</p>
                <p className="text-xs">Cliquez sur le bouton "Ajouter Photo / Vidéo" pour enrichir la galerie.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* VIEW 2: PRESENTATION, HISTORY, MOTTO & COVER */}
      {activeTab === "presentation" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white uppercase flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <span>Histoire, Devise, Vision & Mission de l'École</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ces informations alimentent la vitrine publique officielle et la fiche de l'école dans le Réseau National.
              </p>
            </div>

            <button
              onClick={handleSavePresentation}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Enregistrer la Présentation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PHOTO DE COUVERTURE URL */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-500">
                Photo de Couverture de l'Établissement (Bannière Web)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={coverPhotoUrl}
                  onChange={(e) => setCoverPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="h-32 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                {coverPhotoUrl ? (
                  <img src={coverPhotoUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-slate-400 font-bold">Aucune image de bannière</div>
                )}
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  Aperçu de la Bannière
                </span>
              </div>
            </div>

            {/* DEVISE / MOTTO */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-slate-500">
                Devise Officielle de l'École
              </label>
              <input
                type="text"
                value={mottoText}
                onChange={(e) => setMottoText(e.target.value)}
                placeholder="Ex: Travail • Discipline • Excellence"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-black text-slate-900 dark:text-white outline-none"
              />
            </div>

            {/* PRÉSENTATION GÉNÉRALE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-slate-500">
                Présentation Synthétique
              </label>
              <textarea
                rows={3}
                value={presentationText}
                onChange={(e) => setPresentationText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white outline-none"
              />
            </div>

            {/* HISTORIQUE DE L'ÉCOLE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-slate-500">
                Historique de l'Établissement
              </label>
              <textarea
                rows={3}
                value={historyText}
                onChange={(e) => setHistoryText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white outline-none"
              />
            </div>

            {/* VISION & MISSION */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-slate-500">
                Vision & Mission Pédagogique
              </label>
              <textarea
                rows={3}
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white outline-none"
              />
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: PARAMÈTRES DE CONFIDENTIALITÉ */}
      {activeTab === "privacy" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-sm">
          <div className="border-b pb-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white uppercase flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Paramètres de Confidentialité & Visibilité Réseau</span>
            </h3>
            <p className="text-xs text-slate-500">
              Choisissez précisément quelles informations sont visibles par le public et les autres établissements scolaires de SmartSchool RDC.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* TOGGLE 1: PROFIL PUBLIC OU PRIVÉ */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">☐ Profil Public ou Privé</p>
                <p className="text-xs text-slate-500">Rendre la vitrine de l'établissement accessible aux visiteurs et aux autres écoles.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.isProfilePublic}
                onChange={(e) => setPrivacy(prev => ({ ...prev, isProfilePublic: e.target.checked }))}
                className="h-6 w-6 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* TOGGLE 2: AFFICHER OU MASQUER LES PHOTOS */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">☐ Afficher ou Masquer la Galerie Photo</p>
                <p className="text-xs text-slate-500">Autoriser les visiteurs publics à consulter les photos d'infrastructures et cérémonies.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.showPhotosPublicly}
                onChange={(e) => setPrivacy(prev => ({ ...prev, showPhotosPublicly: e.target.checked }))}
                className="h-6 w-6 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* TOGGLE 3: AFFICHER OU MASQUER LES COORDONNÉES */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">☐ Afficher ou Masquer les Coordonnées de Contact</p>
                <p className="text-xs text-slate-500">Afficher le numéro de téléphone, l'adresse email et l'adresse physique officielle.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.showContactInfoPublicly}
                onChange={(e) => setPrivacy(prev => ({ ...prev, showContactInfoPublicly: e.target.checked }))}
                className="h-6 w-6 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* TOGGLE 4: AUTORISER DEMANDES DE COLLABORATION */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">☐ Autoriser les Demandes de Collaboration Interscolaire</p>
                <p className="text-xs text-slate-500">Permettre aux autres chefs d'établissements de proposer des partenariats.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.allowCollaborationRequests}
                onChange={(e) => setPrivacy(prev => ({ ...prev, allowCollaborationRequests: e.target.checked }))}
                className="h-6 w-6 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* TOGGLE 5: AUTORISER MESSAGES AUTRES ÉCOLES */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">☐ Autoriser la Messagerie Directe Inter-Écoles</p>
                <p className="text-xs text-slate-500">Autoriser la réception de messages officiels des écoles partenaires.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.allowInterSchoolMessages}
                onChange={(e) => setPrivacy(prev => ({ ...prev, allowInterSchoolMessages: e.target.checked }))}
                className="h-6 w-6 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* TOGGLE 6: AUTORISER VISITES DE PROFIL */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">☐ Autoriser les Visites de Profil & Statistique</p>
                <p className="text-xs text-slate-500">Comptabiliser les vues de profil et les interactions dans le répertoire national.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.allowProfileVisits}
                onChange={(e) => setPrivacy(prev => ({ ...prev, allowProfileVisits: e.target.checked }))}
                className="h-6 w-6 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

          </div>
        </div>
      )}

      {/* VIEW 4: LIVE PREVIEW OF PUBLIC PROFILE */}
      {activeTab === "preview" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg space-y-6">
          
          {/* BANNER COVER */}
          <div className="h-48 md:h-64 relative bg-slate-800">
            {coverPhotoUrl ? (
              <img src={coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            
            {/* LOGO & TITLE OVERLAY */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
              <div className="flex items-center space-x-4">
                {schoolLogoUrl ? (
                  <img src={schoolLogoUrl} alt="Logo" className="h-16 w-16 rounded-2xl bg-white p-2 object-contain shadow-xl border-2 border-white" />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-white p-2 flex items-center justify-center text-slate-800 shadow-xl border-2 border-white font-black text-xl">
                    SS
                  </div>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-black uppercase">{schoolName}</h1>
                  {mottoText && <p className="text-xs text-purple-300 font-bold">{mottoText}</p>}
                  <p className="text-[10px] text-slate-300">
                    {[schoolCity, schoolProvince, "République Démocratique du Congo"].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-full">
                  ★ 4.9/5 Satisfaction
                </span>
              </div>
            </div>
          </div>

          {/* PREVIEW CONTENT BODY */}
          <div className="p-6 space-y-6">
            
            {/* PRÉSENTATION & HISTOIRE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border space-y-2">
                <h4 className="font-extrabold text-xs text-purple-600 uppercase">Présentation Officielle</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{presentationText}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border space-y-2">
                <h4 className="font-extrabold text-xs text-purple-600 uppercase">Historique de l'Établissement</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{historyText}</p>
              </div>
            </div>

            {/* GALERIE PHOTOS PUBLIC PREVIEW */}
            {privacy.showPhotosPublicly && (
              <div className="space-y-3">
                <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">Galerie des Infrastructures</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {mediaList.slice(0, 4).map((m) => (
                    <div key={m.id} className="h-28 rounded-xl overflow-hidden relative group border">
                      <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 p-2 flex items-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-white line-clamp-1">{m.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MODAL 1: ADD NEW MEDIA */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Camera className="h-4 w-4 text-purple-600" />
                <span>Ajouter un Média à la Galerie</span>
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMediaSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Titre de la Photo / Vidéo *</label>
                <input
                  type="text"
                  required
                  value={newMediaForm.title}
                  onChange={(e) => setNewMediaForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Laboratoire de Physique-Chimie"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Catégorie d'Infrastructure *</label>
                <select
                  value={newMediaForm.category}
                  onChange={(e) => setNewMediaForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Infrastructures">Infrastructures Générales</option>
                  <option value="Laboratoires">Laboratoires & Informatique</option>
                  <option value="Terrains de Sport">Terrains de Sport</option>
                  <option value="Salles de Classe">Salles de Classe</option>
                  <option value="Bibliothèque">Bibliothèque</option>
                  <option value="Cérémonies">Cérémonies & Événements</option>
                  <option value="Distinctions">Distinctions & Prix</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">URL de l'image ou vidéo (HTTPS) *</label>
                <input
                  type="text"
                  required
                  value={newMediaForm.url}
                  onChange={(e) => setNewMediaForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description Légende</label>
                <textarea
                  rows={2}
                  value={newMediaForm.description}
                  onChange={(e) => setNewMediaForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brève légende d'explication..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Enregistrer & Optimiser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative text-left">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 bg-slate-950/80 text-white rounded-full hover:bg-slate-800 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-96 bg-black flex items-center justify-center overflow-hidden">
              <img src={previewItem.url} alt={previewItem.title} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="p-6 space-y-2 text-white">
              <span className="px-2.5 py-0.5 bg-purple-600 text-[10px] font-black rounded uppercase">
                {previewItem.category}
              </span>
              <h3 className="text-lg font-black">{previewItem.title}</h3>
              <p className="text-xs text-slate-300">{previewItem.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
