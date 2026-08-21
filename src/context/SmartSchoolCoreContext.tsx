import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Student, Employee, CustomFunction, CustomService, 
  DeveloperMobileMoneyAccount, PlatformCommissionConfig, Parent, 
  SchoolMobileMoneyAccount, CommissionAuditLogEntry, SchoolCommissionCustomSetting,
  SchoolPaymentAccountAuditLog, School as SchoolType
} from "../types";
import { safeLocalStorage } from "../utils/safeStorage";

export function searchParentsDatabase(parentsList: Parent[], query: string): Parent[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return parentsList.filter(p => {
    const fullName = `${p.firstName || ''} ${p.postName || ''} ${p.lastName || ''}`.toLowerCase();
    const reverseName = `${p.lastName || ''} ${p.postName || ''} ${p.firstName || ''}`.toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    const secPhone = (p.secondaryPhone || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const accNum = (p.parentAccountNumber || '').toLowerCase();
    const nationalId = (p.nationalId || '').toLowerCase();
    const id = (p.id || '').toLowerCase();
    const childrenStr = (p.childrenNames || []).join(' ').toLowerCase();

    return fullName.includes(q) || 
           reverseName.includes(q) || 
           phone.includes(q) || 
           secPhone.includes(q) || 
           email.includes(q) || 
           accNum.includes(q) || 
           nationalId.includes(q) || 
           id.includes(q) || 
           childrenStr.includes(q);
  });
}

export function generateParentAccountNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `PAR-${year}-${randomDigits}`;
}
import { 
  PrintTemplateConfig, 
  DEFAULT_PRINT_TEMPLATE, 
  buildSchoolPrintConfig,
  exportToExcel, 
  exportToPDF, 
  printDedicatedHTML 
} from "../services/exportService";

export const DEFAULT_DEVELOPER_MOMO_ACCOUNTS: DeveloperMobileMoneyAccount[] = [
  {
    id: "dev-momo-mpesa",
    provider: "M-Pesa Vodacom",
    holderName: "Ir IT Fred Kalonda (FREDTECH RDC)",
    phone: "+243 812 345 678",
    status: "Actif",
    isPrimary: true
  },
  {
    id: "dev-momo-orange",
    provider: "Orange Money",
    holderName: "Ir IT Fred Kalonda (FREDTECH RDC)",
    phone: "+243 890 000 111",
    status: "Désactivé",
    isPrimary: false
  },
  {
    id: "dev-momo-airtel",
    provider: "Airtel Money",
    holderName: "Ir IT Fred Kalonda",
    phone: "0994202940",
    status: "Actif",
    isPrimary: false
  },
  {
    id: "dev-momo-afrimoney",
    provider: "Afrimoney",
    holderName: "Ir IT Fred Kalonda (FREDTECH RDC)",
    phone: "+243 900 000 000",
    status: "Désactivé",
    isPrimary: false
  }
];

export const DEFAULT_PLATFORM_COMMISSION_CONFIG: PlatformCommissionConfig = {
  defaultRatePercent: 2.0,
  fixedFeeUSD: 0.0,
  isCommissionActive: true,
  primaryAccountId: "dev-momo-mpesa",
  schoolCustomRates: {},
  developerReceivingAccounts: {
    mobileMoney: {
      mpesa: { holderName: "SmartSchool RDC SURL", phone: "+243 812 345 678" },
      orange: { holderName: "SmartSchool RDC SURL", phone: "+243 890 000 000" },
      airtel: { holderName: "Ir IT Fred Kalonda", phone: "0994202940" },
      afrimoney: { holderName: "SmartSchool RDC SURL", phone: "+243 900 000 000" }
    },
    bankCard: {
      bankName: "RAWBANK RDC",
      holderName: "SMARTSCHOOL RDC SURL",
      accountNumber: "0001-9988776655-01"
    }
  }
};

export const DEFAULT_SCHOOL_MOMO_ACCOUNTS: SchoolMobileMoneyAccount[] = [
  // École A : Lycée Prince de Liège / CS Cardinal Malula (id: "default" ou "sch-001")
  {
    id: "sch-momo-1",
    schoolId: "default",
    schoolName: "Lycée Prince de Liège / CS Cardinal Malula",
    provider: "Airtel Money",
    accountNumber: "0994202940",
    phoneNumber: "0994202940",
    holderName: "CS CARDINAL MALULA (CAISSE MINERVAL)",
    accountName: "CS CARDINAL MALULA (CAISSE MINERVAL)",
    merchantCode: "AIR-8822",
    instructions: "Tapez *501*1*0994202940*Montant# puis confirmez avec votre code secret.",
    ussdInstruction: "*501*1*0994202940*Montant#",
    isActive: true,
    isPrimary: true,
    associatedFeeTypes: ["Minerval", "Tous les frais"],
    currencySupported: ["USD", "CDF"],
    createdAt: "2026-01-15T08:00:00.000Z"
  },
  {
    id: "sch-momo-2",
    schoolId: "default",
    schoolName: "Lycée Prince de Liège / CS Cardinal Malula",
    provider: "M-Pesa Vodacom",
    accountNumber: "0812888102",
    phoneNumber: "0812888102",
    holderName: "LYCEE PRINCE DE LIEGE (INSCRIPTIONS)",
    accountName: "LYCEE PRINCE DE LIEGE (INSCRIPTIONS)",
    merchantCode: "MP-4411",
    instructions: "Composez *1112*1*0812888102*Montant# et conservez la référence reçue par SMS.",
    ussdInstruction: "*1112*1*0812888102*Montant#",
    isActive: true,
    isPrimary: false,
    associatedFeeTypes: ["Frais d'inscription", "Frais d'examen"],
    currencySupported: ["USD", "CDF"],
    createdAt: "2026-01-15T08:00:00.000Z"
  },
  {
    id: "sch-momo-3",
    schoolId: "default",
    schoolName: "Lycée Prince de Liège / CS Cardinal Malula",
    provider: "Orange Money",
    accountNumber: "0890002233",
    phoneNumber: "0890002233",
    holderName: "SERVICE LOGISTIQUE CARDINAL MALULA",
    accountName: "SERVICE LOGISTIQUE CARDINAL MALULA",
    merchantCode: "OM-9922",
    instructions: "Composez *144*2*1*0890002233*Montant# puis validez votre paiement.",
    ussdInstruction: "*144*2*1*0890002233*Montant#",
    isActive: true,
    isPrimary: false,
    associatedFeeTypes: ["Transport", "Cantine", "Uniforme"],
    currencySupported: ["USD", "CDF"],
    createdAt: "2026-01-15T08:00:00.000Z"
  },

  // École B : Institut Technique & Scientifique Bokeleale (id: "sch-bokeleale")
  {
    id: "sch-momo-4",
    schoolId: "sch-bokeleale",
    schoolName: "Institut Technique & Scientifique Bokeleale",
    provider: "M-Pesa Vodacom",
    accountNumber: "0829888777",
    phoneNumber: "0829888777",
    holderName: "ITS BOKELEALE DIRECTION FINANCIERE",
    accountName: "ITS BOKELEALE DIRECTION FINANCIERE",
    merchantCode: "BOK-5599",
    instructions: "Composez *1112*1*0829888777*Montant# puis entrez votre code PIN.",
    ussdInstruction: "*1112*1*0829888777*Montant#",
    isActive: true,
    isPrimary: true,
    associatedFeeTypes: ["Minerval", "Tous les frais"],
    currencySupported: ["USD", "CDF"],
    createdAt: "2026-02-01T08:00:00.000Z"
  },
  {
    id: "sch-momo-5",
    schoolId: "sch-bokeleale",
    schoolName: "Institut Technique & Scientifique Bokeleale",
    provider: "Orange Money",
    accountNumber: "0895554433",
    phoneNumber: "0895554433",
    holderName: "CANTINE & ACTIVITES ITS BOKELEALE",
    accountName: "CANTINE & ACTIVITES ITS BOKELEALE",
    merchantCode: "OM-3377",
    instructions: "Composez *144*2*1*0895554433*Montant# puis validez le paiement de cantine.",
    ussdInstruction: "*144*2*1*0895554433*Montant#",
    isActive: true,
    isPrimary: false,
    associatedFeeTypes: ["Cantine", "Uniforme", "Frais de laboratoire"],
    currencySupported: ["USD", "CDF"],
    createdAt: "2026-02-01T08:00:00.000Z"
  },
  {
    id: "sch-momo-6",
    schoolId: "sch-bokeleale",
    schoolName: "Institut Technique & Scientifique Bokeleale",
    provider: "Airtel Money",
    accountNumber: "0970001122",
    phoneNumber: "0970001122",
    holderName: "SECRETARIAT GENERAL BOKELEALE",
    accountName: "SECRETARIAT GENERAL BOKELEALE",
    merchantCode: "AIR-1199",
    instructions: "Tapez *501*1*0970001122*Montant# pour les frais d'inscription et de diplôme.",
    ussdInstruction: "*501*1*0970001122*Montant#",
    isActive: true,
    isPrimary: false,
    associatedFeeTypes: ["Frais d'inscription", "Frais d'examen"],
    currencySupported: ["USD", "CDF"],
    createdAt: "2026-02-01T08:00:00.000Z"
  }
];

