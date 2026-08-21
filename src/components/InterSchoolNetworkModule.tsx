import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Search, 
  Building, 
  Users, 
  MessageSquare, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Share2, 
  FileText, 
  Calendar, 
  Bell, 
  Award, 
  BookOpen, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Send, 
  Plus, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Eye, 
  ChevronRight,
  Handshake,
  CheckCircle2,
  X,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { safeLocalStorage } from "../utils/safeStorage";

export interface NetworkSchool {
  id: string;
  name: string;
  codeNational: string;
  province: string;
  ville: string;
  type: "Public" | "Privé" | "Conventionné";
  logoUrl: string;
  coverUrl: string;
  contactEmail: string;
  contactPhone: string;
  studentCount: number;
  teacherCount: number;
  optionsOrganized: string[];
  motto: string;
  history: string;
  isPartner: boolean;
  collaborationStatus: "none" | "pending_sent" | "pending_received" | "partnered";
}

export interface InterSchoolMessage {
  id: string;
  senderSchoolId: string;
  senderSchoolName: string;
  receiverSchoolId: string;
  subject: string;
  content: string;
  sentAt: string;
  category: "Général" | "Activité Commune" | "Partage Document" | "Recommandation Enseignant";
}

export interface SharedDocItem {
  id: string;
  schoolName: string;
  title: string;
  category: "Sujet d'Examen Blanc" | "Guide Pédagogique" | "Fiche de Cours" | "Règlement Intérieur";
  sharedAt: string;
  downloadUrl: string;
}

export interface JointActivityItem {
  id: string;
  title: string;
  type: "Tournoi Sportif" | "Examen Blanc Commun" | "Concours de Génie en Herbe" | "Formation Enseignants" | "Cérémonie";
  hostSchool: string;
  partnerSchool: string;
  date: string;
  location: string;
  status: "Planifié" | "En cours" | "Terminé";
}

interface InterSchoolNetworkModuleProps {
  currentSchoolId?: string;
  currentSchoolName?: string;
  userRole?: string;
  userName?: string;
  onAuditLog?: (action: string, details: string) => void;
}

