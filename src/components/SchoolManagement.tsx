import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Layers, 
  GraduationCap, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sliders, 
  Activity, 
  Sparkles, 
  Trash2, 
  Award,
  Briefcase,
  LayoutDashboard,
  Bookmark,
  Calendar,
  Lock,
  FileSignature
} from "lucide-react";
import { School } from "../types";
import { SchoolSetupWizard } from "./SchoolSetupWizard";

interface SchoolManagementProps {
  schools: School[];
  activeSchoolId: string;
  onSelectSchool: (id: string) => void;
  onAddSchool: (newSchool: School) => void;
  onDeleteSchool?: (id: string) => void;
  onUpdateSchool?: (updatedSchool: School) => void;
  lang?: "fr" | "ln" | "sw";
}

export function SchoolManagement({ 
  schools, 
  activeSchoolId, 
  onSelectSchool, 
  onAddSchool,
  onDeleteSchool,
  onUpdateSchool,
  lang = "fr" 
}: SchoolManagementProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("Tous");
  const [filterProvince, setFilterProvince] = useState<string>("Toutes");

  // State hooks for editing school
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editName, setEditName] = useState("");
  const [editMotto, setEditMotto] = useState("");
  const [editProvince, setEditProvince] = useState("");
  const [editVille, setEditVille] = useState("");
  const [editCommune, setEditCommune] = useState("");
  const [editAdresse, setEditAdresse] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editType, setEditType] = useState<"Public" | "Privé" | "Conventionné">("Privé");
  const [editConvention, setEditConvention] = useState("");

  // Dynamic calculations
  const totalSchools = schools.length;
  const activeSchool = schools.find(s => s.id === activeSchoolId) || schools[0];

  // Extraction of unique provinces and types for filters
  const provinces = ["Toutes", ...Array.from(new Set(schools.map(s => s.province).filter(Boolean)))];
  const types = ["Tous", "Public", "Privé", "Conventionné"];

  // Filtering of schools list
  const filteredSchools = schools.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.commune || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.codeNational || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "Tous" || s.type === filterType;
    const matchesProvince = filterProvince === "Toutes" || s.province === filterProvince;
    return matchesSearch && matchesType && matchesProvince;
  });

  const handleWizardComplete = (newSchool: School) => {
    onAddSchool(newSchool);
    setShowWizard(false);
  };

  const handleStartEdit = (school: School) => {
    setEditingSchool(school);
    setEditName(school.name);
    setEditMotto(school.motto || "");
    setEditProvince(school.province || "");
    setEditVille(school.ville || "");
    setEditCommune(school.commune || "");
    setEditAdresse(school.adresseComplete || "");
    setEditPhone(school.phonePrincipal || "");
    setEditEmail(school.contactEmail || "");
    setEditWebsite(school.website || "");
    setEditType(school.type || "Privé");
    setEditConvention(school.conventionType || "Non conventionné");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;

    const updatedSchool: School = {
      ...editingSchool,
      name: editName,
      motto: editMotto || undefined,
      province: editProvince,
      ville: editVille,
      commune: editCommune,
      adresseComplete: editAdresse,
      phonePrincipal: editPhone,
      contactEmail: editEmail,
      website: editWebsite || undefined,
      type: editType,
      conventionType: editType === "Conventionné" ? editConvention : "Non conventionné"
    };

    if (onUpdateSchool) {
      onUpdateSchool(updatedSchool);
    }
    setEditingSchool(null);
  };

  // Simulated metrics for each school to render realistic dashboard counters
  const getSimulatedMetrics = (school: School) => {
    // If it's the initial default school
    if (school.id === "default" || school.name.includes("Prince de Liège")) {
      return { students: 680, teachers: 32, classes: 18, options: 4, efficiency: "94.8%" };
    }
    // Determinist random metrics based on school name length
    const factor = school.name.length;
    const students = 150 + (factor * 8) % 300;
    const teachers = Math.round(students / 15);
    const classes = Math.round(students / 25);
    return {
      students,
      teachers,
      classes,
      options: school.options?.length || 3,
      efficiency: `${88 + (factor % 11)}%`
    };
  };

  if (showWizard) {
    return (
      <SchoolSetupWizard 
        onComplete={handleWizardComplete} 
        onCancel={() => setShowWizard(false)}
        lang={lang}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* SaaS Dashboard Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="h-7 w-7 text-indigo-600" />
            <span>Gestion des Établissements Scolaires</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gérez le parc d'établissements raccordés à SmartSchool RDC. Basculez d'un espace de travail à l'autre en un clic.
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-2xl transition-all shadow-md hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span className="text-xs">Ajouter un Établissement</span>
        </button>
      </div>

      {/* Global SaaS Dashboard Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Établissements", val: totalSchools, color: "border-indigo-100 bg-indigo-50/20 text-indigo-700", icon: Building },
          { label: "Effectif Global Apprenants", val: schools.reduce((acc, s) => acc + getSimulatedMetrics(s).students, 0), color: "border-emerald-100 bg-emerald-50/20 text-emerald-700", icon: GraduationCap },
          { label: "Total Corps Enseignant", val: schools.reduce((acc, s) => acc + getSimulatedMetrics(s).teachers, 0), color: "border-amber-100 bg-amber-50/20 text-amber-700", icon: Users },
          { label: "Taux de Couverture Éducative", val: "97.4%", color: "border-purple-100 bg-purple-50/20 text-purple-700", icon: Activity }
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className={`p-4 rounded-2xl border ${m.color} text-left space-y-2 shadow-xs`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{m.label}</span>
                <Icon className="h-4 w-4 opacity-75" />
              </div>
              <p className="text-xl font-black">{m.val}</p>
            </div>
          );
        })}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-2xl shadow-xs text-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, commune, code national..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-bold hidden sm:inline">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold"
              >
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-bold hidden sm:inline">Province:</span>
              <select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold"
              >
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of schools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => {
          const isActive = school.id === activeSchoolId;
          const metrics = getSimulatedMetrics(school);
          
          return (
            <div 
              key={school.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden transition-all flex flex-col justify-between shadow-sm hover:shadow-md relative ${
                isActive 
                  ? "border-indigo-500 ring-2 ring-indigo-500/20" 
                  : "border-slate-200/60 dark:border-slate-800/80"
              }`}
            >
              {/* Badge indicating active workspace */}
              {isActive && (
                <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Actif</span>
                </div>
              )}

              {/* Card top banner style */}
              <div className="p-5 text-left border-b border-slate-100 dark:border-slate-800/60 space-y-4 flex-1">
                <div className="flex items-center space-x-3.5">
                  {school.logoUrl ? (
                    <img 
                      src={school.logoUrl} 
                      alt={school.name} 
                      className="w-12 h-12 rounded-xl object-cover border" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 uppercase">
                      {school.name.substring(0,2)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight leading-snug truncate" title={school.name}>
                      {school.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 italic truncate">
                      {school.motto ? `"${school.motto}"` : "Pas de devise définie"}
                    </p>
                  </div>
                </div>

                {/* Characteristics with small icons */}
                <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{school.adresseComplete || `${school.commune}, ${school.ville}`}</span>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-[10px]">
                    <Bookmark className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>CODE NAT : {school.codeNational || "N/A"}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Année Scolaire : <strong className="text-indigo-600 dark:text-indigo-400 font-black">{school.schoolYear || "2025-2026"}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      school.type === "Public" 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" 
                        : school.type === "Conventionné"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    }`}>
                      {school.type || "Privé"}
                    </span>
                    {school.conventionType && school.conventionType !== "Non conventionné" && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-bold">
                        {school.conventionType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom stats row for each school */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-800/80 text-left">
                <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-3">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Élèves</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{metrics.students}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Enseignants</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{metrics.teachers}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Classes</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{metrics.classes}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleStartEdit(school)}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/25 transition-all cursor-pointer"
                      title="Modifier les informations"
                    >
                      <FileSignature className="h-4 w-4" />
                    </button>
                    {onDeleteSchool && school.id !== "default" && !isActive && (
                      <button
                        onClick={() => onDeleteSchool(school.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                        title="Supprimer cet établissement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectSchool(school.id)}
                    disabled={isActive}
                    className={`flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-400 cursor-not-allowed border border-indigo-100 dark:border-indigo-950" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:scale-[1.03]"
                    }`}
                  >
                    <span>{isActive ? "Espace actif" : "Ouvrir l'Espace"}</span>
                    {!isActive && <ArrowRight className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSchools.length === 0 && (
          <div className="col-span-full py-12 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl">
            <Building className="h-10 w-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Aucun établissement ne correspond aux critères</p>
              <p className="text-[10px] text-slate-400">Modifiez vos filtres de recherche ou créez une nouvelle école.</p>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL FOR SCHOOL DETAILS */}
      <AnimatePresence>
        {editingSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingSchool(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl z-10 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-indigo-500" />
                    <span>Modifier l'Établissement</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mettez à jour les informations administratives de l'école.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Fermer
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nom officiel de l'établissement</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Devise</label>
                    <input
                      type="text"
                      value={editMotto}
                      onChange={(e) => setEditMotto(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Province</label>
                    <input
                      type="text"
                      value={editProvince}
                      onChange={(e) => setEditProvince(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ville</label>
                    <input
                      type="text"
                      value={editVille}
                      onChange={(e) => setEditVille(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Commune</label>
                    <input
                      type="text"
                      value={editCommune}
                      onChange={(e) => setEditCommune(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Adresse physique complète</label>
                  <input
                    type="text"
                    value={editAdresse}
                    onChange={(e) => setEditAdresse(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Téléphone principal</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email (facultatif)</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Site Web (facultatif)</label>
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Type d'établissement</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold outline-none"
                    >
                      <option value="Public">Public</option>
                      <option value="Privé">Privé</option>
                      <option value="Conventionné">Conventionné</option>
                    </select>
                  </div>

                  {editType === "Conventionné" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Convention Religieuse</label>
                      <input
                        type="text"
                        value={editConvention}
                        onChange={(e) => setEditConvention(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingSchool(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
