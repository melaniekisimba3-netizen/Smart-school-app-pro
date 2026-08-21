import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// ---------------------------------------------------------------------------
// 1. DATA MODELS & TYPES FOR TENANT ISOLATION
// ---------------------------------------------------------------------------
export interface TenantDataPayload {
  schoolId: string;
  schoolName: string;
  userRole: string;
  userName: string;
  userEmail?: string;
  schoolInfo?: {
    id: string;
    name: string;
    codeNational?: string;
    provinceEducationnelle?: string;
    adresseComplete?: string;
    contactEmail?: string;
    phonePrincipal?: string;
    schoolYear?: string;
    levels?: string[];
    sections?: string[];
    options?: string[];
  };
  students?: Array<{
    id: string;
    registrationNumber: string;
    firstName: string;
    lastName: string;
    postName?: string;
    gender: "M" | "F" | string;
    className: string;
    optionName?: string;
    levelCategory?: string;
    parentName?: string;
    parentPhone?: string;
    status?: string;
    schoolId?: string;
  }>;
  payments?: Array<{
    id: string;
    studentId: string;
    studentName: string;
    className: string;
    amount: number;
    currency: "USD" | "CDF" | string;
    paymentType: string;
    paymentMonth?: string;
    remainingBalance?: number;
    transactionStatus?: string;
    schoolId?: string;
  }>;
  feeTypes?: Array<{
    id: string;
    name: string;
    amount: number;
    currency: "USD" | "CDF" | string;
    targetClass?: string;
    isMandatory?: boolean;
    periodicity?: string;
    schoolId?: string;
  }>;
  classes?: Array<{
    id: string;
    level: string | number;
    roomLetter: string;
    optionName: string;
    classTeacherName?: string;
    studentCount: number;
    maxStudents?: number;
    levelCategory?: string;
    schoolId?: string;
  }>;
  options?: Array<{
    id: string;
    name: string;
    code: string;
    desc?: string;
  }>;
  grades?: Array<{
    id: string;
    studentId: string;
    studentName: string;
    subjectName: string;
    period: string;
    scoreObtained: number;
    maxScore: number;
    schoolId?: string;
  }>;
  attendances?: Array<{
    id: string;
    studentId: string;
    studentName: string;
    className: string;
    date: string;
    status: "Présent" | "Absent" | "En retard" | string;
    isJustified?: boolean;
    reason?: string;
    schoolId?: string;
  }>;
  teachers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    assignedClasses: string[];
    weeklyHours: number;
    phone?: string;
    schoolId?: string;
  }>;
}

export interface AnalystResponse {
  success: boolean;
  text: string;
  toolCalled?: string;
  dataPayload?: {
    type: "students_list" | "unpaid_students" | "school_stats" | "grades_analysis" | "attendance_report" | "document_draft" | "classes_list" | "teachers_list" | "generic_table";
    title: string;
    headers: string[];
    rows: any[][];
    summaryStats?: Record<string, any>;
    document?: {
      title: string;
      recipient: string;
      subject: string;
      content: string;
      date: string;
      schoolHeader: string;
    };
    exportData?: any[];
  };
  suggestedActions?: string[];
  refusalReason?: string;
}

// ---------------------------------------------------------------------------
// 2. GEMINI FUNCTION DECLARATIONS (TOOLS)
// ---------------------------------------------------------------------------
const getStudentsListTool: FunctionDeclaration = {
  name: "getStudentsList",
  description: "Récupère la liste filtrée et triée des élèves de l'établissement (par classe, option, niveau, genre ou recherche alphabétique).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      className: { type: Type.STRING, description: "Nom de la classe (ex: '3e A', '6e B', '4e Commerciale')" },
      optionName: { type: Type.STRING, description: "Nom ou code de l'option (ex: 'Commerciale et Gestion', 'Scientifique', 'Latin-Philo', 'Électricité')" },
      levelCategory: { type: Type.STRING, description: "Catégorie de niveau: 'Maternelle', 'Primaire', 'Secondaire', 'Humanités'" },
      gender: { type: Type.STRING, description: "Filtre par genre: 'M' (Garçons) ou 'F' (Filles)" },
      searchTerm: { type: Type.STRING, description: "Recherche par nom, prénom ou matricule" },
      sortBy: { type: Type.STRING, description: "Critère de tri: 'name' (nom), 'firstName' (prénom), 'className' (classe), 'registrationNumber' (matricule)" },
      sortOrder: { type: Type.STRING, description: "Ordre de tri: 'asc' (alphabétique A-Z) ou 'desc' (Z-A)" },
      groupByClass: { type: Type.BOOLEAN, description: "Si true, regroupe et sépare la liste par classe" }
    }
  }
};

const getUnpaidStudentsTool: FunctionDeclaration = {
  name: "getUnpaidStudentsAndDebts",
  description: "Analyse financière des élèves non payés, impayés, dettes scolaires et soldes restants avec répartition par classe ou option.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      className: { type: Type.STRING, description: "Filtrer pour une classe spécifique (ex: '3e', '5e Scientifique')" },
      optionName: { type: Type.STRING, description: "Filtrer pour une option spécifique (ex: 'Commerciale', 'Scientifique')" },
      minDebtUSD: { type: Type.NUMBER, description: "Montant de dette minimum en USD (ex: 100 pour les élèves devant plus de 100 USD)" },
      paymentStatusFilter: { type: Type.STRING, description: "Filtrer par statut: 'unpaid' (aucun versement), 'partial' (acompte versé), 'all_debt' (tout solde > 0)" },
      sortBy: { type: Type.STRING, description: "Critère de tri: 'debt_desc' (plus grosse dette en premier), 'debt_asc' (plus petite dette), 'name' (alphabétique)" },
      groupByClass: { type: Type.BOOLEAN, description: "Si true, calcule la répartition des impayés par classe" },
      groupByOption: { type: Type.BOOLEAN, description: "Si true, calcule la répartition des impayés par option" }
    }
  }
};

