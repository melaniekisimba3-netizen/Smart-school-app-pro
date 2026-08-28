export type Role = "Super Admin" | "Directeur" | "Préfet" | "Secrétariat" | "Comptable" | "Enseignant" | "Parent" | "Élève";

export interface School {
  id: string;
  name: string;
  codeNational: string;
  codeEtablissement?: string;
  provinceEducationnelle: string;
  logoUrl?: string;
  contactEmail: string;
  // Extended configuration fields from Setup Wizard
  motto?: string;
  province?: string;
  ville?: string;
  commune?: string;
  adresseComplete?: string;
  phonePrincipal?: string;
  website?: string;
  type?: "Public" | "Privé" | "Conventionné";
  conventionType?: string;
  schoolYear?: string;
  levels?: string[];
  sections?: string[];
  options?: string[];
  classes?: string[];
  inspectionProvinciale?: string;
  sousProvedCoordination?: string;
  // SmartSchool RDC Payment & Mobile Money / Bank Card Config
  mobileMoneyEnabled?: boolean;
  cardPaymentEnabled?: boolean;
  acceptedGateways?: string[];
  merchantAccounts?: {
    mpesa?: string;
    orange?: string;
    airtel?: string;
    afrimoney?: string;
  };
  schoolReceivingAccounts?: {
    mobileMoney?: {
      mpesa?: { holderName: string; phone: string; validated: boolean; status?: "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion" };
      orange?: { holderName: string; phone: string; validated: boolean; status?: "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion" };
      airtel?: { holderName: string; phone: string; validated: boolean; status?: "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion" };
      afrimoney?: { holderName: string; phone: string; validated: boolean; status?: "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion" };
    };
    bankCard?: {
      bankName: string;
      holderName: string;
      accountNumber: string;
      merchantGatewayToken?: string;
      validated: boolean;
      status?: "Validé" | "En attente de validation" | "Suspendu" | "Erreur de connexion";
    };
  };
  configurableFees?: string[];
  customCommissionRate?: number; // Custom percentage for this school if different from platform default
  acceptedFinancialTerms?: boolean;
}

export interface SchoolYear {
  id: string;
  yearRange: string;
  isActive: boolean;
}

export interface StudentGuardianLink {
  parentId: string;
  parentName: string;
  relationship?: string;
  relationshipType?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentAccountNumber?: string;
  isPrimary?: boolean;
  canPickUp?: boolean;
  receiveSMS?: boolean;
}

export interface ParentGuardianLink {
  studentId: string;
  studentName: string;
  className: string;
  optionName?: string;
  registrationNumber?: string;
  relationship?: string;
  relationshipType?: string;
  isPrimary: boolean;
}

export interface Student {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  postName?: string;
  birthDate: string;
  gender: "M" | "F";
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  parentAccountNumber?: string;
  primaryParentId?: string;
  parentIds?: string[];
  guardians?: StudentGuardianLink[];
  className: string;
  optionName: string;
  photoUrl?: string;
  status: "Brouillon" | "En attente" | "À compléter" | "Validé" | "Suspendu" | "Archivé" | "Actif" | "Transféré" | "Exclu";
  createdBy?: string;
  createdByRole?: string;
  createdAtDate?: string;
  createdAtTime?: string;
  schoolId?: string;
  qrCodeData?: string;
  hasUserAccount?: boolean;
  userAccountId?: string;
  userAccountRole?: string;
  accountStatus?: "unprovisioned" | "pending_activation" | "active" | "suspended" | "locked";
  activationCode?: string;
  levelCategory?: "Maternelle" | "Primaire" | "Secondaire";
  classGrade?: string;
  roomLetter?: string;
  sectionName?: string;
}

export interface InscriptionAuditLog {
  id: string;
  studentName: string;
  actorName: string;
  actorRole: string;
  date: string;
  time: string;
  ipAddress: string;
  device: string;
  action: string;
}

export interface ClassAnnouncement {
  id: string;
  className: string;
  studentId?: string;
  title: string;
  content: string;
  studentName?: string;
  photoUrl?: string;
  createdAt: string;
  time: string;
}

export interface TeacherPayoutDetails {
  paymentMethod: "M-Pesa" | "Orange Money" | "Airtel Money" | "Afrimoney" | "Virement Bancaire" | "Espèces";
  receivingNumberOrIban: string; // Numéro Mobile Money (ex: 0812345678) ou Numéro de compte bancaire
  accountHolderName: string; // Nom officiel tel qu'enregistré auprès de l'opérateur/banque
  bankName?: string; // e.g. Rawbank, EquityBCDC, TMB, etc.
  preferredCurrency: "USD" | "CDF";
  lastUpdatedByTeacherAt?: string;
  isVerifiedByTeacher: boolean;
  notes?: string;
}