export const DEFAULT_CUSTOM_SERVICES: CustomService[] = [
  { id: "serv-1", name: "Direction Générale", code: "SERV-DIR", description: "Cabinet de la Direction Générale et Haute Instance", status: "Actif" },
  { id: "serv-2", name: "Préfecture & Pédagogie", code: "SERV-PREF", description: "Supervision des études, programmes scolaires et corps enseignant", status: "Actif" },
  { id: "serv-3", name: "Comptabilité & Caisse", code: "SERV-COMPT", description: "Gestion financière, recouvrement des frais et paie du personnel", status: "Actif" },
  { id: "serv-4", name: "Secrétariat Administratif", code: "SERV-SEC", description: "Inscriptions, correspondances officielles et archivage", status: "Actif" },
  { id: "serv-5", name: "Discipline & Surveillance", code: "SERV-DISC", description: "Encadrement de la discipline, présence des élèves et sécurité interne", status: "Actif" },
  { id: "serv-6", name: "Informatique & Laboratoire", code: "SERV-INFO", description: "Infrastructure réseau, salle multimédia et laboratoire scientifique", status: "Actif" },
  { id: "serv-7", name: "Bibliothèque & Documentation", code: "SERV-BIB", description: "Gestion du fonds documentaire et prêt d'ouvrages", status: "Actif" },
  { id: "serv-8", name: "Santé & Infirmerie", code: "SERV-SANTE", description: "Soins de premiers secours et suivi sanitaire de la communauté scolaire", status: "Actif" },
  { id: "serv-9", name: "Maintenance & Logistique", code: "SERV-MAINT", description: "Entretien des bâtiments, électricité, plomberie et propreté", status: "Actif" },
  { id: "serv-10", name: "Sécurité & Gardiennage", code: "SERV-SECU", description: "Protection physique du site, contrôle des accès et rondes", status: "Actif" },
  { id: "serv-11", name: "Transport Scolaire", code: "SERV-TR", description: "Gestion de la flotte de bus et circuits de ramassage", status: "Actif" },
  { id: "serv-12", name: "Cantine & Restauration", code: "SERV-CANT", description: "Service de restauration pour élèves et personnel", status: "Actif" }
];

export const DEFAULT_CUSTOM_FUNCTIONS: CustomFunction[] = [
  {
    id: "func-1",
    name: "Promoteur / Fondateur",
    category: "Administration",
    description: "Propriétaire et représentant légal de l'établissement scolaire",
    hierarchyLevel: 1,
    serviceName: "Direction Générale",
    code: "DIR-01",
    color: "#4f46e5",
    status: "Actif",
    permissions: ["system_admin", "manage_hr", "manage_finances", "view_reports", "manage_school_config"]
  },
  {
    id: "func-2",
    name: "Directeur Général / Chef d'Établissement",
    category: "Administration",
    description: "Supervision globale administrative, financière et pédagogique",
    hierarchyLevel: 1,
    serviceName: "Direction Générale",
    code: "DIR-02",
    color: "#4f46e5",
    status: "Actif",
    permissions: ["manage_students", "grade_entry", "manage_hr", "manage_finances", "manage_payroll", "manage_discipline", "view_reports"]
  },
  {
    id: "func-3",
    name: "Préfet des Études",
    category: "Enseignement",
    description: "Responsable de la pédagogie, de l'organisation des cours et examens",
    hierarchyLevel: 2,
    serviceName: "Préfecture & Pédagogie",
    code: "PREF-01",
    color: "#0284c7",
    status: "Actif",
    permissions: ["manage_students", "grade_entry", "manage_discipline", "view_reports"]
  },
  {
    id: "func-4",
    name: "Directeur des Études (Directeur Pédagogique)",
    category: "Enseignement",
    description: "Coordination des programmes scolaires, réunions pédagogiques et inspecteurs",
    hierarchyLevel: 2,
    serviceName: "Préfecture & Pédagogie",
    code: "PREF-02",
    color: "#0284c7",
    status: "Actif",
    permissions: ["manage_students", "grade_entry", "view_reports"]
  },
  {
    id: "func-5",
    name: "Conseiller de Discipline / Surveillant Général",
    category: "Discipline",
    description: "Maintien de l'ordre, gestion des retards, absences et fiches de conduite",
    hierarchyLevel: 2,
    serviceName: "Discipline & Surveillance",
    code: "DISC-01",
    color: "#d97706",
    status: "Actif",
    permissions: ["manage_students", "manage_discipline"]
  },
  {
    id: "func-6",
    name: "Chef Comptable",
    category: "Comptabilité",
    description: "Gestion de la trésorerie, suivi des frais d'écolage et bilans financiers",
    hierarchyLevel: 3,
    serviceName: "Comptabilité & Caisse",
    code: "COMPT-01",
    color: "#059669",
    status: "Actif",
    permissions: ["manage_finances", "manage_payroll", "view_reports"]
  },
  {
    id: "func-7",
    name: "Caissier / Percepteur",
    category: "Comptabilité",
    description: "Encaissement au guichet, enregistrement Mobile Money et délivrance des reçus",
    hierarchyLevel: 3,
    serviceName: "Comptabilité & Caisse",
    code: "COMPT-02",
    color: "#059669",
    status: "Actif",
    permissions: ["manage_finances"]
  },
  {
    id: "func-8",
    name: "Secrétaire de Direction",
    category: "Administration",
    description: "Réception, inscriptions des élèves, gestion des courriers et attestations",
    hierarchyLevel: 3,
    serviceName: "Secrétariat Administratif",
    code: "SEC-01",
    color: "#7c3aed",
    status: "Actif",
    permissions: ["manage_students"]
  },
  {
    id: "func-9",
    name: "Enseignant Titulaire / Professeur",
    category: "Enseignement",
    description: "Dispense des cours, tenue des journaux de classe et encodage des points",
    hierarchyLevel: 4,
    serviceName: "Préfecture & Pédagogie",
    code: "ENS-01",
    color: "#16a34a",
    status: "Actif",
    permissions: ["grade_entry"]
  },
  {
    id: "func-10",
    name: "Chef de Laboratoire & Informatique",
    category: "Technique",
    description: "Maintenance du parc informatique, gestion des travaux pratiques et réseau",
    hierarchyLevel: 3,
    serviceName: "Informatique & Laboratoire",
    code: "LAB-01",
    color: "#2563eb",
    status: "Actif",
    permissions: ["manage_inventory"]
  },
  {
    id: "func-11",
    name: "Bibliothécaire",
    category: "Administration",
    description: "Gestion des livres, prêts aux élèves et manuels scolaires MINEPSP",
    hierarchyLevel: 4,
    serviceName: "Bibliothèque & Documentation",
    code: "BIB-01",
    color: "#9333ea",
    status: "Actif",
    permissions: ["manage_inventory"]
  },
  {
    id: "func-12",
    name: "Infirmière Scolaire",
    category: "Santé",
    description: "Soins médicaux d'urgence, tenue des carnets de santé et fiches sanitaires",
    hierarchyLevel: 4,
    serviceName: "Santé & Infirmerie",
    code: "SANTE-01",
    color: "#e11d48",
    status: "Actif",
    permissions: []
  },
  {
    id: "func-13",
    name: "Agent de Sécurité / Gardien",
    category: "Sécurité",
    description: "Sécurisation des accès, gardiennage nocturne et filtrage des visiteurs",
    hierarchyLevel: 5,
    serviceName: "Sécurité & Gardiennage",
    code: "SECU-01",
    color: "#dc2626",
    status: "Actif",
    permissions: []
  },
  {
    id: "func-14",
    name: "Chauffeur de Bus Scolaire",
    category: "Technique",
    description: "Conduite du bus de ramassage et entretien de premier niveau des véhicules",
    hierarchyLevel: 5,
    serviceName: "Transport Scolaire",
    code: "TR-01",
    color: "#ea580c",
    status: "Actif",
    permissions: []
  },
  {
    id: "func-15",
    name: "Technicien de Surface / Agent d'Entretien",
    category: "Entretien",
    description: "Nettoyage des salles de classe, des locaux administratifs et hygiène",
    hierarchyLevel: 5,
    serviceName: "Maintenance & Logistique",
    code: "MAINT-01",
    color: "#64748b",
    status: "Actif",
    permissions: []
  }
];

