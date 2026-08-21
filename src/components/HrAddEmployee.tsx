import React, { useState, useEffect } from "react";
import { Employee } from "../types";
import { useSmartSchoolCore } from "../context/SmartSchoolCoreContext";
import { Camera, Upload, CheckCircle, UserPlus, FileText, QrCode, ArrowLeft, Key, Printer, Eye, Briefcase, Building } from "lucide-react";
import { PhotoUploadField } from "./common/PhotoUploadField";

interface HrAddEmployeeProps {
  onAddEmployee: (emp: Omit<Employee, "id" | "matricule" | "qrCodeData">) => void;
  departments: string[];
  predefinedFunctionsByDept: Record<string, string[]>;
  onNavigateToTab: (tab: string) => void;
  onSelectEmployee: (emp: Employee) => void;
  employees: Employee[]; // needed to locate the newly added employee to view
}

export function HrAddEmployee({
  onAddEmployee,
  departments,
  predefinedFunctionsByDept,
  onNavigateToTab,
  onSelectEmployee,
  employees
}: HrAddEmployeeProps) {
  const { customFunctions, customServices } = useSmartSchoolCore();

  const activeFunctions = customFunctions.filter(f => f.status === "Actif");
  const activeServices = customServices.filter(s => s.status === "Actif");

  const initialFunction = activeFunctions[0]?.name || "Enseignant Titulaire / Professeur";
  const initialService = activeFunctions[0]?.serviceName || activeServices[0]?.name || "Préfecture & Pédagogie";
  const initialDept = activeFunctions[0]?.category || "Enseignement";

  // Form State
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "M" as "M" | "F",
    birthDate: "",
    birthPlace: "",
    nationality: "Congolaise (RDC)",
    civilStatus: "Célibataire" as any,
    address: "",
    phone: "",
    email: "",
    function: initialFunction,
    department: initialDept,
    service: initialService,
    hireDate: new Date().toLocaleDateString("fr-FR"),
    contractType: "CDI" as any,
    salaryBase: 350,
    diplomas: "",
    experience: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: ""
  });

  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<{
    firstName: string;
    lastName: string;
    matricule: string;
    idSsrdc: string;
    activationCode: string;
    id: string;
  } | null>(null);

  // Simulation of webcam snapshot
  const handleCapturePhoto = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      // Pick a beautifully captured photo depending on gender
      const randomId = Math.floor(Math.random() * 70);
      const genderTerm = form.gender === "F" ? "women" : "men";
      const simulatedUrl = `https://randomuser.me/api/portraits/${genderTerm}/${randomId}.jpg`;
      setPhotoUrl(simulatedUrl);
      setIsCameraActive(false);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Read local file or simulate a premium random portrait
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      alert("⚠️ La photo de profil est OBLIGATOIRE pour valider l'embauche !");
      return;
    }

    const payload = {
      ...form,
      photoUrl,
      diplomas: form.diplomas ? form.diplomas.split(",").map(d => d.trim()) : [],
      experience: form.experience ? form.experience.split(",").map(e => e.trim()) : [],
      documents: [],
      emergencyContact: {
        name: form.emergencyName,
        relationship: form.emergencyRelationship,
        phone: form.emergencyPhone
      },
      status: "Actif" as const,
      hasUserAccount: false
    };

    onAddEmployee(payload);

    // Look at employees state after brief timeout to find the generated attributes
    setTimeout(() => {
      const year = new Date().getFullYear();
      const count = employees.length + 1;
      const countStr = count.toString().padStart(4, "0");
      const matricule = `PERS-${year}-${countStr}`;
      const code = `ACT-PERS-${form.lastName.toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;
      const ssrdc = `SSRDC-PE-${Math.floor(10000 + Math.random() * 89999)}`;

      setSuccessData({
        firstName: form.firstName,
        lastName: form.lastName,
        matricule,
        idSsrdc: ssrdc,
        activationCode: code,
        id: `emp-${Date.now()}` // fallback id
      });
    }, 300);
  };

  const handleReset = () => {
    setSuccessData(null);
    setPhotoUrl("");
    setForm({
      firstName: "",
      lastName: "",
      gender: "M",
      birthDate: "",
      birthPlace: "",
      nationality: "Congolaise (RDC)",
      civilStatus: "Célibataire",
      address: "",
      phone: "",
      email: "",
      function: predefinedFunctionsByDept[departments[0]]?.[0] || "Enseignant",
      department: departments[0],
      service: "Département Pédagogique",
      hireDate: new Date().toLocaleDateString("fr-FR"),
      contractType: "CDI",
      salaryBase: 350,
      diplomas: "",
      experience: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: ""
    });
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-fade-in" id="recruitment-success-screen">
        <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
          <CheckCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-mono">Dossier Enregistré</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Recrutement Terminé avec Succès !</h3>
          <p className="text-xs text-slate-500">
            L'agent <strong>{successData.firstName} {successData.lastName}</strong> a été officiellement inscrit au registre national du personnel SmartSchool RDC.
          </p>
        </div>

        {/* Generated Certificate Box */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-left text-xs space-y-4 font-mono max-w-md mx-auto relative overflow-hidden" id="national-ssr-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-400">CERTIFICAT D'ENREGISTREMENT RH</span>
            <span className="text-[8px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase font-sans">RDC SSRDC</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[9px]">NOM COMPLET</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{successData.lastName} {successData.firstName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">ID SSRDC NATIONAL</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{successData.idSsrdc}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">MATRICULE ETABLISSEMENT</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{successData.matricule}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">CODE D'ACTIVATION</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{successData.activationCode}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Signature du Secrétaire National</span>
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Dynamic Actions */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <button 
            onClick={handleReset}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Enregistrer un autre agent</span>
          </button>

          <button 
            onClick={() => {
              // Try to find the actual employee in parent state
              const actual = employees.find(e => e.lastName === successData.lastName && e.firstName === successData.firstName) || {
                id: successData.id,
                matricule: successData.matricule,
                photoUrl: photoUrl,
                firstName: successData.firstName,
                lastName: successData.lastName,
                gender: form.gender,
                birthDate: form.birthDate,
                birthPlace: form.birthPlace,
                nationality: form.nationality,
                civilStatus: form.civilStatus,
                address: form.address,
                phone: form.phone,
                email: form.email,
                function: form.function,
                department: form.department,
                service: form.service,
                hireDate: form.hireDate,
                contractType: form.contractType,
                salaryBase: form.salaryBase,
                diplomas: [],
                experience: [],
                documents: [],
                emergencyContact: { name: form.emergencyName, relationship: form.emergencyRelationship, phone: form.emergencyPhone },
                qrCodeData: `https://smartschool.cd/verify/${successData.matricule}`,
                status: "Actif" as const,
                hasUserAccount: false,
                activationCode: successData.activationCode,
                idSsrdc: successData.idSsrdc
              };
              onSelectEmployee(actual as any);
            }}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md"
          >
            <Eye className="h-4 w-4" />
            <span>Consulter le dossier de l'agent</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6" id="recruitment-form-container">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Fiche de Recrutement & Embauche Nationale</h3>
          <p className="text-xs text-slate-500">Formulaire officiel d'inscription d'un enseignant ou personnel administratif.</p>
        </div>
        <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-extrabold uppercase font-mono">
          SSRDC RDC MIN-EPST
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Photo Upload Section (MANDATORY) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl" id="photo-upload-section">
          <PhotoUploadField
            label="Photo d'identité professionnelle (Obligatoire pour carte professionnelle & IAM)"
            required
            value={photoUrl}
            onChange={(photo) => setPhotoUrl(photo)}
            helperText="Téléversez ou prenez en photo le portrait officiel (depuis smartphone ou ordinateur)"
            previewSize="lg"
            id="employee-photo-upload"
          />
        </div>

        {/* Identity Information Grid */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-indigo-600 uppercase tracking-wider text-[10px]">1. Identité Civile de l'Agent</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Nom de famille (Majeur)</label>
              <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Ex: MUTOMBO" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Prénom(s)</label>
              <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Ex: Astrid" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Sexe</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value as any})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                <option value="M">Masculin (M)</option>
                <option value="F">Féminin (F)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Date de naissance</label>
              <input required value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} placeholder="Ex: 14/05/1993" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Lieu de naissance</label>
              <input required value={form.birthPlace} onChange={e => setForm({...form, birthPlace: e.target.value})} placeholder="Ex: Lubumbashi" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Nationalité</label>
              <input required value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} placeholder="Ex: Congolaise (RDC)" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">État civil</label>
              <select value={form.civilStatus} onChange={e => setForm({...form, civilStatus: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium">
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf(ve)">Veuf(ve)</option>
              </select>
            </div>
            <div className="space-y-1 col-span-2">
              <label className="font-bold text-slate-500">Adresse Complète</label>
              <input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Numéro, Avenue, Quartier, Commune, Ville" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Téléphone de contact</label>
              <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Ex: +243 812 345 678" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Email professionnel</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Ex: astrid.mutombo@smartschool.cd" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Contract & Placement Section */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-indigo-600 uppercase tracking-wider text-[10px]">2. Affectation Professionnelle & Contrat</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Fonction officielle (Définie par l'établissement)</label>
              <select 
                value={form.function} 
                onChange={e => {
                  const selectedName = e.target.value;
                  const matchedFn = activeFunctions.find(f => f.name === selectedName);
                  if (matchedFn) {
                    setForm({
                      ...form, 
                      function: matchedFn.name,
                      service: matchedFn.serviceName,
                      department: matchedFn.category
                    });
                  } else {
                    setForm({...form, function: selectedName});
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/30 font-extrabold text-indigo-900 dark:text-indigo-200"
              >
                {activeFunctions.map(fn => (
                  <option key={fn.id} value={fn.name}>
                    {fn.name} ({fn.code}) - {fn.serviceName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Service d'affectation</label>
              <select 
                value={form.service} 
                onChange={e => setForm({...form, service: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              >
                {activeServices.map(serv => (
                  <option key={serv.id} value={serv.name}>{serv.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Catégorie RH / Département</label>
              <select 
                value={form.department} 
                onChange={e => setForm({...form, department: e.target.value})} 
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Type de contrat</label>
              <select value={form.contractType} onChange={e => setForm({...form, contractType: e.target.value as any})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold">
                <option value="CDI">CDI (Indéterminé)</option>
                <option value="CDD">CDD (Déterminé)</option>
                <option value="Stage">Stage</option>
                <option value="Prestation">Prestation horaire</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Salaire de base brut (USD)</label>
              <input type="number" required value={form.salaryBase} onChange={e => setForm({...form, salaryBase: Number(e.target.value)})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-white" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Date d'embauche effective</label>
              <input required value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} placeholder="Ex: 01/09/2026" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Qualifications Section */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-indigo-600 uppercase tracking-wider text-[10px]">3. Diplômes & Compétences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Diplômes détenus (séparés par des virgules)</label>
              <input value={form.diplomas} onChange={e => setForm({...form, diplomas: e.target.value})} placeholder="Ex: Licencié en Mathématiques, Agrégé de l'Enseignement" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Expérience professionnelle significative (séparée par des virgules)</label>
              <input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="Ex: 5 ans au CS Mgr Shaumba, 3 ans au Collège Boboto" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-indigo-600 uppercase tracking-wider text-[10px]">4. Personne à contacter en cas d'urgence</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Nom du contact d'urgence</label>
              <input required value={form.emergencyName} onChange={e => setForm({...form, emergencyName: e.target.value})} placeholder="Ex: Papa MUTOMBO" className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg text-slate-800 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Lien de parenté / Relation</label>
              <input required value={form.emergencyRelationship} onChange={e => setForm({...form, emergencyRelationship: e.target.value})} placeholder="Ex: Épouse, Frère, Père" className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg text-slate-800 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Téléphone du contact d'urgence</label>
              <input required value={form.emergencyPhone} onChange={e => setForm({...form, emergencyPhone: e.target.value})} placeholder="Ex: +243 892..." className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg text-slate-800 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 dark:border-slate-850">
          <button
            type="button"
            onClick={() => onNavigateToTab("personnel")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={!photoUrl}
            className={`px-7 py-2.5 rounded-xl font-bold cursor-pointer transition-all shadow ${
              photoUrl 
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
            }`}
          >
            {photoUrl ? "Valider le dossier d'embauche" : "Photo obligatoire ⚠️"}
          </button>
        </div>
      </form>
    </div>
  );
}
