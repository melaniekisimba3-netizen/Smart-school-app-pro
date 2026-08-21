import React, { useState } from "react";
import { 
  Briefcase, Building2, MapPin, Calendar, Clock, DollarSign, Search, Filter, 
  Plus, CheckCircle2, XCircle, AlertCircle, Eye, Send, FileText, Upload, 
  User, Mail, Phone, Award, GraduationCap, Check, X, Download, BarChart3, 
  TrendingUp, Users, ShieldCheck, Sparkles, ChevronRight, Share2, Bookmark, 
  FileCheck, AlertTriangle, Layers, Bell, ArrowUpRight, BadgeCheck
} from "lucide-react";
import { School as SchoolType } from "../types";

export interface JobOffer {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolLogo?: string;
  province: string;
  city: string;
  commune: string;
  address: string;
  title: string;
  department: string; // e.g. Pédagogie, Administration, Sciences, Langues, Informatique
  openings: number;
  description: string;
  missions: string[];
  profile: string;
  diplomas: string[];
  experienceYears: number;
  skills: string[];
  contractType: "CDI" | "CDD" | "Vacataire" | "Stage" | "Temps Partiel";
  deadline: string;
  salaryMinUSD?: number;
  salaryMaxUSD?: number;
  salaryNegotiable?: boolean;
  benefits: string[];
  requiredDocs: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  attachmentUrls?: string[];
  status: "Brouillon" | "En Validation" | "Publiée" | "Expirée" | "Clôturée";
  createdAt: string;
  publishedAt?: string;
  viewsCount: number;
  applicationsCount: number;
  createdByRole: string;
  createdByName: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  schoolName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantRole: string;
  applicantPhoto?: string;
  diplomaHighest: string;
  experienceYears: number;
  coverLetter: string;
  cvFileName: string;
  diplomasFileName?: string;
  attestationsFileName?: string;
  submittedAt: string;
  status: "Reçu" | "En étude" | "Présélectionné" | "Convocation" | "Entretien" | "Accepté" | "Refusé";
  rating?: number;
  recruiterNotes?: string;
}

interface NationalJobsModuleProps {
  schools: SchoolType[];
  userName: string;
  userRole: string;
  userEmail?: string;
  onSendNotification?: (notif: { title: string; message: string; type: "info" | "warning" | "success" }) => void;
}