interface SmartSchoolCoreContextType {
  printConfig: PrintTemplateConfig;
  updatePrintConfig: (newConfig: Partial<PrintTemplateConfig>) => void;
  getSchoolPrintConfig: (school?: Partial<SchoolType> | null, overrideConfig?: Partial<PrintTemplateConfig>) => PrintTemplateConfig;
  
  // Custom Services & Custom Functions
  customServices: CustomService[];
  customFunctions: CustomFunction[];
  addCustomService: (serv: Omit<CustomService, "id">) => void;
  updateCustomService: (serv: CustomService) => void;
  toggleCustomServiceStatus: (id: string) => void;
  deleteCustomService: (id: string, employees?: Employee[]) => { success: boolean; message: string };
  
  addCustomFunction: (fn: Omit<CustomFunction, "id">) => void;
  updateCustomFunction: (fn: CustomFunction) => void;
  toggleCustomFunctionStatus: (id: string) => void;
  deleteCustomFunction: (id: string, employees?: Employee[]) => { success: boolean; message: string };
  getFunctionPermissions: (functionName: string) => string[];

  // Developer Mobile Money & Platform Commission
  developerMomoAccounts: DeveloperMobileMoneyAccount[];
  platformCommissionConfig: PlatformCommissionConfig;
  updateDeveloperMomoAccount: (account: DeveloperMobileMoneyAccount) => void;
  toggleDeveloperMomoStatus: (id: string) => void;
  setPrimaryDeveloperMomoAccount: (id: string) => void;
  updatePlatformCommissionRate: (rate: number, actorName?: string) => void;
  togglePlatformCommissionActive: (active?: boolean, actorName?: string) => void;
  getPrimaryDeveloperMomoAccount: () => DeveloperMobileMoneyAccount | undefined;
  setSchoolCustomCommission: (schoolId: string, schoolName: string, rate: number, isActive: boolean, actorName?: string, notes?: string) => void;
  removeSchoolCustomCommission: (schoolId: string, actorName?: string) => void;
  updateDeveloperReceivingAccounts: (accounts: PlatformCommissionConfig['developerReceivingAccounts'], actorName?: string) => void;
  calculatePaymentCommission: (amount: number, schoolId?: string) => { ratePercent: number; commissionAmount: number; netSchoolAmount: number; isCommissionActive: boolean; status: "À transférer" | "Transféré" | "Exonéré" };
  addCommissionAuditLog: (log: Omit<CommissionAuditLogEntry, "id" | "timestamp">) => void;

  // School Mobile Money Accounts (Configured by each individual school)
  schoolMobileMoneyAccounts: SchoolMobileMoneyAccount[];
  getSchoolMobileMoneyAccounts: (schoolId?: string) => SchoolMobileMoneyAccount[];
  getSchoolReceivingAccountsForFee: (schoolId?: string, feeType?: string) => SchoolMobileMoneyAccount[];
  addSchoolMobileMoneyAccount: (account: Omit<SchoolMobileMoneyAccount, "id" | "createdAt">, actorName?: string, actorRole?: string) => SchoolMobileMoneyAccount;
  updateSchoolMobileMoneyAccount: (id: string, updates: Partial<SchoolMobileMoneyAccount>, actorName?: string, actorRole?: string) => void;
  toggleSchoolMobileMoneyAccount: (id: string, actorName?: string, actorRole?: string) => void;
  deleteSchoolMobileMoneyAccount: (id: string, actorName?: string, actorRole?: string) => void;
  setPrimarySchoolMobileMoneyAccount: (schoolId: string, accountId: string, actorName?: string, actorRole?: string) => void;

  // School Payment Audit Logs
  schoolPaymentAuditLogs: SchoolPaymentAccountAuditLog[];
  addSchoolPaymentAuditLog: (log: Omit<SchoolPaymentAccountAuditLog, "id" | "timestamp">) => void;
  getSchoolPaymentAuditLogs: (schoolId?: string) => SchoolPaymentAccountAuditLog[];

