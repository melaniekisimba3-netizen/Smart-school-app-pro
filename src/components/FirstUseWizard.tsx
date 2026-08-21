import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  HelpCircle,
  Briefcase,
  Upload,
  Bookmark,
  Sliders,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Printer,
  ExternalLink,
  Crown,
  Landmark,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { School as SchoolType, UserAccount } from "../types";
import { safeCopyToClipboard, getSafeOrigin, safeLocalStorage } from "../utils/safeStorage";
import { centralAuthService } from "../services/centralAuthService";
import { persistUniversalUserAccount } from "../services/accountActivationService";

interface FirstUseWizardProps {
  onComplete: (school: SchoolType, admin: { fullName: string; fonction: string; email: string; phone: string; password?: string }) => void;
  onCancel: () => void;
  darkMode: boolean;
}

export function FirstUseWizard({ onComplete, onCancel, darkMode }: FirstUseWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Etape 1 : Informations de l'établissement
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [officialName, setOfficialName] = useState("");
  const [motto, setMotto] = useState("");
  const [province, setProvince] = useState("");
  const [ville, setVille] = useState("");
  const [commune, setCommune] = useState("");
  const [adresse, setAdresse] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [schoolType, setSchoolType] = useState<"Public" | "Privé" | "Conventionné">("Privé");
  const [conventionType, setConventionType] = useState("Non conventionné");

  // Etape 2 : Structure & Modules de l'établissement
  const [selectedStructure, setSelectedStructure] = useState<string>("Maternelle + Primaire + Secondaire + Humanités");
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    pedagogie: true,
    comptabilite: true,
    rh: true,
    bulletins: true,
    horaires: true,
    messagerie_sms: true,
    cartes_listes: true,
    vitrine_rdc: true
  });

  // Etape 3 : Compte Principal de l'école
  const [adminName, setAdminName] = useState("");
  const [adminFonction, setAdminFonction] = useState("Promoteur");
  const [adminPhone, setAdminPhone] = useState("+243 ");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Etape 4 Result state
  const [createdSchoolResult, setCreatedSchoolResult] = useState<SchoolType | null>(null);
  const [createdAdminResult, setCreatedAdminResult] = useState<any>(null);

  // Lists
  const provincesRDC = [
    "Kinshasa", "Kongo Central", "Kwango", "Kwilu", "Mai-Ndombe", 
    "Ituri", "Haut-Uele", "Bas-Uele", "Tshopo", "Nord-Ubangi", 
    "Sud-Ubangi", "Mongala", "Équateur", "Tshuapa", "Nord-Kivu", 
    "Sud-Kivu", "Maniema", "Haut-Katanga", "Lualaba", 
    "Haut-Lomami", "Tanganyika", "Sankuru", "Lomami", 
    "Kasaï Oriental", "Kasaï Central", "Kasaï"
  ];

  const typesEtablissement = ["Public", "Privé", "Conventionné"];
  const conventionsCongolaises = [
    "Non conventionné",
    "Catholique", 
    "Protestante", 
    "Islamique", 
    "Kimbanguiste", 
    "Salutiste", 
    "Fraternité", 
    "Méthodiste", 
    "Orthodoxe", 
    "Autre"
  ];

  const fonctionsAdmin = [
    "Promoteur",
    "Directeur Général",
    "Préfet des Études",
    "Administrateur RH",
    "Comptable Principal",
    "Secrétaire Général",
    "Gestionnaire"
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleModuleSelection = (key: string) => {
    setEnabledModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!officialName.trim()) {
        alert("Veuillez saisir le nom officiel de l'établissement.");
        return;
      }
      if (!commune.trim()) {
        alert("Veuillez saisir la commune.");
        return;
      }
      if (!adresse.trim()) {
        alert("Veuillez saisir l'adresse physique.");
        return;
      }
      if (!phone.trim()) {
        alert("Veuillez saisir le numéro de téléphone de l'établissement.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminName.trim()) {
      alert("Veuillez saisir le nom complet du responsable.");
      return;
    }
    if (!adminPhone.trim()) {
      alert("Veuillez saisir le numéro de téléphone du responsable.");
      return;
    }
    if (!adminEmail.trim()) {
      alert("Veuillez saisir l'adresse e-mail / identifiant du responsable.");
      return;
    }
    if (!adminPassword.trim() || adminPassword.length < 6) {
      alert("Veuillez saisir un mot de passe d'au moins 6 caractères.");
      return;
    }

    setLoading(true);
    setLoadingStep(1);

    setTimeout(() => {
      setLoadingStep(2); // Configuration IAM et mot de passe
      setTimeout(() => {
        setLoadingStep(3); // Déploiement des modules choisis

        let levels: string[] = ["Maternelle", "Primaire", "Secondaire", "Humanités"];
        let sections: string[] = ["Section Maternelle", "Section Primaire", "Éducation de Base", "Section Scientifique", "Section Littéraire"];
        let options: string[] = ["Éveil", "Enseignement de Base", "Mathématiques-Physique", "Latin-Philosophie"];
        let classes: string[] = ["Grande Section A", "2ème Année Primaire A", "7ème Année EB-A", "3ème Humanités Littéraire A"];

        if (selectedStructure === "Maternelle uniquement") {
          levels = ["Maternelle"];
          sections = ["Section Maternelle"];
          options = ["Éveil de l'enfant"];
          classes = ["Petite Section A", "Moyenne Section A", "Grande Section A"];
        } else if (selectedStructure === "Primaire uniquement") {
          levels = ["Primaire"];
          sections = ["Section Primaire"];
          options = ["Enseignement de Base"];
          classes = ["1ère Année Primaire A", "2ème Année Primaire A", "5ème Année Primaire A", "6ème Année Primaire A"];
        } else if (selectedStructure === "Secondaire uniquement") {
          levels = ["Secondaire"];
          sections = ["Éducation de Base"];
          options = ["Tronc Commun"];
          classes = ["7ème Année EB-A", "8ème Année EB-A"];
        } else if (selectedStructure === "Humanités uniquement") {
          levels = ["Humanités"];
          sections = ["Section Littéraire", "Section Scientifique", "Section Commerciale"];
          options = ["Latin-Philosophie", "Mathématiques-Physique", "Commerciale & Gestion"];
          classes = ["3ème Humanités Littéraire A", "4ème Humanités Scientifique A", "5ème Humanités Commerciale A"];
        } else if (selectedStructure === "Maternelle + Primaire") {
          levels = ["Maternelle", "Primaire"];
          sections = ["Section Maternelle", "Section Primaire"];
          options = ["Éveil de l'enfant", "Enseignement de Base"];
          classes = ["Grande Section A", "1ère Année Primaire A", "2ème Année Primaire A", "6ème Année Primaire A"];
        } else if (selectedStructure === "Primaire + Secondaire") {
          levels = ["Primaire", "Secondaire"];
          sections = ["Section Primaire", "Éducation de Base"];
          options = ["Enseignement de Base"];
          classes = ["1ère Année Primaire A", "6ème Année Primaire A", "7ème Année EB-A", "8ème Année EB-A"];
        } else if (selectedStructure === "Secondaire + Humanités") {
          levels = ["Secondaire", "Humanités"];
          sections = ["Éducation de Base", "Section Scientifique", "Section Commerciale"];
          options = ["Mathématiques-Physique", "Commerciale & Gestion"];
          classes = ["7ème Année EB-A", "8ème Année EB-A", "3ème Humanités Scientifique A", "4ème Humanités Commerciale A"];
        }

        const enrollmentResult = centralAuthService.enrollNewSchool({
          name: officialName.trim(),
          province: province,
          city: ville,
          commune: commune,
          adresse: adresse,
          promoterName: adminName.trim(),
          promoterEmail: adminEmail.trim().toLowerCase(),
          promoterPhone: adminPhone.trim(),
          adminRole: adminFonction,
          adminUsername: adminEmail.trim().toLowerCase(),
          adminPassword: adminPassword.trim(),
          levels,
          sections,
          classes,
          logoUrl: logoFile || logoUrl || undefined,
          motto: motto || "Discipline - Travail - Excellence"
        });

        // Save selected modules for this school
        safeLocalStorage.setItem(`ss_school_enabled_modules_${enrollmentResult.school.id}`, JSON.stringify(enabledModules));

        setCreatedSchoolResult(enrollmentResult.school);
        setCreatedAdminResult({
          fullName: adminName.trim(),
          fonction: adminFonction,
          email: adminEmail.trim().toLowerCase(),
          phone: adminPhone.trim(),
          password: adminPassword.trim(),
          schoolCode: enrollmentResult.school.codeNational
        });

        setLoading(false);
        setStep(4);
      }, 1000);
    }, 800);
  };

  const handleFinishAndEnter = () => {
    if (createdSchoolResult && createdAdminResult) {
      onComplete(createdSchoolResult, createdAdminResult);
    }
  };

  const copyConnectionCredentials = () => {
    if (!createdAdminResult) return;
    const text = `SMARTSCHOOL RDC - FICHE OFFICIELLE D'ENRÔLEMENT\nÉtablissement : ${createdSchoolResult?.name}\nLien direct de connexion : ${getSafeOrigin()}/login\nIdentifiant : ${createdAdminResult.email}\nMot de passe : ${createdAdminResult.password}\nFonction : ${createdAdminResult.fonction}\nCode Établissement : ${createdAdminResult.schoolCode}`;
    safeCopyToClipboard(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 3000);
  };

  const copyDirectLink = () => {
    safeCopyToClipboard(`${getSafeOrigin()}/login`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-slate-800 animate-pulse"></div>
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-600 border-r-emerald-500 animate-spin"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Création & Enrôlement de l'Établissement</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">
            {loadingStep === 1 && "Génération de la base de données de l'établissement..."}
            {loadingStep === 2 && "Enregistrement du compte principal et du mot de passe..."}
            {loadingStep === 3 && "Activation des modules et génération de la fiche d'accès..."}
          </p>
        </div>
      </div>
    );
  }

  // STEP 4: RÉCAPITULATIF OFFICIEL D'ENRÔLEMENT
  if (step === 4 && createdSchoolResult && createdAdminResult) {
    return (
      <div className="text-left space-y-6">
        <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Enrôlement Réussi avec Succès
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
            Fiche Officielle d'Enrôlement & Accès
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            L'école <strong>{createdSchoolResult.name}</strong> et votre compte principal sont configurés. Conservez précieusement ces identifiants.
          </p>
        </div>

        {/* Credentials Box */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Établissement Scolaire</p>
              <p className="font-black text-slate-900 dark:text-white text-sm">{createdSchoolResult.name}</p>
              <p className="text-[11px] text-slate-500">{createdSchoolResult.province} • {createdSchoolResult.commune}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Code National EPST</p>
              <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">{createdSchoolResult.codeNational}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Identifiant de Connexion</p>
              <p className="font-mono font-bold text-slate-900 dark:text-white select-all">{createdAdminResult.email}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Mot de Passe Réel</p>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 select-all">{createdAdminResult.password}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Responsable & Titulaire</p>
              <p className="font-bold text-slate-900 dark:text-white">{createdAdminResult.fullName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Fonction / Portail</p>
              <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold rounded-md text-[11px]">
                {createdAdminResult.fonction}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 text-xs">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Lien de Connexion Central</p>
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 flex-1 truncate">
                {getSafeOrigin()}/login
              </span>
              <button
                type="button"
                onClick={copyDirectLink}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
              >
                {copiedLink ? "Copié !" : "Copier le lien"}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={copyConnectionCredentials}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
            >
              <Copy className="h-4 w-4 text-indigo-500" />
              <span>{copiedCreds ? "Identifiants Copiés !" : "Copier les Identifiants"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
            >
              <Printer className="h-4 w-4 text-emerald-500" />
              <span>Imprimer la Fiche</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleFinishAndEnter}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/30 cursor-pointer transition-all"
          >
            <span>Accéder à Mon Espace de Travail</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-left">
      {/* Header Wizard */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
            Étape {step} sur 3
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
            {step === 1 
              ? "Informations de l'établissement" 
              : step === 2 
              ? "Structure & Choix des Modules" 
              : "Compte Principal de l'École"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {step === 1 
              ? "Saisissez les paramètres légaux et de localisation de votre école." 
              : step === 2
              ? "Sélectionnez les cycles et les fonctionnalités que votre école souhaite utiliser."
              : "Créez le profil et le mot de passe réel du responsable principal de cet établissement."}
          </p>
        </div>

        <button 
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold cursor-pointer"
        >
          Annuler
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-300"
          style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
        />
      </div>

      {/* STEP 1: INFORMATIONS DE L'ÉTABLISSEMENT */}
      {step === 1 && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="space-y-4"
        >
          {/* Logo & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="relative group shrink-0">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex items-center justify-center overflow-hidden">
                {logoFile || logoUrl ? (
                  <img src={logoFile || logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <Building className="h-8 w-8 text-indigo-400" />
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-[9px] font-bold">
                <Upload className="h-4 w-4 mb-0.5" />
                <span>Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            <div className="w-full space-y-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nom Officiel de l'Établissement *
                </label>
                <input
                  type="text"
                  value={officialName}
                  onChange={(e) => setOfficialName(e.target.value)}
                  placeholder="Ex: Complexe Scolaire Mgr Bokeleale"
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Devise de l'école
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Ex: Discipline - Travail - Excellence"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Type and Convention */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Régime / Statut Juridique *
              </label>
              <select
                value={schoolType}
                onChange={(e) => setSchoolType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {typesEtablissement.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {schoolType === "Conventionné" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Convention Religieuse *
                </label>
                <select
                  value={conventionType}
                  onChange={(e) => setConventionType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {conventionsCongolaises.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Province *
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Sélectionner la province --</option>
                {provincesRDC.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ville / Territoire *
              </label>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Ex: Ville ou territoire..."
                required
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Commune *
              </label>
              <input
                type="text"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                placeholder="Ex: Gombe, Lingwala..."
                required
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Adresse Physique Complète *
            </label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Ex: 14, Avenue de la Libération, C/ Gombe"
              required
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Téléphone Principal *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243 8..."
                required
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                E-mail Officiel de l'école
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@ecole.cd"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: STRUCTURE & MODULES */}
      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="space-y-5"
        >
          {/* Structure Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Cycles d'enseignement de votre établissement *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Maternelle + Primaire + Secondaire + Humanités",
                "Primaire + Secondaire + Humanités",
                "Secondaire + Humanités",
                "Primaire uniquement",
                "Maternelle uniquement",
                "Secondaire uniquement",
                "Humanités uniquement"
              ].map(struct => (
                <button
                  key={struct}
                  type="button"
                  onClick={() => setSelectedStructure(struct)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedStructure === struct
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{struct}</span>
                  {selectedStructure === struct && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Module Choice */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Modules & Fonctionnalités à activer pour votre école
              </label>
              <span className="text-[10px] text-slate-400">Modifiable ultérieurement</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: "pedagogie", label: "Pédagogie & Notes Numériques", desc: "Saisie cotes, journal, délibérations", icon: BookOpen },
                { key: "comptabilite", label: "Frais & Caisse Mobile Money", desc: "Encaissement M-Pesa, Orange, Airtel", icon: Landmark },
                { key: "rh", label: "Ressources Humaines (RH) & Paie", desc: "Personnel, organigramme, présences", icon: User },
                { key: "bulletins", label: "Bulletins Officiels EPST", desc: "Génération automatique conforme RDC", icon: Award },
                { key: "horaires", label: "Emploi du Temps & Grille Horaire", desc: "Planification des créneaux et cours", icon: Sliders },
                { key: "messagerie_sms", label: "Messagerie & Notifications SMS", desc: "Alertes directes aux parents", icon: Mail }
              ].map(item => {
                const active = enabledModules[item.key] ?? true;
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleModuleSelection(item.key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      active
                        ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white"
                        : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${active ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold truncate">{item.label}</p>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {}}
                          className="h-3.5 w-3.5 text-emerald-600 rounded"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Précédent</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <span>Continuer</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: PREMIER ADMINISTRATEUR */}
      {step === 3 && (
        <motion.form 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <p className="font-bold flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>Création du Compte Principal de l'Établissement</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Ce compte permettra de gérer l'école, d'assigner les autres portails (Comptable, Préfet, Secrétaire, RH) et de configurer l'espace de travail.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nom complet du responsable principal *
            </label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Ex: M. Jean-Claude MWAMBA"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fonction Initiale *
              </label>
              <select
                value={adminFonction}
                onChange={(e) => setAdminFonction(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {fonctionsAdmin.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Téléphone du Responsable *
              </label>
              <input
                type="tel"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="+243 8..."
                required
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Adresse E-mail / Identifiant de Connexion *
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Ex: direction@ecole.cd ou promoteur@gmail.com"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mot de passe de votre compte *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                placeholder="Votre mot de passe"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Ce mot de passe vous permettra de vous reconnecter à tout moment sur la porte centrale.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Précédent</span>
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Finaliser & Enrôler l'École</span>
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