export interface TeacherSalaryPayment {
  id: string;
  schoolId: string;
  schoolName?: string;
  teacherId: string;
  teacherName: string;
  teacherMatricule?: string;
  teacherPhone?: string;
  periodMonth?: string; // e.g. "Septembre 2026"
  period?: string; // Alias for periodMonth
  academicYear?: string; // e.g. "2026-2027"
  baseSalary?: number;
  baseAmount?: number; // Alias for baseSalary
  primesAndBonus?: number;
  bonusAmount?: number; // Alias for primesAndBonus
  deductions?: number;
  deductionsAmount?: number; // Alias for deductions
  netAmountPaid: number;
  currency: "USD" | "CDF";
  paymentMethod: "M-Pesa" | "Orange Money" | "Airtel Money" | "Afrimoney" | "Virement Bancaire" | "Espèces" | string;
  receivingNumberOrIban: string;
  accountHolderName: string;
  bankName?: string;
  transactionReference: string; // e.g. "SAL-202609-MOMO-84920"
  externalPaymentRef?: string;
  status: "Validé & Payé" | "En attente d'exécution" | "Rejeté" | "Annulé" | "EFFECTUE";
  authorizedByPromoterId?: string;
  authorizedByPromoterName?: string;
  authorizedAt?: string;
  paymentDate?: string; // Alias for authorizedAt
  auditLogId?: string;
  receiptSlipNumber?: string; // e.g. "BP-2026-09-0012"
  slipNumber?: string; // Alias for receiptSlipNumber
  notes?: string;
  createdAt?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  postName?: string;
  name?: string;
  gender?: "M" | "F";
  birthDate?: string;
  qualification?: string;
  function?: string;
  department?: string;
  role?: string;
  email: string;
  phone: string;
  matriculeEtat?: string;
  specialty: string;
  speciality?: string;
  subject?: string;
  assignedClasses: string[];
  assignedSubjects?: string[];
  weeklyHours: number;
  salaryBase: number;
  salaryCurrency?: "USD" | "CDF";
  payoutDetails?: TeacherPayoutDetails;
  schoolId?: string;
  photoUrl?: string;
  // Account details
  hasUserAccount?: boolean;
  accountCreated?: boolean;
  userAccountId?: string;
  userAccountRole?: string;
  accountStatus?: "unprovisioned" | "pending_activation" | "active" | "suspended" | "locked";
  username?: string;
  tempPassword?: string;
  activationCode?: string;
  portalAccess?: boolean;
  activationDate?: string;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  postName?: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  profession?: string;
  nationalId?: string;
  parentAccountNumber?: string;
  address: string;
  relationship?: string; // e.g. "Père", "Mère", "Tuteur légal"
  gender?: string; // "M" | "F"
  photoUrl?: string;
  childrenNames: string[];
  childrenIds?: string[];
  guardianLinks?: ParentGuardianLink[];
  outstandingBalance: number;
  schoolId?: string;
  createdAt?: string;
  createdAtDate?: string;
  // Account details
  hasUserAccount?: boolean;
  accountCreated?: boolean;
  userAccountId?: string;
  userAccountRole?: string;
  accountStatus?: "unprovisioned" | "pending_activation" | "active" | "suspended" | "locked";
  username?: string;
  tempPassword?: string;
  activationCode?: string;
  portalAccess?: boolean;
  activationDate?: string;
  securityQuestions?: { question: string; answer: string }[];
}

export interface ClassTitularHistoryEntry {
  id: string;
  type: "titulaire" | "responsable";
  staffId?: string;
  userId?: string;
  staffName: string;
  roleTitle?: string;
  startDate: string;
  endDate?: string;
  assignedBy?: string;
  notes?: string;
}

export interface ClassRoom {
  id: string;
  name?: string;
  option?: string;
  level: number | string; // e.g. 1, 2, 3, 4 or "Petite Section (PS)"
  roomLetter: string; // e.g. "A", "B"
  optionName: string;
  classTeacherName: string;
  classTeacherId?: string;
  classTeacherUserId?: string;
  responsibleStaffId?: string;
  responsibleStaffName?: string;
  responsibleStaffUserId?: string;
  titularHistory?: ClassTitularHistoryEntry[];
  studentCount: number;
  maxStudents: number;
  schoolId?: string;
  levelCategory: "Maternelle" | "Primaire" | "Secondaire";
  classGrade: string;
  sectionName?: string;
}

export interface Option {
  id: string;
  name: string;
  code: string;
  desc: string;
  isActivated?: boolean;
  cycle?: string;
  status?: "Active" | "Inactive" | "Archivée";
  createdAt?: string;
  isCustom?: boolean;
}

export interface OptionAuditLog {
  id: string;
  optionName: string;
  optionCode: string;
  actorName: string;
  actorRole: string;
  action: "Création" | "Modification" | "Désactivation" | "Réactivation" | "Archivage" | "Suppression";
  timestamp: string;
  details: string;
}

export interface NationalIdentitySettings {
  platformLogoUrl: string;
  faviconUrl: string;
  drapeauUrl: string;
  armoiriesUrl: string;
  epstLogoUrl: string;
  platformName: string;
  platformSlogan: string;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface NationalIdentityAuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  changedField: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  details: string;
}

export type EducationLevel = "maternelle" | "primaire" | "secondaire" | "humanites" | "Tous";

export interface Subject {
  id: string;
  name: string;
  category: "Culture Générale" | "Scientifique" | "Professionnelle" | string;
  maxPointsInterro: number;
  maxPointsExamen: number;
  hoursPerWeek: number;
  // Extended fields for RDC official curriculum & pedagogical options
  schoolId?: string;
  schoolYear?: string;
  educationLevel?: "maternelle" | "primaire" | "secondaire" | "humanites" | "Tous" | string;
  cycle?: "Maternelle" | "Primaire" | "Secondaire" | "Tous";
  levelCategory?: "Maternelle" | "Primaire" | "Secondaire";
  section?: string; // ex: "Générale", "Scientifique", "Commerciale", "Pédagogique", "Technique"
  option?: string; // ex: "Bio-Chimie", "Math-Physique", "Gestion", "Didactique"
  level?: string; // ex: "7ème EB", "8ème EB", "1ère Humanités", "6ème Primaire", "Toutes"
  className?: string; // specific class if assigned
  optionId?: string;
  optionName?: string; // ex: "Scientifique", "Commerciale & Gestion", "Pédagogie Générale", "Tronc Commun"
  isCommon?: boolean; // true = Tronc commun, false = Spécifique à l'option
  coefficient?: number; // default 1 or based on volume
  isOptional?: boolean; // false = Obligatoire, true = Optionnel
  code?: string;
  description?: string;
  isOfficialRDC?: boolean; // true for National Curriculum of DRC
}