  exportStudentsExcel: (studentsList: Student[], titleSuffix?: string, userName?: string, schoolOverride?: Partial<SchoolType>) => void;
  exportEmployeesExcel: (employeesList: Employee[], titleSuffix?: string, userName?: string, schoolOverride?: Partial<SchoolType>) => void;
  exportStudentsPDF: (studentsList: Student[], titleSuffix?: string, userName?: string, orientation?: "portrait" | "landscape", schoolOverride?: Partial<SchoolType>) => void;
  exportEmployeesPDF: (employeesList: Employee[], titleSuffix?: string, userName?: string, orientation?: "portrait" | "landscape", schoolOverride?: Partial<SchoolType>) => void;
  exportTableExcel: (title: string, headers: string[], rows: (string | number)[][], filename: string, userName?: string, schoolOverride?: Partial<SchoolType>) => void;
  exportTablePDF: (title: string, headers: string[], rows: (string | number)[][], filename: string, userName?: string, orientation?: "portrait" | "landscape", schoolOverride?: Partial<SchoolType>) => void;
  printDedicatedTable: (title: string, headers: string[], rows: (string | number)[][], subtitle?: string, schoolOverride?: Partial<SchoolType>) => void;
}

const SmartSchoolCoreContext = createContext<SmartSchoolCoreContextType | undefined>(undefined);

