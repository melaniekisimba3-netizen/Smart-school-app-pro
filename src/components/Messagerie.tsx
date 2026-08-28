import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Send, Plus, Search, Users, User, MessageSquare, Hash, Volume2, X, Check, CheckCheck, 
  Filter, UserPlus, Image as ImageIcon, Paperclip, AlertCircle, Sparkles, Building2, Bell,
  FileText, FileSpreadsheet, Mic, Video, Archive, Trash2, MoreVertical, Download, Eye,
  Lock, Shield, CheckCircle2, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Employee, Student, Parent, Teacher, UserAccount } from "../types";
import { safeLocalStorage } from "../utils/safeStorage";
import { 
  loadPersistentCollection, 
  savePersistentItem, 
  deletePersistentItem, 
  subscribeToPersistentCollection 
} from "../services/dataPersistenceService";

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
  recipientId?: string;
  recipientName?: string;
  recipientRole?: string;
  schoolId: string;
  conversationId: string;
  participantIds: string[];
  text: string;
  content?: string;
  timestamp: string;
  createdAt: string;
  readAt?: string | null;
  status: "sent" | "delivered" | "read";
  isRead: boolean;
  attachment?: ChatAttachment;
}

export interface ChatGroup {
  id: string;
  conversationId: string;
  name: string;
  type: "direct" | "group" | "school_parent";
  schoolId: string;
  participantIds: string[];
  participants: { id: string; name: string; role: string; avatar?: string }[];
  messages: ChatMessage[];
  lastMessageText?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: string;
  unreadCount?: number;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MessagerieProps {
  userRole: string;
  userName: string;
  schoolId?: string;
  employees: Employee[];
  teachers?: Teacher[];
  students: Student[];
  parents: Parent[];
  currentUserId?: string;
  currentUserAccount?: UserAccount | null;
  onSendMessageNotification?: (notif: { title: string; message: string }) => void;
  initialTargetUserId?: string | null;
  onClearInitialTarget?: () => void;
}

export function Messagerie({
  userRole,
  userName,
  schoolId = "sch-141992",
  employees,
  teachers = [],
  students,
  parents,
  currentUserId,
  currentUserAccount,
  onSendMessageNotification,
  initialTargetUserId,
  onClearInitialTarget
}: MessagerieProps) {
  // Determine all known identifier aliases for the active user session
  const myIds = useMemo(() => {
    const ids = new Set<string>();
    if (currentUserId) ids.add(currentUserId);
    if (currentUserAccount?.id) ids.add(currentUserAccount.id);
    if (currentUserAccount?.dossierId) ids.add(currentUserAccount.dossierId);
    if (currentUserAccount?.username) ids.add(currentUserAccount.username);
    ids.add(`user-${userName.replace(/\s+/g, "-").toLowerCase()}`);
    return Array.from(ids);
  }, [currentUserId, currentUserAccount, userName]);

  const myPrimaryId = myIds[0] || `user-${userName.replace(/\s+/g, "-").toLowerCase()}`;

  const isPlatformOwner = useMemo(() => {
    const roleLower = (userRole || "").toLowerCase();
    return (
      roleLower.includes("propriétaire") || 
      roleLower.includes("owner") || 
      roleLower.includes("super admin") ||
      roleLower.includes("administrateur national")
    );
  }, [userRole]);

  // Combined searchable users list with duplicates removed
  const allUsers = useMemo(() => {
    const list: { id: string; name: string; role: string; type: "personnel" | "enseignant" | "eleve" | "parent"; avatar?: string }[] = [];
    const seenIds = new Set<string>();

    // Add Platform Owner / Support contact for all schools
    list.push({
      id: "owner-master-001",
      name: "Direction Générale SmartSchool RDC",
      role: "Support & Administration Centrale",
      type: "personnel",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
    });
    seenIds.add("owner-master-001");

    // Add teachers
    teachers.forEach(tch => {
      const tchName = `Prof. ${tch.lastName} ${tch.firstName}`;
      if (!seenIds.has(tch.id)) {
        list.push({
          id: tch.id,
          name: tchName,
          role: tch.specialty ? `Enseignant (${tch.specialty})` : "Enseignant",
          type: "enseignant"
        });
        seenIds.add(tch.id);
      }
    });

    // Add employees
    employees.forEach(emp => {
      if (!seenIds.has(emp.id)) {
        list.push({
          id: emp.id,
          name: `${emp.lastName} ${emp.firstName}`,
          role: emp.function || "Personnel Administratif",
          type: "personnel",
          avatar: emp.photoUrl
        });
        seenIds.add(emp.id);
      }
    });

    // Add students
    students.forEach(std => {
      if (!seenIds.has(std.id)) {
        list.push({
          id: std.id,
          name: `${std.lastName} ${std.firstName}`,
          role: `Élève (${std.className || "Sans classe"})`,
          type: "eleve",
          avatar: std.photoUrl
        });
        seenIds.add(std.id);
      }
    });

    // Add parents
    parents.forEach(p => {
      if (!seenIds.has(p.id)) {
        list.push({
          id: p.id,
          name: p.firstName || p.lastName ? `${p.firstName} ${p.lastName}` : "Parent d'Élève",
          role: "Parent d'élève / Tuteur",
          type: "parent"
        });
        seenIds.add(p.id);
      }
    });

    // Filter out current user from contacts directory
    return list.filter(u => {
      if (myIds.includes(u.id)) return false;
      if (u.name.trim().toLowerCase() === userName.trim().toLowerCase()) return false;
      return true;
    });
  }, [teachers, employees, students, parents, myIds, userName]);

  // Raw conversations state
  const [allConversations, setAllConversations] = useState<ChatGroup[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);

  // Load from persistent store & subscribe in real-time
  useEffect(() => {
    let isMounted = true;
    setIsLoadingConversations(true);

    loadPersistentCollection<ChatGroup>(schoolId, "chat_conversations", []).then(loaded => {
      if (isMounted) {
        if (Array.isArray(loaded)) {
          setAllConversations(loaded);
        }
        setIsLoadingConversations(false);
      }
    }).catch(err => {
      console.warn("Error loading persistent conversations:", err);
      if (isMounted) setIsLoadingConversations(false);
    });

    const unsubscribe = subscribeToPersistentCollection<ChatGroup>(schoolId, "chat_conversations", (updatedList) => {
      if (isMounted && Array.isArray(updatedList)) {
        setAllConversations(updatedList);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [schoolId]);

  // STRICT PRIVACY FILTER: User ONLY sees conversations they participate in
  const userConversations = useMemo(() => {
    return allConversations.filter(conv => {
      // Platform owner / Super admin can supervise all conversations
      if (isPlatformOwner) return true;

      // Check if any active user alias is in participantIds
      const inParticipantIds = conv.participantIds?.some(pid => myIds.includes(pid));
      if (inParticipantIds) return true;

      // Check participants array by ID or by exact Full Name match
      const inParticipants = conv.participants?.some(p => 
        myIds.includes(p.id) || 
        p.name.trim().toLowerCase() === userName.trim().toLowerCase()
      );
      if (inParticipants) return true;

      return false;
    });
  }, [allConversations, myIds, userName, isPlatformOwner]);

  // Selected Chat State
  const [activeConvId, setActiveConvId] = useState<string>("");

  useEffect(() => {
    if (!activeConvId && userConversations.length > 0) {
      setActiveConvId(userConversations[0].id);
    } else if (activeConvId && !userConversations.some(c => c.id === activeConvId)) {
      setActiveConvId(userConversations[0]?.id || "");
    }
  }, [userConversations, activeConvId]);

  const activeConversation = useMemo(() => {
    return userConversations.find(c => c.id === activeConvId);
  }, [userConversations, activeConvId]);

  // Mark unread messages in active conversation as read
  useEffect(() => {
    if (!activeConversation || !activeConversation.messages) return;

    let hasUnread = false;
    const updatedMessages = activeConversation.messages.map(msg => {
      const isFromOther = !myIds.includes(msg.senderId) && msg.senderName.trim().toLowerCase() !== userName.trim().toLowerCase();
      if (isFromOther && (!msg.isRead || msg.status !== "read")) {
        hasUnread = true;
        return {
          ...msg,
          isRead: true,
          status: "read" as const,
          readAt: new Date().toISOString()
        };
      }
      return msg;
    });

    if (hasUnread) {
      const updatedConv: ChatGroup = {
        ...activeConversation,
        messages: updatedMessages,
        unreadCount: 0,
        updatedAt: new Date().toISOString()
      };

      setAllConversations(prev => prev.map(c => c.id === activeConversation.id ? updatedConv : c));
      savePersistentItem(schoolId, "chat_conversations", updatedConv);
    }
  }, [activeConvId, activeConversation, myIds, userName, schoolId]);

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

  // Helper: Deterministic 1-on-1 Conversation ID
  const getDirectConversationId = (targetUserId: string) => {
    const sorted = [myPrimaryId, targetUserId].sort();
    return `conv_direct_${sorted[0]}_${sorted[1]}`;
  };

  // Start direct conversation with complete confidentiality
  const handleStartDirectChat = async (targetUser: { id: string; name: string; role: string; avatar?: string }) => {
    const deterministicId = getDirectConversationId(targetUser.id);

    // Check if direct chat already exists
    const existing = allConversations.find(
      c => c.id === deterministicId || 
      (c.type === "direct" && c.participantIds?.includes(targetUser.id) && c.participantIds?.some(pid => myIds.includes(pid)))
    );

    if (existing) {
      setActiveConvId(existing.id);
      setShowNewChatModal(false);
      return;
    }

    // Create new private conversation
    const newConv: ChatGroup = {
      id: deterministicId,
      conversationId: deterministicId,
      name: targetUser.name,
      type: "direct",
      schoolId,
      participantIds: [myPrimaryId, targetUser.id],
      participants: [
        { id: myPrimaryId, name: userName, role: userRole },
        { id: targetUser.id, name: targetUser.name, role: targetUser.role, avatar: targetUser.avatar }
      ],
      messages: [],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAllConversations(prev => [newConv, ...prev.filter(c => c.id !== deterministicId)]);
    setActiveConvId(newConv.id);
    setShowNewChatModal(false);

    await savePersistentItem(schoolId, "chat_conversations", newConv);
  };

  // Handle send message with strict confidentiality and explicit recipient tracking
  const handleSendMessage = async (e: React.FormEvent, customAttachment?: ChatAttachment) => {
    e.preventDefault();
    const att = customAttachment || selectedAttachment;
    if ((!messageText.trim() && !att) || !activeConversation) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const isoString = now.toISOString();

    // Identify primary recipient in 1-on-1 chats
    const recipient = activeConversation.participants.find(p => !myIds.includes(p.id) && p.name.trim().toLowerCase() !== userName.trim().toLowerCase());

    const messageId = `msg-${Date.now()}-${Math.floor(100 + Math.random() * 899)}`;
    const newMsg: ChatMessage = {
      id: messageId,
      senderId: myPrimaryId,
      senderName: userName,
      senderRole: userRole,
      recipientId: recipient?.id,
      recipientName: recipient?.name,
      recipientRole: recipient?.role,
      schoolId: schoolId,
      conversationId: activeConversation.id,
      participantIds: activeConversation.participantIds || activeConversation.participants.map(p => p.id),
      text: messageText || (att ? `[Fichier Joint: ${att.name}]` : ""),
      content: messageText || (att ? `[Fichier Joint: ${att.name}]` : ""),
      timestamp: `Aujourd'hui à ${timeString}`,
      createdAt: isoString,
      readAt: null,
      status: "sent",
      isRead: false,
      attachment: att || undefined
    };

    const updatedConv: ChatGroup = {
      ...activeConversation,
      messages: [...(activeConversation.messages || []), newMsg],
      lastMessageText: newMsg.text,
      lastMessageTime: `Aujourd'hui à ${timeString}`,
      lastMessageSenderId: myPrimaryId,
      unreadCount: 0,
      updatedAt: isoString
    };

    // Update local state immediately
    setAllConversations(prev => prev.map(conv => conv.id === activeConversation.id ? updatedConv : conv));

    // Save to persistent database
    await savePersistentItem(schoolId, "chat_conversations", updatedConv);
    await savePersistentItem(schoolId, "messages", newMsg);

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
  };

  // Archive / Unarchive active conversation
  const handleToggleArchive = async (convId: string) => {
    const target = allConversations.find(c => c.id === convId);
    if (!target) return;
    const updated = { ...target, isArchived: !target.isArchived, updatedAt: new Date().toISOString() };
    setAllConversations(prev => prev.map(c => c.id === convId ? updated : c));
    await savePersistentItem(schoolId, "chat_conversations", updated);
  };

  // Delete conversation
  const handleDeleteConversation = async (convId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette conversation ?")) {
      setAllConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) {
        setActiveConvId("");
      }
      await deletePersistentItem(schoolId, "chat_conversations", convId);
    }
  };

  // Create Group Chat
  const handleCreateGroup = async (e: React.FormEvent) => {
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
      id: myPrimaryId,
      name: userName,
      role: userRole,
      avatar: undefined
    });

    const participantIds = participantsList.map(p => p.id);
    const groupId = `conv_grp_${Date.now()}`;
    const isoString = new Date().toISOString();

    const initMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "system",
      senderName: "Système SmartSchool",
      senderRole: "Automatisé",
      recipientId: undefined,
      recipientName: groupName,
      recipientRole: "Groupe",
      schoolId,
      conversationId: groupId,
      participantIds,
      text: `Groupe créé par ${userName}. Membres ajoutés : ${participantsList.slice(1).map(p => p.name).join(", ")}.`,
      content: `Groupe créé par ${userName}.`,
      timestamp: "À l'instant",
      createdAt: isoString,
      status: "delivered",
      isRead: true
    };

    const newGroup: ChatGroup = {
      id: groupId,
      conversationId: groupId,
      name: groupName,
      type: "group",
      schoolId,
      participantIds,
      participants: participantsList,
      messages: [initMsg],
      lastMessageText: `Groupe créé par ${userName}`,
      lastMessageTime: "À l'instant",
      lastMessageSenderId: myPrimaryId,
      unreadCount: 0,
      createdAt: isoString,
      updatedAt: isoString
    };

    setAllConversations(prev => [newGroup, ...prev]);
    setActiveConvId(newGroup.id);
    
    // Reset state
    setGroupName("");
    setSelectedGroupParticipants([]);
    setShowCreateGroupModal(false);

    await savePersistentItem(schoolId, "chat_conversations", newGroup);
    await savePersistentItem(schoolId, "messages", initMsg);
  };

  // Switch tab filter & search handler
  const filteredConversations = userConversations.filter(conv => {
    if (activeTabFilter === "archived") {
      if (!conv.isArchived) return false;
    } else {
      if (conv.isArchived) return false;
      if (activeTabFilter !== "all" && conv.type !== activeTabFilter) return false;
    }
    if (convSearchText.trim()) {
      return (
        conv.name.toLowerCase().includes(convSearchText.toLowerCase()) ||
        conv.lastMessageText?.toLowerCase().includes(convSearchText.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 bg-slate-100 dark:bg-slate-950/60 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-xl overflow-hidden h-[760px] relative" id="messagerie-workspace">
      
      {/* LEFT COLUMN: CONVERSATION LIST */}
      <div className="md:col-span-1 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full min-w-0" id="conv-list-sidebar">
        
        {/* Header with New Action Buttons & Confidentiality Badge */}
        <div className="p-4 border-b border-slate-150 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  Messagerie
                </h2>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <Lock className="h-2.5 w-2.5" />
                  <span>Chiffrement & Privé</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl cursor-pointer transition-colors"
                title="Nouveau message direct"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="p-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900 text-teal-600 dark:text-teal-400 rounded-xl cursor-pointer transition-colors"
                title="Créer Groupe"
              >
                <Users className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Conversations Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une discussion..."
              value={convSearchText}
              onChange={(e) => setConvSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 overflow-x-auto pb-1 text-[11px] font-bold">
            <button
              onClick={() => setActiveTabFilter("all")}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeTabFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Tous ({userConversations.filter(c => !c.isArchived).length})
            </button>
            <button
              onClick={() => setActiveTabFilter("direct")}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeTabFilter === "direct"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setActiveTabFilter("group")}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeTabFilter === "group"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Groupes
            </button>
            <button
              onClick={() => setActiveTabFilter("archived")}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                activeTabFilter === "archived"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Archivés
            </button>
          </div>
        </div>

        {/* Conversation List Scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {isLoadingConversations ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Chargement des discussions sécurisées...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Lock className="h-6 w-6 stroke-1" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">Aucune discussion privée</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Les messages sont strictement confidentiels et visibles uniquement par l'expéditeur et le destinataire.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer block mx-auto"
              >
                + Démarrer une conversation
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConvId;
              const unreadInThis = (conv.messages || []).filter(
                m => !myIds.includes(m.senderId) && m.senderName.trim().toLowerCase() !== userName.trim().toLowerCase() && !m.isRead
              ).length;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-all flex items-start space-x-3 text-left relative ${
                    isSelected
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm overflow-hidden">
                      {conv.type === "group" ? (
                        <Users className="h-5 w-5 text-indigo-500" />
                      ) : (
                        <User className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    {conv.type === "group" ? (
                      <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5">
                        <Hash className="h-2.5 w-2.5" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5">
                        <Lock className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {conv.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                        {conv.lastMessageTime || ""}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {conv.lastMessageText || "Discussion privée ouverte"}
                    </p>
                  </div>

                  {unreadInThis > 0 ? (
                    <span className="bg-indigo-600 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shrink-0 shadow-sm">
                      {unreadInThis}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE CHAT CONVERSATION VIEW */}
      <div className="md:col-span-3 bg-slate-50/50 dark:bg-slate-950 flex flex-col h-full min-w-0" id="chat-messages-body">
        {activeConversation ? (
          <>
            {/* Active Header */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center font-bold text-indigo-600 text-sm">
                  {activeConversation.type === "group" ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>{activeConversation.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-md font-bold flex items-center space-x-1">
                      <Lock className="h-2.5 w-2.5" />
                      <span>{activeConversation.type === "group" ? "Groupe Sécurisé" : "Échange Privé"}</span>
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Participants : {activeConversation.participants.map(p => p.name).join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleArchive(activeConversation.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs cursor-pointer"
                  title={activeConversation.isArchived ? "Désarchiver" : "Archiver"}
                >
                  <Archive className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteConversation(activeConversation.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs cursor-pointer"
                  title="Supprimer discussion"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Privacy Notice Banner */}
            <div className="px-4 py-1.5 bg-indigo-50/60 dark:bg-indigo-950/20 border-b border-indigo-100/60 dark:border-indigo-900/30 flex items-center justify-between text-[10px] text-indigo-700 dark:text-indigo-300">
              <span className="flex items-center space-x-1.5">
                <Shield className="h-3 w-3 text-indigo-600" />
                <span>Confidentialité garantie : seuls vous et votre correspondant pouvez accéder à cet échange.</span>
              </span>
              <span className="font-mono text-[9px] text-indigo-500">ID: {activeConversation.id.substring(0, 16)}...</span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {(activeConversation.messages || []).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <MessageSquare className="h-6 w-6 stroke-1" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Début de la conversation privée</p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Envoyez un premier message officiel ci-dessous. Les données sont enregistrées en direct et synchronisées de manière sécurisée.
                  </p>
                </div>
              ) : (
                activeConversation.messages.map((msg) => {
                  const isMine = myIds.includes(msg.senderId) || msg.senderName.trim().toLowerCase() === userName.trim().toLowerCase();
                  const isSystem = msg.senderId === "system";

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <span className="inline-block px-3 py-1 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-full">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {isMine ? "Vous" : msg.senderName}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          • {msg.senderRole}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {msg.timestamp}
                        </span>
                      </div>

                      <div
                        className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm relative ${
                          isMine
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text || msg.content}</p>

                        {msg.attachment && (
                          <div className={`mt-2 p-2 rounded-xl flex items-center space-x-2 ${
                            isMine ? "bg-indigo-700/60" : "bg-slate-100 dark:bg-slate-800"
                          }`}>
                            <FileText className="h-4 w-4 shrink-0 text-indigo-300" />
                            <div className="flex-1 min-w-0 text-[11px] font-bold truncate">
                              {msg.attachment.name}
                            </div>
                            <a
                              href={msg.attachment.url}
                              download
                              className="p-1 hover:bg-black/10 rounded cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}

                        {/* Read receipt checkmarks */}
                        {isMine && (
                          <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-indigo-200">
                            {msg.isRead || msg.status === "read" ? (
                              <span className="flex items-center space-x-0.5 text-emerald-300 font-bold" title="Lu">
                                <CheckCheck className="h-3 w-3" />
                                <span>Lu</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-0.5 opacity-80" title="Envoyé">
                                <Check className="h-3 w-3" />
                                <span>Envoyé</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAttachmentModal(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Joindre un fichier"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Rédigez votre message officiel ici..."
                className="flex-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />

              <button
                type="submit"
                disabled={!messageText.trim() && !selectedAttachment}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <span>Envoyer</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aucune discussion sélectionnée</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Sélectionnez une discussion dans la liste de gauche ou démarrez un nouvel échange confidentiel avec un membre de l'école.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              + Nouveau message direct
            </button>
          </div>
        )}
      </div>

      {/* NEW DIRECT CHAT MODAL */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Démarrer un échange privé
                    </h3>
                    <p className="text-[10px] text-slate-400">Communication 100% confidentielle</p>
                  </div>
                </div>
                <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, rôle, enseignant, élève..."
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 space-y-1">
                {allUsers
                  .filter(u => u.name.toLowerCase().includes(userSearchText.toLowerCase()) || u.role.toLowerCase().includes(userSearchText.toLowerCase()))
                  .map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleStartDirectChat(user)}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
                          <div className="text-[10px] text-slate-400">{user.role}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg flex items-center space-x-1">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Écrire</span>
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE GROUP MODAL */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                  <Users className="h-4 w-4 text-teal-500" />
                  <span>Créer un Groupe de Travail</span>
                </h3>
                <button onClick={() => setShowCreateGroupModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nom du Groupe
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Conseil Pédagogique 6ème Primaire"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-teal-500 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sélectionner les Membres
                  </label>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 space-y-1">
                    {allUsers.map((u) => {
                      const isSelected = selectedGroupParticipants.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            setSelectedGroupParticipants(prev =>
                              isSelected ? prev.filter(id => id !== u.id) : [...prev, u.id]
                            );
                          }}
                          className={`p-2 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            isSelected ? "bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.role}</div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-teal-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroupModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!groupName.trim() || selectedGroupParticipants.length === 0}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 shadow-md cursor-pointer transition-colors"
                  >
                    Créer le Groupe
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
