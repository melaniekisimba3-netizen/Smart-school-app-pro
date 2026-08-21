import React, { useState } from "react";
import { Employee, CustomFunction, CustomService } from "../types";
import { useSmartSchoolCore } from "../context/SmartSchoolCoreContext";
import { 
  Briefcase, 
  Building, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  Lock, 
  Layers, 
  Sparkles, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert,
  Users,
  Eye,
  Sliders,
  RefreshCw,
  Palette
} from "lucide-react";
import { motion } from "motion/react";

interface HrFunctionsManagementProps {
  employees: Employee[];
  userRole: string;
  userName: string;
  onAddAuditLog: (action: string, targetName: string) => void;
}

const PRESET_COLORS = [
  "#4f46e5", // Indigo
  "#0284c7", // Sky blue
  "#059669", // Emerald
  "#d97706", // Amber
  "#7c3aed", // Violet
  "#dc2626", // Red
  "#16a34a", // Green
  "#e11d48", // Rose
  "#2563eb", // Blue
  "#ea580c", // Orange
  "#9333ea", // Purple
  "#64748b"  // Slate
];

const AVAILABLE_PERMISSIONS = [
  { key: "manage_students", label: "Gestion Élèves & Inscriptions", desc: "Créer/modifier fiches élèves, certificats et inscriptions" },
  { key: "grade_entry", label: "Encodage & Saisie des Notes", desc: "Accès au journal de classe, saisie des points et bulletins" },
  { key: "manage_hr", label: "Gestion RH & Personnel", desc: "Créer dossiers agents, contrats, congés et cartes" },
  { key: "manage_finances", label: "Comptabilité & Caisse", desc: "Encaisser frais, Mobile Money, caisse et rapports financiers" },
  { key: "manage_payroll", label: "Gestion de la Paie", desc: "Calcul des salaires, primes, avances et fiches de paie" },
  { key: "manage_discipline", label: "Discipline & Conduite", desc: "Signaler avertissements, blâmes, exclusions et présences" },
  { key: "manage_inventory", label: "Inventaire & Equipements", desc: "Matériel informatique, livres de bibliothèque et laboratoire" },
  { key: "view_reports", label: "Rapports & Statistiques", desc: "Consultation des tableaux de bord et états généraux" },
  { key: "system_admin", label: "Administration Système Global", desc: "Droit de configuration générale, rôles et sécurité" }
];

