import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  Mail,
  Send,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  School,
  User,
  Check,
  AlertCircle,
  Building,
  RefreshCw,
  Clock,
  ShieldAlert,
  FileCheck,
  QrCode
} from "lucide-react";
import { OFFICIAL_SECURITY_QUESTIONS, validatePasswordPolicy, ROLE_PORTAL_MAPPING } from "../services/accountActivationService";

export interface FirstTimeLoginWizardUser {
  id?: string;
  name: string;
  role: string;
  schoolName: string;
  username: string; // Matricule / Login ID
  activationCode?: string;
  tempPassword?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  portalName?: string;
}

interface FirstTimeLoginWizardProps {
  user: FirstTimeLoginWizardUser;
  onWizardComplete: (updatedUser: {
    name: string;
    role: string;
    newPassword: string;
    phone: string;
    email: string;
    securityQuestions: { question: string; answer: string }[];
  }) => void;
  darkMode?: boolean;
}

export function FirstTimeLoginWizard({
  user,
  onWizardComplete,
  darkMode = false
}: FirstTimeLoginWizardProps) {
  // Wizard steps: 1: Identité & Code d'activation, 2: Création du Mot de passe, 3: 3 Questions de Sécurité, 4: Finalisation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Verification
  const [infoConfirmed, setInfoConfirmed] = useState(false);

  // Step 2: Mot de passe personnel
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Password criteria & strength evaluation
  const passwordEval = useMemo(() => {
    return validatePasswordPolicy(newPassword);
  }, [newPassword]);

  const isPasswordMatch = useMemo(() => {
    return newPassword.length > 0 && newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  // Step 3: Security Questions (Mandatory minimum of 3)
  const [q1, setQ1] = useState(OFFICIAL_SECURITY_QUESTIONS[0].question);
  const [a1, setA1] = useState("");

  const [q2, setQ2] = useState(OFFICIAL_SECURITY_QUESTIONS[1].question);
  const [a2, setA2] = useState("");

  const [q3, setQ3] = useState(OFFICIAL_SECURITY_QUESTIONS[2].question);
  const [a3, setA3] = useState("");

  const [step3Error, setStep3Error] = useState<string | null>(null);

  // Optional recovery phone/email
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");

  // Step 4: Final Activation
  const [isActivating, setIsActivating] = useState(false);
  const [activationDone, setActivationDone] = useState(false);

  const portalInfo = ROLE_PORTAL_MAPPING[user.role] || {
    role: user.role,
    portalName: `Portail ${user.role}`,
    portalCode: "PORTAL_GENERIC",
    portalPath: "/login",
    description: "Accès sécurisé à votre espace de travail",
    badgeColor: "text-brand-blue bg-blue-50 border-blue-200"
  };

  // Step Transitions
  const handleNextStep1 = () => {
    if (!infoConfirmed) return;
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    setStep2Error(null);
    if (!passwordEval.valid) {
      setStep2Error(passwordEval.errors[0] || "Le mot de passe ne respecte pas les critères de sécurité.");
      return;
    }
    if (!isPasswordMatch) {
      setStep2Error("Les deux mots de passe saisis ne sont pas identiques.");
      return;
    }
    setCurrentStep(3);
  };

  const handleNextStep3 = () => {
    setStep3Error(null);
    if (!a1.trim() || a1.trim().length < 2) {
      setStep3Error("Veuillez répondre à la première question de sécurité (au moins 2 caractères).");
      return;
    }
    if (!a2.trim() || a2.trim().length < 2) {
      setStep3Error("Veuillez répondre à la deuxième question de sécurité (au moins 2 caractères).");
      return;
    }
    if (!a3.trim() || a3.trim().length < 2) {
      setStep3Error("Veuillez répondre à la troisième question de sécurité (au moins 2 caractères).");
      return;
    }
    if (q1 === q2 || q1 === q3 || q2 === q3) {
      setStep3Error("Les 3 questions de sécurité doivent être différentes les unes des autres.");
      return;
    }

    // Launch Step 4 Finalization
    setCurrentStep(4);
    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      setActivationDone(true);
      setTimeout(() => {
        onWizardComplete({
          name: user.name,
          role: user.role,
          newPassword,
          phone,
          email,
          securityQuestions: [
            { question: q1, answer: a1.trim() },
            { question: q2, answer: a2.trim() },
            { question: q3, answer: a3.trim() }
          ]
        });
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6" id="first-time-login-wizard-container">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header Progress Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-brand-blue p-6 text-white text-left relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-black text-blue-200 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Protocole d'Activation Zero-Trust • SmartSchool RDC
              </span>
              <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
                Étape {currentStep} sur 4
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              {currentStep === 1 && "1. Confirmation de votre Identité"}
              {currentStep === 2 && "2. Création de votre Mot de Passe Personnel"}
              {currentStep === 3 && "3. Configuration des 3 Questions de Sécurité"}
              {currentStep === 4 && "4. Activation Définitive de votre Compte"}
            </h2>
            <p className="text-xs text-blue-100/90 font-medium">
              {currentStep === 1 && "Vérifiez vos informations et confirmez l'association à votre dossier administratif."}
              {currentStep === 2 && "Définissez votre propre mot de passe sécurisé pour vos futures connexions."}
              {currentStep === 3 && "Indispensable pour la récupération autonome de compte sans intervention de l'école."}
              {currentStep === 4 && "Validation de votre profil et invalidation du code d'activation temporaire."}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-4 relative z-10">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep === stepNum
                    ? "w-8 bg-emerald-400"
                    : currentStep > stepNum
                    ? "w-4 bg-white/60"
                    : "w-4 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 sm:p-8 space-y-6 text-left">
          
          {/* STEP 1: IDENTITÉ & CONFIRMATION */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black text-lg border-2 border-brand-blue/30 shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {user.name}
                    </h3>
                    <p className="text-xs font-bold text-brand-blue dark:text-blue-400">
                      {portalInfo.portalName} • ({user.role})
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Établissement : {user.schoolName || "SmartSchool RDC"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Matricule / Identifiant</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-xs">{user.username}</strong>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Code d'activation saisi</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">{user.activationCode || "ACT-VALIDÉ"}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirmIdentityCheck"
                  checked={infoConfirmed}
                  onChange={(e) => setInfoConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="confirmIdentityCheck" className="text-xs font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed cursor-pointer select-none">
                  Je confirme que ces informations correspondent bien à mon identité et que je suis le titulaire légitime de ce compte d'accès.
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={!infoConfirmed}
                  onClick={handleNextStep1}
                  className="px-6 py-3 bg-brand-blue hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  id="step1-continue-btn"
                >
                  <span>Continuer vers le mot de passe</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: MOT DE PASSE PERSONNEL */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                🔒 Pour des raisons de cybersécurité, aucun mot de passe temporaire n'a été conservé. Vous devez maintenant créer votre <strong>mot de passe personnel et secret</strong>.
              </div>

              {step2Error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{step2Error}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Nouveau Mot de Passe Personnel <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8 caractères minimum, majuscules, chiffres, symboles"
                      className="w-full p-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-blue focus:outline-none transition-all text-xs"
                      id="new-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Confirmer le Mot de Passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez exactement le même mot de passe"
                      className="w-full p-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-blue focus:outline-none transition-all text-xs"
                      id="confirm-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Policy Badges */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px]">
                  <span className="font-bold text-slate-500 uppercase text-[9px] block">Critères de sécurité exigés :</span>
                  <div className="grid grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-400">
                    <span className={newPassword.length >= 8 ? "text-emerald-600 font-bold" : ""}>
                      {newPassword.length >= 8 ? "✓" : "○"} 8 caractères minimum
                    </span>
                    <span className={/[A-Z]/.test(newPassword) ? "text-emerald-600 font-bold" : ""}>
                      {/[A-Z]/.test(newPassword) ? "✓" : "○"} Au moins 1 majuscule (A-Z)
                    </span>
                    <span className={/[0-9]/.test(newPassword) ? "text-emerald-600 font-bold" : ""}>
                      {/[0-9]/.test(newPassword) ? "✓" : "○"} Au moins 1 chiffre (0-9)
                    </span>
                    <span className={/[!@#$%^&*(),.?":{}|<>_\-]/.test(newPassword) ? "text-emerald-600 font-bold" : ""}>
                      {/[!@#$%^&*(),.?":{}|<>_\-]/.test(newPassword) ? "✓" : "○"} Au moins 1 symbole spécial
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </button>
                <button
                  onClick={handleNextStep2}
                  className="px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  id="step2-continue-btn"
                >
                  <span>Passer aux questions de sécurité</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: 3 QUESTIONS DE SÉCURITÉ */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                🛡️ <strong>Obligatoire (3 questions) :</strong> En cas de perte de votre mot de passe, ces réponses vous permettront de réinitialiser votre compte en toute autonomie.
              </div>

              {step3Error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{step3Error}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* Question 1 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block text-xs">
                    Question de sécurité 1 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    {OFFICIAL_SECURITY_QUESTIONS.map((q) => (
                      <option key={q.id} value={q.question}>{q.question}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Votre réponse secrète..."
                    value={a1}
                    onChange={(e) => setA1(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                {/* Question 2 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block text-xs">
                    Question de sécurité 2 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={q2}
                    onChange={(e) => setQ2(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    {OFFICIAL_SECURITY_QUESTIONS.map((q) => (
                      <option key={q.id} value={q.question}>{q.question}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Votre réponse secrète..."
                    value={a2}
                    onChange={(e) => setA2(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                {/* Question 3 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-200 block text-xs">
                    Question de sécurité 3 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={q3}
                    onChange={(e) => setQ3(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    {OFFICIAL_SECURITY_QUESTIONS.map((q) => (
                      <option key={q.id} value={q.question}>{q.question}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Votre réponse secrète..."
                    value={a3}
                    onChange={(e) => setA3(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </button>
                <button
                  onClick={handleNextStep3}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  id="step3-activate-btn"
                >
                  <Check className="h-4 w-4" />
                  <span>Valider & Activer mon Compte</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ACTIVATION EN COURS & REDIRECTION */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              {isActivating && (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full border-4 border-emerald-500/30 border-t-emerald-600 animate-spin flex items-center justify-center">
                    <Lock className="h-6 w-6 text-emerald-600 animate-pulse" />
                  </div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Invalidation du code d'activation & enregistrement sécurisé...
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configuration de votre profil IAM et application des politiques de sécurité Zero-Trust.
                  </p>
                </div>
              )}

              {activationDone && (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-400">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="font-black text-lg text-emerald-700 dark:text-emerald-400">
                    🎉 Félicitations ! Votre compte est maintenant activé.
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    Le code d'activation temporaire est à présent <strong>définitivement expiré</strong>. Utilisez désormais votre identifiant <strong>{user.username}</strong> et votre mot de passe personnel pour vous connecter.
                  </p>
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-brand-blue dark:text-blue-400 animate-pulse">
                      Redirection automatique vers votre portail ({portalInfo.portalName})...
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