export type EvaluationType = 
  | "Interrogation" 
  | "Interrogation Écrite" 
  | "Interrogation Orale" 
  | "Exercice" 
  | "Devoir à Domicile" 
  | "Contrôle" 
  | "Travail Pratique (TP)" 
  | "Examen Semestriel" 
  | "Composition" 
  | "Autre";

export type EvaluationStatus = "draft" | "submitted" | "validated" | "published";

export interface Evaluation {
  id: string;
  title: string;
  type: EvaluationType | string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  optionId?: string;
  optionName?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  durationMinutes?: number;
  period: "P1" | "P2" | "EXAM1" | "P3" | "P4" | "EXAM2" | string;
  maxScore: number;
  coefficient: number;
  description?: string;
  instructions?: string;
  status: EvaluationStatus;
  isScheduled?: boolean;
  scheduledDate?: string;
  teacherId: string;
  teacherName: string;
  schoolId: string;
  academicYear: string;
  createdAt: string;
  updatedAt?: string;
  validatedAt?: string;
  validatedBy?: string;
  publishedAt?: string;
}

export interface EvaluationScore {
  id: string;
  evaluationId: string;
  studentId: string;
  studentName: string;
  registrationNumber?: string;
  scoreObtained: number | null; // null if absent
  isAbsent?: boolean;
  isJustified?: boolean;
  isDispensed?: boolean;
  comments?: string;
  status: EvaluationStatus;
  recordedBy: string;
  recordedAt: string;
  schoolId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  period: string;
}