export function InterSchoolNetworkModule({
  currentSchoolId = "SCH-KIN-001",
  currentSchoolName = "COMPLEXE SCOLAIRE SMARTSCHOOL RDC",
  userRole = "Directeur",
  userName = "Directeur Général",
  onAuditLog
}: InterSchoolNetworkModuleProps) {

  // Active Tab: "directory" | "partners" | "messages" | "activities" | "documents" | "recommendations"
  const [activeTab, setActiveTab] = useState<"directory" | "partners" | "messages" | "activities" | "documents" | "recommendations">("directory");

  // Search & Filter Query
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>("Toutes");

  // Network Schools Directory State
  const [schools, setSchools] = useState<NetworkSchool[]>(() => {
    const saved = safeLocalStorage.getItem("ss_network_schools");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "SCH-KIN-002",
        name: "COLLÈGE SAINT-JOSEPH DE GOMBE",
        codeNational: "RDC-KIN-8843",
        province: "Kinshasa",
        ville: "Kinshasa / Gombe",
        type: "Conventionné",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png",
        coverUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
        contactEmail: "direction@stjoseph-gombe.cd",
        contactPhone: "+243 81 999 8877",
        studentCount: 1420,
        teacherCount: 68,
        optionsOrganized: ["Mathématique-Physique", "Chimie-Biologie", "Pédagogie Générale"],
        motto: "Virtus et Scientia",
        history: "Établissement conventionné catholique créé en 1954.",
        isPartner: true,
        collaborationStatus: "partnered"
      },
      {
        id: "SCH-LUB-003",
        name: "COMPLEXE SCOLAIRE LA MERVEILLE LUBUMBASHI",
        codeNational: "RDC-KAT-4412",
        province: "Haut-Katanga",
        ville: "Lubumbashi",
        type: "Privé",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png",
        coverUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
        contactEmail: "contact@lamerveille-lshi.cd",
        contactPhone: "+243 99 444 3322",
        studentCount: 980,
        teacherCount: 45,
        optionsOrganized: ["Commerciale & Gestion", "Pédagogie Générale", "Humanités Scientifiques"],
        motto: "Vers l'Excellence",
        history: "Établissement privé agréé de référence au Katanga.",
        isPartner: false,
        collaborationStatus: "pending_sent"
      },
      {
        id: "SCH-GOM-004",
        name: "LYCÉE AMANI DE GOMA",
        codeNational: "RDC-NK-1022",
        province: "Nord-Kivu",
        ville: "Goma",
        type: "Conventionné",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png",
        coverUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800",
        contactEmail: "info@lyceeamani-goma.cd",
        contactPhone: "+243 85 222 1100",
        studentCount: 1150,
        teacherCount: 52,
        optionsOrganized: ["Chimie-Biologie", "Littéraire", "Coupe & Couture"],
        motto: "Paix et Travail",
        history: "Lycée de jeunes filles fondé en 1978.",
        isPartner: false,
        collaborationStatus: "pending_received"
      },
      {
        id: "SCH-MAT-005",
        name: "INSTITUT DE MATADI",
        codeNational: "RDC-BC-9011",
        province: "Kongo-Central",
        ville: "Matadi",
        type: "Public",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg/512px-Coat_of_arms_of_the_Democratic_Republic_of_the_Congo.svg.png",
        coverUrl: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=800",
        contactEmail: "direction@instmatadi.cd",
        contactPhone: "+243 81 001 2233",
        studentCount: 890,
        teacherCount: 40,
        optionsOrganized: ["Mécanique Générale", "Électricité", "Math-Physique"],
        motto: "Savoir et Action",
        history: "Institut public technique et scientifique.",
        isPartner: false,
        collaborationStatus: "none"
      }
    ];
  });

  // Messages State
  const [messages, setMessages] = useState<InterSchoolMessage[]>(() => {
    return [
      {
        id: "msg-1",
        senderSchoolId: "SCH-KIN-002",
        senderSchoolName: "COLLÈGE SAINT-JOSEPH DE GOMBE",
        receiverSchoolId: currentSchoolId,
        subject: "Organisation de l'Examen Blanc Commun 2026",
        content: "Chers confrères, nous proposons une session conjointe d'examen blanc pour les finalistes de 6è Chimie-Biologie du 15 au 18 avril.",
        sentAt: "2026-08-08 14:30",
        category: "Activité Commune"
      }
    ];
  });

  // Joint Activities State
  const [activities, setActivities] = useState<JointActivityItem[]>(() => {
    return [
      {
        id: "act-1",
        title: "Tournoi Interscolaire de Football & Basket-Ball",
        type: "Tournoi Sportif",
        hostSchool: currentSchoolName,
        partnerSchool: "COLLÈGE SAINT-JOSEPH DE GOMBE",
        date: "2026-09-12",
        location: "Stade de la Concorde (SmartSchool RDC)",
        status: "Planifié"
      }
    ];
  });

  // Shared Documents State
  const [docs, setDocs] = useState<SharedDocItem[]>(() => {
    return [
      {
        id: "doc-1",
        schoolName: "COLLÈGE SAINT-JOSEPH DE GOMBE",
        title: "Sujet de Révision Examen d'État - Mathématiques 2025",
        category: "Sujet d'Examen Blanc",
        sharedAt: "2026-08-05",
        downloadUrl: "#"
      }
    ];
  });

  // Modal State for Viewing School Public Profile
  const [selectedSchoolModal, setSelectedSchoolModal] = useState<NetworkSchool | null>(null);

  // New Message Form State
  const [newMessageModal, setNewMessageModal] = useState<boolean>(false);
  const [messageForm, setMessageForm] = useState({
    targetSchoolId: "",
    subject: "",
    content: "",
    category: "Général" as InterSchoolMessage["category"]
  });

  // Save State to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem("ss_network_schools", JSON.stringify(schools));
  }, [schools]);

  // Handle Send Collaboration Request
  const handleSendCollaborationRequest = (schoolId: string, schoolName: string) => {
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        return { ...s, collaborationStatus: "pending_sent" };
      }
      return s;
    }));

    if (onAuditLog) {
      onAuditLog("Demande de Collaboration", `Envoi d'une demande de partenariat à l'établissement '${schoolName}'.`);
    }

    alert(`Demande de collaboration envoyée à '${schoolName}' avec succès !`);
  };

  // Handle Accept / Decline Collaboration Request
  const handleRespondCollaboration = (schoolId: string, schoolName: string, accept: boolean) => {
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        return {
          ...s,
          isPartner: accept,
          collaborationStatus: accept ? "partnered" : "none"
        };
      }
      return s;
    }));

    if (onAuditLog) {
      onAuditLog(
        accept ? "Acceptation Partenariat" : "Refus Partenariat",
        `${accept ? "Acceptation" : "Refus"} de la demande de collaboration de '${schoolName}'.`
      );
    }
  };

  // Handle Send Message Submit
  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageForm.targetSchoolId || !messageForm.subject.trim() || !messageForm.content.trim()) {
      alert("Veuillez sélectionner l'école destinataire et remplir le sujet et le message.");
      return;
    }

    const targetSchool = schools.find(s => s.id === messageForm.targetSchoolId);

    const newMsg: InterSchoolMessage = {
      id: `msg-${Date.now()}`,
      senderSchoolId: currentSchoolId,
      senderSchoolName: currentSchoolName,
      receiverSchoolId: messageForm.targetSchoolId,
      subject: messageForm.subject.trim(),
      content: messageForm.content.trim(),
      sentAt: new Date().toLocaleString("fr-FR"),
      category: messageForm.category
    };

    setMessages(prev => [newMsg, ...prev]);
    setNewMessageModal(false);
    setMessageForm({ targetSchoolId: "", subject: "", content: "", category: "Général" });

    if (onAuditLog) {
      onAuditLog("Envoi Message Inter-Écoles", `Envoi d'un message officiel à '${targetSchool?.name || "École"}' : ${newMsg.subject}`);
    }

    alert("Message inter-écoles transmis avec succès !");
  };

  // Filtered Schools Directory
  const filteredSchools = schools.filter((s) => {
    if (selectedProvinceFilter !== "Toutes" && s.province !== selectedProvinceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.ville.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q) ||
        s.codeNational.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Active Partners Count
  const partneredCount = schools.filter(s => s.collaborationStatus === "partnered").length;
  const pendingReceivedCount = schools.filter(s => s.collaborationStatus === "pending_received").length;

  return (
    <div className="space-y-6 text-left" id="inter-school-network-module">
      
      {/* HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> Réseau National Interscolaire RDC
            </span>
            <span className="text-slate-400 text-xs font-mono">• Collaboration & Échanges Pédagogiques</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            Réseau des Établissements SmartSchool RDC
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connectez votre établissement aux meilleures écoles de la République Démocratique du Congo. Organisez des activités communes, partagez des sujets d'examens et échangez des expériences pédagogiques.
          </p>
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setNewMessageModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Envoyer un Message Inter-Écoles</span>
          </button>
        </div>
      </div>

      {/* STRICT CONFIDENTIALITY & PRIVACY NOTICE BANNER */}
      <div className="bg-emerald-950/80 border border-emerald-600/50 p-4 rounded-2xl text-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-black uppercase text-white block">Garantie Souveraine de Confidentialité des Données</span>
            <span className="text-[11px] opacity-90">
              Aucune donnée confidentielle (élèves, notes, minervals, dossiers RH) n'est partagée. Seules les informations publiques autorisées par le Directeur sont accessibles.
            </span>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-900 text-emerald-300 font-mono font-bold text-[10px] rounded-full uppercase shrink-0">
          Isolement Strict Garantit
        </span>
      </div>

      {/* MODULE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "directory"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Répertoire National ({schools.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("partners")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 relative ${
              activeTab === "partners"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            }`}
          >
            <Handshake className="h-4 w-4 text-emerald-500" />
            <span>Écoles Partenaires ({partneredCount})</span>
            {pendingReceivedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-mono font-bold rounded-full">
                {pendingReceivedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "messages"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            }`}
          >
            <MessageSquare className="h-4 w-4 text-indigo-500" />
            <span>Messagerie Inter-Écoles ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("activities")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "activities"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            }`}
          >
            <Calendar className="h-4 w-4 text-purple-500" />
            <span>Activités Communes</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "documents"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            }`}
          >
            <FileText className="h-4 w-4 text-amber-500" />
            <span>Partage de Documents</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SCHOOLS DIRECTORY & SEARCH */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          
          {/* SEARCH & PROVINCE FILTER BAR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une école, province, ville..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Province :</span>
              <select
                value={selectedProvinceFilter}
                onChange={(e) => setSelectedProvinceFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
              >
                <option value="Toutes">Toutes les Provinces</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Haut-Katanga">Haut-Katanga</option>
                <option value="Nord-Kivu">Nord-Kivu</option>
                <option value="Kongo-Central">Kongo-Central</option>
                <option value="Tshopo">Tshopo</option>
              </select>
            </div>
          </div>

          {/* SCHOOL CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <div
                key={school.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* School Cover & Header */}
                <div className="h-32 relative bg-slate-800">
                  {school.coverUrl ? (
                    <img src={school.coverUrl} alt={school.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-slate-900/80 text-white font-mono font-bold text-[9px] rounded-full uppercase">
                    {school.codeNational}
                  </span>

                  <div className="absolute -bottom-5 left-4">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} alt="Logo" className="h-12 w-12 rounded-2xl bg-white p-1.5 object-contain shadow-lg border border-slate-200" />
                    ) : (
                      <div className="h-12 w-12 rounded-2xl bg-white p-1.5 flex items-center justify-center font-black text-sm text-slate-800 shadow-lg border border-slate-200">
                        SS
                      </div>
                    )}
                  </div>
                </div>

                {/* School Details */}
                <div className="p-5 pt-8 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 uppercase">{school.name}</h3>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {school.ville} ({school.province})
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">{school.history}</p>
                  </div>

                  {/* Options Organized Tags */}
                  <div className="flex flex-wrap gap-1">
                    {school.optionsOrganized.map((opt) => (
                      <span key={opt} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[9px] rounded-lg">
                        {opt}
                      </span>
                    ))}
                  </div>

                  {/* Stat Counts & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500">
                      <span>Élèves : {school.studentCount}</span>
                      <span>Enseignants : {school.teacherCount}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedSchoolModal(school)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Voir Profil</span>
                      </button>

                      {school.collaborationStatus === "none" && (
                        <button
                          onClick={() => handleSendCollaborationRequest(school.id, school.name)}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md transition-all cursor-pointer"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Collaborer</span>
                        </button>
                      )}

                      {school.collaborationStatus === "pending_sent" && (
                        <span className="flex-1 py-2 bg-amber-100 text-amber-800 font-bold rounded-xl text-xs text-center">
                          Demande Envoyée
                        </span>
                      )}

                      {school.collaborationStatus === "partnered" && (
                        <span className="flex-1 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Partenaire
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: PARTNER SCHOOLS & PENDING REQUESTS */}
      {activeTab === "partners" && (
        <div className="space-y-6">
          
          {/* PENDING REQUESTS INCOMING */}
          {pendingReceivedCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-5 rounded-3xl space-y-3">
              <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-300 uppercase flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Demandes de Collaboration Reçues en Attente ({pendingReceivedCount})</span>
              </h3>

              <div className="space-y-2">
                {schools.filter(s => s.collaborationStatus === "pending_received").map((req) => (
                  <div key={req.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      {req.logoUrl ? (
                        <img src={req.logoUrl} alt="Logo" className="h-10 w-10 rounded-xl bg-slate-100 p-1 object-contain" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">SS</div>
                      )}
                      <div>
                        <h4 className="font-bold text-xs uppercase text-slate-900 dark:text-white">{req.name}</h4>
                        <p className="text-[10px] text-slate-400">{req.ville} ({req.province}) • {req.contactEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRespondCollaboration(req.id, req.name, true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Accepter</span>
                      </button>
                      <button
                        onClick={() => handleRespondCollaboration(req.id, req.name, false)}
                        className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Refuser</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE PARTNERS LIST */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase flex items-center space-x-2">
              <Handshake className="h-5 w-5 text-emerald-500" />
              <span>Établissements Scolaires Partenaires Actifs ({partneredCount})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schools.filter(s => s.collaborationStatus === "partnered").map((partner) => (
                <div key={partner.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {partner.logoUrl ? (
                      <img src={partner.logoUrl} alt="Logo" className="h-12 w-12 rounded-xl bg-white p-1 object-contain border" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs border">SS</div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-xs uppercase text-slate-900 dark:text-white">{partner.name}</h4>
                      <p className="text-[10px] text-slate-500">{partner.ville} • {partner.contactPhone}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded uppercase">
                        Partenariat Actif
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMessageForm(prev => ({ ...prev, targetSchoolId: partner.id }));
                      setNewMessageModal(true);
                    }}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 cursor-pointer shadow-md"
                    title="Envoyer un message officiel à ce partenaire"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {partneredCount === 0 && (
                <p className="col-span-full text-slate-400 text-xs font-bold text-center py-8">
                  Aucun établissement partenaire pour le moment. Parcourez le Répertoire National pour envoyer des demandes de collaboration.
                </p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: MESSAGERIE INTER-ÉCOLES */}
      {activeTab === "messages" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              <span>Messagerie Officielle Inter-Écoles ({messages.length})</span>
            </h3>

            <button
              onClick={() => setNewMessageModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Nouveau Message</span>
            </button>
          </div>

          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">{m.senderSchoolName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{m.sentAt}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.subject}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{m.content}</p>
                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-bold uppercase">{m.category}</span>
                  <span className="italic">Garantie Souveraine de Sécurité SmartSchool RDC</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW SCHOOL PUBLIC PROFILE */}
      {selectedSchoolModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-left space-y-4">
            
            {/* Header Banner */}
            <div className="h-40 relative bg-slate-800">
              {selectedSchoolModal.coverUrl ? (
                <img src={selectedSchoolModal.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-700" />
              )}
              <button
                onClick={() => setSelectedSchoolModal(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 text-white rounded-full hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute -bottom-6 left-6">
                {selectedSchoolModal.logoUrl ? (
                  <img src={selectedSchoolModal.logoUrl} alt="Logo" className="h-16 w-16 rounded-2xl bg-white p-2 object-contain shadow-xl border-2 border-white" />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-white p-2 flex items-center justify-center font-black text-xl text-slate-800 shadow-xl border-2 border-white">
                    SS
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 pt-8 space-y-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-black uppercase">{selectedSchoolModal.codeNational}</span>
                <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">{selectedSchoolModal.name}</h2>
                <p className="text-xs text-slate-500">{selectedSchoolModal.ville} ({selectedSchoolModal.province})</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Présentation & Historique</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">{selectedSchoolModal.history}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Effectif Élèves</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{selectedSchoolModal.studentCount} Élèves</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Corps Enseignant</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{selectedSchoolModal.teacherCount} Professeurs</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setSelectedSchoolModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Fermer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: NEW MESSAGE FORM */}
      {newMessageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Send className="h-4 w-4 text-indigo-500" />
                <span>Nouveau Message Inter-Écoles</span>
              </h3>
              <button onClick={() => setNewMessageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessageSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">École Destinataire *</label>
                <select
                  required
                  value={messageForm.targetSchoolId}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, targetSchoolId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  <option value="">Sélectionner une école...</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.ville})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Objet / Sujet *</label>
                <input
                  type="text"
                  required
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ex: Organisation d'activités pédagogiques"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Contenu du Message *</label>
                <textarea
                  rows={4}
                  required
                  value={messageForm.content}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Rédigez votre message officiel..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewMessageModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Transmettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
