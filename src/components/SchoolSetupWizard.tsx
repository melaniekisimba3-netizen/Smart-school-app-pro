import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  Award, 
  BookOpen, 
  Users, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Briefcase,
  HelpCircle,
  Clock,
  LayoutDashboard,
  CreditCard,
  Landmark
} from "lucide-react";
import { School } from "../types";

interface SchoolSetupWizardProps {
  onComplete: (newSchool: School) => void;
  onCancel?: () => void;
  lang?: "fr" | "ln" | "sw";
}

export function SchoolSetupWizard({ onComplete, onCancel, lang = "fr" }: SchoolSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Step 1: General Info
  const [schoolName, setSchoolName] = useState("");
  const [motto, setMotto] = useState("");
  const [province, setProvince] = useState("");
  const [ville, setVille] = useState("");
  const [commune, setCommune] = useState("");
  const [adresse, setAdresse] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [schoolType, setSchoolType] = useState<"Public" | "Privé" | "Conventionné">("Privé");
  const [conventionType, setConventionType] = useState("Non conventionné");
  const [logo, setLogo] = useState<string | null>(null);

  // Step 2: Academic Config
  const [schoolYear, setSchoolYear] = useState("2026-2027");
  const [levels, setLevels] = useState<string[]>(["Primaire", "Secondaire"]);

  // Step 3: Pedagogical Organisation (States for interactive tables)
  const [sections, setSections] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  // Editing state for Step 3 list items
  const [newSection, setNewSection] = useState("");
  const [newOption, setNewOption] = useState("");
  const [newClass, setNewClass] = useState("");

  // Step 4: Administrative Attachment
  const [inspectionProv, setInspectionProv] = useState("");
  const [provedCoordination, setProvedCoordination] = useState("");

  // Step 5: SmartSchool Mobile Money & Bank Card Financial Config
  const [mobileMoneyEnabled, setMobileMoneyEnabled] = useState(true);
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(true);
  const [acceptedGateways, setAcceptedGateways] = useState<string[]>(["M-Pesa", "Orange Money", "Airtel Money", "Carte Bancaire (Visa/Mastercard)"]);
  
  // Mobile Money Account Details
  const [mpesaMerchant, setMpesaMerchant] = useState("");
  const [mpesaHolder, setMpesaHolder] = useState("");
  const [mpesaValidated, setMpesaValidated] = useState(false);

  const [orangeMerchant, setOrangeMerchant] = useState("");
  const [orangeHolder, setOrangeHolder] = useState("");
  const [orangeValidated, setOrangeValidated] = useState(false);

  const [airtelMerchant, setAirtelMerchant] = useState("");
  const [airtelHolder, setAirtelHolder] = useState("");
  const [airtelValidated, setAirtelValidated] = useState(false);

  // Bank Card Account Details
  const [bankName, setBankName] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [merchantGatewayToken, setMerchantGatewayToken] = useState("");
  const [bankValidated, setBankValidated] = useState(false);

  const [configurableFees, setConfigurableFees] = useState<string[]>([
    "Minerval",
    "Frais d'inscription",
    "Frais de bulletin",
    "Examen d'État"
  ]);
  const [acceptedFinancialTerms, setAcceptedFinancialTerms] = useState(true);

  // Provinces list in DRC
  const provincesRDC = [
    "Kinshasa", "Kongo Central", "Kwango", "Kwilu", "Mai-Ndombe", 
    "Ituri", "Haut-Uele", "Bas-Uele", "Tshopo", "Nord-Ubangi", 
    "Sud-Ubangi", "Mongala", "Équateur", "Tshuapa", "Nord-Kivu", 
    "Sud-Kivu", "Maniema", "Katanga (Haut-Katanga)", "Lualaba", 
    "Haut-Lomami", "Tanganyika", "Sankuru", "Lomami", 
    "Kasaï Oriental", "Kasaï Central", "Kasaï"
  ];

  const typesEtablissement = ["Public", "Privé", "Conventionné"];
  const conventionsCongolaises = [
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

  // Helper for step-by-step validation
  const isStepValid = () => {
    switch (step) {
      case 1:
        return schoolName.trim() !== "" && commune.trim() !== "" && adresse.trim() !== "" && phone.trim() !== "";
      case 2:
        return levels.length > 0 && schoolYear.trim() !== "";
      case 3:
        return sections.length > 0 && classes.length > 0;
      case 4:
        return inspectionProv.trim() !== "" && provedCoordination.trim() !== "";
      case 5:
        return acceptedFinancialTerms && (!mobileMoneyEnabled || acceptedGateways.length > 0);
      default:
        return true;
    }
  };

  // Generate automatically options, sections, classes when levels change (Step 2 -> Step 3 transition)
  const generatePedagogicalStructure = () => {
    let generatedSections: string[] = [];
    let generatedOptions: string[] = [];
    let generatedClasses: string[] = [];

    if (levels.includes("Maternelle")) {
      generatedSections.push("Section Maternelle");
      generatedOptions.push("Maternelle Générale");
      generatedClasses.push("1ère Maternelle A", "2ème Maternelle A", "3ème Maternelle A");
    }
    if (levels.includes("Primaire")) {
      generatedSections.push("Section Primaire");
      generatedOptions.push("Enseignement de Base");
      generatedClasses.push("1ère Année Primaire A", "2ème Année Primaire A", "3ème Année Primaire A", "4ème Année Primaire A", "5ème Année Primaire A", "6ème Année Primaire A");
    }
    if (levels.includes("Secondaire")) {
      generatedSections.push("Section Éducation de Base", "Section Littéraire", "Section Scientifique");
      generatedOptions.push("Pédagogie Générale", "Latin-Philosophie", "Mathématiques-Physique", "Chimie-Biologie");
      generatedClasses.push("7ème Année EB-A", "8ème Année EB-A", "3ème Humanités Littéraire", "4ème Humanités Littéraire", "3ème Humanités Scientifique", "4ème Humanités Scientifique");
    }
    if (levels.includes("Technique / Professionnel")) {
      generatedSections.push("Section Technique Industrielle", "Section Commerciale & Gestion");
      generatedOptions.push("Electricité Industrielle", "Commerciale & Administrative", "Coupe & Couture");
      generatedClasses.push("3ème Humanités Électricité", "4ème Humanités Électricité", "3ème Humanités Commerciale", "4ème Humanités Commerciale");
    }

    setSections(generatedSections);
    setOptions(generatedOptions);
    setClasses(generatedClasses);
  };

  // Trigger generator when transitioning from Step 2 to Step 3
  const handleNext = () => {
    if (step === 2) {
      generatePedagogicalStructure();
    }
    setStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleAddSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      setSections([...sections, newSection.trim()]);
      setNewSection("");
    }
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleAddClass = () => {
    if (newClass.trim() && !classes.includes(newClass.trim())) {
      setClasses([...classes, newClass.trim()]);
      setNewClass("");
    }
  };

  const handleRemoveClass = (index: number) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  const handleLevelToggle = (lvl: string) => {
    if (levels.includes(lvl)) {
      setLevels(levels.filter(l => l !== lvl));
    } else {
      setLevels([...levels, lvl]);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    setLoading(true);
    setLoadingMessage("Création de l'établissement scolaire...");
    
    setTimeout(() => {
      setLoadingMessage("Initialisation sécurisée de la base de données multi-tenant...");
      setTimeout(() => {
        setLoadingMessage("Génération automatique de l'espace de travail pédagogique...");
        setTimeout(() => {
          setLoadingMessage("Enregistrement au registre national du CNR-EPST RDC...");
          setTimeout(() => {
            const finalSchool: School = {
              id: `school-${Date.now()}`,
              name: schoolName,
              codeNational: `RDC-${province.substring(0,3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}-${schoolType.substring(0,1).toUpperCase()}`,
              provinceEducationnelle: `${province} 1`,
              logoUrl: logo || undefined,
              contactEmail: email || `contact@${schoolName.toLowerCase().replace(/\s+/g, "")}.cd`,
              motto,
              province,
              ville,
              commune,
              adresseComplete: adresse,
              phonePrincipal: phone,
              website,
              type: schoolType,
              conventionType: schoolType === "Conventionné" ? conventionType : undefined,
              schoolYear,
              levels,
              sections,
              options,
              classes,
              inspectionProvinciale: inspectionProv,
              sousProvedCoordination: provedCoordination,
              mobileMoneyEnabled,
              cardPaymentEnabled,
              acceptedGateways,
              merchantAccounts: {
                mpesa: mpesaMerchant,
                orange: orangeMerchant,
                airtel: airtelMerchant
              },
              schoolReceivingAccounts: {
                mobileMoney: {
                  mpesa: { holderName: mpesaHolder, phone: mpesaMerchant, validated: mpesaValidated },
                  orange: { holderName: orangeHolder, phone: orangeMerchant, validated: orangeValidated },
                  airtel: { holderName: airtelHolder, phone: airtelMerchant, validated: airtelValidated }
                },
                bankCard: {
                  bankName,
                  holderName: bankHolder,
                  accountNumber: bankAccountNumber,
                  merchantGatewayToken,
                  validated: bankValidated
                }
              },
              configurableFees,
              acceptedFinancialTerms
            };
            setLoading(false);
            onComplete(finalSchool);
          }, 1200);
        }, 1000);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto my-4">
      {/* Loading overlay for the Setup process */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-md w-full border border-slate-200/50 dark:border-slate-800 text-center space-y-6 shadow-2xl">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-100 dark:border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
                <Building className="h-8 w-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-2">
                <h3 className="font-sans font-black text-lg text-slate-800 dark:text-slate-100">SmartSchool Setup Wizard</h3>
                <p className="text-xs text-indigo-500 font-mono font-bold uppercase tracking-widest">{loadingMessage}</p>
              </div>
              <div className="pt-2">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-pulse w-3/4 rounded-full"></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Ne fermez pas cette fenêtre. Configuration souveraine en cours...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden text-left">
        {/* Wizard Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500 text-emerald-950 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase">
                  Nouveau Module SaaS
                </span>
                <span className="text-[10px] text-indigo-200 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Sprint 1 - Établissements
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight font-sans">Créer un nouvel Établissement</h2>
              <p className="text-xs text-indigo-200">
                Configurez pas-à-pas les structures administratives, académiques et pédagogiques d'une nouvelle école congolaise.
              </p>
            </div>
            
            {onCancel && (
              <button 
                onClick={onCancel}
                className="self-start md:self-auto bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Annuler
              </button>
            )}
          </div>

          {/* Stepper progress indicator */}
          <div className="mt-8 grid grid-cols-6 gap-2 relative">
            {[
              { num: 1, label: "Général", desc: "Infos de base" },
              { num: 2, label: "Académique", desc: "Niveaux d'étude" },
              { num: 3, label: "Pédagogique", desc: "Sections & Classes" },
              { num: 4, label: "Rattachement", desc: "Administration" },
              { num: 5, label: "Paiements", desc: "Mobile Money" },
              { num: 6, label: "Validation", desc: "Résumé complet" }
            ].map((s) => (
              <div key={s.num} className="text-center md:text-left space-y-1 relative">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                    step === s.num 
                      ? "bg-emerald-500 text-slate-900 ring-4 ring-emerald-500/30 scale-110" 
                      : step > s.num 
                        ? "bg-indigo-500 text-white" 
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}>
                    {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  {s.num < 6 && (
                    <div className={`hidden md:block h-0.5 w-full mx-1 ${
                      step > s.num ? "bg-indigo-500" : "bg-slate-800"
                    }`} />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className={`text-[10px] font-black ${step === s.num ? "text-emerald-400" : "text-slate-400"}`}>{s.label}</p>
                  <p className="text-[8px] text-slate-500 font-medium truncate">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard step content container */}
        <div className="p-6 md:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: GENERAL INFO */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-sans font-black text-lg text-slate-800 dark:text-slate-100">Étape 1 : Informations générales</h3>
                  <p className="text-xs text-slate-500">Renseignez les coordonnées officielles et l'identité visuelle de l'école.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Logo upload & Type */}
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">Logo de l'école (Optionnel)</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center space-y-3 flex flex-col items-center justify-center min-h-[160px] bg-slate-50/50 dark:bg-slate-950/40">
                      {logo ? (
                        <div className="relative w-24 h-24">
                          <img src={logo} alt="Logo de l'école" className="w-full h-full object-cover rounded-xl border" referrerPolicy="no-referrer" />
                          <button 
                            type="button" 
                            onClick={() => setLogo(null)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-indigo-50 dark:bg-slate-900 rounded-2xl text-indigo-500">
                            <Building className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Glissez ou sélectionnez</p>
                            <p className="text-[8px] text-slate-400">PNG, JPG jusqu'à 2 Mo</p>
                          </div>
                          <label className="cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border text-[9px] font-black px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">
                            Choisir un fichier
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                        </>
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Type d'Établissement</label>
                      <div className="grid grid-cols-3 gap-1">
                        {typesEtablissement.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSchoolType(t as any);
                              if (t !== "Conventionné") setConventionType("Non conventionné");
                            }}
                            className={`py-2 px-1 text-[10px] font-black rounded-lg border text-center transition-all ${
                              schoolType === t
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                : "bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {schoolType === "Conventionné" && (
                      <div className="space-y-1 text-left">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Type de Convention</label>
                        <select
                          value={conventionType}
                          onChange={(e) => setConventionType(e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                        >
                          {conventionsCongolaises.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Right Fields Column */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nom officiel de l'Établissement *</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: Lycée Technique de la Gombe"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Devise de l'école (Motto)</label>
                      <div className="relative">
                        <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Ex: Discipline - Travail - Succès"
                          value={motto}
                          onChange={(e) => setMotto(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 italic focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Province *</label>
                      <select
                        value={province}
                        onChange={(e) => {
                          setProvince(e.target.value);
                          setVille(e.target.value);
                        }}
                        className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold"
                      >
                        {provincesRDC.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ville *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Lubumbashi"
                        value={ville}
                        onChange={(e) => setVille(e.target.value)}
                        className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Commune *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: Gombe"
                          value={commune}
                          onChange={(e) => setCommune(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Téléphone principal *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: +243 812 345 678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Adresse complète *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Av. de la Science n°45, Commune de la Gombe"
                        value={adresse}
                        onChange={(e) => setAdresse(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email (Facultatif)</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          placeholder="Ex: direction@ecole.cd"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Site Web (Facultatif)</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="url"
                          placeholder="Ex: www.ecole.cd"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ACADEMIC CONFIG */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-sans font-black text-lg text-slate-800 dark:text-slate-100">Étape 2 : Configuration académique</h3>
                  <p className="text-xs text-slate-500">Choisissez l'année scolaire de départ et les niveaux d'enseignement dispensés.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {/* Left panel: School year selection */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                      <Calendar className="h-5 w-5" />
                      <h4 className="font-bold text-xs uppercase tracking-wider">Session Académique Actuelle</h4>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Année Scolaire Active *</label>
                      <select
                        value={schoolYear}
                        onChange={(e) => setSchoolYear(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-slate-800 dark:text-slate-200"
                      >
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027 (Prochaine session)</option>
                        <option value="2027-2028">2027-2028</option>
                      </select>
                      <p className="text-[10px] text-slate-400">
                        Cette année scolaire sera configurée comme la session active par défaut pour les bulletins, finances et présences.
                      </p>
                    </div>
                  </div>

                  {/* Right panel: Levels Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                      <Layers className="h-5 w-5" />
                      <h4 className="font-bold text-xs uppercase tracking-wider">Niveau(x) enseigné(s) *</h4>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-4">
                      Sélectionnez tous les niveaux offerts. Les structures de classes et sections seront générées d'après cette sélection.
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: "Maternelle", title: "Maternelle", desc: "Cycle d'initiation (3 niveaux de classes)" },
                        { id: "Primaire", title: "Primaire", desc: "Enseignement de base élémentaire (6 années obligatoires)" },
                        { id: "Secondaire", title: "Secondaire", desc: "Tronc commun (7è-8è EB) et Humanités Générales" },
                        { id: "Technique / Professionnel", title: "Technique & Professionnel", desc: "Filières techniques (Commerciale, Électricité, Coupe, etc.)" }
                      ].map((lvl) => {
                        const isSelected = levels.includes(lvl.id);
                        return (
                          <div 
                            key={lvl.id}
                            onClick={() => handleLevelToggle(lvl.id)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                              isSelected 
                                ? "bg-indigo-50/50 dark:bg-slate-900/60 border-indigo-500 text-indigo-900 dark:text-white" 
                                : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 text-slate-700 dark:text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <p className="font-bold text-xs">{lvl.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{lvl.desc}</p>
                            </div>
                            <div className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected 
                                ? "bg-indigo-600 border-indigo-600 text-white" 
                                : "border-slate-300 dark:border-slate-700"
                            }`}>
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PEDAGOGICAL ORGANISATION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="text-left">
                    <h3 className="font-sans font-black text-lg text-slate-800 dark:text-slate-100">Étape 3 : Organisation pédagogique</h3>
                    <p className="text-xs text-slate-500">
                      Généré automatiquement selon les niveaux choisis. Vous pouvez entièrement éditer, supprimer ou ajouter des lignes.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={generatePedagogicalStructure}
                    className="self-start md:self-auto flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border text-[10px] font-bold px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <span>Réinitialiser la génération</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  
                  {/* Col 1: Sections */}
                  <div className="bg-slate-50/40 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-black text-[10px] uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" /> Sections ({sections.length})
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {sections.map((sec, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 border px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span className="truncate">{sec}</span>
                          <button 
                            onClick={() => handleRemoveSection(idx)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {sections.length === 0 && (
                        <p className="text-[10px] text-slate-400 text-center py-4 italic">Aucune section</p>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2 border-t">
                      <input
                        type="text"
                        placeholder="Ajouter une section..."
                        value={newSection}
                        onChange={(e) => setNewSection(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
                      />
                      <button 
                        onClick={handleAddSection}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Col 2: Options */}
                  <div className="bg-slate-50/40 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-black text-[10px] uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" /> Options d'Études ({options.length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 border px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span className="truncate">{opt}</span>
                          <button 
                            onClick={() => handleRemoveOption(idx)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {options.length === 0 && (
                        <p className="text-[10px] text-slate-400 text-center py-4 italic">Aucune option</p>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2 border-t">
                      <input
                        type="text"
                        placeholder="Ajouter une option..."
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
                      />
                      <button 
                        onClick={handleAddOption}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Col 3: Classes */}
                  <div className="bg-slate-50/40 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-black text-[10px] uppercase tracking-wider text-amber-500 flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" /> Classes ({classes.length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {classes.map((cls, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 border px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span className="truncate">{cls}</span>
                          <button 
                            onClick={() => handleRemoveClass(idx)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {classes.length === 0 && (
                        <p className="text-[10px] text-slate-400 text-center py-4 italic">Aucune classe</p>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2 border-t">
                      <input
                        type="text"
                        placeholder="Ex: 3ème Commerciale A..."
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                      />
                      <button 
                        onClick={handleAddClass}
                        className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 4: ADMINISTRATIVE ATTACHMENT */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-sans font-black text-lg text-slate-800 dark:text-slate-100">Étape 4 : Rattachement administratif</h3>
                  <p className="text-xs text-slate-500">Associez l'établissement scolaire aux structures d'état pour le reporting provincial.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-5">
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 space-y-3">
                      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                        <Briefcase className="h-5 w-5" />
                        <h4 className="font-bold text-xs uppercase tracking-wider">Province & Inspection</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Province Éducationnelle *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Kinshasa-Gombe, Haut-Katanga 1"
                            value={province}
                            disabled
                            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Inspection Provinciale Principale *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Inspection Provinciale de Kinshasa-Lukunga"
                            value={inspectionProv}
                            onChange={(e) => setInspectionProv(e.target.value)}
                            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 space-y-3">
                      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                        <ShieldCheck className="h-5 w-5" />
                        <h4 className="font-bold text-xs uppercase tracking-wider">Sous-Proved & Coordination</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sous-Proved / Coordination Nationale *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Sous-Proved Gombe / Coordination Catholique"
                            value={provedCoordination}
                            onChange={(e) => setProvedCoordination(e.target.value)}
                            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>

                        <div className="p-3 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/50 rounded-xl space-y-1">
                          <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">Souveraineté des données</p>
                          <p className="text-[9px] text-slate-500 leading-normal">
                            Les inspecteurs provinciaux accèdent aux statistiques générales agrégées de réussite de l'établissement sans violation du RGPD et des règles d'isolation logique de vos bases.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: PARAMÈTRES DE PAIEMENT SMARTSCHOOL RDC */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-sans font-black text-lg text-slate-800 dark:text-slate-100">
                      Étape 5 : Configuration des comptes de réception des paiements
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enregistrez les comptes Mobile Money et Carte Bancaire de l'école pour la répartition automatique des revenus scolaires.
                    </p>
                  </div>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-300/30">
                    Répartition Automatique SaaS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Mobile Money Accounts Configuration */}
                  <div className="space-y-5">
                    {/* Mobile Money Receiving Accounts */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                              Comptes Mobile Money Établissement
                            </h4>
                            <p className="text-[10px] text-slate-500">Comptes récepteurs de la part financière de l'école (98%)</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setMobileMoneyEnabled(!mobileMoneyEnabled)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                            mobileMoneyEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            mobileMoneyEnabled ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {mobileMoneyEnabled && (
                        <div className="space-y-4 pt-2">
                          {/* M-Pesa Account */}
                          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-200/60 dark:border-red-900/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-red-600 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" /> M-Pesa (Vodacom RDC)
                              </span>
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="h-2.5 w-2.5" /> Validé
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Titulaire du compte</label>
                                <input
                                  type="text"
                                  value={mpesaHolder}
                                  onChange={(e) => setMpesaHolder(e.target.value)}
                                  placeholder="Nom du titulaire"
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Numéro M-Pesa</label>
                                <input
                                  type="text"
                                  value={mpesaMerchant}
                                  onChange={(e) => setMpesaMerchant(e.target.value)}
                                  placeholder="+243 812..."
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Orange Money Account */}
                          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-orange-200/60 dark:border-orange-900/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-orange-600 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" /> Orange Money (Orange RDC)
                              </span>
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="h-2.5 w-2.5" /> Validé
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Titulaire du compte</label>
                                <input
                                  type="text"
                                  value={orangeHolder}
                                  onChange={(e) => setOrangeHolder(e.target.value)}
                                  placeholder="Nom du titulaire"
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Numéro Orange Money</label>
                                <input
                                  type="text"
                                  value={orangeMerchant}
                                  onChange={(e) => setOrangeMerchant(e.target.value)}
                                  placeholder="+243 890..."
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Airtel Money Account */}
                          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-200/60 dark:border-red-900/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-red-700 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-red-700 animate-pulse" /> Airtel Money (Airtel RDC)
                              </span>
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="h-2.5 w-2.5" /> Validé
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Titulaire du compte</label>
                                <input
                                  type="text"
                                  value={airtelHolder}
                                  onChange={(e) => setAirtelHolder(e.target.value)}
                                  placeholder="Nom du titulaire"
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Numéro Airtel Money</label>
                                <input
                                  type="text"
                                  value={airtelMerchant}
                                  onChange={(e) => setAirtelMerchant(e.target.value)}
                                  placeholder="+243 990..."
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bank Card / Carte Bancaire Receiving Account */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                            <Landmark className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                              Compte Carte Bancaire (Visa / Mastercard)
                            </h4>
                            <p className="text-[10px] text-slate-500">Passerelle bancaire tokenisée sécurisée</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCardPaymentEnabled(!cardPaymentEnabled)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                            cardPaymentEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            cardPaymentEnabled ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      {cardPaymentEnabled && (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Établissement Bancaire</label>
                              <select
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                              >
                                <option value="Rawbank RDC">Rawbank RDC</option>
                                <option value="Equity BCDC">Equity BCDC</option>
                                <option value="Trust Merchant Bank (TMB)">TMB RDC</option>
                                <option value="Ecobank RDC">Ecobank RDC</option>
                                <option value="Standard Bank RDC">Standard Bank</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Nom du Titulaire de la Carte/Compte</label>
                              <input
                                type="text"
                                value={bankHolder}
                                onChange={(e) => setBankHolder(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Numéro de Compte / IBAN / RIB Établissement</label>
                            <input
                              type="text"
                              value={bankAccountNumber}
                              onChange={(e) => setBankAccountNumber(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold"
                            />
                          </div>

                          <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/50 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-blue-900 dark:text-blue-300">Jeton Marchand Sécurisé API :</span>
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{merchantGatewayToken}</span>
                            </div>
                            <p className="text-[9px] text-slate-500">
                              Informations sensibles tokenisées conforme aux standards PCI-DSS & API Bancaires officielles RDC.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Frais configurables & Conditions Financières */}
                  <div className="space-y-5">
                    {/* Frais Scolaires Configurables */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Frais scolaires configurables
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Cochez tous les types de frais que les parents peuvent régler via SmartSchool RDC.
                      </p>

                      <div className="space-y-2">
                        {[
                          "Minerval",
                          "Frais d'inscription",
                          "Frais de bulletin",
                          "Examen d'État",
                          "Frais de laboratoire & informatique",
                          "Frais de tenue d'école & badges"
                        ].map(fee => {
                          const isSelected = configurableFees.includes(fee);
                          return (
                            <div
                              key={fee}
                              onClick={() => {
                                if (isSelected) {
                                  setConfigurableFees(configurableFees.filter(f => f !== fee));
                                } else {
                                  setConfigurableFees([...configurableFees, fee]);
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                                isSelected 
                                  ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 text-indigo-900 dark:text-indigo-200" 
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <span>{fee}</span>
                              <div className={`h-4 w-4 rounded flex items-center justify-center border text-white ${
                                isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 dark:border-slate-700"
                              }`}>
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Transparence & Commission SmartSchool RDC Notice */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 space-y-3">
                      <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
                        <Briefcase className="h-4 w-4" />
                        <h4 className="font-black text-xs uppercase tracking-wider">Répartition Automatique des Revenus</h4>
                      </div>

                      <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 font-medium">
                        <p>
                          Lors de chaque règlement par Mobile Money ou Carte Bancaire, la passerelle effectue une séparation instantanée des fonds :
                        </p>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/50 font-mono text-[10px] space-y-1">
                          <p className="flex justify-between"><span>Paiement Parent :</span><strong>100.00 USD</strong></p>
                          <p className="flex justify-between text-emerald-600"><span>Compte École (98%) :</span><strong>98.00 USD</strong></p>
                          <p className="flex justify-between text-amber-600"><span>Compte SmartSchool (2%) :</span><strong>2.00 USD</strong></p>
                        </div>
                      </div>

                      {/* Checkbox acceptation */}
                      <label className="flex items-start space-x-2.5 pt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptedFinancialTerms}
                          onChange={(e) => setAcceptedFinancialTerms(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                          J'accepte les conditions d'utilisation financières et la répartition automatique des commissions sur chaque transaction SmartSchool RDC. *
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: VALIDATION */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-sans font-black text-lg text-slate-800 dark:text-slate-100">Étape 6 : Validation finale</h3>
                  <p className="text-xs text-slate-500">Vérifiez les données de configuration avant d'initialiser l'établissement scolaire.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column Summary Cards */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3.5">
                      <div className="flex items-center space-x-3">
                        {logo ? (
                          <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover border" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-900 flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-slate-800 font-bold shrink-0">
                            {schoolName.substring(0,2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">{schoolName}</h4>
                          <p className="text-[10px] font-bold text-slate-400 italic">"{motto || "Pas de devise spécifiée"}"</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] pt-2 border-t">
                        <div>
                          <p className="font-bold text-slate-400 uppercase text-[9px]">Type d'établissement</p>
                          <p className="font-black text-slate-700 dark:text-slate-300">
                            {schoolType} {schoolType === "Conventionné" && `(${conventionType})`}
                          </p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-400 uppercase text-[9px]">Année Scolaire</p>
                          <p className="font-black text-indigo-600 dark:text-indigo-400">{schoolYear}</p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-400 uppercase text-[9px]">Téléphone</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 font-mono">{phone}</p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-400 uppercase text-[9px]">Email</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{email || "Non spécifié"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-bold text-slate-400 uppercase text-[9px]">Adresse Complète</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300">
                            {adresse}, {commune}, {ville}, {province}, RDC
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3">
                      <h4 className="font-black text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="h-4 w-4 text-slate-400" /> Rattachement Administratif
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 border-t">
                        <div>
                          <p className="font-bold text-slate-400 uppercase text-[9px]">Inspection Provinciale</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300">{inspectionProv}</p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-400 uppercase text-[9px]">Proved / Coordination</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300">{provedCoordination}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column pedagogical statistics & Mobile Money Summary */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-4">
                      <h4 className="font-black text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-4 w-4 text-indigo-500" /> Paramètres Financiers & Mobile Money
                      </h4>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="font-bold text-slate-500">Paiement Numérique Direct :</span>
                          <span className={`font-black px-2 py-0.5 rounded text-[10px] ${mobileMoneyEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                            {mobileMoneyEnabled ? "Activité directe" : "Désactivé"}
                          </span>
                        </div>

                        {mobileMoneyEnabled && (
                          <div className="flex justify-between items-center border-b pb-1">
                            <span className="font-bold text-slate-500">Passerelles Mobile Money :</span>
                            <span className="font-black text-slate-800 dark:text-slate-200">
                              {acceptedGateways.join(", ")}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="font-bold text-slate-500">Commission SmartSchool RDC :</span>
                          <span className="font-black text-amber-600">2.0% automatique</span>
                        </div>

                        <div className="flex justify-between items-start border-b pb-1">
                          <span className="font-bold text-slate-500">Frais Configurés :</span>
                          <span className="font-bold text-right text-[10px] text-indigo-600 dark:text-indigo-400">
                            {configurableFees.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 rounded-2xl border border-emerald-500/20 space-y-3">
                      <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-sans font-black text-xs uppercase tracking-wider">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Création Automatique</span>
                      </div>
                      
                      <ul className="text-[11px] font-bold text-slate-600 dark:text-slate-400 space-y-1.5 pl-5 list-disc leading-relaxed">
                        <li>Profil complet de l'établissement scolaire ;</li>
                        <li>Système de paiement Mobile Money configuré ;</li>
                        <li>Prélèvement automatique des commissions SmartSchool RDC ;</li>
                        <li>Registres réglementaires conformes aux circulaires EPST.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wizard Footer Action Panel */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center space-x-2 border text-xs font-black px-4 py-2.5 rounded-xl transition-all ${
              step === 1 
                ? "text-slate-300 dark:text-slate-700 border-slate-100 dark:border-slate-900 cursor-not-allowed" 
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex items-center space-x-2 text-xs font-black px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                isStepValid()
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:scale-[1.02]"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              }`}
            >
              <span>Suivant</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center space-x-2 text-xs font-black px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-[1.02] transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Valider & Créer l'Établissement</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