const getSchoolStatisticsTool: FunctionDeclaration = {
  name: "getSchoolStatistics",
  description: "Calcule les statistiques globales réelles de l'établissement: effectifs, finances, taux de paiement, ratios garçons/filles, classes les plus peuplées.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: "Catégorie statistique: 'all' (global), 'finances' (recouvrement & impayés), 'pedagogy' (effectifs & options), 'attendance' (présences)" }
    }
  }
};

const getAcademicGradesTool: FunctionDeclaration = {
  name: "getAcademicGradesAndRankings",
  description: "Analyse les notes, moyennes, classements, top élèves, élèves en difficulté et matières difficiles de l'école.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      className: { type: Type.STRING, description: "Nom de la classe à analyser" },
      subjectName: { type: Type.STRING, description: "Nom de la matière ou du cours" },
      period: { type: Type.STRING, description: "Période ou trimestre: 'P1', 'P2', 'EXAM1', 'P3', 'P4', 'EXAM2', 'general'" },
      topCount: { type: Type.NUMBER, description: "Nombre de meilleurs élèves à retourner (ex: 5 pour le Top 5)" },
      strugglingOnly: { type: Type.BOOLEAN, description: "Si true, retourne uniquement les élèves ayant une moyenne < 50%" },
      failedOnly: { type: Type.BOOLEAN, description: "Si true, liste les élèves ayant échoué" }
    }
  }
};

const getAttendanceReportTool: FunctionDeclaration = {
  name: "getAttendanceReport",
  description: "Analyse les présences et absences des élèves (élèves les plus absents, absences par classe, retards).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      className: { type: Type.STRING, description: "Filtrer pour une classe spécifique" },
      topAbsentOnly: { type: Type.BOOLEAN, description: "Si true, liste les élèves ayant le plus grand nombre d'absences" },
      minAbsences: { type: Type.NUMBER, description: "Nombre minimum d'absences à comptabiliser" },
      period: { type: Type.STRING, description: "Période temporelle: 'week' (semaine), 'month' (mois), 'year' (année)" }
    }
  }
};

const getClassroomsAndOptionsTool: FunctionDeclaration = {
  name: "getClassroomsAndOptions",
  description: "Liste les classes, salles, options d'étude et effectifs par classe de l'établissement.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      levelCategory: { type: Type.STRING, description: "Maternelle, Primaire, Secondaire ou Humanités" }
    }
  }
};

const getTeachersAndStaffTool: FunctionDeclaration = {
  name: "getTeachersAndStaff",
  description: "Récupère les informations autorisées sur les enseignants, leurs spécialités et les classes assignées.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      specialty: { type: Type.STRING, description: "Discipline ou spécialité (ex: Mathématiques, Français, Physique)" },
      className: { type: Type.STRING, description: "Enseignants intervenant dans une classe" }
    }
  }
};

const draftOfficialDocumentTool: FunctionDeclaration = {
  name: "draftOfficialDocument",
  description: "Rédige un document administratif officiel formel conforme aux normes scolaires de la RDC (convocation parent, lettre de rappel, note de service, demande de congé, communiqué, lettre au directeur/préfet).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      documentType: { 
        type: Type.STRING, 
        description: "Type de document: 'convocation_parents', 'rappel_paiement', 'note_service', 'demande_conge', 'communique_scolaire', 'lettre_directeur', 'lettre_prefet', 'lettre_avertissement'" 
      },
      recipient: { type: Type.STRING, description: "Destinataire du document (ex: 'Monsieur le Directeur', 'Aux Parents de l'Élève', 'Au Personnel Enseignant')" },
      studentName: { type: Type.STRING, description: "Nom de l'élève concerné (si applicable)" },
      className: { type: Type.STRING, description: "Classe concernée (si applicable)" },
      subject: { type: Type.STRING, description: "Objet officiel du document" },
      reason: { type: Type.STRING, description: "Motif ou raison principale (ex: 'Régularisation des frais scolaires du 2e trimestre', 'Absence non justifiée', 'Réunion des parents')" },
      deadlineDate: { type: Type.STRING, description: "Date d'échéance ou de convocation (si applicable)" },
      customInstructions: { type: Type.STRING, description: "Instructions complémentaires pour la rédaction" }
    },
    required: ["documentType", "subject"]
  }
};

export const AI_ANALYST_TOOLS = [
  {
    functionDeclarations: [
      getStudentsListTool,
      getUnpaidStudentsTool,
      getSchoolStatisticsTool,
      getAcademicGradesTool,
      getAttendanceReportTool,
      getClassroomsAndOptionsTool,
      getTeachersAndStaffTool,
      draftOfficialDocumentTool
    ]
  }
];

// ---------------------------------------------------------------------------
// 3. INTERNAL DATA QUERY & COMPUTATION EXECUTION ENGINES
// ---------------------------------------------------------------------------