export interface EvaluationAuditLog {
  id: string;
  evaluationId: string;
  evaluationTitle: string;
  studentId: string;
  studentName: string;
  className: string;
  subjectName: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  oldScore: number | string | null;
  newScore: number | string | null;
  reason?: string;
  timestamp: string;
  date: string;
  time: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  period: "P1" | "P2" | "EXAM1" | "P3" | "P4" | "EXAM2" | string;
  scoreObtained: number;
  maxScore: number;
  recordedBy: string;
  recordedDate: string;
  schoolId?: string;
  classId?: string;
  className?: string;
  academicYear?: string;
  teacherId?: string;
  teacherName?: string;
  status?: "draft" | "submitted" | "validated" | "published" | "rejected";
  validationDate?: string;
  validatedBy?: string;
  comments?: string;
  evaluationType?: "Interrogation" | "Devoir" | "Examen" | "Travail Pratique" | string;
  evaluationId?: string;
  term?: string;
  termName?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  classId?: string;
  date: string;
  time?: string;
  status: "Présent" | "Absent" | "En retard" | "Retard" | "Absent Justifié" | string;
  isJustified: boolean;
  reason?: string;
  recordedBy?: string;
  schoolId?: string;
  academicYear?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface SchoolBulletinPermissions {
  allowTeacherDownload: boolean;
  allowTeacherPrint: boolean;
  publishToStudents: boolean;
  publishToParents: boolean;
  requireDirectionValidation: boolean;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface CustomFeeType {
  id: string;
  name: string;
  description?: string;
  category: 
    | "Minerval" 
    | "Frais de l'État" 
    | "Frais de pratique" 
    | "Frais d'inscription" 
    | "Frais d'examen" 
    | "Frais de bulletin" 
    | "Frais de carte d'élève" 
    | "Frais de transport" 
    | "Frais de cantine" 
    | "Frais de laboratoire" 
    | "Frais d'informatique" 
    | "Frais sportifs" 
    | "Frais de bibliothèque" 
    | "Frais de sortie scolaire" 
    | "Autres frais"
    | string;
  amount: number;
  currency: "USD" | "CDF";
  targetClass?: string; // "Toutes les classes" or specific class
  targetStudentId?: string; // "Tous les élèves" or specific student ID
  periodicity: "Unique" | "Mensuel" | "Trimestriel" | "Annuel";
  startDate?: string;
  dueDate?: string;
  isMandatory: boolean;
  isActive: boolean;
  applyPlatformCommission: boolean;
  commissionRatePercent?: number; // e.g. 2.0
  createdBy?: string;
  schoolId?: string;
}

export interface PaymentMultiFeeItem {
  feeTypeId: string;
  feeName: string;
  category?: string;
  amount: number;
  month?: string;
  applyCommission?: boolean;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  amount: number; // USD or CDF
  currency: "USD" | "CDF";
  paymentType: "Minerval" | "Inscription" | "Uniforme" | "Fournitures scolaires" | "Transport" | "Autres frais" | "Écolage" | "Frais d'État" | "Examen d'État" | "Frais d'inscription" | "Frais de bulletin" | string;
  paymentMethod: "Mobile Money" | "Carte Bancaire" | "Espèces" | "Banque" | "Paiement sur place" | string;
  mobileMoneyGateway?: "M-Pesa" | "Orange Money" | "Airtel Money" | "Afrimoney" | "Carte / Banque" | "Espèces" | string;
  mobileMoneyPhone?: string;
  cardHolderName?: string;
  cardLast4?: string;
  cardGatewayToken?: string;
  paymentMonth?: string; // e.g. "Octobre 2026"
  schoolYear?: string; // e.g. "2025-2026"
  remainingBalance?: number; // e.g. 700 USD
  paymentHistorySummary?: { month: string; amount: number; isPaid: boolean }[];
  platformCommissionRate?: number; // e.g. 2.0 (%)
  platformCommissionAmount?: number; // e.g. 2.00 USD
  netSchoolAmount?: number; // e.g. 98.00 USD
  splitSchoolAccount?: string;
  splitPlatformAccount?: string;
  transactionStatus?: "Succès" | "En attente" | "Échoué" | "Annulé" | "Remboursé" | "Enregistré sur place" | string;
  schoolId?: string;
  schoolName?: string;
  province?: string;
  reference: string;
  notes?: string;
  isValidated: boolean;
  createdAt: string;

  // Anti-fraud, void and refund control
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  refundReason?: string;
  refundedBy?: string;
  refundedAt?: string;
  refundAmount?: number;
  auditHash?: string;
  isFlaggedForAudit?: boolean;

  // Unified On-Site Payment & On-Site Commission Settlement fields
  isOnSitePayment?: boolean;
  onSitePaymentMode?: "Espèces" | "M-Pesa (effectué à l'école)" | "Orange Money (effectué à l'école)" | "Airtel Money (effectué à l'école)" | "Afrimoney (effectué à l'école)" | "Banque" | "Chèque" | "Autre" | string;
  recordingAgentName?: string;
  recordingAgentRole?: string;
  recordingAgentId?: string;
  commissionCalculatedUSD?: number;
  commissionTransferredUSD?: number; // Distinct from calculated!
  commissionSettlementStatus?: "REVERSÉ_À_LA_PLATEFORME" | "EN_ATTENTE_DE_REVERSEMENT" | "NON_APPLICABLE" | string;
  commissionSettlementDate?: string;
  commissionSettlementRef?: string;
  multiFeeLineItems?: PaymentMultiFeeItem[];
  platformCommissionUSD?: number;
  schoolShareUSD?: number;
  receiptNumber?: string;
}

export interface FinancialAuditTrailEntry {
  id: string;
  schoolId: string;
  schoolName?: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorRole: string;
  actionType:
    | "ENCAISSEMENT_ESPECES"
    | "ENCAISSEMENT_MOMO"
    | "VALIDATION_TRANSACTION"
    | "DEMANDE_ANNULATION"
    | "ANNULATION_EFFECTUEE"
    | "REMBOURSEMENT_EFFECTUE"
    | "MODIFICATION_FRAIS"
    | "MODIFICATION_COMPTE_RECEPTION"
    | "PAIEMENT_SALAIRE_ENSEIGNANT"
    | "MODIFICATION_COORDONNEES_PAIE"
    | "TENTATIVE_ACCES_NON_AUTORISE"
    | "GENERATION_RECU"
    | "CLOTURE_CAISSE_JOURNALIERE";
  studentId?: string;
  studentName?: string;
  studentClass?: string;
  amount?: number;
  currency?: "USD" | "CDF";
  paymentMethod?: string;
  mobileOperator?: string;
  transactionReference?: string;
  receiptNumber?: string;
  previousStatus?: string;
  newStatus?: string;
  justification?: string;
  promoterNotified?: boolean;
  integrityHash: string; // Cryptographic chain hash
  ipAddress?: string;
  deviceInfo?: string;
  metadata?: Record<string, any>;
}

export interface FinancialSecurityAlert {
  id: string;
  schoolId: string;
  schoolName?: string;
  title: string;
  severity: "INFO" | "ATTENTION" | "CRITIQUE_FRAUDE";
  category:
    | "ANNULATION_TRANSACTION"
    | "REMBOURSEMENT_SENSIBLE"
    | "TENTATIVE_MODIF_COMPTE_MOMO"
    | "MONTANT_ANORMAL_ENCAISSE"
    | "CUMUL_ESPECES_NON_VERSE"
    | "TENTATIVE_SUPPRESSION_TRACE"
    | "HORAIRE_INSOLITE";
  message: string;
  timestamp: string;
  targetOperator: string;
  operatorRole: string;
  studentName?: string;
  amountInvolved?: number;
  currency?: "USD" | "CDF";
  reference?: string;
  status: "ACTIVE" | "EN_REVUE" | "JUSTIFIEE_PROMOTEUR" | "BLOQUEE";
  reviewedBy?: string;
  reviewedAt?: string;
  promoterComment?: string;
}

export interface DeveloperMobileMoneyAccount {
  id: string;
  provider: "M-Pesa Vodacom" | "Orange Money" | "Airtel Money" | "Afrimoney";
  holderName: string;
  phone: string;
  status: "Actif" | "Désactivé";
  isPrimary: boolean;
  updatedAt?: string;
}

export interface SchoolMobileMoneyAccount {
  id: string;
  schoolId: string;
  schoolName?: string;
  provider: "M-Pesa Vodacom" | "Orange Money" | "Airtel Money" | "Afrimoney" | "Virement Bancaire" | string;
  accountNumber: string; // Numéro de paiement officiel de l'école (ex: 0812345678)
  phoneNumber?: string; // Alias
  holderName: string; // Nom officiel du bénéficiaire / titulaire enregistré
  accountName?: string; // Alias
  merchantCode?: string; // Code marchand / Till / Paybill si applicable
  instructions?: string; // Consignes affichées au parent avant validation
  ussdInstruction?: string; // Alias
  isActive: boolean; // Statut actif ou inactif
  isPrimary?: boolean; // Numéro principal par défaut
  associatedFeeTypes?: string[]; // Types de frais associés: ["Minerval", "Frais d'inscription", "Transport", "Cantine", "Uniforme", "Frais d'examen", "Tous les frais"]
  currencySupported: ("USD" | "CDF")[];
  createdAt: string;
  updatedAt?: string;
  configuredBy?: string;
}

export interface SchoolPaymentAccountAuditLog {
  id: string;
  schoolId: string;
  schoolName: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  actor?: string;
  actorRole?: string;
  action: "Ajout Compte" | "Modification Compte" | "Suppression Compte" | "Activation" | "Désactivation" | "Attribution Frais" | "Définition Principal" | "Ajout Moyen de Réception" | "Modification Moyen de Réception" | "Suppression Moyen de Réception" | "Activation Compte" | "Désactivation Compte" | "Définition Compte Principal" | string;
  targetAccount?: string;
  provider?: string;
  accountNumber?: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  notes?: string;
}

export interface SchoolMessage {
  id: string;
  schoolId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  recipientId?: string; // Pour échange 1-to-1
  recipientName?: string;
  recipientRole?: string;
  channelType: "direct" | "broadcast_parents" | "broadcast_teachers" | "broadcast_students" | "broadcast_staff" | "class_group";
  targetClass?: string;
  subject?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  readAt?: string;
  attachments?: {
    name: string;
    type: "image" | "pdf" | "word" | "excel" | "audio" | "document";
    url: string;
    size?: string;
  }[];
}

export interface SystemAuditTestCase {
  id: string;
  category: "MOBILE_MONEY" | "MESSAGERIE" | "EXPORT_ET_IMPRESSION" | "ISOLATION_MULTI_TENANT";
  name: string;
  description: string;
  status: "PASSED" | "FAILED" | "PENDING" | "RUNNING";
  durationMs?: number;
  assertionDetails: string;
  executedAt?: string;
  error?: string;
  dataSnapshot?: Record<string, any>;
}

export interface SystemAuditReport {
  id: string;
  executedAt: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  status: "CONFORME" | "NON_CONFORME" | "EN_COURS";
  schoolIdScope: string;
  testCases: SystemAuditTestCase[];
}

export interface FinancialAuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ipAddress?: string;
  hashSignature: string; // Anti-tamper cryptographic hash representation
}

export interface ReconciliationRecord {
  id: string;
  period: string; // e.g. "Juillet 2026"
  channel: "M-Pesa Vodacom" | "Orange Money" | "Airtel Money" | "Rawbank Visa/Mastercard" | "Global";
  smartSchoolLedgerAmount: number;
  providerStatementAmount: number;
  bankSettledAmount: number;
  discrepancyAmount: number;
  status: "Parfaite" | "Écart Décelé" | "En Réconciliation";
  lastVerifiedAt: string;
}

export interface PaymentNotificationLog {
  id: string;
  recipientType: "Parent" | "École" | "SmartSchool RDC";
  recipientName: string;
  channel: "SMS Mobile Money" | "Email" | "Webhook API" | "Notification In-App";
  title: string;
  message: string;
  timestamp: string;
  status: "Délivré" | "En attente";
}

export interface CommissionAuditLogEntry {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  targetSchoolId?: string;
  targetSchoolName?: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  notes?: string;
}

export interface SchoolCommissionCustomSetting {
  schoolId: string;
  schoolName: string;
  ratePercent: number; // e.g. 2.0 or 1.5
  isCommissionActive: boolean; // false = commission désactivée pour cette école
  updatedAt: string;
  updatedBy: string;
  notes?: string;
}

export interface PlatformCommissionConfig {
  defaultRatePercent: number; // e.g. 2.0
  fixedFeeUSD: number; // e.g. 0.0 or 0.5
  isCommissionActive: boolean;
  primaryAccountId?: string;
  schoolCustomRates: Record<string, SchoolCommissionCustomSetting | number>;
  developerReceivingAccounts: {
    mobileMoney?: {
      mpesa?: { holderName: string; phone: string; merchantCode?: string };
      orange?: { holderName: string; phone: string; merchantCode?: string };
      airtel?: { holderName: string; phone: string; merchantCode?: string };
      afrimoney?: { holderName: string; phone: string; merchantCode?: string };
    };
    bankCard?: {
      bankName: string;
      holderName: string;
      accountNumber: string;
      merchantToken?: string;
      iban?: string;
      swift?: string;
    };
  };
  auditLogs?: CommissionAuditLogEntry[];
}

export interface TimetableEntry {
  id: string;
  className: string;
  day: string; // Lundi, Mardi, etc.
  period: string; // 1ère heure, etc.
  subjectName: string;
  teacherName: string;
  room: string;
  // Extended fields for full integration
  schoolId?: string;
  schoolYear?: string;
  levelCategory?: "Maternelle" | "Primaire" | "Secondaire";
  optionName?: string;
  periodIndex?: number;
  startTime?: string;
  endTime?: string;
  consecutivePeriods?: number;
  subjectId?: string;
  teacherId?: string;
  status?: "Planifié" | "En cours" | "Dispensé" | "Non dispensé" | "Déplacé" | "Annulé";
  isSubstituted?: boolean;
  substituteTeacherName?: string;
  isPublished?: boolean;
}

// ---------------------------------------------------------------------------
// TYPES INTÉGRÉS : ATTRIBUTIONS, EMPLOI DU TEMPS, JOURNAL DE CLASSE & PÉDAGOGIE
// ---------------------------------------------------------------------------

export interface CourseAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classId?: string;
  className: string;
  levelCategory: "Maternelle" | "Primaire" | "Secondaire";
  optionName?: string;
  schoolYear: string;
  weeklyHours: number;
  hoursPerWeek?: number;
  assignedBy: string;
  assignedByRole: string;
  assignedDate: string;
  schoolId?: string;
  isClassMaster?: boolean; // Titulaire officiel de la classe
  createdAt?: string;
}

