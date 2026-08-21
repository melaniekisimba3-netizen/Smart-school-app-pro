import React, { useState, useMemo } from "react";
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Filter, 
  Users, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  RefreshCw, 
  Calendar, 
  Building, 
  ChevronRight, 
  Eye, 
  Award, 
  UserCheck, 
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Settings,
  Sliders
} from "lucide-react";
import { Student, Employee } from "../types";
import { PrintPreviewModal, PrintableDocumentType } from "./PrintPreviewModal";
import { useSmartSchoolCore } from "../context/SmartSchoolCoreContext";
import { PrintTemplateCenter } from "./PrintTemplateCenter";

interface OfficialListsPrintingCenterProps {
  students?: Student[];
  employees?: Employee[];
  schoolName?: string;
  schoolYear?: string;
  logoUrl?: string;
  drapeauUrl?: string;
  armoiriesUrl?: string;
  userRole?: string;
}

export function OfficialListsPrintingCenter({
  students = [],
  employees = [],
  schoolName = "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
  schoolYear = "2026-2027",
  logoUrl,
  drapeauUrl,
  armoiriesUrl,
  userRole = "Directeur"
}: OfficialListsPrintingCenterProps) {

  const { 
    exportStudentsExcel, 
    exportEmployeesExcel, 
    exportStudentsPDF, 
    exportEmployeesPDF, 
    printDedicatedTable 
  } = useSmartSchoolCore();

  // Main view mode: "listes" | "templates"
  const [mainViewMode, setMainViewMode] = useState<"listes" | "templates">("listes");

  // Selected Category: "eleves" | "enseignants" | "personnel"
  const [activeCategory, setActiveCategory] = useState<"eleves" | "enseignants" | "personnel">("eleves");

  // Filter Sub-Types for Élèves
  const [studentFilterType, setStudentFilterType] = useState<string>("tous");
  const [selectedCycle, setSelectedCycle] = useState<string>("Tous");
  const [selectedOption, setSelectedOption] = useState<string>("Toutes");
  const [selectedClass, setSelectedClass] = useState<string>("Toutes");
  const [selectedGender, setSelectedGender] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter Sub-Types for Enseignants
  const [teacherFilterType, setTeacherFilterType] = useState<string>("tous");
  const [selectedSubject, setSelectedSubject] = useState<string>("Toutes");

  // Filter Sub-Types for Personnel
  const [staffFilterType, setStaffFilterType] = useState<string>("tous");

  // Print Preview Modal State
  const [printModal, setPrintModal] = useState<{ isOpen: boolean; docType: PrintableDocumentType; data: any; title: string }>({
    isOpen: false,
    docType: "liste_classe",
    data: null,
    title: ""
  });

  // Default Mock Students if array empty
  const activeStudentsList = useMemo(() => {
    if (students && students.length > 0) return students;
    // Fallback enriched list
    return [
      { id: "ELE-001", registrationNumber: "2026-KIN-001", firstName: "Jean", lastName: "KABAMBA MUKENDI", gender: "M", className: "6ème Scientifique A", optionName: "Chimie-Biologie", status: "Actif", parentName: "Mukendi Thomas", parentPhone: "+243 81 223 3445", levelCategory: "Secondaire" },
      { id: "ELE-002", registrationNumber: "2026-KIN-002", firstName: "Grace", lastName: "TSHILOMBA MWAMBA", gender: "F", className: "6ème Scientifique A", optionName: "Chimie-Biologie", status: "Actif", parentName: "Mwamba Joseph", parentPhone: "+243 82 990 1122", levelCategory: "Secondaire" },
      { id: "ELE-003", registrationNumber: "2026-KIN-003", firstName: "Marc", lastName: "MUKUNA MBAYA", gender: "M", className: "6ème Pedagogique", optionName: "Pédagogie Générale", status: "Transféré", parentName: "Mbaya Henri", parentPhone: "+243 99 887 6655", levelCategory: "Secondaire" },
      { id: "ELE-004", registrationNumber: "2026-KIN-004", firstName: "Divine", lastName: "NSIMBA LUZOLO", gender: "F", className: "3ème Primaire A", optionName: "Primaire Général", status: "Actif", parentName: "Luzolo Pierre", parentPhone: "+243 85 443 2211", levelCategory: "Primaire" },
      { id: "ELE-005", registrationNumber: "2026-KIN-005", firstName: "Emmanuel", lastName: "KAPINGA ILUNGA", gender: "M", className: "6ème Math-Physique", optionName: "Mathématique-Physique", status: "Exclu", parentName: "Ilunga Paul", parentPhone: "+243 81 000 9988", levelCategory: "Secondaire" },
      { id: "ELE-006", registrationNumber: "2026-KIN-006", firstName: "Blandine", lastName: "KANYINDA LUMBALA", gender: "F", className: "2ème Maternelle B", optionName: "Maternelle", status: "Actif", parentName: "Lumbala Eric", parentPhone: "+243 97 123 4567", levelCategory: "Maternelle" }
    ] as Student[];
  }, [students]);

  // Default Mock Employees if array empty
  const activeEmployeesList = useMemo(() => {
    if (employees && employees.length > 0) return employees;
    return [
      { id: "EMP-101", matricule: "ENS-2026-01", firstName: "Dieudonné", lastName: "KABANGU MWANZA", gender: "M", function: "Professeur de Mathématiques", department: "Enseignement", phone: "+243 81 554 3321", email: "kabangu@smartschool.cd", status: "Actif", service: "Humanités Scientifiques" },
      { id: "EMP-102", matricule: "ENS-2026-02", firstName: "Marie-Louise", lastName: "KAPINGA BIKAKO", gender: "F", function: "Institutrice Primaire 5è", department: "Enseignement", phone: "+243 82 443 1100", email: "kapinga@smartschool.cd", status: "Actif", service: "Primaire" },
      { id: "EMP-103", matricule: "ADM-2026-01", firstName: "Alain", lastName: "MBEMBA KANIKI", gender: "M", function: "Comptable Principal", department: "Administration", phone: "+243 89 776 5544", email: "mbemba@smartschool.cd", status: "Actif", service: "Comptabilité" },
      { id: "EMP-104", matricule: "ADM-2026-02", firstName: "Chantal", lastName: "KANKU MASENGU", gender: "F", function: "Secrétaire Principale", department: "Administration", phone: "+243 81 998 7766", email: "kanku@smartschool.cd", status: "Actif", service: "Secrétariat" },
      { id: "EMP-105", matricule: "TEC-2026-01", firstName: "Patrick", lastName: "ILUNGA KABEYA", gender: "M", function: "Informaticien & Admin Réseau", department: "Technique", phone: "+243 99 112 2334", email: "ilunga@smartschool.cd", status: "Actif", service: "Informatique" },
      { id: "EMP-106", matricule: "MED-2026-01", firstName: "Dr. Sophie", lastName: "KABEDI NKONGOLO", gender: "F", function: "Infirmière Scolaire", department: "Médical", phone: "+243 85 667 8899", email: "kabedi@smartschool.cd", status: "Actif", service: "Infirmerie" }
    ] as Employee[];
  }, [employees]);

  // Derived filtered students list
  const filteredStudents = useMemo(() => {
    return activeStudentsList.filter((s) => {
      // Sub-Filter
      if (studentFilterType === "cycle_maternelle" && s.levelCategory !== "Maternelle") return false;
      if (studentFilterType === "cycle_primaire" && s.levelCategory !== "Primaire") return false;
      if (studentFilterType === "cycle_eb" && !(s.className.includes("7") || s.className.includes("8"))) return false;
      if (studentFilterType === "cycle_humanites" && s.levelCategory === "Secondaire" && (s.className.includes("7") || s.className.includes("8"))) return false;
      if (studentFilterType === "finalistes" && !s.className.startsWith("6")) return false;
      if (studentFilterType === "inscrit" && s.status !== "Actif" && s.status !== "Validé") return false;
      if (studentFilterType === "transfere" && s.status !== "Transféré") return false;
      if (studentFilterType === "abandon" && s.status !== "Exclu" && s.status !== "Suspendu") return false;
      if (studentFilterType === "retard_paiement" && s.status === "Exclu") return false;

      if (selectedGender !== "Tous" && s.gender !== selectedGender) return false;
      if (selectedOption !== "Toutes" && !s.optionName.toLowerCase().includes(selectedOption.toLowerCase())) return false;
      if (selectedClass !== "Toutes" && !s.className.toLowerCase().includes(selectedClass.toLowerCase())) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.registrationNumber.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeStudentsList, studentFilterType, selectedGender, selectedOption, selectedClass, searchQuery]);

  // Derived filtered teachers list
  const filteredTeachers = useMemo(() => {
    const teachersOnly = activeEmployeesList.filter((e) => e.department === "Enseignement" || e.function.toLowerCase().includes("professeur") || e.function.toLowerCase().includes("instituteur") || e.function.toLowerCase().includes("enseignant"));
    
    return teachersOnly.filter((t) => {
      if (teacherFilterType === "maternelle" && !t.function.toLowerCase().includes("maternelle")) return false;
      if (teacherFilterType === "primaire" && !t.function.toLowerCase().includes("primaire")) return false;
      if (teacherFilterType === "eb" && !t.function.toLowerCase().includes("base")) return false;
      if (teacherFilterType === "humanites" && !t.function.toLowerCase().includes("professeur")) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.firstName.toLowerCase().includes(q) ||
          t.lastName.toLowerCase().includes(q) ||
          t.function.toLowerCase().includes(q) ||
          t.matricule.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeEmployeesList, teacherFilterType, searchQuery]);

  // Derived filtered staff list
  const filteredStaff = useMemo(() => {
    const staffOnly = activeEmployeesList.filter((e) => e.department !== "Enseignement");

    return staffOnly.filter((st) => {
      if (staffFilterType === "administratif" && st.department !== "Administration") return false;
      if (staffFilterType === "comptable" && !st.function.toLowerCase().includes("comptable")) return false;
      if (staffFilterType === "informaticien" && st.department !== "Technique") return false;
      if (staffFilterType === "medical" && st.department !== "Médical") return false;
      if (staffFilterType === "securite" && st.department !== "Sécurité") return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          st.firstName.toLowerCase().includes(q) ||
          st.lastName.toLowerCase().includes(q) ||
          st.function.toLowerCase().includes(q) ||
          st.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeEmployeesList, staffFilterType, searchQuery]);

  // Active current list count
  const currentListCount = activeCategory === "eleves" ? filteredStudents.length : activeCategory === "enseignants" ? filteredTeachers.length : filteredStaff.length;

  // Export to Real Excel (.xlsx) / PDF / CSV
  const handleExportData = (formatType: "excel" | "pdf" | "print" | "csv") => {
    if (activeCategory === "eleves") {
      const suffix = studentFilterType.toUpperCase();
      if (formatType === "excel") {
        exportStudentsExcel(filteredStudents, suffix, userRole);
      } else if (formatType === "pdf") {
        exportStudentsPDF(filteredStudents, suffix, userRole, "landscape");
      } else if (formatType === "print") {
        const headers = ["N°", "Matricule", "Nom & Prénom", "Sexe", "Classe / Option", "Tuteur", "Contact", "Statut"];
        const rows = filteredStudents.map((s, idx) => [
          idx + 1,
          s.registrationNumber || s.id,
          `${s.lastName} ${s.firstName}`,
          s.gender,
          `${s.className} (${s.optionName})`,
          s.parentName || "N/A",
          s.parentPhone || "N/A",
          s.status
        ]);
        printDedicatedTable(`LISTE OFFICIELLE DES ÉLÈVES (${suffix})`, headers, rows, `Total : ${filteredStudents.length} élève(s)`);
      } else {
        handleExportCSVFallback();
      }
    } else if (activeCategory === "enseignants") {
      const suffix = teacherFilterType.toUpperCase();
      if (formatType === "excel") {
        exportEmployeesExcel(filteredTeachers, `ENSEIGNANTS_${suffix}`, userRole);
      } else if (formatType === "pdf") {
        exportEmployeesPDF(filteredTeachers, `ENSEIGNANTS_${suffix}`, userRole, "portrait");
      } else if (formatType === "print") {
        const headers = ["N°", "Matricule", "Nom & Prénom", "Sexe", "Fonction", "Département", "Téléphone", "Statut"];
        const rows = filteredTeachers.map((t, idx) => [
          idx + 1,
          t.matricule,
          `${t.lastName} ${t.firstName}`,
          t.gender,
          t.function,
          t.department,
          t.phone,
          t.status
        ]);
        printDedicatedTable(`LISTE DU CORPS ENSEIGNANT (${suffix})`, headers, rows, `Total : ${filteredTeachers.length} enseignant(s)`);
      } else {
        handleExportCSVFallback();
      }
    } else {
      const suffix = staffFilterType.toUpperCase();
      if (formatType === "excel") {
        exportEmployeesExcel(filteredStaff, `PERSONNEL_${suffix}`, userRole);
      } else if (formatType === "pdf") {
        exportEmployeesPDF(filteredStaff, `PERSONNEL_${suffix}`, userRole, "portrait");
      } else if (formatType === "print") {
        const headers = ["N°", "Matricule", "Nom & Prénom", "Sexe", "Poste Occupé", "Service", "Téléphone", "Statut"];
        const rows = filteredStaff.map((st, idx) => [
          idx + 1,
          st.matricule,
          `${st.lastName} ${st.firstName}`,
          st.gender,
          st.function,
          st.department,
          st.phone,
          st.status
        ]);
        printDedicatedTable(`LISTE DU PERSONNEL ADMINISTRATIF (${suffix})`, headers, rows, `Total : ${filteredStaff.length} agent(s)`);
      } else {
        handleExportCSVFallback();
      }
    }
  };

  const handleExportCSVFallback = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let title = "";

    if (activeCategory === "eleves") {
      title = `LISTE_OFFICIELLE_ELEVES_${studentFilterType.toUpperCase()}_${schoolYear}`;
      headers = ["N°", "Matricule", "Nom", "Prénom", "Sexe", "Classe", "Option", "Statut", "Tuteur", "Téléphone Tuteur"];
      rows = filteredStudents.map((s, idx) => [
        (idx + 1).toString(),
        s.registrationNumber,
        s.lastName,
        s.firstName,
        s.gender,
        s.className,
        s.optionName,
        s.status,
        s.parentName,
        s.parentPhone
      ]);
    } else if (activeCategory === "enseignants") {
      title = `LISTE_OFFICIELLE_ENSEIGNANTS_${teacherFilterType.toUpperCase()}_${schoolYear}`;
      headers = ["N°", "Matricule", "Nom & Prénom", "Sexe", "Fonction", "Département", "Téléphone", "Email", "Statut"];
      rows = filteredTeachers.map((t, idx) => [
        (idx + 1).toString(),
        t.matricule,
        `${t.lastName} ${t.firstName}`,
        t.gender,
        t.function,
        t.department,
        t.phone,
        t.email,
        t.status
      ]);
    } else {
      title = `LISTE_OFFICIELLE_PERSONNEL_${staffFilterType.toUpperCase()}_${schoolYear}`;
      headers = ["N°", "Matricule", "Nom & Prénom", "Sexe", "Poste", "Service / Dpt", "Téléphone", "Email", "Statut"];
      rows = filteredStaff.map((st, idx) => [
        (idx + 1).toString(),
        st.matricule,
        `${st.lastName} ${st.firstName}`,
        st.gender,
        st.function,
        st.department,
        st.phone,
        st.email,
        st.status
      ]);
    }

    let csvContent = "\uFEFF" + `${schoolName.toUpperCase()} - ${title}\n`;
    csvContent += `Année Scolaire: ${schoolYear} | Généré le: ${new Date().toLocaleDateString("fr-FR")}\n\n`;
    csvContent += headers.join(";") + "\n";
    rows.forEach((r) => {
      csvContent += r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open PDF Print Preview Modal
  const handleOpenPrintModal = () => {
    let listTitle = "";
    let columns: string[] = [];
    let rowsData: any[] = [];
    let statsSummary = "";

    if (activeCategory === "eleves") {
      listTitle = `LISTE OFFICIELLE DES ÉLÈVES (${studentFilterType.toUpperCase()})`;
      columns = ["N°", "Matricule", "Nom, Postnom & Prénom", "Sexe", "Classe / Option", "Statut / Remarque"];
      rowsData = filteredStudents.map((s, i) => [
        (i + 1).toString(),
        s.registrationNumber,
        `${s.lastName} ${s.firstName}`,
        s.gender,
        `${s.className} (${s.optionName})`,
        s.status
      ]);
      const totalGarcons = filteredStudents.filter((s) => s.gender === "M").length;
      const totalFilles = filteredStudents.filter((s) => s.gender === "F").length;
      statsSummary = `Effectif Total : ${filteredStudents.length} Élève(s) • Garçons : ${totalGarcons} • Filles : ${totalFilles}`;
    } else if (activeCategory === "enseignants") {
      listTitle = `LISTE OFFICIELLE DU CORPS ENSEIGNANT (${teacherFilterType.toUpperCase()})`;
      columns = ["N°", "Matricule", "Nom, Postnom & Prénom", "Sexe", "Fonction / Discipine", "Contact Téléphone"];
      rowsData = filteredTeachers.map((t, i) => [
        (i + 1).toString(),
        t.matricule,
        `${t.lastName} ${t.firstName}`,
        t.gender,
        t.function,
        t.phone
      ]);
      statsSummary = `Total Enseignants : ${filteredTeachers.length} Agent(s)`;
    } else {
      listTitle = `LISTE OFFICIELLE DU PERSONNEL ADMINISTRATIF & TECHNIQUE`;
      columns = ["N°", "Matricule", "Nom, Postnom & Prénom", "Sexe", "Poste Occupé", "Département"];
      rowsData = filteredStaff.map((st, i) => [
        (i + 1).toString(),
        st.matricule,
        `${st.lastName} ${st.firstName}`,
        st.gender,
        st.function,
        st.department
      ]);
      statsSummary = `Total Personnel : ${filteredStaff.length} Agent(s)`;
    }

    setPrintModal({
      isOpen: true,
      docType: "liste_classe",
      data: {
        title: listTitle,
        schoolName,
        schoolYear,
        columns,
        rows: rowsData,
        statsSummary,
        logoUrl,
        drapeauUrl,
        armoiriesUrl,
        dateFormatted: new Date().toLocaleDateString("fr-FR")
      },
      title: `${listTitle} - ${schoolName}`
    });
  };

  return (
    <div className="space-y-6 text-left" id="official-lists-printing-center">
      
      {/* MAIN TOP SUB-NAVIGATION TABS */}
      <div className="flex bg-slate-200/80 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-300/60 dark:border-slate-800 max-w-xl">
        <button
          onClick={() => setMainViewMode("listes")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            mainViewMode === "listes"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Printer className="h-4 w-4" />
          <span>Impressions & Exports Officiels</span>
        </button>

        <button
          onClick={() => setMainViewMode("templates")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            mainViewMode === "templates"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Personnalisation des Modèles</span>
        </button>
      </div>

      {mainViewMode === "templates" ? (
        <PrintTemplateCenter />
      ) : (
        <>
          {/* HEADER BANNER */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Printer className="h-3.5 w-3.5" /> Centre d'Impression Officiel RDC
                </span>
                <span className="text-slate-400 text-xs font-mono">• EPST / MINEPSP Certification</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                Impression & Exportation des Listes Officielles
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Générez, filtrez et exportez en PDF vectoriel et Excel (.xlsx) les listes certifiées d'élèves, d'enseignants et du personnel avec en-tête national RDC, QR Code et signature.
              </p>
            </div>

            {/* QUICK EXPORT ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleExportData("excel")}
                className="px-3.5 py-2.5 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                title="Générer un véritable fichier MS Excel .xlsx"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => handleExportData("pdf")}
                className="px-3.5 py-2.5 bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-200 text-indigo-800 dark:text-indigo-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                title="Générer un PDF vectoriel téléchargeable"
              >
                <FileText className="h-4 w-4 text-indigo-600" />
                <span>Télécharger PDF</span>
              </button>

              <button
                onClick={() => handleExportData("print")}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                title="Imprimer directement le document officiel dédié"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer Document</span>
              </button>

              <button
                onClick={handleOpenPrintModal}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1 transition-all cursor-pointer"
                title="Ouvrir le studio de prévisualisation"
              >
                <Eye className="h-4 w-4" />
                <span>Studio</span>
              </button>
            </div>
          </div>

      {/* CATEGORY TABS (ÉLÈVES / ENSEIGNANTS / PERSONNEL) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* TAB 1: ÉLÈVES */}
        <button
          onClick={() => setActiveCategory("eleves")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3.5 ${
            activeCategory === "eleves"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
          }`}
        >
          <div className={`p-3 rounded-xl shrink-0 ${activeCategory === "eleves" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"}`}>
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-80">RÉPERTOIRE</span>
            <span className="text-sm font-black uppercase block">Listes des Élèves</span>
            <span className="text-[10px] font-bold opacity-90">{activeStudentsList.length} Élève(s) Enregistré(s)</span>
          </div>
        </button>

        {/* TAB 2: ENSEIGNANTS */}
        <button
          onClick={() => setActiveCategory("enseignants")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3.5 ${
            activeCategory === "enseignants"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
          }`}
        >
          <div className={`p-3 rounded-xl shrink-0 ${activeCategory === "enseignants" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"}`}>
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-80">CORPS PROFESSORAL</span>
            <span className="text-sm font-black uppercase block">Listes des Enseignants</span>
            <span className="text-[10px] font-bold opacity-90">{activeEmployeesList.filter(e => e.department === "Enseignement").length} Enseignant(s)</span>
          </div>
        </button>

        {/* TAB 3: PERSONNEL */}
        <button
          onClick={() => setActiveCategory("personnel")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3.5 ${
            activeCategory === "personnel"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
          }`}
        >
          <div className={`p-3 rounded-xl shrink-0 ${activeCategory === "personnel" ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"}`}>
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-80">ADMINISTRATIF & AGENTS</span>
            <span className="text-sm font-black uppercase block">Listes du Personnel</span>
            <span className="text-[10px] font-bold opacity-90">{activeEmployeesList.filter(e => e.department !== "Enseignement").length} Agent(s)</span>
          </div>
        </button>

      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm">
        
        {/* TOP FILTER LINE */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, matricule..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* ACTIVE CRITERIA BANNER */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
            <Filter className="h-4 w-4 text-indigo-500" />
            <span>
              {currentListCount} élément(s) sélectionné(s) pour l'impression
            </span>
          </div>

        </div>

        {/* SUB-FILTERS FOR ÉLÈVES */}
        {activeCategory === "eleves" && (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2">Filtre Rapide :</span>
              {[
                { id: "tous", label: "Tous les Élèves" },
                { id: "cycle_maternelle", label: "Cycle Maternelle" },
                { id: "cycle_primaire", label: "Cycle Primaire" },
                { id: "cycle_eb", label: "Éducation de Base (7è-8è)" },
                { id: "cycle_humanites", label: "Humanités Secondaires" },
                { id: "finalistes", label: "Élèves Finalistes (6è)" },
                { id: "inscrit", label: "Inscrits Validés" },
                { id: "transfere", label: "Élèves Transférés" },
                { id: "retard_paiement", label: "En Retard de Paiement" },
                { id: "abandon", label: "Ayant Abandonné / Exclus" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStudentFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer ${
                    studentFilterType === f.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* SECONDARY SELECTORS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Filtrer par Sexe :</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="Tous">Tous (Garçons & Filles)</option>
                  <option value="M">Garçons Uniquement (M)</option>
                  <option value="F">Filles Uniquement (F)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Option d'Étude :</label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="Toutes">Toutes les Options</option>
                  <option value="Chimie-Biologie">Chimie-Biologie</option>
                  <option value="Mathématique-Physique">Mathématique-Physique</option>
                  <option value="Pédagogie Générale">Pédagogie Générale</option>
                  <option value="Commerciale & Gestion">Commerciale & Gestion</option>
                  <option value="Primaire Général">Primaire Général</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Année Scolaire :</label>
                <input
                  type="text"
                  value={schoolYear}
                  disabled
                  className="w-full p-2 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUB-FILTERS FOR ENSEIGNANTS */}
        {activeCategory === "enseignants" && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2">Filtre Niveau :</span>
            {[
              { id: "tous", label: "Tous les Enseignants" },
              { id: "maternelle", label: "Enseignants Maternelle" },
              { id: "primaire", label: "Enseignants Primaire" },
              { id: "eb", label: "Éducation de Base (7è-8è)" },
              { id: "humanites", label: "Professeurs des Humanités" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTeacherFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer ${
                  teacherFilterType === f.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* SUB-FILTERS FOR PERSONNEL */}
        {activeCategory === "personnel" && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 self-center mr-2">Filtre Service :</span>
            {[
              { id: "tous", label: "Tout le Personnel" },
              { id: "administratif", label: "Personnel Administratif" },
              { id: "comptable", label: "Comptables & Trésorerie" },
              { id: "informaticien", label: "Informaticiens & Réseau" },
              { id: "medical", label: "Personnel Médical" },
              { id: "securite", label: "Agents de Sécurité & Entretien" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStaffFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer ${
                  staffFilterType === f.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* DATA PREVIEW TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
        
        {/* TABLE HEADER BAR */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase flex items-center space-x-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              <span>Aperçu du Tableau Avant Impression</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Affiche les enregistrements prêts à être imprimés avec en-tête réglementaire EPST RDC.
            </p>
          </div>

          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs rounded-full">
            {currentListCount} Enregistrement(s)
          </span>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider bg-slate-50 dark:bg-slate-950">
                <th className="p-3">N°</th>
                <th className="p-3">Matricule</th>
                <th className="p-3">Nom, Postnom & Prénom</th>
                <th className="p-3">Sexe</th>
                <th className="p-3">{activeCategory === "eleves" ? "Classe & Option" : "Fonction / Service"}</th>
                <th className="p-3">{activeCategory === "eleves" ? "Tuteur / Contact" : "Téléphone"}</th>
                <th className="p-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              
              {/* ÉLÈVES TABLE ROWS */}
              {activeCategory === "eleves" && filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-mono font-black text-indigo-600 dark:text-indigo-400">{s.registrationNumber}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{s.lastName} {s.firstName}</td>
                  <td className="p-3 font-mono font-bold">{s.gender}</td>
                  <td className="p-3 font-medium text-slate-600 dark:text-slate-300">
                    {s.className} <span className="text-[10px] text-slate-400">({s.optionName})</span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{s.parentPhone || "N/A"}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded font-black text-[10px] uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}

              {/* ENSEIGNANTS TABLE ROWS */}
              {activeCategory === "enseignants" && filteredTeachers.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-mono font-black text-emerald-600 dark:text-emerald-400">{t.matricule}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{t.lastName} {t.firstName}</td>
                  <td className="p-3 font-mono font-bold">{t.gender}</td>
                  <td className="p-3 font-medium text-slate-600 dark:text-slate-300">{t.function}</td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{t.phone}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded font-black text-[10px] uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}

              {/* PERSONNEL TABLE ROWS */}
              {activeCategory === "personnel" && filteredStaff.map((st, idx) => (
                <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-mono font-black text-purple-600 dark:text-purple-400">{st.matricule}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{st.lastName} {st.firstName}</td>
                  <td className="p-3 font-mono font-bold">{st.gender}</td>
                  <td className="p-3 font-medium text-slate-600 dark:text-slate-300">{st.function} ({st.department})</td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{st.phone}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded font-black text-[10px] uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}

              {currentListCount === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                    Aucun enregistrement ne correspond aux critères de recherche sélectionnés.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </div>

      {/* PRINT PREVIEW MODAL INTEGRATION */}
      {printModal.isOpen && (
        <PrintPreviewModal
          documentType={printModal.docType}
          data={printModal.data}
          onClose={() => setPrintModal(prev => ({ ...prev, isOpen: false }))}
          title={printModal.title}
        />
      )}

        </>
      )}

    </div>
  );
}