export function executeGetStudentsList(data: TenantDataPayload, args: any): AnalystResponse["dataPayload"] {
  let list = [...(data.students || [])];

  // 1. Role-based RBAC filter
  const roleUpper = (data.userRole || "").toUpperCase();
  if (roleUpper.includes("PARENT")) {
    const parentAccount = (data.userEmail || "").toLowerCase();
    list = list.filter(s => 
      (s.parentName && s.parentName.toLowerCase().includes(data.userName.toLowerCase())) ||
      (s.parentPhone && s.parentPhone.includes(data.userName))
    );
  }

  // 2. Class filter
  if (args.className) {
    const term = args.className.toLowerCase().trim();
    list = list.filter(s => (s.className || "").toLowerCase().includes(term));
  }

  // 3. Option filter
  if (args.optionName) {
    const optTerm = args.optionName.toLowerCase().trim();
    list = list.filter(s => (s.optionName || "").toLowerCase().includes(optTerm));
  }

  // 4. Level filter
  if (args.levelCategory) {
    const lvlTerm = args.levelCategory.toLowerCase().trim();
    list = list.filter(s => (s.levelCategory || "").toLowerCase().includes(lvlTerm) || (s.className || "").toLowerCase().includes(lvlTerm));
  }

  // 5. Gender filter
  if (args.gender) {
    const g = args.gender.toUpperCase().trim();
    list = list.filter(s => (s.gender || "").toUpperCase() === g);
  }

  // 6. Search term filter
  if (args.searchTerm) {
    const st = args.searchTerm.toLowerCase().trim();
    list = list.filter(s => 
      `${s.firstName} ${s.lastName} ${s.postName || ""}`.toLowerCase().includes(st) ||
      (s.registrationNumber || "").toLowerCase().includes(st)
    );
  }

  // 7. Sorting
  const sortBy = args.sortBy || "name";
  const order = args.sortOrder === "desc" ? -1 : 1;

  list.sort((a, b) => {
    if (sortBy === "firstName") {
      return a.firstName.localeCompare(b.firstName) * order;
    }
    if (sortBy === "className") {
      return (a.className || "").localeCompare(b.className || "") * order;
    }
    if (sortBy === "registrationNumber") {
      return (a.registrationNumber || "").localeCompare(b.registrationNumber || "") * order;
    }
    // Default: Sort by full name / lastName
    const nameA = `${a.lastName} ${a.postName || ""} ${a.firstName}`;
    const nameB = `${b.lastName} ${b.postName || ""} ${b.firstName}`;
    return nameA.localeCompare(nameB) * order;
  });

  const headers = ["N°", "Matricule", "Nom Complet", "Genre", "Classe", "Option / Filière", "Parent / Tuteur", "Téléphone", "Statut"];
  const rows = list.map((s, idx) => [
    idx + 1,
    s.registrationNumber || `MAT-${idx + 100}`,
    `${s.lastName || ""} ${s.postName || ""} ${s.firstName || ""}`.trim() || "Élève sans nom",
    s.gender === "F" ? "Féminin (F)" : "Masculin (M)",
    s.className || "Non assignée",
    s.optionName || "Tronc Commun / Général",
    s.parentName || "Non renseigné",
    s.parentPhone || "-",
    s.status || "Inscrit"
  ]);

  return {
    type: "students_list",
    title: `Liste des Élèves (${list.length} élève${list.length > 1 ? "s" : ""})`,
    headers,
    rows,
    summaryStats: {
      total: list.length,
      garcons: list.filter(s => s.gender === "M").length,
      filles: list.filter(s => s.gender === "F").length,
      classesCount: Array.from(new Set(list.map(s => s.className))).length
    },
    exportData: list.map(s => ({
      Matricule: s.registrationNumber,
      Nom: s.lastName,
      PostNom: s.postName || "",
      Prenom: s.firstName,
      Genre: s.gender,
      Classe: s.className,
      Option: s.optionName,
      Parent: s.parentName,
      Telephone: s.parentPhone,
      Statut: s.status
    }))
  };
}

export function executeGetUnpaidStudentsAndDebts(data: TenantDataPayload, args: any): AnalystResponse["dataPayload"] {
  const students = data.students || [];
  const payments = data.payments || [];
  const feeTypes = data.feeTypes || [];

  // Compute standard annual fee baseline (Default: 300 USD if none configured)
  const defaultAnnualFee = feeTypes.length > 0
    ? feeTypes.reduce((acc, f) => acc + (f.currency === "USD" ? f.amount : (f.amount / 2800)), 0)
    : 300;

  // Build financial record per student
  const studentFinances = students.map(s => {
    const studentPayments = payments.filter(p => p.studentId === s.id || (p.studentName && p.studentName.toLowerCase().includes(`${s.lastName} ${s.firstName}`.toLowerCase())));
    const totalPaidUSD = studentPayments.reduce((acc, p) => {
      const amountUSD = p.currency === "CDF" ? Math.round(p.amount / 2800) : p.amount;
      return acc + (amountUSD || 0);
    }, 0);

    // Calculate applicable fee for this student's class
    const classFees = feeTypes.filter(f => !f.targetClass || f.targetClass === "Toutes les classes" || f.targetClass === s.className);
    const applicableFeeUSD = classFees.length > 0
      ? classFees.reduce((acc, f) => acc + (f.currency === "USD" ? f.amount : Math.round(f.amount / 2800)), 0)
      : defaultAnnualFee;

    const remainingBalance = Math.max(0, applicableFeeUSD - totalPaidUSD);

    let status = "Non payé";
    if (totalPaidUSD >= applicableFeeUSD) {
      status = "Totalement payé";
    } else if (totalPaidUSD > 0) {
      status = "Partiellement payé";
    }

    return {
      student: s,
      applicableFeeUSD,
      totalPaidUSD,
      remainingBalance,
      status
    };
  });

  // Filter for unpaid / debt students
  let filtered = studentFinances.filter(item => item.remainingBalance > 0);

  // Class filter
  if (args.className) {
    const term = args.className.toLowerCase().trim();
    filtered = filtered.filter(item => (item.student.className || "").toLowerCase().includes(term));
  }

  // Option filter
  if (args.optionName) {
    const opt = args.optionName.toLowerCase().trim();
    filtered = filtered.filter(item => (item.student.optionName || "").toLowerCase().includes(opt));
  }

  // Minimum debt filter
  if (args.minDebtUSD && typeof args.minDebtUSD === "number") {
    filtered = filtered.filter(item => item.remainingBalance >= args.minDebtUSD);
  }

  // Payment status filter
  if (args.paymentStatusFilter === "unpaid") {
    filtered = filtered.filter(item => item.totalPaidUSD === 0);
  } else if (args.paymentStatusFilter === "partial") {
    filtered = filtered.filter(item => item.totalPaidUSD > 0 && item.remainingBalance > 0);
  }

  // Sort
  const sortBy = args.sortBy || "debt_desc";
  filtered.sort((a, b) => {
    if (sortBy === "debt_asc") {
      return a.remainingBalance - b.remainingBalance;
    }
    if (sortBy === "name") {
      const nameA = `${a.student.lastName} ${a.student.firstName}`;
      const nameB = `${b.student.lastName} ${b.student.firstName}`;
      return nameA.localeCompare(nameB);
    }
    // Default: debt_desc
    return b.remainingBalance - a.remainingBalance;
  });

  const totalOutstandingUSD = filtered.reduce((acc, item) => acc + item.remainingBalance, 0);
  const totalPaidSoFarUSD = filtered.reduce((acc, item) => acc + item.totalPaidUSD, 0);
  const totalExpectedUSD = filtered.reduce((acc, item) => acc + item.applicableFeeUSD, 0);

  // Grouping by class breakdown
  const classBreakdown: Record<string, { count: number; totalDebt: number }> = {};
  filtered.forEach(item => {
    const cls = item.student.className || "Sans Classe";
    if (!classBreakdown[cls]) classBreakdown[cls] = { count: 0, totalDebt: 0 };
    classBreakdown[cls].count += 1;
    classBreakdown[cls].totalDebt += item.remainingBalance;
  });

  const headers = ["Élève", "Classe", "Option", "Frais Fixés", "Montant Payé", "Solde Restant", "Statut"];
  const rows = filtered.map(item => [
    `${item.student.lastName} ${item.student.postName || ""} ${item.student.firstName}`.trim(),
    item.student.className || "Non assignée",
    item.student.optionName || "Général",
    `${item.applicableFeeUSD} USD`,
    `${item.totalPaidUSD} USD`,
    `${item.remainingBalance} USD`,
    item.status
  ]);

  return {
    type: "unpaid_students",
    title: `État des Impayés Scolaires (${filtered.length} élèves débiteurs)`,
    headers,
    rows,
    summaryStats: {
      totalDebtorsCount: filtered.length,
      totalOutstandingUSD,
      totalPaidSoFarUSD,
      totalExpectedUSD,
      averageDebtUSD: filtered.length > 0 ? Math.round(totalOutstandingUSD / filtered.length) : 0,
      classBreakdown
    },
    exportData: filtered.map(item => ({
      Matricule: item.student.registrationNumber,
      Eleve: `${item.student.lastName} ${item.student.firstName}`,
      Classe: item.student.className,
      Option: item.student.optionName,
      FraisFixesUSD: item.applicableFeeUSD,
      MontantPayeUSD: item.totalPaidUSD,
      SoldeRestantUSD: item.remainingBalance,
      StatutPaiement: item.status,
      Parent: item.student.parentName,
      TelephoneParent: item.student.parentPhone
    }))
  };
}