export type TeacherAssignment = CourseAssignment;

export interface SchoolRoom {
  id: string;
  name: string; // ex: "Salle 101", "Labo Informatique"
  code?: string;
  capacity?: number;
  type?: "Classe ordinaire" | "Laboratoire" | "Informatique" | "Atelier" | "Amphithéâtre" | "Terrain de sport" | "Autre";
  roomType?: "standard" | "lab_science" | "lab_it" | "workshop" | "amphi";
  isSpecialized?: boolean;
  schoolId?: string;
}

export interface TeacherUnavailability {
  id: string;
  teacherId: string;
  teacherName: string;
  day: string;
  periodIndex?: number; // if undefined, whole day
  reason?: string;
  schoolId?: string;
}

export interface PedagogicalCurriculumModel {
  id: string;
  name: string; // ex: "Modèle National RDC - 1ère Humanités Scientifique"
  cycle: "Maternelle" | "Primaire" | "Secondaire";
  level: string; // ex: "1ère Humanités", "7ème EB", "6ème Primaire"
  optionName?: string; // ex: "Scientifique", "Commerciale & Gestion", "Pédagogie Générale", "Tronc Commun"
  description: string;
  subjects: {
    name: string;
    category: "Culture Générale" | "Scientifique" | "Professionnelle";
    hoursPerWeek: number;
    coefficient: number;
    isCommon?: boolean;
    isOptional?: boolean;
    maxPointsInterro?: number;
    maxPointsExamen?: number;
    code?: string;
  }[];
}

