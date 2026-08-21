import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Plus, Search, Users, User, MessageSquare, Hash, Volume2, X, Check, CheckCheck, 
  Filter, UserPlus, Image as ImageIcon, Paperclip, AlertCircle, Sparkles, Building2, Bell,
  FileText, FileSpreadsheet, Mic, Video, Archive, Trash2, MoreVertical, Download, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Employee, Student, Parent } from "../types";
import { safeLocalStorage } from "../utils/safeStorage";

export interface ChatAttachment {
  type: "image" | "pdf" | "word" | "excel" | "audio" | "video";
  name: string;
  url: string;
  size?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  attachment?: ChatAttachment;
}

export interface ChatGroup {
  id: string;
  name: string;
  type: "direct" | "group" | "school_parent";
  participants: { id: string; name: string; role: string; avatar?: string }[];
  messages: ChatMessage[];
  lastMessageText?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isArchived?: boolean;
}

interface MessagerieProps {
  userRole: string;
  userName: string;
  employees: Employee[];
  students: Student[];
  parents: Parent[];
  onSendMessageNotification?: (notif: { title: string; message: string }) => void;
  initialTargetUserId?: string | null;
  onClearInitialTarget?: () => void;
}

export function Messagerie({
  userRole,
  userName,
  employees,
  students,
  parents,
  onSendMessageNotification,
  initialTargetUserId,
  onClearInitialTarget
}: MessagerieProps) {
  // Determine current user simulated ID
  const currentUserId = React.useMemo(() => {
    return `user-${userName.replace(/\s+/g, "-").toLowerCase()}`;
  }, [userName]);

  // Combined searchable users list
  const allUsers = React.useMemo(() => {
    const list: { id: string; name: string; role: string; type: "personnel" | "eleve" | "parent"; avatar?: string }[] = [];
    
    // Add employees
    employees.forEach(emp => {
      list.push({
        id: emp.id,
        name: `${emp.lastName} ${emp.firstName}`,
        role: emp.function,
        type: "personnel",
        avatar: emp.photoUrl
      });
    });

    // Add students
    students.forEach(std => {
      list.push({
        id: std.id,
        name: `${std.lastName} ${std.firstName}`,
        role: "Élève",
        type: "eleve",
        avatar: std.photoUrl
      });
    });

    // Add parents
    parents.forEach(p => {
      list.push({
        id: p.id,
        name: p.firstName || p.lastName ? `${p.firstName} ${p.lastName}` : "Parent d'Élève",
        role: "Parent / Tuteur",
        type: "parent"
      });
    });

    return list.filter(u => u.name.trim() !== "" && u.id !== currentUserId);
  }, [employees, students, parents, currentUserId]);

  // Chat groups / conversations state
  const [conversations, setConversations] = useState<ChatGroup[]>(() => {
    const saved = safeLocalStorage.getItem("smartschool_conversations");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }

    // Default initial historical mock data
    const initialConversations: ChatGroup[] = [
      {
        id: "conv-1",
        name: "Comité de Direction & Secrétariat",
        type: "group",
        participants: [
          { id: currentUserId, name: userName, role: userRole },
          { id: "emp-1", name: "Astrid Mutombo", role: "Secrétaire", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" },
          { id: "emp-2", name: "Sylvain Kabulo", role: "Comptable Principal" }
        ],
        messages: [
          {
            id: "m-1-1",
            senderId: "emp-1",
            senderName: "Astrid Mutombo",
            senderRole: "Secrétaire",
            text: "Bonjour à tous, les dossiers d'inscription pour la rentrée 2026 sont prêts pour audit.",
            timestamp: "Hier à 14h25"
          },
          {
            id: "m-1-2",
            senderId: "emp-2",
            senderName: "Sylvain Kabulo",
            senderRole: "Comptable Principal",
            text: "Merci Astrid. Les premiers paiements de frais scolaires par Mobile Money sont validés.",
            timestamp: "Hier à 14h30"
          },
          {
            id: "m-1-3",
            senderId: currentUserId,
            senderName: userName,
            senderRole: userRole,
            text: "Excellent travail d'équipe. Gardons un œil sur les dossiers sans photo de profil.",
            timestamp: "Hier à 15h02"
          }
        ],
        lastMessageText: "Excellent travail d'équipe. Gardons un œil sur les dossiers sans photo de profil.",
        lastMessageTime: "Hier à 15h02",
        unreadCount: 0
      },
      {
        id: "conv-2",
        name: "Échanges Parents-École (Gaston T.)",
        type: "school_parent",
        participants: [
          { id: currentUserId, name: userName, role: userRole },
          { id: "prt-1", name: "Papa Gaston", role: "Parent / Tuteur" }
        ],
        messages: [
          {
            id: "m-2-1",
            senderId: "prt-1",
            senderName: "Papa Gaston",
            senderRole: "Parent",
            text: "Bonjour Monsieur le Préfet, j'ai reçu le bulletin de Gaston pour la 2ème période. Je souhaiterais en discuter.",
            timestamp: "Aujourd'hui à 08h15"
          },
          {
            id: "m-2-2",
            senderId: currentUserId,
            senderName: userName,
            senderRole: userRole,
            text: "Bonjour M. Gaston, avec plaisir. Je suis disponible ce vendredi à partir de 10h au bureau.",
            timestamp: "Aujourd'hui à 08h30"
          }
        ],
        lastMessageText: "Bonjour M. Gaston, avec plaisir. Je suis disponible ce vendredi à partir de 10h au bureau.",
        lastMessageTime: "Aujourd'hui à 08h30",
        unreadCount: 0
      },
      {
        id: "conv-3",
        name: "Astrid Mutombo (Secrétariat)",
        type: "direct",
        participants: [
          { id: currentUserId, name: userName, role: userRole },
          { id: "emp-1", name: "Astrid Mutombo", role: "Secrétaire", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" }
        ],
        messages: [
          {
            id: "m-3-1",
            senderId: "emp-1",
            senderName: "Astrid Mutombo",
            senderRole: "Secrétaire",
            text: "Avez-vous approuvé la fiche d'inscription de Jean-Paul Mbuyi ?",
            timestamp: "Aujourd'hui à 11h10"
          }
        ],
        lastMessageText: "Avez-vous approuvé la fiche d'inscription de Jean-Paul Mbuyi ?",
        lastMessageTime: "Aujourd'hui à 11h10",
        unreadCount: 1
      }
    ];

    return initialConversations;
  });

  // Local Storage Save Sync
  useEffect(() => {
    safeLocalStorage.setItem("smartschool_conversations", JSON.stringify(conversations));
  }, [conversations]);

  // Selected Chat State
  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const activeConversation = conversations.find(c => c.id === activeConvId);

  // Send Message State
  const [messageText, setMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, activeConversation?.messages]);

  // Modals & creation states
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  
  const [userSearchText, setUserSearchText] = useState("");
  const [convSearchText, setConvSearchText] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedGroupParticipants, setSelectedGroupParticipants] = useState<string[]>([]);
  const [activeTabFilter, setActiveTabFilter] = useState<"all" | "direct" | "group" | "school_parent" | "archived">("all");
  const [selectedAttachment, setSelectedAttachment] = useState<ChatAttachment | null>(null);

  // Typing indicator simulation
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  // Auto-open chat if initialTargetUserId is passed
  useEffect(() => {
    if (initialTargetUserId) {
      const match = allUsers.find(u => u.id === initialTargetUserId);
      if (match) {
        handleStartDirectChat(match);
      }
      if (onClearInitialTarget) onClearInitialTarget();
    }
  }, [initialTargetUserId, allUsers]);

  // Handle send message
  const handleSendMessage = (e: React.FormEvent, customAttachment?: ChatAttachment) => {
    e.preventDefault();
    const att = customAttachment || selectedAttachment;
    if ((!messageText.trim() && !att) || !activeConversation) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: currentUserId,
      senderName: userName,
      senderRole: userRole,
      text: messageText || (att ? `[Fichier Joint: ${att.name}]` : ""),
      timestamp: `Aujourd'hui à ${timeString}`,
      attachment: att || undefined
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessageText: newMsg.text,
          lastMessageTime: `Aujourd'hui à ${timeString}`,
          unreadCount: 0
        };
      }
      return conv;
    }));

    // Trigger notification callback if supplied
    if (onSendMessageNotification) {
      onSendMessageNotification({
        title: `Nouveau message - ${activeConversation.name}`,
        message: `${userName} : ${newMsg.text}`
      });
    }

    setMessageText("");
    setSelectedAttachment(null);
    setShowAttachmentModal(false);

    // Simulate recipient reply typing
    setIsRecipientTyping(true);
    setTimeout(() => {
      setIsRecipientTyping(false);
    }, 3500);
  };

  // Archive / Unarchive active conversation
  const handleToggleArchive = (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isArchived: !c.isArchived } : c));
  };

  // Delete conversation
  const handleDeleteConversation = (convId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette conversation ?")) {
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) {
        setActiveConvId("");
      }
    }
  };

  // Start direct conversation
  const handleStartDirectChat = (targetUser: { id: string; name: string; role: string; avatar?: string }) => {
    // Check if direct chat already exists
    const existing = conversations.find(
      c => c.type === "direct" && c.participants.some(p => p.id === targetUser.id)
    );

    if (existing) {
      setActiveConvId(existing.id);
      setShowNewChatModal(false);
      return;
    }

    // Create new direct conversation
    const newConv: ChatGroup = {
      id: `conv-${Date.now()}`,
      name: targetUser.name,
      type: "direct",
      participants: [
        { id: currentUserId, name: userName, role: userRole },
        { id: targetUser.id, name: targetUser.name, role: targetUser.role, avatar: targetUser.avatar }
      ],
      messages: [],
      unreadCount: 0
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setShowNewChatModal(false);
  };

  // Create Group Chat
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedGroupParticipants.length === 0) return;

    const participantsList = selectedGroupParticipants.map(id => {
      const match = allUsers.find(u => u.id === id);
      return {
        id,
        name: match ? match.name : "Utilisateur",
        role: match ? match.role : "Membre",
        avatar: match ? match.avatar : undefined
      };
    });

    // Insert current user
    participantsList.unshift({
      id: currentUserId,
      name: userName,
      role: userRole,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
    });

    const newGroup: ChatGroup = {
      id: `conv-${Date.now()}`,
      name: groupName,
      type: "group",
      participants: participantsList,
      messages: [
        {
          id: `m-${Date.now()}`,
          senderId: "system",
          senderName: "Système",
          senderRole: "Réseau",
          text: `Groupe créé par ${userName}. Membres ajoutés: ${participantsList.slice(1).map(p => p.name).join(", ")}.`,
          timestamp: "À l'instant"
        }
      ],
      lastMessageText: `Groupe créé par ${userName}`,
      lastMessageTime: "À l'instant",
      unreadCount: 0
    };

    setConversations(prev => [newGroup, ...prev]);
    setActiveConvId(newGroup.id);
    
    // Reset state
    setGroupName("");
    setSelectedGroupParticipants([]);
    setShowCreateGroupModal(false);
  };

  // Switch tab filter & search handler
  const filteredConversations = conversations.filter(conv => {
    if (activeTabFilter === "archived") {
      if (!conv.isArchived) return false;
    } else {
      if (conv.isArchived) return false;
      if (activeTabFilter !== "all" && conv.type !== activeTabFilter) return false;
    }
    if (convSearchText.trim()) {
      return conv.name.toLowerCase().includes(convSearchText.toLowerCase()) ||
        conv.lastMessageText?.toLowerCase().includes(convSearchText.toLowerCase());
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 bg-slate-100 dark:bg-slate-950/60 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-xl overflow-hidden h-[750px] relative" id="messagerie-workspace">
      
      {/* LEFT COLUMN: CONVERSATION LIST */}
      <div className="md:col-span-1 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full min-w-0" id="conv-list-sidebar">
        
        {/* Header with New Action Buttons */}
        <div className="p-4 border-b border-slate-150 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center space-x-1.5">
              <MessageSquare className="h-5 w-5 text-indigo-500 shrink-0" />
              <span>Messagerie</span>
            </h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 rounded-lg cursor-pointer transition-colors"
                title="Nouveau message direct"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-600 rounded-lg cursor-pointer transition-colors"
                title="Créer Groupe"
              >
                <Users className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search Conversations Input */}
          <div className="relative">
            <Search className="absolute inset-y-0 left-2.5 h-3.5 w-3.5 text-slate-400 my-auto" />
            <input
              type="text"
              placeholder="Rechercher conversation..."
              value={convSearchText}
              onChange={e => setConvSearchText(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { id: "all", label: "Tous" },
              { id: "direct", label: "Directs" },
              { id: "group", label: "Groupes" },
              { id: "school_parent", label: "Parents-École" },
              { id: "archived", label: "Archives" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveTabFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                  activeTabFilter === f.id
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List scroll container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-1">
              <MessageSquare className="h-8 w-8 mx-auto opacity-40 text-slate-300" />
              <p className="text-xs font-semibold">Aucune conversation</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isActive = conv.id === activeConvId;
              const hasUnread = conv.unreadCount && conv.unreadCount > 0;
              
              // Find other members initials/avatars for display
              const isGroup = conv.type === "group";
              const isParent = conv.type === "school_parent";
              
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    // Clear unreads
                    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                  }}
                  className={`w-full text-left p-3 rounded-2xl flex items-center space-x-3 transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-50/70 dark:bg-indigo-950/20 border-l-4 border-indigo-600 pl-2"
                      : "hover:bg-slate-50 dark:hover:bg-slate-850 border-l-4 border-transparent"
                  }`}
                >
                  {/* Visual Avatar representative */}
                  <div className="relative shrink-0">
                    {isGroup ? (
                      <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900">
                        <Users className="h-5 w-5" />
                      </div>
                    ) : isParent ? (
                      <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900">
                        <Volume2 className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                        {conv.participants.find(p => p.id !== currentUserId)?.avatar ? (
                          <img 
                            src={conv.participants.find(p => p.id !== currentUserId)?.avatar} 
                            alt={conv.name} 
                            className="h-full w-full object-cover rounded-xl" 
                          />
                        ) : (
                          <span className="font-bold text-xs uppercase">{conv.name.charAt(0)}</span>
                        )}
                      </div>
                    )}
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Conv metadata */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <h4 className={`text-xs font-black truncate ${isActive ? "text-indigo-900 dark:text-white" : "text-slate-800 dark:text-slate-200"}`}>
                        {conv.name}
                      </h4>
                      {conv.lastMessageTime && (
                        <span className="text-[9px] text-slate-400 shrink-0 ml-1 font-mono">{conv.lastMessageTime.split(" à ")[1] || conv.lastMessageTime}</span>
                      )}
                    </div>
                    {conv.lastMessageText && (
                      <p className={`text-[10px] truncate ${hasUnread ? "font-bold text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}>
                        {conv.lastMessageText}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN CHAT SPACE */}
      <div className="md:col-span-3 flex flex-col bg-slate-50 dark:bg-slate-950 h-full relative" id="chat-messages-container">
        {activeConversation ? (
          <>
            {/* Active Conversation Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0" id="chat-header">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="shrink-0">
                  {activeConversation.type === "group" ? (
                    <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                  ) : activeConversation.type === "school_parent" ? (
                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                      {activeConversation.participants.find(p => p.id !== currentUserId)?.avatar ? (
                        <img 
                          src={activeConversation.participants.find(p => p.id !== currentUserId)?.avatar} 
                          alt={activeConversation.name} 
                          className="h-full w-full object-cover rounded-xl" 
                        />
                      ) : (
                        <span className="font-bold text-xs">{activeConversation.name.charAt(0)}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">{activeConversation.name}</h3>
                  <p className="text-[10px] text-slate-400 truncate font-semibold">
                    {activeConversation.type === "group" 
                      ? `${activeConversation.participants.length} participants : ${activeConversation.participants.map(p => p.name).join(", ")}`
                      : activeConversation.type === "school_parent"
                      ? "Canal de communication École - Parents"
                      : activeConversation.participants.find(p => p.id !== currentUserId)?.role || "Correspondant"
                    }
                  </p>
                </div>
              </div>

              {/* Action indicators and controls */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleToggleArchive(activeConversation.id)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer transition-colors"
                  title={activeConversation.isArchived ? "Désarchiver" : "Archiver"}
                >
                  <Archive className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteConversation(activeConversation.id)}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded-lg cursor-pointer transition-colors"
                  title="Supprimer la conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md font-mono">
                  Sécurisé RDC
                </div>
              </div>
            </div>

            {/* Messages area scroll container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages-scrollarea">
              {activeConversation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400 space-y-2">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 rounded-full animate-bounce">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Début de la conversation</h4>
                  <p className="text-[10px] max-w-xs leading-relaxed">Envoyez un premier message pour démarrer les échanges en toute sécurité.</p>
                </div>
              ) : (
                activeConversation.messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUserId;
                  const isSystem = msg.senderId === "system";

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center">
                        <span className="inline-block bg-slate-150 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold px-3 py-1 rounded-full border border-slate-200/50">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex items-end space-x-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {/* Avatar representation (only for inbound) */}
                      {!isMe && (
                        <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 text-[10px] font-bold">
                          {msg.senderAvatar ? (
                            <img src={msg.senderAvatar} alt={msg.senderName} className="h-full w-full object-cover" />
                          ) : (
                            msg.senderName.charAt(0)
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div className="max-w-[70%] space-y-1">
                        {!isMe && (
                          <span className="text-[9px] text-slate-400 block font-bold">
                            {msg.senderName} ({msg.senderRole})
                          </span>
                        )}
                        <div 
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? "bg-indigo-600 text-white rounded-br-none" 
                              : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/60 rounded-bl-none shadow-sm"
                          }`}
                        >
                          {/* Attachment Display */}
                          {msg.attachment && (
                            <div className="mb-2 p-2 bg-black/10 dark:bg-white/10 rounded-xl flex items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-center space-x-2 min-w-0">
                                {msg.attachment.type === "image" && <ImageIcon className="h-4 w-4 shrink-0 text-amber-300" />}
                                {msg.attachment.type === "pdf" && <FileText className="h-4 w-4 shrink-0 text-rose-300" />}
                                {msg.attachment.type === "word" && <FileText className="h-4 w-4 shrink-0 text-blue-300" />}
                                {msg.attachment.type === "excel" && <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-300" />}
                                {msg.attachment.type === "audio" && <Mic className="h-4 w-4 shrink-0 text-purple-300" />}
                                {msg.attachment.type === "video" && <Video className="h-4 w-4 shrink-0 text-teal-300" />}
                                <div className="truncate">
                                  <span className="font-bold block truncate">{msg.attachment.name}</span>
                                  <span className="text-[9px] opacity-70 block font-mono">{msg.attachment.size || "1.2 MB"}</span>
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={() => alert(`Téléchargement de ${msg.attachment?.name}...`)}
                                className="p-1 hover:bg-black/20 dark:hover:bg-white/20 rounded-lg cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}

                          {msg.text}
                        </div>
                        <div className={`flex items-center space-x-1 justify-end text-[8px] text-slate-400 font-mono`}>
                          <span>{msg.timestamp.split(" à ")[1] || msg.timestamp}</span>
                          {isMe && <CheckCheck className="h-3 w-3 text-emerald-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isRecipientTyping && (
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 animate-pulse italic">
                  <div className="h-2 w-2 bg-indigo-500 rounded-full animate-ping" />
                  <span>{activeConversation.name} est en train d'écrire...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Selected Attachment preview bar before send */}
            {selectedAttachment && (
              <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border-t border-indigo-100 dark:border-indigo-900 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4 text-indigo-600" />
                  <span>Fichier sélectionné : <strong>{selectedAttachment.name}</strong> ({selectedAttachment.type.toUpperCase()})</span>
                </div>
                <button 
                  onClick={() => setSelectedAttachment(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Input field area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0 items-center" id="chat-input-form">
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAttachmentModal(true)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-pointer transition-colors"
                  title="Joindre un fichier (Image, PDF, Audio, Vidéo...)"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Rédigez votre message ici..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm cursor-pointer shrink-0 transition-all hover:scale-105"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400 space-y-3">
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full">
              <MessageSquare className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Messagerie Scolaire RDC</h3>
            <p className="text-[10px] max-w-sm leading-relaxed">Sélectionnez une conversation existante ou créez-en une nouvelle pour échanger en temps réel.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: NEW DIRECT CHAT */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-850 shadow-2xl max-w-md w-full flex flex-col max-h-[90%] space-y-4"
            >
              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="h-4 w-4 text-indigo-500" />
                  <span>Nouveau message direct</span>
                </h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search user box */}
              <div className="relative shrink-0">
                <Search className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-400 flex items-center justify-center my-auto" />
                <input
                  type="text"
                  placeholder="Rechercher personnel, élève, ou parent..."
                  value={userSearchText}
                  onChange={e => setUserSearchText(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              {/* Users list scroll container */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {allUsers
                  .filter(u => u.name.toLowerCase().includes(userSearchText.toLowerCase()))
                  .map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleStartDirectChat(u)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-white block">{u.name}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{u.role}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        u.type === "personnel" 
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                          : u.type === "parent"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                          : "bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400"
                      }`}>
                        {u.type === "personnel" ? "Personnel" : u.type === "parent" ? "Parent" : "Élève"}
                      </span>
                    </button>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CREATE GROUP CHAT */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-850 shadow-2xl max-w-md w-full flex flex-col max-h-[90%] space-y-4"
            >
              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="h-4 w-4 text-teal-500" />
                  <span>Créer un groupe de conversation</span>
                </h3>
                <button
                  onClick={() => setShowCreateGroupModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="flex-1 flex flex-col space-y-3 min-h-0 text-xs">
                {/* Group Name input */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Nom du groupe</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Comité de Classe, Projet Pédagogique..."
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Search members input */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Sélectionner les membres ({selectedGroupParticipants.length} choisi(s))</label>
                  <div className="relative">
                    <Search className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-400 flex items-center justify-center my-auto" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom..."
                      value={userSearchText}
                      onChange={e => setUserSearchText(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Checklist of users */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-2xl border border-slate-100 dark:border-slate-850">
                  {allUsers
                    .filter(u => u.name.toLowerCase().includes(userSearchText.toLowerCase()))
                    .map(u => {
                      const isChecked = selectedGroupParticipants.includes(u.id);
                      return (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedGroupParticipants(prev => prev.filter(id => id !== u.id));
                            } else {
                              setSelectedGroupParticipants(prev => [...prev, u.id]);
                            }
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-xs ${
                            isChecked ? "bg-teal-50 dark:bg-teal-950/10" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 font-bold flex items-center justify-center shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 dark:text-white block">{u.name}</span>
                              <span className="text-[9px] text-slate-400 block font-semibold">{u.role}</span>
                            </div>
                          </div>
                          <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                            isChecked ? "bg-teal-600 border-teal-600 text-white" : "border-slate-300"
                          }`}>
                            {isChecked && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={!groupName.trim() || selectedGroupParticipants.length === 0}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl shadow transition-all cursor-pointer text-center"
                >
                  Créer le groupe
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ATTACHMENT PICKER */}
      <AnimatePresence>
        {showAttachmentModal && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-850 shadow-2xl max-w-sm w-full space-y-4"
            >
              <div className="flex justify-between items-center shrink-0">
                <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Paperclip className="h-4 w-4 text-indigo-500" />
                  <span>Joindre un document / média</span>
                </h3>
                <button
                  onClick={() => setShowAttachmentModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {[
                  { type: "image", label: "Image / Photo", icon: ImageIcon, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30", mockName: "Document_A3.png" },
                  { type: "pdf", label: "Fichier PDF", icon: FileText, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30", mockName: "Rapport_Trimestriel.pdf" },
                  { type: "word", label: "Document Word", icon: FileText, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30", mockName: "Devoir_Francais.docx" },
                  { type: "excel", label: "Fiche Excel", icon: FileSpreadsheet, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30", mockName: "Grille_Cotation.xlsx" },
                  { type: "audio", label: "Message Vocal", icon: Mic, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30", mockName: "Note_Vocale_Tuteur.mp3" },
                  { type: "video", label: "Extrait Vidéo", icon: Video, color: "text-teal-500 bg-teal-50 dark:bg-teal-950/30", mockName: "Cours_Demonstration.mp4" }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => {
                      const att: ChatAttachment = {
                        type: item.type as any,
                        name: item.mockName,
                        url: "#",
                        size: "2.4 MB"
                      };
                      setSelectedAttachment(att);
                      setShowAttachmentModal(false);
                    }}
                    className={`p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center space-y-1.5 hover:scale-102 transition-transform cursor-pointer ${item.color}`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