export function executeGetSchoolStatistics(data: TenantDataPayload): AnalystResponse["dataPayload"] {
  const students = data.students || [];
  const teachers = data.teachers || [];
  const classes = data.classes || [];
  const payments = data.payments || [];
  const feeTypes = data.feeTypes || [];

  const totalStudents = students.length;
  const totalBoys = students.filter(s => s.gender === "M").length;
  const totalGirls = students.filter(s => s.gender === "F").length;

  const totalPaidUSD = payments.reduce((acc, p) => acc + (p.currency === "CDF" ? Math.round(p.amount / 2800) : p.amount), 0);
  const averageFeePerStudent = feeTypes.length > 0 ? feeTypes.reduce((a, b) => a + (b.currency === "USD" ? b.amount : b.amount / 2800), 0) : 300;
  const totalExpectedUSD = totalStudents * averageFeePerStudent;
  const totalDebtUSD = Math.max(0, totalExpectedUSD - totalPaidUSD);
  const recoveryRate = totalExpectedUSD > 0 ? Math.round((totalPaidUSD / totalExpectedUSD) * 100) : 0;

  // Largest classes
  const classCounts: Record<string, number> = {};
  students.forEach(s => {
    const c = s.className || "Sans Classe";
    classCounts[c] = (classCounts[c] || 0) + 1;
  });

  const sortedClasses = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);

  const headers = ["Indicateur Clé", "Valeur Réelle", "Commentaire"];
  const rows = [
    ["Effectif Total d'Élèves", `${totalStudents} élèves`, `Garçons: ${totalBoys} (${totalStudents ? Math.round(totalBoys/totalStudents*100):0}%), Filles: ${totalGirls} (${totalStudents ? Math.round(totalGirls/totalStudents*100):0}%)`],
    ["Corps Enseignant & Personnel", `${teachers.length} enseignants`, "Effectif pédagogique actif"],
    ["Classes Opérationnelles", `${classes.length || Object.keys(classCounts).length} classes`, `Classe la plus peuplée: ${sortedClasses[0]?.[0] || "-"} (${sortedClasses[0]?.[1] || 0} élèves)`],
    ["Montant Total Encaissé", `${totalPaidUSD.toLocaleString()} USD`, "Recouvrement total enregistré"],
    ["Total des Impayés Estimés", `${totalDebtUSD.toLocaleString()} USD`, `Reste à recouvrer`],
    ["Taux Global de Recouvrement", `${recoveryRate}%`, recoveryRate >= 75 ? "Bonne performance financière" : "Nécessite des relances auprès des parents"]
  ];

  return {
    type: "school_stats",
    title: `Tableau de Bord Statistique — ${data.schoolName}`,
    headers,
    rows,
    summaryStats: {
      totalStudents,
      totalBoys,
      totalGirls,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      totalPaidUSD,
      totalDebtUSD,
      recoveryRate,
      topClass: sortedClasses[0] ? { name: sortedClasses[0][0], count: sortedClasses[0][1] } : null
    },
    exportData: rows.map(r => ({ Indicateur: r[0], Valeur: r[1], Commentaire: r[2] }))
  };
}