export const SmartSchoolCoreProvider: React.FC<{ children: React.ReactNode; initialSchoolName?: string }> = ({ 
  children, 
  initialSchoolName 
}) => {
  const [printConfig, setPrintConfig] = useState<PrintTemplateConfig>(() => {
    const saved = safeLocalStorage.getItem("ss_print_template_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PRINT_TEMPLATE, ...parsed };
      } catch (e) {
        console.error("Error parsing print template config:", e);
      }
    }
    return {
      ...DEFAULT_PRINT_TEMPLATE,
      schoolName: initialSchoolName || DEFAULT_PRINT_TEMPLATE.schoolName
    };
  });

  // Services State
  const [customServices, setCustomServices] = useState<CustomService[]>(() => {
    const saved = safeLocalStorage.getItem("ss_custom_services");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error parsing custom services:", e);
      }
    }
    return DEFAULT_CUSTOM_SERVICES;
  });

  // Functions State
  const [customFunctions, setCustomFunctions] = useState<CustomFunction[]>(() => {
    const saved = safeLocalStorage.getItem("ss_custom_functions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error parsing custom functions:", e);
      }
    }
    return DEFAULT_CUSTOM_FUNCTIONS;
  });

  // Developer Mobile Money State
  const [developerMomoAccounts, setDeveloperMomoAccounts] = useState<DeveloperMobileMoneyAccount[]>(() => {
    const saved = safeLocalStorage.getItem("ss_developer_momo_accounts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error parsing developer momo accounts:", e);
      }
    }
    return DEFAULT_DEVELOPER_MOMO_ACCOUNTS;
  });

  // Platform Commission State
  const [platformCommissionConfig, setPlatformCommissionConfig] = useState<PlatformCommissionConfig>(() => {
    const saved = safeLocalStorage.getItem("ss_platform_commission_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PLATFORM_COMMISSION_CONFIG, ...parsed };
      } catch (e) {
        console.error("Error parsing platform commission config:", e);
      }
    }
    return DEFAULT_PLATFORM_COMMISSION_CONFIG;
  });

  // Sync state to localStorage
  useEffect(() => {
    safeLocalStorage.setItem("ss_developer_momo_accounts", JSON.stringify(developerMomoAccounts));
  }, [developerMomoAccounts]);

  useEffect(() => {
    safeLocalStorage.setItem("ss_platform_commission_config", JSON.stringify(platformCommissionConfig));
  }, [platformCommissionConfig]);

  // Handlers for Developer Mobile Money
  const updateDeveloperMomoAccount = (account: DeveloperMobileMoneyAccount) => {
    setDeveloperMomoAccounts(prev => prev.map(a => a.id === account.id ? { ...account, updatedAt: new Date().toISOString() } : a));
  };

  const toggleDeveloperMomoStatus = (id: string) => {
    setDeveloperMomoAccounts(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus = a.status === "Actif" ? "Désactivé" : "Actif";
        return { ...a, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return a;
    }));
  };

  const setPrimaryDeveloperMomoAccount = (id: string) => {
    setDeveloperMomoAccounts(prev => prev.map(a => ({
      ...a,
      isPrimary: a.id === id,
      status: a.id === id ? "Actif" : a.status, // Auto-activate if setting as primary
      updatedAt: new Date().toISOString()
    })));
    setPlatformCommissionConfig(prev => ({ ...prev, primaryAccountId: id }));
  };

  const addCommissionAuditLog = (log: Omit<CommissionAuditLogEntry, "id" | "timestamp">) => {
    const newEntry: CommissionAuditLogEntry = {
      ...log,
      id: `comm-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    setPlatformCommissionConfig(prev => ({
      ...prev,
      auditLogs: [newEntry, ...(prev.auditLogs || [])]
    }));
  };

  const updatePlatformCommissionRate = (rate: number, actorName = "Propriétaire SmartSchool") => {
    const validRate = Math.max(0, Math.min(100, rate));
    const oldRate = platformCommissionConfig.defaultRatePercent;
    setPlatformCommissionConfig(prev => ({ ...prev, defaultRatePercent: validRate }));
    addCommissionAuditLog({
      actor: actorName,
      actorRole: "Propriétaire de la Plateforme",
      action: "Modification Taux Global de Commission",
      oldValue: `${oldRate}%`,
      newValue: `${validRate}%`,
      notes: "Mise à jour du barème par défaut de la commission SmartSchool RDC"
    });
  };

  const togglePlatformCommissionActive = (active?: boolean, actorName = "Propriétaire SmartSchool") => {
    const nextState = active !== undefined ? active : !platformCommissionConfig.isCommissionActive;
    const oldState = platformCommissionConfig.isCommissionActive;
    setPlatformCommissionConfig(prev => ({
      ...prev,
      isCommissionActive: nextState
    }));
    addCommissionAuditLog({
      actor: actorName,
      actorRole: "Propriétaire de la Plateforme",
      action: "Changement Statut Global Commission",
      oldValue: oldState ? "Activée" : "Désactivée",
      newValue: nextState ? "Activée" : "Désactivée",
      notes: nextState ? "Activation de la commission SmartSchool sur les encaissements" : "Désactivation globale de la commission"
    });
  };

  const setSchoolCustomCommission = (
    schoolId: string, 
    schoolName: string, 
    rate: number, 
    isActive: boolean, 
    actorName = "Propriétaire SmartSchool",
    notes?: string
  ) => {
    const validRate = Math.max(0, Math.min(100, rate));
    const oldSetting = platformCommissionConfig.schoolCustomRates[schoolId];
    const oldValStr = typeof oldSetting === "object" && oldSetting !== null 
      ? `${oldSetting.ratePercent}% (${oldSetting.isCommissionActive ? 'Active' : 'Désactivée'})`
      : typeof oldSetting === "number" 
      ? `${oldSetting}%`
      : "Barème global par défaut (2.0%)";

    const newSetting: SchoolCommissionCustomSetting = {
      schoolId,
      schoolName,
      ratePercent: validRate,
      isCommissionActive: isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: actorName,
      notes
    };

    setPlatformCommissionConfig(prev => ({
      ...prev,
      schoolCustomRates: {
        ...prev.schoolCustomRates,
        [schoolId]: newSetting
      }
    }));

    addCommissionAuditLog({
      actor: actorName,
      actorRole: "Propriétaire de la Plateforme",
      action: "Configuration Commission Établissement",
      targetSchoolId: schoolId,
      targetSchoolName: schoolName,
      oldValue: oldValStr,
      newValue: `${validRate}% (${isActive ? 'Active' : 'Commission Désactivée'})`,
      notes: notes || `Modification de la commission pour l'école ${schoolName}`
    });
  };

  const removeSchoolCustomCommission = (schoolId: string, actorName = "Propriétaire SmartSchool") => {
    const oldSetting = platformCommissionConfig.schoolCustomRates[schoolId];
    if (!oldSetting) return;

    setPlatformCommissionConfig(prev => {
      const updated = { ...prev.schoolCustomRates };
      delete updated[schoolId];
      return { ...prev, schoolCustomRates: updated };
    });

    addCommissionAuditLog({
      actor: actorName,
      actorRole: "Propriétaire de la Plateforme",
      action: "Rétablissement Commission Standard",
      targetSchoolId: schoolId,
      oldValue: "Taux personnalisé",
      newValue: `Barème standard (${platformCommissionConfig.defaultRatePercent}%)`,
      notes: "Retour au taux par défaut de la plateforme"
    });
  };

  const updateDeveloperReceivingAccounts = (
    accounts: PlatformCommissionConfig['developerReceivingAccounts'],
    actorName = "Propriétaire SmartSchool"
  ) => {
    setPlatformCommissionConfig(prev => ({
      ...prev,
      developerReceivingAccounts: accounts
    }));
    addCommissionAuditLog({
      actor: actorName,
      actorRole: "Propriétaire de la Plateforme",
      action: "Mise à Jour Comptes de Réception Plateforme",
      oldValue: "Anciennes coordonnées bancaires/momo",
      newValue: "Nouvelles coordonnées enregistrées",
      notes: "Comptes de reversement des commissions du propriétaire mis à jour"
    });
  };

  const calculatePaymentCommission = (amount: number, schoolId?: string) => {
    if (!platformCommissionConfig.isCommissionActive) {
      return {
        ratePercent: 0,
        commissionAmount: 0,
        netSchoolAmount: amount,
        isCommissionActive: false,
        status: "Exonéré" as const
      };
    }

    let rate = platformCommissionConfig.defaultRatePercent;
    let isActiveForSchool = true;

    if (schoolId && platformCommissionConfig.schoolCustomRates[schoolId]) {
      const custom = platformCommissionConfig.schoolCustomRates[schoolId];
      if (typeof custom === "number") {
        rate = custom;
      } else if (typeof custom === "object" && custom !== null) {
        rate = custom.ratePercent;
        isActiveForSchool = custom.isCommissionActive;
      }
    }

    if (!isActiveForSchool || rate <= 0) {
      return {
        ratePercent: 0,
        commissionAmount: 0,
        netSchoolAmount: amount,
        isCommissionActive: false,
        status: "Exonéré" as const
      };
    }

    const commissionAmount = Number(((amount * rate) / 100).toFixed(2));
    const netSchoolAmount = Number((amount - commissionAmount).toFixed(2));

    return {
      ratePercent: rate,
      commissionAmount,
      netSchoolAmount,
      isCommissionActive: true,
      status: "À transférer" as const
    };
  };

  const getPrimaryDeveloperMomoAccount = (): DeveloperMobileMoneyAccount | undefined => {
    return developerMomoAccounts.find(a => a.id === platformCommissionConfig.primaryAccountId) || developerMomoAccounts.find(a => a.isPrimary) || developerMomoAccounts[0];
  };

  useEffect(() => {
    safeLocalStorage.setItem("ss_custom_functions", JSON.stringify(customFunctions));
  }, [customFunctions]);

  // School Mobile Money Accounts State (Configurable by each school)
  const [schoolMobileMoneyAccounts, setSchoolMobileMoneyAccounts] = useState<SchoolMobileMoneyAccount[]>(() => {
    const saved = safeLocalStorage.getItem("ss_school_momo_accounts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error parsing school momo accounts:", e);
      }
    }
    return DEFAULT_SCHOOL_MOMO_ACCOUNTS;
  });

  useEffect(() => {
    safeLocalStorage.setItem("ss_school_momo_accounts", JSON.stringify(schoolMobileMoneyAccounts));
  }, [schoolMobileMoneyAccounts]);

  // School Payment Audit Logs State
  const [schoolPaymentAuditLogs, setSchoolPaymentAuditLogs] = useState<SchoolPaymentAccountAuditLog[]>(() => {
    const saved = safeLocalStorage.getItem("ss_school_payment_audit_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Error parsing payment audit logs:", e);
      }
    }
    return [
      {
        id: "sch-audit-init-1",
        schoolId: "default",
        schoolName: "Lycée Prince de Liège / CS Cardinal Malula",
        actor: "Promoteur Fondateur",
        actorRole: "Promoteur",
        action: "Ajout Moyen de Réception",
        provider: "Airtel Money",
        accountNumber: "0994202940",
        details: "Configuration initiale du compte Airtel Money pour Minerval et Tous les frais",
        timestamp: "2026-01-15T08:30:00.000Z"
      },
      {
        id: "sch-audit-init-2",
        schoolId: "sch-bokeleale",
        schoolName: "Institut Technique & Scientifique Bokeleale",
        actor: "Direction Bokeleale",
        actorRole: "Promoteur",
        action: "Ajout Moyen de Réception",
        provider: "M-Pesa Vodacom",
        accountNumber: "0829888777",
        details: "Configuration du compte principal M-Pesa pour le Minerval",
        timestamp: "2026-02-01T08:30:00.000Z"
      }
    ];
  });

  useEffect(() => {
    safeLocalStorage.setItem("ss_school_payment_audit_logs", JSON.stringify(schoolPaymentAuditLogs));
  }, [schoolPaymentAuditLogs]);

  const addSchoolPaymentAuditLog = (log: Omit<SchoolPaymentAccountAuditLog, "id" | "timestamp">) => {
    const entry: SchoolPaymentAccountAuditLog = {
      ...log,
      id: `audit-sch-pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    setSchoolPaymentAuditLogs(prev => [entry, ...prev]);
  };

  const getSchoolPaymentAuditLogs = (schoolId?: string): SchoolPaymentAccountAuditLog[] => {
    if (!schoolId || schoolId === "default" || schoolId === "all") {
      return schoolPaymentAuditLogs;
    }
    return schoolPaymentAuditLogs.filter(l => l.schoolId === schoolId);
  };

  const getSchoolMobileMoneyAccounts = (schoolId?: string): SchoolMobileMoneyAccount[] => {
    if (!schoolId || schoolId === "all") {
      return schoolMobileMoneyAccounts;
    }
    // Match exact schoolId or "default"
    const targetId = schoolId === "default" ? "default" : schoolId;
    const filtered = schoolMobileMoneyAccounts.filter(a => a.schoolId === targetId || (targetId === "default" && a.schoolId === "sch-001"));
    return filtered.length > 0 ? filtered : schoolMobileMoneyAccounts.filter(a => a.schoolId === "default");
  };

  const getSchoolReceivingAccountsForFee = (schoolId?: string, feeType?: string): SchoolMobileMoneyAccount[] => {
    const schoolAccounts = getSchoolMobileMoneyAccounts(schoolId).filter(a => a.isActive);
    if (!feeType) return schoolAccounts;

    const matching = schoolAccounts.filter(acc => {
      if (!acc.associatedFeeTypes || acc.associatedFeeTypes.length === 0) return true;
      if (acc.associatedFeeTypes.includes("Tous les frais")) return true;
      return acc.associatedFeeTypes.some(f => f.toLowerCase() === feeType.toLowerCase());
    });

    return matching.length > 0 ? matching : schoolAccounts;
  };

  const addSchoolMobileMoneyAccount = (
    account: Omit<SchoolMobileMoneyAccount, "id" | "createdAt">,
    actorName = "Promoteur de l'école",
    actorRole = "Promoteur"
  ): SchoolMobileMoneyAccount => {
    const newAccount: SchoolMobileMoneyAccount = {
      ...account,
      id: `sch-momo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSchoolMobileMoneyAccounts(prev => [...prev, newAccount]);

    addSchoolPaymentAuditLog({
      schoolId: account.schoolId || "default",
      schoolName: account.schoolName,
      actor: actorName,
      actorRole,
      action: "Ajout Moyen de Réception",
      provider: account.provider,
      accountNumber: account.accountNumber,
      details: `Ajout du compte ${account.provider} (${account.accountNumber}) au nom de "${account.holderName}". Frais associés : ${(account.associatedFeeTypes || []).join(", ") || "Tous les frais"}`
    });

    return newAccount;
  };

  const updateSchoolMobileMoneyAccount = (
    id: string, 
    updates: Partial<SchoolMobileMoneyAccount>,
    actorName = "Promoteur de l'école",
    actorRole = "Promoteur"
  ) => {
    const current = schoolMobileMoneyAccounts.find(a => a.id === id);
    setSchoolMobileMoneyAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));

    if (current) {
      addSchoolPaymentAuditLog({
        schoolId: current.schoolId || "default",
        schoolName: current.schoolName,
        actor: actorName,
        actorRole,
        action: "Modification Moyen de Réception",
        provider: updates.provider || current.provider,
        accountNumber: updates.accountNumber || current.accountNumber,
        details: `Mise à jour des paramètres du compte ${current.provider} (${current.accountNumber}). Titulaire: ${updates.holderName || current.holderName}`
      });
    }
  };

  const toggleSchoolMobileMoneyAccount = (
    id: string,
    actorName = "Promoteur de l'école",
    actorRole = "Promoteur"
  ) => {
    const current = schoolMobileMoneyAccounts.find(a => a.id === id);
    setSchoolMobileMoneyAccounts(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, isActive: !a.isActive, updatedAt: new Date().toISOString() };
      }
      return a;
    }));

    if (current) {
      const nextStatus = !current.isActive;
      addSchoolPaymentAuditLog({
        schoolId: current.schoolId || "default",
        schoolName: current.schoolName,
        actor: actorName,
        actorRole,
        action: nextStatus ? "Activation Compte" : "Désactivation Compte",
        provider: current.provider,
        accountNumber: current.accountNumber,
        details: `Le compte ${current.provider} (${current.accountNumber}) est désormais ${nextStatus ? "ACTIF pour recevoir les paiements" : "DÉSACTIVÉ"}`
      });
    }
  };

  const deleteSchoolMobileMoneyAccount = (
    id: string,
    actorName = "Promoteur de l'école",
    actorRole = "Promoteur"
  ) => {
    const current = schoolMobileMoneyAccounts.find(a => a.id === id);
    setSchoolMobileMoneyAccounts(prev => prev.filter(a => a.id !== id));

    if (current) {
      addSchoolPaymentAuditLog({
        schoolId: current.schoolId || "default",
        schoolName: current.schoolName,
        actor: actorName,
        actorRole,
        action: "Suppression Moyen de Réception",
        provider: current.provider,
        accountNumber: current.accountNumber,
        details: `Suppression définitive du compte ${current.provider} (${current.accountNumber})`
      });
    }
  };

  const setPrimarySchoolMobileMoneyAccount = (
    schoolId: string, 
    accountId: string,
    actorName = "Promoteur de l'école",
    actorRole = "Promoteur"
  ) => {
    const targetId = schoolId || "default";
    setSchoolMobileMoneyAccounts(prev => prev.map(a => {
      if (a.schoolId === targetId || (targetId === "default" && a.schoolId === "sch-001")) {
        return {
          ...a,
          isPrimary: a.id === accountId,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    }));

    const account = schoolMobileMoneyAccounts.find(a => a.id === accountId);
    if (account) {
      addSchoolPaymentAuditLog({
        schoolId: targetId,
        schoolName: account.schoolName,
        actor: actorName,
        actorRole,
        action: "Définition Compte Principal",
        provider: account.provider,
        accountNumber: account.accountNumber,
        details: `Le compte ${account.provider} (${account.accountNumber}) a été désigné comme compte principal de l'établissement.`
      });
    }
  };

  // CRUD for Services
  const addCustomService = (serv: Omit<CustomService, "id">) => {
    const newService: CustomService = {
      ...serv,
      id: `serv-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomServices(prev => [...prev, newService]);
  };

  const updateCustomService = (serv: CustomService) => {
    setCustomServices(prev => prev.map(s => s.id === serv.id ? serv : s));
  };

  const toggleCustomServiceStatus = (id: string) => {
    setCustomServices(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === "Actif" ? "Inactif" : "Actif" };
      }
      return s;
    }));
  };

  const deleteCustomService = (id: string, employees: Employee[] = []) => {
    const serviceToDelete = customServices.find(s => s.id === id);
    if (!serviceToDelete) return { success: false, message: "Service introuvable." };

    // Check if any active function belongs to this service
    const attachedFunctions = customFunctions.filter(f => f.serviceName.toLowerCase() === serviceToDelete.name.toLowerCase() || f.serviceId === id);
    if (attachedFunctions.length > 0) {
      return { 
        success: false, 
        message: `Impossible de supprimer le service "${serviceToDelete.name}". ${attachedFunctions.length} fonction(s) y sont encore rattachée(s) (${attachedFunctions.map(f => f.name).join(", ")}).` 
      };
    }

    // Check if any employee is in this service
    const attachedEmployees = employees.filter(e => e.service?.toLowerCase() === serviceToDelete.name.toLowerCase());
    if (attachedEmployees.length > 0) {
      return {
        success: false,
        message: `Impossible de supprimer le service "${serviceToDelete.name}". ${attachedEmployees.length} agent(s) y sont assigné(s).`
      };
    }

    setCustomServices(prev => prev.filter(s => s.id !== id));
    return { success: true, message: "Service supprimé avec succès." };
  };

  // CRUD for Functions
  const addCustomFunction = (fn: Omit<CustomFunction, "id">) => {
    const newFn: CustomFunction = {
      ...fn,
      id: `func-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomFunctions(prev => [...prev, newFn]);
  };

  const updateCustomFunction = (fn: CustomFunction) => {
    setCustomFunctions(prev => prev.map(f => f.id === fn.id ? fn : f));
  };

  const toggleCustomFunctionStatus = (id: string) => {
    setCustomFunctions(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, status: f.status === "Actif" ? "Inactif" : "Actif" };
      }
      return f;
    }));
  };

  const deleteCustomFunction = (id: string, employees: Employee[] = []) => {
    const fnToDelete = customFunctions.find(f => f.id === id);
    if (!fnToDelete) return { success: false, message: "Fonction introuvable." };

    // Check if any employee currently holds this function
    const assignedEmployees = employees.filter(e => e.function.trim().toLowerCase() === fnToDelete.name.trim().toLowerCase());
    if (assignedEmployees.length > 0) {
      return {
        success: false,
        message: `Impossible de supprimer la fonction "${fnToDelete.name}". ${assignedEmployees.length} agent(s) y sont actuellement affecté(s) (${assignedEmployees.slice(0, 3).map(e => `${e.lastName} ${e.firstName}`).join(", ")}${assignedEmployees.length > 3 ? '...' : ''}).`
      };
    }

    setCustomFunctions(prev => prev.filter(f => f.id !== id));
    return { success: true, message: "Fonction supprimée avec succès." };
  };

  const getFunctionPermissions = (functionName: string): string[] => {
    const found = customFunctions.find(f => f.name.trim().toLowerCase() === functionName.trim().toLowerCase());
    return found ? found.permissions : [];
  };

  // Sync initial school name if changed
  useEffect(() => {
    if (initialSchoolName && initialSchoolName !== printConfig.schoolName) {
      setPrintConfig(prev => ({ ...prev, schoolName: initialSchoolName }));
    }
  }, [initialSchoolName]);

  const updatePrintConfig = (newConfig: Partial<PrintTemplateConfig>) => {
    setPrintConfig(prev => {
      const updated = { ...prev, ...newConfig };
      safeLocalStorage.setItem("ss_print_template_config", JSON.stringify(updated));
      return updated;
    });
  };

  const getSchoolPrintConfig = (school?: Partial<SchoolType> | null, overrideConfig?: Partial<PrintTemplateConfig>): PrintTemplateConfig => {
    return buildSchoolPrintConfig(school, { ...printConfig, ...(overrideConfig || {}) });
  };

  // Helper: Export Students to XLSX
  const exportStudentsExcel = (
    studentsList: Student[], 
    titleSuffix = "OFFICIELLE", 
    userName = "Directeur Pédagogique",
    schoolOverride?: Partial<SchoolType>
  ) => {
    const effectiveConfig = getSchoolPrintConfig(schoolOverride);
    const headers: string[] = ["N°", "Matricule", "Nom", "Post-nom & Prénom", "Sexe", "Classe", "Option", "Statut", "Tuteur", "Téléphone Tuteur", "Date Inscription"];
    
    // Check fields configuration
    if (!effectiveConfig.showPhone) headers.splice(headers.indexOf("Téléphone Tuteur"), 1);
    if (!effectiveConfig.showStatus) headers.splice(headers.indexOf("Statut"), 1);

    const rows = studentsList.map((s, idx) => {
      const nameParts = s.lastName ? s.lastName.split(" ") : ["", ""];
      const row: (string | number)[] = [
        idx + 1,
        s.registrationNumber || s.id || `ELE-2026-${idx + 1}`,
        nameParts[0] || s.lastName || "N/A",
        `${nameParts.slice(1).join(" ")} ${s.firstName}`.trim(),
        s.gender || "M",
        s.className || "N/A",
        s.optionName || "Général",
        s.status || "Actif",
        s.parentName || "N/A",
        s.parentPhone || "N/A",
        s.createdAtDate || new Date().toLocaleDateString("fr-FR")
      ];
      return row;
    });

    const title = `LISTE DES ÉLÈVES - ${titleSuffix.toUpperCase()}`;
    const filename = `Liste_Eleves_${titleSuffix.replace(/\s+/g, "_")}_${effectiveConfig.schoolYear}`;

    exportToExcel({
      title,
      subtitle: `Total : ${studentsList.length} Élève(s)`,
      headers,
      rows,
      filename,
      schoolConfig: effectiveConfig,
      userName
    });
  };

  // Helper: Export Employees to XLSX
  const exportEmployeesExcel = (
    employeesList: Employee[], 
    titleSuffix = "PERSONNEL", 
    userName = "Direction RH",
    schoolOverride?: Partial<SchoolType>
  ) => {
    const effectiveConfig = getSchoolPrintConfig(schoolOverride);
    const headers = ["N°", "Matricule", "Nom", "Prénom", "Sexe", "Fonction / Poste", "Département / Service", "Téléphone", "E-mail", "Statut", "Date d'embauche"];
    
    const rows = employeesList.map((e, idx) => [
      idx + 1,
      e.matricule || `EMP-2026-${idx + 1}`,
      e.lastName || "N/A",
      e.firstName || "N/A",
      e.gender || "M",
      e.function || "Enseignant",
      e.department || e.service || "Pédagogie",
      e.phone || "N/A",
      e.email || "N/A",
      e.status || "Actif",
      e.hireDate || "01/09/2024"
    ]);

    const title = `LISTE DU PERSONNEL & ENSEIGNANTS - ${titleSuffix.toUpperCase()}`;
    const filename = `Liste_Personnel_${titleSuffix.replace(/\s+/g, "_")}_${effectiveConfig.schoolYear}`;

    exportToExcel({
      title,
      subtitle: `Total : ${employeesList.length} Agent(s)`,
      headers,
      rows,
      filename,
      schoolConfig: effectiveConfig,
      userName
    });
  };

  // Helper: Export Students to PDF
  const exportStudentsPDF = (
    studentsList: Student[], 
    titleSuffix = "OFFICIELLE", 
    userName = "Directeur Pédagogique",
    orientation: "portrait" | "landscape" = "landscape",
    schoolOverride?: Partial<SchoolType>
  ) => {
    const effectiveConfig = getSchoolPrintConfig(schoolOverride);
    const headers = ["N°", "Matricule", "Nom & Prénom", "Sexe", "Classe", "Option", "Statut", "Tuteur & Contact"];
    
    const rows = studentsList.map((s, idx) => [
      idx + 1,
      s.registrationNumber || s.id || `ELE-${idx + 1}`,
      `${s.lastName} ${s.firstName}`,
      s.gender || "M",
      s.className || "N/A",
      s.optionName || "Général",
      s.status || "Actif",
      `${s.parentName || "Tuteur"} (${s.parentPhone || "S/C"})`
    ]);

    const title = `LISTE OFFICIELLE DES ÉLÈVES - ${titleSuffix.toUpperCase()}`;
    const filename = `Liste_Eleves_${titleSuffix.replace(/\s+/g, "_")}_${effectiveConfig.schoolYear}`;

    exportToPDF({
      title,
      subtitle: `Effectif : ${studentsList.length} Élèves | Année Scolaire ${effectiveConfig.schoolYear}`,
      headers,
      rows,
      filename,
      schoolConfig: effectiveConfig,
      userName,
      orientation
    });
  };

  // Helper: Export Employees to PDF
  const exportEmployeesPDF = (
    employeesList: Employee[], 
    titleSuffix = "PERSONNEL", 
    userName = "Direction RH",
    orientation: "portrait" | "landscape" = "portrait",
    schoolOverride?: Partial<SchoolType>
  ) => {
    const effectiveConfig = getSchoolPrintConfig(schoolOverride);
    const headers = ["N°", "Matricule", "Nom & Prénom", "Sexe", "Fonction / Poste", "Département", "Téléphone", "Statut"];
    
    const rows = employeesList.map((e, idx) => [
      idx + 1,
      e.matricule || `EMP-${idx + 1}`,
      `${e.lastName} ${e.firstName}`,
      e.gender || "M",
      e.function || "Enseignant",
      e.department || e.service || "Pédagogie",
      e.phone || "N/A",
      e.status || "Actif"
    ]);

    const title = `LISTE OFFICIELLE DU PERSONNEL & ENSEIGNANTS - ${titleSuffix.toUpperCase()}`;
    const filename = `Liste_Personnel_${titleSuffix.replace(/\s+/g, "_")}_${effectiveConfig.schoolYear}`;

    exportToPDF({
      title,
      subtitle: `Effectif : ${employeesList.length} Agents | Année Scolaire ${effectiveConfig.schoolYear}`,
      headers,
      rows,
      filename,
      schoolConfig: effectiveConfig,
      userName,
      orientation
    });
  };

  // Helper: Generic Table Excel Export
  const exportTableExcel = (
    title: string, 
    headers: string[], 
    rows: (string | number)[][], 
    filename: string, 
    userName = "Admin",
    schoolOverride?: Partial<SchoolType>
  ) => {
    const effectiveConfig = getSchoolPrintConfig(schoolOverride);
    exportToExcel({
      title,
      headers,
      rows,
      filename,
      schoolConfig: effectiveConfig,
      userName
    });
  };

  // Helper: Generic Table PDF Export
  const exportTablePDF = (
    title: string, 
    headers: string[], 
    rows: (string | number)[][], 
    filename: string, 
    userName = "Admin",
    orientation: "portrait" | "landscape" = "portrait",
    schoolOverride?: Partial<SchoolType>
  ) => {
    const effectiveConfig = getSchoolPrintConfig(schoolOverride);
    exportToPDF({
      title,
      headers,
      rows,
      filename,
      schoolConfig: effectiveConfig,
      userName,
      orientation
    });
  };

  // Helper: Dedicated Print Window trigger
  const printDedicatedTable = (
    title: string, 
    headers: string[], 
    rows: (string | number)[][], 
    subtitle?: string,
    schoolOverride?: Partial<SchoolType>
  ) => {
    const effectiveConfig = getSchoolPrintConfig(schoolOverride);
    const tableHeadersHTML = headers.map(h => `<th>${h}</th>`).join("");
    const tableRowsHTML = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");

    const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const headerLogoHTML = effectiveConfig.logoUrl ? `
      <img src="${effectiveConfig.logoUrl}" alt="Logo École" style="height: 52px; width: auto; object-fit: contain; margin-right: 14px;" />
    ` : "";

    const html = `
      <div class="header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0078D4; padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center;">
          ${headerLogoHTML}
          <div>
            <div class="header-title" style="font-size: 16px; font-weight: 800; color: #0078D4; text-transform: uppercase;">${effectiveConfig.schoolName}</div>
            <div class="header-sub" style="font-size: 11px; color: #475569;">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO ${effectiveConfig.province ? `• Province : ${effectiveConfig.province}` : ""}</div>
            <div class="header-sub" style="font-size: 10px; color: #64748b;">
              ${effectiveConfig.schoolMotto ? `Devise : "${effectiveConfig.schoolMotto}" | ` : ""}
              ${effectiveConfig.phone ? `Tél : ${effectiveConfig.phone} | ` : ""}
              Année Scolaire : ${effectiveConfig.schoolYear}
            </div>
          </div>
        </div>
        <div style="text-align: right; font-size: 10px; color: #64748b;">
          ${effectiveConfig.minepspConformityCode ? `<div>Code MINEPSP : <strong>${effectiveConfig.minepspConformityCode}</strong></div>` : ""}
          <div>Imprimé le : ${dateStr}</div>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${title}</h2>
        ${subtitle ? `<p style="font-size: 11px; color: #475569; margin-top: 2px;">${subtitle}</p>` : ""}
      </div>

      <table>
        <thead>
          <tr>${tableHeadersHTML}</tr>
        </thead>
        <tbody>
          ${tableRowsHTML}
        </tbody>
      </table>

      <div class="stamp-box">
        <div>
          <div>${effectiveConfig.signatory2Title}</div>
          <div style="margin-top: 40px; color: #94a3b8;">${effectiveConfig.signatory2Name}</div>
        </div>
        ${effectiveConfig.showStamp ? `
          <div style="border: 2px dashed #0078D4; padding: 10px 20px; border-radius: 8px; color: #0078D4; font-size: 10px; text-align: center;">
            SCEAU DE L'ÉTABLISSEMENT<br>
            <span style="font-size: 8px; color: #64748b;">VALIDE POUR TOUS DROITS</span>
          </div>
        ` : ""}
        <div>
          <div>${effectiveConfig.signatory1Title}</div>
          <div style="margin-top: 40px; color: #94a3b8;">${effectiveConfig.signatory1Name}</div>
        </div>
      </div>

      <div class="footer">
        <div>Nombre d'enregistrements : <strong>${rows.length}</strong></div>
        <div>Document Officiel Émis par ${effectiveConfig.schoolName}</div>
      </div>
    `;

    printDedicatedHTML(html, title);
  };

  return (
    <SmartSchoolCoreContext.Provider value={{
      printConfig,
      updatePrintConfig,
      getSchoolPrintConfig,
      customServices,
      customFunctions,
      addCustomService,
      updateCustomService,
      toggleCustomServiceStatus,
      deleteCustomService,
      addCustomFunction,
      updateCustomFunction,
      toggleCustomFunctionStatus,
      deleteCustomFunction,
      getFunctionPermissions,
      developerMomoAccounts,
      platformCommissionConfig,
      updateDeveloperMomoAccount,
      toggleDeveloperMomoStatus,
      setPrimaryDeveloperMomoAccount,
      updatePlatformCommissionRate,
      togglePlatformCommissionActive,
      getPrimaryDeveloperMomoAccount,
      setSchoolCustomCommission,
      removeSchoolCustomCommission,
      updateDeveloperReceivingAccounts,
      calculatePaymentCommission,
      addCommissionAuditLog,
      schoolMobileMoneyAccounts,
      getSchoolMobileMoneyAccounts,
      getSchoolReceivingAccountsForFee,
      addSchoolMobileMoneyAccount,
      updateSchoolMobileMoneyAccount,
      toggleSchoolMobileMoneyAccount,
      deleteSchoolMobileMoneyAccount,
      setPrimarySchoolMobileMoneyAccount,
      schoolPaymentAuditLogs,
      addSchoolPaymentAuditLog,
      getSchoolPaymentAuditLogs,
      exportStudentsExcel,
      exportEmployeesExcel,
      exportStudentsPDF,
      exportEmployeesPDF,
      exportTableExcel,
      exportTablePDF,
      printDedicatedTable
    }}>
      {children}
    </SmartSchoolCoreContext.Provider>
  );
};

export const useSmartSchoolCore = () => {
  const context = useContext(SmartSchoolCoreContext);
  if (!context) {
    throw new Error("useSmartSchoolCore must be used within a SmartSchoolCoreProvider");
  }
  return context;
};
