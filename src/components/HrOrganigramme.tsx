import React, { useState } from "react";
import { Employee } from "../types";
import { useSmartSchoolCore } from "../context/SmartSchoolCoreContext";
import { Shield, Award, Users, Wrench, Eye, Briefcase, Building, Filter, Search, ChevronDown } from "lucide-react";

interface HrOrganigrammeProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
}

interface HierarchyGroup {
  level: number;
  title: string;
  badgeClass: string;
  icon: React.ElementType;
}

const HIERARCHY_GROUPS: HierarchyGroup[] = [
  { level: 1, title: "NIVEAU 1 : Promoteur, Fondateur & Direction Générale", badgeClass: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800", icon: Shield },
  { level: 2, title: "NIVEAU 2 : Direction Adjointe, Préfecture & Pédagogie", badgeClass: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800", icon: Award },
  { level: 3, title: "NIVEAU 3 : Cadres Administratifs, Comptabilité & Secrétariat", badgeClass: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800", icon: Briefcase },
  { level: 4, title: "NIVEAU 4 : Corps Enseignant, Professeurs & Instructeurs", badgeClass: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800", icon: Users },
  { level: 5, title: "NIVEAU 5 : Services Techniques, Logistique, Santé & Sécurité", badgeClass: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800", icon: Wrench },
  { level: 6, title: "NIVEAU 6 : Agents d'Exécution & Stagiaires", badgeClass: "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700", icon: Building }
];

export function HrOrganigramme({ employees, onSelectEmployee }: HrOrganigrammeProps) {
  const { customFunctions, customServices } = useSmartSchoolCore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("Tous");

  // Helper to determine hierarchy level for an employee
  const getEmployeeLevel = (emp: Employee): number => {
    const fnObj = customFunctions.find(f => f.name.trim().toLowerCase() === emp.function.trim().toLowerCase());
    if (fnObj && fnObj.hierarchyLevel) {
      return fnObj.hierarchyLevel;
    }

    // Fallback based on text heuristics
    const fn = emp.function.toLowerCase();
    const dept = (emp.department || "").toLowerCase();

    if (fn.includes("promoteur") || fn.includes("fondateur") || fn.includes("président")) return 1;
    if (fn.includes("directeur") || fn.includes("préfet") || fn.includes("proviseur") || dept === "direction") return 2;
    if (fn.includes("comptable") || fn.includes("secrétaire") || fn.includes("caissier") || fn.includes("économe") || fn.includes("informaticien") || dept === "administration") return 3;
    if (fn.includes("enseignant") || fn.includes("professeur") || fn.includes("instituteur") || fn.includes("titulaire") || dept === "enseignement") return 4;
    return 5;
  };

  // Helper to retrieve color for an employee function
  const getEmployeeFunctionColor = (emp: Employee): string => {
    const fnObj = customFunctions.find(f => f.name.trim().toLowerCase() === emp.function.trim().toLowerCase());
    return fnObj?.color || "#4f46e5";
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.function} ${emp.matricule}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesService = selectedService === "Tous" || emp.service === selectedService || emp.department === selectedService;
    return matchesSearch && matchesService;
  });

  // Group employees by hierarchy level
  const levelGroups = HIERARCHY_GROUPS.map(group => {
    const groupEmps = filteredEmployees.filter(emp => getEmployeeLevel(emp) === group.level);
    return {
      ...group,
      employees: groupEmps
    };
  }).filter(g => g.employees.length > 0 || searchQuery === "");

  // Render Employee Card Node
  const renderEmployeeNode = (emp: Employee) => {
    const color = getEmployeeFunctionColor(emp);

    return (
      <div 
        key={emp.id}
        onClick={() => onSelectEmployee(emp)}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 w-52 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer text-left space-y-2.5 relative group overflow-hidden"
      >
        {/* Color stripe top */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />

        <div className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 p-1 rounded-md">
          <Eye className="h-3 w-3 text-indigo-600" />
        </div>

        <div className="flex items-center space-x-2.5 pt-1">
          <img src={emp.photoUrl} alt={emp.lastName} className="h-10 w-10 rounded-xl object-cover border border-slate-100 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[8px] font-mono text-indigo-600 uppercase tracking-wider block font-bold leading-tight truncate">
              {emp.matricule}
            </span>
            <h5 className="font-extrabold text-slate-900 dark:text-white text-xs truncate leading-tight font-sans">
              {emp.lastName} {emp.firstName}
            </h5>
            <span className="text-[9px] text-slate-400 block truncate">
              {emp.service || emp.department}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[9px]">
          <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase truncate max-w-[120px] flex items-center gap-1">
            <span className="h-2 w-2 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
            <span className="truncate">{emp.function}</span>
          </span>
          <span className="text-emerald-500 font-mono text-[8px] font-bold shrink-0">● {emp.status}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 overflow-x-auto text-left" id="organigramme-scolaire-canvas">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Organigramme Hiérarchique Dynamique
          </h3>
          <p className="text-xs text-slate-500">
            Arbre hiérarchique de l'établissement articulé automatiquement selon les fonctions et services personnalisés.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Chercher agent..."
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium"
            />
          </div>

          <select
            value={selectedService}
            onChange={e => setSelectedService(e.target.value)}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
          >
            <option value="Tous">Tous les services</option>
            {customServices.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tree hierarchy visualization */}
      <div className="flex flex-col items-center space-y-8 min-w-[750px] py-4">
        {levelGroups.map((group, idx) => {
          const GroupIcon = group.icon;

          return (
            <React.Fragment key={group.level}>
              {idx > 0 && <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-700" />}

              <div className="flex flex-col items-center space-y-3 w-full" id={`organigramme-level-${group.level}`}>
                {/* Level Title Badge */}
                <div className={`flex items-center space-x-2 text-[10px] font-black uppercase px-3 py-1 rounded-full border shadow-xs ${group.badgeClass}`}>
                  <GroupIcon className="h-3.5 w-3.5" />
                  <span>{group.title}</span>
                  <span className="ml-1 px-1.5 py-0.2 bg-white/80 dark:bg-black/40 rounded-full font-mono text-[9px]">
                    {group.employees.length}
                  </span>
                </div>

                {/* Level Nodes */}
                <div className="flex flex-wrap justify-center gap-4 max-w-5xl">
                  {group.employees.length > 0 ? (
                    group.employees.map(emp => renderEmployeeNode(emp))
                  ) : (
                    <div className="bg-slate-100 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-center text-[10px] text-slate-400 w-48 italic">
                      Aucun agent enregistré à ce niveau hiérarchique
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