export function executeGetAcademicGrades(data: TenantDataPayload, args: any): AnalystResponse["dataPayload"] {
  const grades = data.grades || [];
  const students = data.students || [];

  // Group grades by student
  const studentAverages: Record<string, { name: string; className: string; totalScore: number; maxScore: number; count: number }> = {};

  grades.forEach(g => {
    if (!studentAverages[g.studentId]) {
      const student = students.find(s => s.id === g.studentId);
      studentAverages[g.studentId] = {
        name: g.studentName || (student ? `${student.lastName} ${student.firstName}` : "Élève"),
        className: student?.className || "Classe",
        totalScore: 0,
        maxScore: 0,
        count: 0
      };
    }
    studentAverages[g.studentId].totalScore += g.scoreObtained;
    studentAverages[g.studentId].maxScore += g.maxScore;
    studentAverages[g.studentId].count += 1;
  });

  let rankings = Object.entries(studentAverages).map(([id, data]) => {
    const percentage = data.maxScore > 0 ? Math.round((data.totalScore / data.maxScore) * 1000) / 10 : 0;
    return {
      studentId: id,
      studentName: data.name,
      className: data.className,
      totalScore: data.totalScore,
      maxScore: data.maxScore,
      percentage,
      status: percentage >= 50 ? "Réussite" : "Échec / En difficulté"
    };
  });

  // Filter by class if provided
  if (args.className) {
    const term = args.className.toLowerCase().trim();
    rankings = rankings.filter(r => r.className.toLowerCase().includes(term));
  }

  // Sort by percentage descending
  rankings.sort((a, b) => b.percentage - a.percentage);

  // Top count filter
  if (args.topCount && typeof args.topCount === "number") {
    rankings = rankings.slice(0, args.topCount);
  } else if (args.strugglingOnly || args.failedOnly) {
    rankings = rankings.filter(r => r.percentage < 50);
  }

  const headers = ["Rang", "Nom de l'Élève", "Classe", "Points Obtenus", "Maximum", "Moyenne (%)", "Appréciation"];
  const rows = rankings.map((r, idx) => [
    `${idx + 1}e`,
    r.studentName,
    r.className,
    r.totalScore,
    r.maxScore,
    `${r.percentage}%`,
    r.percentage >= 80 ? "Excellente (Élite)" : r.percentage >= 65 ? "Très Bien" : r.percentage >= 50 ? "Satisfaisant" : "En difficulté (<50%)"
  ]);

  return {
    type: "grades_analysis",
    title: args.topCount ? `Palmarès des ${args.topCount} Meilleurs Élèves` : "Analyse des Performances & Résultats Scolaires",
    headers,
    rows,
    summaryStats: {
      totalAnalyzed: rankings.length,
      averageClassPercentage: rankings.length > 0 ? Math.round(rankings.reduce((a, b) => a + b.percentage, 0) / rankings.length) : 0,
      passCount: rankings.filter(r => r.percentage >= 50).length,
      failCount: rankings.filter(r => r.percentage < 50).length
    },
    exportData: rankings.map((r, idx) => ({
      Rang: `${idx + 1}e`,
      Eleve: r.studentName,
      Classe: r.className,
      Points: r.totalScore,
      Max: r.maxScore,
      Pourcentage: `${r.percentage}%`,
      Statut: r.status
    }))
  };
}

export function executeGetAttendanceReport(data: TenantDataPayload, args: any): AnalystResponse["dataPayload"] {
  const attendances = data.attendances || [];
  const students = data.students || [];

  // Group absences by student
  const absenceCounts: Record<string, { name: string; className: string; absences: number; late: number; justified: number }> = {};

  attendances.forEach(a => {
    if (!absenceCounts[a.studentId]) {
      const s = students.find(item => item.id === a.studentId);
      absenceCounts[a.studentId] = {
        name: a.studentName || (s ? `${s.lastName} ${s.firstName}` : "Élève"),
        className: a.className || s?.className || "Classe",
        absences: 0,
        late: 0,
        justified: 0
      };
    }
    if (a.status === "Absent") {
      absenceCounts[a.studentId].absences += 1;
      if (a.isJustified) absenceCounts[a.studentId].justified += 1;
    } else if (a.status === "En retard") {
      absenceCounts[a.studentId].late += 1;
    }
  });

  let list = Object.entries(absenceCounts).map(([id, d]) => ({
    studentId: id,
    studentName: d.name,
    className: d.className,
    absences: d.absences,
    late: d.late,
    justified: d.justified,
    unjustified: d.absences - d.justified
  }));

  // Class filter
  if (args.className) {
    const term = args.className.toLowerCase().trim();
    list = list.filter(item => item.className.toLowerCase().includes(term));
  }

  // Sort by absences desc
  list.sort((a, b) => b.absences - a.absences);

  if (args.topAbsentOnly) {
    list = list.slice(0, 10);
  }

  const headers = ["N°", "Élève", "Classe", "Absences Totales", "Non Justifiées", "Justifiées", "Retards", "Niveau de Risque"];
  const rows = list.map((item, idx) => [
    idx + 1,
    item.studentName,
    item.className,
    item.absences,
    item.unjustified,
    item.justified,
    item.late,
    item.unjustified >= 5 ? "🔴 Alerte Décrochage (Critique)" : item.unjustified >= 2 ? "🟡 À Surveiller" : "🟢 Normal"
  ]);

  return {
    type: "attendance_report",
    title: `Rapport des Absences et Assiduité (${list.length} cas recensés)`,
    headers,
    rows,
    summaryStats: {
      totalAbsences: list.reduce((a, b) => a + b.absences, 0),
      totalUnjustified: list.reduce((a, b) => a + b.unjustified, 0),
      criticalStudentsCount: list.filter(item => item.unjustified >= 5).length
    },
    exportData: list.map(item => ({
      Eleve: item.studentName,
      Classe: item.className,
      Absences: item.absences,
      NonJustifiees: item.unjustified,
      Justifiees: item.justified,
      Retards: item.late
    }))
  };
}

