import React, { useState } from "react";
import { Employee } from "../types";
import { Printer, Check, QrCode, Sparkles, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PrintPreviewModal } from "./PrintPreviewModal";

interface HrCartesProps {
  employees: Employee[];
  schoolMotto: string;
  schoolLogo: string;
  signatureSeal: string;
}

export function HrCartes({ employees, schoolMotto, schoolLogo, signatureSeal }: HrCartesProps) {
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(employees[0] || null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  return (
    <div className="space-y-6" id="cartes-pro-view">
      {showPrintModal && selectedEmp && (
        <PrintPreviewModal
          documentType="carte_enseignant"
          data={{
            name: `${selectedEmp.lastName} ${selectedEmp.firstName}`,
            function: selectedEmp.function,
            matricule: selectedEmp.matricule,
            department: selectedEmp.department,
            photoUrl: selectedEmp.photoUrl,
            schoolMotto,
            schoolLogo,
            signatureSeal
          }}
          onClose={() => setShowPrintModal(false)}
          title={`Carte Professionnelle CR-80 - ${selectedEmp.lastName} ${selectedEmp.firstName}`}
        />
      )}

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Cartes Professionnelles RDC</h3>
          <p className="text-xs text-slate-500">Sélectionnez un agent pour visualiser et imprimer sa carte de service biométrique nationale au format CR-80 PVC.</p>
        </div>
        <button 
          onClick={() => setShowPrintModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md animate-pulse"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimer (Aperçu Format CR-80)</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Employees selection */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3 max-h-[500px] overflow-y-auto"
        >
          <span className="text-[10px] font-black uppercase text-slate-400 block px-1 pb-1">Liste du personnel ({employees.length})</span>
          {employees.map((emp, index) => {
            const isSel = selectedEmp?.id === emp.id;
            return (
              <motion.button
                key={emp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
                onClick={() => setSelectedEmp(emp)}
                className={`w-full flex items-center space-x-3 p-2.5 rounded-2xl border text-left text-xs font-semibold cursor-pointer transition-all ${
                  isSel 
                    ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40 text-indigo-950 dark:text-white" 
                    : "bg-transparent border-transparent hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                }`}
              >
                {emp.photoUrl ? (
                  <img src={emp.photoUrl} className="h-8 w-8 rounded-lg object-cover border" alt="" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-300">
                    {emp.firstName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] text-slate-400 block font-mono font-bold leading-none">{emp.matricule}</span>
                  <p className="truncate leading-tight mt-0.5">{emp.lastName} {emp.firstName}</p>
                  <p className="text-[9px] text-slate-400 font-medium truncate leading-tight mt-0.5">{emp.function}</p>
                </div>
                {isSel && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
              </motion.button>
            );
          })}
        </motion.div>        {/* Right Side: Biometric PVC Dual-Sided Visual Representation */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm min-h-[450px]">
          <AnimatePresence mode="wait">
            {selectedEmp ? (
              <motion.div 
                key={selectedEmp.id}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-8 flex flex-col items-center"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  
                  {/* RECTO (FRONT) */}
                  <div className="w-80 h-112 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-200 rounded-2xl shadow-xl border border-sky-500/30 p-4 flex flex-col justify-between text-slate-900 relative overflow-hidden" id="pvc-card-recto">
                    {/* Official national header */}
                    <div className="space-y-1 text-center relative z-10">
                      <div className="flex justify-between items-center px-1">
                        {/* DRC Flag miniature */}
                        <div className="w-6 h-4 bg-sky-500 flex items-center justify-center relative border border-white">
                          <div className="absolute w-full h-1 bg-red-600 top-1.5 -rotate-12" />
                          <div className="absolute w-full h-0.5 bg-yellow-400 top-1.5 -rotate-12" />
                          <span className="text-[5px] text-yellow-300 absolute left-0.5 top-0.5">★</span>
                        </div>
                        
                        {/* RDC Crest Emblem (Leopard, Speaters) */}
                        <img 
                          src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=30" // placeholder for RDC emblem
                          className="h-5 w-5 rounded-full object-cover border border-white" 
                          alt="" 
                        />
                      </div>
                      <span className="text-[7px] font-black uppercase tracking-wider block text-sky-950">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                      <span className="text-[6px] font-bold text-slate-700 block -mt-0.5">MINISTÈRE DE L'ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE</span>
                    </div>

                    {/* Watermark flag background */}
                    <div className="absolute inset-0 bg-sky-400/5 rotate-12 scale-150 pointer-events-none" />

                    {/* School Name & Motto */}
                    <div className="text-center space-y-0.5 z-10 bg-white/40 dark:bg-slate-900/10 backdrop-blur-[1px] p-1.5 rounded-lg border border-white/40">
                      <span className="text-[10px] font-black text-indigo-950 uppercase leading-none block">CS PRINCIPAL SSRDC</span>
                      <span className="text-[6px] italic text-slate-800 leading-none block">"{schoolMotto}"</span>
                    </div>

                    {/* Main Avatar & General Bio info */}
                    <div className="flex flex-col items-center space-y-2 z-10">
                      <div className="relative">
                        {selectedEmp.photoUrl ? (
                          <img src={selectedEmp.photoUrl} className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-md" alt="" />
                        ) : (
                          <div className="w-24 h-24 rounded-xl border-2 border-white bg-slate-200 flex items-center justify-center font-black text-2xl text-slate-600 shadow-md">
                            {selectedEmp.firstName[0]}
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>

                      <div className="text-center space-y-0.5">
                        <h4 className="text-sm font-black text-slate-950 tracking-tight leading-none">
                          {selectedEmp.lastName.toUpperCase()} {selectedEmp.firstName}
                        </h4>
                        <span className="text-[8px] font-bold text-indigo-900 uppercase tracking-widest bg-indigo-100/60 px-2 py-0.5 rounded-full block mx-auto mt-1 w-max">
                          {selectedEmp.function}
                        </span>
                      </div>
                    </div>

                    {/* ID details block */}
                    <div className="bg-white/90 rounded-xl p-2 text-[9px] font-mono leading-tight space-y-1 border border-indigo-100 shadow-inner z-10">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[8px]">ID SSRDC NATIONAL :</span>
                        <span className="font-extrabold text-indigo-700">{selectedEmp.idSsrdc || "SSRDC-PE-88401"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[8px]">MATRICULE AGENT :</span>
                        <span className="font-bold text-slate-800">{selectedEmp.matricule}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[8px]">DÉPARTEMENT :</span>
                        <span className="font-bold text-slate-800">{selectedEmp.department}</span>
                      </div>
                    </div>

                    {/* Card footer bar */}
                    <div className="text-center text-[6px] text-slate-600 border-t border-slate-900/10 pt-1">
                      Système national d'identification biométrique scolaire RDC
                    </div>
                  </div>

                  {/* VERSO (BACK) */}
                  <div className="w-80 h-112 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 p-4 flex flex-col justify-between text-slate-900 relative overflow-hidden" id="pvc-card-verso">
                    <div className="space-y-2 text-center">
                      <span className="text-[8px] font-bold text-slate-500 block uppercase font-mono tracking-wider">CONDITIONS D'UTILISATION</span>
                      <p className="text-[7px] text-slate-400 px-3 leading-normal">
                        Cette carte de service biométrique est la propriété exclusive de l'établissement. Elle est strictement personnelle et incessible. Tout détenteur est tenu de la présenter lors de chaque contrôle de pointage et de présence.
                      </p>
                    </div>

                    {/* QR Code verify block */}
                    <div className="flex items-center justify-around bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                      <div className="text-[8px] space-y-1 leading-normal max-w-[130px]">
                        <span className="font-black text-indigo-600 block">SCANNER DE VERIFICATION SSRDC</span>
                        <p className="text-slate-500 text-[7px]">Scannez ce code QR pour vérifier l'authenticité de l'agent sur le registre national en temps réel.</p>
                      </div>
                      <div className="p-1 bg-white border border-slate-200 rounded-lg">
                        <QrCode className="h-12 w-12 text-slate-800" />
                      </div>
                    </div>

                    {/* Authority Seal Stamp & Digital Signature */}
                    <div className="flex justify-between items-center px-4 relative">
                      <div className="text-left">
                        <span className="text-[7px] text-slate-400 block uppercase">Expiration</span>
                        <span className="text-[9px] font-bold text-slate-800 dark:text-slate-300">31 Août 2027</span>
                      </div>

                      {/* Official signature and stamp overlay */}
                      <div className="relative text-right">
                        <span className="text-[7px] text-slate-400 block uppercase">Le Secrétaire National</span>
                        <img src={signatureSeal} className="h-10 w-10 absolute right-4 top-1 opacity-60 rounded-full border border-red-200 rotate-12 pointer-events-none" alt="Seal" />
                        <span className="text-[9px] font-bold text-slate-800 dark:text-slate-300 italic block mt-1">MUTOMBO A.</span>
                      </div>
                    </div>

                    <div className="text-center text-[6px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 font-mono">
                      Développé par le Ministère de l'EPST RDC
                    </div>
                  </div>

                </div>
                
                <p className="text-[11px] text-slate-400 italic">
                  💡 Astuce : Le recto contient le QR de vérification biométrique et le verso contient le cachet d'authentification de l'EPST.
                </p>
              </motion.div>
            ) : (
              <p className="text-slate-400 text-xs italic">Sélectionnez un agent pour visualiser sa carte professionnelle.</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
