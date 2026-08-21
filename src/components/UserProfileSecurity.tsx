import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Smartphone,
  Mail,
  HelpCircle,
  Laptop,
  Globe,
  Clock,
  LogOut,
  RefreshCw,
  QrCode,
  Sparkles,
  ShieldAlert,
  Check,
  UserCheck,
  Copy,
  History,
  Sliders,
  Send,
  Camera,
  Image as ImageIcon,
  Trash2,
  Save,
  User,
  Fingerprint,
  Building,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { safeLocalStorage } from "../utils/safeStorage";
import { PhotoUploadField } from "./common/PhotoUploadField";
import { saveUserProfilePhoto, getStoredProfilePhoto } from "../services/userPhotoService";
import { UserAccount } from "../types";

interface SecurityHistoryEntry {
  id: string;
  date: string;
  time: string;
  ipAddress: string;
  device: string;
  location: string;
  method: string;
  status: "success" | "failed" | "warning";
  details: string;
}

interface UserProfileSecurityProps {
  userName?: string;
  userRole?: string;
  userEmail?: string;
  userPhone?: string;
  schoolName?: string;
  schoolId?: string;
  currentUserId?: string;
  currentUserAccount?: UserAccount | null;
  userPhotoUrl?: string;
  onAuditLog?: (action: string, details: string) => void;
  onUpdateProfilePhoto?: (newPhotoUrl: string) => void;
}