export function executeDraftOfficialDocument(data: TenantDataPayload, args: any): AnalystResponse["dataPayload"] {
  const schoolName = data.schoolInfo?.name || data.schoolName || "COMPLEXE SCOLAIRE SMART SCHOOL";
  const codeNational = data.schoolInfo?.codeNational || "EPST/NAT/042-KIN";
  const province = data.schoolInfo?.provinceEducationnelle || "KINSHASA-CENTRE";
  const todayDate = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const refNum = `N/Réf: ${codeNational}/DIR/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`;

  const recipient = args.recipient || "Monsieur le Parent / Tuteur Légal";
  const subject = args.subject || "Convocation officielle";
  const student = args.studentName ? `concernant l'élève **${args.studentName}**${args.className ? ` (Classe de ${args.className})` : ""}` : "";
  const deadline = args.deadlineDate ? `au plus tard le **${args.deadlineDate}**` : "dans les meilleurs délais";

  let bodyContent = "";

  if (args.documentType === "convocation_parents" || args.documentType === "rappel_paiement") {
    bodyContent = `
Madame, Monsieur le Responsable,

La Direction du **${schoolName}** vous présente ses salutations patriotiques et vous prie de bien vouloir vous présenter au Secrétariat de l'établissement ${deadline}, pour un entretien relatif à la situation administrative et financière ${student}.

**Motif de la convocation :**
${args.reason || "Régularisation urgente des frais de scolarité (Minerval et frais connexes) conformément aux engagements pris lors de l'inscription."}

Nous vous rappelons que la bonne marche pédagogique de notre établissement et l'encadrement optimal de votre enfant dépendent de l'apurement régulier des obligations scolaires.

Comptant sur votre franche collaboration habituelle, nous vous prions d'agréer, Madame, Monsieur, l'assurance de notre considération distinguée.
    `.trim();
  } else if (args.documentType === "demande_conge") {
    bodyContent = `
Monsieur le Préfet des Études / Directeur,

J'ai l'honneur de solliciter par la présente une autorisation d'absence de mes fonctions pour une durée de [Préciser la durée], prenant effet à compter du [Date de début] jusqu'au [Date de fin].

**Motif de la demande :**
${args.reason || "Raisons de santé / Obligation familiale impérieuse."}

J'ai pris toutes les dispositions pédagogiques utiles avec mes collègues de département pour assurer la continuité des cours et le rattrapage des matières programmées.

Dans l'attente d'une suite favorable à ma requête, je vous prie d'agréer, Monsieur le Directeur, l'expression de mes sentiments respectueux.
    `.trim();
  } else if (args.documentType === "note_service" || args.documentType === "communique_scolaire") {
    bodyContent = `
**COMMUNIQUÉ OFFICIEL DE LA DIRECTION**

La Direction du **${schoolName}** porte à la connaissance de l'ensemble du corps professoral, des élèves et des parents que :

${args.reason || "Les activités scolaires et administratives se dérouleront conformément au calendrier officiel du Ministère de l'Éducation Nationale et Nouvelle Citoyenneté (EPST)."}

Toutes les dispositions pratiques sont arrêtées pour garantir le respect strict des horaires et de la discipline républicaine.

Fait pour servir et valoir ce que de droit.
    `.trim();
  } else {
    // General letter to Director / Prefet / Staff
    bodyContent = `
Monsieur le Directeur,

J'ai l'honneur de m'adresser à votre haute autorité pour vous soumettre la présente correspondance ayant pour objet : **${subject}**.

${args.reason || "Exposé détaillé des faits et des mesures administratives ou pédagogiques proposées pour le bon fonctionnement de l'établissement."}

Je reste à votre entière disposition pour tout renseignement complémentaire que vous jugerez utile.

Veuillez agréer, Monsieur le Directeur, l'assurance de mon profond respect.
    `.trim();
  }

  const fullLetter = `
RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
MINISTÈRE DE L'ÉDUCATION NATIONALE ET NOUVELLE CITOYENNETÉ
PROVINCE ÉDUCATIONNELLE : ${province.toUpperCase()}
ÉTABLISSEMENT : ${schoolName.toUpperCase()}
CODE NATIONAL : ${codeNational}
${refNum}

Fait à ${data.schoolInfo?.adresseComplete || "Kinshasa"}, le ${todayDate}

**DESTINATAIRE :**
${recipient}

**OBJET : ${subject.toUpperCase()}**

${bodyContent}

**Pour la Direction de l'Établissement,**

Le Chef d'Établissement / Préfet des Études
*(Sceau & Signature Officielle)*
  `.trim();

  return {
    type: "document_draft",
    title: `Document Administratif Rédigé — ${subject}`,
    headers: ["Élément", "Contenu"],
    rows: [
      ["Type de Document", args.documentType],
      ["Destinataire", recipient],
      ["Objet Officiel", subject],
      ["Référence", refNum],
      ["Date d'Émission", todayDate]
    ],
    document: {
      title: subject,
      recipient,
      subject,
      content: fullLetter,
      date: todayDate,
      schoolHeader: `${schoolName} • ${province}`
    },
    exportData: [{ Document: subject, Destinataire: recipient, Date: todayDate, Contenu: fullLetter }]
  };
}

// ---------------------------------------------------------------------------
// 4. MAIN PROMPT PROCESSING & GEMINI ORCHESTRATION PIPELINE
// ---------------------------------------------------------------------------