export interface TimetableGenerationOptions {
  schoolId: string;
  schoolYear: string;
  targetClassIds?: string[];
  respectTeacherAvailabilities: boolean;
  distributeAcrossDays: boolean;
  assignRoomsAutomatically: boolean;
  clearExistingDrafts?: boolean;
}

export interface TimetableGenerationReport {
  success: boolean;
  generatedEntries: TimetableEntry[];
  totalSessionsPlanned?: number;
  totalHoursPlanned?: number;
  totalSlotsScheduled?: number;
  classesCovered?: any;
  teachersAssigned?: string[];
  unassignedCoursesCount?: number;
  unassignedCoursesList?: {
    className: string;
    subjectName: string;
    missingHours: number;
    reason?: string;
  }[];
  unassignedCourses?: {
    className: string;
    subjectName: string;
    reason?: string;
    missingHours?: number;
  }[];
  conflictsDetected?: number;
  conflictDetails?: string[];
  warnings?: string[];
  message?: string;
  generatedAt?: string;
}

export interface TimetablePublicationStatus {
  schoolId: string;
  schoolYear: string;
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  publishedByRole?: string;
  notes?: string;
}

export interface SchoolScheduleConfig {
  id: string;
  schoolId?: string;
  startTime: string; // ex: "07:30"
  endTime: string; // ex: "13:30"
  periodDurationMinutes: number; // ex: 50
  periodsPerDay: number; // ex: 6
  breakSlots: { 
    name: string; 
    startPeriodIndex: number; 
    durationMinutes: number; 
    startTime: string; 
    endTime: string;
  }[];
  activeDays: string[]; // ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  rooms?: SchoolRoom[];
  teacherUnavailabilities?: TeacherUnavailability[];
  isPublished?: boolean;
  publicationStatus?: TimetablePublicationStatus;
}

export interface TimetablePeriodSlot {
  index: number;
  label: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakName?: string;
}