export function UserProfileSecurity({
  userName = "Utilisateur SmartSchool",
  userRole = "Préfet des études",
  userEmail = "utilisateur@smartschool.cd",
  userPhone = "+243 812 345 678",
  schoolName = "Établissement Scolaire RDC",
  schoolId = "sch-141992",
  currentUserId,
  currentUserAccount,
  userPhotoUrl,
  onAuditLog,
  onUpdateProfilePhoto
}: UserProfileSecurityProps) {
  // Déterminer l'identifiant unique du compte (ID persistant du compte ou du dossier)
  const targetAccountId = useMemo(() => {
    return currentUserAccount?.id || 
           currentUserAccount?.dossierId || 
           currentUserId || 
           (currentUserAccount?.username ? `ACC-${currentUserAccount.username}` : `USR-${userName.replace(/\s+/g, "_").toLowerCase()}`);
  }, [currentUserAccount, currentUserId, userName]);

  // État de la photo de profil avec récupération résiliente
  const [profilePhoto, setProfilePhoto] = useState<string>(() => {
    return getStoredProfilePhoto(targetAccountId, userPhotoUrl || currentUserAccount?.photoUrl || "");
  });
  
  const [stagedPhoto, setStagedPhoto] = useState<string>(profilePhoto);
  const [isSavingPhoto, setIsSavingPhoto] = useState<boolean>(false);

  // Synchroniser si la prop change
  useEffect(() => {
    if (userPhotoUrl && userPhotoUrl !== profilePhoto) {
      setProfilePhoto(userPhotoUrl);
      setStagedPhoto(userPhotoUrl);
    }
  }, [userPhotoUrl]);

  // Read Owner Security Permissions Matrix from localStorage
  const ownerSecurityPerms = useMemo(() => {
    try {
      const saved = safeLocalStorage.getItem("ss_owner_security_permissions");
      if (saved) {
        const matrix = JSON.parse(saved);
        if (matrix && matrix[userRole]) {
          return matrix[userRole];
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Default: all true
    return {
      canChangePassword: true,
      canResetPassword: true,
      canEditSecurityQuestions: true,
      canEditEmail: true,
      canEditPhone: true,
      canEnable2FA: true,
      canManageDevices: true,
      canLogoutAllDevices: true
    };
  }, [userRole]);

  // Read Owner Security Policy parameters
  const ownerPolicy = useMemo(() => {
    try {
      const saved = safeLocalStorage.getItem("ss_owner_security_policy");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    };
  }, []);

  // Active sub-tab inside security module
  const [activeTab, setActiveTab] = useState<"photo" | "password" | "recovery" | "twofa" | "devices" | "history">("photo");

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Feedback / Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Security Questions State
  const [q1, setQ1] = useState("Nom de votre premier instituteur du primaire ?");
  const [a1, setA1] = useState("Monsieur Mbuyi");
  const [q2, setQ2] = useState("Ville de naissance de votre mère ?");
  const [a2, setA2] = useState("Matadi");
  const [q3, setQ3] = useState("Votre plat congolais préféré ?");
  const [a3, setA3] = useState("Poulet Moambe");
  const [isQuestionsSaved, setIsQuestionsSaved] = useState(true);

  // SMS / Email Reset Simulation State
  const [resetMethod, setResetMethod] = useState<"sms" | "email">("email");
  const [resetStep, setResetStep] = useState<"input" | "code" | "new_password" | "success">("input");
  const [resetContact, setResetContact] = useState(userEmail);
  const [sentCode, setSentCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFAMethod, setTwoFAMethod] = useState<"authenticator" | "sms">("authenticator");
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Active Connected Devices
  const [activeSessions, setActiveSessions] = useState([
    {
      id: "sess-1",
      deviceName: "Station de travail (Navigateur Web)",
      location: "RDC (Session Active)",
      ipAddress: "197.243.2.12",
      lastActive: "En cours (Session Actuelle)",
      isCurrent: true
    }
  ]);

  // Security History Logs
  const [securityHistory, setSecurityHistory] = useState<SecurityHistoryEntry[]>(() => {
    const saved = safeLocalStorage.getItem(`ss_sec_history_${userRole}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "hist-1",
        date: new Date().toLocaleDateString("fr-FR"),
        time: new Date().toLocaleTimeString("fr-FR"),
        ipAddress: "197.243.2.12",
        device: "Navigateur Web Sécurisé",
        location: "RDC",
        method: "Profil -> Sécurité",
        status: "success",
        details: "Ouverture de la session de sécurité du compte."
      }
    ];
  });

  // Save history to localStorage
  useEffect(() => {
    safeLocalStorage.setItem(`ss_sec_history_${userRole}`, JSON.stringify(securityHistory));
  }, [securityHistory, userRole]);

  // Handle Toast popup
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Add history entry helper
  const addSecurityHistory = (method: string, details: string, status: "success" | "failed" | "warning" = "success") => {
    const newEntry: SecurityHistoryEntry = {
      id: `hist-${Date.now()}`,
      date: new Date().toLocaleDateString("fr-FR"),
      time: new Date().toLocaleTimeString("fr-FR"),
      ipAddress: "197.243.2.12",
      device: "Station Client (Navigateur)",
      location: "RDC",
      method,
      status,
      details
    };
    setSecurityHistory(prev => [newEntry, ...prev]);

    if (onAuditLog) {
      onAuditLog(method, details);
    }
  };

  // ==========================================
  // GESTION DE LA PHOTO DE PROFIL PERSISTANTE
  // ==========================================
  const handleSavePhoto = async () => {
    setIsSavingPhoto(true);
    try {
      const result = await saveUserProfilePhoto({
        targetId: targetAccountId,
        photoUrl: stagedPhoto,
        schoolId: schoolId || "sch-141992",
        role: userRole,
        actorName: userName
      });

      setProfilePhoto(stagedPhoto);
      if (onUpdateProfilePhoto) {
        onUpdateProfilePhoto(stagedPhoto);
      }

      addSecurityHistory(
        "Mise à jour Photo de Profil",
        `Nouvelle photo de profil enregistrée de manière persistante pour le compte ID [${targetAccountId}].`
      );

      showToast(result.message || "Votre photo de profil a été enregistrée avec succès !");
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'enregistrement de la photo.", "error");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleCancelPhotoChange = () => {
    setStagedPhoto(profilePhoto);
    showToast("Modifications de la photo annulées.");
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer votre photo de profil ?")) return;

    setIsSavingPhoto(true);
    try {
      await saveUserProfilePhoto({
        targetId: targetAccountId,
        photoUrl: "",
        schoolId: schoolId || "sch-141992",
        role: userRole,
        actorName: userName
      });

      setStagedPhoto("");
      setProfilePhoto("");
      if (onUpdateProfilePhoto) {
        onUpdateProfilePhoto("");
      }

      addSecurityHistory(
        "Suppression Photo de Profil",
        `Photo de profil retirée pour le compte ID [${targetAccountId}].`
      );

      showToast("Photo de profil supprimée avec succès.");
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la suppression.", "error");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Password strength calculation
  const passwordCriteria = useMemo(() => {
    const minLen = newPassword.length >= (ownerPolicy.minLength || 8);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

    let score = 0;
    if (minLen) score += 25;
    if (hasUpper && hasLower) score += 25;
    if (hasNumber) score += 25;
    if (hasSpecial) score += 25;

    return {
      minLen,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isMatch,
      score
    };
  }, [newPassword, confirmPassword, ownerPolicy]);

  const strengthLabel = useMemo(() => {
    if (newPassword.length === 0) return { label: "Aucun", color: "bg-slate-200 text-slate-500" };
    if (passwordCriteria.score <= 25) return { label: "Très Faible", color: "bg-red-500 text-white" };
    if (passwordCriteria.score <= 50) return { label: "Moyen", color: "bg-amber-500 text-white" };
    if (passwordCriteria.score <= 75) return { label: "Fort", color: "bg-blue-500 text-white" };
    return { label: "Excellente & Sécurisée", color: "bg-emerald-600 text-white" };
  }, [newPassword.length, passwordCriteria.score]);

  // Submit Password Change Form
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ownerSecurityPerms.canChangePassword) {
      showToast("La modification de mot de passe est désactivée pour votre rôle par le Propriétaire.", "error");
      return;
    }

    if (!currentPassword) {
      showToast("Veuillez saisir votre mot de passe actuel.", "error");
      return;
    }

    if (!passwordCriteria.minLen) {
      showToast(`Le mot de passe doit contenir au moins ${ownerPolicy.minLength || 8} caractères.`, "error");
      return;
    }

    if (ownerPolicy.requireUppercase && !passwordCriteria.hasUpper) {
      showToast("Le mot de passe doit contenir au moins une lettre majuscule.", "error");
      return;
    }

    if (ownerPolicy.requireNumbers && !passwordCriteria.hasNumber) {
      showToast("Le mot de passe doit contenir au moins un chiffre.", "error");
      return;
    }

    if (ownerPolicy.requireSpecialChars && !passwordCriteria.hasSpecial) {
      showToast("Le mot de passe doit contenir au moins un caractère spécial (@, #, $, %, etc.).", "error");
      return;
    }

    if (!passwordCriteria.isMatch) {
      showToast("Les deux nouveaux mots de passe ne correspondent pas.", "error");
      return;
    }

    // Success update - save globally
    try {
      const savedOwnerData = safeLocalStorage.getItem("ss_platform_owner_data");
      if (savedOwnerData) {
        const ownerObj = JSON.parse(savedOwnerData);
        ownerObj.password = newPassword;
        safeLocalStorage.setItem("ss_platform_owner_data", JSON.stringify(ownerObj));
      } else if (userRole.toLowerCase().includes("propriétaire") || userRole.toLowerCase().includes("promoteur")) {
        const ownerObj = {
          name: userName || "Ir IT Fred Kalonda",
          email: userEmail || "fredtech37@gmail.com",
          phone: userPhone || "0994202940",
          password: newPassword,
          masterKey: "KEY-SS-RDC-2026-OWNER"
        };
        safeLocalStorage.setItem("ss_platform_owner_data", JSON.stringify(ownerObj));
      }
      safeLocalStorage.setItem(`ss_user_password_${userRole}`, newPassword);
    } catch (err) {
      console.error(err);
    }

    addSecurityHistory(
      "Changement de Mot de Passe",
      "Mise à jour réussie du mot de passe principal du compte depuis la section Profil -> Sécurité."
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    showToast("Votre mot de passe a été modifié et sauvegardé avec succès !");
  };

  // Trigger SMS/Email reset code
  const handleSendResetCode = () => {
    if (!ownerSecurityPerms.canResetPassword) {
      showToast("La réinitialisation de mot de passe est désactivée par le Propriétaire.", "error");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setResetStep("code");

    addSecurityHistory(
      `Demande Réinitialisation (${resetMethod.toUpperCase()})`,
      `Code de vérification [${code}] généré et envoyé à ${resetContact}.`
    );

    showToast(`Code de sécurité à 6 chiffres envoyé à ${resetContact} (Code démo: ${code})`);
  };

  // Verify Reset Code
  const handleVerifyCode = () => {
    if (inputCode !== sentCode && inputCode !== "123456") {
      showToast("Code de vérification incorrect. Réessayez ou utilisez '123456'.", "error");
      return;
    }
    setResetStep("new_password");
    showToast("Code vérifié ! Veuillez saisir votre nouveau mot de passe.");
  };

  // Submit Reset Password
  const handleSaveResetPassword = () => {
    if (resetNewPassword.length < 8) {
      showToast("Le nouveau mot de passe doit comporter au moins 8 caractères.", "error");
      return;
    }

    addSecurityHistory(
      `Réinitialisation Réussie (${resetMethod.toUpperCase()})`,
      "Mot de passe réinitialisé avec succès via code temporaire."
    );

    setResetStep("success");
    showToast("Mot de passe réinitialisé avec succès !");
  };

  // Save Security Questions
  const handleSaveQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerSecurityPerms.canEditSecurityQuestions) {
      showToast("La modification des questions de sécurité est désactivée par le Propriétaire.", "error");
      return;
    }

    setIsQuestionsSaved(true);
    addSecurityHistory(
      "Mise à jour Questions Secrètes",
      "Les 3 questions secrètes de récupération ont été mises à jour."
    );
    showToast("Vos questions de sécurité ont été mises à jour avec succès !");
  };

  // Terminate All Other Sessions
  const handleLogoutAllDevices = () => {
    if (!ownerSecurityPerms.canLogoutAllDevices) {
      showToast("La déconnexion à distance est désactivée par le Propriétaire.", "error");
      return;
    }

    if (window.confirm("Voulez-vous vraiment déconnecter tous les autres appareils distants ?")) {
      setActiveSessions(prev => prev.filter(s => s.isCurrent));
      addSecurityHistory(
        "Déconnexion Globale des Appareils",
        "Clôture forcée de toutes les sessions actives sur les smartphones, tablettes et ordinateurs distants."
      );
      showToast("Toutes les sessions distantes ont été fermées avec succès.");
    }
  };

  const hasUnsavedPhoto = stagedPhoto !== profilePhoto;

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto" id="user-profile-security">
      
      {/* HEADER BANNER AVEC PHOTO OFFICIELLE EN TEMPS RÉEL */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Bloc Avatar & Identité */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            
            {/* Photo Avatar interactive */}
            <div className="relative group shrink-0">
              <div 
                onClick={() => setActiveTab("photo")}
                className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border-2 border-indigo-400/80 bg-slate-800 shadow-md overflow-hidden flex items-center justify-center cursor-pointer relative transition-transform hover:scale-105"
                title="Cliquer pour modifier votre photo de profil"
              >
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt={userName} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-brand-blue to-indigo-600 flex items-center justify-center font-black text-2xl text-white">
                    {userName ? userName.slice(0, 2).toUpperCase() : "SS"}
                  </div>
                )}

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
                  <Camera className="h-4 w-4 mb-0.5" />
                  <span>Modifier</span>
                </div>
              </div>

              {/* Statut actif badge */}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-xs text-white text-[9px] font-black" title="Compte Actif">
                ✓
              </div>
            </div>

            {/* Infos du compte */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-brand-blue text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Shield className="h-3.5 w-3.5" /> MON ESPACE PROFIL & SÉCURITÉ
                </span>
                <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-500/40 font-mono text-[10px] px-2.5 py-0.5 rounded-md font-bold">
                  ID: {targetAccountId}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                <span>{userName}</span>
                <UserCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              </h2>

              <p className="text-xs text-slate-300 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="text-amber-300 font-bold">Rôle : {userRole}</span>
                <span>•</span>
                <span className="text-slate-400">{userEmail}</span>
              </p>
            </div>
          </div>

          {/* Badge Établissement */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-xs font-mono shrink-0 text-center md:text-right space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center md:justify-end gap-1">
              <Building className="h-3 w-3" /> Établissement
            </div>
            <div className="font-bold text-amber-300 truncate max-w-[220px]">{schoolName}</div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center md:justify-end gap-1">
              <Sparkles className="h-3 w-3" /> Chiffrement Zéro-Trust RDC
            </div>
          </div>

        </div>
      </div>

      {/* TOAST FEEDBACK NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border shadow-lg flex items-center justify-between text-xs font-bold ${
              toastMsg.type === "error"
                ? "bg-red-900/90 text-red-200 border-red-500"
                : "bg-emerald-900/90 text-emerald-200 border-emerald-500"
            }`}
          >
            <div className="flex items-center space-x-2">
              {toastMsg.type === "error" ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-white hover:opacity-80 cursor-pointer">
              <XCircle className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-TAB NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* TAB 1: PHOTO DE PROFIL */}
        <button
          type="button"
          onClick={() => setActiveTab("photo")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === "photo"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          id="tab-photo-profil"
        >
          <Camera className="h-4 w-4" />
          <span>Modifier ma photo de profil</span>
          {hasUnsavedPhoto && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        {/* TAB 2: MOT DE PASSE */}
        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === "password"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          id="tab-mot-de-passe"
        >
          <KeyRound className="h-4 w-4" />
          <span>Sécurité & Mot de passe</span>
        </button>

        {/* TAB 3: RÉCUPÉRATION */}
        <button
          type="button"
          onClick={() => setActiveTab("recovery")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === "recovery"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          id="tab-recuperation"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Récupération & Questions</span>
        </button>

        {/* TAB 4: 2FA */}
        <button
          type="button"
          onClick={() => setActiveTab("twofa")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === "twofa"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          id="tab-2fa"
        >
          <QrCode className="h-4 w-4" />
          <span>Authentification 2FA</span>
        </button>

        {/* TAB 5: APPAREILS */}
        <button
          type="button"
          onClick={() => setActiveTab("devices")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === "devices"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          id="tab-appareils"
        >
          <Laptop className="h-4 w-4" />
          <span>Appareils Connectés</span>
        </button>

        {/* TAB 6: HISTORIQUE */}
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === "history"
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          id="tab-historique"
        >
          <History className="h-4 w-4" />
          <span>Journal d'Audit</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: MODIFIER MA PHOTO DE PROFIL                   */}
      {/* ======================================================== */}
      {activeTab === "photo" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xs">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-base uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Camera className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Gestion de la Photo de Profil & Identité Numérique</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personnalisez votre photo de profil. Choisissez une image depuis la galerie de votre téléphone ou de votre ordinateur.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                Compte ID: {targetAccountId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colonne gauche : Sélecteur de Photo optimisé */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <PhotoUploadField
                  label="Sélectionner votre photo de profil"
                  value={stagedPhoto}
                  onChange={(newPhoto) => setStagedPhoto(newPhoto)}
                  aspectRatio="square"
                  previewSize="lg"
                  helperText="Cliquez sur le bouton ci-dessous pour parcourir la galerie de votre appareil (JPG, PNG, WEBP, HEIC). Votre photo est compressée automatiquement en haute fidélité."
                  allowDelete={true}
                  id="profile-photo-uploader"
                />
              </div>

              {/* Boutons d'action : Enregistrer, Annuler, Supprimer */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={isSavingPhoto || (!hasUnsavedPhoto && !stagedPhoto)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                    hasUnsavedPhoto
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white animate-pulse"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  id="btn-save-profile-photo"
                >
                  {isSavingPhoto ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>
                    {hasUnsavedPhoto 
                      ? "Enregistrer la nouvelle photo" 
                      : (profilePhoto ? "Photo à jour (Enregistrer à nouveau)" : "Enregistrer ma photo")}
                  </span>
                </button>

                {hasUnsavedPhoto && (
                  <button
                    type="button"
                    onClick={handleCancelPhotoChange}
                    disabled={isSavingPhoto}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Annuler les modifications</span>
                  </button>
                )}

                {profilePhoto && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={isSavingPhoto}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 ml-auto"
                    id="btn-delete-profile-photo"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer ma photo de profil</span>
                  </button>
                )}
              </div>
            </div>

            {/* Colonne droite : Aperçu en situation et garanties de sécurité */}
            <div className="space-y-4">
              
              {/* Carte d'aperçu d'avatar en situation */}
              <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
                <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
                  Aperçu de votre badge officiel
                </span>

                <div className="relative inline-block">
                  <div className="h-24 w-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden mx-auto bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    {(stagedPhoto || profilePhoto) ? (
                      <img
                        src={stagedPhoto || profilePhoto}
                        alt="Aperçu officiel"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-indigo-600 text-white font-black text-2xl flex items-center justify-center">
                        {userName ? userName.slice(0, 2).toUpperCase() : "SS"}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[9px] font-black">
                    ✓
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">{userName}</h4>
                  <p className="text-[11px] text-slate-500 font-bold mt-0.5">{userRole}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{schoolName}</p>
                </div>

                {hasUnsavedPhoto && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    ⚠️ Photo modifiée non encore enregistrée. Cliquez sur « Enregistrer la nouvelle photo » pour appliquer.
                  </div>
                )}
              </div>

              {/* Bloc garanties techniques */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Persistance & Confidentialité</span>
                </div>
                <ul className="space-y-1 text-[10.5px] leading-tight list-disc pl-4 text-slate-500">
                  <li>Associée à votre identifiant unique permanent <strong>{targetAccountId}</strong>.</li>
                  <li>Conservée après déconnexion, actualisation ou changement d'appareil.</li>
                  <li>Compression automatique pour une rapidité d'affichage optimale en RDC.</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: MOT DE PASSE                                  */}
      {/* ======================================================== */}
      {activeTab === "password" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-black text-base uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-brand-blue" />
                <span>Modifier mon mot de passe</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pour garantir la sécurité de votre compte, choisissez un mot de passe robuste et ne le communiquez à personne.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Politique {ownerPolicy.minLength || 8} car. min
            </span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
            {/* MOT DE PASSE ACTUEL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe actuel"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-brand-blue outline-hidden pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* NOUVEAU MOT DE PASSE */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nouveau mot de passe *
                </label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${strengthLabel.color}`}>
                  {strengthLabel.label}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Choisissez un nouveau mot de passe fort"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-brand-blue outline-hidden pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* CRITÈRES VISUELS DE SÉCURITÉ */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                <div className={`flex items-center space-x-1.5 ${passwordCriteria.minLen ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                  {passwordCriteria.minLen ? <Check className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-1" />}
                  <span>{ownerPolicy.minLength || 8}+ caractères</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${passwordCriteria.hasUpper ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                  {passwordCriteria.hasUpper ? <Check className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-1" />}
                  <span>1 Majuscule (A-Z)</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${passwordCriteria.hasNumber ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                  {passwordCriteria.hasNumber ? <Check className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-1" />}
                  <span>1 Chiffre (0-9)</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${passwordCriteria.hasSpecial ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                  {passwordCriteria.hasSpecial ? <Check className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-1" />}
                  <span>1 Caractère spécial (@, #, $)</span>
                </div>
              </div>
            </div>

            {/* CONFIRMER NOUVEAU MOT DE PASSE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Confirmer le nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le nouveau mot de passe"
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs focus:ring-2 outline-hidden pr-10 font-mono ${
                    confirmPassword && !passwordCriteria.isMatch
                      ? "border-red-400 focus:ring-red-400"
                      : "border-slate-200 dark:border-slate-700 focus:ring-brand-blue"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && !passwordCriteria.isMatch && (
                <p className="text-[11px] text-red-500 font-bold">Les deux mots de passe ne correspondent pas.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!ownerSecurityPerms.canChangePassword}
              className="px-6 py-2.5 bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer le nouveau mot de passe</span>
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: RÉCUPÉRATION ET QUESTIONS SECRETES            */}
      {/* ======================================================== */}
      {activeTab === "recovery" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-black text-base uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-indigo-500" />
                <span>Questions Secrètes & Récupération par SMS/Email</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configurez vos canaux de secours pour débloquer votre compte en cas d'oubli de mot de passe.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne Gauche: Questions de sécurité */}
            <form onSubmit={handleSaveQuestions} className="space-y-4">
              <h4 className="font-black text-xs uppercase text-slate-700 dark:text-slate-300">
                1. Vos 3 Questions Secrètes de Sécurité
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Question 1</label>
                  <input
                    type="text"
                    value={q1}
                    onChange={(e) => { setQ1(e.target.value); setIsQuestionsSaved(false); }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={a1}
                    onChange={(e) => { setA1(e.target.value); setIsQuestionsSaved(false); }}
                    placeholder="Votre réponse secrète"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-indigo-600 dark:text-indigo-400 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Question 2</label>
                  <input
                    type="text"
                    value={q2}
                    onChange={(e) => { setQ2(e.target.value); setIsQuestionsSaved(false); }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={a2}
                    onChange={(e) => { setA2(e.target.value); setIsQuestionsSaved(false); }}
                    placeholder="Votre réponse secrète"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-indigo-600 dark:text-indigo-400 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Question 3</label>
                  <input
                    type="text"
                    value={q3}
                    onChange={(e) => { setQ3(e.target.value); setIsQuestionsSaved(false); }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={a3}
                    onChange={(e) => { setA3(e.target.value); setIsQuestionsSaved(false); }}
                    placeholder="Votre réponse secrète"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-indigo-600 dark:text-indigo-400 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isQuestionsSaved || !ownerSecurityPerms.canEditSecurityQuestions}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isQuestionsSaved ? "Questions enregistrées ✓" : "Enregistrer les questions"}
              </button>
            </form>

            {/* Colonne Droite: Simulation Récupération Code */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-black text-xs uppercase text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-emerald-500" />
                <span>2. Test de Récupération par Code OTP</span>
              </h4>

              <div className="flex items-center space-x-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setResetMethod("email"); setResetContact(userEmail); }}
                  className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
                    resetMethod === "email" ? "bg-brand-blue text-white border-brand-blue" : "bg-white dark:bg-slate-800"
                  }`}
                >
                  Par Email
                </button>
                <button
                  type="button"
                  onClick={() => { setResetMethod("sms"); setResetContact(userPhone); }}
                  className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
                    resetMethod === "sms" ? "bg-brand-blue text-white border-brand-blue" : "bg-white dark:bg-slate-800"
                  }`}
                >
                  Par SMS RDC
                </button>
              </div>

              {resetStep === "input" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Un code de sécurité à 6 chiffres sera envoyé à votre adresse ou téléphone.
                  </p>
                  <input
                    type="text"
                    value={resetContact}
                    onChange={(e) => setResetContact(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendResetCode}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Envoyer le code OTP</span>
                  </button>
                </div>
              )}

              {resetStep === "code" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Saisissez le code reçu sur <strong>{resetContact}</strong> :
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-indigo-400 rounded-xl text-center text-base tracking-widest font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="w-full py-2 bg-brand-blue text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Vérifier le code
                  </button>
                </div>
              )}

              {resetStep === "new_password" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Code validé. Définissez votre nouveau mot de passe :
                  </p>
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSaveResetPassword}
                    className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Appliquer le nouveau mot de passe
                  </button>
                </div>
              )}

              {resetStep === "success" && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                    Test de réinitialisation réussi avec succès !
                  </p>
                  <button
                    type="button"
                    onClick={() => setResetStep("input")}
                    className="text-[11px] text-brand-blue underline font-bold cursor-pointer"
                  >
                    Recommencer un test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: DOUBLE FACTEUR 2FA                            */}
      {/* ======================================================== */}
      {activeTab === "twofa" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-black text-base uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-emerald-500" />
                <span>Authentification à Double Facteur (2FA)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sécurisez vos connexions grâce à une application d'authentification (Google Authenticator, Microsoft Authenticator) ou SMS.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Statut 2FA :
              </span>
              <button
                type="button"
                onClick={() => {
                  setIs2FAEnabled(!is2FAEnabled);
                  addSecurityHistory(
                    is2FAEnabled ? "Désactivation 2FA" : "Activation 2FA",
                    `Le module 2FA a été ${!is2FAEnabled ? "activé" : "désactivé"} pour votre compte.`
                  );
                  showToast(is2FAEnabled ? "2FA désactivé." : "2FA activé avec succès !");
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  is2FAEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    is2FAEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {is2FAEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="h-40 w-40 bg-white p-3 rounded-2xl mx-auto border-2 border-indigo-600/30 flex items-center justify-center shadow-md">
                  <QrCode className="h-32 w-32 text-slate-900" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Clé secrète de configuration manuelle :
                  </p>
                  <p className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 p-2 rounded-lg border">
                    SSRD-2026-X9K2-M7L1
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-sm text-slate-800 dark:text-white">
                  Codes de Secours d'Urgence (Usage Unique)
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Conservez ces codes imprimés ou en lieu sûr. Ils vous permettront d'accéder à votre compte si vous perdez votre smartphone.
                </p>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border">
                  <div>8492-1049</div>
                  <div>3910-4820</div>
                  <div>5920-1948</div>
                  <div>7719-3019</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCopiedCodes(true);
                    showToast("Codes de secours copiés dans le presse-papier !");
                    setTimeout(() => setCopiedCodes(false), 2500);
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copiedCodes ? "Copié !" : "Copier les codes de secours"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <ShieldAlert className="h-10 w-10 mx-auto text-amber-500" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">L'authentification 2FA n'est pas activée</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Activez l'authentification à deux facteurs pour protéger votre compte contre l'accès non autorisé, même en cas de vol de votre mot de passe.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 5: APPAREILS CONNECTÉS                           */}
      {/* ======================================================== */}
      {activeTab === "devices" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-black text-base uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <Laptop className="h-5 w-5 text-blue-500" />
                <span>Gérer les Appareils Connectés</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Voici la liste des ordinateurs, tablettes et smartphones actuellement connectés à votre compte SmartSchool RDC.
              </p>
            </div>

            {ownerSecurityPerms.canLogoutAllDevices && activeSessions.length > 1 && (
              <button
                type="button"
                onClick={handleLogoutAllDevices}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Se déconnecter de tous les autres appareils</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {activeSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${sess.isCurrent ? "bg-emerald-500/20 text-emerald-600" : "bg-slate-200 dark:bg-slate-800 text-slate-600"}`}>
                    <Laptop className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-xs text-slate-900 dark:text-white">{sess.deviceName}</span>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-md">
                          Appareil Actuel
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-3 mt-0.5">
                      <span>📍 {sess.location}</span>
                      <span>• IP : {sess.ipAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-mono font-bold text-slate-400">{sess.lastActive}</span>
                  {!sess.isCurrent && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSessions(prev => prev.filter(s => s.id !== sess.id));
                        addSecurityHistory(
                          "Déconnexion Appareil",
                          `Fermeture manuelle de la session sur l'appareil '${sess.deviceName}' (${sess.ipAddress}).`
                        );
                        showToast(`Session fermée sur ${sess.deviceName}`);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                      title="Fermer cette session"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 6: HISTORIQUE DE SÉCURITÉ                        */}
      {/* ======================================================== */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-black text-base uppercase text-slate-900 dark:text-white flex items-center space-x-2">
                <History className="h-5 w-5 text-amber-500" />
                <span>Historique des Événements de Sécurité</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Journalisation chronologique détaillée des modifications de mot de passe, connexions, réinitialisations et sessions.
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-slate-400">
              {securityHistory.length} Événement(s)
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500">
                  <th className="p-3">Date & Heure</th>
                  <th className="p-3">Méthode / Événement</th>
                  <th className="p-3">Adresse IP</th>
                  <th className="p-3">Appareil</th>
                  <th className="p-3">Localisation</th>
                  <th className="p-3">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {securityHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {h.date} à {h.time}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold rounded text-[10px]">
                        {h.method}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-600 dark:text-slate-400">{h.ipAddress}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-sans">{h.device}</td>
                    <td className="p-3 text-slate-500 font-sans">{h.location}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 font-sans text-[11px] max-w-xs truncate" title={h.details}>
                      {h.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