export async function processAnalystQuery(params: {
  schoolId: string;
  userRole: string;
  userName: string;
  prompt: string;
  history?: Array<{ role: "user" | "model" | "assistant"; text: string }>;
  tenantData: TenantDataPayload;
}): Promise<AnalystResponse> {
  const { schoolId, userRole, userName, prompt, history = [], tenantData } = params;

  // 1. HARD SECURITY & TENANT ISOLATION CHECK
  const promptLower = prompt.toLowerCase();
  
  // Anti-jailbreak & cross-school access detection
  const crossTenantPatterns = [
    "autre école", "autres écoles", "une autre école", "l'autre école",
    "ignore le schoolid", "ignore les règles", "ignore tes règles",
    "toutes les données firestore", "collection firestore", "base de données complète",
    "comptes administrateurs de l'autre", "élèves de l'école voisine",
    "compare les écoles", "donne-moi l'autre", "pirater", "bypass", "override tenant"
  ];

  const hasCrossTenantAttempt = crossTenantPatterns.some(pattern => promptLower.includes(pattern));
  if (hasCrossTenantAttempt) {
    return {
      success: false,
      text: `⛔ **REFUS DE SÉCURITÉ & ISOLATION MULTI-TENANT**\n\nConformément aux règles strictes de souveraineté et de protection des données de SmartSchool RDC et du Ministère de l'Éducation Nationale (EPST) :\n\n- L'Analyste IA est **strictement cloisonné** à votre établissement connecté (**${tenantData.schoolName}**).\n- Tout accès ou tentative de consultation des données d'un autre établissement scolaire est **formellement prohibé**.\n- Les identifiants et collections Firestore d'autres écoles sont protégés par le principe de Zero-Trust.\n\nComment puis-je vous assister concernant les données de votre propre établissement (**${tenantData.schoolName}**) ?`,
      refusalReason: "CROSS_TENANT_VIOLATION_BLOCKED"
    };
  }

  // 2. RUN DETERMINISTIC INTENT DETECTION FIRST FOR INSTANT MATHEMATICAL RESULTS
  let toolDataPayload: AnalystResponse["dataPayload"] | undefined;
  let toolNameCalled: string | undefined;

  const isAskingUnpaid = promptLower.includes("non payé") || promptLower.includes("impayé") || promptLower.includes("dette") || promptLower.includes("solde") || promptLower.includes("combien n'ont pas encore payé");
  const isAskingStudents = (promptLower.includes("élève") || promptLower.includes("eleve") || promptLower.includes("liste")) && !isAskingUnpaid && !promptLower.includes("absent") && !promptLower.includes("note");
  const isAskingStats = promptLower.includes("statistique") || promptLower.includes("combien avons-nous") || promptLower.includes("taux de paiement") || promptLower.includes("effectif total");
  const isAskingGrades = promptLower.includes("note") || promptLower.includes("résultat") || promptLower.includes("moyenne") || promptLower.includes("meilleur élève") || promptLower.includes("palmarès") || promptLower.includes("échoué");
  const isAskingAttendance = promptLower.includes("absent") || promptLower.includes("absence") || promptLower.includes("présence") || promptLower.includes("retard");
  const isAskingDraft = promptLower.includes("rédige") || promptLower.includes("redige") || promptLower.includes("écris une lettre") || promptLower.includes("convocation") || promptLower.includes("note de service") || promptLower.includes("demande de congé");

  // Extract potential filters
  let extractedClass = "";
  const classMatches = prompt.match(/(\d+)(?:e|ère|eme|ème)?\s*(?:des\s+humanités|primaire|secondaire|commerciale|scientifique|littéraire|a|b|c)?/i);
  if (classMatches && classMatches[0]) {
    extractedClass = classMatches[0].trim();
  }

  // 3. EXECUTE RELEVANT SMART DATA TOOL
  if (isAskingUnpaid) {
    toolNameCalled = "getUnpaidStudentsAndDebts";
    let minDebt = 0;
    const debtMatch = prompt.match(/(\d+)\s*(?:usd|\$)/i);
    if (debtMatch) minDebt = parseInt(debtMatch[1], 10);

    toolDataPayload = executeGetUnpaidStudentsAndDebts(tenantData, {
      className: extractedClass,
      minDebtUSD: minDebt,
      sortBy: "debt_desc",
      groupByClass: promptLower.includes("par classe"),
      groupByOption: promptLower.includes("par option")
    });
  } else if (isAskingStudents) {
    toolNameCalled = "getStudentsList";
    toolDataPayload = executeGetStudentsList(tenantData, {
      className: extractedClass,
      sortBy: promptLower.includes("prénom") ? "firstName" : "name",
      sortOrder: "asc",
      groupByClass: promptLower.includes("par classe")
    });
  } else if (isAskingStats) {
    toolNameCalled = "getSchoolStatistics";
    toolDataPayload = executeGetSchoolStatistics(tenantData);
  } else if (isAskingGrades) {
    toolNameCalled = "getAcademicGradesAndRankings";
    toolDataPayload = executeGetAcademicGrades(tenantData, {
      className: extractedClass,
      topCount: promptLower.includes("5") || promptLower.includes("cinq") ? 5 : undefined,
      strugglingOnly: promptLower.includes("difficulté") || promptLower.includes("échoué")
    });
  } else if (isAskingAttendance) {
    toolNameCalled = "getAttendanceReport";
    toolDataPayload = executeGetAttendanceReport(tenantData, {
      className: extractedClass,
      topAbsentOnly: promptLower.includes("plus absent")
    });
  } else if (isAskingDraft) {
    toolNameCalled = "draftOfficialDocument";
    let docType = "lettre_directeur";
    if (promptLower.includes("convocation")) docType = "convocation_parents";
    else if (promptLower.includes("avertissement") || promptLower.includes("rappel")) docType = "rappel_paiement";
    else if (promptLower.includes("note de service")) docType = "note_service";
    else if (promptLower.includes("congé")) docType = "demande_conge";
    else if (promptLower.includes("communiqué")) docType = "communique_scolaire";

    toolDataPayload = executeDraftOfficialDocument(tenantData, {
      documentType: docType,
      subject: prompt.length > 50 ? prompt.slice(0, 50) : prompt,
      reason: prompt,
      className: extractedClass
    });
  }

  // 4. ATTEMPT GEMINI 3.7 FLASH SYNTHESIS WITH SERVER-SIDE USER-AGENT
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "votre_cle_api_gemini_secrete_cote_serveur") {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const systemInstruction = `
Vous êtes l'Analyste IA officiel et Assistant Intelligent de gestion scolaire pour SmartSchool RDC.
Votre rôle est d'analyser, synthétiser, répondre avec précision et rédiger des documents formels pour l'établissement scolaire connecté : **${tenantData.schoolName}**.

RÈGLES ABSOLUES :
1. Vous êtes STRICTEMENT LIMITÉ aux données de l'établissement connecté (${tenantData.schoolName}). Vous ne devez jamais inventer de données ou accéder à d'autres écoles.
2. L'utilisateur connecté est : **${userName}** (Rôle: **${userRole}**). Adaptez vos réponses à ses prérogatives RBAC.
3. Donnez des réponses claires, professionnelles, structurées en français élégant, avec des tableaux Markdown si pertinent.
4. Si des données ont été extraites par les outils internes, appuyez-vous fidèlement sur ces chiffres exacts (pas d'hallucination).
5. Proposez toujours des actions concrètes utiles (ex: relance, export Excel, convocation parentale).
      `.trim();

      const contents: any[] = [];
      
      // Inject previous chat history
      history.slice(-6).forEach(h => {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.text }]
        });
      });

      // Contextual tool result injection if computed
      let promptWithContext = prompt;
      if (toolDataPayload) {
        promptWithContext += `\n\n[RÉSULTATS DES DONNÉES RÉELLES DE L'ÉCOLE]:\nType: ${toolDataPayload.type}\nTitre: ${toolDataPayload.title}\nStats: ${JSON.stringify(toolDataPayload.summaryStats || {})}\nNombre d'éléments: ${toolDataPayload.rows.length}`;
        if (toolDataPayload.document) {
          promptWithContext += `\nDocument Rédigé:\n${toolDataPayload.document.content}`;
        }
      }

      contents.push({
        role: "user",
        parts: [{ text: promptWithContext }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      const generatedText = response.text || "";

      return {
        success: true,
        text: generatedText || formatFallbackText(toolNameCalled, toolDataPayload, prompt, tenantData),
        toolCalled: toolNameCalled,
        dataPayload: toolDataPayload,
        suggestedActions: generateSuggestedActions(toolNameCalled, toolDataPayload)
      };
    } catch (err: any) {
      console.warn("Gemini API call returned warning, falling back to deterministic intelligence engine:", err?.message || err);
    }
  }

  // 5. DETERMINISTIC FALLBACK IF API KEY ABSENT OR NETWORK DOWN
  return {
    success: true,
    text: formatFallbackText(toolNameCalled, toolDataPayload, prompt, tenantData),
    toolCalled: toolNameCalled,
    dataPayload: toolDataPayload,
    suggestedActions: generateSuggestedActions(toolNameCalled, toolDataPayload)
  };
}