export interface ClassJournalEntry {
  id: string;
  schoolId?: string;
  schoolYear: string;
  timetableEntryId?: string;
  date: string;
  day: string;
  periodLabel: string;
  period?: string; // alias
  className: string;
  levelCategory: "Maternelle" | "Primaire" | "Secondaire";
  optionName?: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  status: "Dispensé" | "Partiellement dispensé" | "Non dispensé" | "En retard" | "Remplacé" | "Rattrapé";
  lessonTitle: string;
  lessonTopic?: string; // alias
  lessonObjectives: string;
  operationalObjective?: string; // alias
  lessonSummary: string;
  summaryContent?: string; // alias
  homeworkAssigned?: string;
  homeworkDueDate?: string;
  attendanceRecorded: boolean;
  absentStudentIds?: string[];
  absentStudentNames?: string[];
  presentCount?: number;
  totalCount?: number;
  observations?: string;
  verifiedByDirector?: boolean;
  directorVisa?: boolean; // alias
  directorVisaDate?: string; // alias
  directorNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PedagogicalForecast {
  id: string;
  schoolId?: string;
  schoolYear: string;
  levelCategory: "Maternelle" | "Primaire" | "Secondaire";
  className: string;
  optionName?: string;
  subjectName: string;
  teacherName: string;
  chapterTitle: string;
  weekNumber: number;
  month: string;
  plannedHours: number;
  completedHours: number;
  progressionPercent: number;
  learningObjectives: string[];
  nationalCurriculumReference?: string;
  status: "Planifié" | "En cours" | "Achevé" | "En retard" | "Non démarré";
}

export interface CourseReminder {
  id: string;
  teacherId: string;
  teacherName: string;
  timetableEntryId?: string;
  type: "before_course" | "during_course" | "after_course_journal" | "schedule_change";
  title: string;
  message: string;
  courseTime: string;
  className: string;
  subjectName: string;
  status: "pending" | "sent" | "dismissed" | "actioned";
  createdAt: string;
}

export interface ResponsibilityScope {
  levelCategoryScope: "Tous" | "Primaire" | "Secondaire" | "Maternelle";
  assignedClassesScope?: string[];
  assignedSubjectsScope?: string[];
  canManageTimetables?: boolean;
  canManageAssignments?: boolean;
  canManageJournal?: boolean;
  canInputGrades?: boolean;
  canValidateJournal?: boolean;
  canViewReports?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
}

export type CnrResourceCategory = 
  | "bulletin" 
  | "calendrier" 
  | "circulaire" 
  | "attestation" 
  | "certificat" 
  | "fiche_cotation" 
  | "rapport" 
  | "matiere" 
  | "option" 
  | "bareme" 
  | "programme";

export interface TemplateHistory {
  id: string;
  version: string;
  updatedAt: string;
  author: string;
  changeSummary: string;
  status: "brouillon" | "en_validation" | "approuve" | "archive";
  contentRaw: string;
}

export interface CnrResource {
  id: string;
  title: string;
  type: "document" | "referential";
  category: CnrResourceCategory;
  version: string;
  status: "brouillon" | "en_validation" | "approuve" | "archive";
  publishedAt: string;
  effectiveDate?: string;
  author: string;
  description: string;
  fileSize: string;
  contentSummary: string;
  contentRaw?: string;
  variables?: string[];
  history?: TemplateHistory[];
}

export interface CnrSyncLog {
  id: string;
  resourceId: string;
  resourceTitle: string;
  installedVersion: string;
  latestVersion: string;
  syncedAt: string;
  status: "not_installed" | "installed" | "outdated";
}

// ---------------------------------------------------------------------------
// TYPES ET INTERFACES POUR LE MODULE RH (RESSOURCES HUMAINES & FONCTIONS)
// ---------------------------------------------------------------------------

export interface CustomFunction {
  id: string;
  name: string;
  category: "Administration" | "Enseignement" | "Comptabilité" | "Discipline" | "Technique" | "Santé" | "Sécurité" | "Entretien" | string;
  description: string;
  hierarchyLevel: number; // 1 (Haute Direction) à 10 (Exécution)
  serviceId?: string;
  serviceName: string;
  code: string; // ex: DIR-01, ENS-02
  color: string; // Couleur d'identification (ex: #4f46e5)
  status: "Actif" | "Inactif";
  permissions: string[]; // RBAC permission keys
  createdAt?: string;
}

export interface CustomService {
  id: string;
  name: string;
  code: string; // ex: SERV-DIR, SERV-PREF
  description: string;
  status: "Actif" | "Inactif";
  headEmployeeId?: string;
  createdAt?: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Employee {
  id: string;
  matricule: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F";
  birthDate: string;
  birthPlace: string;
  nationality: string;
  civilStatus: "Célibataire" | "Marié(e)" | "Divorcé(e)" | "Veuf(ve)";
  address: string;
  phone: string;
  email: string;
  function: string;
  department: "Direction" | "Enseignement" | "Administration" | "Technique" | "Sécurité" | "Entretien" | "Médical" | string;
  service: string;
  hireDate: string;
  contractType: "CDI" | "CDD" | "Stage" | "Prestation";
  salaryBase: number;
  salaryCurrency?: "USD" | "CDF";
  payoutDetails?: TeacherPayoutDetails;
  diplomas: string[];
  experience: string[];
  documents: EmployeeDocument[];
  emergencyContact: EmergencyContact;
  qrCodeData: string;
  idSsrdc?: string;
  status: "Actif" | "En congé" | "Suspendu" | "Retraité" | "Fin de contrat";
  hasUserAccount: boolean;
  userAccountId?: string;
  userAccountRole?: string;
  activationCode?: string;
  schoolId?: string;
}

export interface UserAccount {
  id: string;
  firebaseUid?: string;
  dossierId: string; // Employee.id, Student.id, Parent.id, or Staff.id
  dossierType: "personnel" | "eleve" | "parent" | "smartschool_staff" | "school_admin" | "epst_inspector";
  matricule?: string;
  fullName?: string;
  photoUrl?: string;
  functionTitle?: string;
  phone?: string;
  phoneVerified?: boolean;
  email?: string;
  emailVerified?: boolean;
  username: string;
  password?: string; // Cleartext/hashed for client-side mockup
  tempPassword?: string;
  isTempPassword?: boolean;
  createdBy?: string;
  creatorRole?: string;
  role: string;
  accountCategory?: "smartschool_staff" | "school_admin" | "epst_inspector" | "personnel" | "eleve" | "parent";
  isActive: boolean;
  isActivated?: boolean;
  isSuspended?: boolean;
  isLocked?: boolean;
  failedLoginAttempts?: number;
  activationCode: string;
  createdAt: string;
  lastLogin?: string;
  schoolId?: string;
  schoolName?: string;
  province?: string;
  portalUrl?: string;
  portalCode?: string;
  portalName?: string;
  targetPortalTab?: string;
  rbacPermissions?: string[];
  permissions?: string[];
  securityQuestionsSet?: boolean;
  securityQuestions?: { question: string; answer: string }[];
  connectedDevices?: string[];
  mustChangePasswordOnFirstLogin?: boolean;
  activatedAt?: string;
  firstLoginCompleted?: boolean;
}

export interface EmployeeAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: "Présent" | "Absent" | "En retard" | "Mission";
  timeIn?: string;
  timeOut?: string;
  recordedBy: string;
}

export interface EmployeeLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "Congé Annuel" | "Maladie" | "Maternité" | "Circonstance" | "Sans solde";
  startDate: string;
  endDate: string;
  status: "En attente" | "Approuvé" | "Refusé";
  reason: string;
  approvedBy?: string;
}