const HIERARCHY_LABELS: Record<number, { title: string; badgeClass: string }> = {
  1: { title: "Niveau 1 - Direction Générale / Fondateurs", badgeClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300" },
  2: { title: "Niveau 2 - Direction Adjointe / Préfecture", badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300" },
  3: { title: "Niveau 3 - Cadres & Administration", badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300" },
  4: { title: "Niveau 4 - Corps Enseignant & Pédagogie", badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300" },
  5: { title: "Niveau 5 - Services Techniques & Support", badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300" },
  6: { title: "Niveau 6 - Agents d'Exécution & Sécurité", badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" }
};

export function HrFunctionsManagement({
  employees,
  userRole,
  userName,
  onAddAuditLog
}: HrFunctionsManagementProps) {
  const { 
    customServices, 
    customFunctions, 
    addCustomService, 
    updateCustomService, 
    toggleCustomServiceStatus, 
    deleteCustomService,
    addCustomFunction,
    updateCustomFunction,
    toggleCustomFunctionStatus,
    deleteCustomFunction
  } = useSmartSchoolCore();

  // Active Tab: "fonctions" | "services" | "rbac"
  const [activeTab, setActiveTab] = useState<"fonctions" | "services" | "rbac">("fonctions");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tous");
  const [serviceFilter, setServiceFilter] = useState("Tous");

  // Modal Function State
  const [isFunctionModalOpen, setIsFunctionModalOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<CustomFunction | null>(null);
  const [funcForm, setFuncForm] = useState({
    name: "",
    code: "",
    category: "Administration",
    serviceName: customServices[0]?.name || "Direction Générale",
    hierarchyLevel: 3,
    description: "",
    color: "#4f46e5",
    status: "Actif" as "Actif" | "Inactif",
    permissions: [] as string[]
  });

  // Modal Service State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    code: "",
    description: "",
    headEmployeeId: "",
    status: "Actif" as "Actif" | "Inactif"
  });

  // Check RBAC / Authorization
  const isAuthorized = ["Directeur", "Promoteur", "Propriétaire", "Super Administrateur", "Responsable RH"].some(
    r => userRole.toLowerCase().includes(r.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-3xl p-8 text-center space-y-4 max-w-2xl mx-auto my-12" id="functions-rbac-denied">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-rose-900 dark:text-rose-200 uppercase tracking-tight">Accès Restreint - Centre de Gestion des Fonctions</h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 max-w-md mx-auto">
            Seuls le Directeur, le Promoteur ou les administrateurs autorisés par le Propriétaire de l'établissement peuvent ajouter, modifier ou attribuer les fonctions et services de l'école.
          </p>
        </div>
        <div className="pt-2 text-[10px] font-mono text-rose-500 uppercase">
          Votre Rôle Actuel : <span className="font-bold underline">{userRole}</span>
        </div>
      </div>
    );
  }

  // Handle Open Function Modal for Create
  const handleOpenNewFunctionModal = () => {
    setEditingFunction(null);
    setFuncForm({
      name: "",
      code: `FNC-${Math.floor(10 + Math.random() * 89)}`,
      category: "Administration",
      serviceName: customServices[0]?.name || "Direction Générale",
      hierarchyLevel: 3,
      description: "",
      color: "#4f46e5",
      status: "Actif",
      permissions: ["manage_students"]
    });
    setIsFunctionModalOpen(true);
  };

  // Handle Open Function Modal for Edit
  const handleOpenEditFunctionModal = (fn: CustomFunction) => {
    setEditingFunction(fn);
    setFuncForm({
      name: fn.name,
      code: fn.code,
      category: fn.category,
      serviceName: fn.serviceName,
      hierarchyLevel: fn.hierarchyLevel || 3,
      description: fn.description || "",
      color: fn.color || "#4f46e5",
      status: fn.status,
      permissions: fn.permissions || []
    });
    setIsFunctionModalOpen(true);
  };

  // Save Function
  const handleSaveFunction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcForm.name.trim()) {
      alert("⚠️ Le nom de la fonction est obligatoire !");
      return;
    }

    if (editingFunction) {
      updateCustomFunction({
        ...editingFunction,
        ...funcForm
      });
      onAddAuditLog("Modification de fonction", `${funcForm.name} (${funcForm.code})`);
      alert(`✅ Fonction "${funcForm.name}" mise à jour avec succès !`);
    } else {
      addCustomFunction(funcForm);
      onAddAuditLog("Création de fonction", `${funcForm.name} (${funcForm.code})`);
      alert(`✅ Nouvelle fonction "${funcForm.name}" créée et ajoutée au registre !`);
    }

    setIsFunctionModalOpen(false);
  };

  // Delete Function
  const handleDeleteFunction = (fn: CustomFunction) => {
    if (confirm(`Voulez-vous vraiment supprimer la fonction "${fn.name}" ?`)) {
      const res = deleteCustomFunction(fn.id, employees);
      if (res.success) {
        onAddAuditLog("Suppression de fonction", `${fn.name}`);
        alert(`✅ ${res.message}`);
      } else {
        alert(`⚠️ ${res.message}`);
      }
    }
  };

  // Handle Open Service Modal for Create
  const handleOpenNewServiceModal = () => {
    setEditingService(null);
    setServiceForm({
      name: "",
      code: `SERV-${Math.floor(100 + Math.random() * 899)}`,
      description: "",
      headEmployeeId: "",
      status: "Actif"
    });
    setIsServiceModalOpen(true);
  };

  // Handle Open Service Modal for Edit
  const handleOpenEditServiceModal = (serv: CustomService) => {
    setEditingService(serv);
    setServiceForm({
      name: serv.name,
      code: serv.code,
      description: serv.description || "",
      headEmployeeId: serv.headEmployeeId || "",
      status: serv.status
    });
    setIsServiceModalOpen(true);
  };

  // Save Service
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      alert("⚠️ Le nom du service est obligatoire !");
      return;
    }

    if (editingService) {
      updateCustomService({
        ...editingService,
        ...serviceForm
      });
      onAddAuditLog("Modification de service", `${serviceForm.name}`);
      alert(`✅ Service "${serviceForm.name}" mis à jour avec succès !`);
    } else {
      addCustomService(serviceForm);
      onAddAuditLog("Création de service", `${serviceForm.name}`);
      alert(`✅ Nouveau service "${serviceForm.name}" créé avec succès !`);
    }

    setIsServiceModalOpen(false);
  };

  // Delete Service
  const handleDeleteService = (serv: CustomService) => {
    if (confirm(`Voulez-vous supprimer le service "${serv.name}" ?`)) {
      const res = deleteCustomService(serv.id, employees);
      if (res.success) {
        onAddAuditLog("Suppression de service", `${serv.name}`);
        alert(`✅ ${res.message}`);
      } else {
        alert(`⚠️ ${res.message}`);
      }
    }
  };

  // Filtered Functions List
  const filteredFunctions = customFunctions.filter(fn => {
    const matchesSearch = fn.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          fn.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fn.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "Tous" || fn.category === categoryFilter;
    const matchesService = serviceFilter === "Tous" || fn.serviceName === serviceFilter;
    return matchesSearch && matchesCategory && matchesService;
  });

  // Extract Categories
  const categoriesList = Array.from(new Set(customFunctions.map(f => f.category)));

  return (
    <div className="space-y-6 text-left" id="hr-functions-management-center">
      
      {/* BANNER HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Centre Dynamique des Fonctions RH
            </span>
            <span className="text-slate-400 text-xs font-mono">• Contrôle d'Accès IAM & RBAC</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            Gestion des Fonctions & Services
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configurez sur mesure les postes de travail, niveaux hiérarchiques, services rattachés et permissions RBAC pour tout le personnel de l'école.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleOpenNewFunctionModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Fonction</span>
          </button>

          <button
            onClick={handleOpenNewServiceModal}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Building className="h-4 w-4 text-emerald-600" />
            <span>Nouveau Service</span>
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex bg-slate-200/80 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-300/60 dark:border-slate-800 max-w-2xl">
        <button
          onClick={() => setActiveTab("fonctions")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === "fonctions"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Fonctions ({customFunctions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("services")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === "services"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Services ({customServices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("rbac")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeTab === "rbac"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Matrice RBAC</span>
        </button>
      </div>

      {/* TAB 1: FONCTIONS DE L'ÉTABLISSEMENT */}
      {activeTab === "fonctions" && (
        <div className="space-y-4 animate-fade-in">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher une fonction, code ou service..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-400 text-[10px] uppercase">Catégorie:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
              >
                <option value="Tous">Toutes les catégories</option>
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <span className="font-bold text-slate-400 text-[10px] uppercase ml-2">Service:</span>
              <select
                value={serviceFilter}
                onChange={e => setServiceFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
              >
                <option value="Tous">Tous les services</option>
                {customServices.map(serv => <option key={serv.id} value={serv.name}>{serv.name}</option>)}
              </select>
            </div>
          </div>

          {/* FUNCTIONS GRID CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFunctions.map(fn => {
              const assignedCount = employees.filter(e => e.function.trim().toLowerCase() === fn.name.trim().toLowerCase()).length;
              const hInfo = HIERARCHY_LABELS[fn.hierarchyLevel] || { title: `Niveau ${fn.hierarchyLevel}`, badgeClass: "bg-slate-100 text-slate-700" };

              return (
                <div 
                  key={fn.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    {/* Top bar with color badge & status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="h-3.5 w-3.5 rounded-full inline-block shadow-xs" 
                          style={{ backgroundColor: fn.color || "#4f46e5" }}
                        />
                        <span className="font-mono text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md">
                          {fn.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {fn.category}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleCustomFunctionStatus(fn.id)}
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-all cursor-pointer ${
                          fn.status === "Actif"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                        }`}
                        title="Cliquer pour basculer le statut Actif/Inactif"
                      >
                        ● {fn.status}
                      </button>
                    </div>

                    {/* Function Name & Service */}
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {fn.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>Service: {fn.serviceName}</span>
                      </p>
                    </div>

                    {/* Description */}
                    {fn.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-950 p-2 rounded-xl">
                        "{fn.description}"
                      </p>
                    )}

                    {/* Hierarchy Level Badge */}
                    <div>
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider inline-block ${hInfo.badgeClass}`}>
                        {hInfo.title}
                      </span>
                    </div>

                    {/* RBAC Permissions Badges */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Permissions RBAC Rattachées:</span>
                      <div className="flex flex-wrap gap-1">
                        {fn.permissions && fn.permissions.length > 0 ? (
                          fn.permissions.map(pKey => {
                            const foundPerm = AVAILABLE_PERMISSIONS.find(ap => ap.key === pKey);
                            return (
                              <span key={pKey} className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded">
                                {foundPerm ? foundPerm.label.split(" ")[0] : pKey}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Aucune droit spécial accordé</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Agents Count & Action buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 text-[11px] flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{assignedCount} agent(s)</span>
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditFunctionModal(fn)}
                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 rounded-xl transition-all cursor-pointer"
                        title="Modifier cette fonction"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteFunction(fn)}
                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 rounded-xl transition-all cursor-pointer"
                        title="Supprimer cette fonction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SERVICES & DÉPARTEMENTS */}
      {activeTab === "services" && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customServices.map(serv => {
              const attachedFns = customFunctions.filter(f => f.serviceName.toLowerCase() === serv.name.toLowerCase() || f.serviceId === serv.id);
              const assignedEmps = employees.filter(e => e.service?.toLowerCase() === serv.name.toLowerCase() || e.department?.toLowerCase() === serv.name.toLowerCase());
              const headEmp = employees.find(e => e.id === serv.headEmployeeId);

              return (
                <div 
                  key={serv.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                        {serv.code}
                      </span>

                      <button
                        onClick={() => toggleCustomServiceStatus(serv.id)}
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-all cursor-pointer ${
                          serv.status === "Actif"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                        }`}
                      >
                        ● {serv.status}
                      </button>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {serv.name}
                      </h4>
                      {serv.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {serv.description}
                        </p>
                      )}
                    </div>

                    {/* Head Employee if assigned */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Responsable du Service:</span>
                      {headEmp ? (
                        <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
                          {headEmp.photoUrl ? (
                            <img src={headEmp.photoUrl} className="h-5 w-5 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[8px] font-bold">
                              {headEmp.firstName[0]}
                            </div>
                          )}
                          <span>{headEmp.lastName} {headEmp.firstName} ({headEmp.function})</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Non désigné</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex space-x-3 text-[11px] font-bold text-slate-500">
                      <span>{attachedFns.length} fonction(s)</span>
                      <span>•</span>
                      <span>{assignedEmps.length} agent(s)</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditServiceModal(serv)}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all cursor-pointer"
                        title="Modifier le service"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteService(serv)}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-all cursor-pointer"
                        title="Supprimer le service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MATRICE RBAC DES FONCTIONS */}
      {activeTab === "rbac" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Matrice de Sécurité & Habilitations RBAC des Fonctions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Vue d'ensemble synthétique des droits et accès système accordés à chaque poste de travail au sein de SmartSchool RDC.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <th className="p-3 font-extrabold text-slate-700 dark:text-slate-300">Fonction / Poste</th>
                  <th className="p-3 font-extrabold text-slate-700 dark:text-slate-300">Service</th>
                  {AVAILABLE_PERMISSIONS.map(p => (
                    <th key={p.key} className="p-3 font-extrabold text-slate-700 dark:text-slate-300 text-center min-w-[100px]" title={p.desc}>
                      {p.label.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customFunctions.map(fn => (
                  <tr key={fn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fn.color || "#4f46e5" }} />
                      <span>{fn.name}</span>
                      <span className="text-[9px] font-mono text-slate-400">({fn.code})</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-500">{fn.serviceName}</td>
                    {AVAILABLE_PERMISSIONS.map(p => {
                      const hasPerm = fn.permissions && fn.permissions.includes(p.key);
                      return (
                        <td key={p.key} className="p-3 text-center">
                          {hasPerm ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-full font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-6 w-6 text-slate-300 dark:text-slate-700">
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FUNCTION (CREATE / EDIT) */}
      {isFunctionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl w-full text-left space-y-6 my-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editingFunction ? "Modifier la Fonction" : "Créer une Nouvelle Fonction"}
                  </h3>
                  <p className="text-xs text-slate-500">Configurez le titre de poste, le service et les droits RBAC.</p>
                </div>
              </div>

              <button
                onClick={() => setIsFunctionModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFunction} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nom de la fonction *</label>
                  <input
                    required
                    type="text"
                    value={funcForm.name}
                    onChange={e => setFuncForm({...funcForm, name: e.target.value})}
                    placeholder="Ex: Préfet des Études, Comptable Principal..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Code interne *</label>
                  <input
                    required
                    type="text"
                    value={funcForm.code}
                    onChange={e => setFuncForm({...funcForm, code: e.target.value.toUpperCase()})}
                    placeholder="Ex: DIR-01, ENS-02..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Catégorie RH</label>
                  <select
                    value={funcForm.category}
                    onChange={e => setFuncForm({...funcForm, category: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Enseignement">Enseignement</option>
                    <option value="Comptabilité">Comptabilité & Finance</option>
                    <option value="Discipline">Discipline & Surveillance</option>
                    <option value="Technique">Technique & Informatique</option>
                    <option value="Santé">Santé & Infirmerie</option>
                    <option value="Sécurité">Sécurité & Gardiennage</option>
                    <option value="Entretien">Entretien & Maintenance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Service rattaché</label>
                  <select
                    value={funcForm.serviceName}
                    onChange={e => setFuncForm({...funcForm, serviceName: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold text-indigo-600 dark:text-indigo-400"
                  >
                    {customServices.map(serv => (
                      <option key={serv.id} value={serv.name}>{serv.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Niveau hiérarchique organigramme</label>
                  <select
                    value={funcForm.hierarchyLevel}
                    onChange={e => setFuncForm({...funcForm, hierarchyLevel: parseInt(e.target.value)})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value={1}>Niveau 1 - Direction Générale / Fondateurs</option>
                    <option value={2}>Niveau 2 - Direction Adjointe / Préfecture / Inspection</option>
                    <option value={3}>Niveau 3 - Cadres & Administration (Comptabilité, Secrétariat)</option>
                    <option value={4}>Niveau 4 - Corps Enseignant & Pédagogie</option>
                    <option value={5}>Niveau 5 - Services Techniques, Support & Sécurité</option>
                    <option value={6}>Niveau 6 - Agents d'Exécution & Stagiaires</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Couleur d'identification</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={funcForm.color}
                      onChange={e => setFuncForm({...funcForm, color: e.target.value})}
                      className="h-10 w-12 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer p-0.5"
                    />
                    <div className="flex flex-wrap gap-1">
                      {PRESET_COLORS.slice(0, 6).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFuncForm({...funcForm, color: c})}
                          className="h-6 w-6 rounded-md border border-slate-200 shadow-xs cursor-pointer"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description du poste & responsabilités</label>
                <textarea
                  rows={2}
                  value={funcForm.description}
                  onChange={e => setFuncForm({...funcForm, description: e.target.value})}
                  placeholder="Brève description de la mission et des attributions..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              {/* RBAC PERMISSIONS CHECKBOXES */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase text-[11px] flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <span>Habilitations & Droits RBAC Assignés</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (funcForm.permissions.length === AVAILABLE_PERMISSIONS.length) {
                        setFuncForm({...funcForm, permissions: []});
                      } else {
                        setFuncForm({...funcForm, permissions: AVAILABLE_PERMISSIONS.map(p => p.key)});
                      }
                    }}
                    className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    {funcForm.permissions.length === AVAILABLE_PERMISSIONS.length ? "Tout décocher" : "Tout cocher"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  {AVAILABLE_PERMISSIONS.map(p => {
                    const isChecked = funcForm.permissions.includes(p.key);
                    return (
                      <label 
                        key={p.key}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2 ${
                          isChecked 
                            ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setFuncForm({...funcForm, permissions: [...funcForm.permissions, p.key]});
                            } else {
                              setFuncForm({...funcForm, permissions: funcForm.permissions.filter(k => k !== p.key)});
                            }
                          }}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="font-bold block leading-tight text-[11px]">{p.label}</span>
                          <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">{p.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFunctionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {editingFunction ? "Enregistrer les modifications" : "Créer la fonction"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL SERVICE (CREATE / EDIT) */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full text-left space-y-6"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editingService ? "Modifier le Service" : "Nouveau Service"}
                  </h3>
                  <p className="text-xs text-slate-500">Service ou département administratif/pédagogique.</p>
                </div>
              </div>

              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nom du service *</label>
                <input
                  required
                  type="text"
                  value={serviceForm.name}
                  onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                  placeholder="Ex: Direction, Préfecture, Laboratoire, Transport..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Code service *</label>
                <input
                  required
                  type="text"
                  value={serviceForm.code}
                  onChange={e => setServiceForm({...serviceForm, code: e.target.value.toUpperCase()})}
                  placeholder="Ex: SERV-DIR, SERV-PREF..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Responsable du service (Optionnel)</label>
                <select
                  value={serviceForm.headEmployeeId}
                  onChange={e => setServiceForm({...serviceForm, headEmployeeId: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                >
                  <option value="">-- Aucun responsable affecté --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.lastName} {emp.firstName} ({emp.function})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={e => setServiceForm({...serviceForm, description: e.target.value})}
                  placeholder="Mission principale du service..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