export function NationalJobsModule({
  schools,
  userName,
  userRole,
  userEmail = "utilisateur@smartschool.cd",
  onSendNotification
}: NationalJobsModuleProps) {
  // Check if current user has publishing permissions (RBAC)
  const canPublish = [
    "Propriétaire de la plateforme",
    "Créateur de SmartSchool RDC",
    "Super Administrateur",
    "SuperAdmin RDC",
    "Préfet des études",
    "Directeur",
    "Promoteur",
    "Administrateur RH",
    "Responsable RH",
    "Inspecteur MINEPSP",
    "Inspecteur EPST",
    "Inspection EPST"
  ].some(role => userRole.toLowerCase().includes(role.toLowerCase()));

  // Active view tabs
  const [activeTab, setActiveTab] = useState<"portail" | "mes_offres" | "candidatures" | "analytics" | "audit">("portail");

  // Filter states for job portal
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Toutes");
  const [selectedCity, setSelectedCity] = useState("Toutes");
  const [selectedContract, setSelectedContract] = useState("Tous");
  const [selectedDepartment, setSelectedDepartment] = useState("Tous");

  // Sample Job Offers
  const [jobs, setJobs] = useState<JobOffer[]>([
    {
      id: "JOB-2026-001",
      schoolId: "sch-1",
      schoolName: "Lycée Prince de Liège",
      schoolLogo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150",
      province: "Kinshasa",
      city: "Kinshasa",
      commune: "Gombe",
      address: "Avenue de la Justice n°45",
      title: "Professeur de Mathématiques & Physique (Secondaire)",
      department: "Sciences Exactes",
      openings: 2,
      description: "Le Lycée Prince de Liège recherche un enseignant passionné de mathématiques et physique pour les classes de 3ème à 6ème des humanités scientifiques. Maîtrise exigée des programmes officiels MINEPSP.",
      missions: [
        "Dispenser les cours de mathématiques et physique selon les programmes MINEPSP",
        "Concevoir les interrogations, devoirs et examens semestriels",
        "Participer aux conseils de classe et réunions pédagogiques",
        "Encadrer les travaux pratiques et laboratoires de physique"
      ],
      profile: "Enseignant méthodique, rigoureux, excellent pédagogue avec de solides aptitudes relationnelles.",
      diplomas: ["Licence en Mathématiques / Physique", "Agrégation de l'Enseignement Secondaire (A1/A0)"],
      experienceYears: 3,
      skills: ["Pédagogie active", "Matériel didactique numérique", "Suivi individuel"],
      contractType: "CDI",
      deadline: "2026-09-15",
      salaryMinUSD: 450,
      salaryMaxUSD: 700,
      salaryNegotiable: true,
      benefits: ["Soins médicaux pris en charge à 80%", "Primes de rendement trimestrielles", "Formation continue"],
      requiredDocs: ["CV actualisé", "Copie diplôme légalisé", "Lettre de motivation manuscrite ou tapée"],
      contactName: "M. Mbaye - Directeur Pédagogique",
      contactPhone: "+243 810 123 456",
      contactEmail: "recrutement@princedeliege.cd",
      status: "Publiée",
      createdAt: "2026-08-01",
      publishedAt: "2026-08-01",
      viewsCount: 342,
      applicationsCount: 14,
      createdByRole: "Préfet des études",
      createdByName: "Mbaye Antoine"
    },
    {
      id: "JOB-2026-002",
      schoolId: "sch-2",
      schoolName: "Complexe Scolaire Shaumba",
      schoolLogo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=150",
      province: "Kinshasa",
      city: "Kinshasa",
      commune: "Gombe",
      address: "Avenue Shaumba n°12",
      title: "Comptable d'Établissement & Gestionnaire Financier",
      department: "Finances & RH",
      openings: 1,
      description: "Gestion intégrée de la comptabilité scolaire, suivi du minerval M-Pesa, fiches de paie des enseignants et rapports financiers pour la coordination.",
      missions: [
        "Tenue de la comptabilité générale et analytique",
        "Gestion des paiements Mobile Money et bancaires",
        "Établissement des fiches de paie et déclarations sociales",
        "Abonnement aux outils financiers SmartSchool RDC"
      ],
      profile: "Rigueur comptable absolue, intégrité professionnelle, maîtrise d'Excel et des logiciels de gestion.",
      diplomas: ["Graduat ou Licence en Sciences Commerciales / Gestion Financière"],
      experienceYears: 2,
      skills: ["Comptabilité SYSCOHADA", "SmartSchool Finance", "Clôture annuelle"],
      contractType: "CDI",
      deadline: "2026-09-01",
      salaryMinUSD: 500,
      salaryMaxUSD: 850,
      salaryNegotiable: false,
      benefits: ["Prise en charge scolarité enfants (50%)", "Treizième mois", "Prime de bilan"],
      requiredDocs: ["CV", "Lettre de motivation", "Certificat de bonne vie et mœurs"],
      contactName: "Mme Sarah Luaka - RH",
      contactPhone: "+243 999 888 777",
      contactEmail: "rh@shaumba.cd",
      status: "Publiée",
      createdAt: "2026-08-03",
      publishedAt: "2026-08-03",
      viewsCount: 512,
      applicationsCount: 22,
      createdByRole: "Responsable RH",
      createdByName: "Sarah Luaka"
    },
    {
      id: "JOB-2026-003",
      schoolId: "sch-3",
      schoolName: "Collège Alfajiri",
      schoolLogo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=150",
      province: "Sud-Kivu",
      city: "Bukavu",
      commune: "Ibanda",
      address: "Avenue de l'Indépendance",
      title: "Informaticien & Administrateur Réseau Scolaire",
      department: "Informatique & IT",
      openings: 1,
      description: "Gestion du parc informatique, maintenance de la salle de laboratoire, support SmartSchool RDC et assistance technique aux enseignants.",
      missions: [
        "Maintenance des ordinateurs et réseaux Wi-Fi de l'école",
        "Assistance technique SmartSchool RDC pour les enseignants",
        "Supervision des travaux pratiques d'informatique",
        "Sauvegardes régulières des données scolaires"
      ],
      profile: "Technicien réactif, autonome et orienté résolution de problèmes IT.",
      diplomas: ["Graduat en Informatique de Gestion / Réseaux"],
      experienceYears: 1,
      skills: ["Maintenance Hardware", "Administration Windows/Linux", "Support Utilisateur"],
      contractType: "CDD",
      deadline: "2026-08-30",
      salaryMinUSD: 350,
      salaryMaxUSD: 500,
      salaryNegotiable: true,
      benefits: ["Accès Internet haut débit offert", "Formations certifiantes"],
      requiredDocs: ["CV", "Copie Diplôme", "Attestations de services rendus"],
      contactName: "Père Directeur Alfajiri",
      contactPhone: "+243 850 444 333",
      contactEmail: "direction@alfajiri.cd",
      status: "Publiée",
      createdAt: "2026-08-05",
      publishedAt: "2026-08-05",
      viewsCount: 289,
      applicationsCount: 9,
      createdByRole: "Directeur",
      createdByName: "Père Joseph Kin"
    },
    {
      id: "JOB-2026-004",
      schoolId: "sch-4",
      schoolName: "Institut Mwanga",
      schoolLogo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=150",
      province: "Nord-Kivu",
      city: "Goma",
      commune: "Goma",
      address: "Avenue du 20 Mai",
      title: "Enseignant de Français & Littérature Africaine",
      department: "Langues & Littérature",
      openings: 2,
      description: "Enseignement du français et de la littérature dans les classes du degré supérieur (Humanités Littéraires et Générales).",
      missions: ["Conduite des cours de langue française", "Animation du club de débat et poésie", "Correction des dissertations et examens"],
      profile: "Excellente maîtrise du français écrit et oral, passionné de pédagogie interactive.",
      diplomas: ["Licence en Langues et Littératures Françaises"],
      experienceYears: 2,
      skills: ["Expression orale", "Analyse littéraire", "Grammaire normative"],
      contractType: "CDI",
      deadline: "2026-09-10",
      salaryMinUSD: 400,
      salaryMaxUSD: 600,
      salaryNegotiable: true,
      benefits: ["Prime de correction", "Logement de fonction partagé"],
      requiredDocs: ["CV", "Lettre de motivation"],
      contactName: "M. Kakule - Directeur",
      contactPhone: "+243 970 111 222",
      contactEmail: "info@mwanga.cd",
      status: "Publiée",
      createdAt: "2026-08-06",
      publishedAt: "2026-08-06",
      viewsCount: 195,
      applicationsCount: 6,
      createdByRole: "Directeur",
      createdByName: "Kakule Kambale"
    }
  ]);

  // Sample Applications
  const [applications, setApplications] = useState<JobApplication[]>([
    {
      id: "CAND-901",
      jobId: "JOB-2026-001",
      jobTitle: "Professeur de Mathématiques & Physique (Secondaire)",
      schoolName: "Lycée Prince de Liège",
      applicantName: "Jean-Pierre Mutombo",
      applicantEmail: "jp.mutombo@gmail.com",
      applicantPhone: "+243 812 345 678",
      applicantRole: "Enseignant",
      applicantPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      diplomaHighest: "Licence en Mathématiques (UNIKIN)",
      experienceYears: 4,
      coverLetter: "Je sollicite par la présente le poste d'enseignant de Mathématiques et Physique. Fort de 4 années d'expérience en humanités scientifiques...",
      cvFileName: "CV_Jean_Pierre_Mutombo_2026.pdf",
      diplomasFileName: "Diplome_Licence_UNIKIN.pdf",
      submittedAt: "2026-08-02 14:20",
      status: "Présélectionné",
      rating: 5,
      recruiterNotes: "Excellent profil, diplôme validé par UNIKIN. À convoquer pour l'épreuve écrite."
    },
    {
      id: "CAND-902",
      jobId: "JOB-2026-002",
      jobTitle: "Comptable d'Établissement & Gestionnaire Financier",
      schoolName: "Complexe Scolaire Shaumba",
      applicantName: "Chantal Kabedi",
      applicantEmail: "chantal.kabedi@yahoo.fr",
      applicantPhone: "+243 998 112 233",
      applicantRole: "Comptable Externe",
      applicantPhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      diplomaHighest: "Graduat en Comptabilité SYSCOHADA (ISC Kinshasa)",
      experienceYears: 3,
      coverLetter: "Ayant travaillé au sein d'une école partenaire pendant 3 ans, je maîtrise parfaitement la gestion du minerval et SmartSchool RDC...",
      cvFileName: "CV_Chantal_Kabedi.pdf",
      submittedAt: "2026-08-04 10:15",
      status: "Convocation",
      rating: 4,
      recruiterNotes: "Convoquée pour entretien ce vendredi à 10h00."
    }
  ]);

  // Audit Logs for Jobs
  const [auditLogs, setAuditLogs] = useState([
    { id: "LOG-JOB-1", timestamp: "2026-08-06 14:10", user: userName, role: userRole, action: "Consultation du Portail National des Emplois", target: "Général", details: "Filtres appliqués: Province Kinshasa" },
    { id: "LOG-JOB-2", timestamp: "2026-08-05 09:30", user: "Père Joseph Kin", role: "Directeur", action: "Publication d'Offre d'Emploi", target: "JOB-2026-003", details: "Poste: Informaticien à Bukavu" },
    { id: "LOG-JOB-3", timestamp: "2026-08-02 14:20", user: "Jean-Pierre Mutombo", role: "Candidat", action: "Dépôt de Candidature", target: "JOB-2026-001", details: "Candidature enregistrée avec pièces jointes PDF" }
  ]);

  // Modals state
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobOffer | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobOffer | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<JobApplication | null>(null);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDepartment, setNewJobDepartment] = useState("Sciences Exactes");
  const [newJobOpenings, setNewJobOpenings] = useState(1);
  const [newJobProvince, setNewJobProvince] = useState("Kinshasa");
  const [newJobCity, setNewJobCity] = useState("Kinshasa");
  const [newJobCommune, setNewJobCommune] = useState("Gombe");
  const [newJobAddress, setNewJobAddress] = useState("");
  const [newJobSchoolName, setNewJobSchoolName] = useState(schools[0]?.name || "Lycée Prince de Liège");
  const [newJobContract, setNewJobContract] = useState<"CDI" | "CDD" | "Vacataire" | "Stage" | "Temps Partiel">("CDI");
  const [newJobDeadline, setNewJobDeadline] = useState("2026-09-30");
  const [newJobSalaryMin, setNewJobSalaryMin] = useState<number | "">(400);
  const [newJobSalaryMax, setNewJobSalaryMax] = useState<number | "">(700);
  const [newJobDescription, setNewJobDescription] = useState("");
  const [newJobMissionsText, setNewJobMissionsText] = useState("");
  const [newJobProfile, setNewJobProfile] = useState("");
  const [newJobDiplomasText, setNewJobDiplomasText] = useState("");
  const [newJobExpYears, setNewJobExpYears] = useState(2);
  const [newJobSkillsText, setNewJobSkillsText] = useState("");
  const [newJobBenefitsText, setNewJobBenefitsText] = useState("");
  const [newJobContactName, setNewJobContactName] = useState(userName);
  const [newJobContactPhone, setNewJobContactPhone] = useState("+243 810 000 000");
  const [newJobContactEmail, setNewJobContactEmail] = useState(userEmail);
  const [newJobPublishDirect, setNewJobPublishDirect] = useState(true);

  // Application Form State
  const [applyCoverLetter, setApplyCoverLetter] = useState("");
  const [applyPhone, setApplyPhone] = useState("+243 810 999 888");
  const [applyDiploma, setApplyDiploma] = useState("Licence en Pédagogie / Sciences");
  const [applyExpYears, setApplyExpYears] = useState(3);
  const [applyCvName, setApplyCvName] = useState(`CV_${userName.replace(/\s+/g, '_')}_2026.pdf`);

  // Handle Creating Job
  const handleCreateJobOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobDescription.trim()) {
      alert("Veuillez remplir au moins le titre et la description de l'offre.");
      return;
    }

    const newJob: JobOffer = {
      id: `JOB-2026-00${jobs.length + 1}`,
      schoolId: `sch-${Date.now()}`,
      schoolName: newJobSchoolName,
      schoolLogo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150",
      province: newJobProvince,
      city: newJobCity,
      commune: newJobCommune,
      address: newJobAddress || "Avenue de l'Éducation n°1",
      title: newJobTitle,
      department: newJobDepartment,
      openings: newJobOpenings,
      description: newJobDescription,
      missions: newJobMissionsText.split("\n").filter(m => m.trim().length > 0),
      profile: newJobProfile || "Candidat rigoureux et motivé.",
      diplomas: newJobDiplomasText.split("\n").filter(d => d.trim().length > 0),
      experienceYears: newJobExpYears,
      skills: newJobSkillsText.split(",").map(s => s.trim()).filter(s => s.length > 0),
      contractType: newJobContract,
      deadline: newJobDeadline,
      salaryMinUSD: typeof newJobSalaryMin === "number" ? newJobSalaryMin : undefined,
      salaryMaxUSD: typeof newJobSalaryMax === "number" ? newJobSalaryMax : undefined,
      salaryNegotiable: true,
      benefits: newJobBenefitsText.split("\n").filter(b => b.trim().length > 0),
      requiredDocs: ["CV actualisé", "Copie diplôme légalisé", "Lettre de motivation"],
      contactName: newJobContactName,
      contactPhone: newJobContactPhone,
      contactEmail: newJobContactEmail,
      status: newJobPublishDirect ? "Publiée" : "En Validation",
      createdAt: new Date().toISOString().split("T")[0],
      publishedAt: newJobPublishDirect ? new Date().toISOString().split("T")[0] : undefined,
      viewsCount: 1,
      applicationsCount: 0,
      createdByRole: userRole,
      createdByName: userName
    };

    setJobs(prev => [newJob, ...prev]);

    // Audit log
    setAuditLogs(prev => [{
      id: `LOG-JOB-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      user: userName,
      role: userRole,
      action: "Publication d'Offre d'Emploi",
      target: newJob.id,
      details: `Offre "${newJob.title}" (${newJob.schoolName}) - Statut: ${newJob.status}`
    }, ...prev]);

    if (onSendNotification) {
      onSendNotification({
        title: "Offre d'Emploi Publiée",
        message: `L'offre "${newJob.title}" a été publiée sur le Portail National.`,
        type: "success"
      });
    }

    setShowCreateModal(false);
    alert(`✓ L'offre d'emploi "${newJob.title}" a été enregistrée avec succès sous l'identifiant ${newJob.id} !`);
  };

  // Handle Submitting Application
  const handleSendApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    const newApp: JobApplication = {
      id: `CAND-${Math.floor(1000 + Math.random() * 9000)}`,
      jobId: applyingJob.id,
      jobTitle: applyingJob.title,
      schoolName: applyingJob.schoolName,
      applicantName: userName,
      applicantEmail: userEmail,
      applicantPhone: applyPhone,
      applicantRole: userRole,
      applicantPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      diplomaHighest: applyDiploma,
      experienceYears: applyExpYears,
      coverLetter: applyCoverLetter || "Madame, Monsieur, Je vous présente ma candidature très motivée pour ce poste...",
      cvFileName: applyCvName,
      diplomasFileName: "Diplomes_Certifies.pdf",
      attestationsFileName: "Attestations_Services.pdf",
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Reçu"
    };

    setApplications(prev => [newApp, ...prev]);

    // Update job application count
    setJobs(prev => prev.map(j => {
      if (j.id === applyingJob.id) {
        return { ...j, applicationsCount: j.applicationsCount + 1 };
      }
      return j;
    }));

    // Audit Log
    setAuditLogs(prev => [{
      id: `LOG-JOB-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      user: userName,
      role: userRole,
      action: "Dépôt de Candidature",
      target: applyingJob.id,
      details: `Candidature envoyée pour le poste "${applyingJob.title}"`
    }, ...prev]);

    if (onSendNotification) {
      onSendNotification({
        title: "Candidature Transmise",
        message: `Votre candidature pour "${applyingJob.title}" a été transmise à ${applyingJob.schoolName}.`,
        type: "success"
      });
    }

    setApplyingJob(null);
    setApplyCoverLetter("");
    alert(`✓ Félicitations ! Votre candidature a été transmise directement au service RH de "${applyingJob.schoolName}". Un accusé de réception vous a été délivré.`);
  };

  // Change Application Status
  const handleUpdateApplicationStatus = (appId: string, newStatus: JobApplication["status"]) => {
    setApplications(prev => prev.map(a => {
      if (a.id === appId) {
        return { ...a, status: newStatus };
      }
      return a;
    }));

    const targetApp = applications.find(a => a.id === appId);
    if (targetApp) {
      if (onSendNotification) {
        onSendNotification({
          title: "Évolution de Candidature",
          message: `Le statut de candidature de ${targetApp.applicantName} pour "${targetApp.jobTitle}" est passé à : ${newStatus}`,
          type: "info"
        });
      }
    }
  };

  // Filter jobs for display
  const filteredJobs = jobs.filter(j => {
    if (j.status !== "Publiée" && activeTab === "portail") return false;
    if (selectedProvince !== "Toutes" && j.province !== selectedProvince) return false;
    if (selectedCity !== "Toutes" && j.city !== selectedCity) return false;
    if (selectedContract !== "Tous" && j.contractType !== selectedContract) return false;
    if (selectedDepartment !== "Tous" && j.department !== selectedDepartment) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      return (
        j.title.toLowerCase().includes(kw) ||
        j.schoolName.toLowerCase().includes(kw) ||
        j.description.toLowerCase().includes(kw) ||
        j.skills.some(s => s.toLowerCase().includes(kw))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* BANNIÈRE HERO NATIONAL JOBS & RECRUITMENT */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-blue-900/40">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Briefcase className="h-80 w-80 -mr-16 -mt-16 text-blue-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-600 text-white font-mono font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center space-x-1 shadow-xs">
                <Sparkles className="h-3 w-3" />
                <span>PORTAIL NATIONAL RECRUTEMENT SMARTSCHOOL RDC</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <BadgeCheck className="h-3 w-3" />
                <span>RÉSEAU SOUVERAIN MINEPSP / EPST</span>
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center space-x-3">
              <span>Centre National des Offres d'Emploi Scolaires</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl font-medium leading-relaxed">
              La plateforme officielle de recrutement des enseignants, cadres administratifs, personnels techniques et universitaires de la RDC. Publiez vos besoins et recrutez les meilleurs talents éducatifs du pays.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {canPublish && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Publier une Offre d'Emploi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HORIZONTAL TABS NAVIGATION */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: "portail", label: "Toutes les Offres", icon: Briefcase, count: filteredJobs.length },
          { id: "candidatures", label: "Gestion Candidatures", icon: Users, count: applications.length },
          ...(canPublish ? [{ id: "mes_offres", label: "Offres de mon Établissement", icon: Building2, count: jobs.length }] : []),
          { id: "analytics", label: "Tableau de Bord Recrutement", icon: BarChart3 },
          { id: "audit", label: "Journal d'Audit", icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 shrink-0 transition-all cursor-pointer ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. PORTAIL DES OFFRES D'EMPLOI */}
      {activeTab === "portail" && (
        <div className="space-y-6">
          {/* SEARCH BAR AND FILTERS */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute inset-y-0 left-3.5 h-4 w-4 text-slate-400 my-auto" />
              <input
                type="text"
                placeholder="Rechercher par poste, matière, compétence, nom d'établissement..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Province</label>
                <select
                  value={selectedProvince}
                  onChange={e => setSelectedProvince(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="Toutes">Toutes les Provinces</option>
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Kongo Central">Kongo Central</option>
                  <option value="Haut-Katanga">Haut-Katanga</option>
                  <option value="Nord-Kivu">Nord-Kivu</option>
                  <option value="Sud-Kivu">Sud-Kivu</option>
                  <option value="Lualaba">Lualaba</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Département / Discipline</label>
                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="Tous">Tous les Départements</option>
                  <option value="Sciences Exactes">Sciences Exactes (Math, Phys, Chimie)</option>
                  <option value="Langues & Littérature">Langues & Littérature</option>
                  <option value="Finances & RH">Finances, RH & Gestion</option>
                  <option value="Informatique & IT">Informatique & Technologies</option>
                  <option value="Pédagogie & Primaire">Pédagogie & Primaire</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Type de Contrat</label>
                <select
                  value={selectedContract}
                  onChange={e => setSelectedContract(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="Tous">Tous les Contrats</option>
                  <option value="CDI">CDI (Incertaine durée)</option>
                  <option value="CDD">CDD (Durée déterminée)</option>
                  <option value="Vacataire">Vacataire / Prestataire</option>
                  <option value="Stage">Stage Pédagogique</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchKeyword("");
                    setSelectedProvince("Toutes");
                    setSelectedCity("Toutes");
                    setSelectedContract("Tous");
                    setSelectedDepartment("Tous");
                  }}
                  className="w-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* JOBS LIST GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="col-span-2 p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Briefcase className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Aucune offre d'emploi trouvée</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Aucune offre ne correspond actuellement à vos critères de recherche. Essayez de réinitialiser vos filtres.
                </p>
              </div>
            ) : (
              filteredJobs.map(job => (
                <div key={job.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-blue-500/60 transition-all space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Header with School Logo & Title */}
                    <div className="flex items-start space-x-3">
                      <img
                        src={job.schoolLogo || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150"}
                        alt={job.schoolName}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono font-bold text-[9px] rounded uppercase">
                            {job.department}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{job.createdAt}</span>
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white text-sm mt-1 line-clamp-1">{job.title}</h3>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{job.schoolName}</p>
                      </div>
                    </div>

                    {/* Meta location, contract & salary */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{job.city}, {job.province}</span>
                      </span>

                      <span className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg font-bold text-slate-700 dark:text-slate-200">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span>{job.contractType}</span>
                      </span>

                      {job.salaryMinUSD && (
                        <span className="flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-1 rounded-lg">
                          <DollarSign className="h-3 w-3" />
                          <span>{job.salaryMinUSD} - {job.salaryMaxUSD} $ / mois</span>
                        </span>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Required Skills Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.skills.slice(0, 3).map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium rounded-md">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Expire le : <strong>{job.deadline}</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedJobDetails(job)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Détails
                      </button>

                      <button
                        onClick={() => setApplyingJob(job)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Send className="h-3 w-3" />
                        <span>Postuler</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. GESTION DES CANDIDATURES (RECRUTEUR) */}
      {activeTab === "candidatures" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Gestion Centralisée des Candidatures Reçues</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Examinez les profils, modifiez les statuts et convoquez les candidats aux épreuves de sélection.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3">Candidat & Photo</th>
                    <th className="p-3">Poste Visé & École</th>
                    <th className="p-3">Diplôme le plus élevé</th>
                    <th className="p-3 text-center">Expérience</th>
                    <th className="p-3">Date Dépôt</th>
                    <th className="p-3">Statut Candidature</th>
                    <th className="p-3 text-right">Actions & Avis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={app.applicantPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                            alt={app.applicantName}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">{app.applicantName}</h4>
                            <div className="text-[10px] text-slate-400 font-mono">{app.applicantPhone} • {app.applicantEmail}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{app.jobTitle}</div>
                        <div className="text-[10px] text-slate-400">{app.schoolName}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{app.diplomaHighest}</div>
                      </td>

                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{app.experienceYears} ans</span>
                      </td>

                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {app.submittedAt}
                      </td>

                      <td className="p-3">
                        <select
                          value={app.status}
                          onChange={e => handleUpdateApplicationStatus(app.id, e.target.value as any)}
                          className={`p-1.5 rounded-lg text-[10px] font-bold border ${
                            app.status === "Accepté" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                            app.status === "Présélectionné" ? "bg-blue-100 text-blue-800 border-blue-300" :
                            app.status === "Convocation" ? "bg-purple-100 text-purple-800 border-purple-300" :
                            app.status === "Refusé" ? "bg-rose-100 text-rose-800 border-rose-300" :
                            "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          <option value="Reçu">Reçu</option>
                          <option value="En étude">En étude</option>
                          <option value="Présélectionné">Présélectionné</option>
                          <option value="Convocation">Convocation à l'examen</option>
                          <option value="Entretien">Entretien RH</option>
                          <option value="Accepté">Accepté (Recruté)</option>
                          <option value="Refusé">Refusé</option>
                        </select>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedCandidate(app)}
                          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold rounded-lg text-[10px] cursor-pointer"
                        >
                          Voir Dossier Complète
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. OFFRES DE MON ÉTABLISSEMENT */}
      {activeTab === "mes_offres" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Offres d'Emploi de Votre Établissement</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Gérez vos publications, modifiez les échéances et consultez le nombre de vues et de candidatures par poste.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Créer une Offre</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(j => (
              <div key={j.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-mono font-bold text-[9px] rounded">
                    {j.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    j.status === "Publiée" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {j.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{j.title}</h4>
                  <p className="text-xs text-slate-500">{j.schoolName} • {j.department}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Vues</span>
                    <span className="font-mono font-black text-sm text-slate-800 dark:text-white">{j.viewsCount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Candidats</span>
                    <span className="font-mono font-black text-sm text-blue-600">{j.applicationsCount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Postes</span>
                    <span className="font-mono font-black text-sm text-emerald-600">{j.openings}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 text-[10px]">Limite : <strong>{j.deadline}</strong></span>
                  <button
                    onClick={() => {
                      setJobs(prev => prev.map(item => {
                        if (item.id === j.id) {
                          return { ...item, status: item.status === "Publiée" ? "Clôturée" : "Publiée" };
                        }
                        return item;
                      }));
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    {j.status === "Publiée" ? "Clôturer l'Offre" : "Republier"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ANALYTICS & STATISTIQUES RECRUTEMENT */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Offres Publiées</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{jobs.length}</div>
              <span className="text-[10px] text-emerald-600 font-bold">100% Actives</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Candidatures</span>
              <div className="text-2xl font-black text-blue-600 font-mono">
                {jobs.reduce((acc, j) => acc + j.applicationsCount, 0)}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Portail National</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Candidats Présélectionnés</span>
              <div className="text-2xl font-black text-purple-600 font-mono">
                {applications.filter(a => a.status === "Présélectionné" || a.status === "Convocation").length}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Taux de rétention 42%</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Recrutements Réalisés</span>
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {applications.filter(a => a.status === "Accepté").length + 4}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Contrats signés</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. JOURNAL D'AUDIT GLOBAL */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase mb-3">
              Journal Traçabilité & Securité des Offres
            </h3>

            <div className="space-y-2">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400 mr-2">{log.timestamp}</span>
                    <strong className="text-slate-900 dark:text-white mr-2">{log.user} ({log.role})</strong>
                    <span className="text-blue-600 dark:text-blue-400 mr-2">[{log.action}]</span>
                    <span className="text-slate-500">{log.details}</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                    {log.target}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: JOB DETAILS MODAL */}
      {selectedJobDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedJobDetails(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start space-x-4">
              <img
                src={selectedJobDetails.schoolLogo || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150"}
                alt={selectedJobDetails.schoolName}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
              />
              <div>
                <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px] rounded uppercase">
                  {selectedJobDetails.department}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">{selectedJobDetails.title}</h2>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{selectedJobDetails.schoolName} • {selectedJobDetails.city}, {selectedJobDetails.province}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Contrat :</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedJobDetails.contractType}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Postes Libres :</span>
                <strong className="text-blue-600">{selectedJobDetails.openings} poste(s)</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date Limite :</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedJobDetails.deadline}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Rémunération :</span>
                <strong className="text-emerald-600">{selectedJobDetails.salaryMinUSD ? `${selectedJobDetails.salaryMinUSD} - ${selectedJobDetails.salaryMaxUSD} $` : "Selon Profil"}</strong>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide mb-1">Description du Poste</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedJobDetails.description}</p>
              </div>

              {selectedJobDetails.missions.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide mb-2">Missions Principales</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                    {selectedJobDetails.missions.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJobDetails.diplomas.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide mb-2">Diplômes Exigés</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJobDetails.diplomas.map((d, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold rounded-lg flex items-center space-x-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>{d}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide mb-1">Contact Recrutement</h4>
                <p className="text-slate-600 dark:text-slate-300">{selectedJobDetails.contactName} • {selectedJobDetails.contactPhone} • {selectedJobDetails.contactEmail}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Fermer
              </button>

              <button
                onClick={() => {
                  setApplyingJob(selectedJobDetails);
                  setSelectedJobDetails(null);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Postuler à cette Offre</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLY JOB MODAL */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setApplyingJob(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">Candidature Spontanée / Directe</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Postuler à : {applyingJob.title}</h2>
              <p className="text-xs text-slate-500">{applyingJob.schoolName} • {applyingJob.city}</p>
            </div>

            <form onSubmit={handleSendApplication} className="space-y-4">
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 space-y-2">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">Données Extraites du Profil SmartSchool RDC</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Nom :</strong> {userName}</div>
                  <div><strong>Rôle :</strong> {userRole}</div>
                  <div><strong>Email :</strong> {userEmail}</div>
                  <div><strong>Téléphone :</strong> {applyPhone}</div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Diplôme le Plus Élevé</label>
                <input
                  type="text"
                  value={applyDiploma}
                  onChange={e => setApplyDiploma(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Années d'Expérience Professionnelle</label>
                <input
                  type="number"
                  value={applyExpYears}
                  onChange={e => setApplyExpYears(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lettre de Motivation / Message au Recruteur</label>
                <textarea
                  rows={4}
                  value={applyCoverLetter}
                  onChange={e => setApplyCoverLetter(e.target.value)}
                  placeholder="Exposez brièvement vos compétences, vos motivations et votre disponibilité..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Pièces Jointes Déjà Attachées</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>{applyCvName}</span>
                  </span>
                  <span className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px] flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <span>Diplomes_Legalises.pdf</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Transmettre la Candidature</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE JOB OFFER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">Formulaire Officiel de Recrutement</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Publier une Nouvelle Offre d'Emploi</h2>
            </div>

            <form onSubmit={handleCreateJobOffer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nom de l'Établissement</label>
                  <input
                    type="text"
                    value={newJobSchoolName}
                    onChange={e => setNewJobSchoolName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Intitulé du Poste</label>
                  <input
                    type="text"
                    placeholder="Ex: Professeur de Chimie, Secrétaire Général..."
                    value={newJobTitle}
                    onChange={e => setNewJobTitle(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Département / Section</label>
                  <select
                    value={newJobDepartment}
                    onChange={e => setNewJobDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  >
                    <option value="Sciences Exactes">Sciences Exactes</option>
                    <option value="Langues & Littérature">Langues & Littérature</option>
                    <option value="Finances & RH">Finances, RH & Gestion</option>
                    <option value="Informatique & IT">Informatique & IT</option>
                    <option value="Pédagogie & Primaire">Pédagogie & Primaire</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nombre de Postes Ouverts</label>
                  <input
                    type="number"
                    value={newJobOpenings}
                    onChange={e => setNewJobOpenings(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Province</label>
                  <select
                    value={newJobProvince}
                    onChange={e => setNewJobProvince(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  >
                    <option value="Kinshasa">Kinshasa</option>
                    <option value="Kongo Central">Kongo Central</option>
                    <option value="Haut-Katanga">Haut-Katanga</option>
                    <option value="Nord-Kivu">Nord-Kivu</option>
                    <option value="Sud-Kivu">Sud-Kivu</option>
                    <option value="Lualaba">Lualaba</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ville / Commune</label>
                  <input
                    type="text"
                    value={newJobCity}
                    onChange={e => setNewJobCity(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Type de Contrat</label>
                  <select
                    value={newJobContract}
                    onChange={e => setNewJobContract(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  >
                    <option value="CDI">CDI (Incertaine durée)</option>
                    <option value="CDD">CDD (Durée déterminée)</option>
                    <option value="Vacataire">Vacataire / Prestataire</option>
                    <option value="Stage">Stage Pédagogique</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date Limite de Candidature</label>
                  <input
                    type="date"
                    value={newJobDeadline}
                    onChange={e => setNewJobDeadline(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description Synthétique du Poste</label>
                <textarea
                  rows={3}
                  value={newJobDescription}
                  onChange={e => setNewJobDescription(e.target.value)}
                  placeholder="Décrivez les objectifs et le contexte de l'école..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Missions Principales (Une mission par ligne)</label>
                <textarea
                  rows={3}
                  value={newJobMissionsText}
                  onChange={e => setNewJobMissionsText(e.target.value)}
                  placeholder="Dispenser les cours de chimie&#10;Préparer les laboratoires&#10;Participer aux réunions"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Profil & Diplômes Exigés</label>
                <input
                  type="text"
                  placeholder="Ex: Licence en Chimie / Agrégation A0"
                  value={newJobDiplomasText}
                  onChange={e => setNewJobDiplomasText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publier sur le Portail National</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: FULL CANDIDATE DOSSIER MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-4">
              <img
                src={selectedCandidate.applicantPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                alt={selectedCandidate.applicantName}
                className="h-16 w-16 rounded-full object-cover border-2 border-blue-500 shrink-0"
              />
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{selectedCandidate.applicantName}</h2>
                <p className="text-xs text-slate-500">{selectedCandidate.applicantRole} • {selectedCandidate.applicantPhone} • {selectedCandidate.applicantEmail}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                    Statut: {selectedCandidate.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1">
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Poste Postulé</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.jobTitle} ({selectedCandidate.schoolName})</p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Lettre de Motivation</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{selectedCandidate.coverLetter}"
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px] mb-1">Pièces Jointes Téléchargeables</span>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-xs">{selectedCandidate.cvFileName}</span>
                    <button
                      onClick={() => alert(`Document "${selectedCandidate.cvFileName}" téléchargé.`)}
                      className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                    >
                      Télécharger PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
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