export interface EmployeePromotion {
  id: string;
  employeeId: string;
  employeeName: string;
  oldFunction: string;
  newFunction: string;
  oldSalary: number;
  newSalary: number;
  date: string;
  reason: string;
  decisionRef: string;
}

export interface EmployeeSanction {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Avertissement" | "Blâme" | "Mise à pied" | "Suspension" | "Révocation";
  date: string;
  reason: string;
  approvedBy: string;
  status: "Active" | "Levée";
}

export interface EmployeeEvaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  evaluatorName: string;
  date: string;
  score: number; // sur 100
  comments: string;
  objectives: string;
}

export interface EmployeeTraining {
  id: string;
  employeeId: string;
  employeeName: string;
  trainingName: string;
  provider: string;
  startDate: string;
  endDate: string;
  status: "Planifié" | "En cours" | "Terminé";
  certificateUrl?: string;
}

export interface EmployeeMutation {
  id: string;
  employeeId: string;
  employeeName: string;
  oldLocation: string;
  newLocation: string;
  date: string;
  reason: string;
}

export interface HrAuditLog {
  id: string;
  actorName: string;
  actorFunction: string;
  action: string;
  targetName: string;
  date: string;
  time: string;
  ipAddress: string;
  device: string;
}

export interface PedagogicalEvent {
  id: string;
  title: string;
  type: "Examen" | "Interrogation" | "Devoir commun" | "Réunion pédagogique" | "Conseil de classe" | "Journée pédagogique";
  category: "Maternelle" | "Primaire" | "Secondaire" | "Tous";
  date: string;
  time: string;
  className?: string;
  room?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// PLATFORM INTERNAL STAFF & STRICT RBAC DEFINITIONS
// ---------------------------------------------------------------------------

export type PlatformStaffFunction = 
  | "Administrateur plateforme"
  | "Support technique"
  | "Support utilisateurs"
  | "Responsable des établissements"
  | "Responsable commercial"
  | "Comptable de la plateforme"
  | "Responsable financier"
  | "Responsable technique"
  | "Responsable formation"
  | "Responsable communication"
  | "Analyste"
  | "Autre";

export interface PlatformStaffPermissions {
  canManageSchools: boolean;
  canSuspendSchools: boolean;
  canManageInternalStaff: boolean;
  canViewPlatformFinances: boolean;
  canManagePlatformFinances: boolean;
  canManageServerMaintenance: boolean;
  canAccessKillSwitches: boolean;
  canManageSupportTickets: boolean;
  canViewMissingPhotosAlerts: boolean;
  canNotifySchoolsForMissingPhotos: boolean;
  canManagePlatformCommunications: boolean;
  canViewNationalAnalytics: boolean;
  canManageSecurityAlerts: boolean;
  canAuditLogs: boolean;
  canManageCommercialLeads: boolean;
  canManageTrainingModules: boolean;
}

export interface PlatformStaffMember {
  id: string;
  nom: string;
  postnom: string;
  prenom: string;
  fullName: string;
  photoUrl?: string;
  phone: string;
  email: string;
  fonction: PlatformStaffFunction | string;
  customFonctionTitle?: string;
  role: "Propriétaire" | "Super Administrateur" | "Personnel Interne";
  status: "Actif" | "Inactif" | "Suspendu" | "Transféré" | "Archivé";
  assignedPermissions: PlatformStaffPermissions;
  assignedPortalId?: string;
  assignedPortalName?: string;
  responsibilities?: string[];
  assignedProvinces?: string[];
  managedSchoolIds?: string[];
  firebaseUid?: string;
  createdAt: string;
  lastLoginAt?: string;
  previousStaffId?: string;
  successorStaffId?: string;
  transferHistory?: ResponsibilityTransferRecord[];
  notes?: string;
}

export interface InternalPortalConfig {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  accentColor: string;
  allowedTabs: string[];
  defaultRole: string;
  defaultPermissions: PlatformStaffPermissions;
  isSystemDefault?: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ResponsibilityTransferRecord {
  id: string;
  sourceStaffId: string;
  sourceStaffName: string;
  sourceStaffEmail: string;
  sourceStaffFonction: string;
  targetStaffId: string;
  targetStaffName: string;
  targetStaffEmail: string;
  targetStaffFonction: string;
  transferredResponsibilities: string[];
  transferredPermissions: string[];
  transferredPortalId?: string;
  transferredPortalName?: string;
  reason: string;
  deactivateSourceAccount: boolean;
  transferredAt: string;
  transferredBy: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// MISSING PROFILE PHOTOS NOTIFICATIONS & AUTO-DETECTION MODELS
// ---------------------------------------------------------------------------

export interface MissingPhotoRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  profileType: "Élève" | "Enseignant" | "Personnel Administratif" | "Directeur / Préfet" | "Parent";
  fullName: string;
  matriculeOrId: string;
  classroomOrRole?: string;
  contactPhone?: string;
  contactEmail?: string;
  detectedAt: string;
}

export interface MissingPhotoSchoolSummary {
  schoolId: string;
  schoolName: string;
  province: string;
  totalUsersCount: number;
  missingCount: number;
  studentsMissing: number;
  teachersMissing: number;
  staffMissing: number;
  lastReminderSentAt?: string;
  records: MissingPhotoRecord[];
}

export type LessonPlanEntry = ClassJournalEntry;
export type ScheduleSlotCalculated = TimetablePeriodSlot;