function formatFallbackText(toolName?: string, payload?: AnalystResponse["dataPayload"], prompt?: string, data?: TenantDataPayload): string {
  if (!payload) {
    return `Bonjour **${data?.userName || "Utilisateur"}**. J'ai bien analysé votre demande pour **${data?.schoolName || "votre établissement"}**.

Voici les modules d'analyse disponibles à tout moment :
- 📋 **Liste des élèves** : Filtrage par classe, option, genre et tri alphabétique.
- 💰 **Finances & Impayés** : Analyse des dettes, frais et soldes restants.
- 📊 **Tableau de bord statistique** : Effectifs globaux et ratios de recouvrement.
- 📈 **Résultats & Palmarès** : Moyennes de classe, Top élèves et matières en difficulté.
- ⏱️ **Présences** : Suivi des absences critiques et retards.
- ✍️ **Rédaction officielle** : Convocations, notes de service et lettres administratives.

Que souhaitez-vous consulter précisément ?`;
  }

  if (payload.type === "unpaid_students") {
    const stats = payload.summaryStats || {};
    return `### 📊 Analyse des Impayés Scolaires — ${data?.schoolName}

Votre établissement compte **${stats.totalDebtorsCount || 0} élève(s)** ayant un solde impayé.

- **Montant total restant dû :** **${(stats.totalOutstandingUSD || 0).toLocaleString()} USD**
- **Montant déjà perçu :** ${(stats.totalPaidSoFarUSD || 0).toLocaleString()} USD
- **Dette moyenne par élève débiteur :** ${stats.averageDebtUSD || 0} USD

Consultez le tableau détaillé ci-dessous pour filtrer ou exporter la liste complète des élèves concernés.`;
  }

  if (payload.type === "students_list") {
    const stats = payload.summaryStats || {};
    return `### 📋 Liste des Élèves — ${data?.schoolName}

La recherche a identifié **${stats.total || 0} élève(s)** correspondant à vos critères (${stats.garcons || 0} garçons, ${stats.filles || 0} filles).

Voici la liste structurée et prête pour l'exportation :`;
  }

  if (payload.type === "school_stats") {
    const stats = payload.summaryStats || {};
    return `### 📈 Synthèse Globale de l'Établissement — ${data?.schoolName}

- **Effectif Total :** **${stats.totalStudents || 0} élèves** (${stats.totalBoys || 0} G / ${stats.totalGirls || 0} F)
- **Corps Enseignant :** ${stats.totalTeachers || 0} enseignants
- **Taux de Recouvrement Financier :** **${stats.recoveryRate || 0}%**
- **Total Impayés :** ${(stats.totalDebtUSD || 0).toLocaleString()} USD

Voici le récapitulatif détaillé :`;
  }

  if (payload.type === "grades_analysis") {
    return `### 🏆 Analyse des Résultats et Palmarès Académique

L'analyse des évaluations enregistrées affiche une moyenne générale de **${payload.summaryStats?.averageClassPercentage || 0}%**.

Retrouvez le classement ci-dessous :`;
  }

  if (payload.type === "attendance_report") {
    return `### ⏱️ Rapport d'Assiduité et Présences

L'analyse recense **${payload.summaryStats?.totalAbsences || 0} absences** dont **${payload.summaryStats?.totalUnjustified || 0} non justifiées**.

Voici le tableau des élèves nécessitant une attention particulière :`;
  }

  if (payload.type === "document_draft") {
    return `### ✍️ Document Officiel Rédigé avec Succès

Voici le document administratif officiel formaté selon les normes de l'EPST RDC. Vous pouvez le copier ou l'imprimer directement avec l'en-tête de votre école.`;
  }

  return `Analyse complétée pour **${data?.schoolName}**.`;
}

function generateSuggestedActions(toolName?: string, payload?: AnalystResponse["dataPayload"]): string[] {
  if (toolName === "getUnpaidStudentsAndDebts") {
    return [
      "📥 Exporter les impayés en Excel",
      "✍️ Rédiger une convocation aux parents",
      "📊 Répartir les impayés par classe",
      "💰 Élèves devant plus de 100 USD"
    ];
  }
  if (toolName === "getStudentsList") {
    return [
      "🔤 Trier par ordre alphabétique",
      "💰 Voir qui n'a pas encore payé",
      "📥 Télécharger la liste en Excel",
      "📊 Effectif par option"
    ];
  }
  if (toolName === "getSchoolStatistics") {
    return [
      "💰 Voir le détail des impayés",
      "📈 Palmarès des meilleurs élèves",
      "⏱️ Rapport des absences",
      "📋 Liste complète des élèves"
    ];
  }
  if (toolName === "getAcademicGradesAndRankings") {
    return [
      "⚠️ Voir les élèves en difficulté (<50%)",
      "🏆 Top 5 des meilleurs élèves",
      "📄 Exporter le palmarès en PDF",
      "✍️ Rédiger un mot aux parents"
    ];
  }
  return [
    "💰 Combien d'élèves n'ont pas payé ?",
    "📋 Liste alphabétique des élèves",
    "📊 Statistiques de l'école",
    "✍️ Rédiger une note de service"
  ];
}
